"""Торговый счёт с балансом (задания владельца вида «$1000 на день»).

    python3 trader/account.py accounts/challenge_2026-11-12.json

Берёт сделки выбранных схем из журнала (journal/trades.csv — те же правила, что
в демо), оставляет только выбранные пары и отыгрывает их по порядку на одном
счёте: ставка фиксированная, одна открытая сделка на пару, новая сделка только
если хватает свободных денег, торговля на день останавливается по дневному
стопу (−$100) или по цели (+$100). Пишет отчёт рядом с файлом задания (.md).
"""
import json, os, sys
import pandas as pd

ROOT = os.path.dirname(os.path.abspath(__file__))


def run(cfg_path):
    cfg = json.load(open(cfg_path))
    t = pd.read_csv(os.path.join(ROOT, "journal", "trades.csv"))
    for c in ("entry_time", "exit_time"):
        t[c] = pd.to_datetime(t[c], utc=True)
    start = pd.Timestamp(cfg["start"], tz="UTC")
    end = pd.Timestamp(cfg["end_entries"], tz="UTC")
    c = t[t.scheme.isin(cfg["schemes"]) & t.pair.isin(cfg["pairs"]) &
          (t.entry_time >= start) & (t.entry_time < end)].sort_values(["entry_time", "scheme"])
    bal = float(cfg["start_balance"])
    stake = float(cfg["stake_usd"])
    open_ = []          # (exit_time, pair, usd)
    taken, skipped, stopped = [], {"пара занята": 0, "нет денег": 0, "день остановлен": 0}, None
    for _, r in c.iterrows():
        # закрываем истёкшие сделки
        for o in sorted([o for o in open_ if o[0] <= r.entry_time]):
            bal += o[2] + stake; open_.remove(o)
        # результат дня по закрытым сделкам (ставки открытых сделок ещё не проиграны)
        pnl_day = bal + stake * len(open_) - cfg["start_balance"]
        tp = cfg.get("take_profit_day_usd")
        if stopped is None and (pnl_day <= cfg["stop_loss_day_usd"] or (tp is not None and pnl_day >= tp)):
            stopped = (r.entry_time, "баланс исчерпан" if pnl_day <= -cfg["start_balance"] else ("дневной стоп" if pnl_day < 0 else "дневная цель"))
        if stopped:
            skipped["день остановлен"] += 1; continue
        if sum(1 for o in open_ if o[1] == r.pair) >= cfg["max_open_per_pair"]:
            skipped["пара занята"] += 1; continue
        if bal < stake:
            skipped["нет денег"] += 1; continue
        bal -= stake
        open_.append((r.exit_time, r.pair, r.usd))
        taken.append(r)
    for o in sorted(open_):
        bal += o[2] + stake
    tr = pd.DataFrame(taken)
    run_b, min_bal = float(cfg["start_balance"]), float(cfg["start_balance"])
    for _, r in (tr.sort_values("exit_time").iterrows() if len(tr) else []):
        run_b += r.usd; min_bal = min(min_bal, run_b)
    msk = lambda ts: ts.tz_convert("Europe/Moscow").strftime("%H:%M")
    L = [f"# Счёт $1000 — {start:%d.%m.%Y}", "",
         f"Схемы: {', '.join('`'+s+'`' for s in cfg['schemes'])}.",
         f"Пары: {', '.join(cfg['pairs'])}. Ставка ${stake:.0f}. Правила риска: {cfg['risk_rule']}.",
         f"Отбор (сделан до начала дня): {cfg['selection_rule']}; {cfg['pairs_rule']}.", ""]
    if len(tr):
        w, l, z = (tr.usd > 0).sum(), (tr.usd < 0).sum(), (tr.usd == 0).sum()
        L += ["| Начальный баланс | Сделок | Выигрышных / проигрышных / возврат | % выигрышных | Заработано | Потеряно | Итог | Конечный баланс | Минимум баланса |",
              "|---|---|---|---|---|---|---|---|---|",
              f"| $1000 | {len(tr)} | {w} / {l} / {z} | {100*w/len(tr):.0f}% | +${tr.usd[tr.usd>0].sum():.0f} | −${-tr.usd[tr.usd<0].sum():.0f} | "
              f"**{tr.usd.sum():+.0f}$** | **${bal:.0f}** | ${min_bal:.0f} |", ""]
        if stopped:
            L += [f"Торговля остановлена в {msk(stopped[0])} МСК: {stopped[1]}.", ""]
        L += ["## По валютным парам", "", "| Пара | Сделок | Выигрышных | % | Итог |", "|---|---|---|---|---|"]
        for pair, g in tr.groupby("pair"):
            L.append(f"| {pair} | {len(g)} | {(g.usd>0).sum()} | {100*(g.usd>0).mean():.0f}% | {g.usd.sum():+.0f}$ |")
        L += ["", "## По схемам", "", "| Схема | Сделок | Выигрышных | % | Итог |", "|---|---|---|---|---|"]
        for s, g in tr.groupby("scheme"):
            L.append(f"| `{s}` | {len(g)} | {(g.usd>0).sum()} | {100*(g.usd>0).mean():.0f}% | {g.usd.sum():+.0f}$ |")
        L += ["", "## Все сделки", "", "| Вход (МСК) | Итог (МСК) | Пара | Направление | Схема | Цена входа | Цена в конце | Результат | Баланс после |", "|---|---|---|---|---|---|---|---|---|"]
        run_bal = float(cfg["start_balance"])
        for _, r in tr.sort_values("exit_time").iterrows():
            run_bal += r.usd
            L.append(f"| {msk(r.entry_time)} | {msk(r.exit_time)} | {r.pair} | {r.dir} | {r.scheme} | {r.entry} | {r.exit} | {r.usd:+.0f}$ | ${run_bal:.0f} |")
    else:
        L += ["Подходящих сигналов пока не было — счёт не тронут: $1000.", ""]
    L += ["", f"Пропущено сигналов: " + ", ".join(f"{k} — {v}" for k, v in skipped.items()), ""]
    out = os.path.splitext(cfg_path)[0] + ".md"
    open(out, "w").write("\n".join(L))
    return out


if __name__ == "__main__":
    print(run(sys.argv[1]))
