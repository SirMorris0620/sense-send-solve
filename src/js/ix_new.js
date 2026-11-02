/* ============ NEW INTERACTIVES: actuators, calibration, data science, track chooser, git ============ */
const fmt1 = n => (Math.round(n * 10) / 10).toFixed(1);
const svgPoly = (ys, w, h, lo, hi, col, sw) => { const n = ys.length; if (!n) return ""; const pts = ys.map((y, i) => `${(i / Math.max(1, n - 1) * w).toFixed(1)},${(h - (Math.min(hi, Math.max(lo, y)) - lo) / (hi - lo || 1) * h).toFixed(1)}`).join(" "); return `<polyline points="${pts}" fill="none" stroke="${col || "#4F46E5"}" stroke-width="${sw || 1.6}" stroke-linejoin="round"/>`; };
const mkRng = seed => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

/* 2.3 PIR: warm-up, motion, and hold time */
INTERACTIVES.pirViz = function(el){
  let t = 0, warm = 20, hold = 4, motionUntil = -1, outUntil = -1, timer = null;
  el.innerHTML = bench("How a PIR sensor behaves", `<div class="controls"><button class="btn primary pvW" type="button">Walk past the sensor</button><label class="sl-in">Hold time <input type="range" class="pvH" min="1" max="10" value="4"> <b class="pvHv">4 s</b></label><button class="btn pvR" type="button">Power-cycle (restart warm-up)</button></div>
   <svg class="anim-svg" viewBox="0 0 640 160" role="img" aria-label="PIR sensor, a person, and the output pin level"><rect x="40" y="40" width="70" height="70" rx="10" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/><circle cx="75" cy="75" r="20" fill="#fff" stroke="#64748b"/><text x="75" y="130" text-anchor="middle" class="svgtxt">PIR</text>
    <g class="pvP" opacity="0"><circle cx="300" cy="62" r="12" fill="#f2c094"/><path d="M300 74 v36 M300 84 l-16 18 M300 84 l16 14 M300 110 l-14 26 M300 110 l14 26" stroke="#334155" stroke-width="5" fill="none" stroke-linecap="round"/></g>
    <rect x="470" y="50" width="130" height="50" rx="8" class="pvO" fill="#cbd5e1"/><text x="535" y="82" text-anchor="middle" class="svgtxt b pvOt">LOW</text><text x="535" y="124" text-anchor="middle" class="svgtxt">OUT pin</text></svg>
   <p class="ix-out pvS"></p><p class="explain">The output stays HIGH for the module's hold time after motion stops. Your code needs its own timer to decide when a room is empty. Real sensors need 30–60 s of warm-up (shortened here to 20 s).</p>`);
  const draw = () => { const w = t < warm, mv = t < motionUntil, out = !w && t < outUntil;
    $(".pvP", el).setAttribute("opacity", mv ? 1 : 0); $(".pvO", el).setAttribute("fill", out ? "#22c55e" : "#cbd5e1"); $(".pvOt", el).textContent = out ? "HIGH" : "LOW";
    $(".pvS", el).innerHTML = w ? `<b>Warming up</b> (${Math.ceil(warm - t)} s left): ignore the output, it can flicker.` : mv ? "Motion detected." : out ? `No motion now, but the output stays HIGH for ${Math.max(0, Math.ceil(outUntil - t))} s more (hold time).` : "Idle. Output LOW."; };
  const tick = () => { t += 0.5; draw(); };
  timer = setInterval(() => { if (!document.body.contains(el)) return clearInterval(timer); tick(); }, 500);
  $(".pvW", el).onclick = () => { motionUntil = t + 2; outUntil = t + 2 + hold; markAct("pirViz", "used"); draw(); };
  $(".pvH", el).oninput = e => { hold = +e.target.value; $(".pvHv", el).textContent = hold + " s"; };
  $(".pvR", el).onclick = () => { t = 0; motionUntil = outUntil = -1; draw(); };
  draw();
};

