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
    <p>An LED drops a fixed voltage (about 2.0 V for red, 3.1 V for blue) and has almost no resistance, so without a resistor the current is far too high. Use <b>R = (Vsupply − Vled) ÷ I</b> with I about 10 mA, then choose the next standard value up (${ct("sfLED")}).</p>
    ${ex("red LED on a 3.3 V ESP pin", `<p>R = (3.3 − 2.0) ÷ 0.010 = 130 Ω → use 150 or 220 Ω. On the 5 V Uno: (5 − 2) ÷ 0.010 = 300 Ω → use 330 Ω.</p>`)}
    ${srcs(["sfLED"])}`, interactive:"ledCalc"},
   {id:"div", title:"Voltage dividers and logic levels", keys:"voltage divider 5v 3.3v level", html:`
    <p>Two resistors in series scale a voltage: <b>Vout = Vin × R2 ÷ (R1 + R2)</b>. Use a divider when a 5 V sensor output (for example the HC-SR04's ECHO pin) must reach a 3.3 V board (${ct("sfDivider")}). A 1 kΩ + 2 kΩ pair turns 5 V into 3.33 V.</p>
    <p>A <b>floating</b> input (connected to nothing) reads random noise. A <b>pull-up resistor</b> holds it HIGH until a button pulls it LOW; Arduino has one built in: <code>pinMode(pin, INPUT_PULLUP)</code> (${ct("sfPullup")}).</p>
    ${mis(`<p>Powering a 3.3 V board's input from a 5 V sensor output without a divider or level shifter.</p>`)}
    ${srcs(["sfDivider","sfPullup"])}`, interactive:["dividerLab","pullupViz","logicLevel"]}
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
   {id:"bb", title:"How a breadboard is connected", keys:"breadboard rails strips", html:`
    <p>Each row of five holes is joined by a metal strip under the plastic. The long <b>rails</b> at the edges run the full length for power (red, +) and ground (blue, −). The centre gap separates the two halves so a chip can straddle it (${ct("sfBB")}).</p>
    <ul><li>Components in the <b>same row</b> are connected; across the centre gap they are not.</li>
     <li>Some long boards split the rails in the middle: bridge the break with a jumper.</li>
     <li>Always connect board <b>GND</b> to the GND rail first.</li></ul>
    ${srcs(["sfBB"])}`, interactive:"bbExplore"},
   {id:"habits", title:"Good wiring habits", keys:"wiring colour habits safe power", html:`
    <ul><li><b>Colour code:</b> red = power, black or blue = ground, other colours for signals.</li>
     <li><b>Short, flat wires</b> are easier to check than long loops.</li>
     <li><b>Power off</b> while you change the wiring.</li>
     <li><b>Draw first:</b> list each connection as <i>from → to</i> in a wiring table before you build.</li></ul>
    ${safety(`<p>Never connect a motor directly to a board pin. A motor needs a driver (Module 2.4) and its own supply or the board's 5 V pin, not a GPIO.</p>`)}`, interactive:"bbBuild"},
   {id:"faults", title:"Find the fault", keys:"debug fault checklist wiring audit", html:`
    <p>Most "broken code" is a wiring fault. Work through this list: power, ground, pin number in the code, resistor in the right place, LED the right way round (long leg = +), and nothing plugged into the wrong row.</p>`, interactive:["faultFinder","wiringAudit"]}
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

 {id:"1.4", title:"Programming for Arduino", minutes:150,
  intro:"Programs are instructions that run one line at a time. This module teaches the handful of ideas you need for every later lab: variables, functions, loops, decisions, and timing without freezing the board.",
  objectives:["Declare variables of the right type.","Write if/else decisions and for/while loops.","Write and call a function.","Use millis() so two things can happen at once.","Read a compile error and fix it."],
  sections:[
   {id:"basics", title:"Variables, types, and operators", keys:"variable int float bool string", html:`
    <p>A <b>variable</b> is a named box. Pick its type: <code>int</code> (whole numbers), <code>float</code> (decimals), <code>bool</code> (true/false), <code>String</code> (text). Use <code>const</code> for values that never change, such as a pin number. ${ct("arduinoLang")} lists every type and operator.</p>
    ${code("cpp", `const int LED_PIN = 2;     // a pin never changes
int count = 0;
float tempC = 24.5;
bool alarm = false;`, "Declaring variables")}
    ${mis(`<p>Dividing two integers: <code>7 / 2</code> is <b>3</b>, not 3.5. Use <code>7 / 2.0</code>.</p>`)}
    ${srcs(["arduinoLang"])}`, interactive:["varBoxes","typeSort"]},
   {id:"flow", title:"Decisions and loops", keys:"if else for while loop", html:`
    <p><code>if (condition) { … } else { … }</code> chooses; <code>for (int i = 0; i &lt; 5; i++) { … }</code> repeats a known number of times; <code>while</code> repeats until a condition changes. Every <code>loop()</code> run is one pass of your program.</p>
    ${code("cpp", `for (int i = 0; i < 3; i++) {
  digitalWrite(LED_PIN, HIGH); delay(150);
  digitalWrite(LED_PIN, LOW);  delay(150);
}`, "Three quick blinks")}`, interactive:["loopViz","codeTracer"]},
   {id:"func", title:"Functions", keys:"function return parameter", html:`
    <p>A <b>function</b> packages steps under a name. Parameters go in, a value can come out. Small functions make code readable and let you test one idea at a time.</p>
    ${code("cpp", `float toFahrenheit(float c) {
  return c * 9.0 / 5.0 + 32.0;
}`, "A function with a return value")}`, interactive:"funcLab"},
   {id:"time", title:"Timing with millis()", keys:"millis delay non-blocking", html:`
    <p><code>delay()</code> stops everything. <code>millis()</code> returns milliseconds since start, so you can ask "has 300 ms passed?" and keep the rest of the program running. Remember the last time you acted; act when the difference is large enough.</p>
    ${progBlock("timer")}
    ${noKit}`, interactive:["delayRace","sandbox:sb_pattern,sb_timer"]}
  ],
  quiz:[
   {q:"What is 7 / 2 when both are int?", o:["3.5","3","4","2"], a:1, e:"Integer division drops the remainder.", w:["Needs a float.","","",""]},
   {q:"Why prefer millis() to delay() in a project with a button and a blinking LED?", o:["It is shorter","delay() freezes everything else","millis() is more accurate","delay() is not allowed"], a:1, e:"delay() blocks, so a button press during the delay is missed.", w:["","","Not the main reason.","It is allowed but blocking."]},
   {q:"Which loop is best when you know the count?", o:["for","while(true)","if","switch"], a:0, e:"A for loop counts.", w:["","Never ends.","Not a loop.","Not a loop."]},
   {q:"A compile error says 'was not declared in this scope'. What does it mean?", o:["The board is broken","You used a name before declaring it, or mistyped it","The cable is loose","The library is too new"], a:1, e:"The compiler does not know that name.", w:["","","",""]}
  ],
  rating:["Code still looks like a foreign language.","I can read simple code.","I can write loops, functions, and use millis().","I can fix a classmate's compile error."],
  checkpoint:{code:"U1-C4", task:"Finish the two sandbox missions (pattern and two rhythms) and explain in two sentences why the second one cannot use delay().", met:"Both missions pass and the explanation names blocking.", upload:"Upload a screenshot of both passed missions and your two sentences."},
  refs:["arduinoLang","arduinoDocs"]
 },

 {id:"1.5", title:"LEDs, RGB LED, pushbutton, and buzzer", minutes:150,
  intro:"Your first actuators and the simplest input. You will control brightness with PWM, mix colours, read a button without bounce errors, and play notes: a complete mini-prototype.",
  objectives:["Blink and dim an LED (digitalWrite, analogWrite).","Mix colours with an RGB LED.","Read a pushbutton with INPUT_PULLUP and debounce it.","Play notes with a piezo buzzer using tone()."],
  sections:[
   {id:"led", title:"LED and PWM brightness", keys:"led pwm analogwrite fade", html:`
    <p>A pin is either HIGH or LOW. To dim an LED, switch it on and off thousands of times a second (PWM): a 25 % duty cycle looks about 25 % as bright. Use <code>analogWrite(pin, 0–255)</code> on the Uno and ESP8266, and <code>ledcWrite</code> on the ESP32 core (the sandbox handles the difference for you) (${ct("sfPWM")}).</p>
    ${wiringBlock("led")}
    ${progBlock("fade")}
    ${srcs(["sfPWM"])}`, interactive:"sandbox:sb_fade"},
   {id:"rgb", title:"The RGB LED", keys:"rgb led colour common cathode", html:`
    <p>An RGB LED holds red, green, and blue LEDs in one package. Three PWM values (0–255) mix any colour: (255,0,0) red, (255,255,0) yellow, (255,255,255) white. Each colour needs its own resistor. A <b>common-cathode</b> LED shares GND; a common-anode one shares +V and works backwards (255 = off).</p>
    ${wiringBlock("rgb")}
    ${progBlock("rgb")}`, interactive:"sandbox:sb_rgb"},
   {id:"btn", title:"Pushbutton and debounce", keys:"button input_pullup debounce", html:`
    <p>With <code>INPUT_PULLUP</code> an unpressed button reads HIGH and a pressed one reads LOW. Metal contacts <b>bounce</b>: one press can read as many presses within a few milliseconds. Act on the HIGH→LOW <i>change</i> and ignore the pin for about 30 ms.</p>
    ${wiringBlock("button")}
    ${progBlock("button")}
    ${mis(`<p>Toggling the LED every loop while the button is held. React to the <i>edge</i> (the moment it changes), not the level.</p>`)}`, interactive:"sandbox:sb_button"},
   {id:"buzz", title:"Piezo buzzer", keys:"buzzer tone piezo frequency", html:`
    <p>A passive piezo buzzer makes the pitch you ask for: <code>tone(pin, 440)</code> plays A4 (440 Hz); <code>noTone(pin)</code> stops. Higher frequency = higher pitch. An <i>active</i> buzzer has its own oscillator and only beeps; check which you have.</p>
    ${wiringBlock("buzzer")}
    ${progBlock("buzzer")}
    ${safety(`<p>Keep loud buzzers away from ears and use short beeps.</p>`)}`, interactive:"sandbox:sb_buzzer"}
  ],
  quiz:[
   {q:"What does analogWrite(pin, 128) do on an Uno?", o:["Outputs 128 V","Sets about 50 % duty cycle","Reads an analog pin","Turns the pin off"], a:1, e:"128/255 ≈ 50 % duty.", w:["","","That is analogRead.",""]},
   {q:"With INPUT_PULLUP, a pressed button reads…", o:["HIGH","LOW","Random","Analog"], a:1, e:"Pressed connects the pin to GND.", w:["","","",""]},
   {q:"Why do we debounce?", o:["Buttons are loud","Contacts bounce and make false presses","To save power","To use less memory"], a:1, e:"Bounce makes one press look like many.", w:["","","",""]},
   {q:"Which plays a higher note?", o:["tone(pin, 262)","tone(pin, 523)","Both the same","Neither"], a:1, e:"Higher frequency is a higher pitch.", w:["","","",""]}
  ],
  rating:["I can blink an LED.","I can dim an LED and mix a colour.","I can read a button without bounce errors.","I can combine button, LED, and buzzer in one sketch."],
  checkpoint:{code:"U1-C5", task:"Pass all four sandbox missions (PWM fade, RGB, button, buzzer). Then change one value of your choice and explain what happened.", met:"All four missions show green checks; your change and result are described.", upload:"Upload screenshots of the four passed missions and your note."},
  refs:["sfPWM","arduinoLang","sfPullup","sfLED"]
 }
]});
