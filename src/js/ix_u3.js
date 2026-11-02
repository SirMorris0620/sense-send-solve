/* ============ INTERACTIVES: UNIT 3 ============ */
/* step-through helper: steps = [[title, html], ...] drawn into a box, with a highlight callback */
function stepper(el, title, steps, draw, actId, intro){
  let i = -1;
  el.innerHTML = bench(title, `${intro ? `<p class="explain">${intro}</p>` : ""}<div class="stpVis"></div><div class="ix-out stpOut">Press Next.</div><div class="controls"><button class="btn primary stpN" type="button">Next</button><button class="btn stpB" type="button">Back</button><button class="btn stpR" type="button">Restart</button></div>`);
  const go = () => { const s = steps[i]; $(".stpOut", el).innerHTML = s ? `<b>${i + 1}/${steps.length}. ${s[0]}</b><p>${s[1]}</p>` : "Press Next."; draw($(".stpVis", el), i); $(".stpN", el).disabled = i >= steps.length - 1; $(".stpB", el).disabled = i < 0; if (i >= steps.length - 1) markAct(actId, "done"); };
  $(".stpN", el).onclick = () => { i = Math.min(steps.length - 1, i + 1); go(); }; $(".stpB", el).onclick = () => { i = Math.max(-1, i - 1); go(); }; $(".stpR", el).onclick = () => { i = -1; go(); }; go();
}
/* 3.1 packet journey */
INTERACTIVES.packetJourney = function(el){
  const N = [["Board","192.168.1.42",40],["Router","192.168.1.1",150],["DNS","resolver",260],["ISP","internet",370],["Google","script.google.com",480]];
  const S = [["Join Wi-Fi","The board joins the network. The router's DHCP service gives it the private address 192.168.1.42.",[0,1]],["Ask DNS","The board asks a DNS resolver: “what is the IP address of script.google.com?”",[0,2]],["DNS answers","The resolver replies with an IP address of a Google server.",[2,0]],["Open a secure connection","The board connects to that address on port 443 and sets up TLS encryption.",[0,4]],["Packets hop across the internet","The encrypted request is split into packets. Each hops: board → router → ISP → many routers → Google. Routers read only the addresses, not the encrypted contents.",[0,1,3,4]],["Apps Script runs","Google's server runs your doGet(e), adds a row to the Sheet, and prepares the reply.",[4]],["The reply comes back","The response (“OK:2”, via a redirect) travels back the same way, and the board prints it.",[4,3,1,0]]];
  stepper(el, "Follow one reading across the internet", S, (box, i) => { const s = S[i]; const on = s ? s[2] : [];
    box.innerHTML = `<svg class="flowsvg" viewBox="0 0 540 120">${N.map((n, k) => `<g><rect x="${n[2] - 40}" y="30" width="86" height="50" rx="10" fill="${on.includes(k) ? "#4F46E5" : "var(--surface)"}" stroke="var(--line)"/><text x="${n[2] + 3}" y="55" text-anchor="middle" class="svgtxt b ${on.includes(k) ? "w" : ""}">${n[0]}</text><text x="${n[2] + 3}" y="70" text-anchor="middle" class="svgtxt ${on.includes(k) ? "w" : "mute"}" font-size="9">${n[1]}</text></g>${k < 4 ? `<path d="M${n[2] + 46} 55 H${N[k + 1][2] - 40}" stroke="var(--muted)" stroke-width="2"/>` : ""}`).join("")}
     ${on.length > 1 ? `<circle r="7" fill="#E8B84A"><animateMotion dur="1.4s" repeatCount="indefinite" path="M${on.map(k => (N[k][2] + 3) + " 100").join(" L")}"/></circle>` : ""}</svg>`; }, "packetJourney");
};
/* 3.1 URL dissector */
INTERACTIVES.urlDissector = function(el){
  el.innerHTML = bench("URL dissector", `<div class="controls"><input class="dinput mono udU" style="flex:1;min-width:260px" value="https://script.google.com/macros/s/AKfycbx123/exec?key=classroom-key&device_id=team1-esp32s3&temp_c=29.4&note=Room%20204"></div><div class="udOut"></div>`);
  const draw = () => { let u; const v = $(".udU", el).value.trim(); try { u = new URL(v); } catch(e){ $(".udOut", el).innerHTML = `<p class="feedback no">That is not a complete URL. It must start with https:// or http://.</p>`; return; }
    const ps = [...u.searchParams.entries()];
    $(".udOut", el).innerHTML = `<div class="url-ex mono"><span style="color:#4F46E5">${esc(u.protocol)}//</span><span style="color:#2563EB">${esc(u.host)}</span><span style="color:#C2410C">${esc(u.pathname)}</span><span style="color:#A16207">${esc(u.search)}</span></div>
     <table class="t"><tr><th>Part</th><th>Value</th><th>Meaning</th></tr><tr><td style="color:#4F46E5">Scheme</td><td class="mono">${esc(u.protocol.replace(":", ""))}</td><td>${u.protocol === "https:" ? "Encrypted (TLS)." : "NOT encrypted: Apps Script requires https."}</td></tr><tr><td style="color:#2563EB">Host</td><td class="mono">${esc(u.host)}</td><td>The server's name, turned into an IP address by DNS.</td></tr><tr><td style="color:#C2410C">Path</td><td class="mono">${esc(u.pathname)}</td><td>${/\/exec$/.test(u.pathname) ? "An Apps Script deployment (/exec)." : /\/dev$/.test(u.pathname) ? "A /dev test URL: only editors can use it. Boards need /exec." : "Which resource on the server."}</td></tr>
     ${ps.map(([k, x]) => `<tr><td style="color:#A16207">Parameter</td><td class="mono">${esc(k)} = ${esc(x)}</td><td>${k === "key" ? "A secret: anyone who sees this URL can use it." : /^(temp_c|hum_pct|light_pct|distance_cm|gas_raw|gas_ratio|motion)$/.test(k) ? (isNaN(Number(x)) ? "Not a number: Code.gs would reject it." : "A reading. Arrives in Apps Script as text: Number() converts it.") : k === "device_id" ? (/\s/.test(x) ? "Contains a space: avoid spaces in IDs." : "Which device sent this.") : "Decoded value shown."}</td></tr>`).join("")}</table>`;
    markAct("urlDissector", "used"); };
  $(".udU", el).oninput = draw; draw();
};
/* 3.1 status codes */
INTERACTIVES.statusGame = function(el){
  choiceSorter(el, "What does the status code mean?", [["200 OK", 0, "The request worked. Apps Script's final reply is 200."],["302 Found / Moved Temporarily", 1, "Go to another address. Apps Script always redirects to script.googleusercontent.com."],["404 Not Found", 2, "Wrong URL: check the deployment ID and that it ends in /exec."],["401 Unauthorized / 403 Forbidden", 2, "Not allowed: the web app's access is not “Anyone”, or you are not signed in."],["500 Internal Server Error", 3, "The server failed. In Apps Script: an error in your code; check Executions."],["-1 (on the ESP boards)", 4, "Not an HTTP code: the board could not connect at all (Wi-Fi or DNS problem)."]], ["Success","Redirect","Client error","Server error","No connection"], "statusGame", "Match each code to its meaning.");
};
/* 3.1 JSON builder */
INTERACTIVES.jsonBuilder = function(el){
  el.innerHTML = bench("JSON builder", `<div class="ix-grid2"><div><div class="controls"><label>Device <input class="dinput jbD" value="team1-esp32s3"></label></div><div class="controls"><label>Sensor <select class="dinput jbS"><option>temp_c</option><option>hum_pct</option><option>gas_raw</option><option>distance_cm</option></select></label><label>Value <input class="dinput jbV" value="29.4" style="width:80px"></label><button class="btn small jbAdd" type="button">Add reading</button><button class="btn small jbClr" type="button">Clear</button></div>
    <p class="explain">Or edit the JSON directly, then check it.</p><textarea class="ed jbT" style="min-height:160px" spellcheck="false"></textarea><div class="controls"><button class="btn primary jbChk" type="button">Check JSON</button></div></div><div class="ix-out jbOut"></div></div>`);
  let items = [{timestamp:"2026-10-08T04:30:02Z", device_id:"team1-esp32s3", sensor:"temp_c", value:29.4}];
  const write = () => { $(".jbT", el).value = JSON.stringify(items, null, 2); check(); };
  const check = () => { try { const j = JSON.parse($(".jbT", el).value); const arr = Array.isArray(j) ? j : [j];
      $(".jbOut", el).innerHTML = `<p class="feedback ok">✓ Valid JSON: ${Array.isArray(j) ? `an array of ${j.length} object${j.length === 1 ? "" : "s"}` : "one object"}.</p>${arr.slice(0, 6).map(o => `<div class="kv">${Object.keys(o || {}).map(k => `<span>${esc(k)}</span><b>${esc(JSON.stringify(o[k]))} <span class="explain">${typeof o[k]}</span></b>`).join("")}</div><hr>`).join("")}${arr.some(o => o && typeof o.value === "string") ? `<p class="explain">Note: a value in quotes is text, not a number. Charts need numbers.</p>` : ""}`; markAct("jsonBuilder", "used"); }
    catch(e){ $(".jbOut", el).innerHTML = `<p class="feedback no">✗ Not valid JSON: ${esc(e.message)}</p><p class="explain">Common causes: names without double quotes, a trailing comma, or single quotes.</p>`; } };
  $(".jbAdd", el).onclick = () => { const v = $(".jbV", el).value; items.push({timestamp:new Date().toISOString().slice(0, 19) + "Z", device_id:$(".jbD", el).value, sensor:$(".jbS", el).value, value:isNaN(Number(v)) ? v : Number(v)}); write(); };
  $(".jbClr", el).onclick = () => { items = []; write(); }; $(".jbChk", el).onclick = check; $(".jbT", el).oninput = () => { clearTimeout(el.t); el.t = setTimeout(check, 500); };
  write();
};
/* 3.2 Wi-Fi doctor */
INTERACTIVES.wifiDoctor = function(el){
  const T = {start:["What does the Serial Monitor show?", [["Nothing at all, or strange symbols","baud"],["Dots, then “failed”","q2"],["It connects, but requests fail","req"]]],
   baud:["Fix the Serial Monitor first", "Set the Serial Monitor to <b>115200 baud</b> (bottom-right) and press the board's reset button. Strange symbols always mean a baud-rate mismatch."],
   q2:["Does your phone see the network name exactly as written in your code?", [["Yes, exactly","q3"],["No, or only a name with “5G”","band"],["Not sure about capital letters","case"]]],
   band:["Use a 2.4 GHz network", "These boards cannot use 5 GHz. Use the 2.4 GHz network (or a phone hotspot with “Maximize Compatibility” on)."],
   case:["Names are case-sensitive", "“IoT-Lab” and “iot-lab” are different networks. Copy the name exactly, including spaces and dashes."],
   q3:["Do phones need to open a login web page to use this Wi-Fi?", [["Yes","portal"],["No","q4"]]],
   portal:["Captive portal", "Boards cannot log in through a web page. Ask IT for a device network or MAC registration, or use a phone hotspot."],
   q4:["Does the network ask for a username AND a password (e.g. university Wi-Fi)?", [["Yes","ent"],["No, just a password","q5"]]],
   ent:["WPA2-Enterprise", "Not supported by this course's code. Use a WPA2-Personal network or a hotspot."],
   q5:["Is the password typed exactly, and is the board within a few meters of the router?", [["Yes to both","power"],["Not sure","pass"]]],
   pass:["Check the password and distance", "Retype the password (no extra spaces), move closer, and try again. Print WiFi.status() to see the exact state."],
   power:["Check power and try a hotspot", "Weak USB power can make Wi-Fi fail during transmission: try another cable or a charger. If a phone hotspot works, the problem is the school network's settings."],
   req:["Requests fail after connecting", "Paste the full URL into a browser. If it shows OK, compare it character by character with the board's URL (Serial.println(url)). Check that it ends in /exec, uses the new deployment, and has the right key."]};
  let path = ["start"];
  el.innerHTML = bench("The Wi-Fi doctor", `<div class="wdBox"></div>`);
  const draw = () => { const k = path[path.length - 1], n = T[k];
    $(".wdBox", el).innerHTML = Array.isArray(n[1]) ? `<p><b>${n[0]}</b></p><div class="choicecards">${n[1].map(o => `<button type="button" data-k="${o[1]}">${esc(o[0])}</button>`).join("")}</div>${path.length > 1 ? `<button class="btn small wdBack" type="button">Back</button>` : ""}` : `<div class="callout ex"><b>Likely cause: ${n[0]}</b><p>${n[1]}</p></div><button class="btn small wdBack" type="button">Back</button> <button class="btn small wdRe" type="button">Start again</button>`;
    el.querySelectorAll(".choicecards button").forEach(b => b.onclick = () => { path.push(b.dataset.k); draw(); });
    const bb = $(".wdBack", el); if (bb) bb.onclick = () => { path.pop(); draw(); }; const r = $(".wdRe", el); if (r) r.onclick = () => { path = ["start"]; draw(); };
    if (!Array.isArray(n[1])) markAct("wifiDoctor", "used"); };
  draw();
};
/* 3.2 redirect visualizer */
INTERACTIVES.redirectViz = function(el){
  const S = [["Request","The board sends GET …/exec?key=…&temp_c=29.4 to script.google.com."],["Your script runs","Google runs doGet(e). The row is added to the Sheet NOW, before any reply."],["302 redirect","Google answers: “302: your reply is waiting at script.googleusercontent.com/…”."],["Follow the redirect","ESP boards: http.setFollowRedirects(...) follows automatically. Uno R4: the code reads the Location header and requests it."],["200 OK + reply text","The second server answers with the text your script returned, e.g. OK:1."]];
  stepper(el, "Why Apps Script answers twice", S, (box, i) => { const hl = k => i === k ? "#4F46E5" : "var(--surface)", tc = k => i === k ? "w" : "";
    box.innerHTML = `<svg class="flowsvg" viewBox="0 0 560 150"><rect x="10" y="50" width="100" height="50" rx="10" fill="${hl(0) === "#4F46E5" || i === 3 ? "#4F46E5" : "var(--surface)"}" stroke="var(--line)"/><text x="60" y="80" text-anchor="middle" class="svgtxt b ${i === 0 || i === 3 ? "w" : ""}">Board</text>
     <rect x="220" y="10" width="140" height="50" rx="10" fill="${i === 1 || i === 2 ? "#C2410C" : "var(--surface)"}" stroke="var(--line)"/><text x="290" y="40" text-anchor="middle" class="svgtxt b ${i === 1 || i === 2 ? "w" : ""}">script.google.com</text>
     <rect x="220" y="90" width="200" height="50" rx="10" fill="${i === 4 ? "#4F46E5" : "var(--surface)"}" stroke="var(--line)"/><text x="320" y="120" text-anchor="middle" class="svgtxt b ${i === 4 ? "w" : ""}">script.googleusercontent.com</text>
     <rect x="440" y="10" width="100" height="50" rx="10" fill="${i === 1 ? "#4F46E5" : "var(--surface)"}" stroke="var(--line)"/><text x="490" y="40" text-anchor="middle" class="svgtxt b ${i === 1 ? "w" : ""}">Sheet +1 row</text>
     ${i >= 0 ? `<path d="M110 65 L220 35" stroke="#E8B84A" stroke-width="${i === 0 ? 4 : 2}"/>` : ""}${i >= 1 ? `<path d="M360 35 H440" stroke="#E8B84A" stroke-width="${i === 1 ? 4 : 2}"/>` : ""}${i >= 2 ? `<path d="M220 45 L110 75" stroke="#C2410C" stroke-width="${i === 2 ? 4 : 2}" stroke-dasharray="5 4"/>` : ""}${i >= 3 ? `<path d="M110 85 L220 115" stroke="#E8B84A" stroke-width="${i === 3 ? 4 : 2}"/>` : ""}${i >= 4 ? `<path d="M220 125 L110 95" stroke="#4F46E5" stroke-width="4"/>` : ""}</svg>`; }, "redirectViz");
};
/* 3.4 deployment flow */
INTERACTIVES.deployFlow = function(el){
  const S = [["Deploy → New deployment","Click Deploy (top-right) → New deployment. Click the gear next to “Select type” and choose <b>Web app</b>."],["Execute as: Me","The script runs with YOUR permission to write to YOUR Sheet. (“User accessing” would ask every visitor to sign in and authorize, which a board cannot do.)"],["Who has access: Anyone","Your board cannot sign in to Google, so the web app must accept requests from anyone with the URL. That is exactly why Code.gs checks an API key."],["Authorize","The first deployment asks you to authorize. If you see “Google hasn't verified this app”, choose Advanced → Go to (your project). It is your own script."],["Copy the /exec URL","Copy the Web app URL ending in <b>/exec</b>. Test it in a browser with ?key=...&device_id=test&temp_c=25."],["Change code? Deploy a NEW version","Saving is not enough. Deploy → <b>Manage deployments</b> → pencil icon → Version: <b>New version</b> → Deploy. The URL stays the same, so your boards keep working."],["Trap: New deployment = new URL","If you click New deployment again, you get a DIFFERENT URL, and every board still uses the old one (running old code). Use Manage deployments to update."]];
  stepper(el, "Deploying an Apps Script web app", S, (box, i) => { box.innerHTML = `<div class="kbdrow">${S.map((s, k) => `<span class="tagpill ${k === i ? (k === 6 ? "warn" : "ok") : ""}">${k + 1}. ${s[0].split(":")[0].split("→")[0].trim()}</span>`).join("")}</div>`; }, "deployFlow");
};
/* 3.5 schema designer */
INTERACTIVES.schemaDesigner = function(el){
  const F = [["timestamp","Readings",true],["device_id","Readings",true],["sensor","Readings",true],["value","Readings",true],["room_name","Devices",false],["team_members","Devices",false],["board_type","Devices",false],["student_name","Cards",false],["card_uid","Readings",true],["uid","Cards",false]];
  const ans = {};
  el.innerHTML = bench("Which table should each field live in?", `<p class="explain">You are designing an attendance-and-environment logger. Put each field where it is stored ONCE. (card_uid is the UID a board sends with a tap; uid is the primary key of the Cards table.)</p>
   ${F.map((f, i) => `<div class="ts-row" data-i="${i}"><span class="mono">${f[0]}</span><div class="controls">${["Readings","Devices","Cards"].map(t => `<button class="btn small sdB" type="button" data-t="${t}">${t}</button>`).join("")}</div><div class="explain sdE" hidden></div></div>`).join("")}<p class="feedback sdN"></p>`);
  const why = {room_name:"A room belongs to a device. Store it once in Devices; Readings only needs device_id.", team_members:"Team details describe the device's owners, not each reading.", board_type:"The board type never changes per reading: store it in Devices.", student_name:"Names are personal data: keep them only in the protected Cards table (UID → name), never in Readings.", card_uid:"The board sends the UID with each tap; it is part of the reading.", uid:"The primary key of Cards: one row per card."};
  el.querySelectorAll(".ts-row").forEach(row => row.querySelectorAll(".sdB").forEach(b => b.onclick = () => { const i = +row.dataset.i, f = F[i], ok = b.dataset.t === f[1]; ans[i] = ok; row.querySelectorAll(".sdB").forEach(x => x.classList.toggle("primary", x === b)); const e = row.querySelector(".sdE"); e.hidden = false; e.innerHTML = (ok ? "✓ " : `✗ Better in <b>${f[1]}</b>. `) + (why[f[0]] || "Each reading needs it."); const n = Object.keys(ans).length, r = Object.values(ans).filter(Boolean).length; $(".sdN", el).textContent = `${r} of ${n} placed well.`; if (n === F.length) markAct("schemaDesigner", `${r}/${F.length}`); }));
};
/* 3.5 long vs wide */
INTERACTIVES.longWide = function(el){
  const W = [["2026-10-08 13:00","team1-esp32s3",31.6,64.5,""],["2026-10-08 13:00","team2-esp8266","","",310]];
  let mode = "long";
  el.innerHTML = bench("Long or wide?", `<div class="seg seg-sm"><button type="button" data-m="long" aria-selected="true">Long (this course)</button><button type="button" data-m="wide" aria-selected="false">Wide</button></div><div class="lwT"></div><div class="ix-out lwN"></div><div class="controls"><button class="btn small lwAdd" type="button">A new board arrives with an ultrasonic + PIR</button></div>`);
  let extra = false;
  const draw = () => { if (mode === "long"){ const rows = [["2026-10-08 13:00","team1-esp32s3","temp_c",31.6],["2026-10-08 13:00","team1-esp32s3","hum_pct",64.5],["2026-10-08 13:00","team2-esp8266","gas_raw",310]].concat(extra ? [["2026-10-08 13:00","team3-unor4","distance_cm",42],["2026-10-08 13:00","team3-unor4","motion",1]] : []);
      $(".lwT", el).innerHTML = sheet({headers:["timestamp","device_id","sensor","value"], rows}); $(".lwN", el).innerHTML = extra ? "The ultrasonic + PIR board just adds rows. <b>No change to the table, Code.gs, or existing data.</b>" : "4 fixed columns. Every reading is one row; empty cells never appear."; }
    else { const h = ["timestamp","device_id","temp_c","hum_pct","gas_raw"].concat(extra ? ["distance_cm","motion"] : []), rows = W.map(r => r.concat(extra ? ["",""] : [])).concat(extra ? [["2026-10-08 13:00","team3-unor4","","","",42,1]] : []);
      $(".lwT", el).innerHTML = sheet({headers:h, rows}); $(".lwN", el).innerHTML = extra ? "Two NEW columns for everyone, mostly empty cells, and Code.gs must change to write them. Wide tables suit one fixed set of sensors." : "Easy to read and chart for ONE kind of device, but many empty cells when devices have different sensors."; }
    markAct("longWide", "used"); };
  el.querySelectorAll(".seg button").forEach(b => b.onclick = () => { mode = b.dataset.m; el.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-selected", x === b)); draw(); });
  $(".lwAdd", el).onclick = () => { extra = !extra; $(".lwAdd", el).textContent = extra ? "Remove the ultrasonic + PIR board" : "A new board arrives with an ultrasonic + PIR"; draw(); }; draw();
};
/* 3.6 KPI builder */
INTERACTIVES.kpiBuilder = function(el){
  const K = [["now","Current temperature (°C) with status",1],["avg","Today's average temperature vs the comfort limit (30 °C)",1],["peak","Highest temperature today and when",1],["upd","Last updated / device online",1],["all","Every reading of the day in a table",0],["pm1","Temperature, humidity, light and gas for all 3 rooms side by side",0],["ip","The board's IP address",0],["hours","Hours above 30 °C today",1]];
  let sel = new Set(["now","all","ip"]);
  el.innerHTML = bench("KPI builder: “Should we keep the windows closed in Room 204 today?”", `<p class="explain">Choose 3 to 5 KPIs that answer the question.</p><div class="choicecards kbO">${K.map(k => `<button type="button" data-k="${k[0]}">${esc(k[1])}</button>`).join("")}</div><div class="kp-cards kbD"></div><div class="ix-out kbN"></div>`);
  const draw = () => { el.querySelectorAll(".kbO button").forEach(b => b.classList.toggle("sel", sel.has(b.dataset.k))); const ch = K.filter(k => sel.has(k[0])), bad = ch.filter(k => !k[2]);
    $(".kbD", el).innerHTML = ch.map((k, i) => `<div class="kp-card ${i === 0 ? "first" : ""}"><span>${esc(k[1])}</span><b>${({now:"31.6 °C • above limit", avg:"29.4 / 30", peak:"33.8 at 13:10", upd:"13:05 • online", all:"288 rows…", pm1:"(9 numbers)", ip:"192.168.1.42", hours:"2.5 h"})[k[0]]}</b></div>`).join("");
    $(".kbN", el).innerHTML = ch.length < 3 ? "Choose at least 3." : ch.length > 5 ? `${ch.length} KPIs: too many to read at a glance.` : bad.length ? `Remove: ${bad.map(k => `<b>${esc(k[1])}</b>`).join(", ")}. ${bad.some(k => k[0] === "ip") ? "The IP address helps you debug, not decide." : ""} ${bad.some(k => k[0] === "all") ? "A full table is not “at a glance”." : ""} ${bad.some(k => k[0] === "pm1") ? "Too much detail for this decision." : ""}` : "A focused set: each KPI helps decide about the windows. ✓";
    if (ch.length >= 3 && ch.length <= 5 && !bad.length) markAct("kpiBuilder", "done"); };
  el.querySelectorAll(".kbO button").forEach(b => b.onclick = () => { const k = b.dataset.k; sel.has(k) ? sel.delete(k) : sel.add(k); draw(); }); draw();
};
/* 3.6 chart chooser */
INTERACTIVES.chartChooser = function(el){
  choiceSorter(el, "Which chart fits the question?", [["How did the classroom temperature change from 7 AM to 6 PM?", 0, "Change over time → line chart."],["Which of the 5 rooms had the highest average temperature this week?", 1, "Compare categories → sorted bar chart."],["How did the humidity compare with the temperature across the day? (two measures)", 2, "Two measures that may be related → scatter plot (or two lines on one time axis)."],["Which readings crossed the alarm limit today, and when exactly?", 3, "Individual events → table, newest first."],["What is the distance to the water in the tank right now?", 4, "A single current value → a big number with unit and status."]], ["Line","Bar","Scatter","Table","Big number"], "chartChooser", "Choose the best chart for each question.");
};
/* 3.6 dashboard critique */
INTERACTIVES.dashCritique = function(el){
  const P = [["pie","A pie chart of temperatures over time","Pies show parts of a whole, not change over time: use a line chart."],["axis","A y-axis starting at 30.5 °C","A cropped axis makes a 0.4 °C wiggle look dramatic: start from a sensible baseline and label it."],["unit","Numbers without units","Add °C, %, µg/m³."],["fresh","No time or freshness indicator","Add “Updated 13:05” and warn when data is stale."],["color","Red and green as the only status signal","Add words (“Too hot”) for color-blind readers."],["many","12 KPIs crammed in","Keep 3–5 that serve the decision."],["three","3D effect on the bars","Decoration distorts length judgements; use flat bars."]];
  const found = new Set();
  el.innerHTML = bench("Critique this dashboard", `<div class="dc-mock"><div class="dc-row">${Array.from({length:12}, (_, i) => `<span class="dc-k ${i === 3 ? "dc-hot" : ""}" ${i === 3 ? 'data-k="many"' : ""}>${[31.6, 64, 12, 0.9, 42, 7, 3, 88, 1, 0, 5, 2][i]}</span>`).join("")}<span class="dc-hot dc-tag" data-k="unit">no units?</span></div>
   <div class="dc-row"><svg viewBox="0 0 120 80" width="120" class="dc-hot" data-k="pie"><circle cx="40" cy="40" r="32" fill="#2563EB"/><path d="M40 40 L40 8 A32 32 0 0 1 70 50 Z" fill="#E8B84A"/><path d="M40 40 L70 50 A32 32 0 0 1 20 66 Z" fill="#C2410C"/><text x="85" y="44" font-size="9" fill="currentColor">7AM–6PM</text></svg>
    <svg viewBox="0 0 150 90" width="150" class="dc-hot" data-k="axis"><text x="2" y="12" font-size="8" fill="currentColor">31.0</text><text x="2" y="84" font-size="8" fill="currentColor">30.5</text><path d="M20 80 L40 20 L60 70 L80 10 L100 60 L120 15" stroke="#4F46E5" stroke-width="2" fill="none"/></svg>
    <svg viewBox="0 0 120 90" width="120" class="dc-hot" data-k="three"><g>${[30,55,40].map((h, i) => `<path d="M${15 + i * 32} 85 v-${h} l8 -6 h16 v${h} l-8 6 z" fill="#A5B4FC" stroke="#3730A3"/><rect x="${15 + i * 32}" y="${85 - h}" width="16" height="${h}" fill="#4F46E5"/>`).join("")}</g></svg>
    <span class="dc-hot" data-k="color" style="display:inline-flex;gap:6px"><i style="width:22px;height:22px;border-radius:50%;background:#D62828;display:inline-block"></i><i style="width:22px;height:22px;border-radius:50%;background:#16A34A;display:inline-block"></i></span>
    <span class="dc-hot dc-tag" data-k="fresh">(when?)</span></div></div>
   <p class="explain">Tap the problems. <b class="dcN">0</b> of ${P.length} found.</p><ul class="reslist dcL"></ul>`);
  el.querySelectorAll(".dc-hot").forEach(h => h.onclick = () => { const k = h.dataset.k; if (found.has(k)) return; found.add(k); h.classList.add("found"); const p = P.find(x => x[0] === k);
    $(".dcL", el).insertAdjacentHTML("beforeend", `<li class="ok">✓ <b>${p[1]}.</b> <span class="explain">${p[2]}</span></li>`); $(".dcN", el).textContent = found.size; if (found.size >= 6) markAct("dashCritique", "done"); if (found.size === P.length) confetti(); });
};
