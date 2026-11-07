"""Прогон всех стратегий на истории.

    python3 trader/backtest.py            # все стратегии
    python3 trader/backtest.py rsi2 orb   # только выбранные

Пишет trader/reports/backtest.md — таблицу по стратегиям и лучшие пары.
"""
import json, os, sys
import pandas as pd
import fetch, engine
from strategies import REGISTRY

ROOT = os.path.dirname(os.path.abspath(__file__))
MIN_TRADES = 20  # меньше сделок — статистика ничего не значит


def run(strat, pairs=fetch.PAIRS, tf=None, start=None):
    tf = tf or strat["tf"]
    out = []
    for pair in pairs:
        df = fetch.load(pair, tf)
        if len(df) < 300:
            continue
        sig, exits = strat["fn"](df, pair)
        tr = engine.simulate(pair, df, sig, exits, tf=tf, strategy=strat["id"])
        if start is not None and len(tr):
            start = pd.Timestamp(start)
            start = start.tz_localize("UTC") if start.tzinfo is None else start
            tr = tr[tr.entry_time >= start]
        out.append(tr)
    out = [t for t in out if len(t)]
    return pd.concat(out, ignore_index=True) if out else pd.DataFrame()


def fmt_row(name, s):
    return (f"| {name} | {s['trades']} | {s['wins']}/{s['losses']} | {s['winrate']:.0f}% | "
            f"+${s['won_usd']:.0f} | −${s['lost_usd']:.0f} | **{s['net_usd']:+.0f}$** | "
            f"{s['pf']:.2f} | {s['avg_r']:+.2f} | ${s['max_dd_usd']:.0f} |")


HEAD = ("| Схема | Сделок | Плюс/минус | Винрейт | Заработано | Потеряно | Итог | PF | Ср. R | Макс. просадка |\n"
        "|---|---|---|---|---|---|---|---|---|---|")


def main(ids):
    rows, best, alltr, summary = [], [], [], {}
    for sid, st in REGISTRY.items():
        if ids and sid not in ids:
            continue
        for tf in st.get("test_tfs", [st["tf"]]):
            tr = run(st, tf=tf)
            s = engine.stats(tr)
            label = f"{sid} [{tf}]"
            summary[label] = s
            rows.append((s["net_usd"], fmt_row(f"`{label}` {st['name']}", s)))
            if len(tr):
                tr["label"] = label
                alltr.append(tr)
                for pair, g in tr.groupby("pair"):
                    ps = engine.stats(g)
                    if ps["trades"] >= MIN_TRADES and ps["winrate"] >= 70 and ps["net_usd"] > 0:
                        best.append((ps["net_usd"], fmt_row(f"`{label}` {pair}", ps)))
            print(f"{label:28s} {s['trades']:5d} сделок  винрейт {s['winrate']:5.1f}%  итог {s['net_usd']:+9.0f}$  PF {s['pf']:.2f}")
    rows.sort(reverse=True); best.sort(reverse=True)
    md = ["# Проверка стратегий на истории", "",
          "Риск каждой сделки $20. Спред вычтен. 15m — последние ~60 дней, 1h — ~2.8 года, 1d — 10 лет.",
          "PF — прибыль / убыток (больше 1 = в плюсе). Ср. R — средний результат сделки в долях риска.", "",
          "## Все стратегии", "", HEAD, *[r for _, r in rows], "",
          f"## Пары, где винрейт ≥ 70% и итог в плюсе (от {MIN_TRADES} сделок)", "",
          HEAD, *([r for _, r in best] or ["| — | | | | | | | | | |"]), ""]
    os.makedirs(os.path.join(ROOT, "reports"), exist_ok=True)
    name = "backtest.md" if not ids else "backtest_partial.md"
    open(os.path.join(ROOT, "reports", name), "w").write("\n".join(md))
    if not ids:
        json.dump(summary, open(os.path.join(ROOT, "reports", "backtest_summary.json"), "w"), ensure_ascii=False, indent=1)
    if alltr:
        pd.concat(alltr).to_csv(os.path.join(ROOT, "reports", "backtest_trades.csv.gz"), index=False)


if __name__ == "__main__":
    main(sys.argv[1:])
