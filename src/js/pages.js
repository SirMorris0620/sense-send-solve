/* ============ DATA PRIVACY STATEMENT ============ */
const PRIVACY_HTML = `
<h3>Data Privacy Statement</h3>
<p><b>Who we are.</b> This course, <i>${COURSE_TITLE}</i>, is managed by <b>Morris C. Bana, LPT</b>, an independent course creator, as the personal information controller. It is a personal project and is not run by any school or university.</p>
<p><b>What we collect.</b> Your last and given name, age, email address, role, grade level(s), and school or industry; your learning activity (visits, active time, device type, board choice, sections completed, quiz answers, self-ratings, sandbox attempts, AI-use log entries); the feedback and problem reports you send; the files you upload; and the questions you ask the AI assistant and its answers.</p>
<p><b>On your device.</b> Your profile and progress are also kept in this browser so you can continue offline and sign in again with one tap. On a shared device, remove your name from the sign-in screen (✕) when you finish.</p>
<p><b>Why we collect it.</b> To deliver the course, let your teacher monitor and support your learning, give feedback, keep the course safe, and improve it. Use of your data for research is optional and needs your separate agreement (see Research use below).</p>
<p><b>Legal basis.</b> Your consent, and for learners below 18, the consent of a parent or guardian, under the Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and Regulations.</p>
<p><b>Where it is stored and who can see it.</b> In the course owner's personal Google account (Google Sheets and Google Drive), accessible only to the course owner and your teacher(s). Questions you send to the AI assistant are processed by Google's Gemini API, or by Anthropic's Claude API as a backup, to generate answers. We do not sell your data or share it with anyone else unless required by law.</p>
<p><b>How long we keep it.</b> Your account and learning data are kept until <b>two years after your last activity</b> in the course, then deleted. Uploaded files are deleted <b>one year after your last activity</b>. If you agree to research use, de-identified data (with no name, email, or school) may be kept for up to <b>five years after any publication</b>. You can ask for your data to be deleted earlier.</p>
<p><b>How we protect it.</b> Access is limited to authorized people, your uploaded files are kept in private folders, and only the data needed for the course is collected.</p>
<p><b>Your rights.</b> You have the right to be informed, to access, to object, to correct (rectification), to erasure or blocking, to data portability, and to damages, and the right to file a complaint with the National Privacy Commission. You may withdraw your consent at any time.</p>
<p><b>Contact.</b> For questions, requests about your data, or to withdraw consent, contact the Data Protection contact of this course at <a href="mailto:${COURSE_CONTACT}">${COURSE_CONTACT}</a>.</p>`;
const RESEARCH_SHORT = `<h3>Research use (optional)</h3><p>If you agree, your <b>de-identified</b> course data (activity, scores, and survey ratings, with your name, email, and school replaced by a code) may be used to improve the course and for possible research. Results are reported only as group summaries. Saying no does not affect your access, and you can change your choice any time on the Privacy page.</p>`;

