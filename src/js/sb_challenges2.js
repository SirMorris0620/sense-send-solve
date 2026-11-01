/* ============ SANDBOX CHALLENGES, PART 2: inputs, outputs, motors, the five IoT tracks, and data science ============ */
const sc = (parts, extra) => baseScenario(Object.assign({parts}, extra || {}));
const pinAtT = (r, pin, t) => pinAt(r, pin, t);
const btnPin = b => ({pin:pinK(b, "BTN_PIN"), label:"Button", color:"#2563EB"});
const inc = {servo: b => b === "s3" ? "#include <ESP32Servo.h>" : "#include <Servo.h>"};
/* the kept challenges from the base set need their parts declared (so each pin gets the right role) */
(function(){ const w = (id, parts) => { const o = SB[id].scenario; SB[id].scenario = b => Object.assign(o(b), {parts}); };
  w("sb_blink", ["led"]); w("sb_pattern", ["led"]); w("sb_timer", ["led"]); w("sb_dht", ["dht"]); w("sb_sonar", ["hcsr04", "led"]); w("sb_ldr", ["ldr", "led"]); w("sb_mq", ["mq", "buzzer"]); w("sb_wifi", []); w("sb_logger", ["dht"]); })();
const bugged = (src, pairs) => pairs.reduce((s, p) => { if (s.indexOf(p[0]) < 0) throw new Error("bug marker missing: " + p[0]); return s.replace(p[0], p[1]); }, src);
const rowsOf = (r, k) => (r.cloud && r.cloud[k]) || [];
const hasErr = r => (r.net || []).filter(x => x.dir === "in" && /HTTP (4|5)\d\d/.test(x.text));

SB.sb_button = {id:"sb_button", title:"Button: toggle an LED", sim:8000, scenarioText:"The button is pressed at 1 s, 2.5 s, 4 s and 5.5 s. At 4 s the contacts bounce for a few milliseconds, like a real button.",
 task:"Each time the button is pressed, flip the LED (on, off, on, off…). One press must flip the LED exactly once, even when the contacts bounce. Use <code>INPUT_PULLUP</code> (pressed reads LOW).",
 criteria:["The LED turns on after the first press", "The LED flips exactly once per press (4 presses = 4 changes)", "The bounce at 4 s does not cause extra flips"],
 scenario:b => sc(["button", "led"], {button:pinK(b, "BTN_PIN"), press:{base:0, steps:[[1000, 1250, 1], [2500, 2750, 1], [4000, 4003, 1], [4005, 4007, 1], [4009, 4300, 1], [5500, 5750, 1]]}}), pins:[ledPin, btnPin],
 starter:b => cpp(b, `const int BTN_PIN = {BTN_PIN};
const int LED_PIN = {LED_PIN};
bool ledOn = false;
int lastState = HIGH;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  // TODO 1: set up the button pin with the internal pull-up resistor
}

void loop() {
  int state = digitalRead(BTN_PIN);
  // TODO 2: if the button was JUST pressed (lastState was HIGH and state is LOW),
  //         flip ledOn and write it to the LED
  // TODO 3: after a press, wait a short time to ignore contact bounce
  lastState = state;
}
`),
 hints:["pinMode(BTN_PIN, INPUT_PULLUP); turns on the built-in resistor, so an unpressed button reads HIGH.", "A press is the moment lastState == HIGH && state == LOW. Inside that if: ledOn = !ledOn; digitalWrite(LED_PIN, ledOn ? HIGH : LOW);", "Bounce lasts a few milliseconds. delay(30); inside the if block hides it."],
 solution:b => progSource(PROGRAMS.button.lines, b),
 check:(r, b) => { const ev = pinEvents(r, pinK(b, "LED_PIN")); const out = [];
  if (!ev.length) return [fail("The LED never changed.", "Check pinMode(BTN_PIN, INPUT_PULLUP) and the if (lastState == HIGH && state == LOW) test.")];
  out.push(ev[0].v === 1 && near(ev[0].t, 1000, 250) ? pass("The LED turned on right after the first press.") : fail("The first change should be ON, just after 1 s.", "Check you flip ledOn on a press, not on a release."));
  out.push(ev.length === 4 ? pass("4 presses made exactly 4 changes.") : fail(`${ev.length} changes for 4 presses.`, ev.length > 4 ? "Too many: one press is flipping more than once. Add a short delay after a press to ignore bounce, and only act on the HIGH → LOW edge." : "Some presses were missed. Do not use a long delay() in loop()."));
  const alt = ev.every((e, i) => e.v === (i % 2 === 0 ? 1 : 0)); out.push(alt ? pass("It alternates on, off, on, off.") : fail("The LED did not alternate cleanly.", "Use ledOn = !ledOn so every press reverses the last state."));
  return out; }};

SB.sb_fade = {id:"sb_fade", title:"PWM: breathing LED", sim:7000, scenarioText:"No inputs: just the LED.",
 task:"Make the LED fade smoothly from off to full brightness and back to off, forever. Use <code>analogWrite(pin, 0…255)</code> in a <code>for</code> loop.",
 criteria:["The brightness reaches full (250 or more)", "It uses many levels (a smooth fade, not just on/off)", "It fades back down to almost off"],
 scenario:b => sc(["led"]), pins:[ledPin],
 starter:b => cpp(b, `const int LED_PIN = {LED_PIN};

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // TODO 1: a for loop that raises level from 0 to 255 in steps of 5,
  //         writing it with analogWrite and waiting 20 ms each step
  // TODO 2: a second for loop that lowers it back to 0
}
`),
 hints:["for (int level = 0; level <= 255; level += 5) { ... }", "Inside the loop: analogWrite(LED_PIN, level); delay(20);", "The second loop counts down: for (int level = 255; level >= 0; level -= 5)"],
 solution:b => progSource(PROGRAMS.fade.lines, b),
 check:(r, b) => { const d = extOf(r, "pwm", pinK(b, "LED_PIN")).map(e => e.duty), out = []; if (!d.length) return [fail("No PWM output yet.", "Use analogWrite(LED_PIN, level); the LED pin must support PWM.")];
  const mx = Math.max(...d), k = d.indexOf(mx);
  out.push(mx >= 250 ? pass(`Full brightness reached (${mx}).`) : fail(`The brightest level was ${mx}.`, "The loop should count up to 255."));
  out.push(new Set(d).size >= 20 ? pass(`${new Set(d).size} different brightness levels.`) : fail("Only a few brightness levels were used.", "analogWrite() takes 0 to 255. Change the level a little each step."));
  out.push(d.slice(k).some(x => x <= 10) ? pass("It fades back down.") : fail("It never fades back down.", "Add a second loop that counts level down from 255 to 0."));
  return out; }};

