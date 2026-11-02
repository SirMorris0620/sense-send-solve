/**
 * Sense, Send, Solve: course server (Code.gs)
 * ---------------------------------------------------
 * A Google Apps Script web app bound to a Google Sheet. The course web page (index.html on GitHub Pages)
 * sends JSON with POST requests; this script stores profiles, progress, events, uploads, AI-use logs,
 * and answers questions to "Proto", the course AI assistant.
 *
 * Setup: see README.md in the same folder. In short:
 *   1. Make a new Google Sheet → Extensions → Apps Script → paste this file.
 *   2. Run setup() once and authorize.
 *   3. Project Settings → Script Properties: add ADMIN_PIN, GEMINI_API_KEY (and optional keys below).
 *   4. Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone). Copy the /exec URL
 *      into CONFIG.API_URL in index.html.
 *
 * Script Properties (all optional except ADMIN_PIN):
 *   ADMIN_PIN              PIN for the teacher dashboard (required to view learner data)
 *   ADMIN_EMAILS           comma-separated teacher emails (or list them in the Admins tab)
 *   GEMINI_API_KEY         key from Google AI Studio (Proto's main model)
 *   GEMINI_MODEL           default gemini-flash-latest
 *   GEMINI_FALLBACK_MODEL  default gemini-3.5-flash-lite
 *   ANTHROPIC_API_KEY      optional last fallback (Claude)
 *   CLAUDE_MODEL           default claude-haiku-5-5
 *   AI_ENABLED             "true" (default) or "false"
 *   AI_MIN_AGE             minimum age for Proto (default 0; set the same value as CONFIG.AI_MIN_AGE)
 *   AI_DAILY_LIMIT         questions per learner per day (default 30)
 *   UPLOAD_DAILY_LIMIT     uploads per learner per day (default 20)
 *   UPLOAD_MAX_MB          default 10 (keep equal to CONFIG.MAX_UPLOAD_MB)
 *   ALLOWED_DOMAINS        e.g. "school.edu.ph,gmail.com" to restrict sign-ups (blank = any email)
 *   UPLOAD_FOLDER_ID       Drive folder for uploads (created automatically if blank)
 *   REQUIRE_EMAIL_CODE     "true" (default): signing in on a new device needs a 6-digit code sent by email.
 *                          "false": email-only sign-in (weaker; anyone who knows an email can open that account)
 *   BACKUP_KEEP            how many daily backup copies to keep (default 14)
 *   CERT_PASS_PCT          post-test score needed for the certificate, in percent (default 70; 0 = completion only)
 *   POST_MAX_ATTEMPTS      post-test attempts allowed (default 3; the best score counts)
 *   BACKUP_FOLDER_ID       Drive folder for backups (created automatically if blank)
 */
