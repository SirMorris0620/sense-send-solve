# Sense, Send, Solve: course server setup

The course is two parts, the same setup as *From Sensor to Insight*:

| Part | What it is | Where it lives |
|---|---|---|
| Front end | `index.html` (the whole course in one file) | GitHub Pages |
| Course server | `Code.gs` (this folder), a Google Apps Script web app bound to a Google Sheet | Your personal Google account |

> **Updating from an earlier version (October 10 security update)?** Paste the new `Code.gs`, Save, choose **setup** in the function menu and **Run** it once (Google asks for one new permission: *send email as you*, used for sign-in codes). Then **Deploy → Manage deployments → ✎ Edit → New version → Deploy**. Learners will be asked once to confirm their email with a 6-digit code; after that, their device remembers them. See `PRODUCTION.md` for what changed and why.

Until you connect the server, the course runs in **preview mode**: everything works, but progress is saved only in each learner's browser, and uploads and Proto (the AI assistant) are switched off.

---

## 1. Create the Sheet and the script (10 minutes)

1. Sign in to the Google account that should own the data, then open **sheets.new**. Name it something like *Sense, Send, Solve – course data*.
2. **File → Settings → Time zone:** (GMT+08:00) Manila. Save.
3. **Extensions → Apps Script.** Delete the sample code and paste the whole of `Code.gs`. Save.
4. **Project Settings (gear) → Time zone:** the same zone.
5. In the function menu, choose **setup** and click **Run**. Authorize when asked (*Advanced → Go to project* on the "Google hasn't verified this app" screen; this appears because the script is your own). The Sheet now has these tabs: Learners, Progress, Events, Access, Uploads, AI, Reports, AILog, Usage, Admins, Sessions (sign-in tokens, stored as hashes), Errors, Tests (pre-test and post-test answers and scores), and Certificates. (A **Feedback** tab is added automatically the first time someone sends feedback.)

## 2. Script Properties

**Project Settings → Script Properties → Add script property.**

| Property | Required? | Value |
|---|---|---|
| `ADMIN_PIN` | Yes | A PIN for the teacher dashboard |
| `ADMIN_EMAILS` | Yes (or use the Admins tab) | Comma-separated teacher emails, e.g. your own |
| `GEMINI_API_KEY` | For Proto | A key from Google AI Studio |
| `GEMINI_MODEL` | No | Default `gemini-flash-latest` |
| `GEMINI_FALLBACK_MODEL` | No | Default `gemini-3.5-flash-lite` |
| `ANTHROPIC_API_KEY` | No | Optional final fallback (Claude) |
| `CLAUDE_MODEL` | No | Default `claude-haiku-5-5` |
| `AI_ENABLED` | No | `true` (default) or `false` |
| `AI_MIN_AGE` | No | Default `0`. Set it to the **same** value as `CONFIG.AI_MIN_AGE` in the front end |
| `AI_DAILY_LIMIT` | No | Questions per learner per day (default 30) |
| `UPLOAD_DAILY_LIMIT` | No | Uploads per learner per day (default 20) |
| `UPLOAD_MAX_MB` | No | Default 10 (keep equal to `CONFIG.MAX_UPLOAD_MB`) |
| `ALLOWED_DOMAINS` | No | Restrict sign-ups, e.g. `school.edu.ph,gmail.com`. Blank = any email |
| `UPLOAD_FOLDER_ID` | No | Drive folder for uploads. Leave blank and one is created on the first upload |
| `REQUIRE_EMAIL_CODE` | No | `true` (default): signing in on a new device needs a 6-digit code sent by email. `false`: email-only sign-in (weaker) |
| `BACKUP_KEEP` | No | Daily backup copies to keep (default 14) |
| `CERT_PASS_PCT` | No | Post-test score needed for the certificate, in percent (default 70). `0` = completing the course and taking the post-test is enough |
| `POST_MAX_ATTEMPTS` | No | Post-test attempts per learner (default 3; the best score counts) |
| `ARCHIVE_DAYS` | No | Log rows older than this move to an archive file (default 60) |

**Sign-in codes use your Google account's email quota:** 100 emails a day on a Gmail account, 1,500 on Google Workspace. A code is only needed when someone signs in on a new device, so this is usually plenty. The Teacher dashboard shows how many are left today.

**Use a long `ADMIN_PIN`** (8 or more characters, not a birthday).

Model names change over time. If Proto stops answering, check the current model list on Google AI Studio and update `GEMINI_MODEL` / `GEMINI_FALLBACK_MODEL`. Run **testAsk** from the editor to check your keys (it sends one sample question and no learner data).

Learners below 18 can use Proto only when a parent or guardian agreed at sign-up; the server checks this on every question.

