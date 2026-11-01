import sys, os, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT=os.path.join(os.path.dirname(__file__),"..","dist"); PORT=8795
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",PORT),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
    pg.route("https://**", lambda r: r.abort())
    pg.goto(f"http://127.0.0.1:{PORT}/index.html"); pg.wait_for_timeout(600)
    pg.evaluate("document.querySelector('#rGo').scrollIntoView({block:'center'})"); pg.wait_for_timeout(300)
    pg.screenshot(path="test/shots/phone_form.png")
    print(pg.evaluate("(()=>{const a=document.querySelector('.privacy').getBoundingClientRect(), b=document.querySelector('#rGo').getBoundingClientRect(); return [a.top,a.bottom,a.left,a.right,b.top,b.bottom, getComputedStyle(document.querySelector('.privacy')).position]})()"))
    b.close()
srv.shutdown()
