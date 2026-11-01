/* ============ PRE-TEST, POST-TEST, AND CERTIFICATE ============ */
const CERT_PASS_DEFAULT = 70, POST_ATTEMPTS_DEFAULT = 3;
const tkey = () => "sss_tests_" + (user ? user.email : "g");
const tGet = () => Object.assign({pre:null, post:[], cert:null, passPct:CERT_PASS_DEFAULT, maxAttempts:POST_ATTEMPTS_DEFAULT}, store.get(tkey(), {}));
const tSave = t => store.set(tkey(), t);
/* merge what the server knows (another device may have taken a test) */
function mergeTests(s){ if (!s || !user) return; const t = tGet();
  if (s.pre && !t.pre) t.pre = s.pre;
  if (s.post && s.post.length > t.post.length) t.post = s.post;
  if (s.cert) t.cert = s.cert;
  if (s.passPct != null) t.passPct = s.passPct; if (s.maxAttempts) t.maxAttempts = s.maxAttempts; tSave(t); }
const preDone = () => !!tGet().pre;
const allModulesDone = () => COURSE.every(unitDone);
const postBest = () => Math.max(-1, ...tGet().post.map(p => +p.percent || 0));
const postPassed = () => postBest() >= tGet().passPct;
const attemptsLeft = () => Math.max(0, tGet().maxAttempts - tGet().post.length);
const unitScores = ans => { const u = {}; TEST.items.forEach((it, i) => { u[it.u] = u[it.u] || [0, 0]; u[it.u][1]++; if (ans[i] === it.a) u[it.u][0]++; }); return u; };
const UNIT_NAMES = {1:"Unit 1: Arduino foundations", 2:"Unit 2: Sensors and actuators", 3:"Unit 3: IoT set-up tracks", 4:"Unit 4: Data science for IoT", 5:"Unit 5: Capstone"};

