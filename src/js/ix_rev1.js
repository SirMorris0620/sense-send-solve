/* ============ REVISION 2, PART 1: Unit 1 electronics visuals ============ */
const fmtOhm = r => r >= 1e6 ? +(r / 1e6).toFixed(2) + " MΩ" : r >= 1000 ? +(r / 1000).toFixed(r >= 10000 ? 0 : 2) + " kΩ" : Math.round(r) + " Ω";
const fmtV = v => (+v.toFixed(2)) + " V";
const clampN = (x, a, b) => Math.max(a, Math.min(b, x));
/* a point t pixels along a polyline */
function alongPath(pts, t){ const seg = []; let tot = 0; for (let i = 0; i < pts.length - 1; i++){ const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(d); tot += d; }
  t = ((t % tot) + tot) % tot; for (let i = 0; i < seg.length; i++){ if (t <= seg[i]){ const f = t / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } t -= seg[i]; } return pts[0]; }
function pathLen(pts){ let s = 0; for (let i = 0; i < pts.length - 1; i++) s += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); return s; }
/* run a requestAnimationFrame loop that stops when the element leaves the page */
function aLoop(el, fn){ if (reduceMotion()){ fn(0); return; } let last = performance.now(), raf; const f = now => { if (!alive(el)) return; fn(Math.min(50, now - last)); last = now; raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); }

