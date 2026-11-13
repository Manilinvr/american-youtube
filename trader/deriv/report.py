"""Отчёт по настоящим демо-сделкам Deriv за день → reports/daily/ДАТА_deriv.md

    python3 deriv/report.py [ДАТА]   (по умолчанию — сегодня по МСК)
"""
import json, os, sys
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def money(x):
    return f"{x:+.0f}$"


def main(day=None):
    day = day or pd.Timestamp.now(tz="Europe/Moscow").strftime("%Y-%m-%d")
    p = os.path.join(HERE, "state", f"{day}.json")
    L = [f"# Отчёт за день {pd.Timestamp(day):%d.%m.%Y} — Deriv (настоящие демо-сделки)", "",
         "Демо-счёт Deriv, контракты Rise/Fall (вверх/вниз), ставка $20, выплата — реальная на момент сделки. "
         "Ничья у Deriv = проигрыш. Счёт дня: $1000, стоп при ≤ $100, цель $2000 (после цели — только виртуально).", ""]
    if not os.path.exists(p):
        L += ["Робот сегодня сделок не совершал (нет файла состояния за день).", ""]
    else:
        st = json.load(open(p))
        cl = pd.DataFrame(st["closed"])
        bal = st["start"] + st["realized"]
        n = len(cl)
        w = int((cl.profit > 0).sum()) if n else 0
        won = cl.profit[cl.profit > 0].sum() if n else 0
        lost = -cl.profit[cl.profit <= 0].sum() if n else 0
        L += ["| Было | Стало | Итог дня | Закрыто сделок | Выигрышных / проигрышных | % выигрышных | Заработано | Потеряно | Открыто сейчас |",
              "|---|---|---|---|---|---|---|---|---|",
              f"| $1000 | **${bal:.0f}** | **{money(bal - 1000)}** | {n} | {w} / {n - w} | {100 * w / n if n else 0:.0f}% | +${won:.0f} | −${lost:.0f} | {len(st['open'])} |", ""]
        if st.get("stopped"):
            why = "⛔ стоп ($100)" if st["stopped"]["why"] == "stop" else "🎯 цель ($2000)"
            t = pd.Timestamp(st["stopped"]["time"]).tz_convert("Europe/Moscow")
            L += [f"**{why} в {t:%H:%M} МСК** — дальше сделки только виртуальные.", ""]
        if n:
            L += ["## По валютным парам", "", "| Пара | Сделок | Выигрышных | % | Итог |", "|---|---|---|---|---|"]
            for pair, g in cl.groupby("pair"):
                L.append(f"| {pair} | {len(g)} | {(g.profit > 0).sum()} | {100 * (g.profit > 0).mean():.0f}% | {money(g.profit.sum())} |")
            L += ["", "## По схемам", "", "| Схема | Сделок | Выигрышных | % | Итог |", "|---|---|---|---|---|"]
            for sc, g in cl.groupby("scheme"):
                L.append(f"| `{sc}` | {len(g)} | {(g.profit > 0).sum()} | {100 * (g.profit > 0).mean():.0f}% | {money(g.profit.sum())} |")
            L += [""]
        if st.get("skips"):
            L += ["Пропущено сигналов: " + ", ".join(f"{k} — {v}" for k, v in st["skips"].items()), ""]
        if st.get("virtual"):
            L += [f"Виртуальных сделок после остановки (ждут расчёта): {len(st['virtual'])}.", ""]
    pp = os.path.join(HERE, "payouts.csv")
    if os.path.exists(pp):
        po = pd.read_csv(pp)
        po["time"] = pd.to_datetime(po.time, utc=True, format="ISO8601")
        po = po[po.time.dt.tz_convert("Europe/Moscow").dt.strftime("%Y-%m-%d") == day]
        if len(po):
            t = po.pivot_table(index="pair", columns="expiry_min", values="payout_pct", aggfunc=["mean", "min"])
            L += ["## 📈 Выплаты Deriv за день (средняя / минимальная)", "", "| Пара | 15 мин | 30 мин | 60 мин |", "|---|---|---|---|"]
            for pair in t.index:
                cells = [f"{t[('mean', m)][pair]:.0%} / {t[('min', m)][pair]:.0%}" if ('mean', m) in t.columns else "—" for m in (15, 30, 60)]
                L.append(f"| {pair} | " + " | ".join(cells) + " |")
            L += [""]
    out = os.path.join(ROOT, "reports", "daily", f"{day}_deriv.md")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w").write("\n".join(L))
    print(out)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
