#!/usr/bin/env python3
"""Build dist/index.html from src/. Usage: python3 build.py

The course server URL is filled in automatically, so you never edit index.html by hand:
  1. environment variable SSS_API_URL (B2B_API_URL still works) (used by the GitHub Actions deploy), or
  2. config.json next to this file: {"apiUrl": "https://script.google.com/macros/s/.../exec"}
If neither is set, the app builds in preview mode."""
import os, re, json
SRC = os.path.join(os.path.dirname(__file__), "src")
JS = ["js/core.js","js/refs.js","js/helpers.js","js/ds_kit.js","js/media.js","js/pins.js","js/programs.js","js/sim.js","js/sim_ext.js","js/programs2.js","js/sandbox.js","js/sb_challenges.js","js/sb_challenges2.js",
      "js/ix_u1.js","js/boards.js","js/ix_u2.js","js/ix_u3.js","js/ix_u1b.js","js/sensor_anim.js","js/mission.js","js/scene_bench.js","js/cloud_ui.js","js/ix_u3b.js","js/u4_code.js","js/ix_u4.js","js/as_sandbox.js","js/web_sandbox.js","js/db_lab.js",
      "js/ix_new.js","js/ix_ds1.js","js/ix_ds2.js","js/ix_ds3.js","js/ix_ds4.js","content/u1.js","content/u2.js","content/u3.js","content/u4.js","content/u4b.js","content/u4c.js","content/u5.js","content/tail.js","content/tests.js","js/engine.js","js/gate.js","js/assess.js","js/badges.js","js/present.js","js/pages.js"]
def rd(p): return open(os.path.join(SRC, p), encoding="utf-8").read()
css = rd("base.css") + "\n" + rd("b2b.css")
ROOT = os.path.dirname(os.path.abspath(__file__))
api_url = os.environ.get("SSS_API_URL", os.environ.get("B2B_API_URL", "")).strip()
if not api_url and not os.environ.get("SSS_PREVIEW") and os.path.exists(os.path.join(ROOT, "config.json")):
    api_url = json.load(open(os.path.join(ROOT, "config.json"), encoding="utf-8")).get("apiUrl", "").strip()
if api_url and not re.match(r"^https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec$", api_url):
    raise SystemExit("API URL must look like https://script.google.com/macros/s/.../exec, got: " + api_url)
parts = []
for p in JS:
    fp = os.path.join(SRC, p)
    if not os.path.exists(fp): continue
    code = rd(p)
    if p == "js/core.js" and api_url:
        assert 'API_URL: "",' in code; code = code.replace('API_URL: "",', 'API_URL: ' + json.dumps(api_url) + ',', 1)
    assert "</script" not in code.lower(), p + " contains </script"
    parts.append(f"<script>/* ==== {p} ==== */\n{code}\n</script>")
html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Sense, Send, Solve</title>
<meta name="description" content="Arduino, IoT and data science for the SDGs. A self-paced course for Arduino Uno R4 WiFi, ESP8266 and ESP32 with a virtual lab for learners without a kit.">
<meta name="theme-color" content="#3730A3">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%2317483B'/%3E%3Ccircle cx='10' cy='11' r='2.4' fill='%238FD1B8'/%3E%3Ccircle cx='10' cy='21' r='2.4' fill='%238FD1B8'/%3E%3Cpath d='M14 16h4' stroke='%23C8653A' stroke-width='3'/%3E%3Crect x='18' y='8' width='9' height='16' rx='2' fill='none' stroke='%23E8B84A' stroke-width='2.4'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<meta name="referrer" content="strict-origin-when-cross-origin">
<script src="https://cdn.jsdelivr.net/npm/motion@13.4.4/dist/motion.js" integrity="sha384-beqhCQg6oRAGDM2vrWlhEoFHx4bUtScL926sTbxei5Ub1E+HWLMh2CdHljbCD+qn" crossorigin="anonymous"></script>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Exo:wght@500;600;700&family=Roboto+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
<body>
{rd("shell.html")}
{chr(10).join(parts)}
</body>
</html>
"""
os.makedirs(os.path.join(os.path.dirname(__file__), "dist"), exist_ok=True)
out = os.path.join(os.path.dirname(__file__), "dist", "index.html")
open(out, "w", encoding="utf-8").write(html)
print(out, f"{len(html)/1024:.0f} KB", "| server:", api_url or "none (preview mode)")

# Keep the server's copy of the test answer key and module list in sync with the course content.
import subprocess
key = json.loads(subprocess.check_output(["node", "-e",
    "const fs=require('fs');const T=new Function(fs.readFileSync(process.argv[1],'utf8')+';return TEST')();console.log(JSON.stringify(T.items.map(i=>i.a)))",
    os.path.join(SRC, "content", "tests.js")]).decode())
mods = []
for f in ["u1", "u2", "u3", "u4", "u4b", "u4c", "u5"]:
    mods += re.findall(r'\{id:"(\d\.\d)", title:"[^"]*", minutes:(\d+)(, track:true)?', rd(f"content/{f}.js"))
core = [m for m in mods if not m[2]]; trk = [m for m in mods if m[2]]
hours = round((sum(int(m[1]) for m in core) + (sum(int(m[1]) for m in trk) / len(trk) if trk else 0)) / 60)
gs_path = os.path.join(ROOT, "backend", "Code.gs")
gs = open(gs_path, encoding="utf-8").read()
block = ("// @generated-by-build: do not edit by hand (python3 build.py copies these from src/content/tests.js and the course modules)\n"
         f"const TEST_KEY = {json.dumps(key)};\nconst MODULE_IDS = {json.dumps([m[0] for m in core])};\nconst TRACK_IDS = {json.dumps([m[0] for m in trk])};\nconst COURSE_HOURS = {hours};\n// @end-generated")
gs2 = re.sub(r"// @generated-by-build:.*?// @end-generated", lambda m: block, gs, flags=re.S)
if gs2 != gs: open(gs_path, "w", encoding="utf-8").write(gs2)
print("Code.gs synced:", len(key), "test items,", len(core), "core +", len(trk), "track modules,", hours, "hours")