function viewTest(kind){
  const t = tGet(), isPre = kind === "pre", admin = isAdmin() || !!adminSess();
  const head = `<p class="crumb">${isPre ? "Start here" : "Finish line"}</p><h1>${isPre ? "Pre-test" : "Post-test"}</h1>`;
  if (isPre && t.pre && !admin) return testDone(kind, t.pre, null);
  if (!isPre && !allModulesDone() && !admin){
    const left = Object.values(MODULES).filter(m => modulePct(m) < 1);
    $("#view").innerHTML = `${head}<div class="card t-card"><p>The post-test opens when you finish every module. You have <b>${left.length}</b> to go.</p><ul class="lock-list">${left.slice(0, 8).map(x => `<li><a href="#/m/${x.id}">${ring(modulePct(x), 22)}<span><b>${esc(x.id)}</b> ${esc(x.title)}</span><span class="lock-pct">${Math.round(modulePct(x) * 100)}%</span></a></li>`).join("")}</ul></div>`; animateRings($("#view")); return; }
  if (!isPre && postPassed() && !admin) return testDone(kind, t.post[t.post.length - 1], null);
  if (!isPre && !attemptsLeft() && !admin) return testDone(kind, t.post[t.post.length - 1], null);
  $("#view").innerHTML = `${head}<div class="card t-card t-intro">
    <p class="lede-mod">${isPre ? "Before you start, show what you already know. This is <b>not graded</b> and does not affect your progress: it is your starting point, so you can see how much you learn." : `You finished every module. Pass this test with <b>${t.passPct}%</b> or more to earn your certificate. You have <b>${attemptsLeft()}</b> attempt${attemptsLeft() === 1 ? "" : "s"}; your best score counts.`}</p>
    <ul class="t-facts"><li><b>${TEST.items.length}</b> multiple-choice questions</li><li>About <b>${TEST.minutes}</b> minutes</li><li>${isPre ? "One attempt" : "Same questions as the pre-test"}</li></ul>
    <div class="note"><b>Please work on your own:</b> no notes, no AI tools, no help from others. If you do not know an answer, choose <b>“I don't know yet”</b> rather than guessing. Honest answers make your learning gain meaningful${isPre ? "" : " and your certificate trustworthy"}.</div>
    <div class="controls"><button class="btn primary big" id="tStart" type="button">Start the ${isPre ? "pre-test" : "post-test"}</button>${isPre ? "" : `<a class="btn" href="#/home">Review first</a>`}</div></div>`;
  $("#tStart").onclick = () => runTest(kind);
}
function runTest(kind){
  const N = TEST.items.length, ans = new Array(N).fill(null), t0 = Date.now(); let i = 0;
  const draw = () => { const it = TEST.items[i], answered = ans.filter(a => a !== null).length;
    $("#view").innerHTML = `<p class="crumb">${kind === "pre" ? "Pre-test" : "Post-test"}</p>
     <div class="t-run card"><div class="t-top"><b>Question ${i + 1} of ${N}</b><span class="explain">${answered} answered</span></div>
      <div class="meter"><i style="width:${(i + 1) / N * 100}%"></i></div>
      <h2 class="t-q">${esc(it.q)}</h2>
      <div class="t-opts" role="radiogroup" aria-label="Answer choices">${it.o.map((o, k) => `<label class="t-opt"><input type="radio" name="tq" value="${k}" ${ans[i] === k ? "checked" : ""}><span class="t-l">${"ABCD"[k]}</span><span>${esc(o)}</span></label>`).join("")}
       <label class="t-opt t-idk"><input type="radio" name="tq" value="-1" ${ans[i] === -1 ? "checked" : ""}><span class="t-l">?</span><span>I don't know yet</span></label></div>
      <div class="controls t-nav"><button class="btn" id="tBack" type="button" ${i ? "" : "disabled"}>← Back</button>${i < N - 1 ? `<button class="btn primary" id="tNext" type="button">Next →</button>` : `<button class="btn primary" id="tSubmit" type="button">Submit</button>`}</div>
      <div class="t-dots" aria-label="Jump to a question">${TEST.items.map((_, k) => `<button type="button" class="t-dot ${k === i ? "on" : ""} ${ans[k] !== null ? "done" : ""}" data-k="${k}" aria-label="Question ${k + 1}">${k + 1}</button>`).join("")}</div>
      <p class="err" id="tErr" role="alert"></p></div>`;
    document.querySelectorAll('input[name="tq"]').forEach(x => x.onchange = () => { ans[i] = +x.value; document.querySelectorAll(".t-dot")[i].classList.add("done"); if (i < N - 1) setTimeout(() => { i++; draw(); }, 220); });
    $("#tBack").onclick = () => { i--; draw(); };
    if ($("#tNext")) $("#tNext").onclick = () => { i++; draw(); };
    document.querySelectorAll(".t-dot").forEach(d => d.onclick = () => { i = +d.dataset.k; draw(); });
    if ($("#tSubmit")) $("#tSubmit").onclick = async () => {
      const blank = ans.map((a, k) => a === null ? k + 1 : 0).filter(Boolean);
      if (blank.length){ $("#tErr").textContent = `Answer every question first (choose “I don't know yet” if needed). Missing: ${blank.slice(0, 10).join(", ")}${blank.length > 10 ? "…" : ""}.`; return; }
      if (!confirm("Submit your answers? You cannot change them after this.")) return;
      const final = ans.map(a => a === null ? -1 : a), seconds = Math.round((Date.now() - t0) / 1000);
      $("#tSubmit").disabled = true; $("#tSubmit").textContent = "Submitting…";
      const r = await api("test", {kind, answers:final, seconds, version:TEST.version}, false);
      const local = final.reduce((n, a, k) => n + (a === TEST.items[k].a ? 1 : 0), 0);
      if (!r.ok && !r.offline && r.error !== "network"){ $("#tSubmit").disabled = false; $("#tSubmit").textContent = "Submit";
        $("#tErr").textContent = {not_eligible:"The server says not every module is complete yet. Open each module and check it shows 100%.", no_attempts:"You have used all your post-test attempts. Contact the course team.", bad_answers:"Something went wrong with your answers. Reload and try again."}[r.error] || "Could not submit (" + r.error + "). Check your connection and try again."; return; }
      const res = r.ok ? {score:r.score, total:r.total, percent:r.percent} : {score:local, total:N, percent:Math.round(local / N * 1000) / 10, offline:true};
      const t = tGet(); if (r.passPct != null) t.passPct = r.passPct;
      if (kind === "pre") t.pre = res; else t.post.push(res);
      tSave(t); logEvent(kind === "pre" ? "pretest" : "posttest", "test", kind + "_submitted", String(res.percent)); renderMap();
      testDone(kind, res, final); };
  };
  draw();
}
function testDone(kind, res, answers){
  const t = tGet(), isPre = kind === "pre", passed = !isPre && postPassed(), left = attemptsLeft();
  const showReview = answers && !isPre && (passed || !left);
  const us = answers ? unitScores(answers) : null;
  const gain = !isPre && t.pre ? Math.round((postBest() - t.pre.percent) * 10) / 10 : null;
  $("#view").innerHTML = `<p class="crumb">${isPre ? "Pre-test" : "Post-test"}</p><h1>${isPre ? "Your starting point" : passed ? "You passed!" : "Post-test result"}</h1>
   <div class="card t-card t-result">
    <div class="t-score"><div class="t-big">${res.score}<span>/${res.total}</span></div><div><b>${res.percent}%</b>${isPre ? `<p class="explain">This is not a grade. It shows what you knew before the course.</p>` : passed ? `<p class="explain">You reached the ${t.passPct}% needed for the certificate${gain != null ? `, and improved by <b>${gain > 0 ? "+" : ""}${gain}</b> points since the pre-test` : ""}.</p>` : `<p class="explain">You need ${t.passPct}% for the certificate. Attempts left: <b>${left}</b>.</p>`}</div></div>
    ${us ? `<h3>By unit</h3><div class="gr-chart">${Object.keys(us).map(u => `<div class="gr-row"><span>${esc(UNIT_NAMES[u])}</span><div class="gr-bars"><i class="gr-post" style="width:${us[u][0] / us[u][1] * 100}%"></i></div><span>${us[u][0]} of ${us[u][1]}</span></div>`).join("")}</div>` : ""}
    ${!isPre && !passed && left && us ? `<p>Review the units with the lowest scores (open their modules and quizzes), then try again.</p>` : ""}
    <div class="controls">${isPre ? `<a class="btn primary" href="#/m/1.1">Start Module 1.1 →</a>` : passed ? `<a class="btn primary" href="#/certificate">Get your certificate →</a>` : left ? `<a class="btn primary" href="#/posttest">Try again</a><a class="btn" href="#/home">Review the course</a>` : `<a class="btn" href="#/home">Course home</a>`}</div>
    ${res.offline ? `<p class="explain">Saved on this device. It will count on the server only when you are online (and the course server is connected).</p>` : ""}</div>
   ${showReview ? `<h2>Review your answers</h2><ol class="t-review">${TEST.items.map((it, k) => `<li class="${answers[k] === it.a ? "ok" : "no"}"><b>${esc(it.q)}</b><p>${answers[k] === it.a ? "✓" : "✗"} Your answer: ${answers[k] >= 0 ? esc(it.o[answers[k]]) : "I don't know yet"}${answers[k] === it.a ? "" : `<br><span class="explain">Correct: ${esc(it.o[it.a])}</span>`}</p><p class="explain">${esc(it.e)}</p></li>`).join("")}</ol>` : ""}`;
  if (passed) confetti();
}

