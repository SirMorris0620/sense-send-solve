/* ============ UNIT 4 INTERACTIVES: plan, build, test, document ============ */
const projKey = () => "sss_project_" + (user ? user.email : "guest");
const getProject = () => Object.assign({title:"", who:"", where:"", decision:"", sensors:[], board:getBoard(), kpis:"", success:"", constraints:"", risks:"", privacy:"", fw:null}, store.get(projKey(), {}));
const saveProject = p => store.set(projKey(), p);
const PROJ_SENSORS = ["dht","tmp36","ldr","mq","hcsr04","pir"];
const slug = s => (String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "iot-logger").slice(0, 40);

/* 4.1 engineering design process loop (JPL's eight steps) */
INTERACTIVES.edpLoop = function(el){
  const S = [["Identify the problem","Who has the problem, and what do they need to decide? <i>Example: students in Room 204 feel sleepy after lunch; the class adviser wants to know when the room is too hot or stuffy.</i>"],
   ["Identify criteria and constraints","Criteria are what success looks like; constraints are the limits. <i>Readings every minute, a dashboard a teacher can read in 5 seconds; one board, a small budget, four weeks, school Wi-Fi.</i>"],
   ["Brainstorm possible solutions","Many ideas before choosing. <i>A DHT22 for heat and humidity? An MQ-135 for stuffiness? A PIR for movement? A buzzer alarm or a dashboard?</i>"],
   ["Select a design","Compare ideas against the criteria (a tree of thoughts helps). <i>DHT22 + MQ-135 on an ESP32-S3, logging to a Sheet, with a dashboard.</i>"],
   ["Build a model or prototype","Build the smallest version that answers the question. <i>Breadboard first; test each sensor alone (Unit 2), then together.</i>"],
   ["Test the model and evaluate","Check it against the criteria with a test plan. <i>Does it log every minute for a whole school day? Does it agree with a reference thermometer?</i>"],
   ["Refine the design","Fix what failed, then test again. Most of engineering happens in this loop. <i>Move the DHT away from the board's warm regulator; add a stale-data warning.</i>"],
   ["Share the solution","Document and present so others can use, check, and improve it. <i>README, demo, data story, and honest limitations.</i>"]];
  const SH = ["Problem","Criteria","Brainstorm","Select","Build","Test","Refine","Share"]; let i = -1;
  el.innerHTML = bench("The engineering design process (eight steps)", `<p class="explain">Tap a step, or use Next. Steps 5–7 repeat many times in a real project.</p>
   <div class="edp-wrap"><svg viewBox="-48 -6 396 312" class="edp" role="img" aria-label="A loop of eight design steps"></svg><div><div class="ix-out edpO" aria-live="polite"></div><div class="controls"><button class="btn primary edpN" type="button">Next</button><button class="btn edpB" type="button">Back</button></div></div></div>`);
  const draw = () => { const R = 100, cx = 150, cy = 150;
    $(".edp", el).innerHTML = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--line)" stroke-width="2.5" stroke-dasharray="3 6"/>
     <defs><marker id="edpArr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--signal)"/></marker></defs>
     <path d="M ${cx - 66} ${cy - 12} Q ${cx - 64} ${cy + 52} ${cx - 16} ${cy + 72}" fill="none" stroke="var(--signal)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#edpArr)" opacity="${i >= 4 && i <= 6 ? 1 : .35}"/><text x="${cx - 40}" y="${cy + 30}" text-anchor="middle" class="edp-s" opacity="${i >= 4 && i <= 6 ? 1 : .5}">repeat</text>
     <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="edp-c">${i >= 0 ? "Step " + (i + 1) : "Start"}</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" class="edp-s">${i >= 0 ? esc(SH[i]) : "press Next"}</text>
     ${S.map((x, k) => { const a = -Math.PI / 2 + k * 2 * Math.PI / S.length, X = cx + R * Math.cos(a), Y = cy + R * Math.sin(a), on = k === i, past = k < i, c = Math.cos(a), lx = cx + (R + 22) * c, ly = cy + (R + 24) * Math.sin(a), anc = c > .3 ? "start" : c < -.3 ? "end" : "middle";
      return `<g class="edp-n" data-k="${k}" tabindex="0" role="button" aria-label="Step ${k + 1}: ${esc(x[0])}"><circle cx="${X}" cy="${Y}" r="${on ? 17 : 14}" fill="${on ? "var(--signal)" : past ? "var(--teal)" : "var(--surface)"}" stroke="var(--teal)" stroke-width="2"/><text x="${X}" y="${Y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${on || past ? "#fff" : "currentColor"}">${k + 1}</text><text x="${lx}" y="${ly + 4}" text-anchor="${anc}" class="edp-l ${on ? "on" : ""}">${SH[k]}</text></g>`; }).join("")}`;
    $(".edpO", el).innerHTML = i >= 0 ? `<b>${i + 1}/${S.length}. ${S[i][0]}</b><p>${S[i][1]}</p>` : "Press <b>Next</b> to walk the loop, or tap any step.";
    $(".edpN", el).disabled = i >= S.length - 1; $(".edpB", el).disabled = i < 0; if (i >= S.length - 1) markAct("edpLoop", "done");
    el.querySelectorAll(".edp-n").forEach(g => { const go = () => { i = +g.dataset.k; draw(); }; g.onclick = go; g.onkeydown = e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); go(); } }; }); };
  $(".edpN", el).onclick = () => { i = Math.min(S.length - 1, i + 1); draw(); }; $(".edpB", el).onclick = () => { i = Math.max(-1, i - 1); draw(); };
  draw();
};

/* 4.1 project canvas */
INTERACTIVES.projectCanvas = function(el){
  const p = getProject();
  const F = [["title","Project title","e.g. Room 204 Comfort Monitor",1],["who","Who will use it? (users)","e.g. our class adviser and the class officers",1],["where","Where will it run?","e.g. Room 204, on the shelf by the window, school Wi-Fi “Faculty-IoT”",1],["decision","What decision or question will it help with?","e.g. when to turn on the fans or open the windows",1],["kpis","What will the dashboard show? (3–5 KPIs)","e.g. current temperature with status; humidity; air-quality ratio; updated time",1],["success","How will you know it works? (measurable criteria)","e.g. logs every 60 s for a full school day with fewer than 5 missing readings; within 1 °C of a reference thermometer",1],["constraints","Constraints","e.g. one board, parts we already have, 4 weeks, must not need a wall socket far from the board",0],["risks","Biggest risks and how you will reduce them","e.g. school Wi-Fi has a login page → test on a phone hotspot first",0],["privacy","Personal data and privacy plan","e.g. none: we measure the room, not people. (If you log who is in the room, e.g. with a PIR counter: what is stored, who sees it, how long?)",0]];
  el.innerHTML = bench("Project canvas: plan your prototype on one page", `<p class="explain">Your answers are saved in this browser and reused by the firmware generator, the test plan, and the README generator later in this unit.</p>
   <div class="pc-grid">${F.map(f => `<label class="pc-f"><b>${esc(f[1])}${f[3] ? " *" : ""}</b><textarea class="dinput pcI" data-k="${f[0]}" rows="3" placeholder="${esc(f[2])}">${esc(p[f[0]] || "")}</textarea></label>`).join("")}</div>
   <div class="pc-sdg"><label class="pc-f"><b>SDG target your prototype supports *</b><select class="dinput pcT"><option value="">Choose a target (Module 1.1)</option>${Object.keys(SDG_TARGETS).map(t => `<option value="${t}">Target ${t}: ${esc(SDG_TARGETS[t][0].slice(0, 70))}…</option>`).join("")}</select></label>
    <label class="pc-f"><b>How will your data help with that target? *</b><textarea class="dinput pcI" data-k="sdgHow" rows="3" placeholder="e.g. Shows when the air-quality index (MQ-135) is poor so the class can open windows: a local action for Target 3.9 (indicator 3.9.1 is about air-pollution deaths; we measure the exposure behind it, not the indicator itself)."></textarea></label><div class="explain pcTx"></div></div>
   <p><b>Sensors you plan to use</b></p><div class="choicecards pcS">${PROJ_SENSORS.map(s => `<button type="button" data-s="${s}">${esc(SENSOR_INFO[s].name)}</button>`).join("")}</div>
   <p><label><b>Board</b> <select class="dinput pcB">${["s3","esp8266","uno"].map(b => `<option value="${b}">${esc(BOARDS[b].name)}</option>`).join("")}</select></label></p>
   <div class="ix-out pcO"></div>
   <div class="controls"><button class="btn primary pcD" type="button">Download plan (.md)</button><button class="btn pcA" type="button">Ask Proto to critique my plan</button></div>`);
  $(".pcB", el).value = p.board || getBoard(); $(".pcT", el).value = p.sdg || ""; { const h = el.querySelector('.pcI[data-k="sdgHow"]'); if (h) h.value = p.sdgHow || ""; }
  const sdgLine = q => q.sdg && SDG_TARGETS[q.sdg] ? `SDG Target ${q.sdg}: ${SDG_TARGETS[q.sdg][0]}. ${q.sdgHow || ""}` : "-";
  const md = () => { const q = getProject(); return `# ${q.title || "My IoT prototype"}\n\n**Problem statement.** For ${q.who || "[users]"} at ${q.where || "[place]"}, who need to decide ${q.decision || "[decision]"}, our prototype measures ${q.sensors.map(s => SENSOR_INFO[s].what).join(", ") || "[what]"} and shows ${q.kpis || "[KPIs]"} on a web dashboard.\n\n- **Board:** ${BOARDS[q.board].name}\n- **Sensors:** ${q.sensors.map(s => SENSOR_INFO[s].name).join(", ") || "-"}\n- **Success criteria:** ${q.success || "-"}\n- **Constraints:** ${q.constraints || "-"}\n- **Risks:** ${q.risks || "-"}\n- **Privacy plan:** ${q.privacy || "-"}\n- **SDG alignment:** ${sdgLine(q)}\n`; };
  const draw = () => { const q = getProject(); el.querySelectorAll(".pcS button").forEach(b => b.classList.toggle("sel", q.sensors.includes(b.dataset.s)));
    const req = F.filter(f => f[3]), filled = req.filter(f => (q[f[0]] || "").trim().length >= 4).length + (q.sensors.length ? 1 : 0) + (q.sdg ? 1 : 0) + ((q.sdgHow || "").trim().length >= 10 ? 1 : 0), total = req.length + 3;
    $(".pcTx", el).innerHTML = q.sdg && SDG_TARGETS[q.sdg] ? `<b>Target ${q.sdg}.</b> ${esc(SDG_TARGETS[q.sdg][0])}.<br><b>Indicator:</b> ${esc(SDG_TARGETS[q.sdg][1])}<br><span>Be honest about scale: a classroom prototype contributes local evidence or action toward a target; it does not move the national indicator by itself.</span>` : "";
    const conf = q.sensors.length ? genConflicts(q.board, q.sensors) : [];
    const personal = q.sensors.includes("pir") && (q.privacy || "").trim().length < 10;
    $(".pcO", el).innerHTML = `<b>Problem statement</b><p>For <b>${esc(q.who || "[users]")}</b> at <b>${esc(q.where || "[place]")}</b>, who need to decide <b>${esc(q.decision || "[decision]")}</b>, our prototype measures <b>${esc(q.sensors.map(s => SENSOR_INFO[s].what).join(", ") || "[what]")}</b> and shows <b>${esc(q.kpis || "[KPIs]")}</b> on a web dashboard.</p>
     <div class="meter"><i style="width:${Math.round(filled / total * 100)}%"></i></div><p class="explain">${filled} of ${total} required parts done.${q.sensors.length > 3 ? " Four or more sensors is ambitious for a first prototype: consider starting with two." : ""}</p>
     ${conf.length ? `<p class="err">Pin conflicts on ${esc(BOARDS[q.board].short)}: ${conf.map(esc).join("; ")}. Choose another board or drop a sensor.</p>` : ""}${personal ? `<p class="err">A motion sensor can reveal when people are present. Write a privacy plan (who sees it, how long you keep it) before you build.</p>` : ""}`;
    if (filled === total && !conf.length && !personal) markAct("projectCanvas", "done"); };
  el.querySelectorAll(".pcI").forEach(t => t.oninput = () => { const q = getProject(); q[t.dataset.k] = t.value; saveProject(q); draw(); });
  el.querySelectorAll(".pcS button").forEach(b => b.onclick = () => { const q = getProject(), s = b.dataset.s; q.sensors = q.sensors.includes(s) ? q.sensors.filter(x => x !== s) : q.sensors.concat(s); saveProject(q); draw(); });
  $(".pcT", el).onchange = e => { const q = getProject(); q.sdg = e.target.value; saveProject(q); draw(); };
  $(".pcB", el).onchange = e => { const q = getProject(); q.board = e.target.value; saveProject(q); draw(); };
  $(".pcD", el).onclick = () => { downloadText(slug(getProject().title) + "-plan.md", md(), "text/markdown"); toast("Plan downloaded."); };
  $(".pcA", el).onclick = () => sendToProto(`Persona: You are a friendly engineering mentor for beginner IoT makers.\nAct: Critique my prototype plan. List the three biggest risks or gaps and one question I should answer before building. Do not rewrite the plan for me.\nRecipient: a beginner student/teacher team.\nTheme: an Arduino-style IoT prototype that logs to Google Sheets through Google Apps Script.\nStructure: a numbered list, then one question.\n\nMy plan (no passwords or personal data):\n${md()}`);
  draw();
};

