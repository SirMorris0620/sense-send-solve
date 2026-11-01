/* ============ MOTION LAYER ============ */
const M = window.Motion || null;
const canAnim = () => !!(M && M.animate) && !reduceMotion();
const SPRING = {type:"spring", stiffness:320, damping:30};
function A(el, kf, opt){ if (!el || !canAnim()) return null; try { return M.animate(el, kf, opt || {duration:.45, ease:[.22,1,.36,1]}); } catch(e){ return null; } }
function stag(t, from){ return (M && M.stagger) ? M.stagger(t, from ? {startDelay:from} : undefined) : 0; }
function pop(el, s){ A(el, {scale:[1, s || 1.15, 1]}, {type:"spring", stiffness:500, damping:14}); }
function tween(from, to, ms, cb){
  if (reduceMotion()) { cb(to); return; }
  const t0 = performance.now();
  const step = now => { const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3); cb(from + (to - from) * e); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function tick(el, to, decimals, suffix){ tween(0, to, 1200, v => el.textContent = v.toFixed(decimals || 0) + (suffix || "")); }
window.toastStack = function(msg, kind){
  let box = $("#toasts"); if (!box){ box = document.createElement("div"); box.id = "toasts"; box.setAttribute("aria-live","polite"); document.body.appendChild(box); }
  const t = document.createElement("div"); t.className = "t-item " + (kind || "ok"); t.textContent = msg; box.appendChild(t);
  A(t, {opacity:[0,1], y:[24,0], scale:[.96,1]}, SPRING);
  setTimeout(() => { const a = A(t, {opacity:0, x:40}, {duration:.3}); setTimeout(() => t.remove(), a ? 320 : 0); }, 3200);
};
function confetti(){
  if (reduceMotion()) return;
  let cv = $("#confetti"); if (!cv){ cv = document.createElement("canvas"); cv.id = "confetti"; document.body.appendChild(cv); }
  const g = cv.getContext("2d"); cv.width = innerWidth; cv.height = innerHeight;
  const cols = ["#1F8A70","#E8B84A","#C8653A","#17483B","#8FD1B8"];
  const P = Array.from({length:140}, () => ({x:innerWidth/2, y:innerHeight*0.35, vx:(Math.random()-0.5)*14, vy:-Math.random()*13-4, r:Math.random()*6+3, c:cols[Math.random()*5|0], a:Math.random()*6, va:(Math.random()-0.5)*0.3}));
  const t0 = performance.now();
  (function f(now){ const dt = (now - t0)/1000; g.clearRect(0,0,cv.width,cv.height);
    P.forEach(p => { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.a += p.va; g.save(); g.translate(p.x,p.y); g.rotate(p.a); g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - dt/2.2); g.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6); g.restore(); });
    if (dt < 2.2) requestAnimationFrame(f); else g.clearRect(0,0,cv.width,cv.height); })(t0);
}
function spotify(root){
  root.querySelectorAll(".spot").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty("--mx", x + "px"); el.style.setProperty("--my", y + "px");
      if (e.pointerType === "mouse" && !reduceMotion()){ el.style.transition = "transform .08s"; el.style.transform = `perspective(900px) rotateX(${(0.5 - y/r.height)*5}deg) rotateY(${(x/r.width - 0.5)*6}deg)`; }
    });
    el.addEventListener("pointerleave", () => { el.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)"; el.style.transform = ""; });
  });
}
function reveal(nodes, opts){
  const list = [...nodes]; if (!canAnim() || !("IntersectionObserver" in window)) return;
  list.forEach(n => { n.style.opacity = 0; n.style.transform = "translateY(24px)"; });
  const io = new IntersectionObserver(entries => entries.forEach(en => { if (!en.isIntersecting) return; io.unobserve(en.target);
    const a = A(en.target, {opacity:1, y:[24,0]}, Object.assign({duration:.6, ease:[.22,1,.36,1]}, opts||{}));
    if (!a){ en.target.style.opacity = ""; en.target.style.transform = ""; } }), {threshold:0.04});
  list.forEach(n => io.observe(n));
  setTimeout(() => list.forEach(n => { if (n.style.opacity === "0" && n.getBoundingClientRect().top < innerHeight){ n.style.opacity = ""; n.style.transform = ""; } }), 1500);
}
addEventListener("scroll", () => { const b = $("#scrollbar"); if (!b) return; const h = document.documentElement; const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight); b.style.transform = `scaleX(${p})`; }, {passive:true});

