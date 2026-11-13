"""Прогон всех стратегий на истории.

    python3 trader/backtest.py            # все стратегии
    python3 trader/backtest.py rsi2 orb   # только выбранные

Пишет trader/reports/backtest.md — таблицу по стратегиям и лучшие пары.
"""
import json, os, sys
import pandas as pd
import fetch, engine, news, binary
from strategies import REGISTRY

ROOT = os.path.dirname(os.path.abspath(__file__))
MIN_TRADES = 20  # меньше сделок — статистика ничего не значит


NEWS_FILTER = True  # новостной фильтр (news.py) для всех схем


# Режим: "binary" = Pocket Option (ставка $20, выплата из pocketoption.json);
#        "cfd"    = обычный форекс со стопом/тейком и кредитным плечом (риск $20 на сделку).
# Выбирается переменной окружения TRADER_MODE (по умолчанию binary).
MODE = os.environ.get("TRADER_MODE", "binary")
SUFFIX = ("" if MODE == "binary" else f"_{MODE}") + ("_allhours" if os.environ.get("TRADER_SHADOW") else "")


def combos(strat):
    """Варианты схемы: (таймфрейм, экспирация в минутах или None для cfd)."""
    if MODE != "binary":
        return [(tf, None) for tf in strat["test_tfs"] if tf != "1d"]
    return [(tf, e) for tf in strat["test_tfs"] for e in binary.CFG["expiries_min"].get(tf, [])]


def label(sid, tf, expiry):
    return f"{sid} [{tf}→{expiry}м]" if expiry else f"{sid} [{tf}]"


def run(strat, pairs=fetch.PAIRS, tf=None, start=None, news_filter=None, expiry=None):
    tf = tf or strat["tf"]
    use_news = NEWS_FILTER if news_filter is None else news_filter
    ev = news.load() if use_news else None
    out = []
    for pair in pairs:
        df = fetch.load(pair, tf)
        if len(df) < 300:
            continue
        if expiry and not binary.allowed(pair):
            continue  # выплата ниже порога — пару не торгуем
        sig, exits = strat["fn"](df, pair)
        if use_news:
            sig, exits = news.apply(pair, df, sig, exits, tf, ev)
        if expiry:
            tr = binary.simulate(pair, df, sig, tf, expiry, strategy=strat["id"],
                                 events=news.events_for(pair, ev) if use_news else None)
        else:
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
        for tf, exp in combos(st):
            tr = run(st, tf=tf, expiry=exp)
            s = engine.stats(tr)
            lab = label(sid, tf, exp)
            summary[lab] = s
            rows.append((s["net_usd"], fmt_row(f"`{lab}` {st['name']}", s)))
            if len(tr):
                tr["label"] = lab
                alltr.append(tr)
                for pair, g in tr.groupby("pair"):
                    ps = engine.stats(g)
                    if ps["trades"] >= MIN_TRADES and ps["winrate"] >= 70 and ps["net_usd"] > 0:
                        best.append((ps["net_usd"], fmt_row(f"`{lab}` {pair}", ps)))
            print(f"{lab:34s} {s['trades']:5d} сделок  винрейт {s['winrate']:5.1f}%  итог {s['net_usd']:+9.0f}$  PF {s['pf']:.2f}")
    rows.sort(reverse=True); best.sort(reverse=True)
    md = ["# Проверка стратегий на истории", "",
          ("Pocket Option, бинарные опционы: ставка $20, выигрыш +$20×выплата, проигрыш −$20; выплата из pocketoption.json, "
           "только пары с выплатой ≥ 85%, только будни (без OTC), без ставок во время важных новостей. "
           "Безубыточный винрейт при 95% — 51.3%." if MODE == "binary" else
           "Риск каждой сделки $20. Спред вычтен."), "15m — последние ~60 дней, 1h — ~2.8 года.",
          "PF — заработано / потеряно (больше 1 = в плюсе). Ср. R — средний результат ставки в долях от $20.", "",
          "## Все стратегии", "", HEAD, *[r for _, r in rows], "",
          f"## Пары, где винрейт ≥ 70% и итог в плюсе (от {MIN_TRADES} сделок)", "",
          HEAD, *([r for _, r in best] or ["| — | | | | | | | | | |"]), ""]
    os.makedirs(os.path.join(ROOT, "reports"), exist_ok=True)
    name = f"backtest{SUFFIX}.md" if not ids else f"backtest_partial{SUFFIX}.md"
    open(os.path.join(ROOT, "reports", name), "w").write("\n".join(md))
    if not ids:
        json.dump(summary, open(os.path.join(ROOT, "reports", f"backtest_summary{SUFFIX}.json"), "w"), ensure_ascii=False, indent=1)
    if alltr:
        pd.concat(alltr).to_csv(os.path.join(ROOT, "reports", f"backtest_trades{SUFFIX}.csv.gz"), index=False)


if __name__ == "__main__":
    main(sys.argv[1:])
