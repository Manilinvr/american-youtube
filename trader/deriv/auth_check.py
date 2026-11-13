"""Проверка токена Deriv (из секрета DERIV_TOKEN): счета, демо-баланс. Сделок не открывает.
Токен не печатается."""
import asyncio, json, os, sys, urllib.request, urllib.error
import websockets

CFG = json.load(open(os.path.join(os.path.dirname(__file__), "config.json")))
TOKEN = os.environ.get("DERIV_TOKEN", "").strip()


def rest(method, path, body=None):
    req = urllib.request.Request(CFG["rest"] + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": f"Bearer {TOKEN}", "Deriv-App-ID": CFG["app_id"],
                                          "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, (e.read() or b"")[:500].decode("utf-8", "replace")


async def main():
    if not TOKEN:
        print("СЕКРЕТ DERIV_TOKEN ПУСТ ИЛИ НЕ НАЙДЕН"); sys.exit(1)
    print("длина токена:", len(TOKEN))
    st, acc = rest("GET", "/trading/v1/options/accounts")
    print("GET accounts:", st)
    if st != 200:
        print(acc); sys.exit(1)
    items = acc.get("data", acc)
    items = items if isinstance(items, list) else items.get("accounts", items)
    print("счета:", json.dumps(items, ensure_ascii=False)[:1500])
    demo = [a for a in items if isinstance(a, dict) and str(a.get("account_type", "")).lower() == "demo"]
    if not demo:
        print("ДЕМО-СЧЁТ НЕ НАЙДЕН"); sys.exit(1)
    aid = demo[0].get("account_id") or demo[0].get("id") or demo[0].get("loginid")
    st, otp = rest("POST", f"/trading/v1/options/accounts/{aid}/otp")
    print("POST otp:", st)
    if st not in (200, 201):
        print(otp); sys.exit(1)
    url = otp["data"]["url"]
    async with websockets.connect(url, open_timeout=30) as ws:
        await ws.send(json.dumps({"balance": 1}))
        r = json.loads(await ws.recv())
        print("баланс:", r.get("error") or r.get("balance"))
    print("ПРОВЕРКА ПРОЙДЕНА")


asyncio.run(main())
