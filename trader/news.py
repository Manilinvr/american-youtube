"""Календарь важных новостей и новостной фильтр.

Источники:
- ForexFactory (открытая лента nfs.faireconomy.media) — важные (High) новости
  текущей недели; каждый запуск дописывает их в data/news.csv, так копится история.
- Для прошлого (до начала сбора): заседания ФРС с federalreserve.gov (14:00 по
  Нью-Йорку) и отчёт по занятости США NFP (первая пятница месяца, 8:30 по Нью-Йорку).

Правила фильтра (применяются ко всем схемам):
- не открывать сделку за 30 мин до и 30 мин после важной новости по валютам пары;
- закрыть открытую сделку за 15 мин до важной новости;
- не входить, если сигнальная свеча больше 3 ATR (резкий скачок — обычно новость).
"""
import json, os, re, subprocess
import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(ROOT, "data", "news.csv")
BEFORE, AFTER, FLAT_BEFORE = pd.Timedelta("30min"), pd.Timedelta("30min"), pd.Timedelta("15min")
SKIP = re.compile(r"election|daylight|holiday", re.I)
MONTHS = {m: i for i, m in enumerate(["January", "February", "March", "April", "May", "June", "July",
                                      "August", "September", "October", "November", "December"], 1)}


def _curl(url):
    r = subprocess.run(["curl", "-sS", "-m", "60", url], capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else ""


def ff_week():
    txt = _curl("https://nfs.faireconomy.media/ff_calendar_thisweek.json")
    if not txt.startswith("["):
        return pd.DataFrame()
    rows = [{"time": pd.Timestamp(e["date"]).tz_convert("UTC"), "ccy": e["country"],
             "title": e["title"], "source": "forexfactory"}
            for e in json.loads(txt) if e.get("impact") == "High" and not SKIP.search(e["title"])]
    return pd.DataFrame(rows)


def fomc_history():
    s = _curl("https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm")
    rows = []
    for y in range(2020, 2031):
        i = s.find(f"{y} FOMC Meetings")
        if i < 0:
            continue
        blk = s[i:i + 20000]
        j = blk.find("FOMC Meetings", 30)
        blk = blk[:j] if j > 0 else blk
        for mon, day in re.findall(r'fomc-meeting__month[^>]*>\s*<strong>([^<]+)</strong>.*?fomc-meeting__date[^>]*>([^<]+)<', blk, re.S):
            if "notation" in day or "unscheduled" in day.lower():
                continue
            last_mon = mon.split("/")[-1]
            last_mon = next((m for m in MONTHS if m.startswith(last_mon[:3])), None)
            d = re.findall(r"\d+", day)
            if not last_mon or not d:
                continue
            t = pd.Timestamp(year=y, month=MONTHS[last_mon], day=int(d[-1]), hour=14).tz_localize("America/New_York")
            rows.append({"time": t.tz_convert("UTC"), "ccy": "USD", "title": "FOMC Statement", "source": "federalreserve.gov"})
    return pd.DataFrame(rows)


def nfp_history(start="2024-01-01", end=None):
    end = end or pd.Timestamp.now()
    rows = []
    for m in pd.date_range(start, end, freq="MS"):
        fri = m + pd.Timedelta(days=(4 - m.dayofweek) % 7)
        t = pd.Timestamp(fri.date()).replace(hour=8, minute=30).tz_localize("America/New_York")
        rows.append({"time": t.tz_convert("UTC"), "ccy": "USD", "title": "Non-Farm Payrolls (правило: 1-я пятница)", "source": "rule"})
    return pd.DataFrame(rows)


def load():
    if not os.path.exists(PATH):
        return pd.DataFrame(columns=["time", "ccy", "title", "source"])
    df = pd.read_csv(PATH)
    df["time"] = pd.to_datetime(df.time, utc=True, format="ISO8601")
    return df


def update():
    parts = [load(), ff_week()]
    if not os.path.exists(PATH):
        parts += [fomc_history(), nfp_history()]
    df = pd.concat([p for p in parts if len(p)], ignore_index=True)
    df = df.drop_duplicates(["time", "ccy", "title"]).sort_values("time")
    df.to_csv(PATH, index=False)
    print(f"новости: {len(df)} событий, последнее {df.time.max():%Y-%m-%d %H:%M} UTC")
    return df


def events_for(pair, ev=None):
    ev = load() if ev is None else ev
    return pd.DatetimeIndex(ev[ev.ccy.isin([pair[:3], pair[3:]])].time.sort_values().unique())


def apply(pair, df, sig, exits, tf, ev=None):
    """Накладывает новостные правила на сигналы и выходы схемы."""
    import indicators as I
    step = pd.Timedelta(tf.replace("m", "min"))
    t = df.index
    T = events_for(pair, ev)
    sig = sig.copy()
    # 3) аномальная сигнальная свеча
    a = I.atr(df).shift()
    spike = (df.high - df.low) > 3 * a
    block = spike.to_numpy().copy()
    long_exit = np.zeros(len(t), bool)
    if len(T):
        ns = lambda td: int(pd.Timedelta(td).value)
        starts = t.as_unit("ns").asi8
        ev_ns = np.sort(T.as_unit("ns").asi8)
        nxt = np.append(starts[1:], starts[-1] + ns(step))   # начало свечи входа
        # 1) запрет входа: свеча входа [nxt, nxt+step) пересекает окно [T−30м, T+30м]
        i0 = np.searchsorted(ev_ns, nxt - ns(AFTER), side="left")
        has = i0 < len(ev_ns)
        tt = ev_ns[np.minimum(i0, len(ev_ns) - 1)]
        block |= has & (tt < nxt + ns(step) + ns(BEFORE))
        # 2) выход до новости: последняя свеча, начавшаяся не позже T−15м, — выход по её открытию
        k = np.searchsorted(starts, ev_ns - ns(FLAT_BEFORE), side="right") - 1
        k = k[(k >= 1) & (k < len(t))]
        long_exit[k - 1] = True
    sig.loc[block, "dir"] = 0
    ex = pd.Series(long_exit, index=t)
    if exits is None:
        return sig, {"long": ex, "short": ex}
    return sig, {"long": exits["long"].reindex(t).fillna(False).astype(bool) | ex,
                 "short": exits["short"].reindex(t).fillna(False).astype(bool) | ex}


if __name__ == "__main__":
    update()
