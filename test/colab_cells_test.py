"""Extracts every Python cell in Unit 4 from the built app and runs them top to bottom, exactly as a learner would in Colab."""
import json, sys, subprocess, tempfile, os, pathlib
from playwright.sync_api import sync_playwright
URL = (pathlib.Path(__file__).resolve().parent.parent / "dist" / "index.html").as_uri()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto(URL); pg.wait_for_timeout(500)
    cells = pg.evaluate("""() => { const out = []; const u = COURSE.find(x => x.id === 'u4');
      u.modules.forEach(m => m.sections.forEach(s => { const d = document.createElement('div'); d.innerHTML = s.html;
        d.querySelectorAll('.codebox').forEach(c => out.push({m: m.id, s: s.id, title: c.querySelector('.codehead span').textContent, code: c.querySelector('pre').textContent}))})); return out; }""")
    b.close()
py = [c for c in cells if "python" in c["title"].lower() or c["title"].startswith("Colab") or c["title"].startswith("On your")]
run = [c for c in py if not c["title"].startswith("On your computer")]
print(len(py), "python cells;", len(py) - len(run), "illustrative (not run);", len(run), "run")
prog = "import matplotlib; matplotlib.use('Agg')\nimport warnings; warnings.filterwarnings('ignore')\n"
for i, c in enumerate(run):
    prog += f"\nprint('### cell {i+1}: {c['m']}/{c['s']} {c['title']}')\n" + c["code"].replace("plt.show()", "plt.close('all')") + "\n"
open(os.path.join(tempfile.gettempdir(), "colab_run.py"), "w").write(prog)
r = subprocess.run([sys.executable, "-I", os.path.join(tempfile.gettempdir(), "colab_run.py")], capture_output=True, text=True, timeout=300)
open(os.path.join(tempfile.gettempdir(), "colab_out.txt"), "w").write(r.stdout + "\n" + r.stderr)
if r.returncode:
    print(r.stdout[-1500:]); print(r.stderr[-1800:]); sys.exit(1)
print("COLAB CELLS PASSED"); print(r.stdout[-300:] if "-v" in sys.argv else "")
