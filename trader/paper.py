"""Демо-торговля вперёд и еженедельный отчёт.

    python3 trader/paper.py update   # пересчитать журнал сделок и статусы схем
    python3 trader/paper.py report   # + написать отчёт за неделю (reports/weekly/ДАТА.md)

Как это работает. Правила каждой схемы зафиксированы в strategies.py. Программа
отыгрывает их на всех свечах с даты старта схемы (по умолчанию — понедельник
9 ноября 2026) — как будто робот торговал на демо-счёте. Риск каждой сделки $20.

Правило владельца: если за любые две недели торгов схема ушла в минус — она
исключается и больше не торгует. Периоды по 14 дней отсчитываются от даты
старта схемы; сделка относится к периоду по времени закрытия.
"""
import json, os, sys
import pandas as pd
import engine
from backtest import run
from strategies import REGISTRY

ROOT = os.path.dirname(os.path.abspath(__file__))
JOURNAL = os.path.join(ROOT, "journal")
STATUS = os.path.join(JOURNAL, "status.json")
FORWARD_START = "2026-11-09"
LEARNING_END = "2027-01-08"
TFS = ("15m", "1h")
GOOD_WINRATE, MIN_TRADES = 70.0, 20


def now_utc():
    return pd.Timestamp.now(tz="UTC")


def next_monday(now=None):
    now = (now or now_utc()).normalize()
    return now + pd.Timedelta(days=(7 - now.dayofweek) % 7 or 7)


def load_status(now=None):
    st = json.load(open(STATUS)) if os.path.exists(STATUS) else {}
    # новая схема стартует со следующего понедельника — никаких сделок задним числом
    start = max(pd.Timestamp(FORWARD_START, tz="UTC"), next_monday(now))
    since = FORWARD_START if not st else f"{start:%Y-%m-%d}"
    for sid, s in REGISTRY.items():
        for tf in TFS:
            if tf in s["test_tfs"]:
                st.setdefault(f"{sid} [{tf}]", {"id": sid, "tf": tf, "status": "active",
                                                "since": since, "excluded_on": None, "reason": None})
    return st


def update(now=None):
    now = now or now_utc()
    os.makedirs(JOURNAL, exist_ok=True)
    status = load_status(now)
    all_tr = []
    for label, st in status.items():
        if st["id"] not in REGISTRY:
            continue
        since = pd.Timestamp(st["since"], tz="UTC")
        tr = run(REGISTRY[st["id"]], tf=st["tf"], start=since)
        if not len(tr):
            continue
        tr = tr[tr.exit_time < now]
        if st["excluded_on"]:
            tr = tr[tr.exit_time < pd.Timestamp(st["excluded_on"], tz="UTC")]
        tr = tr.assign(scheme=label)
        all_tr.append(tr)
        # правило двух недель
        if st["status"] == "active":
            k = 0
            while True:
                w0, w1 = since + pd.Timedelta(days=14 * k), since + pd.Timedelta(days=14 * (k + 1))
                if w1 > now:
                    break
                net = tr[(tr.exit_time >= w0) & (tr.exit_time < w1)].usd.sum()
                if net < 0:
                    st.update(status="excluded", excluded_on=f"{w1:%Y-%m-%d}",
                              reason=f"минус {net:.0f}$ за период {w0:%d.%m}–{(w1 - pd.Timedelta(days=1)):%d.%m}")
                    break
                k += 1
    trades = pd.concat(all_tr, ignore_index=True) if all_tr else pd.DataFrame(
        columns=["scheme", "strategy", "pair", "tf", "dir", "entry_time", "exit_time", "usd", "R"])
    trades.to_csv(os.path.join(JOURNAL, "trades.csv"), index=False)
    json.dump(status, open(STATUS, "w"), ensure_ascii=False, indent=1)
    return trades, status


def _row(name, s, extra=""):
    if s["trades"] == 0:
        return f"| {name} | 0 | — | — | — | — | — |{extra}"
    return (f"| {name} | {s['trades']} | {s['wins']}/{s['losses']} | {s['winrate']:.0f}% | "
            f"+${s['won_usd']:.0f} | −${abs(s['lost_usd']):.0f} | **{s['net_usd']:+.0f}$** |{extra}")