/* 2.4 servo: pulse width to angle */
INTERACTIVES.servoViz = function(el){
  el.innerHTML = bench("Servo: pulse width sets the angle", `<div class="controls"><label class="sl-in">Pulse width <input type="range" class="svU" min="500" max="2500" value="1500"> <b class="svUv"></b></label></div>
   <svg class="anim-svg" viewBox="0 0 400 190" role="img" aria-label="Servo arm angle"><rect x="150" y="110" width="100" height="56" rx="8" fill="#2563EB" stroke="#111" stroke-width="2"/><line class="svA" x1="200" y1="110" x2="200" y2="30" stroke="#C2410C" stroke-width="10" stroke-linecap="round"/><circle cx="200" cy="110" r="11" fill="#e5e7eb" stroke="#111" stroke-width="2"/><path d="M60 110 H340" stroke="#cbd5e1" stroke-dasharray="4 4"/><text x="50" y="106" class="svgtxt">0°</text><text x="338" y="106" class="svgtxt">180°</text></svg>
   <p class="ix-out svO"></p><p class="explain">A pulse every 20 ms: about 1 ms is 0°, 1.5 ms is 90°, and 2 ms is 180° (many servos use 544–2400 µs, as the Servo library does). Your code only writes the angle.</p>`);
  const draw = () => { const us = +$(".svU", el).value, a = Math.max(0, Math.min(180, (us - 544) / (2400 - 544) * 180)), r = a * Math.PI / 180;
    $(".svA", el).setAttribute("x2", 200 - Math.cos(r) * 82); $(".svA", el).setAttribute("y2", 110 - Math.sin(r) * 82); $(".svUv", el).textContent = us + " µs";
    $(".svO", el).innerHTML = `Angle ≈ <b>${a.toFixed(0)}°</b>. In code: <code>myServo.write(${a.toFixed(0)});</code>`; markAct("servoViz", "used"); };
  $(".svU", el).oninput = draw; draw();
};

/* 2.4 H-bridge */
INTERACTIVES.hbridgeViz = function(el){
  let raf = 0, ang = 0, spd = 0, dir = 0;
  el.innerHTML = bench("H-bridge driver: direction and speed", `<div class="controls"><label>IN1 <select class="dinput hbA"><option>0</option><option>1</option></select></label><label>IN2 <select class="dinput hbB"><option>0</option><option>1</option></select></label><label class="sl-in">Enable (PWM) <input type="range" class="hbE" min="0" max="255" value="200"> <b class="hbEv">200</b></label></div>
   <svg class="anim-svg" viewBox="0 0 300 150" role="img" aria-label="Motor"><g class="hbM" transform="translate(150 75)"><circle r="46" fill="#e5e7eb" stroke="#111" stroke-width="2"/>${[0, 120, 240].map(k => `<path d="M0 0 L-14 -42 Q0 -50 14 -42 Z" fill="#4F46E5" transform="rotate(${k})"/>`).join("")}<circle r="6" fill="#111"/></g></svg>
   <p class="ix-out hbO"></p><p class="explain">IN1 HIGH and IN2 LOW is forward; swap them for reverse; both LOW stops the motor. The enable pin takes a PWM value 0–255 for speed. A driver module also protects the board from the motor's voltage spikes.</p>`);
  const draw = () => { const a = +$(".hbA", el).value, b = +$(".hbB", el).value, e = +$(".hbE", el).value; dir = a && !b ? 1 : b && !a ? -1 : 0; spd = dir ? e / 255 : 0; $(".hbEv", el).textContent = e;
    $(".hbO", el).innerHTML = dir === 0 ? `<b>Stopped</b> (${a === b ? "both inputs equal" : ""})` : `<b>${dir > 0 ? "Forward" : "Reverse"}</b> at ${Math.round(spd * 100)} % power. Code: <code>digitalWrite(IN1, ${a}); digitalWrite(IN2, ${b}); analogWrite(EN, ${e});</code>`; markAct("hbridgeViz", "used"); };
  const loop = () => { if (!document.body.contains(el)) return; ang += dir * spd * 9; $(".hbM", el).setAttribute("transform", `translate(150 75) rotate(${ang})`); raf = requestAnimationFrame(loop); };
  el.querySelectorAll("select,input").forEach(x => x.oninput = draw); draw(); loop();
};

