/* ============ UNIT 2: SENSORS AND ACTUATORS ============ */
COURSE.push({id:"u2", title:"Unit 2: Sensors and actuators", sub:"DHT, TMP36, light, gas, distance, motion, servo, and motor", blurb:"For every part: what it measures, how it works inside, how to wire it for each board, how to program it, and how to trust (or not trust) its numbers.", modules:[

 {id:"2.1", title:"Temperature and humidity: DHT11, DHT22, TMP36", minutes:150,
  intro:"Temperature is the most common reading in IoT. You will compare three sensors, read each one, handle failed readings, and learn why a sensor's number is never the whole truth.",
  objectives:["Compare DHT11, DHT22, and TMP36 (range, accuracy, speed, cost).","Wire and read a DHT sensor and handle NaN (failed reads).","Convert a TMP36 voltage to °C for each board's ADC.","Explain sampling rate limits (DHT11 ≥ 1 s, DHT22 ≥ 2 s)."],
  sections:[
   {id:"compare", title:"Three sensors compared", keys:"dht11 dht22 tmp36 compare accuracy range", html:`
    <p class="plain"><b>In plain words</b>A <b>sensor</b> is a translator. The world speaks in heat, light and sound; your board only understands electricity. A sensor turns “it is warm” into either a <b>voltage</b> (an <b>analog</b> sensor, like the TMP36: the warmer it is, the higher the voltage) or a short <b>digital message</b> of 0s and 1s (like the DHT: it sends the number itself). Analog = you read a level. Digital = you read a message.</p>
    <div class="casebox"><b>Use case: is the classroom comfortable?</b>Teachers often say “it feels stuffy”. A DHT22 on the wall gives two numbers every 2 seconds: <b>temperature</b> (say 31 °C) and <b>humidity</b> (say 78 %). Together they tell you whether to open a window. One sensor, two facts, and a log you can show the principal.</div>
    <table class="t"><tr><th></th><th>DHT11</th><th>DHT22 (AM2302)</th><th>TMP36</th></tr>
     <tr><td><b>Measures</b></td><td>Temperature + humidity</td><td>Temperature + humidity</td><td>Temperature only</td></tr>
     <tr><td><b>Temperature range</b></td><td>0–50 °C, ±2 °C</td><td>−40–80 °C, ±0.5 °C</td><td>−40–125 °C, ±2 °C typical</td></tr>
     <tr><td><b>Humidity</b></td><td>20–80 %, ±5 %</td><td>0–100 %, ±2–5 %</td><td>—</td></tr>
     <tr><td><b>Output</b></td><td>Digital (one wire)</td><td>Digital (one wire)</td><td>Analog voltage (10 mV per °C, 0.5 V at 0 °C)</td></tr>
     <tr><td><b>Fastest reading</b></td><td>about every 1 s</td><td>about every 2 s</td><td>Any time (you decide)</td></tr></table>
    <p>The figures come from the manufacturers' data sheets (${ct("tmp36")}; ${ct("dhtlib")}); check your own part's data sheet because clones differ.</p>
    ${tip("Which one?", `<p>Use the <b>DHT22</b> when you need humidity or better accuracy, the <b>DHT11</b> for a cheap classroom demo, and the <b>TMP36</b> when you want a fast temperature-only reading or want to learn analog sensing.</p>`)}
    ${srcs(["tmp36","dhtlib"])}`, interactive:"dhtInside"},
   {id:"variants", title:"Bare sensor or module? Which one do I have?", keys:"dht module bare 3 pin 4 pin pull-up resistor", html:`
    <p class="plain"><b>In plain words</b>DHT11 and DHT22 are sold in <b>two shapes</b>. The <b>bare sensor</b> is the blue or white plastic block with <b>4 legs</b>: you must add a small <b>10 kΩ pull-up resistor</b> yourself. The <b>module</b> is the same sensor soldered on a tiny circuit board with <b>3 pins</b>; the resistor is already there. The code is identical for both. If you are new, buy the module: fewer wires, fewer mistakes.</p>
    <p><b>What is a pull-up resistor?</b> The DATA wire is shared: the board listens, and the sensor talks by briefly pulling the wire down to 0 V. Something must hold the wire up at HIGH when nobody is talking, or it floats and picks up noise. That “something” is a resistor from DATA to VCC (power): the pull-up. Think of a spring that always pushes a button back up.</p>
    ${tip("Check before you power on", `<p>On modules the pin order is <b>not standard</b>: some are <code>S + −</code>, some <code>+ S −</code>, some <code>− + S</code>. Read the tiny letters on the board, never assume. A reversed supply can damage the sensor.</p>`)}`, interactive:"dhtVariants"},
   {id:"serial", title:"Seeing your numbers: UART, Serial Monitor and Serial Plotter", keys:"uart serial monitor plotter baud tx rx println print", html:`
    <p class="plain"><b>In plain words</b>When your board has something to tell you (“the temperature is 27.4”), it needs a way to talk to your computer. The simplest way is <b>UART</b>, a two-wire conversation: <b>TX</b> (transmit, “I speak”) on one device connects to <b>RX</b> (receive, “I listen”) on the other. Over the USB cable your board and computer do this automatically. <code>Serial.print()</code> is the board speaking; the <b>Serial Monitor</b> window is the computer listening and showing you the text; the <b>Serial Plotter</b> is the same listener, but it draws the numbers as a graph.</p>
    <p>UART sends <b>one letter at a time</b>, each as 10 tiny pulses of voltage. Because there is no clock wire, both sides must agree on the <b>speed</b>, called the <b>baud rate</b>. Our sketches use <code>115200</code>. If the Monitor is set to a different number you see rubbish (“â€¦”), like trying to hear a song played at the wrong speed. Play with the lab below: make the two speeds disagree and watch the letter break.</p>
    ${tip("TX and RX cross over", `<p>When you wire <b>two boards</b> together, connect <b>TX to RX</b> and <b>RX to TX</b> (speaker to listener), plus a shared GND. Connecting TX to TX is like two people talking at once with nobody listening.</p>`)}`, interactive:["uartLab","serialTools"]},
   {id:"serial2", title:"Printing well: guided example", keys:"serial print println begin format csv label", html:`
    <p>These five lines are the <b>whole toolkit</b>. Tap a numbered line to read what it does.</p>
    ${anat("Serial, line by line", [
     ["void setup() {", "<code>setup()</code> runs once at start-up."],
     ["  Serial.begin(115200);", "Open the serial connection at <b>115200 baud</b>. It must match the number at the bottom of the Serial Monitor window."],
     ["}", ""],
     ["void loop() {", "<code>loop()</code> repeats forever."],
     ["  float t = 24.6;", "A made-up temperature stored in a variable (<code>float</code> = a number with decimals)."],
     ['  Serial.print("temp:");', "<code>print</code> sends text and <b>stays on the same line</b>. The word before the colon becomes the legend name in the Plotter."],
     ["  Serial.println(t);", "<code>println</code> sends the number and then <b>starts a new line</b> (the “ln” means line). One sample = one line."],
     ["  delay(500);", "Wait half a second so the Monitor is not flooded (about 2 samples per second)."],
     ["}", ""]])}
    <div class="expbox"><b>Try it (5 minutes)</b>1) Run the sketch above in the sandbox and open the Monitor. 2) Change <code>Serial.begin(115200)</code> to <code>9600</code> without changing the Monitor: what happens? 3) Change <code>println</code> to <code>print</code>: why does everything join into one long line? 4) Print two values on one line separated by a comma and open the Plotter.</div>
    <div class="casebox"><b>Use case: the “is it plugged in?” test</b>Nothing on screen? Debugging with <code>Serial.println("reached here")</code> lines is how professionals find out whether the code runs, which branch it took, and what a sensor really returns. Print first, guess later.</div>`},
   {id:"dht", title:"Reading a DHT sensor", keys:"dht library nan read", html:`
    <p>A DHT sensor talks on one wire with a timed pattern of pulses (${ct("dhtlib")}). The library does the timing; you call <code>readTemperature()</code> and <code>readHumidity()</code>. If the wire is loose or you ask too soon, the result is <b>NaN</b>: always test <code>isnan()</code> before you use or send a number.</p>
    ${libBox("DHT sensor library", "Adafruit", "Also install the Adafruit Unified Sensor library if asked.")}
    <p class="plain"><b>In plain words</b>The DHT chip measures, then sends the result as a short burst of pulses on its DATA wire. The <b>library</b> is a ready-made helper that understands that burst, so you only ask: “what is the temperature?” (<code>readTemperature()</code>) and “what is the humidity?” (<code>readHumidity()</code>). Sometimes the answer is <b>NaN</b> (“not a number”), which means “I could not hear the sensor this time”. Never use a NaN value.</p>
    ${anat("The smallest DHT sketch", [
     ["#include <DHT.h>", "Load the helper library that knows the DHT language."],
     ["DHT dht(DHT_PIN, DHT22);", "Make a sensor object called <code>dht</code>: the pin it is wired to and its type (<code>DHT11</code> or <code>DHT22</code>)."],
     ["void setup() {", ""],
     ["  Serial.begin(115200);", "So we can see the result on the Monitor."],
     ["  dht.begin();", "Start the sensor helper."],
     ["}", ""],
     ["void loop() {", ""],
     ["  float t = dht.readTemperature();", "Ask for the temperature in °C. The answer is stored in <code>t</code>."],
     ["  float h = dht.readHumidity();", "Ask for the humidity in %."],
     ["  if (isnan(t) || isnan(h)) {", "<b>If</b> either answer is NaN (<code>||</code> means “or”), the read failed."],
     ['    Serial.println("# read failed");', "Say so, and do <b>not</b> use the numbers."],
     ["  } else {", "Otherwise the numbers are good:"],
     ['    Serial.print(t); Serial.print(" C, "); Serial.print(h); Serial.println(" %");', "Print “24.6 C, 61.2 %” on one line."],
     ["  }", ""],
     ["  delay(2000);", "The DHT22 needs at least 2 s between reads (the DHT11: 1 s)."],
     ["}", ""]])}
    ${wiringBlock("dht")}
    ${progBlock("dht")}
    <div class="casebox"><b>Use case: the mushroom corner</b>Oyster mushrooms grow best at 85–95 % humidity and about 18–24 °C. A DHT22 logging every 2 s and a rule “if humidity &lt; 85 % then run the mister” turns a hobby into a repeatable experiment (and a good SDG 2 or 12 project).</div>
    <div class="expbox"><b>Try it</b>Breathe gently on the sensor: humidity jumps in seconds, then slowly falls back. Hold it in your closed hand for 30 s: temperature rises a little. Which changes faster, and why does that matter when you choose how often to sample?</div>
    ${troubleshoot([["Always NaN","Wrong pin, missing pull-up, or too-fast reads","Check the data pin; add a 10 kΩ pull-up on bare sensors; wait ≥ 2 s between reads"],["Humidity stuck at 0 or 99","Wrong sensor type in code","Use DHT11 or DHT22 to match your part"],["Reads are 5 °C too warm","Sensor next to the board's heat","Move it away on a short cable"]])}`, interactive:["dhtProtocol","sandbox:sb_dht"]},
   {id:"tmp36", title:"TMP36: analog temperature", keys:"tmp36 analog adc volts celsius", html:`
    <p>The TMP36 outputs a voltage: <b>V = 0.5 + 0.01 × T(°C)</b>. So <b>T = (V − 0.5) × 100</b>. The ADC gives a number; convert it to volts with the board's reference: <b>V = reading × Vref ÷ ADC max</b> (5 V and 1023 on the Uno R4 in 10-bit mode; 3.3 V and 4095 on ESP32-S3; 3.3 V and 1023 on a NodeMCU ESP8266 whose divider scales the 0–1 V pin).</p>
    <p class="plain"><b>In plain words</b>The TMP36 is a tiny thermometer that answers with a <b>voltage</b>: 0.5 V means 0 °C, and every extra <b>0.01 V (10 mV)</b> means one degree warmer. So 0.75 V is 25 °C. Your board cannot read volts directly; its ADC (analog-to-digital converter) hands back a <b>count</b> (0 to 1023 or 0 to 4095). You convert in two small steps: <b>count → volts → °C</b>.</p>
    <table class="t"><tr><th>Step</th><th>Uno R4 (5 V, 0–1023)</th><th>ESP32 (3.3 V, 0–4095)</th></tr>
     <tr><td>ADC count</td><td>153</td><td>930</td></tr>
     <tr><td>Volts = count × Vref ÷ max</td><td>153 × 5 ÷ 1023 = <b>0.748 V</b></td><td>930 × 3.3 ÷ 4095 = <b>0.749 V</b></td></tr>
     <tr><td>°C = (V − 0.5) × 100</td><td>(0.748 − 0.5) × 100 = <b>24.8 °C</b></td><td>(0.749 − 0.5) × 100 = <b>24.9 °C</b></td></tr></table>
    <p class="explain">Same room, different counts: that is why the code must know the board's <b>reference voltage</b> and <b>ADC range</b>.</p>
    ${anat("TMP36 conversion, line by line", [
     ["int raw = analogRead(TMP_PIN);", "Read the pin: a whole number such as 153 (Uno) or 930 (ESP32)."],
     ["float volts = raw * 5.0 / 1023.0;", "Turn the count into volts. Use <code>3.3 / 4095.0</code> on the ESP32. Write <code>5.0</code> (with the .0) so the maths keeps decimals."],
     ["float tempC = (volts - 0.5) * 100.0;", "Remove the 0.5 V offset, then multiply by 100 because there are 100 steps of 10 mV per volt."],
     ["Serial.println(tempC);", "Show it."]])}
    ${wiringBlock("tmp36")}
    ${progBlock("tmp36")}
    <div class="expbox"><b>Try it</b>Pinch the TMP36 between two fingers for 20 s. Predict the rise in volts before you look: a 3 °C rise should be about 0.03 V. Then check it in the Monitor. (Hint: the numbers are small, so the ADC count changes by only a few steps; this is why smoothing helps in 2.5.)</div>
    ${mis(`<p>Using the wrong reference voltage. The same ADC number means 1.65 V on a 3.3 V board and 2.5 V on a 5 V board.</p>`)}
    ${noKit}`, interactive:["tmp36Lab","sandbox:sb_tmp36"]}
  ],
  quiz:[
   {q:"Which sensor measures humidity?", o:["TMP36","DHT22 and DHT11","LDR","HC-SR04"], a:1, e:"The DHT family has a humidity element; the TMP36 is temperature only.", w:["Temperature only.","","Light only.","Distance only."]},
   {q:"What does a NaN from a DHT sensor tell you?", o:["It is 0 °C","The read failed and the value must not be used","The sensor is very accurate","The board is too hot"], a:1, e:"NaN means 'not a number': discard that sample.", w:["Zero is a valid number.","","Opposite.","Unrelated."]},
   {q:"A TMP36 outputs 0.75 V. What is the temperature?", o:["0.75 °C","25 °C","75 °C","250 °C"], a:1, e:"(0.75 − 0.5) × 100 = 25 °C.", w:["Forgot the formula.","","Forgot the 0.5 V offset.","Off by ten."]},
   {q:"Your Serial Monitor shows unreadable symbols but the board is running. Most likely cause?", o:["The sensor is broken","The Monitor baud rate does not match Serial.begin()","The USB cable is too long","The code has no comments"], a:1, e:"Both sides must use the same speed; otherwise the bits are read at the wrong moments.", w:["","","",""]},
   {q:"A DHT module (3 pins) compared with a bare DHT (4 pins):", o:["Needs no pull-up resistor you add yourself","Uses different code","Cannot measure humidity","Must run at 12 V"], a:0, e:"The module board already carries the 10 kΩ pull-up.", w:["","The code is the same.","","Never 12 V."]},
   {q:"Why wait at least 2 s between DHT22 reads?", o:["To save power","The sensor needs time to measure; faster reads fail","To avoid Wi-Fi limits","The library requires comments"], a:1, e:"Faster requests return stale values or NaN.", w:["","","Wi-Fi is not involved.","Not a rule."]}
  ],
  rating:["I know the three sensors' names.","I can read a DHT sensor with help.","I can read DHT and TMP36 and handle bad reads.","I can choose a sensor for a project and justify it."],
  checkpoint:{code:"U2-C1", task:"Pass the DHT and TMP36 missions. Then write a three-row table comparing your sensor choices for a project of your own (range, accuracy, cost, why).", met:"Both missions pass; the table uses data sheet facts.", upload:"Upload screenshots and your table."},
  refs:["tmp36","dhtlib","arduinoLang"]
 },

 {id:"2.2", title:"Light and gas: photoresistor and MQ sensors", minutes:150,
  intro:"Two analog sensors that need calibration. The photoresistor changes with light; MQ gas sensors change with gas and also with heat and humidity. You will learn to read relative changes instead of trusting raw numbers.",
  objectives:["Wire a light-dependent resistor (LDR) as a voltage divider and map the reading to 0–100 %.","Explain how MQ-2, MQ-135 and other MQ sensors work (heated metal-oxide).","Warm up an MQ sensor, record a clean-air baseline, and detect a change.","Compare MQ-2, MQ-3, MQ-4, MQ-7, MQ-9 and MQ-135 for different gases."],
  sections:[
   {id:"ldr", title:"Photoresistor (LDR)", keys:"ldr photoresistor light divider map", html:`
    <p class="plain"><b>In plain words</b>An LDR (“light-dependent resistor”) is a squiggly strip that <b>lets more electricity through when light hits it</b>. In a dark room its resistance is huge (about 1 MΩ); in bright light it drops to a few kΩ. Your board can only measure voltage, so we pair the LDR with a normal resistor to make a <b>voltage divider</b> (see 1.2): the voltage on the middle wire then moves with the light.</p>
    <p>An LDR's resistance falls as light increases. Alone it cannot give a voltage, so put it in a <b>voltage divider</b> with a fixed resistor (often 10 kΩ). The analog pin sees a voltage that rises (or falls, depending on which side the LDR is on) with light. Use <code>map()</code> or your own formula to turn the reading into a percentage, and use a calibration of "darkest" and "brightest" for your room.</p>
    ${anat("LDR to percent, line by line", [
     ["int raw = analogRead(LDR_PIN);", "A count that follows the light (for example 150 in a dim room, 900 in sunlight)."],
     ["int pct = map(raw, 150, 900, 0, 100);", "<code>map()</code> rescales one range to another: your room's <b>darkest (150)</b> becomes 0 and <b>brightest (900)</b> becomes 100. Replace 150 and 900 with your own measurements: that is calibration."],
     ["pct = constrain(pct, 0, 100);", "If it gets darker or brighter than your calibration, clamp the answer to 0–100 so you never print 130 %."],
     ["Serial.println(pct);", "Show the light level."]])}
    ${wiringBlock("ldr")}
    ${progBlock("ldr")}
    <div class="casebox"><b>Use case: the automatic night-light</b>Rule: “if light &lt; 20 % then LED on”. Real products add a margin (on below 20 %, off above 30 %) so the light does not flicker at dusk. That margin is called <b>hysteresis</b>, and you can build it in three lines.</div>`, interactive:["ldrViz","sandbox:sb_ldr"]},
   {id:"mq", title:"MQ gas sensors", keys:"mq2 mq135 mq3 mq4 mq7 mq9 gas heater baseline warm-up", html:`
    <p class="plain"><b>In plain words</b>An MQ sensor is a tiny <b>hot plate</b>. Clean air barely lets electricity cross it; when gas molecules land on the hot surface, its resistance changes. The module turns that into a voltage. It cannot tell you “47 ppm of methane” by itself: it tells you <b>“higher or lower than a moment ago”</b>. So the winning habit is: warm it up, note the clean-air value (the <b>baseline</b>), and watch the <b>change</b>.</p>
    <p>MQ sensors contain a tin-dioxide layer heated to about 200–300 °C. Gas molecules change the layer's resistance (${ct("mqsheet")}). The module's analog pin reports a voltage you must <b>interpret relatively</b>: compare it with your own clean-air baseline.</p>
    <table class="t"><tr><th>Sensor</th><th>Most sensitive to</th><th>Typical use</th></tr>
     <tr><td>MQ-2</td><td>Smoke, LPG, propane, hydrogen</td><td>Smoke and kitchen-gas alarm</td></tr>
     <tr><td>MQ-3</td><td>Alcohol vapour</td><td>Breath alcohol demo (not for legal use)</td></tr>
     <tr><td>MQ-4</td><td>Methane (natural gas)</td><td>Biogas and gas-leak demo</td></tr>
     <tr><td>MQ-7</td><td>Carbon monoxide (needs a 1.4 V / 5 V heating cycle)</td><td>CO demo</td></tr>
     <tr><td>MQ-9</td><td>CO and flammable gases</td><td>Combined detector</td></tr>
     <tr><td>MQ-135</td><td>Air-quality gases: ammonia, NOx, benzene, CO₂ (broad)</td><td>General air-quality trend</td></tr></table>
    ${safety(`<p>MQ sensors are <b>not</b> certified safety devices. Never rely on a hobby sensor to protect people from gas or smoke. Use them to learn and to study trends.</p>`)}
    <ul><li><b>Warm up</b>: let the heater run for at least 20 s for a demo and 24 h for the first use of a new sensor ("burn-in").</li>
     <li><b>Power</b>: the heater draws about 150 mA at 5 V; run it from a 5 V source.</li>
     <li><b>Level</b>: the module's analog output can reach 5 V. On 3.3 V boards use a voltage divider (the sandbox wiring tables show it).</li></ul>
    ${anat("MQ baseline and alarm, line by line", [
     ["long sum = 0;", "A running total, starting at zero."],
     ["for (int i = 0; i < 50; i++) {", "Repeat 50 times (after warm-up, in clean air)."],
     ["  sum += analogRead(MQ_PIN);", "Add each reading to the total."],
     ["  delay(100);", "A tenth of a second between readings."],
     ["}", ""],
     ["int baseline = sum / 50;", "Average = the clean-air normal for this sensor on this day."],
     ["int now = analogRead(MQ_PIN);", "A fresh reading, later."],
     ["if (now > baseline + 150) {", "Only react when it rises <b>150 counts above normal</b> (choose a margin from your own tests)."],
     ['  Serial.println("Change in air!");', "Tell the user. A relative alarm is more honest than a fake “ppm”."],
     ["}", ""]])}
    ${wiringBlock("mq")}
    ${progBlock("mq")}
    <div class="casebox"><b>Use case: is the kitchen air changing?</b>Record a baseline with the window open, then cook. The reading climbs when oil smokes. You have learned something real (cooking changes air) without claiming a certified measurement.</div>
    <div class="expbox"><b>Try it</b>Wave a closed marker pen (alcohol ink) near an MQ-3 or MQ-135 and watch the value rise, then fall as the vapour drifts away. Then breathe on it from 5 cm. Which one raised the reading more? Write one sentence on why the sensor cannot name the gas.</div>
    ${srcs(["mqsheet"])}`, interactive:["mqViz","sandbox:sb_mq"]}
  ],
  quiz:[
   {q:"What happens to an LDR's resistance as light increases?", o:["It rises","It falls","It stays the same","It becomes zero"], a:1, e:"More light = lower resistance.", w:["Opposite.","","It is light-dependent.","Never fully zero."]},
   {q:"Why compare an MQ reading with a clean-air baseline?", o:["The sensor has no units","Raw values depend on heat, humidity, and the individual sensor","To make the code shorter","The ADC is slow"], a:1, e:"Different sensors and conditions give different raw values; the change from baseline is meaningful.", w:["","","",""]},
   {q:"Which MQ sensor is a broad air-quality sensor?", o:["MQ-7","MQ-135","MQ-4","MQ-3"], a:1, e:"MQ-135 reacts to several air-quality gases.", w:["Carbon monoxide.","","Methane.","Alcohol."]},
   {q:"Is an MQ-2 breadboard module a safety device?", o:["Yes, if powered by 5 V","No, it is for learning and trends","Yes, if calibrated","Only outdoors"], a:1, e:"Hobby sensors are not certified.", w:["","","Calibration does not certify it.","Location does not matter."]}
  ],
  rating:["I know that light and gas sensors are analog.","I can read an LDR and an MQ sensor with help.","I can calibrate and detect change.","I can explain the limits of MQ sensors to a classmate."],
  checkpoint:{code:"U2-C2", task:"Pass the light and gas missions. Write three sentences: what would make your MQ reading change that is not a gas?", met:"Missions pass; the answer names heat, humidity, or warm-up.", upload:"Upload screenshots and your answer."},
  refs:["mqsheet","wmoair","arduinoLang"]
 },

 {id:"2.3", title:"Distance and motion: HC-SR04 and PIR", minutes:150,
  intro:"Two sensors that notice the world around a device. The ultrasonic sensor measures distance by echo; the PIR sensor notices a change in infrared heat, such as a person walking by.",
  objectives:["Explain how the HC-SR04 measures distance with sound and the formula d = t × 0.0343 ÷ 2.","Wire the HC-SR04 safely on a 3.3 V board (ECHO divider).","Explain how a PIR sensor detects motion, including warm-up and hold time.","Use a PIR output without false triggers."],
  sections:[
   {id:"sonar", title:"Ultrasonic distance", keys:"hc-sr04 ultrasonic distance echo trigger pulseIn", html:`
    <p class="plain"><b>In plain words</b>A bat finds a moth by shouting and listening for the echo. The HC-SR04 does the same with a sound too high to hear (40 kHz). It shouts (TRIG), then times how long the echo takes to come back (ECHO). <b>Sound travels about 343 metres per second</b>, so a longer wait means a farther object. The sensor measures <b>time</b>; your code turns time into distance.</p>
    <table class="t"><tr><th>Echo time</th><th>Round trip</th><th>Distance (one way)</th></tr><tr><td>583 µs</td><td>583 × 0.0343 = 20 cm</td><td><b>10 cm</b></td></tr><tr><td>1166 µs</td><td>40 cm</td><td><b>20 cm</b></td></tr><tr><td>5830 µs</td><td>200 cm</td><td><b>100 cm</b></td></tr></table>
    <p>The sound goes <b>there and back</b>, so we divide by 2.</p>
    <p>The HC-SR04 sends a burst of 40 kHz sound when you pulse TRIG for 10 µs, then raises ECHO for as long as the sound takes to return. Distance in cm = <b>echo time (µs) × 0.0343 ÷ 2</b> (${ct("hcsr04")}). Readings of 0 or very large numbers mean no echo: reject them.</p>
    ${safety(`<p>ECHO outputs 5 V. On a 3.3 V board use a divider (1 kΩ + 2 kΩ) on ECHO. On the Uno R4 WiFi no divider is needed.</p>`)}
    ${anat("Distance, line by line", [
     ["digitalWrite(TRIG_PIN, LOW);  delayMicroseconds(2);", "Make sure TRIG starts LOW (clean start)."],
     ["digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);", "A 10 µs HIGH pulse = “shout now”."],
     ["digitalWrite(TRIG_PIN, LOW);", "End of the shout."],
     ["long us = pulseIn(ECHO_PIN, HIGH, 30000);", "<code>pulseIn</code> waits for ECHO to go HIGH and times how long it stays HIGH, in microseconds. <code>30000</code> is a time-out (30 ms ≈ 5 m): if nothing comes back it returns 0."],
     ["if (us == 0) return;", "No echo: reject this reading."],
     ["float cm = us * 0.0343 / 2.0;", "Time → distance. Divide by 2 because the sound travelled there <b>and back</b>."],
     ["Serial.println(cm);", "Show it."]])}
    ${wiringBlock("hcsr04")}
    ${progBlock("sonar")}
    <div class="casebox"><b>Use case: the smart bin</b>Mount the sensor in the lid pointing down. Empty bin = 40 cm; full bin = 5 cm. Convert to a fill percentage and send an alert when it passes 80 % (SDG 11, sustainable cities).</div>
    <div class="expbox"><b>Try it</b>Point the sensor at a wall from 20 cm, then at a soft pillow. The pillow gives noisier or lower-quality echoes. Soft and angled surfaces absorb or deflect sound: write down which surfaces your sensor measures well.</div>`, interactive:["sonarViz","sandbox:sb_sonar"]},
   {id:"pir", title:"PIR motion sensor", keys:"pir motion infrared hold time warm-up hc-sr501", html:`
    <p class="plain"><b>In plain words</b>Every warm body glows with invisible <b>infrared</b> light. A PIR (“passive infrared”) sensor does not send anything out (that is the <i>passive</i>); it only watches the heat arriving. It cannot see a still warm object against a warm wall; it notices when the pattern of heat <b>changes</b>, such as a person walking through its view. Use the lab to see exactly how the lens, the two detectors and the “hold time” create the signal you read.</p>
    <p>A PIR (passive infrared) sensor has two infrared-sensitive halves. A warm body crossing from one half to the other creates a difference that the sensor reports as HIGH. Two things surprise beginners (${ct("pirsheet")}):</p>
    <ul><li><b>Warm-up</b>: for the first 30–60 s the output flickers. Ignore it.</li>
     <li><b>Hold time</b>: after motion stops, the output stays HIGH for a few seconds (adjustable on the module). Your code should use its own timer to decide when the room is "empty".</li></ul>
    ${anat("A PIR with its own “room is empty” timer", [
     ["unsigned long lastMotion = 0;", "Remember <b>when</b> we last saw motion (milliseconds since start)."],
     ["void loop() {", ""],
     ["  if (digitalRead(PIR_PIN) == HIGH) {", "The PIR says motion right now."],
     ["    lastMotion = millis();", "Note the time."],
     ["  }", ""],
     ["  bool occupied = (millis() - lastMotion) < 10000;", "Occupied = motion within the last 10 s. <b>You</b> choose the empty-timer, not the sensor's hold time."],
     ["  digitalWrite(LED_PIN, occupied);", "Light on while someone is considered present."],
     ["}", ""]])}
    ${wiringBlock("pir")}
    ${progBlock("pir")}
    <div class="casebox"><b>Use case: the corridor light that waits</b>A light that switches off the moment you sit still is annoying. Use a 60 s “room is empty” timer in code. It keeps the light on while people are present, and saves energy when they are not (SDG 7).</div>
    ${srcs(["pirsheet"])}`, interactive:["pirLens","pirViz","sandbox:sb_pir"]}
  ],
  quiz:[
   {q:"The echo takes 1166 µs. Distance (cm)?", o:["About 10 cm","About 20 cm","About 40 cm","About 80 cm"], a:1, e:"1166 × 0.0343 ÷ 2 ≈ 20 cm.", w:["Too small.","","Forgot the ÷ 2? That would give 40.",""]},
   {q:"Why divide by 2?", o:["Sound is slow","The sound travels to the object and back","The sensor has two eyes","To get inches"], a:1, e:"The echo time covers the trip there and back.", w:["","","",""]},
   {q:"The PIR output flickers right after power-on. What do you do?", o:["Replace it","Wait for the warm-up period","Raise the baud rate","Add a resistor"], a:1, e:"PIR sensors need 30–60 s to settle.", w:["","","",""]},
   {q:"Why can a PIR miss a person sitting perfectly still?", o:["It is broken","It reacts to changes in heat, not to heat itself","It needs more voltage","It only works at night"], a:1, e:"Equal heat on both detectors gives no difference, so no change is reported.", w:["","","",""]},
   {q:"A PIR stays HIGH for 5 s after you leave. Why?", o:["A bug","The module's hold time","Wi-Fi delay","ADC noise"], a:1, e:"The module holds the output for an adjustable time.", w:["","","",""]}
  ],
  rating:["I know both sensors exist.","I can read a distance and motion with help.","I can handle bad echoes and PIR warm-up.","I can design a simple presence alarm."],
  checkpoint:{code:"U2-C3", task:"Pass the distance and motion missions. Design a one-paragraph use for each sensor aimed at an SDG (for example SDG 11 or 3).", met:"Missions pass; the paragraph names a user, a problem, and the sensor's role.", upload:"Upload screenshots and your paragraph."},
  refs:["hcsr04","pirsheet","arduinoLang"]
 },

 {id:"2.4", title:"Making things move: servo and DC motor", minutes:150,
  intro:"Actuators turn code into motion. A servo goes to a chosen angle; a DC motor spins at a chosen speed and direction. Both need more current than a pin can give, so you will learn how to power them safely.",
  objectives:["Control a hobby servo angle with the Servo library.","Explain why a motor needs a driver (H-bridge or transistor) and a diode/flyback protection.","Control speed (PWM) and direction (two pins) of a DC motor.","Budget current for the whole prototype."],
  sections:[
   {id:"servo", title:"Servo motor", keys:"servo angle pulse width attach write", html:`
    <p class="plain"><b>In plain words</b>A servo is a motor that <b>knows where it is</b>. You do not tell it “spin”; you tell it “go to 90°” and it moves there and holds. Inside are a small motor, gears and a position sensor that keeps checking. You send a short pulse every 20 ms; the <b>width</b> of the pulse is the angle: narrow = one end, wide = the other end.</p>
    <p>A hobby servo has a motor, gears, and a position sensor. You send a pulse every 20 ms; a pulse of about 1 ms means 0°, 1.5 ms means 90°, 2 ms means 180°. The Servo library does this: <code>servo.attach(pin)</code> then <code>servo.write(angle)</code> (${ct("servolib")}).</p>
    <ul><li>Power the servo from <b>5 V</b> (not a data pin). A small SG90 can pull 500 mA when it stalls.</li>
     <li>Share GND between the servo supply and the board.</li>
     <li>Forgetting <code>attach()</code> is the most common bug: nothing moves.</li></ul>
    ${anat("Servo sweep, line by line", [
     ["#include <Servo.h>", "Load the servo helper library."],
     ["Servo arm;", "Make a servo object named <code>arm</code>."],
     ["void setup() {", ""],
     ["  arm.attach(SERVO_PIN);", "Connect the object to a pin. <b>Forget this and nothing moves.</b>"],
     ["}", ""],
     ["void loop() {", ""],
     ["  for (int a = 0; a <= 180; a += 10) {", "Count the angle a from 0 to 180 in steps of 10."],
     ["    arm.write(a);", "Move to angle <code>a</code>."],
     ["    delay(100);", "Give the servo time to arrive."],
     ["  }", ""],
     ["}", ""]])}
    ${wiringBlock("servo")}
    ${progBlock("servo")}
    <div class="casebox"><b>Use case: the pill-box lid</b>A servo opens a lid to 90° at 8:00 and closes it at 8:10. One angle for open, one for closed, and a timer: you have a reminder that is hard to ignore (SDG 3).</div>
    ${srcs(["servolib"])}`, interactive:["servoViz","sandbox:sb_servo"]},
   {id:"motor", title:"DC motor with a driver", keys:"dc motor h-bridge l298n l9110 driver pwm direction flyback", html:`
    <p class="plain"><b>In plain words</b>A DC motor has no brain: give it power and it spins; reverse the wires and it spins the other way. A board pin gives only about 20 mA, but a motor wants 100–500 mA. The <b>driver</b> is a strong electronic switch that obeys the pin's weak signal and sends the big current from a separate supply. Two direction pins choose forward or reverse; a PWM pin (rapid on-off) sets the speed.</p>
    <p>A small DC motor can draw 100–500 mA, far more than a pin's 20–40 mA. A <b>driver</b> (an H-bridge such as an L298N or L9110S module) switches the motor current for you. Two direction pins choose forward or reverse and a PWM <b>enable</b> pin sets the speed.</p>
    <table class="t"><tr><th>IN1</th><th>IN2</th><th>Motor</th></tr><tr><td>HIGH</td><td>LOW</td><td>Forward</td></tr><tr><td>LOW</td><td>HIGH</td><td>Reverse</td></tr><tr><td>LOW</td><td>LOW</td><td>Stopped (coast)</td></tr></table>
    ${safety(`<p>Motors create voltage spikes when switched off. Use a driver module (it has protection diodes) and never connect a motor directly to a board pin.</p>`)}
    ${anat("Motor forward, then reverse", [
     ["digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);", "IN1 high, IN2 low = <b>forward</b>."],
     ["analogWrite(ENA, 180);", "Speed from 0 (stopped) to 255 (full). 180 is about 70 %."],
     ["delay(2000);", "Run for 2 seconds."],
     ["analogWrite(ENA, 0);", "Stop first. Never reverse a spinning motor at full speed; it stresses the driver."],
     ["delay(500);", ""],
     ["digitalWrite(IN1, LOW); digitalWrite(IN2, HIGH);", "Swap the inputs = <b>reverse</b>."],
     ["analogWrite(ENA, 180);", "Run again at the same speed."]])}
    ${wiringBlock("motor")}
    ${progBlock("motor")}
    <div class="casebox"><b>Use case: the little irrigation pump</b>A 5 V pump behaves like a motor. Soil sensor says dry, driver switches the pump on for 5 seconds, then off. Separate supply, shared GND, diode protection: the same rules as here.</div>`, interactive:["hbridgeViz","sandbox:sb_motor"]},
   {id:"power", title:"Power budget", keys:"power budget current usb mA", html:`
    <p class="plain"><b>In plain words</b>Think of current like water in pipes. The supply (a USB port) can only deliver so much per second. If you add up what every part wants and it is <b>more than the supply gives</b>, the voltage sags, the board resets, and strange bugs appear. A quick sum on paper before wiring saves hours.</p>
    <table class="t"><tr><th>Part</th><th>Worst case</th></tr><tr><td>Board with Wi-Fi</td><td>250 mA</td></tr><tr><td>MQ-2 heater</td><td>150 mA</td></tr><tr><td>SG90 servo (stalled)</td><td>500 mA</td></tr><tr><td><b>Total</b></td><td><b>900 mA</b> &gt; 500 mA USB: use a separate 5 V supply</td></tr></table>
    <p>A USB port supplies about 500 mA. Add up the worst-case current of everything: the board (50–250 mA with Wi-Fi), an MQ heater (150 mA), a servo (up to 500 mA), a motor (up to 500 mA). If the total is above the supply, use a separate supply and share GND.</p>`, interactive:"powerBudget"}
  ],
  quiz:[
   {q:"What is the first thing to check if a servo does not move?", o:["The baud rate","That attach() was called on the right pin","That the LED works","The humidity"], a:1, e:"No attach() means no pulses.", w:["","","",""]},
   {q:"Why use a driver for a DC motor?", o:["To make it quieter","Pins cannot supply enough current and need protection from spikes","To use fewer libraries","To read the speed"], a:1, e:"The driver switches larger current and protects the board.", w:["","","",""]},
   {q:"IN1 LOW and IN2 HIGH makes the motor…", o:["Go forward","Go in reverse","Stop","Brake hard"], a:1, e:"Swapping the two inputs swaps the direction.", w:["","","",""]},
   {q:"A servo pulse of 1.5 ms means about…", o:["0°","90°","180°","270°"], a:1, e:"1.5 ms is the centre.", w:["","","",""]}
  ],
  rating:["I know servos and motors are different.","I can move a servo.","I can control a motor's speed and direction.","I can budget power for a prototype."],
  checkpoint:{code:"U2-C4", task:"Pass the servo and motor missions. Fill in the power budget for a prototype with a board, an MQ sensor, a servo, and a motor.", met:"Missions pass; the budget shows every current and a decision about supply.", upload:"Upload screenshots and the budget."},
  refs:["servolib","sfPWM","arduinoLang"]
 },

 {id:"2.5", title:"Putting sensors together: trust, calibration, and the room guardian", minutes:150,
  intro:"A prototype combines parts. You will choose sensors for a purpose, plot signals to see noise, calibrate with two points, and build a multi-sensor guardian that reacts to its surroundings.",
  objectives:["Choose a sensor for a measurement and state its limits.","Smooth noisy data with a moving average and a median filter.","Calibrate a sensor with two reference points.","Combine several sensors and actuators into one state machine."],
  sections:[
   {id:"pick", title:"Which sensor for which job?", keys:"sensor selection range accuracy cost", html:`<p>Write the question first (for example "Is the classroom too hot?"), then the measurement, then the sensor. Check range, accuracy, response time, power, voltage, and price. A cheap sensor that is good enough is better than an expensive one you do not need.</p>`, interactive:"sensorPicker"},
   {id:"plot", title:"Seeing the signal", keys:"serial plotter noise filter moving average median", html:`
    <p class="plain"><b>In plain words</b>Numbers in a list are hard to judge; a line on a graph is easy. Real sensors jitter (<b>noise</b>) and occasionally jump (<b>spikes</b>). A <b>moving average</b> replaces each reading by the average of the last few: smooth but a little late. A <b>median</b> picks the middle value of three: it throws away a one-off spike completely. (Reminder of the Plotter format from 2.1: <code>name:value</code>, one line per sample.)</p>
    <p>Open <b>Tools → Serial Plotter</b> and print one number per line to see the signal as a graph. Noise shows as jitter; spikes show as sudden jumps. A <b>moving average</b> smooths jitter; a <b>median</b> of three or five removes spikes without blurring edges.</p>
    ${code("cpp", `int median3(int a, int b, int c) {
  if ((a <= b && b <= c) || (c <= b && b <= a)) return b;
  if ((b <= a && a <= c) || (c <= a && a <= b)) return a;
  return c;
}`, "Median of three")}`, interactive:["signalLab"]},
   {id:"cal", title:"Two-point calibration", keys:"calibration two-point offset gain", html:`
    <p>Measure the sensor at two known values (for example ice water at 0 °C and a reference thermometer at room temperature). Draw the straight line through the two points: <b>corrected = (raw − raw₁) × (true₂ − true₁) ÷ (raw₂ − raw₁) + true₁</b>.</p>`, interactive:"calibLab"},
   {id:"guardian", title:"Build: the room guardian", keys:"guardian state machine rgb buzzer pir dht", html:`
    <p>Combine what you have learned: an RGB LED that shows green (all good), blue (someone present), and red with a buzzer (too hot or too much gas). Write each rule as a sentence first, then code it.</p>
    ${noKit}`, interactive:"sandbox:sb_guardian"}
  ],
  quiz:[
   {q:"A median filter is best at removing…", o:["Slow drift","Single-sample spikes","Wi-Fi delays","Voltage offsets"], a:1, e:"A median ignores outliers.", w:["","","",""]},
   {q:"Two-point calibration needs…", o:["One known value","Two known reference values","A new sensor","A bigger resistor"], a:1, e:"Two points define a line.", w:["","","",""]},
   {q:"Why write rules as sentences before coding?", o:["To please the teacher","So you can check the logic and test each rule","To save memory","To avoid libraries"], a:1, e:"Clear rules become clear tests.", w:["","","",""]}
  ],
  rating:["I can use one sensor.","I can combine two.","I can filter and calibrate.","I can design a multi-sensor prototype and test each rule."],
  checkpoint:{code:"U2-C5", task:"Pass the guardian mission and record one calibration for any sensor (two reference points and the corrected formula).", met:"Mission passes; the calibration shows two points.", upload:"Upload the screenshot and calibration."},
  refs:["arduinoLang","tmp36","mqsheet"]
 }
]});
