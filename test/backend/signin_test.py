import json, urllib.request
from playwright.sync_api import sync_playwright
import os, sys
U=os.environ.get("MOCK_URL","http://127.0.0.1:8850/"); errs=[]; import os; S=os.path.join(os.path.dirname(__file__),"..","shots")+"/"; os.makedirs(S, exist_ok=True)
code=lambda: json.loads(urllib.request.urlopen(U+"lastcode").read())["code"]
print("health:", urllib.request.urlopen(U+"exec?health=1").read().decode()[:120])
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={"width":1180,"height":820}); pg=ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e))); pg.route("https://**", lambda r: r.abort())
    pg.goto(U); pg.wait_for_timeout(500)
    pg.evaluate("localStorage.setItem('sss_quiet_badges','true'); try { badgeQuiet = true } catch(e) {}")
    pg.fill("#rLast","Cruz"); pg.fill("#rGiven","Ana"); pg.fill("#rAge","30"); pg.fill("#rEmail","ana@example.com")
    pg.evaluate("()=>{const r=document.querySelector('input[name=role][value=Teacher]'); r.checked=true; r.dispatchEvent(new Event('change'));}"); pg.wait_for_timeout(100)
    pg.evaluate("()=>{document.querySelector('input[name=tgrade][value=\"Grade 10\"]').checked=true; document.querySelector('#rConsent').checked=true;}"); pg.fill("#rSchool","S")
    pg.evaluate("document.querySelector('#rGo').click()"); pg.wait_for_timeout(1500)
    print("registered with token:", pg.evaluate("!!(user && user.token && user.token.length>40)"))
    # same email registers again on a second device -> sent to code sign-in
    c2=b.new_context(); p2=c2.new_page(); p2.on("pageerror", lambda e: errs.append(str(e))); p2.route("https://**", lambda r: r.abort()); p2.goto(U); p2.wait_for_timeout(400)
    p2.fill("#rLast","Fake"); p2.fill("#rGiven","Mallory"); p2.fill("#rAge","30"); p2.fill("#rEmail","ana@example.com")
    p2.evaluate("()=>{const r=document.querySelector('input[name=role][value=Teacher]'); r.checked=true; r.dispatchEvent(new Event('change'));}"); p2.wait_for_timeout(100)
    p2.evaluate("()=>{document.querySelector('input[name=tgrade][value=\"Grade 10\"]').checked=true; document.querySelector('#rConsent').checked=true;}"); p2.fill("#rSchool","S")
    p2.evaluate("document.querySelector('#rGo').click()"); p2.wait_for_timeout(1500)
    print("existing email on new device -> code step:", p2.evaluate("!document.querySelector('#bCodeWrap').hidden"))
    p2.query_selector("#regCard").screenshot(path=S+"signin_code.png")
    p2.fill("#bCode","111111"); p2.click("#bGo"); p2.wait_for_timeout(800); print("wrong code:", p2.inner_text("#bErr"))
    p2.fill("#bCode", code()); p2.click("#bGo"); p2.wait_for_timeout(1500); print("right code ->", p2.url, p2.evaluate("user.givenName"), "token:", p2.evaluate("!!user.token"))
    # remembered device: switch user then continue with token, no code
    n0=json.loads(urllib.request.urlopen(U+"lastcode").read())["n"]
    pg.evaluate("document.querySelector('#switchUser').click()"); pg.wait_for_timeout(600); pg.click(".known-btn"); pg.wait_for_timeout(1200)
    print("continue-as without code:", pg.url, "emails sent:", json.loads(urllib.request.urlopen(U+"lastcode").read())["n"]-n0)
    # old version user (no token) -> banner -> confirm with code
    c3=b.new_context(); p3=c3.new_page(); p3.on("pageerror", lambda e: errs.append(str(e))); p3.route("https://**", lambda r: r.abort()); p3.goto(U); p3.wait_for_timeout(300)
    p3.evaluate("localStorage.setItem('sss_user', JSON.stringify({givenName:'Ana',email:'ana@example.com',role:'Teacher'}))"); p3.reload(); p3.wait_for_timeout(2000)
    print("old session banner:", p3.evaluate("!!document.querySelector('.auth-banner')"))
    p3.screenshot(path=S+"auth_banner.png")
    p3.click("#authFix"); p3.wait_for_timeout(1500); print("code step after banner:", p3.evaluate("!document.querySelector('#bCodeWrap').hidden"))
    print("note:", p3.inner_text("#bCodeNote")[:70], "err:", p3.inner_text("#bErr")); p3.fill("#bCode", code()); p3.click("#bGo"); p3.wait_for_timeout(1500); print("err2:", p3.inner_text("#bErr") if p3.query_selector("#bErr") else ""); print("re-authed:", p3.url, p3.evaluate("!!user.token"), "banner gone:", not p3.evaluate("!!document.querySelector('.auth-banner')"))
    # client error reporting
    p3.evaluate("setTimeout(()=>{ throw new Error('test boom') }, 10)"); p3.wait_for_timeout(3500)
    d=json.loads(urllib.request.urlopen(U+"dump").read()); print("client error row:", [r[4] for r in d["Errors"][1:] if r[1]=="client"][-1:])
    # forget -> logout revokes
    tok=pg.evaluate("user.token"); pg.evaluate("document.querySelector('#switchUser').click()"); pg.wait_for_timeout(500); pg.on("dialog", lambda dl: dl.accept()); pg.click(".known-x"); pg.wait_for_timeout(800)
    r=json.loads(urllib.request.urlopen(urllib.request.Request(U+"raw", data=json.dumps({"action":"heartbeat","token":tok,"minutes":1}).encode(), method="POST")).read())
    print("forgotten device token revoked:", r.get("error")=="auth_required")
    print("errors:", [e for e in errs if 'test boom' not in e])
    b.close()
sys.exit(1 if [e for e in errs if "test boom" not in e] else 0)
