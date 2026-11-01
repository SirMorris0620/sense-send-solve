/* ============ UNIT 2: SENSORS AND ACTUATORS ============ */
COURSE.push({id:"u2", title:"Unit 2: Sensors and actuators", sub:"DHT, TMP36, light, gas, distance, motion, servo, and motor", blurb:"For every part: what it measures, how it works inside, how to wire it for each board, how to program it, and how to trust (or not trust) its numbers.", modules:[

 {id:"2.1", title:"Temperature and humidity: DHT11, DHT22, TMP36", minutes:150,
  intro:"Temperature is the most common reading in IoT. You will compare three sensors, read each one, handle failed readings, and learn why a sensor's number is never the whole truth.",
  objectives:["Compare DHT11, DHT22, and TMP36 (range, accuracy, speed, cost).","Wire and read a DHT sensor and handle NaN (failed reads).","Convert a TMP36 voltage to °C for each board's ADC.","Explain sampling rate limits (DHT11 ≥ 1 s, DHT22 ≥ 2 s)."],
  sections:[
   {id:"compare", title:"Three sensors compared", keys:"dht11 dht22 tmp36 compare accuracy range", html:`
    <table class="t"><tr><th></th><th>DHT11</th><th>DHT22 (AM2302)</th><th>TMP36</th></tr>
     <tr><td><b>Measures</b></td><td>Temperature + humidity</td><td>Temperature + humidity</td><td>Temperature only</td></tr>
     <tr><td><b>Temperature range</b></td><td>0–50 °C, ±2 °C</td><td>−40–80 °C, ±0.5 °C</td><td>−40–125 °C, ±2 °C typical</td></tr>
     <tr><td><b>Humidity</b></td><td>20–80 %, ±5 %</td><td>0–100 %, ±2–5 %</td><td>—</td></tr>
     <tr><td><b>Output</b></td><td>Digital (one wire)</td><td>Digital (one wire)</td><td>Analog voltage (10 mV per °C, 0.5 V at 0 °C)</td></tr>
     <tr><td><b>Fastest reading</b></td><td>about every 1 s</td><td>about every 2 s</td><td>Any time (you decide)</td></tr></table>
    <p>The figures come from the manufacturers' data sheets (${ct("tmp36")}; ${ct("dhtlib")}); check your own part's data sheet because clones differ.</p>
    ${tip("Which one?", `<p>Use the <b>DHT22</b> when you need humidity or better accuracy, the <b>DHT11</b> for a cheap classroom demo, and the <b>TMP36</b> when you want a fast temperature-only reading or want to learn analog sensing.</p>`)}
    ${srcs(["tmp36","dhtlib"])}`, interactive:"dhtInside"},
   {id:"dht", title:"Reading a DHT sensor", keys:"dht library nan read", html:`
    <p>A DHT sensor talks on one wire with a timed pattern of pulses (${ct("dhtlib")}). The library does the timing; you call <code>readTemperature()</code> and <code>readHumidity()</code>. If the wire is loose or you ask too soon, the result is <b>NaN</b>: always test <code>isnan()</code> before you use or send a number.</p>
    ${libBox("DHT sensor library", "Adafruit", "Also install the Adafruit Unified Sensor library if asked.")}
    ${wiringBlock("dht")}
    ${progBlock("dht")}
    ${troubleshoot([["Always NaN","Wrong pin, missing pull-up, or too-fast reads","Check the data pin; add a 10 kΩ pull-up on bare sensors; wait ≥ 2 s between reads"],["Humidity stuck at 0 or 99","Wrong sensor type in code","Use DHT11 or DHT22 to match your part"],["Reads are 5 °C too warm","Sensor next to the board's heat","Move it away on a short cable"]])}`, interactive:["dhtProtocol","sandbox:sb_dht"]},
   {id:"tmp36", title:"TMP36: analog temperature", keys:"tmp36 analog adc volts celsius", html:`
    <p>The TMP36 outputs a voltage: <b>V = 0.5 + 0.01 × T(°C)</b>. So <b>T = (V − 0.5) × 100</b>. The ADC gives a number; convert it to volts with the board's reference: <b>V = reading × Vref ÷ ADC max</b> (5 V and 1023 on the Uno R4 in 10-bit mode; 3.3 V and 4095 on ESP32-S3; 3.3 V and 1023 on a NodeMCU ESP8266 whose divider scales the 0–1 V pin).</p>
    ${wiringBlock("tmp36")}
    ${progBlock("tmp36")}
    ${mis(`<p>Using the wrong reference voltage. The same ADC number means 1.65 V on a 3.3 V board and 2.5 V on a 5 V board.</p>`)}
    ${noKit}`, interactive:["tmp36Lab","sandbox:sb_tmp36"]}
  ],
  quiz:[
   {q:"Which sensor measures humidity?", o:["TMP36","DHT22 and DHT11","LDR","HC-SR04"], a:1, e:"The DHT family has a humidity element; the TMP36 is temperature only.", w:["Temperature only.","","Light only.","Distance only."]},
   {q:"What does a NaN from a DHT sensor tell you?", o:["It is 0 °C","The read failed and the value must not be used","The sensor is very accurate","The board is too hot"], a:1, e:"NaN means 'not a number': discard that sample.", w:["Zero is a valid number.","","Opposite.","Unrelated."]},
   {q:"A TMP36 outputs 0.75 V. What is the temperature?", o:["0.75 °C","25 °C","75 °C","250 °C"], a:1, e:"(0.75 − 0.5) × 100 = 25 °C.", w:["Forgot the formula.","","Forgot the 0.5 V offset.","Off by ten."]},
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
    <p>An LDR's resistance falls as light increases. Alone it cannot give a voltage, so put it in a <b>voltage divider</b> with a fixed resistor (often 10 kΩ). The analog pin sees a voltage that rises (or falls, depending on which side the LDR is on) with light. Use <code>map()</code> or your own formula to turn the reading into a percentage, and use a calibration of "darkest" and "brightest" for your room.</p>
    ${wiringBlock("ldr")}
    ${progBlock("ldr")}`, interactive:["ldrViz","sandbox:sb_ldr"]},
   {id:"mq", title:"MQ gas sensors", keys:"mq2 mq135 mq3 mq4 mq7 mq9 gas heater baseline warm-up", html:`
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
    ${wiringBlock("mq")}
    ${progBlock("mq")}
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
    <p>The HC-SR04 sends a burst of 40 kHz sound when you pulse TRIG for 10 µs, then raises ECHO for as long as the sound takes to return. Distance in cm = <b>echo time (µs) × 0.0343 ÷ 2</b> (${ct("hcsr04")}). Readings of 0 or very large numbers mean no echo: reject them.</p>
    ${safety(`<p>ECHO outputs 5 V. On a 3.3 V board use a divider (1 kΩ + 2 kΩ) on ECHO. On the Uno R4 WiFi no divider is needed.</p>`)}
    ${wiringBlock("hcsr04")}
    ${progBlock("sonar")}`, interactive:["sonarViz","sandbox:sb_sonar"]},
   {id:"pir", title:"PIR motion sensor", keys:"pir motion infrared hold time warm-up hc-sr501", html:`
    <p>A PIR (passive infrared) sensor has two infrared-sensitive halves. A warm body crossing from one half to the other creates a difference that the sensor reports as HIGH. Two things surprise beginners (${ct("pirsheet")}):</p>
    <ul><li><b>Warm-up</b>: for the first 30–60 s the output flickers. Ignore it.</li>
     <li><b>Hold time</b>: after motion stops, the output stays HIGH for a few seconds (adjustable on the module). Your code should use its own timer to decide when the room is "empty".</li></ul>
    ${wiringBlock("pir")}
    ${progBlock("pir")}
    ${srcs(["pirsheet"])}`, interactive:["pirViz","sandbox:sb_pir"]}
  ],
  quiz:[
   {q:"The echo takes 1166 µs. Distance (cm)?", o:["About 10 cm","About 20 cm","About 40 cm","About 80 cm"], a:1, e:"1166 × 0.0343 ÷ 2 ≈ 20 cm.", w:["Too small.","","Forgot the ÷ 2? That would give 40.",""]},
   {q:"Why divide by 2?", o:["Sound is slow","The sound travels to the object and back","The sensor has two eyes","To get inches"], a:1, e:"The echo time covers the trip there and back.", w:["","","",""]},
   {q:"The PIR output flickers right after power-on. What do you do?", o:["Replace it","Wait for the warm-up period","Raise the baud rate","Add a resistor"], a:1, e:"PIR sensors need 30–60 s to settle.", w:["","","",""]},
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
    <p>A hobby servo has a motor, gears, and a position sensor. You send a pulse every 20 ms; a pulse of about 1 ms means 0°, 1.5 ms means 90°, 2 ms means 180°. The Servo library does this: <code>servo.attach(pin)</code> then <code>servo.write(angle)</code> (${ct("servolib")}).</p>
    <ul><li>Power the servo from <b>5 V</b> (not a data pin). A small SG90 can pull 500 mA when it stalls.</li>
     <li>Share GND between the servo supply and the board.</li>
     <li>Forgetting <code>attach()</code> is the most common bug: nothing moves.</li></ul>
    ${wiringBlock("servo")}
    ${progBlock("servo")}
    ${srcs(["servolib"])}`, interactive:["servoViz","sandbox:sb_servo"]},
   {id:"motor", title:"DC motor with a driver", keys:"dc motor h-bridge l298n l9110 driver pwm direction flyback", html:`
    <p>A small DC motor can draw 100–500 mA, far more than a pin's 20–40 mA. A <b>driver</b> (an H-bridge such as an L298N or L9110S module) switches the motor current for you. Two direction pins choose forward or reverse and a PWM <b>enable</b> pin sets the speed.</p>
    <table class="t"><tr><th>IN1</th><th>IN2</th><th>Motor</th></tr><tr><td>HIGH</td><td>LOW</td><td>Forward</td></tr><tr><td>LOW</td><td>HIGH</td><td>Reverse</td></tr><tr><td>LOW</td><td>LOW</td><td>Stopped (coast)</td></tr></table>
    ${safety(`<p>Motors create voltage spikes when switched off. Use a driver module (it has protection diodes) and never connect a motor directly to a board pin.</p>`)}
    ${wiringBlock("motor")}
    ${progBlock("motor")}`, interactive:["hbridgeViz","sandbox:sb_motor"]},
   {id:"power", title:"Power budget", keys:"power budget current usb mA", html:`
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
