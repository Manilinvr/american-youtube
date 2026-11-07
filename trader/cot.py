#!/usr/bin/env python3
"""COT (Commitments of Traders) monitor for the "big players" in FX futures.

Source: CFTC Traders in Financial Futures (TFF), futures-only, via the official
CFTC Public Reporting API (Socrata dataset gpe5-46if, same data as
FinFutWk.txt / fut_fin_txt_YYYY.zip). The www.cftc.gov flat files sit behind a
Cloudflare browser challenge and do not download from scripts, so the API is
used as the primary source; the last successful download is cached in
trader/data/cot/ and used as a fallback when the network is unavailable.

Usage:
    python3 trader/cot.py            # download + report
    python3 trader/cot.py --offline  # use cached data only
    python3 trader/cot.py --years 5  # history depth (default 4)

Report date = Tuesday "as of" date; CFTC publishes it Friday ~15:30 ET.
"""
from __future__ import annotations

import argparse
import datetime as dt
import io
import json
import os
import ssl
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data" / "cot"
REPORT_DIR = ROOT / "reports"
CACHE_FILE = DATA_DIR / "tff_futonly.csv"

API = "https://publicreporting.cftc.gov/resource/gpe5-46if.json"
CA_BUNDLE = "/root/.ccr/ca-bundle.crt"

# code -> (short, pair, sign). sign=+1: long futures = long pair; -1: inverse.
MARKETS = {
    "099741": ("EUR", "EURUSD", +1),
    "096742": ("GBP", "GBPUSD", +1),
    "097741": ("JPY", "USDJPY", -1),
    "232741": ("AUD", "AUDUSD", +1),
    "090741": ("CAD", "USDCAD", -1),
    "092741": ("CHF", "USDCHF", -1),
    "112741": ("NZD", "NZDUSD", +1),
    "098662": ("DXY", "USD Index", +1),
}

FIELDS = [
    "report_date_as_yyyy_mm_dd", "cftc_contract_market_code", "market_and_exchange_names",
    "open_interest_all",
    "dealer_positions_long_all", "dealer_positions_short_all",
    "asset_mgr_positions_long", "asset_mgr_positions_short",
    "lev_money_positions_long", "lev_money_positions_short",
    "other_rept_positions_long", "other_rept_positions_short",
    "nonrept_positions_long_all", "nonrept_positions_short_all",
    "traders_lev_money_long_all", "traders_lev_money_short_all",
]

EXTREME_HI, EXTREME_LO = 90.0, 10.0
SHIFT_Z = 2.0          # weekly change vs. 3y std of weekly changes
SHIFT_OI_PCT = 5.0     # ... or weekly change >= 5% of open interest


# ---------------------------------------------------------------- download --
def _http_get(url: str, timeout: int = 60) -> bytes:
    """GET via urllib (honours HTTPS_PROXY env); fall back to curl on TLS issues."""
    ctx = None
    cafile = os.environ.get("SSL_CERT_FILE") or (CA_BUNDLE if os.path.exists(CA_BUNDLE) else None)
    if cafile:
        ctx = ssl.create_default_context(cafile=cafile)
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            return r.read()
    except Exception as e:  # noqa: BLE001
        print(f"[cot] urllib failed ({e}); trying curl", file=sys.stderr)
        out = subprocess.run(["curl", "-sSf", "--max-time", str(timeout), url],
                             capture_output=True, check=True)
        return out.stdout


def download(years: int) -> pd.DataFrame:
    since = (dt.date.today() - dt.timedelta(days=int(365.25 * years) + 14)).isoformat()
    codes = ",".join(f"'{c}'" for c in MARKETS)
    params = {
        "$select": ",".join(FIELDS),
        "$where": f"cftc_contract_market_code in({codes}) AND report_date_as_yyyy_mm_dd >= '{since}'",
        "$order": "report_date_as_yyyy_mm_dd ASC",
        "$limit": "50000",
    }
    url = API + "?" + urllib.parse.urlencode(params)
    rows = json.loads(_http_get(url))
    if not rows:
        raise RuntimeError("CFTC API returned no rows")
    df = pd.DataFrame(rows)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(CACHE_FILE, index=False)
    return df


