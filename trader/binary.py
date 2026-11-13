"""Бинарные опционы (Pocket Option): ставка «вверх/вниз» на фиксированное время.

- Сигнал на закрытой свече → покупка опциона по открытию следующей свечи.
  Отложенный вход (если у схемы есть entry) — по закрытию свечи, где цена дошла до уровня.
- Исход определяется ценой закрытия через ровно N минут (экспирация).
  Выше цены входа для CALL (ниже для PUT) — выигрыш: +ставка × выплата.
  Иначе — проигрыш: −ставка. Ровно по цене входа — возврат ставки (0).
- Торгуем только пары с выплатой ≥ min_payout (pocketoption.json), только
  будни (не OTC) и только когда весь срок опциона не задевает окно
  ±30 мин вокруг важной новости по валютам пары.
- Одна открытая ставка на схему и пару одновременно.
"""
import json, os
import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.abspath(__file__))
CFG = json.load(open(os.path.join(ROOT, "pocketoption.json")))
NEWS_WIN = pd.Timedelta("30min")
_TH = CFG.get("trading_hours_msk") or {}
HOURS_FROM = pd.Timestamp(_TH["from"], tz="Europe/Moscow").value if _TH.get("from") else None
HOURS_OK = set(_TH.get("allowed", range(24)))


def hour_allowed(t_ns):
    """С даты trading_hours_msk.from — входы только в разрешённые часы по Москве."""
    if HOURS_FROM is None or t_ns < HOURS_FROM:
        return True
    return pd.Timestamp(t_ns, tz="UTC").tz_convert("Europe/Moscow").hour in HOURS_OK


def payout(pair):
    return CFG["payouts"].get(pair, 0.0)


def allowed(pair):
    return payout(pair) >= CFG["min_payout"]


def simulate(pair, df, sig, tf, expiry_min, strategy="", events=None):
    stake, pay = float(CFG["stake_usd"]), payout(pair)
    step = pd.Timedelta(tf.replace("m", "min"))
    exp = pd.Timedelta(minutes=expiry_min)
    nb = int(exp / step)  # сколько свечей длится опцион
    o, h, l, c = (df[k].to_numpy(float) for k in ("open", "high", "low", "close"))
    t = df.index
    tns = t.as_unit("ns").asi8
    d = sig["dir"].reindex(t).fillna(0).to_numpy(int)
    pend = sig["entry"].reindex(t).to_numpy(float) if "entry" in sig else np.full(len(t), np.nan)
    valid = sig["valid"].reindex(t).fillna(1).to_numpy(int) if "valid" in sig else np.ones(len(t), int)
    ev = np.sort(events.as_unit("ns").asi8) if events is not None and len(events) else np.array([], dtype=np.int64)
    out, i, n, busy_until = [], 0, len(t), -1
    while i < n - 1:
        side = d[i]
        if side == 0 or i < busy_until:
            i += 1
            continue
        if np.isfinite(pend[i]):
            lvl, e = pend[i], None
            is_stop = side * (lvl - c[i]) > 0
            for k in range(i + 1, min(n, i + 1 + valid[i])):
                hit = ((h[k] >= lvl) if side > 0 else (l[k] <= lvl)) if is_stop else ((l[k] <= lvl) if side > 0 else (h[k] >= lvl))
                if hit:
                    e = k; break
            if e is None:
                i += 1; continue
            t_in, px_in, x = tns[e] + step.value, c[e], e + nb       # вход на закрытии свечи касания
        else:
            e = i + 1
            t_in, px_in, x = tns[e], o[e], e + nb - 1                # вход на открытии следующей свечи
        if x >= n:
            break  # опцион ещё не истёк — ждём данных
        t_out = t_in + exp.value
        if tns[x] + step.value != t_out:   # дыра в данных (выходные/пропуск) — пропускаем
            i += 1; continue
        if pd.Timestamp(t_in, tz="UTC").dayofweek >= 5:   # выходные = только OTC — не торгуем
            i += 1; continue
        if not hour_allowed(t_in):                         # нерабочий час (решение владельца)
            i += 1; continue
        if len(ev):  # срок опциона пересекает окно новости
            j = np.searchsorted(ev, t_in - NEWS_WIN.value)
            if j < len(ev) and ev[j] <= t_out + NEWS_WIN.value:
                i += 1; continue
        px_out = c[x]
        move = side * (px_out - px_in)
        usd = stake * pay if move > 0 else (0.0 if move == 0 else -stake)
        out.append({"strategy": strategy, "pair": pair, "tf": tf, "expiry_min": expiry_min,
                    "dir": "CALL" if side > 0 else "PUT",
                    "entry_time": pd.Timestamp(t_in, tz="UTC"), "exit_time": pd.Timestamp(t_out, tz="UTC"),
                    "entry": round(px_in, 6), "exit": round(px_out, 6),
                    "exit_reason": "win" if move > 0 else ("tie" if move == 0 else "loss"),
                    "payout": pay, "usd": round(usd, 2), "R": round(usd / stake, 3)})
        busy_until = x + 1
        i = max(i + 1, e)
    return pd.DataFrame(out)
