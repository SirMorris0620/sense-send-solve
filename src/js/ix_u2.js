/* ============ INTERACTIVES: UNIT 2 ============ */
/* ---- 2.1 Ohm's law lab ---- */
INTERACTIVES.ohmLab = function(el){
  let V = 5, R = 220, lock = "V";
  el.innerHTML = bench("Ohm's law lab", `<div class="ix-grid2"><div>
    <div class="controls"><label>Voltage V <input type="range" class="olV" min="0.5" max="12" step="0.1" value="5"></label><span class="rangeval olVv"></span></div>
    <div class="controls"><label>Resistance R <input type="range" class="olR" min="10" max="10000" step="10" value="220"></label><span class="rangeval olRv"></span></div>
    <div class="ix-out"><div class="kv"><span>Current I = V ÷ R</span><b class="olI"></b><span>Power P = V × I</span><b class="olP"></b></div></div>
    <p class="explain olN"></p></div>
    <svg class="flowsvg" viewBox="0 0 300 200" aria-label="Water analogy: pressure, flow, and pipe width"><rect x="20" y="40" width="40" height="120" rx="6" fill="#2563EB" opacity=".25"/><rect class="olTank" x="20" y="90" width="40" height="70" rx="6" fill="#2563EB" opacity=".7"/><text x="40" y="180" text-anchor="middle" class="svgtxt">pressure (V)</text>
     <path d="M60 140 H140" stroke="#9BB2A8" stroke-width="22"/><rect class="olPipe" x="140" y="129" width="60" height="22" fill="#9BB2A8"/><path d="M200 140 H280" stroke="#9BB2A8" stroke-width="22"/><text x="170" y="120" text-anchor="middle" class="svgtxt">resistance (R)</text>
     <g class="olDrops"></g><text x="240" y="180" text-anchor="middle" class="svgtxt">flow (I)</text></svg></div>`);
  let t = 0, raf;
  const draw = () => { V = +$(".olV", el).value; R = +$(".olR", el).value; const I = V / R, P = V * I;
    $(".olVv", el).textContent = V.toFixed(1) + " V"; $(".olRv", el).textContent = R >= 1000 ? (R / 1000).toFixed(2) + " kΩ" : R + " Ω";
    $(".olI", el).textContent = I >= 1 ? I.toFixed(2) + " A" : (I * 1000).toFixed(1) + " mA"; $(".olP", el).textContent = P >= 1 ? P.toFixed(2) + " W" : (P * 1000).toFixed(0) + " mW";
    const h = 10 + V / 12 * 110; const tank = $(".olTank", el); tank.setAttribute("y", 160 - h); tank.setAttribute("height", h);
    const w = Math.max(3, 22 - Math.log10(R) * 5); const pipe = $(".olPipe", el); pipe.setAttribute("height", w); pipe.setAttribute("y", 140 - w / 2);
    $(".olN", el).textContent = I > 0.04 ? "Above about 40 mA: too much for a microcontroller pin, and a short circuit-like current for small parts." : I < 0.0005 ? "Below 0.5 mA: an LED would barely glow." : "A safe, small current for signals and LEDs.";
    markAct("ohmLab", "used"); };
  const anim = () => { if (!alive(el)) return cancelAnimationFrame(raf); t += (V / R) * 400; const n = 6; $(".olDrops", el).innerHTML = Array.from({length:n}, (_, i) => { const x = 60 + ((t + i * 220 / n) % 220); return `<circle cx="${x}" cy="140" r="3.5" fill="#2563EB"/>`; }).join(""); raf = requestAnimationFrame(anim); };
  el.querySelectorAll("input").forEach(x => x.oninput = draw); draw(); if (!reduceMotion()) anim();
};
/* ---- 2.1 LED resistor calculator ---- */
INTERACTIVES.ledCalc = function(el){
  const E12 = [10,12,15,18,22,27,33,39,47,56,68,82], std = r => { for (let d = 1; d <= 100000; d *= 10) for (const v of E12) if (v * d >= r) return v * d; return r; };
  const LEDS = {red:[2.0,"#D62828"], yellow:[2.1,"#E8B84A"], green:[2.2,"#1F8A70"], blue:[3.1,"#2563EB"], white:[3.1,"#E5E7EB"]};
  el.innerHTML = bench("LED resistor calculator", `<div class="controls"><label>Supply <select class="dinput lcS"><option value="3.3">3.3 V pin (ESP32-S3, ESP8266)</option><option value="5">5 V pin (Uno R4 WiFi)</option></select></label>
   <label>LED color <select class="dinput lcC">${Object.keys(LEDS).map(k => `<option>${k}</option>`).join("")}</select></label><label>Current <select class="dinput lcI"><option value="0.005">5 mA (dim)</option><option value="0.01" selected>10 mA (good)</option><option value="0.02">20 mA (bright, maximum for most 5 mm LEDs)</option></select></label></div>
   <div class="ix-grid2"><div class="ix-out lcOut"></div><svg class="flowsvg" viewBox="0 0 260 120" aria-label="LED circuit"><text x="10" y="64" class="svgtxt b lcVt">3.3 V</text><path d="M50 60 H90" stroke="var(--ink)" stroke-width="2"/><rect x="90" y="50" width="50" height="20" rx="4" fill="#E8D8B0" stroke="var(--ink)"/><text x="115" y="44" text-anchor="middle" class="svgtxt lcRt"></text><path d="M140 60 H170" stroke="var(--ink)" stroke-width="2"/><path d="M170 46 V74 L196 60 Z" class="lcLed" stroke="var(--ink)"/><path d="M196 46 V74 M196 60 H240 V100 H20 V80" stroke="var(--ink)" stroke-width="2" fill="none"/><text x="220" y="115" class="svgtxt">GND</text></svg></div>
   <p class="explain">Typical forward voltages for illustration. Check your LED's datasheet: “blue” and “white” vary from about 2.8 to 3.4 V.</p>`);
  const draw = () => { const Vs = +$(".lcS", el).value, c = $(".lcC", el).value, I = +$(".lcI", el).value, Vf = LEDS[c][0];
    $(".lcVt", el).textContent = Vs + " V"; $(".lcLed", el).setAttribute("fill", LEDS[c][1]);
    if (Vf >= Vs - 0.05){ $(".lcOut", el).innerHTML = `<b>This LED needs about ${Vf} V, almost all of the ${Vs} V supply.</b> It may be dim or not light at all. Use a 5 V supply through a transistor, or a different color.`; $(".lcRt", el).textContent = "?"; return; }
    const R = (Vs - Vf) / I, Rs = std(R), Ireal = (Vs - Vf) / Rs, Pr = (Vs - Vf) * Ireal;
    $(".lcRt", el).textContent = Rs >= 1000 ? Rs / 1000 + " kΩ" : Rs + " Ω";
    $(".lcOut", el).innerHTML = `<div class="kv"><span>Exact</span><b>(${Vs} − ${Vf}) ÷ ${I} = ${R.toFixed(0)} Ω</b><span>Standard value (next one up)</span><b>${Rs} Ω</b><span>Real current</span><b>${(Ireal * 1000).toFixed(1)} mA</b><span>Resistor power</span><b>${(Pr * 1000).toFixed(1)} mW (a common ¼ W resistor is fine)</b></div>${Vs === 5 && Ireal > 0.008 ? `<p class="err"><b>Too much for an Uno R4 WiFi pin.</b> The RA4M1's pins are rated about 8 mA each (Arduino, n.d.). Choose 5 mA, or use at least 470 Ω, as this course does. For more current, switch the LED with a transistor.</p>` : Vs === 3.3 && Ireal > 0.012 ? `<p class="err"><b>High for a GPIO pin.</b> Keep each pin well under its limit (ESP8266 pins: about 12 mA). 10 mA or less is a safe choice.</p>` : ""}`;
    markAct("ledCalc", "used"); };
  el.querySelectorAll("select").forEach(x => x.onchange = draw); draw();
};
/* ---- 2.1 voltage divider lab ---- */
INTERACTIVES.dividerLab = function(el){
  const PRE = {echo:[5,1000,2000,"HC-SR04 ECHO → 3.3 V pin"], mq:[5,10000,15000,"MQ-135 AO (max) → 3.3 V pin"], ldr:[3.3,10000,10000,"LDR divider (R1 = LDR)"], custom:[5,4700,4700,"Custom"]};
  el.innerHTML = bench("Voltage divider lab", `<div class="controls"><label>Preset <select class="dinput dvP">${Object.keys(PRE).map(k => `<option value="${k}">${PRE[k][3]}</option>`).join("")}</select></label></div>
   <div class="ix-grid2"><div>
    <div class="controls"><label>V<sub>in</sub> <input type="range" class="dvV" min="0" max="5" step="0.1"></label><span class="rangeval dvVv"></span></div>
    <div class="controls"><label>R1 (top) <input type="range" class="dvR1" min="100" max="100000" step="100"></label><span class="rangeval dvR1v"></span></div>
    <div class="controls dvLight" hidden><label>Light <input type="range" class="dvL" min="0" max="100" value="50"></label><span class="rangeval dvLv"></span></div>
    <div class="controls"><label>R2 (bottom) <input type="range" class="dvR2" min="100" max="100000" step="100"></label><span class="rangeval dvR2v"></span></div>
    <div class="ix-out"><div class="ix-big dvOut"></div><p class="explain dvN"></p></div></div>
    <svg class="flowsvg" viewBox="0 0 220 250" aria-label="Divider schematic"><text x="90" y="18" class="svgtxt b dvTV"></text><path d="M80 24 V40" stroke="var(--ink)" stroke-width="2"/><rect x="65" y="40" width="30" height="70" rx="5" class="dvRa" fill="#E8D8B0" stroke="var(--ink)"/><text x="105" y="80" class="svgtxt dvTR1"></text><path d="M80 110 V140" stroke="var(--ink)" stroke-width="2"/><circle cx="80" cy="125" r="5" fill="#C8653A"/><path d="M80 125 H150" stroke="#C8653A" stroke-width="2.5"/><text x="154" y="129" class="svgtxt b dvTO"></text><rect x="65" y="140" width="30" height="70" rx="5" fill="#E8D8B0" stroke="var(--ink)"/><text x="105" y="180" class="svgtxt dvTR2"></text><path d="M80 210 V232 M66 232 H94 M71 238 H89 M76 244 H84" stroke="var(--ink)" stroke-width="2"/></svg></div>`);
  const fmtR = r => r >= 1000 ? (r / 1000).toFixed(r >= 10000 ? 0 : 1) + " kΩ" : r.toFixed(0) + " Ω";
  const set = k => { const p = PRE[k]; $(".dvV", el).value = p[0]; $(".dvR1", el).value = p[1]; $(".dvR2", el).value = p[2]; $(".dvLight", el).hidden = k !== "ldr"; $(".dvR1", el).closest(".controls").hidden = k === "ldr"; draw(); };
  const draw = () => { const k = $(".dvP", el).value, V = +$(".dvV", el).value, R2 = +$(".dvR2", el).value; let R1 = +$(".dvR1", el).value;
    if (k === "ldr"){ const L = +$(".dvL", el).value; R1 = Math.round(1000000 * Math.pow(10, -L / 100 * 2.2)); $(".dvLv", el).textContent = L + " % → LDR " + fmtR(R1); }
    const out = V * R2 / (R1 + R2);
    $(".dvVv", el).textContent = V.toFixed(1) + " V"; $(".dvR1v", el).textContent = fmtR(R1); $(".dvR2v", el).textContent = fmtR(R2);
    $(".dvOut", el).textContent = "Vₒᵤₜ = " + out.toFixed(2) + " V"; $(".dvTV", el).textContent = V.toFixed(1) + " V"; $(".dvTR1", el).textContent = (k === "ldr" ? "LDR " : "R1 ") + fmtR(R1); $(".dvTR2", el).textContent = "R2 " + fmtR(R2); $(".dvTO", el).textContent = out.toFixed(2) + " V";
    $(".dvN", el).innerHTML = `${V.toFixed(1)} × ${fmtR(R2)} ÷ (${fmtR(R1)} + ${fmtR(R2)}) = <b>${out.toFixed(2)} V</b>. ` + (out > 3.6 ? `<span style="color:var(--bad)">Too high for a 3.3 V pin.</span>` : out > 3.3 ? "Slightly above 3.3 V: acceptable for most 3.3 V inputs (absolute maximum about 3.6 V), but less margin." : "Safe for a 3.3 V pin.");
    if (k !== "custom") markAct("dividerLab", "used"); };
  $(".dvP", el).onchange = e => set(e.target.value); el.querySelectorAll("input").forEach(x => x.oninput = draw); set("echo");
};
/* ---- 2.1 pull-up visualizer ---- */
INTERACTIVES.pullupViz = function(el){
  let mode = "float", pressed = false, raf, hist = [];
  el.innerHTML = bench("What does an input pin read?", `<div class="seg seg-sm">${[["float","No resistor (floating)"],["pullup","With a pull-up"],["internal","INPUT_PULLUP"]].map((m, i) => `<button type="button" data-m="${m[0]}" aria-selected="${i === 0}">${m[1]}</button>`).join("")}</div>
   <div class="ix-grid2"><canvas class="mini-chart puC"></canvas><div class="ix-out"><button class="btn primary puB" type="button">Hold to press the button</button><p class="puN explain"></p></div></div>`);
  const notes = {float:"Floating: with no defined level, the pin reads noise (random HIGH and LOW) whenever the button is not pressed.", pullup:"A 10 kΩ resistor to 3.3 V holds the line HIGH. Pressing the button connects it to GND: a clean LOW.", internal:"Same idea, but the resistor is inside the chip: pinMode(pin, INPUT_PULLUP). No extra part needed. Pressed = LOW."};
  const B = $(".puB", el); const down = e => { e.preventDefault(); pressed = true; markAct("pullupViz", "used"); }, up = () => pressed = false;
  B.onpointerdown = down; B.onpointerup = up; B.onpointerleave = up;
  el.querySelectorAll(".seg button").forEach(b => b.onclick = () => { mode = b.dataset.m; el.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-selected", x === b)); $(".puN", el).textContent = notes[mode]; });
  $(".puN", el).textContent = notes[mode];
  const frame = () => { if (!alive(el)) return; const v = pressed ? 0 : mode === "float" ? (Math.random() > .5 ? 1 : 0) : 1; hist.push(v); if (hist.length > 120) hist.shift();
    const cv = $(".puC", el), {g, W, H} = hiDPI(cv); g.clearRect(0, 0, W, H); g.strokeStyle = cssv("--teal") || "#1F8A70"; g.lineWidth = 2; g.beginPath(); hist.forEach((x, i) => { const X = i / 119 * W, Y = x ? 30 : H - 30; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.stroke();
    g.fillStyle = cssv("--muted") || "#53665D"; g.font = "11px sans-serif"; g.fillText("HIGH", 4, 26); g.fillText("LOW", 4, H - 34);
    raf = setTimeout(() => requestAnimationFrame(frame), 60); };
  frame();
};
/* ---- breadboard engine ---- */
const BB = {cols:30, rows:"abcdefghij"};
function bbXY(id){ // "c12" | "T+12" | "T-12" | "B+12" | "B-12"
  const m = id.match(/^([TB])([+-])(\d+)$/); const X = c => 44 + (c - 1) * 19;
  if (m){ const top = m[1] === "T"; const y = top ? (m[2] === "+" ? 18 : 36) : (m[2] === "+" ? 290 : 272); return [X(+m[3]), y]; }
  const r = BB.rows.indexOf(id[0]), c = +id.slice(1); return [X(c), r < 5 ? 66 + r * 19 : 176 + (r - 5) * 19];
}
function bbNet(id, split){ const m = id.match(/^([TB])([+-])(\d+)$/); if (m) return `${m[1]}${m[2]}${split ? (+m[3] <= 15 ? "L" : "R") : ""}`; const r = BB.rows.indexOf(id[0]); return `S${id.slice(1)}${r < 5 ? "top" : "bot"}`; }
const BAND = {0:"#111",1:"#8B4513",2:"#D62828",3:"#F97316",4:"#EAB308",5:"#16A34A",6:"#2563EB",7:"#7C3AED",8:"#6B7280",9:"#F5F5F5"};
function resBands(ohms){ const e = Math.floor(Math.log10(ohms)) - 1, d = Math.round(ohms / Math.pow(10, e)); return [Math.floor(d / 10), d % 10, e].map(n => BAND[n] || "#111"); }
function bbSVG(o){
  o = o || {}; const holes = [];
  for (let c = 1; c <= BB.cols; c++){ for (const r of BB.rows) holes.push(r + c); ["T+","T-","B+","B-"].forEach(p => { if (c % 6 !== 0) holes.push(p + c); }); }
  const lbl = []; for (let c = 1; c <= BB.cols; c += (c === 1 ? 4 : 5)) lbl.push(`<text x="${bbXY("a" + c)[0]}" y="56" text-anchor="middle" class="lbl">${c}</text>`);
  BB.rows.split("").forEach(r => { const [x, y] = bbXY(r + 1); lbl.push(`<text x="${x - 16}" y="${y + 3}" text-anchor="middle" class="lbl">${r}</text>`); });
  const XY = p => typeof p === "string" ? (bbXY(p) || [0, 0]) : p;
  const wire = w => { const [x1, y1] = XY(w.from), [x2, y2] = XY(w.to); const dx = Math.abs(x2 - x1), lift = Math.min(28, 8 + dx * .08); const my = Math.min(y1, y2) - lift, mx = (x1 + x2) / 2;
    return `<g class="bb-wire"><path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" stroke="rgba(0,0,0,.25)" stroke-width="6.5" fill="none" stroke-linecap="round" transform="translate(1.5 2)"/><path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" stroke="${w.color || "#E8B84A"}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="${x1}" cy="${y1}" r="3.4" fill="#cfcfcf" stroke="#777"/><circle cx="${x2}" cy="${y2}" r="3.4" fill="#cfcfcf" stroke="#777"/></g>`; };
  const comp = c => {
    if (c.type === "led"){ const [ax, ay] = bbXY(c.a), [kx, ky] = bbXY(c.k), mx = (ax + kx) / 2, by = Math.min(ay, ky) - 30, col = c.color || "#D62828", dir = Math.sign(kx - ax) || 1;
      return `<g class="bb-led">${c.lit ? `<circle cx="${mx}" cy="${by}" r="30" fill="${col}" opacity=".28"/><circle cx="${mx}" cy="${by}" r="20" fill="${col}" opacity=".35"/>` : ""}
       <path d="M${ax} ${ay} L${ax} ${by + 18} L${mx - 4 * dir} ${by + 8}" stroke="#A3A3A3" stroke-width="2.6" fill="none"/><path d="M${kx} ${ky} L${mx + 4 * dir} ${by + 8}" stroke="#A3A3A3" stroke-width="2.6" fill="none"/>
       <circle cx="${mx}" cy="${by}" r="12" fill="${c.lit ? col : col}" opacity="${c.lit ? 1 : .78}" stroke="rgba(0,0,0,.45)"/><path d="M${mx + 11.2 * dir} ${by - 6} L${mx + 11.2 * dir} ${by + 6}" stroke="rgba(0,0,0,.55)" stroke-width="2.4"/><circle cx="${mx - 4}" cy="${by - 4}" r="3" fill="#fff" opacity=".55"/>
       <text x="${ax - 7 * dir}" y="${ay - 22}" text-anchor="middle" class="bb-pm">+</text><text x="${kx + 7 * dir}" y="${ky - 22}" text-anchor="middle" class="bb-pm">−</text></g>`; }
    if (c.type === "res"){ const [x1, y1] = XY(c.p1), [x2, y2] = XY(c.p2), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, bands = resBands(c.ohms || 220);
      return `<g class="bb-res"><path d="M${x1} ${y1} L${x2} ${y2}" stroke="#A3A3A3" stroke-width="2.4"/><g transform="rotate(${ang} ${mx} ${my})"><rect x="${mx - 16}" y="${my - 6.5}" width="32" height="13" rx="6" fill="#E8D8B0" stroke="#8a6d3b"/>${bands.map((col, k) => `<rect x="${mx - 9 + k * 6}" y="${my - 6.5}" width="3.2" height="13" fill="${col}"/>`).join("")}<rect x="${mx + 9}" y="${my - 6.5}" width="3.2" height="13" fill="#C8A200"/></g>${c.label ? `<text x="${mx + (Math.abs(ang) > 45 ? 22 : 0)}" y="${my - (Math.abs(ang) > 45 ? -4 : 11)}" text-anchor="${Math.abs(ang) > 45 ? "start" : "middle"}" class="bb-tl">${c.label}</text>` : ""}</g>`; }
    if (c.type === "module"){ const P = c.pins.map(p => [bbXY(p[0]), p[1]]), xs = P.map(p => p[0][0]), y = P[0][0][1], x0 = Math.min(...xs) - 18, x1 = Math.max(...xs) + 18, h = c.h || 70, down = c.side !== "up";
      const top = down ? y + 8 : y - 8 - h;
      return `<g class="bb-mod"><rect x="${x0}" y="${top}" width="${x1 - x0}" height="${h}" rx="5" fill="${c.color || "#1F6FB2"}" stroke="rgba(0,0,0,.4)"/>${P.map(p => `<path d="M${p[0][0]} ${y} V${down ? top + 4 : top + h - 4}" stroke="#d4d4d4" stroke-width="3"/><text x="${p[0][0]}" y="${down ? top + 18 : top + h - 10}" text-anchor="middle" class="bb-ml">${esc(p[1])}</text>`).join("")}<text x="${(x0 + x1) / 2}" y="${down ? top + h - 10 : top + 18}" text-anchor="middle" class="bb-mt">${esc(c.label || "")}</text></g>`; }
    return ""; };
  const term = (t, right) => `<g><rect x="${right ? t.x - 26 : t.x - 34}" y="${t.y - 11}" width="64" height="22" rx="5" fill="${t.color || "#17483B"}"/><text x="${right ? t.x + 6 : t.x - 2}" y="${t.y + 4}" text-anchor="middle" fill="#fff" font-size="10" font-family="JetBrains Mono, monospace">${esc(t.label)}</text><circle class="hole term" data-h="${t.id}" cx="${right ? t.x - 26 : t.x + 34}" cy="${t.y}" r="6" fill="#E8B84A"/></g>`;
  const W = 44 + 29 * 19 + 26, Hh = 306, L = o.terms ? 112 : 0, R = o.rterms ? 112 : 0;
  const block = (t, right) => t.block ? `<rect x="${right ? W + 22 : -L + 2}" y="${t.block[0]}" width="${L - 26 || R - 26}" height="${t.block[1]}" rx="10" fill="${t.block[2] || "#1a1d21"}" opacity=".95"/><text x="${right ? W + 22 + (R - 26) / 2 : -L + 2 + (L - 26) / 2}" y="${t.block[0] + 16}" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">${esc(t.block[3] || "")}</text>` : "";
  return `<svg class="bbsim" viewBox="${-L} 0 ${W + L + R} ${Hh}" role="img" aria-label="${esc(o.label || "Virtual breadboard")}">
   ${(o.terms || []).map(t => block(t, false)).join("")}${(o.rterms || []).map(t => block(t, true)).join("")}
   <rect x="0" y="4" width="${W}" height="${Hh - 8}" rx="10" fill="#F3EFE4" stroke="#D8CFB8"/>
   <rect x="0" y="146" width="${W}" height="14" fill="#E4DCC6"/>
   <path d="M20 9 H${W - 10}" stroke="#D62828" stroke-width="1.5" opacity=".6"/><path d="M20 45 H${W - 10}" stroke="#2563EB" stroke-width="1.5" opacity=".6"/><path d="M20 263 H${W - 10}" stroke="#2563EB" stroke-width="1.5" opacity=".6"/><path d="M20 299 H${W - 10}" stroke="#D62828" stroke-width="1.5" opacity=".6"/>
   <text x="10" y="22" class="lbl" fill="#D62828">+</text><text x="10" y="40" class="lbl">−</text><text x="10" y="276" class="lbl">−</text><text x="10" y="294" class="lbl" fill="#D62828">+</text>
   ${o.split ? `<path d="M${(bbXY("a15")[0] + bbXY("a16")[0]) / 2} 6 V48 M${(bbXY("a15")[0] + bbXY("a16")[0]) / 2} 260 V302" stroke="#C8653A" stroke-width="2.4" stroke-dasharray="4 3"/><text x="${(bbXY("a15")[0] + bbXY("a16")[0]) / 2 + 4}" y="58" class="lbl" fill="#C8653A">gap</text>` : ""}
   <g class="strips"></g>${lbl.join("")}
   ${holes.map(h => { const [x, y] = bbXY(h); return `<rect class="hole" data-h="${h}" x="${x - 4}" y="${y - 4}" width="8" height="8" rx="1.5"/>`; }).join("")}
   ${(o.comps || []).filter(c => c.type === "module").map(comp).join("")}<g class="wires">${(o.wires || []).map(wire).join("")}</g>${(o.comps || []).filter(c => c.type !== "module").map(comp).join("")}
   ${(o.terms || []).map(t => term(t, false)).join("")}${(o.rterms || []).map(t => term(t, true)).join("")}
   ${(o.labels || []).map(l => { const [x, y] = XY(l[0]); return `<text x="${x + (l[2] || 0)}" y="${y + (l[3] || 16)}" text-anchor="middle" class="bb-tl">${esc(l[1])}</text>`; }).join("")}
   ${(o.spots || []).map(sp => { const [x, y] = XY(sp); return `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#C8653A" stroke-width="3" class="bb-spot"/>`; }).join("")}
  </svg>`;
}
/* ---- 2.2 breadboard explorer ---- */
INTERACTIVES.bbExplore = function(el){
  let split = true, quiz = null, score = 0, asked = 0;
  const QS = [["a5","e5",true],["e5","f5",false],["c7","c8",false],["T+3","T+20",null],["g12","j12",true],["T-2","T-14",true],["b20","h20",false],["B+16","B+29",true]];
  el.innerHTML = bench("Virtual breadboard: what is connected?", `<div class="controls"><label class="chk"><input type="checkbox" class="bxS" checked><span>This breadboard has split power rails (dashed line)</span></label></div>
   <div class="bbwrap bxW"></div><div class="ix-out bxOut">Tap any hole.</div>
   <div class="controls"><button class="btn primary bxQ" type="button">Quiz me: are these two holes connected?</button><span class="bxQs explain"></span></div>`);
  const draw = () => { $(".bxW", el).innerHTML = bbSVG({split}); el.querySelectorAll(".bxW .hole").forEach(h => h.onclick = () => tap(h.dataset.h)); };
  const tap = id => { const net = bbNet(id, split); const same = [...el.querySelectorAll(".bxW .hole")].filter(h => bbNet(h.dataset.h, split) === net);
    el.querySelectorAll(".bxW .hole").forEach(h => h.classList.remove("hl", "sel")); same.forEach(h => h.classList.add("hl")); el.querySelector(`.bxW .hole[data-h="${id}"]`).classList.add("sel");
    const m = id.match(/^([TB])([+-])(\d+)$/);
    $(".bxOut", el).innerHTML = m ? `<b>${m[1] === "T" ? "Top" : "Bottom"} ${m[2] === "+" ? "+ (power)" : "− (ground)"} rail.</b> ${split ? `On this breadboard the rail is split: only the ${+m[3] <= 15 ? "left" : "right"} half is connected (${same.length} holes). Bridge the gap with a jumper to join the halves.` : `All ${same.length} holes along this line are connected.`}` : `<b>Hole ${id}.</b> Connected to the ${same.length - 1} other holes ${BB.rows.indexOf(id[0]) < 5 ? "a–e" : "f–j"} in column ${id.slice(1)}. Not connected across the center channel.`;
    markAct("bbExplore", "used"); if (quiz) answer(id); };
  const answer = () => {};
  $(".bxS", el).onchange = e => { split = e.target.checked; draw(); };
  $(".bxQ", el).onclick = () => { const q = QS[asked % QS.length]; asked++; const truth = q[2] === null ? !split : q[2];
    $(".bxQs", el).innerHTML = `Are <b>${q[0]}</b> and <b>${q[1]}</b> connected? <button class="btn small bxY" type="button">Yes</button> <button class="btn small bxN" type="button">No</button>`;
    el.querySelectorAll(".bxW .hole").forEach(h => h.classList.toggle("sel", h.dataset.h === q[0] || h.dataset.h === q[1]));
    const res = yes => { const ok = yes === truth; if (ok) score++; $(".bxQs", el).innerHTML = `${ok ? "✓ Right." : "✗ Not quite."} ${q[0]} and ${q[1]} are ${truth ? "" : "NOT "}connected. Score ${score}/${asked}.`; tap(q[0]); if (score >= 5) markAct("bbQuiz", "done"); };
    $(".bxY", el).onclick = () => res(true); $(".bxN", el).onclick = () => res(false); };
  draw();
};
/* ---- 2.2 build an LED circuit ---- */
INTERACTIVES.bbBuild = function(el){
  const comps = [{type:"led", a:"e12", k:"e13", color:"#D62828"}, {type:"res", p1:"b13", p2:"T-13", ohms:getBoard() === "uno" ? 470 : 220, label:getBoard() === "uno" ? "470 Ω" : "220 Ω"}];
  const terms = () => [{id:"PIN", x:-70, y:110, label:(b => b === "uno" ? "D" + pinK(b, "LED_PIN") : b === "s3" ? "GPIO" + pinK(b, "LED_PIN") : pinK(b, "LED_PIN"))(getBoard()), color:"#C8653A"}, {id:"GND", x:-70, y:200, label:"GND", color:"#222"}];
  let wires = [], pick = null;
  el.innerHTML = bench("Build: LED + resistor on a breadboard", `<p class="explain">The LED (long leg in e12) and the resistor (b13 to the top − rail) are already placed. Add the wires: tap a board pin on the left, then a hole. Tap a wire's end hole again to remove it.</p>
   <div class="bbwrap bbW"></div><div class="controls"><button class="btn primary bbChk" type="button">Check circuit</button><button class="btn bbClr" type="button">Clear wires</button></div><ul class="reslist bbOut"></ul>`);
  const draw = () => { $(".bbW", el).innerHTML = bbSVG({split:false, comps, terms:terms(), wires:wires.map(w => ({from:w[0] === "PIN" || w[0] === "GND" ? termXY(w[0]) : w[0], to:w[1], color:w[0] === "GND" ? "#222" : "#C8653A"}))});
    el.querySelectorAll(".bbW .hole").forEach(h => h.onclick = () => click(h.dataset.h)); if (pick){ const p = el.querySelector(`.bbW .hole[data-h="${pick}"]`); if (p) p.classList.add("sel"); } };
  const termXY = id => { const t = terms().find(x => x.id === id); return [t.x + 34, t.y]; };
  const click = id => { if (id === "PIN" || id === "GND"){ pick = id; draw(); return; }
    const ex = wires.findIndex(w => w[1] === id); if (ex >= 0 && !pick){ wires.splice(ex, 1); draw(); return; }
    if (!pick){ toast("Tap a board pin (PIN or GND) first."); return; } wires.push([pick, id]); pick = null; draw(); };
  $(".bbClr", el).onclick = () => { wires = []; pick = null; draw(); $(".bbOut", el).innerHTML = ""; };
  $(".bbChk", el).onclick = () => { const net = id => bbNet(id, false); const out = [];
    const pinW = wires.filter(w => w[0] === "PIN"), gndW = wires.filter(w => w[0] === "GND");
    const pinOk = pinW.some(w => net(w[1]) === net("e12")), gndOk = gndW.some(w => net(w[1]) === net("T-13"));
    const short = pinW.some(w => net(w[1]) === net("T-13")) || gndW.some(w => net(w[1]) === net("e12"));
    if (short) out.push(fail("Short circuit or wrong side!", "The board pin and GND would be connected without the LED in between. Unplug and rewire."));
    out.push(pinOk ? pass("The board pin reaches the LED's long leg (anode, column 12).") : fail("The board pin is not connected to the LED's long leg.", "Put the pin wire in column 12, rows a–e."));
    out.push(gndOk ? pass("GND reaches the top − rail, where the resistor ends.") : fail("GND is not connected to the resistor's rail.", "Connect GND to any hole in the top − rail."));
    out.push(pass("The LED's short leg (column 13) connects through the resistor (b13) to the − rail."));
    const ok = pinOk && gndOk && !short; $(".bbOut", el).innerHTML = out.map(c => `<li class="${c.ok ? "ok" : "no"}">${c.ok ? "✓" : "✗"} ${c.msg}${!c.ok && c.hint ? `<span class="explain">${c.hint}</span>` : ""}</li>`).join("") + (ok ? `<li class="ok"><b>Complete loop:</b> pin → LED → resistor → GND. Upload P1 and it will blink.</li>` : "");
    if (ok){ markAct("bbBuild", "pass"); confetti(); } };
  draw();
};
/* ---- 2.2 fault finder: six realistic faults, each drawn as a real breadboard ---- */
INTERACTIVES.faultFinder = function(el){
  const pinT = (y, lbl) => ({id:"PIN", x:-70, y, label:lbl, color:"#C8653A"}), gndT = y => ({id:"GND", x:-70, y, label:"GND", color:"#222"}), v3T = y => ({id:"V33", x:-70, y, label:"3V3", color:"#D62828"});
  const brd = (y, h, name) => ({block:[y, h, "#1a1d21", name]});
  const F = [
   {d:"The LED never lights. The program is right (it blinks on the virtual board) and every wire is pushed in firmly.",
    terms:[Object.assign(pinT(110, "GPIO15"), brd(70, 160, "ESP32-S3")), gndT(200)],
    comps:[{type:"led", a:"e13", k:"e12"}, {type:"res", p1:"a13", p2:"T-13", ohms:220, label:"220 Ω"}], wires:[{from:"PIN", to:"a12", color:"#C8653A"}, {from:"GND", to:"T-2", color:"#222"}],
    o:["The LED is in backwards: the pin feeds its short leg (−) and the resistor connects its long leg (+) to GND","The resistor should be 10 kΩ","The power rail is split","Column 12 is broken"], a:0, spot:["e12","e13"],
    x:"An LED only conducts from its long leg (+, anode) to its short leg (−, cathode, flat side). Here the board pin feeds column 12, where the <b>short</b> leg is. Turn the LED around so the long leg is in column 12."},
   {d:"The LED never lights, but a multimeter shows the pin switching between 0 V and 3.3 V on column 8.",
    terms:[Object.assign(pinT(110, "GPIO15"), brd(70, 160, "ESP32-S3")), gndT(200)],
    comps:[{type:"led", a:"c8", k:"d8"}, {type:"res", p1:"b8", p2:"T-8", ohms:220, label:"220 Ω"}], wires:[{from:"PIN", to:"a8", color:"#C8653A"}, {from:"GND", to:"T-2", color:"#222"}],
    o:["Both LED legs are in the same strip (column 8), so the LED is bypassed","The resistor value is too big","The LED is in backwards","Column 8 is broken"], a:0, spot:["c8","d8"],
    x:"Holes c8 and d8 share one metal clip, so both legs of the LED are connected together and current flows around it, straight through the resistor. Put the legs in two different columns, for example e8 and e9."},
   {d:"The LED never lights. The wiring looks almost exactly like the diagram.",
    terms:[Object.assign(pinT(110, "GPIO15"), brd(70, 160, "ESP32-S3")), gndT(200)],
    comps:[{type:"led", a:"e12", k:"e13"}, {type:"res", p1:"a13", p2:"T-13", ohms:220, label:"220 Ω"}], wires:[{from:"PIN", to:"a11", color:"#C8653A"}, {from:"GND", to:"T-2", color:"#222"}],
    o:["The pin wire is one column off: it is in column 11, the LED's long leg is in column 12","The LED is in backwards","The resistor is in the wrong place","The GND wire is in the wrong rail"], a:0, spot:["a11","e12"],
    x:"Off-by-one is the most common breadboard fault. Column 11 is not connected to column 12, so the pin reaches nothing. Move the wire to column 12 (any of a12–e12)."},
   {d:"Two identical LED circuits are powered from the top rails. The left LED lights; the right one does not.",
    terms:[Object.assign(v3T(90), brd(56, 150, "ESP32-S3")), gndT(160)], split:true,
    comps:[{type:"led", a:"e5", k:"e6", lit:true}, {type:"res", p1:"a6", p2:"T-6", ohms:220, label:"220 Ω"}, {type:"led", a:"e24", k:"e25"}, {type:"res", p1:"a25", p2:"T-25", ohms:220, label:"220 Ω"}],
    wires:[{from:"V33", to:"T+2", color:"#D62828"}, {from:"GND", to:"T-3", color:"#222"}, {from:"T+5", to:"a5", color:"#D62828"}, {from:"T+24", to:"a24", color:"#D62828"}],
    o:["The top rails are split in the middle (the dashed gap) and not bridged","The right LED is in backwards","Column 24 is broken","The board is in sleep mode"], a:0, spot:["T+15","T+16","T-15","T-16"],
    x:"On many full-size breadboards the rails stop in the middle. Power reaches only the left half. Add two short jumpers across the gap: T+15 to T+16 and T−15 to T−16."},
   {d:"The HC-SR04 has power, but the distance always reads 0 cm.",
    terms:[Object.assign({id:"V33", x:-70, y:70, label:"5V", color:"#D62828"}, brd(28, 196, "ESP32-S3")), {id:"GND", x:-70, y:110, label:"GND", color:"#222"}, {id:"TX", x:-70, y:150, label:"TRIG_PIN (out)", color:"#B08A1E"}, {id:"RX", x:-70, y:190, label:"ECHO_PIN (in)", color:"#B08A1E"}],
    comps:[{type:"module", pins:[["g20","VCC"],["g21","GND"],["g22","TRIG"],["g23","ECHO"]], label:"HC-SR04", color:"#1F6FB2", h:52}],
    wires:[{from:"V33", to:"f20", color:"#D62828"}, {from:"GND", to:"f21", color:"#222"}, {from:"TX", to:"f23", color:"#1F8A70"}, {from:"RX", to:"f22", color:"#2563EB"}],
    o:["The TRIG and ECHO wires are swapped: the board's output pin must go to TRIG, and ECHO must come back to an input pin","The baud rate is wrong","The sensor needs 12 V","The wires are too short"], a:0, spot:["f22","f23"],
    x:"The board sends the trigger pulse out and listens for the echo: output pin → TRIG, ECHO → input pin. Swap the two signal wires. (ECHO is a 5 V signal: on a 3.3 V board such as the ESP32 or ESP8266, use a divider.)"},
   {d:"The DHT module never answers: every reading is nan, and its little power LED stays off.",
    terms:[Object.assign(v3T(80), brd(46, 200, "ESP32-S3")), {id:"DATA", x:-70, y:130, label:"GPIO4", color:"#C8653A"}, gndT(190)],
    comps:[{type:"module", pins:[["g20","+"],["g21","OUT"],["g22","−"]], label:"DHT22 module", color:"#1d4ed8", h:52}],
    wires:[{from:"V33", to:"T+2", color:"#D62828"}, {from:"GND", to:"T-3", color:"#222"}, {from:"T+18", to:"f20", color:"#D62828"}, {from:"DATA", to:"f21", color:"#E8B84A"}, {from:"f22", to:"B-24", color:"#222"}],
    o:["The module's − goes to the BOTTOM − rail, which is not connected to the board's GND","The DHT needs 12 V","The data pin needs a 1 MΩ resistor","The module is in backwards"], a:0, spot:["B-24","T-3"],
    x:"The bottom − rail is a separate strip from the top − rail. The module's ground and the board's ground are not joined, so the data signal has no common reference. Add a jumper from the top − rail to the bottom − rail (or move the module's GND wire to the top − rail). Every part must share the board's GND."}];
  let i = 0; const done = new Set();
  el.innerHTML = bench("Find the fault", `<div class="controls ffNav"></div><p class="ffD"></p><div class="bbwrap ffW"></div><div class="choicecards ffO"></div><div class="ix-out ffX" hidden></div>`);
  const draw = (reveal) => { const f = F[i]; $(".ffNav", el).innerHTML = F.map((x, k) => `<button class="chip ${k === i ? "sel" : ""} ${done.has(k) ? "ok" : ""}" type="button" data-k="${k}">Case ${k + 1}${done.has(k) ? " ✓" : ""}</button>`).join("");
    el.querySelectorAll(".ffNav .chip").forEach(b => b.onclick = () => { i = +b.dataset.k; draw(); });
    $(".ffD", el).innerHTML = `<b>Case ${i + 1}:</b> ${f.d}`;
    const tXY = id => { const t = f.terms.find(x => x.id === id); return t ? [t.x + 34, t.y] : id; };
    $(".ffW", el).innerHTML = bbSVG({split:!!f.split, comps:f.comps, terms:f.terms, wires:f.wires.map(w => ({from:tXY(w.from), to:w.to, color:w.color})), spots:reveal ? f.spot : [], label:"Breadboard for case " + (i + 1)});
    if (!reveal){ $(".ffO", el).innerHTML = f.o.map((o, k) => `<button type="button" data-k="${k}">${esc(o)}</button>`).join(""); $(".ffX", el).hidden = true;
      el.querySelectorAll(".ffO button").forEach(b => b.onclick = () => { const k = +b.dataset.k, ok = k === f.a; b.classList.add(ok ? "ok" : "no"); if (ok){ done.add(i); draw(true); } $(".ffX", el).hidden = false; $(".ffX", el).innerHTML = (ok ? "<b>✓ Correct.</b> " : "<b>✗ Not this one.</b> Look again at the picture. ") + (ok ? f.x : ""); if (done.size === F.length) markAct("faultFinder", "done"); }); } };
  draw();
};
/* ---- 2.2 wiring audit rubric ---- */
INTERACTIVES.wiringAudit = function(el){
  const C = [["Power and ground","Every part's GND connects to the board's GND; 5 V parts use 5 V and 3.3 V parts use 3.3 V."],["Logic levels","5 V signals into 3.3 V boards go through dividers or level shifters."],["Placement","Chips straddle the channel; no part has two legs in the same strip by mistake."],["Rails","Split rails are bridged where needed; rails are labeled (5 V / 3.3 V)."],["Color code","Red = power, black = GND, other colors for signals, used consistently."],["Neatness","Short, flat wires; nothing loops over chips; nothing loose."],["Modularity","Each sensor and its resistors sit together near their pins."],["Documentation","A wiring table and a top-down photo match the real circuit."]];
  const K = "sss_audit_" + (user ? user.email : "g"); const S = store.get(K, {});
  el.innerHTML = bench("Wiring audit rubric (0–2 per row, 16 points)", `<table class="t"><tr><th>Criterion</th><th>Looks for</th><th>Score</th><th>Comment</th></tr>${C.map((c, i) => `<tr><td><b>${c[0]}</b></td><td>${c[1]}</td><td><select class="dinput waS" data-i="${i}"><option value="">–</option><option value="0">0 missing</option><option value="1">1 partly</option><option value="2">2 fully</option></select></td><td><input class="dinput waC" data-i="${i}" placeholder="evidence"></td></tr>`).join("")}</table>
   <div class="ix-out"><b class="waT">Total: 0 / 16</b> <span class="explain waN"></span></div><div class="controls"><button class="btn small waCopy" type="button">Copy audit as text</button></div>`);
  el.querySelectorAll(".waS").forEach(s => s.value = (S[s.dataset.i] || [])[0] || ""); el.querySelectorAll(".waC").forEach(s => s.value = (S[s.dataset.i] || [])[1] || "");
  const upd = () => { el.querySelectorAll(".waS").forEach(s => S[s.dataset.i] = [s.value, el.querySelector(`.waC[data-i="${s.dataset.i}"]`).value]); store.set(K, S);
    const sc = C.reduce((t, c, i) => t + (+((S[i] || [])[0] || 0)), 0), n = C.filter((c, i) => (S[i] || [])[0] !== "" && (S[i] || [])[0] != null).length; $(".waT", el).textContent = `Total: ${sc} / 16`; $(".waN", el).textContent = n < C.length ? `${C.length - n} rows not scored yet.` : sc >= 12 ? "Ready to power up." : "Fix the rows scored 0 or 1 before powering up."; if (n === C.length) markAct("wiringAudit", String(sc)); };
  el.querySelectorAll("select, input").forEach(x => x.oninput = x.onchange = upd);
  $(".waCopy", el).onclick = () => copyText(C.map((c, i) => `${c[0]}: ${(S[i] || [])[0] || "-"}/2 ${(S[i] || [])[1] || ""}`).join("\n") + "\n" + $(".waT", el).textContent);
  upd();
};
/* ---- 2.3 DHT single-wire protocol ---- */
INTERACTIVES.dhtProtocol = function(el){
  let T = 29.4, Hh = 68.2;
  el.innerHTML = bench("Inside a DHT22 transmission", `<div class="controls"><label>Temperature <input type="range" class="dpT" min="-10" max="45" step="0.1" value="29.4"></label><span class="rangeval dpTv"></span><label>Humidity <input type="range" class="dpH" min="0" max="100" step="0.1" value="68.2"></label><span class="rangeval dpHv"></span></div>
   <canvas class="mini-chart dpC" style="height:120px" aria-label="Pulse train on the DATA wire"></canvas><div class="dpBits mono" style="font-size:.78rem;word-break:break-all;margin:8px 0"></div><div class="ix-out dpOut"></div>`);
  const bits = () => { const h = Math.round(Hh * 10), t = Math.round(Math.abs(T) * 10) | (T < 0 ? 0x8000 : 0); const bytes = [h >> 8, h & 255, t >> 8, t & 255]; const cs = (bytes[0] + bytes[1] + bytes[2] + bytes[3]) & 255; return {bytes, cs, str:bytes.concat([cs]).map(b => b.toString(2).padStart(8, "0"))}; };
  const draw = () => { T = +$(".dpT", el).value; Hh = +$(".dpH", el).value; $(".dpTv", el).textContent = T.toFixed(1) + " °C"; $(".dpHv", el).textContent = Hh.toFixed(1) + " %";
    const b = bits(), all = b.str.join(""); const cv = $(".dpC", el), {g, W, H} = hiDPI(cv); g.clearRect(0, 0, W, H);
    const seq = [[0, 1.0], [1, .03], [0, .08], [1, .08]]; all.split("").forEach(x => { seq.push([0, .05]); seq.push([1, x === "1" ? .07 : .027]); }); seq.push([0, .05], [1, .2]);
    const tot = seq.reduce((s, x) => s + x[1], 0); let x = 0; g.strokeStyle = cssv("--teal") || "#1F8A70"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 20);
    seq.forEach(([v, d], k) => { const y = v ? 20 : H - 24, nx = x + d / tot * W; g.lineTo(x, y); g.lineTo(nx, y); x = nx; }); g.stroke();
    g.fillStyle = cssv("--muted") || "#53665D"; g.font = "10px sans-serif"; g.fillText("start: board pulls LOW ≥ 1 ms", 4, H - 6); g.fillText("40 data bits (short HIGH = 0, long HIGH = 1)", W * .45, H - 6);
    $(".dpBits", el).innerHTML = b.str.map((s, i) => `<span style="color:${["#2563EB","#2563EB","#C8653A","#C8653A","#7C3AED"][i]}">${s}</span>`).join(" ");
    $(".dpOut", el).innerHTML = `<span style="color:#2563EB"><b>Humidity</b> 16 bits = ${b.bytes[0] * 256 + b.bytes[1]} → ÷ 10 = ${Hh.toFixed(1)} %</span><br><span style="color:#C8653A"><b>Temperature</b> 16 bits = ${b.bytes[2] * 256 + b.bytes[3]}${T < 0 ? " (top bit = negative)" : ""} → ÷ 10 = ${T.toFixed(1)} °C</span><br><span style="color:#7C3AED"><b>Checksum</b> = (${b.bytes.join(" + ")}) mod 256 = ${b.cs}. If it does not match, the library reports a failed read (nan).</span>`;
    markAct("dhtProtocol", "used"); };
  el.querySelectorAll("input").forEach(x => x.oninput = draw); draw();
};
/* ---- 2.6 pin planner ---- */
INTERACTIVES.pinPlanner = function(el){
  const K = "sss_plan_" + (user ? user.email : "g"), S = store.get(K, {board:getBoard(), sensors:["dht","ldr","led"]});
  el.innerHTML = bench("Pin planner and power budget", `<div class="controls"><label>Board <select class="dinput ppB">${Object.values(BOARDS).map(b => `<option value="${b.key}">${esc(b.name)}</option>`).join("")}</select></label></div>
   <div class="choicecards ppS">${Object.keys(SENSOR_INFO).map(k => `<button type="button" data-k="${k}"><b>${esc(SENSOR_INFO[k].name)}</b><small>${esc(SENSOR_INFO[k].what)} • ${SENSOR_INFO[k].mA} mA</small></button>`).join("")}</div>
   <div class="ppWarn"></div><div class="adm-tablewrap ppT"></div><div class="ix-out ppP"></div>
   <div class="controls"><button class="btn small ppCopy" type="button">Copy pin plan</button><button class="btn small ppDl" type="button">Download as .csv</button></div>`);
  $(".ppB", el).value = S.board;
  const draw = () => { const b = $(".ppB", el).value; S.board = b; store.set(K, S);
    el.querySelectorAll(".ppS button").forEach(x => x.classList.toggle("sel", S.sensors.includes(x.dataset.k)));
    const used = {}, warn = [];
    S.sensors.forEach(s => { const p = PIN_PLAN[s][b]; p.uses.forEach(u => { const key = u.replace(/ .*/, ""); if (used[key] && !(p.i2c && PIN_PLAN[used[key]][b].i2c)) warn.push(`<b>${esc(SENSOR_INFO[s].short)}</b> and <b>${esc(SENSOR_INFO[used[key]].short)}</b> both need <b>${esc(key)}</b>.`); else used[key] = s; }); });
    if (b === "esp8266" && S.sensors.includes("ldr") && S.sensors.includes("mq")) warn.push("The ESP8266 has only one analog input (A0): choose the LDR <b>or</b> the MQ-135 (or add an external ADC).");
    $(".ppWarn", el).innerHTML = warn.length ? `<div class="callout mis"><b>Conflicts and cautions</b><ul>${[...new Set(warn)].map(w => `<li>${w}</li>`).join("")}</ul></div>` : `<div class="callout ex"><b>No pin conflicts.</b> This plan uses the course's standard pins.</div>`;
    $(".ppT", el).innerHTML = S.sensors.length ? `<table class="t"><tr><th>Part</th><th>Part pin</th><th>${esc(BOARDS[b].short)} pin</th><th>Note</th></tr>${S.sensors.map(s => PIN_PLAN[s][b].con.filter(c => c[2]).map((c, i) => `<tr><td>${i ? "" : `<b>${esc(SENSOR_INFO[s].short)}</b>`}</td><td>${esc(c[0])}</td><td>${esc(c[1])}</td><td>${esc(c[3])}</td></tr>`).join("")).join("")}</table>` : "";
    const sensorsMA = S.sensors.reduce((t, s) => t + SENSOR_INFO[s].mA, 0), peak = S.sensors.reduce((t, s) => t + (SENSOR_INFO[s].peak || SENSOR_INFO[s].mA), 0), bd = BOARD_mA[b], total = sensorsMA + bd.avg, tpk = peak + bd.peak;
    $(".ppP", el).innerHTML = `<b>Power budget (typical)</b><div class="kv"><span>Board with Wi-Fi (average / peaks)</span><b>${bd.avg} / ${bd.peak} mA</b><span>Sensors and outputs</span><b>${sensorsMA.toFixed(0)} mA</b><span>Total average / peak</span><b>${total.toFixed(0)} / ${tpk.toFixed(0)} mA</b></div><div class="scorebar"><i style="width:${Math.min(100, tpk / 5)}%;background:${tpk > 500 ? "var(--bad)" : tpk > 350 ? "var(--signal)" : "var(--teal)"}"></i></div><p class="explain">${tpk > 500 ? "Peaks above 500 mA: use a 5 V, 1 A (or more) charger, not a computer USB port." : tpk > 350 ? "Close to the 500 mA USB limit during Wi-Fi bursts: use a good cable; a charger is safer." : "Fine on a computer USB port."} Values are approximate.</p>`;
    if (S.sensors.length >= 2 && !warn.some(w => /both need|only one analog/.test(w))) markAct("pinPlanner", "done"); };
  el.querySelectorAll(".ppS button").forEach(x => x.onclick = () => { const k = x.dataset.k; S.sensors = S.sensors.includes(k) ? S.sensors.filter(s => s !== k) : S.sensors.concat([k]); draw(); });
  $(".ppB", el).onchange = draw;
  const rows = () => { const b = $(".ppB", el).value; return [["part","part_pin","board_pin","note"]].concat(...S.sensors.map(s => PIN_PLAN[s][b].con.filter(c => c[2]).map(c => [SENSOR_INFO[s].short, c[0], c[1], c[3]]))); };
  $(".ppCopy", el).onclick = () => copyText(rows().map(r => r.join("\t")).join("\n"));
  $(".ppDl", el).onclick = () => downloadText("pin_plan.csv", rows().map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n"), "text/csv");
  draw();
};