/* ============ WELCOME, SIGN-UP, AND RETURNING USERS ============ */
const GRADES = Array.from({length:12}, (_, i) => "Grade " + (i + 1));
const INDUSTRIES = ["Education and training","Information technology","Engineering","Manufacturing","Electronics and semiconductors","Energy and utilities","Telecommunications","Agriculture and food","Healthcare","Government and public service","Finance and business","Research and academe","Other"];
function heroSVG(){
  return `<svg class="b2b-hero" viewBox="0 28 560 248" role="img" aria-label="Animated diagram: a sensor on a breadboard sends readings over Wi-Fi to a chart in a browser. Tap the sensor to send a reading.">
   <defs><pattern id="bbdots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="1.6" fill="#9BB2A8" opacity=".55"/></pattern>
    <linearGradient id="trail" x1="0" x2="1"><stop offset="0" stop-color="#E8B84A" stop-opacity="0"/><stop offset="1" stop-color="#E8B84A"/></linearGradient></defs>
   <rect x="14" y="70" width="220" height="150" rx="12" fill="#F3EFE4"/><rect x="14" y="70" width="220" height="150" rx="12" fill="url(#bbdots)"/>
   <rect x="14" y="140" width="220" height="10" fill="#E2DCCB"/><path d="M24 84 H224 M24 206 H224" stroke="#D62828" stroke-width="2" opacity=".55"/><path d="M24 92 H224 M24 214 H224" stroke="#2563EB" stroke-width="2" opacity=".55"/>
   <rect x="40" y="104" width="64" height="88" rx="6" fill="#17483B"/><text x="72" y="152" text-anchor="middle" font-size="11" fill="#E5EFEA" font-family="JetBrains Mono, monospace">MCU</text>
   <g id="heroSensor" class="hero-sensor" tabindex="0" role="button" aria-label="Send a reading"><rect x="150" y="108" width="44" height="34" rx="5" fill="#FFFFFF" stroke="#13241F" stroke-width="1.5"/><path d="M156 116 h32 M156 122 h32 M156 128 h32 M156 134 h32" stroke="#9BB2A8"/><text x="172" y="160" text-anchor="middle" font-size="10" fill="#13241F">sensor</text></g>
   <path d="M104 126 C125 126 130 125 150 125" stroke="#E8B84A" stroke-width="3" fill="none"/><circle cx="125" cy="186" r="7" fill="#C8653A" id="heroLed"/><text x="125" y="208" text-anchor="middle" font-size="9" fill="#53665D">LED</text>
   <g fill="none" stroke="#8FD1B8" stroke-width="2.4" stroke-linecap="round" class="wifi"><path d="M250 120 a26 26 0 0 1 0 40"/><path d="M262 108 a42 42 0 0 1 0 64"/><path d="M274 96 a58 58 0 0 1 0 88"/></g>
   <rect x="320" y="40" width="226" height="220" rx="12" fill="#FFFFFF" stroke="#D3DDD7"/><rect x="320" y="40" width="226" height="26" rx="12" fill="#E5EFEA"/><circle cx="336" cy="53" r="4" fill="#C8653A"/><circle cx="349" cy="53" r="4" fill="#E8B84A"/><circle cx="362" cy="53" r="4" fill="#1F8A70"/>
   <text x="378" y="57" font-size="10" fill="#53665D" font-family="JetBrains Mono, monospace">script.google.com/…/exec</text>
   <text x="336" y="90" font-size="12" font-weight="700" fill="#13241F">Classroom dashboard</text>
   <rect x="336" y="100" width="90" height="44" rx="8" fill="#E5EFEA"/><text x="344" y="116" font-size="9" fill="#53665D">temperature</text><text x="344" y="136" font-size="16" font-weight="700" fill="#17483B" id="heroTemp">29.4 °C</text>
   <rect x="436" y="100" width="94" height="44" rx="8" fill="#E5EFEA"/><text x="444" y="116" font-size="9" fill="#53665D">readings logged</text><text x="444" y="136" font-size="16" font-weight="700" fill="#17483B" id="heroCount">12</text>
   <polyline id="heroLine" fill="none" stroke="#1F8A70" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points=""/><line x1="336" y1="244" x2="530" y2="244" stroke="#D3DDD7"/>
   <circle id="heroPacket" r="6" fill="#E8B84A" cx="-20" cy="-20"/>
  </svg>`;
}
function startHero(){
  const svg = $(".b2b-hero"); if (!svg) return; let vals = [29.4, 29.5, 29.4, 29.6, 29.8, 29.7, 29.9, 30.1, 30.0, 30.2, 30.3, 30.2], count = 12, busy = false;
  const draw = () => { const lo = Math.min(...vals) - .3, hi = Math.max(...vals) + .3; $("#heroLine").setAttribute("points", vals.map((v, i) => `${340 + i * (186 / (vals.length - 1))},${236 - (v - lo) / (hi - lo) * 76}`).join(" ")); };
  const send = () => { if (busy || !alive(svg)) return; busy = true; const v = +(vals[vals.length - 1] + (Math.random() - .45) * .5).toFixed(1); const led = $("#heroLed"); led.setAttribute("fill", "#E8B84A");
    const pk = $("#heroPacket"), path = [[172,125],[250,140],[300,140],[372,180]], t0 = performance.now(), dur = reduceMotion() ? 1 : 900;
    const step = now => { if (!alive(svg)) return; const p = Math.max(0, Math.min(1, (now - t0) / dur)), seg = Math.min(path.length - 2, Math.floor(p * (path.length - 1))), lp = p * (path.length - 1) - seg, a = path[seg], b = path[seg + 1];
      pk.setAttribute("cx", a[0] + (b[0] - a[0]) * lp); pk.setAttribute("cy", a[1] + (b[1] - a[1]) * lp);
      if (p < 1 && alive(svg)) requestAnimationFrame(step); else { pk.setAttribute("cx", -20); led.setAttribute("fill", "#C8653A"); vals.push(v); vals.shift(); count++; $("#heroTemp").textContent = v.toFixed(1) + " °C"; $("#heroCount").textContent = count; draw(); busy = false; } };
    requestAnimationFrame(step); };
  draw(); const s = $("#heroSensor"); s.onclick = send; s.onkeydown = e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); send(); } };
  const auto = setInterval(() => { if (!alive(svg)) return clearInterval(auto); send(); }, 3200); setTimeout(send, 700);
}
function viewWelcome(mode){
  mode = mode || "new";
  const words = COURSE_TITLE.split(" ");
  const traces = ["M-20 120 H220 V60 H420","M-20 320 H160 V420 H520","M1500 90 H1180 V200 H960","M1500 380 H1260 V300 H1040","M300 700 V560 H640","M1100 700 V540 H880"];
  $("#view").innerHTML = `<section class="hero">
    <svg class="beams" viewBox="0 0 1440 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="beamGrad" x1="0" x2="1"><stop offset="0" stop-color="#1F8A70" stop-opacity="0"/><stop offset=".5" stop-color="#E8B84A"/><stop offset="1" stop-color="#C8653A" stop-opacity="0"/></linearGradient></defs>
     ${traces.map(d=>`<path d="${d}"/>`).join("")}${traces.map(d=>`<path class="pulse" d="${d}"/>`).join("")}</svg>
    <div class="hero-grid">
     <div><h1 aria-label="${COURSE_TITLE}">${words.map(w=>`<span class="w">${w}</span>`).join(" ")}</h1>
      <p class="lede">${COURSE_SUBTITLE}. Build with the Arduino UNO R4 WiFi, ESP8266, and ESP32: wire sensors and actuators, send data to the cloud on the track you choose, analyze it with Python, and publish a working web app on GitHub that supports a Sustainable Development Goal.</p>
      <div class="tickers">${[[3,"boards"],[12,"parts"],[5,"IoT tracks"],[Object.keys(MODULES).length,"modules"]].map(t=>`<div class="ticker"><b data-to="${t[0]}">0</b><span>${t[1]}</span></div>`).join("")}</div>
      <button class="btn shimmer" id="ctaStart">Start the course</button>
      <div class="board-chips">${["ESP32-S3-DevKitC-1","ESP8266 NodeMCU","Arduino Uno R4 WiFi"].map(b=>`<span class="board-chip">${b}</span>`).join("")}</div></div>
     <div class="hero-vis">${heroSVG()}<p class="hint">Tap the sensor to send a reading from the breadboard to the browser.</p></div></div>
   </section>
   <div class="reg-wrap">
    <div class="how"><h2 style="margin-top:.4em">How the course works</h2>
     ${[["Build","Learn electronics and Arduino code, then wire and program LEDs, a button, a buzzer, DHT11/22, TMP36, light, MQ gas, ultrasonic, PIR, a servo, and a DC motor."],["Connect","Choose one IoT track and finish it: Google Sheets + Apps Script + Colab, Firebase + Apps Script + Colab, AWS, Blynk, or ThingSpeak."],["Analyze","Clean, describe, and model your data in Python with Google Colab, following the Data Science 4 Everyone strands."],["Solve","Design a prototype for an SDG target, publish your web app with GitHub Pages, and present your evidence."]].map((s,i)=>`<div class="how-step"><i>${i+1}</i><div><b>${s[0]}</b><br><span class="explain">${s[1]}</span></div></div>`).join("")}
     <div class="note">No hardware yet? Every module has a virtual bench: a simulated Uno R4 WiFi, ESP8266, or ESP32 with all the sensors and actuators, plus simulated Google Sheets, Firebase, AWS, Blynk, and ThingSpeak servers.</div>
     <div class="note">Proto, the course's AI learning assistant, can explain concepts and give hints as you learn. It is an AI, not a person, and it can make mistakes.</div></div>
    <div class="card" id="regCard">
     <div class="seg" role="tablist" aria-label="Sign-up options">
      <button role="tab" id="tabNew" aria-selected="${mode==="new"}">I'm new here</button>
      <button role="tab" id="tabBack" aria-selected="${mode==="back"}">I've been here before</button></div>
     <div id="formArea"></div><p class="adm-link"><a href="#/admin">Teacher or course admin? Sign in to the dashboard</a></p></div></div>`;
  startHero();
  document.querySelectorAll(".ticker b").forEach((b,i) => setTimeout(() => tick(b, +b.dataset.to), 250 + i*120));
  A(document.querySelectorAll(".hero h1 .w"), {opacity:[0,1], y:[48,0], rotate:[4,0]}, {delay:stag(0.09), type:"spring", stiffness:260, damping:24});
  A(document.querySelectorAll(".hero .lede, .tickers, #ctaStart, .board-chips"), {opacity:[0,1], y:[16,0]}, {delay:stag(0.08, 0.35), duration:.6});
  A(".hero .hero-vis", {opacity:[0,1], scale:[.94,1], rotate:[-1.5,0]}, {delay:.25, type:"spring", stiffness:180, damping:22});
  reveal(document.querySelectorAll(".how-step, #regCard"));
  $("#ctaStart").onclick = () => { $("#regCard").scrollIntoView({behavior: reduceMotion() ? "auto" : "smooth", block:"start"}); A("#regCard", {scale:[1,1.02,1]}, {duration:.5, delay:.35}); };
  $("#tabNew").onclick = () => setTab("new"); $("#tabBack").onclick = () => setTab("back");
  function setTab(m){ $("#tabNew").setAttribute("aria-selected", m==="new"); $("#tabBack").setAttribute("aria-selected", m==="back"); m === "new" ? newForm() : backForm(); A("#formArea", {opacity:[0,1], y:[8,0]}, {duration:.3}); }
  setTab(mode);
}
function newForm(){
  $("#formArea").innerHTML = `<form id="reg" novalidate>
   <h2 style="margin:.2em 0 .1em">Create your learner profile</h2><p class="explain" style="margin-top:0">You only do this once. Next time, just enter your email.</p>
   <div class="row2"><div class="field"><label for="rLast">Last name</label><input id="rLast" autocomplete="family-name" required></div>
    <div class="field"><label for="rGiven">Given name</label><input id="rGiven" autocomplete="given-name" required></div></div>
   <div class="row2"><div class="field"><label for="rAge">Age</label><input id="rAge" type="number" inputmode="numeric" min="5" max="100" required></div>
    <div class="field"><label for="rEmail">Email / School email</label><input id="rEmail" type="email" autocomplete="email" inputmode="email" required></div></div>
   <fieldset class="field roleset"><legend>I am a</legend><div class="seg seg-sm">${["Student","Teacher","Professional"].map((r,i)=>`<label><input type="radio" name="role" value="${r}" ${i===0?"checked":""}><span>${r}</span></label>`).join("")}</div></fieldset>
   <div id="roleFields"></div>
   <div class="field"><label for="rBoard">The board I will use</label><select id="rBoard">${Object.values(BOARDS).map(b => `<option value="${b.key}" ${b.key === getBoard() ? "selected" : ""}>${esc(b.name)}</option>`).join("")}<option value="none">I don't have a board yet (I'll use the sandboxes)</option></select></div>
   <div class="privacy" tabindex="0" aria-label="Data Privacy Statement">${PRIVACY_HTML}${RESEARCH_SHORT}</div>
   <label class="consent"><input type="checkbox" id="rConsent"><span>I have read and agree to the Data Privacy Statement.</span></label>
   <label class="consent" id="guardianRow" hidden><input type="checkbox" id="rGuardian"><span>Because I am below 18, my parent or guardian has read the Data Privacy Statement and agrees to my participation.</span></label>
   <label class="consent"><input type="checkbox" id="rResearch"><span><b>Optional:</b> I agree that my de-identified course data may be used to improve the course and for research (see “Research use” above).</span></label>
   <p class="consent-note">Leaving this unticked does not affect your access to the course.</p>
   <label class="consent" id="rResearchGRow" hidden><input type="checkbox" id="rResearchG"><span>My parent or guardian also agrees to this research use.</span></label>
   <div class="err" id="rErr" role="alert"></div>
   <button class="btn primary big" type="submit" id="rGo">Create profile and start</button></form>`;
  const roleFields = () => {
    const role = document.querySelector('input[name="role"]:checked').value;
    $("#roleFields").innerHTML = role === "Student" ?
      `<div class="row2"><div class="field"><label for="rGrade">Grade level</label><select id="rGrade"><option value="">Choose your grade</option>${GRADES.concat(["College / University"]).map(g=>`<option>${g}</option>`).join("")}</select></div>
       <div class="field"><label for="rSchool">School</label><input id="rSchool" autocomplete="organization"></div></div>` :
      role === "Teacher" ?
      `<fieldset class="field"><legend>Grade levels I teach <span class="explain">(choose all that apply)</span></legend><div class="chips">${GRADES.concat(["University Instructor/Professor"]).map(g=>`<label class="chk"><input type="checkbox" name="tgrade" value="${g}"><span>${g}</span></label>`).join("")}</div></fieldset>
       <div class="field"><label for="rSchool">School or university</label><input id="rSchool" autocomplete="organization"></div>` :
      `<div class="row2"><div class="field"><label for="rIndustry">Industry</label><select id="rIndustry"><option value="">Choose your industry</option>${INDUSTRIES.map(g=>`<option>${g}</option>`).join("")}</select></div>
       <div class="field" id="otherWrap" hidden><label for="rOther">Your industry</label><input id="rOther"></div></div>`;
    const ind = $("#rIndustry"); if (ind) ind.onchange = () => { $("#otherWrap").hidden = ind.value !== "Other"; };
    A("#roleFields", {opacity:[0,1], y:[6,0]}, {duration:.25});
  };
  document.querySelectorAll('input[name="role"]').forEach(r => r.onchange = roleFields); roleFields();
  const resRow = () => { const a = +$("#rAge").value; $("#rResearchGRow").hidden = !(a && a < 18 && $("#rResearch").checked); };
  $("#rAge").oninput = () => { const a = +$("#rAge").value; $("#guardianRow").hidden = !(a && a < 18); resRow(); };
  $("#rResearch").onchange = resRow;
  $("#reg").onsubmit = async e => {
    e.preventDefault();
    const fail = msg => { $("#rErr").textContent = msg; A("#reg", {x:[0,-10,10,-6,6,0]}, {duration:.4}); };
    const last = $("#rLast").value.trim(), given = $("#rGiven").value.trim(), age = Math.round(+$("#rAge").value), email = $("#rEmail").value.trim().toLowerCase();
    const role = document.querySelector('input[name="role"]:checked').value;
    if (last.length < 2 || given.length < 1) return fail("Enter your last name and given name.");
    if (!(age >= 5 && age <= 100)) return fail("Enter your age as a number from 5 to 100.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address, like name@school.edu.ph.");
    let gradeLevels = [], school = "", industry = "";
    if (role === "Student"){ if (!$("#rGrade").value) return fail("Choose your grade level."); gradeLevels = [$("#rGrade").value]; school = $("#rSchool").value.trim(); }
    if (role === "Teacher"){ gradeLevels = [...document.querySelectorAll('input[name="tgrade"]:checked')].map(x => x.value); if (!gradeLevels.length) return fail("Choose at least one grade level you teach."); school = $("#rSchool").value.trim(); }
    if (role === "Professional"){ industry = $("#rIndustry").value === "Other" ? $("#rOther").value.trim() : $("#rIndustry").value; if (!industry) return fail("Choose or type your industry."); }
    if ((role !== "Professional") && !school) return fail("Enter your school.");
    if (!$("#rConsent").checked) return fail("Read the Data Privacy Statement and tick the box to agree.");
    if (age < 18 && !$("#rGuardian").checked) return fail("Learners below 18 need a parent or guardian to agree. Ask them to read the statement with you.");
    if (age < 18 && $("#rResearch").checked && !$("#rResearchG").checked) return fail("For research use, a parent or guardian must also agree. Tick their box, or untick the optional research box.");
    const board = $("#rBoard").value; if (BOARDS[board]) setBoard(board);
    const researchConsent = $("#rResearch").checked, researchGuardian = age < 18 ? $("#rResearchG").checked : false;
    const profile = {email, lastName:last, givenName:given, name:given + " " + last, age, role, gradeLevels, school, industry, board, privacyConsent:true, guardianConsent: age < 18, researchConsent, researchGuardian, device};
    $("#rGo").disabled = true; $("#rGo").textContent = "Creating your profile…";
    user = {email, givenName:given, lastName:last, name:profile.name, role, gradeLevels, minor: age < 18, aiAllowed: age >= CONFIG.AI_MIN_AGE, researchConsent: researchConsent && (age >= 18 || researchGuardian) ? "yes" : "no"};
    const r = await api("register", profile);
    if (r.ok === false && r.error === "exists"){
      user = null; $("#rGo").disabled = false; $("#rGo").textContent = "Create profile and start";
      toast("You already have a profile. Sign in with a code sent to your email."); backForm(email); $("#tabNew").setAttribute("aria-selected", false); $("#tabBack").setAttribute("aria-selected", true); return;
    }
    if (r.ok === false && !r.offline){
      user = null; $("#rGo").disabled = false; $("#rGo").textContent = "Create profile and start";
      if (r.error === "network" || r.error === "busy" || r.error === "rate_limited") return fail("We couldn't reach the course server just now. Check your connection and try again in a minute.");
      return fail(({invalid_email:"This email is not allowed for this course.", invalid_age:"Check your age.", guardian_consent_required:"A parent or guardian must agree for learners below 18.", consent_required:"Please agree to the Data Privacy Statement."})[r.error] || "We couldn't create your profile: " + r.error);
    }
    if (r.ok && r.admin) user.admin = true;
    if (r.ok && r.token) user.token = r.token;
    rememberUser(); prog = Object.assign(blankProg(), store.get(pkey(), {}));
    api("access", {device, userAgent:navigator.userAgent.slice(0,140), page:"register", board:getBoard()});
    toast(r.ok ? `Welcome, ${given}! Your profile is ready.` : "Saved on this device. We'll sync when you're online.");
    location.hash = "#/overview"; route();
  };
}
function backForm(prefill){
  if (!prefill){ try { prefill = sessionStorage.getItem("sss_prefill") || ""; sessionStorage.removeItem("sss_prefill"); } catch(e){} }
  const known = knownProfiles(), kn = !prefill && known.length;
  $("#formArea").innerHTML = `<form id="back" novalidate><h2 style="margin:.2em 0 .1em">Welcome back</h2>
   ${kn ? `<p class="explain" style="margin-top:0">This device remembers you. Tap your name to continue.</p>
   <div class="known">${known.slice(0, 5).map(p => `<div class="known-row"><button type="button" class="known-btn" data-email="${esc(p.email)}"><span class="known-av">${esc(String(p.givenName || p.name || p.email)[0].toUpperCase())}</span><span class="known-tx"><b>Continue as ${esc(p.givenName || p.name || "")}</b><span>${esc(p.email)}</span></span><span aria-hidden="true">→</span></button><button type="button" class="btn small known-x" data-forget="${esc(p.email)}" aria-label="Remove ${esc(p.email)} from this device" title="Remove from this device">✕</button></div>`).join("")}</div>
   <button type="button" class="linkbtn" id="bOther">Use a different email</button>` : `<p class="explain" style="margin-top:0">Enter the email you used when you signed up.${apiReady() ? " We'll email you a 6-digit code to confirm it's you." : ""}</p>`}
   <div class="field" id="bEmailWrap" ${kn ? "hidden" : ""}><label for="bEmail">Email / School email</label><input id="bEmail" type="email" autocomplete="email" inputmode="email" required value="${esc(prefill || "")}"></div>
   <div class="field" id="bCodeWrap" hidden><label for="bCode">6-digit code</label><input id="bCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" placeholder="123456">
    <p class="explain" id="bCodeNote"></p><button type="button" class="linkbtn" id="bResend">Send a new code</button></div>
   <div class="err" id="bErr" role="alert"></div><button class="btn primary big" type="submit" id="bGo" ${kn ? "hidden" : ""}>${apiReady() ? "Send me a code" : "Continue"}</button>
   ${kn ? `<p class="explain known-note">Shared computer or iPad? Tap ✕ to remove your name from this device when you finish.</p>` : ""}</form>`;
  let stage = "email";
  const btn = $("#bGo"), setBtn = (t, d) => { btn.textContent = t; btn.disabled = !!d; };
  const fail = msg => { $("#bErr").textContent = msg; $("#bEmailWrap").hidden = stage === "code"; btn.hidden = false; document.querySelectorAll(".known-btn").forEach(k => { k.disabled = false; const kb = k.querySelector("b"); if (kb && /Signing|Checking/.test(kb.textContent)) kb.textContent = "Try again"; }); A("#back", {x:[0,-10,10,-6,6,0]}, {duration:.4}); };
  const finish = (found, serverProg) => {
    const ts = found.tests; delete found.tests; user = found; rememberUser(); authLostShown = false; if (ts) mergeTests(ts); if (window.hideAuthBanner) hideAuthBanner();
    prog = Object.assign(blankProg(), store.get(pkey(), {}));
    if (serverProg){ ["done","quiz","rating","act"].forEach(k => prog[k] = Object.assign({}, serverProg[k] || {}, prog[k] || {})); saveProg(); }
    api("access", {device, userAgent:navigator.userAgent.slice(0,140), page:"return", board:getBoard()}).then(r => { if (r && r.ok && !!r.admin !== !!user.admin){ user.admin = !!r.admin; rememberUser(); renderMap(); } });
    flushQueue(); toast(`Welcome back, ${user.givenName || user.name}!`); location.hash = "#/home"; route(); };
  const fromServer = (email, r) => { const p = r.profile || {}, local = store.get("sss_profiles", {})[email] || {};
    if (p.board && BOARDS[p.board]) setBoard(p.board);
    return {email, givenName:p.givenName || local.givenName, lastName:p.lastName || local.lastName || "", name:p.givenName || local.name, role:p.role, gradeLevels:p.gradeLevels, minor:p.minor, aiAllowed:p.aiAllowed, researchConsent:p.researchConsent || "", admin:!!p.admin, token:r.token, tests:r.tests || null}; };
  const sendCode = async email => {
    setBtn("Sending your code…", true); $("#bErr").textContent = "";
    const r = await apiPublic("lookup", {email, device});
    if (r.ok && r.found && r.token) return finish(fromServer(email, r), r.progress);   // the course owner turned codes off
    if (r.ok && r.found && r.codeSent){ stage = "code"; $("#bEmailWrap").hidden = true; $("#bCodeWrap").hidden = false; const o = $("#bOther"); if (o) o.hidden = true; $(".known") && ($(".known").hidden = true);
      $("#bCodeNote").innerHTML = `We sent a code to <b>${esc(email)}</b>. It expires in 10 minutes. Check your spam folder if you don't see it.`; setBtn("Sign in"); btn.hidden = false; $("#bCode").focus(); return; }
    setBtn("Send me a code");
    if (r.ok && !r.found) return fail("We couldn't find that email. Check the spelling, or choose “I'm new here” to sign up.");
    fail({invalid_email:"Enter a valid email address.", rate_limited:"Too many tries. Wait a few minutes, then try again.", too_many_codes:"We already sent 3 codes in the last hour. Use the newest code, or wait 15 minutes.", email_quota:"The course can't send more email codes today. Please try again tomorrow, or ask your teacher.", email_not_allowed:"The course can't send sign-in emails yet. Please tell the course team. (Course owner: in Apps Script, run testEmail once, allow “Send email as you”, then deploy a new version.)", email_failed:"We couldn't send the code email just now. Please try again in a few minutes.", server_error:"Something went wrong on the course server. Please try again in a minute; if it keeps happening, tell the course team.", network:"We couldn't reach the course server. Check your connection and try again.", busy:"The course server is busy. Try again in a minute."}[r.error] || "Sign-in failed (" + (r.error || "unknown") + ").");
  };
  const checkCode = async email => {
    const code = $("#bCode").value.replace(/\D/g, ""); if (code.length !== 6) return fail("Enter the 6-digit code from the email.");
    setBtn("Checking…", true); const r = await apiPublic("verify", {email, code, device}); setBtn("Sign in");
    if (r.ok && r.token) return finish(fromServer(email, r), r.progress);
    fail(r.error === "bad_code" ? `That code is not right. ${r.triesLeft} ${r.triesLeft === 1 ? "try" : "tries"} left.` : r.error === "code_expired" ? "That code expired or was used too many times. Tap “Send a new code”." : "We couldn't check the code. Try again.");
  };
  const offlineSignIn = email => { const local = store.get("sss_profiles", {})[email]; if (!local) return fail("This device has no profile for that email. Choose “I'm new here” to sign up."); finish(local, null); };
  $("#back").onsubmit = async e => { e.preventDefault(); const email = $("#bEmail").value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address.");
    if (!apiReady()) return offlineSignIn(email);
    stage === "code" ? checkCode(email) : sendCode(email); };
  $("#bResend").onclick = () => { stage = "email"; $("#bCode").value = ""; sendCode($("#bEmail").value.trim().toLowerCase()); };
  if ($("#bOther")) $("#bOther").onclick = () => { $("#bEmailWrap").hidden = false; btn.hidden = false; $("#bOther").hidden = true; $("#bEmail").focus(); };
  document.querySelectorAll(".known-btn").forEach(b => b.onclick = () => { const email = b.dataset.email, p = store.get("sss_profiles", {})[email];
    $("#bEmail").value = email; b.disabled = true;
    if (!apiReady() || (p && p.token)) { b.querySelector("b").textContent = "Signing you in…"; return finish(p, null); }   // this device already has a session: no code needed
    b.querySelector("b").textContent = "Sending a code…"; sendCode(email); });
  document.querySelectorAll(".known-x").forEach(b => b.onclick = () => { const em = b.dataset.forget; if (!confirm("Remove " + em + " from this device? Your progress on the course server is kept.")) return;
    const p = store.get("sss_profiles", {})[em]; if (p && p.token && apiReady()) post({action:"logout", token:p.token}, 0);
    forgetProfile(em); store.del("sss_fb_" + em); backForm(); toast("Removed from this device."); });
  if (prefill && apiReady()) sendCode(prefill);
}
/* Banner shown when this device's session is no longer accepted (e.g. after the server update). */
window.showAuthBanner = email => { const b = $("#banner"); if (!b) return;
  b.innerHTML = `<div class="banner auth-banner">Please confirm your email so your progress keeps saving to the course server. <button class="btn small" id="authFix" type="button">Confirm with a code</button></div>`;
  $("#authFix").onclick = () => { const em = email; sendEvents(); store.del("sss_user"); user = null; aiHistory = []; prog = blankProg(); renderWho(); try { sessionStorage.setItem("sss_prefill", em); } catch(e){} if (location.hash === "#/back") route(); else location.hash = "#/back"; }; };
