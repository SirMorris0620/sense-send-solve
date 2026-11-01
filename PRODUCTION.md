# Production readiness: Sense, Send, Solve

An honest check of this app against the questions a production team asks, what was fixed on 2026-10-10, and what remains a known limit of the GitHub Pages + Google Apps Script + Google Sheets setup.

**Architecture in one line:** a static web page (GitHub Pages) talks over HTTPS to one Google Apps Script web app, which reads and writes one Google Sheet and a Drive folder. Learners never touch the Sheet directly.

| Area | Before | Now | Remaining limit |
|---|---|---|---|
| Auth and permissions | ❌ Anyone who knew a learner's email could open their profile, read their progress, and act as them | ✅ Session tokens; new devices need a 6-digit email code | Email codes use the MailApp daily quota |
| Row-level security | ⚠️ Server trusted the email in each request | ✅ The server takes the email from the token, so each learner can only read and write their own rows | Sheets has no built-in RLS; the server is the only gate, so keep the Sheet private |
| Rate limiting | ⚠️ Only AI questions and uploads were limited | ✅ Per-learner, per-email and server-wide limits on every action | Apps Script cannot see IP addresses, so limits are per email or token, plus global caps |
| Hosting and deployment | ✅ GitHub Pages (HTTPS, CDN) + Apps Script deployments | ✅ Same, plus an automatic deploy workflow | GitHub Pages is not meant for commercial SaaS |
| Cloud and compute | ✅ Serverless (no servers to patch) | ✅ Same | 30 simultaneous executions per account, 6 minutes per request |
| CI/CD and version control | ❌ None | ✅ Git-ready repo, GitHub Actions: test on every push, deploy only if tests pass | Apps Script code is still pasted by hand (optional: clasp) |
| Caching and CDN | ⚠️ Every request searched the Sheet | ✅ Sessions and row lookups are cached for 6 hours; the page is served from GitHub's CDN; the animation library is pinned with an integrity hash | No offline service worker |
| Load balancing and scaling | ⚠️ Fixed retry-free requests, a heartbeat every minute | ✅ Google scales Apps Script automatically; the app now retries with backoff, sends one heartbeat every 3 active minutes, and queues when offline | About 100–200 learners active at the same moment before "busy" retries appear (estimate) |
| Error tracking and logs | ❌ Browser errors were invisible; server errors only in Executions | ✅ Errors tab (browser + server + security events), shown in the Teacher dashboard | No alerting by email/SMS |
| Availability and recovery | ⚠️ Only Sheet version history | ✅ Daily backup copies (kept 14 days), monthly log archiving, a health-check URL, rollback steps below | Single region and single Google account |

## 1. Security

### Auth and permissions
- **Learners.** Registering creates a profile and returns a random 64-character session token, stored on that device. Every later request must carry it. Signing in on another device: the server emails a 6-digit code (10-minute expiry, 5 tries, single use, max 3 codes per email per hour), then issues a new token. Tokens are stored in the **Sessions** tab only as SHA-256 hashes, so a leaked Sheet does not leak working tokens. "Remove from this device (✕)" revokes that device's token.
- **Re-registering an existing email is refused** (it used to overwrite the profile).
- **Teachers/admins.** Separate in-app sign-in: an email in `ADMIN_EMAILS` (or the Admins tab) + `ADMIN_PIN`. 6-hour session; 5 wrong tries per email or 30 across all emails lock sign-in for 15 minutes. Wrong attempts are logged as security events.
- **Turning codes off.** Script Property `REQUIRE_EMAIL_CODE = false` goes back to email-only sign-in. Only do this if email delivery is a problem: it means anyone who knows an email can open that account.
- **Use a long PIN.** At least 8 characters, not a birthday.

### Row-level security (RLS)
Google Sheets has no RLS, so the Apps Script server is the only door:
- The browser never receives the Sheet ID or reads the Sheet. Keep the Sheet and Drive folders **shared with nobody** (or only co-teachers).
- Every learner action uses the email from the session token, never the email in the request. A forged email is ignored (tested).
- Admin data needs an admin session token; a learner token is refused (tested).
- Uploads go into a private per-learner Drive folder.

