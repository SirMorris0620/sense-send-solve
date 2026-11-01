/* ============ UNIT LOCKS, FEEDBACK, AND EMAIL RECOGNITION ============ */
/* --- unit locks: a unit opens when every module in all earlier units is complete. Admins are never locked. --- */
/* Track modules (m.track) are alternatives: a unit is done when every core module and at least one track module is done. */
const unitDone = u => { const tr = u.modules.filter(m => m.track); return u.modules.filter(m => !m.track).every(m => modulePct(m) === 1) && (!tr.length || tr.some(m => modulePct(m) === 1)); };
const trackDoneIn = u => !!u && u.modules.some(m => m.track && modulePct(m) === 1);
const needsDoing = m => modulePct(m) < 1 && !(m.track && trackDoneIn(unitOf(m.id)));
const reqCount = () => { let done = 0, total = 0; COURSE.forEach(u => { const core = u.modules.filter(m => !m.track), tr = u.modules.filter(m => m.track); total += core.length + (tr.length ? 1 : 0); done += core.filter(m => modulePct(m) === 1).length + (tr.some(m => modulePct(m) === 1) ? 1 : 0); }); return [done, total]; };
const bypassLocks = () => !CONFIG.LOCK_UNITS || isAdmin() || !!adminSess();
function unitLocked(u){ if (!u || bypassLocks()) return false; const i = COURSE.indexOf(u); if (i === 0) return CONFIG.REQUIRE_PRETEST !== false && !preDone(); return !COURSE.slice(0, i).every(unitDone) || (CONFIG.REQUIRE_PRETEST !== false && !preDone()); }
const modLocked = id => unitLocked(unitOf(id));
const lockIcon = `<svg class="lock-i" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;
function viewLocked(id){
  if (CONFIG.REQUIRE_PRETEST !== false && !preDone()){
    $("#view").innerHTML = `<section class="lock-page"><div class="card lock-card"><div class="lock-badge">${lockIcon.replace('width="14" height="14"', 'width="28" height="28"')}</div>
      <p class="crumb">Start here</p><h1>Take the pre-test first</h1><p>Before Module 1.1, answer ${TEST.items.length} quick questions so you can see how much you learn by the end. It is not graded.</p>
      <div class="controls"><a class="btn primary" href="#/pretest">Start the pre-test</a><a class="btn" href="#/overview">Course overview</a></div></div></section>`; return; }
  const m = MODULES[id], u = unitOf(id), i = COURSE.indexOf(u), todo = [].concat(...COURSE.slice(0, i).map(x => x.modules)).filter(needsDoing);
  $("#view").innerHTML = `<section class="lock-page"><div class="card lock-card">
    <div class="lock-badge">${lockIcon.replace('width="14" height="14"', 'width="28" height="28"')}</div>
    <p class="crumb">${esc(u.title)}</p><h1>Module ${esc(id)} is locked</h1>
    <p>${esc(u.title.split(":")[0])} opens when you finish every module before it. You have <b>${todo.length}</b> module${todo.length === 1 ? "" : "s"} to go:</p>
    <ul class="lock-list">${todo.map(x => `<li><a href="#/m/${x.id}">${ring(modulePct(x), 22)}<span><b>${esc(x.id)}</b> ${esc(x.title)}</span><span class="lock-pct">${Math.round(modulePct(x) * 100)}%</span></a></li>`).join("")}</ul>
    <p class="explain"><b>A module is finished when</b> every required section is marked done, the quiz is answered, and your self-rating is chosen. Optional sections do not count.</p>
    <div class="controls"><a class="btn primary" href="#/m/${todo[0] ? todo[0].id : "1.1"}">Continue with Module ${todo[0] ? esc(todo[0].id) : "1.1"}</a><a class="btn" href="#/home">Course home</a></div></div></section>`;
  animateRings($("#view")); A(".lock-card", {opacity:[0,1], y:[10,0]}, {duration:.35});
}
function unlockCheck(before){ /* call after a module completes: celebrate newly opened units */
  COURSE.forEach((u, i) => { if (i && before[i] && !unitLocked(u)){ toast(`${u.title.split(":")[0]} is now unlocked!`); } }); }
const lockSnapshot = () => COURSE.map(u => unitLocked(u));

/* --- feedback --- */
const fbKey = () => "sss_fb_" + (user ? user.email : "g");
const fbGet = () => store.get(fbKey(), {mod:{}, course:null});
const fbSave = x => store.set(fbKey(), x);
async function sendFeedback(data){ const r = await api("feedback", Object.assign({device, page:location.hash.slice(0, 60)}, data));
  return r.ok || r.offline || r.error === "network" ? true : r; }
const stars = (name, val, label) => `<div class="fb-stars" role="radiogroup" aria-label="${esc(label)}">${[1,2,3,4,5].map(n => `<label><input type="radio" name="${name}" value="${n}" ${+val === n ? "checked" : ""}><span aria-label="${n} of 5">★</span></label>`).join("")}</div>`;
function moduleFeedbackHTML(){ return `<section class="section" id="s-feedback"><h2>Module feedback <span class="opt-tag">Optional</span></h2><p class="explain">One minute. Your answers help improve this module. They do not affect your progress.</p><div id="modFb"></div></section>`; }
function mountModuleFeedback(m){
  const box = $("#modFb"); if (!box) return; const F = fbGet(), cur = F.mod[m.id] || {};
  box.innerHTML = `<div class="fb-card"><div class="fb-q"><b>How useful was this module?</b>${stars("fbR", cur.rating, "Usefulness, 1 to 5 stars")}</div>
    <div class="fb-q"><b>How difficult was it?</b><div class="seg seg-sm fb-diff">${["Too easy","Just right","Too hard"].map(d => `<label><input type="radio" name="fbD" value="${d}" ${cur.difficulty === d ? "checked" : ""}><span>${d}</span></label>`).join("")}</div></div>
    <div class="row2"><label class="fb-t"><b>What worked well?</b><textarea class="dinput" id="fbC" rows="3" maxlength="2000">${esc(cur.comment || "")}</textarea></label><label class="fb-t"><b>What should we improve?</b><textarea class="dinput" id="fbI" rows="3" maxlength="2000" placeholder="e.g. a confusing step, a broken activity, something missing">${esc(cur.improve || "")}</textarea></label></div>
    <div class="controls"><button class="btn primary" id="fbGo" type="button">${cur.sent ? "Update my feedback" : "Send feedback"}</button><span class="explain" id="fbMsg">${cur.sent ? "✓ Sent. You can update it anytime." : ""}</span></div></div>`;
  $("#fbGo").onclick = async () => { const r = document.querySelector('input[name="fbR"]:checked'), d = document.querySelector('input[name="fbD"]:checked');
    if (!r){ $("#fbMsg").textContent = "Choose a star rating first."; return; }
    const data = {kind:"module", moduleId:m.id, rating:+r.value, difficulty:d ? d.value : "", comment:$("#fbC").value.trim(), improve:$("#fbI").value.trim()};
    $("#fbGo").disabled = true; const ok = await sendFeedback(data); $("#fbGo").disabled = false;
    if (ok !== true){ $("#fbMsg").textContent = "Could not send: " + (ok.error || "try again"); return; }
    const F2 = fbGet(); F2.mod[m.id] = Object.assign(data, {sent:Date.now()}); fbSave(F2); logEvent(m.id, "feedback", "module_feedback", String(data.rating));
    $("#fbMsg").textContent = "✓ Thank you! Feedback sent."; $("#fbGo").textContent = "Update my feedback"; toast("Thanks for your feedback!"); };
}
const EVAL_ITEMS = [["relevant","The course content was relevant to what I want to learn or do."],["clear","The explanations were clear and easy to follow."],["anim","The animations and interactives helped me understand how things work."],["practice","The Mission Lab and sandboxes gave me enough practice."],["ai","Proto (the AI assistant) helped me learn without doing the work for me."],["pace","The pace and amount of work were manageable."],["app","The web app was easy to use on my device."],["sdg","I can explain how a prototype can support a specific SDG target."]];
const LIKERT = ["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"];
function viewFeedback(){
  const F = fbGet(), c = F.course || {}, sc = c.scores || {}, allDone = Object.values(MODULES).every(m => modulePct(m) === 1);
  $("#view").innerHTML = `<p class="crumb">Course feedback</p><h1>Course feedback</h1>
   <p class="lede-mod">${allDone ? "You finished the course. Congratulations! " : ""}Tell us what worked and what to change. It takes about 5 minutes. You can send it now and update it after you finish the course.</p>
   <form id="evalF" class="fb-eval card" novalidate>
    <h2>Your experience</h2><p class="explain">Choose one answer for each statement.</p>
    <div class="likert-wrap"><table class="likert"><thead><tr><th scope="col">Statement</th>${LIKERT.map(l => `<th scope="col">${l}</th>`).join("")}</tr></thead><tbody>
     ${EVAL_ITEMS.map(it => `<tr><th scope="row">${esc(it[1])}</th>${LIKERT.map((l, i) => `<td data-l="${l}"><label><input type="radio" name="ev_${it[0]}" value="${i + 1}" ${+sc[it[0]] === i + 1 ? "checked" : ""} aria-label="${esc(it[1])}: ${l}"><span></span></label></td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <h2>Your confidence</h2><p class="explain">Think about building an IoT prototype that sends sensor data to a web app (1 = not at all confident, 5 = very confident).</p>
    <div class="row2"><div class="fb-q"><b>Before this course</b>${stars("ev_conf_before", sc.conf_before, "Confidence before the course")}</div><div class="fb-q"><b>Now</b>${stars("ev_conf_now", sc.conf_now, "Confidence now")}</div></div>
    <h2>Would you recommend it?</h2><p class="explain">How likely are you to recommend this course to a friend or colleague? (0 = not at all likely, 10 = extremely likely)</p>
    <div class="nps" role="radiogroup" aria-label="Likelihood to recommend, 0 to 10">${Array.from({length:11}, (_, n) => `<label><input type="radio" name="ev_nps" value="${n}" ${c.nps === n ? "checked" : ""}><span>${n}</span></label>`).join("")}</div>
    <div class="row2"><label class="fb-t"><b>What was most valuable?</b><textarea class="dinput" id="evC" rows="4" maxlength="2000">${esc(c.comment || "")}</textarea></label><label class="fb-t"><b>What should we change or add?</b><textarea class="dinput" id="evI" rows="4" maxlength="2000">${esc(c.improve || "")}</textarea></label></div>
    <p class="explain">Your answers are saved with your account so the course team can improve the course. If you agreed to research use, they are de-identified first (see Privacy).</p>
    <div class="err" id="evErr" role="alert"></div><div class="controls"><button class="btn primary big" type="submit" id="evGo">${c.sent ? "Update my feedback" : "Send course feedback"}</button></div></form>`;
  $("#evalF").onsubmit = async e => { e.preventDefault(); const scores = {};
    EVAL_ITEMS.forEach(it => { const x = document.querySelector(`input[name="ev_${it[0]}"]:checked`); if (x) scores[it[0]] = +x.value; });
    ["conf_before","conf_now"].forEach(k => { const x = document.querySelector(`input[name="ev_${k}"]:checked`); if (x) scores[k] = +x.value; });
    const n = document.querySelector('input[name="ev_nps"]:checked');
    if (Object.keys(scores).length < EVAL_ITEMS.length){ $("#evErr").textContent = `Answer all ${EVAL_ITEMS.length} statements (${EVAL_ITEMS.length - EVAL_ITEMS.filter(it => scores[it[0]]).length} left).`; return; }
    if (!n){ $("#evErr").textContent = "Choose a number from 0 to 10 for “recommend”."; return; }
    const data = {kind:"course", scores, nps:+n.value, comment:$("#evC").value.trim(), improve:$("#evI").value.trim()};
    $("#evGo").disabled = true; const ok = await sendFeedback(data); $("#evGo").disabled = false;
    if (ok !== true){ $("#evErr").textContent = "Could not send: " + (ok.error || "try again"); return; }
    const F2 = fbGet(); F2.course = Object.assign(data, {sent:Date.now()}); fbSave(F2); logEvent("course", "feedback", "course_feedback", String(data.nps));
    $("#evErr").textContent = ""; $("#evGo").textContent = "Update my feedback"; confetti(); toast("Thank you! Your course feedback was sent."); };
  A("#evalF", {opacity:[0,1], y:[10,0]}, {duration:.35});
}
function openGeneralFeedback(){
  let d = $("#fbDlg");
  if (!d){ d = document.createElement("dialog"); d.id = "fbDlg"; document.body.appendChild(d); }
  d.innerHTML = `<form method="dialog" id="gfF"><h2 style="margin-top:.2em">Send feedback</h2><p class="explain">Found a problem or have an idea? Tell us. We attach the page you are on.</p>
   <div class="field"><label for="gfT">Type</label><select id="gfT"><option>Something is broken</option><option>Content error or typo</option><option>Suggestion</option><option>Question</option><option>Other</option></select></div>
   <div class="field"><label for="gfM">Message</label><textarea id="gfM" class="dinput" rows="5" maxlength="2000" placeholder="What happened, and what did you expect? Do not include passwords or API keys."></textarea></div>
   <div class="err" id="gfE" role="alert"></div><div class="controls"><button class="btn primary" id="gfGo" value="send">Send</button><button class="btn" value="cancel" formnovalidate>Cancel</button></div></form>`;
  d.showModal(); $("#gfM").focus();
  $("#gfGo").onclick = async e => { e.preventDefault(); const msg = $("#gfM").value.trim(); if (msg.length < 5){ $("#gfE").textContent = "Write a short message first."; return; }
    $("#gfGo").disabled = true; const ok = await sendFeedback({kind:"general", moduleId:currentModule || "", difficulty:$("#gfT").value, comment:msg}); $("#gfGo").disabled = false;
    if (ok !== true){ $("#gfE").textContent = "Could not send: " + (ok.error || "try again"); return; }
    d.close(); toast("Thanks! Your feedback was sent."); };
}
/* admin: feedback summary */
function adminFeedbackHTML(fb){
  fb = fb || []; const mods = fb.filter(f => f.kind === "module"), course = fb.filter(f => f.kind === "course"), gen = fb.filter(f => f.kind === "general");
  const avg = a => a.length ? (a.reduce((s, x) => s + x, 0) / a.length) : null, f1 = v => v == null ? "–" : v.toFixed(1);
  const byMod = Object.keys(MODULES).map(id => { const r = mods.filter(f => String(f.moduleId) === id), d = k => r.filter(f => f.difficulty === k).length;
    return [id, r.length, avg(r.map(f => +f.rating).filter(Boolean)), d("Too easy"), d("Just right"), d("Too hard")]; });
  const sc = course.map(f => { try { return JSON.parse(f.scores || "{}"); } catch(e){ return {}; } });
  const nps = course.map(f => f.nps).filter(v => v !== "" && v != null).map(Number), npsScore = nps.length ? Math.round((nps.filter(v => v >= 9).length - nps.filter(v => v <= 6).length) / nps.length * 100) : null;
  const comments = fb.filter(f => f.comment || f.improve).slice().reverse();
  return `<h2>Feedback</h2>
   <div class="bento"><div class="spot span2"><div class="big">${course.length}</div><div class="lbl">course evaluations</div></div><div class="spot span2"><div class="big">${npsScore == null ? "–" : (npsScore > 0 ? "+" : "") + npsScore}</div><div class="lbl">Net Promoter Score (−100 to +100)</div></div>
    <div class="spot span2"><div class="big">${f1(avg(sc.map(s => s.conf_before).filter(Boolean)))} → ${f1(avg(sc.map(s => s.conf_now).filter(Boolean)))}</div><div class="lbl">confidence before → now (1–5)</div></div></div>
   <h3>Course evaluation (average, 1–5)</h3><div class="adm-tablewrap"><table class="t"><tr><th>Statement</th><th>Average</th><th>Responses</th></tr>${EVAL_ITEMS.map(it => { const v = sc.map(s => s[it[0]]).filter(Boolean); return `<tr><td>${esc(it[1])}</td><td><div class="fb-bar"><i style="width:${(avg(v) || 0) / 5 * 100}%"></i><span>${f1(avg(v))}</span></div></td><td>${v.length}</td></tr>`; }).join("")}</table></div>
   <h3>Module feedback</h3><div class="adm-tablewrap"><table class="t"><tr><th>Module</th><th>Responses</th><th>Usefulness (1–5)</th><th>Too easy</th><th>Just right</th><th>Too hard</th></tr>${byMod.map(r => `<tr><td>${r[0]} ${esc(MODULES[r[0]].title)}</td><td>${r[1]}</td><td>${f1(r[2])}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td></tr>`).join("")}</table></div>
   <h3>Comments and reports (${comments.length}) <span class="explain">· ${gen.length} general reports</span></h3>
   <div class="controls"><input class="dinput" id="fbQ" placeholder="Filter comments…"><button class="btn" id="fbCsv" type="button">Download feedback .csv</button></div>
   <div class="fb-list" id="fbList">${comments.slice(0, 200).map(f => `<div class="fb-item"><div class="fb-meta"><b>${esc(f.kind === "general" ? f.difficulty || "General" : f.kind === "course" ? "Course" : "Module " + f.moduleId)}</b> · ${esc(f.at)} · ${esc(f.email)}${f.page ? ` · <span class="mono">${esc(f.page)}</span>` : ""}${f.rating ? ` · ${"★".repeat(+f.rating)}` : ""}</div>${f.comment ? `<p>${esc(f.comment)}</p>` : ""}${f.improve ? `<p><b>Improve:</b> ${esc(f.improve)}</p>` : ""}</div>`).join("") || `<p class="explain">No comments yet.</p>`}</div>`;
}
function wireAdminFeedback(fb){
  const q = $("#fbQ"); if (q) q.oninput = () => { const t = q.value.toLowerCase(); $$("#fbList .fb-item").forEach(x => x.hidden = t && !x.textContent.toLowerCase().includes(t)); };
  const c = $("#fbCsv"); if (c) c.onclick = () => { const H = ["at","email","kind","moduleId","page","rating","difficulty","scores","nps","comment","improve"]; downloadText("feedback.csv", [H.join(",")].concat((fb || []).map(f => H.map(h => csvCell(f[h])).join(","))).join("\n"), "text/csv"); };
}

/* --- email recognition: profiles used on this device --- */
const knownProfiles = () => Object.values(store.get("sss_profiles", {})).filter(p => p && p.email).sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
function forgetProfile(email){ const all = store.get("sss_profiles", {}); delete all[email]; store.set("sss_profiles", all); }

/* admin: health and errors */
function adminHealthHTML(r){
  const E = r.errors || [];
  return `<h2>Health and errors</h2>
   <div class="bento"><div class="spot span2"><div class="big">${r.errors24h == null ? "–" : r.errors24h}</div><div class="lbl">errors in the last 24 hours</div></div>
    <div class="spot span2"><div class="big">${r.emailQuota == null ? "–" : r.emailQuota}</div><div class="lbl">sign-in code emails left today</div></div>
    <div class="spot span2"><div class="big" style="font-size:1.3rem">${esc(r.version || "older")}</div><div class="lbl">server version (Code.gs)</div></div></div>
   ${E.length ? `<details class="adm-err"><summary><b>Latest ${E.length} errors</b> <span class="explain">(newest first; full details in the Errors tab of your Sheet)</span></summary><div class="adm-tablewrap"><table class="t"><tr><th>When</th><th>Source</th><th>Where</th><th>Message</th><th>Learner</th></tr>${E.slice(0, 100).map(x => `<tr><td>${esc(x.at)}</td><td>${esc(x.source)}</td><td class="mono">${esc(x.where)}</td><td>${esc(x.message)}</td><td>${esc(x.email)}</td></tr>`).join("")}</table></div></details>` : `<p class="explain">No errors recorded. 🎉</p>`}`;
}