/* 4.1 MoSCoW */
INTERACTIVES.moscowSort = function(el){
  choiceSorter(el, "MoSCoW: Room 204 Comfort Monitor (4 weeks, one board)", [
   ["Measure temperature and humidity every 60 s", 0, "Must: without it there is no project."],
   ["Store every reading in the Sheet with a timestamp and device ID", 0, "Must: the data is the point."],
   ["Dashboard shows the current value with a unit and a status word", 0, "Must: it is how the adviser makes the decision."],
   ["Warn on the dashboard when no data has arrived for 5 minutes", 1, "Should: important for trust, but the prototype still works without it."],
   ["A chart of the last three hours", 1, "Should: helps spot the after-lunch pattern."],
   ["Email the adviser when the room passes 33 °C", 2, "Could: nice, but adds quota and spam risks; only after the Musts work."],
   ["Flash an LED on the device after each upload", 2, "Could: a cheap, helpful debugging aid."],
   ["Predict tomorrow's temperature with machine learning", 3, "Won't (this time): needs months of data first."],
   ["Run on batteries for a month", 3, "Won't (this time): needs deep sleep and power design; plug it in for now."]
  ], ["Must","Should","Could","Won't (this time)"], "moscowSort", "Sort each requirement. There is room for debate: read the reason after each choice.");
};