/* 2.1 TMP36: ADC reading to temperature */
INTERACTIVES.tmp36Lab = function(el){
  el.innerHTML = bench("TMP36: from temperature to ADC number and back", `<div class="controls"><label>Board <select class="dinput tlB">${["uno","esp8266","s3"].map(b => `<option value="${b}">${esc(BOARDS[b].short)}</option>`).join("")}</select></label><label class="sl-in">Real temperature <input type="range" class="tlT" min="-10" max="60" value="25"> <b class="tlTv"></b></label><label><input type="checkbox" class="tlW"> Use the wrong reference voltage</label></div><div class="ix-out tlO"></div>
   <p class="explain">Sensor voltage = 0.5 V + 0.01 V × °C. The ADC turns that voltage into a number between 0 and its maximum. To go back you must use the same reference voltage. A TMP36 on a bare ESP8266 ADC (0–1 V) needs a divider; the NodeMCU's A0 pin already scales 0–3.3 V.</p>`);
  const draw = () => { const b = $(".tlB", el).value, T = +$(".tlT", el).value, vref = b === "uno" ? 5 : 3.3, max = BOARDS[b].adcMax, wrong = $(".tlW", el).checked;
    const V = 0.5 + T / 100, raw = Math.round(Math.max(0, Math.min(1, V / vref)) * max), vUsed = wrong ? (vref === 5 ? 3.3 : 5) : vref, Vback = raw * vUsed / max, Tback = (Vback - 0.5) * 100;
    $(".tlTv", el).textContent = T + " °C"; $(".tlO", el).innerHTML = `<div class="kv"><span>Sensor voltage</span><b>${V.toFixed(3)} V</b><span>ADC reading (0–${max})</span><b>${raw}</b><span>Your code uses Vref</span><b>${vUsed} V ${wrong ? "(wrong!)" : ""}</b><span>Calculated temperature</span><b style="color:${Math.abs(Tback - T) > 1 ? "#B91C1C" : "#4F46E5"}">${fmt1(Tback)} °C</b></div>${V > vref ? '<p class="err">This voltage is above the ADC range: the reading is clipped.</p>' : ""}`; markAct("tmp36Lab", "used"); };
  el.querySelectorAll("select,input").forEach(x => x.oninput = draw); draw();
};

/* 2.4 power budget */
INTERACTIVES.powerBudget = function(el){
  const P = [["Board with Wi-Fi sending", 250], ["DHT22 / DHT11", 2], ["TMP36", 1], ["LDR + resistor", 1], ["MQ gas sensor (heater)", 150], ["HC-SR04", 15], ["PIR (HC-SR501)", 1], ["LED + resistor", 10], ["RGB LED (all on)", 30], ["Piezo buzzer", 30], ["Servo SG90 (moving)", 250], ["Servo SG90 (stalled)", 650], ["Small DC motor (loaded)", 300]];
  const key = "sss_pwr", st = store.get(key, {0: 1});
  el.innerHTML = bench("Power budget", `<div class="chips pbL">${P.map((p, i) => `<label class="chk"><input type="checkbox" data-i="${i}" ${st[i] ? "checked" : ""}> ${esc(p[0])} <i>~${p[1]} mA</i></label>`).join("")}</div>
   <div class="controls"><label>Supply <select class="dinput pbS"><option value="500">Computer USB port (500 mA)</option><option value="1000">5 V 1 A adapter</option><option value="2000">5 V 2 A adapter</option></select></label></div><div class="meter"><i class="pbM" style="width:0"></i></div><p class="ix-out pbO"></p>
   <p class="explain">Numbers are typical worst cases for planning, not measurements: read your parts' data sheets. Wi-Fi sending bursts can reach 250 mA or more.</p>`);
  const draw = () => { const sum = P.reduce((a, p, i) => a + (st[i] ? p[1] : 0), 0), cap = +$(".pbS", el).value, pct = Math.min(100, sum / cap * 100);
    $(".pbM", el).style.width = pct + "%"; $(".pbM", el).style.background = sum > cap ? "#B91C1C" : sum > cap * .8 ? "#B45309" : "#4F46E5";
    $(".pbO", el).innerHTML = `<b>${sum} mA</b> of ${cap} mA (${Math.round(sum / cap * 100)} %). ${sum > cap ? "<b>Too much.</b> Use a bigger supply, or power the motor/servo separately and share GND." : sum > cap * .8 ? "Close to the limit: leave a 20 % margin." : "Fits with room to spare."}`; };
  el.querySelectorAll("input[type=checkbox]").forEach(c => c.onchange = () => { st[c.dataset.i] = c.checked; store.set(key, st); draw(); markAct("powerBudget", "used"); }); $(".pbS", el).onchange = draw; draw();
};

