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
     <path d="M60 140 H140" stroke="#9AA5CE" stroke-width="22"/><rect class="olPipe" x="140" y="129" width="60" height="22" fill="#9AA5CE"/><path d="M200 140 H280" stroke="#9AA5CE" stroke-width="22"/><text x="170" y="120" text-anchor="middle" class="svgtxt">resistance (R)</text>
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
    const cv = $(".puC", el), {g, W, H} = hiDPI(cv); g.clearRect(0, 0, W, H); g.strokeStyle = cssv("--teal") || "#4F46E5"; g.lineWidth = 2; g.beginPath(); hist.forEach((x, i) => { const X = i / 119 * W, Y = x ? 30 : H - 30; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.stroke();
    g.fillStyle = cssv("--muted") || "#475569"; g.font = "11px sans-serif"; g.fillText("HIGH", 4, 26); g.fillText("LOW", 4, H - 34);
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
    if (c.type === "led"){ const [ax, ay] = bbXY(c.a), [kx, ky] = bbXY(c.k), col = c.color || "#D62828", same = ax === kx, R = 18;
      const dir = same ? 1 : (Math.sign(kx - ax) || 1), bx = same ? ax - 40 : (ax + kx) / 2, by = same ? (ay + ky) / 2 : Math.min(ay, ky) - 38;
      /* legs run from the holes to the underside of the dome; the anode (+) leg is the longer one */
      const aLeg = same ? `M${ax} ${ay} H${ax - 14} L${bx + R - 2} ${by - 6}` : `M${ax} ${ay} V${by + R + 10} L${bx - 6 * dir} ${by + R - 1}`;
      const kLeg = same ? `M${kx} ${ky} H${kx - 14} L${bx + R - 2} ${by + 6}` : `M${kx} ${ky} V${by + R + 4} L${bx + 6 * dir} ${by + R - 1}`;
      const pm = (x, y, t, f) => `<text x="${x}" y="${y}" text-anchor="middle" class="bb-pm" style="fill:${f}">${t}</text>`;
      return `<g class="bb-led">${c.lit ? `<circle cx="${bx}" cy="${by}" r="44" fill="${col}" opacity=".18"/><circle cx="${bx}" cy="${by}" r="32" fill="${col}" opacity=".28"/>` : ""}
       <path d="${aLeg}" stroke="#7a7a7a" stroke-width="4.2" fill="none" stroke-linecap="round"/><path d="${aLeg}" stroke="#d8d8d8" stroke-width="2.4" fill="none" stroke-linecap="round"/>
       <path d="${kLeg}" stroke="#7a7a7a" stroke-width="4.2" fill="none" stroke-linecap="round"/><path d="${kLeg}" stroke="#d8d8d8" stroke-width="2.4" fill="none" stroke-linecap="round"/>
       <rect x="${bx - R - 2}" y="${by + R - 6}" width="${2 * R + 4}" height="7" rx="2" fill="${col}" opacity=".95" stroke="rgba(0,0,0,.5)"/>
       <circle cx="${bx}" cy="${by}" r="${R}" fill="${col}" opacity="${c.lit ? 1 : .88}" stroke="rgba(0,0,0,.55)" stroke-width="1.5"/>
       <path d="M${bx - 7} ${by + 5} L${bx - 3} ${by - 7} L${bx + 3} ${by + 5} M${bx + 8} ${by - 8} L${bx + 8} ${by + 6}" stroke="rgba(0,0,0,.28)" stroke-width="1.6" fill="none"/>
       <ellipse cx="${bx - 6}" cy="${by - 8}" rx="5" ry="3" fill="#fff" opacity=".6" transform="rotate(-30 ${bx - 6} ${by - 8})"/>
       ${same ? pm(ax - 22, ay - 5, "+", "#B91C1C") + pm(kx - 22, ky + 15, "−", "#1D4ED8") : pm(ax - 10 * dir, ay - 14, "+", "#B91C1C") + pm(kx + 10 * dir, ky - 14, "−", "#1D4ED8")}
       <text x="${bx - R - 6}" y="${by + 4}" text-anchor="end" class="bb-tl">LED</text></g>`; }
    if (c.type === "res"){ const [x1, y1] = XY(c.p1), [x2, y2] = XY(c.p2), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, bands = resBands(c.ohms || 220);
      return `<g class="bb-res"><path d="M${x1} ${y1} L${x2} ${y2}" stroke="#A3A3A3" stroke-width="2.4"/><g transform="rotate(${ang} ${mx} ${my})"><rect x="${mx - 16}" y="${my - 6.5}" width="32" height="13" rx="6" fill="#E8D8B0" stroke="#8a6d3b"/>${bands.map((col, k) => `<rect x="${mx - 9 + k * 6}" y="${my - 6.5}" width="3.2" height="13" fill="${col}"/>`).join("")}<rect x="${mx + 9}" y="${my - 6.5}" width="3.2" height="13" fill="#C8A200"/></g>${c.label ? `<text x="${mx + (Math.abs(ang) > 45 ? 22 : 0)}" y="${my - (Math.abs(ang) > 45 ? -4 : 11)}" text-anchor="${Math.abs(ang) > 45 ? "start" : "middle"}" class="bb-tl">${c.label}</text>` : ""}</g>`; }
    if (c.type === "module"){ const P = c.pins.map(p => [bbXY(p[0]), p[1]]), xs = P.map(p => p[0][0]), y = P[0][0][1], x0 = Math.min(...xs) - 18, x1 = Math.max(...xs) + 18, h = c.h || 70, down = c.side !== "up";
      const top = down ? y + 8 : y - 8 - h;
      return `<g class="bb-mod"><rect x="${x0}" y="${top}" width="${x1 - x0}" height="${h}" rx="5" fill="${c.color || "#1F6FB2"}" stroke="rgba(0,0,0,.4)"/>${P.map(p => `<path d="M${p[0][0]} ${y} V${down ? top + 4 : top + h - 4}" stroke="#d4d4d4" stroke-width="3"/><text x="${p[0][0]}" y="${down ? top + 18 : top + h - 10}" text-anchor="middle" class="bb-ml">${esc(p[1])}</text>`).join("")}<text x="${(x0 + x1) / 2}" y="${down ? top + h - 10 : top + 18}" text-anchor="middle" class="bb-mt">${esc(c.label || "")}</text></g>`; }
    return ""; };
  const term = (t, right) => `<g><rect x="${right ? t.x - 26 : t.x - 34}" y="${t.y - 11}" width="64" height="22" rx="5" fill="${t.color || "#3730A3"}"/><text x="${right ? t.x + 6 : t.x - 2}" y="${t.y + 4}" text-anchor="middle" fill="#fff" font-size="10" font-family="JetBrains Mono, monospace">${esc(t.label)}</text><circle class="hole term" data-h="${t.id}" cx="${right ? t.x - 26 : t.x + 34}" cy="${t.y}" r="6" fill="#E8B84A"/></g>`;
  const W = 44 + 29 * 19 + 26, Hh = 306, L = o.terms ? 112 : 0, R = o.rterms ? 112 : 0;
  const block = (t, right) => t.block ? `<rect x="${right ? W + 22 : -L + 2}" y="${t.block[0]}" width="${L - 26 || R - 26}" height="${t.block[1]}" rx="10" fill="${t.block[2] || "#1a1d21"}" opacity=".95"/><text x="${right ? W + 22 + (R - 26) / 2 : -L + 2 + (L - 26) / 2}" y="${t.block[0] + 16}" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="700">${esc(t.block[3] || "")}</text>` : "";
  return `<svg class="bbsim" viewBox="${-L} 0 ${W + L + R} ${Hh}" role="img" aria-label="${esc(o.label || "Virtual breadboard")}">
   ${(o.terms || []).map(t => block(t, false)).join("")}${(o.rterms || []).map(t => block(t, true)).join("")}
   <rect x="0" y="4" width="${W}" height="${Hh - 8}" rx="10" fill="#F3EFE4" stroke="#D8CFB8"/>
   <rect x="0" y="146" width="${W}" height="14" fill="#E4DCC6"/>
   ${(() => { const gx = (bbXY("a15")[0] + bbXY("a16")[0]) / 2, rl = (y, col) => o.split ? `<path d="M20 ${y} H${gx - 9}" stroke="${col}" stroke-width="2.4" opacity=".8"/><path d="M${gx + 9} ${y} H${W - 10}" stroke="${col}" stroke-width="2.4" opacity=".8"/>` : `<path d="M20 ${y} H${W - 10}" stroke="${col}" stroke-width="1.6" opacity=".6"/>`;
     return rl(9, "#D62828") + rl(45, "#2563EB") + rl(263, "#2563EB") + rl(299, "#D62828") + `<text x="10" y="22" class="lbl" fill="#D62828">+</text><text x="10" y="40" class="lbl">−</text><text x="10" y="276" class="lbl">−</text><text x="10" y="294" class="lbl" fill="#D62828">+</text>`
      + (o.split ? `<g class="bb-break">${[[6, 48], [260, 302]].map(([a, b]) => `<rect x="${gx - 6}" y="${a}" width="12" height="${b - a}" fill="#FFF7ED" stroke="#C2410C" stroke-width="1.6" stroke-dasharray="4 3"/>`).join("")}<text x="${gx}" y="156" text-anchor="middle" class="lbl" fill="#C2410C" font-weight="700">▲ rails break here ▲</text></g>` : ""); })()}
   <g class="strips"></g>${lbl.join("")}
   ${holes.map(h => { const [x, y] = bbXY(h); return `<rect class="hole" data-h="${h}" x="${x - 4}" y="${y - 4}" width="8" height="8" rx="1.5"/>`; }).join("")}
   ${(o.comps || []).filter(c => c.type === "module").map(comp).join("")}<g class="wires">${(o.wires || []).map(wire).join("")}</g>${(o.comps || []).filter(c => c.type !== "module").map(comp).join("")}
   ${(o.terms || []).map(t => term(t, false)).join("")}${(o.rterms || []).map(t => term(t, true)).join("")}
   ${(o.labels || []).map(l => { const [x, y] = XY(l[0]); return `<text x="${x + (l[2] || 0)}" y="${y + (l[3] || 16)}" text-anchor="middle" class="bb-tl">${esc(l[1])}</text>`; }).join("")}
   ${(o.spots || []).map(sp => { const [x, y] = XY(sp); return `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#C2410C" stroke-width="3" class="bb-spot"/>`; }).join("")}
  </svg>`;
}
/* ---- 2.2 fault finder: six realistic faults, each drawn as a real breadboard ---- */
INTERACTIVES.faultFinder = function(el){
  const pinT = (y, lbl) => ({id:"PIN", x:-70, y, label:lbl, color:"#C2410C"}), gndT = y => ({id:"GND", x:-70, y, label:"GND", color:"#222"}), v3T = y => ({id:"V33", x:-70, y, label:"3V3", color:"#D62828"});
  const brd = (y, h, name) => ({block:[y, h, "#1a1d21", name]});
  const F = [
   {d:"The LED never lights. The program is right (it blinks on the virtual board) and every wire is pushed in firmly.",
    terms:[Object.assign(pinT(110, "GPIO15"), brd(70, 160, "ESP32-S3")), gndT(200)],
    comps:[{type:"led", a:"e13", k:"e12"}, {type:"res", p1:"a13", p2:"T-13", ohms:220, label:"220 Ω"}], wires:[{from:"PIN", to:"a12", color:"#C2410C"}, {from:"GND", to:"T-2", color:"#222"}],
    o:["The LED is in backwards: the pin feeds its short leg (−) and the resistor connects its long leg (+) to GND","The resistor should be 10 kΩ","The power rail is split","Column 12 is broken"], a:0, spot:["e12","e13"],
    x:"An LED only conducts from its long leg (+, anode) to its short leg (−, cathode, flat side). Here the board pin feeds column 12, where the <b>short</b> leg is. Turn the LED around so the long leg is in column 12."},
   {d:"The LED never lights, but a multimeter shows the pin switching between 0 V and 3.3 V on column 8.",
    terms:[Object.assign(pinT(110, "GPIO15"), brd(70, 160, "ESP32-S3")), gndT(200)],
    comps:[{type:"led", a:"c8", k:"d8"}, {type:"res", p1:"b8", p2:"T-8", ohms:220, label:"220 Ω"}], wires:[{from:"PIN", to:"a8", color:"#C2410C"}, {from:"GND", to:"T-2", color:"#222"}],
    o:["Both LED legs are in the same strip (column 8), so the LED is bypassed","The resistor value is too big","The LED is in backwards","Column 8 is broken"], a:0, spot:["c8","d8"],
    x:"Holes c8 and d8 share one metal clip, so both legs of the LED are connected together and current flows around it, straight through the resistor. Put the legs in two different columns, for example e8 and e9."},
   {d:"The LED never lights. The wiring looks almost exactly like the diagram.",
    terms:[Object.assign(pinT(110, "GPIO15"), brd(70, 160, "ESP32-S3")), gndT(200)],
    comps:[{type:"led", a:"e12", k:"e13"}, {type:"res", p1:"a13", p2:"T-13", ohms:220, label:"220 Ω"}], wires:[{from:"PIN", to:"a11", color:"#C2410C"}, {from:"GND", to:"T-2", color:"#222"}],
    o:["The pin wire is one column off: it is in column 11, the LED's long leg is in column 12","The LED is in backwards","The resistor is in the wrong place","The GND wire is in the wrong rail"], a:0, spot:["a11","e12"],
    x:"Off-by-one is the most common breadboard fault. Column 11 is not connected to column 12, so the pin reaches nothing. Move the wire to column 12 (any of a12–e12)."},
   {d:"Two identical LED circuits are powered from the top rails. The left LED lights; the right one does not.",
    terms:[Object.assign(v3T(90), brd(56, 150, "ESP32-S3")), gndT(160)], split:true,
    comps:[{type:"led", a:"e5", k:"e6", lit:true}, {type:"res", p1:"a6", p2:"T-6", ohms:220, label:"220 Ω"}, {type:"led", a:"e24", k:"e25"}, {type:"res", p1:"a25", p2:"T-25", ohms:220, label:"220 Ω"}],
    wires:[{from:"V33", to:"T+2", color:"#D62828"}, {from:"GND", to:"T-3", color:"#222"}, {from:"T+5", to:"a5", color:"#D62828"}, {from:"T+24", to:"a24", color:"#D62828"}],
    o:["The top rails are split in the middle (the dashed gap) and not bridged","The right LED is in backwards","Column 24 is broken","The board is in sleep mode"], a:0, spot:["T+15","T+16","T-15","T-16"],
    x:"On many full-size breadboards the rails stop in the middle. Power reaches only the left half. Add two short jumpers across the gap: T+15 to T+16 and T−15 to T−16."},
   {d:"The HC-SR04 has power, but the distance always reads 0 cm.",
    terms:[Object.assign({id:"V33", x:-70, y:70, label:"5V", color:"#D62828"}, brd(28, 196, "ESP32-S3")), {id:"GND", x:-70, y:110, label:"GND", color:"#222"}, {id:"TX", x:-70, y:150, label:"TRIG_PIN (out)", color:"#A16207"}, {id:"RX", x:-70, y:190, label:"ECHO_PIN (in)", color:"#A16207"}],
    comps:[{type:"module", pins:[["g20","VCC"],["g21","GND"],["g22","TRIG"],["g23","ECHO"]], label:"HC-SR04", color:"#1F6FB2", h:52}],
    wires:[{from:"V33", to:"f20", color:"#D62828"}, {from:"GND", to:"f21", color:"#222"}, {from:"TX", to:"f23", color:"#4F46E5"}, {from:"RX", to:"f22", color:"#2563EB"}],
    o:["The TRIG and ECHO wires are swapped: the board's output pin must go to TRIG, and ECHO must come back to an input pin","The baud rate is wrong","The sensor needs 12 V","The wires are too short"], a:0, spot:["f22","f23"],
    x:"The board sends the trigger pulse out and listens for the echo: output pin → TRIG, ECHO → input pin. Swap the two signal wires. (ECHO is a 5 V signal: on a 3.3 V board such as the ESP32 or ESP8266, use a divider.)"},
   {d:"The DHT module never answers: every reading is nan, and its little power LED stays off.",
    terms:[Object.assign(v3T(80), brd(46, 200, "ESP32-S3")), {id:"DATA", x:-70, y:130, label:"GPIO4", color:"#C2410C"}, gndT(190)],
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
/* ---- 2.3 DHT single-wire protocol ---- */
INTERACTIVES.dhtProtocol = function(el){
  let T = 29.4, Hh = 68.2;
  el.innerHTML = bench("Inside a DHT22 transmission", `<div class="controls"><label>Temperature <input type="range" class="dpT" min="-10" max="45" step="0.1" value="29.4"></label><span class="rangeval dpTv"></span><label>Humidity <input type="range" class="dpH" min="0" max="100" step="0.1" value="68.2"></label><span class="rangeval dpHv"></span></div>
   <canvas class="mini-chart dpC" style="height:120px" aria-label="Pulse train on the DATA wire"></canvas><div class="dpBits mono" style="font-size:.78rem;word-break:break-all;margin:8px 0"></div><div class="ix-out dpOut"></div>`);
  const bits = () => { const h = Math.round(Hh * 10), t = Math.round(Math.abs(T) * 10) | (T < 0 ? 0x8000 : 0); const bytes = [h >> 8, h & 255, t >> 8, t & 255]; const cs = (bytes[0] + bytes[1] + bytes[2] + bytes[3]) & 255; return {bytes, cs, str:bytes.concat([cs]).map(b => b.toString(2).padStart(8, "0"))}; };
  const draw = () => { T = +$(".dpT", el).value; Hh = +$(".dpH", el).value; $(".dpTv", el).textContent = T.toFixed(1) + " °C"; $(".dpHv", el).textContent = Hh.toFixed(1) + " %";
    const b = bits(), all = b.str.join(""); const cv = $(".dpC", el), {g, W, H} = hiDPI(cv); g.clearRect(0, 0, W, H);
    const seq = [[0, 1.0], [1, .03], [0, .08], [1, .08]]; all.split("").forEach(x => { seq.push([0, .05]); seq.push([1, x === "1" ? .07 : .027]); }); seq.push([0, .05], [1, .2]);
    const tot = seq.reduce((s, x) => s + x[1], 0); let x = 0; g.strokeStyle = cssv("--teal") || "#4F46E5"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 20);
    seq.forEach(([v, d], k) => { const y = v ? 20 : H - 24, nx = x + d / tot * W; g.lineTo(x, y); g.lineTo(nx, y); x = nx; }); g.stroke();
    g.fillStyle = cssv("--muted") || "#475569"; g.font = "10px sans-serif"; g.fillText("start: board pulls LOW ≥ 1 ms", 4, H - 6); g.fillText("40 data bits (short HIGH = 0, long HIGH = 1)", W * .45, H - 6);
    $(".dpBits", el).innerHTML = b.str.map((s, i) => `<span style="color:${["#2563EB","#2563EB","#C2410C","#C2410C","#7C3AED"][i]}">${s}</span>`).join(" ");
    $(".dpOut", el).innerHTML = `<span style="color:#2563EB"><b>Humidity</b> 16 bits = ${b.bytes[0] * 256 + b.bytes[1]} → ÷ 10 = ${Hh.toFixed(1)} %</span><br><span style="color:#C2410C"><b>Temperature</b> 16 bits = ${b.bytes[2] * 256 + b.bytes[3]}${T < 0 ? " (top bit = negative)" : ""} → ÷ 10 = ${T.toFixed(1)} °C</span><br><span style="color:#7C3AED"><b>Checksum</b> = (${b.bytes.join(" + ")}) mod 256 = ${b.cs}. If it does not match, the library reports a failed read (nan).</span>`;
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