/* 4.1 data volume calculator */
INTERACTIVES.dataVolume = function(el){
  el.innerHTML = bench("Data volume calculator", `<div class="ix-grid2"><div>
    <label class="sl">Devices <input type="range" class="dvD" min="1" max="40" value="1"> <b class="dvDv"></b></label>
    <label class="sl">Values per upload (e.g. DHT = 2, TMP36 = 1) <input type="range" class="dvV" min="1" max="8" value="2"> <b class="dvVv"></b></label>
    <label class="sl">Upload every (seconds) <input type="range" class="dvI" min="10" max="600" step="5" value="60"> <b class="dvIv"></b></label>
    <label class="sl">Hours running per day <input type="range" class="dvH" min="1" max="24" value="24"> <b class="dvHv"></b></label></div>
    <div class="ix-out dvO"></div></div>`);
  const draw = () => { const d = +$(".dvD", el).value, v = +$(".dvV", el).value, s = +$(".dvI", el).value, h = +$(".dvH", el).value;
    $(".dvDv", el).textContent = d; $(".dvVv", el).textContent = v; $(".dvIv", el).textContent = s + " s"; $(".dvHv", el).textContent = h + " h";
    const req = Math.round(d * h * 3600 / s), rows = req * v, cells = rows * 4, days = 1e7 / cells;
    const life = days >= 730 ? `${(days / 365).toFixed(1)} years` : days >= 60 ? `${Math.round(days / 30)} months` : `${Math.round(days)} days`;
    $(".dvO", el).innerHTML = `<table class="t"><tr><td>Requests to your web app per day</td><td><b>${req.toLocaleString()}</b></td></tr><tr><td>New rows per day (one row per value)</td><td><b>${rows.toLocaleString()}</b></td></tr><tr><td>New cells per day (4 columns)</td><td><b>${cells.toLocaleString()}</b></td></tr><tr><td>Time until the 10 million cell limit</td><td><b>${life}</b></td></tr></table>
     <p class="explain">${days < 90 ? "⚠ The Sheet will fill quickly. Upload less often, run fewer hours, or move old rows to an archive file each month." : days < 365 ? "Fine for a school term. Plan an archive step for longer projects." : "Plenty of room for a long-running prototype."} ${req > 20000 ? " ⚠ That is a lot of requests: your doGet runs once for each, and Apps Script has daily quotas. Check the quota page and slow down." : ""} A spreadsheet also gets slower well before it is full: archiving old rows keeps the dashboard fast.</p>`;
    markAct("dataVolume", "done"); };
  el.querySelectorAll("input").forEach(i => i.oninput = draw); draw();
};

/* 4.1 personal data sorter */
INTERACTIVES.privacySort = function(el){
  choiceSorter(el, "Personal, not personal, or secret?", [
   ["Classroom temperature every minute", 1, "Measures the room, not a person."],
   ["A PIR log of room entries, with a tab that links each entry to a student's name", 0, "Linked to a named person, so it is personal data. Collect only what you need and protect who can see it."],
   ["A camera or microphone recording inside a classroom", 0, "Recordings identify people directly: do not collect them for a comfort or safety prototype."],
   ["The Wi-Fi password", 2, "Not personal data, but a secret: never in shared code, screenshots, or AI chats."],
   ["Your Apps Script API key", 2, "A secret: anyone with it can write to your Sheet."],
   ["Device ID “team1-esp32s3”", 1, "Identifies a board, not a person."],
   ["Student attendance times from card taps", 0, "Personal data about named people's behavior: needs a clear purpose, consent, and limited access."]
  ], ["Personal data","Not personal","Secret"], "privacySort", "Decide how to treat each piece of data.");
};

/* 4.2 deploy walk-through */
INTERACTIVES.deploySteps = function(el){
  const S = [["Deploy → New deployment","In the Apps Script editor, click the blue <b>Deploy</b> button, then <b>New deployment</b>."],
   ["Select type: Web app","Click the gear next to “Select type” and choose <b>Web app</b>."],
   ["Description","Type something like <i>v1 logger + dashboard</i>. Descriptions help you track versions."],
   ["Execute as: Me","The script runs with <b>your</b> permission to write to your Sheet, whoever sends the request."],
   ["Who has access: Anyone","Your board cannot sign in to Google, so it needs <b>Anyone</b>. This means anyone with the URL can open the dashboard: that is why the API key protects writing, and why you do not post the URL publicly."],
   ["Authorize access","The first time, Google asks you to authorize. You may see “Google hasn't verified this app”: because you wrote it yourself, choose <b>Advanced</b> → <b>Go to (project name)</b> → <b>Allow</b>. Never do this for a script you did not write or read."],
   ["Copy the web app URL","Copy the URL ending in <code>/exec</code>. This goes in your sketch as <code>SCRIPT_URL</code>."],
   ["Changed the code later?","<b>Deploy → Manage deployments → ✎ Edit → Version: New version → Deploy.</b> The URL stays the same. Saving alone does NOT update the live web app: this is the most common mistake."]];
  stepper(el, "Deploying your web app, step by step", S, (v, i) => {
    v.innerHTML = browserMock("script.google.com › Deploy", `<div class="dpm">${["Deploy ▾","Type: Web app","Description","Execute as: Me","Who has access: Anyone","Authorize","…/exec","New version"].map((t, k) => `<span class="dpm-s ${k === i ? "on" : k < i ? "done" : ""}">${esc(t)}</span>`).join("")}</div>`);
  }, "deploySteps");
};

