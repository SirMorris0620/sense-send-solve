/* ============ SANDBOX UI: virtual board ============ */
const pass = msg => ({ok:true, msg}), fail = (msg, hint) => ({ok:false, msg, hint});
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0, near = (v, t, tol) => Math.abs(v - t) <= tol;
function pinEvents(r, pin){ return r.ev.filter(e => e.pin === String(pin)); }
function pinAt(r, pin, t){ let v = 0; pinEvents(r, pin).forEach(e => { if (e.t <= t) v = e.v; }); return v; }
function segs(r, pin){ const ev = pinEvents(r, pin); const s = []; let v = 0, t0 = 0, seenOn = false;
  ev.forEach(e => { if (e.t > t0 || s.length) s.push({v, start:t0, end:e.t, d:e.t - t0, full:true, between:seenOn && v === 0}); if (e.v === 1) seenOn = true; v = e.v; t0 = e.t; });
  s.push({v, start:t0, end:r.end, d:r.end - t0, full:false, between:false}); return s.filter(x => x.d > 0); }
const serLines = r => r.ser.map(x => ({t:x.t, s:x.text.trim()})).filter(x => x.s);
const numsIn = s => (s.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
/* default virtual world: a warm Manila classroom */
function baseScenario(extra){ return Object.assign({temp:{base:29.4, wave:[0.25, 5000]}, hum:{base:68.2, wave:[0.6, 7000]}, light:{base:55}, dist:{base:120}, gas:{base:0.18}, pm25:{base:16}, gpsfix:{base:0}, lat:{base:14.582600}, lng:{base:120.978700}, sats:{base:3}, hdop:{base:9.9}, taps:[], net:{ssid:"YOUR_WIFI_NAME", pass:"YOUR_WIFI_PASSWORD"}, server:{key:"classroom-key"}}, extra || {}); }

function mountSandbox(el, ids){
  const list = ids.map(id => SB[id]).filter(Boolean); if (!list.length){ el.innerHTML = ""; return; }
  let cur = list[0], tries = {}, hintN = {};
  const key = (c, b) => "sss_sb_" + (user ? user.email : "g") + "_" + c.id + "_" + b;
  el.innerHTML = bench(list.length > 1 ? "Virtual board sandbox" : "Virtual board: " + cur.title, `
   ${list.length > 1 ? `<div class="sb-tabs" role="tablist">${list.map((c, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="${i === 0}">${esc(c.title)}${act(c.id) === "pass" ? " ✓" : ""}</button>`).join("")}</div>` : ""}
   <div class="sb-task"></div>
   <div class="controls"><label>Board <select class="dinput sbB">${Object.values(BOARDS).map(b => `<option value="${b.key}">${esc(b.name)}</option>`).join("")}</select></label><span class="explain sbScen"></span></div>
   <div class="edwrap"><textarea class="ed sbE" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Your Arduino code"></textarea></div>
   <div class="controls"><button class="btn primary sbRun" type="button">▶ Run on the virtual board</button><button class="btn sbHint" type="button">Hint</button><button class="btn sbSol" type="button">Show a solution</button><button class="btn sbReset" type="button">Reset code</button><button class="btn sbCopy" type="button">Copy code</button></div>
   <div class="sb-results" hidden><ul class="reslist sbChecks"></ul>
    <div class="ix-grid2"><div><b>Serial Monitor</b> <span class="explain">(115200 baud, time in seconds)</span><pre class="serial sbSer" style="height:190px"></pre></div>
     <div><b>Virtual world</b><canvas class="mini-chart sbPlot" aria-label="Sensor values and pin states over time"></canvas><div class="vhw sbHW"></div></div></div>
    <div class="sbNetWrap" hidden><b>Network log</b><div class="netlog sbNet"></div><div class="sbSheetBox"><b>Virtual Google Sheet (Readings tab)</b><div class="vsheet sbSheet"></div></div></div>
    <details class="sbJsWrap"><summary class="explain">For the curious: the JavaScript the sandbox actually ran</summary><pre class="code sbJs" style="max-height:220px;overflow:auto"></pre></details></div>
   <p class="explain">The sandbox runs your C++ in a simulated board with simulated sensors and time, so it can check behavior in seconds. It is close to a real board, not identical: real hardware has noise, wiring faults, and timing quirks. Always test on the real board too.</p>`);
  const ed = $(".sbE", el), bsel = $(".sbB", el);
  bsel.value = getBoard();
  ed.addEventListener("keydown", e => { if (e.key === "Tab"){ e.preventDefault(); const s = ed.selectionStart; ed.setRangeText("  ", s, ed.selectionEnd, "end"); } });
  ed.addEventListener("input", () => { store.set(key(cur, bsel.value), ed.value); });
  const load = () => { el.dataset.cur = cur.id; const b = bsel.value;
    $(".sb-task", el).innerHTML = `<p><b>Task:</b> ${typeof cur.task === "function" ? cur.task(b) : cur.task}</p><p class="explain"><b>Passes when:</b></p><ul>${cur.criteria.map(c => `<li>${c}</li>`).join("")}</ul>`;
    $(".sbScen", el).innerHTML = cur.scenarioText ? "Virtual world: " + cur.scenarioText : "";
    ed.value = store.get(key(cur, b), null) || cur.starter(b); $(".sb-results", el).hidden = true; hintN[cur.id] = 0; };
  el.querySelectorAll(".sb-tabs button").forEach(btn => btn.onclick = () => { cur = list[+btn.dataset.i]; el.querySelectorAll(".sb-tabs button").forEach(x => x.setAttribute("aria-selected", x === btn)); load(); });
  bsel.onchange = () => { setBoard(bsel.value); load(); };
  $(".sbReset", el).onclick = () => { if (!confirm("Replace your code with the starter code?")) return; store.del(key(cur, bsel.value)); load(); };
  $(".sbCopy", el).onclick = () => copyText(ed.value);
  $(".sbHint", el).onclick = () => { const n = hintN[cur.id] || 0; const h = cur.hints[Math.min(n, cur.hints.length - 1)]; hintN[cur.id] = n + 1; toast("Hint " + (Math.min(n, cur.hints.length - 1) + 1) + " of " + cur.hints.length); showMsg(`<b>Hint ${Math.min(n, cur.hints.length - 1) + 1}.</b> ${h}`); logEvent(currentModule, cur.id, "hint", n + 1); };
  $(".sbSol", el).onclick = () => { if ((tries[cur.id] || 0) < 2 && act(cur.id) !== "pass"){ showMsg("Try running your own code at least twice first. Use the hints: struggling a little is how you learn. (UNESCO's first rule for AI applies here too: attempt first.)"); return; }
    if (!confirm("Load a working solution? Your code will be replaced (you can undo with Ctrl+Z).")) return; ed.focus(); ed.select(); document.execCommand && document.execCommand("insertText", false, cur.solution(bsel.value)) || (ed.value = cur.solution(bsel.value)); store.set(key(cur, bsel.value), ed.value); logEvent(currentModule, cur.id, "solution", "shown"); };
  function showMsg(h){ const r = $(".sb-results", el); r.hidden = false; $(".sbChecks", el).innerHTML = `<li>${h}</li>`; }
  $(".sbRun", el).onclick = async () => {
    const b = bsel.value, src = ed.value, lint = cppLint(src);
    tries[cur.id] = (tries[cur.id] || 0) + 1; const btn = $(".sbRun", el); btn.disabled = true; btn.textContent = "Running…";
    const r = await runBoard(src, b, cur.scenario(b), cur.sim);
    btn.disabled = false; btn.textContent = "▶ Run on the virtual board";
    $(".sb-results", el).hidden = false;
    let checks = [];
    if (r.err) checks = [fail(friendlyErr(r.err), lint.length ? lint.join(" ") : "")];
    else { try { checks = cur.check(r, b) || []; } catch(e){ checks = [fail("The checker could not read your output: " + e.message, "Make sure your output matches the format in the task.")]; } if (lint.length && checks.some(c => !c.ok)) checks.push(fail("Possible typing problems:", lint.join(" "))); }
    const ok = checks.length && checks.every(c => c.ok);
    $(".sbChecks", el).innerHTML = checks.map(c => `<li class="${c.ok ? "ok" : "no"}">${c.ok ? "✓" : "✗"} ${c.msg}${!c.ok && c.hint ? `<span class="explain">${c.hint}</span>` : ""}</li>`).join("") + (ok ? `<li class="ok"><b>Challenge passed.</b> Now try it on your real board.</li>` : "");
    $(".sbSer", el).textContent = r.ser.slice(0, 400).map(x => `[${(x.t / 1000).toFixed(2).padStart(6)}] ${x.text}`).join("\n") || "(nothing printed)";
    drawPlot($(".sbPlot", el), r, cur, b); drawHW($(".sbHW", el), r, cur, b);
    const netUsed = (r.net && r.net.length) || (r.rows && r.rows.length);
    $(".sbNetWrap", el).hidden = !netUsed;
    if (netUsed){ $(".sbNet", el).textContent = r.net.map(x => `[${(x.t / 1000).toFixed(2)}] ${x.dir === "out" ? "→" : x.dir === "in" ? "←" : x.dir === "err" ? "✗" : "•"} ${x.text}`).join("\n");
      $(".sbSheetBox", el).hidden = !(r.rows && r.rows.length); $(".sbSheet", el).innerHTML = r.rows.length ? `<table class="t"><tr><th>timestamp</th><th>device_id</th><th>sensor</th><th>value</th></tr>${r.rows.slice(-40).map(x => `<tr>${x.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>` : `<p class="explain">No rows yet.</p>`; }
    $(".sbJs", el).textContent = r.js || "";
    logEvent(currentModule, cur.id, "sandbox_run", ok ? "pass" : "fail");
    if (ok){ if (act(cur.id) !== "pass"){ markAct(cur.id, "pass"); confetti(); toast("Challenge passed!"); const t = el.querySelector(`.sb-tabs button[data-i="${list.indexOf(cur)}"]`); if (t) t.textContent = cur.title + " ✓"; } }
    A($(".sb-results", el), {opacity:[0,1], y:[8,0]}, {duration:.3});
  };
  load();
}
function drawPlot(cv, r, cur, b){
  const {g, W, H} = hiDPI(cv); g.clearRect(0, 0, W, H);
  const series = (cur.plot || []).filter(k => r.samples && r.samples.length && r.samples[0][k] != null);
  const T = Math.max(1, r.end || cur.sim), X = t => 34 + t / T * (W - 44);
  g.font = "10px sans-serif"; g.fillStyle = cssv("--muted") || "#475569";
  const cols = {temp:"#C2410C", hum:"#2563EB", light:"#E8B84A", dist:"#4F46E5", gas:"#7C3AED", pm25:"#B91C1C"};
  const names = {temp:"temp °C", hum:"humidity %", light:"light %", dist:"distance cm", gas:"gas (AO)", pm25:"PM2.5"};
  const plotH = H - (cur.pins ? 34 : 18);
  series.forEach((k, si) => { const vals = r.samples.map(s => s[k]); const lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * 0.15 || 1;
    const Y = v => 8 + (1 - (v - lo + pad) / (hi - lo + 2 * pad)) * (plotH - 16);
    g.strokeStyle = cols[k]; g.lineWidth = 2; g.beginPath(); r.samples.forEach((s, i) => { const x = X(s.t), y = Y(s[k]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
    g.fillStyle = cols[k]; g.fillText(names[k], 38 + si * 90, 12); });
  (cur.pins || []).forEach((p, pi) => { const pin = typeof p === "function" ? p(b) : p, y = H - 10 - pi * 12; g.fillStyle = cssv("--muted") || "#475569"; g.fillText(String(pin.label || ""), 2, y + 3);
    const s = segs(r, pin.pin); s.forEach(x => { if (x.v){ g.fillStyle = pin.color || "#E8B84A"; g.fillRect(X(x.start), y - 4, Math.max(1, X(x.end) - X(x.start)), 8); } }); });
  g.fillStyle = cssv("--muted") || "#475569"; [0, .25, .5, .75, 1].forEach(f => g.fillText((T * f / 1000).toFixed(0) + "s", X(T * f) - 6, H - 1));
}
function drawHW(box, r, cur, b){
  const last = r.samples && r.samples.length ? r.samples[r.samples.length - 1] : {};
  const cards = [];
  (cur.plot || []).forEach(k => { if (last[k] != null) cards.push([{temp:"Temperature (true)", hum:"Humidity (true)", light:"Light level (true)", dist:"Distance (true)", gas:"Gas sensor AO fraction", pm25:"PM2.5 (true)"}[k], last[k] + ({temp:" °C", hum:" %", light:" %", dist:" cm", gas:"", pm25:" µg/m³"}[k])]); });
  (cur.pins || []).forEach(p => { const pin = typeof p === "function" ? p(b) : p; cards.push([pin.label + " at the end", pinAt(r, pin.pin, r.end) ? "ON" : "off"]); });
  if (r.net && r.net.length) cards.push(["Wi-Fi", r.wifiState === 2 ? "connected" : "not connected"]);
  if (r.rows && r.rows.length) cards.push(["Rows saved", r.rows.length]);
  box.innerHTML = cards.map(c => `<div class="vcard">${esc(c[0])}<b>${esc(c[1])}</b></div>`).join("");
}
