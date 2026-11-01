/* ============ HOW-IT-WORKS ANIMATIONS FOR THE SEVEN SENSORS ============
   Simplified, labeled models for learning. Numbers that are illustrative say so on screen. */
function animLoop(el, fn, fps){ let last = 0, raf; const step = now => { if (!alive(el)) return cancelAnimationFrame(raf); if (now - last >= 1000 / (fps || 30)){ fn(now, last ? now - last : 16); last = now; } raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf); }
const rnd = (a, b) => a + Math.random() * (b - a);

/* ---- DHT: inside the sensor ---- */
INTERACTIVES.dhtInside = function(el){
  let RH = 65, T = 29, type = "dht22", mol = [], packets = [], t0 = performance.now(), lastPkt = 0;
  el.innerHTML = bench("Inside a DHT sensor", `<div class="controls"><div class="seg seg-sm diT"><button type="button" data-t="dht22" aria-selected="true">DHT22</button><button type="button" data-t="dht11" aria-selected="false">DHT11</button></div>
    <label class="sl-in">Humidity <input type="range" class="diH" min="10" max="95" value="65"><b class="diHv"></b></label><label class="sl-in">Temperature <input type="range" class="diC" min="0" max="45" value="29"><b class="diCv"></b></label></div>
   <svg class="anim-svg" viewBox="0 0 760 300" role="img" aria-label="Cutaway of a DHT sensor">
    <rect x="20" y="20" width="300" height="250" rx="16" class="dh-case"/><g class="dh-grille">${Array.from({length:9}, (_, i) => `<rect x="40" y="${36 + i * 25}" width="260" height="10" rx="5"/>`).join("")}</g>
    <rect x="44" y="60" width="150" height="110" rx="8" fill="#e9f1ff" stroke="#6d8fd6"/><text x="119" y="54" text-anchor="middle" class="an-l">humidity element</text>
    <g class="diComb"></g><rect x="60" y="100" width="118" height="30" rx="4" class="diPoly" fill="#b9d3ff" opacity=".85"/>
    <circle class="diTh" cx="250" cy="110" r="16" stroke="#333" stroke-width="2"/><path d="M250 126 V160 M244 160 h12" stroke="#777" stroke-width="2"/><text x="250" y="80" text-anchor="middle" class="an-l">thermistor</text>
    <rect x="200" y="196" width="96" height="48" rx="6" fill="#1f2937"/><text x="248" y="224" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">chip</text><circle class="diChip" cx="284" cy="206" r="4" fill="#22c55e"/>
    <path d="M178 115 H200 V210 M250 160 V196" stroke="#9aa" stroke-width="2" fill="none"/>
    <g class="diMol"></g>
    <path d="M296 220 H560" stroke="#E8B84A" stroke-width="4"/><text x="430" y="210" text-anchor="middle" class="an-l">DATA wire (one wire, both directions)</text><g class="diPkt"></g>
    <rect x="560" y="170" width="170" height="100" rx="12" fill="#17483B"/><text x="645" y="196" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">your board</text><text class="diRead" x="645" y="226" text-anchor="middle" fill="#8FD1B8" font-size="14" font-family="JetBrains Mono,monospace"></text><text class="diRead2" x="645" y="248" text-anchor="middle" fill="#8FD1B8" font-size="14" font-family="JetBrains Mono,monospace"></text>
    <g transform="translate(360 30)"><text class="an-l b" x="0" y="0">What the chip measures</text><text class="diM1 an-v" x="0" y="26"></text><text class="diM2 an-v" x="0" y="50"></text><text class="diM3 an-l" x="0" y="74"></text></g>
   </svg><p class="explain diE"></p>`);
  const comb = () => { let d = ""; for (let i = 0; i < 6; i++){ d += `M${66 + i * 20} 92 v40 M${76 + i * 20} 138 v-40 `; } return `<path d="M62 90 H180 M62 140 H180 ${d}" stroke="#c48a2c" stroke-width="2.4" fill="none"/>`; };
  $(".diComb", el).innerHTML = comb();
  const ntc = c => 10000 * Math.exp(3950 * (1 / (c + 273.15) - 1 / 298.15));
  const upd = () => { RH = +$(".diH", el).value; T = +$(".diC", el).value; $(".diHv", el).textContent = RH + " %"; $(".diCv", el).textContent = T + " °C";
    const R = ntc(T), cap = (type === "dht22" ? 0.8 + RH / 100 * 0.6 : 0), hr = type === "dht11" ? Math.round(2e6 * Math.exp(-RH / 14)) : 0;
    $(".diM1", el).textContent = type === "dht22" ? `Humidity → capacitance ≈ ${cap.toFixed(2)} (relative)` : `Humidity → resistance ≈ ${hr >= 1e6 ? (hr / 1e6).toFixed(1) + " MΩ" : (hr / 1000).toFixed(0) + " kΩ"}`;
    $(".diM2", el).textContent = `Temperature → thermistor ${R >= 1000 ? (R / 1000).toFixed(1) + " kΩ" : R.toFixed(0) + " Ω"}`;
    $(".diM3", el).textContent = "Illustrative values (a 10 kΩ NTC thermistor)";
    const hot = Math.min(1, Math.max(0, (T - 10) / 35)); $(".diTh", el).setAttribute("fill", `rgb(${Math.round(120 + 135 * hot)},${Math.round(150 - 90 * hot)},${Math.round(230 - 200 * hot)})`);
    $(".diPoly", el).setAttribute("fill", type === "dht22" ? `rgba(80,140,255,${.25 + RH / 160})` : `rgba(140,110,80,${.3 + RH / 200})`);
    $(".diE", el).innerHTML = type === "dht22" ? "<b>DHT22 (capacitive):</b> water molecules from the air soak into a thin polymer layer between two comb-shaped electrodes. More water raises the layer's capacitance. The chip measures it, measures the thermistor, corrects for temperature, and sends 40 bits on the DATA wire." : "<b>DHT11 (resistive):</b> its humidity element changes <b>resistance</b> instead: more water lowers the resistance. It is cheaper and less accurate (±5 % RH, ±2 °C) than the DHT22.";
    markAct("dhtInside", "used"); };
  el.querySelectorAll(".diT button").forEach(b => b.onclick = () => { type = b.dataset.t; el.querySelectorAll(".diT button").forEach(x => x.setAttribute("aria-selected", x === b)); upd(); });
  el.querySelectorAll("input").forEach(x => x.oninput = upd); upd();
  animLoop(el, now => {
    const want = Math.round(6 + RH / 4); while (mol.length < want) mol.push({x:rnd(48, 190), y:rnd(64, 96), vx:rnd(-.6, .6), vy:rnd(-.4, .6), in:false}); if (mol.length > want) mol.length = want;
    const inside = Math.round(RH / 10);
    mol.forEach((m, i) => { if (i < inside){ m.in = true; m.y += (115 - m.y) * .05; m.x += Math.sin(now / 400 + i) * .2; } else { m.in = false; m.x += m.vx; m.y += m.vy; if (m.x < 48 || m.x > 190) m.vx *= -1; if (m.y < 64 || m.y > 160) m.vy *= -1; } });
    $(".diMol", el).innerHTML = mol.map(m => `<g transform="translate(${m.x.toFixed(1)} ${m.y.toFixed(1)})"><circle r="3.6" fill="${m.in ? "#2563EB" : "#60a5fa"}"/><circle cx="-3" cy="-2.5" r="1.6" fill="#fff"/><circle cx="3" cy="-2.5" r="1.6" fill="#fff"/></g>`).join("");
    if (now - lastPkt > 2000){ lastPkt = now; packets.push({x:296, t:now}); $(".diChip", el).setAttribute("fill", "#facc15"); setTimeout(() => { const c = el.querySelector(".diChip"); if (c) c.setAttribute("fill", "#22c55e"); }, 300); }
    packets.forEach(p => p.x += 6); packets = packets.filter(p => { if (p.x >= 560){ $(".diRead", el).textContent = `${T.toFixed(1)} °C`; $(".diRead2", el).textContent = `${RH.toFixed(1)} % RH`; return false; } return true; });
    $(".diPkt", el).innerHTML = packets.map(p => `<g transform="translate(${p.x} 220)"><rect x="-22" y="-9" width="44" height="18" rx="4" fill="#E8B84A"/><text x="0" y="4" text-anchor="middle" font-size="9" font-family="JetBrains Mono,monospace">40 bits</text></g>`).join("");
  }, 30);
};