/* 4.3 firmware generator */
INTERACTIVES.fwGen = function(el){
  const p = getProject(); const f = Object.assign({board:p.board || getBoard(), sensors:(p.sensors || []).slice(), seconds:60, name:p.title || "", ssid:"", url:"", device:""}, p.fw || {});
  el.innerHTML = bench("Firmware generator", `<p class="explain">Pick your board and parts. The generator combines the tested sensor programs from Unit 2 with the logger from Module 3.2. It never asks for your Wi-Fi password or API key: you type those into the Arduino IDE yourself.</p>
   <div class="ix-grid2"><div>
    <label><b>Board</b> <select class="dinput fgB">${["s3","esp8266","uno"].map(b => `<option value="${b}">${esc(BOARDS[b].name)}</option>`).join("")}</select></label>
    <p><b>Sensors</b></p><div class="choicecards fgS">${PROJ_SENSORS.map(s => `<button type="button" data-s="${s}">${esc(SENSOR_INFO[s].short)}</button>`).join("")}</div>
    <p><b>Outputs</b></p><div class="choicecards fgS">${["led","buzzer"].map(s => `<button type="button" data-s="${s}">${esc(SENSOR_INFO[s].name)}</button>`).join("")}</div>
   </div><div>
    <label class="sl">Project name <input class="dinput fgN" maxlength="60" placeholder="Room 204 Comfort Monitor"></label>
    <label class="sl">Device ID <input class="dinput fgI mono" maxlength="40" placeholder="team1-esp32s3"></label>
    <label class="sl">Wi-Fi name (optional) <input class="dinput fgW" maxlength="32" placeholder="YOUR_WIFI_NAME"></label>
    <label class="sl">Web app URL (optional) <input class="dinput fgU mono" placeholder="https://script.google.com/macros/s/…/exec"></label>
    <label class="sl">Send every <input type="range" class="fgT" min="10" max="600" step="5"> <b class="fgTv"></b></label>
   </div></div>
   <div class="ix-out fgO"></div><div class="fgWire"></div><div class="fgCode"></div>
   <div class="controls"><button class="btn primary fgRun" type="button">▶ Test on the virtual board</button></div>
   <div class="fgRes" hidden><ul class="reslist fgChecks"></ul><div class="ix-grid2"><div><b>Serial Monitor</b><pre class="serial fgSer" style="max-height:240px"></pre></div><div><b>Network</b><div class="netlog fgNet" style="max-height:120px"></div><b>Rows received by the virtual web app</b><div class="vsheet fgRows"></div></div></div></div>`);
  $(".fgB", el).value = f.board; $(".fgN", el).value = f.name; $(".fgI", el).value = f.device; $(".fgW", el).value = f.ssid; $(".fgU", el).value = f.url; $(".fgT", el).value = f.seconds;
  let lines = [];
  const save = () => { const q = getProject(); q.fw = Object.assign({}, f); saveProject(q); };
  const draw = () => { el.querySelectorAll(".fgS button").forEach(b => b.classList.toggle("sel", f.sensors.includes(b.dataset.s))); $(".fgTv", el).textContent = f.seconds + " s";
    const conf = genConflicts(f.board, f.sensors), real = f.sensors.filter(s => PROJ_SENSORS.includes(s));
    const mA = BOARD_mA[f.board].avg + f.sensors.reduce((a, s) => a + (SENSOR_INFO[s].peak || SENSOR_INFO[s].mA), 0);
    const urlBad = f.url && !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(f.url.trim());
    $(".fgO", el).innerHTML = `${!real.length ? `<p class="err">Choose at least one sensor.</p>` : ""}${conf.length ? `<p class="err">Pin conflict on ${esc(BOARDS[f.board].short)}: ${conf.map(esc).join("; ")}. Remove one part or choose another board.</p>` : ""}${urlBad ? `<p class="err">That does not look like a web app URL. It should start with https://script.google.com/macros/s/ and end with /exec (not /dev, and not the editor URL).</p>` : ""}
     <p class="explain">Estimated current: about <b>${mA} mA</b> (board + parts, worst case). ${mA > 450 ? "⚠ Close to the 500 mA a computer USB port gives: use a good 5 V 1–2 A USB power adapter." : "A computer USB port or a 5 V 1 A adapter is enough."}${f.sensors.includes("mq") ? " The MQ-135 heater is the biggest load and gets warm." : ""}</p>`;
    $(".fgWire", el).innerHTML = real.length && !conf.length ? `<details><summary><b>Wiring for this combination (${esc(BOARDS[f.board].short)})</b></summary>${f.sensors.filter(s => PIN_PLAN[s]).map(s => `<p><b>${esc(SENSOR_INFO[s].name)}</b></p>${wiringTable(s, f.board)}${(PIN_PLAN[s][f.board].parts || []).map(x => `<p class="explain">• ${esc(x)}</p>`).join("")}`).join("")}${f.sensors.includes("led") || f.sensors.includes("buzzer") ? `<p class="explain">LED: pin → 220 Ω → LED long leg; short leg → GND. Active buzzer: pin → buzzer + ; buzzer − → GND.</p>` : ""}</details>` : "";
    if (!real.length || conf.length){ $(".fgCode", el).innerHTML = ""; $(".fgRun", el).disabled = true; lines = []; return; }
    $(".fgRun", el).disabled = false;
    lines = genFirmware(f); $(".fgCode", el).innerHTML = anat("Your sketch", lines, {file: slug(f.name) + ".ino"}); };
  el.querySelectorAll(".fgS button").forEach(b => b.onclick = () => { const s = b.dataset.s; f.sensors = f.sensors.includes(s) ? f.sensors.filter(x => x !== s) : f.sensors.concat(s); save(); draw(); $(".fgRes", el).hidden = true; });
  $(".fgB", el).onchange = e => { f.board = e.target.value; save(); draw(); };
  [["fgN","name"],["fgI","device"],["fgW","ssid"],["fgU","url"]].forEach(([c, k]) => $("." + c, el).oninput = e => { f[k] = e.target.value.trim(); save(); draw(); });
  $(".fgT", el).oninput = e => { f.seconds = +e.target.value; save(); draw(); };
  $(".fgRun", el).onclick = async () => {
    const btn = $(".fgRun", el); btn.disabled = true; btn.textContent = "Running 40 s of virtual time…";
    let src = lines.map(l => l[0]).join("\n").replace('const String API_KEY = "YOUR_API_KEY";', 'const String API_KEY = "classroom-key";').replace(/const unsigned long SEND_EVERY_MS = \d+;/, "const unsigned long SEND_EVERY_MS = 10000;").replace("MQ_WARMUP_MS = 120000", "MQ_WARMUP_MS = 3000");
    if (!/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec"/.test(src)) src = src.replace(/const String SCRIPT_URL = ".*";/, 'const String SCRIPT_URL = "https://script.google.com/macros/s/VIRTUAL/exec";');
    const S = baseScenario({parts:f.sensors.concat(f.outs || []), dist:{base:64}, pir:{warm:0, hold:2000, steps:[[12000, 15000, 1]]}, adcSensor:f.sensors.includes("mq") && !f.sensors.includes("ldr") ? "gas" : "", net:{ssid:f.ssid || "YOUR_WIFI_NAME", pass:"YOUR_WIFI_PASSWORD"}});
    const R = await runBoard(src, f.board, S, 40000); btn.disabled = false; btn.textContent = "▶ Test on the virtual board";
    $(".fgRes", el).hidden = false;
    const rows = R.rows || [], sensorsSeen = new Set(rows.map(r => r[2])), errs = (R.net || []).filter(n => n.dir === "in" && /ERR:/.test(n.text));
    const want = {dht:"temp_c", tmp36:"temp_c", hcsr04:"distance_cm", ldr:"light_pct", mq:"gas_raw", pir:"pir"};
    const missing = f.sensors.filter(s => want[s] && !sensorsSeen.has(want[s]));
    const checks = [R.err ? fail(esc(friendlyErr(R.err))) : pass("The sketch compiled and ran in the simulator."), rows.length ? pass(`${rows.length} readings reached the virtual web app.`) : fail("No readings reached the virtual web app.", "Read the Serial Monitor below for the first error."), !errs.length ? pass("The web app accepted every request.") : fail("The web app replied " + esc(errs[0].text), "ERR:key → the key does not match; ERR:bad_value → a reading was nan or empty."), !missing.length ? pass("Every chosen sensor sent data.") : fail("No data from: " + missing.map(s => SENSOR_INFO[s].short).join(", "), "In a 40 s test some sensors may need longer (e.g. MQ warm-up)." )];
    $(".fgChecks", el).innerHTML = checks.map(c => `<li class="${c.ok ? "ok" : "no"}">${c.ok ? "✓" : "✗"} ${c.msg}${!c.ok && c.hint ? `<span class="explain">${c.hint}</span>` : ""}</li>`).join("") + `<li class="explain">For the test, the key is set to the virtual server's key, uploads happen every 10 s, and the MQ warm-up is shortened. Your downloaded sketch keeps your settings.</li>`;
    $(".fgSer", el).textContent = (R.ser || []).slice(0, 60).map(x => `[${(x.t / 1000).toFixed(1)} s] ${x.text}`).join("\n") || "(no output)";
    $(".fgNet", el).textContent = (R.net || []).slice(-14).map(n => (n.dir === "out" ? "→ " : n.dir === "in" ? "← " : "• ") + n.text).join("\n");
    $(".fgRows", el).innerHTML = rows.length ? `<table class="t"><tr><th>timestamp</th><th>device_id</th><th>sensor</th><th>value</th></tr>${rows.slice(-10).map(r => `<tr>${r.map(c => `<td>${esc(String(c).replace("T", " ").replace(/\.\d+Z$/, ""))}</td>`).join("")}</tr>`).join("")}</table>` : `<p class="explain">(none)</p>`;
    const ok = checks.every(c => c.ok); logEvent(currentModule, "fwGen", "sandbox_run", ok ? "pass" : "fail");
    if (ok && act("fwGen") !== "pass"){ markAct("fwGen", "pass"); confetti(); toast("Your firmware works on the virtual board!"); } };
  draw();
};