const SERVER_VERSION = '2026-10-10';
const COURSE_NAME = 'Sense, Send, Solve';
const TABS = {
  Learners: ['email', 'givenName', 'lastName', 'name', 'age', 'role', 'gradeLevels', 'school', 'industry', 'board', 'privacyConsent', 'guardianConsent', 'researchConsent', 'researchGuardian', 'device', 'created', 'lastSeen', 'minutes', 'folderUrl'],
  Progress: ['email', 'updated', 'json'],
  Events: ['timestamp', 'email', 'sessionId', 'moduleId', 'itemId', 'type', 'value'],
  Access: ['timestamp', 'email', 'sessionId', 'page', 'device', 'board', 'userAgent'],
  Uploads: ['timestamp', 'email', 'moduleId', 'fileName', 'mimeType', 'bytes', 'fileUrl'],
  AI: ['timestamp', 'email', 'moduleId', 'model', 'question', 'answer', 'ms'],
  Reports: ['timestamp', 'email', 'moduleId', 'reason', 'question', 'answer'],
  AILog: ['timestamp', 'email', 'entryId', 'date', 'module', 'tool', 'framework', 'task', 'prompt', 'verify', 'decision', 'disclose'],
  Usage: ['key', 'count'],
  Admins: ['email', 'note'],
  Feedback: ['timestamp', 'email', 'kind', 'key', 'moduleId', 'page', 'rating', 'difficulty', 'scores', 'nps', 'comment', 'improve', 'device'],
  Sessions: ['tokenHash', 'email', 'created', 'lastUsed', 'device'],
  Errors: ['timestamp', 'source', 'email', 'where', 'message', 'detail', 'userAgent'],
  Tests: ['timestamp', 'email', 'kind', 'attempt', 'score', 'total', 'percent', 'answers', 'seconds', 'version'],
  Certificates: ['id', 'email', 'name', 'issued', 'prePercent', 'postPercent', 'hours']
};
// @generated-by-build: do not edit by hand (python3 build.py copies these from src/content/tests.js and the course modules)
const TEST_KEY = [0, 1, 2, 3, 1, 2, 3, 0, 2, 3, 0, 1, 3, 0, 1, 2, 0, 1, 1, 3, 0, 2, 1, 2, 0, 3, 1, 0, 2, 3, 0, 1, 3, 0];
const MODULE_IDS = ["1.1", "1.2", "1.3", "1.4", "1.5", "2.1", "2.2", "2.3", "2.4", "2.5", "3.1", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6"];
const TRACK_IDS = ["3.2", "3.3", "3.4", "3.5", "3.6"];
const COURSE_HOURS = 81;
// @end-generated
const L = {}; TABS.Learners.forEach((h, i) => L[h] = i + 1);   // column numbers in Learners

/* ---------------- entry points ---------------- */
function doGet(e) {
  if (e && e.parameter && e.parameter.health) {   // for uptime monitors: ...exec?health=1
    let sheet = false; try { sheet = !!ss_().getId(); } catch (x) {}
    return json_({ok: sheet, service: COURSE_NAME, version: SERVER_VERSION, time: new Date().toISOString()});
  }
  return ContentService.createTextOutput(COURSE_NAME + ' course server is running. Use POST.');
}

const PUBLIC = {lookup: lookup_, verify: verify_, register: register_, verifyCert: verifyCert_, adminLogin: adminLogin_, adminData: adminData_, adminLogout: adminLogout_};
const AUTHED = {access: access_, heartbeat: heartbeat_, event: event_, upload: upload_, ask: ask_, report: report_, consent: consent_,
  ailog: ailog_, board: board_, feedback: feedback_, clientError: clientError_, logout: logout_, test: test_, certificate: certificate_};

function doPost(e) {
  let req, action = '';
  try {
    const raw = (e && e.postData && e.postData.contents) || '';
    if (raw.length > 16 * 1024 * 1024) return json_({ok: false, error: 'too_large'});
    try { req = JSON.parse(raw); } catch (x) { return json_({ok: false, error: 'bad_json'}); }
    action = String(req.action || '');
    if (action !== 'upload' && raw.length > 300 * 1024) return json_({ok: false, error: 'too_large'});
    req.email = String(req.email || '').trim().toLowerCase();
    if (!rl_('all', 6000, 60)) return json_({ok: false, error: 'busy', retryAfter: 30});              // whole-server brake
    if (PUBLIC[action]) return json_(PUBLIC[action](req));
    if (!AUTHED[action]) return json_({ok: false, error: 'unknown_action'});
    // Every learner action needs a session token. The email comes from the token, never from the request.
    const email = sessionEmail_(req.token);
    if (!email) return json_({ok: false, error: 'auth_required'});
    req.email = email;
    if (!rl_('u_' + email, 120, 60)) return json_({ok: false, error: 'rate_limited', retryAfter: 60});  // 120 requests a minute per learner
    return json_(AUTHED[action](req));
  } catch (x) {
    const busy = /lock|timed out|too many times/i.test(String(x));
    console.error(action + ': ' + (x && x.stack || x));
    logError_('server', req && req.email, action, String(x && x.message || x), String(x && x.stack || '').slice(0, 800), '');
    return json_({ok: false, error: busy ? 'busy' : 'server_error'});
  }
}

/** Run once from the editor: creates every tab with its header row. */
function setup() {
  Object.keys(TABS).forEach(sh_);
  const p = PropertiesService.getScriptProperties();
  if (!p.getProperty('ADMIN_PIN')) console.log('Next: add ADMIN_PIN (and GEMINI_API_KEY) in Project Settings → Script Properties.');
  console.log('Tabs ready: ' + Object.keys(TABS).join(', '));
  console.log('Emails you can still send today (sign-in codes): ' + MailApp.getRemainingDailyQuota());   // also asks for the email permission
  console.log('Optional: run installDailyBackup() once to back up the Sheet every day.');
}

/* ---------------- actions ---------------- */
function register_(r) {
  const age = Math.round(Number(r.age));
  if (!(age >= 5 && age <= 100)) return {ok: false, error: 'invalid_age'};
  if (r.privacyConsent !== true) return {ok: false, error: 'consent_required'};
  if (age < 18 && r.guardianConsent !== true) return {ok: false, error: 'guardian_consent_required'};
  const now = new Date();
  const research = r.researchConsent === true && (age >= 18 || r.researchGuardian === true);
  const values = {email: r.email, givenName: clip_(r.givenName, 60), lastName: clip_(r.lastName, 60), name: clip_(r.name, 120), age: age,
    role: clip_(r.role, 20), gradeLevels: (Array.isArray(r.gradeLevels) ? r.gradeLevels : []).map(String).join('; ').slice(0, 200),
    school: clip_(r.school, 120), industry: clip_(r.industry, 80), board: clip_(r.board, 12), privacyConsent: true,
    guardianConsent: age < 18, researchConsent: research, researchGuardian: age < 18 ? r.researchGuardian === true : false,
    device: clip_(r.device, 12), lastSeen: now};
  if (!validEmail_(r.email)) return {ok: false, error: 'invalid_email'};
  if (!rl_('reg', 300, 3600)) return {ok: false, error: 'rate_limited', retryAfter: 600};   // at most 300 sign-ups an hour
  let exists = false;
  withLock_(() => {
    if (findRow_('Learners', r.email)) { exists = true; return; }   // never overwrite an existing profile
    values.created = now; values.minutes = 0; values.folderUrl = '';
    sh_('Learners').appendRow(TABS.Learners.map(h => values[h] === undefined ? '' : values[h]));
  });
  if (exists) return {ok: false, error: 'exists'};
  return {ok: true, admin: isAdmin_(r.email), token: newSession_(r.email, r.device)};
}

/** Sign-in step 1. Says whether the email has a profile, and (by default) emails a 6-digit code. Never returns profile data. */
function lookup_(r) {
  const email = r.email;
  if (!validEmail_(email)) return {ok: false, error: 'invalid_email'};
  if (!rl_('lk_' + email, 6, 900) || !rl_('lk', 600, 3600)) return {ok: false, error: 'rate_limited', retryAfter: 300};
  if (!findRow_('Learners', email)) return {ok: true, found: false};
  if (prop_('REQUIRE_EMAIL_CODE', 'true') === 'false') return Object.assign({ok: true, found: true}, signedIn_(email, r.device));
  if (!rl_('code_' + email, 3, 3600)) return {ok: false, error: 'too_many_codes', retryAfter: 900};
  const code = String(Math.floor(100000 + Math.random() * 900000));
  try {
    if (MailApp.getRemainingDailyQuota() < 2) return {ok: false, error: 'email_quota'};
    MailApp.sendEmail({to: email, name: COURSE_NAME, subject: 'Your sign-in code: ' + code,
      body: 'Your sign-in code for ' + COURSE_NAME + ' is ' + code + '.\n\nIt expires in 10 minutes. If you did not try to sign in, you can ignore this email; nobody can open your account without this code.'});
  } catch (x) {
    // Most common cause: the script was never given permission to send email (run setup or testEmail once in the editor).
    const noPermission = /permission|authoriz|script\.send_mail/i.test(String(x));
    logError_('server', email, 'lookup (sending code)', String(x && x.message || x), noPermission ? 'Fix: in the Apps Script editor run testEmail (or setup) once, allow "Send email as you", then deploy a new version.' : '', '');
    return {ok: false, error: noPermission ? 'email_not_allowed' : 'email_failed'};
  }
  CacheService.getScriptCache().put('otp_' + email, JSON.stringify({h: sha_(code + '|' + email), n: 0}), 600);   // 10 minutes
  return {ok: true, found: true, codeSent: true};
}
/** Sign-in step 2: check the code, then return a session token, the profile, and saved progress. */
function verify_(r) {
  const email = r.email, cache = CacheService.getScriptCache(), raw = cache.get('otp_' + email);
  if (!validEmail_(email) || !raw) return {ok: false, error: 'code_expired'};
  const o = JSON.parse(raw);
  if (o.n >= 5) { cache.remove('otp_' + email); return {ok: false, error: 'code_expired'}; }
  if (sha_(String(r.code || '').replace(/\D/g, '') + '|' + email) !== o.h) { o.n++; cache.put('otp_' + email, JSON.stringify(o), 600); return {ok: false, error: 'bad_code', triesLeft: 5 - o.n}; }
  cache.remove('otp_' + email);
  return Object.assign({ok: true}, signedIn_(email, r.device));
}
function signedIn_(email, device) {
  const row = findRow_('Learners', email);
  const v = sh_('Learners').getRange(row, 1, 1, TABS.Learners.length).getValues()[0], get = k => v[L[k] - 1], age = Number(get('age'));
  return {token: newSession_(email, device),
    profile: {givenName: get('givenName'), lastName: get('lastName'), role: get('role'), gradeLevels: String(get('gradeLevels') || '').split('; ').filter(String),
      minor: age < 18, aiAllowed: aiAllowed_(age, get('guardianConsent') === true), researchConsent: get('researchConsent') === true ? 'yes' : 'no',
      board: get('board'), admin: isAdmin_(email)},
    progress: readProgress_(email), tests: testSummary_(email)};
}
/** What the app needs to know about a learner's tests and certificate (no answers). */
function testSummary_(email) {
  const rows = testRows_(email), pre = rows.filter(x => x[2] === 'pre'), post = rows.filter(x => x[2] === 'post');
  const at = findRow_('Certificates', email, 2), c = at ? sh_('Certificates').getRange(at, 1, 1, 7).getValues()[0] : null;
  return {pre: pre.length ? {score: pre[0][4], total: pre[0][5], percent: pre[0][6]} : null,
    post: post.map(x => ({score: x[4], total: x[5], percent: x[6]})), passPct: Number(prop_('CERT_PASS_PCT', '70')), maxAttempts: Number(prop_('POST_MAX_ATTEMPTS', '3')),
    cert: c ? {id: c[0], name: c[2], issued: fmtDate_(c[3]), hours: c[6]} : null};
}
function logout_(r) {
  const h = sha_(String(r.token || ''));
  withLock_(() => { const row = findRow_('Sessions', h); if (row) sh_('Sessions').getRange(row, 1).setValue('revoked ' + new Date().toISOString()); });
  CacheService.getScriptCache().remove('s_' + h);
  return {ok: true};
}
function clientError_(r) {
  if (!rl_('ce_' + r.email, 30, 3600) || !rl_('ce', 2000, 86400)) return {ok: true, dropped: true};
  (Array.isArray(r.errors) ? r.errors : []).slice(0, 10).forEach(x =>
    logError_('client', r.email, clip_(x.where, 80), clip_(x.message, 500), clip_(x.detail, 1500), clip_(r.userAgent, 140)));
  return {ok: true};
}

function access_(r) {
  sh_('Access').appendRow([new Date(), r.email, clip_(r.sessionId, 40), clip_(r.page, 30), clip_(r.device, 12), clip_(r.board, 12), clip_(r.userAgent, 140)]);
  withLock_(() => {
    const row = findRow_('Learners', r.email); if (!row) return;
    const sh = sh_('Learners'); sh.getRange(row, L.lastSeen).setValue(new Date());
    if (r.board) sh.getRange(row, L.board).setValue(clip_(r.board, 12));
  });
  return {ok: true, admin: isAdmin_(r.email), tests: testSummary_(r.email)};
}

/** Learner feedback. kind = 'module' (one per module, updated if sent again), 'course' (one per learner, updated), or 'general' (always added). */
function feedback_(r) {
  if (!rl_('fb_' + r.email, 30, 3600)) return {ok: false, error: 'rate_limited', retryAfter: 600};
  const kind = ['module', 'course', 'general'].indexOf(r.kind) >= 0 ? r.kind : 'general';
  const num = (v, lo, hi) => { const n = Number(v); return isFinite(n) && n >= lo && n <= hi ? n : ''; };
  let scores = {};
  if (r.scores && typeof r.scores === 'object') Object.keys(r.scores).slice(0, 30).forEach(k => { const n = num(r.scores[k], 1, 5); if (n !== '') scores[clip_(k, 30)] = n; });
  const key = kind === 'module' ? r.email + '|module|' + clip_(r.moduleId, 8) : kind === 'course' ? r.email + '|course' : '';
  const row = [new Date(), r.email, kind, key, clip_(r.moduleId, 8), clip_(r.page, 60), num(r.rating, 1, 5), clip_(r.difficulty, 20),
    Object.keys(scores).length ? JSON.stringify(scores) : '', num(r.nps, 0, 10), clip_(r.comment, 2000), clip_(r.improve, 2000), clip_(r.device, 12)];
  withLock_(() => {
    const sh = sh_('Feedback'), at = key ? findRow_('Feedback', key, 4) : 0;
    if (at) sh.getRange(at, 1, 1, row.length).setValues([row]); else sh.appendRow(row);
  });
  return {ok: true};
}

function heartbeat_(r) {
  const m = Math.min(Math.max(Number(r.minutes) || 0, 0), 10);   // the app sends every ~3 active minutes; never trust more than 10
  withLock_(() => {
    const row = findRow_('Learners', r.email); if (!row) return;
    const sh = sh_('Learners');
    const cur = Number(sh.getRange(row, L.minutes).getValue()) || 0;
    sh.getRange(row, L.minutes, 1, 1).setValue(Math.round((cur + m) * 100) / 100);
    sh.getRange(row, L.lastSeen).setValue(new Date());
  });
  return {ok: true};
}

function event_(r) {
  const ev = (Array.isArray(r.events) ? r.events : []).slice(0, 200);
  if (!ev.length) return {ok: true, n: 0};
  const rows = ev.map(x => [new Date(Number(x.ts) || Date.now()), r.email, clip_(r.sessionId, 40), clip_(x.moduleId, 12), clip_(x.itemId, 60), clip_(x.type, 30), clip_(x.value, 400)]);
  withLock_(() => {
    const sh = sh_('Events');
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    const p = readProgress_(r.email);
    ev.forEach(x => {
      const m = String(x.moduleId || ''), id = String(x.itemId || ''), v = String(x.value == null ? '' : x.value), t = Number(x.ts) || Date.now();
      if (x.type === 'section_done') p.done[m + ':' + id] = t;
      else if (x.type === 'module_done') p.done[m + ':__module'] = t;
      else if (x.type === 'quiz') { const n = Number(id.replace(/^q/, '')) - 1, k = Number(v.split('|')[1]); if (n >= 0 && !isNaN(k)) p.quiz[m + ':' + n] = k; }
      else if (x.type === 'self_rating') p.rating[m] = Number(v);
      else if (x.type === 'activity') p.act[id] = v.slice(0, 40);
    });
    writeProgress_(r.email, p);
  });
  return {ok: true, n: rows.length};
}

const UPLOAD_EXT = /\.(png|jpe?g|gif|webp|heic|pdf|docx?|xlsx?|pptx?|csv|txt|md|ino|cpp|h|gs|js|html?|css|json|zip|mp4|mov|webm)$/i;
function upload_(r) {
  const name = String(r.fileName || '').replace(/[\\/:*?"<>|]/g, '_').slice(0, 120);
  if (!name || !UPLOAD_EXT.test(name)) return {ok: false, error: 'file_type_not_allowed'};
  const maxMb = Number(prop_('UPLOAD_MAX_MB', '10'));
  const b64 = String(r.data || '');
  if (b64.length * 0.75 > maxMb * 1024 * 1024) return {ok: false, error: 'file_too_large'};
  if (!bump_('upload', r.email, Number(prop_('UPLOAD_DAILY_LIMIT', '20')))) return {ok: false, error: 'daily_upload_limit'};
  const bytes = Utilities.base64Decode(b64);
  const folder = learnerFolder_(r.email);
  const file = folder.createFile(Utilities.newBlob(bytes, String(r.mimeType || 'application/octet-stream'), clip_(r.moduleId, 8) + ' - ' + name));
  sh_('Uploads').appendRow([new Date(), r.email, clip_(r.moduleId, 12), name, clip_(r.mimeType, 80), bytes.length, file.getUrl()]);
  return {ok: true};
}

function ask_(r) {
  const row = findRow_('Learners', r.email);
  const v = sh_('Learners').getRange(row, 1, 1, TABS.Learners.length).getValues()[0];
  const age = Number(v[L.age - 1]), guardian = v[L.guardianConsent - 1] === true;
  if (prop_('AI_ENABLED', 'true') !== 'true') return {ok: false, error: 'ai_disabled'};
  if (age < Number(prop_('AI_MIN_AGE', '0'))) return {ok: false, error: 'ai_age_restricted'};
  if (age < 18 && !guardian) return {ok: false, error: 'guardian_consent_required'};
  const limit = Number(prop_('AI_DAILY_LIMIT', '30'));
  const used = usage_('ask', r.email);
  if (used >= limit) return {ok: false, error: 'ai_daily_limit'};
  const q = scrub_(clip_(r.question, 4000));
  if (!q) return {ok: false, error: 'empty_question'};
  const history = (Array.isArray(r.history) ? r.history : []).slice(-8).map(h => ({role: h.role === 'assistant' ? 'assistant' : 'user', content: scrub_(clip_(h.content, 3000))}));
  const system = systemPrompt_(r.context || {}, age);
  const t0 = Date.now();
  const res = callAI_(system, history, q);
  if (!res) return {ok: false, error: 'ai_unavailable'};
  bump_('ask', r.email, limit);
  sh_('AI').appendRow([new Date(), r.email, clip_((r.context || {}).moduleId, 12), res.model, q.slice(0, 2000), res.text.slice(0, 5000), Date.now() - t0]);
  return {ok: true, answer: res.text, remaining: Math.max(0, limit - used - 1)};
}

function report_(r) {
  if (!rl_('rep_' + r.email, 30, 3600)) return {ok: false, error: 'rate_limited', retryAfter: 600};
  sh_('Reports').appendRow([new Date(), r.email, clip_(r.moduleId, 12), clip_(r.reason, 60), clip_(r.question, 2000), clip_(r.answer, 5000)]);
  return {ok: true};
}

function consent_(r) {
  withLock_(() => { const row = findRow_('Learners', r.email); if (row) sh_('Learners').getRange(row, L.researchConsent).setValue(r.researchConsent === true); });
  return {ok: true};
}

function board_(r) {
  withLock_(() => { const row = findRow_('Learners', r.email); if (row) sh_('Learners').getRange(row, L.board).setValue(clip_(r.board, 12)); });
  return {ok: true};
}

function ailog_(r) {
  const e = r.entry || {};
  const id = clip_(e.id, 40); if (!id) return {ok: false, error: 'no_entry_id'};
  const vals = [new Date(), r.email, id, clip_(e.date, 12), clip_(e.module, 12), clip_(e.tool, 80), clip_(e.framework, 30), clip_(e.task, 1000), scrub_(clip_(e.prompt, 3000)), clip_(e.verify, 1000), clip_(e.decision, 40), clip_(e.disclose, 1000)];
  withLock_(() => {
    const sh = sh_('AILog'), key = r.email + '|' + id;
    // find an existing row for this learner + entry
    const f = sh.getRange('C:C').createTextFinder(id).matchEntireCell(true).findAll().find(c => sh.getRange(c.getRow(), 2).getValue() + '|' + c.getValue() === key);
    if (f) sh.getRange(f.getRow(), 1, 1, vals.length).setValues([vals]); else sh.appendRow(vals);
  });
  return {ok: true};
}

/** Admin sign-in: checks the email is an admin and the PIN matches, then issues a 6-hour session token. */
function adminLogin_(r) {
  const pin = prop_('ADMIN_PIN', ''), email = r.email, cache = CacheService.getScriptCache();
  if (!pin) return {ok: false, error: 'no_pin_set'};
  if (!validEmail_(email)) return {ok: false, error: 'invalid_email'};
  const failKey = 'admfail_' + email, fails = Number(cache.get(failKey) || 0), allFails = Number(cache.get('admfail_all') || 0);
  if (fails >= 5 || allFails >= 30) return {ok: false, error: 'locked'};   // 5 per email, 30 for all emails, per 15 minutes
  if (String(r.pin || '') !== pin || !isAdmin_(email)) {
    cache.put(failKey, String(fails + 1), 900); cache.put('admfail_all', String(allFails + 1), 900);
    logError_('security', email, 'adminLogin', 'Wrong admin email or PIN', '', '');
    return {ok: false, error: 'bad_login'};
  }
  cache.remove(failKey);
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  cache.put('adm_' + token, email, 21600);          // 6 hours
  const row = findRow_('Learners', email);
  const name = row ? String(sh_('Learners').getRange(row, L.name).getValue() || '') : '';
  return {ok: true, token: token, email: email, name: name, hours: 6};
}
function adminLogout_(r) { if (r.token) CacheService.getScriptCache().remove('adm_' + String(r.token)); return {ok: true}; }
function adminEmailFor_(r) {
  if (r.token) { const e = CacheService.getScriptCache().get('adm_' + String(r.token)); return e && isAdmin_(e) ? e : ''; }
  return '';
}
function adminData_(r) {
  if (!adminEmailFor_(r)) return {ok: false, error: 'expired'};
  const lv = sh_('Learners').getDataRange().getValues().slice(1);
  const pv = sh_('Progress').getDataRange().getValues().slice(1);
  const done = {}, badges = {};
  pv.forEach(p => { try { const j = JSON.parse(p[2] || '{}'); done[p[0]] = Object.keys(j.done || {}).filter(k => /:__module$/.test(k)).length; badges[p[0]] = Object.keys(j.act || {}).filter(k => /^badge_/.test(k)).length; } catch (x) {} });
  const fmt = d => d instanceof Date ? Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') : String(d || '');
  const learners = lv.filter(x => x[0]).map(x => ({name: x[L.name - 1], email: x[0], role: x[L.role - 1], grades: x[L.gradeLevels - 1], school: x[L.school - 1],
    industry: x[L.industry - 1], board: x[L.board - 1], minutes: Number(x[L.minutes - 1]) || 0, modulesDone: done[x[0]] || 0, badges: badges[x[0]] || 0, lastSeen: fmt(x[L.lastSeen - 1]), folderUrl: x[L.folderUrl - 1]}));
  const fb = sh_('Feedback').getDataRange().getValues().slice(1).slice(-1000).map(x => ({at: fmt(x[0]), email: x[1], kind: x[2], moduleId: x[4], page: x[5], rating: x[6], difficulty: x[7], scores: x[8], nps: x[9], comment: x[10], improve: x[11]}));
  const errs = sh_('Errors').getDataRange().getValues().slice(1).slice(-200).reverse().map(x => ({at: fmt(x[0]), source: x[1], email: x[2], where: x[3], message: x[4]}));
  const dayAgo = Date.now() - 864e5;
  const tests = sh_('Tests').getDataRange().getValues().slice(1).map(x => ({at: fmt(x[0]), email: x[1], kind: x[2], attempt: x[3], score: x[4], total: x[5], percent: x[6], answers: x[7], seconds: x[8]}));
  const certs = sh_('Certificates').getDataRange().getValues().slice(1).map(x => ({id: x[0], email: x[1], name: x[2], issued: fmtDate_(x[3]), pre: x[4], post: x[5]}));
  return {ok: true, version: SERVER_VERSION, learners: learners, tests: tests, certs: certs, passPct: Number(prop_('CERT_PASS_PCT', '70')), feedback: fb, errors: errs, errors24h: sh_('Errors').getDataRange().getValues().slice(1).filter(x => x[0] instanceof Date && x[0].getTime() > dayAgo).length,
    emailQuota: (() => { try { return MailApp.getRemainingDailyQuota(); } catch (x) { return 'not allowed'; } })(), aiCount: Math.max(0, sh_('AI').getLastRow() - 1), uploadCount: Math.max(0, sh_('Uploads').getLastRow() - 1), reportCount: Math.max(0, sh_('Reports').getLastRow() - 1)};
}

/* ---------------- pre-test, post-test, certificate ---------------- */
function testRows_(email) { return sh_('Tests').getDataRange().getValues().slice(1).filter(x => String(x[1]).toLowerCase() === email); }
function modulesComplete_(email) { const d = readProgress_(email).done || {}; return MODULE_IDS.length > 0 && MODULE_IDS.every(id => d[id + ':__module']) && (TRACK_IDS.length === 0 || TRACK_IDS.some(id => d[id + ':__module'])); }
/** Scores a pre-test or post-test on the server (the browser's score is not trusted). */
function test_(r) {
  const kind = r.kind === 'post' ? 'post' : 'pre', ans = Array.isArray(r.answers) ? r.answers.slice(0, TEST_KEY.length).map(Number) : [];
  if (!TEST_KEY.length || ans.length !== TEST_KEY.length) return {ok: false, error: 'bad_answers'};
  const admin = isAdmin_(r.email), mine = testRows_(r.email), prev = mine.filter(x => x[2] === kind);
  const max = Number(prop_('POST_MAX_ATTEMPTS', '3')), pass = Number(prop_('CERT_PASS_PCT', '70'));
  if (kind === 'pre' && prev.length && !admin) return {ok: true, already: true, score: prev[0][4], total: prev[0][5], percent: prev[0][6]};
  if (kind === 'post') {
    if (!admin && !modulesComplete_(r.email)) return {ok: false, error: 'not_eligible'};
    if (!admin && prev.length >= max) return {ok: false, error: 'no_attempts'};
  }
  const score = ans.reduce((n, a, i) => n + (a === TEST_KEY[i] ? 1 : 0), 0), total = TEST_KEY.length, pct = Math.round(score / total * 1000) / 10;
  sh_('Tests').appendRow([new Date(), r.email, kind, prev.length + 1, score, total, pct, JSON.stringify(ans), Math.min(Math.max(Number(r.seconds) || 0, 0), 86400), clip_(r.version, 20)]);
  const best = Math.max(pct, ...prev.map(x => Number(x[6]) || 0)), left = kind === 'post' ? Math.max(0, max - prev.length - 1) : 0;
  return {ok: true, kind: kind, score: score, total: total, percent: pct, attempt: prev.length + 1, best: best, passed: kind === 'post' && best >= pass, passPct: pass, attemptsLeft: left};
}
/** Issues (or returns) the learner's certificate once every module is complete and the post-test is passed. */
function certificate_(r) {
  const pass = Number(prop_('CERT_PASS_PCT', '70')), mine = testRows_(r.email);
  const post = mine.filter(x => x[2] === 'post').map(x => Number(x[6]) || 0), pre = mine.filter(x => x[2] === 'pre').map(x => Number(x[6]) || 0);
  const sh = sh_('Certificates'), at = findRow_('Certificates', r.email, 2);
  if (at) { const v = sh.getRange(at, 1, 1, 7).getValues()[0]; return {ok: true, cert: {id: v[0], name: v[2], issued: fmtDate_(v[3]), hours: v[6]}}; }
  if (!modulesComplete_(r.email)) return {ok: false, error: 'modules_incomplete'};
  if (!post.length || Math.max(...post) < pass) return {ok: false, error: 'post_not_passed', passPct: pass};
  const name = String(r.name || '').replace(/[<>]/g, '').trim().slice(0, 80);
  if (name.length < 3) return {ok: false, error: 'name_required'};
  const id = 'SSS-' + Utilities.getUuid().replace(/-/g, '').toUpperCase().slice(0, 4) + '-' + Utilities.getUuid().replace(/-/g, '').toUpperCase().slice(0, 4);
  const issued = new Date();
  withLock_(() => sh.appendRow([id, r.email, cell_(name), issued, pre.length ? pre[0] : '', Math.max(...post), COURSE_HOURS]));
  return {ok: true, cert: {id: id, name: name, issued: fmtDate_(issued), hours: COURSE_HOURS}};
}
/** Public: anyone can check that a certificate ID is real. Returns only the name, date, and course. */
function verifyCert_(r) {
  if (!rl_('vc', 600, 3600)) return {ok: false, error: 'rate_limited'};
  const id = String(r.id || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20);
  const row = id ? findRow_('Certificates', id) : 0;
  if (!row) return {ok: true, found: false};
  const v = sh_('Certificates').getRange(row, 1, 1, 7).getValues()[0];
  return {ok: true, found: true, id: v[0], name: v[2], issued: fmtDate_(v[3]), hours: v[6], course: COURSE_NAME};
}
function fmtDate_(d) { return d instanceof Date ? Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(d || ''); }

/* ---------------- Proto (AI assistant) ---------------- */
function systemPrompt_(c, age) {
  const lines = [
    'You are Proto, the friendly AI tutor of the free self-paced course "' + COURSE_NAME + ': IoT Prototyping and Web Apps with Google Apps Script and Human-Centered AI".',
    'Learners are beginner students and teachers (mostly in the Philippines) building IoT prototypes with the ESP32-S3-DevKitC-1, ESP8266 NodeMCU, or Arduino UNO R4 WiFi, sensors (DHT11/DHT22, HC-SR04, photoresistor, MQ-135, Sensirion SPS30, u-blox NEO-M8N, RC522), Google Apps Script web apps, Google Sheets as a database, and web dashboards.',
    'How to help:',
    '- Use plain, encouraging language and short answers (under about 250 words) unless asked for more. Use numbered steps for procedures.',
    '- Teach, do not just answer: for quizzes, sandbox challenges and checkpoint tasks, give hints and questions first, and full solutions only if the learner has clearly tried.',
    '- Match the learner\'s board (pin names differ) and the course conventions (Readings tab with timestamp, device_id, sensor, value; API key check; LockService; deploy a NEW VERSION after changes).',
    '- Say when you are unsure, and suggest how to verify (datasheet, the course module, a test on the virtual board or real hardware). Encourage learners to record AI help in their AI-use log.',
    '- Never ask for, repeat, or store Wi-Fi passwords, API keys, or personal data. If a message contains one, tell the learner to remove it and change the secret.',
    '- Safety: never help with mains (220 V) wiring; warn about hot MQ-135 heaters, short circuits, and 5 V signals on 3.3 V pins.',
    '- Stay on the course topics (electronics, Arduino/C++, networking, Apps Script, Sheets, web, dashboards, AI literacy and prompting). Politely decline unrelated or inappropriate requests.' + (age < 18 ? ' The learner is a minor: keep everything age-appropriate.' : ''),
    'Learner\'s board: ' + clip_(c.board, 40) + '.'
  ];
  if (c.moduleId) lines.push('Current module: ' + clip_(c.moduleId, 8) + ' ' + clip_(c.moduleTitle, 120) + '. Section: ' + clip_(c.sectionTitle, 120) + '.',
    'Module objectives: ' + (Array.isArray(c.objectives) ? c.objectives.map(o => clip_(o, 200)).join(' | ') : ''),
    'Section text the learner is reading (for context; do not quote it at length):\n' + clip_(c.sectionText, 3500));
  return lines.join('\n');
}

function callAI_(system, history, q) {
  const gKey = prop_('GEMINI_API_KEY', ''), cKey = prop_('ANTHROPIC_API_KEY', '');
  const models = [];
  if (gKey) models.push(['gemini', prop_('GEMINI_MODEL', 'gemini-flash-latest')], ['gemini', prop_('GEMINI_FALLBACK_MODEL', 'gemini-3.5-flash-lite')]);
  if (cKey) models.push(['claude', prop_('CLAUDE_MODEL', 'claude-haiku-5-5')]);
  for (const [kind, model] of models) {
    try {
      const text = kind === 'gemini' ? gemini_(gKey, model, system, history, q) : claude_(cKey, model, system, history, q);
      if (text) return {model: model, text: text};
    } catch (x) { console.warn(model + ' failed: ' + x); }
  }
  return null;
}

function gemini_(key, model, system, history, q) {
  const contents = history.map(h => ({role: h.role === 'assistant' ? 'model' : 'user', parts: [{text: h.content}]})).concat([{role: 'user', parts: [{text: q}]}]);
  const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: {'x-goog-api-key': key},
    payload: JSON.stringify({systemInstruction: {parts: [{text: system}]}, contents: contents, generationConfig: {temperature: 0.4, maxOutputTokens: 1200}})});
  if (res.getResponseCode() !== 200) throw new Error('HTTP ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 200));
  const j = JSON.parse(res.getContentText());
  const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
  return parts.map(p => p.text || '').join('').trim();
}

function claude_(key, model, system, history, q) {
  const messages = history.concat([{role: 'user', content: q}]);
  while (messages.length && messages[0].role !== 'user') messages.shift();   // must start with a user turn
  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: {'x-api-key': key, 'anthropic-version': '2023-06-01'},
    payload: JSON.stringify({model: model, max_tokens: 1200, system: system, messages: messages})});
  if (res.getResponseCode() !== 200) throw new Error('HTTP ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 200));
  const j = JSON.parse(res.getContentText());
  return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

/** Run from the editor once: asks for the "send email" permission and sends you a test sign-in email. */
function testEmail() {
  const me = Session.getEffectiveUser().getEmail();
  MailApp.sendEmail({to: me, name: COURSE_NAME, subject: 'Test: sign-in emails work', body: 'Learners will receive their 6-digit sign-in codes like this. Emails left today: ' + MailApp.getRemainingDailyQuota()});
  console.log('Sent a test email to ' + me + '. Now deploy a new version (Deploy → Manage deployments → Edit → New version).');
}

/** Run from the editor to check your AI keys (uses no learner data). */
function testAsk() {
  const r = callAI_(systemPrompt_({board: 'ESP32-S3-DevKitC-1'}, 30), [], 'In one sentence: why does the HC-SR04 ECHO pin need a voltage divider on an ESP32-S3?');
  console.log(r ? r.model + ': ' + r.text : 'No AI provider answered. Check GEMINI_API_KEY / ANTHROPIC_API_KEY in Script Properties.');
}

/* ---------------- helpers ---------------- */
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function prop_(k, d) { const v = PropertiesService.getScriptProperties().getProperty(k); return v == null || v === '' ? d : String(v).trim(); }
function clip_(s, n) { return cell_(String(s == null ? '' : s).slice(0, n)); }
/** Text that starts with = + - @ would run as a Sheets formula (formula injection). A leading ' stores it as plain text. */
function cell_(s) { return /^[=+\-@\t\r]/.test(s) ? "'" + s : s; }
function validEmail_(e) {
  if (!/^[a-z0-9][^\s@'"<>]*@[a-z0-9][^\s@'"<>]*\.[a-z]{2,}$/i.test(e) || e.length > 120) return false;
  const dom = prop_('ALLOWED_DOMAINS', ''); if (!dom) return true;
  const d = e.split('@')[1];
  return dom.split(',').map(x => x.trim().toLowerCase()).filter(String).some(x => d === x || d.endsWith('.' + x));
}
/** Remove things that look like secrets before storing or sending to an AI provider. */
function scrub_(s) {
  return String(s || '')
    .replace(/((?:wifi_?)?pass(?:word|wd)?|api[_ ]?key|secret|token)(\s*[:=]\s*["']?)[^\s"';,)]{4,}/gi, '$1$2[removed]')
    .replace(/(const\s+(?:char\*|String)\s+(?:WIFI_PASS|API_KEY)\s*=\s*")[^"]*"/g, '$1[removed]"')
    .replace(/AIza[0-9A-Za-z_-]{30,}/g, '[removed]').replace(/sk-ant-[0-9A-Za-z_-]{20,}/g, '[removed]');
}
function ss_() {
  const id = prop_('SPREADSHEET_ID', '');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}
function sh_(name) {
  const ss = ss_(); let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(TABS[name]); sh.setFrozenRows(1); }
  return sh;
}
function findRow_(tab, key, col) {
  if (!key) return 0;
  const sh = sh_(tab); if (sh.getLastRow() < 2) return 0;
  col = col || 1; key = String(key);
  const cache = CacheService.getScriptCache(), ck = 'row_' + tab + '_' + col + '_' + sha_(key.toLowerCase()).slice(0, 24), hit = Number(cache.get(ck) || 0);
  if (hit && hit <= sh.getLastRow() && String(sh.getRange(hit, col).getValue()).toLowerCase() === key.toLowerCase()) return hit;   // cached row, double-checked
  const c = sh.getRange(2, col, sh.getLastRow() - 1, 1).createTextFinder(key).matchEntireCell(true).matchCase(false).findNext();
  const row = c ? c.getRow() : 0;
  if (row) cache.put(ck, String(row), 21600);
  return row;
}
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error('lock timed out');   // reported to the app as "busy"; it retries
  try { return fn(); } finally { lock.releaseLock(); }
}
function sha_(s) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8).map(b => ('0' + (b & 255).toString(16)).slice(-2)).join(''); }
/** Simple rate limit with CacheService: true if this call is allowed (max calls per window seconds). */
function rl_(key, max, seconds) {
  const c = CacheService.getScriptCache(), k = 'rl_' + key + '_' + Math.floor(Date.now() / 1000 / seconds), n = Number(c.get(k) || 0);
  if (n >= max) return false;
  c.put(k, String(n + 1), Math.min(21600, seconds + 5)); return true;
}
function newSession_(email, device) {
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, ''), h = sha_(token);
  sh_('Sessions').appendRow([h, email, new Date(), new Date(), clip_(device, 12)]);
  CacheService.getScriptCache().put('s_' + h, email, 21600);
  return token;
}
/** Returns the email for a valid session token, or '' (tokens are stored only as SHA-256 hashes). */
function sessionEmail_(token) {
  token = String(token || ''); if (token.length < 40) return '';
  const h = sha_(token), c = CacheService.getScriptCache(), hit = c.get('s_' + h);
  if (hit) return hit;
  const row = findRow_('Sessions', h); if (!row) return '';
  const sh = sh_('Sessions'), email = String(sh.getRange(row, 2).getValue() || '');
  if (!email || !findRow_('Learners', email)) return '';
  sh.getRange(row, 4).setValue(new Date());
  c.put('s_' + h, email, 21600);
  return email;
}
function logError_(source, email, where, message, detail, ua) {
  try {
    if (!rl_('err', 500, 3600)) return;   // never let error logging flood the Sheet
    sh_('Errors').appendRow([new Date(), source, clip_(email, 120), clip_(where, 80), clip_(message, 500), clip_(detail, 1500), clip_(ua, 140)]);
  } catch (x) { console.error('logError_ failed: ' + x); }
}
function isAdmin_(email) {
  if (!email) return false;
  const list = prop_('ADMIN_EMAILS', '').toLowerCase().split(',').map(s => s.trim()).filter(String);
  if (list.indexOf(email) >= 0) return true;
  return !!findRow_('Admins', email);
}
function aiAllowed_(age, guardian) {
  return prop_('AI_ENABLED', 'true') === 'true' && age >= Number(prop_('AI_MIN_AGE', '0')) && (age >= 18 || guardian);
}
function today_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
function usage_(kind, email) {
  const row = findRow_('Usage', today_() + '|' + kind + '|' + email);
  return row ? Number(sh_('Usage').getRange(row, 2).getValue()) || 0 : 0;
}
/** Adds 1 to today's counter; returns false (without adding) if the limit is reached. */
function bump_(kind, email, limit) {
  return withLock_(() => {
    const key = today_() + '|' + kind + '|' + email, sh = sh_('Usage'), row = findRow_('Usage', key);
    const n = row ? Number(sh.getRange(row, 2).getValue()) || 0 : 0;
    if (n >= limit) return false;
    if (row) sh.getRange(row, 2).setValue(n + 1); else sh.appendRow([key, 1]);
    return true;
  });
}
function readProgress_(email) {
  const blank = {done: {}, quiz: {}, rating: {}, act: {}};
  const row = findRow_('Progress', email); if (!row) return blank;
  try { return Object.assign(blank, JSON.parse(sh_('Progress').getRange(row, 3).getValue() || '{}')); } catch (x) { return blank; }
}
function writeProgress_(email, p) {
  const sh = sh_('Progress'), row = findRow_('Progress', email), s = JSON.stringify(p).slice(0, 49000);
  if (row) sh.getRange(row, 2, 1, 2).setValues([[new Date(), s]]); else sh.appendRow([email, new Date(), s]);
}
function learnerFolder_(email) {
  const props = PropertiesService.getScriptProperties();
  let rootId = prop_('UPLOAD_FOLDER_ID', ''), root;
  try { root = rootId ? DriveApp.getFolderById(rootId) : null; } catch (x) { root = null; }
  if (!root) { root = DriveApp.createFolder(COURSE_NAME + ' uploads'); props.setProperty('UPLOAD_FOLDER_ID', root.getId()); }
  const row = findRow_('Learners', email), sh = sh_('Learners');
  const url = String(sh.getRange(row, L.folderUrl).getValue() || '');
  const m = url.match(/folders\/([A-Za-z0-9_-]+)/);
  if (m) { try { return DriveApp.getFolderById(m[1]); } catch (x) {} }
  const name = sh.getRange(row, L.lastName).getValue() + ', ' + sh.getRange(row, L.givenName).getValue() + ' (' + email + ')';
  const f = root.createFolder(name);
  sh.getRange(row, L.folderUrl).setValue(f.getUrl());
  return f;
}

/* ---------------- backups ---------------- */
/** Makes a dated copy of the whole Sheet in a Backups folder and keeps the newest BACKUP_KEEP copies. */
function backupNow() {
  const props = PropertiesService.getScriptProperties(), file = DriveApp.getFileById(ss_().getId());
  let folder; try { folder = DriveApp.getFolderById(prop_('BACKUP_FOLDER_ID', '')); } catch (x) { folder = null; }
  if (!folder) { folder = DriveApp.createFolder(COURSE_NAME + ' backups'); props.setProperty('BACKUP_FOLDER_ID', folder.getId()); }
  file.makeCopy(file.getName() + ' backup ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'), folder);
  const keep = Number(prop_('BACKUP_KEEP', '14')), copies = [], it = folder.getFiles();
  while (it.hasNext()) copies.push(it.next());
  copies.sort((a, b) => b.getDateCreated() - a.getDateCreated()).slice(keep).forEach(f => f.setTrashed(true));
  console.log('Backup done. Copies kept: ' + Math.min(keep, copies.length));
}
/** Run ONCE from the editor: schedules backupNow() every day at about 2 AM. */
function installDailyBackup() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'backupNow').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('backupNow').timeBased().everyDays(1).atHour(2).create();
  backupNow();
  console.log('Daily backup scheduled (about 2 AM, script time zone). A first backup was made now.');
}