def report(now=None):
    now = now or now_utc()
    trades, status = update(now)
    week0 = now - pd.Timedelta(days=7)
    bt = {}
    p = os.path.join(ROOT, "reports", "backtest_summary.json")
    if os.path.exists(p):
        bt = json.load(open(p))
    tr = trades.copy()
    if len(tr):
        tr["exit_time"] = pd.to_datetime(tr.exit_time, utc=True)
    wk = tr[tr.exit_time >= week0] if len(tr) else tr
    act = [k for k, v in status.items() if v["status"] == "active"]
    exc = [k for k, v in status.items() if v["status"] == "excluded"]
    newly = [k for k in exc if status[k]["excluded_on"] and pd.Timestamp(status[k]["excluded_on"], tz="UTC") >= week0]
    day_n = (now - pd.Timestamp(FORWARD_START, tz="UTC")).days
    L = [f"# Отчёт за неделю {week0:%d.%m} – {now:%d.%m.%Y}", "",
         f"Демо-обучение: день {max(day_n, 0)} из ~60 (до {pd.Timestamp(LEARNING_END):%d.%m.%Y}). "
         f"Реальные деньги не используются. Риск каждой сделки **$20**: стоп = −$20, прибыль = $20 × (тейк/стоп).", ""]
    ws = engine.stats(wk)
    cs = engine.stats(tr)
    L += ["## Итог", "",
          "| | Сделок | Плюс/минус | Винрейт | Заработано | Потеряно | Итог |", "|---|---|---|---|---|---|---|",
          _row("За неделю", ws), _row("С начала обучения", cs), "",
          f"Схем в работе: **{len(act)}**, исключено всего: **{len(exc)}** (на этой неделе: {len(newly)}).", ""]
    # таблица по схемам за неделю
    rows = []
    for label in act + newly:
        st = status[label]
        w = engine.stats(wk[wk.scheme == label]) if len(wk) else engine.stats(None)
        c = engine.stats(tr[tr.scheme == label]) if len(tr) else engine.stats(None)
        b = bt.get(label)
        btxt = f" {b['winrate']:.0f}% / {b['net_usd']:+.0f}$ |" if b else " — |"
        ctxt = f" {c['trades']} сд., {c['winrate']:.0f}%, {c['net_usd']:+.0f}$ |"
        mark = " ❌" if st["status"] == "excluded" else ""
        rows.append((w["net_usd"], _row(f"`{label}` {REGISTRY[st['id']]['name']}{mark}", w, ctxt + btxt)))
    rows.sort(key=lambda r: -r[0])
    L += ["## Схемы за неделю", "",
          "| Схема (приём) | Сделок | Плюс/минус | Винрейт | Заработано | Потеряно | Итог недели | С начала | История (бэктест) |",
          "|---|---|---|---|---|---|---|---|---|", *[r for _, r in rows], ""]
    # кандидаты
    cands = []
    for label in act:
        g = tr[tr.scheme == label] if len(tr) else tr
        c = engine.stats(g)
        if c["trades"] >= MIN_TRADES and c["winrate"] >= GOOD_WINRATE and c["net_usd"] > 0:
            cands.append(_row(f"`{label}`", c))
    L += [f"## ✅ Рабочие схемы (винрейт ≥ {GOOD_WINRATE:.0f}%, итог в плюсе, от {MIN_TRADES} сделок)", ""]
    L += (["| Схема | Сделок | Плюс/минус | Винрейт | Заработано | Потеряно | Итог |", "|---|---|---|---|---|---|---|", *cands]
          if cands else ["Пока нет. Нужно больше сделок."])
    L += [""]
    if newly:
        L += ["## ❌ Исключены на этой неделе", ""] + [f"- `{k}` — {status[k]['reason']}" for k in newly] + [""]
    out = os.path.join(ROOT, "reports", "weekly")
    os.makedirs(out, exist_ok=True)
    path = os.path.join(out, f"{now:%Y-%m-%d}.md")
    open(path, "w").write("\n".join(L))
    return path


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "update"
    if cmd == "report":
        when = pd.Timestamp(sys.argv[2], tz="UTC") if len(sys.argv) > 2 else None
        print(report(when))
    else:
        t, s = update()
        print(f"сделок в журнале: {len(t)}, схем: {len(s)}, исключено: {sum(v['status'] == 'excluded' for v in s.values())}")
