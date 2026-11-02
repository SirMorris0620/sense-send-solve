/* ============ UNIT 5: CAPSTONE (SDG prototype, web app, GitHub) ============ */
const DASH_STATIC = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>My IoT Dashboard</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; background: #EEF2FF; color: #1E1B4B; }
  header { background: #3730A3; color: #fff; padding: 14px 16px; }
  main { max-width: 900px; margin: 0 auto; padding: 16px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
  .card { background: #fff; border: 1px solid #C7D2FE; border-radius: 12px; padding: 12px; }
  .val { font-size: 1.8rem; font-weight: 700; }
  .bad { border: 3px solid #b91c1c; }
  #status { margin: 10px 0; }
</style>
</head>
<body>
<header><h1>My IoT Dashboard</h1><p id="status" aria-live="polite">Loading…</p></header>
<main>
  <section class="cards" id="cards" aria-label="Latest readings"></section>
  <canvas id="chart" height="140" role="img" aria-label="Line chart of recent readings"></canvas>
</main>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js"><\/script>
<script>
// 1. Point this at YOUR data. Example: a PUBLIC ThingSpeak channel (field1 = temperature, field2 = humidity).
const CHANNEL_ID = 'YOUR_CHANNEL_ID';
const DATA_URL = 'https://api.thingspeak.com/channels/' + CHANNEL_ID + '/feeds.json?results=100';
const LIMIT_TEMP = 30;                 // alert level for the card

async function load() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const feeds = data.feeds.filter(f => f.field1 !== null);
    const last = feeds[feeds.length - 1];
    const age = (Date.now() - new Date(last.created_at)) / 60000;
    document.getElementById('status').textContent = 'Updated ' + new Date(last.created_at).toLocaleTimeString() + (age > 10 ? ' (data is ' + Math.round(age) + ' min old!)' : '');
    const t = Number(last.field1), h = Number(last.field2);
    document.getElementById('cards').innerHTML =
      '<div class="card ' + (t > LIMIT_TEMP ? 'bad' : '') + '"><div>Temperature</div><div class="val">' + t.toFixed(1) + ' °C</div></div>' +
      '<div class="card"><div>Humidity</div><div class="val">' + h.toFixed(0) + ' %</div></div>';
    new Chart(document.getElementById('chart'), { type: 'line',
      data: { labels: feeds.map(f => new Date(f.created_at).toLocaleTimeString()),
              datasets: [{ label: 'Temperature (°C)', data: feeds.map(f => Number(f.field1)), borderColor: '#4F46E5', tension: 0.3, pointRadius: 0 }] },
      options: { animation: false } });
  } catch (e) {
    document.getElementById('status').textContent = 'Could not load data: ' + e.message;
  }
}
load();
setInterval(() => location.reload(), 60000);
<\/script>
</body>
</html>
`;
const GITIGNORE = `# Never commit secrets or private files
secrets.h
*.pem
*.key
.env
config.local.js
`;
COURSE.push({id:"u5", title:"Unit 5: Capstone", sub:"An SDG prototype, a working web app, and GitHub", blurb:"Put it all together. Choose a Sustainable Development Goal target, design and build a prototype with data science behind it, publish a working web app on GitHub Pages, and present your evidence.", modules:[

 {id:"5.1", title:"Choose an SDG and define the problem", minutes:150,
  intro:"Good prototypes start with a real problem for real people. You will choose an SDG target close to your own community, write a problem statement, and decide what your device must measure to help.",
  objectives:["Explain what the Sustainable Development Goals are and pick a target you can influence locally.","Use the engineering design process to define a problem, criteria, and constraints.","Write a one-page project canvas.","Check that your idea can be built with the course parts."],
  sections:[
   {id:"sdg", title:"The goals and your community", keys:"sdg sustainable development goals targets indicators", html:`
    <p>The 17 Sustainable Development Goals were adopted by all UN member states in 2015 (${ct("sdg")}). Each goal has <b>targets</b> and <b>indicators</b>. A classroom prototype will not move a national indicator; it can produce <b>local evidence</b> and <b>local action</b> toward a target.</p>
    <table class="t"><tr><th>SDG</th><th>A sensor-based idea</th><th>Parts</th></tr>
     <tr><td>3 Good health</td><td>Air-quality trend in a classroom</td><td>MQ-135, DHT22</td></tr>
     <tr><td>6 Clean water</td><td>Water tank level alert</td><td>HC-SR04</td></tr>
     <tr><td>7 Clean energy</td><td>Lights off when a room is empty and bright</td><td>PIR, LDR, LED</td></tr>
     <tr><td>11 Sustainable cities</td><td>Flood-gate barrier or parking warning</td><td>HC-SR04, servo</td></tr>
     <tr><td>12 Responsible consumption</td><td>Compost or storage temperature monitor</td><td>DHT22, TMP36</td></tr>
     <tr><td>13 Climate action</td><td>Local microclimate record</td><td>DHT22, LDR</td></tr></table>
    ${srcs(["sdg"])}`, interactive:["sdgGoals","sdgMatcher"]},
   {id:"edp", title:"The engineering design process", keys:"engineering design process problem criteria constraints", html:`
    <p>Work in a loop: identify the problem; list criteria (what success looks like) and constraints (limits); brainstorm; choose; build; test; improve; share. You will loop more than once.</p>`, interactive:"edpLoop"},
   {id:"canvas", title:"Your project canvas", keys:"project canvas problem statement users", html:`
    <p>Fill in the canvas. A good problem statement reads: <i>For [users] at [place], who need to decide [decision], our prototype measures [what] and shows [how].</i> Your answers are saved in your browser and reused in the test plan and the README generator.</p>`, interactive:["projectCanvas","moscowSort"]}
  ],
  quiz:[
   {q:"What can a classroom prototype realistically contribute to an SDG target?", o:["Change the national indicator","Local evidence or local action","Nothing","Replace government data"], a:1, e:"Be honest about scale.", w:["","","",""]},
   {q:"Criteria describe…", o:["The limits you must work within","What success looks like","The cost of parts","The team"], a:1, e:"Constraints are the limits; criteria are the goals.", w:["","","",""]},
   {q:"Which is a good problem statement?", o:["Build an IoT thing","For students in Room 204, who need to decide when to open windows, our prototype measures CO₂-related air quality and shows a traffic-light","Use sensors","Make data"], a:1, e:"Names users, place, decision, measurement, and display.", w:["","","",""]}
  ],
  rating:["I have no idea yet.","I have a topic.","I have a canvas with users, decision, and sensors.","I can defend my choice and its limits."],
  checkpoint:{code:"U5-C1", task:"Complete the project canvas with an SDG target, users, decision, and sensors; download the plan.", met:"All canvas parts completed; SDG link is honest about scale.", upload:"Upload the plan."},
  refs:["sdg","ds4e"]
 },

 {id:"5.2", title:"Design the prototype", minutes:150,
  intro:"Before you build, design. You will choose a board and an IoT track, draw the system, plan pins and power, and write your tests first.",
  objectives:["Choose a board and a track and justify them.","Draw a system diagram: sensors → board → cloud → data science → web app.","Plan pins and a power budget without conflicts.","List tests before building."],
  sections:[
   {id:"arch", title:"System diagram", keys:"system diagram architecture block", html:`
    <p>Draw boxes and arrows: <b>sensors/actuators → board → Wi-Fi → your track → Colab and web app → people</b>. Label every arrow with the data (for example <code>temp_c, hum_pct every 60 s</code>) and the protocol (HTTPS or MQTT).</p>`, interactive:"iotflow"},
   {id:"pins", title:"Pins and power", keys:"pin plan conflict power budget analog esp8266", html:`
    <p>Check that no two parts use the same pin, that analog parts fit the board (the ESP8266 has one analog pin), and that the total current fits your supply (Module 2.4).</p>`, interactive:["pinPlanner","powerBudget"]},
   {id:"tests", title:"Tests first", keys:"test plan acceptance", html:`
    <p>Write the tests before you build: what will you do, and what result means "it works"? Examples: unplug the router for 30 s and check that uploads resume; cover the LDR and check the percentage; wrong API key must be rejected.</p>`, interactive:"testPlan"}
  ],
  quiz:[
   {q:"Why write tests before building?", o:["They are optional","They define what 'works' means","They slow you down","They are for the teacher"], a:1, e:"Clear tests become your done-list.", w:["","","",""]},
   {q:"Which board limit most affects a project with an LDR and an MQ sensor?", o:["Colour","Number of analog inputs (ESP8266 has one)","Wi-Fi name","USB shape"], a:1, e:"Two analog sensors need two analog pins, or a multiplexer.", w:["","","",""]},
   {q:"A system diagram arrow should be labelled with…", o:["A colour","The data and protocol","The date","A name"], a:1, e:"It makes the data flow checkable.", w:["","","",""]}
  ],
  rating:["I jump straight to building.","I can sketch a system.","I planned pins, power, and tests.","I can explain my design choices."],
  checkpoint:{code:"U5-C2", task:"Submit a system diagram, pin plan, power budget, and test list.", met:"No pin conflicts; power fits; at least five tests including one failure test.", upload:"Upload the design."},
  refs:["alfuqaha","sdg"]
 },

 {id:"5.3", title:"Build, test, and improve", minutes:240,
  intro:"Build in small steps. Get one sensor working, then add the next. Use the firmware generator for the Google-Sheets track as a starting point, or combine the lab programs for your own track. Log what fails and what you changed.",
  objectives:["Build and test one part at a time.","Generate a starting sketch for your sensors and test it on the virtual board.","Run your test plan and record results.","Improve based on evidence."],
  sections:[
   {id:"gen", title:"A starting sketch", keys:"firmware generator sketch combine sensors", html:`
    <p>The generator below combines tested sensor code into one logger for Track A (Google Sheets). Read every line before you use it: you are responsible for your code. For Tracks B–E, keep the sensor functions it generates and swap the upload function for the one in your track's program (P17–P21).</p>
    ${noKit}`, interactive:"fwGen"},
   {id:"run", title:"Test, record, improve", keys:"test log debugging iteration", html:`
    <p>Run each test, mark Pass or Fail, and write what you changed. A failing test is useful: it tells you what to fix next. Keep a log: <i>date, what I changed, what happened, what I will try next</i>.</p>`, interactive:["testPlan","sandbox:sb_guardian"]}
  ],
  quiz:[
   {q:"Why build one sensor at a time?", o:["It is slower","A fault is easier to find","Boards allow only one","Libraries require it"], a:1, e:"Small steps isolate problems.", w:["","","",""]},
   {q:"A failing test means…", o:["You failed","You found something to fix","Delete the test","Ignore it"], a:1, e:"Tests exist to find problems.", w:["","","",""]},
   {q:"Before using generated code you should…", o:["Upload immediately","Read and test it","Delete comments","Change the baud rate"], a:1, e:"You are responsible for code you ship.", w:["","","",""]}
  ],
  rating:["I have not started.","One sensor works.","The whole prototype uploads data.","My tests and log show improvement."],
  checkpoint:{code:"U5-C3", task:"Show the working prototype (photo or screen recording) with a data row arriving in your track, and your test log with at least one fixed failure.", met:"Data arrives; log shows a fix.", upload:"Upload a photo or short recording and the log."},
  refs:["arduinoDocs","ds4e"]
 },

 {id:"5.4", title:"Your working web app", minutes:240,
  intro:"A web app lets other people see your results without opening Colab. You will learn what a web page is made of, build a dashboard that fetches your data and your analysis results, shows what they mean, and make it readable and accessible on a phone.",
  objectives:["Explain HTML, CSS, and JavaScript and what each does.","Build a dashboard page that fetches JSON and draws cards and a chart.","Show analysis results (smoothed line, anomaly flags, data quality) with a plain-language interpretation, as designed in module 4.9.","Handle errors and stale data.","Check accessibility and phone layout."],
  sections:[
   {id:"layers", title:"HTML, CSS, JavaScript", keys:"html css javascript web page layers dom", html:`
    <p>HTML is the structure (headings, cards, a canvas); CSS is the look (colours, grid, spacing); JavaScript is the behaviour (fetch data, update the page). A <b>static</b> web app is just these files; no server of your own is needed.</p>`, interactive:["webLayers","webTutorial","web:web_card,web_js,web_a11y"]},
   {id:"dash", title:"A dashboard that fetches your data", keys:"dashboard fetch json chart.js cors github pages", html:`
    <p>Save the page below as <code>index.html</code>. It fetches JSON from a URL, shows the latest values as cards, flags a limit, warns if data is old, and draws a chart. The example reads a public ThingSpeak channel (CORS is allowed). For other tracks:</p>
    <table class="t"><tr><th>Track</th><th>Data URL for the page</th></tr><tr><td>A</td><td>Add a JSON mode to your Apps Script <code>doGet</code> (return <code>ContentService.createTextOutput(JSON.stringify(rows)).setMimeType(ContentService.MimeType.JSON)</code>) and fetch your /exec URL with <code>?format=json</code>. Test it; some browsers need the redirect followed.</td></tr><tr><td>B</td><td>A Firebase path with public read rules (<code>/public_latest.json</code>) that your archive script writes; never make <code>/readings</code> public.</td></tr><tr><td>C</td><td>An API Gateway GET route + Lambda that returns recent items, with CORS enabled.</td></tr><tr><td>D</td><td>Blynk's own web dashboard (share link) embedded or linked.</td></tr><tr><td>E</td><td>The code below, or ThingSpeak's chart iframes.</td></tr></table>
    ${dlcode("index.html", DASH_STATIC, "index.html (static dashboard)")}
    <p>Make it yours: change the title, colours, limit, add a second chart, and a line that says what the numbers mean for your SDG target.</p>
    ${secretsBox}`, interactive:["dashPreview","launchCheck"]},
   {id:"analysis", title:"Show your analysis, not just your data", keys:"analysis panel results interpretation dashboard anomaly smoothed data quality", html:`
    <p>A dashboard of raw numbers answers "what is it now?". Your Unit 4 work answers "what does it mean?". Add an <b>analysis panel</b> that shows three things from your notebook: a result (for example the smoothed line with anomaly marks), the <b>data-quality line</b> (rows used, repaired, missing) and a <b>plain-language interpretation</b> of one or two sentences that says only what the data supports (module 4.9).</p>
    <p>The simplest route is the <code>results.csv</code> table you built in module 4.9: import it into a <b>Results</b> tab of your Sheet and have the page read and show it. The snippet below renders such a table into the page; it uses <code>textContent</code> so nothing in the Sheet can inject code into your page.</p>
    ${code("javascript", `// rows = [{metric:'gas_anomalies', value:12, unit:'readings', interpretation:'Review these times'}, ...] fetched from your Results tab
function renderResults(rows, target) {
  target.replaceChildren();
  rows.forEach(r => {
    const card = document.createElement('div'); card.className = 'result';
    const big = document.createElement('b'); big.textContent = r.value + ' ' + r.unit;
    const name = document.createElement('span'); name.textContent = r.metric.replaceAll('_', ' ');
    const why = document.createElement('p'); why.textContent = r.interpretation;      // your sentence, not a claim of cause
    card.append(big, name, why); target.append(card);
  });
}`, "JavaScript: show results with their interpretation")}
    <p>Check it as a reader would: every number has a unit; the interpretation does not say "causes" unless you ran an experiment; the table can be read by a screen reader; and the data-quality line is visible.</p>`, interactive:"gx_report"}
  ],
  quiz:[
   {q:"Which language changes the page after it loads?", o:["HTML","CSS","JavaScript","JSON"], a:2, e:"JavaScript runs in the browser and updates the page.", w:["","","",""]},
   {q:"Why show a 'data is old' warning?", o:["It looks nice","A dead device would otherwise show old values as if they were live","It is required","To save data"], a:1, e:"Stale data can mislead decisions.", w:["","","",""]},
   {q:"Which should never be in a public page's code?", o:["A chart title","A write API key","A CSS colour","The channel's public ID"], a:1, e:"Write keys and passwords stay private.", w:["","","",""]}
  ],
  rating:["I have not made a web page.","I can edit the sample page.","My page shows my live data.","My page is accessible, phone-friendly, and handles errors."],
  checkpoint:{code:"U5-C4", task:"Show your dashboard on a phone or browser with live data, a limit alert, a stale-data warning, and an analysis panel: at least one result from your Unit 4 notebook with its interpretation sentence.", met:"Live values, chart, alert, warning and the analysis panel visible; interpretation does not claim cause; no secrets in the code.", upload:"Upload screenshots."},
  refs:["githubDocs","tsDocs","colab"]
 },

 {id:"5.5", title:"Deploy with GitHub and GitHub Pages", minutes:210,
  intro:"GitHub keeps your code safe, shows its history, lets teams work together, and (with GitHub Pages) puts your web app on a public address for free. You will create a repository, commit your files, publish a site, and learn how to update it safely.",
  objectives:["Explain Git, GitHub, repository, commit, branch, push, and pull.","Create a repository and add your files.","Publish your web app with GitHub Pages.","Keep secrets out of the repository, and know what to do if one leaks.","Update your site and read its history."],
  sections:[
   {id:"git", title:"Git and GitHub in plain words", keys:"git github repository commit branch push pull", html:`
    <p><b>Git</b> is a tool on your computer that records snapshots of your project (<b>commits</b>). <b>GitHub</b> is a website that stores a copy of the repository online (${ct("githubStart")}). A <b>repository</b> (repo) is the project folder plus its history. A <b>branch</b> is a separate line of work; <code>main</code> is the default. <b>Push</b> sends your commits to GitHub; <b>pull</b> brings others' commits to you (${ct("progit")}).</p>`, interactive:"gitFlow"},
   {id:"repo", title:"Create the repository", keys:"github create repository readme gitignore upload", html:`
    <ol class="stepsl"><li>Create a free account at <b>github.com</b> (use a username you are comfortable showing in public).</li>
     <li>Click <b>New repository</b>. Name it, for example, <code>room204-monitor</code>. Choose <b>Public</b> (required for free GitHub Pages on personal accounts) and tick <b>Add a README</b>.</li>
     <li>Click <b>Add file → Upload files</b>, drag in your <code>index.html</code> and your Arduino sketch (placeholders only!), and click <b>Commit changes</b>.</li>
     <li>Add a <code>.gitignore</code> so secrets never get committed: <b>Add file → Create new file</b>, name it <code>.gitignore</code>, and paste the lines below.</li></ol>
    ${code("text", GITIGNORE, ".gitignore")}
    ${tip("Using Git on your computer (optional)", `<p>Install Git or GitHub Desktop, then: <code>git clone URL</code> → edit files → <code>git add .</code> → <code>git commit -m "Describe the change"</code> → <code>git push</code>. Commit messages should say <i>why</i>, for example "Warn when data is older than 10 minutes".</p>`)}
    ${safety(`<p>Everything in a <b>public</b> repository is public forever, including old commits. Never commit Wi-Fi passwords, API keys, tokens, or private keys. If you do, <b>rotate the secret immediately</b> (make a new one and delete the old one); deleting the file is not enough (${ct("githubSecrets")}).</p>`)}
    ${srcs(["githubStart","githubSecrets","progit"])}`, interactive:"secretScan"},
   {id:"pages", title:"Publish with GitHub Pages", keys:"github pages settings deploy branch main folder url", html:`
    <ol class="stepsl"><li>In your repository open <b>Settings → Pages</b>.</li>
     <li>Under <b>Build and deployment → Source</b> choose <b>Deploy from a branch</b>. Branch <b>main</b>, folder <b>/ (root)</b>, then <b>Save</b>.</li>
     <li>Wait one to two minutes. The page shows your address: <code>https://YOUR-USERNAME.github.io/room204-monitor/</code>.</li>
     <li>Open it on your phone. If you see a 404, check that the file is named exactly <code>index.html</code> and is in the root folder (${ct("githubDocs")}).</li>
     <li>To update: edit the file on GitHub (pencil icon) or push from your computer, commit, and wait for the new build.</li></ol>
    ${troubleshoot([["404 on the Pages address","index.html missing or in a sub-folder","Put index.html in the root; check the Pages branch and folder"],["Page loads but no data","Fetch blocked or wrong URL","Open the browser console (F12) and read the first red error"],["Old version still shows","Browser cache","Hard refresh (Ctrl+Shift+R) or wait a minute"],["Chart.js not found","Script blocked offline","Check the network or host the file in the repo"]])}
    ${srcs(["githubDocs"])}`, interactive:["deploySteps"]},
   {id:"docs", title:"README and good habits", keys:"readme license commit message issue", html:`
    <p>A good README tells a stranger what the project is, the SDG target it supports, how to wire and run it, how to reproduce your analysis, what you tested, and what is missing. Use the generator to start, then edit it. Add a licence (for example MIT for code) and give credit to libraries and sources.</p>`, interactive:["readmeGen"]}
  ],
  quiz:[
   {q:"What is a commit?", o:["A deleted file","A saved snapshot with a message","A password","A branch"], a:1, e:"Commits are the history of your project.", w:["","","",""]},
   {q:"You committed an API key by mistake. What first?", o:["Delete the file only","Rotate the key (make a new one, delete the old one)","Ignore it","Make the repo private only"], a:1, e:"History keeps old versions; the key must be considered stolen.", w:["","","",""]},
   {q:"GitHub Pages serves your site from…", o:["Your laptop","A branch and folder of your repository","Colab","Apps Script only"], a:1, e:"Pages builds from the branch and folder you choose.", w:["","","",""]},
   {q:"Why must the file be named index.html?", o:["Tradition only","Servers show it by default for a folder address","Colab needs it","To be shorter"], a:1, e:"It is the default page for a folder.", w:["","","",""]}
  ],
  rating:["I have never used GitHub.","I made a repo.","My site is live on GitHub Pages.","I can explain commits, secrets, and updates to a classmate."],
  checkpoint:{code:"U5-C5", task:"Publish your web app. Submit the public URL, a screenshot of the repository (no secrets visible), and the first line of your README.", met:"URL loads on a phone; repo has README and .gitignore; no secrets.", upload:"Upload the URL and screenshots."},
  refs:["githubStart","githubDocs","githubSecrets","progit"]
 },

 {id:"5.6", title:"Present your evidence", minutes:150,
  intro:"Your last job is to tell the story: the problem, your prototype, your evidence, and what you learned. A clear five-minute story, a live demo, and an honest list of limits beat a long slide deck.",
  objectives:["Organise a five-minute pitch: problem, build, evidence, limits, next step.","Demo the prototype and the web app.","Use a rubric to evaluate your own and a peer's work.","Reflect on learning."],
  sections:[
   {id:"pitch", title:"The five-minute pitch", keys:"pitch presentation story demo", html:`
    <ol class="stepsl"><li><b>Problem and people</b> (45 s): the SDG target and who it helps.</li><li><b>Build</b> (60 s): a diagram, the parts, the track you chose, and why.</li><li><b>Evidence</b> (90 s): your data report in one minute and a half: the finding, the chart or table that shows it, the number with its uncertainty, and how you cleaned and checked the data.</li><li><b>Demo</b> (60 s): live data on the web app. Have a recording as backup.</li><li><b>Limits and next step</b> (45 s): what you do not know yet, and what you would do next.</li></ol>`, interactive:"pitchBuilder"},
   {id:"rubric", title:"Rubric and reflection", keys:"rubric self assessment peer review", html:`
    <p>Rate yourself on each criterion with evidence, then compare with a peer. Disagreements are useful: ask them to show you where they see it.</p>`, interactive:["rubricSelf","launchCheck"]}
  ],
  quiz:[
   {q:"The best demo plan is…", o:["Live only","Live with a recorded backup","Slides only","Describe only"], a:1, e:"Wi-Fi fails; have a backup.", w:["","","",""]},
   {q:"Why include limits?", o:["To lower the grade","Honest limits make the claim credible","Required by law","To fill time"], a:1, e:"Good science states its limits.", w:["","","",""]},
   {q:"Which belongs in the evidence part?", o:["Your favourite colour","A chart and a number from cleaned data","The Wi-Fi password","A joke"], a:1, e:"Evidence is data you can point to.", w:["","","",""]}
  ],
  rating:["I am nervous.","I have a rough pitch.","I can present in five minutes with a demo.","I can give and receive useful feedback."],
  checkpoint:{code:"U5-C6", task:"Present (or record) your five-minute pitch with a live demo, submit your data report (module 4.9), and complete the rubric self-assessment.", met:"All five parts; demo works or recording shown; data report attached with limits stated; rubric completed.", upload:"Upload the recording or slides and the rubric."},
  refs:["sdg","ds4e"]
 }
]});