SB.sb_rgb = {id:"sb_rgb", title:"RGB LED: colour sequence", sim:6000, scenarioText:"A common-cathode RGB LED (bigger number = brighter).",
 task:"Show <b>red</b> for 1 s, then <b>green</b> for 1 s, then <b>blue</b> for 1 s, then <b>white</b> for 1 s. Repeat forever. Write a helper function <code>setColor(r, g, b)</code>.",
 criteria:["0–1 s: red", "1–2 s: green", "2–3 s: blue", "3–4 s: white (all three on)"],
 scenario:b => sc(["rgb"]), pins:[],
 starter:b => cpp(b, `const int RED_PIN = {RED_PIN};
const int GREEN_PIN = {GREEN_PIN};
const int BLUE_PIN = {BLUE_PIN};

// TODO 1: write setColor(int r, int g, int b) that sends the three levels with analogWrite

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
}

void loop() {
  // TODO 2: red for 1 s, green for 1 s, blue for 1 s, white for 1 s
}
`),
 hints:["void setColor(int r, int g, int b) { analogWrite(RED_PIN, r); analogWrite(GREEN_PIN, g); analogWrite(BLUE_PIN, b); }", "Red is setColor(255, 0, 0); then delay(1000);"],
 solution:b => cpp(b, `const int RED_PIN = {RED_PIN};
const int GREEN_PIN = {GREEN_PIN};
const int BLUE_PIN = {BLUE_PIN};

void setColor(int r, int g, int bl) {
  analogWrite(RED_PIN, r);
  analogWrite(GREEN_PIN, g);
  analogWrite(BLUE_PIN, bl);
}

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
}

void loop() {
  setColor(255, 0, 0);
  delay(1000);
  setColor(0, 255, 0);
  delay(1000);
  setColor(0, 0, 255);
  delay(1000);
  setColor(255, 255, 255);
  delay(1000);
}
`),
 check:(r, b) => { const P = ["RED_PIN", "GREEN_PIN", "BLUE_PIN"].map(k => pinK(b, k)), col = t => P.map(p => dutyAt(r, p, t)), hi = v => v >= 200, lo = v => v <= 40;
  const want = [[500, "red", [1, 0, 0]], [1500, "green", [0, 1, 0]], [2500, "blue", [0, 0, 1]], [3500, "white", [1, 1, 1]]];
  return want.map(([t, nm, w]) => { const c = col(t), ok = c.every((v, i) => w[i] ? hi(v) : lo(v)); return ok ? pass(`At ${t / 1000} s the LED is ${nm} (${c.join(", ")}).`) : fail(`At ${t / 1000} s the LED should be ${nm}, but the levels are ${c.join(", ")}.`, "Check the order of your setColor calls and the delay(1000) after each."); }); }};

SB.sb_buzzer = {id:"sb_buzzer", title:"Buzzer: three notes", sim:7000, scenarioText:"A passive piezo buzzer: it plays whatever frequency you ask for.",
 task:"Play three notes in order: <b>262 Hz</b>, <b>294 Hz</b>, <b>330 Hz</b>, each starting 300 ms after the one before. Then stay silent for 2 s and repeat.",
 criteria:["The notes are 262, 294 and 330 Hz in that order", "The notes start about 300 ms apart", "A silent gap of about 2 s follows the third note"],
 scenario:b => sc(["buzzer"]), pins:[buzPin],
 starter:b => cpp(b, `const int BUZZER_PIN = {BUZZER_PIN};

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  // TODO: tone(BUZZER_PIN, frequency, duration); then delay(300); for each note
  //       then a 2-second silence
}
`),
 hints:["tone(BUZZER_PIN, 262, 250); plays 262 Hz for 250 ms and returns immediately.", "tone() does not wait: add delay(300); after each note so the next one starts on time."],
 solution:b => cpp(b, `const int BUZZER_PIN = {BUZZER_PIN};

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  tone(BUZZER_PIN, 262, 250);
  delay(300);
  tone(BUZZER_PIN, 294, 250);
  delay(300);
  tone(BUZZER_PIN, 330, 250);
  delay(300);
  delay(2000);
}
`),
 check:(r, b) => { const st = extOf(r, "tone", pinK(b, "BUZZER_PIN")).filter(e => e.f > 0); if (!st.length) return [fail("No sound was played.", "Use tone(BUZZER_PIN, frequency, duration).")];
  const f = st.slice(0, 3).map(e => e.f), out = [];
  out.push(f.length === 3 && f[0] === 262 && f[1] === 294 && f[2] === 330 ? pass("The notes are 262, 294, 330 Hz.") : fail(`The first notes were ${f.join(", ")} Hz.`, "Play exactly 262, then 294, then 330."));
  const g1 = st[1] ? st[1].t - st[0].t : 0, g2 = st[2] ? st[2].t - st[1].t : 0; out.push(near(g1, 300, 80) && near(g2, 300, 80) ? pass("Notes start 300 ms apart.") : fail(`Notes start ${Math.round(g1)} ms and ${Math.round(g2)} ms apart.`, "tone() returns at once, so use delay(300) after each note."));
  const gap = st[3] ? st[3].t - st[2].t : 0; out.push(gap >= 2000 ? pass(`Silence of about ${Math.round((gap - 300) / 100) / 10} s before the next round.`) : fail(st[3] ? `Only ${Math.round(gap)} ms between the third note and the next round.` : "The melody did not repeat.", "Add delay(2000); after the third note."));
  return out; }};

SB.sb_tmp36 = {id:"sb_tmp36", title:"TMP36: temperature in °C", sim:13000, scenarioText:"The room is 24 °C and warms to 33 °C between 3 s and 9 s.",
 task:b => `Read the TMP36 and print <code>Temperature: 24.3 C</code> (one decimal) once per second. Convert the ADC number to volts (the largest number is ${BOARDS[b].adcMax} at ${BOARDS[b].logic} V), then to °C with <code>(volts − 0.5) × 100</code>.`,
 criteria:["A line is printed about once per second", "Every value is within 1.2 °C of the true room temperature"],
 scenario:b => sc(["tmp36"], {temp:{base:24, ramp:[[3000, 9000, 24, 33, true]]}}), pins:[],
 starter:b => cpp(b, `const int TMP_PIN = {TMP_PIN};
const float VOLTS = {VOLTS};      // volts at the largest ADC number
const float ADC_MAX = {ADC_MAX};  // the largest ADC number

void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(TMP_PIN);
  // TODO 1: volts = raw * VOLTS / ADC_MAX
  // TODO 2: tempC = (volts - 0.5) * 100.0
  // TODO 3: print "Temperature: " then tempC with 1 decimal, then " C"
  delay(1000);
}
`),
 hints:["float volts = raw * VOLTS / ADC_MAX;", "float tempC = (volts - 0.5) * 100.0; (the TMP36 gives 0.5 V at 0 °C and +10 mV per °C)", "Serial.print(tempC, 1); prints one decimal place."],
 solution:b => progSource(PROGRAMS.tmp36.lines, b),
 check:(r, b) => { const L = r.ser.filter(x => /temp/i.test(x.text) && numsIn(x.text).length).map(x => ({t:x.t, n:numsIn(x.text)})); if (!L.length) return [fail("Nothing like “Temperature: 24.3 C” was printed.", "Print a label, the number, and the unit.")];
  const bad = L.filter(x => Math.abs(x.n[0] - scenVal(r.S || SB.sb_tmp36.scenario(b), "temp", x.t)) > 1.2), out = [];
  out.push(L.length >= 10 ? pass(`${L.length} readings printed.`) : fail(`Only ${L.length} readings in 13 s.`, "Print once per second with delay(1000)."));
  out.push(!bad.length ? pass("All readings match the real temperature.") : fail(`${bad.length} reading(s) are off by more than 1.2 °C (for example ${bad[0].n[0]}).`, "Check the two conversion steps: raw → volts → °C. The offset is 0.5 V."));
  return out; }};

