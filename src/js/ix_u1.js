/* ============ INTERACTIVES: UNIT 1 ============ */
const INTERACTIVES = {};
function choiceSorter(el, title, items, cats, actId, intro){
  const ans = {};
  el.innerHTML = bench(title, `${intro ? `<p class="explain">${intro}</p>` : ""}${items.map((it, i) => `<div class="ts-row" data-i="${i}"><span>${it[0]}</span><div class="controls">${cats.map((c, k) => `<button class="btn small csB" type="button" data-k="${k}">${esc(c)}</button>`).join("")}</div><div class="explain csE" hidden></div></div>`).join("")}<p class="feedback csN"></p>`);
  el.querySelectorAll(".ts-row").forEach(row => row.querySelectorAll(".csB").forEach(b => b.onclick = () => { const i = +row.dataset.i, k = +b.dataset.k, ok = k === items[i][1]; ans[i] = ok;
    row.querySelectorAll(".csB").forEach(x => { x.classList.toggle("primary", x === b); x.classList.remove("okb", "nob"); }); b.classList.add(ok ? "okb" : "nob");
    const e = row.querySelector(".csE"); e.hidden = false; e.innerHTML = (ok ? "<b>Yes.</b> " : `<b>Not quite: it is “${esc(cats[items[i][1]])}”.</b> `) + items[i][2]; pop(b, 1.06);
    const n = Object.keys(ans).length, right = Object.values(ans).filter(Boolean).length; $(".csN", el).textContent = `${right} of ${n} correct${n === items.length ? " — all answered." : ""}`;
    if (n === items.length){ markAct(actId, `${right}/${items.length}`); if (right === items.length) confetti(); } }));
}
/* 1.1 IoT data flow explorer */
INTERACTIVES.iotflow = function(el){
  const ST = [["Sensor","#1F8A70"],["Board","#17483B"],["Wi-Fi","#53665D"],["Apps Script","#C8653A"],["Sheet","#1F8A70"],["Dashboard","#B08A1E"]];
  let temp = 30.2, limit = 31, busy = false, stream = null, rows = [], sent = 0, fan = false;
  el.innerHTML = bench("IoT data flow explorer", `<svg class="flowsvg" viewBox="0 0 720 150" aria-label="Data flow from sensor to dashboard">${ST.map((s, i) => `<g class="ifS" data-i="${i}"><rect x="${6 + i * 119}" y="34" width="104" height="58" rx="12" fill="${s[1]}"/><text x="${58 + i * 119}" y="68" text-anchor="middle" class="svgtxt w b" font-size="13">${s[0]}</text>${i < 5 ? `<path d="M${111 + i * 119} 63 h10" stroke="#53665D" stroke-width="3"/>` : ""}</g>`).join("")}
    <circle class="ifP" r="8" cx="-20" cy="63" fill="#E8B84A" stroke="#fff" stroke-width="2"/><text x="58" y="120" text-anchor="middle" class="svgtxt mute ifFan">fan: off</text></svg>
   <div class="controls"><label>Temperature <input type="range" class="ifT" min="25" max="36" step="0.1" value="30.2"></label><span class="rangeval ifTv">30.2 °C</span><button class="btn primary ifGo" type="button">Send one reading</button><label class="chk"><input type="checkbox" class="ifLive"><span>Live stream (every 2 s)</span></label><label class="chk"><input type="checkbox" class="ifEdge"><span>Close the loop at the edge: fan on above ${limit} °C</span></label></div>
   <div class="ix-grid2"><div class="ix-out ifStage"><b>Tap a stage</b> or send a reading to see what the data looks like at each step.</div><div><div class="kp-cards ifDash"></div><div class="vsheet ifSheet"></div></div></div>`);
  const fmt = () => temp.toFixed(1);
  const stageText = i => [
    `<b>1. Sensor (DHT22).</b> The sensor measures ${fmt()} °C and sends it as a pattern of electrical pulses on its DATA wire. No text, no units: just HIGH and LOW signals.`,
    `<b>2. Board (edge device).</b> Your program decodes the pulses into a number and builds a message:<br><code>temp_c=${fmt()}</code>${fan ? `<br>Because it is above ${limit} °C, the board also switches the <b>fan on by itself</b> (an edge decision, no internet needed).` : ""}`,
    `<b>3. Wi-Fi and the internet.</b> The message travels as an HTTPS request (encrypted):<br><code>GET https://script.google.com/macros/s/…/exec?key=•••&device_id=team1&temp_c=${fmt()}</code>`,
    `<b>4. Apps Script (processing).</b> Your script checks the key ✓, checks that ${fmt()} is a number ✓, then adds a row and replies <code>OK:1</code>.`,
    `<b>5. Google Sheet (database).</b> A new row: <code>${new Date().toLocaleTimeString()} | team1 | temp_c | ${fmt()}</code>`,
    `<b>6. Dashboard (application).</b> The web page shows the latest value. ${temp > limit ? `It is <b>above ${limit} °C</b>, so the card turns red: a person can decide to open the windows.` : `It is below ${limit} °C: no action needed.`}`][i];
  const showStage = i => { $(".ifStage", el).innerHTML = stageText(i); el.querySelectorAll(".ifS rect").forEach((r, k) => r.setAttribute("stroke", k === i ? "#E8B84A" : "none")); el.querySelectorAll(".ifS rect").forEach((r, k) => r.setAttribute("stroke-width", k === i ? 4 : 0)); };
  const dash = () => { const hot = temp > limit; $(".ifDash", el).innerHTML = `<div class="kp-card ${hot ? "warn" : ""}"><span>Latest temperature</span><b>${rows.length ? rows[rows.length - 1][3].toFixed(1) + " °C" : "—"}</b></div><div class="kp-card"><span>Readings logged</span><b>${rows.length}</b></div>`;
    $(".ifSheet", el).innerHTML = rows.length ? `<table class="t"><tr><th>time</th><th>device</th><th>sensor</th><th>value</th></tr>${rows.slice(-4).map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3].toFixed(1)}</td></tr>`).join("")}</table>` : ""; };
  const send = () => { if (busy || !alive(el)) return; busy = true; fan = $(".ifEdge", el).checked && temp > limit; $(".ifFan", el).textContent = "fan: " + (fan ? "ON" : "off"); $(".ifFan", el).setAttribute("fill", fan ? "#C8653A" : "");
    const p = $(".ifP", el), t0 = performance.now(), dur = reduceMotion() ? 10 : 2400;
    const step = now => { if (!alive(el)) return; const f = Math.max(0, Math.min(1, (now - t0) / dur)), x = 58 + f * 595, stage = Math.min(5, Math.floor(f * 6)); p.setAttribute("cx", x); showStage(stage);
      if (f < 1) requestAnimationFrame(step); else { p.setAttribute("cx", -20); rows.push([new Date().toLocaleTimeString(), "team1", "temp_c", temp]); sent++; dash(); busy = false; if (sent >= 3 && temp > limit) markAct("iotflow", "done"); } };
    requestAnimationFrame(step); };
  $(".ifT", el).oninput = e => { temp = +e.target.value; $(".ifTv", el).textContent = fmt() + " °C"; };
  $(".ifGo", el).onclick = send;
  $(".ifLive", el).onchange = e => { clearInterval(stream); if (e.target.checked){ send(); stream = setInterval(() => { if (!alive(el)) return clearInterval(stream); send(); }, 2600); } };
  el.querySelectorAll(".ifS").forEach(g => { g.style.cursor = "pointer"; g.onclick = () => showStage(+g.dataset.i); });
  dash();
};
/* 1.3 MCU anatomy */
INTERACTIVES.mcuAnatomy = function(el){
  const P = {cpu:["CPU (processor core)","Runs your program one instruction at a time, millions of times per second.",{s3:"Dual-core Xtensa LX7, up to 240 MHz",esp8266:"Tensilica L106, 80 or 160 MHz",uno:"Arm Cortex-M4, 48 MHz (Renesas RA4M1)"},"Every sketch."],
   flash:["Flash memory","Stores your program. It keeps its contents when the power is off.",{s3:"8 MB on the common N8 module (external flash chip)",esp8266:"Usually 4 MB on NodeMCU boards (external chip)",uno:"256 KB inside the RA4M1"},"Each upload writes your compiled sketch here."],
   ram:["RAM (SRAM)","Holds variables while the program runs. It is cleared when the power is off.",{s3:"512 KB internal SRAM (more if the module has PSRAM)",esp8266:"Tens of kilobytes free for your program after Wi-Fi",uno:"32 KB in the RA4M1"},"Strings and arrays use RAM; long Strings on small boards can run out."],
   gpio:["GPIO (general-purpose input/output)","Pins you set as inputs (read HIGH/LOW) or outputs (send HIGH/LOW).",{s3:"Up to 45 GPIOs on the chip; many broken out on the DevKitC-1",esp8266:"About 9 easily usable on a NodeMCU",uno:"Digital pins D0–D13 plus A0–A5"},"LEDs, buzzers, buttons, HC-SR04 TRIG/ECHO, DHT DATA."],
   adc:["ADC (analog-to-digital converter)","Measures a voltage and turns it into a number.",{s3:"12-bit (0–4095). Use ADC1 (GPIO1–10) when Wi-Fi is on",esp8266:"10-bit (0–1023), only ONE input (A0)",uno:"10-bit by default (0–1023), up to 14-bit"},"LDR and MQ-135 readings."],
   pwm:["PWM (pulse-width modulation)","Switches a pin on and off very fast to fake an in-between level, e.g., to dim an LED or set a buzzer tone.",{s3:"LEDC peripheral; analogWrite() works",esp8266:"Software PWM via analogWrite()",uno:"analogWrite() on PWM pins"},"Dimming LEDs, tone() for buzzers."],
   uart:["UART (serial port)","Sends data one bit at a time over TX/RX wires at an agreed speed (baud rate).",{s3:"3 hardware UARTs; pins can be chosen",esp8266:"1 full UART (used for USB) + SoftwareSerial",uno:"USB Serial plus Serial1 on D0/D1"},"The Serial Monitor; the NEO-M8N GPS."],
   i2c:["I²C bus","Two shared wires (SDA data, SCL clock) connect many devices, each with its own address.",{s3:"Default SDA GPIO8, SCL GPIO9",esp8266:"Default SDA D2, SCL D1",uno:"SDA/SCL pins (also A4/A5) and a Qwiic connector"},"A display or other I²C module you may add later (each has its own address)."],
   spi:["SPI bus","Four fast wires (SCK, MOSI, MISO, and a chip-select per device).",{s3:"SCK 12, MOSI 11, MISO 13, SS 10",esp8266:"SCK D5, MISO D6, MOSI D7, SS D8",uno:"SCK D13, MISO D12, MOSI D11, SS D10"},"The RC522 RFID reader."],
   radio:["Wi-Fi radio","Connects the board to a 2.4 GHz wireless network.",{s3:"Built into the ESP32-S3 (also Bluetooth LE)",esp8266:"Built into the ESP8266",uno:"In the ESP32-S3 module beside the RA4M1 (the RA4M1 talks to it)"},"Sending readings to Apps Script (Unit 3)."],
   clock:["Clock and timers","A crystal and counters keep time, which is what millis() reads.",{s3:"40 MHz crystal",esp8266:"26 MHz crystal",uno:"Internal oscillators"},"millis(), delay(), pulseIn()."]};
  const seen = new Set();
  const blocks = [["cpu",210,110,140,70],["flash",40,40,130,52],["ram",40,104,130,52],["clock",40,168,130,52],["gpio",390,40,130,52],["adc",390,104,130,52],["pwm",390,168,130,52],["uart",210,214,64,48],["i2c",286,214,64,48],["spi",210,40,64,48],["radio",286,40,64,48]];
  el.innerHTML = bench("Inside a microcontroller", `<div class="controls"><label>Board <select class="dinput maB">${Object.values(BOARDS).map(b => `<option value="${b.key}" ${b.key === getBoard() ? "selected" : ""}>${esc(b.short)}</option>`).join("")}</select></label></div>
   <svg class="flowsvg" viewBox="0 0 560 280" role="img" aria-label="Block diagram of a microcontroller"><rect x="20" y="20" width="520" height="252" rx="16" fill="none" stroke="var(--line)" stroke-width="3" stroke-dasharray="6 5"/>
    ${blocks.map(b => `<g class="maK" data-k="${b[0]}" tabindex="0" role="button" style="cursor:pointer"><rect x="${b[1]}" y="${b[2]}" width="${b[3]}" height="${b[4]}" rx="10" class="svgbox"/><text x="${b[1] + b[3] / 2}" y="${b[2] + b[4] / 2 + 5}" text-anchor="middle" class="svgtxt b">${P[b[0]][0].split(" (")[0].replace(" memory","").replace(" bus","").replace(" and timers","")}</text></g>`).join("")}</svg>
   <div class="ix-out maOut"><b>Tap a block</b> to see what it does on your board.</div>`);
  const show = k => { const p = P[k], b = $(".maB", el).value; seen.add(k); el.querySelectorAll(".maK rect").forEach(r => r.classList.toggle("on", r.parentNode.dataset.k === k));
    $(".maOut", el).innerHTML = `<b>${p[0]}</b><p>${p[1]}</p><p><b>On the ${esc(BOARDS[b].short)}:</b> ${p[2][b]}</p><p><b>In this course:</b> ${p[3]}</p><p class="explain">${seen.size} of ${Object.keys(P).length} explored</p>`;
    if (seen.size >= 8) markAct("mcuAnatomy", "done"); };
  el.querySelectorAll(".maK").forEach(g => { g.onclick = () => show(g.dataset.k); g.onkeydown = e => { if (e.key === "Enter") show(g.dataset.k); }; });
  $(".maB", el).onchange = () => { const on = el.querySelector(".maK rect.on"); if (on) show(on.parentNode.dataset.k); };
};
/* 1.3 Board pin explorer */
/* 1.3 Logic levels */
INTERACTIVES.logicLevel = function(el){
  el.innerHTML = bench("What does the pin see?", `<div class="controls"><label>Board <select class="dinput llB">${Object.values(BOARDS).map(b => `<option value="${b.key}" ${b.key === getBoard() ? "selected" : ""}>${esc(b.short)}</option>`).join("")}</select></label>
   <label>Signal voltage <input type="range" class="llV" min="0" max="5" step="0.05" value="5"></label><span class="rangeval llVv"></span><label class="chk"><input type="checkbox" class="llD"><span>Add a 1 kΩ / 2 kΩ divider</span></label></div>
   <svg class="flowsvg" viewBox="0 0 600 120" aria-label="Voltage scale"><defs><linearGradient id="llG" x1="0" x2="1"><stop offset="0" stop-color="#1F8A70"/><stop offset=".55" stop-color="#E8B84A"/><stop offset="1" stop-color="#C8653A"/></linearGradient></defs>
    <rect x="30" y="40" width="540" height="22" rx="6" class="llBar" fill="#E5EFEA"/><g class="llZones"></g><g class="llTicks"></g><path class="llMark" d="M0 0" stroke="var(--ink)" stroke-width="3"/><text class="llTxt svgtxt b" x="0" y="30" text-anchor="middle"></text></svg>
   <div class="ix-out llOut"></div><p class="explain">Thresholds are typical values for illustration (ESP chips: LOW below about 0.25 × 3.3 V, HIGH above about 0.75 × 3.3 V). Always check your chip's datasheet.</p>`);
  const draw = () => { const b = $(".llB", el).value, V = BOARDS[b].logic, vin = +$(".llV", el).value, div = $(".llD", el).checked, v = div ? vin * 2 / 3 : vin;
    $(".llVv", el).textContent = vin.toFixed(2) + " V" + (div ? ` → ${v.toFixed(2)} V` : "");
    const X = x => 30 + x / 5 * 540, lo = V === 5 ? 1.5 : 0.825, hi = V === 5 ? 3.5 : 2.475, max = V === 5 ? 5.5 : 3.6;
    $(".llZones", el).innerHTML = `<rect x="30" y="40" width="${X(lo) - 30}" height="22" fill="#1F8A70" opacity=".35"/><rect x="${X(lo)}" y="40" width="${X(hi) - X(lo)}" height="22" fill="#9CA3AF" opacity=".35"/><rect x="${X(hi)}" y="40" width="${X(Math.min(5, max)) - X(hi)}" height="22" fill="#E8B84A" opacity=".45"/>${max < 5 ? `<rect x="${X(max)}" y="40" width="${X(5) - X(max)}" height="22" fill="#D62828" opacity=".55"/>` : ""}`;
    $(".llTicks", el).innerHTML = [0, 1, 2, 3, 3.3, 4, 5].map(t => `<text x="${X(t)}" y="80" text-anchor="middle" class="svgtxt mute">${t}</text>`).join("") + `<text x="${X(lo / 2)}" y="100" text-anchor="middle" class="svgtxt">LOW</text><text x="${X((lo + hi) / 2)}" y="100" text-anchor="middle" class="svgtxt">unclear</text><text x="${X((hi + Math.min(max, 5)) / 2)}" y="100" text-anchor="middle" class="svgtxt">HIGH</text>${max < 5 ? `<text x="${X((max + 5) / 2)}" y="100" text-anchor="middle" class="svgtxt b" fill="#D62828">DAMAGE</text>` : ""}`;
    $(".llMark", el).setAttribute("d", `M${X(v)} 34 V68`); const t = $(".llTxt", el); t.setAttribute("x", X(v)); t.textContent = v.toFixed(2) + " V";
    const zone = v > max ? "damage" : v >= hi ? "HIGH" : v <= lo ? "LOW" : "unclear";
    $(".llOut", el).innerHTML = zone === "damage" ? `<b style="color:var(--bad)">Too high for a ${V} V pin.</b> ${v.toFixed(2)} V is above the safe limit of about ${max} V. Over time (or at once) this can destroy the pin. Use a voltage divider.` : zone === "HIGH" ? `<b>Read as HIGH.</b> ${v.toFixed(2)} V is safely above the HIGH threshold of a ${V} V board.${div ? " The divider made a 5 V signal safe." : ""}` : zone === "LOW" ? `<b>Read as LOW.</b>` : `<b>Unclear zone.</b> The pin may read HIGH or LOW at random. Signals should be clearly above or below the thresholds.`;
    if (div && vin >= 4.9 && V === 3.3) markAct("logicLevel", "done"); };
  el.querySelectorAll("select, input").forEach(x => x.oninput = x.onchange = draw); draw();
};
/* 1.4 setup/loop visualizer */
INTERACTIVES.loopViz = function(el){
  const CODE = ["void setup() {","  Serial.begin(115200);","  pinMode(LED_PIN, OUTPUT);","}","","void loop() {","  digitalWrite(LED_PIN, HIGH);","  delay(500);","  digitalWrite(LED_PIN, LOW);","  delay(500);","}"];
  const ORDER = [1, 2, 6, 7, 8, 9]; let k = -1, loops = 0, led = false, timer = null, ms = 0;
  el.innerHTML = bench("Watch the board run P1", `<div class="tracer"><div class="lines lvL">${CODE.map((c, i) => `<div data-i="${i}">${esc(c) || " "}</div>`).join("")}</div>
   <div><div class="kv"><span>Time</span><b class="lvT">0 ms</b><span>loop() runs</span><b class="lvN">0</b><span>LED</span><b><span class="led lvLed"></span></b></div><p class="explain lvE">Press Step or Play.</p></div></div>
   <div class="controls"><button class="btn lvStep" type="button">Step</button><button class="btn primary lvPlay" type="button">Play</button><button class="btn lvReset" type="button">Reset</button></div>`);
  const ex = {1:"setup(): start serial (runs once).",2:"setup(): make the LED pin an output (runs once).",6:"LED on.",7:"Wait 500 ms: the board does nothing else.",8:"LED off.",9:"Wait 500 ms, then loop() starts again from the top."};
  const step = () => { k++; let line;
    if (k < 2) line = ORDER[k]; else { const j = (k - 2) % 4; line = ORDER[2 + j]; if (j === 0) loops++; }
    if (line === 6) led = true; if (line === 8) led = false; if (line === 7 || line === 9) ms += 500;
    el.querySelectorAll(".lvL div").forEach(d => d.classList.toggle("hl", +d.dataset.i === line));
    $(".lvT", el).textContent = ms + " ms"; $(".lvN", el).textContent = loops; $(".lvLed", el).classList.toggle("on", led); $(".lvE", el).textContent = ex[line];
    if (loops >= 3) markAct("loopViz", "done"); };
  $(".lvStep", el).onclick = step;
  $(".lvPlay", el).onclick = () => { if (timer){ clearInterval(timer); timer = null; $(".lvPlay", el).textContent = "Play"; return; } $(".lvPlay", el).textContent = "Pause"; timer = setInterval(() => { if (!alive(el)) return clearInterval(timer); step(); }, 650); };
  $(".lvReset", el).onclick = () => { clearInterval(timer); timer = null; $(".lvPlay", el).textContent = "Play"; k = -1; loops = 0; led = false; ms = 0; el.querySelectorAll(".lvL div").forEach(d => d.classList.remove("hl")); $(".lvT", el).textContent = "0 ms"; $(".lvN", el).textContent = "0"; $(".lvLed", el).classList.remove("on"); };
};
/* 1.4 which type? */
INTERACTIVES.typeSort = function(el){
  choiceSorter(el, "Which type fits?", [
    ["A temperature reading such as 29.4", 1, "It has decimals: float."],
    ["The pin number of the LED, which never changes", 0, "A whole number that never changes: const int."],
    ["Whether the door is open", 2, "Only two possible values: bool (true/false)."],
    ["Milliseconds since the board started", 3, "Large and never negative, and it is what millis() returns: unsigned long."],
    ["The device name “team1-esp32s3”", 4, "Text: String."],
    ["How many cards were tapped today", 5, "A whole number that changes: int."]
  ], ["const int","float","bool","unsigned long","String","int"], "typeSort", "Choose the best C++ type for each value.");
};
/* 1.4 delay vs millis race */
INTERACTIVES.delayRace = function(el){
  let presses = 0, A_ = 0, B_ = 0, t0 = performance.now(), raf = null;
  el.innerHTML = bench("delay() vs millis(): who notices the button?", `<p class="explain">Both boards blink an LED once per second and should light a second LED whenever you press the button (a press lasts 0.2 s). Board A uses delay(); Board B uses millis().</p>
   <div class="ix-grid2"><div class="ix-out"><b>Board A: delay(1000)</b><div class="kv"><span>Blink LED</span><b><span class="led drA1"></span></b><span>Button LED</span><b><span class="led drA2"></span></b><span>Presses noticed</span><b class="drAn">0</b></div><p class="explain">Checks the button only once per loop, between 1-second delays.</p></div>
    <div class="ix-out"><b>Board B: millis() timer</b><div class="kv"><span>Blink LED</span><b><span class="led drB1"></span></b><span>Button LED</span><b><span class="led drB2"></span></b><span>Presses noticed</span><b class="drBn">0</b></div><p class="explain">loop() runs thousands of times per second and checks the button every time.</p></div></div>
   <div class="controls"><button class="btn primary drPress" type="button">Press the button</button><span class="explain drP">Presses: 0</span></div>`);
  const frame = now => { if (!alive(el)) return; const t = now - t0, phase = Math.floor(t / 1000) % 2; $(".drA1", el).classList.toggle("on", !phase); $(".drB1", el).classList.toggle("on", !phase); raf = requestAnimationFrame(frame); }; raf = requestAnimationFrame(frame);
  $(".drPress", el).onclick = () => { const t = performance.now() - t0, within = t % 1000; presses++; $(".drP", el).textContent = "Presses: " + presses;
    B_++; $(".drBn", el).textContent = B_; const b2 = $(".drB2", el); b2.classList.add("on"); setTimeout(() => b2.classList.remove("on"), 200);
    const caught = within > 800; if (caught){ A_++; $(".drAn", el).textContent = A_; const a2 = $(".drA2", el); setTimeout(() => { a2.classList.add("on"); setTimeout(() => a2.classList.remove("on"), 200); }, 1000 - within); }
    if (presses >= 5){ markAct("timing", "done"); } };
};