### Injection and secrets
- **Formula injection:** any text starting with `= + - @` is stored with a leading `'`, so a name like `=IMPORTXML(...)` stays plain text instead of running in your Sheet. Emails must start with a letter or number.
- **CSV injection:** CSV downloads in the dashboard apply the same rule, so they are safe to open in Excel or Sheets.
- **XSS:** all learner text shown in the app is HTML-escaped.
- **Secrets:** API keys live only in Script Properties. The page contains no secrets (the /exec URL is public by design). Secrets typed into Proto or the AI log are scrubbed before storage.
- **Supply chain:** the one external script (Motion) is pinned to an exact version with a Subresource Integrity hash; if the CDN file changed, the browser would refuse it and the app would still work, just without animations.

### Rate limiting
| What | Limit |
|---|---|
| Any learner action | 120 per minute per learner |
| Whole server | 6,000 requests per minute (brake against floods) |
| Sign-ups | 300 per hour (all emails) |
| Sign-in lookups | 6 per 15 minutes per email; 600 per hour total |
| Email codes | 3 per hour per email, and only while the MailApp quota lasts |
| Code guesses | 5 per code |
| Feedback / AI-answer reports | 30 per hour per learner |
| Browser error reports | 30 per hour per learner; 2,000 per day total |
| Proto questions / uploads | `AI_DAILY_LIMIT` / `UPLOAD_DAILY_LIMIT` per learner per day |
| Request size | 300 KB (16 MB for uploads) |

Apps Script does not expose the caller's IP address, so these limits are per email/token plus server-wide caps.

### Known risk accepted
- The sign-in step reveals whether an email has a profile ("we couldn't find that email"). This keeps sign-in friendly; the rate limits make mass-checking slow.

## 2. Shipping

### Hosting and deployment
- **Front end:** GitHub Pages, HTTPS, served from GitHub's CDN. Limits: 1 GB site, 100 GB/month soft bandwidth, not for commercial SaaS (GitHub Pages limits page).
- **Back end:** Apps Script web app, "Execute as: Me", "Who has access: Anyone". Every **Deploy → Manage deployments → Edit → New version** keeps the same /exec URL and a numbered version you can roll back to.

### Cloud and compute
Serverless: Google runs and patches the servers. Quotas that matter (Google Apps Script quotas page, checked 2026-10-10):

| Quota | Gmail account | Google Workspace |
|---|---|---|
| Simultaneous executions per user | 30 | 30 |
| Script runtime per execution | 6 min | 6 min |
| Email recipients per day (sign-in codes) | 100 | 1,500 |
| URL Fetch calls per day (Proto) | 20,000 | 100,000 |
| Triggers total runtime per day (backups) | 90 min | 6 h |

Because the web app runs as you, all learners share your 30 simultaneous executions and your email quota. If many learners will sign in on new devices on the same day, run the server from a Google Workspace account (1,500 emails/day).

### CI/CD and version control
The project is ready for a GitHub repository:
- `.github/workflows/ci.yml`: on every push and pull request, checks syntax, builds, runs the security tests (22 attack checks), sign-in tests, end-to-end tests against a mock Apps Script, and the smoke test (every module, every sandbox, three boards).
- `.github/workflows/deploy.yml`: on every push to `main`, runs the same tests and, only if they pass, builds `index.html` with your server URL and publishes it to Pages.
- **You never paste the API URL into index.html again.** It comes from the repository variable `SSS_API_URL` (or `config.json` when you build on your own computer).

One-time setup:
1. Create a GitHub repository and upload this folder (or `git init`, `git add .`, `git commit`, `git push`).
2. Settings → Pages → Source: **GitHub Actions**.
3. Settings → Secrets and variables → Actions → Variables → **New repository variable**: `SSS_API_URL` = your `https://script.google.com/macros/s/.../exec`.
4. Push to `main`. The Actions tab shows the tests, then the deployment.

Apps Script code is still updated by pasting `backend/Code.gs`. Optional: Google's `clasp` tool can push it from the repository (`npm i -g @google/clasp`, `clasp login`, `clasp clone <scriptId>`, then `clasp push` and `clasp deploy -i <deploymentId>`).

## 3. Speed

