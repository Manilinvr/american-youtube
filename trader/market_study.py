"""Обзор рынка за 10 лет: как двигались пары, когда тренд, когда флэт,
в какие часы рынок активен. Пишет reports/market_10y.md."""
import os
import numpy as np
import pandas as pd
import fetch, engine, indicators as I

ROOT = os.path.dirname(os.path.abspath(__file__))
L = ["# Рынок за 10 лет: что показывают данные", "",
     "Источник: дневные свечи Yahoo Finance за 10 лет, часовые — за ~3 года. Все времена UTC.", ""]

# 1. Изменение и волатильность по годам
rows, trend = [], []
for pair in fetch.PAIRS:
    d = fetch.load(pair, "1d")
    y = d.close.resample("YE").last()
    chg = (y.pct_change() * 100).dropna()
    rng = ((d.high - d.low) / engine.pip(pair)).resample("YE").mean()
    ad = I.adx(d)[0]
    share_trend = (ad > 25).groupby(d.index.year).mean() * 100
    rows.append((pair, chg, rng))
    trend.append((pair, share_trend))
years = sorted({i.year for _, c, _ in rows for i in c.index})
L += ["## Изменение курса за год, %", "", "| Пара | " + " | ".join(str(y) for y in years) + " |",
      "|---|" + "---|" * len(years)]
for pair, chg, _ in rows:
    m = {i.year: v for i, v in chg.items()}
    L.append(f"| {pair} | " + " | ".join(f"{m[y]:+.1f}" if y in m else "" for y in years) + " |")
L += ["", "## Средний дневной диапазон, пунктов", "", "| Пара | " + " | ".join(str(y) for y in years) + " |",
      "|---|" + "---|" * len(years)]
for pair, _, rng in rows:
    m = {i.year: v for i, v in rng.items()}
    L.append(f"| {pair} | " + " | ".join(f"{m[y]:.0f}" if y in m else "" for y in years) + " |")
L += ["", "## Доля трендовых дней (ADX > 25), %", "", "| Пара | " + " | ".join(str(y) for y in years) + " |",
      "|---|" + "---|" * len(years)]
for pair, st in trend:
    m = st.to_dict()
    L.append(f"| {pair} | " + " | ".join(f"{m[y]:.0f}" if y in m else "" for y in years) + " |")

# 2. Активность по часам (по часовкам)
L += ["", "## Средний размах часовой свечи по часам UTC (в долях от среднего по паре)", "",
      "1.0 = обычный час; больше — рынок активнее, движения шире, пробои надёжнее; меньше — тихо, спред дороже относительно движения.", "",
      "| Час UTC | " + " | ".join(fetch.PAIRS) + " |", "|---|" + "---|" * len(fetch.PAIRS)]
prof = {}
for pair in fetch.PAIRS:
    h = fetch.load(pair, "1h")
    r = (h.high - h.low)
    prof[pair] = r.groupby(h.index.hour).mean() / r.mean()
for hr in range(24):
    L.append(f"| {hr:02d} | " + " | ".join(f"{prof[p][hr]:.2f}" for p in fetch.PAIRS) + " |")

# 3. Серийность: склонность продолжать или разворачиваться (автокорреляция доходностей)
L += ["", "## Продолжение или разворот? Автокорреляция доходностей", "",
      "Плюс — движение чаще продолжается (выгодны трендовые приёмы), минус — чаще откатывает (выгодны «возврат к среднему»). |0.03| и меньше — практически случайно.", "",
      "| Пара | 15m | 1h | 1d |", "|---|---|---|---|"]
for pair in fetch.PAIRS:
    vals = []
    for tf in ("15m", "1h", "1d"):
        r = np.log(fetch.load(pair, tf).close).diff().dropna()
        vals.append(f"{r.autocorr(1):+.3f}")
    L.append(f"| {pair} | " + " | ".join(vals) + " |")
open(os.path.join(ROOT, "reports", "market_10y.md"), "w").write("\n".join(L) + "\n")
print("\n".join(L))