/* 4.4 dashboard live preview with fake data */
const DASH_FAKE = {
  dht: (t, sc) => [["temp_c", +(sc === "hot" ? 29.5 + 4.2 * Math.max(0, 1 - t / 90) : 29.4 + 0.6 * Math.sin(t / 20)).toFixed(1)], ["hum_pct", +(66 + 3 * Math.sin(t / 30)).toFixed(1)]],
  tmp36: (t, sc) => [["temp_c", +(sc === "hot" ? 30 + 3 * Math.max(0, 1 - t / 90) : 28 + 0.5 * Math.sin(t / 22)).toFixed(1)]],
  hcsr04: t => [["distance_cm", +(48 + 6 * Math.sin(t / 15)).toFixed(1)]],
  ldr: t => [["light_pct", +(60 + 20 * Math.sin(t / 40)).toFixed(1)]],
  mq: (t, sc) => [["gas_raw", Math.round(740 * (sc === "hot" ? 1 + 0.6 * Math.max(0, 1 - t / 60) : 1.02))], ["gas_ratio", +(sc === "hot" ? 1 + 0.6 * Math.max(0, 1 - t / 60) : 1.02 + 0.05 * Math.sin(t / 12)).toFixed(2)]],
  pir: t => t % 9 === 4 ? [["pir", 1]] : []
};
function dashMock(sensors, sc, device){
  const rows = [], gap = sc === "stale" ? 22 : 0;
  for (let t = 149; t >= 0; t--) sensors.forEach(s => (DASH_FAKE[s] ? DASH_FAKE[s](t, sc) : []).forEach(([k, v]) => rows.push([t + gap, device, k, v])));
  for (let t = 149; t >= 0; t -= 5) rows.push([t + gap, "team2-esp8266", "temp_c", +(30.1 + 0.4 * Math.sin(t / 18)).toFixed(1)]);
  rows.sort((a, b) => b[0] - a[0]);
  const json = JSON.stringify(rows).replace(/</g, "\\u003c");
  return `<script>(function(){var M=${json};function data(n){var now=Date.now();return M.slice(-n).map(function(r){return {timestamp:new Date(now-r[0]*60000).toISOString(),device_id:r[1],sensor:r[2],value:r[3]};});}
function R(s,f){return {withSuccessHandler:function(fn){return R(fn,f);},withFailureHandler:function(fn){return R(s,fn);},withUserObject:function(){return R(s,f);},getLatest:function(n){setTimeout(function(){s&&s(data(Number(n)||50));},150);}};}
window.google={script:{run:R(null,null)}};})();<\/script>`;
}
INTERACTIVES.dashPreview = function(el){
  const key = "sss_dash_" + (user ? user.email : "g"), p = getProject();
  let sensors = (p.sensors && p.sensors.length ? p.sensors : ["dht","mq"]).filter(s => DASH_FAKE[s]);
  el.innerHTML = bench("Dashboard preview with practice data", `<p class="explain">This is your real Index.html running with <b>fake</b> data (google.script.run is imitated). Edit the code, press Update, and download your version when you are happy.</p>
   <div class="controls"><span><b>Fake sensors:</b></span><span class="choicecards dpS" style="display:inline-flex;flex-wrap:wrap">${PROJ_SENSORS.map(s => `<button type="button" data-s="${s}">${esc(SENSOR_INFO[s].short)}</button>`).join("")}</span></div>
   <div class="controls"><label>Situation <select class="dinput dpC"><option value="normal">A normal day</option><option value="hot">A hot, stuffy afternoon</option><option value="stale">The device went offline 22 minutes ago</option></select></label>
    <button class="btn primary dpU" type="button">Update preview</button><button class="btn dpD" type="button">Download Index.html</button><button class="btn dpR" type="button">Reset code</button></div>
   <iframe class="dpF" title="Dashboard preview" sandbox="allow-scripts" style="width:100%;height:620px;border:1px solid var(--line);border-radius:12px;background:#fff"></iframe>
   <details><summary><b>Edit Index.html</b></summary><textarea class="ed dpE" spellcheck="false" autocapitalize="off" autocorrect="off" aria-label="Index.html code" style="min-height:360px"></textarea></details>
   <p class="explain">The chart and map libraries load from the internet; if they are blocked on your network, the cards and table still work.</p>`);
  const ed = $(".dpE", el); ed.value = store.get(key, null) || PROJECT_HTML;
  ed.addEventListener("input", () => store.set(key, ed.value));
  const dev = (p.fw && p.fw.device) || "team1-esp32s3";
  const upd = () => { el.querySelectorAll(".dpS button").forEach(b => b.classList.toggle("sel", sensors.includes(b.dataset.s)));
    const html = ed.value, mock = dashMock(sensors, $(".dpC", el).value, dev.replace(/[^A-Za-z0-9_-]/g, "") || "team1-esp32s3");
    $(".dpF", el).srcdoc = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + mock) : mock + html;
    markAct("dashPreview", "done"); };
  el.querySelectorAll(".dpS button").forEach(b => b.onclick = () => { const s = b.dataset.s; sensors = sensors.includes(s) ? sensors.filter(x => x !== s) : sensors.concat(s); upd(); });
  $(".dpC", el).onchange = upd; $(".dpU", el).onclick = upd;
  $(".dpD", el).onclick = () => { downloadText("Index.html", ed.value, "text/html"); toast("Downloaded Index.html"); };
  $(".dpR", el).onclick = () => { if (confirm("Replace your edits with the original Index.html?")){ store.del(key); ed.value = PROJECT_HTML; upd(); } };
  upd();
};

