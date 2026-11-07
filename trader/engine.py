"""Движок демо-торговли: отыгрывает сигналы стратегий по свечам.

Правила честного теста:
- сигнал считается только на ЗАКРЫТОЙ свече, вход — по открытию следующей;
- из каждой сделки вычитается спред;
- если в одной свече задеты и стоп, и тейк — засчитывается стоп (худший случай);
- одновременно по одной стратегии и паре открыта максимум одна сделка;
- риск каждой сделки = $20: стоп = −$20, прибыль = $20 × (прибыль / размер стопа).
"""
import numpy as np
import pandas as pd

RISK_USD = 20.0
SPREAD_PIPS = {"EURUSD": 0.8, "GBPUSD": 1.2, "USDJPY": 1.0, "AUDUSD": 1.0,
               "USDCAD": 1.5, "USDCHF": 1.5, "NZDUSD": 1.5, "EURJPY": 1.5,
               "GBPJPY": 2.5, "EURGBP": 1.2}


def spread_mult(ts):
    """Ночью (ролловер 21–24 UTC) спред у брокеров в 2–4 раза шире."""
    h = ts.hour
    return 3.0 if h >= 21 else (1.5 if h < 1 else 1.0)


def pip(pair):
    return 0.01 if pair.endswith("JPY") else 0.0001


def simulate(pair, df, sig, exits=None, tf="15m", strategy=""):
    """df — свечи (open/high/low/close, индекс = время открытия свечи, UTC).
    sig — DataFrame, индекс как у df, колонки:
        dir (+1 покупка / −1 продажа / 0 нет сигнала),
        sl (расстояние до стопа в цене), tp (расстояние до тейка, NaN = без тейка),
        max_bars (выход по времени через N свечей).
        Необязательно: entry (цена отложенного ордера; NaN = вход по рынку
        на открытии следующей свечи) и valid (сколько свечей ордер ждёт).
        Если entry выше текущей цены для покупки — это buy stop, ниже — buy limit.
    exits — необязательно: dict {"long": bool Series, "short": bool Series} —
        выход по открытию следующей свечи, если условие выполнилось на закрытии.
    """
    o, h, l, c = (df[k].to_numpy(float) for k in ("open", "high", "low", "close"))
    t = df.index
    d = sig["dir"].reindex(t).fillna(0).to_numpy(int)
    sl = sig["sl"].reindex(t).to_numpy(float)
    tp = sig["tp"].reindex(t).to_numpy(float) if "tp" in sig else np.full(len(t), np.nan)
    mb = sig["max_bars"].reindex(t).fillna(10**9).to_numpy(float) if "max_bars" in sig else np.full(len(t), 1e9)
    ex_l = exits["long"].reindex(t).fillna(False).to_numpy(bool) if exits else None
    ex_s = exits["short"].reindex(t).fillna(False).to_numpy(bool) if exits else None
    base_spread = SPREAD_PIPS.get(pair, 2.0) * pip(pair)
    pend = sig["entry"].reindex(t).to_numpy(float) if "entry" in sig else np.full(len(t), np.nan)
    valid = sig["valid"].reindex(t).fillna(1).to_numpy(int) if "valid" in sig else np.ones(len(t), int)
    trades, i, n = [], 0, len(t)
    while i < n - 1:
        if d[i] == 0 or not np.isfinite(sl[i]) or sl[i] <= 0:
            i += 1
            continue
        side = d[i]
        if np.isfinite(pend[i]):
            # отложенный ордер: ждём касания цены entry в течение valid свечей
            lvl, e, entry = pend[i], None, None
            is_stop = side * (lvl - c[i]) > 0
            for k in range(i + 1, min(n, i + 1 + valid[i])):
                if is_stop and ((h[k] >= lvl) if side > 0 else (l[k] <= lvl)):
                    e, entry = k, (max(o[k], lvl) if side > 0 else min(o[k], lvl)); break
                if not is_stop and ((l[k] <= lvl) if side > 0 else (h[k] >= lvl)):
                    e, entry = k, (min(o[k], lvl) if side > 0 else max(o[k], lvl)); break
            if e is None:
                i += 1
                continue
        else:
            e = i + 1
            entry = o[e]
        spread = base_spread * spread_mult(t[e])
        if sl[i] < 3 * spread:  # стоп уже трёх спредов — спред съест всё
            i += 1
            continue
        stop = entry - side * sl[i]
        take = entry + side * tp[i] if np.isfinite(tp[i]) else np.nan
        last = int(min(n - 1, e + mb[i] - 1))
        exit_px, exit_i, why = None, None, None
        for j in range(e, last + 1):
            # гэп за стоп/тейк на открытии
            if side * (o[j] - stop) <= 0 and j > e:
                exit_px, exit_i, why = o[j], j, "stop"; break
            if np.isfinite(take) and side * (o[j] - take) >= 0 and j > e:
                exit_px, exit_i, why = o[j], j, "take"; break
            hit_stop = (l[j] <= stop) if side > 0 else (h[j] >= stop)
            hit_take = np.isfinite(take) and ((h[j] >= take) if side > 0 else (l[j] <= take))
            if hit_stop:
                exit_px, exit_i, why = stop, j, "stop"; break
            if hit_take:
                exit_px, exit_i, why = take, j, "take"; break
            if exits is not None and j < n - 1 and (ex_l[j] if side > 0 else ex_s[j]):
                exit_px, exit_i, why = o[j + 1], j + 1, "signal"; break
        if exit_px is None:
            if last == n - 1 and last < e + mb[i] - 1:
                break  # сделка ещё открыта — данных пока нет, не засчитываем
            exit_px, exit_i, why = c[last], last, "time"
        risk = sl[i]
        pnl = side * (exit_px - entry) - spread
        r = pnl / risk
        trades.append({
            "strategy": strategy, "pair": pair, "tf": tf,
            "dir": "BUY" if side > 0 else "SELL",
            "entry_time": t[e], "exit_time": t[exit_i],
            "entry": round(entry, 6), "stop": round(stop, 6),
            "take": round(take, 6) if np.isfinite(take) else None,
            "exit": round(exit_px, 6), "exit_reason": why,
            "pips": round(pnl / pip(pair), 1), "R": round(r, 3),
            "usd": round(r * RISK_USD, 2),
        })
        i = max(exit_i, e)  # новая сделка — только после выхода из текущей
    return pd.DataFrame(trades)


def stats(tr):
    """Сводка по сделкам: число, выигрыши/проигрыши, винрейт, деньги."""
    if tr is None or len(tr) == 0:
        return {"trades": 0, "wins": 0, "losses": 0, "winrate": 0.0, "won_usd": 0.0,
                "lost_usd": 0.0, "net_usd": 0.0, "pf": 0.0, "avg_r": 0.0, "max_dd_usd": 0.0}
    u = tr["usd"].astype(float)
    eq = u.cumsum()
    won, lost = u[u > 0].sum(), -u[u <= 0].sum()
    out = {
        "trades": int(len(u)), "wins": int((u > 0).sum()), "losses": int((u <= 0).sum()),
        "winrate": round(100 * (u > 0).mean(), 1),
        "won_usd": round(won, 2), "lost_usd": round(lost, 2), "net_usd": round(u.sum(), 2),
        "pf": round(won / lost, 2) if lost > 0 else float("inf"),
        "avg_r": round(tr["R"].mean(), 3),
        "max_dd_usd": round((eq.cummax() - eq).max(), 2),
    }
    return {k: (float(v) if not isinstance(v, int) else v) for k, v in out.items()}
