"""Индикаторы на pandas (все считаются по закрытым свечам)."""
import numpy as np
import pandas as pd


def ema(s, n): return s.ewm(span=n, adjust=False).mean()
def sma(s, n): return s.rolling(n).mean()


def rsi(s, n=14):
    d = s.diff()
    up = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    dn = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    return 100 - 100 / (1 + up / dn.replace(0, np.nan))


def atr(df, n=14):
    pc = df.close.shift()
    tr = pd.concat([df.high - df.low, (df.high - pc).abs(), (df.low - pc).abs()], axis=1).max(axis=1)
    return tr.ewm(alpha=1 / n, adjust=False).mean()


def adx(df, n=14):
    up, dn = df.high.diff(), -df.low.diff()
    pdm = up.where((up > dn) & (up > 0), 0.0)
    ndm = dn.where((dn > up) & (dn > 0), 0.0)
    a = atr(df, n)
    pdi = 100 * pdm.ewm(alpha=1 / n, adjust=False).mean() / a
    ndi = 100 * ndm.ewm(alpha=1 / n, adjust=False).mean() / a
    dx = 100 * (pdi - ndi).abs() / (pdi + ndi).replace(0, np.nan)
    return dx.ewm(alpha=1 / n, adjust=False).mean(), pdi, ndi


def bollinger(s, n=20, k=2.0):
    m, sd = sma(s, n), s.rolling(n).std(ddof=0)
    return m, m + k * sd, m - k * sd


def keltner(df, n=20, k=1.5):
    m = ema(df.close, n); a = atr(df, n)
    return m, m + k * a, m - k * a


def stoch(df, k=14, d=3, smooth=3):
    ll, hh = df.low.rolling(k).min(), df.high.rolling(k).max()
    kk = (100 * (df.close - ll) / (hh - ll).replace(0, np.nan)).rolling(smooth).mean()
    return kk, kk.rolling(d).mean()


def macd(s, f=12, sl=26, sig=9):
    m = ema(s, f) - ema(s, sl)
    return m, ema(m, sig)


def donchian(df, n=20):
    return df.high.rolling(n).max(), df.low.rolling(n).min()


def htf(df, rule, fn):
    """Значение со старшего таймфрейма без заглядывания в будущее:
    берём только полностью закрытые старшие свечи."""
    big = df.resample(rule, label="left", closed="left").agg(
        {"open": "first", "high": "max", "low": "min", "close": "last"}).dropna()
    val = fn(big).shift(1)  # значение последней ЗАКРЫТОЙ старшей свечи
    return val.reindex(df.index, method="ffill")
