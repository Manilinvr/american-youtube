"""Робот Deriv: настоящие ДЕМО-сделки Rise/Fall по схемам модели Pocket Option.

Работает в GitHub Actions одним длинным запуском (до ~5ч45м), потом перезапускает
сам себя. Каждые 15 минут, через ~40 с после закрытия свечи:
  1. закрывает в учёте завершившиеся сделки;
  2. записывает текущие выплаты Deriv по всем парам и срокам (payouts.csv);
  3. если сейчас разрешённый час (pocketoption.json → trading_hours_msk) —
     ищет сигналы активных схем (journal/status.json) на свечах Deriv,
     проверяет новости, лимит риска и выплату (выше безубыточной для схемы)
     и покупает контракт на ДЕМО-счёте.
Правила счёта дня: старт $1000; баланс ≤ $100 — стоп; ≥ $2000 — цель
(после цели сигналы пишутся только виртуально). Новая сделка — только если
баланс останется ≥ $100 даже при проигрыше всех открытых сделок.
Безопасность: торгует ТОЛЬКО на счёте с account_type == "demo".

    python robot.py loop        # основной режим (Actions)
    python robot.py once        # один цикл
    python robot.py dry         # один цикл без покупок (проверка)
    python robot.py test_trade  # одна пробная сделка $1 на демо (проверка покупки)
"""
import asyncio, json, os, subprocess, sys, time, urllib.request, urllib.error
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import websockets

HERE = os.path.dirname(os.path.abspath(__file__))
TRADER = os.path.dirname(HERE)
sys.path.insert(0, TRADER)
os.environ.setdefault("TRADER_MODE", "binary")

import news  # noqa: E402
import strategies as S  # noqa: E402
from strategies import REGISTRY  # noqa: E402

CFG = json.load(open(os.path.join(HERE, "config.json")))
PO = json.load(open(os.path.join(TRADER, "pocketoption.json")))
TOKEN = os.environ.get("DERIV_TOKEN", "").strip()
PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD", "EURJPY", "GBPJPY", "EURGBP"]
EXPIRIES = [15, 30, 60]
STAKE = float(CFG.get("stake_usd", 20))
START_BAL, STOP_BAL, TARGET_BAL = 1000.0, 100.0, 2000.0
MIN_PAYOUT = 0.70          # ниже — не торгуем ни при каком винрейте
EDGE = 0.02                # запас к безубыточной выплате
DEFAULT_WR = 0.56          # винрейт схемы, если сделок мало
STATE_DIR = os.path.join(HERE, "state")
ALLOWED = set(PO.get("trading_hours_msk", {}).get("allowed", range(24)))
MSK = "Europe/Moscow"


def log(*a):
    print(datetime.now(timezone.utc).strftime("%H:%M:%S"), *a, flush=True)


