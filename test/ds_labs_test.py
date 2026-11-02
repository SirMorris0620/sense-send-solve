"""Mounts every data-science lab, wiggles every control, and fails on any JS error or NaN/undefined in the output."""
import sys, json, os, pathlib
from playwright.sync_api import sync_playwright
URL = (pathlib.Path(__file__).resolve().parent.parent / "dist" / "index.html").as_uri()
LABS = "dsPipeline noiseLab statsLab imputeLab smoothLab decomposeLab heatIndexLab polyFitLab mqCurveLab scalingLab anomalyLab hampelLab errorMetricsLab markovLab binningLab timeWindowLab corrLab logisticLab survivalLab pidLab mlLab chiLab reportBuilder".split()
bad = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1100, "height": 900}); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(800)
    for name in LABS:
        r = pg.evaluate("""async (name) => {
          const host = document.createElement('div'); document.body.appendChild(host); const out = [];
          try { INTERACTIVES[name](host); } catch(e) { return ['MOUNT ' + e.message]; }
          const check = tag => { const t = host.innerText; if (/NaN|undefined|Infinity|\\[object/.test(t)) out.push(tag + ': bad text -> ' + (t.match(/.{0,40}(NaN|undefined|Infinity|\\[object).{0,20}/)||[''])[0]); if (!host.querySelector('svg') && name!=='dsPipeline' && name!=='reportBuilder' ) out.push(tag + ': no svg'); };
          check('initial');
          for (const n of host.querySelectorAll('[data-c]')) {
            try {
              if (n.type === 'range') for (const v of [n.min, n.max, String((+n.min + +n.max)/2)]) { n.value = v; n.dispatchEvent(new Event('input')); check(n.dataset.c + '=' + v); }
              else if (n.type === 'checkbox') { n.checked = !n.checked; n.dispatchEvent(new Event('input')); check(n.dataset.c + ' toggled'); n.checked = !n.checked; n.dispatchEvent(new Event('input')); }
              else if (n.tagName === 'SELECT') for (const o of n.options) { n.value = o.value; n.dispatchEvent(new Event('input')); check(n.dataset.c + '=' + o.value.slice(0,12)); }
            } catch (e) { out.push(n.dataset.c + ' threw ' + e.message); }
          }
          for (const n of host.querySelectorAll('[data-b]')) { try { n.click(); check('btn ' + n.dataset.b); } catch (e) { out.push('btn threw ' + e.message); } }
          return out; }""", name)
        if r: bad.append((name, r[:4]))
    b.close()
if errs: bad.append(("pageerrors", errs[:5]))
if bad:
    for x in bad: print("FAIL", x)
    sys.exit(1)

GX = "stats clean curve scale clean2 explore act model report".split()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(600)
    total = 0
    for g in GX:
        r = pg.evaluate("""(g) => { const host = document.createElement('div'); document.body.appendChild(host); INTERACTIVES['gx_' + g](host); const res = [];
          const set = GXSETS[g], probs = typeof set.problems === 'function' ? set.problems() : set.problems;
          probs.forEach((p, i) => { host.querySelectorAll('.gxDot')[i].click();
            // a deliberately wrong answer must give feedback, not an exception
            if (p.type === 'choice') { const bad = (p.answer + 1) % p.options.length; host.querySelector('input[value="' + bad + '"]').checked = true; } else host.querySelector('.gxVal').value = String(p.answer + 1000);
            host.querySelector('.gxCheck').click(); if (!host.querySelector('.gxFb.no')) res.push(g + ' #' + (i+1) + ': wrong answer not rejected');
            host.querySelector('.gxHint') && host.querySelector('.gxHint').click();
            if (p.type === 'choice') host.querySelector('input[value="' + p.answer + '"]').checked = true; else host.querySelector('.gxVal').value = String(p.answer);
            host.querySelector('.gxCheck').click(); if (!host.querySelector('.gxFb.ok')) res.push(g + ' #' + (i+1) + ': correct answer rejected (' + p.answer + ')');
            host.querySelector('.gxSol').click(); const sol = host.querySelector('.gxSolBox').innerText; if (/NaN|undefined|\\[object/.test(sol + host.innerText)) res.push(g + ' #' + (i+1) + ': NaN/undefined text'); });
          return [res, probs.length]; }""", g)
        total += r[1]
        if r[0]: bad2 = r[0]; print("FAIL", bad2); sys.exit(1)
    if errs: print("FAIL page errors", errs[:3]); sys.exit(1)
print("LAB TEST PASSED:", len(LABS), "labs;", total, "guided problems")
