const COURSE_CONTACT = "morris.bana@dlsu.edu.ph";   // course, privacy, and research contact: change this one line to use another email
const COURSE_TITLE = "Sense, Send, Solve";
const COURSE_SUBTITLE = "Fundamentals of Arduino Prototyping, IoT, and Data Science";

/* ============ CONFIG ============ */
const CONFIG = {
  API_URL: "",            // paste the course server's /exec URL here (see backend/README.md). Empty = preview mode (everything saves on this device only)
  HEARTBEAT_SECONDS: 60,
  IDLE_MINUTES: 5,
  MAX_UPLOAD_MB: 10,
  AI_MIN_AGE: 0,          // 0 = no age limit; keep the same as AI_MIN_AGE in Code.gs
  LOCK_UNITS: true,       // true = a unit opens only after every module in the earlier units is complete (admins are never locked)
  REQUIRE_PRETEST: true   // true = learners take the pre-test before Module 1.1 (admins are never locked)
};

/* ============ STORAGE (safe) ============ */
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} }
};
let user = store.get("sss_user", null);
const pkey = () => "sss_prog_" + (user ? user.email : "guest");
const blankProg = () => ({done:{}, quiz:{}, rating:{}, uploads:[], minutes:0, act:{}, notes:{}});
let prog = Object.assign(blankProg(), store.get(pkey(), {}));
function saveProg(){ store.set(pkey(), prog); }
const sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);

/* ============ API with retries and an offline queue ============ */
const apiReady = () => /^https:\/\/script\.google\.com\//.test(CONFIG.API_URL);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const NO_RETRY = {ask:1, upload:1, lookup:1, verify:1, register:1, adminLogin:1};   // never repeat: they cost money, send email, or create things
/* POST to the course server. Retries (with backoff) when the network drops or the server is busy. */
async function post(payload, retries){
  let last = {ok:false, error:"network"};
  for (let i = 0; i <= retries; i++){
    if (i) await sleep(800 * Math.pow(2.5, i - 1) + Math.random() * 400);
    try {
      const res = await fetch(CONFIG.API_URL, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(payload)});
      let j; try { j = await res.json(); } catch(e){ last = {ok:false, error:"busy"}; continue; }   // Google's HTML error page = overloaded
      if (j && (j.error === "busy" || j.error === "server_busy")){ last = j; continue; }
      return j;
    } catch(e){ last = {ok:false, error:"network"}; }
  }
  return last;
}
let authLostShown = false;
async function api(action, data, queueIfFail = true){
  if (!user || !apiReady()) return {ok:false, offline:true};
  const r = await post(Object.assign({action, token:user.token || "", sessionId}, data), NO_RETRY[action] ? 0 : 2);
  if (r.error === "auth_required"){ onAuthLost(); return r; }
  if ((r.error === "network" || r.error === "busy") && queueIfFail && !NO_RETRY[action]){ const q = store.get("sss_queue", []); q.push({action, data}); store.set("sss_queue", q.slice(-200)); }
  return r;
}
async function apiPublic(action, data){
  if (!apiReady()) return {ok:false, offline:true};
  return post(Object.assign({action}, data), NO_RETRY[action] ? 0 : 2);
}
/* The server no longer accepts this device's session (older version, or signed out elsewhere): ask the learner to confirm their email. */
function onAuthLost(){
  if (!user || authLostShown) return; authLostShown = true;
  const email = user.email, all = store.get("sss_profiles", {});
  if (all[email]) { delete all[email].token; store.set("sss_profiles", all); }
  user.token = ""; store.set("sss_user", user);
  if (window.showAuthBanner) window.showAuthBanner(email);
}
async function flushQueue(){
  if (!apiReady() || !user || !user.token) return;
  const q = store.get("sss_queue", []); if (!q.length) return;
  store.set("sss_queue", []);
  for (const item of q){
    if (!item || !item.action) continue;   // skip entries from older versions
    const r = await post(Object.assign({action:item.action, token:user.token, sessionId}, item.data), 1);
    if (r.error === "network" || r.error === "busy"){ const rest = store.get("sss_queue", []); rest.push(item); store.set("sss_queue", rest); }
    if (r.error === "auth_required"){ onAuthLost(); break; }
  }
}
/* Client error reporting: uncaught errors go to the Errors tab (at most 10 per visit, duplicates skipped). */
const errSeen = new Set(); let errBuf = [];
function reportError(where, message, detail){
  const key = where + "|" + message; if (errSeen.has(key) || errSeen.size >= 10) return; errSeen.add(key);
  errBuf.push({where:String(where).slice(0, 80), message:String(message).slice(0, 500), detail:String(detail || "").slice(0, 1500)});
  clearTimeout(reportError.t); reportError.t = setTimeout(() => { const errors = errBuf; errBuf = []; if (user && user.token) api("clientError", {errors, userAgent:navigator.userAgent.slice(0, 140)}, false); }, 2000);
}
addEventListener("error", e => { if (e.message) reportError((location.hash || "#/") + " " + (e.filename || "").split("/").pop() + ":" + (e.lineno || 0), e.message, e.error && e.error.stack); });
addEventListener("unhandledrejection", e => { const x = e.reason || {}; reportError(location.hash || "#/", "Unhandled promise: " + (x.message || x), x.stack); });
let evBuffer = [];
function logEvent(moduleId, itemId, type, value){
  evBuffer.push({ts:Date.now(), moduleId, itemId, type, value:String(value == null ? "" : value).slice(0, 400)});
  clearTimeout(logEvent.t); logEvent.t = setTimeout(sendEvents, 1500);
  if (type === "activity"){ prog.act = prog.act || {}; prog.act[itemId] = String(value); saveProg(); if (window.onActivity) window.onActivity(itemId, value); }
}
function sendEvents(){ if (!evBuffer.length) return; const events = evBuffer; evBuffer = []; api("event", {events}); }
const act = id => (prog.act || {})[id];
function markAct(id, value){ if (act(id) === String(value)) return; logEvent(currentModule, id, "activity", value); }

