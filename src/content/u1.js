/* ============ UNIT 1: ARDUINO FOUNDATIONS ============ */
const COURSE = [];
const troubleshoot = rows => `<h3>Troubleshooting</h3><table class="t"><tr><th>Symptom</th><th>Likely cause</th><th>Try this</th></tr>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table>`;
const libBox = (name, by, extra) => `<div class="callout tip"><b>Install the library</b><p>In the Arduino IDE open <b>Sketch → Include Library → Manage Libraries…</b>, search <b>${name}</b>, and install the one by <b>${by}</b>.${extra ? " " + extra : ""}</p></div>`;
const noKit = `<div class="callout tip"><b>No kit? No problem.</b><p>Every lab in this course runs in the <b>virtual bench</b> below it: the same code, the same pins, the same checks. When you do have parts, copy the code you finished in the sandbox to the Arduino IDE and it will behave the same way.</p></div>`;
COURSE.push({id:"u1", title:"Unit 1: Arduino foundations", sub:"Boards, electronics, code, and your first actuators", blurb:"Meet the three boards, learn the electronics you need, write your first programs, and control LEDs, a colour LED, a pushbutton, and a buzzer. Everything runs in the virtual bench, so a kit is optional.", modules:[

 {id:"1.1", title:"Meet the boards and set up", minutes:90,
  intro:"This course uses three boards that share one programming language. You will learn what makes each board different, install the Arduino IDE, and upload your first program. After this module you can read a pin label without guessing.",
  objectives:["Name the three boards in the course and one real difference between them (voltage, Wi-Fi chip, memory).","Install the Arduino IDE and the board package for your board.","Upload a sketch and read output in the Serial Monitor.","Explain what GPIO, ADC, PWM, and logic level mean."],
  sections:[
   {id:"three", title:"Three boards, one language", keys:"uno r4 wifi esp8266 esp32 compare board", html:`
    <p>An <b>Arduino sketch</b> is a small C++ program with two functions: <code>setup()</code> runs once and <code>loop()</code> repeats forever. The same sketch idea works on all three boards. What changes is the hardware under it.</p>
    <table class="t"><tr><th></th><th>Arduino UNO R4 WiFi</th><th>ESP8266 (NodeMCU / Wemos D1)</th><th>ESP32 (this course: ESP32-S3)</th></tr>
     <tr><td><b>Logic level</b></td><td>5 V</td><td>3.3 V</td><td>3.3 V</td></tr>
     <tr><td><b>Analog input (ADC)</b></td><td>14-bit available (10-bit default), 6 pins</td><td>10-bit, <b>one</b> pin (A0), 0–1 V on bare chips</td><td>12-bit, many pins</td></tr>
     <tr><td><b>Wi-Fi</b></td><td>Yes, via a separate ESP32-S3 chip (WiFiS3 library)</td><td>Built in</td><td>Built in (plus Bluetooth LE)</td></tr>
     <tr><td><b>Best for</b></td><td>Learning, 5 V parts, classrooms</td><td>Cheapest Wi-Fi projects</td><td>Many pins, more memory, sensors plus Wi-Fi</td></tr>
     <tr><td><b>Watch out</b></td><td>Wi-Fi code differs from the ESP boards</td><td>Few pins; some pins affect booting</td><td>Not 5 V tolerant</td></tr></table>
    <p>${ct("unoR4")} describe the UNO R4 WiFi; ${ct("esp32core")} and ${ct("esp8266core")} document the two ESP cores. This course shows code for all three boards: choose yours in the <b>board tabs</b> and the pin numbers, voltages, and library names update.</p>
    ${mis(`<p>Treating all boards as 5 V. A 5 V signal on a 3.3 V ESP pin can damage it. You will learn the fix (a voltage divider) in Module 1.2.</p>`)}
    ${srcs(["unoR4","esp32core","esp8266core"])}`, interactive:"pinMap"},
   {id:"anatomy", title:"What is on a board?", keys:"microcontroller cpu flash ram gpio adc pwm", html:`
    <p>A microcontroller is a tiny computer on one chip. Its pins connect it to the world:</p>
    <ul><li><b>GPIO</b>: digital pins that read or write HIGH (3.3 or 5 V) and LOW (0 V).</li>
     <li><b>ADC</b> (analog-to-digital converter): measures a voltage and returns a number, for example 0–1023 on a 10-bit ADC.</li>
     <li><b>PWM</b> (pulse-width modulation): switches a pin on and off fast so the <i>average</i> power changes. It dims LEDs and sets motor speed.</li>
     <li><b>Flash</b> keeps your program when the power is off; <b>RAM</b> holds variables while it runs.</li></ul>
    ${tryit(`<p>Open the board explorer above. Tap pins and find: which pin does your board use for the on-board LED, and which pins have an ADC?</p>`)}`, interactive:"mcuAnatomy"},
   {id:"first", title:"Your first program: telling the board what to do", keys:"program instruction sequence loop setup blink led first", html:`
    <p class="plain"><b>In plain words</b>A program is a <b>list of instructions</b>, like a recipe. The board is a very literal cook: it does exactly what the list says, one line at a time, from top to bottom, and it never guesses. When it reaches the end, our boards go back to the top and do it again, forever.</p>
    <p>Our first recipe makes an LED blink. In your head it is four steps: <b>LED on → wait → LED off → wait</b>, repeated. Build exactly that below with cards, then see the same list written in code. No typing, no experience needed.</p>
    <table class="t"><tr><th>Word</th><th>What it means</th></tr>
     <tr><td><b>sketch</b></td><td>An Arduino program (a text file, usually ending in <code>.ino</code>).</td></tr>
     <tr><td><b>upload</b></td><td>Send the program from your computer to the board over the USB cable. The board remembers it, even when unplugged.</td></tr>
     <tr><td><b>pin</b></td><td>A metal contact on the board that can send or listen for electrical signals. Pins have numbers or names such as D6 or GPIO15.</td></tr>
     <tr><td><b>HIGH / LOW</b></td><td>HIGH means the pin outputs its full voltage (3.3 V or 5 V, “on”). LOW means 0 V (“off”).</td></tr>
     <tr><td><b>millisecond (ms)</b></td><td>One thousandth of a second. 500 ms is half a second; 1000 ms is one second.</td></tr></table>
    ${think(`<p>If you delete both <b>WAIT</b> cards, the LED still switches on and off. Why does it look like it is just glowing dimly? (Run it and read the message.)</p>`)}`, interactive:"blinkIntro"},
   {id:"ide", title:"Install the IDE and upload", keys:"arduino ide install board manager upload serial monitor", html:`
    <ol class="stepsl"><li>Download the <b>Arduino IDE 2</b> from arduino.cc and install it (${ct("arduinoDocs")}).</li>
     <li>Open <b>Tools → Board → Boards Manager</b> and install the package for your board: <b>Arduino UNO R4 Boards</b>, <b>esp8266 by ESP8266 Community</b>, or <b>esp32 by Espressif Systems</b>.</li>
     <li>Plug in the USB cable (use a <b>data</b> cable; some cables only charge). Choose your board and port in the <b>Tools</b> menu.</li>
     <li>Open <b>File → Examples → 01.Basics → Blink</b>, click <b>Upload</b> (the arrow), and watch the on-board LED blink.</li>
     <li>Open <b>Tools → Serial Monitor</b> and set <b>115200 baud</b> to see text your sketch prints.</li></ol>
    ${troubleshoot([["Port is greyed out","No driver or charge-only cable","Try another cable; install the CH340 or CP210x driver for clone boards"],["Upload fails with 'timeout' (ESP8266)","Wrong board or upload speed","Select the exact board and lower Upload Speed to 115200"],["Garbled text in the Serial Monitor","Baud rate mismatch","Match the number in Serial.begin() with the Monitor's baud menu"]])}
    ${noKit}
    ${srcs(["arduinoDocs"])}`, interactive:"sandbox:sb_blink"}
  ],
  quiz:[
   {q:"Which board has a 5 V logic level?", o:["ESP8266","ESP32-S3","Arduino UNO R4 WiFi","All three"], a:2, e:"The UNO R4 WiFi uses 5 V logic. Both ESP boards use 3.3 V.", w:["The ESP8266 is 3.3 V.","The ESP32-S3 is 3.3 V.","","Only one of the three is 5 V."]},
   {q:"What does setup() do in a sketch?", o:["Runs forever","Runs once at start","Runs only on errors","Uploads the sketch"], a:1, e:"setup() runs once; loop() repeats.", w:["That is loop().","","Errors do not call it.","Upload is done by the IDE."]},
   {q:"PWM is used to…", o:["Measure temperature","Change average power, such as LED brightness","Connect to Wi-Fi","Store data"], a:1, e:"PWM switches a pin on and off quickly to change the average power.", w:["That is a sensor's job.","","Wi-Fi uses a radio.","Flash stores programs."]},
   {q:"Your board is not listed under Tools → Port. What do you check first?", o:["Rewrite the sketch","The USB cable is a data cable and the driver is installed","Change the baud rate","Buy another board"], a:1, e:"Charge-only cables and missing drivers are the most common cause.", w:["The sketch does not affect ports.","","Baud rate comes later.","Too early to replace hardware."]}
  ],
  rating:["I can name the boards but not the differences.","I can describe the voltage and Wi-Fi differences.","I installed the IDE and uploaded Blink (or finished the sandbox).","I can explain to a classmate why board choice changes wiring and code."],
  checkpoint:{code:"U1-C1", task:"Install the IDE (or use the sandbox) and run Blink on your board. Show the Serial Monitor (or the sandbox log) with a message that includes your name.", met:"A screenshot shows the board name, the blink running or passing checks, and your message.", upload:"Upload a screenshot of the IDE or the passed sandbox mission."},
  refs:["unoR4","esp32core","esp8266core","arduinoDocs","arduinoLang"]
 },

 {id:"1.2", title:"Electronics essentials", minutes:120,
  intro:"Four ideas explain almost every wiring decision in this course: voltage, current, resistance, and the voltage divider. With them you can pick a resistor, protect a 3.3 V pin, and stop a floating input.",
  objectives:["Explain voltage, current, and resistance with an analogy and their units.","Apply Ohm's law (V = I × R) and P = V × I.","Calculate a safe series resistor for an LED.","Design a voltage divider and explain pull-up resistors.","Compare 5 V and 3.3 V logic."],
  sections:[
   {id:"vir", title:"Voltage, current, resistance", keys:"voltage current resistance ohm law power", html:`
    <p>Think of water in pipes: <b>voltage</b> is pressure (volts, V), <b>current</b> is flow (amperes, A; 1 mA = 0.001 A), and <b>resistance</b> is a narrow pipe (ohms, Ω). Current needs a complete loop from the supply, through the parts, back to GND (${ct("ohm")}).</p>
    <div class="formula">V = I × R &nbsp;•&nbsp; I = V ÷ R &nbsp;•&nbsp; R = V ÷ I &nbsp;•&nbsp; P = V × I</div>
    ${ex("a heater", `<p>An MQ gas sensor heater is about 33 Ω on 5 V: I = 5 ÷ 33 ≈ 0.15 A (150 mA) and P ≈ 0.76 W. That is why it gets warm, and why it needs a good 5 V supply.</p>`)}
    ${safety(`<p>A <b>short circuit</b> (a wire straight from 5V or 3V3 to GND) can overheat wires and damage the board or USB port. Unplug before changing wiring and check twice before plugging in.</p>`)}
    ${srcs(["ohm"])}`, interactive:"ohmLab"},
   {id:"led", title:"Protect an LED with a resistor", keys:"led resistor forward voltage", html:`
    <p class="plain"><b>In plain words</b>An LED is greedy: once it turns on, it lets almost any amount of current through, until it burns out. A <b>resistor</b> in series is a narrow pipe that limits the flow to a safe trickle. The calculator below shows the current as moving dots, so you can <i>see</i> what the resistor does.</p>
    <h4>The picture: sharing the voltage</h4>
    <p>The pin supplies a voltage (3.3 V or 5 V). The LED takes a fixed amount for itself, its <b>forward voltage</b> (about 2.0 V for red, 3.1 V for blue). Whatever is left over has to be used up by the resistor, otherwise too much current flows. That leftover voltage is the key number.</p>
    <p>Then Ohm's law does the rest: <b>R = (V<sub>supply</sub> − V<sub>LED</sub>) ÷ I</b>. Use about 10 mA (0.010 A) for a good, safe brightness, then choose the next standard resistor value up (${ct("sfLED")}).</p>
    ${ex("red LED on a 3.3 V ESP pin, step by step", `<ol class="stepsl"><li>Leftover voltage: 3.3 − 2.0 = <b>1.3 V</b>.</li><li>Wanted current: 10 mA = <b>0.010 A</b>.</li><li>R = 1.3 ÷ 0.010 = <b>130 Ω</b>.</li><li>Next standard value up: <b>150 Ω</b> (220 Ω is also fine and a little dimmer).</li><li>Check: 1.3 ÷ 150 = 0.0087 A = <b>8.7 mA</b>. Safe.</li></ol>`)}
    ${ex("red LED on the 5 V Uno R4 WiFi", `<p>(5 − 2.0) ÷ 0.010 = 300 Ω → 330 Ω gives 3 ÷ 330 = 9.1 mA. But the R4's pins are only rated for about 8 mA each, so this course uses <b>470 Ω</b>: 3 ÷ 470 = 6.4 mA. Always check the pin's limit as well as the LED's.</p>`)}
    <table class="t"><tr><th>Situation</th><th>Leftover V</th><th>R for 10 mA</th><th>Use</th><th>Real current</th></tr>
     <tr><td>Red, 3.3 V board</td><td>1.3 V</td><td>130 Ω</td><td>150 Ω</td><td>8.7 mA</td></tr>
     <tr><td>Green, 3.3 V board</td><td>1.1 V</td><td>110 Ω</td><td>120 Ω</td><td>9.2 mA</td></tr>
     <tr><td>Red, 5 V Uno R4</td><td>3.0 V</td><td>300 Ω</td><td>470 Ω (pin limit)</td><td>6.4 mA</td></tr>
     <tr><td>Blue, 3.3 V board</td><td>0.2 V</td><td>20 Ω</td><td>risky: leftover is tiny</td><td>varies a lot</td></tr></table>
    ${mis(`<p>Using a blue or white LED on 3.3 V and expecting the same resistor as a red one. Their forward voltage (2.8 to 3.4 V) is almost the whole supply, so they can be dim or dark. Try it in the calculator: pick <b>blue</b> on a 3.3 V pin.</p>`)}
    ${tryit(`<p>In the calculator choose <b>Resistor → 47 Ω</b> with a 5 V supply: the dots rush and the LED “burns out”. Then pick 4.7 kΩ: the LED is nearly dark. A resistor is a <b>dimmer and a fuse</b> in one.</p>`)}
    ${srcs(["sfLED"])}`, interactive:"ledCalc"},
   {id:"div", title:"Voltage dividers and logic levels", keys:"voltage divider 5v 3.3v level pullup floating", html:`
    <p class="plain"><b>In plain words</b>A <b>voltage divider</b> is two resistors that <i>share</i> a voltage, like two stairs between 5 V at the top and 0 V (GND) at the bottom. Where you stand between the two stairs is a lower voltage. We use it to shrink a 5 V signal down to a 3.3 V one that an ESP board can safely read.</p>
    <h4>Why do we need this?</h4>
    <p>Different boards speak at different voltages. A <b>logic level</b> is the voltage a board uses for “1” (HIGH): <b>5 V</b> on the Uno R4 WiFi, <b>3.3 V</b> on the ESP8266 and ESP32. The ESP pins can only survive about 3.6 V. Some sensors, such as the HC-SR04's ECHO pin, send a 5 V signal. Plugging that straight into an ESP pin is like forcing 5 litres through a 3.3-litre pipe: something breaks. So we <b>reduce</b> the voltage first.</p>
    <h4>How the divider works, in three ideas</h4>
    <ol class="stepsl"><li><b>The same current flows through both resistors</b> (they are in a chain), so the bigger resistor “uses up” more of the voltage.</li>
     <li><b>Each resistor takes a share of the voltage equal to its share of the resistance.</b> If R2 is two thirds of the total resistance, it gets two thirds of the voltage.</li>
     <li>The wire between the resistors (the middle) carries the voltage across <b>R2</b>. That is <b>V<sub>out</sub></b>.</li></ol>
    <div class="formula">V<sub>out</sub> = V<sub>in</sub> × R2 ÷ (R1 + R2)</div>
    ${ex("5 V down to 3.3 V, with a 1 kΩ and a 2 kΩ resistor", `<ol class="stepsl"><li>Total resistance: 1 000 + 2 000 = <b>3 000 Ω</b>.</li><li>R2's share: 2 000 ÷ 3 000 = <b>0.667</b> (two thirds).</li><li>V<sub>out</sub> = 5 × 0.667 = <b>3.33 V</b>. Safe for a 3.3 V pin.</li><li>Current wasted: 5 ÷ 3 000 = 1.67 mA, tiny.</li></ol>`)}
    ${ex("design your own divider (the recipe)", `<p>Pick R2 (say 2 kΩ), then <b>R1 = R2 × (V<sub>in</sub> − V<sub>out</sub>) ÷ V<sub>out</sub></b> = 2 000 × (5 − 3.3) ÷ 3.3 = 1 030 Ω → use the nearest standard resistor, <b>1 kΩ</b>. Try “Find R2 for 3.3 V out” in the lab.</p>`)}
    <table class="t"><tr><th>Where you will use a divider</th><th>V<sub>in</sub></th><th>R1 / R2</th><th>V<sub>out</sub></th></tr><tr><td>HC-SR04 ECHO → ESP pin</td><td>5 V</td><td>1 kΩ / 2 kΩ</td><td>3.33 V</td></tr><tr><td>MQ sensor analog out (up to 5 V) → ESP pin</td><td>5 V</td><td>10 kΩ / 15 kΩ</td><td>3.0 V</td></tr><tr><td>Light sensor (LDR) with a 10 kΩ resistor</td><td>3.3 V</td><td>LDR / 10 kΩ</td><td>changes with light</td></tr></table>
    <p>The LDR case is a divider whose R1 <b>changes by itself</b>: in bright light its resistance falls, so V<sub>out</sub> rises. That is how a plain resistor-type sensor becomes a voltage the board can measure. In the lab, choose “LDR divider” and drag the light slider.</p>
    ${mis(`<p>Powering a 3.3 V board's input from a 5 V sensor output without a divider or level shifter. Also: a divider only works for a signal going <b>into</b> the 3.3 V board. For a two-way signal (I²C) use a small level-shifter module.</p>`)}
    <h4>Logic levels: what does the pin think it sees?</h4>
    <p>A pin does not need exactly 0 V or 3.3 V. It decides HIGH when the voltage is <b>above a threshold</b> (roughly 70 % of its supply) and LOW below another (roughly 30 %). In between is “unclear”: the reading can flip at random. Slide the voltage in the logic-level lab and watch the zones.</p>
    <h4>Floating inputs and pull-ups</h4>
    <p>An input pin connected to <i>nothing</i> is like a microphone with nothing plugged in: it picks up random noise, so <code>digitalRead</code> flips between HIGH and LOW by itself. A <b>pull-up resistor</b> gently pulls the pin up to HIGH. When a button connects the pin to GND, the button wins and the pin reads LOW. Arduino has this resistor built in: <code>pinMode(pin, INPUT_PULLUP)</code> (${ct("sfPullup")}).</p>
    ${srcs(["sfDivider","sfPullup"])}`, interactive:["dividerLab","logicLevel","pullupViz"]}
  ],
  quiz:[
   {q:"What does Ohm's law say?", o:["V = I × R","P = V + I","R = I × V","I = V × R"], a:0, e:"Voltage equals current times resistance.", w:["","Power is V × I.","Resistance is V ÷ I.","Current is V ÷ R."]},
   {q:"A 3.3 V pin drives a red LED (2.0 V) at 10 mA. Which resistor is right?", o:["13 Ω","130 Ω (use 150–220 Ω)","1.3 kΩ only","No resistor"], a:1, e:"(3.3 − 2.0) ÷ 0.01 = 130 Ω.", w:["Forgot the units of mA.","","Too dim.","Without a resistor the LED and pin can burn out."]},
   {q:"R1 = 1 kΩ (top) and R2 = 2 kΩ (bottom) with 5 V in. What is Vout?", o:["1.67 V","2.5 V","3.33 V","5 V"], a:2, e:"5 × 2 ÷ 3 = 3.33 V.", w:["R1 on top of the fraction.","Needs equal resistors.","","A divider always outputs less than the input."]},
   {q:"Why use INPUT_PULLUP for a button?", o:["To make it brighter","So the pin reads HIGH when not pressed instead of floating","To save memory","To use PWM"], a:1, e:"The internal resistor gives a defined level.", w:["Unrelated.","","Memory is not affected.","PWM is output."]}
  ],
  rating:["I know the words but cannot calculate.","I can use Ohm's law with help.","I can pick an LED resistor and a divider.","I can explain to a classmate why a 5 V signal needs a divider on a 3.3 V board."],
  checkpoint:{code:"U1-C2", task:"Calculate the LED resistor for your board and one divider (5 V to 3.3 V). Check both in the labs.", met:"Both calculations show the formula and match the lab to within 5 %.", upload:"Upload your working (photo or text) and a screenshot of each lab."},
  refs:["ohm","sfLED","sfDivider","sfPullup"]
 },

 {id:"1.3", title:"Breadboarding and safe wiring", minutes:90,
  intro:"A tidy breadboard is a working breadboard. Learn how the hidden metal strips connect, then the habits that make a circuit easy to debug and safe to power.",
  objectives:["Explain which holes on a breadboard are connected.","Build a circuit with power rails, a resistor, and an LED.","Use colour and layout habits that make faults easy to find.","Find faults in a circuit before powering it."],
  sections:[
   {id:"bb", title:"How a breadboard is connected", keys:"breadboard rails strips split power rail", html:`
    <p class="plain"><b>In plain words</b>A breadboard is a plastic board with lots of holes. Under the plastic, metal clips join some holes together, so you can connect parts <b>without soldering</b>. The whole skill is knowing <i>which holes are joined</i>. The explorer below lets you see the hidden clips light up.</p>
    <h4>Three things to know</h4>
    <ol class="stepsl"><li><b>Rows (the main area).</b> Each short column of five holes (a–e, or f–j) is one metal clip. Plug two legs into the <i>same</i> five-hole strip and they are connected. The gap in the middle cuts the board in two, so a chip can straddle it.</li>
     <li><b>Power rails (the long edge strips).</b> Two long strips on each edge (red + and blue −) run the whole length. Connect your board's power (3V3 or 5V) and GND to them, then plug any part into the rail for power. One wire feeds many parts.</li>
     <li><b>Split rails (the trap).</b> On many full-size boards the rails are <b>broken in the middle</b>. Power wired to the left half never reaches the right half! Look for a small gap in the printed red and blue line; if you see one, bridge it with two short jumpers. (Half-size boards usually do not have this break.)</li></ol>
    <p>Always connect the board's <b>GND</b> to the GND rail first.</p>
    ${mis(`<p>Placing an LED's two legs in the <b>same</b> five-hole strip. Both legs are then joined by the clip, so the LED is bypassed and never lights. Put the two legs in <b>different columns</b>.</p>`)}
    ${srcs(["sfBB"])}`, interactive:"bbExplore"},
   {id:"habits", title:"Good wiring habits", keys:"wiring colour habits safe power", html:`
    <ul><li><b>Colour code:</b> red = power, black or blue = ground, other colours for signals. Then a glance tells you what each wire does.</li>
     <li><b>Short, flat wires</b> are easier to check than long loops.</li>
     <li><b>Power off</b> while you change the wiring (unplug USB).</li>
     <li><b>Draw first:</b> list each connection as <i>from → to</i> in a wiring table before you build.</li></ul>
    <p class="plain"><b>Now build one</b>Below you finish a real circuit: an LED and a resistor are already on the board, and you add the two wires that connect it to the microcontroller. Follow the numbered steps. Each turns green when it is done. “Show me where” highlights the right holes if you get stuck.</p>
    ${safety(`<p>Never connect a motor directly to a board pin. A motor needs a driver (Module 2.4) and its own supply or the board's 5 V pin, not a GPIO.</p>`)}`, interactive:"bbBuild"},
   {id:"faults", title:"Find the fault", keys:"debug fault checklist wiring audit", html:`
    <p>Most “broken code” is a wiring fault. Work through this list: power, ground, pin number in the code, resistor in the right place, LED the right way round (long leg = +), and nothing plugged into the wrong row.</p>
    <p class="plain"><b>How the fault finder works</b>Each case tells you a symptom and shows a picture of the breadboard. <b>1)</b> Read the symptom. <b>2)</b> Study the picture: follow the current from the pin, through the parts, back to GND. <b>3)</b> Choose the cause that explains it. When you are right, the faulty spot gets circled and the explanation shows how to fix it. Do all six: each one is a classic mistake.</p>`, interactive:["faultFinder"]},
   {id:"audit", title:"Audit a circuit before you power it", keys:"wiring audit rubric checklist", html:`
    <p>Professionals check a circuit <b>before</b> they apply power. The audit below turns that habit into eight questions, each scored 0, 1 or 2 (16 points in total). Use it on your own breadboard first, then swap with a classmate. Instructions and a worked example are inside the tool.</p>`, interactive:"wiringAudit"}
  ],
  quiz:[
   {q:"Which holes are connected?", o:["All holes on the board","The five holes in one row","Holes across the centre gap","Every other hole"], a:1, e:"A row of five holes shares one metal strip.", w:["","","The gap separates them.",""]},
   {q:"A new LED does not light. What is the most likely first check?", o:["Buy a new board","LED direction and the resistor connection","Reinstall the IDE","Change baud rate"], a:1, e:"LEDs only work one way round and need a complete loop.", w:["","","","Serial speed is unrelated."]},
   {q:"Why connect board GND to the breadboard rail?", o:["To look neat","So every part shares the same 0 V reference","To save power","To increase speed"], a:1, e:"All signals are measured from a shared ground.", w:["","","",""]}
  ],
  rating:["I find breadboards confusing.","I can build an LED circuit with help.","I can build and check a circuit alone.","I can audit a classmate's wiring."],
  checkpoint:{code:"U1-C3", task:"Build the LED circuit on your breadboard (or in the virtual one) and find the faults in all fault cases.", met:"The circuit works; a wiring table is included; the fault cases are solved.", upload:"Upload a top-down photo or screenshot and your wiring table."},
  refs:["sfBB","ohm"]
 },

 {id:"1.4", title:"Programming for Arduino", minutes:210,
  intro:"Programs are instructions that run one line at a time. This module starts from zero: how a program thinks, then variables, decisions, loops, functions, and timing without freezing the board. Every idea has a picture, a step-through you control, a line-by-line example, and a real situation where you would use it.",
  objectives:["Explain how a program uses sequence, repetition, and decisions.","Declare variables of the right type and predict what an assignment does.","Write if/else decisions and for/while loops, and trace them by hand.","Write and call a function with a parameter and a return value.","Use millis() so two things can happen at once.","Read a compile error and fix it."],
  sections:[
   {id:"think", title:"How a program thinks", keys:"program sequence repeat decide setup loop", html:`
    <p class="plain"><b>In plain words</b>Every program, from a blinking LED to a weather station, is built from just <b>three moves</b>: do things <b>in order</b> (sequence), do something <b>again and again</b> (repetition), and do something <b>only if</b> a condition is true (decision). Nothing else.</p>
    <table class="t"><tr><th>Move</th><th>Everyday example</th><th>In Arduino</th></tr>
     <tr><td><b>Sequence</b></td><td>Boil water, then add noodles, then wait three minutes.</td><td>Lines run top to bottom, one at a time.</td></tr>
     <tr><td><b>Repetition</b></td><td>Stir until the sauce thickens. Check the clock every minute.</td><td><code>loop()</code>, <code>for</code>, <code>while</code></td></tr>
     <tr><td><b>Decision</b></td><td>If it is raining, take an umbrella; otherwise take a hat.</td><td><code>if … else</code></td></tr></table>
    <p>An Arduino sketch always has two special blocks: <code>setup()</code> runs <b>once</b> at the start (like switching on and getting ready), and <code>loop()</code> runs <b>over and over</b> (like the day-to-day routine). Press Play below to watch the board run its first program, one line at a time.</p>
    ${think(`<p>You want a fan to turn on when a room is hot, and a counter to go up every time a person walks past. Which of the three moves does each need? (The fan needs a decision; the counter needs a variable that remembers, plus a decision about when to add.)</p>`)}`, interactive:"loopViz"},
   {id:"basics", title:"Variables, types, and operators", keys:"variable int float bool string const operator assignment", html:`
    <p class="plain"><b>In plain words</b>A <b>variable</b> is a labelled box in the board's memory. You choose a name and a <b>type</b> (what kind of thing may go in the box) and then you can put a value in, read it, and change it. Variables are how a program <b>remembers</b>: a count, a temperature, whether the alarm is on.</p>
    <table class="t"><tr><th>Type</th><th>Holds</th><th>Example</th><th>Use it for</th></tr>
     <tr><td><code>int</code></td><td>whole numbers</td><td><code>42</code>, <code>-7</code></td><td>counts, pin numbers, raw ADC readings (0 to 4095)</td></tr>
     <tr><td><code>float</code></td><td>numbers with decimals</td><td><code>24.5</code></td><td>temperatures, voltages, percentages</td></tr>
     <tr><td><code>bool</code></td><td>true or false</td><td><code>true</code></td><td>“is the alarm on?”, “is the button pressed?”</td></tr>
     <tr><td><code>String</code></td><td>text</td><td><code>"hello"</code></td><td>messages for the Serial Monitor (use sparingly: text uses lots of memory)</td></tr>
     <tr><td><code>unsigned long</code></td><td>big whole numbers, never negative</td><td><code>millis()</code></td><td>time in milliseconds (used in the timing section)</td></tr></table>
    <p>On these boards an <code>int</code> holds whole numbers up to about ±2 billion. (On the older Arduino Uno R3 it only reaches ±32 767, so older tutorials warn about it.) Use <code>const</code> in front of a value that never changes, such as a pin number. ${ct("arduinoLang")} lists every type and operator.</p>
    <p><b>Naming rules.</b> Letters, digits and underscores only; do not start with a digit; capital letters matter (<code>tempC</code> and <code>tempc</code> are different boxes). Choose names that explain themselves: <code>tempC</code> beats <code>t</code>. By habit, constants are written in CAPITALS: <code>LED_PIN</code>.</p>
    <h4>Operators: the verbs of code</h4>
    <table class="t"><tr><th>Group</th><th>Operators</th><th>Example → result</th></tr>
     <tr><td>Arithmetic</td><td><code>+ − * /</code> and <code>%</code> (remainder)</td><td><code>7 % 3</code> → 1 (7 = 2×3 + 1)</td></tr>
     <tr><td>Store</td><td><code>=</code> (store the right side in the left box)</td><td><code>count = count + 1;</code> (or <code>count++;</code>)</td></tr>
     <tr><td>Compare</td><td><code>== != &lt; &gt; &lt;= &gt;=</code></td><td><code>tempC &gt; 30</code> → true or false</td></tr>
     <tr><td>Combine questions</td><td><code>&amp;&amp;</code> (and), <code>||</code> (or), <code>!</code> (not)</td><td><code>hot &amp;&amp; occupied</code></td></tr></table>
    ${anat("Example 1: a thermostat's variables", [["const int FAN_PIN = 5;", "A <code>const int</code>: a whole number that never changes. It names the pin that will control the fan."], ["const float LIMIT_C = 30.0;", "A constant with a decimal: the temperature above which we call the room “too hot”."], ["float tempC = 31.2;", "A <code>float</code> box that holds the current temperature. We pretend a sensor gave us 31.2."], ["bool tooHot = tempC > LIMIT_C;", "The comparison <code>31.2 &gt; 30.0</code> is true, so the <code>bool</code> box <code>tooHot</code> stores <b>true</b>."], ["Serial.println(tooHot);", "Prints 1 in the Serial Monitor (Arduino shows true as 1 and false as 0)."]])}
    ${anat("Example 2: counting button presses", [["int presses = 0;", "A box for counting, starting at zero. It is declared <b>outside</b> loop() so it keeps its value between passes."], ["presses = presses + 1;", "Read the box, add one, store the answer back in the same box. (In maths this line would be impossible; in code <code>=</code> means “store”.)"], ["presses++;", "A shorthand that does exactly the same thing."], ["bool even = (presses % 2) == 0;", "The remainder of dividing by 2 is 0 for even numbers. <code>%</code> is great for “every second press” or “every tenth reading”."]])}
    ${ex("the integer division trap", `<p>Two readings, <code>a = 3</code> and <code>b = 4</code> (both <code>int</code>). The average should be 3.5.</p><ol class="stepsl"><li><code>float avg = (a + b) / 2;</code> → (3 + 4) = 7, and <b>7 / 2 with two whole numbers is 3</b>: the remainder is thrown away. The float box stores 3.00.</li><li><code>float avg = (a + b) / 2.0;</code> → one number has a decimal point, so the division keeps decimals: <b>3.50</b>.</li></ol>`)}
    ${mis(`<p>Dividing two integers: <code>7 / 2</code> is <b>3</b>, not 3.5. Use <code>7 / 2.0</code>. Also: writing <code>=</code> when you mean <code>==</code> inside an <code>if</code> (see the next section).</p>`)}
    ${srcs(["arduinoLang"])}`, interactive:["walkVars","varBoxes","typeSort"]},
   {id:"flow", title:"Decisions and loops", keys:"if else for while loop condition and or", html:`
    <p class="plain"><b>In plain words</b>A <b>decision</b> (<code>if</code>) lets the program choose: “if it is too hot, switch the fan on”. A <b>loop</b> repeats a block: “do this 10 times” (<code>for</code>) or “keep doing this until something changes” (<code>while</code>).</p>
    <h4>Decisions</h4>
    <p><code>if (condition) { … } else { … }</code>. The condition is a question with a yes/no answer. The board checks the questions <b>from top to bottom</b> and runs only the first block whose answer is yes. Use the lab to move the temperature and watch the path through the flow chart.</p>
    ${anat("Example 3: a three-way thermostat", [["float tempC = readTemperature();", "Ask a (made-up) function for the temperature and store it."], ["if (tempC > 30) {", "Question 1: is it above 30? If yes, run the next block and skip the rest."], ["  digitalWrite(FAN_PIN, HIGH);", "Too hot: switch the fan on."], ["} else if (tempC < 18) {", "Only asked if question 1 was no. Question 2: is it below 18?"], ["  digitalWrite(HEATER_PIN, HIGH);", "Too cold: switch the heater on."], ["} else {", "Both answers were no: everything in between."], ["  // comfortable: do nothing", "A comment. The block is intentionally empty: not acting is also a decision."], ["}", "End of the whole decision."]])}
    <p>Combine questions with <code>&amp;&amp;</code> (both true), <code>||</code> (at least one true) and <code>!</code> (flip). For example, a fan that runs only when the room is hot <i>and</i> somebody is there: <code>if (tempC &gt; 30 &amp;&amp; personPresent) { … }</code>.</p>
    ${mis(`<p><code>if (x = 5)</code> stores 5 in x and is always true. To ask the question write <code>if (x == 5)</code>. Two equals signs ask; one stores.</p>`)}
    <h4>Loops</h4>
    <p><code>for (int i = 0; i &lt; 5; i++) { … }</code> has three parts: <b>start</b> (<code>i = 0</code>), <b>keep going while</b> (<code>i &lt; 5</code>), and <b>after each round</b> (<code>i++</code> adds one). It repeats exactly 5 times, with i = 0, 1, 2, 3, 4. Step through it below.</p>
    ${anat("Example 4: average ten readings", [["float sum = 0;", "A box to collect the running total, starting at zero."], ["for (int i = 0; i < 10; i++) {", "Repeat 10 times: i goes 0, 1, 2 … 9."], ["  sum = sum + analogRead(A0);", "Take a reading and add it to the total."], ["  delay(10);", "Wait 10 ms so each reading is a fresh sample."], ["}", "End of the loop body: go back, add one to i, ask the question again."], ["float average = sum / 10.0;", "Divide by 10.0 (with the decimal point!) to get the mean. Averaging smooths out random noise, which you will study in Unit 4."]])}
    ${ex("trace the loop by hand", `<p>Suppose three readings are 500, 510 and 520 and the loop runs 3 times. <b>i = 0:</b> sum = 0 + 500 = 500. <b>i = 1:</b> sum = 500 + 510 = 1010. <b>i = 2:</b> sum = 1010 + 520 = 1530. The loop stops (3 &lt; 3 is false). Average = 1530 ÷ 3.0 = <b>510</b>.</p>`)}
    <p><code>while (condition) { … }</code> repeats <b>as long as</b> the condition stays true, when you do not know how many rounds it will take: <code>while (WiFi.status() != WL_CONNECTED) { delay(500); }</code> means “keep waiting until the Wi-Fi is connected”.</p>`, interactive:["ifLab","walkFor","codeTracer"]},
   {id:"func", title:"Functions", keys:"function return parameter void argument", html:`
    <p class="plain"><b>In plain words</b>A <b>function</b> is a recipe card with a name. You write the steps once; afterwards you just call the name. You can hand it ingredients (<b>parameters</b>) and it can hand back a result (the <b>return value</b>). You have used functions already: <code>digitalWrite(pin, value)</code> and <code>delay(ms)</code> are functions someone else wrote.</p>
    <table class="t"><tr><th>Part of <code>float toFahrenheit(float c)</code></th><th>Meaning</th></tr>
     <tr><td><code>float</code> (first)</td><td>The <b>return type</b>: what comes back. <code>void</code> means nothing comes back.</td></tr>
     <tr><td><code>toFahrenheit</code></td><td>The function's <b>name</b>.</td></tr>
     <tr><td><code>(float c)</code></td><td>The <b>parameter</b>: the ingredient it needs, called <code>c</code> inside the function.</td></tr>
     <tr><td><code>return …;</code></td><td>Sends the result back to the line that called the function.</td></tr></table>
    ${anat("Example 5: a function that returns a value", [["float toFahrenheit(float c) {", "Declare the function: it takes one decimal number and returns a decimal number."], ["  return c * 9.0 / 5.0 + 32.0;", "Do the maths and send the answer back."], ["}", "End of the function."], ["", ""], ["float tempF = toFahrenheit(30.0);", "Call it with 30.0. The value 30.0 is copied into <code>c</code>; the answer 86.0 comes back and is stored in <code>tempF</code>."]])}
    ${anat("Example 6: a function that does something (void)", [["void blinkTimes(int n) {", "<code>void</code>: it returns nothing, it just <i>does</i> something. The parameter <code>n</code> is how many blinks."], ["  for (int i = 0; i < n; i++) {", "Repeat n times."], ["    digitalWrite(LED_PIN, HIGH); delay(150);", "Short flash on…"], ["    digitalWrite(LED_PIN, LOW);  delay(150);", "…and off."], ["  }", ""], ["  delay(1000);", "A pause so you can tell one code from the next."], ["}", ""], ["", ""], ["blinkTimes(2);   // 2 blinks = Wi-Fi connected", "Use case: a <b>status code</b> you can read from across the room."], ["blinkTimes(5);   // 5 blinks = sensor error", "Same function, different number: that is the power of parameters."]])}
    <p><b>Why bother?</b> (1) You write the steps <b>once</b>, so a bug is fixed in one place. (2) The code reads like sentences: <code>blinkTimes(2)</code> says what it means. (3) You can test one small piece at a time.</p>`, interactive:["walkFunc","funcLab"]},
   {id:"time", title:"Timing with millis()", keys:"millis delay non-blocking timer", html:`
    <p class="plain"><b>In plain words</b><code>delay(500)</code> is like staring at a kettle for 30 seconds: you can do nothing else. <code>millis()</code> is like glancing at the clock now and then while you do other things, and acting when enough time has passed. It returns the number of milliseconds since the board started.</p>
    <h4>The pattern (remember it)</h4>
    <ol class="stepsl"><li>Keep a box for <b>the last time you acted</b> (<code>previous</code>).</li><li>On every pass of <code>loop()</code>, read the clock (<code>now = millis()</code>).</li><li>If <code>now − previous ≥ interval</code>, act, then set <code>previous = now</code>.</li></ol>
    ${anat("Example 7: blink the LED and watch a button at the same time", [["const int LED_PIN = 6;", "The LED pin."], ["const int BTN_PIN = 2;", "The button pin."], ["const unsigned long BLINK_MS = 500;", "How long to wait between changes: half a second. <code>unsigned long</code> is the type millis() uses."], ["unsigned long previous = 0;", "The last time we flipped the LED. Declared outside loop() so it is remembered."], ["bool ledOn = false;", "Is the LED currently on?"], ["", ""], ["void setup() {", ""], ["  Serial.begin(115200);", "Open the Serial Monitor connection."], ["  pinMode(LED_PIN, OUTPUT);", "LED pin sends signals out."], ["  pinMode(BTN_PIN, INPUT_PULLUP);", "Button pin listens; the built-in pull-up holds it HIGH until pressed."], ["}", ""], ["", ""], ["void loop() {", ""], ["  unsigned long now = millis();", "Read the clock."], ["  if (now - previous >= BLINK_MS) {", "Has half a second passed since the last flip?"], ["    previous = now;", "Yes: remember this moment."], ["    ledOn = !ledOn;", "Flip the box: true becomes false, false becomes true."], ["    digitalWrite(LED_PIN, ledOn);", "Show it on the LED."], ["  }", ""], ["  if (digitalRead(BTN_PIN) == LOW) {", "Runs on <b>every</b> pass, thousands of times a second, so a press is never missed."], ["    Serial.println(\"pressed!\");", "Report it."], ["  }", ""], ["}", ""]])}
    <table class="t"><tr><th></th><th><code>delay()</code></th><th><code>millis()</code></th></tr><tr><td>Simple to write</td><td>Yes</td><td>A little more code</td></tr><tr><td>Board can do other things while waiting</td><td><b>No</b>: it is frozen</td><td><b>Yes</b></td></tr><tr><td>Button pressed during the wait</td><td>Missed</td><td>Seen at once</td></tr><tr><td>Best for</td><td>A single simple job, short pauses</td><td>Projects with two or more jobs (sensor + LED + button)</td></tr></table>
    ${ex("why it matters for data collection", `<p>Your logger must read a sensor every 2 seconds <i>and</i> keep a heartbeat LED going <i>and</i> notice a button. With <code>delay(2000)</code> the button is only checked once every two seconds. With <code>millis()</code> each job has its own timer and none of them waits for another.</p>`)}
    ${progBlock("timer")}
    ${noKit}`, interactive:["millisClock","delayRace"]},
   {id:"errors", title:"Reading errors and fixing bugs", keys:"compile error debug bug semicolon not declared brace", html:`
    <p class="plain"><b>In plain words</b>Before a sketch runs, the <b>compiler</b> translates your code for the board. If it finds something it cannot understand, it stops and prints an <b>error message</b>. Errors are not failures: they are the board telling you where to look. Read the <b>first</b> error only; later ones are often side effects of the first.</p>
    <table class="t"><tr><th>The message says…</th><th>It usually means</th><th>Try this</th></tr>
     <tr><td><code>expected ';' before …</code></td><td>A missing semicolon (often on the line <b>above</b> the one reported)</td><td>Check the end of the previous line</td></tr>
     <tr><td><code>'xyz' was not declared in this scope</code></td><td>A typo, wrong capital letter, or a variable used before it was created</td><td>Compare the spelling with the declaration (<code>pinMode</code>, not <code>pinmode</code>)</td></tr>
     <tr><td><code>expected '}' at end of input</code></td><td>A curly brace was opened but never closed</td><td>Press Ctrl+T (Auto Format): the indentation shows where a block is wrong</td></tr>
     <tr><td><code>'x' does not name a type</code></td><td>A statement placed outside any function</td><td>Move it inside <code>setup()</code> or <code>loop()</code></td></tr>
     <tr><td><code>redefinition of 'void setup()'</code></td><td>Two copies of the same function</td><td>Delete one</td></tr></table>
    <p>Some bugs give <b>no</b> error: the sketch compiles but behaves wrongly (the average is 3 instead of 3.5; the LED never seems to blink). Those are found by <b>predicting</b> what the code does, then comparing with what it really does.</p>
    <h4>Your mission: the code detective</h4>
    <p>Instead of typing, you now solve puzzles in four levels. <b>Level 1 · Predict</b> what the code prints. <b>Level 2 · Order</b> scrambled chunks into a working sketch. <b>Level 3 · Find the bug</b> on a screen that shows the compiler's message. <b>Levels 4 and 5</b> are the real sandbox missions further down, where you write and run code on the virtual board. Solve three puzzles at each of the first three levels to earn the badge.</p>`, interactive:["codeDetective","sandbox:sb_pattern,sb_timer"]}
  ],
  quiz:[
   {q:"What is 7 / 2 when both are int?", o:["3.5","3","4","2"], a:1, e:"Integer division drops the remainder.", w:["Needs a float.","","",""]},
   {q:"What does count = count + 1; do?", o:["Nothing: it is impossible","Reads count, adds one, and stores the result back in count","Compares count with count + 1","Prints count"], a:1, e:"In code, = means store: take what is in the box, add one, put it back.", w:["That is maths, not code.","","That would be ==.","Printing needs Serial.println."]},
   {q:"Why prefer millis() to delay() in a project with a button and a blinking LED?", o:["It is shorter","delay() freezes everything else","millis() is more accurate","delay() is not allowed"], a:1, e:"delay() blocks, so a button press during the delay is missed.", w:["","","Not the main reason.","It is allowed but blocking."]},
   {q:"Which loop is best when you know the count?", o:["for","while(true)","if","switch"], a:0, e:"A for loop counts.", w:["","Never ends.","Not a loop.","Not a loop."]},
   {q:"What is wrong with if (x = 5)?", o:["Nothing","A single = stores 5 in x instead of asking whether x equals 5","It needs a semicolon","x must be a float"], a:1, e:"Use == to compare. One = stores a value and the condition is then always true.", w:["","","","Types are not the issue."]},
   {q:"What does a function with return type void do?", o:["Returns a decimal","Does its job but gives nothing back","Deletes variables","Runs only once"], a:1, e:"void means no return value: the function just does something.", w:["","","","It runs every time it is called."]},
   {q:"A compile error says 'was not declared in this scope'. What does it mean?", o:["The board is broken","You used a name before declaring it, or mistyped it","The cable is loose","The library is too new"], a:1, e:"The compiler does not know that name.", w:["","","",""]}
  ],
  rating:["Code still looks like a foreign language.","I can read simple code and predict what it does.","I can write loops, functions, and use millis().","I can find and fix a classmate's bug."],
  checkpoint:{code:"U1-C4", task:"Solve at least three puzzles at each of the first three levels of the code detective. Then finish the two sandbox missions (pattern and two rhythms) and explain in two sentences why the second one cannot use delay().", met:"The badge is earned, both missions pass, and the explanation names blocking.", upload:"Upload a screenshot of both passed missions and your two sentences."},
  refs:["arduinoLang","arduinoDocs"]
 },

 {id:"1.5", title:"LEDs, RGB LED, pushbutton, and buzzer", minutes:210,
  intro:"Your first actuators and the simplest input. For each part you first learn what is inside it and how it works, then wire it, then program it line by line, and finally use it in a realistic situation. By the end you combine them into a mini-prototype.",
  objectives:["Describe how an LED, RGB LED, pushbutton and piezo buzzer work inside.","Blink and dim an LED (digitalWrite, analogWrite).","Mix colours with an RGB LED.","Read a pushbutton with INPUT_PULLUP and debounce it.","Play notes with a piezo buzzer using tone().","Combine the parts into a status light and an alarm."],
  sections:[
   {id:"meet", title:"Meet the four parts", keys:"led rgb button buzzer actuator input output", html:`
    <p class="plain"><b>In plain words</b>An <b>output</b> is a part the board <i>controls</i> (LED, buzzer): it makes light or sound. An <b>input</b> is a part the board <i>listens to</i> (pushbutton, sensors). Almost every prototype is “read an input, decide, drive an output”.</p>
    <table class="t"><tr><th>Part</th><th>What it does</th><th>Type</th><th>Key idea</th><th>Key code</th></tr>
     <tr><td><b>LED</b></td><td>Gives light</td><td>Output</td><td>One-way, needs a resistor</td><td><code>digitalWrite</code>, <code>analogWrite</code></td></tr>
     <tr><td><b>RGB LED</b></td><td>Gives any colour</td><td>Output</td><td>Three LEDs in one package</td><td>three <code>analogWrite</code> calls</td></tr>
     <tr><td><b>Pushbutton</b></td><td>Tells the board “a person pressed me”</td><td>Input</td><td>Joins two sides when pressed; bounces</td><td><code>INPUT_PULLUP</code>, <code>digitalRead</code></td></tr>
     <tr><td><b>Piezo buzzer</b></td><td>Gives sound</td><td>Output</td><td>Vibrates at the frequency you choose</td><td><code>tone</code>, <code>noTone</code></td></tr></table>
    <p>For each part, the lesson has the same four steps: <b>① how it works inside</b> (with an interactive picture), <b>② how to wire it</b>, <b>③ the code, line by line</b>, <b>④ where you would use it</b>.</p>`},
   {id:"ledhow", title:"① An LED: how it works inside", keys:"led anode cathode diode polarity forward voltage", html:`
    <p class="plain"><b>In plain words</b>LED stands for <b>Light-Emitting Diode</b>. A <b>diode</b> is a one-way valve for electric current. When current flows the right way, a tiny crystal inside gives off light. Wrong way round: nothing flows and nothing lights (and nothing is harmed).</p>
    <ul><li><b>Long leg = anode (+)</b>: current goes in here. <b>Short leg = cathode (−)</b>: current comes out here. The cathode side also has a <b>flat edge</b> on the rim.</li>
     <li>Each colour needs a minimum <b>turn-on voltage</b> (red about 2 V, blue about 3 V). Below that: dark.</li>
     <li>Above it, a <b>tiny</b> rise in voltage makes the current <b>shoot up</b>. That is why an LED must always have a <b>resistor</b> in series (Module 1.2).</li></ul>
    <p>Tap the parts of the LED below, then raise the voltage and watch the current. Try turning the LED around.</p>`, interactive:"partLed"},
   {id:"led", title:"② ③ ④ LED and PWM brightness in code", keys:"led pwm analogwrite fade digitalwrite", html:`
    <h4>Wiring</h4>
    <p>Board pin → resistor → LED long leg (+); LED short leg (−) → GND. The resistor can be on either side of the LED; what matters is that the LED, resistor and pin are in one loop to GND.</p>
    ${wiringBlock("led")}
    <h4>Brightness with PWM</h4>
    <p class="plain"><b>In plain words</b>A pin is either fully on (HIGH) or fully off (LOW). To get a <i>half-bright</i> LED, the pin flicks on and off hundreds of times a second. Your eye cannot follow, so it sees the <b>average</b>. This is <b>PWM</b> (pulse-width modulation). The share of time the pin is ON is the <b>duty cycle</b>: 25 % on looks about 25 % as bright.</p>
    <p>Use <code>analogWrite(pin, 0–255)</code> on the Uno and ESP8266. On the ESP32 core the equivalent is <code>ledcWrite</code> (the sandbox handles the difference for you) (${ct("sfPWM")}). The number 255 means “always on”, 0 means “always off”, 128 is about half.</p>
    ${progBlock("fade")}
    ${anat("Example 8: a brightness that follows a sensor (use case: automatic night light)", [["int light = analogRead(A0);", "Read a light sensor: 0 (dark) up to 1023 (bright) on a 10-bit input."], ["int brightness = map(light, 0, 1023, 255, 0);", "<code>map()</code> converts one range to another. Here it <b>flips</b> the scale: bright room (1023) → LED value 0 (off); dark room (0) → LED value 255 (full)."], ["analogWrite(LED_PIN, brightness);", "Send the result to the LED. Now the LED gets brighter as the room gets darker."]])}
    ${ex("duty cycle by hand", `<p><code>analogWrite(pin, 64)</code> → 64 ÷ 255 = 25 % duty. On a 3.3 V board the <b>average</b> voltage is 0.25 × 3.3 = 0.83 V, even though the pin only ever outputs 0 V or 3.3 V. <code>analogWrite(pin, 191)</code> → 75 %.</p>`)}
    <p><b>Where you would use it:</b> a <i>status light</i> (steady = connected, slow blink = connecting, fast blink = error), a “breathing” light that shows the logger is alive, or a night light that follows the room.</p>
    ${srcs(["sfPWM"])}`, interactive:["pwmViz","sandbox:sb_fade"]},
   {id:"rgbhow", title:"① The RGB LED: how it works inside", keys:"rgb led colour common cathode anode mix", html:`
    <p class="plain"><b>In plain words</b>An RGB LED is <b>three LEDs</b> (red, green, blue) in one plastic dome, sharing one leg. Light mixes in your eye: red + green looks yellow; all three at full looks white. By setting each colour's brightness from 0 to 255, you can make about 16 million colours (256 × 256 × 256).</p>
    <p>It has <b>four legs</b>: one per colour, plus the <b>longest leg, the common leg</b>. On a <b>common-cathode</b> LED the common leg goes to GND (255 = brightest). On a <b>common-anode</b> LED it goes to power and everything works <b>backwards</b> (0 = brightest). Check which one you have: if white is ever dark, you probably have the other type.</p>`, interactive:"partRgb"},
   {id:"rgb", title:"② ③ ④ RGB LED in code", keys:"rgb analogwrite colour function setcolor", html:`
    <h4>Wiring</h4>
    <p>Each colour leg needs <b>its own resistor</b> (they take different voltages), then its own PWM pin. The common leg goes to GND (or to +V for common anode).</p>
    ${wiringBlock("rgb")}
    ${progBlock("rgb")}
    ${anat("Example 9: a traffic light for the room's temperature (use case: data you can see at a glance)", [["void setColor(int r, int g, int b) {", "Our own function: give it three numbers, it sets the colour. We write the three <code>analogWrite</code> calls once instead of everywhere."], ["  analogWrite(RED_PIN, r);", "Red brightness, 0 to 255."], ["  analogWrite(GREEN_PIN, g);", "Green."], ["  analogWrite(BLUE_PIN, b);", "Blue."], ["}", ""], ["", ""], ["if (tempC < 28) {", "Comfortable…"], ["  setColor(0, 255, 0);", "…show green."], ["} else if (tempC < 32) {", "Warm…"], ["  setColor(255, 180, 0);", "…show amber (lots of red, some green)."], ["} else {", "Hot…"], ["  setColor(255, 0, 0);", "…show red."], ["}", ""]])}
    <p><b>Where you would use it:</b> an <b>air-quality or heat light</b> that lets people understand your data without reading numbers. In Unit 4 you will pick the thresholds from real data instead of guessing.</p>`, interactive:"sandbox:sb_rgb"},
   {id:"btnhow", title:"① The pushbutton: how it works inside", keys:"pushbutton button contacts bounce four legs", html:`
    <p class="plain"><b>In plain words</b>A button is a <b>switch that is only closed while you hold it</b>. Inside, a small metal dome presses two sides of a gap together. When pressed, current can pass; released, the gap is open again.</p>
    <p>The common 4-legged tactile button has its legs wired in <b>pairs</b>: legs on the <b>same side</b> are always connected inside. Pressing connects the left pair to the right pair. If you wire two legs from the <i>same</i> side, the button seems to be “always on”; use two legs from <b>opposite sides</b>.</p>
    <p>Metal contacts are not perfectly clean: for a few milliseconds the contacts <b>bounce</b> like a dropped coin, so the pin sees many fast presses. Press the button in the picture a few times and compare with and without debouncing.</p>`, interactive:"partButton"},
   {id:"btn", title:"② ③ ④ Pushbutton in code", keys:"button input_pullup debounce edge toggle", html:`
    <h4>Wiring</h4>
    <p>One leg to the board pin, the opposite leg to GND. No resistor needed: <code>INPUT_PULLUP</code> uses the resistor inside the chip. Unpressed the pin reads <b>HIGH</b>; pressed it reads <b>LOW</b>. (That feels backwards at first: pressed = LOW.)</p>
    ${wiringBlock("button")}
    ${progBlock("button")}
    ${anat("Example 10: press once to toggle the LED (use case: a “mark this moment” button for a data logger)", [["const int BTN_PIN = 2;", "Button pin."], ["const int LED_PIN = 6;", "LED pin."], ["bool ledOn = false;", "Remembers whether the LED is on."], ["bool lastPressed = false;", "Remembers whether the button was pressed on the <b>previous</b> pass. This lets us spot the <b>moment</b> of the press."], ["unsigned long lastChange = 0;", "The time of the last accepted press, for debouncing."], ["", ""], ["void loop() {", ""], ["  bool pressed = (digitalRead(BTN_PIN) == LOW);", "Pressed means LOW (because of the pull-up). Store true/false."], ["  if (pressed && !lastPressed && millis() - lastChange > 30) {", "Act only on the <b>edge</b>: pressed now, NOT pressed last time, and at least 30 ms since the last accepted press (that ignores the bounce)."], ["    ledOn = !ledOn;", "Flip the LED state."], ["    digitalWrite(LED_PIN, ledOn);", "Show it."], ["    lastChange = millis();", "Note the time of this press."], ["  }", ""], ["  lastPressed = pressed;", "Remember this pass's state for the next pass."], ["}", ""]])}
    ${mis(`<p>Toggling the LED every loop while the button is held. React to the <i>edge</i> (the moment it changes), not the level.</p>`)}
    <p><b>Where you would use it:</b> a “start / stop logging” switch, a button that stamps an <i>event</i> into your data (“I opened the window now”), or a counter of visitors.</p>`, interactive:"sandbox:sb_button"},
   {id:"buzzhow", title:"① The piezo buzzer: how it works inside", keys:"buzzer piezo passive active tone frequency", html:`
    <p class="plain"><b>In plain words</b>Sound is air vibrating. A <b>piezo</b> element is a thin ceramic disc that <b>bends a tiny bit when you apply voltage</b>. Flip the voltage on and off 440 times a second and the disc vibrates 440 times a second: your ear hears the note A. The number of vibrations per second is the <b>frequency</b>, measured in hertz (Hz). Higher frequency means a higher pitch.</p>
    <p>There are two kinds. A <b>passive</b> buzzer has only the disc: <b>you</b> choose the pitch with <code>tone(pin, frequency)</code>, so it can play melodies. An <b>active</b> buzzer has a tiny oscillator inside, so it makes one fixed beep whenever it gets power: you can only turn it on and off. If <code>tone()</code> gives you the same pitch every time, you probably have an active buzzer.</p>`, interactive:"partBuzzer"},
   {id:"buzz", title:"② ③ ④ Piezo buzzer in code", keys:"buzzer tone notone melody alarm", html:`
    <h4>Wiring</h4>
    <p>One leg to the board pin, the other to GND. Some buzzers have a <b>+</b> mark. A small resistor (100 to 220 Ω) in series makes it a little quieter.</p>
    ${wiringBlock("buzzer")}
    ${progBlock("buzzer")}
    <table class="t"><tr><th>Note</th><th>C4</th><th>D4</th><th>E4</th><th>F4</th><th>G4</th><th>A4</th><th>B4</th><th>C5</th></tr><tr><td>Hz (about)</td><td>262</td><td>294</td><td>330</td><td>349</td><td>392</td><td>440</td><td>494</td><td>523</td></tr></table>
    ${anat("Example 11: a rising alert beep (use case: “data sent” confirmation)", [["tone(BUZZER_PIN, 523);", "Start playing C5 (523 Hz). The sound continues until we stop it."], ["delay(120);", "Hold the note for 120 ms (the program waits)."], ["tone(BUZZER_PIN, 784);", "Switch to G5 (784 Hz): higher, so it sounds like “going up”."], ["delay(120);", "Hold it."], ["noTone(BUZZER_PIN);", "Stop the sound. Without this the last note would play forever."]])}
    ${safety(`<p>Keep loud buzzers away from ears and use short beeps.</p>`)}
    <p><b>Where you would use it:</b> an <b>alarm</b> when a reading crosses a limit, a short confirmation chirp after data is uploaded, or a two-tone “error” sound you can recognise without looking at a screen.</p>`, interactive:"sandbox:sb_buzzer"},
   {id:"combo", title:"Put the parts together", keys:"combine status light alarm prototype", html:`
    <p>Real prototypes combine inputs and outputs. Here are three small designs you can build from this module. For each one, say which part is the <b>input</b>, which is the <b>output</b>, and what the <b>decision</b> is in between.</p>
    <table class="t"><tr><th>Prototype</th><th>Input</th><th>Decision</th><th>Output</th></tr>
     <tr><td><b>Status light</b></td><td>Wi-Fi connected? (true / false)</td><td>if connected: steady green; else: blinking amber</td><td>RGB LED</td></tr>
     <tr><td><b>Heat alarm</b></td><td>Temperature from a sensor (Unit 2)</td><td>if above the limit: alarm</td><td>Red LED + buzzer</td></tr>
     <tr><td><b>Event marker</b></td><td>Pushbutton</td><td>on a clean press: toggle “event” on/off</td><td>LED shows event is on; the event goes into your data</td></tr></table>
    ${think(`<p>Pick one prototype. Write the decision as one <code>if</code> sentence in plain English first (“if the temperature is above 30, make the LED red and beep twice”). Only then write the code.</p>`)}`}
  ],
  quiz:[
   {q:"What does analogWrite(pin, 128) do on an Uno?", o:["Outputs 128 V","Sets about 50 % duty cycle","Reads an analog pin","Turns the pin off"], a:1, e:"128/255 ≈ 50 % duty.", w:["","","That is analogRead.",""]},
   {q:"Which leg of an LED is the anode (+)?", o:["The short leg","The long leg","The leg next to the flat edge","Either one"], a:1, e:"The long leg is the anode; the short leg and the flat edge mark the cathode.", w:["","","That is the cathode (−).","An LED only works one way round."]},
   {q:"With INPUT_PULLUP, a pressed button reads…", o:["HIGH","LOW","Random","Analog"], a:1, e:"Pressed connects the pin to GND.", w:["","","",""]},
   {q:"Why do we debounce?", o:["Buttons are loud","Contacts bounce and make false presses","To save power","To use less memory"], a:1, e:"Bounce makes one press look like many.", w:["","","",""]},
   {q:"Which plays a higher note?", o:["tone(pin, 262)","tone(pin, 523)","Both the same","Neither"], a:1, e:"Higher frequency is a higher pitch.", w:["","","",""]},
   {q:"You use tone() but the buzzer always makes the same beep. What is the likely reason?", o:["It is an active buzzer","The code has a semicolon missing","The LED is in backwards","The resistor is too big"], a:0, e:"An active buzzer has its own oscillator, so the pitch is fixed.", w:["","That would be a compile error.","Unrelated.","Unrelated."]}
  ],
  rating:["I can blink an LED.","I can dim an LED and mix a colour.","I can read a button without bounce errors.","I can combine button, LED, and buzzer in one sketch."],
  checkpoint:{code:"U1-C5", task:"Pass all four sandbox missions (PWM fade, RGB, button, buzzer). Then change one value of your choice and explain what happened.", met:"All four missions show green checks; your change and result are described.", upload:"Upload screenshots of the four passed missions and your note."},
  refs:["sfPWM","arduinoLang","sfPullup","sfLED"]
 }
]});