/* ---- certificate ---- */
function certHTML(c, preview){
  const verify = location.origin + location.pathname + "#/verify/" + encodeURIComponent(c.id);
  return `<div class="cert cert-sheet" id="certSheet"><div class="cert-in">
    <p class="cert-k">Certificate of completion</p><p class="cert-sub">This certifies that</p>
    <h2 class="cert-n">${esc(c.name)}</h2>
    <p class="cert-sub">has completed the self-paced course</p>
    <h3 style="margin:.3em 0">${esc(COURSE_TITLE)}</h3><p class="cert-d">${esc(COURSE_SUBTITLE)}: ${Object.keys(MODULES).length} modules, about ${c.hours || 48} hours, and a passed post-test.</p>
    <div class="cert-f"><div><b>${esc(c.issued)}</b><span>Date issued</span></div><div><b>Morris C. Bana, LPT</b><span>Course creator</span></div><div><b class="mono">${esc(c.id)}</b><span>Certificate ID</span></div></div>
    <p class="cert-v">${preview ? "Preview only: not verifiable until the course server is connected." : `Verify at ${esc(verify)}`}</p></div></div>`;
}
async function viewCertificate(){
  const t = tGet(), admin = isAdmin() || !!adminSess();
  const head = `<p class="crumb">Finish line</p><h1>Your certificate</h1>`;
  if (t.cert){ $("#view").innerHTML = head + certHTML(t.cert, t.cert.id === "PREVIEW") + certTools(t.cert); wireCertTools(t.cert); return; }
  const steps = [["Pre-test taken", preDone()], ["All " + Object.keys(MODULES).length + " modules complete", allModulesDone()], [`Post-test passed (${t.passPct}% or more)`, postPassed()]];
  const ok = (steps[1][1] && steps[2][1]) || admin;
  $("#view").innerHTML = `${head}<div class="card t-card"><p>Only learners who complete the course earn a certificate.</p>
   <ul class="fin-steps">${steps.map((s, k) => `<li class="${s[1] ? "done" : ""}"><span class="fin-ic">${s[1] ? "✓" : k + 1}</span><div><b>${esc(s[0])}</b></div>${!s[1] ? `<a class="btn small" href="${k === 0 ? "#/pretest" : k === 1 ? "#/home" : "#/posttest"}">Go</a>` : ""}</li>`).join("")}</ul>
   ${ok ? `<h3>How should your name appear?</h3><p class="explain">Check the spelling carefully: the name cannot be changed after the certificate is issued.</p>
    <div class="field"><label for="cName">Full name</label><input id="cName" maxlength="80" value="${esc([user.givenName, user.lastName].filter(Boolean).join(" ") || user.name || "")}"></div>
    <label class="consent"><input type="checkbox" id="cOk"><span>This is my name, spelled correctly.</span></label><div class="err" id="cErr" role="alert"></div>
    <button class="btn primary big" id="cGo" type="button">Issue my certificate</button>` : `<p class="explain">Finish the steps above to unlock your certificate.</p>`}</div>`;
  if (!ok) return;
  $("#cGo").onclick = async () => { const name = $("#cName").value.trim();
    if (name.length < 3) return void ($("#cErr").textContent = "Enter your full name.");
    if (!$("#cOk").checked) return void ($("#cErr").textContent = "Tick the box to confirm your name.");
    $("#cGo").disabled = true; $("#cGo").textContent = "Issuing…";
    const r = await api("certificate", {name}, false); let cert;
    if (r.ok) cert = r.cert;
    else if (r.offline) cert = {id:"PREVIEW", name, issued:new Date().toISOString().slice(0, 10), hours:48};
    else { $("#cGo").disabled = false; $("#cGo").textContent = "Issue my certificate";
      return void ($("#cErr").textContent = {modules_incomplete:"The server does not see every module as complete yet. Open each module (it syncs), then try again.", post_not_passed:"The server has no passing post-test for you yet.", name_required:"Enter your full name."}[r.error] || "Could not issue the certificate (" + r.error + ")."); }
    const t2 = tGet(); t2.cert = cert; tSave(t2); logEvent("certificate", "cert", "certificate_issued", cert.id); confetti(); viewCertificate(); };
}
function certTools(c){ return `<div class="controls no-print cert-tools"><button class="btn primary" id="cPrint" type="button">Print or save as PDF</button>${c.id !== "PREVIEW" ? `<button class="btn" id="cLink" type="button">Copy verification link</button>` : ""}<a class="btn" href="#/feedback">Share course feedback</a></div>
  <p class="explain no-print">To save a PDF, choose “Save as PDF” as the printer. Landscape fits best.</p>`; }
