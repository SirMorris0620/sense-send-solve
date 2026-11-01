/* ============ UNIT 3: IoT SET-UP TRACKS ============ */
const trackNote = letter => `<div class="callout tip"><b>Track ${letter}: finish one track</b><p>Unit 3 teaches five complete ways to send sensor data to the cloud. You need to finish <b>one</b> track to unlock Unit 4 (you may do more). Cloud consoles change their menus often; each step below names the setting you need, and the official guide linked under <i>Sources</i> is always the final word.</p></div>`;
const secretsBox = `<div class="callout safe"><b>Secrets stay out of shared places</b><p>Wi-Fi passwords, API keys, tokens, and private keys are secrets. Write placeholders (<code>YOUR_API_KEY</code>) in code you share, keep the real values only on your device, and never paste them into an AI chat, a screenshot, or a public GitHub repository. If a secret leaks, <b>rotate it</b> (create a new one and delete the old one) (${ct("githubSecrets")}).</p></div>`;
const colabStep = (what) => `<p>Colab runs Python in your browser, free (${ct("colab")}). Open <b>colab.research.google.com</b>, choose <b>New notebook</b>, and run each block below in its own cell. ${what}</p>`;
COURSE.push({id:"u3", title:"Unit 3: IoT set-up tracks", sub:"Five ways to send data to the cloud: choose one, finish it, compare the rest", blurb:"First the ideas every IoT system shares (Wi-Fi, HTTP, JSON, MQTT, secrets). Then five complete tutorials: Google Sheets + Apps Script + Colab, Firebase + Apps Script + Colab, AWS, Blynk, and ThingSpeak. Finish any one.", modules:[

 {id:"3.1", title:"IoT foundations and choosing your track", minutes:150,
  intro:"Every IoT system has the same five parts: a sensor, a connection, a place to store data, a way to look at it, and sometimes an action back. This module teaches the connection ideas that all five tracks share and helps you choose the track that fits your project.",
  objectives:["Describe the five parts of an IoT system and where each track puts them.","Explain Wi-Fi, HTTP requests, status codes, JSON, and MQTT in plain words.","Connect a board to Wi-Fi and recover from a dropped connection.","Keep secrets out of code you share.","Choose a track using cost, skills, limits, and the data you need."],
  sections:[
   {id:"parts", title:"Five parts of every IoT system", keys:"iot architecture sense connect store analyze act", html:`
    <p>${ct("alfuqaha")} describe IoT as layers: things that sense and act, networks that carry the data, services that store and process it, and applications that people use. In this course:</p>
    <table class="t"><tr><th>Part</th><th>What it does</th><th>Your choices</th></tr>
     <tr><td><b>Sense / act</b></td><td>Measure the world; move or signal</td><td>Unit 1–2 parts on Uno R4 WiFi, ESP8266, or ESP32</td></tr>
     <tr><td><b>Connect</b></td><td>Wi-Fi + a protocol (HTTP or MQTT)</td><td>Module 3.1</td></tr>
     <tr><td><b>Store</b></td><td>Keep every reading with a time</td><td>A Google Sheet, Firebase, DynamoDB, Blynk, or a ThingSpeak channel</td></tr>
     <tr><td><b>Analyze / show</b></td><td>Charts, statistics, alerts, models</td><td>Colab (Python) and your own web app</td></tr></table>
    ${srcs(["alfuqaha"])}`, interactive:"iotflow"},
   {id:"http", title:"HTTP, status codes, and JSON", keys:"http get post status code json request response", html:`
    <p>Most cloud tracks use <b>HTTPS</b>: your board sends a <b>request</b> (a method such as GET or POST, a URL, optional headers, and optional body) and receives a <b>response</b> with a <b>status code</b>. Learn these codes; they tell you what to fix:</p>
    <table class="t"><tr><th>Code</th><th>Meaning</th><th>Usual fix</th></tr><tr><td>200 / 201</td><td>OK / created</td><td>Nothing: it worked</td></tr><tr><td>302</td><td>Redirect (Apps Script does this)</td><td>Follow the Location header</td></tr><tr><td>400</td><td>Bad request (often broken JSON)</td><td>Print the body you send</td></tr><tr><td>401 / 403</td><td>Not signed in / not allowed</td><td>Check the key, token, or rules</td></tr><tr><td>404</td><td>Wrong URL</td><td>Copy the URL again</td></tr><tr><td>429</td><td>Too many requests</td><td>Send less often</td></tr></table>
    <p><b>JSON</b> is text that stores named values: <code>{"device_id":"team1","temp_c":29.4}</code>. Braces make an object, quotes wrap names and text, numbers have no quotes, and commas separate items.</p>`, interactive:["packetJourney","statusGame","jsonBuilder"]},
   {id:"mqtt", title:"MQTT: publish and subscribe", keys:"mqtt publish subscribe broker topic qos", html:`
    <p>HTTP is request→response. <b>MQTT</b> is a lightweight message system for devices (${ct("mqtt")}): a device <b>publishes</b> a message to a <b>topic</b> (like <code>sss/team1/telemetry</code>) on a <b>broker</b>, and anything that <b>subscribes</b> to that topic receives it. It keeps one connection open, so it is efficient for many small messages and for sending commands back to the device. AWS IoT Core uses MQTT (Track C, path 2).</p>`, interactive:"mqttSim"},
   {id:"wifi", title:"Wi-Fi in code, and keeping secrets", keys:"wifi connect reconnect 2.4 ghz secrets", html:`
    <p>The boards use <b>2.4 GHz</b> Wi-Fi only (not 5 GHz). Your code should (1) connect, (2) check the status before each upload, and (3) reconnect when the link drops, without blocking forever.</p>
    ${progBlock("wifi")}
    ${troubleshoot([["Never connects","5 GHz network, wrong password, or a captive portal","Use a 2.4 GHz network or a phone hotspot; type the password again"],["Connects, then drops","Weak signal or power dip","Move closer; use a 1 A power supply"],["Works at home, not at school","Network requires a login page","Ask your teacher for a network without a portal, or use a hotspot"]])}
    ${secretsBox}
    ${noKit}`, interactive:["wifiDoctor","secretScan","sandbox:sb_wifi"]},
   {id:"choose", title:"Choose your track", keys:"track chooser compare sheets firebase aws blynk thingspeak", html:`
    <table class="t"><tr><th></th><th>A: Sheets + Apps Script + Colab</th><th>B: Firebase + Apps Script + Colab</th><th>C: AWS</th><th>D: Blynk</th><th>E: ThingSpeak</th></tr>
     <tr><td><b>Setup effort</b></td><td>Low</td><td>Medium</td><td>High</td><td>Low</td><td>Low</td></tr>
     <tr><td><b>You see data as</b></td><td>A Sheet you can open and share</td><td>A JSON tree, live</td><td>DynamoDB items, MQTT messages</td><td>Ready-made app and web dashboards</td><td>Charts per field</td></tr>
     <tr><td><b>Two-way control</b></td><td>Possible (poll)</td><td>Yes (read a value)</td><td>Yes (MQTT)</td><td>Yes (switches)</td><td>Limited</td></tr>
     <tr><td><b>Free-plan limits (check the pricing page)</b></td><td>Apps Script daily quotas</td><td>Spark plan limits</td><td>12-month IoT Core free tier; then pay-per-use</td><td>5 devices, 1 user, 1 week of data</td><td>15 s between updates, 3 million messages / year</td></tr>
     <tr><td><b>Best when</b></td><td>You want to own and explain every layer</td><td>You want real-time and a database</td><td>You want a professional architecture</td><td>You want a phone dashboard fast</td><td>You want the quickest chart</td></tr></table>
    <p>The numbers come from each provider's pricing or limits page and can change: always confirm the current figures before you plan a long project (${ct("awsPricing")}; ${ct("blynkPricing")}; ${ct("tsDocs")}).</p>
    ${tip("A rule of thumb", `<p>Never done cloud before? Start with <b>A</b> or <b>E</b>. Want a phone app quickly? <b>D</b>. Want to learn how companies do it? <b>C</b>. Want live data and a database without servers? <b>B</b>.</p>`)}
    ${srcs(["awsPricing","blynkPricing","tsDocs"])}`, interactive:"trackChooser"}
  ],
  quiz:[
   {q:"Which status code means 'not allowed' because a key or token is wrong?", o:["200","403","404","302"], a:1, e:"401 and 403 are authorization problems.", w:["OK.","","Wrong URL.","Redirect."]},
   {q:"In MQTT, who delivers messages between devices?", o:["The router","A broker","The Serial Monitor","A spreadsheet"], a:1, e:"Publishers and subscribers talk through a broker.", w:["","","",""]},
   {q:"Why is a board's Wi-Fi password never put in a public repository?", o:["It is too long","Anyone can read a public repo and join your network","GitHub deletes it","It slows uploads"], a:1, e:"Public code is public: secrets must stay local.", w:["","","",""]},
   {q:"The 2.4 GHz rule means…", o:["Your board cannot use 5 GHz networks","Your board cannot use hotspots","The board needs 2.4 V","Wi-Fi works only 2.4 hours"], a:0, e:"These boards only support 2.4 GHz Wi-Fi.", w:["","Hotspots work if set to 2.4 GHz.","",""]}
  ],
  rating:["I know Wi-Fi is involved.","I can name the five parts and read a status code.","I connected a board (or the sandbox) and fixed a drop.","I can choose a track and justify it."],
  checkpoint:{code:"U3-C1", task:"Pass the Wi-Fi mission, then write which track you will finish and two reasons based on the comparison table.", met:"Mission passes; the choice has two specific reasons.", upload:"Upload a screenshot and your reasons."},
  refs:["alfuqaha","mqtt","awsPricing","blynkPricing","tsDocs","githubSecrets","unoR4wifi","esp32core"]
 },

 {id:"3.2", title:"Track A: Google Sheets + Apps Script + Colab", minutes:240, track:true,
  intro:"The most transparent track: your Sheet is the database, an Apps Script web app is the server, and Colab is where you analyze. You will build every layer yourself, so you can explain every layer.",
  objectives:["Create a Sheet and an Apps Script web app that accepts readings with an API key.","Deploy it correctly and test it from a browser.","Send readings from your board or the sandbox.","Read the Sheet in Colab with pandas.","Serve a dashboard from the same script."],
  sections:[
   {id:"a1", title:"Step A1: Create the Sheet", keys:"google sheet create", html:`${trackNote("A")}
    <ol class="stepsl"><li>Open <b>sheets.google.com</b> and create a blank spreadsheet. Name it <b>SSS Sensor Data</b>.</li>
     <li>Leave it empty: the script creates a tab named <b>Readings</b> with the header row the first time it runs.</li>
     <li>We store data in a <b>long</b> format: one row per reading (<code>timestamp, device_id, sensor, value</code>), so new sensors never need new columns.</li></ol>`, interactive:"longWide"},
   {id:"a2", title:"Step A2: Add the server code", keys:"apps script code.gs doGet lockservice validate", html:`
    <ol class="stepsl"><li>In the Sheet choose <b>Extensions → Apps Script</b>. Rename the project <b>SSS Logger</b>.</li>
     <li>Replace the contents of <b>Code.gs</b> with the code below. Change <code>API_KEY</code> to your own long random text.</li>
     <li>Click <b>+ → HTML</b>, name the file <b>Index</b> (without .html), and paste the dashboard page from Step A6 later (you can leave it for now).</li>
     <li>Select <b>testLogger</b> in the function menu and click <b>Run</b>. Accept the permission prompts (Google shows an "unverified app" warning for your own scripts; choose <b>Advanced → Go to SSS Logger</b>).</li>
     <li>Open the Sheet: a <b>Readings</b> tab with two rows should exist.</li></ol>
    ${anat("Code.gs: the logger", PROJECT_GS, {file:"Code.gs"})}
    ${mis(`<p>Saving the code but not <b>deploying a new version</b>. The /exec URL keeps running the old code until you choose <b>Deploy → Manage deployments → Edit → New version</b>.</p>`)}
    ${srcs(["appsScript","asQuotas"])}`, interactive:["as:as_hello,as_params,as_log,as_key,as_validate,as_latest","lockRace"]},
   {id:"a3", title:"Step A3: Deploy and test", keys:"deploy web app exec url test", html:`
    <ol class="stepsl"><li>Click <b>Deploy → New deployment → ⚙ → Web app</b>.</li>
     <li>Set <b>Execute as: Me</b> and <b>Who has access: Anyone</b>. (The board has no Google login, so the API key is the protection.)</li>
     <li>Click <b>Deploy</b> and copy the <b>Web app URL</b> ending in <code>/exec</code>.</li>
     <li>Test in a browser: <code>YOUR_URL?key=YOUR_API_KEY&amp;device_id=test&amp;temp_c=25</code>. You should see <code>OK:1</code> and a new row. Try a wrong key: <code>ERR:key</code>.</li></ol>`, interactive:["urlDissector","redirectViz","deployFlow"]},
   {id:"a4", title:"Step A4: Send readings from the board", keys:"esp send reading https get sheet", html:`
    <p>The board builds the same URL you typed. Apps Script answers with a redirect (302), which the sketch follows.</p>
    ${progBlock("hello")}
    ${noKit}
    ${secretsBox}`, interactive:"sandbox:sb_logger"},
   {id:"a5", title:"Step A5: Analyze in Colab", keys:"colab pandas gspread read sheet", html:`
    ${colabStep("Your Google account signs in to Colab, so the Sheet stays private.")}
    ${code("python", `# Cell 1: sign in and open the Sheet
from google.colab import auth
auth.authenticate_user()
import gspread, pandas as pd
from google.auth import default
creds, _ = default()
gc = gspread.authorize(creds)
sh = gc.open('SSS Sensor Data')            # the exact name of your Sheet
rows = sh.worksheet('Readings').get_all_records()
df = pd.DataFrame(rows)
df['timestamp'] = pd.to_datetime(df['timestamp'])
df.head()`, "Colab cell 1")}
    ${code("python", `# Cell 2: long -> wide (one column per sensor) and a first chart
wide = df.pivot_table(index='timestamp', columns='sensor', values='value', aggfunc='mean')
wide.plot(subplots=True, figsize=(9, 6))`, "Colab cell 2")}
    ${tip("Why long format?", `<p>Long format (one row per reading) is tidy data (${ct("tidy")}): every variable is a column and every observation is a row. <code>pivot_table</code> turns it into a wide table when you need one column per sensor.</p>`)}
    ${srcs(["colab","pandas","tidy"])}`, interactive:"schemaDesigner"},
   {id:"a6", title:"Step A6: The dashboard page", keys:"index.html dashboard google.script.run", html:`
    <p>The same web app serves a dashboard when a <i>person</i> opens the URL (no key). Create the <b>Index</b> HTML file and paste the page below. It calls <code>getLatest()</code> on the server with <code>google.script.run</code>, shows the newest value of each sensor as a card, and draws a chart.</p>
    ${dlcode("Index.html", PROJECT_HTML, "Index.html (dashboard)")}
    ${troubleshoot([["Browser shows 'script function not found: doGet'","Code not saved, or new version not deployed","Save, then Deploy → Manage deployments → New version"],["Board prints ERR:key","Key differs by one character or a space","Copy-paste the key into both places"],["Nothing appears in the Sheet","You opened the old deployment URL","Use the newest /exec URL"],["Dashboard says 'Could not load data'","Index.html missing or has a script error","Open the browser console and read the first red error"]])}`, interactive:["dashPreview","web:web_gas"]}
  ],
  quiz:[
   {q:"Why do we store one row per reading (long format)?", o:["It is shorter","New sensors need no new columns","Sheets cannot do wide","It is faster to type"], a:1, e:"Long tidy data grows by rows, not by columns.", w:["","","",""]},
   {q:"What stops anyone on the internet from writing to your Sheet?", o:["Nothing","The API key check in doGet","The Wi-Fi password","The Sheet's name"], a:1, e:"doGet rejects requests without the correct key before it writes.", w:["","","",""]},
   {q:"You edited Code.gs but the board still gets the old behaviour. Why?", o:["Colab is stale","You did not deploy a new version","The board is too old","The Sheet is full"], a:1, e:"A deployment runs a fixed version until you update it.", w:["","","",""]},
   {q:"Which Colab function turns long data into one column per sensor?", o:["df.head()","pivot_table","plot","open"], a:1, e:"pivot_table reshapes long into wide.", w:["","","",""]}
  ],
  rating:["I understand the pieces.","I deployed the script and tested with a URL.","A board or sandbox filled the Sheet and I read it in Colab.","I can teach the five steps to a classmate."],
  checkpoint:{code:"U3-A", task:"Show the full path: the sketch or sandbox sending readings, the Sheet with at least 20 rows, and a Colab chart of one sensor. Never show your API key.", met:"Sheet rows, Colab chart, and Serial/sandbox evidence are present; the key is hidden.", upload:"Upload three screenshots (key hidden) and your /exec URL’s last six characters only."},
  refs:["appsScript","asQuotas","colab","pandas","tidy","githubSecrets"]
 },

 {id:"3.3", title:"Track B: Firebase + Apps Script + Colab", minutes:240, track:true,
  intro:"Firebase Realtime Database stores JSON and updates in real time. You will sign the device in properly, protect the database with rules, archive readings to a Sheet with Apps Script, and analyze them in Colab.",
  objectives:["Create a Firebase project with a Realtime Database and email sign-in.","Write security rules that require sign-in.","Send readings from the device with the REST API and an ID token.","Archive readings to a Sheet with an Apps Script trigger.","Read the data in Colab."],
  sections:[
   {id:"b1", title:"Step B1: Project, database, and sign-in", keys:"firebase project realtime database authentication", html:`${trackNote("B")}
    <ol class="stepsl"><li>Go to <b>console.firebase.google.com</b> → <b>Create a project</b>. Name it, and Analytics is optional.</li>
     <li>Open <b>Build → Realtime Database → Create database</b>. Pick the region closest to you. Choose <b>locked mode</b>. (Test mode is open to the world for 30 days: do not use it.)</li>
     <li>Copy the database URL shown at the top of the Data tab, like <code>https://your-project-default-rtdb.firebaseio.com</code>.</li>
     <li>Open <b>Build → Authentication → Get started → Sign-in method → Email/Password → Enable</b>.</li>
     <li>On the <b>Users</b> tab choose <b>Add user</b>: email <code>device@school.edu</code> and a password only your team knows. This is the account your board signs in with.</li>
     <li>In <b>Project settings → General</b> copy the <b>Web API Key</b>. It identifies your project; it is not a password, but do not publish it with your device password.</li></ol>
    ${srcs(["firebaseRtdb","firebaseAuth"])}`, interactive:""},
   {id:"b2", title:"Step B2: Rules", keys:"firebase rules auth read write", html:`
    <p>Open the <b>Rules</b> tab and replace the rules with the following, then <b>Publish</b>:</p>
    ${code("json", `{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}`, "Realtime Database rules: signed-in users only")}
    <p>Now a request without a valid ID token is refused with <b>401 Permission denied</b> (${ct("firebaseRules")}). Later you can tighten the rules so only one account may write.</p>
    ${mis(`<p>Leaving the rules as <code>".read": true, ".write": true</code>. Anyone who finds your URL can read, change, or delete your data.</p>`)}
    ${srcs(["firebaseRules"])}`, interactive:""},
   {id:"b3", title:"Step B3: Send readings from the device", keys:"firebase rest idtoken signinwithpassword push put", html:`
    <p>The device signs in with the Auth REST API and receives an <b>ID token</b> that lasts about one hour. It then sends each reading to <code>/readings.json?auth=TOKEN</code> with <b>POST</b> (Firebase creates a unique key per reading) and the newest reading to <code>/latest.json</code> with <b>PUT</b> (${ct("firebaseRest")}).</p>
    ${progBlock("firebase")}
    <p>Set <code>USE_AUTH</code> to <b>true</b> once your rules require sign-in. Fill <code>API_KEY</code>, <code>DEVICE_EMAIL</code>, <code>DEVICE_PASS</code>, <code>DB_HOST</code> with your values; never commit them.</p>
    ${noKit}
    ${secretsBox}
    ${troubleshoot([["401 Permission denied","Rules need sign-in but USE_AUTH is false, or the token expired","Set USE_AUTH true; sign in again after about 55 minutes"],["Sign-in failed: EMAIL_NOT_FOUND / INVALID_PASSWORD","Account or password differs","Check the Users tab and retype"],["400 invalid JSON","Missing quote or comma in the body","Print the body before sending"]])}`, interactive:"sandbox:sb_fb1,sb_fb2"},
   {id:"b4", title:"Step B4: Archive with Apps Script", keys:"apps script firebase trigger archive sheet oauth", html:`
    <p>Apps Script can read the database with your Google account and copy new readings into a Sheet on a schedule. This gives you a shareable table and a backup.</p>
    <ol class="stepsl"><li>Create a new Sheet <b>Firebase Archive</b>, then <b>Extensions → Apps Script</b>.</li>
     <li>Open <b>Project Settings</b> and tick <b>Show "appsscript.json" manifest file</b>. Add these scopes to <code>oauthScopes</code>: <code>https://www.googleapis.com/auth/script.external_request</code>, <code>https://www.googleapis.com/auth/spreadsheets</code>, <code>https://www.googleapis.com/auth/firebase.database</code>, <code>https://www.googleapis.com/auth/userinfo.email</code>.</li>
     <li>Paste the code below, set <code>DB_URL</code>, run <b>archive</b> once, and approve the permissions. The Google account that runs it must be an owner or editor of the Firebase project.</li>
     <li>Open <b>Triggers (clock icon) → Add Trigger</b>: function <b>archive</b>, time-driven, every hour.</li></ol>
    ${code("javascript", `const DB_URL = 'https://your-project-default-rtdb.firebaseio.com';
function archive() {
  const url = DB_URL + '/readings.json?orderBy="$key"&limitToLast=500&access_token=' + ScriptApp.getOAuthToken();
  const res = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
  if (res.getResponseCode() !== 200) throw new Error('Firebase said ' + res.getResponseCode() + ': ' + res.getContentText());
  const data = JSON.parse(res.getContentText()) || {};
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('archive') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('archive');
  if (sh.getLastRow() === 0) sh.appendRow(['key', 'temp_c', 'hum_pct', 'ms']);
  const seen = new Set(sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().flat());
  const rows = Object.keys(data).filter(k => !seen.has(k)).map(k => [k, data[k].temp_c, data[k].hum_pct, data[k].ms]);
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
}`, "Apps Script: copy new Firebase readings into a Sheet")}
    <p class="explain">If Firebase rejects the Google token in your project, check the REST documentation (${ct("firebaseRest")}) for the current OAuth option, or let Colab read the database directly (next step).</p>`, interactive:""},
   {id:"b5", title:"Step B5: Analyze in Colab", keys:"colab firebase requests pandas secrets", html:`
    ${colabStep("Store your values in Colab's key icon (Secrets): FB_API_KEY, FB_EMAIL, FB_PASS. Never paste them into a cell.")}
    ${code("python", `import requests, pandas as pd
from google.colab import userdata
API_KEY = userdata.get('FB_API_KEY')
DB = 'https://your-project-default-rtdb.firebaseio.com'
r = requests.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + API_KEY,
                  json={'email': userdata.get('FB_EMAIL'), 'password': userdata.get('FB_PASS'), 'returnSecureToken': True})
token = r.json()['idToken']
data = requests.get(DB + '/readings.json', params={'auth': token}).json()
df = pd.DataFrame.from_dict(data, orient='index')
df['time'] = pd.to_datetime(df['ms'], unit='ms')   # device time since start
df.describe()`, "Colab: read Firebase directly")}
    ${srcs(["firebaseAuth","firebaseRest","colab"])}`, interactive:""}
  ],
  quiz:[
   {q:"Why not use Firebase 'test mode' rules?", o:["They cost money","They let anyone read and write your data","They block the device","They erase data weekly"], a:1, e:"Open rules expose your database.", w:["","","",""]},
   {q:"What does the device get back after signing in?", o:["A database URL","An ID token that expires after about an hour","A new password","A Sheet"], a:1, e:"The ID token proves who is calling and expires.", w:["","","",""]},
   {q:"POST to /readings.json does what?", o:["Replaces everything","Adds a new child with a unique key","Deletes readings","Signs in"], a:1, e:"POST pushes a new unique key; PUT sets a fixed path.", w:["","","",""]},
   {q:"Where should the password live in Colab?", o:["In a text cell","In Colab Secrets","In the notebook title","In a comment"], a:1, e:"Secrets are not saved in the notebook.", w:["","","",""]}
  ],
  rating:["I know what Firebase is.","I created the database and rules.","My device or sandbox stores readings and I fixed a 401.","I can explain tokens and rules to a classmate."],
  checkpoint:{code:"U3-B", task:"Pass both Firebase missions and show the JSON tree with at least 10 readings and a Colab table. Hide all keys and passwords.", met:"Both missions pass; the data tree and the Colab table are shown; no secrets.", upload:"Upload screenshots."},
  refs:["firebaseRtdb","firebaseRest","firebaseAuth","firebaseRules","appsScript","colab","githubSecrets"]
 },

 {id:"3.4", title:"Track C: AWS (API Gateway, Lambda, DynamoDB, IoT Core)", minutes:300, track:true,
  intro:"The professional route. Path 1 sends readings over HTTPS through API Gateway and Lambda into DynamoDB. Path 2 uses AWS IoT Core with MQTT and certificates. You will also set a billing alarm first, so there are no surprises.",
  objectives:["Create an AWS account safely with a budget alert.","Build DynamoDB + Lambda + API Gateway and send readings with an API key.","Create an IoT Core thing, certificate, and policy, and publish with MQTT.","Route MQTT messages to DynamoDB with a rule.","Read the table from Colab and clean up resources."],
  sections:[
   {id:"c0", title:"Step C0: Account, region, and a billing alarm", keys:"aws account budget billing free tier region", html:`${trackNote("C")}
    <ol class="stepsl"><li>Create an AWS account (a credit card is required). Sign in as the <b>root user</b> only to set things up.</li>
     <li>Open <b>Billing → Budgets → Create budget</b>: a <b>zero-spend or small budget</b> with an email alert, before you create anything else.</li>
     <li>Choose one <b>Region</b> (for example Asia Pacific (Singapore) <code>ap-southeast-1</code>) and use it for every step; the console shows resources only for the selected region.</li>
     <li>Note the free tier: AWS IoT Core's free tier lasts 12 months and has monthly allowances (for example 500,000 messages and 2,250,000 connection minutes), metered in 5 KB message units; always confirm current numbers (${ct("awsPricing")}).</li></ol>
    ${safety(`<p>Cloud costs are real. Set the budget alert first, delete what you create when you finish, and never leave a loop that sends messages every second all night.</p>`)}
    ${srcs(["awsPricing"])}`, interactive:""},
   {id:"c1", title:"Step C1: DynamoDB table", keys:"dynamodb table partition key sort key", html:`
    <ol class="stepsl"><li>Open <b>DynamoDB → Tables → Create table</b>.</li>
     <li>Table name <code>sss_readings</code>. Partition key <code>device_id</code> (String). Sort key <code>ts</code> (Number: Unix time in seconds).</li>
     <li>Keep <b>on-demand</b> capacity (pay per request) and create the table.</li></ol>
    <p>A DynamoDB item is a set of attributes. The partition key groups a device's readings; the sort key orders them by time (${ct("awsDdb")}).</p>
    ${srcs(["awsDdb"])}`, interactive:""},
   {id:"c2", title:"Step C2: Lambda function", keys:"lambda python put_item role", html:`
    <ol class="stepsl"><li>Open <b>Lambda → Create function → Author from scratch</b>. Name <code>sss_ingest</code>, runtime <b>Python 3.12</b> (or newer).</li>
     <li>Under <b>Configuration → Environment variables</b> add <code>TABLE</code> = <code>sss_readings</code>.</li>
     <li>Under <b>Configuration → Permissions</b>, open the role and attach a policy that allows <code>dynamodb:PutItem</code> on your table only.</li>
     <li>Paste the code below and click <b>Deploy</b>.</li></ol>
    ${code("python", `import json, os, time, boto3
from decimal import Decimal

table = boto3.resource('dynamodb').Table(os.environ['TABLE'])

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body') or '{}', parse_float=Decimal)
        device = str(body['device_id'])[:40]
        item = {'device_id': device, 'ts': int(time.time())}
        for k in ('temp_c', 'hum_pct', 'light_pct', 'distance_cm', 'gas_raw', 'pir'):
            if k in body:
                item[k] = body[k]
        table.put_item(Item=item)
        return {'statusCode': 200, 'body': json.dumps({'ok': True})}
    except (KeyError, ValueError):
        return {'statusCode': 400, 'body': json.dumps({'ok': False, 'error': 'bad request'})}`, "Lambda: validate and store one reading")}
    ${srcs(["awsLambda"])}`, interactive:""},
   {id:"c3", title:"Step C3: API Gateway with an API key", keys:"api gateway rest api key usage plan stage x-api-key", html:`
    <ol class="stepsl"><li>Open <b>API Gateway → Create API → REST API → Build</b>. Name <code>sss_api</code>.</li>
     <li><b>Create resource</b> <code>readings</code>, then <b>Create method → POST</b> with <b>Lambda function</b> integration (tick <b>Lambda proxy integration</b>) pointing to <code>sss_ingest</code>.</li>
     <li>In <b>Method request</b> set <b>API key required</b> to true.</li>
     <li><b>Deploy API</b> to a new stage named <code>prod</code>. Copy the <b>Invoke URL</b>.</li>
     <li>Create <b>Usage plan</b> (for example 5 requests/second, 10,000 per month), attach the <code>prod</code> stage, then <b>Create API key</b> and add it to the plan.</li>
     <li>Test with a browser tool or the board: header <code>x-api-key: YOUR_KEY</code>, body <code>{"device_id":"team1","temp_c":29.4,"hum_pct":65}</code>. Check <b>DynamoDB → Explore items</b>.</li></ol>
    ${progBlock("awsapi")}
    ${troubleshoot([["403 Forbidden","Missing or wrong x-api-key header, or key not attached to the usage plan","Check the header name and the usage plan"],["500 Internal server error","Lambda error","Open CloudWatch logs for the function"],["Item missing fields","Field not in the allowed list","Add the name to the list in the Lambda code"]])}
    ${srcs(["awsApigw"])}`, interactive:"sandbox:sb_aws"},
   {id:"c4", title:"Step C4: IoT Core, certificates, and MQTT", keys:"aws iot core thing certificate policy endpoint mqtt rule", html:`
    <ol class="stepsl"><li>Open <b>IoT Core → Settings</b> and copy your <b>Device data endpoint</b> (<code>xxxx-ats.iot.REGION.amazonaws.com</code>).</li>
     <li><b>Manage → All devices → Things → Create things → Create single thing</b>. Name <code>sss-device-01</code>, auto-generate a certificate.</li>
     <li>Download the <b>device certificate</b>, the <b>private key</b>, and <b>Amazon Root CA 1</b>. The private key can be downloaded only once. Keep it out of GitHub.</li>
     <li>Create a <b>policy</b> that allows only what the device needs, for example: <code>iot:Connect</code> for client id <code>sss-device-01</code>, <code>iot:Publish</code> on <code>sss/sss-device-01/telemetry</code>, and <code>iot:Subscribe</code>/<code>iot:Receive</code> on <code>sss/sss-device-01/cmd</code>. Attach it to the certificate.</li>
     <li>In <b>MQTT test client</b> subscribe to <code>sss/#</code> to watch messages arrive.</li>
     <li>Create a <b>Rule</b> with SQL <code>SELECT *, topic(2) AS device_id, timestamp() AS ts FROM 'sss/+/telemetry'</code> and an action <b>DynamoDB (v2)</b> writing to <code>sss_readings</code> (the rule's IAM role must allow PutItem).</li></ol>
    <p>On the ESP8266 and ESP32 the sketch loads the three PEM files as strings and publishes JSON with the PubSubClient library; keep messages small (the default buffer is 256 bytes, set a bigger one if needed) and call <code>client.loop()</code> often so the connection stays alive.</p>
    ${progBlock("awsmqtt")}
    <div class="callout tip"><b>Uno R4 WiFi note</b><p>Loading client certificates on the Uno R4 WiFi needs extra setup. In this course the Uno R4 uses Path 1 (HTTPS to API Gateway); the ESP boards can use either path. Check Arduino's current guides before relying on a certificate flow on the R4.</p></div>
    ${secretsBox}
    ${srcs(["awsIot","mqtt"])}`, interactive:["mqttSim","sandbox:sb_mqtt"]},
   {id:"c5", title:"Step C5: Analyze in Colab, then clean up", keys:"boto3 dynamodb colab iam read only cleanup", html:`
    <ol class="stepsl"><li>In <b>IAM → Users → Create user</b> <code>colab-reader</code>, attach a policy allowing only <code>dynamodb:Query</code> and <code>dynamodb:Scan</code> on <code>sss_readings</code>. Create an <b>access key</b> and store it in Colab Secrets (<code>AWS_KEY</code>, <code>AWS_SECRET</code>).</li></ol>
    ${code("python", `!pip -q install boto3
import boto3, pandas as pd
from google.colab import userdata
ddb = boto3.resource('dynamodb', region_name='ap-southeast-1',
                     aws_access_key_id=userdata.get('AWS_KEY'),
                     aws_secret_access_key=userdata.get('AWS_SECRET'))
items = ddb.Table('sss_readings').scan()['Items']
df = pd.DataFrame(items)
df['time'] = pd.to_datetime(df['ts'].astype(int), unit='s')
for c in df.columns:
    if c not in ('device_id', 'time'):
        df[c] = pd.to_numeric(df[c])
df.sort_values('time').head()`, "Colab: read DynamoDB")}
    <p><b>Clean up</b> when finished: delete the usage plan and API, the Lambda function, the IoT rule, thing, certificate and policy, and the DynamoDB table; delete the IAM access key. Then check the Billing page next day.</p>
    ${srcs(["awsDdb","colab"])}`, interactive:""}
  ],
  quiz:[
   {q:"What is the first thing to do in a new AWS account for this course?", o:["Create a Lambda","Set a budget alert","Download the keys","Create a table"], a:1, e:"A budget alert prevents surprise bills.", w:["","","",""]},
   {q:"API Gateway answers 403 and your Lambda is fine. Most likely…", o:["The table is full","The x-api-key header is missing or wrong","The sensor is hot","The region is wrong"], a:1, e:"403 from the gateway means the key was not accepted.", w:["","","",""]},
   {q:"Why use a policy that allows publishing only to one topic?", o:["To make it faster","Least privilege: a stolen device can do very little","To save messages","MQTT requires it"], a:1, e:"Give each device only the permissions it needs.", w:["","","",""]},
   {q:"How many times can you download an IoT private key?", o:["Unlimited","Only once, at creation","Twice","Never"], a:1, e:"Keep it safe; create a new certificate if lost.", w:["","","",""]}
  ],
  rating:["I know AWS has many services.","I created the table, Lambda, and API.","Readings from my device or sandbox reach DynamoDB.","I can explain both paths and clean up resources."],
  checkpoint:{code:"U3-C", task:"Show a budget alert, a DynamoDB table with at least 10 readings, and a Colab table. Pass the AWS missions. Hide keys.", met:"Budget alert, table, Colab, missions pass; no secrets.", upload:"Upload screenshots."},
  refs:["awsPricing","awsIot","awsApigw","awsDdb","awsLambda","mqtt","colab","githubSecrets"]
 },

 {id:"3.5", title:"Track D: Blynk", minutes:180, track:true,
  intro:"Blynk gives you a ready-made dashboard on the web and on your phone. You describe your data once in a template, and your board connects with a token. It is the fastest way to a good-looking control panel.",
  objectives:["Create a Blynk template with datastreams (V0, V1, V2).","Build a web dashboard with a gauge, a chart, and a switch.","Connect a board with the Blynk library and send/receive values.","Export data and open it in Colab."],
  sections:[
   {id:"d1", title:"Step D1: Template and datastreams", keys:"blynk template datastream virtual pin console", html:`${trackNote("D")}
    <ol class="stepsl"><li>Create a free account at <b>blynk.cloud</b> and open <b>Blynk.Console</b>.</li>
     <li><b>Developer Zone → My Templates → New Template</b>. Name <code>Classroom Monitor</code>, hardware <b>ESP32</b> or <b>ESP8266</b>, connection <b>Wi-Fi</b>.</li>
     <li>On <b>Datastreams</b> add three <b>virtual pins</b>: <code>V0</code> Temperature (Double, 0–50, °C), <code>V1</code> Humidity (Double, 0–100, %), <code>V2</code> LED switch (Integer, 0–1).</li>
     <li>On <b>Web Dashboard</b> add a <b>Gauge</b> (V0), a <b>Chart</b> (V0 and V1), and a <b>Switch</b> (V2).</li>
     <li>Save the template. Then <b>Devices → New Device → From template</b>. Open the device's <b>Firmware configuration</b>: copy <code>BLYNK_TEMPLATE_ID</code>, <code>BLYNK_TEMPLATE_NAME</code>, and <code>BLYNK_AUTH_TOKEN</code>.</li></ol>
    ${srcs(["blynkDocs"])}`, interactive:""},
   {id:"d2", title:"Step D2: Program the board", keys:"blynk library blynktimer virtualwrite blynk_write", html:`
    <p>Install the <b>Blynk</b> library (by Volodymyr Shymanskyy) from the Library Manager. The three <code>#define</code> lines must come <b>before</b> the Blynk <code>#include</code>. Use <code>Blynk.virtualWrite(V0, value)</code> to send and <code>BLYNK_WRITE(V2)</code> to receive a switch press. A <code>BlynkTimer</code> sends readings without <code>delay()</code>.</p>
    ${progBlock("blynk")}
    <div class="callout tip"><b>Uno R4 WiFi</b><p>Blynk's support for the Uno R4 WiFi works differently from the ESP boards (it relies on Blynk's own firmware for the board's Wi-Fi chip). Check Blynk's current documentation (${ct("blynkDocs")}) before you start. This track's tutorial and sandbox use an ESP board.</p></div>
    ${noKit}
    ${secretsBox}
    ${troubleshoot([["Device stays offline","Template/token mismatch or 5 GHz Wi-Fi","Copy all three defines again; use 2.4 GHz"],["Gauge shows nothing","Datastream range or pin differs","Match V0 to the code and the range to your data"],["Switch does nothing","No BLYNK_WRITE handler for that pin","Add BLYNK_WRITE(V2) and set the LED there"]])}
    ${srcs(["blynkDocs"])}`, interactive:"sandbox:sb_blynk"},
   {id:"d3", title:"Step D3: Limits and exporting data", keys:"blynk free plan limits export csv colab", html:`
    <p>The free plan allows a small number of devices and keeps only a short history (about a week at the time of writing), so data science needs an <b>export</b>: in the Console open the device's <b>Data</b> or the chart's download option and save a CSV (${ct("blynkPricing")}). Then, in Colab:</p>
    ${code("python", `from google.colab import files
import pandas as pd
up = files.upload()                       # choose the CSV you exported
df = pd.read_csv(next(iter(up)))
df.head()`, "Colab: load a Blynk export")}
    ${tip("Compare", `<p>Blynk is excellent for <i>live control</i> and weak for <i>long history</i>. Pair it with another track when you need months of data.</p>`)}
    ${srcs(["blynkPricing","colab"])}`, interactive:""}
  ],
  quiz:[
   {q:"Where must the three Blynk #define lines go?", o:["After setup()","Before the Blynk #include","In loop()","In a comment"], a:1, e:"The library reads them when it is included.", w:["","","",""]},
   {q:"What does BLYNK_WRITE(V2) do?", o:["Sends a value","Runs when the app changes V2","Reads a sensor","Connects Wi-Fi"], a:1, e:"It is a handler for incoming values.", w:["","","",""]},
   {q:"Why export data from Blynk?", o:["It is required to log in","The free plan keeps only a short history","To change the token","To use PWM"], a:1, e:"Export keeps data longer than the plan does.", w:["","","",""]}
  ],
  rating:["I know Blynk has an app.","I built the template and dashboard.","My device or sandbox updates the gauge and switch.","I can explain Blynk's strengths and limits."],
  checkpoint:{code:"U3-D", task:"Pass the Blynk mission, show a dashboard with a live gauge and a working switch, and a Colab table from an exported CSV.", met:"Mission passes; dashboard and Colab are shown; token hidden.", upload:"Upload screenshots."},
  refs:["blynkDocs","blynkPricing","colab","githubSecrets"]
 },

 {id:"3.6", title:"Track E: ThingSpeak", minutes:150, track:true,
  intro:"ThingSpeak, from MathWorks, turns a few lines of code into a chart. You create a channel with fields, write to it with a key, and view it on a public or private page.",
  objectives:["Create a ThingSpeak channel with fields and keys.","Send readings from the board with the ThingSpeak library or a GET request.","Respect the update limit and interpret library return codes.","Download the feed in Colab."],
  sections:[
   {id:"e1", title:"Step E1: Channel and keys", keys:"thingspeak channel field write api key read api key", html:`${trackNote("E")}
    <ol class="stepsl"><li>Create a free MathWorks account and open <b>thingspeak.com</b> → <b>Channels → My Channels → New Channel</b>.</li>
     <li>Name it and enable <b>Field 1</b> (Temperature) and <b>Field 2</b> (Humidity); up to 8 fields are available per channel. Save.</li>
     <li>Open <b>API Keys</b>: copy the <b>Channel ID</b> and the <b>Write API Key</b>. The <b>Read API Key</b> is for apps that only read.</li></ol>
    <table class="t"><tr><th>Limit (free, verify)</th><th>Value</th></tr><tr><td>Minimum time between updates</td><td>15 seconds</td></tr><tr><td>Messages per year</td><td>3 million</td></tr><tr><td>Channels / fields</td><td>4 channels, 8 fields each</td></tr></table>
    <p class="explain">Figures from MathWorks' documentation at the time of writing (${ct("tsDocs")}); confirm before planning.</p>
    ${srcs(["tsDocs"])}`, interactive:""},
   {id:"e2", title:"Step E2: Send from the board", keys:"thingspeak library writefields return code 200 -401", html:`
    <p>Install <b>ThingSpeak</b> (by MathWorks). Use <code>ThingSpeak.setField(1, temp)</code>, <code>setField(2, hum)</code>, then <code>ThingSpeak.writeFields(channelId, writeKey)</code>. The return value is <b>200</b> on success; other values explain the problem (${ct("tsLib")}).</p>
    ${progBlock("thingspeak")}
    <table class="t"><tr><th>Code</th><th>Meaning</th></tr><tr><td>200</td><td>Success</td></tr><tr><td>404</td><td>Wrong channel or key</td></tr><tr><td>-301</td><td>Failed to connect</td></tr><tr><td>-401</td><td>Updated too soon (under 15 s)</td></tr><tr><td>-210</td><td>No fields were set</td></tr></table>
    ${noKit}
    ${secretsBox}
    ${srcs(["tsLib","tsDocs"])}`, interactive:"sandbox:sb_ts"},
   {id:"e3", title:"Step E3: Visualize and download", keys:"thingspeak charts public colab csv feeds", html:`
    <p>Each field gets a chart automatically. You can add a <b>Numeric Display</b> or <b>Gauge</b> widget. A private channel shows data only to you; a public channel can be shared with a link. To analyze in Colab, download the feed as CSV (use the Read API Key for a private channel):</p>
    ${code("python", `import pandas as pd
CHANNEL = 'YOUR_CHANNEL_ID'
url = 'https://api.thingspeak.com/channels/' + CHANNEL + '/feeds.csv?results=8000'
df = pd.read_csv(url, parse_dates=['created_at'])
df = df.rename(columns={'field1': 'temp_c', 'field2': 'hum_pct'})
df.set_index('created_at')[['temp_c', 'hum_pct']].plot(subplots=True, figsize=(9, 5))`, "Colab: read a public channel")}
    <p>For a private channel add <code>&amp;api_key=YOUR_READ_KEY</code> to the URL using Colab Secrets.</p>
    ${srcs(["tsDocs","colab"])}`, interactive:""}
  ],
  quiz:[
   {q:"What does a return value of -401 usually mean?", o:["Wrong key","You wrote again in under 15 seconds","The channel is full","Wi-Fi is off"], a:1, e:"The free plan limits updates to one per 15 seconds.", w:["","","",""]},
   {q:"Which key can write to a channel?", o:["Read API Key","Write API Key","Channel ID","MathWorks password"], a:1, e:"The Write API Key allows updates.", w:["","","",""]},
   {q:"A private channel can be read in Colab by…", o:["Nobody","Adding the Read API Key to the request","Guessing","Using the Write key in public"], a:1, e:"Private feeds need the read key.", w:["","","",""]}
  ],
  rating:["I know ThingSpeak makes charts.","I created a channel.","My device or sandbox fills a chart without -401.","I can explain limits and keys."],
  checkpoint:{code:"U3-E", task:"Pass the ThingSpeak mission, show a channel with two charts and 20+ points, and a Colab plot.", met:"Mission passes; charts and Colab are shown; keys hidden.", upload:"Upload screenshots."},
  refs:["tsDocs","tsLib","colab","githubSecrets"]
 }
]});