/* 2.5 sensor picker */
INTERACTIVES.sensorPicker = function(el){
  const S = [["DHT11", ["temp", "hum"], "±2 °C, ±5 %", 2, "Cheap demo"], ["DHT22", ["temp", "hum"], "±0.5 °C, ±2–5 %", 4, "Better range and accuracy"], ["TMP36", ["temp"], "±2 °C", 1, "Fast, analog"], ["Photoresistor (LDR)", ["light"], "relative only", 1, "Needs calibration"], ["MQ-2 / MQ-135 / MQ-x", ["gas"], "relative trend", 3, "Warm-up, not a safety device"], ["HC-SR04", ["dist"], "about ±1 cm, 2–400 cm", 2, "5 V ECHO: divider on 3.3 V boards"], ["PIR HC-SR501", ["motion"], "yes/no", 2, "Warm-up and hold time"]];
  el.innerHTML = bench("Which sensor for the job?", `<div class="controls"><label>I need to measure <select class="dinput spM"><option value="temp">Temperature</option><option value="hum">Humidity</option><option value="light">Light</option><option value="gas">Air / gas change</option><option value="dist">Distance</option><option value="motion">Presence / motion</option></select></label></div><div class="ix-out spO"></div><p class="explain">Accuracy figures are typical data-sheet values; check your own part.</p>`);
  const draw = () => { const m = $(".spM", el).value, L = S.filter(s => s[1].includes(m)); $(".spO", el).innerHTML = `<table class="t"><tr><th>Sensor</th><th>Typical accuracy</th><th>Cost (1–4)</th><th>Note</th></tr>${L.map(s => `<tr><td><b>${esc(s[0])}</b></td><td>${esc(s[2])}</td><td>${"$".repeat(s[3])}</td><td>${esc(s[4])}</td></tr>`).join("")}</table>`; markAct("sensorPicker", "used"); };
  $(".spM", el).onchange = draw; draw();
};