/* ---------------- keeping the Sheet small ---------------- */
/** Moves Events, Access, and Errors rows older than ARCHIVE_DAYS (default 60) into an archive spreadsheet in the Backups folder,
 *  and drops Usage counters older than 7 days. A Sheet holds at most 10 million cells, and the Events tab grows fastest.
 *  Run it by hand, or once from the editor run installMonthlyArchive() to do it on the 1st of every month. */
function archiveOldLogs() {
  const days = Number(prop_('ARCHIVE_DAYS', '60')), cutoff = Date.now() - days * 864e5;
  let archive = null; const moved = {};
  withLock_(() => {
    ['Events', 'Access', 'Errors'].forEach(tab => {
      const sh = sh_(tab), last = sh.getLastRow(); if (last < 2) return;
      const rows = sh.getRange(2, 1, last - 1, TABS[tab].length).getValues();
      let n = 0; while (n < rows.length && rows[n][0] instanceof Date && rows[n][0].getTime() < cutoff) n++;   // rows are in time order
      if (!n) return;
      if (!archive) {
        let folder; try { folder = DriveApp.getFolderById(prop_('BACKUP_FOLDER_ID', '')); } catch (x) { folder = null; }
        if (!folder) { folder = DriveApp.createFolder(COURSE_NAME + ' backups'); PropertiesService.getScriptProperties().setProperty('BACKUP_FOLDER_ID', folder.getId()); }
        archive = SpreadsheetApp.create(COURSE_NAME + ' archive ' + today_());
        DriveApp.getFileById(archive.getId()).moveTo(folder);
      }
      const out = archive.insertSheet(tab); out.appendRow(TABS[tab]);
      out.getRange(2, 1, n, TABS[tab].length).setValues(rows.slice(0, n));
      sh.deleteRows(2, n); moved[tab] = n;
    });
    const us = sh_('Usage'), ul = us.getLastRow();
    if (ul > 1) {
      const keep = Utilities.formatDate(new Date(Date.now() - 7 * 864e5), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const vals = us.getRange(2, 1, ul - 1, 2).getValues(), recent = vals.filter(r => String(r[0]).slice(0, 10) >= keep);
      if (recent.length < vals.length) { us.getRange(2, 1, ul - 1, 2).clearContent(); if (recent.length) us.getRange(2, 1, recent.length, 2).setValues(recent); moved.Usage = vals.length - recent.length; }
    }
  });
  console.log('Archived: ' + JSON.stringify(moved) + (archive ? ' → ' + archive.getUrl() : ''));
}
/** Run ONCE from the editor: archives old log rows on the 1st of every month at about 3 AM. */
function installMonthlyArchive() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'archiveOldLogs').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('archiveOldLogs').timeBased().onMonthDay(1).atHour(3).create();
  console.log('Monthly archive scheduled (1st of each month, about 3 AM).');
}

/** Run from the editor to sign a learner out of every device right away (for a lost or shared device).
 *  Example: change the email below, then Run. */
function revokeSessions(email) {
  email = String(email || 'learner@example.com').trim().toLowerCase();
  const sh = sh_('Sessions'), last = sh.getLastRow(); if (last < 2) return;
  const vals = sh.getRange(2, 1, last - 1, 2).getValues(), cache = CacheService.getScriptCache(); let n = 0;
  vals.forEach((r, i) => { if (String(r[1]).toLowerCase() === email && !/^revoked/.test(r[0])) { cache.remove('s_' + r[0]); sh.getRange(i + 2, 1).setValue('revoked ' + new Date().toISOString()); n++; } });
  console.log('Signed ' + email + ' out of ' + n + ' device(s).');
}