/* ---- HC-SR04: a real ping, slowed down ---- */
INTERACTIVES.sonarViz = function(el){
  let d = 80, T = 30, mat = "hard", pinging = false, t0 = 0, auto = false, lastAuto = 0, res = null;
  const v = () => 331.3 + 0.606 * T;
  el.innerHTML = bench("How the HC-SR04 measures distance", `<div class="controls"><label class="sl-in">Object distance <input type="range" class="svD" min="2" max="450" value="80"><b class="svDv"></b></label><label class="sl-in">Air temperature <input type="range" class="svT" min="0" max="40" value="30"><b class="svTv"></b></label>
    <label>Surface <select class="dinput svM"><option value="hard">Hard, flat wall</option><option value="soft">Soft cushion (absorbs sound)</option><option value="angled">Wall at a steep angle</option></select></label>
    <button class="btn primary svGo" type="button">Ping</button><label class="chk"><input type="checkbox" class="svA"><span>Auto-ping</span></label></div>
   <svg class="anim-svg" viewBox="0 0 800 330" role="img" aria-label="HC-SR04 sending a 40 kHz chirp to an object and back">
    <defs><radialGradient id="svMesh"><stop offset="0" stop-color="#e5e7eb"/><stop offset=".7" stop-color="#9ca3af"/><stop offset="1" stop-color="#6b7280"/></radialGradient><pattern id="svNet" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0 L5 5 M5 0 L0 5" stroke="#6b7280" stroke-width=".6"/></pattern></defs>
    <rect x="10" y="40" width="150" height="150" rx="8" fill="#1e5aa8"/><text x="85" y="58" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">HC-SR04</text>
    <g class="svTx"><circle cx="85" cy="92" r="27" fill="url(#svMesh)" stroke="#475569"/><circle cx="85" cy="92" r="20" fill="url(#svNet)"/><text x="85" y="96" text-anchor="middle" font-size="12" font-weight="700" fill="#111">T</text></g>
    <g class="svRx"><circle cx="85" cy="150" r="27" fill="url(#svMesh)" stroke="#475569"/><circle cx="85" cy="150" r="20" fill="url(#svNet)"/><text x="85" y="154" text-anchor="middle" font-size="12" font-weight="700" fill="#111">R</text></g>
    <rect x="128" y="113" width="18" height="16" rx="3" fill="#cbd5e1"/><text x="137" y="140" text-anchor="middle" font-size="7" fill="#fff">crystal</text>
    ${["VCC","Trig","Echo","Gnd"].map((p, k) => `<rect x="${32 + k * 30}" y="190" width="6" height="22" fill="#d4d4d4"/><text x="${35 + k * 30}" y="224" text-anchor="middle" class="an-l">${p}</text>`).join("")}
    
    <g class="svWaves"></g><g class="svObj"></g><line x1="170" y1="250" x2="770" y2="250" class="an-axis"/><g class="svRuler"></g>
    <g transform="translate(0 266)"><text x="10" y="12" class="an-l b">TRIG</text><path class="svTrig" d="" stroke="#E8B84A" stroke-width="2.4" fill="none"/><text x="10" y="40" class="an-l b">ECHO</text><path class="svEcho" d="" stroke="#1F8A70" stroke-width="2.4" fill="none"/><text class="svEt an-l" x="0" y="58"></text></g>
   </svg>
   <div class="ix-grid2"><div class="ix-out svOut"></div><div class="ix-out svErr"></div></div><p class="explain">Time on screen is slowed down about 10,000 times. A real ping at 1 m takes about 6 ms. <b>T</b> is the transmitter (it sends); <b>R</b> is the receiver (it listens).</p>`);
  const X0 = 170, X1 = 770, xOf = cm => X0 + Math.min(cm, 450) / 450 * (X1 - X0 - 40);
  const echoUs = () => 2 * d / 100 / v() * 1e6;
  const hasEcho = () => mat === "hard" && d <= 400 && d >= 2;
  const drawStatic = () => { const x = xOf(d);
    $(".svObj", el).innerHTML = mat === "angled" ? `<path d="M${x} 50 L${x + 50} 230" stroke="#C8653A" stroke-width="14" stroke-linecap="round"/>` : `<rect x="${x}" y="50" width="16" height="180" rx="4" fill="${mat === "soft" ? "#b5838d" : "#C8653A"}"/>${mat === "soft" ? Array.from({length:8}, (_, k) => `<circle cx="${x + 8}" cy="${62 + k * 22}" r="6" fill="#e5989b"/>`).join("") : ""}`;
    $(".svRuler", el).innerHTML = [0, 100, 200, 300, 400].map(c => `<path d="M${xOf(c)} 245 v10" class="an-axis"/><text x="${xOf(c)}" y="243" text-anchor="middle" class="an-l">${c} cm</text>`).join("");
    const us = echoUs(), cm343 = us * 0.0343 / 2;
    $(".svOut", el).innerHTML = `<div class="kv"><span>Speed of sound at ${T} °C</span><b>${v().toFixed(1)} m/s</b><span>Echo time (there and back)</span><b>${hasEcho() ? us.toFixed(0) + " µs" : "no echo"}</b><span>distance = time × 0.0343 ÷ 2</span><b>${hasEcho() ? cm343.toFixed(1) + " cm" : "pulseIn() returns 0"}</b></div>`;
    $(".svErr", el).innerHTML = !hasEcho() ? (mat === "soft" ? "<b>Soft surfaces absorb ultrasound.</b> Too little sound comes back, so the sensor reports nothing. Aim at hard, flat surfaces." : mat === "angled" ? "<b>Angled surfaces reflect the sound away</b>, like a mirror. Keep the target facing the sensor (the beam is only about 15° wide)." : d > 400 ? "<b>Out of range.</b> Beyond about 4 m the echo is too weak." : "<b>Too close.</b> Under about 2 cm the echo returns before the sensor is listening.") : `<b>Temperature matters:</b> using 343 m/s at ${T} °C gives ${(echoUs() * 0.0343 / 2).toFixed(1)} cm for a real ${d} cm (${(((echoUs() * 0.0343 / 2) - d) / d * 100).toFixed(1)} %). Correct with <code>speed = 331.3 + 0.606 × T</code>.`;
    $(".svDv", el).textContent = d + " cm"; $(".svTv", el).textContent = T + " °C"; };
  const SLOW = 1 / 10000 * 1e6; // screen ms per real µs * ... (10,000× slower): 1 µs real = 0.01 ms screen -> use factor below
  const ping = () => { if (pinging) return; pinging = true; t0 = performance.now(); res = null; markAct("sonarViz", "used"); };
  animLoop(el, now => {
    if (auto && !pinging && now - lastAuto > 1500){ lastAuto = now; ping(); }
    const W = 140, base = 14;
    if (!pinging){ $(".svWaves", el).innerHTML = ""; $(".svTrig", el).setAttribute("d", `M60 ${base} H${X1}`); $(".svEcho", el).setAttribute("d", `M60 ${base + 28} H${X1}`); return; }
    const ms = now - t0, x = xOf(d), travelMs = Math.max(250, (x - 112) * 2.2), burstMs = 160, trigMs = 60;
    const back = hasEcho(), tEcho = trigMs + burstMs + 2 * travelMs, total = back ? tEcho + 300 : trigMs + burstMs + 2 * travelMs + 600;
    const sx = 112; let w = "";
    for (let k = 0; k < 8; k++){ const start = trigMs + k * (burstMs / 8); const age = ms - start; if (age < 0) continue;
      const out = age < travelMs, f = out ? age / travelMs : (age - travelMs) / travelMs;
      if (out){ const px = sx + (x - sx) * f; w += `<path d="M${px} ${121 - 40 - f * 30} Q${px + 14} 121 ${px} ${121 + 40 + f * 30}" stroke="#E8B84A" stroke-width="2.4" fill="none" opacity="${.9 - k * .07}"/>`; }
      else if (mat === "hard" && f <= 1){ if (d <= 400){ const px = x - (x - sx) * f, op = Math.max(.15, (1 - d / 500)) * (.9 - k * .07); w += `<path d="M${px} ${150 - 40 - (1 - f) * 30} Q${px - 14} 150 ${px} ${150 + 40 + (1 - f) * 30}" stroke="#1F8A70" stroke-width="2.4" fill="none" opacity="${op}"/>`; } }
      else if (mat === "angled" && f <= 1){ w += `<path d="M${x} ${121 + f * 120} q12 -8 24 0" stroke="#E8B84A" stroke-width="2.4" fill="none" opacity="${.6 - f * .5}"/>`; } }
    $(".svWaves", el).innerHTML = w;
    $(".svTx", el).setAttribute("transform", ms > trigMs && ms < trigMs + burstMs ? `translate(${Math.sin(ms) * 1.5} 0)` : "");
    // timing diagram
    const tx = t => 60 + Math.min(1, t / total) * (X1 - 60), hi = base - 10;
    $(".svTrig", el).setAttribute("d", `M60 ${base} H${tx(0)} V${hi} H${tx(trigMs * .4)} V${base} H${X1}`);
    const eStart = trigMs + burstMs, eEnd = back ? tEcho : total;
    const lo2 = base + 28, hi2 = lo2 - 10; const cur = Math.min(ms, eEnd);
    $(".svEcho", el).setAttribute("d", ms < eStart ? `M60 ${lo2} H${tx(ms)}` : `M60 ${lo2} H${tx(eStart)} V${hi2} H${tx(cur)}${ms >= eEnd ? ` V${lo2} H${tx(ms)}` : ""}`);
    $(".svEt", el).setAttribute("x", tx(eStart)); $(".svEt", el).textContent = ms >= eStart ? (back ? `ECHO HIGH for ${(echoUs() * Math.min(1, (cur - eStart) / (eEnd - eStart))).toFixed(0)} µs` : "ECHO HIGH… no echo comes back (timeout)") : "TRIG: 10 µs pulse, then 8 × 40 kHz chirps";
    if (ms > total){ pinging = false; }
  }, 40);
  el.querySelectorAll("input[type=range], select").forEach(x => x.oninput = x.onchange = () => { d = +$(".svD", el).value; T = +$(".svT", el).value; mat = $(".svM", el).value; drawStatic(); });
  $(".svGo", el).onclick = ping; $(".svA", el).onchange = e => { auto = e.target.checked; };
  drawStatic();
};