/* 2.5 / 4.4 signal filters */
INTERACTIVES.signalLab = function(el){
  const r = mkRng(7); const raw = Array.from({length: 120}, (_, i) => 25 + 3 * Math.sin(i / 14) + (r() - .5) * 1.4 + ([30, 31, 80, 81].includes(i) ? (i % 2 ? 9 : -9) : 0));
  el.innerHTML = bench("Filter a noisy signal", `<div class="controls"><label>Filter <select class="dinput sgF"><option value="none">None (raw)</option><option value="mean">Moving average</option><option value="median">Median</option></select></label><label class="sl-in">Window <input type="range" class="sgW" min="3" max="15" step="2" value="5"> <b class="sgWv">5</b></label></div>
   <svg viewBox="0 0 480 160" class="chartsvg" role="img" aria-label="Raw and filtered signal"><rect width="480" height="160" fill="#fff"/><g class="sgR"></g><g class="sgG"></g></svg><p class="ix-out sgO"></p>
   <p class="explain">Grey is the raw signal with noise and four spikes. Green is filtered. The median removes spikes without smearing the edges; the average smooths jitter but spreads spikes.</p>`);
  const filt = (a, w, f) => a.map((_, i) => { const s = a.slice(Math.max(0, i - (w >> 1)), i + (w >> 1) + 1).sort((x, y) => x - y); return f === "median" ? s[s.length >> 1] : s.reduce((p, c) => p + c, 0) / s.length; });
  const draw = () => { const f = $(".sgF", el).value, w = +$(".sgW", el).value; $(".sgWv", el).textContent = w; $(".sgR", el).innerHTML = svgPoly(raw, 480, 160, 10, 40, "#9ca3af", 1.2);
    const out = f === "none" ? raw : filt(raw, w, f); $(".sgG", el).innerHTML = f === "none" ? "" : svgPoly(out, 480, 160, 10, 40, "#4F46E5", 2); const mx = Math.max(...out) - 28;
    $(".sgO", el).textContent = f === "none" ? "Raw: spikes reach about " + fmt1(Math.max(...raw)) + " °C." : `Largest value after ${f} filter (window ${w}): ${fmt1(Math.max(...out))} °C.`; markAct("signalLab", "used"); };
  el.querySelectorAll("select,input").forEach(x => x.oninput = draw); draw();
};

/* 2.5 two-point calibration */
INTERACTIVES.calibLab = function(el){
  el.innerHTML = bench("Two-point calibration", `<div class="ix-grid2"><div><p><b>Point 1</b></p><label class="sl">Sensor says <input class="dinput clA" type="number" value="22.0" step="0.1"></label><label class="sl">Reference says <input class="dinput clB" type="number" value="20.0" step="0.1"></label></div><div><p><b>Point 2</b></p><label class="sl">Sensor says <input class="dinput clC" type="number" value="36.0" step="0.1"></label><label class="sl">Reference says <input class="dinput clD" type="number" value="35.0" step="0.1"></label></div></div>
   <label class="sl">Test reading <input class="dinput clT" type="number" value="30.0" step="0.1"></label><div class="ix-out clO"></div><p class="explain">corrected = (raw − raw₁) × (true₂ − true₁) ÷ (raw₂ − raw₁) + true₁. Two points give a straight line that fixes both an offset and a scale error.</p>`);
  const draw = () => { const [a, b, c, d, t] = ["clA", "clB", "clC", "clD", "clT"].map(k => +$("." + k, el).value); if (c === a){ $(".clO", el).innerHTML = '<p class="err">The two sensor readings must be different.</p>'; return; }
    const g = (d - b) / (c - a), o = b - a * g, corr = t * g + o; $(".clO", el).innerHTML = `<div class="kv"><span>Gain</span><b>${g.toFixed(3)}</b><span>Offset</span><b>${o.toFixed(2)}</b><span>Corrected reading</span><b>${fmt1(corr)}</b></div><p><code>corrected = raw * ${g.toFixed(3)} + (${o.toFixed(2)});</code></p>`; markAct("calibLab", "used"); };
  el.querySelectorAll("input").forEach(x => x.oninput = draw); draw();
};

