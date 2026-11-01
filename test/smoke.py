"""Smoke test: sign up, open every module, mount every interactive, answer quizzes, run sandbox solutions. Usage: python3 test/smoke.py [viewport]"""
import sys, json, threading, http.server, socketserver, os, functools, time
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(__file__), "..", "dist")
PORT = 8791
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
PORT = int(os.environ.get("PORT", PORT))
srv = socketserver.TCPServer(("127.0.0.1", PORT), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
VP = {"phone": (390, 844), "ipad": (820, 1180), "desktop": (1440, 900)}
which = sys.argv[1] if len(sys.argv) > 1 else "desktop"
shots = os.path.join(os.path.dirname(__file__), "shots"); os.makedirs(shots, exist_ok=True)
errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    w, h = VP[which]
    ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, has_touch=(which != "desktop"), is_mobile=(which == "phone"))
    page = ctx.new_page()
    page.on("pageerror", lambda e: errors.append("pageerror: " + str(e) + " @ " + (e.stack or "")[:400]))
    page.on("console", lambda m: errors.append("console: " + m.text) if m.type == "error" and "fonts" not in m.text and "motion" not in m.text and "net::" not in m.text else None)
    page.route("https://fonts.googleapis.com/**", lambda r: r.abort()); page.route("https://fonts.gstatic.com/**", lambda r: r.abort())
    page.goto(f"http://127.0.0.1:{PORT}/index.html"); page.wait_for_timeout(800)
    page.evaluate("localStorage.setItem('sss_quiet_badges','true'); try { badgeQuiet = true } catch(e) {}")
    page.screenshot(path=f"{shots}/{which}_welcome.png", full_page=False)
    # sign up
    page.fill("#rLast", "Tester"); page.fill("#rGiven", "Tina"); page.fill("#rAge", "30"); page.fill("#rEmail", "tina@example.com")
    page.evaluate("()=>{const r=document.querySelector('input[name=role][value=Teacher]'); r.checked=true; r.dispatchEvent(new Event('change'));}"); page.wait_for_timeout(100)
    page.evaluate("()=>{document.querySelector('input[name=tgrade][value=\"Grade 10\"]').checked=true; document.querySelector('#rConsent').checked=true;}"); page.fill("#rSchool", "Test School")
    page.evaluate("document.querySelector('#rGo').click()"); page.wait_for_timeout(600)
    assert "#/overview" in page.url, page.url
    page.screenshot(path=f"{shots}/{which}_overview.png")
    page.on("dialog", lambda d: d.accept())
    # pre-test through the real UI: Module 1.1 must be locked until it is done
    page.evaluate("location.hash='#/m/1.1'"); page.wait_for_timeout(300)
    assert page.evaluate("!!document.querySelector('.lock-card')"), "1.1 should be locked before the pre-test"
    page.evaluate("location.hash='#/pretest'"); page.wait_for_timeout(300); page.click("#tStart")
    for k in range(page.evaluate("TEST.items.length")):
        page.evaluate("document.querySelectorAll('input[name=tq]')[4].click()"); page.wait_for_timeout(260)
    page.click("#tSubmit"); page.wait_for_timeout(400)
    assert page.evaluate("preDone()"), "pre-test not saved"
    page.screenshot(path=f"{shots}/{which}_pretest_done.png")
    mods = page.evaluate("Object.keys(MODULES)")
    report = {}
    for m in mods:
        page.evaluate(f"location.hash='#/m/{m}'"); page.wait_for_timeout(400)
        n_int = page.evaluate("document.querySelectorAll('[data-int]').length")
        bad = page.evaluate("[...document.querySelectorAll('[data-int]')].filter(e=>!e.innerHTML.trim()||/could not start|coming soon/.test(e.innerText)).map(e=>e.dataset.int)")
        # answer quiz with correct answers
        page.evaluate(f"MODULES['{m}'].quiz.forEach((q,i)=>{{ const b=document.querySelector(`.opt[data-q='${{i}}'][data-k='${{q.a}}']`); if(b) b.click(); }})")
        page.evaluate("document.querySelectorAll('[data-done]').forEach(b=>b.click())")
        page.evaluate("const r=document.querySelector('#rating input'); if(r){ r.checked=true; r.dispatchEvent(new Event('change')); }")
        pct = page.evaluate(f"modulePct(MODULES['{m}'])")
        report[m] = {"interactives": n_int, "broken": bad, "pct": pct}
        page.screenshot(path=f"{shots}/{which}_m{m}.png")
    # sandbox solutions
    sb = page.evaluate("Object.keys(SB)")
    results = {}
    for m in mods:
        page.evaluate(f"location.hash='#/m/{m}'"); page.wait_for_timeout(300)
        boxes = page.query_selector_all(".sbRun")
        for bi, run in enumerate(boxes):
            bench = run.evaluate_handle("e=>e.closest('.bench')")
            tabs = bench.query_selector_all(".sb-tabs button") or [None]
            for t in tabs:
                if t: t.click(); page.wait_for_timeout(100)
                cid = page.evaluate("(b)=>{const t=b.querySelector('.sb-tabs button[aria-selected=true]'); return t? t.textContent : b.querySelector('.bench-title').textContent }", bench)
                for brd in ["s3", "esp8266", "uno"]:
                    bench.query_selector(".sbB").select_option(brd); page.wait_for_timeout(50)
                    page.evaluate("(b)=>{ b.parentNode.mission.autoWire(); b.querySelectorAll('.ml-step')[1].click(); const c=SB[b.parentNode.dataset.cur]; b.querySelector('.sbE').value=c.solution(b.querySelector('.sbB').value); }", bench); cid = page.evaluate("(b)=>b.parentNode.dataset.cur", bench)
                    bench.query_selector(".sbRun").click()
                    page.wait_for_function("(b)=>!b.querySelector('.sbRun').disabled", arg=bench, timeout=15000)
                    ok = page.evaluate("(b)=>[...b.querySelectorAll('.sbChecks li')].every(li=>li.classList.contains('ok'))", bench)
                    results[f"{cid.strip()} [{brd}]"] = ok
    # post-test (correct answers) and certificate
    page.evaluate("location.hash='#/posttest'"); page.wait_for_timeout(300); page.click("#tStart")
    for k in range(page.evaluate("TEST.items.length")):
        page.evaluate(f"document.querySelectorAll('input[name=tq]')[TEST.items[{k}].a].click()"); page.wait_for_timeout(260)
    page.click("#tSubmit"); page.wait_for_timeout(400)
    post_ok = page.evaluate("postPassed()")
    page.evaluate("location.hash='#/certificate'"); page.wait_for_timeout(300)
    page.check("#cOk"); page.click("#cGo"); page.wait_for_timeout(500)
    cert_ok = page.evaluate("!!document.querySelector('#certSheet')")
    page.screenshot(path=f"{shots}/{which}_certificate.png")
    if not (post_ok and cert_ok): errors.append(f"post-test passed={post_ok} certificate={cert_ok}")
    page.evaluate("checkBadges()"); n_badges = page.evaluate("Object.keys(earned()).length")
    for bid in ["first_spark","foundations","prototyper","web_connector","product_maker","graduate","top_of_class","growth_mindset","mission_master"]:
        if not page.evaluate(f"!!earned()['{bid}']"): errors.append("badge not earned: " + bid)
    page.evaluate("location.hash='#/badges'"); page.wait_for_timeout(300); page.screenshot(path=f"{shots}/{which}_badges.png", full_page=True)
    # Apps Script and web sandboxes: load each solution and run
    for m in mods:
        page.evaluate(f"location.hash='#/m/{m}'"); page.wait_for_timeout(300)
        for kind, run_sel, store, chk in [("as", ".asRun", "AS", ".asChecks"), ("web", ".wbRun", "WEB", ".wbChecks")]:
            for run in page.query_selector_all(run_sel):
                bench = run.evaluate_handle("e=>e.closest('.bench')")
                tabs = bench.query_selector_all(".sb-tabs button") or [None]
                for t in tabs:
                    if t: t.click(); page.wait_for_timeout(150)
                    title = page.evaluate("(b)=>{const s=b.querySelector('.sb-tabs button[aria-selected=true]'); return s? s.textContent.replace(' \u2713','').trim() : ''}", bench)
                    title = page.evaluate("(b)=>b.parentNode.dataset.cur", bench); page.evaluate(f"(b)=>{{ const c={store}[b.parentNode.dataset.cur]; b.querySelector('textarea').value=c.solution; }}", bench)
                    bench.query_selector(run_sel).click(); page.wait_for_timeout(2500 if kind == "web" else 800)
                    ok = page.evaluate(f"(b)=>{{ const l=[...b.querySelectorAll('{chk} li')]; return l.length>0 && l.every(li=>li.classList.contains('ok')); }}", bench)
                    results[f"{kind}:{title}"] = ok
    page.evaluate("location.hash='#/lab'"); page.wait_for_timeout(300); page.screenshot(path=f"{shots}/{which}_lab.png")
    for pg in ["#/progress", "#/references", "#/glossary", "#/ailog", "#/privacy", "#/home"]:
        page.evaluate(f"location.hash='{pg}'"); page.wait_for_timeout(300)
    page.screenshot(path=f"{shots}/{which}_home.png", full_page=False)
    overflow = page.evaluate("document.documentElement.scrollWidth > innerWidth + 1")
    print(json.dumps({"viewport": which, "modules": report, "sandbox_fail": [k for k, v in results.items() if not v], "sandbox_runs": len(results), "h_overflow_home": overflow, "errors": errors[:20]}, indent=1))
    b.close()
srv.shutdown()
bad = {m: r for m, r in report.items() if r["broken"] or r["pct"] < 1}
if bad or [k for k, v in results.items() if not v] or errors:
    print("SMOKE TEST FAILED", bad); sys.exit(1)
print("SMOKE TEST PASSED")