SB.sb_pir = {id:"sb_pir", title:"PIR: hallway light with a timer", sim:30000, scenarioText:"The PIR needs 3 s to warm up (it flickers until then). People walk past at 6 s and at 18 s. The sensor holds its output HIGH for 2 s after the last movement.",
 task:"Turn the LED ON when the PIR sees motion and keep it on for <b>5 s after the PIR output falls</b>. Ignore the PIR for the first 3.5 s. Use <code>millis()</code> for the 5 s timer, not <code>delay()</code>.",
 criteria:["The LED stays OFF during the warm-up flicker", "The LED is ON soon after motion starts", "It stays ON for 5 s after the PIR output falls", "Then it turns OFF"],
 scenario:b => sc(["pir", "led"], {pir:{warm:3000, hold:2000, steps:[[6000, 7500, 1], [18000, 19000, 1]]}}), pins:[ledPin],
 starter:b => cpp(b, `const int PIR_PIN = {PIR_PIN};
const int LED_PIN = {LED_PIN};
unsigned long lastMotion = 0;   // when the PIR was last HIGH
bool seen = false;              // has there been any motion yet?

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  // TODO 1: wait for the warm-up (3500 ms) so the flicker is ignored
}

void loop() {
  // TODO 2: if the PIR is HIGH, remember millis() in lastMotion and set seen = true
  // TODO 3: the LED is ON when seen is true and less than 5000 ms have passed since lastMotion
}
`),
 hints:["delay(3500); in setup() is fine: the warm-up happens once.", "if (digitalRead(PIR_PIN) == HIGH) { lastMotion = millis(); seen = true; }", "bool on = seen && (millis() - lastMotion < 5000); digitalWrite(LED_PIN, on);"],
 solution:b => cpp(b, `const int PIR_PIN = {PIR_PIN};
const int LED_PIN = {LED_PIN};
unsigned long lastMotion = 0;
bool seen = false;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  delay(3500);
}

void loop() {
  if (digitalRead(PIR_PIN) == HIGH) {
    lastMotion = millis();
    seen = true;
  }
  bool on = seen && (millis() - lastMotion < 5000);
  digitalWrite(LED_PIN, on ? HIGH : LOW);
  delay(20);
}
`),
 check:(r, b) => { const p = pinK(b, "LED_PIN"), at = t => pinAtT(r, p, t), out = [];
  out.push(!at(1500) && !at(2800) ? pass("The LED ignored the warm-up flicker.") : fail("The LED was on during the first 3 s.", "The PIR output flickers while it warms up. Wait about 3.5 s before trusting it."));
  out.push(at(6800) ? pass("The LED came on when motion started.") : fail("The LED was not on at 6.8 s, when the person walked by.", "Is the PIR pin set as INPUT, and does the LED follow digitalRead(PIR_PIN)?"));
  out.push(at(13800) ? pass("The LED stayed on after the PIR output fell (9.5 s) until 14.5 s.") : fail("The LED turned off too early (at 13.8 s it should still be on).", "Keep it on for 5000 ms after the last time the PIR was HIGH."));
  out.push(!at(15600) && at(19500) && !at(26800) ? pass("It turned off after the timer, and came on again for the second visitor.") : fail("The off/on timing around the second visit is wrong.", `Expected: OFF at 15.6 s, ON at 19.5 s, OFF at 26.8 s. Your LED: ${at(15600) ? "ON" : "OFF"}, ${at(19500) ? "ON" : "OFF"}, ${at(26800) ? "ON" : "OFF"}.`));
  return out; }};

SB.sb_servo = {id:"sb_servo", title:"Servo: automatic barrier gate", sim:14000, scenarioText:"A car approaches: the distance drops from 120 cm to 25 cm at 4 s and the car leaves at 9 s.",
 task:"Raise the barrier (servo at <b>90°</b>) while something is closer than <b>40 cm</b>. Otherwise keep it down (<b>0°</b>). Read the distance with the HC-SR04 function given in the starter.",
 criteria:["The servo is attached to its pin", "At 2 s (no car) the barrier is down: 0°", "At 6.5 s (car at 25 cm) the barrier is up: 90°", "At 12 s (car gone) it is down again"],
 scenario:b => sc(["hcsr04", "servo"], {dist:{base:120, steps:[[4000, 9000, 25]]}}), pins:[],
 starter:b => cpp(b, `${inc.servo(b)}

const int TRIG_PIN = {TRIG_PIN};
const int ECHO_PIN = {ECHO_PIN};
const int SERVO_PIN = {SERVO_PIN};
Servo gate;

long readCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long us = pulseIn(ECHO_PIN, HIGH, 30000);
  if (us == 0) return 999;          // no echo: nothing close
  return us * 0.0343 / 2;
}

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  // TODO 1: attach the servo to SERVO_PIN and put the barrier down (0 degrees)
}

void loop() {
  long cm = readCm();
  // TODO 2: if cm < 40 move the servo to 90, otherwise to 0
  delay(100);
}
`),
 hints:["gate.attach(SERVO_PIN); gate.write(0); in setup()", "if (cm < 40) gate.write(90); else gate.write(0);"],
 solution:b => cpp(b, `${inc.servo(b)}

const int TRIG_PIN = {TRIG_PIN};
const int ECHO_PIN = {ECHO_PIN};
const int SERVO_PIN = {SERVO_PIN};
Servo gate;

long readCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long us = pulseIn(ECHO_PIN, HIGH, 30000);
  if (us == 0) return 999;
  return us * 0.0343 / 2;
}

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  gate.attach(SERVO_PIN);
  gate.write(0);
}

void loop() {
  long cm = readCm();
  if (cm < 40) gate.write(90);
  else gate.write(0);
  delay(100);
}
`),
 check:(r, b) => { const p = pinK(b, "SERVO_PIN"), a = t => servoAt(r, p, t), out = [];
  out.push(!(r.flags && r.flags.servoNoAttach) && extOf(r, "servo_attach", p).length ? pass("The servo is attached.") : fail("The servo was never attached to its pin.", "Call gate.attach(SERVO_PIN); in setup()."));
  out.push(a(2000) === 0 ? pass("Barrier down (0°) when no car is near.") : fail(`At 2 s the servo is at ${a(2000)}° instead of 0°.`, "Set the barrier to 0° when cm is 40 or more (and at start-up)."));
  out.push(a(6500) === 90 ? pass("Barrier up (90°) when the car is at 25 cm.") : fail(`At 6.5 s the servo is at ${a(6500)}° instead of 90°.`, "Compare cm < 40 and write 90 to the servo."));
  out.push(a(12000) === 0 ? pass("Barrier down again after the car leaves.") : fail(`At 12 s the servo is at ${a(12000)}°.`, "Add the else branch: gate.write(0)."));
  return out; }};