/* checklists (4.4 launch, 4.5 showcase) */
function checklist(el, title, id, items, intro){
  const key = "sss_chk_" + id + "_" + (user ? user.email : "g"); const st = store.get(key, {});
  el.innerHTML = bench(title, `${intro ? `<p class="explain">${intro}</p>` : ""}<ul class="chkl">${items.map((it, i) => `<li><label><input type="checkbox" data-i="${i}" ${st[i] ? "checked" : ""}> <span>${it}</span></label></li>`).join("")}</ul><p class="ix-out chkO"></p>`);
  const draw = () => { const n = items.filter((_, i) => st[i]).length; $(".chkO", el).textContent = n === items.length ? "All done ✓" : `${n} of ${items.length} checked.`; if (n === items.length) markAct(id, "done"); };
  el.querySelectorAll("input").forEach(c => c.onchange = () => { st[c.dataset.i] = c.checked; store.set(key, st); draw(); }); draw();
}
INTERACTIVES.launchCheck = el => checklist(el, "Before you share your dashboard", "launchCheck", [
  "The page loads on a phone and on a laptop, with no sideways scrolling.",
  "Every number has a unit, and status uses words as well as color.",
  "The newest-reading time is shown, and the stale warning appears when the device is unplugged.",
  "Thresholds (warning and danger levels) are set for MY sensors and explained in my README.",
  "No names, photos, or other personal data appear on the page; PIR data is shown only as counts.",
  "I deployed a NEW VERSION after my last code change, and tested the /exec link in a private window.",
  "The API key appears only in Code.gs and in the sketch, never in Index.html, screenshots, or chats.",
  "I shared the link only with the people who need it."], "Tick each item after you have checked it yourself.");

/* 4.5 test plan */
const TESTS_BASE = [["Wi-Fi recovery","Turn the router or hotspot off for 30 s, then on.","The board reconnects by itself and uploads continue."],["Wrong key","Change one letter of API_KEY in the sketch and upload.","The Serial Monitor shows ERR:key and no rows are added."],["Power cycle","Unplug the board for 10 s, plug it back in.","It restarts, reconnects, and logs again within 1 minute."],["Stale warning","Leave the board unplugged for longer than STALE_MIN.","The dashboard shows the “No new data” warning."],["Full day","Run it for a full school day.","Fewer than 5% of expected readings are missing (count the rows)."],["Dashboard on a phone","Open the /exec link on a phone.","Readable without zooming; values match the Sheet."]];
const TESTS_SENSOR = {dht:[["DHT accuracy","Place a reference thermometer next to the sensor for 15 min.","Within about 0.5–1 °C (DHT22) or 2 °C (DHT11) of the reference."]], tmp36:[["TMP36 accuracy","Compare with a reference thermometer at room temperature and in a cup of cool water.","Within about 2 °C; the offset is the same at both points (or you calibrated it)."]], hcsr04:[["Distance accuracy","Measure 10, 50 and 100 cm with a tape measure against a flat board.","Within about 1 cm at each distance."]], ldr:[["Light calibration","Cover the LDR, then shine a flashlight on it.","About 0% covered and about 100% in the flashlight."]], mq:[["MQ baseline","After warm-up, read in clean air for 10 min.","gas_ratio stays near 1.0; it rises near an alcohol marker and falls back."]], pir:[["Motion and hold","Walk past, then stand still for 30 s.","One motion event per pass; no events when nobody is there after warm-up."]]};
INTERACTIVES.testPlan = function(el){
  const key = "sss_tests_" + (user ? user.email : "g"), p = getProject(), st = store.get(key, {});
  const T = TESTS_BASE.concat(...(p.sensors || []).map(s => TESTS_SENSOR[s] || []));
  el.innerHTML = bench("Test plan and log", `<p class="explain">${(p.sensors || []).length ? "Built from the sensors in your project canvas." : "Choose sensors in the project canvas (Module 4.1) to add sensor tests."} Run each test on your real prototype and record what happened.</p>
   <div class="tp-wrap"><table class="t tp"><tr><th>Test</th><th>How</th><th>Expected</th><th>Result</th><th>What happened / what you changed</th></tr>${T.map((t, i) => `<tr><td><b>${esc(t[0])}</b></td><td>${esc(t[1])}</td><td>${esc(t[2])}</td><td><select class="dinput tpR" data-i="${i}" aria-label="Result for ${esc(t[0])}"><option value="">Not yet</option><option>Pass</option><option>Fail</option><option>Pass after fix</option></select></td><td><input class="dinput tpN" data-i="${i}" aria-label="Notes for ${esc(t[0])}"></td></tr>`).join("")}</table></div>
   <div class="controls"><button class="btn tpD" type="button">Download as CSV</button></div><p class="ix-out tpO"></p>`);
  el.querySelectorAll(".tpR").forEach(s => s.value = (st[s.dataset.i] || {}).r || ""); el.querySelectorAll(".tpN").forEach(s => s.value = (st[s.dataset.i] || {}).n || "");
  const draw = () => { const done = T.filter((_, i) => (st[i] || {}).r).length, failed = T.filter((_, i) => (st[i] || {}).r === "Fail").length;
    $(".tpO", el).textContent = `${done} of ${T.length} tests run${failed ? `, ${failed} failing: refine and test again` : ""}.`; if (done >= Math.min(5, T.length)) markAct("testPlan", "done"); };
  const set = (i, k, v) => { st[i] = Object.assign(st[i] || {}, {[k]: v}); store.set(key, st); draw(); };
  el.querySelectorAll(".tpR").forEach(s => s.onchange = () => set(s.dataset.i, "r", s.value)); el.querySelectorAll(".tpN").forEach(s => s.oninput = () => set(s.dataset.i, "n", s.value));
  const q = v => `"${String(v).replace(/"/g, '""')}"`;
  $(".tpD", el).onclick = () => downloadText("test-log.csv", ["test,how,expected,result,notes"].concat(T.map((t, i) => [t[0], t[1], t[2], (st[i] || {}).r || "Not yet", (st[i] || {}).n || ""].map(q).join(","))).join("\n"), "text/csv");
  draw();
};
function testSummary(){ const st = store.get("sss_tests_" + (user ? user.email : "g"), {}), p = getProject(); const T = TESTS_BASE.concat(...(p.sensors || []).map(s => TESTS_SENSOR[s] || []));
  return T.map((t, i) => [t[0], (st[i] || {}).r || "Not yet", (st[i] || {}).n || ""]); }