def load(offline: bool, years: int) -> tuple[pd.DataFrame, str]:
    if not offline:
        try:
            return download(years), "CFTC Public Reporting API (свежая загрузка)"
        except Exception as e:  # noqa: BLE001
            print(f"[cot] download failed: {e}", file=sys.stderr)
    if CACHE_FILE.exists():
        return pd.read_csv(CACHE_FILE, dtype={"cftc_contract_market_code": str}), f"кэш {CACHE_FILE.name}"
    raise SystemExit("[cot] no data: download failed and no cache")


# ---------------------------------------------------------------- analysis --
def prepare(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["date"] = pd.to_datetime(df["report_date_as_yyyy_mm_dd"]).dt.normalize()
    df["code"] = df["cftc_contract_market_code"].astype(str).str.strip().str.zfill(6)
    num = [c for c in FIELDS if c not in ("report_date_as_yyyy_mm_dd", "cftc_contract_market_code",
                                         "market_and_exchange_names")]
    for c in num:
        df[c] = pd.to_numeric(df.get(c), errors="coerce")
    df["oi"] = df["open_interest_all"]
    df["lev_net"] = df["lev_money_positions_long"] - df["lev_money_positions_short"]
    df["am_net"] = df["asset_mgr_positions_long"] - df["asset_mgr_positions_short"]
    df["dealer_net"] = df["dealer_positions_long_all"] - df["dealer_positions_short_all"]
    df = df.drop_duplicates(["code", "date"]).sort_values(["code", "date"])
    return df


def cot_index(s: pd.Series, n: int) -> float:
    w = s.dropna().iloc[-n:]
    if len(w) < max(10, n // 2):
        return float("nan")
    lo, hi = w.min(), w.max()
    return 50.0 if hi == lo else float((w.iloc[-1] - lo) / (hi - lo) * 100)


def analyse_group(g: pd.DataFrame, col: str) -> dict:
    s = g[col]
    chg = s.diff()
    last_chg = chg.iloc[-1]
    std = chg.iloc[-157:-1].std()
    z = last_chg / std if std and not np.isnan(std) else float("nan")
    oi = g["oi"].iloc[-1]
    return {
        "net": s.iloc[-1],
        "chg": last_chg,
        "chg4": s.iloc[-1] - s.iloc[-5] if len(s) > 4 else float("nan"),
        "z": z,
        "pct_oi": s.iloc[-1] / oi * 100 if oi else float("nan"),
        "chg_pct_oi": last_chg / oi * 100 if oi else float("nan"),
        "idx52": cot_index(s, 52),
        "idx156": cot_index(s, 156),
        "weeks": int(s.notna().sum()),
    }


def analyse(df: pd.DataFrame) -> tuple[pd.Timestamp, list[dict]]:
    latest = df["date"].max()
    out = []
    for code, (cur, pair, sign) in MARKETS.items():
        g = df[df["code"] == code].sort_values("date")
        if g.empty:
            continue
        stale = g["date"].iloc[-1] != latest
        out.append({
            "code": code, "cur": cur, "pair": pair, "sign": sign,
            "date": g["date"].iloc[-1], "stale": stale,
            "oi": g["oi"].iloc[-1], "oi_chg": g["oi"].diff().iloc[-1],
            "lev": analyse_group(g, "lev_net"),
            "am": analyse_group(g, "am_net"),
            "dealer_net": g["dealer_net"].iloc[-1],
            "lev_traders": (g["traders_lev_money_long_all"].iloc[-1], g["traders_lev_money_short_all"].iloc[-1]),
        })
    return latest, out


# ------------------------------------------------------------------ format --
def fnum(x: float, signed: bool = False) -> str:
    if x is None or (isinstance(x, float) and np.isnan(x)):
        return "—"
    s = f"{abs(x):,.0f}".replace(",", " ")
    if signed or x < 0:
        s = ("+" if x > 0 else "−" if x < 0 else "±") + s
    return s


def fidx(x: float) -> str:
    return "—" if np.isnan(x) else f"{x:.0f}"


def futures_side(net: float, cur: str) -> str:
    if cur == "DXY":
        return "лонг USD" if net > 0 else "шорт USD"
    return f"лонг {cur}" if net > 0 else f"шорт {cur}"


def pair_side(net: float, r: dict) -> str:
    d = np.sign(net) * r["sign"]
    if r["cur"] == "DXY":
        return "доллар ↑ (лонг USD)" if d > 0 else "доллар ↓ (шорт USD)"
    return f"{'ЛОНГ' if d > 0 else 'ШОРТ'} {r['pair']}"


def extreme_flag(idx: float) -> str | None:
    if np.isnan(idx):
        return None
    if idx >= EXTREME_HI:
        return "hi"
    if idx <= EXTREME_LO:
        return "lo"
    return None


def describe_extreme(r: dict, key: str, label: str) -> str | None:
    a = r[key]
    msgs = [f"{name}: {a[win]:.0f}" for win, name in (("idx52", "52 нед."), ("idx156", "3 года"))
            if extreme_flag(a[win])]
    if not msgs:
        return None
    hi = (a["idx52"] >= EXTREME_HI) or (a["idx156"] >= EXTREME_HI)
    # +1: positioning is at its most bullish for the pair (in pair terms), -1: most bearish
    pair_dir = (+1 if hi else -1) * r["sign"]
    side_now = pair_side(a["net"], r)
    if r["cur"] == "DXY":
        what = "самая бычья по доллару" if pair_dir > 0 else "самая медвежья по доллару"
        rev = "риск отката доллара вниз" if pair_dir > 0 else "риск отскока доллара"
    else:
        what = f"самая {'бычья' if pair_dir > 0 else 'медвежья'} по {r['pair']}"
        rev = f"риск разворота {r['pair']} {'вниз' if pair_dir > 0 else 'вверх'}"
    return (f"**{r['pair']} — {label}** (сейчас {side_now}; нетто {fnum(a['net'])} контр. фьюч. {r['cur']}): "
            f"позиция {what} относительно своего диапазона (COT-индекс {', '.join(msgs)}) → перекошенное позиционирование, {rev}.")


def describe_shift(r: dict, key: str, label: str) -> str | None:
    a = r[key]
    big = (not np.isnan(a["z"]) and abs(a["z"]) >= SHIFT_Z) or abs(a["chg_pct_oi"]) >= SHIFT_OI_PCT
    if not big:
        return None
    d = np.sign(a["chg"]) * r["sign"]
    if r["cur"] == "DXY":
        toward = "в сторону покупки доллара" if d > 0 else "в сторону продажи доллара"
    else:
        toward = f"в сторону {'покупки' if d > 0 else 'продажи'} {r['pair']}"
    return (f"**{r['pair']} — {label}**: резкий сдвиг за неделю {fnum(a['chg'], True)} контр. "
            f"({a['z']:+.1f}σ, {a['chg_pct_oi']:+.1f}% от OI) — {toward}.")


def build_report(latest: pd.Timestamp, rows: list[dict], source: str) -> str:
    rel = latest + pd.Timedelta(days=3)
    L = []
    L.append(f"# COT: позиционирование крупных игроков в валютах — отчёт на {latest:%d.%m.%Y}")
    L.append("")
    L.append(f"Данные CFTC Traders in Financial Futures (только фьючерсы) на вторник **{latest:%d.%m.%Y}**, "
             f"опубликованы в пятницу {rel:%d.%m.%Y} ~15:30 ET. Источник: {source}. "
             f"Сгенерировано {dt.datetime.now():%Y-%m-%d %H:%M}.")
    L.append("")
    L.append("**Leveraged Funds** = хедж-фонды и CTA («киты», спекулятивные деньги). "
             "**Asset Managers** = пенсионные фонды, страховые, крупные управляющие (медленные деньги). "
             "COT-индекс = положение текущей нетто-позиции в диапазоне min–max за период (0 = самый большой шорт, 100 = самый большой лонг) — считается по фьючерсу на валюту, поэтому для USDJPY, USDCAD, USDCHF высокий индекс = давление на пару ВНИЗ. "
             "Всё переведено в язык пар: JPY, CAD, CHF фьючерсы обратны USDJPY/USDCAD/USDCHF.")
    L.append("")

    L.append("## Leveraged Funds (хедж-фонды)")
    L.append("")
    L.append("| Пара | Нетто во фьюч. (контр.) | Δ нед. | Δ 4 нед. | % OI | COT 52н | COT 3г | Что это значит для пары |")
    L.append("|---|---:|---:|---:|---:|---:|---:|---|")
    for r in rows:
        a = r["lev"]
        mark = " ⚠️" if extreme_flag(a["idx52"]) or extreme_flag(a["idx156"]) else ""
        L.append(f"| {r['pair']}{' (старые данные)' if r['stale'] else ''} | {fnum(a['net'])} | {fnum(a['chg'], True)} | "
                 f"{fnum(a['chg4'], True)} | {a['pct_oi']:+.0f}% | {fidx(a['idx52'])} | {fidx(a['idx156'])}{mark} | "
                 f"{futures_side(a['net'], r['cur'])} фьюч. → {pair_side(a['net'], r)} |")
    L.append("")

    L.append("## Asset Managers (институционалы)")
    L.append("")
    L.append("| Пара | Нетто во фьюч. (контр.) | Δ нед. | Δ 4 нед. | % OI | COT 52н | COT 3г | Что это значит для пары |")
    L.append("|---|---:|---:|---:|---:|---:|---:|---|")
    for r in rows:
        a = r["am"]
        mark = " ⚠️" if extreme_flag(a["idx52"]) or extreme_flag(a["idx156"]) else ""
        L.append(f"| {r['pair']} | {fnum(a['net'])} | {fnum(a['chg'], True)} | {fnum(a['chg4'], True)} | "
                 f"{a['pct_oi']:+.0f}% | {fidx(a['idx52'])} | {fidx(a['idx156'])}{mark} | "
                 f"{futures_side(a['net'], r['cur'])} фьюч. → {pair_side(a['net'], r)} |")
    L.append("")

    ext, shifts = [], []
    for r in rows:
        for key, label in (("lev", "хедж-фонды"), ("am", "управляющие")):
            e = describe_extreme(r, key, label)
            if e:
                ext.append(e)
            s = describe_shift(r, key, label)
            if s:
                shifts.append(s)

    L.append("## ⚠️ Перекошенное позиционирование (COT-индекс > 90 или < 10)")
    L.append("")
    L.extend([f"- {x}" for x in ext] or ["- Экстремумов нет."])
    L.append("")
    L.append(f"## 🔀 Крупные недельные сдвиги (|Δ| ≥ {SHIFT_Z:.0f}σ или ≥ {SHIFT_OI_PCT:.0f}% OI)")
    L.append("")
    L.extend([f"- {x}" for x in shifts] or ["- Резких сдвигов нет."])
    L.append("")

    # USD aggregate view of hedge funds (majors only, DXY excluded)
    fx = [r for r in rows if r["cur"] != "DXY"]
    usd_short = [r["pair"] for r in fx if np.sign(r["lev"]["net"]) * r["sign"] * (1 if r["pair"].startswith("USD") else -1) < 0]
    usd_long = [r["pair"] for r in fx if r["pair"] not in usd_short]
    L.append("## Итог по доллару (хедж-фонды)")
    L.append("")
    L.append(f"- Против доллара (шорт USD): {', '.join(usd_short) or '—'}")
    L.append(f"- За доллар (лонг USD): {', '.join(usd_long) or '—'}")
    dxy = next((r for r in rows if r["cur"] == "DXY"), None)
    if dxy:
        L.append(f"- USD Index (ICE): хедж-фонды {futures_side(dxy['lev']['net'], 'DXY')} "
                 f"{fnum(abs(dxy['lev']['net']))} контр., COT 52н = {fidx(dxy['lev']['idx52'])}.")
    L.append("")
    L.append("> Как пользоваться: COT — медленный, недельный контекст, а не сигнал входа. "
             "Экстремум говорит, что сделка переполнена и топливо для продолжения заканчивается, "
             "но разворот нужно подтверждать ценой. Данные отстают на 3 дня (вторник → пятница).")
    L.append("")
    return "\n".join(L)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--offline", action="store_true", help="use cached data only")
    ap.add_argument("--years", type=int, default=4, help="years of history to download (>=3)")
    args = ap.parse_args()

    raw, source = load(args.offline, max(3, args.years))
    df = prepare(raw)
    latest, rows = analyse(df)
    md = build_report(latest, rows, source)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_DIR / "cot_latest.md").write_text(md, encoding="utf-8")
    sys.stdout.write(md)


if __name__ == "__main__":
    main()
