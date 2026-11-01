# Sense, Send, Solve

A self-paced course web app: **Fundamentals of Arduino Prototyping, IoT, and Data Science** (Arduino UNO R4 WiFi, ESP8266, ESP32), by Morris C. Bana, LPT.

- **5 units, 22 core modules + 5 IoT-track modules (about 63 hours):** foundations, sensors and actuators, IoT set-up tracks, data science (mapped to Data Science 4 Everyone), and an SDG capstone with a GitHub Pages web app.
- **Pick one IoT track (each has a full step-by-step tutorial ending in Google Colab):** A Google Sheets + Apps Script, B Firebase + Apps Script, C AWS, D Blynk, E ThingSpeak.
- **No kit needed:** every module has a virtual bench (simulated boards, sensors, actuators, and virtual cloud services) with auto-checked missions.
- A learner finishes a unit when all core modules and at least one track module are done.

| Folder / file | What it is |
|---|---|
| `src/` | Source of the web app (JavaScript, CSS, course content) |
| `build.py` | Joins `src/` into one file, `dist/index.html` (the page GitHub Pages serves) |
| `backend/Code.gs`, `backend/README.md` | The course server (Google Apps Script) and its setup guide |
| `test/` | Automated tests: security, sign-in, end-to-end, and a smoke test of every module |
| `.github/workflows/` | CI (tests on every push) and deploy to GitHub Pages (only when tests pass) |
| `PRODUCTION.md` | Security, scaling, monitoring, backups, and the recovery runbook |

```bash
SSS_API_URL=... python3 build.py   # (or put your /exec URL in config.json, which is git-ignored)
python3 build.py            # build dist/index.html (preview mode unless config.json or SSS_API_URL is set)
bash test/run_all.sh           # run every check (needs Node 20, Python 3, and Playwright with Chromium)
```