/* ============ ACTIVE-TIME TRACKER ============ */
let lastActive = Date.now(), currentModule = "";
["pointerdown","keydown","scroll","touchstart"].forEach(ev => addEventListener(ev, () => lastActive = Date.now(), {passive:true}));
setInterval(() => {
  if (!user || document.visibilityState !== "visible") return;
  if (Date.now() - lastActive > CONFIG.IDLE_MINUTES * 60000) return;
  const m = CONFIG.HEARTBEAT_SECONDS / 60;
  prog.minutes = (prog.minutes || 0) + m; saveProg();
  pendingMinutes += m; if (pendingMinutes >= 3) sendMinutes();   // one request every 3 active minutes keeps server load low
}, CONFIG.HEARTBEAT_SECONDS * 1000);
let pendingMinutes = 0;
function sendMinutes(){ if (!pendingMinutes) return; const m = Math.min(pendingMinutes, 10); pendingMinutes = 0; api("heartbeat", {minutes:m, moduleId:currentModule}, false); }
setInterval(flushQueue, 120000);
addEventListener("online", flushQueue);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden"){ sendEvents(); sendMinutes(); } });

/* ============ HELPERS ============ */
/* One CSV cell. Text starting with = + - @ gets a leading ' so Excel/Sheets will not run it as a formula (CSV injection). */
const csvCell = v => { let s = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(msg, kind){ if (window.toastStack) return window.toastStack(msg, kind); }
function speak(text){
  if (!("speechSynthesis" in window)) { toast("Read-aloud is not supported on this browser."); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.rate = Number(store.get("sss_voice", 1)); u.lang = "en-US";
  speechSynthesis.speak(u);
}
const reduceMotion = () => store.get("sss_motion","full") === "reduce" || matchMedia("(prefers-reduced-motion: reduce)").matches;
const alive = el => document.body.contains(el);
const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function hiDPI(cv){ const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1; cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.max(1, Math.round(r.height * d)); const g = cv.getContext("2d"); g.setTransform(d, 0, 0, d, 0, 0); return {g, W: r.width, H: r.height}; }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const ICON = `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="5" cy="5" r="1.6" fill="#1F8A70"/><circle cx="13" cy="5" r="1.6" fill="#1F8A70"/><circle cx="5" cy="13" r="1.6" fill="#1F8A70"/><circle cx="13" cy="13" r="1.6" fill="#C8653A"/><path d="M5 5 H13 V13" stroke="#1F8A70" stroke-width="1.4" fill="none"/></svg>`;
function bench(title, inner){ return `<div class="bench"><p class="bench-title">${ICON}${esc(title)}</p>${inner}</div>`; }
function copyText(t){ if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(() => toast("Copied."), () => fallbackCopy(t)); fallbackCopy(t); }
function fallbackCopy(t){ const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast("Copied."); } catch(e){ toast("Select the text and copy it manually."); } ta.remove(); }
function downloadText(name, text, type){ const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], {type: type || "text/plain"})); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }

/* ============ BOARD CHOICE ============ */
const BOARDS = {
  s3:      {key:"s3", name:"ESP32-S3-DevKitC-1", short:"ESP32-S3", logic:3.3, adcBits:12, adcMax:4095, fqbn:"esp32:esp32:esp32s3", ide:"ESP32S3 Dev Module", core:"esp32 by Espressif Systems"},
  esp8266: {key:"esp8266", name:"ESP8266 NodeMCU (v2/v3)", short:"ESP8266", logic:3.3, adcBits:10, adcMax:1023, fqbn:"esp8266:esp8266:nodemcuv2", ide:"NodeMCU 1.0 (ESP-12E Module)", core:"esp8266 by ESP8266 Community"},
  uno:     {key:"uno", name:"Arduino Uno R4 WiFi", short:"Uno R4 WiFi", logic:5, adcBits:10, adcMax:1023, fqbn:"arduino:renesas_uno:unor4wifi", ide:"Arduino UNO R4 WiFi", core:"Arduino UNO R4 Boards"}
};
const getBoard = () => { const b = store.get("sss_board", "uno"); return BOARDS[b] ? b : "s3"; };
function setBoard(b){ if (!BOARDS[b]) return; store.set("sss_board", b); document.documentElement.dataset.board = b; const s = $("#setBoard"); if (s) s.value = b; $$(".bt-tabs button").forEach(x => x.setAttribute("aria-selected", x.dataset.b === b)); if (window.onBoardChange) window.onBoardChange(b); }
document.documentElement.dataset.board = getBoard();
