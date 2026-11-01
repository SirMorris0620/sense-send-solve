"""Screenshot elements: python3 test/el.py VIEWPORT 'hash|css selector|name|js-before' ..."""
import sys, os, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(__file__), "..", "dist")
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
PORT = int(os.environ.get("PORT", 8871))
srv = socketserver.TCPServer(("127.0.0.1", PORT), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
VP = {"phone": (390, 844), "ipad": (820, 1180), "ipadl": (1180, 820), "desktop": (1440, 900)}
which = sys.argv[1]; out = os.path.join(os.path.dirname(__file__), "shots"); os.makedirs(out, exist_ok=True)
CDN = os.environ.get("CDN", "")
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(); w, h = VP[which]
    ctx = b.new_context(viewport={"width": w, "height": h}, has_touch=which != "desktop", is_mobile=which == "phone", device_scale_factor=1)
    ctx.route("https://fonts.googleapis.com/**", lambda r: r.abort()); ctx.route("https://fonts.gstatic.com/**", lambda r: r.abort())
    if CDN: ctx.route("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js", lambda r: r.fulfill(path=CDN + "/chart.js-4.4.1/package/dist/chart.umd.js", content_type="application/javascript"))
    page = ctx.new_page(); page.on("pageerror", lambda e: errs.append(str(e) + " " + (e.stack or "")[:300]))
    page.on("console", lambda m: errs.append("console: " + m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
    page.goto(f"http://127.0.0.1:{PORT}/index.html")
    page.evaluate("localStorage.setItem('sss_quiet_badges','true'); try { badgeQuiet = true } catch(e) {}")
    page.evaluate("()=>{localStorage.setItem('sss_user', JSON.stringify({givenName:'Tina',email:'t@example.com',role:'Teacher',age:30,admin:true}));}"); page.reload(); page.wait_for_timeout(500)
    for spec in sys.argv[2:]:
        parts = spec.split("|"); hsh, sel, name = parts[0], parts[1], parts[2]; js = parts[3] if len(parts) > 3 else ""
        page.evaluate(f"location.hash='{hsh}'"); page.wait_for_timeout(900)
        if js: page.evaluate(js); page.wait_for_timeout(int(os.environ.get("WAIT", 900)))
        el = page.query_selector(sel)
        if not el: print("MISSING", spec); continue
        el.scroll_into_view_if_needed(); page.wait_for_timeout(300)
        el.screenshot(path=f"{out}/{which}_{name}.png")
    b.close()
srv.shutdown()
print("errors:", errs[:10])
