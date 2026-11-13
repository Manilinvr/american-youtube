"""Библиотека торговых схем. Каждая — строгие правила, без «на глаз».

Функция схемы получает свечи df (индекс = время открытия свечи, UTC) и пару,
возвращает (sig, exits) для engine.simulate:
  sig: dir (+1/−1/0), sl, tp (расстояния в цене), max_bars
  exits: None или {"long": bool Series, "short": bool Series}

ВАЖНО: правила уже запущенной в демо схемы не меняются. Улучшенная версия
добавляется под новым id (например, rsi2_v2) со своей датой старта.
"""
import numpy as np
import pandas as pd
import indicators as I
from engine import pip

TF_MIN = {"15m": 15, "1h": 60, "1d": 1440}


def _tf(df):
    m = int((df.index[1:] - df.index[:-1]).to_series().mode().iloc[0].total_seconds() // 60)
    return m


def make(df, long_cond, short_cond, sl, tp, max_bars):
    d = pd.Series(0, index=df.index)
    d[long_cond.fillna(False).astype(bool)] = 1
    d[short_cond.fillna(False).astype(bool)] = -1
    def ser(x):
        return x if isinstance(x, pd.Series) else pd.Series(x, index=df.index, dtype=float)
    return pd.DataFrame({"dir": d, "sl": ser(sl), "tp": ser(tp), "max_bars": ser(max_bars)})


def hour(df):
    """Час свечи в UTC. Для дневок возвращает 12, чтобы сессионные фильтры
    (обычно 06–20 UTC) не отсекали все дневные сигналы."""
    if _tf(df) >= 1440:
        return pd.Index(np.full(len(df), 12.0))
    return df.index.hour + df.index.minute / 60


def first_per_day(cond, df):
    c = cond.fillna(False).astype(bool)
    return c & (c.groupby(df.index.normalize()).cumsum() == 1)


def bars_until(df, utc_hour):
    """Сколько свечей осталось до utc_hour (для выхода в конце сессии)."""
    m = _tf(df)
    left = (utc_hour - hour(df)) * 60 / m
    return pd.Series(np.maximum(left, 1), index=df.index)


def asian_range(df, start=0, end=6):
    h = df.index.hour
    asian = (h >= start) & (h < end)
    day = df.index.normalize()
    ah = df.high.where(asian).groupby(day).transform("max")
    al = df.low.where(asian).groupby(day).transform("min")
    valid = h >= end
    return ah.where(valid), al.where(valid)


# ---------------------------------------------------------------- схемы

def rsi2_meanrev(df, pair):
    """Ларри Коннорс: RSI(2) в тренде. Покупка сильного отката над EMA200."""
    r, e200, a = I.rsi(df.close, 2), I.ema(df.close, 200), I.atr(df)
    sma5 = I.sma(df.close, 5)
    sig = make(df, (df.close > e200) & (r < 10), (df.close < e200) & (r > 90),
               2.0 * a, np.nan, 20)
    return sig, {"long": df.close > sma5, "short": df.close < sma5}


def bb_fade_range(df, pair):
    """Возврат к средней Боллинджера во флэте (ADX < 20), цель — средняя линия."""
    m, up, lo = I.bollinger(df.close, 20, 2.0)
    ad, _, _ = I.adx(df)
    a = I.atr(df)
    flat = ad < 20
    lc = flat & (df.close < lo)
    sc = flat & (df.close > up)
    tp = (m - df.close).abs()
    sig = make(df, lc, sc, 1.5 * a + (lo - df.close).abs().where(lc, (df.close - up).abs()), tp, 16)
    return sig, None


def london_breakout(df, pair):
    """Пробой азиатского диапазона (00–06 UTC) в первые часы Лондона (07–10 UTC).
    Стоп — середина диапазона, цель — 1× ширина диапазона. Выход до 20 UTC."""
    ah, al = asian_range(df)
    rng = ah - al
    h = hour(df)
    win = (h >= 7) & (h < 10)
    a = I.atr(df)
    ok = win & (rng > 2 * a) & (rng < 12 * a)
    lc = first_per_day(ok & (df.close > ah), df)
    sc = first_per_day(ok & (df.close < al), df)
    sl = (df.close - (ah + al) / 2).abs()
    sig = make(df, lc, sc, sl, rng, bars_until(df, 20))
    # не больше одной сделки в день: убираем шорт, если уже был лонг, и наоборот
    both = first_per_day(lc | sc, df)
    sig.loc[~both, "dir"] = 0
    return sig, None


def asian_sweep_reversal(df, pair):
    """ICT/«Turtle Soup» по-сессионному: Лондон выносит хай/лоу Азии и
    закрывается обратно внутри → вход против выноса. Цель — середина Азии."""
    ah, al = asian_range(df)
    h = hour(df)
    win = (h >= 7) & (h < 11)
    a = I.atr(df)
    lc = win & (df.low < al) & (df.close > al)
    sc = win & (df.high > ah) & (df.close < ah)
    mid = (ah + al) / 2
    sl = pd.Series(np.where(lc, df.close - df.low + 0.3 * a, df.high - df.close + 0.3 * a), index=df.index)
    tp = (mid - df.close).abs()
    first = first_per_day(lc | sc, df)
    sig = make(df, lc & first, sc & first, sl, tp, bars_until(df, 20))
    sig.loc[(tp < 0.5 * sl), "dir"] = 0  # цель слишком близко — пропуск
    return sig, None


def ema_pullback(df, pair):
    """Тренд по EMA20/EMA50 + старший тренд (4 часа). Откат к EMA20 и
    закрытие обратно по тренду. Стоп 1.5 ATR, цель 1.5 ATR."""
    e20, e50, a = I.ema(df.close, 20), I.ema(df.close, 50), I.atr(df)
    big = I.htf(df, "4h", lambda b: (b.close > I.ema(b.close, 50)).astype(float))
    up = (e20 > e50) & (big == 1)
    dn = (e20 < e50) & (big == 0)
    lc = up & (df.low <= e20) & (df.close > e20) & (df.close > df.open)
    sc = dn & (df.high >= e20) & (df.close < e20) & (df.close < df.open)
    return make(df, lc, sc, 1.5 * a, 1.5 * a, 24), None


def stoch_pullback(df, pair):
    """Элдер «Три экрана» (упрощённо): старший тренд по 4-часовой EMA, вход по
    развороту стохастика из зоны 20/80. Цель 1 ATR, стоп 2 ATR (высокий винрейт)."""
    k, d = I.stoch(df)
    a = I.atr(df)
    big = I.htf(df, "4h", lambda b: (b.close > I.ema(b.close, 26)).astype(float))
    lc = (big == 1) & (k.shift() < 20) & (k > d) & (k.shift() <= d.shift())
    sc = (big == 0) & (k.shift() > 80) & (k < d) & (k.shift() >= d.shift())
    return make(df, lc, sc, 2.0 * a, 1.0 * a, 24), None


def turtle_soup(df, pair):
    """Рашке/Коннорс: ложный пробой 20-свечного минимума (максимума).
    Предыдущий экстремум старше 3 свечей, закрытие вернулось внутрь."""
    lo20, hi20 = df.low.rolling(20).min().shift(), df.high.rolling(20).max().shift()
    age_lo = df.low.rolling(20).apply(lambda x: 19 - np.argmin(x), raw=True).shift()
    age_hi = df.high.rolling(20).apply(lambda x: 19 - np.argmax(x), raw=True).shift()
    a = I.atr(df)
    lc = (df.low < lo20) & (df.close > lo20) & (age_lo >= 3)
    sc = (df.high > hi20) & (df.close < hi20) & (age_hi >= 3)
    sl = pd.Series(np.where(lc, df.close - df.low, df.high - df.close), index=df.index) + 0.2 * a
    return make(df, lc, sc, sl, 1.0 * sl, 12), None


def donchian_trend(df, pair):
    """Черепахи: пробой 20-свечного канала, стоп 2 ATR, выход по 10-свечному
    каналу в обратную сторону. Классика тренда: винрейт низкий, прибыль крупная."""
    hi20, lo20 = I.donchian(df, 20)
    hi10, lo10 = I.donchian(df, 10)
    a = I.atr(df, 20)
    lc = df.close > hi20.shift()
    sc = df.close < lo20.shift()
    return (make(df, lc, sc, 2.0 * a, np.nan, 200),
            {"long": df.close < lo10.shift(), "short": df.close > hi10.shift()})


def macd_ema200(df, pair):
    """Пересечение MACD в сторону тренда EMA200, ниже/выше нуля. Цель 1.5R."""
    m, s = I.macd(df.close)
    e200, a = I.ema(df.close, 200), I.atr(df)
    lc = (df.close > e200) & (m > s) & (m.shift() <= s.shift()) & (m < 0)
    sc = (df.close < e200) & (m < s) & (m.shift() >= s.shift()) & (m > 0)
    return make(df, lc, sc, 1.5 * a, 2.25 * a, 48), None


def holy_grail(df, pair):
    """Рашке «Holy Grail»: сильный тренд (ADX > 30), первый откат к EMA20 →
    вход по тренду. Цель 1R, стоп 1.5 ATR."""
    ad, pdi, ndi = I.adx(df)
    e20, a = I.ema(df.close, 20), I.atr(df)
    strong = ad > 30
    lc = strong & (pdi > ndi) & (df.low <= e20) & (df.close > e20)
    sc = strong & (ndi > pdi) & (df.high >= e20) & (df.close < e20)
    return make(df, lc, sc, 1.5 * a, 1.5 * a, 24), None


def inside_bar_breakout(df, pair):
    """Внутренний бар по тренду EMA50: вход на закрытии за пределами материнской
    свечи. Стоп — противоположный край материнской, цель 1.5R."""
    mh, ml = df.high.shift(2), df.low.shift(2)
    inside = (df.high.shift() < mh) & (df.low.shift() > ml)
    e50, a = I.ema(df.close, 50), I.atr(df)
    lc = inside & (df.close > mh) & (df.close > e50)
    sc = inside & (df.close < ml) & (df.close < e50)
    sl = pd.Series(np.where(lc, df.close - ml, mh - df.close), index=df.index)
    sl = sl.clip(lower=0.5 * a, upper=3 * a)
    return make(df, lc, sc, sl, 1.5 * sl, 24), None


def keltner_squeeze(df, pair):
    """Сжатие волатильности: Боллинджер внутри Кельтнера ≥ 6 свечей, затем
    закрытие за Кельтнером. Стоп 1.5 ATR, цель 2 ATR."""
    m, bu, bl = I.bollinger(df.close, 20, 2.0)
    km, ku, kl = I.keltner(df, 20, 1.5)
    sq = (bu < ku) & (bl > kl)
    was = sq.shift().rolling(6).sum() == 6
    a = I.atr(df)
    lc = was & (df.close > ku)
    sc = was & (df.close < kl)
    return make(df, lc, sc, 1.5 * a, 2.0 * a, 32), None



# ---------------------------------------------------------------- помощники для дневных уровней

def daily_levels(df):
    """Вчерашние H/L/C/O и сегодняшний open по дню UTC (00:00), без заглядывания вперёд."""
    day = df.index.normalize()
    g = df.groupby(day)
    dd = pd.DataFrame({"o": g.open.first(), "h": g.high.max(), "l": g.low.min(), "c": g.close.last()})
    prev = dd.shift(1)
    a = I.atr(dd.rename(columns={"o": "open", "h": "high", "l": "low", "c": "close"}), 14).shift(1)
    out = pd.DataFrame({"po": prev.o, "ph": prev.h, "pl": prev.l, "pc": prev.c, "today_o": dd.o, "atrd": a})
    for k in (2, 3):
        out[f"ph{k}"] = dd.h.shift(k); out[f"pl{k}"] = dd.l.shift(k); out[f"pc{k}"] = dd.c.shift(k)
    out["prng"] = prev.h - prev.l
    out["nr7"] = out.prng <= (dd.h - dd.l).rolling(7).min().shift(1)
    out["inside"] = (prev.h < dd.h.shift(2)) & (prev.l > dd.l.shift(2))
    return out.reindex(day).set_axis(df.index)


def day_so_far(df):
    day = df.index.normalize()
    return df.high.groupby(day).cummax(), df.low.groupby(day).cummin()


def htf_atr(df, rule="1h", n=14):
    return I.htf(df, rule, lambda b: I.atr(b, n))


def local_to_utc_hour(df, tz, local_hour):
    """Час local_hour по часовому поясу tz, переведённый в UTC для каждой свечи
    (учитывает летнее/зимнее время)."""
    off = df.index.tz_convert(tz).map(lambda ts: ts.utcoffset().total_seconds() / 3600)
    return pd.Series(local_hour - np.asarray(off, float), index=df.index)


def london_fix_hour(df):
    """Час WM/R фикса 16:00 по Лондону в UTC (15 летом, 16 зимой)."""
    return local_to_utc_hour(df, "Europe/London", 16)


def target_r(sig, r):
    out = sig.copy(); out["tp"] = out["sl"] * r; return out


# ---------------------------------------------------------------- стратегии из каталога исследователя

def rsi2_v06(df, pair):
    """Коннорс RSI(2) по спецификации каталога: стоп 1.5 ATR, цель 0.6R или
    закрытие выше SMA5, максимум 10 свечей, вход 07–20 UTC."""
    r, e200, a = I.rsi(df.close, 2), I.ema(df.close, 200), I.atr(df)
    sma5 = I.sma(df.close, 5)
    h = hour(df); ses = (h >= 7) & (h < 20)
    sig = make(df, ses & (df.close > e200) & (r < 10), ses & (df.close < e200) & (r > 90),
               1.5 * a, 0.9 * a, 10)
    return sig, {"long": df.close > sma5, "short": df.close < sma5}


def double7_meanrev(df, pair):
    """Коннорс «Двойная семёрка»: 7-свечной минимум закрытия над SMA200 →
    покупка, выход на 7-свечном максимуме, стоп 2 ATR, потолок 1R, 15 свечей."""
    s200, a = I.sma(df.close, 200), I.atr(df)
    mn7, mx7 = df.close.rolling(7).min(), df.close.rolling(7).max()
    h = hour(df); ses = (h >= 6) & (h < 20)
    sig = make(df, ses & (df.close > s200) & (df.close <= mn7), ses & (df.close < s200) & (df.close >= mx7),
               2.0 * a, 2.0 * a, 15)
    return sig, {"long": df.close >= mx7, "short": df.close <= mn7}


def bb_reentry_fade(df, pair):
    """Боллинджер: закрытие за полосой, затем возврат внутрь в тихом боковике
    (ADX<20, ширина ниже медианы). Цель — средняя линия, стоп за экстремумом."""
    m, up, lo = I.bollinger(df.close, 20, 2.0)
    ad, _, _ = I.adx(df); a = I.atr(df)
    width = (up - lo) / m
    quiet = (ad < 20) & (width < width.rolling(100).median())
    h = hour(df); ses = h < 20
    lc = quiet & ses & (df.close.shift() < lo.shift()) & (df.close > lo)
    sc = quiet & ses & (df.close.shift() > up.shift()) & (df.close < up)
    sl = pd.Series(np.where(lc, df.close - np.minimum(df.low, df.low.shift()) + 0.3 * a,
                            np.maximum(df.high, df.high.shift()) - df.close + 0.3 * a), index=df.index)
    tp = (m - df.close).abs()
    sig = make(df, lc, sc, sl, tp, 12)
    sig.loc[(sl > 2 * a) | (tp < 0.5 * sl), "dir"] = 0
    return sig, None


def asian_range_scalp(df, pair):
    """Ночной скальпер: 22:30–04:00 UTC, цена за Боллинджером и RSI(14) в
    крайней зоне в тихом рынке → возврат к средней. Только «европейские» пары."""
    if pair not in ("EURUSD", "GBPUSD", "EURGBP", "USDCHF", "USDCAD"):
        return make(df, df.close < 0, df.close < 0, 1.0, 1.0, 1), None
    m, up, lo = I.bollinger(df.close, 20, 2.0)
    r, a = I.rsi(df.close, 14), I.atr(df)
    calm = a < a.rolling(96 * 20, min_periods=500).quantile(0.6)
    adx1h = I.htf(df, "1h", lambda b: I.adx(b)[0])
    h = hour(df); dow = df.index.dayofweek
    win = ((h >= 22.5) | (h < 4)) & ~((dow == 0) & (h >= 22.5)) & ~((dow == 4) & (h >= 20)) & (dow != 6)
    ok = win & calm & (adx1h < 25)
    sl = np.maximum(1.2 * a, 8 * pip(pair))
    tp = np.minimum((m - df.close).abs(), 0.8 * sl)
    left = pd.Series(np.where(h >= 22, (24 - h + 6) * 4, (6 - h) * 4), index=df.index).clip(upper=16)
    return make(df, ok & (df.close < lo) & (r < 30), ok & (df.close > up) & (r > 70), sl, tp, left), None


def pivot_s1r1_fade(df, pair):
    """Отбой от дневных пивотов: касание S1/R1 с закрытием обратно, цель — P."""
    L = daily_levels(df)
    P = (L.ph + L.pl + L.pc) / 3
    R1, S1 = 2 * P - L.pl, 2 * P - L.ph
    R2, S2 = P + L.prng, P - L.prng
    a1 = htf_atr(df)
    h = hour(df); ses = (h >= 7) & (h < 16)
    inside_open = (L.today_o > S1) & (L.today_o < R1)
    lc = ses & inside_open & (df.low <= S1) & (df.close > S1) & (df.low > S2)
    sc = ses & inside_open & (df.high >= R1) & (df.close < R1) & (df.high < R2)
    sl = pd.Series(np.where(lc, df.close - (S1 - 0.5 * a1), (R1 + 0.5 * a1) - df.close), index=df.index)
    tp = np.minimum((P - df.close).abs(), sl)
    sig = make(df, first_per_day(lc, df), first_per_day(sc, df), sl, tp, np.minimum(24, bars_until(df, 20)))
    sig.loc[tp < 0.5 * sl, "dir"] = 0
    return sig, None


def round_number_fade(df, pair):
    """Остлер: отбой от круглых уровней (кратных 50 пунктам) при первом за
    сутки подходе. Стоп за уровнем, цель 0.7R."""
    p = pip(pair)
    step = 50 * p
    a = I.atr(df)
    adx1h = I.htf(df, "1h", lambda b: I.adx(b)[0])
    lvl_dn = np.floor(df.close / step) * step          # уровень под ценой
    lvl_up = lvl_dn + step                              # уровень над ценой
    nb = 96 if _tf(df) == 15 else 24
    h = hour(df); ses = (h >= 7) & (h < 20)
    min_low = df.low.shift().rolling(nb).min()
    max_high = df.high.shift().rolling(nb).max()
    lc = ses & (adx1h < 30) & (df.low <= lvl_dn + 2 * p) & (df.low >= lvl_dn - 3 * p) & (df.close >= lvl_dn + 2 * p) & (min_low > lvl_dn)
    sc = ses & (adx1h < 30) & (df.high >= lvl_up - 2 * p) & (df.high <= lvl_up + 3 * p) & (df.close <= lvl_up - 2 * p) & (max_high < lvl_up)
    stop_d = np.maximum(10 * p, 0.6 * a)
    sl = pd.Series(np.where(lc, df.close - lvl_dn + stop_d, lvl_up - df.close + stop_d), index=df.index)
    return make(df, lc, sc, sl, 0.7 * sl, 12), None


def fix_reversal(df, pair):
    """Крон, Мюллер, Уилан (J. Finance 2024): доллар дорожает перед лондонским
    фиксом 16:00 и дешевеет после. Если за 2 часа до фикса доллар сильно вырос —
    после фикса продаём доллар (и наоборот). Цель — половина движения."""
    if _tf(df) != 15 or not pair.endswith("USD") and not pair.startswith("USD"):
        return make(df, df.close < 0, df.close < 0, 1.0, 1.0, 1), None
    fh = london_fix_hour(df)
    h = hour(df)
    a1 = htf_atr(df)
    usd_base = pair.startswith("USD")
    open_2h = df.open.shift(8)
    move = df.close - open_2h                     # движение пары за 2 часа до фикса
    usd_move = move if usd_base else -move        # движение доллара
    at_fix = h == fh - 0.25                       # свеча 15:45–16:00 по Лондону — закрытие на фиксе
    big = usd_move.abs() > 0.5 * a1
    # доллар вырос → продаём доллар: для USDxxx это SELL, для xxxUSD — BUY
    sell_usd = at_fix & big & (usd_move > 0)
    buy_usd = at_fix & big & (usd_move < 0)
    lc = sell_usd if not usd_base else buy_usd
    sc = buy_usd if not usd_base else sell_usd
    tp = np.minimum(0.5 * move.abs(), a1)
    return make(df, lc, sc, a1, tp, 12), None


def lien_fader(df, pair):
    """Кэти Лин «Фейдер»: пробой вчерашнего хая на 0.15 дневного ATR, затем
    15-минутка закрывается обратно под хаем → продажа. Цель 1R."""
    L = daily_levels(df)
    dd = df.resample("1D").agg({"open": "first", "high": "max", "low": "min", "close": "last"}).dropna()
    dadx = I.adx(dd)[0]
    rng_ok = ((dadx < 35) & (dadx < dadx.shift())).shift(1).reindex(df.index.normalize()).set_axis(df.index)
    hi, lo = day_so_far(df)
    h = hour(df); ses = (h >= 7) & (h < 16)
    sc = ses & rng_ok.fillna(False) & (hi > L.ph + 0.15 * L.atrd) & (df.close < L.ph)
    lc = ses & rng_ok.fillna(False) & (lo < L.pl - 0.15 * L.atrd) & (df.close > L.pl)
    sl = pd.Series(np.where(sc, hi + 0.05 * L.atrd - df.close, df.close - (lo - 0.05 * L.atrd)), index=df.index)
    f = first_per_day(lc | sc, df)
    return make(df, lc & f, sc & f, sl, sl, bars_until(df, 20)), None


def raschke_8020(df, pair):
    """Рашке «80-20»: вчера открылись у хая и закрылись у лоу (широкий день);
    сегодня цена проколола вчерашний лоу и вернулась → покупка. Цель 1R."""
    L = daily_levels(df)
    pos_o = (L.po - L.pl) / L.prng
    pos_c = (L.pc - L.pl) / L.prng
    wide = L.prng >= 0.7 * L.atrd
    bull_setup = wide & (pos_o >= 0.8) & (pos_c <= 0.2)
    bear_setup = wide & (pos_o <= 0.2) & (pos_c >= 0.8)
    hi, lo = day_so_far(df)
    h = hour(df); win = h < 14
    lc = win & bull_setup & (lo < L.pl - 0.05 * L.atrd) & (df.close > L.pl)
    sc = win & bear_setup & (hi > L.ph + 0.05 * L.atrd) & (df.close < L.ph)
    sl = pd.Series(np.where(lc, df.close - (lo - 0.05 * L.atrd), (hi + 0.05 * L.atrd) - df.close), index=df.index)
    f = first_per_day(lc | sc, df)
    return make(df, lc & f, sc & f, sl, sl, bars_until(df, 20)), None


def nr7_inside_breakout(df, pair):
    """Крэбел NR7 / внутренний день: вчера был самый узкий день за 7 дней или
    внутренний день → торгуем пробой его границ с 07:00 UTC. Цель 1R."""
    L = daily_levels(df)
    setup = (L.nr7 | L.inside).fillna(False).astype(bool)
    h = hour(df); win = (h >= 7) & (h < 16)
    lc = win & setup & (df.close > L.ph + 0.05 * L.atrd)
    sc = win & setup & (df.close < L.pl - 0.05 * L.atrd)
    mid = (L.ph + L.pl) / 2
    far = L.prng > 0.8 * L.atrd
    sl = pd.Series(np.where(lc, df.close - np.where(far, mid, L.pl), np.where(far, mid, L.ph) - df.close), index=df.index)
    f = first_per_day(lc | sc, df)
    return make(df, lc & f, sc & f, sl, sl, bars_until(df, 21)), None


def ny_orb(df, pair):
    """Пробой диапазона открытия Нью-Йорка: первые 30 минут с 12:00 UTC (лето) /
    13:00 (зима), только по направлению дня. Стоп — другая граница, цель 1.5R."""
    if _tf(df) != 15:
        return make(df, df.close < 0, df.close < 0, 1.0, 1.0, 1), None
    start = local_to_utc_hour(df, "America/New_York", 8)  # 8:00 по Нью-Йорку в UTC
    h = hour(df); day = df.index.normalize()
    in_or = (h >= start) & (h < start + 0.5)
    orh = df.high.where(in_or).groupby(day).transform("max")
    orl = df.low.where(in_or).groupby(day).transform("min")
    after = (h >= start + 0.5) & (h < start + 3)
    L = daily_levels(df)
    up_day = df.close > L.today_o
    a = I.atr(df)
    lc = after & up_day & (df.close > orh + 0.05 * a)
    sc = after & ~up_day & (df.close < orl - 0.05 * a)
    sl = pd.Series(np.where(lc, df.close - orl, orh - df.close), index=df.index)
    f = first_per_day(lc | sc, df)
    sig = make(df, lc & f, sc & f, sl, 1.5 * sl, bars_until(df, 19))
    sig.loc[(orh - orl) > 0.6 * L.atrd, "dir"] = 0
    return sig, None


def williams_vol_breakout(df, pair):
    """Ларри Уильямс: пробой от открытия дня на 0.6 вчерашнего диапазона.
    Стоп 0.5 диапазона, цель 1R, выход в конце дня."""
    L = daily_levels(df)
    bu, bd = L.today_o + 0.6 * L.prng, L.today_o - 0.6 * L.prng
    lc = (df.close > bu)
    sc = (df.close < bd)
    f = first_per_day(lc | sc, df)
    return make(df, lc & f, sc & f, 0.5 * L.prng, 0.5 * L.prng, bars_until(df, 21)), None


def lien_double_bb(df, pair):
    """Кэти Лин «Двойные Боллинджеры»: закрытие в зоне между 1σ и 2σ по
    тренду (ADX>20). Стоп за средней линией, цель 2R."""
    m, u1, l1 = I.bollinger(df.close, 20, 1.0)
    a = I.atr(df); ad = I.adx(df)[0]
    above = (df.close >= m).rolling(3).sum() >= 2
    below = (df.close <= m).rolling(3).sum() >= 2
    lc = (ad > 20) & (df.close > u1) & (df.close.shift() <= u1.shift()) & above
    sc = (ad > 20) & (df.close < l1) & (df.close.shift() >= l1.shift()) & below
    sl = pd.Series(np.where(lc, df.close - (m - 0.25 * a), (m + 0.25 * a) - df.close), index=df.index)
    sig = make(df, lc, sc, sl, 2 * sl, 40)
    sig.loc[sl > 2.5 * a, "dir"] = 0
    return sig, None


def elder_triple_screen(df, pair):
    """Элдер «Три экрана» по каталогу: 4h EMA26 и гистограмма MACD растут,
    стохастик(5) на текущем ТФ < 30, вход стоп-ордером над хаем свечи. Цель 1.5R."""
    def tide(b):
        e = I.ema(b.close, 26); mm, ss = I.macd(b.close); hist = mm - ss
        return np.sign((e > e.shift()).astype(int) + (hist > hist.shift()).astype(int) - 1)
    t4 = I.htf(df, "4h", tide)
    k, d = I.stoch(df, 5, 3, 3)
    a = I.atr(df)
    h = hour(df); ses = (h >= 6) & (h < 20)
    lc = ses & (t4 > 0) & (k < 30)
    sc = ses & (t4 < 0) & (k > 70)
    entry = pd.Series(np.where(lc, df.high + 0.0, df.low - 0.0), index=df.index)
    sl = pd.Series(np.where(lc, entry - np.minimum(df.low, df.low.shift()) + 0.1 * a,
                            np.maximum(df.high, df.high.shift()) + 0.1 * a - entry), index=df.index)
    sl = np.maximum(sl, 0.8 * a)
    sig = make(df, lc, sc, sl, 1.5 * sl, 24)
    sig["entry"] = entry; sig["valid"] = 1
    return sig, None


def stoch_pullback_a(df, pair):
    """Стохастик-откат по каталогу (вариант A, высокий винрейт): EMA50>EMA200
    и 4h выше EMA50, %K пересекает %D из зоны <20. Стоп 1.5 ATR, цель 0.7R."""
    k, d = I.stoch(df)
    e50, e200, a = I.ema(df.close, 50), I.ema(df.close, 200), I.atr(df)
    big = I.htf(df, "4h", lambda b: (b.close > I.ema(b.close, 50)).astype(float))
    h = hour(df); ses = (h >= 6) & (h < 20)
    cu = (k > d) & (k.shift() <= d.shift()) & (k.shift() < 20) & (d.shift() < 20)
    cd = (k < d) & (k.shift() >= d.shift()) & (k.shift() > 80) & (d.shift() > 80)
    lc = ses & (e50 > e200) & (big == 1) & cu
    sc = ses & (e50 < e200) & (big == 0) & cd
    return make(df, lc, sc, 1.5 * a, 1.05 * a, 16), None


def brooks_h2(df, pair):
    """Ал Брукс «High 2»: в тренде над EMA20 второй за откат бар с хаем выше
    предыдущего → вход стоп-ордером над сигнальной свечой. Стоп под ней, цель 1R."""
    e20, a = I.ema(df.close, 20), I.atr(df)
    trend_up = ((df.close > e20).rolling(20).sum() >= 15) & (e20 > e20.shift(5))
    trend_dn = ((df.close < e20).rolling(20).sum() >= 15) & (e20 < e20.shift(5))
    hh = (df.high > df.high.shift()).astype(int)
    ll = (df.low < df.low.shift()).astype(int)
    # счётчик «попыток вверх» внутри отката: сбрасываем, когда делается новый 10-свечной хай
    new_hi = df.high >= df.high.rolling(10).max()
    new_lo = df.low <= df.low.rolling(10).min()
    grp_u = new_hi.cumsum(); grp_d = new_lo.cumsum()
    cnt_u = hh.where(~new_hi, 0).groupby(grp_u).cumsum()
    cnt_d = ll.where(~new_lo, 0).groupby(grp_d).cumsum()
    bull_bar = (df.close > df.open) & (df.close > (df.high + df.low) / 2)
    bear_bar = (df.close < df.open) & (df.close < (df.high + df.low) / 2)
    h = hour(df); ses = (h >= 7) & (h < 17)
    lc = ses & trend_up & (cnt_u == 2) & (hh == 1) & bull_bar & (df.low > e20 - a)
    sc = ses & trend_dn & (cnt_d == 2) & (ll == 1) & bear_bar & (df.high < e20 + a)
    entry = pd.Series(np.where(lc, df.high, df.low), index=df.index)
    sl = pd.Series(np.where(lc, entry - df.low, df.high - entry), index=df.index) + 0.1 * a
    sig = make(df, lc, sc, sl, sl, 12)
    sig["entry"] = entry; sig["valid"] = 1
    sig.loc[sl > 1.2 * a, "dir"] = 0
    return sig, None


def fvg_retrace(df, pair):
    """ICT fair value gap: сильная свеча (тело > 1.5 ATR) с разрывом между
    1-й и 3-й свечой и сломом структуры → лимит-ордер в середину разрыва.
    Стоп за первой свечой, цель 2R. Только Лондон и Нью-Йорк."""
    a = I.atr(df)
    b1h, b1l = df.high.shift(2), df.low.shift(2)
    b2o, b2c = df.open.shift(), df.close.shift()
    body = (b2c - b2o).abs()
    disp = body > 1.5 * a.shift()
    hh10 = df.high.shift(2).rolling(10).max()
    ll10 = df.low.shift(2).rolling(10).min()
    e50 = I.htf(df, "1h", lambda b: (b.close > I.ema(b.close, 50)).astype(float))
    h = hour(df); kz = ((h >= 6) & (h < 10)) | ((h >= 12) & (h < 15))
    bull = kz & disp & (b2c > b2o) & (df.low > b1h) & (b2c > hh10) & (e50 == 1)
    bear = kz & disp & (b2c < b2o) & (df.high < b1l) & (b2c < ll10) & (e50 == 0)
    entry = pd.Series(np.where(bull, b1h + 0.5 * (df.low - b1h), b1l - 0.5 * (b1l - df.high)), index=df.index)
    sl = pd.Series(np.where(bull, entry - b1l, b1h - entry), index=df.index) + 0.1 * a
    sig = make(df, bull, bear, sl, 2 * sl, 16)
    sig["entry"] = entry; sig["valid"] = 8
    return sig, None


def turtle_soup_06(df, pair):
    """Turtle Soup с целью 0.6R (вариант каталога под высокий винрейт)."""
    sig, ex = turtle_soup(df, pair)
    return target_r(sig, 0.6), ex


def london_breakout_stop(df, pair):
    """Пробой Азии стоп-ордером по Лин: уровень на 10% ширины за границей,
    стоп — середина диапазона, цель 1R, закрытие в 16:00 UTC."""
    ah, al = asian_range(df)
    rng = ah - al
    L = daily_levels(df)
    h = hour(df)
    win = (h >= 6) & (h < 10)
    ok = win & (rng > 0.25 * L.atrd) & (rng < 0.8 * L.atrd)
    bu, bd = ah + 0.1 * rng, al - 0.1 * rng
    lc = ok & (df.close < bu) & (df.close > (ah + al) / 2)   # ближе к верху — ставим buy stop
    sc = ok & (df.close > bd) & (df.close <= (ah + al) / 2)
    f = first_per_day(lc | sc, df)  # один ордер в день, ждёт до 10:00 UTC
    entry = pd.Series(np.where(lc, bu, bd), index=df.index)
    sl = pd.Series(np.where(lc, bu - (ah + al) / 2, (ah + al) / 2 - bd), index=df.index)
    sig = make(df, lc & f, sc & f, sl, sl, bars_until(df, 16))
    sig["entry"] = entry; sig["valid"] = bars_until(df, 10).astype(int)
    return sig, None


# ---------------------------------------------------------------- выходное исследование 14.11 (research/weekend_ideas_2026-11-14.md)

def _overshoot(df, pair, follow=False):
    r = np.log(df.close / df.open)
    sd = r.rolling(480 if _tf(df) == 15 else 120, min_periods=100).std().shift()
    z = r / sd
    a = I.atr(df).shift()
    rng = df.high - df.low
    pos = (df.close - df.low) / rng.replace(0, np.nan)
    h = hour(df)
    ok = (z.abs() >= 3.0) & (rng >= 2.0 * a) & (rng < 3.0 * a) & (h >= 7) & (h < 19.75)
    bull = ok & (z > 0) & (pos <= 0.85)
    bear = ok & (z < 0) & (pos >= 0.15)
    lc, sc = (bull, bear) if follow else (bear, bull)
    return make(df, lc, sc, a, a, 4), None


def overshoot_fade(df, pair):
    """Откат после «перелёта»: одиночная свеча |z| ≥ 3 и размах 2–3 ATR, без новости → ставка против неё."""
    return _overshoot(df, pair)


def overshoot_follow(df, pair):
    """КОНТРОЛЬ к overshoot_fade: та же свеча, ставка ПО направлению. Если «работает» и он — это шум."""
    return _overshoot(df, pair, follow=True)


def monday_gap_fade(df, pair):
    """Закрытие разрыва выходных: |открытие недели − закрытие пятницы| ≥ 0.35 дневного ATR (но < 1.5),
    к 07:00 UTC понедельника не закрыт → ставка в сторону закрытия разрыва (вход 07:00 UTC)."""
    t = df.index
    week = (t - pd.to_timedelta((t.dayofweek + 1) % 7, unit="D")).normalize()  # неделя с воскресенья
    first = ~week.duplicated()
    o_week = pd.Series(np.where(first, df.open, np.nan), index=t).groupby(week).transform("first")
    c_prev = df.close.shift().where(first).groupby(week).transform("first")
    L = daily_levels(df)
    gap = o_week - c_prev
    lo_since = df.low.groupby(week).cummin()
    hi_since = df.high.groupby(week).cummax()
    m = _tf(df)
    sig_bar = (t.dayofweek == 0) & (hour(df) == 7 - m / 60)
    big = (gap.abs() >= 0.35 * L.atrd) & (gap.abs() < 1.5 * L.atrd)
    lc = sig_bar & big & (gap < 0) & (hi_since < c_prev)
    sc = sig_bar & big & (gap > 0) & (lo_since > c_prev)
    a = I.atr(df)
    return make(df, lc, sc, a, a, 4), None


def stretch_session_fade(df, pair):
    """Откат от «растянутого» дня в американскую сессию: размах дня ≥ 1.1 ADR, движение от открытия ≥ 0.8 ADR,
    цена в крайних 25% диапазона, 1h RSI(14) > 70 / < 30 → против движения дня (сигналы 14:45–16:45 UTC)."""
    day = df.index.normalize()
    g = df.groupby(day)
    dd = pd.DataFrame({"h": g.high.max(), "l": g.low.min()})
    adr = (dd.h - dd.l).rolling(20).mean().shift().reindex(day).set_axis(df.index)
    hi, lo = day_so_far(df)
    o_day = df.open.groupby(day).transform("first")
    mv = df.close - o_day
    rngd = hi - lo
    posd = (df.close - lo) / rngd.replace(0, np.nan)
    rsi1h = I.htf(df, "1h", lambda b: I.rsi(b.close, 14))
    h = hour(df)
    win = (h >= 14.75) & (h <= 16.75)
    base = win & (rngd >= 1.1 * adr) & (mv.abs() >= 0.8 * adr)
    sc = base & (mv > 0) & (posd >= 0.75) & (rsi1h > 70)
    lc = base & (mv < 0) & (posd <= 0.25) & (rsi1h < 30)
    a = I.atr(df)
    f = first_per_day(lc | sc, df)
    return make(df, lc & f, sc & f, a, a, 4), None

REGISTRY = {}


def reg(fn, name, tf="15m", test_tfs=("15m", "1h"), source="", models=("binary", "cfd"), control=False):
    REGISTRY[fn.__name__] = {"id": fn.__name__, "fn": fn, "name": name, "tf": tf,
                             "test_tfs": list(test_tfs), "source": source,
                             "models": list(models), "control": control}


reg(rsi2_meanrev, "RSI(2) откат в тренде", test_tfs=("15m", "1h", "1d"), source="L. Connors, Short Term Trading Strategies That Work")
reg(bb_fade_range, "Возврат к середине Боллинджера во флэте", source="J. Bollinger, Bollinger on Bollinger Bands")
reg(london_breakout, "Пробой Азии на открытии Лондона", test_tfs=("15m", "1h"), source="K. Lien, Day Trading and Swing Trading the Currency Market")
reg(asian_sweep_reversal, "Ложный вынос Азии в Лондон", test_tfs=("15m", "1h"), source="ICT / Raschke-Connors Turtle Soup")
reg(ema_pullback, "Откат к EMA20 по тренду", source="классика тренд-следования")
reg(stoch_pullback, "Три экрана Элдера (стохастик)", source="A. Elder, Trading for a Living")
reg(turtle_soup, "Turtle Soup (ложный пробой)", test_tfs=("15m", "1h", "1d"), source="L. Raschke & L. Connors, Street Smarts")
reg(donchian_trend, "Черепахи: пробой канала 20", test_tfs=("15m", "1h", "1d"), source="R. Dennis / C. Faith, Way of the Turtle")
reg(macd_ema200, "MACD + EMA200", source="G. Appel; популярная схема")
reg(holy_grail, "Holy Grail Рашке", test_tfs=("15m", "1h", "1d"), source="L. Raschke & L. Connors, Street Smarts")
reg(inside_bar_breakout, "Внутренний бар по тренду", source="price action (Al Brooks, N. Fuller)")
reg(keltner_squeeze, "Сжатие Боллинджер/Кельтнер", source="J. Carter, Mastering the Trade")

reg(rsi2_v06, "RSI(2) Коннорса, цель 0.6R", test_tfs=("15m", "1h"), source="Connors & Alvarez, Short Term Trading Strategies That Work")
reg(double7_meanrev, "Двойная семёрка Коннорса", test_tfs=("15m", "1h", "1d"), source="Connors & Alvarez, Short Term Trading Strategies That Work")
reg(bb_reentry_fade, "Возврат внутрь Боллинджера", test_tfs=("15m", "1h"), source="J. Bollinger, Bollinger on Bollinger Bands")
reg(asian_range_scalp, "Ночной скальпер (Азия)", test_tfs=("15m",), source="MQL5/ForexFactory night scalpers; Ito & Hashimoto 2006")
reg(pivot_s1r1_fade, "Отбой от пивотов S1/R1", test_tfs=("15m", "1h"), source="Murphy; K. Lien")
reg(round_number_fade, "Отбой от круглых уровней", test_tfs=("15m", "1h"), source="C. Osler, FRBNY 2000; J. Finance 2003")
reg(fix_reversal, "Разворот доллара после лондонского фикса", test_tfs=("15m",), source="Krohn, Mueller & Whelan, J. Finance 2024")
reg(lien_fader, "Фейдер Кэти Лин", test_tfs=("15m", "1h"), source="K. Lien, Day Trading and Swing Trading the Currency Market")
reg(raschke_8020, "80-20 Рашке", test_tfs=("15m", "1h"), source="Raschke & Connors, Street Smarts")
reg(nr7_inside_breakout, "Пробой узкого дня NR7", test_tfs=("15m", "1h"), source="T. Crabel, Day Trading with Short Term Price Patterns")
reg(ny_orb, "Пробой открытия Нью-Йорка", test_tfs=("15m",), source="Crabel; Zarattini & Aziz 2023")
reg(williams_vol_breakout, "Пробой волатильности Уильямса", test_tfs=("15m", "1h"), source="L. Williams, Long-Term Secrets to Short-Term Trading")
reg(lien_double_bb, "Двойные Боллинджеры Лин", test_tfs=("15m", "1h", "1d"), source="K. Lien")
reg(elder_triple_screen, "Три экрана Элдера (по каталогу)", test_tfs=("15m", "1h"), source="A. Elder, The New Trading for a Living")
reg(stoch_pullback_a, "Стохастик-откат, цель 0.7R", test_tfs=("15m", "1h"), source="G. Lane; J. Murphy")
reg(brooks_h2, "High 2 Ала Брукса", test_tfs=("15m", "1h"), source="Al Brooks, Trading Price Action: Trends")
reg(fvg_retrace, "ICT: ретест fair value gap", test_tfs=("15m", "1h"), source="ICT / Smart Money Concepts")
reg(turtle_soup_06, "Turtle Soup, цель 0.6R", test_tfs=("15m", "1h", "1d"), source="Raschke & Connors, Street Smarts")
reg(london_breakout_stop, "Пробой Азии стоп-ордером (Лин)", test_tfs=("15m", "1h"), source="K. Lien")

reg(overshoot_fade, "Откат после перелёта (без новости)", test_tfs=("15m", "1h"), source="Xiao et al. 2020; Krohn et al.; weekend_ideas N1", models=("binary",))
reg(overshoot_follow, "КОНТРОЛЬ: по направлению перелёта", test_tfs=("15m", "1h"), source="контроль к overshoot_fade", models=("binary",), control=True)
reg(monday_gap_fade, "Закрытие разрыва выходных", test_tfs=("15m", "1h"), source="Dao, McGroarty & Urquhart; weekend_ideas N5", models=("binary",))
reg(stretch_session_fade, "Откат растянутого дня в сессию США", test_tfs=("15m",), source="Krohn et al. 2024; weekend_ideas N6", models=("binary",))
