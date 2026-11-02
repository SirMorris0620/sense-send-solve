/* ============ REVISION 2, PART 3: Unit 2 explainers (UART, Serial tools, DHT variants, PIR) ============ */

/* ---------- UART: one letter, bit by bit ---------- */
INTERACTIVES.uartLab = function(el){
  let text = "Hi", ci = 0, step = 10, sBaud = 9600, rBaud = 9600;
  const BAUDS = [1200, 4800, 9600, 19200, 57600, 115200];
  const bitsOf = ch => { const v = ch.charCodeAt(0) & 255; const d = []; for (let i = 0; i < 8; i++) d.push((v >> i) & 1); return [0, ...d, 1]; };   /* start, 8 data LSB first, stop */
  const recv = ch => { const bits = bitsOf(ch), ratio = sBaud / rBaud; /* receiver samples middle of each of ITS bit times */
    const got = []; for (let k = 0; k < 10; k++){ const t = (k + .5) * ratio; got.push(t < 10 ? bits[Math.floor(t)] : 1); }
    if (got[0] !== 0) return {ok: false, ch: "?", bits: got}; let v = 0; for (let i = 0; i < 8; i++) v |= got[i + 1] << i; return {ok: v === (ch.charCodeAt(0) & 255), ch: v >= 32 && v < 127 ? String.fromCharCode(v) : "▯", bits: got}; };
  const render = () => {
    const ch = text[ci % text.length] || "H", bits = bitsOf(ch), W = 560, bw = 40, x0 = 60;
    let d = `M10 30 L${x0} 30`; bits.forEach((b, i) => { const y = b ? 30 : 100; d += ` L${x0 + i * bw} ${y} L${x0 + (i + 1) * bw} ${y}`; }); d += ` L${W - 20} 30`;
    const labels = ["start", "1", "2", "3", "4", "5", "6", "7", "8", "stop"].map((l, i) => `<text x="${x0 + i * bw + bw / 2}" y="130" text-anchor="middle" class="uL ${i === 0 || i === 9 ? "uS" : ""}">${i === 0 || i === 9 ? l : "bit " + (i - 1)}</text><text x="${x0 + i * bw + bw / 2}" y="${bits[i] ? 22 : 92}" text-anchor="middle" class="uB">${bits[i]}</text>`).join("");
    const r = recv(ch), here = x0 + Math.min(step, 10) * bw;
    const samples = r.bits.map((_, k) => `<line x1="${x0 + (k + .5) * (sBaud / rBaud) * bw}" x2="${x0 + (k + .5) * (sBaud / rBaud) * bw}" y1="40" y2="90" stroke="#C2410C" stroke-width="2" stroke-dasharray="3 3" opacity="${sBaud !== rBaud && (k + .5) * sBaud / rBaud < 10 ? .9 : 0}"/>`).join("");
    const val = ch.charCodeAt(0);
    const msg = sBaud === rBaud ? `<b>Both sides agree on ${sBaud} baud</b>, so every bit is read in the middle of its time slot. The receiver builds <b>${ch === " " ? "(space)" : esc(ch)}</b> correctly.`
      : `<b>Mismatch!</b> The sender uses ${sBaud} baud but the receiver listens at ${rBaud}. The receiver's “ticks” (orange dashes) land in the wrong places, so it reads <b>${esc(r.ch)}</b> instead of <b>${esc(ch)}</b>. This is exactly the garbage you see when the Serial Monitor baud rate does not match <code>Serial.begin()</code>.`;
    el.innerHTML = bench("UART: how one letter travels on one wire", `
     <p class="explain">UART is the simplest way for two devices to talk: <b>one wire for sending (TX), one for receiving (RX)</b>. There is no clock wire, so both sides must agree on a speed called the <b>baud rate</b> (bits per second). Type a word and watch each letter turn into 10 pulses.</p>
     <div class="controls"><label>Word to send <input class="ulT" maxlength="8" value="${esc(text)}" style="width:7em"></label>
      <label>Letter <select class="ulC">${[...text].map((c, i) => `<option value="${i}" ${i === ci ? "selected" : ""}>${i + 1}: ${c === " " ? "(space)" : esc(c)}</option>`).join("")}</select></label></div>
     <div class="controls"><label>Sender speed <select class="ulS">${BAUDS.map(b => `<option ${b === sBaud ? "selected" : ""}>${b}</option>`).join("")}</select></label>
      <label>Receiver speed <select class="ulR">${BAUDS.map(b => `<option ${b === rBaud ? "selected" : ""}>${b}</option>`).join("")}</select></label>
      <button class="btn small ulBad" type="button">Make them mismatch</button></div>
     <svg viewBox="0 0 ${W} 150" class="ix-svg" role="img" aria-label="Signal for the letter ${esc(ch)}"><style>.uL{font:600 11px Atkinson Hyperlegible,sans-serif;fill:currentColor}.uS{fill:#C2410C}.uB{font:700 14px Roboto Mono,monospace;fill:#4F46E5}</style>
      <rect x="${x0}" y="24" width="${bw}" height="82" fill="#C2410C" opacity=".1"/><rect x="${x0 + 9 * bw}" y="24" width="${bw}" height="82" fill="#C2410C" opacity=".1"/>
      <path d="${d}" fill="none" stroke="#4F46E5" stroke-width="3" stroke-linejoin="round"/>${labels}${samples}
      <text x="10" y="144" class="uL">idle = HIGH (wire resting at 1)</text></svg>
     <div class="ix-grid2"><div class="ix-out"><b>The letter “${ch === " " ? "(space)" : esc(ch)}”</b> is stored as the number <b>${val}</b> (ASCII code). In binary that is <code>${val.toString(2).padStart(8, "0")}</code>.<br>It is sent <b>smallest bit first</b>: <code>${bits.slice(1, 9).join(" ")}</code>, wrapped by a <b>start bit</b> (always 0, “wake up!”) and a <b>stop bit</b> (always 1, “done”).</div>
      <div class="ix-out" aria-live="polite">${msg}<br><span class="explain">At ${sBaud} baud one bit lasts ${(1e6 / sBaud).toFixed(0)} µs, so one letter takes about ${(10e3 / sBaud).toFixed(2)} ms: roughly <b>${Math.floor(sBaud / 10)} letters per second</b>.</span></div></div>`);
    $(".ulT", el).onchange = e => { text = (e.target.value || "H").slice(0, 8); ci = 0; render(); markAct("uartLab", "type"); };
    $(".ulC", el).onchange = e => { ci = +e.target.value; render(); };
    $(".ulS", el).onchange = e => { sBaud = +e.target.value; render(); if (sBaud !== rBaud) markAct("uartLab", "mismatch"); };
    $(".ulR", el).onchange = e => { rBaud = +e.target.value; render(); if (sBaud !== rBaud) markAct("uartLab", "mismatch"); };
    $(".ulBad", el).onclick = () => { sBaud = 115200; rBaud = 9600; render(); markAct("uartLab", "mismatch"); };
  };
  render();
};