/* 3.1 track chooser */
INTERACTIVES.trackChooser = function(el){
  const Q = [["I want the quickest chart", {E: 3, D: 2, A: 1}], ["I want a phone dashboard and a control switch", {D: 3, B: 1, C: 1}], ["I want to understand every layer", {A: 3, B: 1}], ["I want to learn how companies build IoT", {C: 3, B: 1}], ["I need live data and a database without servers", {B: 3, C: 1}], ["I need months of history for data science", {A: 2, B: 2, C: 2, E: 1}], ["I do not have a credit card", {A: 2, B: 2, D: 2, E: 2}]];
  const N = {A: "Track A: Google Sheets + Apps Script + Colab", B: "Track B: Firebase + Apps Script + Colab", C: "Track C: AWS", D: "Track D: Blynk", E: "Track E: ThingSpeak"};
  el.innerHTML = bench("Which track fits?", `<p class="explain">Tick what is true for you.</p>${Q.map((q, i) => `<label class="chk"><input type="checkbox" data-i="${i}"> ${esc(q[0])}</label>`).join("")}<div class="ix-out tcO"></div><p class="explain">This is a guide, not a rule. Any track works for the capstone.</p>`);
  const draw = () => { const sc = {A: 0, B: 0, C: 0, D: 0, E: 0}; el.querySelectorAll("input:checked").forEach(c => Object.entries(Q[+c.dataset.i][1]).forEach(([k, v]) => sc[k] += v));
    const best = Object.entries(sc).sort((a, b) => b[1] - a[1]); $(".tcO", el).innerHTML = best[0][1] ? `<b>Good fit:</b> ${esc(N[best[0][0]])}${best[1][1] === best[0][1] ? `<br>Also consider: ${esc(N[best[1][0]])}` : ""}` : "Tick at least one statement."; markAct("trackChooser", "used"); };
  el.querySelectorAll("input").forEach(c => c.onchange = draw); draw();
};

/* 4.1 sampling */
INTERACTIVES.samplingLab = function(el){
  const day = h => 27 + 4 * Math.sin((h - 9) / 24 * 2 * Math.PI), truth = Array.from({length: 288}, (_, i) => day(i / 12)).reduce((a, b) => a + b, 0) / 288;
  el.innerHTML = bench("How you sample changes what you conclude", `<div class="controls"><label>Plan <select class="dinput saP"><option value="sys">Every N minutes, all day (systematic)</option><option value="conv">Only when I walk past (3 pm)</option></select></label><label class="sl-in">Interval <input type="range" class="saN" min="5" max="720" step="5" value="60"> <b class="saNv"></b></label></div>
   <svg viewBox="0 0 480 140" class="chartsvg"><rect width="480" height="140" fill="#fff"/>${svgPoly(Array.from({length: 288}, (_, i) => day(i / 12)), 480, 140, 21, 33, "#cbd5e1", 2)}<g class="saD"></g></svg><div class="ix-out saO"></div>
   <p class="explain">The grey curve is a real day. Dots are your samples. A fair plan covers the whole cycle.</p>`);
  const draw = () => { const p = $(".saP", el).value, n = +$(".saN", el).value; $(".saNv", el).textContent = n >= 60 ? (n / 60).toFixed(n % 60 ? 1 : 0) + " h" : n + " min";
    const idx = p === "sys" ? Array.from({length: Math.floor(1440 / n)}, (_, i) => Math.round(i * n / 5)).filter(i => i < 288) : [180, 181, 182]; const vals = idx.map(i => day(i / 12)), mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    $(".saD", el).innerHTML = idx.map(i => `<circle cx="${(i / 287 * 480).toFixed(1)}" cy="${(140 - (day(i / 12) - 21) / 12 * 140).toFixed(1)}" r="4" fill="#C2410C"/>`).join("");
    $(".saO", el).innerHTML = `<div class="kv"><span>True daily mean</span><b>${fmt1(truth)} °C</b><span>Your estimate (${vals.length} samples)</span><b>${fmt1(mean)} °C</b><span>Error</span><b style="color:${Math.abs(mean - truth) > .5 ? "#B91C1C" : "#4F46E5"}">${fmt1(mean - truth)} °C</b></div>`; markAct("samplingLab", "used"); };
  el.querySelectorAll("select,input").forEach(x => x.oninput = draw); draw();
};