/* ============ PROGRESS MODEL ============ */
function quizDone(m){ return !!(m.quiz && m.quiz.length) && m.quiz.every((q, i) => prog.quiz[m.id + ":" + i] != null); }
function quizScore(m){ return m.quiz ? m.quiz.filter((q, i) => prog.quiz[m.id + ":" + i] === q.a).length : 0; }
function modulePct(m){ if (!m.sections) return 0; const req = m.sections.filter(s => !s.optional), total = req.length + 2; let d = req.filter(s => prog.done[m.id+":"+s.id]).length; if (quizDone(m)) d++; if (prog.rating[m.id]) d++; return d/total; }
function unitOf(id){ return COURSE.find(u => u.modules.some(m => m.id === id)); }

/* ============ RENDERING ============ */
/* Tables fill the column; a table wider than the screen scrolls inside its own wrapper instead of stretching the page. */
function wrapTables(root){ (root || document).querySelectorAll("table.t").forEach(t => { if (t.parentElement && !t.parentElement.classList.contains("tscroll")){ const w = document.createElement("div"); w.className = "tscroll"; t.parentNode.insertBefore(w, t); w.appendChild(t); } }); }
if ("MutationObserver" in window) new MutationObserver(ms => { if (!wrapTables.p && ms.some(m => m.addedNodes.length)) wrapTables.p = setTimeout(() => { wrapTables.p = 0; wrapTables(document.getElementById("view")); }, 120); }).observe(document.documentElement, {childList:true, subtree:true});
function ring(pct, size){ size = size || 24; const r = size*0.375, c = 2*Math.PI*r, sw = size/8;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${sw}"/><circle class="ring-fg" data-c="${c}" data-p="${pct}" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--teal)" stroke-width="${sw}" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-pct)}" transform="rotate(-90 ${size/2} ${size/2})" stroke-linecap="round"/></svg>`; }
function animateRings(root){ root.querySelectorAll(".ring-fg").forEach(c => { const C = +c.dataset.c, p = +c.dataset.p; if (!p) return; A(c, {strokeDashoffset:[C, C*(1-p)]}, {duration:1.1, ease:[.22,1,.36,1]}); }); }