## 3. Deploy

1. **Deploy → New deployment → Select type: Web app.**
2. Execute as: **Me**. Who has access: **Anyone**.
3. Deploy and copy the URL ending in `/exec`.
4. After any later change to `Code.gs`: **Deploy → Manage deployments → ✎ Edit → Version: New version → Deploy.** The URL stays the same.
5. **Rollback:** if an update breaks something, open the same screen and choose the previous **Version**. Same URL, instant.

### Recommended once: backups, archiving, and a health check
- In the function menu choose **installDailyBackup** → Run. The whole Sheet is copied every day at about 2 AM to a *backups* folder (newest 14 kept).
- Choose **installMonthlyArchive** → Run. On the 1st of each month, Events/Access/Errors rows older than 60 days move to an archive file, so the Sheet stays well under Google's 10-million-cell limit.
- Health check for an uptime monitor (for example UptimeRobot, free): your `/exec` URL plus `?health=1`. It returns `{"ok":true,...}` when the server can open the Sheet.
- Lost device: open **revokeSessions**, change the example email to the learner's, and Run to sign them out everywhere.

## 4. Connect the front end

Open `index.html` in a text editor and find this line near the top of the first script:

```js
API_URL: "",
```

Paste your `/exec` URL between the quotes, save, and upload `index.html` to your GitHub repository (Settings → Pages → deploy from the main branch).

**Better: let GitHub do it (no more pasting).** Upload the whole project folder to a GitHub repository, then set the repository variable `SSS_API_URL` to your `/exec` URL and choose **Settings → Pages → Source: GitHub Actions**. Every push to `main` runs all the tests and, only if they pass, builds and publishes `index.html` with your URL already in it. Details are in `PRODUCTION.md` (CI/CD). To build on your own computer instead, copy `config.example.json` to `config.json`, put your URL in it, and run `python3 build.py`.

Also check these lines in the same place:

- `COURSE_CONTACT`: the contact email shown in the Data Privacy Statement.
- `CONFIG.AI_MIN_AGE`, `CONFIG.MAX_UPLOAD_MB`: keep them equal to the Script Properties above.

## 5. Teacher dashboard

The dashboard has its **own sign-in screen inside the app** (no browser pop-up), separate from the learner sign-in. You do **not** need a learner profile to use it.

1. Open your course URL and add `#/admin` to the end (for example `https://yourname.github.io/sense-send-solve/#/admin`), or click **Teacher or course admin? Sign in to the dashboard** under the learner sign-up form. Admins who are also signed in as learners see a **Teacher dashboard** link in the side menu.
2. Enter an email listed in `ADMIN_EMAILS` (or the Admins tab) and the `ADMIN_PIN`.
3. The server checks both and gives that browser tab a session that lasts up to 6 hours. **Sign out** ends it right away. After 5 wrong tries for one email, sign-in for that email is locked for 15 minutes.

The dashboard shows each learner's active time, modules completed, board, last visit, and a link to their upload folder, with a CSV download. Below that is a **Feedback** summary: the course evaluation averages, confidence before and after, Net Promoter Score, each module's usefulness and difficulty ratings, and every comment or problem report (filterable, with a CSV download).

### Presenter mode (teaching in class)
Signed in as an admin, every module shows **▶ Present to class**. The module becomes slides: a title slide with the objectives, one slide per section (animations, Mission Labs, and sandboxes stay live), one “check for understanding” slide per quiz question with a **Reveal answer** button, and a wrap-up slide with the checkpoint task.
- Keys: **→ / Space** next, **←** back, **F** full screen, **B** blank the screen, **P** presenter view, **Esc** exit. The bottom bar also has 3, 5, and 10-minute activity timers.
- **Presenter view** opens in a second window: the current and next slide, suggested time per slide, teaching notes (generated from what is on the slide), your own notes per slide (saved on that device), an activity timer, and the outline (tap any slide to jump). Put it on your laptop screen and the slides on the projector (extend, not mirror, your display). Allow pop-ups for the course site if the window does not open.

## 6. Unit locks

Unit 1 opens after the pre-test. Each later unit opens only after a learner finishes every module in the earlier units (all required sections marked done, the quiz answered, and the self-rating chosen). Units are locked in the app, not on the server, so this guides learners but is not a security barrier.

- **Admins are never locked.** Any email in `ADMIN_EMAILS` or the Admins tab sees every unit when signed in as a learner, and so does anyone signed in to the Teacher dashboard in that browser tab. If you add an admin email later, it takes effect the next time that person opens the app.
- **To turn locks off** for everyone, set `LOCK_UNITS: false` in the `CONFIG` block near the top of `index.html`.

## 6b. Pre-test, post-test, and certificate