/* 4.3 statistics lab */
INTERACTIVES.statsLab = function(el){
  let v = [27.1, 27.4, 27.2, 27.8, 28.0, 27.6, 27.3, 27.9, 28.1, 27.5, 27.7, 27.4, 28.2, 27.6, 27.8];
  el.innerHTML = bench("Mean, median, spread, and outliers", `<div class="controls"><button class="btn stA" type="button">Add a spike (+8 °C)</button><button class="btn stB" type="button">Add a dip (−8 °C)</button><button class="btn stR" type="button">Reset</button></div><svg viewBox="0 0 480 90" class="chartsvg stS"></svg><div class="ix-out stO"></div>`);
  const q = (a, p) => { const s = a.slice().sort((x, y) => x - y), i = (s.length - 1) * p, lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); };
  const draw = () => { const n = v.length, mean = v.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)), q1 = q(v, .25), q3 = q(v, .75), iqr = q3 - q1, lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr, out = v.filter(x => x < lo || x > hi), mn = Math.min(...v, 20), mx = Math.max(...v, 36);
    $(".stS", el).innerHTML = `<line x1="10" y1="60" x2="470" y2="60" stroke="#94a3b8"/>${v.map((x, i) => `<circle cx="${10 + (x - mn) / (mx - mn) * 460}" cy="${60 - (i % 5) * 9}" r="5" fill="${x < lo || x > hi ? "#B91C1C" : "#4F46E5"}"/>`).join("")}<line x1="${10 + (mean - mn) / (mx - mn) * 460}" y1="8" x2="${10 + (mean - mn) / (mx - mn) * 460}" y2="68" stroke="#C2410C" stroke-width="2"/><text x="${10 + (mean - mn) / (mx - mn) * 460 + 4}" y="14" class="svgtxt">mean</text>`;
    $(".stO", el).innerHTML = `<div class="kv"><span>n</span><b>${n}</b><span>Mean</span><b>${fmt1(mean)}</b><span>Median</span><b>${fmt1(q(v, .5))}</b><span>Std. deviation</span><b>${sd.toFixed(2)}</b><span>Q1, Q3, IQR</span><b>${fmt1(q1)}, ${fmt1(q3)}, ${iqr.toFixed(2)}</b><span>Outlier fences</span><b>${fmt1(lo)} to ${fmt1(hi)}</b><span>Outliers (red)</span><b>${out.length}</b></div><p class="explain">Watch how one spike moves the mean and the standard deviation much more than the median.</p>`; markAct("statsLab", "used"); };
  $(".stA", el).onclick = () => { v.push(35.5); draw(); }; $(".stB", el).onclick = () => { v.push(19.5); draw(); }; $(".stR", el).onclick = () => { v = v.slice(0, 15); draw(); }; draw();
};

/* 4.4 correlation lab */
INTERACTIVES.corrLab = function(el){
  el.innerHTML = bench("Correlation and a fitted line", `<div class="controls"><label class="sl-in">Relationship <input type="range" class="crS" min="-100" max="100" value="70"> <b class="crSv"></b></label><label class="sl-in">Noise <input type="range" class="crN" min="0" max="100" value="30"> <b class="crNv"></b></label></div><svg viewBox="0 0 320 200" class="chartsvg crC"></svg><div class="ix-out crO"></div>
   <p class="explain">r near 1 or −1: points follow a line. r near 0: no straight-line pattern (there may still be a curve). Even r = 0.95 does not show that one thing causes the other.</p>`);
  const draw = () => { const s = +$(".crS", el).value / 100, nz = +$(".crN", el).value / 100, r = mkRng(11), xs = Array.from({length: 40}, (_, i) => i / 39), ys = xs.map(x => .5 + s * (x - .5) + (r() - .5) * nz * 1.6), n = 40, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
    const sxy = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0), sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0), syy = ys.reduce((a, y) => a + (y - my) ** 2, 0), cr = sxy / Math.sqrt(sxx * syy), m = sxy / sxx, b = my - m * mx;
    const X = x => 10 + x * 300, Y = y => 190 - Math.min(1.2, Math.max(-.2, y)) / 1.4 * 180 - 25;
    $(".crC", el).innerHTML = `<rect width="320" height="200" fill="#fff"/>${xs.map((x, i) => `<circle cx="${X(x)}" cy="${Y(ys[i])}" r="3.5" fill="#4F46E5" opacity=".8"/>`).join("")}<line x1="${X(0)}" y1="${Y(b)}" x2="${X(1)}" y2="${Y(m + b)}" stroke="#C2410C" stroke-width="2"/>`;
    $(".crSv", el).textContent = s.toFixed(2); $(".crNv", el).textContent = nz.toFixed(2); $(".crO", el).innerHTML = `<div class="kv"><span>Correlation r</span><b>${cr.toFixed(2)}</b><span>Line slope</span><b>${m.toFixed(2)}</b></div>`; markAct("corrLab", "used"); };
  el.querySelectorAll("input").forEach(x => x.oninput = draw); draw();
};