function wireCertTools(c){ $("#cPrint").onclick = () => { document.body.classList.add("printing-cert"); window.print(); setTimeout(() => document.body.classList.remove("printing-cert"), 500); };
  if ($("#cLink")) $("#cLink").onclick = () => { copyText(location.origin + location.pathname + "#/verify/" + encodeURIComponent(c.id)); toast("Verification link copied."); }; }
async function viewVerify(id){
  $("#view").innerHTML = `<p class="crumb">Certificate check</p><h1>Verify a certificate</h1><div class="card t-card" id="vBox"><p class="explain">Checking ${esc(id)}…</p></div>`;
  const r = await apiPublic("verifyCert", {id});
  $("#vBox").innerHTML = r.ok && r.found ? `<p class="feedback ok">✓ This certificate is genuine.</p><div class="kv"><span>Name</span><b>${esc(r.name)}</b><span>Course</span><b>${esc(r.course)}</b><span>Issued</span><b>${esc(r.issued)}</b><span>Certificate ID</span><b class="mono">${esc(r.id)}</b></div>`
    : r.ok ? `<p class="feedback no">✗ No certificate has this ID. Check that the ID was typed exactly.</p>` : `<p class="err">Could not check right now (${esc(r.error || "offline")}). Try again later.</p>`;
}

