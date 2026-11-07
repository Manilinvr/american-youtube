"""Демо-торговля вперёд и еженедельный отчёт.

    python3 trader/paper.py update   # пересчитать журнал сделок и статусы схем
    python3 trader/paper.py report   # + написать отчёт за неделю (reports/weekly/ДАТА.md)
    python3 trader/paper.py daily    # + отчёт за день (reports/daily/ДАТА.md)

Как это работает. Правила каждой схемы зафиксированы в strategies.py. Программа
отыгрывает их на всех свечах с даты старта схемы (по умолчанию — понедельник
9 ноября 2026) — как будто робот торговал на демо-счёте. Риск каждой сделки $20.

Правило владельца: если за любые две недели торгов схема ушла в минус — она
исключается и больше не торгует. Периоды по 14 дней отсчитываются от даты
старта схемы; сделка относится к периоду по времени закрытия.
"""
import json, os, sys
import pandas as pd
import engine, news
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
            if st["excluded_on"]:  # после исключения сделки не считаются
                tr = tr[tr.exit_time < pd.Timestamp(st["excluded_on"], tz="UTC")]
        all_tr.append(tr.assign(scheme=label))
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
    ev = news.load()
    ev = ev[(ev.time >= week0) & (ev.time < now + pd.Timedelta(days=3))]
    L += ["## 📰 Важные новости недели (входы за 30 мин до/после запрещены, сделки закрыты за 15 мин до)", ""]
    if len(ev):
        msk = ev.time.dt.tz_convert("Europe/Moscow")
        L += [f"- {t:%a %d.%m %H:%M} МСК — **{c}** {ti}" for t, c, ti in zip(msk, ev.ccy, ev.title)]
    else:
        L += ["- календарь за эту неделю не загружен — работал только фильтр «аномальной свечи»"]
    L += [""]
    if newly:
        L += ["## ❌ Исключены на этой неделе", ""] + [f"- `{k}` — {status[k]['reason']}" for k in newly] + [""]
    out = os.path.join(ROOT, "reports", "weekly")
    os.makedirs(out, exist_ok=True)
    path = os.path.join(out, f"{now:%Y-%m-%d}.md")
    open(path, "w").write("\n".join(L))
    return path


def daily(now=None):
    """Ежедневный отчёт: сделки за последние 24 часа, итог с начала, новости на завтра."""
    now = now or now_utc()
    trades, status = update(now)
    # окно — с прошлого отчёта: в воскресенье с вечера пятницы (в субботу отчёта нет)
    sunday = now.tz_convert("Europe/Moscow").dayofweek == 6
    day0 = now - pd.Timedelta(days=2 if sunday else 1)
    tr = trades.copy()
    if len(tr):
        tr["exit_time"] = pd.to_datetime(tr.exit_time, utc=True)
        tr["entry_time"] = pd.to_datetime(tr.entry_time, utc=True)
    dt = tr[tr.exit_time >= day0] if len(tr) else tr
    msk = now.tz_convert("Europe/Moscow")
    start = pd.Timestamp(FORWARD_START, tz="UTC")
    L = [f"# Отчёт за день {msk:%d.%m.%Y} ({['пн','вт','ср','чт','пт','сб','вс'][msk.dayofweek]})", ""]
    if now < start:
        L += [f"Демо-торговля стартует в понедельник {start:%d.%m.%Y} с открытия рынка. Сегодня — план на неделю.", ""]
    else:
        L += [f"День {(now - start).days + 1} демо-обучения из ~60. Риск каждой сделки $20.", ""]
    ds, cs = engine.stats(dt), engine.stats(tr)
    act = sum(v["status"] == "active" for v in status.values())
    L += ["| | Сделок | Плюс/минус | Винрейт | Заработано | Потеряно | Итог |", "|---|---|---|---|---|---|---|",
          _row("За день", ds), _row("С начала обучения", cs), "", f"Схем в работе: **{act}** из {len(status)}.", ""]
    if len(dt):
        rows = []
        for label, g in dt.groupby("scheme"):
            st = engine.stats(g)
            rows.append((st["net_usd"], _row(f"`{label}` {REGISTRY[status[label]['id']]['name']}", st)))
        rows.sort(key=lambda r: -r[0])
        L += ["## Схемы за день", "", "| Схема | Сделок | Плюс/минус | Винрейт | Заработано | Потеряно | Итог |",
              "|---|---|---|---|---|---|---|", *[r for _, r in rows], ""]
        top = dt.sort_values("usd")
        L += ["## Лучшая и худшая сделка дня", ""]
        for _, r in pd.concat([top.tail(1), top.head(1)]).iterrows():
            L.append(f"- {r.pair} {r.dir} ({r.scheme}): вход {r.entry_time.tz_convert('Europe/Moscow'):%H:%M} МСК по {r.entry}, "
                     f"выход {r.exit_time.tz_convert('Europe/Moscow'):%H:%M} ({r.exit_reason}), **{r.usd:+.2f}$**")
        L += [""]
    elif now >= start:
        L += ["Сделок за день не было.", ""]
    newly = [k for k, v in status.items() if v["excluded_on"] and day0 <= pd.Timestamp(v["excluded_on"], tz="UTC") <= now]
    if newly:
        L += ["## ❌ Исключены сегодня (минус за 2 недели)", ""] + [f"- `{k}` — {status[k]['reason']}" for k in newly] + [""]
    ev = news.load()
    horizon = now + pd.Timedelta(days=7 if now < start or msk.dayofweek >= 5 else 1)
    ev = ev[(ev.time >= now) & (ev.time < horizon)]
    L += [f"## 📰 Важные новости {'на неделю' if horizon - now > pd.Timedelta(days=1) else 'на завтра'} — в эти часы роботы не торгуют", ""]
    if len(ev):
        tm = ev.time.dt.tz_convert("Europe/Moscow")
        L += [f"- {['пн','вт','ср','чт','пт','сб','вс'][t.dayofweek]} {t:%d.%m %H:%M} МСК — **{c}** {ti}" for t, c, ti in zip(tm, ev.ccy, ev.title)]
    else:
        L += ["- в календаре пока нет важных новостей на этот период (календарь обновляется каждый день)"]
    L += [""]
    out = os.path.join(ROOT, "reports", "daily")
    os.makedirs(out, exist_ok=True)
    path = os.path.join(out, f"{msk:%Y-%m-%d}.md")
    open(path, "w").write("\n".join(L))
    return path


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "update"
    if cmd == "daily":
        when = pd.Timestamp(sys.argv[2], tz="UTC") if len(sys.argv) > 2 else None
        print(daily(when))
    elif cmd == "report":
        when = pd.Timestamp(sys.argv[2], tz="UTC") if len(sys.argv) > 2 else None
        print(report(when))
    else:
        t, s = update()
        print(f"сделок в журнале: {len(t)}, схем: {len(s)}, исключено: {sum(v['status'] == 'excluded' for v in s.values())}")