/* 5.5 git simulator */
INTERACTIVES.gitFlow = function(el){
  let S = {wd: ["index.html", "sketch.ino"], edited: {}, staged: [], local: [], remote: [], secret: false, msgN: 0};
  el.innerHTML = bench("Git and GitHub, step by step", `<div class="ix-grid2"><div><p><b>Your computer</b></p><div class="ix-out gfW"></div><div class="controls"><button class="btn gfE" type="button">Edit index.html</button><button class="btn gfS" type="button">Add secrets.h (Wi-Fi password)</button></div></div><div><p><b>GitHub (online)</b></p><div class="ix-out gfR"></div></div></div>
   <div class="controls"><button class="btn primary gfA" type="button">git add .</button><button class="btn primary gfC" type="button">git commit -m "…"</button><button class="btn primary gfP" type="button">git push</button><label><input type="checkbox" class="gfI" checked> .gitignore lists secrets.h</label></div><div class="ix-out gfL"></div>
   <p class="explain">Working folder → <code>git add</code> (staged) → <code>git commit</code> (saved in local history) → <code>git push</code> (copied to GitHub). Only committed and pushed files are online.</p>`);
  const ign = () => $(".gfI", el).checked, vis = f => f !== "secrets.h" || !ign();
  const draw = () => { $(".gfW", el).innerHTML = S.wd.map(f => `<div>${esc(f)} ${S.edited[f] ? "<i>(changed)</i>" : ""} ${S.staged.includes(f) ? "<b>[staged]</b>" : ""} ${f === "secrets.h" && ign() ? "<i>(ignored by Git)</i>" : ""}</div>`).join("");
    $(".gfR", el).innerHTML = S.remote.length ? S.remote.map(f => `<div>${esc(f)}</div>`).join("") : "<i>(empty)</i>";
    $(".gfL", el).innerHTML = `<b>Local history:</b> ${S.local.length ? S.local.map((c, i) => `#${i + 1} ${esc(c.m)} [${c.files.join(", ")}]${c.pushed ? " ✓ pushed" : ""}`).join("<br>") : "(no commits yet)"}${S.remote.includes("secrets.h") ? '<p class="err"><b>Your Wi-Fi password is now public.</b> Rotate it (change the password); deleting the file does not remove it from history.</p>' : ""}`; };
  $(".gfE", el).onclick = () => { S.edited["index.html"] = true; draw(); };
  $(".gfS", el).onclick = () => { if (!S.wd.includes("secrets.h")) S.wd.push("secrets.h"); draw(); };
  $(".gfA", el).onclick = () => { S.staged = S.wd.filter(f => vis(f) && (S.edited[f] || !S.local.some(c => c.files.includes(f)))); markAct("gitFlow", "used"); draw(); };
  $(".gfC", el).onclick = () => { if (!S.staged.length) return toast("Nothing staged. Run git add first."); S.msgN++; S.local.push({m: ["Add dashboard", "Warn when data is old", "Fix chart title", "Add README"][S.msgN % 4], files: S.staged.slice(), pushed: false}); S.staged = []; S.edited = {}; draw(); };
  $(".gfP", el).onclick = () => { const un = S.local.filter(c => !c.pushed); if (!un.length) return toast("Nothing to push."); un.forEach(c => { c.pushed = true; c.files.forEach(f => { if (!S.remote.includes(f)) S.remote.push(f); }); }); markAct("gitFlow", "done"); draw(); };
  $(".gfI", el).onchange = draw; draw();
};