window.hideAuthBanner = () => { const b = $("#banner"); if (b && b.querySelector(".auth-banner")) b.innerHTML = ""; };
function rememberUser(){ user.lastUsed = Date.now(); store.set("sss_user", user); const all = store.get("sss_profiles", {}); all[user.email] = user; store.set("sss_profiles", all); }
const isAdmin = () => !!(user && user.admin);

/* ============ PROTO: AI LEARNING ASSISTANT ============ */
let aiOpen = false, aiHistory = [], aiBusy = false;
function mdLite(text){
  const blocks = String(text).split(/```/); let html = "";
  blocks.forEach((b, i) => {
    if (i % 2 === 1){ const c = b.replace(/^[a-zA-Z0-9+#-]*\n/, ""); html += `<pre class="code">${esc(c.replace(/\n$/,""))}</pre>`; return; }
    const lines = esc(b).split("\n"); let list = null;
    const flush = () => { if (list){ html += `</${list}>`; list = null; } };
    lines.forEach(l => {
      const inline = s => s.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
      let m;
      if ((m = l.match(/^\s*[-*]\s+(.*)/))){ if (list !== "ul"){ flush(); html += "<ul>"; list = "ul"; } html += `<li>${inline(m[1])}</li>`; }
      else if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))){ if (list !== "ol"){ flush(); html += "<ol>"; list = "ol"; } html += `<li>${inline(m[1])}</li>`; }
      else if (!l.trim()){ flush(); }
      else if ((m = l.match(/^#{1,4}\s+(.*)/))){ flush(); html += `<p><b>${inline(m[1])}</b></p>`; }
      else { flush(); html += `<p>${inline(l)}</p>`; }
    });
    flush();
  });
  return html;
}
function aiContext(){
  const mm = location.hash.match(/^#\/m\/([^?]+)/); const base = {board:BOARDS[getBoard()].name};
  if (!mm || !MODULES[mm[1]]) return base;
  const m = MODULES[mm[1]], sec = document.getElementById(currentSection) || document.querySelector(".section[id]");
  const body = sec ? (sec.querySelector(".sec-body") || sec) : null;
  return Object.assign(base, {moduleId:m.id, moduleTitle:m.title, objectives:m.objectives, sectionTitle: sec ? (sec.querySelector("h2") || {}).innerText || "" : "", sectionText: body ? body.innerText.slice(0, 3500) : ""});
}
function aiAdd(role, html, extra){
  const box = $("#aiMsgs"), d = document.createElement("div"); d.className = "msg " + role; d.innerHTML = html; if (extra) d.appendChild(extra); box.appendChild(d);
  A(d, {opacity:[0,1], y:[10,0]}, {duration:.3}); box.scrollTop = box.scrollHeight; return d;
}
function aiIntroHtml(){ return `<b>Hi${user ? ", " + esc(user.givenName || "") : ""}! I'm Proto, an AI learning assistant.</b> I'm an AI, not a person, and I can make mistakes.
  <ul><li>Try the problem first, then ask me for a hint.</li><li>Use PARTS to ask clearly, and check my answers against the module, your teacher, or official documentation.</li><li>Never share personal details, passwords, Wi-Fi passwords, or API keys with me.</li><li>Record important help in your <a href="#/ailog">AI-use log</a>.</li></ul>Your questions and my answers are saved for your teacher to review.`; }
function openAI(prefill){
  if (!user) return; aiOpen = true; const p = $("#ai"); p.hidden = false; document.body.classList.toggle("ai-docked", device === "desktop");
  A(p, device === "phone" ? {y:["100%","0%"]} : {opacity:[0,1], x:[30,0]}, SPRING);
  const box = $("#aiMsgs");
  if (!box.childElementCount){
    if (!user.aiAllowed) aiAdd("sys", `Proto is available to learners aged ${CONFIG.AI_MIN_AGE} and above (with parent or guardian consent if below 18). Your teacher is ready to help you with your questions.`);
    else if (!apiReady()) aiAdd("sys", "Proto needs the course server to answer questions, and this copy of the app is in preview mode. You can still copy any prompt you build here and paste it into an AI tool your teacher approves (for example Gemini).");
    else aiAdd("bot", aiIntroHtml());
  }
  if (prefill){ $("#aiInput").value = prefill; }
  renderChips(); setTimeout(() => { const t = $("#aiInput"); if (t && device !== "phone") t.focus(); }, 200);
}
function closeAI(){ aiOpen = false; const p = $("#ai"); document.body.classList.remove("ai-docked"); const a = A(p, device === "phone" ? {y:["0%","100%"]} : {opacity:[1,0], x:[0,30]}, {duration:.22}); setTimeout(() => p.hidden = true, a ? 230 : 0); }
function renderChips(){
  const inModule = /^#\/m\//.test(location.hash);
  const chips = inModule ? ["Explain this section simply","Give me a hint, not the answer","Quiz me on this section","What are common wiring mistakes here?"] : ["Which board should I use?","How do I install the ESP32 board package?","What is Google Apps Script?"];
  $("#aiChips").innerHTML = chips.map(c => `<button class="chip" type="button">${c}</button>`).join("");
  $("#aiChips").querySelectorAll(".chip").forEach(b => b.onclick = () => askAI(b.textContent));
}
async function askAI(q){
  q = String(q || "").trim(); if (!q || aiBusy) return;
  if (!user.aiAllowed || !apiReady()) return openAI();
  if (/(password|passcode|api[_ ]?key|secret)\s*[:=]\s*\S{4,}/i.test(q) && !confirm("Your message looks like it contains a password or key. Proto should never see secrets. Send anyway?")) return;
  aiBusy = true; $("#aiSend").disabled = true; $("#aiInput").value = "";
  aiAdd("user", esc(q)); const typing = aiAdd("bot typing", `<span class="dots"><i></i><i></i><i></i></span>`);
  const r = await api("ask", {question:q, history:aiHistory.slice(-8), context:aiContext()}, false);
  typing.remove(); aiBusy = false; $("#aiSend").disabled = false;
  if (r.ok){
    aiHistory.push({role:"user", content:q}, {role:"assistant", content:r.answer});
    const rep = document.createElement("div"); rep.className = "msg-tools";
    rep.innerHTML = `<button type="button" class="linkbtn rlog">Add to my AI-use log</button><button type="button" class="linkbtn rrep">Report this answer</button>${r.remaining != null ? `<span>${r.remaining} question${r.remaining === 1 ? "" : "s"} left today</span>` : ""}`;
    rep.querySelector(".rrep").onclick = () => reportAI(q, r.answer, rep);
    rep.querySelector(".rlog").onclick = () => { aiLogAdd({tool:"Proto (course assistant)", task:q.slice(0, 200), prompt:q, framework:/persona|recipient/i.test(q) ? "PARTS" : "", module:currentModule}); toast("Added to your AI-use log. Add how you verified it there."); };
    aiAdd("bot", mdLite(r.answer), rep);
  } else {
    aiAdd("sys", ({ai_disabled:"Proto is not switched on yet. Ask your teacher.", ai_age_restricted:`Proto is available to learners aged ${CONFIG.AI_MIN_AGE} and above.`, guardian_consent_required:"Proto needs parent or guardian consent for learners below 18.", ai_daily_limit:"You've reached today's question limit. Try again tomorrow, or ask your teacher.", not_registered:"Your profile isn't on the course server yet. Sign out and sign in again.", network:"I couldn't reach the course server. Check your connection."})[r.error] || "Sorry, I couldn't answer that right now (" + esc(r.error || "unknown error") + ").");
  }
}
function reportAI(q, a, el){
  el.innerHTML = `<span>Why?</span>${["Wrong or misleading","Inappropriate","Not helpful","Other"].map(x => `<button type="button" class="chip small">${x}</button>`).join("")}`;
  el.querySelectorAll(".chip").forEach(b => b.onclick = () => { api("report", {moduleId:currentModule, reason:b.textContent, question:q, answer:a}, false); el.innerHTML = "<span>Thanks. Your teacher will review this answer.</span>"; });
}
/* send a prompt built in an activity to Proto (or copy it if offline) */
function sendToProto(prompt){ if (apiReady() && user.aiAllowed){ openAI(); askAI(prompt); } else { copyText(prompt); openAI(); } }

/* ============ AI-USE LOG ============ */
const aiLogKey = () => "sss_ailog_" + (user ? user.email : "guest");
function aiLogAdd(entry){ const L = store.get(aiLogKey(), []); const e = Object.assign({id:Date.now().toString(36), date:new Date().toISOString().slice(0, 10), module:currentModule || "", tool:"", framework:"", task:"", prompt:"", verify:"", decision:"", disclose:""}, entry); L.push(e); store.set(aiLogKey(), L); api("ailog", {entry:e}); return e; }
function viewAiLog(){
  const L = store.get(aiLogKey(), []);
  const row = (e, i) => `<div class="al-card" data-i="${i}"><div class="al-top"><b>${esc(e.date)}</b> • ${e.module ? "Module " + esc(e.module) : "General"} • ${esc(e.tool || "AI tool")} <span class="mc-tag">${esc(e.framework || "no framework")}</span> <span class="mc-tag ${e.decision === "Rejected" ? "bad" : e.decision === "Corrected" ? "warn" : ""}">${esc(e.decision || "decision?")}</span></div>
    <div class="al-grid"><label>What I asked AI to help with<textarea class="dinput" data-f="task" rows="2">${esc(e.task)}</textarea></label><label>My prompt (or a summary)<textarea class="dinput" data-f="prompt" rows="2">${esc(e.prompt)}</textarea></label>
     <label>How I verified it (test, datasheet, docs, teacher)<textarea class="dinput" data-f="verify" rows="2">${esc(e.verify)}</textarea></label><label>Disclosure: how I used AI in my work<textarea class="dinput" data-f="disclose" rows="2">${esc(e.disclose)}</textarea></label></div>
    <div class="controls"><select class="dinput" data-f="framework">${["","PARTS","PARTS + CoT","PARTS + ToT","CoT","ToT","Other"].map(x => `<option ${x === e.framework ? "selected" : ""} value="${x}">${x || "Framework…"}</option>`).join("")}</select><select class="dinput" data-f="decision">${["","Accepted","Corrected","Rejected"].map(x => `<option ${x === e.decision ? "selected" : ""} value="${x}">${x || "My decision…"}</option>`).join("")}</select><input class="dinput" data-f="tool" placeholder="AI tool used" value="${esc(e.tool)}"><button class="btn small alDel" type="button">Delete</button></div></div>`;
  $("#view").innerHTML = `<p class="crumb">My AI-use log</p><h1>My AI-use log</h1>
   <p>Every time AI helps you with this course (Proto, Gemini, or any other tool), add one entry. A good entry shows <b>human agency</b>: you tried first, you prompted with a framework, you <b>checked</b> the answer, and <b>you</b> made the final decision. This log is evidence for the capstone rubric.</p>
   <div class="controls"><button class="btn primary" id="alNew">Add an entry</button><button class="btn" id="alCsv">Download as .csv</button></div>
   <div id="alList">${L.length ? L.map(row).reverse().join("") : `<p class="explain">No entries yet. Add an entry the first time you ask an AI tool for help.</p>`}</div>`;
  const save = () => { store.set(aiLogKey(), L); };
  $$("#alList .al-card").forEach(c => { const i = +c.dataset.i;
    c.querySelectorAll("[data-f]").forEach(f => f.onchange = f.oninput = () => { L[i][f.dataset.f] = f.value; save(); clearTimeout(c.t); c.t = setTimeout(() => api("ailog", {entry:L[i]}), 1500); });
    c.querySelector(".alDel").onclick = () => { if (confirm("Delete this entry?")){ L.splice(i, 1); save(); viewAiLog(); } }; });
  $("#alNew").onclick = () => { aiLogAdd({}); viewAiLog(); };
  $("#alCsv").onclick = () => { const H = ["date","module","tool","framework","task","prompt","verify","decision","disclose"]; downloadText("ai_use_log.csv", [H.join(",")].concat(L.map(e => H.map(h => csvCell(e[h])).join(","))).join("\n"), "text/csv"); };
}

/* ============ OTHER PAGES ============ */
function viewOverview(){
  $("#view").innerHTML = `<div class="ov-hero"><p class="crumb">Course overview</p><h1>${esc(COURSE_TITLE)}</h1><p class="lede-mod">${esc(COURSE_SUBTITLE)}</p></div>
   <h2>What you will be able to do</h2>
   <p>By the end of the course, you will plan, build, and present a working <b>IoT prototype aligned to an SDG</b>: a microcontroller with sensors and actuators that sends readings over Wi-Fi to the cloud <b>track you choose</b>, a <b>data science</b> notebook in Colab that turns the readings into evidence, and a <b>web app</b> on <b>GitHub Pages</b> that shows the result to the people who need it.</p>
   ${fig(`<svg viewBox="0 0 720 150" class="pipeline" role="img" aria-label="The system you will build: sensor, microcontroller, Wi-Fi, Apps Script, Google Sheet, dashboard">${[["Sensor","measures","#1F8A70"],["Board","reads & sends","#17483B"],["Wi-Fi","HTTPS / MQTT","#53665D"],["Cloud track","A–E stores","#C8653A"],["Colab","analyzes","#1F8A70"],["Web app","GitHub Pages","#E8B84A"]].map((b,i)=>`<g class="pl-step" style="--d:${i}"><rect x="${6+i*119}" y="40" width="104" height="62" rx="12" fill="${b[2]}"/><text x="${58+i*119}" y="68" text-anchor="middle" fill="#fff" font-weight="700" font-size="13">${b[0]}</text><text x="${58+i*119}" y="88" text-anchor="middle" fill="#fff" font-size="11">${b[1]}</text>${i<5?`<path d="M${111+i*119} 71 h12" stroke="var(--muted)" stroke-width="2.5" marker-end="url(#ovArr)"/>`:""}</g>`).join("")}<defs><marker id="ovArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="var(--muted)"/></marker></defs></svg>`, "The end-to-end system you will build.")}
   <h2>Who it is for</h2><p>Students, teachers, and professionals who are <b>new</b> to electronics, programming, and web development. Everything is explained from the beginning, with guided examples and virtual sandboxes. If you already know some of it, use the quizzes to check yourself and skip ahead.</p>
   <h2>The five units</h2><div class="ov-units">${COURSE.map((u, i) => `<div class="ov-unit" style="--c:${["#1F8A70","#C8653A","#17483B","#B08A1E","#7C3AED"][i]}"><b>${esc(u.title)}</b><p class="explain">${esc(u.blurb)}</p><ul>${u.modules.map(m => `<li><a href="#/m/${m.id}">${esc(m.id)} ${esc(m.title)}</a> <span class="explain">(about ${m.minutes} min)</span></li>`).join("")}</ul></div>`).join("")}</div>
   <h2>What you need</h2><table class="t"><tr><th>Item</th><th>Notes</th></tr>
    <tr><td>One board</td><td>ESP32-S3-DevKitC-1, ESP8266 NodeMCU, or Arduino Uno R4 WiFi, with a data-capable USB cable</td></tr>
    <tr><td>Breadboard kit</td><td>Full-size breadboard, jumper wires, LEDs, an RGB LED, a pushbutton, a piezo buzzer, and resistors (220 Ω, 330 Ω, 1 kΩ, 2 kΩ, 10 kΩ)</td></tr>
    <tr><td>Sensors and actuators (any)</td><td>DHT11 and/or DHT22, TMP36, photoresistor (LDR), MQ-2 / MQ-135 (or another MQ), HC-SR04, PIR (HC-SR501), a micro servo (SG90), and a small DC motor with an L298N or L9110S driver</td></tr>
    <tr><td>Computer</td><td>Arduino IDE 2 installed; a Google account (Sheets, Apps Script, Colab) and a free GitHub account; the track you choose may need Firebase, AWS, Blynk, or ThingSpeak accounts. An iPad or phone works for reading, sandboxes, and dashboards.</td></tr>
    <tr><td>No hardware?</td><td>Use the virtual bench: every part and every cloud track has a simulated version.</td></tr></table>
   <h2>How AI is used in this course</h2><p>AI is allowed, and taught, as a <b>partner you direct and check</b>, following UNESCO's AI competency frameworks. You will learn to prompt with <b>PARTS</b>, ask for <b>Chain-of-Thought</b> and <b>Tree-of-Thought</b> reasoning, verify every claim against datasheets and documentation, and keep an <b>AI-use log</b>. Use the AI-use log page to record each time you ask for help.</p>
   <h2>Pace and progress</h2><p>The course is <b>self-paced</b>. Each module shows an estimated time, a quiz, a self-rating, and a checkpoint task with an upload. The whole course takes about ${Math.round(Object.values(MODULES).reduce((s, m) => s + m.minutes, 0) / 60)} hours of focused work.</p>
   <div class="controls"><a class="btn primary" href="#/m/1.1">Start Module 1.1</a><a class="btn" href="#/home">Go to course home</a></div>`;
  reveal($$("#view h2, .ov-unit"));
}
function viewReferences(){
  const all = Object.entries(REF).sort((a, b) => a[1][0].localeCompare(b[1][0]));
  $("#view").innerHTML = `<p class="crumb">References</p><h1>References (APA 7th edition)</h1><p>Every source cited in the course, in alphabetical order. Each module also lists its own references at the end.</p>
   <div class="field"><input class="dinput" id="refQ" placeholder="Filter references…" aria-label="Filter references"></div><ul class="refs" id="refList">${all.map(([k, r]) => `<li data-k="${k}">${esc(r[0])}${r[1] ? ` <a href="${r[1]}" target="_blank" rel="noopener">${esc(r[1])}</a>` : ""}</li>`).join("")}</ul>
   <h2>How to cite this course</h2><pre class="code">Bana, M. C. (2026). ${COURSE_TITLE}: ${COURSE_SUBTITLE} [Online course]. ${esc(location.origin + location.pathname)}</pre>`;
  $("#refQ").oninput = e => { const q = e.target.value.toLowerCase(); $$("#refList li").forEach(li => li.hidden = q && !li.textContent.toLowerCase().includes(q)); };
}
function viewGlossary(){
  const q0 = decodeURIComponent((location.hash.split("?q=")[1] || ""));
  $("#view").innerHTML = `<p class="crumb">Glossary</p><h1>Glossary</h1><div class="field"><input class="dinput" id="glQ" placeholder="Search terms…" value="${esc(q0)}" aria-label="Search glossary"></div>
   <dl class="gloss" id="glList">${GLOSSARY.slice().sort((a, b) => a[0].localeCompare(b[0])).map(g => `<div><dt>${esc(g[0])}</dt><dd>${esc(g[1])}</dd></div>`).join("")}</dl>`;
  const f = () => { const q = $("#glQ").value.toLowerCase(); $$("#glList > div").forEach(d => d.hidden = q && !d.textContent.toLowerCase().includes(q)); }; $("#glQ").oninput = f; f();
}
function viewPrivacy(){
  $("#view").innerHTML = `<div class="privacy-page"><p class="crumb">Privacy</p>${PRIVACY_HTML}${RESEARCH_SHORT}
   <p>Your current research choice: <b>${user.researchConsent === "yes" ? "Yes, I agree" : "No"}</b>.</p>
   <div class="controls"><button class="btn" id="rcYes">I agree to research use</button><button class="btn" id="rcNo">I do not agree</button></div></div>`;
  const set = v => { user.researchConsent = v; rememberUser(); api("consent", {researchConsent:v}); toast("Your choice is saved."); viewPrivacy(); };
  $("#rcYes").onclick = () => { if (user.minor && !confirm("Learners below 18 need a parent or guardian to agree too. Has your parent or guardian agreed?")) return; set("yes"); };
  $("#rcNo").onclick = () => set("no");
}
function viewLab(){
  $("#view").innerHTML = `<p class="crumb">Sandbox lab</p><h1>Sandbox lab</h1><p>All the virtual activities in one place. Work here without hardware, or practice before you wire. Your passes count toward your progress.</p>
   ${LAB_INDEX.map(g => `<h2>${esc(g[0])}</h2><div class="bento">${g[1].map(x => `<a class="spot span3 lab-card" href="${x[2]}"><span class="num">${esc(x[3] || "")}</span><h3>${esc(x[0])}</h3><span class="lbl">${esc(x[1])}</span>${act(x[4]) ? `<span class="mc-tag">${act(x[4]) === "pass" ? "Passed" : "Done"}</span>` : ""}</a>`).join("")}</div>`).join("")}`;
  spotify($("#view")); A(document.querySelectorAll(".lab-card"), {opacity:[0,1], y:[16,0]}, {delay:stag(0.03), duration:.4});
}

/* ============ TEACHER DASHBOARD (admin): its own sign-in, inside the app ============ */
const adminSess = () => { try { const x = JSON.parse(sessionStorage.getItem("sss_admin") || "null"); return x && x.exp > Date.now() ? x : null; } catch(e){ return null; } };
const setAdminSess = x => { try { x ? sessionStorage.setItem("sss_admin", JSON.stringify(x)) : sessionStorage.removeItem("sss_admin"); } catch(e){} };
function viewAdminLogin(msg){
  const guest = !user;
  $("#view").innerHTML = `<section class="adm-login"><div class="card adm-card">
    <div class="adm-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></div>
    <h1>Teacher and admin sign-in</h1>
    <p class="explain">This is separate from the learner sign-in. Use an email listed as an admin for this course, and the dashboard PIN set by the course owner. You stay signed in for up to 6 hours in this browser tab.</p>
    ${apiReady() ? "" : `<div class="note warm"><b>Preview mode.</b> The course server is not connected yet, so sign-in will not work. Add your Apps Script URL to CONFIG.API_URL (see backend/README.md).</div>`}
    <form id="admForm" novalidate>
     <div class="field"><label for="admEmail">Admin email</label><input id="admEmail" type="email" autocomplete="username" inputmode="email" value="${esc((user && user.email) || "")}" required></div>
     <div class="field"><label for="admPin">Dashboard PIN</label><div class="adm-pinrow"><input id="admPin" type="password" autocomplete="current-password" required><button class="btn small" type="button" id="admShow" aria-pressed="false">Show</button></div></div>
     <div class="err" id="admErr" role="alert">${msg ? esc(msg) : ""}</div>
     <button class="btn primary big" type="submit" id="admGo">Sign in to the dashboard</button>
    </form>
    <p class="explain adm-back"><a href="${guest ? "#/" : "#/home"}">← Back to the course</a></p></div></section>`;
  $("#admShow").onclick = e => { const i = $("#admPin"), show = i.type === "password"; i.type = show ? "text" : "password"; e.target.textContent = show ? "Hide" : "Show"; e.target.setAttribute("aria-pressed", show); };
  $("#admForm").onsubmit = async e => { e.preventDefault(); const email = $("#admEmail").value.trim().toLowerCase(), pin = $("#admPin").value;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ $("#admErr").textContent = "Enter a valid email."; return; }
    if (!pin){ $("#admErr").textContent = "Enter the PIN."; return; }
    if (!apiReady()){ $("#admErr").textContent = "The course server is not connected (preview mode)."; return; }
    const btn = $("#admGo"); btn.disabled = true; btn.textContent = "Signing in…";
    const r = await apiPublic("adminLogin", {email, pin}); btn.disabled = false; btn.textContent = "Sign in to the dashboard";
    if (r.ok){ setAdminSess({email:r.email, name:r.name || "", token:r.token, exp:Date.now() + (r.hours || 6) * 3600e3}); $("#admPin").value = ""; if (user && user.email === r.email) user.admin = true; viewAdmin(); return; }
    $("#admErr").textContent = {bad_login:"That email and PIN do not match an admin account.", locked:"Too many wrong tries. Wait 15 minutes, then try again.", no_pin_set:"No ADMIN_PIN is set in Script Properties yet.", invalid_email:"Enter a valid email.", unknown_action:"The course server is an older version. Deploy the new Code.gs as a new version (backend/README.md).", network:"Could not reach the course server. Check your internet connection."}[r.error] || "Sign-in failed (" + (r.error || "unknown error") + ")."; };
  A(".adm-card", {opacity:[0,1], y:[12,0]}, {duration:.35});
}
async function viewAdmin(){
  const S = adminSess(); if (!S) return viewAdminLogin();
  $("#view").innerHTML = `<p class="crumb">Teacher dashboard</p><div class="adm-head"><h1>Teacher dashboard</h1><div class="adm-who"><span>Signed in as admin: <b>${esc(S.name || S.email)}</b></span><button class="btn small" id="admOut" type="button">Sign out</button></div></div><div id="admBody"><p class="explain">Loading…</p></div>`;
  $("#admOut").onclick = async () => { apiPublic("adminLogout", {token:S.token}); setAdminSess(null); toast("Signed out of the teacher dashboard."); user ? (location.hash = "#/home") : viewAdminLogin(); };
  const r = await apiPublic("adminData", {token:S.token});
  if (!r.ok){ if (r.error === "expired" || r.error === "bad_pin"){ setAdminSess(null); return viewAdminLogin("Your admin session ended. Please sign in again."); }
    $("#admBody").innerHTML = `<p class="err">${esc(r.error === "network" ? "Could not reach the course server." : r.error || "Could not load data.")}</p><button class="btn" onclick="viewAdmin()">Try again</button>`; return; }
  const L = r.learners || [];
  const mods = Object.keys(MODULES);
  $("#admBody").innerHTML = `<div class="bento"><div class="spot span3"><div class="big">${L.length}</div><div class="lbl">learners</div></div><div class="spot span3"><div class="big">${(L.reduce((s, l) => s + (+l.minutes || 0), 0) / 60).toFixed(1)} h</div><div class="lbl">total active time</div></div><div class="spot span3"><div class="big">${r.aiCount || 0}</div><div class="lbl">questions to Proto</div></div><div class="spot span3"><div class="big">${r.uploadCount || 0}</div><div class="lbl">uploaded files</div></div></div>
   <div class="controls"><input class="dinput" id="admQ" placeholder="Filter by name, school, role…"><button class="btn" id="admCsv">Download .csv</button></div>
   <div class="adm-tablewrap"><table class="t" id="admT"><tr><th>Learner</th><th>Role</th><th>School / industry</th><th>Board</th><th>Active time</th><th>Modules done</th><th>Badges</th><th>Last seen</th><th>Folder</th></tr>
   ${L.map(l => `<tr><td>${esc(l.name)}<br><span class="explain">${esc(l.email)}</span></td><td>${esc(l.role)} ${esc(l.grades || "")}</td><td>${esc(l.school || l.industry || "")}</td><td>${esc((BOARDS[l.board] || {}).short || l.board || "")}</td><td>${(+l.minutes / 60 || 0).toFixed(1)} h</td><td>${esc(String(l.modulesDone || 0))} / ${mods.length}</td><td>${esc(String(l.badges || 0))} / ${BADGES.length}</td><td>${esc(l.lastSeen || "")}</td><td>${l.folderUrl ? `<a href="${l.folderUrl}" target="_blank" rel="noopener">Open</a>` : ""}</td></tr>`).join("")}</table></div><div class="note pres-tip"><b>Teaching this in class?</b> Open any module and press <b>▶ Present to class</b>. Each section becomes a slide with its live animations and sandboxes; quiz questions become “check for understanding” slides with a reveal button. Press <b>P</b> (or “Presenter view”) to open a second window with teaching notes, the next slide, your own notes, and activity timers: put that window on your laptop screen and the slides on the projector.</div>${adminAssessHTML(r)}${adminFeedbackHTML(r.feedback)}${adminHealthHTML(r)}`;
  wireAdminAssess(r);
  wireAdminFeedback(r.feedback);
  $("#admQ").oninput = e => { const q = e.target.value.toLowerCase(); $$("#admT tr").forEach((tr, i) => { if (i) tr.hidden = q && !tr.textContent.toLowerCase().includes(q); }); };
  $("#admCsv").onclick = () => { const H = ["name","email","role","grades","school","industry","board","minutes","modulesDone","badges","lastSeen"]; downloadText("learners.csv", [H.join(",")].concat(L.map(l => H.map(h => csvCell(l[h])).join(","))).join("\n"), "text/csv"); };
}