/* ---- LDR: light frees charge carriers ---- */
INTERACTIVES.ldrViz = function(el){
  let L = 50, b = getBoard(), photons = [], carriers = [];
  el.innerHTML = bench("How a photoresistor turns light into a number", `<div class="controls"><label class="sl-in">Light <input type="range" class="lvL" min="0" max="100" value="50"><b class="lvLv"></b></label><button class="btn small lvHand" type="button">✋ Cover it</button><button class="btn small lvTorch" type="button">🔦 Flashlight</button>
    <div class="seg seg-sm lvB">${["s3","esp8266","uno"].map(k => `<button type="button" data-b="${k}" aria-selected="${k === b}">${esc(BOARDS[k].short)}</button>`).join("")}</div></div>
   <svg class="anim-svg" viewBox="0 0 800 300" role="img" aria-label="Light reaching a photoresistor in a voltage divider">
    <g class="lvSunG"><circle class="lvSun" cx="70" cy="70" r="30" fill="#FCD34D"/>${Array.from({length:8}, (_, k) => `<path d="M${70 + Math.cos(k * .785) * 38} ${70 + Math.sin(k * .785) * 38} L${70 + Math.cos(k * .785) * 50} ${70 + Math.sin(k * .785) * 50}" stroke="#FCD34D" stroke-width="4" stroke-linecap="round"/>`).join("")}</g>
    <circle cx="250" cy="150" r="70" fill="#f5e6c8" stroke="#a16207" stroke-width="3"/><path d="M200 128 H300 V140 H200 V152 H300 V164 H200 V176 H300" stroke="#c2410c" stroke-width="7" fill="none" class="lvTrack"/>
    <rect x="186" y="110" width="10" height="80" fill="#9ca3af"/><rect x="304" y="110" width="10" height="80" fill="#9ca3af"/><text x="250" y="240" text-anchor="middle" class="an-l">CdS track between two electrodes</text>
    <g class="lvPh"></g><g class="lvCar"></g>
    <g transform="translate(400 20)"><text x="0" y="0" class="an-l b">The voltage divider</text>
     <path d="M40 20 V50" stroke="#D62828" stroke-width="3"/><text x="50" y="22" class="an-l b lvVs"></text>
     <rect x="25" y="50" width="30" height="60" rx="6" fill="#c2410c"/><text x="64" y="84" class="an-l">LDR: <tspan class="lvR"></tspan></text>
     <path d="M40 110 V140" stroke="#555" stroke-width="3"/><circle cx="40" cy="125" r="5" fill="#2563EB"/><path d="M40 125 H150" stroke="#2563EB" stroke-width="3"/><text x="156" y="129" class="an-l b">to <tspan class="lvPin"></tspan>: <tspan class="lvV"></tspan></text>
     <rect x="25" y="140" width="30" height="60" rx="6" fill="#E8D8B0" stroke="#8a6d3b"/><text x="64" y="174" class="an-l">10 kΩ</text>
     <path d="M40 200 V222 M26 222 H54 M31 228 H49 M36 234 H44" stroke="#555" stroke-width="3"/><g class="lvI"></g>
     <text x="200" y="190" class="an-l b">analogRead()</text><rect x="200" y="200" width="170" height="18" rx="6" fill="var(--line)"/><rect class="lvBar" x="200" y="200" width="0" height="18" rx="6" fill="#2563EB"/><text class="lvRaw an-v" x="200" y="246"></text></g>
   </svg><p class="explain">Light energy frees electrons in the cadmium-sulfide (CdS) track, so more charges can move and the resistance falls. The curve used here is a simplified model of a typical CdS cell; real LDRs vary.</p>`);
  const R = () => 1e6 * Math.pow(10, -L / 100 * 2.2);
  const upd = () => { L = +$(".lvL", el).value; const Vs = b === "uno" ? 5 : 3.3, r = R(), V = Vs * 10000 / (r + 10000), raw = Math.round(V / Vs * BOARDS[b].adcMax);
    $(".lvLv", el).textContent = L + " %"; $(".lvSunG", el).setAttribute("opacity", .15 + L / 118);
    $(".lvR", el).textContent = r >= 1e6 ? (r / 1e6).toFixed(2) + " MΩ" : (r / 1000).toFixed(1) + " kΩ"; $(".lvVs", el).textContent = b === "uno" ? "5V" : "3V3";
    $(".lvPin", el).textContent = b === "s3" ? "GPIO1" : "A0"; $(".lvV", el).textContent = V.toFixed(2) + " V";
    $(".lvBar", el).setAttribute("width", 170 * raw / BOARDS[b].adcMax); $(".lvRaw", el).textContent = `${raw} of ${BOARDS[b].adcMax}`;
    $(".lvTrack", el).setAttribute("stroke", `rgb(${194 + L * .5},${65 + L * 1.2},${12 + L * .3})`); markAct("ldrViz", "used"); };
  $(".lvL", el).oninput = upd; $(".lvHand", el).onclick = () => { $(".lvL", el).value = 3; upd(); }; $(".lvTorch", el).onclick = () => { $(".lvL", el).value = 100; upd(); };
  el.querySelectorAll(".lvB button").forEach(x => x.onclick = () => { b = x.dataset.b; el.querySelectorAll(".lvB button").forEach(y => y.setAttribute("aria-selected", y === x)); upd(); });
  upd();
  animLoop(el, () => {
    if (Math.random() < L / 60) photons.push({x:95, y:rnd(60, 90), tx:rnd(205, 295), ty:rnd(128, 176), f:0});
    photons.forEach(p => p.f += .06); photons = photons.filter(p => { if (p.f >= 1){ if (carriers.length < 60) carriers.push({x:p.tx, y:p.ty, life:1}); return false; } return true; });
    carriers.forEach(c => { c.x += 2.2; c.life -= .02; if (c.x > 300) c.x = 200; }); carriers = carriers.filter(c => c.life > 0);
    $(".lvPh", el).innerHTML = photons.map(p => `<circle cx="${p.x + (p.tx - p.x) * p.f}" cy="${p.y + (p.ty - p.y) * p.f}" r="3.4" fill="#FBBF24"/>`).join("");
    $(".lvCar", el).innerHTML = carriers.map(c => `<circle cx="${c.x}" cy="${c.y}" r="2.6" fill="#1d4ed8" opacity="${c.life}"/>`).join("");
    const I = 1 / (R() + 1e4) * 1e5, ph = (performance.now() / (1200 / (0.3 + I))) % 1;
    $(".lvI", el).innerHTML = [0, .33, .66].map(o => { const f = (ph + o) % 1; return `<circle cx="40" cy="${20 + f * 200}" r="3" fill="#E8B84A"/>`; }).join("");
  }, 30);
};

