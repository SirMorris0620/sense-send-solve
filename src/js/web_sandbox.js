/* ============ WEB PAGE SANDBOX: edit HTML/CSS/JS, preview it live, and check it ============ */
const WEB_HARNESS = (token, checker) => `<script>
(function(){
  window.__intervals = []; const _si = window.setInterval; window.setInterval = function(f, ms){ window.__intervals.push(ms); return _si(f, Math.max(ms, 1000)); };
  const mk = n => { const out = []; const base = Date.UTC(2026,9,8,2,0,0); for (let i = 0; i < n; i++){ const t = new Date(base + i * 60000).toISOString(); out.push({timestamp:t, device_id:"team1-esp32s3", sensor:"temp_c", value:+(29 + i * 0.12).toFixed(1)}); out.push({timestamp:t, device_id:"team1-esp32s3", sensor:"hum_pct", value:+(70 - i * 0.2).toFixed(1)}); } return out; };
  window.__calls = [];
  const runner = (ok, fail) => new Proxy({}, {get(_, name){ if (name === "withSuccessHandler") return f => runner(f, fail); if (name === "withFailureHandler") return f => runner(ok, f);
    return (...args) => { window.__calls.push({name, args}); setTimeout(() => { if (name === "getLatest"){ ok && ok(mk(Math.min(+args[0] || 20, 40) / 2 | 0)); } else if (ok) ok(null); }, 120); }; }});
  window.google = {script:{run:runner(null, null)}};
  window.addEventListener("error", e => parent.postMessage({token:"${token}", error:e.message}, "*"));
  window.addEventListener("load", () => setTimeout(() => { let checks; try { checks = (function(){ ${checker} })(); } catch(e){ checks = [{ok:false, msg:"Checker error: " + e.message}]; } parent.postMessage({token:"${token}", checks}, "*"); }, 700));
})();
<\/script>`;
const lum = c => { const m = String(c).match(/\d+(\.\d+)?/g); if (!m) return 1; const [r, g, b] = m.slice(0, 3).map(x => { x = +x / 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
const WEB = {
 web_card: {id:"web_card", title:"A status card (HTML + CSS)", task:"Make a page with an <code>&lt;h1&gt;</code> that says <b>Classroom Dashboard</b>, and a <code>div</code> with class <code>card</code> that contains a label and an element with id <code>temp</code> showing <b>29.4 \u00b0C</b>. Style the card with a background color, padding, and rounded corners.", criteria:["The heading is there","A .card contains #temp with the temperature","The card has a background, padding, and rounded corners"],
  starter:`<!DOCTYPE html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui, sans-serif; margin: 1rem; }
  /* TODO 2: style .card with background, padding, and border-radius */
</style>
</head>
<body>
  <!-- TODO 1: an h1, then a div class="card" with a label and <b id="temp">29.4 °C</b> -->
</body>
</html>
`, solution:`<!DOCTYPE html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui, sans-serif; margin: 1rem; }
  .card { background: #E0E7FF; padding: 1rem; border-radius: 12px; max-width: 14rem; }
  .card b { display: block; font-size: 2rem; }
</style>
</head>
<body>
  <h1>Classroom Dashboard</h1>
  <div class="card">
    Temperature
    <b id="temp">29.4 °C</b>
  </div>
</body>
</html>
`, checker:`const c = [], h = document.querySelector("h1"), card = document.querySelector(".card"), t = document.getElementById("temp");
 c.push(h && /classroom dashboard/i.test(h.textContent) ? {ok:true, msg:"The h1 heading is there."} : {ok:false, msg:"No h1 with \\u201cClassroom Dashboard\\u201d.", hint:"<h1>Classroom Dashboard</h1>"});
 c.push(card && t && card.contains(t) && /29\\.4/.test(t.textContent) ? {ok:true, msg:".card contains #temp with 29.4."} : {ok:false, msg:"No .card containing #temp with 29.4.", hint:"<div class=\\"card\\">Temperature <b id=\\"temp\\">29.4 \\u00b0C</b></div>"});
 if (card){ const s = getComputedStyle(card); const bg = s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "transparent", pad = parseFloat(s.paddingTop) > 0, rad = parseFloat(s.borderTopLeftRadius) > 0;
  c.push(bg && pad && rad ? {ok:true, msg:"The card has a background, padding, and rounded corners."} : {ok:false, msg:"The card is missing " + [!bg && "a background", !pad && "padding", !rad && "rounded corners"].filter(Boolean).join(", ") + ".", hint:".card { background: #E0E7FF; padding: 1rem; border-radius: 12px; }"}); }
 return c;`},
 web_js: {id:"web_js", title:"Fill the page with JavaScript", task:"The <code>readings</code> array holds the latest data. With JavaScript, put the <b>newest</b> temperature in <code>#temp</code> and humidity in <code>#hum</code>, write the time in <code>#updated</code>, and add the class <code>hot</code> to <code>#tempCard</code> when the temperature is above 31 \u00b0C.", criteria:["#temp and #hum show the newest values","#updated shows a time","#tempCard gets the class hot"],
  starter:`<!DOCTYPE html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui, sans-serif; margin: 1rem; }
  .cards { display: flex; gap: .75rem; flex-wrap: wrap; }
  .card { flex: 1 1 9rem; background: #E0E7FF; padding: .75rem; border-radius: 12px; }
  .card b { display: block; font-size: 1.8rem; }
  .card.hot { background: #FDE2D8; outline: 3px solid #C2410C; }
</style>
</head>
<body>
  <h1>Classroom Dashboard</h1>
  <div class="cards">
    <div class="card" id="tempCard">Temperature <b id="temp">--</b></div>
    <div class="card">Humidity <b id="hum">--</b></div>
  </div>
  <p id="updated">Loading...</p>
<script>
const readings = [
  {sensor: "temp_c", value: 30.8}, {sensor: "hum_pct", value: 66.0},
  {sensor: "temp_c", value: 31.6}, {sensor: "hum_pct", value: 64.5}
];
// TODO 1: find the newest temp_c and hum_pct (the LAST ones in the array)
// TODO 2: document.getElementById("temp").textContent = ...
// TODO 3: #updated = "Updated " + new Date().toLocaleTimeString()
// TODO 4: if temp > 31, add the class "hot" to #tempCard
<\/script>
</body>
</html>
`, solution:null, checker:`const c = [], t = document.getElementById("temp"), h = document.getElementById("hum"), u = document.getElementById("updated"), k = document.getElementById("tempCard");
 c.push(t && /31\\.6/.test(t.textContent) && h && /64\\.5/.test(h.textContent) ? {ok:true, msg:"#temp and #hum show the newest values (31.6 and 64.5)."} : {ok:false, msg:"#temp shows \\u201c" + (t ? t.textContent : "?") + "\\u201d and #hum shows \\u201c" + (h ? h.textContent : "?") + "\\u201d.", hint:"Loop through readings; the last temp_c wins. Or use readings.filter(r => r.sensor === \\"temp_c\\").pop()."});
 c.push(u && /\\d/.test(u.textContent) && !/Loading/.test(u.textContent) ? {ok:true, msg:"#updated shows a time."} : {ok:false, msg:"#updated still says \\u201c" + (u ? u.textContent : "?") + "\\u201d.", hint:"document.getElementById(\\"updated\\").textContent = \\"Updated \\" + new Date().toLocaleTimeString();"});
 c.push(k && k.classList.contains("hot") ? {ok:true, msg:"#tempCard has the class hot."} : {ok:false, msg:"#tempCard does not have the class hot.", hint:"if (temp > 31) document.getElementById(\\"tempCard\\").classList.add(\\"hot\\");"});
 return c;`},
 web_gas: {id:"web_gas", title:"Get live data with google.script.run", task:"This page will run inside your Apps Script web app. Call the server function <code>getLatest(20)</code> with <code>google.script.run.withSuccessHandler(show)</code>, show the newest temperature in <code>#temp</code>, list the readings as rows in <code>#log</code>, and refresh every 30 seconds. (The sandbox imitates the server and returns sample data.)", criteria:["getLatest is called through google.script.run","#temp shows the newest temperature","#log has one table row per reading","The page refreshes every 30 s"],
  starter:`<!DOCTYPE html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui, sans-serif; margin: 1rem; }
  .card { background: #E0E7FF; padding: .75rem; border-radius: 12px; display: inline-block; }
  .card b { display: block; font-size: 1.8rem; }
  table { border-collapse: collapse; margin-top: 1rem; } td, th { border: 1px solid #ccc; padding: 4px 8px; }
</style>
</head>
<body>
  <h1>Classroom Dashboard</h1>
  <div class="card">Temperature <b id="temp">--</b></div>
  <table><thead><tr><th>time</th><th>sensor</th><th>value</th></tr></thead><tbody id="log"></tbody></table>
<script>
function show(rows) {
  // rows = [{timestamp, device_id, sensor, value}, ...] oldest first
  // TODO 2: put the newest temp_c value in #temp
  // TODO 3: build one <tr> per row inside #log (replace what was there)
}
function refresh() {
  // TODO 1: google.script.run.withSuccessHandler(show).getLatest(20);
}
refresh();
// TODO 4: refresh every 30 seconds
<\/script>
</body>
</html>
`, solution:null, checker:`const c = [], calls = window.__calls || [], t = document.getElementById("temp"), rows = document.querySelectorAll("#log tr");
 c.push(calls.some(x => x.name === "getLatest") ? {ok:true, msg:"getLatest was called through google.script.run."} : {ok:false, msg:"getLatest was never called.", hint:"google.script.run.withSuccessHandler(show).getLatest(20);"});
 c.push(t && /30\\.\\d/.test(t.textContent) ? {ok:true, msg:"#temp shows the newest temperature (" + t.textContent + ")."} : {ok:false, msg:"#temp shows \\u201c" + (t ? t.textContent : "?") + "\\u201d.", hint:"Find the last row with sensor === \\"temp_c\\" and use its value."});
 c.push(rows.length >= 10 ? {ok:true, msg:rows.length + " rows in #log."} : {ok:false, msg:rows.length + " rows in #log.", hint:"document.getElementById(\\"log\\").innerHTML = rows.map(r => \\"<tr><td>\\" + r.timestamp + \\"</td><td>\\" + r.sensor + \\"</td><td>\\" + r.value + \\"</td></tr>\\").join(\\"\\");"});
 c.push((window.__intervals || []).includes(30000) ? {ok:true, msg:"It refreshes every 30 s."} : {ok:false, msg:"No 30-second refresh.", hint:"setInterval(refresh, 30000);"});
 return c;`},
 web_a11y: {id:"web_a11y", title:"Fix the accessibility problems", task:"This dashboard works, but some people cannot use it. Fix it so that: the page declares its language, every image has meaningful <code>alt</code> text, the search box has a label, the icon-only button has an accessible name, and the gray note text has a contrast ratio of at least 4.5:1 (WCAG 2.2 level AA).", criteria:["<html> has a lang attribute","Every image has alt text","The input has a label","The button has an accessible name","The note text meets 4.5:1 contrast"],
  starter:`<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui, sans-serif; margin: 1rem; background: #ffffff; }
  .note { color: #b5b5b5; }
</style>
</head>
<body>
  <h1>Air Quality</h1>
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='40'%3E%3Crect width='120' height='40' fill='%231F8A70'/%3E%3C/svg%3E">
  <p>Humidity now: <b>62 %</b></p>
  <input type="search" placeholder="Find a room">
  <button>🔄</button>
  <p class="note">Data from the DHT22 sensor in Room 204.</p>
</body>
</html>
`, solution:`<!DOCTYPE html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui, sans-serif; margin: 1rem; background: #ffffff; }
  .note { color: #595959; }
</style>
</head>
<body>
  <h1>Air Quality</h1>
  <img alt="Green status bar: air quality is good" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='40'%3E%3Crect width='120' height='40' fill='%231F8A70'/%3E%3C/svg%3E">
  <p>Humidity now: <b>62 %</b></p>
  <label for="room">Find a room</label>
  <input id="room" type="search" placeholder="e.g. 204">
  <button aria-label="Refresh data">🔄</button>
  <p class="note">Data from the DHT22 sensor in Room 204.</p>
</body>
</html>
`, checker:`const c = [], lum = ${lum.toString()}, ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
 c.push(document.documentElement.getAttribute("lang") ? {ok:true, msg:"<html> declares a language."} : {ok:false, msg:"<html> has no lang attribute.", hint:"<html lang=\\"en\\">"});
 const imgs = [...document.images]; c.push(imgs.length && imgs.every(i => (i.getAttribute("alt") || "").trim().length > 3) ? {ok:true, msg:"Every image has alt text."} : {ok:false, msg:"An image has no meaningful alt text.", hint:"<img alt=\\"Green status bar: air quality is good\\" ...>"});
 const inp = document.querySelector("input"), lab = inp && ((inp.id && document.querySelector("label[for='" + inp.id + "']")) || inp.closest("label") || inp.getAttribute("aria-label"));
 c.push(lab ? {ok:true, msg:"The input has a label."} : {ok:false, msg:"The input has no label (a placeholder is not a label).", hint:"<label for=\\"room\\">Find a room</label> <input id=\\"room\\" ...>"});
 const btn = document.querySelector("button"), name = btn && ((btn.getAttribute("aria-label") || "") + (btn.getAttribute("title") || "") + btn.textContent.replace(/[\\u{1F000}-\\u{1FFFF}\\u2600-\\u27BF\\s]/gu, ""));
 c.push(name && name.trim().length > 2 ? {ok:true, msg:"The button has an accessible name."} : {ok:false, msg:"The button only has an emoji: screen readers cannot tell what it does.", hint:"<button aria-label=\\"Refresh data\\">\\ud83d\\udd04</button>"});
 const n = document.querySelector(".note"), r = n ? ratio(getComputedStyle(n).color, getComputedStyle(document.body).backgroundColor) : 0;
 c.push(r >= 4.5 ? {ok:true, msg:"Note contrast is " + r.toFixed(2) + ":1."} : {ok:false, msg:"Note contrast is only " + r.toFixed(2) + ":1 (needs 4.5:1).", hint:"Use a darker gray, e.g. color: #595959."});
 return c;`}
};
WEB.web_js.solution = WEB.web_js.starter.replace(`// TODO 1: find the newest temp_c and hum_pct (the LAST ones in the array)
// TODO 2: document.getElementById("temp").textContent = ...
// TODO 3: #updated = "Updated " + new Date().toLocaleTimeString()
// TODO 4: if temp > 31, add the class "hot" to #tempCard`, `let temp = null, hum = null;
for (const r of readings) {            // later readings overwrite earlier ones
  if (r.sensor === "temp_c") temp = r.value;
  if (r.sensor === "hum_pct") hum = r.value;
}
document.getElementById("temp").textContent = temp + " °C";
document.getElementById("hum").textContent = hum + " %";
document.getElementById("updated").textContent = "Updated " + new Date().toLocaleTimeString();
if (temp > 31) document.getElementById("tempCard").classList.add("hot");`);
WEB.web_gas.solution = WEB.web_gas.starter.replace(`  // TODO 2: put the newest temp_c value in #temp
  // TODO 3: build one <tr> per row inside #log (replace what was there)`, `  const temps = rows.filter(r => r.sensor === "temp_c");
  if (temps.length) document.getElementById("temp").textContent = temps[temps.length - 1].value + " °C";
  document.getElementById("log").innerHTML = rows.map(r =>
    "<tr><td>" + new Date(r.timestamp).toLocaleTimeString() + "</td><td>" + r.sensor + "</td><td>" + r.value + "</td></tr>"
  ).join("");`).replace("  // TODO 1: google.script.run.withSuccessHandler(show).getLatest(20);", "  google.script.run.withSuccessHandler(show).getLatest(20);").replace("// TODO 4: refresh every 30 seconds", "setInterval(refresh, 30000);");
function mountWeb(el, ids){
  const list = ids.map(id => WEB[id]).filter(Boolean); let cur = list[0], tries = {}, token = "";
  const key = c => "sss_web_" + (user ? user.email : "g") + "_" + c.id;
  el.innerHTML = bench("Web page sandbox", `${list.length > 1 ? `<div class="sb-tabs" role="tablist">${list.map((c, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="${i === 0}">${esc(c.title)}${act(c.id) === "pass" ? " \u2713" : ""}</button>`).join("")}</div>` : ""}
   <div class="sb-task"></div><div class="ix-grid2"><div><div class="gs-tabs" style="border-radius:8px 8px 0 0"><span class="on">index.html</span></div><textarea class="ed wbE" spellcheck="false" autocapitalize="off" autocorrect="off" aria-label="Your HTML, CSS, and JavaScript"></textarea></div>
   <div><div class="gs-tabs" style="border-radius:8px 8px 0 0"><span class="on">Preview</span></div><iframe class="preview-frame wbF" sandbox="allow-scripts" title="Preview of your page"></iframe></div></div>
   <div class="controls"><button class="btn primary wbRun" type="button">\u25B6 Run and check</button><button class="btn wbAI" type="button">Ask Proto for a hint</button><button class="btn wbSol" type="button">Show a solution</button><button class="btn wbReset" type="button">Reset code</button><button class="btn wbDl" type="button">Download .html</button></div>
   <ul class="reslist wbChecks"></ul>`);
  const ed = $(".wbE", el);
  ed.addEventListener("keydown", e => { if (e.key === "Tab"){ e.preventDefault(); ed.setRangeText("  ", ed.selectionStart, ed.selectionEnd, "end"); } });
  ed.addEventListener("input", () => { store.set(key(cur), ed.value); clearTimeout(ed.t); ed.t = setTimeout(() => preview(false), 600); });
  const preview = grade => { token = Math.random().toString(36).slice(2); const html = ed.value, inj = WEB_HARNESS(token, grade ? cur.checker : "return null;");
    $(".wbF", el).srcdoc = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + inj) : inj + html; };
  const onMsg = e => { if (!alive(el)) return removeEventListener("message", onMsg); const d = e.data || {}; if (d.token !== token) return;
    if (d.error){ lastFails = ["JavaScript error: " + d.error]; $(".wbChecks", el).innerHTML = `<li class="no">\u2717 JavaScript error: ${esc(d.error)}<span class="explain">Check the line you changed last for a missing bracket or quote.</span></li>`; return; }
    if (!d.checks) return; lastFails = d.checks.filter(c => !c.ok).map(c => c.msg); const ok = d.checks.every(c => c.ok);
    $(".wbChecks", el).innerHTML = d.checks.map(c => `<li class="${c.ok ? "ok" : "no"}">${c.ok ? "\u2713" : "\u2717"} ${esc(c.msg)}${!c.ok && c.hint ? `<span class="explain"><code>${esc(c.hint)}</code></span>` : ""}</li>`).join("") + (ok ? `<li class="ok"><b>Challenge passed.</b></li>` : "");
    logEvent(currentModule, cur.id, "sandbox_run", ok ? "pass" : "fail");
    if (ok && act(cur.id) !== "pass"){ markAct(cur.id, "pass"); confetti(); toast("Challenge passed!"); const t = el.querySelector(`.sb-tabs button[data-i="${list.indexOf(cur)}"]`); if (t) t.textContent = cur.title + " \u2713"; } };
  addEventListener("message", onMsg); let lastFails = [];
  $(".wbAI", el).onclick = () => { const p = aiHintPrompt({lang:"HTML, CSS, and JavaScript", title:cur.title, task:cur.task, code:ed.value, fails:lastFails});
    sendToProto(p); logEvent(currentModule, cur.id, "ai_hint", "asked"); aiLogAdd({tool:"Proto (course assistant)", framework:"PARTS", task:"Hint for " + cur.title, prompt:p.slice(0, 600)}); toast("Asked Proto for a hint. It was also added to your AI-use log."); };
  const load = () => { el.dataset.cur = cur.id; $(".sb-task", el).innerHTML = `<p><b>Task:</b> ${cur.task}</p><p class="explain"><b>Passes when:</b></p><ul>${cur.criteria.map(c => `<li>${c}</li>`).join("")}</ul>`; ed.value = store.get(key(cur), null) || cur.starter; $(".wbChecks", el).innerHTML = ""; preview(false); };
  el.querySelectorAll(".sb-tabs button").forEach(b => b.onclick = () => { cur = list[+b.dataset.i]; el.querySelectorAll(".sb-tabs button").forEach(x => x.setAttribute("aria-selected", x === b)); load(); });
  $(".wbRun", el).onclick = () => { tries[cur.id] = (tries[cur.id] || 0) + 1; $(".wbChecks", el).innerHTML = `<li>Checking\u2026</li>`; preview(true); };
  $(".wbReset", el).onclick = () => { if (confirm("Replace your code with the starter code?")){ store.del(key(cur)); load(); } };
  $(".wbSol", el).onclick = () => { if ((tries[cur.id] || 0) < 2 && act(cur.id) !== "pass"){ $(".wbChecks", el).innerHTML = `<li>Run and check your own code at least twice first.</li>`; return; } if (confirm("Load a working solution?")){ ed.value = cur.solution; store.set(key(cur), ed.value); preview(false); } };
  $(".wbDl", el).onclick = () => downloadText("index.html", ed.value, "text/html");
  load();
}