/* ---------- Serial Monitor vs Serial Plotter ---------- */
INTERACTIVES.serialTools = function(el){
  let mode = 0, seed = 1;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const data = () => { seed = 7; return Array.from({length: 24}, (_, i) => ({t: +(24 + 2.2 * Math.sin(i / 3.2) + (rnd() - .5) * .8).toFixed(1), h: +(55 + 6 * Math.cos(i / 4) + (rnd() - .5) * 1.2).toFixed(1)})); };
  const D = data();
  const STY = [
   {n:"A. Just the number", code:["Serial.println(t);"], line: d => `${d.t}`, plot: 1, note: "The Plotter draws one line. It has no name, so it gets a generic label. Good for a quick look."},
   {n:"B. A label and a number", code:['Serial.print("temp:");', "Serial.println(t);"], line: d => `temp:${d.t}`, plot: 1, note: "<code>name:value</code> is the Plotter's secret code: the part before the colon becomes the <b>legend name</b>."},
   {n:"C. Two values", code:['Serial.print("temp:");', "Serial.print(t);", 'Serial.print(",");', 'Serial.print("hum:");', "Serial.println(h);"], line: d => `temp:${d.t},hum:${d.h}`, plot: 2, note: "Separate values with a <b>comma</b> (or a space) on the <b>same line</b>. Each name gets its own colour. End with <code>println</code> so a new line starts the next sample."},
   {n:"D. A sentence (don't!)", code:['Serial.print("The temperature is ");', "Serial.println(t);"], line: d => `The temperature is ${d.t}`, plot: 0, note: "Words are fine for the Monitor, but the Plotter can't turn “The temperature is” into a number. Keep Plotter output to <b>numbers and labels only</b>."}];
  const render = () => {
    const s = STY[mode], W = 300, H = 150;
    const line = (key, col, lo, hi) => "M" + D.map((d, i) => `${10 + i * (W - 20) / 23} ${H - 14 - (d[key] - lo) / (hi - lo) * (H - 30)}`).join(" L");
    const plot = s.plot === 0 ? `<text x="150" y="75" text-anchor="middle" class="uL">No graph: nothing to plot</text>`
      : `<path d="${line("t", "#4F46E5", 20, 28)}" fill="none" stroke="#4F46E5" stroke-width="2.5"/>${s.plot === 2 ? `<path d="${line("h", "#C2410C", 46, 66)}" fill="none" stroke="#C2410C" stroke-width="2.5"/>` : ""}
        <text x="14" y="14" class="uL" fill="#4F46E5" style="fill:#4F46E5">${mode === 0 ? "value" : "temp"}</text>${s.plot === 2 ? `<text x="70" y="14" class="uL" style="fill:#C2410C">hum</text>` : ""}`;
    el.innerHTML = bench("Serial Monitor vs Serial Plotter", `
     <p class="explain">Both tools read the <b>same wire</b> (the USB cable) and the <b>same <code>Serial.print</code> lines</b>. The <b>Monitor</b> shows text, so you can <i>read</i> messages. The <b>Plotter</b> turns numbers into a moving graph, so you can <i>see</i> trends. Pick how your sketch prints and compare.</p>
     <div class="seg seg-sm stT">${STY.map((x, i) => `<button type="button" data-i="${i}" aria-selected="${i === mode}">${x.n}</button>`).join("")}</div>
     <div class="codebox"><pre class="code"><code>${esc(s.code.join("\n"))}</code></pre></div>
     <div class="ix-grid2"><div><p class="explain"><b>Serial Monitor</b> (text):</p><div class="ix-out" style="font-family:Roboto Mono,monospace;font-size:.82rem;max-height:160px;overflow:auto">${D.slice(-7).map(d => esc(s.line(d))).join("<br>")}</div></div>
      <div><p class="explain"><b>Serial Plotter</b> (graph, newest on the right):</p><svg viewBox="0 0 ${W} ${H}" class="ix-svg" role="img" aria-label="Plotter preview"><style>.uL{font:600 11px Atkinson Hyperlegible,sans-serif;fill:currentColor}</style><rect width="${W}" height="${H}" rx="8" fill="none" stroke="currentColor" opacity=".25"/>${plot}</svg></div></div>
     <div class="ix-out">${s.note}</div>
     <p class="explain"><b>Remember:</b> the baud rate menu at the bottom of both windows must equal the number in <code>Serial.begin(…)</code>. The Monitor and Plotter cannot be open on the same port at once: close one before opening the other (and close both before uploading).</p>`);
    el.querySelectorAll(".stT button").forEach(b => b.onclick = () => { mode = +b.dataset.i; render(); markAct("serialTools", "style" + mode); });
  };
  render();
};

/* ---------- DHT: bare sensor vs 3-pin module ---------- */
INTERACTIVES.dhtVariants = function(el){
  let kind = "bare", pull = false, sel = null;
  const INFO = {
   bare: {pins: [["1", "VCC", "3.3 V or 5 V power", "#dc2626"], ["2", "DATA", "The one signal wire to your board", "#4F46E5"], ["3", "NC", "Not connected: leave it empty", "#6b7280"], ["4", "GND", "Ground (0 V)", "#111"]]},
   mod: {pins: [["S", "DATA (OUT)", "The signal wire to your board", "#4F46E5"], ["+", "VCC", "3.3 V or 5 V power", "#dc2626"], ["−", "GND", "Ground (0 V)", "#111"]]}};
  const render = () => {
    const P = INFO[kind].pins, n = P.length;
    const body = kind === "bare"
      ? `<rect x="40" y="22" width="120" height="108" rx="8" fill="#38bdf8" stroke="#075985" stroke-width="2"/>${Array.from({length: 6}, (_, i) => `<line x1="52" x2="148" y1="${38 + i * 16}" y2="${38 + i * 16}" stroke="#075985" stroke-width="2" opacity=".5"/>`).join("")}<text x="100" y="14" text-anchor="middle" class="dL">DHT bare sensor (4 legs)</text>`
      : `<rect x="30" y="20" width="150" height="110" rx="8" fill="#16a34a" stroke="#14532d" stroke-width="2"/><rect x="62" y="30" width="70" height="60" rx="6" fill="#38bdf8" stroke="#075985" stroke-width="2"/>${Array.from({length: 4}, (_, i) => `<line x1="70" x2="124" y1="${42 + i * 12}" y2="${42 + i * 12}" stroke="#075985" stroke-width="2" opacity=".5"/>`).join("")}<rect x="140" y="50" width="26" height="9" rx="2" fill="#1f2937"/><text x="153" y="46" text-anchor="middle" class="dS">10k</text><circle cx="148" cy="100" r="5" fill="#ef4444"/><text x="100" y="14" text-anchor="middle" class="dL">DHT module (3 pins on a small board)</text>`;
    const px = i => kind === "bare" ? 58 + i * 28 : 62 + i * 38;
    const pins = P.map((p, i) => `<g class="dvP" data-i="${i}" tabindex="0" role="button" aria-label="Pin ${p[1]}"><rect x="${px(i) - 6}" y="130" width="12" height="46" rx="2" fill="${sel === i ? "#fbbf24" : "#d1d5db"}" stroke="#374151"/><circle cx="${px(i)}" cy="190" r="13" fill="${p[3]}" /><text x="${px(i)}" y="195" text-anchor="middle" fill="#fff" class="dB">${p[0]}</text></g>`).join("");
    const x1 = px(0), x2 = px(1), xr = x2 + 50, wire = `<path d="M${x2} 204 V222 H${xr + 40}" fill="none" stroke="#4F46E5" stroke-width="3"/><text x="${xr + 44}" y="226" class="dL">to board</text>${pull ? `<path d="M${x1} 204 V240 H${xr}" fill="none" stroke="#dc2626" stroke-width="3"/><path d="M${xr} 222 V240" stroke="#92400e" stroke-width="3"/><rect x="${xr - 7}" y="224" width="14" height="14" fill="#fde68a" stroke="#92400e"/><text x="${xr + 12}" y="235" class="dL">10 kΩ</text>` : ""}`;
    const needs = kind === "bare" ? (pull ? "<b>Good.</b> With the 10 kΩ pull-up the DATA wire rests at HIGH, so the sensor can pull it down to send bits. Reads work." : "<b>Add the pull-up!</b> A bare DHT needs a <b>10 kΩ resistor between DATA and VCC</b>. Without it the wire floats and you get NaN again and again.") : "<b>No resistor needed.</b> The module already has the 10 kΩ pull-up on its board (the little “10k” part). You only connect three wires.";
    el.innerHTML = bench("DHT: bare sensor or module?", `
     <p class="explain">DHT11 and DHT22 come in <b>two shapes</b>. The sensor inside is the same. The <b>module</b> adds a tiny circuit board with the helper resistor already fitted. Pick the one you have and tap each pin.</p>
     <div class="seg seg-sm dvK"><button type="button" data-k="bare" aria-selected="${kind === "bare"}">Bare sensor (4 pins)</button><button type="button" data-k="mod" aria-selected="${kind === "mod"}">Module (3 pins)</button></div>
     <svg viewBox="0 0 260 250" class="ix-svg" style="max-width:340px" role="img" aria-label="${kind === "bare" ? "Bare DHT" : "DHT module"} pins"><style>.dL{font:600 11px Atkinson Hyperlegible,sans-serif;fill:currentColor}.dS{font:700 8px Roboto Mono,monospace;fill:#fff}.dB{font:700 11px Roboto Mono,monospace}</style>${body}${pins}${kind === "bare" ? wire : ""}</svg>
     <div class="ix-out" aria-live="polite">${sel === null ? "Tap a pin to see what it does." : `<b>Pin ${P[sel][0]}: ${P[sel][1]}</b>. ${P[sel][2]}.`}</div>
     ${kind === "bare" ? `<div class="controls"><label><input type="checkbox" class="dvPull" ${pull ? "checked" : ""}> Add the 10 kΩ pull-up resistor (DATA to VCC)</label></div>` : ""}
     <div class="ix-out" aria-live="polite">${needs}</div>
     <table class="t"><tr><th></th><th>Bare sensor</th><th>Module</th></tr><tr><td>Pins</td><td>4 (one unused)</td><td>3</td></tr><tr><td>Pull-up resistor</td><td>You add 10 kΩ</td><td>Already on the board</td></tr><tr><td>Pin order</td><td>1 VCC, 2 DATA, 3 NC, 4 GND (front, left to right)</td><td><b>Differs by maker!</b> Read the tiny letters (S, +, −)</td></tr><tr><td>Best for</td><td>Learning how it works; permanent builds</td><td>Fast, fewer mistakes: start here</td></tr><tr><td>Code</td><td colspan="2">The same! <code>DHT dht(pin, DHT22);</code></td></tr></table>`);
    el.querySelectorAll(".dvK button").forEach(b => b.onclick = () => { kind = b.dataset.k; sel = null; render(); markAct("dhtVariants", kind); });
    el.querySelectorAll(".dvP").forEach(g => { const f = () => { sel = +g.dataset.i; render(); }; g.onclick = f; g.onkeydown = e => { if (e.key === "Enter" || e.key === " ") f(); }; });
    const c = $(".dvPull", el); if (c) c.onchange = () => { pull = c.checked; render(); if (pull) markAct("dhtVariants", "pullup"); };
  };
  render();
};

