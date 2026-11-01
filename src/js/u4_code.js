/* ============ UNIT 4: PROJECT CODE (Code.gs, Index.html) AND THE FIRMWARE GENERATOR ============ */
const PROJECT_GS = [
 ["/**", ""],
 [" * Sense, Send, Solve: IoT logger + web dashboard (Code.gs)", ""],
 [" * Bound to a Google Sheet. Devices send readings with GET requests; people open the same URL to see the dashboard.", ""],
 [" */", ""],
 ["const API_KEY = 'change-this-to-a-long-random-key';   // the same value goes in every board's sketch", "Change this! Use a long random key, e.g. 20+ letters and numbers. Anyone who knows it can write to your Sheet."],
 ["const SHEET_NAME = 'Readings';", "The tab that stores every reading."],
 ["const ALLOWED = ['temp_c', 'hum_pct', 'light_pct', 'distance_cm', 'gas_raw', 'gas_ratio', 'pir'];", "Only these parameter names are stored. Anything else in the URL is ignored. This is input validation (Module 3.3)."],
 ["", ""],
 ["function doGet(e) {", "Runs for every GET request to your /exec URL."],
 ["  const p = e.parameter || {};", "The query string as name → value pairs (all values are text)."],
 ["  if (p.key === undefined && p.device_id === undefined) {", "No key and no device_id: a PERSON opened the link, so serve the dashboard page."],
 ["    return HtmlService.createTemplateFromFile('Index').evaluate()", "Builds the page from the Index.html file in this project."],
 ["      .setTitle('IoT Dashboard')", ""],
 ["      .addMetaTag('viewport', 'width=device-width, initial-scale=1');", "Makes the page fit phones and iPads."],
 ["  }", ""],
 ["  if (p.key !== API_KEY) return text_('ERR:key');", "A device must know the key. Reject everything else before touching the Sheet."],
 ["  if (!/^[A-Za-z0-9_-]{1,40}$/.test(p.device_id || '')) return text_('ERR:device_id');", "Only letters, numbers, _ and -, up to 40 characters. Keeps IDs tidy and safe."],
 ["  const now = new Date();", "The server's clock timestamps the reading (boards usually have no reliable clock)."],
 ["  const rows = [];", ""],
 ["  for (const name in p) {", "Look at every parameter that arrived…"],
 ["    const k = name.toLowerCase();", ""],
 ["    if (ALLOWED.indexOf(k) === -1) continue;", "…skip the ones not on the allowed list (including key and device_id)."],
 ["    const v = p[name];", ""],
 ["    if (v === '' || isNaN(Number(v))) return text_('ERR:bad_value:' + name);", "Reject “nan”, empty values, or text: bad data never enters the database."],
 ["    rows.push([now, p.device_id, k, Number(v)]);", "Store numbers as numbers, so charts and QUERY work."],
 ["  }", ""],
 ["  if (rows.length === 0) return text_('ERR:no_readings');", ""],
 ["  const lock = LockService.getScriptLock();", "One writer at a time: two boards sending at the same moment cannot overwrite each other."],
 ["  lock.waitLock(10000);", "Wait up to 10 s for the lock."],
 ["  try {", ""],
 ["    const sh = sheet_();", ""],
 ["    sh.getRange(sh.getLastRow() + 1, 1, rows.length, 4).setValues(rows);", "Write all rows in ONE call: much faster than appendRow in a loop."],
 ["  } finally {", ""],
 ["    lock.releaseLock();", "Always release, even if writing failed."],
 ["  }", ""],
 ["  return text_('OK:' + rows.length);", "Tell the device how many readings were stored."],
 ["}", ""],
 ["", ""],
 ["/** Called by the dashboard with google.script.run. Returns the newest n readings, oldest first. */", ""],
 ["function getLatest(n) {", "Server-side function: the browser can call it, but cannot see this code or the API key."],
 ["  n = Math.min(Math.max(Number(n) || 50, 1), 500);", "Limit n to 1–500 so nobody can ask for the whole database."],
 ["  const sh = sheet_();", ""],
 ["  const last = sh.getLastRow();", ""],
 ["  if (last < 2) return [];", "Only the header row: no data yet."],
 ["  const count = Math.min(n, last - 1);", ""],
 ["  return sh.getRange(last - count + 1, 1, count, 4).getValues().map(r => ({", "Read the last rows in one call, then turn each row into an object."],
 ["    timestamp: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),", "google.script.run cannot send Date objects to the browser, so convert dates to text."],
 ["    device_id: String(r[1]), sensor: String(r[2]), value: r[3]", ""],
 ["  }));", ""],
 ["}", ""],
 ["", ""],
 ["function sheet_() {", "Finds the Readings tab, or creates it with a header row the first time."],
 ["  const ss = SpreadsheetApp.getActiveSpreadsheet();", ""],
 ["  let sh = ss.getSheetByName(SHEET_NAME);", ""],
 ["  if (!sh) {", ""],
 ["    sh = ss.insertSheet(SHEET_NAME);", ""],
 ["    sh.appendRow(['timestamp', 'device_id', 'sensor', 'value']);", ""],
 ["    sh.setFrozenRows(1);", ""],
 ["  }", ""],
 ["  return sh;", ""],
 ["}", ""],
 ["", ""],
 ["function text_(s) {", "A small helper so every reply is plain text."],
 ["  return ContentService.createTextOutput(s);", ""],
 ["}", ""],
 ["", ""],
 ["/** Run this once from the editor (select testLogger, click Run) to test without a board. */", ""],
 ["function testLogger() {", "Simulates a board's request. Check the Execution log and your Sheet."],
 ["  const reply = doGet({parameter: {key: API_KEY, device_id: 'test-editor', temp_c: '25.0', hum_pct: '60'}});", ""],
 ["  console.log(reply.getContent());   // expect OK:2", ""],
 ["}", ""]
];
const PROJECT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<base target="_top">
<meta charset="utf-8">
<style>
  :root { --ink:#13241F; --muted:#53665D; --bg:#F5F7F4; --card:#FFFFFF; --line:#D3DDD7; --ok:#1F8A70; --warn:#B45309; --bad:#B91C1C; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: var(--bg); color: var(--ink); }
  header { padding: 14px 16px; background: #17483B; color: #fff; }
  header h1 { margin: 0; font-size: 1.3rem; }
  header p { margin: 4px 0 0; font-size: .9rem; opacity: .85; }
  main { padding: 16px; max-width: 1100px; margin: 0 auto; }
  .controls { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
  select { font: inherit; padding: 6px 8px; border-radius: 8px; border: 1px solid var(--line); }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 12px; }
  .card .name { font-size: .85rem; color: var(--muted); }
  .card .val { font-size: 1.7rem; font-weight: 700; }
  .card .status { font-size: .85rem; font-weight: 700; }
  .card.ok .status { color: var(--ok); } .card.warn .status { color: var(--warn); } .card.bad { border: 3px solid var(--bad); } .card.bad .status { color: var(--bad); }
  .panel { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 12px; margin-top: 12px; }
  .stale { background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 10px; padding: 8px 12px; margin-bottom: 12px; }
  table { border-collapse: collapse; width: 100%; font-size: .9rem; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--line); }
</style>
</head>
<body>
<header><h1 id="title">IoT Dashboard</h1><p id="updated" aria-live="polite">Loading…</p></header>
<main>
  <div id="stale" class="stale" hidden></div>
  <div class="controls"><label for="device">Device</label> <select id="device"></select></div>
  <section class="cards" id="cards" aria-label="Latest readings"></section>
  <section class="panel" id="chartPanel"><div class="controls"><label for="sensor">Chart</label> <select id="sensor"></select></div><div style="position:relative;height:260px"><canvas id="chart" role="img" aria-label="Line chart of the selected sensor"></canvas></div></section>
</main>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js"><\/script>
<script>
const REFRESH_MS = 30000;                 // ask the server for new data every 30 s
const STALE_MIN = 5;                      // warn if the newest reading is older than this
const SENSORS = {                         // label, unit, warning level, danger level, decimal places (default 1)
  temp_c:      {label: 'Temperature', unit: '°C', warn: 31, bad: 33},
  hum_pct:     {label: 'Humidity', unit: '%', warn: 75, bad: 85},
  light_pct:   {label: 'Light', unit: '%'},
  distance_cm: {label: 'Distance', unit: 'cm'},
  gas_ratio:   {label: 'Air quality (gas ratio)', unit: '× baseline', warn: 1.3, bad: 1.5, digits: 2},
  pir:         {label: 'Motion events', unit: '', digits: 0}
};
let rows = [], chart = null;

function refresh() {
  google.script.run.withSuccessHandler(show).withFailureHandler(err => {
    document.getElementById('updated').textContent = 'Could not load data: ' + err.message;
  }).getLatest(300);
}
function show(data) {
  rows = data || [];
  const devices = [...new Set(rows.map(r => r.device_id))];
  const sel = document.getElementById('device'), keep = sel.value;
  sel.innerHTML = '';
  devices.forEach(d => { const o = document.createElement('option'); o.value = d; o.textContent = d; sel.appendChild(o); });
  if (devices.includes(keep)) sel.value = keep;
  draw();
}
function draw() {
  const dev = document.getElementById('device').value;
  const mine = rows.filter(r => r.device_id === dev);
  const latest = {};
  mine.forEach(r => latest[r.sensor] = r);          // rows are oldest first, so the newest wins
  // cards
  const cards = document.getElementById('cards');
  cards.innerHTML = '';
  Object.keys(latest).filter(s => SENSORS[s]).forEach(s => {
    const info = SENSORS[s], v = Number(latest[s].value);
    let level = 'ok', word = 'Normal';
    if (info.bad !== undefined && v >= info.bad) { level = 'bad'; word = 'Too high'; }
    else if (info.warn !== undefined && v >= info.warn) { level = 'warn'; word = 'High'; }
    const card = document.createElement('div');
    card.className = 'card ' + (info.warn !== undefined ? level : '');
    card.innerHTML = '<div class="name"></div><div class="val"></div><div class="status"></div>';
    card.querySelector('.name').textContent = info.label;
    card.querySelector('.val').textContent = v.toFixed(info.digits !== undefined ? info.digits : 1) + ' ' + info.unit;
    card.querySelector('.status').textContent = info.warn !== undefined ? word : '';
    cards.appendChild(card);
  });
  // freshness
  const newest = mine.length ? new Date(mine[mine.length - 1].timestamp) : null;
  document.getElementById('updated').textContent = newest ? 'Newest reading: ' + newest.toLocaleString() + ' • page refreshed ' + new Date().toLocaleTimeString() : 'No readings yet for this device.';
  const ageMin = newest ? (Date.now() - newest) / 60000 : 0, st = document.getElementById('stale');
  st.hidden = !(newest && ageMin > STALE_MIN);
  st.textContent = 'No new data for ' + Math.round(ageMin) + ' minutes: check that the device is powered and online.';
  // chart
  const numeric = Object.keys(latest).filter(s => SENSORS[s]);
  const ss = document.getElementById('sensor'), keepS = ss.value;
  ss.innerHTML = '';
  numeric.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = SENSORS[s].label; ss.appendChild(o); });
  if (numeric.includes(keepS)) ss.value = keepS;
  document.getElementById('chartPanel').hidden = numeric.length === 0;
  const series = mine.filter(r => r.sensor === ss.value);
  const labels = series.map(r => new Date(r.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}));
  const values = series.map(r => Number(r.value));
  if (window.Chart && numeric.length) {
    if (!chart) {
      chart = new Chart(document.getElementById('chart'), {type: 'line', data: {labels, datasets: [{label: '', data: values, tension: 0.3, borderColor: '#1F8A70', pointRadius: 0}]},
        options: {animation: false, maintainAspectRatio: false, plugins: {legend: {display: false}}, scales: {y: {title: {display: true, text: ''}}}}});
    }
    chart.data.labels = labels; chart.data.datasets[0].data = values;
    chart.options.scales.y.title.text = ss.value && SENSORS[ss.value] ? SENSORS[ss.value].label + ' (' + SENSORS[ss.value].unit + ')' : '';
    chart.update();
  }
}
document.getElementById('device').onchange = draw;
document.getElementById('sensor').onchange = draw;
refresh();
setInterval(refresh, REFRESH_MS);
<\/script>
</body>
</html>
`;
/* ---- firmware generator ---- */
const GEN_PERIODIC = ["dht","tmp36","hcsr04","ldr","mq","pir"];
function genConflicts(board, sensors){ const used = {}, out = [];
  sensors.forEach(s => PIN_PLAN[s][board].uses.forEach(u => { const k = u.replace(/ .*/, ""); if (used[k] && !(PIN_PLAN[s][board].i2c && PIN_PLAN[used[k]][board].i2c)) out.push(`${SENSOR_INFO[s].short} and ${SENSOR_INFO[used[k]].short} both need ${k}`); else used[k] = s; }));
  if (board === "esp8266" && sensors.includes("ldr") && sensors.includes("mq")) out.push("LDR and MQ sensor both need A0 (the ESP8266 has only one analog input)");
  return [...new Set(out)]; }
function genFirmware(o){
  const b = o.board, S = new Set(o.sensors), L = [], add = (c, n) => L.push([c, n || ""]), blank = () => add("");
  const P = k => pinK(b, k), sendS = Math.max(10, +o.seconds || 30);
  add(`// ${o.name || "IoT logger"}: generated for ${BOARDS[b].name}`, "Generated by the course's firmware generator. Read every line before uploading: you are responsible for this code.");
  add(`// Sensors: ${[...S].map(s => SENSOR_INFO[s].short).join(", ") || "none"}. Sends every ${sendS} s.`);
  add(b === "s3" ? "#include <WiFi.h>" : b === "esp8266" ? "#include <ESP8266WiFi.h>" : "#include <WiFiS3.h>", "Wi-Fi library for your board.");
  if (b === "s3") { add("#include <WiFiClientSecure.h>"); add("#include <HTTPClient.h>"); }
  if (b === "esp8266") { add("#include <WiFiClientSecure.h>"); add("#include <ESP8266HTTPClient.h>"); }
  if (S.has("dht")) add("#include <DHT.h>", "Adafruit DHT sensor library.");
  blank(); add("// ---------- EDIT THESE ----------", "The only lines you normally need to change.");
  add(`const char* WIFI_SSID = "${o.ssid || "YOUR_WIFI_NAME"}";`, "Your 2.4 GHz network name.");
  add(`const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";`, "Typed by you, never shared.");
  add(`const String SCRIPT_URL = "${o.url || "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"}";`, "Your web app's /exec URL (Module 4.2).");
  add(`const String API_KEY = "YOUR_API_KEY";`, "Must match API_KEY in Code.gs exactly.");
  add(`const String DEVICE_ID = "${(o.device || ("team1-" + ({s3:"esp32s3", esp8266:"esp8266", uno:"unor4"})[b])).replace(/[^A-Za-z0-9_-]/g, "")}";`, "Letters, numbers, - and _ only.");
  add(`const unsigned long SEND_EVERY_MS = ${sendS * 1000};`, `Send every ${sendS} s. Apps Script quotas are daily: do not go below 10 s.`);
  add("// --------------------------------"); blank();
  if (S.has("dht")) { add(`DHT dht(${P("DHT_PIN")}, DHT22);`, "Change DHT22 to DHT11 for the blue sensor."); }
  if (S.has("hcsr04")) { add(`const int TRIG_PIN = ${P("TRIG_PIN")};`); add(`const int ECHO_PIN = ${P("ECHO_PIN")};`); }
  if (S.has("ldr")) { add(`const int LDR_PIN = ${P("LDR_PIN")};`); add(`int rawDark = ${b === "s3" ? 100 : 25};`, "CALIBRATE with P5 first: your covered reading."); add(`int rawBright = ${b === "s3" ? 3900 : 980};`, "CALIBRATE: your flashlight reading."); }
  if (S.has("tmp36")) { add(`const int TMP_PIN = ${P("TMP_PIN")};`); add(`const float VOLTS = ${b === "uno" ? "5.0" : "3.3"};`, "The ADC reference voltage of your board."); add(`const float ADC_MAX = ${BOARDS[b].adcMax}.0;`); }
  if (S.has("pir")) { add(`const int PIR_PIN = ${P("PIR_PIN")};`); add("bool motionSeen = false;", "Latches HIGH between uploads, so a quick movement is not missed."); }
  if (S.has("mq")) { add(`const int MQ_PIN = ${P("MQ_PIN")};`); add("const unsigned long MQ_WARMUP_MS = 120000;", "Readings are not sent until the heater has warmed up."); add("float mqBaseline = 0;"); add("int mqSamples = 0;"); }
  if (S.has("led")) add(`const int LED_PIN = ${P("LED_PIN")};`, "Status LED: flashes after each successful upload.");
  if (S.has("buzzer")) add(`const int BUZZER_PIN = ${P("BUZZER_PIN")};`, "Beeps on each card tap.");
  add("unsigned long lastSend = 0;"); add("bool firstSend = true;"); blank();
  CONNECT_WIFI.forEach(l => add(l[0], l[1])); blank();
  progLines(HTTPS_GET, b).forEach(l => add(l[0], l[1])); blank();
  if (S.has("dht")) { add("String dhtParams() {", "Each sensor function returns its URL part, or an empty String if the reading failed."); add("  float t = dht.readTemperature();"); add("  float h = dht.readHumidity();"); add("  if (isnan(t) || isnan(h)) { Serial.println(\"# DHT read failed\"); return \"\"; }", "Never send nan: Code.gs would reject the request."); add("  return \"&temp_c=\" + String(t, 1) + \"&hum_pct=\" + String(h, 1);"); add("}"); blank(); }
  if (S.has("hcsr04")) { add("String distanceParams() {"); add("  digitalWrite(TRIG_PIN, LOW);"); add("  delayMicroseconds(2);"); add("  digitalWrite(TRIG_PIN, HIGH);"); add("  delayMicroseconds(10);"); add("  digitalWrite(TRIG_PIN, LOW);"); add("  unsigned long us = pulseIn(ECHO_PIN, HIGH, 30000UL);"); add("  if (us == 0) return \"\";", "No echo: send nothing rather than a wrong number."); add("  return \"&distance_cm=\" + String(us * 0.0343 / 2.0, 1);"); add("}"); blank(); }
  if (S.has("ldr")) { add("String lightParams() {"); add("  int raw = analogRead(LDR_PIN);"); add("  float pct = constrain((raw - rawDark) * 100.0 / (rawBright - rawDark), 0, 100);"); add("  return \"&light_pct=\" + String(pct, 1);"); add("}"); blank(); }
  if (S.has("tmp36")) { add("String tempParams() {"); add("  float volts = analogRead(TMP_PIN) * VOLTS / ADC_MAX;"); add("  float c = (volts - 0.5) * 100.0;", "TMP36: 10 mV per degree, 0.5 V at 0 °C."); add("  return \"&temp_c=\" + String(c, 1);"); add("}"); blank(); }
  if (S.has("pir")) { add("String pirParams() {"); add("  String r = \"&pir=\" + String(motionSeen ? 1 : 0);"); add("  motionSeen = false;", "Clear the latch after reporting."); add("  return r;"); add("}"); blank(); }
  if (S.has("mq")) { add("String gasParams() {"); add("  int raw = analogRead(MQ_PIN);"); add("  if (millis() < MQ_WARMUP_MS) return \"\";", "Still warming up: skip."); add("  if (mqSamples < 5) {", "The first 5 sends after warm-up build the clean-air baseline. Start the board in clean air!"); add("    mqBaseline += raw;"); add("    mqSamples++;"); add("    if (mqSamples == 5) mqBaseline = mqBaseline / 5;"); add("    return \"&gas_raw=\" + String(raw);"); add("  }"); add("  return \"&gas_raw=\" + String(raw) + \"&gas_ratio=\" + String(raw / mqBaseline, 2);"); add("}"); blank(); }
  add("void sendReadings(String params) {", "Builds the full URL, sends it, and shows the reply. (Not called send(), because that name is already used by the Wi-Fi network library on some boards.)");
  add("  connectWiFi();", "Reconnects if Wi-Fi dropped.");
  add("  String url = SCRIPT_URL + \"?key=\" + API_KEY + \"&device_id=\" + DEVICE_ID + params;");
  add("  String reply = httpsGet(url);"); add("  Serial.print(\"Sent\");"); add("  Serial.print(params);"); add("  Serial.print(\" -> \");"); add("  Serial.println(reply);", "Expect OK:n. ERR:key = key mismatch; ERR:bad_value = a reading was not a number.");
  if (S.has("led")) { add("  if (reply.startsWith(\"OK\")) {"); add("    digitalWrite(LED_PIN, HIGH);"); add("    delay(150);"); add("    digitalWrite(LED_PIN, LOW);"); add("  }"); }
  add("}"); blank();
  add("void setup() {"); add("  Serial.begin(115200);");
  if (S.has("dht")) add("  dht.begin();");
  if (S.has("hcsr04")) { add("  pinMode(TRIG_PIN, OUTPUT);"); add("  pinMode(ECHO_PIN, INPUT);"); }
  if (b === "uno" && (S.has("ldr") || S.has("mq"))) add("  analogReadResolution(10);");
  if (S.has("pir")) add("  pinMode(PIR_PIN, INPUT);");
  if (S.has("led")) add("  pinMode(LED_PIN, OUTPUT);");
  if (S.has("buzzer")) add("  pinMode(BUZZER_PIN, OUTPUT);");
  add("  connectWiFi();"); add("}"); blank();
  add("void loop() {");
  if (S.has("pir")) add("  if (digitalRead(PIR_PIN) == HIGH) motionSeen = true;", "Check the PIR on every pass.");
  const per = [["dht","dhtParams()"],["hcsr04","distanceParams()"],["ldr","lightParams()"],["mq135","gasParams()"],["tmp36","tempParams()"],["pir","pirParams()"]].filter(x => S.has(x[0]));
  if (per.length) { add("  if (firstSend || millis() - lastSend >= SEND_EVERY_MS) {", "The periodic upload timer (non-blocking)."); add("    firstSend = false;"); add("    lastSend = millis();"); add("    String params = " + per.map(x => x[1]).join(" + ") + ";", "Each function adds its part, e.g. &temp_c=29.4&hum_pct=68.0"); add("    if (params.length() > 0) sendReadings(params);", "Skip sending if every reading failed."); add("  }"); }
  add("}");
  return L;
}
