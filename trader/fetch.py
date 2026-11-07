"""Загрузка свечей валютных пар с Yahoo Finance и накопление в trader/data/.

Yahoo отдаёт 15-минутки только за последние 60 дней, поэтому каждый запуск
дописывает новые свечи к уже сохранённым — так история копится сама.
"""
import json, os, subprocess, sys, time
import pandas as pd

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data")
PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD",
         "EURJPY", "GBPJPY", "EURGBP"]
# интервал -> максимальный диапазон, который отдаёт Yahoo
RANGES = {"15m": "60d", "1h": "730d", "1d": "10y"}


def _get(url):
    for attempt in range(4):
        r = subprocess.run(["curl", "-sS", "-m", "60", "-A", "Mozilla/5.0", url],
                           capture_output=True, text=True)
        if r.returncode == 0 and r.stdout.startswith("{"):
            return json.loads(r.stdout)
        time.sleep(2 ** attempt)
    raise RuntimeError(f"не удалось скачать {url}: {r.stderr[:200]}")


def download(pair, interval):
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/{pair}=X"
           f"?interval={interval}&range={RANGES[interval]}")
    res = _get(url)["chart"]["result"][0]
    q = res["indicators"]["quote"][0]
    df = pd.DataFrame({k: q[k] for k in ("open", "high", "low", "close")},
                      index=pd.to_datetime(res["timestamp"], unit="s", utc=True))
    df.index.name = "time"
    df = df.dropna()
    df = df[(df.high >= df.low) & (df.open > 0)]
    # последняя свеча может быть ещё не закрыта — отбрасываем её
    if interval == "1d":
        df.index = df.index.normalize()
        df = df[(df.index.dayofweek < 5) & (df.index < pd.Timestamp.now(tz="UTC").normalize())]
    elif len(df):
        step = pd.Timedelta(interval.replace("m", "min"))
        if df.index[-1] + step > pd.Timestamp.now(tz="UTC"):
            df = df.iloc[:-1]
    return df


def path(pair, interval):
    return os.path.join(DATA, f"{pair}_{interval}.csv.gz")


def load(pair, interval):
    p = path(pair, interval)
    if not os.path.exists(p):
        return pd.DataFrame(columns=["open", "high", "low", "close"], dtype=float,
                            index=pd.DatetimeIndex([], tz="UTC", name="time"))
    df = pd.read_csv(p, index_col=0).astype(float)
    df.index = pd.to_datetime(df.index, utc=True, format="ISO8601")
    return df


def update(pairs=PAIRS, intervals=("15m", "1h", "1d")):
    os.makedirs(DATA, exist_ok=True)
    for interval in intervals:
        for pair in pairs:
            new = download(pair, interval)
            old = load(pair, interval)
            df = pd.concat([old, new])
            df = df[~df.index.duplicated(keep="last")].sort_index().astype(float)
            df.index.name = "time"
            df.round(6).to_csv(path(pair, interval))
            print(f"{pair} {interval}: {len(df)} свечей, {df.index[0]:%Y-%m-%d} … {df.index[-1]:%Y-%m-%d %H:%M}")


if __name__ == "__main__":
    import news
    try:
        news.update()  # заодно обновляем календарь новостей
    except Exception as e:
        print("новости не обновились:", e)
    update(intervals=tuple(sys.argv[1:]) or ("15m", "1h", "1d"))