/* ============ ROUTER, NAV, AND SETTINGS ============ */
function route(){
  applyDevice();
  $("#map").classList.remove("open"); if ("speechSynthesis" in window) speechSynthesis.cancel(); sendEvents();
  const guest = !user, h0 = location.hash.split("?")[0];
  $("#map").style.display = guest ? "none" : ""; $(".shell").classList.toggle("noside", guest); document.body.classList.toggle("guest", guest);
  $("#searchBtn").style.display = guest ? "none" : ""; $("#aiFab").hidden = guest; $("#bottomNav").hidden = guest;
  if (typeof PRES !== "undefined" && PRES && h0 !== "#/m/" + PRES.m.id) stopPresenting();
  if (h0 === "#/presenter" && (user || adminSess())){ if (aiOpen) closeAI(); viewPresenter(); return; }
  if (guest && h0 === "#/admin"){ if (aiOpen) closeAI(); viewAdmin(); return; }
  if (guest && h0.startsWith("#/verify/")){ if (aiOpen) closeAI(); viewVerify(decodeURIComponent(h0.slice(9))); return; }
  if (guest){ if (aiOpen) closeAI(); viewWelcome(location.hash === "#/back" || (location.hash !== "#/new" && knownProfiles().length) ? "back" : "new"); return; }
  renderWho(); currentModule = "";
  const h = location.hash, mm = h.match(/^#\/m\/([^?]+)(?:\?s=(.+))?/), page = h.split("?")[0];
  if (mm){ pendingAnchor = mm[2] || null; viewModule(mm[1]); }
  else if (page.startsWith("#/verify/")) viewVerify(decodeURIComponent(page.slice(9)));
  else ({"#/progress":viewProgress, "#/overview":viewOverview, "#/references":viewReferences, "#/glossary":viewGlossary, "#/privacy":viewPrivacy, "#/ailog":viewAiLog, "#/lab":viewLab, "#/admin":viewAdmin, "#/feedback":viewFeedback, "#/pretest":() => viewTest("pre"), "#/posttest":() => viewTest("post"), "#/certificate":viewCertificate, "#/badges":viewBadges}[page] || viewHome)();
  renderMap(); if (aiOpen) renderChips();
  document.querySelectorAll("#bottomNav [data-nav]").forEach(b => b.classList.toggle("on", (b.dataset.nav === "home" && !mm && page !== "#/progress") || (b.dataset.nav === "progress" && page === "#/progress") || (b.dataset.nav === "modules" && !!mm)));
  if (!mm || !mm[2]) { scrollTo({top:0}); A("#view", {opacity:[0,1], y:[10,0]}, {duration:.35, ease:[.22,1,.36,1]}); }
}
let lastRouteKey = "";
addEventListener("hashchange", () => { const key = location.hash.split("?")[0]; const m = location.hash.match(/^#\/m\/([^?]+)\?s=(.+)/);
  if (key === lastRouteKey && m){ const t = document.getElementById("s-" + m[2]); if (t){ t.scrollIntoView({behavior:"smooth"}); return; } }
  lastRouteKey = key; route(); });
function applySettings(){
  const th = store.get("sss_theme","auto"); if (th==="auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.dataset.theme = th;
  document.documentElement.style.setProperty("--fs", (1.0625*Number(store.get("sss_size",1)))+"rem");
  document.documentElement.dataset.motion = store.get("sss_motion","full");
  $("#setTheme").value = th; $("#setSize").value = String(store.get("sss_size",1)); $("#setMotion").value = store.get("sss_motion","full"); $("#setVoice").value = String(store.get("sss_voice",1)); $("#setBoard").value = getBoard();
}
$("#settingsBtn").onclick = () => { $("#settings").showModal(); A("#settings", {opacity:[0,1], scale:[.97,1]}, SPRING); };
$("#searchBtn").onclick = openPalette;
$("#closeSettings").onclick = () => $("#settings").close();
$("#setTheme").onchange = e => { store.set("sss_theme", e.target.value); applySettings(); };
$("#setSize").onchange = e => { store.set("sss_size", +e.target.value); applySettings(); };
$("#setMotion").onchange = e => { store.set("sss_motion", e.target.value); applySettings(); };
$("#setVoice").onchange = e => store.set("sss_voice", +e.target.value);
$("#setBoard").onchange = e => { setBoard(e.target.value); renderWho(); api("board", {board:e.target.value}); };
$("#switchUser").onclick = () => { sendEvents(); store.del("sss_user"); user = null; aiHistory = []; $("#aiMsgs").innerHTML = ""; prog = blankProg(); $("#settings").close(); renderWho(); location.hash = "#/back"; route(); };
$("#menuBtn").onclick = () => $("#map").classList.toggle("open");
$("#aiFab").onclick = () => aiOpen ? closeAI() : openAI();
$("#aiClose").onclick = closeAI;
$("#aiForm").onsubmit = e => { e.preventDefault(); askAI($("#aiInput").value); };
$("#aiInput").onkeydown = e => { if (e.key === "Enter" && !e.shiftKey && device !== "phone"){ e.preventDefault(); askAI($("#aiInput").value); } };
document.querySelectorAll("#bottomNav [data-nav]").forEach(b => b.onclick = () => {
  const n = b.dataset.nav;
  if (n === "home") location.hash = "#/home"; else if (n === "progress") location.hash = "#/progress";
  else if (n === "modules") $("#map").classList.toggle("open"); else if (n === "search") openPalette(); else if (n === "ask") aiOpen ? closeAI() : openAI();
});
window.onBoardChange = () => { renderWho(); };

/* ============ START ============ */
applySettings(); applyDevice();
if (!apiReady()) $("#banner").innerHTML = `<div class="banner">Preview mode: progress is saved on this device only. Uploads and Proto need the course server.</div>`;
if (user){ api("access", {device, userAgent:navigator.userAgent.slice(0,140), page:"open", board:getBoard()}).then(r => { if (r && r.ok && r.tests) mergeTests(r.tests); if (r && r.ok && user && !!r.admin !== !!user.admin){ user.admin = !!r.admin; rememberUser(); route(); } else if (r && r.ok && r.tests) renderMap(); }); flushQueue(); }
lastRouteKey = location.hash.split("?")[0];
route();
