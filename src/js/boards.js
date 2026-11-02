/* ============ BOARD DRAWINGS: real header order, clickable pins (pin map, wiring missions) ============
   Header order from: Espressif ESP32-S3-DevKitC-1 v1.1 user guide (J1/J3 tables); NodeMCU v2 (Amica) / v3 (LoLin) silkscreen;
   Arduino UNO R4 WiFi pinout (power, analog and digital headers). */
const PIN_T = {pwr:["power","#D62828"], gnd:["ground","#3A3A3A"], adc:["analog input","#7C3AED"], io:["digital I/O","#4F46E5"], i2c:["I²C","#2563EB"], spi:["SPI","#C2410C"], uart:["serial (UART)","#A16207"], ctl:["reset / control","#64748B"], boot:["reserved / careful","#9CA3AF"]};
/* [id, label, type, functions, notes] */
const BOARD_PINS = {
 s3: {L:[
   ["3V3","3V3","pwr","3.3 V output from the on-board regulator.","Powers 3.3 V parts: DHT, TMP36, LDR divider. Small current only (a few hundred mA in total)."],
   ["3V3","3V3","pwr","3.3 V output (second pin).",""],
   ["RST","RST","ctl","EN: pulling it LOW resets the chip.","Do not connect anything here."],
   ["GPIO4","4","adc","GPIO4 • ADC1_CH3 • TOUCH4",""],
   ["GPIO5","5","adc","GPIO5 • ADC1_CH4 • TOUCH5",""],
   ["GPIO6","6","adc","GPIO6 • ADC1_CH5 • TOUCH6",""],
   ["GPIO7","7","adc","GPIO7 • ADC1_CH6 • TOUCH7","Free in this course."],
   ["GPIO15","15","io","GPIO15 • ADC2_CH4 • U0RTS",""],
   ["GPIO16","16","io","GPIO16 • ADC2_CH5 • U0CTS",""],
   ["GPIO17","17","uart","GPIO17 • U1TXD (UART1 transmit) • ADC2_CH6",""],
   ["GPIO18","18","uart","GPIO18 • U1RXD (UART1 receive) • ADC2_CH7",""],
   ["GPIO8","8","i2c","GPIO8 • ADC1_CH7 • default I²C SDA in Arduino-ESP32",""],
   ["GPIO3","3","boot","GPIO3 • ADC1_CH2 • strapping pin (JTAG source)","Avoid: its level at start-up is read by the chip."],
   ["GPIO46","46","boot","GPIO46 • strapping pin","Avoid: its level at start-up is read by the chip."],
   ["GPIO9","9","i2c","GPIO9 • ADC1_CH8 • default I²C SCL in Arduino-ESP32",""],
   ["GPIO10","10","spi","GPIO10 • ADC1_CH9 • FSPICS0 (default SPI SS)",""],
   ["GPIO11","11","spi","GPIO11 • ADC2_CH0 • FSPID (default SPI MOSI)",""],
   ["GPIO12","12","spi","GPIO12 • ADC2_CH1 • FSPICLK (default SPI SCK)",""],
   ["GPIO13","13","spi","GPIO13 • ADC2_CH2 • FSPIQ (default SPI MISO)",""],
   ["GPIO14","14","io","GPIO14 • ADC2_CH3 • FSPIWP",""],
   ["5V","5V","pwr","5 V from USB (when powered by USB).","Powers 5 V parts: HC-SR04, MQ-135, PIR. Never connect it to a GPIO."],
   ["GND","G","gnd","Ground (0 V).","Every circuit needs a shared ground."]],
  R:[
   ["GND","G","gnd","Ground (0 V).",""],
   ["TX","TX","uart","GPIO43 • U0TXD: the USB-UART bridge's serial line","Leave free: Serial Monitor traffic uses it on the UART port."],
   ["RX","RX","uart","GPIO44 • U0RXD","Leave free."],
   ["GPIO1","1","adc","GPIO1 • ADC1_CH0 • TOUCH1","ADC1 works while Wi-Fi is on."],
   ["GPIO2","2","adc","GPIO2 • ADC1_CH1 • TOUCH2","ADC1 works while Wi-Fi is on."],
   ["GPIO42","42","io","GPIO42 • MTMS (JTAG)","Free if you do not use JTAG debugging."],
   ["GPIO41","41","io","GPIO41 • MTDI (JTAG)",""],
   ["GPIO40","40","io","GPIO40 • MTDO (JTAG)",""],
   ["GPIO39","39","io","GPIO39 • MTCK (JTAG)",""],
   ["GPIO38","38","io","GPIO38 • on-board RGB LED on board v1.1",""],
   ["GPIO37","37","boot","GPIO37 • used by octal PSRAM/flash","Avoid on N8R8, N16R8 and similar modules."],
   ["GPIO36","36","boot","GPIO36 • used by octal PSRAM/flash","Avoid on octal-PSRAM modules."],
   ["GPIO35","35","boot","GPIO35 • used by octal PSRAM/flash","Avoid on octal-PSRAM modules."],
   ["GPIO0","0","boot","GPIO0 • BOOT button • strapping pin","Avoid: decides whether the chip runs your program or waits for an upload."],
   ["GPIO45","45","boot","GPIO45 • strapping pin (flash voltage)","Avoid."],
   ["GPIO48","48","io","GPIO48 • on-board RGB LED on board v1.0",""],
   ["GPIO47","47","io","GPIO47",""],
   ["GPIO21","21","io","GPIO21",""],
   ["GPIO20","20","boot","GPIO20 • native USB D+","Do not use: the USB port needs it."],
   ["GPIO19","19","boot","GPIO19 • native USB D−","Do not use: the USB port needs it."],
   ["GND","G","gnd","Ground (0 V).",""],
   ["GND","G","gnd","Ground (0 V).",""]]},
 esp8266: {L:[
   ["A0","A0","adc","The ONLY analog input. 0–3.3 V on NodeMCU boards (an on-board divider scales it for the chip).","LDR or MQ-135, not both."],
   ["RSV","RSV · G","gnd","Reserved on v2. Ground (G) on LoLin v3.",""],
   ["VIN","RSV · VU","pwr","Reserved on v2. VU = USB 5 V on LoLin v3.","On v3, a handy 5 V pin for 5 V sensors."],
   ["SD3","SD3","boot","GPIO10 • connected to the flash chip","Do not use."],
   ["SD2","SD2","boot","GPIO9 • connected to the flash chip","Do not use."],
   ["SD1","SD1","boot","Flash data line","Do not use."],
   ["CMD","CMD","boot","Flash chip select","Do not use."],
   ["SD0","SD0","boot","Flash data line","Do not use."],
   ["CLK","CLK","boot","Flash clock","Do not use."],
   ["GND","GND","gnd","Ground (0 V).",""],
   ["3V3","3V3","pwr","3.3 V output.",""],
   ["EN","EN","ctl","Enable: LOW turns the chip off.","Do not connect."],
   ["RST","RST","ctl","Reset.","Do not connect."],
   ["GND","GND","gnd","Ground (0 V).",""],
   ["VIN","VIN","pwr","5 V from USB (through a diode on most boards), or an external 5 V input.","Powers 5 V parts."]],
  R:[
   ["D0","D0","io","GPIO16 • no PWM, no interrupts","Fine for an LED."],
   ["D1","D1","i2c","GPIO5 • I²C SCL",""],
   ["D2","D2","i2c","GPIO4 • I²C SDA",""],
   ["D3","D3","boot","GPIO0 • FLASH button • must be HIGH at start-up","Usable if nothing pulls it LOW at power-up."],
   ["D4","D4","boot","GPIO2 • blue on-board LED • must be HIGH at start-up","A pulled-up input (like the DHT) is fine."],
   ["3V3","3V3","pwr","3.3 V output.",""],
   ["GND","GND","gnd","Ground (0 V).",""],
   ["D5","D5","spi","GPIO14 • SPI SCK",""],
   ["D6","D6","spi","GPIO12 • SPI MISO",""],
   ["D7","D7","spi","GPIO13 • SPI MOSI",""],
   ["D8","D8","boot","GPIO15 • SPI SS • must be LOW at start-up","Has a pull-down on the board."],
   ["RX","RX","uart","GPIO3 • UART0 RX (USB)","Leave free for uploads and the Serial Monitor."],
   ["TX","TX","uart","GPIO1 • UART0 TX (USB)","Leave free."],
   ["GND","GND","gnd","Ground (0 V).",""],
   ["3V3","3V3","pwr","3.3 V output.",""]]},
 uno: {T:[
   ["SCL","SCL","i2c","I²C clock (same signal as A5).",""],
   ["SDA","SDA","i2c","I²C data (same signal as A4).",""],
   ["AREF","AREF","ctl","Analog reference input.","Leave unconnected."],
   ["GND","GND","gnd","Ground (0 V).",""],
   ["D13","13","spi","D13 • SPI SCK • on-board LED",""],
   ["D12","12","spi","D12 • SPI CIPO (MISO)",""],
   ["D11","~11","spi","D11 • SPI COPI (MOSI) • PWM",""],
   ["D10","~10","spi","D10 • SPI CS • PWM",""],
   ["D9","~9","io","D9 • PWM",""],
   ["D8","8","io","D8",""],
   ["D7","7","io","D7",""],
   ["D6","~6","io","D6 • PWM",""],
   ["D5","~5","io","D5 • PWM",""],
   ["D4","4","io","D4",""],
   ["D3","~3","io","D3 • PWM • interrupt",""],
   ["D2","2","io","D2 • interrupt",""],
   ["D1","TX→1","uart","D1 • Serial1 TX","The USB Serial Monitor is separate, so D0/D1 are free for other serial parts."],
   ["D0","RX←0","uart","D0 • Serial1 RX",""]],
  B:[
   ["BOOT","BOOT","ctl","Not used in normal projects.","Do not connect."],
   ["IOREF","IOREF","ctl","Tells shields the logic voltage (5 V).","Do not use for power."],
   ["RESET","RESET","ctl","Reset.","Do not connect."],
   ["3.3V","3.3V","pwr","3.3 V output (small current).","For the DHT, TMP36 and LDR divider."],
   ["5V","5V","pwr","5 V output.","Powers HC-SR04, MQ-135, PIR, DHT."],
   ["GND","GND","gnd","Ground (0 V).",""],
   ["GND","GND","gnd","Ground (0 V).",""],
   ["VIN","VIN","pwr","External supply input, 6–24 V.","Not a 5 V source."],
   ["A0","A0","adc","A0 • analog input • also a DAC output on the R4",""],
   ["A1","A1","adc","A1 • analog input",""],
   ["A2","A2","adc","A2 • analog input",""],
   ["A3","A3","adc","A3 • analog input",""],
   ["A4","A4","i2c","A4 • analog input • I²C SDA",""],
   ["A5","A5","i2c","A5 • analog input • I²C SCL",""]]}
};
/* every pin of a board with its x, y position on the drawing */
function boardGeom(b){
  const out = [];
  if (b === "s3"){ BOARD_PINS.s3.L.forEach((p, i) => out.push({id:p[0], label:p[1], type:p[2], fn:p[3], note:p[4], x:22, y:84 + i * 21, side:"L", n:"J1-" + (i + 1)})); BOARD_PINS.s3.R.forEach((p, i) => out.push({id:p[0], label:p[1], type:p[2], fn:p[3], note:p[4], x:198, y:84 + i * 21, side:"R", n:"J3-" + (i + 1)})); return {W:220, H:600, pins:out}; }
  if (b === "esp8266"){ BOARD_PINS.esp8266.L.forEach((p, i) => out.push({id:p[0], label:p[1], type:p[2], fn:p[3], note:p[4], x:20, y:130 + i * 22, side:"L"})); BOARD_PINS.esp8266.R.forEach((p, i) => out.push({id:p[0], label:p[1], type:p[2], fn:p[3], note:p[4], x:180, y:130 + i * 22, side:"R"})); return {W:200, H:500, pins:out}; }
  BOARD_PINS.uno.T.forEach((p, i) => out.push({id:p[0], label:p[1], type:p[2], fn:p[3], note:p[4], x:(i < 10 ? 200 + i * 20 : 418 + (i - 10) * 20), y:20, side:"T"}));
  BOARD_PINS.uno.B.forEach((p, i) => out.push({id:p[0], label:p[1], type:p[2], fn:p[3], note:p[4], x:(i < 8 ? 250 + i * 20 : 432 + (i - 8) * 20), y:400, side:"B"}));
  return {W:620, H:420, pins:out};
}
/* course pin label (from PIN_PLAN) -> header pin id */
function normPin(b, s){
  s = String(s || "").trim(); if (!s || /not connected/.test(s)) return null;
  if (/^VIN|VU/.test(s)) return "VIN";
  s = s.replace(/\s*\(.*$/, "").trim();
  if (b === "uno"){ if (s === "A4") return "SDA"; if (s === "A5") return "SCL"; }
  return s;
}
function pinMatches(b, pinId, target){ const n = x => b === "uno" ? ({A4:"SDA", A5:"SCL"})[x] || x : x; return n(pinId) === n(target); }
/* which course parts use each pin */
function courseUse(b){
  const use = {}; Object.keys(PIN_PLAN).forEach(s => { const p = PIN_PLAN[s][b]; if (!p) return; p.con.forEach(c => { const id = normPin(b, c[1]); if (!id || /GND|3V3|3\.3V|5V|VIN/.test(id)) return; const nm = c[0].replace(/\s*\(.*\)/, "").replace(/ via .*/, ""), sh = SENSOR_INFO[s].short; (use[id] = use[id] || []).push(nm.startsWith(sh) ? nm : `${sh} ${nm}`); }); });
  return use;
}
/* the board drawing. opts: {sel, hl:{id:color}, dim:Set|fn, labels:true, onlyCourse, scale} */
function boardSVG(b, opts){
  opts = opts || {}; const g = boardGeom(b), use = courseUse(b), P = g.pins;
  const lab = (p) => { const used = use[p.id], c = PIN_T[p.type][1], dim = opts.onlyCourse && !used && !/GND|3V3|3\.3V|5V|VIN/.test(p.id);
    const sel = opts.sel === p.id, hl = opts.hl && opts.hl[p.id];
    const ring = `<circle cx="${p.x}" cy="${p.y}" r="${sel || hl ? 9.5 : 7.5}" fill="${hl || (sel ? "var(--amber)" : "#E9D8A6")}" stroke="${c}" stroke-width="${sel || hl ? 3.5 : 3}" opacity="${dim ? .25 : 1}"/><circle cx="${p.x}" cy="${p.y}" r="2.6" fill="#3a2f12" opacity="${dim ? .25 : .9}"/>`;
    let tx = "";
    if (opts.labels !== false){
      if (p.side === "L") tx = `<text x="${p.x - 16}" y="${p.y + 4}" text-anchor="end" class="pin-l" fill="${c}" opacity="${dim ? .35 : 1}">${esc(p.label)}</text>`;
      else if (p.side === "R") tx = `<text x="${p.x + 16}" y="${p.y + 4}" class="pin-l" fill="${c}" opacity="${dim ? .35 : 1}">${esc(p.label)}</text>`;
      else if (p.side === "T") tx = `<text transform="translate(${p.x + 4} ${p.y - 14}) rotate(-60)" class="pin-l" fill="${c}" opacity="${dim ? .35 : 1}">${esc(p.label)}</text>`;
      else tx = `<text transform="translate(${p.x - 4} ${p.y + 14}) rotate(60)" class="pin-l" fill="${c}" opacity="${dim ? .35 : 1}">${esc(p.label)}</text>`;
    }
    return `<g class="bpin${sel ? " sel" : ""}" data-pin="${esc(p.id)}" data-i="${P.indexOf(p)}" tabindex="0" role="button" aria-label="${esc(p.label)} pin">${ring}${tx}<circle cx="${p.x}" cy="${p.y}" r="12" fill="transparent"/></g>`; };
  let body = "", vb = "";
  if (b === "s3"){ vb = "-90 0 400 610";
    body = `<rect x="0" y="0" width="220" height="600" rx="10" fill="#1a1d21" stroke="#0b0d10"/>
     <rect x="8" y="64" width="28" height="476" rx="4" fill="#111" /><rect x="184" y="64" width="28" height="476" rx="4" fill="#111"/>
     <rect x="50" y="10" width="120" height="196" rx="4" fill="#cfd5db" stroke="#9aa3ab"/><rect x="50" y="10" width="120" height="44" rx="3" fill="#2E3270"/><path d="M60 22 h18 v18 h10 v-18 h10 v18 h10 v-18 h10 v18 h10 v-18 h12" stroke="#d4af37" stroke-width="2.4" fill="none"/>
     <text x="110" y="100" text-anchor="middle" font-size="12" fill="#3b4148" font-weight="700">ESP32-S3</text><text x="110" y="116" text-anchor="middle" font-size="9.5" fill="#3b4148">WROOM-1</text><text x="110" y="180" text-anchor="middle" font-size="8" fill="#5b636b">antenna end ↑</text>
     <rect x="96" y="290" width="28" height="28" rx="4" fill="#f4f4f4" stroke="#999"/><circle cx="110" cy="304" r="7" fill="url(#rgbG)"/><text x="110" y="334" text-anchor="middle" font-size="8" fill="#aab">RGB LED</text>
     <rect x="58" y="480" width="22" height="14" rx="3" fill="#444"/><text x="69" y="508" text-anchor="middle" font-size="8.5" fill="#ccc">BOOT</text><rect x="140" y="480" width="22" height="14" rx="3" fill="#444"/><text x="151" y="508" text-anchor="middle" font-size="8.5" fill="#ccc">RST</text>
     <rect x="58" y="556" width="38" height="44" rx="5" fill="#9aa3ab" stroke="#6b737a"/><text x="77" y="550" text-anchor="middle" font-size="8.5" fill="#ccc">USB</text><rect x="124" y="556" width="38" height="44" rx="5" fill="#9aa3ab" stroke="#6b737a"/><text x="143" y="550" text-anchor="middle" font-size="8.5" fill="#ccc">UART</text>
     <text x="22" y="58" text-anchor="middle" font-size="9" fill="#ccc" font-weight="700">J1</text><text x="198" y="58" text-anchor="middle" font-size="9" fill="#ccc" font-weight="700">J3</text>
     <defs><radialGradient id="rgbG"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#9ad"/><stop offset="1" stop-color="#557"/></radialGradient></defs>`; }
  else if (b === "esp8266"){ vb = "-100 0 400 510";
    body = `<rect x="0" y="0" width="200" height="500" rx="10" fill="#1d2433" stroke="#0e1320"/>
     <rect x="6" y="116" width="28" height="338" rx="4" fill="#111"/><rect x="166" y="116" width="28" height="338" rx="4" fill="#111"/>
     <rect x="42" y="8" width="116" height="170" rx="3" fill="#2b5c3b"/><path d="M52 18 h16 v22 h10 v-22 h10 v22 h10 v-22 h10 v22 h10 v-22 h12" stroke="#d4af37" stroke-width="2.4" fill="none"/>
     <rect x="50" y="56" width="100" height="112" rx="3" fill="#c9ced3" stroke="#8d949b"/><text x="100" y="104" text-anchor="middle" font-size="11" fill="#3b4148" font-weight="700">ESP-12E</text><text x="100" y="120" text-anchor="middle" font-size="9" fill="#3b4148">ESP8266</text>
     <rect x="80" y="330" width="40" height="30" rx="3" fill="#111"/><text x="100" y="376" text-anchor="middle" font-size="8" fill="#aab">USB-serial chip</text>
     <rect x="44" y="430" width="22" height="16" rx="3" fill="#444"/><text x="55" y="425" text-anchor="middle" font-size="8.5" fill="#ccc">RST</text><rect x="134" y="430" width="22" height="16" rx="3" fill="#444"/><text x="145" y="425" text-anchor="middle" font-size="8.5" fill="#ccc">FLASH</text>
     <rect x="80" y="466" width="40" height="34" rx="4" fill="#9aa3ab" stroke="#6b737a"/><text x="100" y="458" text-anchor="middle" font-size="8.5" fill="#ccc">micro-USB</text>`; }
  else { vb = "-14 -58 640 532";
    body = `<path d="M0 10 Q0 0 10 0 H600 Q610 0 610 10 V350 L590 370 V410 Q590 420 580 420 H10 Q0 420 0 410 Z" fill="#008184" stroke="#00585a"/>
     <rect x="190" y="8" width="208" height="24" rx="3" fill="#1b1b1b"/><rect x="408" y="8" width="168" height="24" rx="3" fill="#1b1b1b"/>
     <rect x="240" y="388" width="168" height="24" rx="3" fill="#1b1b1b"/><rect x="422" y="388" width="128" height="24" rx="3" fill="#1b1b1b"/>
     <rect x="-8" y="80" width="56" height="44" rx="6" fill="#b8c0c7" stroke="#7d868e"/><text x="20" y="140" text-anchor="middle" font-size="10" fill="#E0E7FF">USB-C</text>
     <rect x="-8" y="300" width="64" height="62" rx="6" fill="#1b1b1b"/><text x="24" y="378" text-anchor="middle" font-size="10" fill="#E0E7FF">power jack</text>
     <rect x="370" y="140" width="190" height="130" rx="6" fill="#00686a" stroke="#004c4e"/>${Array.from({length:96}, (_, k) => `<circle cx="${386 + (k % 12) * 15}" cy="${156 + Math.floor(k / 12) * 14}" r="3" fill="#7a1d1d"/>`).join("")}<text x="465" y="290" text-anchor="middle" font-size="10" fill="#E0E7FF">12 × 8 LED matrix</text>
     <rect x="150" y="150" width="120" height="84" rx="4" fill="#c9ced3" stroke="#8d949b"/><text x="210" y="190" text-anchor="middle" font-size="10" fill="#3b4148" font-weight="700">ESP32-S3</text><text x="210" y="205" text-anchor="middle" font-size="9" fill="#3b4148">Wi-Fi module</text>
     <rect x="150" y="262" width="60" height="60" rx="4" fill="#202020"/><text x="180" y="296" text-anchor="middle" font-size="9" fill="#ccc">RA4M1</text>
     <text x="300" y="60" text-anchor="middle" font-size="10" fill="#E0E7FF" font-weight="700">DIGITAL (PWM ~)</text><text x="330" y="372" text-anchor="middle" font-size="10" fill="#E0E7FF" font-weight="700">POWER</text><text x="486" y="372" text-anchor="middle" font-size="10" fill="#E0E7FF" font-weight="700">ANALOG IN</text>
     <text x="16" y="200" font-size="15" fill="#E0E7FF" font-weight="700">UNO R4</text><text x="16" y="218" font-size="15" fill="#E0E7FF" font-weight="700">WiFi</text>`; }
  return `<svg class="boardsvg ${b}" viewBox="${vb}" role="group" aria-label="${esc(BOARDS[b].name)} pins">${body}${P.map(lab).join("")}</svg>`;
}
/* ---- 1.3 interactive pin map ---- */
INTERACTIVES.pinMap = function(el){
  let b = getBoard(), sel = null, only = false, quiz = null, score = 0, asked = 0, seen = new Set();
  el.innerHTML = bench("Interactive pin map", `<div class="controls"><div class="seg seg-sm pmB">${["s3","esp8266","uno"].map(k => `<button type="button" data-b="${k}" aria-selected="${k === b}">${esc(BOARDS[k].short)}</button>`).join("")}</div>
     <label class="chk"><input type="checkbox" class="pmOnly"><span>Highlight the pins this course uses</span></label><button class="btn small pmQ" type="button">Find-the-pin challenge</button></div>
   <div class="kbdrow pmLeg">${Object.keys(PIN_T).map(k => `<span class="tagpill" style="border-color:${PIN_T[k][1]}"><i class="dotc" style="background:${PIN_T[k][1]}"></i>${PIN_T[k][0]}</span>`).join("")}</div>
   <div class="pm-grid"><div class="pm-board"></div><div class="pm-side"><div class="ix-out pmOut"><b>Tap any pin</b> to see what it does, and whether this course uses it.</div><div class="ix-out pmQz" hidden></div></div></div>
   <p class="explain">Pins are drawn in the real header order, as seen from the top of the board with the USB port(s) ${"at the bottom (ESP boards) or on the left (Uno R4)"}. Always match the labels printed on your own board: board versions differ slightly.</p>`);
  const draw = () => { const use = courseUse(b); const hl = {}; if (quiz && quiz.done) hl[quiz.ans] = "#A5B4FC";
    $(".pm-board", el).innerHTML = boardSVG(b, {sel, onlyCourse:only, hl}); $(".pm-grid", el).classList.toggle("wide", b === "uno");
    el.querySelectorAll(".bpin").forEach(g => { const go = () => tap(g.dataset.pin, +g.dataset.i); g.onclick = go; g.onkeydown = e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); go(); } }; }); };
  const tap = (id, i) => { const p = boardGeom(b).pins[i], use = courseUse(b)[id]; sel = id; seen.add(b + id);
    if (quiz && !quiz.done){ const ok = pinMatches(b, id, quiz.ans); quiz.done = true; if (ok) score++; asked++;
      $(".pmQz", el).innerHTML = `${ok ? "✓ <b>Right.</b>" : `✗ <b>Not that one.</b> The answer is <b>${esc(quiz.ans)}</b> (highlighted).`} ${esc(quiz.why)} <span class="explain">Score ${score}/${asked}.</span> <button class="btn small pmNext" type="button">Next</button>`; $(".pmNext", el).onclick = ask; if (score >= 4) markAct("pinMapQuiz", "done"); }
    $(".pmOut", el).innerHTML = `<div class="pm-h"><b>${esc(p.label)}</b>${p.n ? ` <span class="explain">${p.n}</span>` : ""} <span class="tagpill" style="border-color:${PIN_T[p.type][1]}">${PIN_T[p.type][0]}</span></div><p>${esc(p.fn)}</p>${p.note ? `<p class="explain">${esc(p.note)}</p>` : ""}${use ? `<p><b>In this course:</b> ${use.map(esc).join(", ")}</p>` : /GND|3V3|3\.3V|5V|VIN/.test(id) ? `<p><b>In this course:</b> power and ground for the sensors.</p>` : `<p class="explain">Not used by the course's sensors.</p>`}`;
    draw(); if (seen.size >= 6) markAct("pinMap", "used"); };
  const ask = () => { const use = courseUse(b), ids = Object.keys(use); const id = ids[Math.floor(Math.random() * ids.length)];
    quiz = {ans:id, done:false, why:`${id} is used for ${use[id].join(", ")} on the ${BOARDS[b].short}.`}; sel = null; draw();
    $(".pmQz", el).hidden = false; $(".pmQz", el).innerHTML = `<b>Find the pin:</b> which ${esc(BOARDS[b].short)} pin does this course use for <b>${esc(use[id][0])}</b>? Tap it on the board.`; };
  el.querySelectorAll(".pmB button").forEach(x => x.onclick = () => { b = x.dataset.b; sel = null; quiz = null; $(".pmQz", el).hidden = true; el.querySelectorAll(".pmB button").forEach(y => y.setAttribute("aria-selected", y === x)); draw(); });
  $(".pmOnly", el).onchange = e => { only = e.target.checked; draw(); };
  $(".pmQ", el).onclick = ask;
  draw();
};
