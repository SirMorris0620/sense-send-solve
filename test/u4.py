"""Functional tests for Unit 4 tools: firmware generator (all boards, several combos), dashboard preview, canvas, tests, README, rubric."""
import sys, json, threading, http.server, socketserver, os, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(__file__), "..", "dist")
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
PORT = int(os.environ.get("PORT", 8822))
srv = socketserver.TCPServer(("127.0.0.1", PORT), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
VP = {"phone": (390, 844), "ipad": (820, 1180), "desktop": (1440, 900)}
which = sys.argv[1] if len(sys.argv) > 1 else "desktop"
shots = os.path.join(os.path.dirname(__file__), "shots"); os.makedirs(shots, exist_ok=True)
errors, out = [], {}
with sync_playwright() as p:
    b = p.chromium.launch(); w, h = VP[which]
    ctx = b.new_context(viewport={"width": w, "height": h}, has_touch=(which != "desktop"), is_mobile=(which == "phone"))
    page = ctx.new_page()
    page.on("pageerror", lambda e: errors.append("pageerror: " + str(e) + " @ " + (e.stack or "")[:600]))
    page.on("console", lambda m: errors.append("console: " + m.text) if m.type == "error" and "net::" not in m.text and "fonts" not in m.text else None)
    for pat in ["https://fonts.googleapis.com/**", "https://fonts.gstatic.com/**"]: page.route(pat, lambda r: r.abort())
    CDN = os.environ.get("CDN")
    if CDN:
        ctx.route("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js", lambda r: r.fulfill(path=CDN + "/chart.js-4.4.1/package/dist/chart.umd.js", content_type="application/javascript"))
        ctx.route("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", lambda r: r.fulfill(path=CDN + "/leaflet-1.9.4/package/dist/leaflet.js", content_type="application/javascript"))
        ctx.route("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", lambda r: r.fulfill(path=CDN + "/leaflet-1.9.4/package/dist/leaflet.css", content_type="text/css"))
        ctx.route("https://tile.openstreetmap.org/**", lambda r: r.abort())
    page.goto(f"http://127.0.0.1:{PORT}/index.html")
    page.evaluate("localStorage.setItem('sss_quiet_badges','true'); try { badgeQuiet = true } catch(e) {}")
    page.evaluate("()=>{localStorage.setItem('sss_user', JSON.stringify({last:'T',givenName:'Tina',email:'t@example.com',role:'Teacher',age:30,board:'s3',admin:true})); }"); page.reload(); page.wait_for_timeout(500)
    # canvas
    page.evaluate("location.hash='#/m/4.1?s=problem'"); page.wait_for_timeout(500)
    c = page.query_selector("[data-int=projectCanvas]")
    for k, v in {"title":"Room 204 Comfort Monitor","who":"our adviser","where":"Room 204","decision":"when to open windows","kpis":"temp, humidity, air ratio","success":"logs every 60 s all day"}.items():
        c.query_selector(f".pcI[data-k={k}]").fill(v)
    c.query_selector(".pcS button[data-s=dht]").click(); c.query_selector(".pcS button[data-s=mq135]").click()
    out["canvas"] = page.evaluate("act('projectCanvas')")
    page.screenshot(path=f"{shots}/{which}_u4_canvas.png", full_page=False)
    # firmware generator: several combos x boards
    page.evaluate("location.hash='#/m/4.3?s=gen'"); page.wait_for_timeout(600)
    fg = page.query_selector("[data-int=fwGen]")
    res = {}
    for combo in [["dht","mq135"], ["sps30","led"], ["gps","dht"], ["rc522","buzzer"], ["hcsr04","ldr"]]:
        for brd in ["s3","esp8266","uno"]:
            page.evaluate("(a)=>{const p=getProject(); p.fw=Object.assign(p.fw||{}, {board:a[1], sensors:a[0]}); saveProject(p);}", [combo, brd])
            page.evaluate("location.hash='#/m/4.2'"); page.wait_for_timeout(150); page.evaluate("location.hash='#/m/4.3?s=gen'"); page.wait_for_timeout(500)
            fg = page.query_selector("[data-int=fwGen]")
            if fg.query_selector(".fgRun").is_disabled():
                res[f"{'+'.join(combo)} {brd}"] = "conflict: " + fg.query_selector(".fgO").inner_text()[:80]; continue
            fg.query_selector(".fgRun").click()
            page.wait_for_function("(e)=>!e.querySelector('.fgRun').disabled", arg=fg, timeout=20000)
            ok = page.evaluate("(e)=>[...e.querySelectorAll('.fgChecks li.ok,.fgChecks li.no')].map(l=>l.className+':'+l.textContent.slice(0,70))", fg)
            res[f"{'+'.join(combo)} {brd}"] = ok if any('no' == x.split(':')[0] for x in ok) else "PASS"
    out["fwGen"] = res
    fg.scroll_into_view_if_needed(); page.screenshot(path=f"{shots}/{which}_u4_fwgen.png", full_page=False)
    # dashboard preview
    page.evaluate("location.hash='#/m/4.4?s=preview'"); page.wait_for_timeout(2500)
    fr = [f for f in page.frames if f != page.main_frame]
    dash = {}
    for sc in ["normal", "hot", "stale"]:
        page.select_option(".dpC", sc); page.wait_for_timeout(1500)
        fr = [f for f in page.frames if f != page.main_frame]
        f = fr[-1]
        dash[sc] = f.evaluate("()=>({cards:[...document.querySelectorAll('.card')].map(c=>c.innerText.replace(/\\n/g,' ')), stale:!document.getElementById('stale').hidden, updated:document.getElementById('updated').textContent.slice(0,40), dev:document.getElementById('device').options.length, chart:!!window.Chart, chartPts: window.Chart ? (Chart.getChart(document.getElementById('chart'))||{data:{labels:[]}}).data.labels.length : 0})")
    out["dash"] = dash
    page.query_selector(".dpF").scroll_into_view_if_needed(); page.screenshot(path=f"{shots}/{which}_u4_dash.png", full_page=False)
    # rfid + gps preview
    page.evaluate("()=>{document.querySelectorAll('.dpS button.sel').forEach(b=>b.click()); document.querySelector('.dpS button[data-s=rc522]').click(); document.querySelector('.dpS button[data-s=gps]').click();}"); page.wait_for_timeout(2500)
    f = [f for f in page.frames if f != page.main_frame][-1]
    out["dash_rfid"] = f.evaluate("()=>({taps:[...document.querySelectorAll('#taps tr')].map(r=>r.innerText.replace(/\\t/g,' | ')).slice(0,3), map:!document.getElementById('mapPanel').hidden, link:document.getElementById('mapLink').innerText, leaflet:!!window.L, marker:!!document.querySelector('.leaflet-marker-icon')})")
    # tests, readme, rubric
    page.evaluate("location.hash='#/m/4.5?s=test'"); page.wait_for_timeout(600)
    sels = page.query_selector_all(".tpR")
    for s in sels[:6]: s.select_option("Pass")
    out["tests"] = [len(sels), page.evaluate("act('testPlan')")]
    page.evaluate("location.hash='#/m/4.5?s=docs'"); page.wait_for_timeout(600)
    out["readme_head"] = page.evaluate("document.querySelector('.rmE').value.slice(0,400)")
    out["readme_has_wiring"] = page.evaluate("/\\| DATA \\(out\\) \\| GPIO4/.test(document.querySelector('.rmE').value)")
    page.evaluate("location.hash='#/m/4.5?s=rubric'"); page.wait_for_timeout(600)
    page.evaluate("()=>{for(let i=0;i<8;i++) document.querySelector(`.rbB[data-i='${i}'][data-l='3']`).click();}")
    out["rubric"] = page.evaluate("document.querySelector('.rbO').innerText")
    page.screenshot(path=f"{shots}/{which}_u4_rubric.png", full_page=False)
    out["overflow_4.5"] = page.evaluate("document.documentElement.scrollWidth > innerWidth + 1")
    for m in ["4.1","4.2","4.3","4.4"]:
        page.evaluate(f"location.hash='#/m/{m}'"); page.wait_for_timeout(500)
        out["overflow_" + m] = page.evaluate("document.documentElement.scrollWidth > innerWidth + 1")
    b.close()
srv.shutdown()
print(json.dumps({"out": out, "errors": errors[:20]}, indent=1, ensure_ascii=False))