/* ---- admin: pre/post analysis and certificates ---- */
function adminAssessHTML(r){
  const T = r.tests || [], C = r.certs || [], by = {};
  T.forEach(x => { by[x.email] = by[x.email] || {pre:null, post:[]}; if (x.kind === "pre" && !by[x.email].pre) by[x.email].pre = x; if (x.kind === "post") by[x.email].post.push(x); });
  const pre = T.filter(x => x.kind === "pre" && +x.attempt === 1), postFirst = T.filter(x => x.kind === "post" && +x.attempt === 1);
  const avg = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : null, f1 = v => v == null ? "–" : v.toFixed(1);
  const pairs = Object.values(by).filter(p => p.pre && p.post.length).map(p => [+p.pre.percent, Math.max(...p.post.map(x => +x.percent))]);
  const gains = pairs.map(p => p[1] - p[0]), ng = pairs.filter(p => p[0] < 100).map(p => (p[1] - p[0]) / (100 - p[0]));
  const items = TEST.items.map((it, k) => { const pc = rows => { const v = rows.map(x => { try { return JSON.parse(x.answers)[k] === it.a ? 1 : 0; } catch(e){ return null; } }).filter(v => v !== null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length * 100 : null; };
    return [k + 1, it.u, it.q, pc(pre), pc(postFirst)]; });
  return `<h2>Pre-test, post-test, and certificates</h2>
   <div class="bento"><div class="spot span2"><div class="big">${pre.length} / ${postFirst.length}</div><div class="lbl">pre-tests / post-tests taken</div></div>
    <div class="spot span2"><div class="big">${f1(avg(pre.map(x => +x.percent)))}% → ${f1(avg(pairs.map(p => p[1])))}%</div><div class="lbl">average pre → best post (${pairs.length} matched learners)</div></div>
    <div class="spot span2"><div class="big">${f1(avg(gains))} <small>pts</small></div><div class="lbl">average gain · normalized gain ⟨g⟩ = ${ng.length ? avg(ng).toFixed(2) : "–"}</div></div>
    <div class="spot span2"><div class="big">${C.length}</div><div class="lbl">certificates issued (pass mark ${r.passPct == null ? 70 : r.passPct}%)</div></div></div>
   <details><summary><b>Item analysis</b> <span class="explain">(% correct per question, pre vs. first post attempt; low post scores point to content to improve)</span></summary>
    <div class="adm-tablewrap"><table class="t"><tr><th>#</th><th>Unit</th><th>Question</th><th>Pre % correct</th><th>Post % correct</th></tr>${items.map(x => `<tr><td>${x[0]}</td><td>${x[1]}</td><td>${esc(x[2])}</td><td>${f1(x[3])}</td><td>${f1(x[4])}</td></tr>`).join("")}</table></div></details>
   <details><summary><b>Certificates</b></summary><div class="adm-tablewrap"><table class="t"><tr><th>ID</th><th>Name</th><th>Email</th><th>Issued</th><th>Pre %</th><th>Post %</th></tr>${C.map(c => `<tr><td class="mono">${esc(c.id)}</td><td>${esc(c.name)}</td><td>${esc(c.email)}</td><td>${esc(c.issued)}</td><td>${esc(String(c.pre))}</td><td>${esc(String(c.post))}</td></tr>`).join("") || `<tr><td colspan="6">None yet</td></tr>`}</table></div></details>
   <div class="controls"><button class="btn" id="tCsv" type="button">Download test results .csv</button></div>`;
}
function wireAdminAssess(r){ const b = $("#tCsv"); if (!b) return; b.onclick = () => { const H = ["at","email","kind","attempt","score","total","percent","seconds"].concat(TEST.items.map((_, k) => "q" + (k + 1)));
  downloadText("test_results.csv", [H.join(",")].concat((r.tests || []).map(x => { let a = []; try { a = JSON.parse(x.answers); } catch(e){} return H.slice(0, 8).map(h => csvCell(x[h])).concat(TEST.items.map((it, k) => csvCell(a[k] === undefined ? "" : a[k] === it.a ? 1 : 0))).join(","); })).join("\n"), "text/csv"); }; }