let pillTop = null;
function renderMap(){
  const cur = (location.hash.match(/^#\/m\/([^?]+)/) || [])[1], h = location.hash;
  const link = (href, label, on) => `<a class="mod-link ${on ? "active" : ""}" href="${href}">${label}</a>`;
  $("#map").innerHTML = `<div class="pill" id="pill"></div>` + `<div class="unit"><div class="unit-title">Start here</div>${link("#/overview", `<span class="mapicon">◎</span><span>Course overview</span>`, h === "#/overview")}${link("#/home", `<span class="mapicon">⌂</span><span>Course home</span>`, !cur && (h === "#/home" || h === ""))}${link("#/pretest", `<span class="mapicon">${preDone() ? "✓" : "①"}</span><span>Pre-test</span>`, h === "#/pretest")}</div>` +
    COURSE.map(u => { const lk = unitLocked(u); return `<div class="unit${lk ? " unit-locked" : ""}"><div class="unit-title">${lk ? lockIcon + " " : ""}${esc(u.title)}</div><div class="unit-sub">${lk ? (COURSE.indexOf(u) === 0 || !preDone() ? "Take the pre-test to unlock" : "Finish the earlier units to unlock") : esc(u.sub)}</div>
    ${u.modules.map(m => `<a class="mod-link ${cur===m.id?"active":""}${lk ? " is-locked" : ""}" href="#/m/${m.id}" ${lk ? `aria-label="${esc(m.id + " " + m.title)} (locked)"` : ""}>${lk ? `<span class="mapicon">${lockIcon}</span>` : ring(modulePct(m))}<span>${esc(m.id)} ${esc(m.title)}</span></a>`).join("")}</div>`; }).join("") +
    `<div class="unit"><div class="unit-title">Finish line</div>${link("#/posttest", `<span class="mapicon">${postPassed() ? "✓" : allModulesDone() || bypassLocks() ? "○" : lockIcon}</span><span>Post-test</span>`, h === "#/posttest")}${link("#/certificate", `<span class="mapicon">${tGet().cert ? "✓" : postPassed() || bypassLocks() ? "○" : lockIcon}</span><span>Certificate</span>`, h === "#/certificate")}</div>` +
    `<div class="map-foot">${link("#/lab", "Sandbox lab", h === "#/lab")}${link("#/ailog", "My AI-use log", h === "#/ailog")}${link("#/progress", "My progress", h === "#/progress")}${link("#/badges", `My badges <span class="bdg-count" id="bdgCount">${Object.keys(earned()).length}/${BADGES.length}</span>`, h === "#/badges")}${link("#/glossary", "Glossary", h === "#/glossary")}${link("#/references", "References (APA)", h === "#/references")}${link("#/privacy", "Privacy", h === "#/privacy")}${link("#/feedback", "Course feedback", h === "#/feedback")}<button class="mod-link fb-link" type="button" onclick="openGeneralFeedback()">Report a problem or idea</button>${isAdmin() || adminSess() ? link("#/admin", "Teacher dashboard", h === "#/admin") : ""}</div>`;
  const a = $("#map .mod-link.active"), pill = $("#pill");
  if (a && pill){ const top = a.offsetTop, hh = a.offsetHeight; pill.style.height = hh + "px";
    if (pillTop != null && canAnim()) A(pill, {top:[pillTop + "px", top + "px"]}, SPRING); pill.style.top = top + "px"; pillTop = top; }
  queueBadgeCheck();
}
function renderWho(){ $("#who").textContent = user ? `${user.givenName || user.name} • ${user.role} • ${BOARDS[getBoard()].short}` : ""; }

function viewHome(){
  const mods = Object.values(MODULES), done = mods.filter(m => modulePct(m) === 1).length;
  const next = mods.find(needsDoing) || mods[mods.length-1];
  const b = BOARDS[getBoard()];
  $("#view").innerHTML = `<p class="crumb">Course home</p><h1>Welcome, ${esc(user.givenName || String(user.name || "maker").split(" ")[0])}</h1>
   ${!preDone() && !bypassLocks() ? `<a class="spot continue t-cta" href="#/pretest"><span class="lbl">Step 1</span><h3>Take the pre-test</h3><span class="lbl">${TEST.items.length} questions • about ${TEST.minutes} minutes • not graded • unlocks Module 1.1</span></a>` : ""}
   ${allModulesDone() && !tGet().cert ? `<a class="spot continue t-cta" href="${postPassed() ? "#/certificate" : "#/posttest"}"><span class="lbl">Finish line</span><h3>${postPassed() ? "Get your certificate" : "Take the post-test"}</h3><span class="lbl">${postPassed() ? "You passed the post-test" : `Pass with ${tGet().passPct}% to earn your certificate`}</span></a>` : ""}
   <div class="bento">
    ${!preDone() && !bypassLocks() ? `<div class="spot span4 t-wait"><span class="lbl">Then</span><h3>Module 1.1 opens after the pre-test</h3><span class="lbl">Your progress, board, and tools are below.</span></div>` : `<a class="spot continue span4" href="#/m/${next.id}"><span class="lbl">${modulePct(next) ? "Continue where you left off" : "Start here"}</span><h3>Module ${next.id}: ${esc(next.title)}</h3>
     <span class="lbl">about ${next.minutes} minutes • ${Math.round(modulePct(next)*100)}% done</span></a>`}
    <div class="spot span2"><div class="big" data-tick="${done}">0</div><div class="lbl">of ${mods.length} modules complete</div></div>
    <div class="spot span3"><div class="big" data-tick="${((prog.minutes||0)/60).toFixed(1)}" data-dec="1" data-suf=" h">0</div><div class="lbl">active learning time on this device</div></div>
    <div class="spot span3 boardspot"><div class="lbl">Your board</div><h3>${esc(b.name)}</h3><div class="controls">${Object.values(BOARDS).map(x => `<button class="chip ${x.key === b.key ? "sel" : ""}" data-setboard="${x.key}">${esc(x.short)}</button>`).join("")}</div><span class="explain">Wiring tables and code open on this board first.</span></div>
    ${badgeStripHTML()}
   </div>
   ${COURSE.map(u => `<h2>${esc(u.title)}</h2><p class="explain" style="margin-top:-.3em">${esc(u.blurb || "")}</p><div class="bento">
    ${u.modules.map(m => `<a class="spot mod-card span3${unitLocked(u) ? " is-locked" : ""}" href="#/m/${m.id}"><span class="num">${unitLocked(u) ? lockIcon + " Locked • " : ""}Module ${m.id} • about ${m.minutes} min</span><h3>${esc(m.title)}</h3>
      <span class="lbl">${m.sections.filter(s => !s.optional).length} sections • quiz • checkpoint ${esc(m.checkpoint.code)}</span><div class="bar"><i data-w="${Math.round(modulePct(m)*100)}"></i></div></a>`).join("")}
   </div>`).join("")}
   <div class="note">Press <span class="kbd">Ctrl</span> + <span class="kbd">K</span> (or tap Search) to jump to any module, section, or sensor. Use <b>Listen</b> on any section to hear it read aloud. The <b>Sandbox lab</b> collects every virtual activity in one place.</div>`;
  $$("[data-setboard]").forEach(x => x.onclick = () => { setBoard(x.dataset.setboard); renderWho(); viewHome(); toast("Board set to " + BOARDS[x.dataset.setboard].short); });
  document.querySelectorAll("[data-tick]").forEach(el => tick(el, +el.dataset.tick, +(el.dataset.dec||0), el.dataset.suf||""));
  document.querySelectorAll(".mod-card .bar i").forEach(i => { if (canAnim()) A(i, {width:["0%", i.dataset.w + "%"]}, {duration:1, delay:.3, ease:[.22,1,.36,1]}); i.style.width = i.dataset.w + "%"; });
  A(document.querySelectorAll(".bento .spot"), {opacity:[0,1], y:[20,0], scale:[.98,1]}, {delay:stag(0.04), type:"spring", stiffness:260, damping:26});
  spotify($("#view"));
}

let pendingAnchor = null, currentSection = "";
function viewModule(id){
  const m = MODULES[id]; if (!m){ location.hash = "#/home"; return; }
  if (modLocked(id)){ currentModule = ""; renderMap(); viewLocked(id); return; }
  currentModule = id; logEvent(id, "open", "module_open", "");
  const v = $("#view"), pct = modulePct(m), u = unitOf(id);
  v.innerHTML = `<div class="mod-layout"><div>
   <div class="mod-hero"><p class="crumb">${esc(u.title.split(":")[0])} • Module ${id}</p><h1>${esc(m.title)}</h1>
    <div class="meta"><span>about ${m.minutes} minutes</span><span>Checkpoint: ${esc(m.checkpoint.code)}</span><span id="pctLbl">${Math.round(pct*100)}% done</span></div>
    ${canPresent() ? `<div class="pres-launch-row"><button class="btn primary small pres-launch" type="button" onclick="startPresenting('${id}')" title="Show this module as slides on a projector">▶ Present to class</button><span class="explain">Admins only · arrow keys to move · P for presenter view</span></div>` : ""}
    <div class="ring-big">${ring(pct, 64)}</div></div>
   ${m.intro ? `<p class="lede-mod">${m.intro}</p>` : ""}
   <div class="objectives"><b>By the end of this module, you will be able to:</b><ul>${m.objectives.map(o=>`<li>${esc(o)}</li>`).join("")}</ul></div>
   ${m.sections.map((s,i) => `<section class="section${s.optional ? " optional" : ""}" id="s-${s.id}"><div class="sec-head"><h2>${i+1}. ${esc(s.title)}${s.optional ? ` <span class="opt-tag">Optional</span>` : ""}</h2>
     <div class="sec-actions"><button class="btn small" data-listen="${s.id}">Listen</button><button class="btn small done-btn ${prog.done[id+":"+s.id]?"done":""}" data-done="${s.id}">${prog.done[id+":"+s.id]?"Done":"Mark as done"}</button></div></div>
     <div class="sec-body">${typeof s.html === "function" ? s.html() : s.html}</div>${s.interactive ? [].concat(s.interactive).map(x => `<div data-int="${x}"></div>`).join("") : ""}</section>`).join("")}
   <section class="section" id="s-quiz"><h2>Check your understanding</h2><p class="explain">Answer every question. Each one explains why, whichever option you choose.</p><div id="quiz"></div><div id="quizScore" class="feedback"></div></section>
   <section class="section" id="s-rating"><h2>Self-rating</h2><p>Choose the description that fits you right now. Be honest: it helps your teacher help you.</p><div class="rating" id="rating"></div></section>
   ${moduleFeedbackHTML()}
   <section class="section" id="s-output"><h2>Competency checkpoint and output</h2>
    <table class="t"><tr><th>Objective</th><th>Task</th><th>Met when…</th></tr><tr><td>${esc(m.checkpoint.code)}</td><td>${esc(m.checkpoint.task)}</td><td>${esc(m.checkpoint.met)}</td></tr></table>
    <p><b>${esc(m.checkpoint.upload)}</b> Images, PDF, Office files, CSV, code files (.ino, .gs, .html, .js), ZIP, or short videos up to ${CONFIG.MAX_UPLOAD_MB} MB.</p>
    <div class="drop" id="drop"><p>Drop a file here or</p><input type="file" id="file" aria-label="Choose a file to upload"><p class="err" id="upErr"></p><span class="prog"></span></div>
    <div class="uplist" id="uplist"></div></section>
   ${m.refs && m.refs.length ? `<section class="section" id="s-refs"><h2>References</h2><ul class="refs">${m.refs.filter(k => REF[k]).map(k => REF[k]).sort((a, b) => a[0].localeCompare(b[0])).map(r => `<li>${esc(r[0])}${r[1] ? ` <a href="${r[1]}" target="_blank" rel="noopener">${esc(r[1])}</a>` : ""}</li>`).join("")}</ul></section>` : ""}
   <div class="controls" style="margin-top:28px">${prevNext(id)}</div></div>
   <nav class="toc" aria-label="On this page"><b>On this page</b>${m.sections.map(s=>`<a href="#/m/${id}?s=${s.id}" data-toc="s-${s.id}">${esc(s.title)}</a>`).join("")}
    <a href="#/m/${id}?s=quiz" data-toc="s-quiz">Quiz</a><a href="#/m/${id}?s=rating" data-toc="s-rating">Self-rating</a><a href="#/m/${id}?s=feedback" data-toc="s-feedback">Module feedback</a><a href="#/m/${id}?s=output" data-toc="s-output">Checkpoint and output</a>${m.refs ? `<a href="#/m/${id}?s=refs" data-toc="s-refs">References</a>` : ""}</nav></div>`;
  v.querySelectorAll(".bt-tabs button").forEach(x => x.setAttribute("aria-selected", x.dataset.b === getBoard()));
  v.querySelectorAll("[data-int]").forEach(el => mountInteractive(el));
  v.querySelectorAll("[data-listen]").forEach(b => b.onclick = () => { const sec = m.sections.find(s=>s.id===b.dataset.listen); speak(sec.title + ". " + v.querySelector("#s-"+sec.id+" .sec-body").innerText); pop(b, .92); });
  v.querySelectorAll("[data-done]").forEach(b => b.onclick = () => {
    const key = id+":"+b.dataset.done; if (prog.done[key]) return;
    prog.done[key] = Date.now(); saveProg(); logEvent(id, b.dataset.done, "section_done", "1");
    b.classList.add("done"); b.textContent = "Done"; pop(b);
    updateModuleProgress(m); checkModuleDone(m); renderMap(); });
  v.querySelectorAll(".toc a").forEach(a => a.onclick = e => { e.preventDefault(); const t = document.getElementById(a.dataset.toc); if (t) t.scrollIntoView({behavior: reduceMotion()?"auto":"smooth", block:"start"}); history.replaceState(null, "", a.getAttribute("href")); });
  renderQuiz(m); renderRating(m); mountModuleFeedback(m); setupUpload(m); renderMap(); animateRings(v);
  reveal(v.querySelectorAll(".section, .objectives"));
  if ("IntersectionObserver" in window){
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ currentSection = e.target.id; v.querySelectorAll(".toc a").forEach(a => a.classList.toggle("on", a.dataset.toc === e.target.id)); } }), {rootMargin:"-30% 0px -60% 0px"});
    v.querySelectorAll(".section[id]").forEach(s => io.observe(s));
  }
  if (pendingAnchor){ const t = document.getElementById("s-" + pendingAnchor); pendingAnchor = null; if (t) setTimeout(() => { t.style.opacity = ""; t.style.transform = ""; t.scrollIntoView({block:"start"}); }, 60); }
  else v.focus({preventScroll:true});
}
function mountInteractive(el){
  const name = el.dataset.int;
  if (name.startsWith("sandbox:")) { mountSandbox(el, name.slice(8).split(",")); return; }
  if (name.startsWith("as:")) { mountAppsScript(el, name.slice(3).split(",")); return; }
  if (name.startsWith("web:")) { mountWeb(el, name.slice(4).split(",")); return; }
  const fn = INTERACTIVES[name];
  if (!fn){ el.innerHTML = `<p class="explain">(Interactive “${esc(name)}” is coming soon.)</p>`; return; }
  try { fn(el); } catch(e){ console.error(name, e); el.innerHTML = `<p class="err">This interactive could not start (${esc(e.message)}). Reload the page; if it keeps happening, tell your teacher.</p>`; }
}
function updateModuleProgress(m){ const p = modulePct(m), lbl = $("#pctLbl"); if (lbl) lbl.textContent = Math.round(p*100) + "% done";
  const c = $(".ring-big .ring-fg"); if (c){ const C = +c.dataset.c, prev = +c.getAttribute("stroke-dashoffset"); c.setAttribute("stroke-dashoffset", C*(1-p)); A(c, {strokeDashoffset:[prev, C*(1-p)]}, {duration:.8}); } }
function prevNext(id){ const ids = Object.keys(MODULES), i = ids.indexOf(id);
  return (i>0?`<a class="btn" href="#/m/${ids[i-1]}">Previous module</a>`:"") + (i<ids.length-1?`<a class="btn primary" href="#/m/${ids[i+1]}">Next module</a>`:`<a class="btn primary" href="#/progress">See my progress</a>`); }
function checkModuleDone(m){ if (modulePct(m) === 1 && !prog.done[m.id+":__module"]) { const lockBefore = lockSnapshot(); prog.done[m.id+":__module"] = Date.now(); setTimeout(() => { unlockCheck(lockBefore); renderMap(); if (Object.values(MODULES).every(x => modulePct(x) === 1)) setTimeout(() => toast("You finished every module! Please share your course feedback (side menu → Course feedback)."), 2500); }, 50); saveProg(); logEvent(m.id, "module", "module_done", "1"); toast(`Module ${m.id} complete.`); confetti(); } }
function renderQuiz(m){
  const box = $("#quiz"); box.innerHTML = m.quiz.map((q,i) => `<div class="q"><b>${i+1}. ${esc(q.q)}</b><div class="opts">${q.o.map((o,k)=>`<button class="opt" data-q="${i}" data-k="${k}">${esc(o)}</button>`).join("")}</div><div class="explain" id="qe${i}"></div></div>`).join("");
  const score = () => { const s = $("#quizScore"); if (!s) return; s.textContent = quizDone(m) ? `Score: ${quizScore(m)} of ${m.quiz.length}.` + (quizScore(m) < Math.ceil(m.quiz.length * 0.8) ? " Review the explanations, then reread the sections you missed." : " Well done.") : ""; };
  m.quiz.forEach((q,i) => { const prev = prog.quiz[m.id+":"+i]; if (prev != null) mark(i, prev, false); });
  box.querySelectorAll(".opt").forEach(b => b.onclick = () => { const i = +b.dataset.q; if (prog.quiz[m.id+":"+i] != null) return; mark(i, +b.dataset.k, true); });
  score();
  function mark(i, k, fresh){ const q = m.quiz[i]; const btns = box.querySelectorAll(`.opt[data-q="${i}"]`);
   btns.forEach(x => { x.disabled = true; if (+x.dataset.k === q.a) x.classList.add("ok"); }); if (k !== q.a) btns[k].classList.add("no");
   const ex = $("#qe"+i); ex.innerHTML = (k===q.a ? "<b>Correct.</b> " : "<b>Not quite.</b> " + (q.w && q.w[k] ? esc(q.w[k]) + " " : "")) + esc(q.e);
   if (fresh){ prog.quiz[m.id+":"+i] = k; saveProg(); logEvent(m.id, "q"+(i+1), "quiz", (k===q.a ? "correct" : "incorrect") + "|" + k);
     if (k === q.a) pop(btns[k], 1.04); else A(btns[k], {x:[0,-9,9,-6,6,0]}, {duration:.42});
     A(ex, {opacity:[0,1], y:[-6,0]}, {duration:.3}); score(); updateModuleProgress(m); checkModuleDone(m); renderMap(); } }
}
function renderRating(m){
  const box = $("#rating"); box.innerHTML = m.rating.map((r,i)=>`<label><input type="radio" name="rate" value="${i+1}" ${prog.rating[m.id]==i+1?"checked":""}><span><b>Level ${i+1}.</b> ${esc(r)}</span></label>`).join("");
  box.querySelectorAll("input").forEach(x => x.onchange = () => { prog.rating[m.id] = +x.value; saveProg(); logEvent(m.id, "rating", "self_rating", x.value); toast("Self-rating saved."); pop(x.closest("label"), 1.02); updateModuleProgress(m); checkModuleDone(m); renderMap(); });
}
function setupUpload(m){
  const list = () => { const ups = (prog.uploads||[]).filter(u => u.module === m.id); $("#uplist").innerHTML = ups.length ? "Uploaded: " + ups.map(u => esc(u.name)).join(", ") : ""; };
  const d = $("#drop");
  const send = async file => {
    $("#upErr").textContent = "";
    if (!file) return; if (file.size > CONFIG.MAX_UPLOAD_MB*1024*1024) return $("#upErr").textContent = `This file is larger than ${CONFIG.MAX_UPLOAD_MB} MB. Compress it or upload a smaller version.`;
    if (!apiReady()) return $("#upErr").textContent = "Uploads are not connected yet (preview mode). Ask your teacher to connect the course server, or keep the file and submit it another way.";
    $("#upErr").textContent = "Uploading " + file.name + "…"; d.classList.add("busy");
    const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
    const resp = await api("upload", {moduleId:m.id, fileName:file.name, mimeType:file.type || "application/octet-stream", data}, false);
    d.classList.remove("busy");
    if (resp.ok){ prog.uploads.push({module:m.id, name:file.name, ts:Date.now()}); saveProg(); $("#upErr").textContent = ""; toast("Uploaded " + file.name); list(); logEvent(m.id, "upload", "upload", file.name); pop(d, 1.02); }
    else { $("#upErr").textContent = ({file_type_not_allowed:"This file type is not accepted. Use an image, PDF, Office file, CSV, code file, ZIP, or video.", file_too_large:"This file is too large.", daily_upload_limit:"You have reached today's upload limit. Try again tomorrow.", network:"The upload did not reach the server. Check your connection and try again."})[resp.error] || "Upload failed: " + (resp.error || "unknown error"); A(d, {x:[0,-8,8,-4,4,0]}, {duration:.4}); }
  };
  $("#file").onchange = e => send(e.target.files[0]);
  d.ondragover = e => { e.preventDefault(); d.classList.add("over"); }; d.ondragleave = () => d.classList.remove("over");
  d.ondrop = e => { e.preventDefault(); d.classList.remove("over"); send(e.dataTransfer.files[0]); };
  list();
}
function viewProgress(){
  const mods = Object.values(MODULES);
  $("#view").innerHTML = `<p class="crumb">My progress</p><h1>My progress</h1>
   <div class="bento"><div class="spot span3"><div class="big" data-tick="${((prog.minutes||0)/60).toFixed(1)}" data-dec="1" data-suf=" h">0</div><div class="lbl">active time on this device</div></div>
    <div class="spot span3"><div class="big" data-tick="${reqCount()[0]}">0</div><div class="lbl">required modules complete of ${reqCount()[1]} (finish any one IoT track)</div></div>
    <div class="spot span3"><div class="big" data-tick="${Object.keys(prog.act || {}).filter(k => /^sb_|^as_|^web_|^db_/.test(k) && prog.act[k] === "pass").length}">0</div><div class="lbl">sandbox challenges passed</div></div>
    ${badgeStripHTML()}
    <div class="spot span3"><div class="big" data-tick="${(store.get(aiLogKey(), []) || []).length}">0</div><div class="lbl">entries in my AI-use log</div></div>
    ${mods.map(m => { const qa = m.quiz.map((q,i)=>prog.quiz[m.id+":"+i]); const ans = qa.filter(x=>x!=null).length;
      return `<a class="spot mod-card span3" href="#/m/${m.id}"><span class="num">Module ${m.id}</span><h3>${esc(m.title)}</h3>
       <div class="kv"><span>Progress</span><b>${Math.round(modulePct(m)*100)}%</b><span>Quiz</span><b>${ans?quizScore(m)+" / "+m.quiz.length:"not started"}</b><span>Self-rating</span><b>${prog.rating[m.id]?"Level "+prog.rating[m.id]:"not yet"}</b><span>Uploads</span><b>${(prog.uploads||[]).filter(u=>u.module===m.id).length}</b></div>
       <div class="bar"><i data-w="${Math.round(modulePct(m)*100)}"></i></div></a>`; }).join("")}</div>
   <div class="controls"><button class="btn" id="dlProg">Download my progress summary (.csv)</button></div>
   <p class="explain">${apiReady() ? "Your teacher sees your time, progress, and uploads from all your devices in the course records." : "Preview mode: your progress is saved on this device only."}</p>`;
  $("#dlProg").onclick = () => { const rows = [["module","title","progress_pct","quiz_score","quiz_total","self_rating","uploads"]].concat(mods.map(m => [m.id, m.title, Math.round(modulePct(m)*100), quizScore(m), m.quiz.length, prog.rating[m.id] || "", (prog.uploads||[]).filter(u=>u.module===m.id).length]));
    downloadText("my_progress_" + (user.givenName || "learner") + ".csv", rows.map(r => r.map(c => /[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g,'""')}"` : c).join(",")).join("\n"), "text/csv"); };
  document.querySelectorAll("[data-tick]").forEach(el => tick(el, +el.dataset.tick, +(el.dataset.dec||0), el.dataset.suf||""));
  document.querySelectorAll(".mod-card .bar i").forEach(i => { if (canAnim()) A(i, {width:["0%", i.dataset.w + "%"]}, {duration:1, delay:.2}); i.style.width = i.dataset.w + "%"; });
  A(document.querySelectorAll(".bento .spot"), {opacity:[0,1], y:[20,0]}, {delay:stag(0.04), duration:.5});
  spotify($("#view"));
}

