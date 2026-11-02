/* ============ MASTER PIN PLAN (single source of truth for wiring tables, pin planner, code generator, sandbox) ============
   Each connection: [part pin, board pin label, wire color, note]. "uses" lists the board resources (for conflict checks).
   "k" = constants used in code (name -> value as written in C++). Pins are distinct on every board, except where a board
   has too few pins (ESP8266): there the Pin Planner shows the conflict, which is the lesson. */
const WIRE = {pwr:"#D62828", gnd:"#222", sig:"#E8B84A", sig2:"#4F46E5", sig3:"#2563EB", sig4:"#C2410C", sig5:"#7C3AED"};
const rail = b => b === "uno" ? "5V" : "3V3";
/* one-pin-in, one-pin-out parts share this builder: pins = {s3, esp8266, uno} */
function simplePart(name, pins, opt){
  opt = opt || {}; const out = {};
  ["s3", "esp8266", "uno"].forEach(b => {
    const pin = pins[b], lab = b === "esp8266" && /^D\d$/.test(pin) ? pin + " (GPIO" + ({D0:16, D1:5, D2:4, D3:0, D4:2, D5:14, D6:12, D7:13, D8:15})[pin] + ")" : b === "s3" ? "GPIO" + pin : pin;
    const k = {}; k[name] = pin; const con = opt.con ? opt.con(b, lab) : [];
    out[b] = {k, uses:[b === "s3" ? "GPIO" + pin : pin], con, parts:opt.parts ? opt.parts(b) : []};
  });
  return out;
}
const PIN_PLAN = {
 dht: {
  s3:      {k:{DHT_PIN:"4"}, uses:["GPIO4"], con:[["VCC (+)","3V3","pwr",""],["DATA (out)","GPIO4","sig",""],["GND (−)","GND","gnd",""]], parts:["Bare 4-pin DHT: add a 10 kΩ pull-up resistor between DATA and VCC. 3-pin modules already have it."]},
  esp8266: {k:{DHT_PIN:"D4"}, uses:["D4"], con:[["VCC (+)","3V3","pwr",""],["DATA (out)","D4 (GPIO2)","sig",""],["GND (−)","GND","gnd",""]], parts:["Bare 4-pin DHT: add a 10 kΩ pull-up between DATA and VCC. D4 also drives the blue on-board LED, so it may flicker while the sensor talks: that is normal."]},
  uno:     {k:{DHT_PIN:"4"}, uses:["D4"], con:[["VCC (+)","5V","pwr",""],["DATA (out)","D4","sig",""],["GND (−)","GND","gnd",""]], parts:["Bare 4-pin DHT: add a 10 kΩ pull-up between DATA and VCC."]}
 },
 mq: {
  s3:      {k:{MQ_PIN:"2"}, uses:["GPIO2"], con:[["VCC","5V","pwr","the heater needs 5 V"],["GND","GND","gnd",""],["AO","GPIO2 (ADC1)","sig","through the 10 kΩ / 15 kΩ divider"],["DO","not connected","",""]], parts:["Divider on AO: AO → 10 kΩ → GPIO2, and GPIO2 → 15 kΩ → GND (5 V becomes 3.0 V). The module's AO can reach almost 5 V, too much for a 3.3 V pin."]},
  esp8266: {k:{MQ_PIN:"A0"}, uses:["A0"], con:[["VCC","VIN (v2) / VU (v3)","pwr","the heater needs 5 V"],["GND","GND","gnd",""],["AO","A0","sig","through the 10 kΩ / 15 kΩ divider"],["DO","not connected","",""]], parts:["Divider on AO: AO → 10 kΩ → A0, and A0 → 15 kΩ → GND. A0 is the ESP8266's only analog input, so you cannot read the LDR, TMP36 and an MQ sensor at the same time."]},
  uno:     {k:{MQ_PIN:"A1"}, uses:["A1"], con:[["VCC","5V","pwr","the heater needs 5 V"],["GND","GND","gnd",""],["AO","A1","sig","direct"],["DO","not connected","",""]], parts:[]}
 },
 hcsr04: {
  s3:      {k:{TRIG_PIN:"5", ECHO_PIN:"6"}, uses:["GPIO5","GPIO6"], con:[["VCC","5V","pwr","needs 5 V"],["TRIG","GPIO5","sig",""],["ECHO","GPIO6","sig2","through the 5 V → 3.3 V divider"],["GND","GND","gnd",""]], parts:["Voltage divider on ECHO: ECHO → 1 kΩ → GPIO6, and GPIO6 → 2 kΩ → GND. ECHO is a 5 V signal; the divider brings it down to about 3.3 V."]},
  esp8266: {k:{TRIG_PIN:"D5", ECHO_PIN:"D6"}, uses:["D5","D6"], con:[["VCC","VIN (v2) / VU (v3)","pwr","USB 5 V"],["TRIG","D5 (GPIO14)","sig",""],["ECHO","D6 (GPIO12)","sig2","through the 5 V → 3.3 V divider"],["GND","GND","gnd",""]], parts:["Voltage divider on ECHO: ECHO → 1 kΩ → D6, and D6 → 2 kΩ → GND."]},
  uno:     {k:{TRIG_PIN:"8", ECHO_PIN:"12"}, uses:["D8","D12"], con:[["VCC","5V","pwr",""],["TRIG","D8","sig",""],["ECHO","D12","sig2","direct (the Uno R4 is a 5 V board)"],["GND","GND","gnd",""]], parts:[]}
 },
 pir: {
  s3:      {k:{PIR_PIN:"10"}, uses:["GPIO10"], con:[["VCC","5V","pwr","HC-SR501 needs 4.5–20 V"],["OUT","GPIO10","sig","output is 3.3 V: safe"],["GND","GND","gnd",""]], parts:["Let the PIR warm up for about a minute after power-on. Turn the two orange trimmers fully counter-clockwise to start (shortest delay, medium sensitivity)."]},
  esp8266: {k:{PIR_PIN:"D1"}, uses:["D1"], con:[["VCC","VIN (v2) / VU (v3)","pwr","HC-SR501 needs 4.5–20 V"],["OUT","D1 (GPIO5)","sig","output is 3.3 V: safe"],["GND","GND","gnd",""]], parts:["Let the PIR warm up for about a minute after power-on."]},
  uno:     {k:{PIR_PIN:"3"}, uses:["D3"], con:[["VCC","5V","pwr",""],["OUT","D3","sig",""],["GND","GND","gnd",""]], parts:["Let the PIR warm up for about a minute after power-on."]}
 },
 ldr: {
  s3:      {k:{LDR_PIN:"1"}, uses:["GPIO1"], con:[["LDR leg 1","3V3","pwr",""],["LDR leg 2 + 10 kΩ","GPIO1 (ADC1)","sig","the junction is the signal"],["10 kΩ other end","GND","gnd",""]], parts:["Voltage divider: 3V3 → LDR → junction → 10 kΩ → GND. Connect the junction to GPIO1. Use ADC1 pins (GPIO1–10): ADC2 cannot be used while Wi-Fi is on."]},
  esp8266: {k:{LDR_PIN:"A0"}, uses:["A0"], con:[["LDR leg 1","3V3","pwr",""],["LDR leg 2 + 10 kΩ","A0","sig","the junction is the signal"],["10 kΩ other end","GND","gnd",""]], parts:["Voltage divider: 3V3 → LDR → junction → 10 kΩ → GND. The ESP8266 has only ONE analog input (A0)."]},
  uno:     {k:{LDR_PIN:"A0"}, uses:["A0"], con:[["LDR leg 1","5V","pwr",""],["LDR leg 2 + 10 kΩ","A0","sig","the junction is the signal"],["10 kΩ other end","GND","gnd",""]], parts:["Voltage divider: 5V → LDR → junction → 10 kΩ → GND."]}
 },
 tmp36: {
  s3:      {k:{TMP_PIN:"7"}, uses:["GPIO7"], con:[["+Vs (left pin)","3V3","pwr","2.7–5.5 V"],["Vout (middle pin)","GPIO7 (ADC1)","sig","10 mV per °C, 0.5 V at 0 °C"],["GND (right pin)","GND","gnd","flat face towards you: +Vs, Vout, GND"]], parts:["Add a 0.1 µF capacitor between +Vs and GND, close to the sensor, to reduce noise. The flat face points at you when you read the pins left to right."]},
  esp8266: {k:{TMP_PIN:"A0"}, uses:["A0"], con:[["+Vs (left pin)","3V3","pwr","2.7–5.5 V"],["Vout (middle pin)","A0","sig","10 mV per °C, 0.5 V at 0 °C"],["GND (right pin)","GND","gnd",""]], parts:["Add a 0.1 µF capacitor between +Vs and GND. A0 is shared with the LDR and the MQ sensor: connect only one at a time."]},
  uno:     {k:{TMP_PIN:"A2"}, uses:["A2"], con:[["+Vs (left pin)","5V","pwr","2.7–5.5 V"],["Vout (middle pin)","A2","sig","10 mV per °C, 0.5 V at 0 °C"],["GND (right pin)","GND","gnd",""]], parts:["Add a 0.1 µF capacitor between +Vs and GND, close to the sensor."]}
 },
 button: simplePart("BTN_PIN", {s3:"9", esp8266:"D2", uno:"2"}, {con:(b, lab) => [["Button leg A", lab, "sig3", "INPUT_PULLUP: no resistor needed"], ["Button leg B (opposite corner)", "GND", "gnd", ""]], parts:b => ["Use the legs on opposite corners of the button, or it will always be connected. In the code, use INPUT_PULLUP: pressed reads LOW."]}),
 led: {
  s3:      {k:{LED_PIN:"15"}, uses:["GPIO15"], con:[["LED + (long leg) via 220 Ω","GPIO15","sig4","220 Ω in series"],["LED − (short leg)","GND","gnd",""]], parts:["220 Ω resistor in series with the LED. The long leg (anode) goes towards the resistor and the pin."]},
  esp8266: {k:{LED_PIN:"D7"}, uses:["D7"], con:[["LED + (long leg) via 220 Ω","D7 (GPIO13)","sig4","220 Ω in series"],["LED − (short leg)","GND","gnd",""]], parts:["220 Ω resistor in series with the LED. D7 supports PWM, so you can dim it."]},
  uno:     {k:{LED_PIN:"6"}, uses:["D6"], con:[["LED + (long leg) via 470 Ω","D6","sig4","470 Ω in series"],["LED − (short leg)","GND","gnd",""]], parts:["Use 470 Ω (not 220 Ω) on the Uno R4: its pins are 5 V and the R4 pin current limit is lower than the classic Uno's."]}
 },
 rgb: {
  s3:      {k:{RED_PIN:"17", GREEN_PIN:"18", BLUE_PIN:"8"}, uses:["GPIO17","GPIO18","GPIO8"], con:[["Red leg via 220 Ω","GPIO17","sig4","220 Ω in series"],["Green leg via 220 Ω","GPIO18","sig2","220 Ω in series"],["Blue leg via 220 Ω","GPIO8","sig3","220 Ω in series"],["Common cathode (longest leg)","GND","gnd","common-anode parts go to 3V3 and the code is inverted"]], parts:["One 220 Ω resistor on each colour leg, not on the common leg. Check whether your RGB LED is common cathode (to GND) or common anode (to 3V3)."]},
  esp8266: {k:{RED_PIN:"D7", GREEN_PIN:"D6", BLUE_PIN:"D5"}, uses:["D7","D6","D5"], con:[["Red leg via 220 Ω","D7 (GPIO13)","sig4","220 Ω in series"],["Green leg via 220 Ω","D6 (GPIO12)","sig2","220 Ω in series"],["Blue leg via 220 Ω","D5 (GPIO14)","sig3","220 Ω in series"],["Common cathode (longest leg)","GND","gnd",""]], parts:["One 220 Ω resistor on each colour leg. D5, D6 and D7 all support PWM."]},
  uno:     {k:{RED_PIN:"9", GREEN_PIN:"10", BLUE_PIN:"11"}, uses:["D9","D10","D11"], con:[["Red leg via 470 Ω","D9","sig4","470 Ω in series"],["Green leg via 470 Ω","D10","sig2","470 Ω in series"],["Blue leg via 470 Ω","D11","sig3","470 Ω in series"],["Common cathode (longest leg)","GND","gnd",""]], parts:["One 470 Ω resistor on each colour leg. D9, D10 and D11 support PWM (analogWrite)."]}
 },
 buzzer: {
  s3:      {k:{BUZZER_PIN:"16"}, uses:["GPIO16"], con:[["Buzzer +","GPIO16","sig5",""],["Buzzer −","GND","gnd",""]], parts:["A passive piezo buzzer plays any pitch with tone(). An active buzzer has its own oscillator and only beeps at one pitch when the pin is HIGH. Small piezo discs are fine on a pin; larger buzzers need a transistor."]},
  esp8266: {k:{BUZZER_PIN:"D8"}, uses:["D8"], con:[["Buzzer +","D8 (GPIO15)","sig5",""],["Buzzer −","GND","gnd",""]], parts:["Use a passive piezo (no transistor): D8 (GPIO15) must be LOW at start-up, and a piezo between D8 and GND keeps it low. A module with a pull-up can stop the board from booting."]},
  uno:     {k:{BUZZER_PIN:"7"}, uses:["D7"], con:[["Buzzer +","D7","sig5",""],["Buzzer −","GND","gnd",""]], parts:["A small passive piezo can connect directly. A louder or active buzzer should be driven through an NPN transistor (2N2222 with a 1 kΩ base resistor)."]}
 },
 servo: {
  s3:      {k:{SERVO_PIN:"14"}, uses:["GPIO14"], con:[["Signal (orange/yellow)","GPIO14","sig","3.3 V signal is fine"],["Power (red)","5V","pwr","external 5 V supply is better"],["Ground (brown/black)","GND","gnd","share ground with the board"]], parts:["An SG90 can draw 500 mA or more when it stalls. For more than one servo use a separate 5 V supply and join its GND to the board's GND. Add a 100–470 µF capacitor across the servo power rails."]},
  esp8266: {k:{SERVO_PIN:"D2"}, uses:["D2"], con:[["Signal (orange/yellow)","D2 (GPIO4)","sig","3.3 V signal is fine"],["Power (red)","VIN (v2) / VU (v3)","pwr","external 5 V supply is better"],["Ground (brown/black)","GND","gnd","share ground with the board"]], parts:["Power the servo from a separate 5 V supply with the grounds joined, and add a 100–470 µF capacitor across the servo power rails. The USB port can brown out the board."]},
  uno:     {k:{SERVO_PIN:"13"}, uses:["D13"], con:[["Signal (orange/yellow)","D13","sig",""],["Power (red)","5V","pwr","external 5 V supply is better"],["Ground (brown/black)","GND","gnd",""]], parts:["D13 also drives the board's L LED, so it glows faintly: harmless. A separate 5 V supply with joined grounds is best for anything bigger than one SG90."]}
 },
 motor: {
  s3:      {k:{MOTOR_EN_PIN:"11", MOTOR_IN1_PIN:"12", MOTOR_IN2_PIN:"13"}, uses:["GPIO11","GPIO12","GPIO13"], con:[["Driver ENA (speed)","GPIO11","sig","PWM"],["Driver IN1","GPIO12","sig2","direction"],["Driver IN2","GPIO13","sig3","direction"],["Driver GND","GND","gnd","also join the motor battery −"]], parts:["Never connect a motor straight to a pin. Use a driver board (L298N, L9110S, TB6612) or a transistor with a flyback diode. Power the motor from its own battery pack and join the grounds."]},
  esp8266: {k:{MOTOR_EN_PIN:"D6", MOTOR_IN1_PIN:"D7", MOTOR_IN2_PIN:"D0"}, uses:["D6","D7","D0"], con:[["Driver ENA (speed)","D6 (GPIO12)","sig","PWM"],["Driver IN1","D7 (GPIO13)","sig2","direction"],["Driver IN2","D0 (GPIO16)","sig3","direction"],["Driver GND","GND","gnd","also join the motor battery −"]], parts:["Never connect a motor straight to a pin. Use a driver board and a separate motor battery with joined grounds."]},
  uno:     {k:{MOTOR_EN_PIN:"5", MOTOR_IN1_PIN:"A3", MOTOR_IN2_PIN:"A4"}, uses:["D5","A3","A4"], con:[["Driver ENA (speed)","D5","sig","PWM"],["Driver IN1","A3","sig2","direction"],["Driver IN2","A4","sig3","direction"],["Driver GND","GND","gnd","also join the motor battery −"]], parts:["Never connect a motor straight to a pin. Use a driver board and a separate motor battery with joined grounds."]}
 }
};
const SENSOR_INFO = {
 dht:    {name:"DHT11 / DHT22", short:"DHT", mA:1.5, rail:"3V3 or 5V", what:"temperature & humidity"},
 mq:     {name:"MQ gas sensor (MQ-2, MQ-135, …)", short:"MQ", mA:150, rail:"5V", what:"gas level (relative)"},
 hcsr04: {name:"HC-SR04 ultrasonic", short:"HC-SR04", mA:15, rail:"5V", what:"distance"},
 pir:    {name:"HC-SR501 PIR motion sensor", short:"PIR", mA:0.1, rail:"5V", what:"motion"},
 ldr:    {name:"Photoresistor (LDR)", short:"LDR", mA:0.5, rail:"3V3 or 5V", what:"light level"},
 tmp36:  {name:"TMP36 temperature sensor", short:"TMP36", mA:0.05, rail:"3V3 or 5V", what:"temperature"},
 button: {name:"Pushbutton", short:"Button", mA:0, rail:"pin", what:"input"},
 led:    {name:"LED + resistor", short:"LED", mA:7, rail:"pin", what:"output"},
 rgb:    {name:"RGB LED", short:"RGB LED", mA:20, rail:"pin", what:"colour output"},
 buzzer: {name:"Piezo buzzer", short:"Buzzer", mA:30, rail:"pin", what:"sound output"},
 servo:  {name:"SG90 servo motor", short:"Servo", mA:250, peak:700, rail:"5V", what:"angle output"},
 motor:  {name:"DC motor + driver", short:"Motor", mA:300, peak:1000, rail:"battery", what:"speed and direction"}
};
const BOARD_mA = {s3:{avg:110, peak:350}, esp8266:{avg:80, peak:200}, uno:{avg:120, peak:350}};

