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
from backtest import run, combos, label, MODE, SUFFIX
from strategies import REGISTRY

ROOT = os.path.dirname(os.path.abspath(__file__))
JOURNAL = os.path.join(ROOT, "journal") if MODE == "binary" else os.path.join(ROOT, "journal", MODE)
SHADOW = bool(os.environ.get("TRADER_SHADOW"))
if SHADOW:
    JOURNAL = os.path.join(JOURNAL, "allhours")
MODEL_TEXT = ("Модель Pocket Option: ставка **$20**, выигрыш +$20 × выплата (95%) = **+$19**, проигрыш **−$20**; "
              "безубыточность — 51.3% выигрышных сделок. Только пары с выплатой ≥ 85%, без OTC."
              if MODE == "binary" else
              "Модель «Форекс со стопами» (первая версия): обычная сделка с кредитным плечом, стоп-лосс и тейк-профит по правилам схемы; "
              "риск каждой сделки **$20** (стоп = −$20, прибыль = $20 × тейк/стоп), спред брокера вычитается.")
TITLE = "" if MODE == "binary" else " — Форекс со стопами"
STATUS = os.path.join(JOURNAL, "status.json")
FORWARD_START = "2026-11-09"
LEARNING_END = "2027-01-08"
TFS = ("15m", "1h")
GOOD_WINRATE, MIN_TRADES = 70.0, 20
# Решение владельца: по итогам первой недели исключаем все схемы, у которых
# итог недели в минусе (в момент пятничного отчёта). Дальше — правило двух недель.
FIRST_CUT = "2026-11-13 18:10"
# Решение владельца 13.11: с понедельника 16.11 каждый день — счёт $1000 на каждую модель.
# Торгуем весь день, пока баланс > $100; при балансе ≤ $100 торговля на день прекращается.
ACCOUNT_START = "2026-11-16"
ACCOUNT_BALANCE, ACCOUNT_STOP = 1000.0, 100.0
# Решение владельца 13.11: при балансе ≥ $2000 торговый день заканчивается (цель),
# а торговля продолжается в теневом режиме — для отчёта «что было бы дальше».
ACCOUNT_TARGET = 2000.0


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
        for tf, exp in combos(s):
            st.setdefault(label(sid, tf, exp), {"id": sid, "tf": tf, "expiry": exp, "status": "active",
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
        tr = run(REGISTRY[st["id"]], tf=st["tf"], start=since, expiry=st.get("expiry"))
        if not len(tr):
            continue
        tr = tr[tr.exit_time < now]
        if st["excluded_on"]:
            tr = tr[tr.exit_time < pd.Timestamp(st["excluded_on"], tz="UTC")]
        # досрочное исключение по итогам первой недели
        cut = pd.Timestamp(FIRST_CUT, tz="UTC")
        if st["status"] == "active" and now >= cut and since < cut:
            net = tr[tr.exit_time < cut].usd.sum()
            if net < 0:
                st.update(status="excluded", excluded_on=FIRST_CUT,
                          reason=f"минус {net:.0f}$ за первую неделю ({since:%d.%m}–{cut:%d.%m})")
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


def pair_table(d, title):
    """Разбивка сделок по валютным парам."""
    if not len(d):
        return []
    L = [f"## {title}", "", "| Пара | Сделок | Плюс/минус | % выигрышных | Заработано | Потеряно | Итог |", "|---|---|---|---|---|---|---|"]
    rows = []
    for pair, g in d.groupby("pair"):
        st = engine.stats(g)
        rows.append((st["net_usd"], _row(pair, st)))
    rows.sort(key=lambda r: -r[0])
    return L + [r for _, r in rows] + [""]


def day_account(tr, day0, now, target="default"):
    """Счёт $1000 на день: сделки активных схем по порядку входа.
    Pocket Option: ставка $20 списывается при открытии, нужна свободная сумма ≥ $20.
    Форекс: риск $20 на сделку (маржа с плечом не ограничивает счёт).
    Если баланс опустился до $100 или ниже — новых сделок до конца дня нет."""
    if target == "default":
        target = ACCOUNT_TARGET
    if not len(tr):
        return None
    d = tr[(tr.entry_time >= day0) & (tr.exit_time < now)].sort_values(["entry_time", "scheme", "pair"])
    stake = 20.0
    bal, open_, taken, skip_money, stop_at, why = ACCOUNT_BALANCE, [], [], 0, None, None
    low = high = ACCOUNT_BALANCE
    for _, r in d.iterrows():
        for o in sorted([o for o in open_ if o[0] <= r.entry_time]):
            bal += o[1]; open_.remove(o); low = min(low, bal); high = max(high, bal)
        if stop_at is None and bal <= ACCOUNT_STOP:
            stop_at, why = r.entry_time, "stop"
        if stop_at is None and target is not None and bal >= target:
            stop_at, why = r.entry_time, "target"
        if stop_at is not None:
            continue
        # бюджет риска: даже если ВСЕ открытые сделки и эта закроются в минус ($20 каждая),
        # баланс не должен опуститься ниже $100 — так счёт физически не уходит под стоп
        if bal - stake * (len(open_) + 1) < ACCOUNT_STOP:
            skip_money += 1
            continue
        open_.append((r.exit_time, r.usd))
        taken.append(r)
    for o in sorted(open_):
        bal += o[1]; low = min(low, bal); high = max(high, bal)
    t = pd.DataFrame(taken)
    return {"start": ACCOUNT_BALANCE, "end": bal, "low": low, "high": high, "trades": t, "stop_at": stop_at, "why": why,
            "skip_money": skip_money, "skip_stop": len(d) - len(taken) - skip_money}


def account_section(acc, shadow=None):
    if acc is None:
        return []
    t = acc["trades"]
    msk = lambda ts: ts.tz_convert("Europe/Moscow").strftime("%H:%M")
    st = engine.stats(t) if len(t) else engine.stats(None)
    L = [f"## 💰 Счёт дня: $1000 (стоп при ≤ ${ACCOUNT_STOP:.0f}, цель ${ACCOUNT_TARGET:.0f})", "",
         "| Было | Стало | Итог дня | Сделок | Плюс/минус | % выигрышных | Минимум | Максимум |", "|---|---|---|---|---|---|---|---|",
         f"| $1000 | **${acc['end']:.0f}** | **{acc['end'] - acc['start']:+.0f}$** | {st['trades']} | {st['wins']}/{st['losses']} | "
         f"{st['winrate']:.0f}% | ${acc['low']:.0f} | ${acc['high']:.0f} |", ""]
    if acc["why"] == "stop":
        L += [f"⛔ **Торговля остановлена в {msk(acc['stop_at'])} МСК: баланс опустился до ${ACCOUNT_STOP:.0f} или ниже.** "
              f"Пропущено сигналов после остановки: {acc['skip_stop']}.", ""]
    if acc["why"] == "target":
        L += [f"🎯 **Цель дня достигнута в {msk(acc['stop_at'])} МСК: баланс ${ACCOUNT_TARGET:.0f}+ — реальная торговля на сегодня закончена.**", ""]
        if shadow is not None:
            ss = engine.stats(shadow["trades"]) if len(shadow["trades"]) else engine.stats(None)
            L += [f"👻 **Теневой режим (если бы продолжили торговать после цели):** конец дня **${shadow['end']:.0f}** "
                  f"({shadow['end'] - acc['end']:+.0f}$ к остановке), всего сделок {ss['trades']}, {ss['winrate']:.0f}% выигрышных, "
                  f"минимум ${shadow['low']:.0f}, максимум ${shadow['high']:.0f}"
                  + (f"; теневой счёт дошёл бы до стопа $100 в {msk(shadow['stop_at'])} МСК" if shadow['why'] == 'stop' else "") + ".", ""]
    if acc["skip_money"]:
        L += [f"Пропущено сигналов из-за лимита риска (иначе при проигрыше всех открытых сделок баланс ушёл бы ниже $100): {acc['skip_money']}.", ""]
    L += pair_table(t, "Счёт дня по валютным парам")
    return L


def report(now=None):
    now = now or now_utc()
    trades, status = update(now)
    week0 = now - pd.Timedelta(days=7)
    bt = {}
    p = os.path.join(ROOT, "reports", f"backtest_summary{SUFFIX.replace('_allhours', '')}.json")
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
    L = [f"# Отчёт за неделю {week0:%d.%m} – {now:%d.%m.%Y}{TITLE}", "",
         f"Демо-обучение: день {max(day_n, 0)} из ~60 (до {pd.Timestamp(LEARNING_END):%d.%m.%Y}). "
         f"Реальные деньги не используются. {MODEL_TEXT}", ""]
    ws = engine.stats(wk)
    cs = engine.stats(tr)
    L += ["## Итог", "",
          "| | Сделок | Плюс/минус | % выигрышных | Заработано | Потеряно | Итог |", "|---|---|---|---|---|---|---|",
          _row("За неделю", ws), _row("С начала обучения", cs), "",
          f"Схем в работе: **{len(act)}**, исключено всего: **{len(exc)}** (на этой неделе: {len(newly)}).", ""]
    L += pair_table(wk, "По валютным парам за неделю")
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
          "| Схема (приём) | Сделок | Плюс/минус | % выигрышных | Заработано | Потеряно | Итог недели | С начала | История (бэктест) |",
          "|---|---|---|---|---|---|---|---|---|", *[r for _, r in rows], ""]
    # кандидаты
    cands = []
    for label in act:
        g = tr[tr.scheme == label] if len(tr) else tr
        c = engine.stats(g)
        if c["trades"] >= MIN_TRADES and c["winrate"] >= GOOD_WINRATE and c["net_usd"] > 0:
            cands.append(_row(f"`{label}`", c))
    L += [f"## ✅ Рабочие схемы (винрейт ≥ {GOOD_WINRATE:.0f}%, итог в плюсе, от {MIN_TRADES} сделок)", ""]
    L += (["| Схема | Сделок | Плюс/минус | % выигрышных | Заработано | Потеряно | Итог |", "|---|---|---|---|---|---|---|", *cands]
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
    path = os.path.join(out, f"{now:%Y-%m-%d}{SUFFIX}.md")
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
    L = [f"# Отчёт за день {msk:%d.%m.%Y} ({['пн','вт','ср','чт','пт','сб','вс'][msk.dayofweek]}){TITLE}", ""]
    if now < start:
        L += [f"Демо-торговля стартует в понедельник {start:%d.%m.%Y} с открытия рынка. Сегодня — план на неделю.", ""]
    else:
        L += [f"День {(now - start).days + 1} демо-обучения из ~60. {MODEL_TEXT}", ""]
    ds, cs = engine.stats(dt), engine.stats(tr)
    if len(dt) and "usd" in dt and len(dt) > 1:
        dt = dt.sort_values("usd")
    act = sum(v["status"] == "active" for v in status.values())
    L += ["| | Сделок | Плюс/минус | % выигрышных | Заработано | Потеряно | Итог |", "|---|---|---|---|---|---|---|",
          _row("За день", ds), _row("С начала обучения", cs), "", f"Схем в работе: **{act}** из {len(status)}.", ""]
    if now >= pd.Timestamp(ACCOUNT_START, tz="UTC"):
        L += account_section(day_account(tr, day0, now), day_account(tr, day0, now, target=None))
    shadow = os.path.join(ROOT, "journal", "allhours", "trades.csv")
    if MODE == "binary" and not SHADOW and os.path.exists(shadow) and now >= pd.Timestamp("2026-11-16", tz="UTC"):
        sh = pd.read_csv(shadow)
        sh["exit_time"] = pd.to_datetime(sh.exit_time, utc=True)
        sd = engine.stats(sh[sh.exit_time >= day0])
        L += [f"🕒 Фильтр часов (торгуем 10, 13–14, 17–18, 20 МСК). Для проверки: если бы торговали во все часы — "
              f"{sd['trades']} сделок, {sd['winrate']:.0f}% выигрышных, итог **{sd['net_usd']:+.0f}$** (виртуально).", ""]
    L += pair_table(dt, "По валютным парам за день")
    L += pair_table(tr, "По валютным парам с начала обучения")
    if len(dt):
        rows = []
        for label, g in dt.groupby("scheme"):
            st = engine.stats(g)
            rows.append((st["net_usd"], _row(f"`{label}` {REGISTRY[status[label]['id']]['name']}", st)))
        rows.sort(key=lambda r: -r[0])
        L += ["## Схемы за день", "", "| Схема | Сделок | Плюс/минус | % выигрышных | Заработано | Потеряно | Итог |",
              "|---|---|---|---|---|---|---|", *[r for _, r in rows], ""]
        top = dt.sort_values("usd")
        L += ["## Пример выигрыша и проигрыша дня", ""]
        for _, r in pd.concat([top.tail(1), top.head(1)]).iterrows():
            L.append(f"- {r.pair} {r.dir} ({r.scheme}): вход {r.entry_time.tz_convert('Europe/Moscow'):%H:%M} МСК по {r.entry}, "
                     f"итог {r.exit_time.tz_convert('Europe/Moscow'):%H:%M} по {r.exit}, **{r.usd:+.2f}$**")
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
    path = os.path.join(out, f"{msk:%Y-%m-%d}{SUFFIX}.md")
    open(path, "w").write("\n".join(L))
    return path


def check_stop(now=None):
    """Ежечасная проверка счёта дня. Если баланс дошёл до $100 и об этом ещё не
    сообщали — пишет отчёт reports/daily/ДАТА_stop{SUFFIX}.md и печатает STOP."""
    now = now or now_utc()
    trades, status = update(now)
    msk = now.tz_convert("Europe/Moscow")
    day0 = (msk.normalize() + pd.Timedelta(hours=21, minutes=10))
    if day0 > msk:
        day0 -= pd.Timedelta(days=1)
    day0 = day0.tz_convert("UTC")
    tr = trades.copy()
    if not len(tr) or now < pd.Timestamp(ACCOUNT_START, tz="UTC"):
        print("OK: счёт не активен"); return None
    for c in ("entry_time", "exit_time"):
        tr[c] = pd.to_datetime(tr[c], utc=True)
    acc = day_account(tr, day0, now)
    if acc is None or acc["why"] is None:
        print(f"OK: баланс ${acc['end'] if acc else 1000:.0f}"); return None
    flag = os.path.join(JOURNAL, f"{acc['why']}_notified_{msk:%Y-%m-%d}")
    if os.path.exists(flag):
        print("уже сообщён"); return None
    head = (f"# ⛔ Стоп торговли {msk:%d.%m.%Y}{TITLE}" if acc["why"] == "stop" else f"# 🎯 Цель дня достигнута {msk:%d.%m.%Y}{TITLE}")
    text = (f"Баланс дня опустился до ${ACCOUNT_STOP:.0f} или ниже — торговля прекращена до конца дня (правило владельца)."
            if acc["why"] == "stop" else
            f"Баланс дня достиг ${ACCOUNT_TARGET:.0f} — реальная торговля на сегодня закончена; дальше — теневой режим, итог в вечернем отчёте.")
    L = [head, "", text, ""] + account_section(acc, day_account(tr, day0, now, target=None))
    out = os.path.join(ROOT, "reports", "daily", f"{msk:%Y-%m-%d}_{acc['why']}{SUFFIX}.md")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w").write("\n".join(L))
    open(flag, "w").write(str(now))
    print(acc["why"].upper(), out)
    return out


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "update"
    if cmd == "check":
        check_stop()
    elif cmd == "daily":
        when = pd.Timestamp(sys.argv[2], tz="UTC") if len(sys.argv) > 2 else None
        print(daily(when))
    elif cmd == "report":
        when = pd.Timestamp(sys.argv[2], tz="UTC") if len(sys.argv) > 2 else None
        print(report(when))
    else:
        t, s = update()
        print(f"сделок в журнале: {len(t)}, схем: {len(s)}, исключено: {sum(v['status'] == 'excluded' for v in s.values())}")