/* ============ COMMAND PALETTE ============ */
function buildIndex(){ const out = []; Object.values(MODULES).forEach(m => { out.push({t:`Module ${m.id}: ${m.title}`, sub:"Module", h:`#/m/${m.id}`, k:m.objectives.join(" ")}); m.sections.forEach(s => out.push({t:s.title, sub:`Module ${m.id}`, h:`#/m/${m.id}?s=${s.id}`, k:(s.keys || "")})); });
  GLOSSARY.forEach(g => out.push({t:g[0], sub:"Glossary", h:"#/glossary?q=" + encodeURIComponent(g[0]), k:g[1]}));
  out.push({t:"Sandbox lab", sub:"Page", h:"#/lab"}, {t:"My AI-use log", sub:"Page", h:"#/ailog"}, {t:"My progress", sub:"Page", h:"#/progress"}, {t:"Course home", sub:"Page", h:"#/home"}, {t:"Course overview", sub:"Page", h:"#/overview"}, {t:"References (APA)", sub:"Page", h:"#/references"}, {t:"Glossary", sub:"Page", h:"#/glossary"}, {t:"Settings", sub:"Page", h:"settings"}); return out; }
function openPalette(){
  if (!user) return; const dlg = $("#palette"), inp = $("#palInput"), list = $("#palList"), idx = buildIndex(); let sel = 0, items = idx;
  const draw = () => { list.innerHTML = items.slice(0,40).map((it,i)=>`<a href="${it.h}" class="${i===sel?"sel":""}" data-i="${i}"><span>${esc(it.t)}</span><small>${esc(it.sub)}</small></a>`).join("") || `<p class="explain" style="padding:10px 12px">No matches. Try a module number like 2.3, or a word like "pull-up".</p>`;
    list.querySelectorAll("a").forEach(a => a.onclick = e => { e.preventDefault(); go(items[+a.dataset.i]); }); const s = list.querySelector(".sel"); if (s) s.scrollIntoView({block:"nearest"}); };
  const go = it => { dlg.close(); if (!it) return; if (it.h === "settings") return $("#settings").showModal(); location.hash = it.h; };
  inp.value = ""; draw(); dlg.showModal(); if (device !== "phone") inp.focus(); A(dlg, {opacity:[0,1], scale:[.97,1], y:[-8,0]}, SPRING);
  inp.oninput = () => { const q = inp.value.toLowerCase().trim(); items = q ? idx.filter(it => (it.t + " " + it.sub).toLowerCase().includes(q)).concat(idx.filter(it => !(it.t + " " + it.sub).toLowerCase().includes(q) && (it.k || "").toLowerCase().includes(q))) : idx; sel = 0; draw(); };
  inp.onkeydown = e => { if (e.key==="ArrowDown"){ sel = Math.min(sel+1, items.length-1); draw(); e.preventDefault(); } else if (e.key==="ArrowUp"){ sel = Math.max(sel-1, 0); draw(); e.preventDefault(); } else if (e.key==="Enter"){ go(items[sel]); e.preventDefault(); } };
}
addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"){ e.preventDefault(); openPalette(); } });

/* ============ DEVICE ADAPTATION ============ */
let device = "laptop";
function detectDevice(){
  const w = innerWidth, ua = navigator.userAgent, coarse = matchMedia("(pointer: coarse)").matches;
  const iPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const androidTablet = /Android/.test(ua) && !/Mobile/.test(ua);
  if (w < 600) return "phone";
  if (iPad || androidTablet) return "tablet";
  if (/iPhone|iPod|Android.+Mobile/.test(ua) && w < 950) return "phone";
  if (coarse && w <= 1366) return "tablet";
  return w < 1440 ? "laptop" : "desktop";
}
function applyDevice(){
  const d = detectDevice(), root = document.documentElement;
  root.dataset.orient = innerWidth > innerHeight ? "landscape" : "portrait";
  if (d === device && root.dataset.device) return;
  device = d; root.dataset.device = d;
  if (d !== "desktop") document.body.classList.remove("ai-docked");
  else if (aiOpen) document.body.classList.add("ai-docked");
}
addEventListener("resize", () => { clearTimeout(applyDevice.t); applyDevice.t = setTimeout(applyDevice, 150); });
addEventListener("orientationchange", () => setTimeout(applyDevice, 200));