### Caching and CDN
- The page (about 1.1 MB, much smaller compressed) is served by GitHub's CDN. Fonts come from Google Fonts' CDN.
- Session checks and row lookups are cached in CacheService for up to 6 hours, so most requests skip searching the Sheet (each cached row is double-checked before use).
- Progress, profiles, and AI-use logs are kept in the browser, so the app opens instantly and works offline; changes sync in the background.
- Not done: a service worker for full offline loading (it would need a second file and careful cache-busting on every update).

## 4. Traffic

### Load balancing and scaling
- Google load-balances Apps Script automatically; there is nothing to configure.
- The ceiling is the 30 simultaneous executions and writes taking turns under LockService. **Estimate** (not load-tested against real Google servers): comfortable for 100–200 learners active at the same moment; above that, some requests get "busy" and the app retries them automatically.
- Load reductions made: one heartbeat every 3 active minutes (was every minute), events sent in batches, retries with exponential backoff and jitter, an offline queue that replays later, and locks that give up after 15 seconds (reported as "busy") instead of failing.
- **Sheet size:** a spreadsheet holds at most 10 million cells. The Events tab grows fastest. `archiveOldLogs()` moves Events/Access/Errors rows older than 60 days to an archive file; schedule it with `installMonthlyArchive()`.
- If the course grows past a few hundred simultaneous learners, the next step is a real database (for example Firebase or Supabase with row-level security) behind the same front end.

## 5. Survival

### Error tracking and logs
- **Errors tab:** uncaught browser errors (with page and line), server errors (with action and stack), and security events (wrong admin PINs). Deduplicated and rate-limited so it cannot flood the Sheet.
- **Teacher dashboard → Health and errors:** errors in the last 24 hours, the latest 100 errors, email codes left today, and the server version.
- **Apps Script → Executions:** Google's own log of every request.
- Not done: alerts. Free option: point an uptime monitor at the health URL (below).

### Availability and recovery
- **Health check:** `https://script.google.com/macros/s/.../exec?health=1` returns `{"ok":true,...}` when the server can open the Sheet. Add it to a free uptime monitor (for example UptimeRobot) to get an email if it goes down.
- **Backups:** run `installDailyBackup()` once. Every day at about 2 AM it copies the whole Sheet into a "backups" folder and keeps the newest 14 (`BACKUP_KEEP`).
- **Offline resilience:** if the server or network is down, learners keep working; their progress is saved on the device and synced later.

#### Recovery runbook
| Problem | Do this |
|---|---|
| A bad Code.gs update | Deploy → Manage deployments → Edit → Version: pick the previous version → Deploy. Same URL, instant rollback. |
| A bad front-end update | On GitHub: revert the commit (or re-run an older successful deploy). With manual hosting: upload the previous index.html. |
| Rows deleted or damaged | File → Version history in the Sheet, or open yesterday's backup copy and copy the rows back. |
| Sheet deleted | Restore it from Drive Trash within 30 days (the script comes back with it). If it is gone for good: open the newest backup copy, Extensions → Apps Script, paste Code.gs, add the Script Properties again, deploy, and update `SSS_API_URL`. |
| Learners see "busy" often | Check Executions for slow requests; archive old logs; consider a Workspace account or a real database. |
| Sign-in codes stopped | The daily email quota is used up (dashboard shows "codes left today"). Learners on devices they already used are not affected. Temporarily set `REQUIRE_EMAIL_CODE = false` only if you must. |
| Admin PIN leaked | Change `ADMIN_PIN` in Script Properties. Existing admin sessions end within 6 hours. |
| A learner's device was lost | In the Apps Script editor, open `revokeSessions`, put their email in the function call (or edit the default), and Run. They are signed out of every device right away and sign in again with a code. |

## How this was tested
- `test/backend/assess_test.py`: 16 server checks for the pre-test, post-test, and certificate (single pre-test, post-test locked until completion, attempt limit, pass mark, certificate issued once, public verification).
- `test/backend/security_test.py`: 22 attack checks against the real Code.gs running on a mock Apps Script (stolen email, forged email, fake token, code brute force, formula injection, rate limits, oversized payloads, admin brute force, token revocation, hashed storage).
- `test/backend/signin_test.py` and `flow_test.py`: sign-up, sign-in with codes, remembered devices, old sessions, uploads, Proto, feedback, admin dashboard, in a real browser.
- `test/smoke.py`: every module, every interactive, every sandbox solution on all three boards.
- Not tested: real Google servers under load, real email delivery, real hardware.