/* ---------- PIR: lens zones, two halves, difference, hold time ---------- */
INTERACTIVES.pirLens = function(el){
  let x = 8, hold = 3, still = false, playing = false, hist = [], t = 0, out = 0, holdLeft = 0, dir = 1;
  const ZW = 10, NZ = 9;           /* zone width and count: stripes alternate A, B, A, B … */
  const ov = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
  const heat = px => { let A = 0, B = 0; for (let z = 0; z < NZ; z++){ const o = ov(px - 4, px + 4, 5 + z * ZW, 5 + (z + 1) * ZW); if (z % 2 === 0) A += o; else B += o; } return {A, B}; };
  const sample = () => { const h = heat(x), prev = hist.length ? hist[hist.length - 1] : {A: h.A, B: h.B}; const diff = still ? 0 : (h.A - h.B) - (prev.A - prev.B); /* a PIR reacts to CHANGE */
    return {A: h.A, B: h.B, diff}; };
  const step = () => { const s = sample(); if (Math.abs(s.diff) > 1.2) holdLeft = hold; else holdLeft = Math.max(0, holdLeft - .25); out = holdLeft > 0 ? 1 : 0; hist.push({...s, out}); if (hist.length > 60) hist.shift(); };
  const draw = () => {
    const W = 560, bx = 40, zone = (z) => `<rect x="${bx + 5 + z * ZW * 5}" y="30" width="${ZW * 5}" height="110" fill="${z % 2 === 0 ? "#4F46E5" : "#C2410C"}" opacity="${still ? .12 : .2}"/><text x="${bx + 5 + z * ZW * 5 + ZW * 2.5}" y="48" text-anchor="middle" class="pL" style="fill:${z % 2 === 0 ? "#4F46E5" : "#C2410C"}">${z % 2 === 0 ? "A" : "B"}</text>`;
    const px = bx + 5 + x * 5;
    const gx = i => 40 + i * 8.5, gy = v => 215 - v * 1.5;
    const graph = k => "M" + hist.map((h, i) => `${gx(i)} ${k === "o" ? 262 - h.out * 20 : 205 - Math.max(-20, Math.min(20, h.diff * 3))}`).join(" L");
    const diffNow = hist.length ? hist[hist.length - 1].diff : 0;
    el.innerHTML = bench("PIR: how a motion sensor “sees” you", `
     <p class="explain">A PIR has <b>two small heat detectors, A and B</b>, behind a bumpy plastic <b>Fresnel lens</b>. The lens splits the room into <b>stripes</b> that alternate between A and B. A person standing still warms A and B equally, so the <b>difference</b> is zero. When you <b>cross a stripe</b>, one detector suddenly warms more than the other. That change is “motion”.</p>
     <svg viewBox="0 0 ${W} 275" class="ix-svg" role="img" aria-label="PIR field of view with a person at position ${Math.round(x)}"><style>.pL{font:700 12px Roboto Mono,monospace}.pT{font:600 11px Atkinson Hyperlegible,sans-serif;fill:currentColor}</style>
      ${Array.from({length: NZ}, (_, z) => zone(z)).join("")}
      <rect x="${bx}" y="26" width="${NZ * ZW * 5 + 10}" height="118" rx="6" fill="none" stroke="currentColor" opacity=".35"/>
      <g transform="translate(${px},0)"><circle cx="0" cy="88" r="9" fill="#f59e0b"/><rect x="-10" y="98" width="20" height="36" rx="8" fill="#f59e0b"/></g>
      <text x="${bx}" y="160" class="pT">From above: stripes A (blue) and B (orange), you in the middle (${still ? "standing still" : "moving"}).</text>
      <path d="${graph("d")}" fill="none" stroke="#4F46E5" stroke-width="2.5"/><line x1="40" x2="${40 + 59 * 8.5}" y1="205" y2="205" stroke="currentColor" opacity=".3"/>
      <text x="40" y="180" class="pT">A − B change (the PIR reacts when this jumps)</text>
      <path d="${graph("o")}" fill="none" stroke="#16a34a" stroke-width="2.5"/><text x="40" y="236" class="pT">OUT pin (HIGH = motion), held for ${hold} s after the last movement</text></svg>
     <div class="controls"><label>Your position <input type="range" class="plX" min="0" max="80" step="1" value="${Math.round(x)}"></label>
      <button class="btn primary plGo" type="button">${playing ? "Stop walking" : "Walk across"}</button>
      <label><input type="checkbox" class="plStill" ${still ? "checked" : ""}> Stand still</label></div>
     <div class="controls"><label>Hold time <input type="range" class="plH" min="1" max="10" value="${hold}"></label><span class="rangeval">${hold} s</span></div>
     <div class="ix-out" aria-live="polite">${out ? "<b>OUT = HIGH.</b> The sensor reports motion." : "<b>OUT = LOW.</b> Nothing changed recently."} ${still ? "Standing still, even right in front of the sensor, gives <b>no change</b>, so a PIR forgets you after the hold time. That is why people “disappear” when sitting still at a desk." : Math.abs(diffNow) > 1.2 ? "You just crossed a stripe edge: detector A and B heated unevenly." : "Drag the slider across the stripes, or press Walk."}</div>
     <p class="explain">Three things to remember: (1) it detects <b>change in heat</b>, not heat itself; (2) the <b>hold time</b> keeps OUT high for a few seconds after the last movement; (3) the first 30–60 s after power-on it is still “learning” the room.</p>`);
    $(".plX", el).oninput = e => { x = +e.target.value; step(); draw(); markAct("pirLens", "drag"); };
    $(".plGo", el).onclick = () => { playing = !playing; draw(); if (playing) markAct("pirLens", "walk"); };
    $(".plStill", el).onchange = e => { still = e.target.checked; draw(); markAct("pirLens", "still"); };
    $(".plH", el).oninput = e => { hold = +e.target.value; draw(); };
  };
  hist = []; for (let i = 0; i < 5; i++) hist.push({A: 0, B: 0, diff: 0, out: 0}); draw();
  aLoop(el, dt => { if (!playing) return; t += dt; if (t < 90) return; t = 0; x += dir * 2; if (x >= 80){ x = 80; dir = -1; } if (x <= 0){ x = 0; dir = 1; } step(); const sl = $(".plX", el); if (!sl) return; /* redraw without losing focus */ const act = document.activeElement; draw(); });
};