- **Pre-test:** every learner takes it before Module 1.1 (34 questions, about 35 minutes, not graded, one attempt). It measures what they knew at the start. To skip it, set `REQUIRE_PRETEST: false` in the `CONFIG` block of `index.html`.
- **Post-test:** the same 34 questions, so you can measure learning gain. It opens only after every module is complete. Pass mark `CERT_PASS_PCT` (default 70%), up to `POST_MAX_ATTEMPTS` tries (default 3), best score counts. Answers are reviewed only after passing or after the last attempt.
- **Certificate:** issued only when every core module and at least one IoT-track module are complete and the post-test is passed. The learner confirms the spelling of their name once; the name cannot be changed afterwards. Each certificate has an ID (like `B2B-7F3K-Q9P2`) and a public verification link (`…/#/verify/B2B-7F3K-Q9P2`) that shows only the name, course, and date.
- **Scoring happens on the server.** `build.py` copies the answer key into `Code.gs` automatically, so if you edit the questions in `src/content/tests.js`, rebuild and paste the new `Code.gs` too.
- **Admins** are never locked and can take either test anytime (their scores are included in the data; filter them out in your analysis).
- **Teacher dashboard → Pre-test, post-test, and certificates:** number of tests taken, average pre and best post scores for matched learners, average gain and normalized gain ⟨g⟩, a per-question item analysis (pre vs. post % correct), the certificate list, and a CSV of every attempt with item-level correctness for research.

## 6c. Badges

Learners earn 24 badges automatically, in four groups:
- **Milestones:** the pre-test, finishing each unit, and the certificate.
- **Skills:** sandbox and Mission Lab challenges, wiring, Apps Script, web, perfect quizzes, a high post-test score, and a big pre-to-post gain.
- **AI literacy:** the PARTS lab and prompt gallery, checking an AI answer, and keeping an AI-use log.
- **Habits:** choosing an SDG target, sending feedback, learning on 3 different days, 10 active hours, and trying 25 activities.

New badges pop up with a short celebration. **My badges** (side menu, home page, and My progress) shows every badge, what it takes, and progress toward it. Badges are saved with the learner's progress on the server, so they follow them to other devices, and the Teacher dashboard shows each learner's badge count. To change a badge, edit the `BADGES` list in `src/js/badges.js` and rebuild.

## 7. Feedback

Learners can send three kinds of feedback, saved in the Feedback tab:
- **Module feedback** (optional, at the end of every module): a 1–5 usefulness rating, difficulty, what worked, and what to improve. Sending again updates the same row.
- **Course feedback** (side menu → Course feedback): eight agree/disagree statements, confidence before and after the course, likelihood to recommend (0–10), and two open questions. Learners are invited to send it when they finish the last module. Sending again updates the same row.
- **Report a problem or idea** (side menu): a short message with the page it was sent from.

## 8. Remembered emails

When someone signs in on a device, the app remembers their profile on that device. Next time, the sign-in screen shows **Continue as [name]**, so they do not type their email again. **Use a different email** shows the email box. On shared computers or iPads, learners can tap **✕** to remove their name from that device; their progress on the server is kept.


> **Updating from an earlier version?** The in-app admin sign-in needs the new `Code.gs`. Paste it over the old one, save, then **Deploy → Manage deployments → ✎ Edit → Version: New version → Deploy**. The `/exec` URL stays the same, so you do not need to change `index.html`. If you skip this step, the sign-in screen will say the course server is an older version.

## What is stored, and limits to know

- **Learners:** profile from the sign-up form, consents, board, active minutes, upload folder link.
- **Progress:** sections, quiz answers, self-ratings, and activity results (so learners can continue on another device).
- **Events / Access:** timestamped learning events and visits (for progress and, with consent, research).
- **AI / Reports / AILog:** questions to Proto and answers, reported answers, and learners' AI-use log entries. Text that looks like a password or API key is replaced with `[removed]` before it is stored or sent to an AI provider.
- **Uploads:** files go to one Drive folder per learner, inside the uploads folder. Only you (the owner) can open them unless you share them.

Honest limitations of this design (the same as the earlier course):

- Learners are identified by **email only**, with no password. Anyone who knows a learner's email could add events under that email or see their first name, role, and progress through "Welcome back". Do not use the course for high-stakes grading without an extra check, and do not collect more personal data than the form asks for.
- Apps Script has daily quotas and a limit on simultaneous executions per account. A class of about 40 active learners is fine; for much larger groups, increase `CONFIG.HEARTBEAT_SECONDS` in the front end (fewer requests) or use a second deployment on another account.
- Delete or archive old rows (for example, the Events tab) at the end of each term to keep the Sheet fast.
