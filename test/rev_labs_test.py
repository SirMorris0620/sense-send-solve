"""Mounts every interactive added in revision 2, wiggles every control, and fails on NaN/undefined text, console errors or empty drawings."""
import pathlib, sys
from playwright.sync_api import sync_playwright
URL = pathlib.Path(__file__).resolve().parent.parent.joinpath("dist/index.html").as_uri()
NAMES = "ledCalc dividerLab bbExplore bbBuild wiringAudit blinkIntro walkVars walkFor walkFunc ifLab millisClock codeDetective partLed partRgb partButton partBuzzer pwmViz uartLab serialTools dhtVariants pirLens jargonCards restaurantFlow dsPipeline".split()
bad = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1000, "height": 900}); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load" not in m.text else None)
    pg.goto(URL); pg.wait_for_timeout(700)
    for n in NAMES:
        e0 = len(errs)
        ok = pg.evaluate("""(n)=>{document.querySelectorAll('.__t').forEach(x=>x.remove());const h=document.createElement('div');h.className='__t';document.body.appendChild(h);
          if(!INTERACTIVES[n]) return 'missing'; INTERACTIVES[n](h); return h.querySelectorAll('svg,canvas,.big-led,.stepcards,.flipcards,table,.ix-out,.dsOut').length ? 'ok' : 'empty';}""", n)
        if ok != "ok": bad.append(f"{n}: {ok}"); continue
        for rnd in range(2):
            pg.evaluate("""()=>{const h=document.querySelector('.__t');
              h.querySelectorAll('input[type=range]').forEach((r,i)=>{const lo=+r.min||0,hi=+r.max||100;r.value=rnd?hi:lo;r.dispatchEvent(new Event('input',{bubbles:true}));});
              h.querySelectorAll('select').forEach(s=>{const o=s.options.length;s.selectedIndex=rnd?o-1:0;s.dispatchEvent(new Event('change',{bubbles:true}));s.dispatchEvent(new Event('input',{bubbles:true}));});
              h.querySelectorAll('input[type=checkbox]').forEach(c=>{c.checked=!c.checked;c.dispatchEvent(new Event('change',{bubbles:true}));});
              h.querySelectorAll('button').forEach(b=>{ if(!b.disabled) try{b.click()}catch(e){} });}""".replace("rnd?", "%d?" % rnd))
            pg.wait_for_timeout(120)
        pg.wait_for_timeout(300)
        if len(errs) > e0: bad.append(f"{n}: " + errs[e0][:140])
        txt = pg.evaluate("document.querySelector('.__t').innerText + ' ' + document.querySelector('.__t').innerHTML.replace(/<[^>]+>/g,' ')")
        for w in ("NaN", "undefined", "Infinity", "[object"):
            if w in txt: bad.append(f"{n}: contains {w}")
        if pg.evaluate("[...document.querySelectorAll('.__t svg [d]')].some(e=>/NaN|undefined/.test(e.getAttribute('d')))"): bad.append(f"{n}: bad svg path")
    b.close()
print("rev labs:", "FAILED\n" + "\n".join(bad) if bad else "all %d interactives OK" % len(NAMES))
sys.exit(1 if bad else 0)