function wiringTable(sensor, board){
  const p = PIN_PLAN[sensor][board]; if (!p) return "";
  return `<table class="t wtab"><tr><th>${esc(SENSOR_INFO[sensor].short)} pin</th><th>${esc(BOARDS[board].short)} pin</th><th>Note</th></tr>${p.con.map(c => `<tr><td><span class="wdot" style="background:${WIRE[c[2]] || "transparent"}"></span>${esc(c[0])}</td><td><b>${esc(c[1])}</b></td><td>${esc(c[3])}</td></tr>`).join("")}</table>${p.parts.length ? `<ul class="wparts">${p.parts.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}`;
}
/* Wiring diagram: board block (left) and sensor block (right), colored wires, inline parts. Block widths fit their labels. */
function wiringSVG(sensor, board){
  const p = PIN_PLAN[sensor][board], rows = p.con.filter(c => c[2]); const h = 50 + rows.length * 36;
  const bl = c => c[1].replace(/ \(.*\)/, ""), cw = 7.2;
  const bw = Math.max(130, Math.max(...rows.map(c => bl(c).length)) * cw + 40), sw = Math.max(150, Math.max(...rows.map(c => c[0].length)) * cw + 34);
  const gap = 230, bx = 10, sx = bx + bw + gap, W = sx + sw + 10;
  const inl = c => /divider|pull-up|level converter|Ω in series/.test(c[3] + c[0]) ? (/divider/.test(c[3]) ? "÷" : /pull-up/.test(c[3]) ? "↑R" : /converter/.test(c[3]) ? "⇅" : "R") : "";
  return `<svg class="wsvg" viewBox="0 0 ${W} ${h}" role="img" aria-label="Wiring diagram: ${esc(SENSOR_INFO[sensor].short)} to ${esc(BOARDS[board].short)}">
   <rect x="${bx}" y="10" width="${bw}" height="${h - 20}" rx="12" class="wsvg-board ${board}"/><text x="${bx + bw / 2}" y="31" text-anchor="middle" class="wsvg-t">${esc(BOARDS[board].short)}</text>
   <rect x="${sx}" y="10" width="${sw}" height="${h - 20}" rx="12" class="wsvg-sensor"/><text x="${sx + sw / 2}" y="31" text-anchor="middle" class="wsvg-t dark">${esc(SENSOR_INFO[sensor].short)}</text>
   ${rows.map((c, i) => { const y = 58 + i * 36, col = WIRE[c[2]], mark = inl(c), mx = bx + bw + gap / 2;
     return `<text x="${bx + bw - 14}" y="${y + 4}" text-anchor="end" class="wsvg-p">${esc(bl(c))}</text><circle cx="${bx + bw}" cy="${y}" r="5" fill="${col}"/>
      <path d="M${bx + bw + 4} ${y} H${sx - 4}" stroke="${col}" stroke-width="3.4" stroke-linecap="round" class="wire" style="--d:${i}"/>
      ${mark ? `<rect x="${mx - (mark.length > 1 ? 17 : 12)}" y="${y - 11}" width="${mark.length > 1 ? 34 : 24}" height="22" rx="5" class="wsvg-part"/><text x="${mx}" y="${y + 5}" text-anchor="middle" class="wsvg-pt">${mark}</text>` : ""}
      <circle cx="${sx}" cy="${y}" r="5" fill="${col}"/><text x="${sx + 14}" y="${y + 4}" class="wsvg-p dark">${esc(c[0])}</text>`; }).join("")}
  </svg>`;
}
/* Board tabs: one panel per board; the learner's board shows first (CSS uses html[data-board]) */
let btSeq = 0;
function boardTabs(fn, label){
  const id = "bt" + (++btSeq);
  return `<div class="bt" data-id="${id}"><div class="bt-tabs" role="tablist" aria-label="${esc(label || "Choose your board")}">${["uno","esp8266","s3"].map(b => `<button type="button" role="tab" data-b="${b}" aria-selected="${b === getBoard()}">${esc(BOARDS[b].short)}</button>`).join("")}</div>
   ${["uno","esp8266","s3"].map(b => `<div class="bt-panel" data-b="${b}" role="tabpanel">${fn(b)}</div>`).join("")}</div>`;
}
function wiringBlock(sensor){ return boardTabs(b => wiringSVG(sensor, b) + wiringTable(sensor, b), "Wiring for your board"); }
document.addEventListener("click", e => { const t = e.target.closest(".bt-tabs button"); if (t){ setBoard(t.dataset.b); } });