/* 4.5 README generator */
INTERACTIVES.readmeGen = function(el){
  const p = getProject(), fw = p.fw || {}, board = fw.board || p.board || getBoard(), sensors = (fw.sensors && fw.sensors.length ? fw.sensors : p.sensors) || [];
  const tests = testSummary(), ai = store.get(aiLogKey(), []);
  const wiring = sensors.filter(s => PIN_PLAN[s]).map(s => `### ${SENSOR_INFO[s].name}\n\n| ${SENSOR_INFO[s].short} pin | ${BOARDS[board].short} pin | Note |\n|---|---|---|\n${PIN_PLAN[s][board].con.map(c => `| ${c[0]} | ${c[1]} | ${c[3] || ""} |`).join("\n")}\n${(PIN_PLAN[s][board].parts || []).map(x => `\n- ${x}`).join("")}`).join("\n\n");
  const md = `# ${p.title || "My IoT prototype"}

${p.who ? `For ${p.who} at ${p.where || "our school"}, who need to decide ${p.decision || "…"}.` : "_Describe the problem and who it helps._"}

## What it does
${sensors.length ? `Measures ${sensors.map(s => SENSOR_INFO[s].what).join(", ")} using an ${BOARDS[board].name}, sends readings over Wi-Fi to a Google Apps Script web app every ${fw.seconds || 60} s, stores them in a Google Sheet, and shows ${p.kpis || "the latest values"} on a web dashboard.` : "_List your sensors and what the dashboard shows._"}

\`\`\`
Sensor(s) → ${BOARDS[board].short} → Wi-Fi → HTTPS GET → Apps Script (Code.gs) → Google Sheet → dashboard (Index.html)
\`\`\`

## Parts
- ${BOARDS[board].name} and USB cable
${sensors.map(s => `- ${SENSOR_INFO[s].name}`).join("\n")}
- Breadboard, jumper wires, resistors listed in the wiring notes

## Wiring
${wiring || "_Add your wiring table._"}

## Setup
1. Make a copy of the Google Sheet and open **Extensions → Apps Script**.
2. Paste \`Code.gs\` and \`Index.html\`. Change \`API_KEY\` to your own long random key.
3. **Deploy → New deployment → Web app** (Execute as: Me; Who has access: Anyone). Copy the /exec URL.
4. Open the sketch \`${slug(p.title || fw.name)}.ino\`, fill in Wi-Fi name, password, SCRIPT_URL and API_KEY, and upload.
5. Open the Serial Monitor at 115200 baud and look for \`OK:\` replies.

## Data
Sheet tab **Readings**: \`timestamp | device_id | sensor | value\` (one row per value). Device ID: \`${fw.device || "team1-…"}\`.

## Testing
| Test | Result | Notes |
|---|---|---|
${tests.map(t => `| ${t[0]} | ${t[1]} | ${t[2].replace(/\|/g, "/")} |`).join("\n")}

## Limitations and next steps
- ${p.risks || "_What does not work yet, and what would you improve?_"}
- Sensor readings are approximate; see the accuracy tests above.

## SDG alignment
${p.sdg && SDG_TARGETS[p.sdg] ? `This prototype supports **SDG Target ${p.sdg}**: ${SDG_TARGETS[p.sdg][0]}.\n\nRelated indicator: ${SDG_TARGETS[p.sdg][1]}.\n\n${p.sdgHow || "_Explain how your data helps with this target._"}` : "_Choose an SDG target in your project canvas (Module 4.1) and explain how your data helps with it._"}

## Privacy and safety
${p.privacy || "_What data is collected, who can see it, and how long it is kept._"} Wi-Fi passwords and the API key are not included in this repository.

## Use of AI
${ai.length ? `We used AI assistance ${ai.length} time(s) and logged each use (tool, prompt framework, what we changed, how we verified it). Our AI-use log is attached. All code was read, tested, and is our responsibility.` : "_State whether and how you used AI, how you checked its output, and attach your AI-use log._"}

## References
${["mqsheet","hcsr04","dhtlib","tmp36","pirsheet"].filter(k => ({mqsheet:"mq", hcsr04:"hcsr04", dhtlib:"dht", tmp36:"tmp36", pirsheet:"pir"})[k] && sensors.includes(({mqsheet:"mq", hcsr04:"hcsr04", dhtlib:"dht", tmp36:"tmp36", pirsheet:"pir"})[k])).concat(["appsScript","githubDocs"]).map(k => `- ${REF[k][0]}${REF[k][1] ? " " + REF[k][1] : ""}`).join("\n")}
`;
  el.innerHTML = bench("README generator", `<p class="explain">Built from your project canvas, firmware choices, test log, and AI-use log. Edit it freely: it is a starting point, not the finished document.</p>
   <textarea class="ed rmE" spellcheck="true" aria-label="README text" style="min-height:420px"></textarea>
   <div class="controls"><button class="btn primary rmD" type="button">Download README.md</button><button class="btn rmC" type="button">Copy</button><button class="btn rmR" type="button">Regenerate from my data</button></div>`);
  const key = "sss_readme_" + (user ? user.email : "g"), ed = $(".rmE", el); ed.value = store.get(key, null) || md;
  ed.oninput = () => store.set(key, ed.value);
  $(".rmD", el).onclick = () => { downloadText("README.md", ed.value, "text/markdown"); markAct("readmeGen", "done"); toast("README downloaded."); };
  $(".rmC", el).onclick = () => copyText(ed.value);
  $(".rmR", el).onclick = () => { if (confirm("Replace your edited README with a fresh one from your data?")){ ed.value = md; store.set(key, md); } };
};