/* ---------- 1.2 LED resistor calculator, visual ---------- */
INTERACTIVES.ledCalc = function(el){
  const E12 = [10,12,15,18,22,27,33,39,47,56,68,82], std = r => { for (let d = 1; d <= 100000; d *= 10) for (const v of E12) if (v * d >= r - 1e-9) return v * d; return r; };
  const LEDS = {red:[2.0,"#E11D48"], yellow:[2.1,"#EAB308"], green:[2.2,"#16A34A"], blue:[3.1,"#2563EB"], white:[3.1,"#E5E7EB"]};
  const STD = [47,100,150,220,330,470,680,1000,2200,4700];
  el.innerHTML = bench("LED resistor calculator: see the current", `<div class="controls"><label>Supply <select class="dinput lcS"><option value="3.3">3.3 V pin (ESP32-S3, ESP8266)</option><option value="5">5 V pin (Uno R4 WiFi)</option></select></label>
   <label>LED colour <select class="dinput lcC">${Object.keys(LEDS).map(k => `<option>${k}</option>`).join("")}</select></label>
   <label>Current you want <select class="dinput lcI"><option value="0.005">5 mA (dim)</option><option value="0.01" selected>10 mA (good)</option><option value="0.02">20 mA (bright, the limit of most 5 mm LEDs)</option></select></label>
   <label>Resistor <select class="dinput lcR"><option value="auto">Recommended (calculated)</option>${STD.map(r => `<option value="${r}">${fmtOhm(r)}</option>`).join("")}</select></label></div>
   <p class="explain">Try the <b>Resistor</b> menu: pick a very small one and watch the electrons rush and the LED struggle; pick a big one and watch the LED fade.</p>
   <div class="ix-grid2"><div>
    <svg class="flowsvg lcCirc" viewBox="0 0 440 215" role="img" aria-label="LED circuit with moving electrons: pin, resistor, LED, ground"></svg>
    <p class="explain"><b>Brightness meter</b> (current through the LED)</p><div class="meter"><i class="lcMk"></i></div><div class="meter-l"><span>dim</span><span>good</span><span>very bright: too much</span></div>
   </div><div><svg class="flowsvg lcStair" viewBox="0 0 440 215" role="img" aria-label="The supply voltage is shared: part used by the resistor, part by the LED"></svg></div></div>
   <ol class="stepcards lcSteps"></ol><div class="ix-out lcWarn"></div>
   <p class="explain">Typical forward voltages for illustration. Check your LED's datasheet: “blue” and “white” vary from about 2.8 to 3.4 V.</p>`);
  const loop = [[40, 60], [400, 60], [400, 170], [40, 170]], L = pathLen(loop); let shift = 0, speed = 0; const S = {};
  const dots = () => { const n = 14; let h = ""; for (let i = 0; i < n; i++){ const p = alongPath(loop, shift + i * L / n); h += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.2" fill="#2563EB" stroke="#fff" stroke-width="1"/>`; } return h; };
  const draw = () => { const Vs = +$(".lcS", el).value, c = $(".lcC", el).value, Iw = +$(".lcI", el).value, Vf = LEDS[c][0], col = LEDS[c][1], pick = $(".lcR", el).value;
    const notEnough = Vf >= Vs - 0.05; let R = 0, Rs = 0, Rused = 0, I = 0, P = 0;
    if (!notEnough){ R = (Vs - Vf) / Iw; Rs = std(R); Rused = pick === "auto" ? Rs : +pick; I = (Vs - Vf) / Rused; P = (Vs - Vf) * I; }
    S.I = I; S.col = col; S.Rused = Rused; S.Vs = Vs; S.Vf = Vf; S.dead = !notEnough && I > 0.035; S.notEnough = notEnough;
    $(".lcMk", el).style.left = clampN(I / 0.03 * 100, 0, 99) + "%";
    const bands = Rused ? resBands(Rused) : ["#999", "#999", "#999"];
    const glow = notEnough ? 0.05 : clampN(I / 0.02, 0.04, 1.3);
    $(".lcStair", el).innerHTML = (() => { const H = 150, y0 = 30, hr = notEnough ? 0 : (Vs - Vf) / Vs * H, hl = H - hr;
      return `<text x="70" y="20" class="svgtxt b">${Vs} V pin</text><rect x="70" y="${y0}" width="70" height="${hr}" fill="#F97316" stroke="#7C2D12"/><rect x="70" y="${y0 + hr}" width="70" height="${hl}" fill="${col}" stroke="#1E1B4B"/>
       <text x="154" y="${y0 + hr / 2 - 2}" class="svgtxt b" fill="#C2410C">resistor</text><text x="154" y="${y0 + hr / 2 + 14}" class="svgtxt">uses up ${notEnough ? "?" : fmtV(Vs - Vf)}</text>
       <text x="154" y="${y0 + hr + hl / 2 - 2}" class="svgtxt b">LED</text><text x="154" y="${y0 + hr + hl / 2 + 14}" class="svgtxt">needs ${Vf} V</text>
       <path d="M58 ${y0} V${y0 + H}" stroke="var(--ink)" stroke-width="2"/><text x="70" y="${y0 + H + 16}" class="svgtxt">GND (0 V)</text>
       <text x="154" y="${y0 + H + 16}" class="svgtxt mute">The supply voltage is shared out.</text>`; })();
    $(".lcCirc", el).innerHTML = `<path d="M40 60 H112 M208 60 H266 M310 60 H400 V170 H40" stroke="var(--ink)" stroke-width="3" fill="none" stroke-linejoin="round"/>
      <circle cx="40" cy="60" r="9" fill="#C2410C"/><text x="26" y="42" class="svgtxt b">${Vs} V pin</text><path d="M28 176 H52 M33 183 H47 M38 190 H42" stroke="var(--ink)" stroke-width="2.4"/><text x="12" y="206" class="svgtxt b">GND</text>
      <rect x="112" y="46" width="96" height="28" rx="12" fill="${S.dead ? "#7f1d1d" : "#E8D8B0"}" stroke="#7C5E24" stroke-width="2"/>${bands.map((b, i) => `<rect x="${132 + i * 16}" y="46" width="7" height="28" fill="${b}"/>`).join("")}<rect x="184" y="46" width="6" height="28" fill="#C8A200"/>
      <text x="160" y="36" text-anchor="middle" class="svgtxt b">${notEnough ? "?" : fmtOhm(Rused)}</text>
      <g class="lcLedG">${glow > 0.05 && !S.dead ? `<circle cx="288" cy="60" r="${22 + glow * 24}" fill="${col}" opacity="${Math.min(.5, glow * .35)}"/><circle cx="288" cy="60" r="${16 + glow * 12}" fill="${col}" opacity="${Math.min(.55, glow * .4)}"/>` : ""}
        <path d="M266 38 V82 L306 60 Z" fill="${S.dead ? "#374151" : col}" opacity="${S.dead ? 1 : .35 + Math.min(.65, glow * .65)}" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/><path d="M310 38 V82" stroke="var(--ink)" stroke-width="4"/>
        ${S.dead ? `<path d="M270 40 L306 82 M306 40 L270 82" stroke="#DC2626" stroke-width="4"/><circle cx="288" cy="22" r="7" fill="#9CA3AF" opacity=".7"/><circle cx="300" cy="10" r="5" fill="#9CA3AF" opacity=".5"/>` : `<path d="M300 34 l12 -12 m-4 0 h4 v4 M312 44 l12 -12 m-4 0 h4 v4" stroke="${col}" stroke-width="2.4" fill="none" opacity="${Math.min(1, glow)}"/>`}</g>
      <text x="288" y="104" text-anchor="middle" class="svgtxt b">${S.dead ? "burnt out" : "LED (" + c + ")"}</text>
      <g class="lcDots">${dots()}</g><text x="220" y="145" text-anchor="middle" class="svgtxt" fill="#2563EB">● electrons flow around the loop${I ? ": " + (I * 1000).toFixed(1) + " mA" : ""}</text>`;
    const nfmt = x => +x.toFixed(x < 10 ? 2 : 1);
    $(".lcSteps", el).innerHTML = notEnough ? `<li><div><b>This LED needs about ${Vf} V, almost all of the ${Vs} V supply.</b> There is no spare voltage for a resistor, so it may be dim or stay dark. Use a different colour, or switch it with a transistor from a higher supply.</div></li>` : [
      `<div><b>Step 1: how much voltage must the resistor soak up?</b><div class="bigcalc"><span class="c1">${Vs} V</span> (supply) − <span class="c2">${Vf} V</span> (LED) = <span class="c3">${nfmt(Vs - Vf)} V</span></div></div>`,
      `<div><b>Step 2: choose the current</b><div class="bigcalc">${Iw * 1000} mA = <span class="c2">${Iw} A</span></div><span class="explain">1 mA is one thousandth of an amp, so divide by 1000.</span></div>`,
      `<div><b>Step 3: Ohm's law, R = V ÷ I</b><div class="bigcalc"><span class="c3">${nfmt(Vs - Vf)}</span> ÷ <span class="c2">${Iw}</span> = <span class="c1">${Math.round(R)} Ω</span></div></div>`,
      `<div><b>Step 4: round UP to a resistor you can buy</b><div class="bigcalc">${Math.round(R)} Ω → <span class="c1">${fmtOhm(Rs)}</span></div><span class="explain">Resistors come in standard sizes (the E12 series). Rounding up is the safe direction: slightly dimmer, never burnt.</span></div>`,
      `<div><b>Step 5: check the real current with ${pick === "auto" ? "that" : "your"} resistor (${fmtOhm(Rused)})</b><div class="bigcalc"><span class="c3">${nfmt(Vs - Vf)}</span> ÷ ${Rused} = <span class="c1">${(I * 1000).toFixed(1)} mA</span> · heat in resistor ${(P * 1000).toFixed(0)} mW</div><span class="explain">${I > 0.02 ? "More than 20 mA: too much." : I < 0.003 ? "Under 3 mA: very dim." : "In the good range."}</span></div>`
    ].map(h => `<li>${h}</li>`).join("");
    const lim = Vs === 5 ? 0.008 : 0.012;
    $(".lcWarn", el).innerHTML = notEnough ? "" : S.dead ? `<p class="err"><b>The LED would burn out.</b> ${(I * 1000).toFixed(0)} mA is far above the 20 mA limit. A resistor that is too small does not limit the current. Choose a bigger one.</p>` : I > lim ? `<p class="err"><b>${Vs === 5 ? "Too much for an Uno R4 WiFi pin." : "High for a GPIO pin."}</b> ${Vs === 5 ? `The RA4M1's pins are rated about 8 mA each (Arduino, n.d.). Choose 5 mA, or use at least 470 Ω, as this course does. For more current, switch the LED with a transistor.` : `Keep each pin well under its limit (ESP8266 pins: about 12 mA). 10 mA or less is a safe choice.`}</p>` : `<p class="explain">✓ This is a safe current for the pin and the LED.</p>`;
    speed = S.dead ? 0 : I * 6000;
    markAct("ledCalc", "used"); };
  el.querySelectorAll("select").forEach(x => x.onchange = draw); draw();
  aLoop(el, dt => { shift += speed * dt / 1000; const g = $(".lcDots", el); if (g) g.innerHTML = dots(); });
};

/* ---------- 1.2 voltage divider lab, visual ---------- */
INTERACTIVES.dividerLab = function(el){
  const PRE = {echo:[5,1000,2000,"HC-SR04 ECHO → 3.3 V pin"], mq:[5,10000,15000,"MQ-135 AO (max) → 3.3 V pin"], ldr:[3.3,10000,10000,"LDR divider (R1 = LDR)"], custom:[5,4700,4700,"Custom: you choose"]};
  el.innerHTML = bench("Voltage divider lab: two resistors share the voltage", `<div class="controls"><label>Start from <select class="dinput dvP">${Object.keys(PRE).map(k => `<option value="${k}">${PRE[k][3]}</option>`).join("")}</select></label><button class="btn small dvFix" type="button">Find R2 for 3.3 V out</button></div>
   <div class="ix-grid2"><div>
    <div class="controls"><label>V<sub>in</sub> <input type="range" class="dvV" min="1" max="5" step="0.1"></label><span class="rangeval dvVv"></span></div>
    <div class="controls dvR1c"><label>R1 (top) <input type="range" class="dvR1" min="100" max="100000" step="100"></label><span class="rangeval dvR1v"></span></div>
    <div class="controls dvLight" hidden><label>Light on the LDR <input type="range" class="dvL" min="0" max="100" value="50"></label><span class="rangeval dvLv"></span></div>
    <div class="controls"><label>R2 (bottom) <input type="range" class="dvR2" min="100" max="100000" step="100"></label><span class="rangeval dvR2v"></span></div>
    <p class="explain"><b>The share rule:</b> each resistor takes a share of the voltage equal to its share of the total resistance.</p>
    <div class="vsplit dvSplit"></div><div class="meter-l"><span>R1 takes</span><span>R2 takes (this is V<sub>out</sub>)</span></div>
    <div class="ix-out"><div class="bigcalc dvCalc"></div><p class="explain dvN"></p></div></div>
    <svg class="flowsvg dvSvg" viewBox="0 0 340 270" role="img" aria-label="Voltage divider with moving current, and a gauge comparing the output to the 3.3 V limit"></svg></div>`);
  let shift = 0, speed = 0; const path = [[80, 24], [80, 246]]; const fmtR = fmtOhm;
  const set = k => { const p = PRE[k]; $(".dvV", el).value = p[0]; $(".dvR1", el).value = p[1]; $(".dvR2", el).value = p[2]; $(".dvLight", el).hidden = k !== "ldr"; $(".dvR1c", el).hidden = k === "ldr"; draw(); };
  const r1 = () => { const k = $(".dvP", el).value; if (k === "ldr"){ const L = +$(".dvL", el).value; return Math.round(1000000 * Math.pow(10, -L / 100 * 2.2)); } return +$(".dvR1", el).value; };
  const draw = () => { const k = $(".dvP", el).value, V = +$(".dvV", el).value, R2 = +$(".dvR2", el).value, R1 = r1(), tot = R1 + R2, out = V * R2 / tot, I = V / tot, p1 = R1 / tot * 100;
    if (k === "ldr") $(".dvLv", el).textContent = $(".dvL", el).value + " % → LDR " + fmtR(R1);
    $(".dvVv", el).textContent = V.toFixed(1) + " V"; $(".dvR1v", el).textContent = fmtR(R1); $(".dvR2v", el).textContent = fmtR(R2);
    $(".dvSplit", el).innerHTML = `<span style="width:${p1}%;background:#EA580C">${p1 > 14 ? Math.round(p1) + "%" : ""}</span><span style="width:${100 - p1}%;background:#4F46E5">${100 - p1 > 14 ? Math.round(100 - p1) + "%" : ""}</span>`;
    const warn = out > 3.45 && out <= 3.6;
    $(".dvCalc", el).innerHTML = `V<sub>out</sub> = <span class="c3">${V.toFixed(1)}</span> × <span class="c2">${fmtR(R2)}</span> ÷ (<span class="c1">${fmtR(R1)}</span> + <span class="c2">${fmtR(R2)}</span>) = <b>${out.toFixed(2)} V</b>`;
    $(".dvN", el).innerHTML = `R2 is ${(100 - p1).toFixed(0)} % of the total resistance, so it gets ${(100 - p1).toFixed(0)} % of ${V.toFixed(1)} V. ` + (out > 3.6 ? `<span style="color:var(--bad)"><b>Too high for a 3.3 V pin: it could damage the board.</b></span>` : warn ? "Above 3.45 V: most 3.3 V inputs survive it (absolute maximum about 3.6 V), but there is little safety margin." : out > 3.3 ? "About 3.3 V (a few percent over is normal for standard resistor values): <b>safe for a 3.3 V pin</b>." : "Safe for a 3.3 V pin.") + ` Current flowing: ${(I * 1000).toFixed(2)} mA.`;
    const H = 222, y0 = 24, h1 = clampN(H * R1 / tot, 26, H - 26), h2 = H - h1, node = y0 + h1, gy = v => y0 + H - v / 5.6 * H;
    const col = out > 3.6 ? "#DC2626" : warn ? "#D97706" : "#16A34A";
    $(".dvSvg", el).innerHTML = `<text x="80" y="14" text-anchor="middle" class="svgtxt b">V<tspan font-size="9" dy="3">in</tspan><tspan dy="-3"> ${V.toFixed(1)} V</tspan></text>
      <path d="M80 ${y0} V${y0 + 4}" stroke="var(--ink)" stroke-width="3"/><rect x="58" y="${y0 + 4}" width="44" height="${h1 - 4}" rx="6" fill="#FDBA74" stroke="#7C2D12" stroke-width="2"/><rect x="58" y="${node}" width="44" height="${h2 - 4}" rx="6" fill="#C7D2FE" stroke="#312E81" stroke-width="2"/>
      <path d="M80 ${y0 + H - 4} V${y0 + H + 6} M66 ${y0 + H + 6} H94 M71 ${y0 + H + 12} H89 M76 ${y0 + H + 18} H84" stroke="var(--ink)" stroke-width="2.6"/>
      <text x="52" y="${y0 + 4 + (h1 - 4) / 2 + 4}" text-anchor="end" class="svgtxt b" fill="#C2410C">R1 ${fmtR(R1)}</text><text x="52" y="${node + (h2 - 4) / 2 + 4}" text-anchor="end" class="svgtxt b" fill="#4338CA">R2 ${fmtR(R2)}</text>
      <circle cx="80" cy="${node}" r="6" fill="#C2410C" stroke="#fff" stroke-width="1.5"/><path d="M86 ${node} H150" stroke="#C2410C" stroke-width="3"/>
      <rect x="150" y="${node - 18}" width="62" height="36" rx="6" fill="#1a1d21"/><text x="181" y="${node - 3}" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">3.3 V</text><text x="181" y="${node + 11}" text-anchor="middle" fill="#fff" font-size="10">input pin</text>
      <text x="181" y="${node + 34}" text-anchor="middle" font-size="12" font-weight="800" fill="${col}">${out > 3.6 ? "✗ too high" : warn ? "! marginal" : "✓ safe"}</text>
      <g transform="translate(228 0)"><rect x="0" y="${y0}" width="26" height="${H}" rx="5" fill="var(--bg)" stroke="var(--line)"/><rect x="0" y="${gy(out)}" width="26" height="${y0 + H - gy(out)}" rx="5" fill="${col}"/>
        <path d="M-6 ${gy(3.3)} H32" stroke="#16A34A" stroke-width="2" stroke-dasharray="4 3"/><text x="34" y="${gy(3.3) + 12}" class="svgtxt" fill="#15803D">3.3 V</text>
        <path d="M-6 ${gy(3.6)} H32" stroke="#DC2626" stroke-width="2" stroke-dasharray="4 3"/><text x="34" y="${gy(3.6) - 3}" class="svgtxt" fill="#B91C1C">3.6 V = limit</text>
        <text x="13" y="${y0 + H + 16}" text-anchor="middle" class="svgtxt">V<tspan font-size="9" dy="3">out</tspan></text><text x="13" y="${y0 - 8}" text-anchor="middle" class="svgtxt b" fill="${col}">${out.toFixed(2)} V</text></g>
      <g class="dvDots"></g>`;
    speed = I * 90000; if (k !== "custom") markAct("dividerLab", "used"); };
  const dotsHTML = () => { let h = ""; for (let i = 0; i < 9; i++){ const q = alongPath(path, shift + i * 222 / 9); h += `<circle cx="${q[0]}" cy="${q[1]}" r="3.4" fill="#2563EB" stroke="#fff"/>`; } return h; };
  $(".dvP", el).onchange = e => set(e.target.value); el.querySelectorAll("input").forEach(x => x.oninput = draw);
  $(".dvFix", el).onclick = () => { const V = +$(".dvV", el).value, R1 = r1(); const R2 = V <= 3.3 ? 100000 : R1 * 3.3 / (V - 3.3); $(".dvR2", el).value = clampN(Math.round(R2 / 100) * 100, 100, 100000); draw(); };
  set("echo");
  aLoop(el, dt => { shift += Math.min(speed, 400) * dt / 1000; const g = $(".dvDots", el); if (g) g.innerHTML = dotsHTML(); });
};

/* ---------- 1.3 breadboard explorer: strips, rails, split rails ---------- */
function bbStripRect(id, split){ const X = c => bbXY("a" + c)[0]; const m = id.match(/^([TB])([+-])(\d+)$/);
  if (m){ const y = bbXY(id)[1], c = +m[3], l = split ? (c <= 15 ? 1 : 16) : 1, r = split ? (c <= 15 ? 15 : 30) : 30; return {x:X(l) - 9, y:y - 9, w:X(r) - X(l) + 18, h:18}; }
  const x = bbXY(id)[0], top = BB.rows.indexOf(id[0]) < 5; return {x:x - 9, y:top ? 57 : 167, w:18, h:94}; }
INTERACTIVES.bbExplore = function(el){
  let tab = 0, split = false, powered = false, bridged = false, quiz = null, score = 0, asked = 0, sel = null;
  const QS = [["a5","e5",true],["e5","f5",false],["c7","c8",false],["T+3","T+20",null],["g12","j12",true],["T-2","T-14",true],["b20","h20",false],["B+16","B+29",true]];
  const INTRO = ["Under the plastic, each short row of five holes shares one metal clip. <b>Tap any hole</b> and the clip lights up: everything in that yellow bar is connected. Notice that the two halves (a–e and f–j) are <b>not</b> joined.",
    "The long strips along the edges are <b>power rails</b>: red + for power and blue − for ground. They run the whole length. Press <b>Power on</b> to feed the top rails and see every hole along the rail receive it.",
    "Some bigger breadboards <b>break the rails in the middle</b> (see the orange dashed break). Power wired to the left half does not reach the right half. Try it: power on, then see which LED lights, then add the two jumpers."];
  el.innerHTML = bench("Virtual breadboard: what is connected?", `<div class="seg seg-sm bxT">${["1. Rows","2. Power rails","3. Split rails"].map((t, i) => `<button type="button" data-t="${i}" aria-selected="${i === 0}">${t}</button>`).join("")}</div>
   <p class="bxIntro"></p><div class="controls bxCtl"></div>
   <div class="bbwrap"><div class="bxW" style="min-width:620px"></div></div><div class="ix-out bxOut" aria-live="polite">Tap any hole.</div>
   <div class="controls"><button class="btn primary bxQ" type="button">Quiz me: are these two holes connected?</button><span class="bxQs explain"></span></div>`);
  const jump = [{from:"T+15", to:"T+16", color:"#DC2626"}, {from:"T-15", to:"T-16", color:"#1D4ED8"}];
  const feed = [{from:"T+3", to:[-30, 18], color:"#DC2626"}, {from:"T-3", to:[-30, 36], color:"#1D4ED8"}];
  const scene = () => { const comps = tab === 2 ? [{type:"led", a:"e24", k:"e25", color:"#E11D48", lit:powered && bridged}, {type:"res", p1:"a25", p2:"T-25", ohms:220, label:"220 Ω"}] : [];
    const wires = []; if (tab === 2){ wires.push({from:"T+24", to:"a24", color:"#DC2626"}); if (powered) wires.push(...feed); if (bridged) wires.push(...jump); } else if (tab === 1 && powered) wires.push(...feed);
    return {comps, wires}; };
  const energy = id => { const m = id.match(/^([TB])([+-])(\d+)$/); if (!m || m[1] !== "T" || !powered) return ""; if (tab === 2 && split && !bridged && +m[3] > 15) return ""; return m[2] === "+" ? "pwr" : "gnd"; };
  const draw = () => { const sc = scene(), half = tab === 2 ? `<div class="halfbar"><span class="${powered ? "on" : ""}" style="width:51.4%">LEFT HALF · holes 1–15 · ${powered ? "POWERED" : "no power yet"}</span><span class="${powered && bridged ? "on" : powered ? "off" : ""}" style="width:48.6%">RIGHT HALF · holes 16–30 · ${powered && bridged ? "POWERED (jumpers)" : powered ? "NO POWER (break!)" : "no power yet"}</span></div>` : "";
    $(".bxW", el).innerHTML = half + bbSVG({split, comps:sc.comps, wires:sc.wires, label:"Breadboard"});
    const holes = el.querySelectorAll(".bxW .hole"); holes.forEach(h => { const e = energy(h.dataset.h); if (e) h.classList.add(e); h.onclick = () => tap(h.dataset.h); });
    const g = $(".bxW .strips", el); let strips = "";
    if (tab >= 1 && powered){ ["T+3", "T-3"].concat(split && !bridged ? [] : ["T+20", "T-20"]).forEach(id => { const r = bbStripRect(id, split && !bridged), t = id[1] === "+" ? "pwr" : "gnd"; strips += `<rect class="strip ${t}" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="8"/>`; });
      if (split && !bridged && tab === 2) ["T+20", "T-20"].forEach(id => { const r = bbStripRect(id, true); strips += `<rect class="strip off" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="8"/>`; }); }
    if (sel){ const r = bbStripRect(sel, split && !bridged); strips += `<rect class="strip" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="8"/>`; holes.forEach(h => { if (bbNet(h.dataset.h, split && !bridged) === bbNet(sel, split && !bridged)) h.classList.add("hl"); }); const s = el.querySelector(`.bxW .hole[data-h="${sel}"]`); if (s) s.classList.add("sel"); }
    g.innerHTML = strips;
    const ctl = $(".bxCtl", el); ctl.innerHTML = tab === 0 ? "" : tab === 1 ? `<button class="btn primary bxP" type="button">${powered ? "Power off" : "Power on"}</button>` : `<button class="btn primary bxP" type="button">${powered ? "Power off" : "Power on (wire to hole 3)"}</button><button class="btn bxJ" type="button" ${powered ? "" : "disabled"}>${bridged ? "Remove the jumpers" : "Add the two jumpers across the break"}</button>`;
    if ($(".bxP", el)) $(".bxP", el).onclick = () => { powered = !powered; if (!powered) bridged = false; note(); draw(); };
    if ($(".bxJ", el)) $(".bxJ", el).onclick = () => { bridged = !bridged; note(); draw(); };
    $(".bxIntro", el).innerHTML = INTRO[tab]; };
  const note = () => { if (tab === 2) $(".bxOut", el).innerHTML = !powered ? "Press <b>Power on</b> to feed the rails." : bridged ? "<b>Jumpers added:</b> the break is bridged, so power reaches the right half and the LED lights." : "<b>Power reaches only the left half.</b> The LED on the right half is dark even though its wires are correct. The fix is two short jumpers across the break."; else if (tab === 1) $(".bxOut", el).innerHTML = powered ? "<b>Every hole along the top + line is now at the supply voltage</b> and every hole along the top − line is at 0 V (GND). Plug parts into any of them." : "Press <b>Power on</b>."; if (powered) markAct("bbExplore", "used"); };
  const tap = id => { sel = id; const s = split && !bridged && tab === 2; const net = bbNet(id, s); const same = [...el.querySelectorAll(".bxW .hole")].filter(h => bbNet(h.dataset.h, s) === net);
    const m = id.match(/^([TB])([+-])(\d+)$/);
    $(".bxOut", el).innerHTML = m ? `<b>${m[1] === "T" ? "Top" : "Bottom"} ${m[2] === "+" ? "+ (power)" : "− (ground)"} rail.</b> ${s ? `On this breadboard the rail is split: only the ${+m[3] <= 15 ? "left" : "right"} half is connected (${same.length} holes). Bridge the break with a jumper to join the halves.` : `All ${same.length} holes along this line are connected.`}` : `<b>Hole ${id}.</b> Connected to the ${same.length - 1} other holes ${BB.rows.indexOf(id[0]) < 5 ? "a–e" : "f–j"} in column ${id.slice(1)}: they share one metal clip. Not connected across the centre channel.`;
    markAct("bbExplore", "used"); draw(); };
  el.querySelectorAll(".bxT button").forEach(b => b.onclick = () => { tab = +b.dataset.t; split = tab === 2; powered = false; bridged = false; sel = null; el.querySelectorAll(".bxT button").forEach(x => x.setAttribute("aria-selected", x === b)); $(".bxOut", el).textContent = tab === 0 ? "Tap any hole." : "Press the button above."; draw(); });
  $(".bxQ", el).onclick = () => { tab = 2; split = true; powered = false; bridged = false; el.querySelectorAll(".bxT button").forEach((x, i) => x.setAttribute("aria-selected", i === 2)); const q = QS[asked % QS.length]; asked++; const truth = q[2] === null ? !split : q[2]; draw();
    $(".bxQs", el).innerHTML = `Are <b>${q[0]}</b> and <b>${q[1]}</b> connected? <button class="btn small bxY" type="button">Yes</button> <button class="btn small bxN" type="button">No</button>`;
    el.querySelectorAll(".bxW .hole").forEach(h => { if (h.dataset.h === q[0] || h.dataset.h === q[1]) h.classList.add("sel"); });
    const res = yes => { const ok = yes === truth; if (ok) score++; $(".bxQs", el).innerHTML = `${ok ? "✓ Right." : "✗ Not quite."} ${q[0]} and ${q[1]} are ${truth ? "" : "NOT "}connected. Score ${score}/${asked}.`; tap(q[0]); if (score >= 5) markAct("bbQuiz", "done"); };
    $(".bxY", el).onclick = () => res(true); $(".bxN", el).onclick = () => res(false); };
  draw();
};

/* ---------- 1.3 build an LED circuit, with instructions ---------- */
INTERACTIVES.bbBuild = function(el){
  const uno = getBoard() === "uno", comps = [{type:"led", a:"e12", k:"e13", color:"#E11D48"}, {type:"res", p1:"b13", p2:"T-13", ohms:uno ? 470 : 220, label:uno ? "470 Ω" : "220 Ω"}];
  const terms = () => [{id:"PIN", x:-70, y:110, label:(b => b === "uno" ? "D" + pinK(b, "LED_PIN") : b === "s3" ? "GPIO" + pinK(b, "LED_PIN") : pinK(b, "LED_PIN"))(getBoard()), color:"#C2410C"}, {id:"GND", x:-70, y:200, label:"GND", color:"#222"}];
  let wires = [], pick = null, hint = false, lit = false;
  el.innerHTML = bench("Build: LED + resistor on a breadboard", `<p class="explain">Your job: finish the circuit by adding <b>two wires</b>. The LED and the resistor are already on the board. Follow the steps; each one turns green when you have done it.</p>
   <ol class="stepcards bbSteps"></ol>
   <div class="bbwrap bbW"></div><div class="controls"><button class="btn primary bbChk" type="button">Check circuit</button><button class="btn bbClr" type="button">Clear wires</button><button class="btn bbHint" type="button">Show me where</button></div><ul class="reslist bbOut"></ul>
   <p class="explain"><b>The path of the current:</b> board pin → wire → LED long leg (+) → through the LED → short leg (−) → resistor → − rail → wire → GND. If any link is missing, nothing lights.</p>`);
  const net = id => bbNet(id, false);
  const status = () => { const pinOk = wires.some(w => w[0] === "PIN" && net(w[1]) === net("e12")), gndOk = wires.some(w => w[0] === "GND" && net(w[1]) === net("T-13"));
    const S = [
      `<div><b>Meet the parts.</b> The big red dome is the <b>LED</b>. Its <b>long leg (+)</b> is in <b>column 12</b> and its <b>short leg (−)</b> is in <b>column 13</b>. The striped part is a <b>${uno ? "470" : "220"} Ω resistor</b> that protects it.</div>`,
      `<div><b>Wire 1 (signal).</b> Tap the orange <b>${esc(terms()[0].label)}</b> tag on the left, then tap <b>any hole in column 12, rows a to e</b> (for example a12). That sends the pin's signal to the LED's long leg.</div>`,
      `<div><b>Wire 2 (ground).</b> Tap the black <b>GND</b> tag, then tap <b>any hole in the top − rail</b> (the top row of holes under the blue line).</div>`,
      `<div><b>Check it.</b> Press <b>Check circuit</b>. If a step is wrong the checker tells you which one.</div>`];
    const done = [true, pinOk, gndOk, lit];
    $(".bbSteps", el).innerHTML = S.map((h, i) => `<li class="${done[i] ? "done" : i === done.findIndex(d => !d) ? "now" : ""}">${h}</li>`).join(""); return {pinOk, gndOk}; };
  const draw = () => { const st = status(); $(".bbW", el).innerHTML = bbSVG({split:false, comps:comps.map((c, i) => i === 0 ? Object.assign({}, c, {lit}) : c), terms:terms(), wires:wires.map(w => ({from:w[0] === "PIN" || w[0] === "GND" ? termXY(w[0]) : w[0], to:w[1], color:w[0] === "GND" ? "#222" : "#C2410C"})), label:"Breadboard with an LED and a resistor"});
    el.querySelectorAll(".bbW .hole").forEach(h => { h.onclick = () => click(h.dataset.h); if (hint){ const id = h.dataset.h; if ((!st.pinOk && /^[a-e]12$/.test(id)) || (!st.gndOk && /^T-\d+$/.test(id))) h.classList.add("tgt"); } }); if (pick){ const p = el.querySelector(`.bbW .hole[data-h="${pick}"]`); if (p) p.classList.add("sel"); } };
  const termXY = id => { const t = terms().find(x => x.id === id); return [t.x + 34, t.y]; };
  const click = id => { if (id === "PIN" || id === "GND"){ pick = id; toast(id === "PIN" ? "Now tap a hole in column 12 (a–e)." : "Now tap a hole in the top − rail."); draw(); return; }
    const ex = wires.findIndex(w => w[1] === id); if (ex >= 0 && !pick){ wires.splice(ex, 1); lit = false; draw(); return; }
    if (!pick){ toast("First tap the orange PIN tag or the black GND tag on the left."); return; } wires.push([pick, id]); pick = null; lit = false; draw(); };
  $(".bbClr", el).onclick = () => { wires = []; pick = null; lit = false; draw(); $(".bbOut", el).innerHTML = ""; };
  $(".bbHint", el).onclick = () => { hint = !hint; $(".bbHint", el).textContent = hint ? "Hide the hints" : "Show me where"; draw(); };
  $(".bbChk", el).onclick = () => { const out = []; const pinW = wires.filter(w => w[0] === "PIN"), gndW = wires.filter(w => w[0] === "GND");
    const pinOk = pinW.some(w => net(w[1]) === net("e12")), gndOk = gndW.some(w => net(w[1]) === net("T-13"));
    const short = pinW.some(w => net(w[1]) === net("T-13")) || gndW.some(w => net(w[1]) === net("e12"));
    if (short) out.push(fail("Short circuit or wrong side!", "The board pin and GND would be connected without the LED in between. Unplug and rewire."));
    out.push(pinOk ? pass("The board pin reaches the LED's long leg (+, column 12).") : fail("The board pin is not connected to the LED's long leg.", "Wire 1: PIN → any hole in column 12, rows a to e."));
    out.push(gndOk ? pass("GND reaches the top − rail, where the resistor ends.") : fail("GND is not connected to the resistor's rail.", "Wire 2: GND → any hole in the top − rail."));
    out.push(pass("The LED's short leg (column 13) connects through the resistor (b13) to the − rail. (Already built for you.)"));
    const ok = pinOk && gndOk && !short; lit = ok;
    $(".bbOut", el).innerHTML = out.map(c => `<li class="${c.ok ? "ok" : "no"}">${c.ok ? "✓" : "✗"} ${c.msg}${!c.ok && c.hint ? `<span class="explain">${c.hint}</span>` : ""}</li>`).join("") + (ok ? `<li class="ok"><b>Complete loop:</b> pin → LED → resistor → GND. The LED glows. In the real world, upload the blink sketch and it will flash.</li>` : "");
    draw(); if (ok){ markAct("bbBuild", "pass"); confetti(); } };
  draw();
};

/* ---------- 1.3 wiring audit rubric, with instructions ---------- */
INTERACTIVES.wiringAudit = function(el){
  const C = [["Power and ground","Every part's GND connects to the board's GND; 5 V parts use 5 V and 3.3 V parts use 3.3 V.","Every part has a ground wire that ends at the board's GND; each part is on the right voltage.","A part has no ground, or a 3.3 V part is on 5 V."],
   ["Logic levels","5 V signals into 3.3 V boards go through dividers or level shifters.","The HC-SR04 ECHO wire passes through a divider before the ESP pin.","A 5 V signal goes straight into a 3.3 V pin."],
   ["Placement","Chips straddle the channel; no part has two legs in the same strip by mistake.","LED legs are in different columns; a chip straddles the centre channel.","Both legs of the LED are in the same column, so it is bypassed."],
   ["Rails","Split rails are bridged where needed; rails are labelled (5 V / 3.3 V).","The break in the middle is bridged and the rails are marked with tape.","A part sits on the dead half of a split rail."],
   ["Colour code","Red = power, black = GND, other colours for signals, used consistently.","Red for power, black for GND, different colours for each signal.","All the wires are the same colour."],
   ["Neatness","Short, flat wires; nothing loops over chips; nothing loose.","Short wires that lie flat; you can see every connection.","A tangle of long wires hides the parts."],
   ["Modularity","Each sensor and its resistors sit together near their pins.","Each sensor and its resistor are in one neat block.","Parts are scattered across the board."],
   ["Documentation","A wiring table and a top-down photo match the real circuit.","A wiring table and a photo exist and match the circuit.","No table, or the table does not match."]];
  const K = "sss_audit_" + (user ? user.email : "g"); const S = store.get(K, {});
  el.innerHTML = bench("Wiring audit: check a circuit before you power it (0–2 per row, 16 points)", `<div class="rubhow"><b>What you do here</b>
    <ol><li><b>Choose a circuit to audit:</b> your own breadboard, a classmate's, or a photo of one. (You can also audit one of the “Find the fault” cases above.)</li>
     <li><b>Unplug the USB cable first.</b> Audit with the power off.</li>
     <li><b>Go down the table, one row at a time.</b> Read <i>What to look for</i>, look at the circuit, then choose a score: <b>0</b> = missing or wrong, <b>1</b> = partly right, <b>2</b> = fully right. The small text under each row shows what a 2 and a 0 look like.</li>
     <li><b>Write one short piece of evidence</b> in the Comment box, for example “GND jumper from board to rail, yes” or “no table yet”.</li>
     <li><b>Read your total.</b> 12 or more: you are ready to power up. Fix every row you scored 0 or 1 first.</li></ol>
    <p class="explain">Why bother? One minute of auditing saves an hour of debugging. Your checkpoint asks for this audit together with a photo.</p></div>
   <div class="adm-tablewrap"><table class="t"><tr><th>Criterion</th><th>What to look for</th><th>Score</th><th>Comment (evidence)</th></tr>${C.map((c, i) => `<tr><td><b>${i + 1}. ${c[0]}</b></td><td>${c[1]}<small><b>2 looks like:</b> ${c[2]}</small><small><b>0 looks like:</b> ${c[3]}</small></td><td><select class="dinput waS" data-i="${i}" aria-label="Score for ${esc(c[0])}"><option value="">–</option><option value="0">0 missing</option><option value="1">1 partly</option><option value="2">2 fully</option></select></td><td><input class="dinput waC" data-i="${i}" placeholder="evidence" aria-label="Comment for ${esc(c[0])}"></td></tr>`).join("")}</table></div>
   <div class="ix-out"><b class="waT">Total: 0 / 16</b> <span class="explain waN"></span></div><div class="controls"><button class="btn small waCopy" type="button">Copy audit as text</button></div>
   <details><summary><b>See a completed example</b> (an ESP32-S3 with a DHT22 module and an LED)</summary><table class="t"><tr><th>Criterion</th><th>Score</th><th>Comment</th></tr>
     <tr><td>1. Power and ground</td><td>2</td><td>DHT22 + on 3V3, − on GND rail; rail linked to board GND</td></tr><tr><td>2. Logic levels</td><td>2</td><td>Everything is 3.3 V; no 5 V signal</td></tr><tr><td>3. Placement</td><td>2</td><td>LED legs in columns 12 and 13</td></tr><tr><td>4. Rails</td><td>1</td><td>Rails are split; LED is on the left half only; not labelled</td></tr>
     <tr><td>5. Colour code</td><td>1</td><td>Red and black used; two signal wires both yellow</td></tr><tr><td>6. Neatness</td><td>2</td><td>Short flat wires</td></tr><tr><td>7. Modularity</td><td>2</td><td>Sensor and LED each in their own block</td></tr><tr><td>8. Documentation</td><td>0</td><td>No wiring table yet</td></tr>
     <tr><td><b>Total</b></td><td><b>12 / 16</b></td><td>Ready, after adding the table and labelling the rails.</td></tr></table></details>`);
  el.querySelectorAll(".waS").forEach(s => s.value = (S[s.dataset.i] || [])[0] || ""); el.querySelectorAll(".waC").forEach(s => s.value = (S[s.dataset.i] || [])[1] || "");
  const upd = () => { el.querySelectorAll(".waS").forEach(s => S[s.dataset.i] = [s.value, el.querySelector(`.waC[data-i="${s.dataset.i}"]`).value]); store.set(K, S);
    const sc = C.reduce((t, c, i) => t + (+((S[i] || [])[0] || 0)), 0), n = C.filter((c, i) => (S[i] || [])[0] !== "" && (S[i] || [])[0] != null).length; $(".waT", el).textContent = `Total: ${sc} / 16`; $(".waN", el).textContent = n < C.length ? `${C.length - n} rows not scored yet.` : sc >= 12 ? "Ready to power up." : "Fix the rows scored 0 or 1 before powering up."; if (n === C.length) markAct("wiringAudit", String(sc)); };
  el.querySelectorAll("select, input").forEach(x => x.oninput = x.onchange = upd);
  $(".waCopy", el).onclick = () => copyText(C.map((c, i) => `${c[0]}: ${(S[i] || [])[0] || "-"}/2 ${(S[i] || [])[1] || ""}`).join("\n") + "\n" + $(".waT", el).textContent);
  upd();
};