SB.sb_motor = {id:"sb_motor", title:"DC motor: ramp, stop, reverse", sim:9000, scenarioText:"A motor on an H-bridge driver. The driver function <code>drive(speed)</code> is already written.",
 task:"In loop(): ramp the speed from 0 to 255 over about 2 s (steps of 15 every 120 ms), hold full speed for 1 s, stop for 1 s, reverse at half speed (<code>-128</code>) for 2 s, stop for 1 s. Repeat.",
 criteria:["Speed climbs gradually in the first 2 s", "About 2.7 s: full speed forward", "About 3.7 s: stopped", "About 5 s: reversing at about half speed"],
 scenario:b => sc(["motor"]), pins:[],
 starter:b => cpp(b, `const int EN_PIN = {MOTOR_EN_PIN};
const int IN1_PIN = {MOTOR_IN1_PIN};
const int IN2_PIN = {MOTOR_IN2_PIN};

void drive(int speed) {            // -255 (reverse) … 0 (stop) … +255 (forward)
  if (speed > 0) {
    digitalWrite(IN1_PIN, HIGH);
    digitalWrite(IN2_PIN, LOW);
  } else if (speed < 0) {
    digitalWrite(IN1_PIN, LOW);
    digitalWrite(IN2_PIN, HIGH);
  } else {
    digitalWrite(IN1_PIN, LOW);
    digitalWrite(IN2_PIN, LOW);
  }
  analogWrite(EN_PIN, abs(speed));
}

void setup() {
  pinMode(EN_PIN, OUTPUT);
  pinMode(IN1_PIN, OUTPUT);
  pinMode(IN2_PIN, OUTPUT);
}

void loop() {
  // TODO: ramp up, hold, stop, reverse, stop (see the task)
}
`),
 hints:["for (int s = 0; s <= 255; s += 15) { drive(s); delay(120); }", "drive(255); delay(1000); drive(0); delay(1000); drive(-128); delay(2000); drive(0); delay(1000);"],
 solution:b => progSource(PROGRAMS.motor.lines, b).replace(/void loop\(\) \{[\s\S]*$/, `void loop() {
  for (int s = 0; s <= 255; s += 15) { drive(s); delay(120); }
  drive(255);
  delay(1000);
  drive(0);
  delay(1000);
  drive(-128);
  delay(2000);
  drive(0);
  delay(1000);
}
`).replace(/Serial\.begin\(115200\);\n/, ""),
 check:(r, b) => { const en = pinK(b, "MOTOR_EN_PIN"), i1 = pinK(b, "MOTOR_IN1_PIN"), i2 = pinK(b, "MOTOR_IN2_PIN"), du = t => dutyAt(r, en, t), d1 = t => pinAtT(r, i1, t), d2 = t => pinAtT(r, i2, t), out = [];
  out.push(du(400) > 0 && du(1700) > du(400) + 40 && du(1700) < 250 ? pass(`Speed climbs: ${du(400)} at 0.4 s, ${du(1700)} at 1.7 s.`) : fail(`At 0.4 s the speed is ${du(400)} and at 1.7 s it is ${du(1700)}.`, "Increase speed in steps of 15 with a 120 ms delay, so it climbs for about 2 s."));
  out.push(du(2700) >= 250 && d1(2700) === 1 && d2(2700) === 0 ? pass("Full speed forward at 2.7 s.") : fail(`At 2.7 s: speed ${du(2700)}, IN1=${d1(2700)}, IN2=${d2(2700)}.`, "After the ramp call drive(255) and wait 1 s."));
  out.push(du(3700) === 0 ? pass("Stopped at 3.7 s.") : fail(`At 3.7 s the speed is ${du(3700)}.`, "drive(0); then delay(1000);"));
  out.push(d1(5000) === 0 && d2(5000) === 1 && du(5000) >= 100 && du(5000) <= 160 ? pass("Reversing at about half speed at 5 s.") : fail(`At 5 s: speed ${du(5000)}, IN1=${d1(5000)}, IN2=${d2(5000)}.`, "drive(-128); reverses: the sign picks the direction, the size picks the speed."));
  return out; }};

/* ---------- Track E: ThingSpeak ---------- */
const tsSolution = b => progSource(PROGRAMS.thingspeak.lines, b);
SB.sb_ts = {id:"sb_ts", title:"ThingSpeak: fix the channel feed", sim:75000, scenarioText:"A virtual ThingSpeak channel with the free-plan rules: one update per 15 s. Write key: TS_WRITE_KEY.",
 task:"The starter sends too fast and mixes up the fields, so the chart is wrong. Fix it so that <b>Field 1 = temperature</b>, <b>Field 2 = humidity</b>, and at least 3 updates are accepted (never faster than every 15 s).",
 criteria:["At least 3 updates are accepted by ThingSpeak", "Field 1 holds temperature and Field 2 holds humidity", "No update is rejected for arriving too soon (-401)"],
 scenario:b => sc(["dht"], {ts:{writeKey:"TS_WRITE_KEY"}}), pins:[],
 starter:b => bugged(tsSolution(b), [["INTERVAL_MS = 20000", "INTERVAL_MS = 5000"], ["ThingSpeak.setField(2, h)", "ThingSpeak.setField(2, t)"]]),
 hints:["The free plan accepts one update every 15 seconds. Look at INTERVAL_MS.", "setField(1, ...) is the first chart, setField(2, ...) the second. Which variable belongs in Field 2?"],
 solution:tsSolution,
 check:(r, b) => { const E = rowsOf(r, "ts"), out = [];
  out.push(E.length >= 3 ? pass(`${E.length} updates accepted.`) : fail(`Only ${E.length} update(s) were accepted.`, "Space the updates at least 15 s apart."));
  const okF = E.length && E.every(e => Math.abs(+e.f[1] - 29.4) < 1.5 && Math.abs(+e.f[2] - 68.2) < 4); out.push(okF ? pass("Field 1 = temperature, Field 2 = humidity.") : fail(E.length ? `Field 1 = ${E[0].f[1]}, Field 2 = ${E[0].f[2]}: they should be about 29 and 68.` : "No data to check.", "Field 2 must be the humidity variable."));
  const early = (r.ser || []).filter(x => /-401/.test(x.text)); out.push(!early.length ? pass("No update was rejected for being too early.") : fail(`${early.length} update(s) came back with code -401.`, "-401 means the 15-second rule was broken: slow down."));
  return out; }};

/* ---------- Track B: Firebase ---------- */
const fbSolution = b => progSource(PROGRAMS.firebase.lines, b);
const fb2Solution = b => fbSolution(b).replace("USE_AUTH = false", "USE_AUTH = true");
const fbCfg = extra => Object.assign({host:"your-project-default-rtdb.firebaseio.com", rules:"open", device:{email:"device@school.edu", password:"device-pass"}}, extra || {});
const fbCheck = (r, needOk) => { const R = (r.cloud && r.cloud.fb) || {}, kids = R.readings ? Object.values(R.readings) : [], out = [];
  out.push(kids.length >= 3 ? pass(`${kids.length} readings pushed to /readings.`) : fail(`Only ${kids.length} reading(s) reached the database.`, "Look at the Network log: which HTTP code came back?"));
  out.push(kids.length && kids.every(k => typeof k.temp_c === "number" && typeof k.hum_pct === "number") ? pass("Every reading is a JSON object with numeric temp_c and hum_pct.") : fail("The readings are missing numeric temp_c / hum_pct.", "Check the JSON body: braces, quotes, and commas."));
  out.push(R.latest && typeof R.latest.temp_c === "number" ? pass("/latest holds the newest reading.") : fail("/latest is missing.", "PUT the same JSON to /latest.json."));
  const bad = hasErr(r); out.push(!bad.length ? pass("No request was rejected.") : fail(`${bad.length} request(s) were rejected, for example: ${bad[0].text}`, "Read the reply text in the Network log: Firebase explains the problem.")); return out; };
SB.sb_fb1 = {id:"sb_fb1", title:"Firebase: the readings don't arrive", sim:60000, scenarioText:"A virtual Firebase Realtime Database in test mode (open rules).",
 task:"The sketch runs but nothing is stored. Use the Network log to find out why, and fix <b>both</b> problems.",
 criteria:["At least 3 readings are stored under /readings", "/latest holds the newest reading", "No request is rejected"],
 scenario:b => sc(["dht"], {fb:fbCfg()}), pins:[],
 starter:b => bugged(fbSolution(b), [["\"/readings.json\" + q", "\"/readings\" + q"], ["+ String(millis()) + \"}\";", "+ String(millis());"]]),
 hints:["A Firebase REST address must end in .json. Check the path in the POST.", "After you fix the path, read the new error: the JSON text is not complete. Count the braces."],
 solution:fbSolution, check:(r, b) => fbCheck(r)};
SB.sb_fb2 = {id:"sb_fb2", title:"Firebase: rules that need a sign-in", sim:60000, scenarioText:"The database rules now require a signed-in user. The device account is device@school.edu.",
 task:"Every request is refused with <i>Permission denied</i>. Make the device sign in first and attach its token. Then fix the next error you see.",
 criteria:["At least 3 readings are stored under /readings", "/latest holds the newest reading", "No request is rejected"],
 scenario:b => sc(["dht"], {fb:fbCfg({rules:"auth"})}), pins:[],
 starter:b => bugged(fb2Solution(b), [["USE_AUTH = true", "USE_AUTH = false"], ["DEVICE_PASS = \"device-pass\"", "DEVICE_PASS = \"device-pasword\""]]),
 hints:["Set USE_AUTH to true so the sketch signs in and adds ?auth=<token> to every request.", "After that, the sign-in itself fails: compare DEVICE_EMAIL and DEVICE_PASS with the account you created."],
 solution:fb2Solution, check:(r, b) => fbCheck(r)};

/* ---------- Track C: AWS ---------- */
const awsApiSolution = b => progSource(PROGRAMS.awsapi.lines, b);
const awsMqttSolution = b => progSource(PROGRAMS.awsmqtt.lines, b);
const awsCfg = () => ({aws:{apiKey:"API_GW_KEY", clientId:"sss-device-01", topicPrefix:"sss/", rule:true, inbound:[[15000, "sss/sss-device-01/cmd", "on"]]}});
SB.sb_aws = {id:"sb_aws", title:"AWS: API Gateway says Forbidden", sim:50000, scenarioText:"A virtual API Gateway → Lambda → DynamoDB. The API key is API_GW_KEY.",
 task:b => b === "uno" ? "Your Uno R4 WiFi sends readings to AWS over HTTPS. Every request is answered <b>403 Forbidden</b>. Find and fix the problem in the request headers. (The Uno R4 uses this path instead of MQTT certificates.)" : "Readings are sent to API Gateway over HTTPS, but every request is answered <b>403 Forbidden</b>. Find and fix the problem in the request headers.",
 criteria:["At least 3 readings are stored in the DynamoDB table", "Each item has device_id, temp_c and hum_pct", "No request is rejected"],
 scenario:b => sc(["dht"], awsCfg()), pins:[],
 starter:b => bugged(awsApiSolution(b), [["\"x-api-key\", API_KEY", "\"api-key\", API_KEY"]]),
 hints:["API Gateway reads the key from a header named x-api-key. Compare it with the name in your code.", "The header name is the second-to-last argument of httpsRequest()."],
 solution:awsApiSolution,
 check:(r, b) => { const D = rowsOf(r, "ddb"), out = [];
  out.push(D.length >= 3 ? pass(`${D.length} items stored in DynamoDB.`) : fail(`${D.length} item(s) stored.`, "Read the Network log: HTTP 403 means the key was not accepted."));
  out.push(D.length && D.every(d => d.device_id && typeof d.temp_c === "number" && typeof d.hum_pct === "number") ? pass("Items have device_id, temp_c and hum_pct.") : fail("Items are incomplete.", "Check the JSON body."));
  const bad = hasErr(r); out.push(!bad.length ? pass("No request was rejected.") : fail(`Rejected: ${bad[0].text}`, "The reply message tells you what AWS didn't like.")); return out; }};
SB.sb_mqtt = {id:"sb_mqtt", title:"AWS IoT Core: MQTT with certificates", sim:50000, scenarioText:"A virtual AWS IoT Core. The thing is sss-device-01. Its policy allows topics that start with sss/. At 15 s the console publishes “on” to sss/sss-device-01/cmd.",
 task:b => b === "uno" ? "The Uno R4 WiFi cannot do mutual-TLS MQTT with the standard library, so on this board the same lesson uses HTTPS to API Gateway. Fix the 403 as in the previous mission." : "The connection works, but your telemetry never appears and the board keeps getting disconnected. Fix the topic, and make sure the LED turns on when the console sends “on” at 15 s.",
 criteria:["Telemetry arrives on a topic that starts with sss/", "The board stays connected", "The LED turns on after the “on” command at 15 s"],
 scenario:b => sc(["dht", "led"], awsCfg()), pins:[ledPin],
 starter:b => b === "uno" ? bugged(awsApiSolution(b), [["\"x-api-key\", API_KEY", "\"api-key\", API_KEY"]]) : bugged(awsMqttSolution(b), [["\"sss/sss-device-01/telemetry\"", "\"devices/sss-device-01/telemetry\""], ["  mqtt.loop();", "  // mqtt.loop();"]]),
 hints:["The IoT policy allows only topics that start with sss/. The Serial Monitor or Network log says why AWS closed the connection.", "Without mqtt.loop() the board never reads incoming messages and the connection times out.", "On the Uno R4 WiFi: it is the same header-name problem as the previous mission."],
 solution:b => b === "uno" ? awsApiSolution(b) : awsMqttSolution(b),
 check:(r, b) => { const out = [];
  if (b === "uno"){ const D = rowsOf(r, "ddb"); out.push(D.length >= 3 ? pass(`${D.length} items stored in DynamoDB over HTTPS.`) : fail(`${D.length} item(s) stored.`, "Fix the header name so API Gateway accepts the key.")); return out; }
  const M = rowsOf(r, "mqtt").filter(m => m.dir === "in" && /telemetry$/.test(m.topic));
  out.push(M.length >= 3 ? pass(`${M.length} telemetry messages reached AWS IoT Core.`) : fail(`${M.length} telemetry message(s) arrived.`, "Check the topic: the policy allows only sss/…. See the Network log."));
  const lost = (r.net || []).filter(x => /closed the connection|connection lost/.test(x.text)); out.push(!lost.length ? pass("The connection stayed up.") : fail("AWS closed the connection.", lost[0].text));
  const p = pinK(b, "LED_PIN"); out.push(pinAtT(r, p, 17000) === 1 ? pass("The LED turned on after the “on” command.") : fail("The LED did not turn on after the command at 15 s.", "Call mqtt.loop() on every pass of loop(): it delivers incoming messages to onMessage()."));
  return out; }};

/* ---------- Track D: Blynk ---------- */
const blynkSolution = b => progSource(PROGRAMS.blynk.lines, b);
SB.sb_blynk = {id:"sb_blynk", title:"Blynk: a live dashboard", sim:25000, scenarioText:"In the app, the LED switch (V2) is turned ON at 8 s and OFF at 14 s.",
 task:"The sketch sends temperature but the app's switch does nothing, and the data comes in slowly. Make the dashboard <b>live</b>: V0 every 2 s, V1 every 2 s, and the LED must follow the switch within about a second.",
 criteria:["Temperature (V0) is sent at least 8 times", "The LED turns ON within 1.2 s of the app switching it on", "It turns OFF within 1.2 s of the app switching it off"],
 scenario:b => sc(["dht", "led"], {blynk:{auth:"SSS_BLYNK_TOKEN", events:[[8000, 2, 1], [14000, 2, 0]]}}), pins:[ledPin],
 starter:b => bugged(blynkSolution(b), [["  Blynk.run();\n  timer.run();", "  sendSensor();\n  delay(2000);"]]),
 hints:["Blynk.run() must run constantly: it receives the app's messages. A delay(2000) in loop() blocks it for 2 s at a time.", "Let BlynkTimer call sendSensor(): loop() should contain only Blynk.run(); and timer.run();"],
 solution:blynkSolution,
 check:(r, b) => { const L = rowsOf(r, "blynkLog").filter(x => x.pin === "V0"), p = pinK(b, "LED_PIN"), out = [];
  out.push(L.length >= 8 ? pass(`${L.length} temperature values reached the dashboard.`) : fail(`${L.length} temperature value(s) sent.`, "The timer should call sendSensor() every 2000 ms."));
  const on = pinEvents(r, p).find(e => e.v === 1), off = pinEvents(r, p).find(e => e.v === 0 && on && e.t > on.t);
  out.push(on && on.t >= 8000 && on.t - 8000 <= 1200 ? pass(`The LED turned on ${Math.round(on.t - 8000)} ms after the app switch.`) : fail(on ? `The LED turned on ${Math.round(on.t - 8000)} ms after the switch: too slow.` : "The LED never turned on.", "Remove delay() from loop() so Blynk.run() runs hundreds of times per second."));
  out.push(off && off.t >= 14000 && off.t - 14000 <= 1200 ? pass(`The LED turned off ${Math.round(off.t - 14000)} ms after the app switch.`) : fail("The LED did not turn off promptly.", "BLYNK_WRITE(V2) receives 0 and 1: write the value to the LED pin."));
  return out; }};

/* ---------- Track A: logger (kept) is sb_logger; here the Sheets debugging mission ---------- */
const sheetSolution = b => progSource(PROGRAMS.hello.lines, b);

/* ---------- Data science ---------- */
SB.sb_stats = {id:"sb_stats", title:"Data: mean, standard deviation, min and max", sim:3000, scenarioText:"No sensors: eight temperature readings are stored in an array.",
 task:"Compute the <b>mean</b>, the <b>sample standard deviation</b> (divide by n − 1), the <b>minimum</b> and the <b>maximum</b> of the eight readings. Print them as <code>mean=28.71</code>, <code>sd=0.36</code>, <code>min=28.10</code>, <code>max=29.30</code> (two decimals).",
 criteria:["mean is correct", "sd is correct (sample, n − 1)", "min and max are correct"],
 scenario:b => sc([]), pins:[],
 starter:b => `float data[] = {28.1, 28.4, 29.0, 28.7, 28.9, 29.3, 28.5, 28.8};
const int N = 8;

void setup() {
  Serial.begin(115200);
  // TODO 1: add up the readings and divide by N to get the mean
  // TODO 2: sum the squared differences from the mean, divide by (N - 1), take sqrt() for sd
  // TODO 3: find the smallest and largest readings
  // TODO 4: print mean=, sd=, min=, max= each on its own line with 2 decimals
}

void loop() {
}
`,
 hints:["float sum = 0; for (int i = 0; i < N; i++) sum += data[i]; float mean = sum / N;", "float ss = 0; for (...) ss += (data[i] - mean) * (data[i] - mean); float sd = sqrt(ss / (N - 1));", "Serial.print(\"mean=\"); Serial.println(mean, 2);"],
 solution:b => `float data[] = {28.1, 28.4, 29.0, 28.7, 28.9, 29.3, 28.5, 28.8};
const int N = 8;

void setup() {
  Serial.begin(115200);
  float sum = 0;
  for (int i = 0; i < N; i++) sum += data[i];
  float mean = sum / N;
  float ss = 0;
  for (int i = 0; i < N; i++) ss += (data[i] - mean) * (data[i] - mean);
  float sd = sqrt(ss / (N - 1));
  float mn = data[0];
  float mx = data[0];
  for (int i = 1; i < N; i++) {
    if (data[i] < mn) mn = data[i];
    if (data[i] > mx) mx = data[i];
  }
  Serial.print("mean="); Serial.println(mean, 2);
  Serial.print("sd="); Serial.println(sd, 2);
  Serial.print("min="); Serial.println(mn, 2);
  Serial.print("max="); Serial.println(mx, 2);
}

void loop() {
}
`,
 check:(r, b) => { const d = [28.1, 28.4, 29.0, 28.7, 28.9, 29.3, 28.5, 28.8], n = d.length, m = d.reduce((a, c) => a + c, 0) / n, sd = Math.sqrt(d.reduce((a, c) => a + (c - m) * (c - m), 0) / (n - 1));
  const get = k => { const l = r.ser.find(x => new RegExp("^" + k + "\\s*=", "i").test(x.text.trim())); return l ? parseFloat(l.text.split("=")[1]) : NaN; };
  const t = (k, v, msg, h) => Math.abs(get(k) - v) <= 0.011 ? pass(`${k} = ${v.toFixed(2)}`) : fail(isNaN(get(k)) ? `No line starting with “${k}=”.` : `${k} printed ${get(k)}; expected ${v.toFixed(2)}.`, h);
  return [t("mean", m, "", "Add all eight values and divide by 8."), t("sd", sd, "", "Sample sd divides by (N − 1) = 7, not N."), (Math.abs(get("min") - 28.1) <= 0.011 && Math.abs(get("max") - 29.3) <= 0.011) ? pass("min = 28.10, max = 29.30") : fail(`min/max printed ${get("min")} / ${get("max")}; expected 28.10 / 29.30.`, "Start with data[0], then compare every other value.")]; }};

SB.sb_filter = {id:"sb_filter", title:"Data: remove spikes with a median filter", sim:10000, scenarioText:"The true distance is about 100 cm with a little noise. At 2 s, 4.5 s and 7 s the sensor glitches for 120 ms and returns a wrong value (no echo or a huge number).",
 task:"Read the distance every 100 ms. Keep the last 5 readings, and print their <b>median</b> as <code>d=101</code> (a whole number) each time. A single glitch must not appear in your output.",
 criteria:["At least 60 filtered values are printed", "No printed value is more than 15 cm from 100", "The spikes at 2 s, 4.5 s and 7 s are gone"],
 scenario:b => sc(["hcsr04"], {dist:{base:100, wave:[2, 300], steps:[[2000, 2120, 450], [4500, 4620, 450], [7000, 7120, 450]]}}), pins:[],
 starter:b => cpp(b, `const int TRIG_PIN = {TRIG_PIN};
const int ECHO_PIN = {ECHO_PIN};
int last5[5] = {100, 100, 100, 100, 100};
int idx = 0;

long readCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long us = pulseIn(ECHO_PIN, HIGH, 30000);
  if (us == 0) return 0;          // no echo
  return us * 0.0343 / 2;
}

int median5() {
  // TODO: copy last5 into a new array, sort it, and return the middle value (index 2)
  return 0;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  last5[idx] = readCm();
  idx = (idx + 1) % 5;
  Serial.print("d=");
  Serial.println(median5());
  delay(100);
}
`),
 hints:["int s[5]; for (int i = 0; i < 5; i++) s[i] = last5[i];", "Sort the copy: two loops, swap neighbours when s[j] > s[j+1] (a bubble sort). Return s[2].", "The median is the middle value after sorting, so one wrong reading ends up at the edge and is ignored."],
 solution:b => cpp(b, `const int TRIG_PIN = {TRIG_PIN};
const int ECHO_PIN = {ECHO_PIN};
int last5[5] = {100, 100, 100, 100, 100};
int idx = 0;

long readCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long us = pulseIn(ECHO_PIN, HIGH, 30000);
  if (us == 0) return 0;
  return us * 0.0343 / 2;
}

int median5() {
  int s[5];
  for (int i = 0; i < 5; i++) s[i] = last5[i];
  for (int i = 0; i < 4; i++) {
    for (int j = 0; j < 4 - i; j++) {
      if (s[j] > s[j + 1]) {
        int tmp = s[j];
        s[j] = s[j + 1];
        s[j + 1] = tmp;
      }
    }
  }
  return s[2];
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  last5[idx] = readCm();
  idx = (idx + 1) % 5;
  Serial.print("d=");
  Serial.println(median5());
  delay(100);
}
`),
 check:(r, b) => { const V = r.ser.map(x => ({t:x.t, v:(x.text.match(/d\s*=\s*(-?\d+)/) || [])[1]})).filter(x => x.v !== undefined).map(x => ({t:x.t, v:+x.v})), out = [];
  out.push(V.length >= 60 ? pass(`${V.length} filtered values printed.`) : fail(`${V.length} values printed.`, "Print d=... every 100 ms."));
  const bad = V.filter(x => Math.abs(x.v - 100) > 15); out.push(!bad.length ? pass("Every printed value is within 15 cm of 100.") : fail(`${bad.length} printed value(s) are far from 100 (for example d=${bad[0].v} at ${(bad[0].t / 1000).toFixed(1)} s).`, "A median of 5 ignores one or two bad readings. Check that you return the MIDDLE of the sorted copy."));
  const sp = V.filter(x => (x.t > 2050 && x.t < 2400) || (x.t > 4550 && x.t < 4900) || (x.t > 7050 && x.t < 7400)); out.push(sp.length && sp.every(x => Math.abs(x.v - 100) <= 15) ? pass("The spikes are gone.") : fail("A spike leaked into the output.", "Sort a COPY of the 5 values and return s[2]."));
  return out; }};

SB.sb_anomaly = {id:"sb_anomaly", title:"Data: detect an unusual reading", sim:16000, scenarioText:"A TMP36 reads about 25 °C. Between 8 s and 9.5 s something warms it by 6 °C (a heater is switched on).",
 task:"Read the TMP36 every 250 ms. Keep the last 20 readings. After the first 20 readings, print <code>ALERT</code> and the value whenever a new reading is more than <b>3 standard deviations</b> from the mean of the last 20 readings. No alert on normal readings.",
 criteria:["At least one ALERT while the heater is on (8–9.8 s)", "No more than one ALERT outside that window"],
 scenario:b => sc(["tmp36"], {temp:{base:25, steps:[[8000, 9500, 31]]}}), pins:[],
 starter:b => cpp(b, `const int TMP_PIN = {TMP_PIN};
const float VOLTS = {VOLTS};
const float ADC_MAX = {ADC_MAX};
const int W = 20;
float win[W];
int count = 0;     // how many readings are stored so far (up to W)
int pos = 0;       // where the next reading goes

float readTempC() {
  float volts = analogRead(TMP_PIN) * VOLTS / ADC_MAX;
  return (volts - 0.5) * 100.0;
}

void setup() {
  Serial.begin(115200);
}

void loop() {
  float t = readTempC();
  if (count >= W) {
    // TODO 1: compute the mean and the standard deviation of win[]
    // TODO 2: if |t - mean| > 3 * sd, print "ALERT" and t
  }
  win[pos] = t;                 // store the new reading
  pos = (pos + 1) % W;
  if (count < W) count++;
  delay(250);
}
`),
 hints:["Loop over win[] twice: once for the sum (mean), once for the squared differences (sd).", "if (abs(t - mean) > 3 * sd) { Serial.print(\"ALERT \"); Serial.println(t, 1); }"],
 solution:b => cpp(b, `const int TMP_PIN = {TMP_PIN};
const float VOLTS = {VOLTS};
const float ADC_MAX = {ADC_MAX};
const int W = 20;
float win[W];
int count = 0;
int pos = 0;

float readTempC() {
  float volts = analogRead(TMP_PIN) * VOLTS / ADC_MAX;
  return (volts - 0.5) * 100.0;
}

void setup() {
  Serial.begin(115200);
}

void loop() {
  float t = readTempC();
  if (count >= W) {
    float sum = 0;
    for (int i = 0; i < W; i++) sum += win[i];
    float mean = sum / W;
    float ss = 0;
    for (int i = 0; i < W; i++) ss += (win[i] - mean) * (win[i] - mean);
    float sd = sqrt(ss / W);
    if (abs(t - mean) > 3 * sd) {
      Serial.print("ALERT ");
      Serial.println(t, 1);
    }
  }
  win[pos] = t;
  pos = (pos + 1) % W;
  if (count < W) count++;
  delay(250);
}
`),
 check:(r, b) => { const A = r.ser.filter(x => /ALERT/i.test(x.text)), inside = A.filter(x => x.t >= 7900 && x.t <= 9800), outside = A.filter(x => x.t < 7900 || x.t > 9800), out = [];
  out.push(inside.length >= 1 ? pass(`ALERT raised while the heater was on (first at ${(inside[0].t / 1000).toFixed(2)} s).`) : fail("No ALERT while the heater was on.", "Compare |t − mean| with 3 × sd using the PREVIOUS 20 readings (before you store t)."));
  out.push(outside.length <= 1 ? pass(`${outside.length} alert(s) outside the event.`) : fail(`${outside.length} false alarms outside the event.`, "Only start checking after the window holds 20 readings, and use 3 standard deviations (not 3 × the mean)."));
  return out; }};

SB.sb_guardian = {id:"sb_guardian", title:"Capstone: the room guardian", sim:30000, scenarioText:"A visitor walks by at 5 s (room lit). The lights go out at 10 s. Someone enters the dark room at 15 s.",
 task:"Combine PIR + LDR + RGB + buzzer. <b>Green</b> = all quiet. <b>Blue</b> = motion while the room is lit (a visitor). <b>Red + a 1000 Hz tone</b> = motion while the room is dark (an intruder). Dark means the light is below 30 %. Ignore the PIR for its first 2.5 s.",
 criteria:["3.5 s: green", "6 s: blue (motion, lit)", "12 s: green (dark but no motion)", "16 s: red and the buzzer sounds (motion in the dark)", "25 s: green and the buzzer is silent"],
 scenario:b => sc(["pir", "ldr", "rgb", "buzzer"], {light:{base:70, steps:[[10000, 30000, 15]]}, pir:{warm:2000, hold:1500, steps:[[5000, 5600, 1], [15000, 15600, 1]]}}), pins:[],
 starter:b => cpp(b, `const int PIR_PIN = {PIR_PIN};
const int LDR_PIN = {LDR_PIN};
const int RED_PIN = {RED_PIN};
const int GREEN_PIN = {GREEN_PIN};
const int BLUE_PIN = {BLUE_PIN};
const int BUZZER_PIN = {BUZZER_PIN};

void setColor(int r, int g, int bl) {
  analogWrite(RED_PIN, r);
  analogWrite(GREEN_PIN, g);
  analogWrite(BLUE_PIN, bl);
}

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  delay(2500);     // PIR warm-up
}

void loop() {
  int lightPct = map(analogRead(LDR_PIN), 0, {ADC_MAX}, 0, 100);
  bool motion = digitalRead(PIR_PIN) == HIGH;
  // TODO: choose the state
  //   motion && lightPct < 30  -> red + tone(BUZZER_PIN, 1000)
  //   motion                   -> blue, no tone
  //   otherwise                -> green, no tone
  delay(50);
}
`),
 hints:["Check the most serious state first: if (motion && lightPct < 30) { ... } else if (motion) { ... } else { ... }", "setColor(255, 0, 0); tone(BUZZER_PIN, 1000); ... and noTone(BUZZER_PIN); in the other two states."],
 solution:b => cpp(b, `const int PIR_PIN = {PIR_PIN};
const int LDR_PIN = {LDR_PIN};
const int RED_PIN = {RED_PIN};
const int GREEN_PIN = {GREEN_PIN};
const int BLUE_PIN = {BLUE_PIN};
const int BUZZER_PIN = {BUZZER_PIN};

void setColor(int r, int g, int bl) {
  analogWrite(RED_PIN, r);
  analogWrite(GREEN_PIN, g);
  analogWrite(BLUE_PIN, bl);
}

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  delay(2500);
}

void loop() {
  int lightPct = map(analogRead(LDR_PIN), 0, {ADC_MAX}, 0, 100);
  bool motion = digitalRead(PIR_PIN) == HIGH;
  if (motion && lightPct < 30) {
    setColor(255, 0, 0);
    tone(BUZZER_PIN, 1000);
  } else if (motion) {
    setColor(0, 0, 255);
    noTone(BUZZER_PIN);
  } else {
    setColor(0, 255, 0);
    noTone(BUZZER_PIN);
  }
  delay(50);
}
`),
 check:(r, b) => { const P = ["RED_PIN", "GREEN_PIN", "BLUE_PIN"].map(k => pinK(b, k)), col = t => P.map(p => dutyAt(r, p, t)), bz = pinK(b, "BUZZER_PIN"), snd = t => toneAt(r, bz, t) > 0, dom = c => c[0] > 200 && c[1] < 60 && c[2] < 60 ? "red" : c[1] > 200 && c[0] < 60 && c[2] < 60 ? "green" : c[2] > 200 && c[0] < 60 && c[1] < 60 ? "blue" : "mixed";
  const W = [[3500, "green", false], [6000, "blue", false], [12000, "green", false], [16000, "red", true], [25000, "green", false]];
  return W.map(([t, nm, s]) => { const c = dom(col(t)), ok = c === nm && snd(t) === s; return ok ? pass(`${t / 1000} s: ${nm}${s ? " + buzzer" : ""}.`) : fail(`At ${t / 1000} s: colour ${c} (${col(t).join(", ")}), buzzer ${snd(t) ? "on" : "off"}. Expected ${nm}${s ? " with the buzzer" : ", silent"}.`, "Check the order of the if tests: the intruder state must be tested before the visitor state."); }); }};
