"""Проверка публичного API Deriv (без токена): валютные пары, Rise/Fall, выплаты, свечи."""
import asyncio, json, websockets

URL = "wss://api.derivws.com/trading/v1/options/ws/public"


async def main():
    async with websockets.connect(URL, open_timeout=30, max_size=2**24) as ws:
        async def q(req):
            await ws.send(json.dumps(req))
            return json.loads(await ws.recv())
        r = await q({"active_symbols": "brief"})
        if "error" in r:
            print("active_symbols ERR", r["error"])
        else:
            print("пример записи:", r["active_symbols"][0])
            fx = [s for s in r["active_symbols"] if s.get("market") == "forex"]
            print("forex symbols:", len(fx), [s.get("underlying_symbol") or s.get("symbol") for s in fx][:40])
        r = await q({"contracts_for": "frxEURUSD", "currency": "USD"})
        if "error" in r:
            print("contracts_for(symbol) ERR", r["error"])
            r = await q({"contracts_for": 1, "underlying_symbol": "frxEURUSD", "currency": "USD"})
        if "error" in r:
            print("contracts_for ERR", r["error"])
        else:
            for c in r["contracts_for"]["available"]:
                if c["contract_category"] == "callput":
                    print(c["contract_type"], c.get("barrier_category"), c["expiry_type"],
                          c["min_contract_duration"], c["max_contract_duration"], c.get("start_type"))
        for sym in ["frxEURUSD", "frxGBPUSD", "frxUSDJPY", "frxAUDUSD", "frxUSDCAD", "frxUSDCHF",
                    "frxNZDUSD", "frxEURJPY", "frxGBPJPY", "frxEURGBP"]:
            for d in (15, 30, 60):
                p = await q({"proposal": 1, "amount": 20, "basis": "stake", "contract_type": "CALL",
                             "currency": "USD", "duration": d, "duration_unit": "m", "underlying_symbol": sym})
                if "error" in p:
                    p = await q({"proposal": 1, "amount": 20, "basis": "stake", "contract_type": "CALL",
                                 "currency": "USD", "duration": d, "duration_unit": "m", "symbol": sym})
                print(sym, d, "мин:", p.get("error", {}).get("message") if "error" in p
                      else f"выплата {p['proposal']['payout'] / 20 - 1:.1%}")
        t = await q({"ticks_history": "frxEURUSD", "style": "candles", "granularity": 900, "count": 3, "end": "latest"})
        print("candles:", t.get("error") or t.get("candles"))


asyncio.run(main())