/* ---- MQ-135: a heated tin-dioxide layer ---- */
INTERACTIVES.mqViz = function(el){
  let heat = 0, on = false, gas = 0, spray = 0, mol = [], hist = [];
  el.innerHTML = bench("Inside the MQ-135", `<div class="controls"><button class="btn primary mvH" type="button">Switch the heater on</button><label class="sl-in">Gas in the air <input type="range" class="mvG" min="0" max="100" value="0"><b class="mvGv">0 %</b></label><button class="btn small mvS" type="button">Spray a cleaning product</button></div>
   <svg class="anim-svg" viewBox="0 0 800 300" role="img" aria-label="Metal-oxide gas sensor: heater, tin dioxide layer and gas molecules">
    <rect x="20" y="30" width="230" height="230" rx="18" fill="#c7cdd3" stroke="#6b7280"/><g opacity=".5">${Array.from({length:12}, (_, i) => `<path d="M${30 + i * 18} 40 V250" stroke="#6b7280"/>`).join("")}${Array.from({length:12}, (_, i) => `<path d="M30 ${40 + i * 18} H240" stroke="#6b7280"/>`).join("")}</g><text x="135" y="22" text-anchor="middle" class="an-l">steel mesh cap</text>
    <rect x="75" y="110" width="120" height="70" rx="35" fill="#efe7d6" stroke="#a8a29e"/><path class="mvCoil" d="M85 145 q8 -16 16 0 q8 16 16 0 q8 -16 16 0 q8 16 16 0 q8 -16 16 0 q8 16 16 0" stroke="#7c2d12" stroke-width="4" fill="none"/><text x="135" y="200" text-anchor="middle" class="an-l">ceramic tube, SnO₂ coating, heater coil</text>
    <rect x="280" y="40" width="270" height="200" rx="12" fill="#fff8eb" stroke="#d6c7a5"/><text x="415" y="32" text-anchor="middle" class="an-l b">zoom: tin-dioxide grains</text>
    <g class="mvGr"></g><g class="mvMol"></g><path d="M250 145 L280 100 M250 145 L280 200" stroke="#d6c7a5" stroke-dasharray="4 3"/>
    <g transform="translate(580 40)"><text class="an-l b" x="0" y="0">Readings</text><text class="mvT an-v" x="0" y="26"></text><text class="mvR an-v" x="0" y="50"></text><text class="mvA an-v" x="0" y="74"></text><rect x="0" y="96" width="190" height="104" rx="8" fill="var(--surface)" stroke="var(--line)"/><path class="mvP" d="" stroke="#7C3AED" stroke-width="2" fill="none"/><text x="4" y="212" class="an-l">AO voltage over time</text></g>
   </svg><p class="explain mvE"></p><p class="explain">A simplified model: warm-up is shortened, and real sensors also respond to temperature and humidity.</p>`);
  const grains = Array.from({length:6}, (_, i) => ({x:330 + (i % 3) * 80, y:95 + Math.floor(i / 3) * 90}));
  animLoop(el, () => {
    if (on && heat < 1) heat = Math.min(1, heat + .012); spray = Math.max(0, spray - .006);
    const g = Math.min(100, gas + spray * 100), cover = on ? Math.max(.12, 1 - g / 120) : .9;
    const Rs = heat < 1 ? 400 - heat * 300 + rnd(-8, 8) : 100 / (1 + g / 25) + rnd(-1, 1), ao = 5 * 20 / (20 + Rs);
    $(".mvCoil", el).setAttribute("stroke", on ? `rgb(${120 + heat * 135},${45 + heat * 70},20)` : "#7c2d12");
    $(".mvGr", el).innerHTML = grains.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="34" fill="#d6d3d1" stroke="#a8a29e"/>${Array.from({length:10}, (_, k) => { const a = k / 10 * Math.PI * 2, show = k / 10 < cover; return show ? `<circle cx="${p.x + Math.cos(a) * 37}" cy="${p.y + Math.sin(a) * 37}" r="4" fill="#dc2626"/><text x="${p.x + Math.cos(a) * 37}" y="${p.y + Math.sin(a) * 37 + 2.5}" text-anchor="middle" font-size="6" fill="#fff">O⁻</text>` : ""; }).join("")}`).join("") + `<text x="415" y="232" text-anchor="middle" class="an-l">${on ? (heat < 1 ? "heating… oxygen ions (O⁻) settle on the hot surface" : g ? "gas molecules use up the O⁻: electrons are released, resistance falls" : "clean air: many O⁻ ions trap electrons, so resistance is high") : "heater off: the sensor is not working yet"}</text>`;
    const want = Math.round(g / 6); while (mol.length < want) mol.push({x:rnd(290, 540), y:rnd(50, 230), vx:rnd(-1, 1), vy:rnd(-1, 1)}); if (mol.length > want) mol.length = want;
    mol.forEach(m => { m.x += m.vx; m.y += m.vy; if (m.x < 290 || m.x > 540) m.vx *= -1; if (m.y < 50 || m.y > 230) m.vy *= -1; });
    $(".mvMol", el).innerHTML = mol.map(m => `<circle cx="${m.x}" cy="${m.y}" r="4.5" fill="#7C3AED" opacity=".85"/>`).join("");
    hist.push(on ? ao : 0); if (hist.length > 90) hist.shift();
    $(".mvP", el).setAttribute("d", hist.map((h, i) => `${i ? "L" : "M"}${2 + i * 2.1} ${196 - h / 5 * 96}`).join(" "));
    $(".mvT", el).textContent = `Heater: ${on ? (heat >= 1 ? "hot (stable)" : "warming " + Math.round(heat * 100) + " %") : "off"}`;
    $(".mvR", el).textContent = `Rs ≈ ${on ? Rs.toFixed(0) + " kΩ" : "—"}`; $(".mvA", el).textContent = `AO ≈ ${on ? ao.toFixed(2) + " V" : "0 V"}`;
    $(".mvE", el).textContent = !on ? "Press “Switch the heater on”." : heat < 1 ? "Warming up: readings drift. Do not use them yet." : g ? "More gas → lower Rs → higher AO voltage. The MQ-135 reacts to many gases, so this is a relative index, not a gas concentration." : "Clean air: this level is your baseline.";
    if (heat >= 1 && g > 40) markAct("mqViz", "used");
  }, 25);
  $(".mvH", el).onclick = () => { on = true; $(".mvH", el).disabled = true; $(".mvH", el).textContent = "Heater on"; };
  $(".mvG", el).oninput = e => { gas = +e.target.value; $(".mvGv", el).textContent = gas + " %"; };
  $(".mvS", el).onclick = () => { spray = 1; };
};
