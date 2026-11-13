import asyncio, json, websockets
URL = "wss://ws.derivws.com/websockets/v3?app_id=1089"
async def main():
    async with websockets.connect(URL, open_timeout=30) as ws:
        async def q(req):
            await ws.send(json.dumps(req)); return json.loads(await ws.recv())
        r = await q({"contracts_for": "frxEURUSD", "currency": "USD", "landing_company": "svg"})
        if "error" in r: print("ERR", r["error"]); return
        for c in r["contracts_for"]["available"]:
            if c["contract_category"] == "callput" and c.get("barrier_category") == "euro_atm":
                print(c["contract_type"], c["expiry_type"], c["min_contract_duration"], c["max_contract_duration"], c.get("start_type"))
        p = await q({"proposal": 1, "amount": 20, "basis": "stake", "contract_type": "CALL", "currency": "USD",
                     "duration": 15, "duration_unit": "m", "symbol": "frxEURUSD"})
        print("proposal 15m:", p.get("error") or {k: p["proposal"][k] for k in ("payout", "ask_price", "longcode")})
        for sym in ["frxGBPUSD","frxUSDJPY","frxAUDUSD","frxUSDCAD","frxUSDCHF","frxNZDUSD","frxEURJPY","frxGBPJPY","frxEURGBP"]:
            p = await q({"proposal": 1, "amount": 20, "basis": "stake", "contract_type": "CALL", "currency": "USD", "duration": 15, "duration_unit": "m", "symbol": sym})
            print(sym, p.get("error", {}).get("message") or round(p["proposal"]["payout"]/20-1, 3))
        t = await q({"ticks_history": "frxEURUSD", "style": "candles", "granularity": 900, "count": 5, "end": "latest"})
        print("candles:", t.get("error") or t["candles"][-2:])
asyncio.run(main())
