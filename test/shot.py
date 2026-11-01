"""Screenshot a hash route, optionally scrolled to a selector. Usage: python3 test/shot.py '#/m/2.2' '.bbwrap' out.png [width] [height]"""
import sys, os, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT=os.path.join(os.path.dirname(__file__),"..","dist"); PORT=int(os.environ.get("PORT","8799"))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",PORT),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
route, sel, out = sys.argv[1], sys.argv[2], sys.argv[3]; W=int(sys.argv[4]) if len(sys.argv)>4 else 1280; H=int(sys.argv[5]) if len(sys.argv)>5 else 900
js = sys.argv[6] if len(sys.argv)>6 else ""
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":W,"height":H}, is_mobile=W<500, has_touch=W<1000)
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.route("https://**", lambda r: r.abort())
    pg.goto(f"http://127.0.0.1:{PORT}/index.html"); pg.wait_for_timeout(300)
    pg.evaluate("""()=>{ localStorage.setItem('sss_user', JSON.stringify({email:'t@x.com',givenName:'Tina',name:'Tina',role:'Teacher',aiAllowed:true,admin:true})); }""")
    pg.goto(f"http://127.0.0.1:{PORT}/index.html{route}"); pg.reload(); pg.wait_for_timeout(700)
    if sel != "-": pg.evaluate(f"(()=>{{const e=document.querySelector({sel!r}); if(e) e.scrollIntoView({{block:'start'}}); window.scrollBy(0,-70);}})()"); pg.wait_for_timeout(400)
    if js: pg.evaluate(js); pg.wait_for_timeout(900)
    pg.screenshot(path=out); print("errors:", errs)
    b.close()
srv.shutdown()