# ------------------------------------------------------------------ API
def rest(method, path, body=None):
    req = urllib.request.Request(CFG["rest"] + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": f"Bearer {TOKEN}", "Deriv-App-ID": CFG["app_id"],
                                          "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read() or b"{}")


def demo_account():
    acc = rest("GET", "/trading/v1/options/accounts")
    items = acc.get("data", acc)
    demo = [a for a in items if isinstance(a, dict) and str(a.get("account_type", "")).lower() == "demo"]
    if not demo:
        raise SystemExit("ДЕМО-СЧЁТ НЕ НАЙДЕН — торговля запрещена")
    return demo[0]["account_id"]


class WS:
    def __init__(self, auth=True):
        self.auth, self.ws, self.n = auth, None, 0

    async def __aenter__(self):
        if self.auth:
            aid = demo_account()
            url = rest("POST", f"/trading/v1/options/accounts/{aid}/otp")["data"]["url"]
            if "/ws/demo" not in url:
                raise SystemExit("OTP-ссылка не демо — торговля запрещена")
            self.account = aid
        else:
            url = CFG["ws_public"]
        self.ws = await websockets.connect(url, open_timeout=30, max_size=2 ** 24)
        return self

    async def __aexit__(self, *a):
        await self.ws.close()

    async def q(self, req):
        self.n += 1
        req = dict(req, req_id=self.n)
        await self.ws.send(json.dumps(req))
        while True:
            r = json.loads(await asyncio.wait_for(self.ws.recv(), 30))
            if r.get("req_id") == self.n or r.get("echo_req", {}).get("req_id") == self.n:
                return r


async def candles(ws, pair, gran, pages=2):
    out, end = [], "latest"
    for _ in range(pages):
        r = await ws.q({"ticks_history": f"frx{pair}", "style": "candles", "granularity": gran,
                        "count": 5000, "end": end})
        cs = r.get("candles") or []
        if not cs:
            break
        out = cs + out
        end = cs[0]["epoch"] - 1
    df = pd.DataFrame(out).drop_duplicates("epoch").sort_values("epoch")
    df.index = pd.to_datetime(df.epoch, unit="s", utc=True)
    df.index.name = "time"
    df = df[["open", "high", "low", "close"]].astype(float)
    df = df[df.index == df.index.floor(f"{gran}s")]          # выбрасываем неровные (частичные) свечи
    now = pd.Timestamp.now(tz="UTC")
    return df[df.index + pd.Timedelta(seconds=gran) <= now]  # только закрытые


async def proposal(ws, pair, side, minutes, stake=STAKE):
    r = await ws.q({"proposal": 1, "amount": stake, "basis": "stake", "currency": "USD",
                    "contract_type": "CALL" if side > 0 else "PUT", "duration": minutes,
                    "duration_unit": "m", "underlying_symbol": f"frx{pair}"})
    return r.get("proposal"), r.get("error")


# ------------------------------------------------------------------ состояние
def day_key(now=None):
    return (now or pd.Timestamp.now(tz="UTC")).tz_convert(MSK).strftime("%Y-%m-%d")


def load_state(key):
    p = os.path.join(STATE_DIR, f"{key}.json")
    if os.path.exists(p):
        return json.load(open(p))
    return {"day": key, "start": START_BAL, "realized": 0.0, "open": [], "closed": [], "virtual": [],
            "stopped": None, "skips": {}}


def save_state(st):
    os.makedirs(STATE_DIR, exist_ok=True)
    json.dump(st, open(os.path.join(STATE_DIR, f"{st['day']}.json"), "w"), ensure_ascii=False, indent=1)


def append_csv(name, rows):
    if not rows:
        return
    p = os.path.join(HERE, name)
    pd.DataFrame(rows).to_csv(p, mode="a", header=not os.path.exists(p), index=False)


# ------------------------------------------------------------------ схемы
def active_schemes():
    st = json.load(open(os.path.join(TRADER, "journal", "status.json")))
    return {k: v for k, v in st.items() if v["status"] == "active" and v.get("expiry")}


def scheme_winrate():
    """Доля выигрышных сделок схемы в демо-журнале (без ничьих). Мало данных — DEFAULT_WR."""
    wr = {}
    p = os.path.join(TRADER, "journal", "allhours", "trades.csv")
    if not os.path.exists(p):
        p = os.path.join(TRADER, "journal", "trades.csv")
    if os.path.exists(p):
        t = pd.read_csv(p)
        t = t[t.usd != 0]
        for k, g in t.groupby("scheme"):
            if len(g) >= 20:
                wr[k] = float((g.usd > 0).mean())
    return wr


def last_bar_signal(df, sig):
    """Сигнал на последней закрытой свече: (side) или 0. Учитывает отложенные входы."""
    n = len(df)
    d = sig["dir"].reindex(df.index).fillna(0).to_numpy(int)
    if "entry" not in sig:
        return int(d[n - 1])
    pend = sig["entry"].reindex(df.index).to_numpy(float)
    valid = sig["valid"].reindex(df.index).fillna(1).to_numpy(int)
    h, l, c = df.high.to_numpy(), df.low.to_numpy(), df.close.to_numpy()
    if np.isfinite(pend[n - 1]) is False and d[n - 1] == 0:
        pass
    for i in range(max(0, n - 1 - 40), n - 1):
        side = d[i]
        if side == 0 or not np.isfinite(pend[i]):
            continue
        lvl = pend[i]
        is_stop = side * (lvl - c[i]) > 0
        for k in range(i + 1, min(n, i + 1 + valid[i])):
            hit = ((h[k] >= lvl) if side > 0 else (l[k] <= lvl)) if is_stop else ((l[k] <= lvl) if side > 0 else (h[k] >= lvl))
            if hit:
                if k == n - 1:
                    return int(side)
                break
    return 0


def news_blocks(pair, t_in, minutes, ev):
    T = news.events_for(pair, ev)
    if not len(T):
        return False
    lo, hi = t_in - pd.Timedelta("30min"), t_in + pd.Timedelta(minutes=minutes) + pd.Timedelta("30min")
    return bool(((T >= lo) & (T <= hi)).any())


# ------------------------------------------------------------------ цикл
async def settle(ws, st):
    still = []
    for o in st["open"]:
        r = await ws.q({"proposal_open_contract": 1, "contract_id": o["contract_id"]})
        poc = r.get("proposal_open_contract") or {}
        if poc.get("is_sold") or poc.get("status") in ("won", "lost", "sold"):
            o["profit"] = float(poc.get("profit", 0))
            o["status"] = poc.get("status")
            o["exit_spot"] = poc.get("exit_tick") or poc.get("sell_spot")
            st["realized"] += o["profit"]
            st["closed"].append(o)
            append_csv("trades.csv", [o])
            log("закрыта", o["pair"], o["side"], o["scheme"], f"{o['profit']:+.2f}")
        else:
            if r.get("error"):
                log("poc error", r["error"])
            still.append(o)
    st["open"] = still


async def settle_virtual(ws, st):
    """Виртуальные (после цели) сделки: исход по 1-минутной свече в момент экспирации."""
    now = time.time()
    left = []
    for v in st["virtual"]:
        if v["expiry_epoch"] > now - 90:
            left.append(v); continue
        if "profit" in v:
            continue
        r = await ws.q({"ticks_history": f"frx{v['pair']}", "style": "candles", "granularity": 60,
                        "start": v["expiry_epoch"] - 60, "end": v["expiry_epoch"]})
        cs = r.get("candles") or []
        if cs:
            px = cs[-1]["close"]
            mv = (px - v["spot"]) * (1 if v["side"] == "CALL" else -1)
            v["profit"] = round(STAKE * v["payout_pct"], 2) if mv > 0 else (0.0 if mv == 0 else -STAKE)
            append_csv("virtual.csv", [v])
    st["virtual"] = left


async def cycle(dry=False):
    now = pd.Timestamp.now(tz="UTC")
    key = day_key(now)
    st = load_state(key)
    msk = now.tz_convert(MSK)
    weekend = msk.dayofweek >= 5 and not (msk.dayofweek == 5 and msk.hour < 1)
    async with WS(auth=not dry) as ws:
        if not dry:
            await settle(ws, st)
            await settle_virtual(ws, st)
        if weekend:
            save_state(st); return st
        # 2. журнал выплат
        prow = []
        for pair in PAIRS:
            for m in EXPIRIES:
                p, err = await proposal(ws, pair, +1, m)
                if p:
                    prow.append({"time": now.isoformat(), "pair": pair, "expiry_min": m,
                                 "payout_pct": round(p["payout"] / STAKE - 1, 4)})
        append_csv("payouts.csv", prow)
        pay = {(r["pair"], r["expiry_min"]): r["payout_pct"] for r in prow}
        # 3. сигналы
        bal = st["start"] + st["realized"]
        if st["stopped"] is None and bal <= STOP_BAL:
            st["stopped"] = {"why": "stop", "time": now.isoformat()}
        if st["stopped"] is None and bal >= TARGET_BAL:
            st["stopped"] = {"why": "target", "time": now.isoformat()}
        if msk.hour not in ALLOWED and not os.environ.get("ROBOT_ALL_HOURS"):
            save_state(st); log("час", msk.hour, "не торговый; баланс", bal); return st
        schemes = active_schemes()
        wr = scheme_winrate()
        ev = news.load()
        cache = {}
        bought = 0
        for label, sc in sorted(schemes.items()):
            strat = REGISTRY.get(sc["id"])
            if strat is None:
                continue
            tf, exp = sc["tf"], int(sc["expiry"])
            gran = 900 if tf == "15m" else 3600
            for pair in PAIRS:
                if (pair, gran) not in cache:
                    try:
                        cache[(pair, gran)] = await candles(ws, pair, gran)
                    except Exception as e:  # noqa
                        log("свечи", pair, e); cache[(pair, gran)] = None
                df = cache[(pair, gran)]
                if df is None or len(df) < 300:
                    continue
                last_close = df.index[-1] + pd.Timedelta(seconds=gran)
                if now - last_close > pd.Timedelta("10min") and not os.environ.get("ROBOT_ALL_HOURS"):
                    continue  # для часовых схем — только в первые минуты после закрытия часа
                try:
                    sig, exits = strat["fn"](df, pair)
                    sig, _ = news.apply(pair, df, sig, exits, tf, ev)
                except Exception as e:  # noqa
                    log("схема", label, pair, e); continue
                side = last_bar_signal(df, sig)
                if side == 0:
                    continue
                if news_blocks(pair, now, exp, ev):
                    st["skips"]["новости"] = st["skips"].get("новости", 0) + 1; continue
                if any(o["scheme"] == label and o["pair"] == pair for o in st["open"]):
                    st["skips"]["схема уже в сделке"] = st["skips"].get("схема уже в сделке", 0) + 1; continue
                q = wr.get(label, DEFAULT_WR)
                need = max(MIN_PAYOUT, (1 - q) / q + EDGE)
                p = pay.get((pair, exp))
                prop, err = (None, None)
                if side < 0 or p is None:
                    prop, err = await proposal(ws, pair, side, exp)
                    p = prop["payout"] / STAKE - 1 if prop else None
                if p is None or p < need:
                    st["skips"]["низкая выплата"] = st["skips"].get("низкая выплата", 0) + 1; continue
                rec = {"day": key, "time": now.isoformat(), "scheme": label, "pair": pair,
                       "side": "CALL" if side > 0 else "PUT", "expiry_min": exp, "stake": STAKE,
                       "payout_pct": round(p, 4), "need_pct": round(need, 4)}
                if st["stopped"]:
                    prop = prop or (await proposal(ws, pair, side, exp))[0]
                    if prop:
                        rec.update(spot=prop["spot"], expiry_epoch=prop["date_expiry"], virtual=True)
                        st["virtual"].append(rec)
                    continue
                if bal - STAKE * (len(st["open"]) + 1) < STOP_BAL:
                    st["skips"]["лимит риска"] = st["skips"].get("лимит риска", 0) + 1; continue
                if dry:
                    log("DRY сигнал", rec); continue
                prop = prop or (await proposal(ws, pair, side, exp))[0]
                if not prop:
                    continue
                r = await ws.q({"buy": prop["id"], "price": STAKE})
                if r.get("error"):
                    log("buy error", r["error"]); st["skips"]["ошибка покупки"] = st["skips"].get("ошибка покупки", 0) + 1; continue
                b = r["buy"]
                rec.update(contract_id=b.get("contract_id"), buy_price=b.get("buy_price"), payout=b.get("payout"),
                           start_time=b.get("start_time"), longcode=b.get("longcode"))
                st["open"].append(rec)
                bought += 1
                log("КУПЛЕН", pair, rec["side"], exp, "мин", label, f"выплата {p:.1%}")
        save_state(st)
        log(f"цикл: куплено {bought}, открыто {len(st['open'])}, баланс дня ${bal:.0f}, стоп={st['stopped']}")
        return st


def git_push(msg):
    if os.environ.get("GITHUB_ACTIONS") != "true":
        return
    root = os.path.dirname(TRADER)
    run = lambda *a: subprocess.run(a, cwd=root, capture_output=True, text=True)
    run("git", "add", "trader/deriv")
    if run("git", "diff", "--cached", "--quiet").returncode == 0:
        return
    run("git", "commit", "-m", msg)
    for _ in range(4):
        run("git", "pull", "--rebase", "-X", "theirs", "origin", os.environ.get("GITHUB_REF_NAME", "HEAD"))
        if run("git", "push", "origin", f"HEAD:{os.environ.get('GITHUB_REF_NAME')}").returncode == 0:
            return
        time.sleep(5)
    log("push не удался")


async def test_trade():
    async with WS(auth=True) as ws:
        log("демо-счёт:", ws.account)
        r = await ws.q({"balance": 1}); log("баланс до:", r.get("balance") or r.get("error"))
        prop, err = await proposal(ws, "USDJPY", +1, 15, stake=1)
        log("proposal:", err or {k: prop[k] for k in ("payout", "longcode")})
        if prop:
            r = await ws.q({"buy": prop["id"], "price": 1})
            log("buy:", r.get("error") or r.get("buy"))
            if r.get("buy"):
                cid = r["buy"]["contract_id"]
                r = await ws.q({"proposal_open_contract": 1, "contract_id": cid})
                poc = r.get("proposal_open_contract") or r.get("error")
                log("contract:", {k: poc.get(k) for k in ("status", "is_sold", "profit", "entry_spot", "date_expiry")} if isinstance(poc, dict) else poc)


def loop():
    started = time.time()
    deadline = started + 5 * 3600 + 40 * 60
    while time.time() < deadline:
        now = time.time()
        nxt = (now // 900 + 1) * 900 + 40      # 40 с после закрытия 15-минутной свечи
        if nxt > deadline:
            break
        time.sleep(max(0, nxt - now))
        try:
            st = asyncio.run(cycle())
            git_push(f"Deriv robot: cycle {datetime.now(timezone.utc):%Y-%m-%d %H:%M} UTC")
        except SystemExit:
            raise
        except Exception as e:  # noqa
            log("ошибка цикла:", repr(e))
        msk = pd.Timestamp.now(tz="UTC").tz_convert(MSK)
        if msk.dayofweek == 5 and msk.hour >= 2:   # суббота — рынок закрыт, цепочку не продолжаем
            log("выходные — робот останавливается до понедельника"); return False
    return True   # продолжить цепочку


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "once"
    if mode != "dry" and not TOKEN:
        raise SystemExit("нет DERIV_TOKEN")
    if mode == "loop":
        cont = loop()
        print("CONTINUE" if cont else "STOP")
        open(os.environ.get("GITHUB_OUTPUT", os.devnull), "a").write(f"continue={'true' if cont else 'false'}\n")
    elif mode == "test_trade":
        asyncio.run(test_trade())
    else:
        asyncio.run(cycle(dry=(mode == "dry")))
