/* ============ SANDBOX CHALLENGES (virtual board) ============ */
const ledPin = b => ({pin:pinK(b, "LED_PIN"), label:"LED", color:"#E8B84A"});
const buzPin = b => ({pin:pinK(b, "BUZZER_PIN"), label:"Buzzer", color:"#7C3AED"});
const cpp = (b, s) => s.replace(/\{(\w+)\}/g, (m, k) => k === "ADC_MAX" ? BOARDS[b].adcMax + ".0" : k === "VOLTS" ? (b === "uno" ? "5.0" : "3.3") : k === "BOARDID" ? ({s3:"esp32s3", esp8266:"esp8266", uno:"unor4"})[b] : pinK(b, k));
const WIFI_INC = b => b === "s3" ? "#include <WiFi.h>" : b === "esp8266" ? "#include <ESP8266WiFi.h>" : "#include <WiFiS3.h>";
const SB = {
 sb_blink: {id:"sb_blink", title:"Warm-up: blink", sim:8000, task:"This sketch already blinks, but far too fast. Change <b>two numbers</b> so the LED is ON for 0.5 s and OFF for 0.5 s. (Only the numbers inside delay( ) need to change.)", criteria:["The LED blinks at least 5 times in 8 s","Each ON lasts about 500 ms","Each OFF lasts about 500 ms"],
  scenario:b => baseScenario(), pins:[ledPin],
  starter:b => cpp(b, `const int LED_PIN = {LED_PIN};

void setup() {
  pinMode(LED_PIN, OUTPUT);   // the LED pin sends signals out
}

void loop() {
  digitalWrite(LED_PIN, HIGH);  // LED on
  delay(100);                   // CHANGE ME: wait this many milliseconds (1000 ms = 1 s)
  digitalWrite(LED_PIN, LOW);   // LED off
  delay(100);                   // CHANGE ME: wait this many milliseconds
}
`),
  hints:["Half a second is 500 milliseconds (1000 ms = 1 second). The number inside delay( ) is the wait in milliseconds.","There are two delay( ) lines: the first one controls how long the LED stays ON, the second how long it stays OFF. Change both to 500.","Still stuck? Open the “Blink in three steps” lesson above and use step 3 to see what each number does."],
  solution:b => progSource(PROGRAMS.blink.lines, b),
  check:(r, b) => { const p = pinK(b, "LED_PIN"), s = segs(r, p), on = s.filter(x => x.v === 1 && x.full), off = s.filter(x => x.v === 0 && x.between);
   if (!s.some(x => x.v === 1)) return [fail("The LED never turned on.", "Check pinMode(LED_PIN, OUTPUT) in setup() and digitalWrite(LED_PIN, HIGH) in loop(). Is it the LED_PIN you wrote, with matching capital letters?")];
   if (!on.length) return [fail("The LED turned on but never turned off.", "Add digitalWrite(LED_PIN, LOW); followed by a delay.")];
   const out = [], aOn = avg(on.map(x => x.d)), aOff = off.length ? avg(off.map(x => x.d)) : 0;
   out.push(on.length >= 5 ? pass(`The LED blinked ${on.length} times.`) : fail(`The LED blinked only ${on.length} times in 8 s.`, "Each blink should take 1 s in total (0.5 s on + 0.5 s off)."));
   out.push(near(aOn, 500, 60) ? pass(`ON time is about ${Math.round(aOn)} ms.`) : fail(`ON time is about ${Math.round(aOn)} ms; it should be 500 ms.`, "Check the delay right after turning the LED on."));
   out.push(off.length && near(aOff, 500, 60) ? pass(`OFF time is about ${Math.round(aOff)} ms.`) : fail(off.length ? `OFF time is about ${Math.round(aOff)} ms; it should be 500 ms.` : "The LED never stayed off between blinks.", "Add delay(500); after turning the LED off. Without it, loop() turns the LED back on immediately."));
   return out; }},
 sb_pattern: {id:"sb_pattern", title:"Core: a for loop pattern", sim:13000, task:"Blink 3 times quickly (150 ms on, 150 ms off), then pause for 2 s, and repeat. Use a <code>for</code> loop for the 3 blinks.", criteria:["Each quick blink is ON for about 150 ms","Blinks come in groups of exactly 3","Groups are separated by a pause of about 2 s"],
  scenario:b => baseScenario(), pins:[ledPin],
  starter:b => cpp(b, `const int LED_PIN = {LED_PIN};

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // TODO: use a for loop to blink 3 times (150 ms on, 150 ms off)
  for (int i = 0; i < 3; i++) {

  }
  // TODO: pause for 2 seconds
}
`),
  hints:["Inside the for loop: LED on, delay(150), LED off, delay(150). The loop body runs for i = 0, 1, and 2.","After the for loop's closing brace }, add delay(2000);"],
  solution:b => cpp(b, `const int LED_PIN = {LED_PIN};

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  for (int i = 0; i < 3; i++) {     // repeat 3 times: i = 0, 1, 2
    digitalWrite(LED_PIN, HIGH);
    delay(150);
    digitalWrite(LED_PIN, LOW);
    delay(150);
  }
  delay(2000);                        // the long pause after each group
}
`),
  check:(r, b) => { const s = segs(r, pinK(b, "LED_PIN")), ons = s.filter(x => x.v === 1 && x.full);
   if (!ons.length) return [fail("The LED never completed a blink.", "Put digitalWrite(..., HIGH), delay, digitalWrite(..., LOW), delay inside the for loop.")];
   const out = [], aOn = avg(ons.map(x => x.d));
   out.push(near(aOn, 150, 50) ? pass(`Quick blinks are ON for about ${Math.round(aOn)} ms.`) : fail(`Blinks are ON for about ${Math.round(aOn)} ms; they should be 150 ms.`, "Use delay(150) after turning the LED on."));
   const groups = []; let g = 0; s.forEach(x => { if (x.v === 1 && x.full) g++; if (x.v === 0 && x.between && x.d > 1000){ groups.push(g); g = 0; } });
   if (!groups.length) out.push(fail("There is no long pause between groups.", "After the for loop finishes, add delay(2000);"));
   else { const bad = groups.filter(n => n !== 3);
     out.push(!bad.length ? pass(`Every group has exactly 3 blinks (${groups.length} groups).`) : fail(`Some groups have ${bad[0]} blinks instead of 3.`, bad[0] > 3 ? "Check the condition: i < 3 runs 3 times (0, 1, 2); i <= 3 runs 4 times." : "Make sure all 3 blinks happen inside the for loop."));
     const p = avg(s.filter(x => x.v === 0 && x.between && x.d > 1000).map(x => x.d));
     out.push(p >= 1850 && p <= 2450 ? pass(`The pause between groups is about ${(p / 1000).toFixed(2)} s.`) : fail(`The pause between groups is about ${(p / 1000).toFixed(2)} s; it should be about 2 s.`, "Use delay(2000) once, after the for loop.")); }
   return out; }},
 sb_timer: {id:"sb_timer", title:"Boss: two rhythms with millis()", sim:9000, task:"Toggle the LED every 300 ms <b>and</b> print <code>tick</code> every 1000 ms, at the same time. You may not use any <code>delay()</code> longer than 10 ms.", criteria:["The LED changes about every 300 ms","“tick” is printed about every 1000 ms","No delay() longer than 10 ms"],
  scenario:b => baseScenario(), pins:[ledPin],
  starter:b => cpp(b, `const int LED_PIN = {LED_PIN};
unsigned long lastToggle = 0;
unsigned long lastTick = 0;
bool ledOn = false;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  unsigned long now = millis();
  // TODO 1: if 300 ms have passed since lastToggle, update lastToggle and toggle the LED
  // TODO 2: if 1000 ms have passed since lastTick, update lastTick and print "tick"
}
`),
  hints:["Pattern: if (now - lastToggle >= 300) { lastToggle = now; ledOn = !ledOn; digitalWrite(LED_PIN, ledOn ? HIGH : LOW); }","Make a second, separate if block for the 1000 ms timer, with Serial.println(\"tick\");"],
  solution:b => cpp(b, `const int LED_PIN = {LED_PIN};
unsigned long lastToggle = 0;
unsigned long lastTick = 0;
bool ledOn = false;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  unsigned long now = millis();
  if (now - lastToggle >= 300) {      // timer 1: the LED
    lastToggle = now;
    ledOn = !ledOn;
    digitalWrite(LED_PIN, ledOn ? HIGH : LOW);
  }
  if (now - lastTick >= 1000) {       // timer 2: the message
    lastTick = now;
    Serial.println("tick");
  }
}
`),
  check:(r, b) => { const out = [], s = segs(r, pinK(b, "LED_PIN")).filter(x => x.full), ticks = serLines(r).filter(x => x.s === "tick");
   out.push(s.length >= 10 && near(avg(s.map(x => x.d)), 300, 40) ? pass(`The LED changes about every ${Math.round(avg(s.map(x => x.d)))} ms.`) : fail(s.length ? `The LED changes about every ${Math.round(avg(s.map(x => x.d)))} ms, ${s.length} times.` : "The LED never changed.", "Use if (now - lastToggle >= 300) { lastToggle = now; ... }"));
   const gaps = ticks.slice(1).map((x, i) => x.t - ticks[i].t);
   out.push(ticks.length >= 6 && near(avg(gaps), 1000, 60) ? pass(`“tick” is printed every ${Math.round(avg(gaps))} ms.`) : fail(`“tick” was printed ${ticks.length} times${gaps.length ? `, about every ${Math.round(avg(gaps))} ms` : ""}.`, "Print exactly the word tick with Serial.println(\"tick\"); inside its own 1000 ms timer."));
   out.push(r.maxDelay <= 10 ? pass(r.maxDelay ? `Longest delay: ${r.maxDelay} ms (allowed).` : "No delay() used.") : fail(`Your code uses delay(${r.maxDelay}).`, "With delay(), the board cannot do anything else while it waits. Use millis() timers instead."));
   return out; }},
 sb_dht: {id:"sb_dht", title:"DHT: clean CSV with error handling", sim:16000, scenarioText:"29–30 °C, about 68 % humidity. Between 6 and 9 s the sensor's wire is loose and every read fails.", task:"Print the header <code>temp_C,hum_pct</code> once, then one row every 2 s with temperature and humidity (one decimal). When a reading fails, print a line starting with <code>#</code> instead of a data row.", criteria:["The header is printed exactly once, first","A row with 2 numbers appears every 2 s","No row contains nan (failed reads become # lines)","The sensor is not read faster than every 2 s"],
  scenario:b => baseScenario({dhtfail:{base:0, steps:[[6000,9000,1]]}}), plot:["temp","hum"],
  starter:b => cpp(b, `#include <DHT.h>

const int DHT_PIN = {DHT_PIN};
DHT dht(DHT_PIN, DHT22);
unsigned long lastRead = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();
  // TODO 1: print the CSV header temp_C,hum_pct
}

void loop() {
  if (millis() - lastRead >= 2000) {
    lastRead = millis();
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    // TODO 2: if t or h is not a number (isnan), print a line starting with # and return
    // TODO 3: print t and h with one decimal, separated by a comma
  }
}
`),
  hints:["Header: Serial.println(\"temp_C,hum_pct\"); inside setup(), so it runs once.","if (isnan(t) || isnan(h)) { Serial.println(\"# read failed\"); return; }","Serial.print(t, 1); Serial.print(\",\"); Serial.println(h, 1);"],
  solution:b => cpp(b, `#include <DHT.h>

const int DHT_PIN = {DHT_PIN};
DHT dht(DHT_PIN, DHT22);
unsigned long lastRead = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("temp_C,hum_pct");
}

void loop() {
  if (millis() - lastRead >= 2000) {
    lastRead = millis();
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (isnan(t) || isnan(h)) {
      Serial.println("# read failed");
      return;
    }
    Serial.print(t, 1);
    Serial.print(",");
    Serial.println(h, 1);
  }
}
`),
  check:r => { const L = serLines(r), out = [];
   if (!L.length) return [fail("Nothing was printed.", "Use Serial.begin(115200) in setup() and Serial.println(...) to print.")];
   const hc = L.filter(x => x.s.replace(/\s/g, "") === "temp_C,hum_pct").length;
   out.push(L[0].s.replace(/\s/g, "") === "temp_C,hum_pct" && hc === 1 ? pass("The header is printed once, first.") : fail(hc > 1 ? `The header was printed ${hc} times.` : `The first line is “${L[0].s}”, not the header.`, "Print the header in setup(), not in loop()."));
   const rows = L.filter(x => /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(x.s.replace(/\s/g, "")));
   const gaps = rows.slice(1).map((x, i) => x.t - rows[i].t).filter(g => g < 3000);
   out.push(rows.length >= 5 && near(avg(gaps), 2000, 200) ? pass(`${rows.length} data rows, about every ${Math.round(avg(gaps))} ms.`) : fail(`${rows.length} correct data rows were printed.`, "Each row must be exactly two numbers separated by a comma, e.g. 29.4,68.2, every 2000 ms."));
   const nan = L.filter(x => /nan/i.test(x.s) && !x.s.startsWith("#"));
   out.push(!nan.length ? pass("Failed reads did not produce nan rows.") : fail(`${nan.length} line(s) contain nan.`, "Check with isnan() BEFORE printing, and return early when a reading fails."));
   const notes = L.filter(x => x.s.startsWith("#") && x.t >= 5900 && x.t <= 9100);
   out.push(notes.length ? pass("Failed reads were reported with # lines.") : fail("No # line appeared while the wire was loose (6–9 s).", "Print a line starting with # when isnan(t) || isnan(h)."));
   if (r.dhtFast) out.push(fail("The sensor was read faster than every 2 s.", "Only read inside the 2-second timer."));
   return out; }},
 sb_sonar: {id:"sb_sonar", title:"HC-SR04: parking-distance warning", sim:12000, scenarioText:"An object starts 80 cm away, moves to 10 cm between 2 and 6 s, stays until 9 s, then moves back to 60 cm.", task:"Print the distance in cm about 10 times per second. Turn the LED ON when the object is closer than 20 cm, OFF otherwise.", criteria:["Printed distances match the real distance (±2 cm)","The LED is ON while the object is closer than 20 cm","The LED is OFF when it is farther away"],
  scenario:b => baseScenario({dist:{base:80, ramp:[[2000,6000,80,10,1]], steps:[[9000,1e9,60]]}}), plot:["dist"], pins:[ledPin],
  starter:b => cpp(b, `const int TRIG_PIN = {TRIG_PIN};
const int ECHO_PIN = {ECHO_PIN};
const int LED_PIN = {LED_PIN};

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
}

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  unsigned long us = pulseIn(ECHO_PIN, HIGH, 30000UL);
  if (us == 0) return -1;
  // TODO 1: convert microseconds to centimeters (speed of sound 0.0343 cm/us, there and back)
  return 0;
}

void loop() {
  float d = readDistanceCm();
  Serial.println(d, 1);
  // TODO 2: LED on if 0 <= d < 20, otherwise off
  delay(100);
}
`),
  hints:["return us * 0.0343 / 2.0;  The sound travels to the object AND back, so divide by 2.","if (d >= 0 && d < 20) { digitalWrite(LED_PIN, HIGH); } else { digitalWrite(LED_PIN, LOW); }"],
  solution:b => cpp(b, `const int TRIG_PIN = {TRIG_PIN};
const int ECHO_PIN = {ECHO_PIN};
const int LED_PIN = {LED_PIN};

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
}

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  unsigned long us = pulseIn(ECHO_PIN, HIGH, 30000UL);
  if (us == 0) return -1;
  return us * 0.0343 / 2.0;
}

void loop() {
  float d = readDistanceCm();
  Serial.println(d, 1);
  if (d >= 0 && d < 20) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(100);
}
`),
  check:(r, b) => { const L = serLines(r).map(x => ({t:x.t, n:numsIn(x.s)})).filter(x => x.n.length), out = [];
   const truth = t => t < 2000 ? 80 : t < 6000 ? 80 - 70 * (t - 2000) / 4000 : t < 9000 ? 10 : 60;
   if (r.pulseCalls === 0) return [fail("pulseIn() was never called.", "Keep the readDistanceCm() function and call it in loop().")];
   const good = L.filter(x => Math.abs(x.n[0] - truth(x.t)) <= 2);
   out.push(L.length >= 40 && good.length / L.length > 0.9 ? pass(`${good.length} of ${L.length} printed distances match the real distance.`) : fail(L.length ? `Only ${good.length} of ${L.length} printed distances match the real distance. Example: printed ${L[Math.min(5, L.length - 1)].n[0]} cm when it was ${truth(L[Math.min(5, L.length - 1)].t).toFixed(1)} cm.` : "No distances were printed.", "Distance (cm) = microseconds × 0.0343 ÷ 2."));
   const p = pinK(b, "LED_PIN");
   out.push(pinAt(r, p, 7000) && pinAt(r, p, 8800) ? pass("The LED is ON while the object is 10 cm away.") : fail("The LED was not ON while the object was 10 cm away (6–9 s).", "Turn it on when d >= 0 && d < 20."));
   out.push(!pinAt(r, p, 1500) && !pinAt(r, p, 11000) ? pass("The LED is OFF when the object is far.") : fail("The LED was ON when the object was far.", "Add an else branch that turns the LED off."));
   return out; }},
 sb_ldr: {id:"sb_ldr", title:"Light: calibrated night light", sim:15000, scenarioText:"Normal room light. A hand covers the LDR from 4 to 7 s; a flashlight shines on it from 11 to 13 s.", task:b => `Calibrate the reading to 0–100 % and print it twice per second. Turn the LED ON when light is below 30 %. In this virtual world the raw reading is about <b>${b === "s3" ? 279 : 70}</b> when covered and <b>${b === "s3" ? 3854 : 963}</b> under the flashlight: use those as your calibration values.`, criteria:["Printed light % stays between 0 and 100","The LED is ON while the LDR is covered","The LED is OFF in normal light and under the flashlight"],
  scenario:b => baseScenario({light:{base:55, steps:[[4000,7000,6],[11000,13000,96]]}}), plot:["light"], pins:[ledPin],
  starter:b => cpp(b, `const int LDR_PIN = {LDR_PIN};
const int LED_PIN = {LED_PIN};
int rawDark = 0;      // TODO 1: your covered reading
int rawBright = 0;    // TODO 1: your flashlight reading

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int raw = analogRead(LDR_PIN);
  // TODO 2: float pct = ... (two-point calibration), then constrain it to 0..100
  // TODO 3: print pct; LED on if pct < 30, otherwise off
  delay(500);
}
`),
  hints:["float pct = (raw - rawDark) * 100.0 / (rawBright - rawDark);  pct = constrain(pct, 0, 100);","Serial.println(pct, 1);  then  digitalWrite(LED_PIN, pct < 30 ? HIGH : LOW);"],
  solution:b => cpp(b, `const int LDR_PIN = {LDR_PIN};
const int LED_PIN = {LED_PIN};
int rawDark = ${b === "s3" ? 279 : 70};
int rawBright = ${b === "s3" ? 3854 : 963};

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int raw = analogRead(LDR_PIN);
  float pct = (raw - rawDark) * 100.0 / (rawBright - rawDark);
  pct = constrain(pct, 0, 100);
  Serial.println(pct, 1);
  digitalWrite(LED_PIN, pct < 30 ? HIGH : LOW);
  delay(500);
}
`),
  check:(r, b) => { const L = serLines(r).map(x => numsIn(x.s)).filter(n => n.length), out = [], p = pinK(b, "LED_PIN");
   const vals = L.map(n => n[n.length - 1]);
   out.push(vals.length >= 20 && vals.every(v => v >= 0 && v <= 100) ? pass("Every printed value is between 0 and 100 %.") : fail(vals.length ? `A printed value of ${Math.max(...vals) > 100 ? Math.max(...vals) : Math.min(...vals)} is outside 0–100.` : "No light values were printed.", "Use the calibration formula, then pct = constrain(pct, 0, 100);"));
   out.push(pinAt(r, p, 5200) && pinAt(r, p, 6800) ? pass("The LED is ON while the LDR is covered.") : fail("The LED was not ON while the LDR was covered (4–7 s).", "Check rawDark and rawBright, and the comparison pct < 30."));
   out.push(!pinAt(r, p, 2500) && !pinAt(r, p, 9000) && !pinAt(r, p, 12200) ? pass("The LED is OFF in normal light and under the flashlight.") : fail("The LED was ON when it was bright.", "Turn it off in the else case, and check that rawBright is bigger than rawDark."));
   return out; }},
 sb_mq: {id:"sb_mq", title:"MQ-135: ventilation alarm", sim:16000, scenarioText:"Clean air, then someone sprays a cleaning product near the sensor from 9 to 13 s. Warm-up is shortened to 3 s in the sandbox.", task:"After the warm-up and baseline, sound the buzzer while the reading is at least 1.5 × the baseline, and print <code>ratio</code> each second. The buzzer must stay silent during warm-up.", criteria:["The buzzer is silent during warm-up and in clean air","The buzzer sounds while the gas is present","Ratios are printed with 2 decimals"],
  scenario:b => baseScenario({adcSensor:"gas", gas:{base:0.18, steps:[[9000,13000,0.36]]}}), plot:["gas"], pins:[buzPin],
  starter:b => cpp(b, `const int MQ_PIN = {MQ_PIN};
const int BUZZER_PIN = {BUZZER_PIN};
const unsigned long WARMUP_MS = 3000;   // shortened for the sandbox
const int BASELINE_SAMPLES = 3;
float baseline = 0;
int baselineCount = 0;
unsigned long lastRead = 0;

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  if (millis() - lastRead < 1000) return;
  lastRead = millis();
  int raw = analogRead(MQ_PIN);
  if (millis() < WARMUP_MS) return;
  if (baselineCount < BASELINE_SAMPLES) {
    baseline += raw;
    baselineCount++;
    if (baselineCount == BASELINE_SAMPLES) baseline = baseline / BASELINE_SAMPLES;
    return;
  }
  // TODO 1: float ratio = ...
  // TODO 2: print ratio with 2 decimals
  // TODO 3: buzzer on if ratio >= 1.5, otherwise off
}
`),
  hints:["float ratio = raw / baseline;","Serial.println(ratio, 2);  digitalWrite(BUZZER_PIN, ratio >= 1.5 ? HIGH : LOW);"],
  solution:b => SB.sb_mq.starter(b).replace("  // TODO 1: float ratio = ...\n  // TODO 2: print ratio with 2 decimals\n  // TODO 3: buzzer on if ratio >= 1.5, otherwise off\n", "  float ratio = raw / baseline;\n  Serial.println(ratio, 2);\n  digitalWrite(BUZZER_PIN, ratio >= 1.5 ? HIGH : LOW);\n"),
  check:(r, b) => { const p = pinK(b, "BUZZER_PIN"), out = [], L = serLines(r).filter(x => /^\d+\.\d{2}$/.test(x.s));
   out.push(!pinAt(r, p, 2500) && !pinAt(r, p, 7500) && !pinAt(r, p, 15000) ? pass("Silent during warm-up and in clean air.") : fail("The buzzer sounded in clean air or during warm-up.", "Only switch it on when ratio >= 1.5; switch it off otherwise."));
   out.push(pinAt(r, p, 10500) && pinAt(r, p, 12500) ? pass("The buzzer sounds while the gas is present.") : fail("The buzzer did not sound while the gas was present (9–13 s).", "ratio = raw / baseline, then compare with 1.5."));
   out.push(L.length >= 8 ? pass(`${L.length} ratios printed with 2 decimals.`) : fail("Ratios were not printed with 2 decimals.", "Serial.println(ratio, 2);"));
   return out; }},
 sb_wifi: {id:"sb_wifi", title:"Wi-Fi: connect and stay connected", sim:20000, scenarioText:"A 2.4 GHz network named IoT-Lab-2G with password breadboard2browser. The router restarts between 9 and 11 s.", task:"Fill in the network name and password, connect with a 20-second timeout, print the IP address, and every 5 s print <code>online</code> or <code>offline</code>; reconnect if offline.", criteria:["The board connects and prints its IP address","The board notices when the connection drops","The board is connected again at the end"],
  scenario:b => baseScenario({net:{ssid:"IoT-Lab-2G", pass:"breadboard2browser", drop:[9000, 11000]}}),
  starter:b => `${WIFI_INC(b)}

const char* WIFI_SSID = "YOUR_WIFI_NAME";      // TODO 1
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";  // TODO 1
unsigned long lastCheck = 0;

void connectWiFi() {
  Serial.print("Connecting");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long start = millis();
  // TODO 2: wait while not connected AND less than 20000 ms have passed (print a dot every 500 ms)
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(" IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(" failed");
  }
}

void setup() {
  Serial.begin(115200);
  connectWiFi();
}

void loop() {
  if (millis() - lastCheck >= 5000) {
    lastCheck = millis();
    // TODO 3: print "online" if connected; otherwise print "offline" and call connectWiFi()
  }
}
`,
  hints:["The network is “IoT-Lab-2G” and the password “breadboard2browser” (capital letters matter).","while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) { delay(500); Serial.print(\".\"); }","if (WiFi.status() == WL_CONNECTED) { Serial.println(\"online\"); } else { Serial.println(\"offline\"); connectWiFi(); }"],
  solution:b => SB.sb_wifi.starter(b).replace("\"YOUR_WIFI_NAME\";      // TODO 1", "\"IoT-Lab-2G\";").replace("\"YOUR_WIFI_PASSWORD\";  // TODO 1", "\"breadboard2browser\";").replace("  // TODO 2: wait while not connected AND less than 20000 ms have passed (print a dot every 500 ms)\n", "  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {\n    delay(500);\n    Serial.print(\".\");\n  }\n").replace("    // TODO 3: print \"online\" if connected; otherwise print \"offline\" and call connectWiFi()\n", "    if (WiFi.status() == WL_CONNECTED) {\n      Serial.println(\"online\");\n    } else {\n      Serial.println(\"offline\");\n      connectWiFi();\n    }\n"),
  check:r => { const L = serLines(r), out = [];
   out.push(L.some(x => x.s.includes("192.168.1.42") && x.t < 8000) ? pass("Connected and printed the IP address.") : fail(L.some(x => /failed/.test(x.s)) ? "The board could not connect." : "No IP address was printed.", "Check the network name and password exactly, and wait in a while loop until WiFi.status() == WL_CONNECTED."));
   out.push(L.some(x => /offline/i.test(x.s) && x.t >= 9000 && x.t <= 11600) ? pass("The board noticed the drop.") : fail("The board did not report “offline” while the router was restarting (9–11 s).", "Every 5 s, check WiFi.status() and print offline when it is not WL_CONNECTED."));
   out.push(r.wifiState === 2 && L.slice(-1)[0] && /online|IP/.test(L.slice(-1)[0].s) ? pass("Connected again at the end.") : fail("The board was not connected at the end.", "When offline, call connectWiFi() again."));
   return out; }},
 sb_logger: {id:"sb_logger", title:"Logger: send readings to the web app", sim:34000, scenarioText:"Wi-Fi “IoT-Lab-2G” is ready. A virtual Apps Script web app is listening; its API key is <code>classroom-key</code>.", task:"Every 10 s (and once right after connecting), send the DHT temperature and humidity to the web app as <code>temp_c</code> and <code>hum_pct</code>, with your API key and a device ID. Print each reply.", criteria:["Each request is accepted (reply starts with OK)","Both temp_c and hum_pct rows reach the Sheet","Requests are about 10 s apart, never faster"],
  scenario:b => baseScenario({net:{ssid:"IoT-Lab-2G", pass:"breadboard2browser"}}), plot:["temp","hum"],
  starter:b => progSource(PROGRAMS.hello.lines, b).replace(/\/\/ P11[^\n]*\n/, "// Logger challenge\n#include <DHT.h>\n").replace("\"YOUR_WIFI_NAME\"", "\"IoT-Lab-2G\"").replace("\"YOUR_WIFI_PASSWORD\"", "\"breadboard2browser\"").replace("\"classroom-key\"", "\"change-me\"").replace(/void setup\(\) \{[\s\S]*$/, cpp(b, `DHT dht({DHT_PIN}, DHT22);
unsigned long lastSend = 0;
bool firstSend = true;

void setup() {
  Serial.begin(115200);
  dht.begin();
  connectWiFi();
}

void loop() {
  if (firstSend || millis() - lastSend >= 10000) {
    firstSend = false;
    lastSend = millis();
    connectWiFi();
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (isnan(t) || isnan(h)) return;
    // TODO 1: set API_KEY above to the web app's key
    // TODO 2: build the URL with key, device_id, temp_c (1 decimal) and hum_pct (1 decimal)
    String url = SCRIPT_URL + "?key=" + API_KEY + "&device_id=" + DEVICE_ID;
    Serial.print("Reply: ");
    Serial.println(httpsGet(url));
  }
}
`)),
  hints:["const String API_KEY = \"classroom-key\";","url += \"&temp_c=\" + String(t, 1) + \"&hum_pct=\" + String(h, 1);"],
  solution:b => SB.sb_logger.starter(b).replace("\"change-me\"", "\"classroom-key\"").replace("    String url = SCRIPT_URL + \"?key=\" + API_KEY + \"&device_id=\" + DEVICE_ID;", "    String url = SCRIPT_URL + \"?key=\" + API_KEY + \"&device_id=\" + DEVICE_ID\n               + \"&temp_c=\" + String(t, 1) + \"&hum_pct=\" + String(h, 1);"),
  check:r => { const out = [], ins = r.net.filter(x => x.dir === "in" && /^HTTP/.test(x.text)), outs = r.net.filter(x => x.dir === "out");
   const bad = ins.filter(x => /ERR/.test(x.text));
   out.push(outs.length >= 3 && !bad.length ? pass(`${outs.length} requests accepted.`) : fail(bad.length ? `The web app replied: ${bad[0].text.replace(/^HTTP \d+\s+/, "")}` : `Only ${outs.length} request(s) were sent.`, bad.length && /key/.test(bad[0].text) ? "The API key must be exactly classroom-key." : bad.length && /no_readings|bad_value/.test(bad[0].text) ? "Add &temp_c=...&hum_pct=... with numbers (String(t, 1))." : "Send once after connecting, then every 10 s."));
   const names = new Set(r.rows.map(x => x[2])); out.push(names.has("temp_c") && names.has("hum_pct") ? pass("temp_c and hum_pct rows reached the Sheet.") : fail("The Sheet is missing temp_c or hum_pct rows.", "Use exactly these parameter names: temp_c and hum_pct."));
   const gaps = outs.slice(1).map((x, i) => x.t - outs[i].t); out.push(gaps.length >= 2 && gaps.every(g => g >= 9500) ? pass(`Requests are about ${Math.round(avg(gaps) / 1000)} s apart.`) : fail("Requests were sent too often (or not repeated).", "Send every 10,000 ms; Apps Script has daily limits, and sending too fast wastes them."));
   return out; }}
};