/* 4.5 rubric self-assessment */
const RUBRIC = [
 ["Purpose and SDG alignment","No link to a real need or to the SDGs.","Names an SDG goal in general terms.","Names a specific SDG target, explains how the data supports local action toward it, and is honest about scale.","Plus evidence that users acted on the data, linked to the target's indicator."],
 ["Problem and planning","A sensor is chosen, but the problem or users are unclear.","A problem statement and some requirements exist.","A clear problem statement, MoSCoW requirements, data plan, and risks.","All of that, plus evidence that users shaped the plan (interview, feedback) and the plan was updated."],
 ["Hardware build","Parts are connected but some wiring is unsafe or unreliable.","Works on the bench; wiring roughly follows the pin plan.","Tidy, correct wiring with dividers/pull-ups where needed; power is adequate.","Robust enough to run in the real location (secured wires, placement chosen for good readings)."],
 ["Firmware and data quality","Readings appear in the Serial Monitor only.","Readings reach the Sheet, but failed readings or Wi-Fi drops cause problems.","Non-blocking timing, error checks (no nan), and automatic Wi-Fi reconnection.","Calibrated sensors, documented accuracy, and graceful handling of every failure found in testing."],
 ["Backend (Apps Script + Sheet)","A script exists but rejects or loses data.","Logs readings with timestamps.","Key check, validation, LockService, and a clean long-format table.","Plus a sensible data-retention or archive plan and evidence of quota awareness."],
 ["Dashboard","Shows raw rows.","Shows current values.","3–5 KPIs with units, status words, freshness, and a fitting chart; works on phones.","Clearly answers the users' decision; tested with a real user and improved."],
 ["Testing and iteration","No testing beyond “it turned on”.","Some tests, mostly informal.","A written test plan with results; failures were fixed and re-tested.","Long-run test (a full day or more), accuracy checks against references, and documented iterations."],
 ["Responsible and ethical use (incl. AI)","No consideration of privacy, safety, or AI use.","Mentions privacy or AI use.","Personal data minimized and protected; secrets never shared; AI use logged with verification notes (human agency).","Thoughtful reflection on who benefits and who could be harmed; AI used as a critical partner, with clear evidence of human decisions."],
 ["Documentation and presentation","Little or no documentation.","A short description of the project.","A README someone else could follow, and a clear demo with a data story.","Others have rebuilt or used the prototype from the documentation; limitations and next steps are honest and specific."]];
INTERACTIVES.rubricSelf = function(el){
  const key = "sss_rubric_" + (user ? user.email : "g"), st = store.get(key, {});
  el.innerHTML = bench("Rubric: assess your prototype", `<p class="explain">Choose the level that matches your <b>evidence</b>, not your effort. Your teacher may use the same rubric.</p>
   <div class="tp-wrap"><table class="t rb"><tr><th>Criterion</th><th>1 Beginning</th><th>2 Developing</th><th>3 Proficient</th><th>4 Exemplary</th></tr>${RUBRIC.map((r, i) => `<tr><th>${esc(r[0])}</th>${[1,2,3,4].map(l => `<td><button type="button" class="rbB" data-i="${i}" data-l="${l}" aria-pressed="false">${esc(r[l])}</button></td>`).join("")}</tr>`).join("")}</table></div>
   <p class="ix-out rbO"></p><div class="controls"><button class="btn rbD" type="button">Download my self-assessment</button></div>`);
  const draw = () => { el.querySelectorAll(".rbB").forEach(b => { const on = +st[b.dataset.i] === +b.dataset.l; b.classList.toggle("sel", on); b.setAttribute("aria-pressed", on); });
    const n = Object.keys(st).length, sum = Object.values(st).reduce((a, b) => a + +b, 0);
    $(".rbO", el).innerHTML = n < RUBRIC.length ? `${n} of ${RUBRIC.length} criteria assessed.` : `Total <b>${sum} / ${RUBRIC.length * 4}</b>. ${new Set(Object.values(st)).size === 1 ? "All criteria are at the same level: choose the one that matters most to your users and push it up a level." : `Lowest: <b>${esc(RUBRIC[Object.keys(st).sort((a, b) => st[a] - st[b])[0]][0])}</b>: that is your best next improvement.`}`;
    if (n === RUBRIC.length) markAct("rubricSelf", "done"); };
  el.querySelectorAll(".rbB").forEach(b => b.onclick = () => { st[b.dataset.i] = +b.dataset.l; store.set(key, st); draw(); });
  $(".rbD", el).onclick = () => downloadText("self-assessment.csv", ["criterion,level,descriptor"].concat(RUBRIC.map((r, i) => `"${r[0]}",${st[i] || ""},"${st[i] ? r[st[i]].replace(/"/g, '""') : ""}"`)).join("\n"), "text/csv");
  draw();
};

/* 4.5 pitch builder */
INTERACTIVES.pitchBuilder = function(el){
  const key = "sss_pitch_" + (user ? user.email : "g"), st = store.get(key, {}), p = getProject();
  const P = [["hook","Hook (15 s)","A surprising number or moment from your data. e.g. “Room 204 hit 33 °C at 1:40 PM on Tuesday.”"],["sdg","Why it matters: SDG target (15 s)", p.sdg ? `Target ${p.sdg}. ${p.sdgHow || ""}` : "Which SDG target does it support, and how? (from your project canvas)"],["problem","Problem and users (30 s)", p.who ? `Who: ${p.who}. Decision: ${p.decision || "…"}` : "Who has the problem, and what do they need to decide?"],["demo","Live demo (60 s)","Show the device, then the dashboard updating. Have a screenshot ready in case Wi-Fi fails."],["data","Data story (45 s)","One chart, one insight, one recommended action."],["limits","Limits and ethics (20 s)","What your prototype cannot do yet; how you protected data; how you used and checked AI."],["next","Next steps and ask (10 s)","What you would build next, and what help or feedback you want."]];
  el.innerHTML = bench("Three-minute pitch builder", `${P.map(x => `<label class="pc-f"><b>${esc(x[1])}</b><textarea class="dinput pbI" data-k="${x[0]}" rows="2" placeholder="${esc(x[2])}">${esc(st[x[0]] || "")}</textarea></label>`).join("")}<p class="ix-out pbO"></p><div class="controls"><button class="btn pbD" type="button">Download speaker notes</button></div>`);
  const draw = () => { const words = P.reduce((a, x) => a + (st[x[0]] || "").split(/\s+/).filter(Boolean).length, 0); $(".pbO", el).textContent = `${words} words ≈ ${Math.round(words / 130 * 60)} s of speaking (at about 130 words per minute) plus the demo.`; if (P.every(x => (st[x[0]] || "").trim().length > 8)) markAct("pitchBuilder", "done"); };
  el.querySelectorAll(".pbI").forEach(t => t.oninput = () => { st[t.dataset.k] = t.value; store.set(key, st); draw(); });
  $(".pbD", el).onclick = () => downloadText("pitch-notes.txt", P.map(x => `${x[1]}\n${st[x[0]] || ""}\n`).join("\n"));
  draw();
};
