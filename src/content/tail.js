/* ============ COURSE INDEX, GLOSSARY, LAB INDEX ============ */
const MODULES = {}; COURSE.forEach(u => u.modules.forEach(m => { MODULES[m.id] = m; }));
const GLOSSARY = [
 ["ADC (analog-to-digital converter)","The part of a microcontroller that measures a voltage and turns it into a number, for example 0–1023 on a 10-bit ADC."],
 ["Actuator","A device that turns an electrical signal into action: an LED, buzzer, servo, or motor."],
 ["Anomaly","A reading that is far from what is normal for that signal, such as more than 3 standard deviations from the recent mean."],
 ["API key","A secret string a device or app sends to prove it may use a web service. Keep it out of public code and AI chats."],
 ["Apps Script","Google's JavaScript platform for automating Google Workspace and building web apps that run on Google's servers."],
 ["Baud rate","The speed of a serial connection in bits per second, such as 115200. Both ends must use the same value."],
 ["Blynk","An IoT platform with ready-made web and phone dashboards. Devices connect with a template ID, template name, and auth token."],
 ["Breadboard","A reusable board with connected holes for building circuits without soldering."],
 ["Broker (MQTT)","The server that receives published messages and delivers them to subscribers of the topic."],
 ["Calibration","Comparing a sensor with a trusted reference and correcting its readings, for example with two known points."],
 ["Colab (Google Colaboratory)","A free notebook in your browser where you run Python for data analysis."],
 ["Commit","A saved snapshot of your project in Git, with a message that says what changed and why."],
 ["Convenience sample","Data collected because it was easy, not because it was fair. It can be biased."],
 ["Correlation","How closely two variables move together in a straight line, from −1 to 1. It does not show that one causes the other."],
 ["CSV","Comma-separated values: a plain-text table where each line is a row and commas separate the columns."],
 ["Data dictionary","A table that says what each column means, its unit, its source, and its valid range."],
 ["Datasheet","The manufacturer's technical document for a part: its voltages, limits, timing, and how to use it."],
 ["Debounce","Ignoring the rapid on-off flicker of a button's contacts so one press counts once."],
 ["Deployment (Apps Script)","A published version of your script with its own /exec URL. Saving code does not change a deployment; deploy a new version."],
 ["DynamoDB","Amazon's key-value and document database. Items are found by a partition key and ordered by an optional sort key."],
 ["Firebase Realtime Database","Google's cloud database that stores JSON and syncs changes in real time."],
 ["GitHub Pages","A free service that publishes the files in a GitHub repository as a website."],
 ["GND (ground)","The 0 V reference. All parts of a circuit must share ground."],
 ["GPIO","General-purpose input/output pin: can read or write HIGH and LOW."],
 ["H-bridge","A circuit that switches current through a motor in either direction. Motor driver modules contain one."],
 ["HTTP / HTTPS","The protocol of the web. HTTPS is HTTP inside an encrypted TLS connection."],
 ["ID token","A short-lived proof of sign-in that a device sends with each Firebase request."],
 ["IoT (Internet of Things)","Physical things with sensors and/or actuators that exchange data over networks so people or software can use it."],
 ["JSON","JavaScript Object Notation: a text format for structured data, such as {\"temp_c\": 29.4}."],
 ["Lambda (AWS)","A service that runs your function when something happens, without a server you manage."],
 ["Logic level","The voltage a chip uses for HIGH: 3.3 V for the ESP32-S3 and ESP8266, 5 V for the Uno R4 WiFi."],
 ["Median filter","A filter that outputs the middle value of the last few readings; it removes single-sample spikes."],
 ["millis()","An Arduino function that returns milliseconds since the board started; used for non-blocking timers."],
 ["MQ sensor","A heated metal-oxide gas sensor (MQ-2, MQ-135, and others) whose resistance changes with gas. Read it relative to a clean-air baseline."],
 ["MQTT","A lightweight publish/subscribe messaging protocol for devices."],
 ["NaN","\"Not a number\": what a failed sensor read returns. Never send or store it."],
 ["Ohm's law","V = I × R: voltage equals current times resistance."],
 ["Outlier","A value far from the others. The boxplot rule marks values beyond 1.5 × IQR outside the quartiles."],
 ["PIR sensor","A passive infrared sensor that notices a warm body moving across its field of view."],
 ["Pull-up resistor","A resistor that holds a signal line HIGH when nothing is pulling it LOW."],
 ["PWM","Pulse-width modulation: switching a pin on and off quickly to control brightness, speed, or sound."],
 ["Regression","Fitting a line (or curve) through data to describe or predict a relationship."],
 ["Repository","A project folder plus its full history of changes, stored with Git."],
 ["Rotate (a secret)","Create a new key or password and delete the old one, after the old one may have leaked."],
 ["SDG (Sustainable Development Goal)","One of the 17 global goals in the United Nations 2030 Agenda (2015)."],
 ["SDG target","One of the 169 specific outcomes under the goals. A prototype is best linked to a target."],
 ["Sensor","A device that turns a physical quantity (temperature, distance, light) into an electrical signal."],
 ["Serial Monitor","The Arduino IDE window that shows text the board sends with Serial.print."],
 ["Servo","A motor with built-in position feedback; you tell it an angle between 0° and 180°."],
 ["Standard deviation","A measure of how far values typically are from their mean."],
 ["Tidy data","Each variable is a column, each observation is a row, each kind of unit is a table."],
 ["ThingSpeak","MathWorks' IoT service: channels with up to 8 fields, a write key, and automatic charts."],
 ["Topic (MQTT)","The name a message is published to, like sss/team1/telemetry."],
 ["Voltage divider","Two resistors in series that output a fraction of the input voltage: Vout = Vin × R2 / (R1 + R2)."],
 ["z-score","(value − mean) ÷ standard deviation: how many standard deviations a value is from the mean."]
];
/* Lab index: built from the course so it never goes out of date. Each entry: [title, subtitle, link, module id, activity id] */
const LAB_INDEX = (() => {
  const groups = [];
  COURSE.forEach(u => {
    const items = [];
    u.modules.forEach(m => m.sections.forEach(s => [].concat(s.interactive || []).filter(Boolean).forEach(name => {
      if (/^(sandbox|as|web):/.test(name)) name.replace(/^\w+:/, "").split(",").forEach(id => items.push([(typeof SB !== "undefined" && SB[id] ? SB[id].title : (typeof AS !== "undefined" && AS[id] ? AS[id].title : (typeof WEB !== "undefined" && WEB[id] ? WEB[id].title : id))), "Virtual board / sandbox mission", "#/m/" + m.id + "?s=" + s.id, m.id, id]));
      else items.push([s.title, m.title, "#/m/" + m.id + "?s=" + s.id, m.id, name]);
    })));
    if (items.length) groups.push([u.title, items]);
  });
  return groups;
})();
