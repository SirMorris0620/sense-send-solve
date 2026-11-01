/* ============ PRESENTER MODE (admins) ============
   Turns a module into slides for the projector: a title slide, one slide per section (with the live
   interactives), check-for-understanding slides from the quiz, and a wrap-up. A second window
   ("presenter view") shows the current and next slide, teaching notes, and timers, kept in sync
   with BroadcastChannel. */
const canPresent = () => isAdmin() || !!adminSess();
const presChan = ("BroadcastChannel" in window) ? new BroadcastChannel("sss-present") : null;
let PRES = null;   // {m, slides, i, start, moved:[], black, countdownEnd}
const pnKey = () => "sss_pnotes_" + (user ? user.email : (adminSess() || {}).email || "g");

function presSlides(m){
  const s = [{kind:"title", title:m.title}];
  m.sections.forEach(sec => s.push({kind:"section", id:sec.id, title:sec.title, sec}));
  (m.quiz || []).forEach((q, i) => s.push({kind:"quiz", qi:i, title:"Check for understanding " + (i + 1)}));
  s.push({kind:"wrap", title:"Wrap-up and checkpoint"});
  return s;
}
/* Suggested minutes per slide: the module's time split by how much each section contains. */
function presMinutes(m, slide){
  if (slide.kind === "title") return 3; if (slide.kind === "quiz") return 2; if (slide.kind === "wrap") return 5;
  const w = sec => (String(typeof sec.html === "function" ? "" : sec.html).replace(/<[^>]+>/g, "").length + (sec.interactive ? 1500 * [].concat(sec.interactive).length : 0));
  const total = m.sections.reduce((a, sec) => a + w(sec), 0) || 1, budget = Math.max(10, m.minutes - 3 - 5 - 2 * (m.quiz || []).length);
  return Math.max(2, Math.round(budget * w(slide.sec) / total));
}
/* Facilitation prompts generated from what is on the slide. */
function presAutoNotes(m, slide){
  if (slide.kind === "title") return ["Share the objectives and the checkpoint task first, so learners know where the session ends.", "Ask: “What do you already know about " + m.title.split(":")[0].toLowerCase() + "?” Take two or three answers."];
  if (slide.kind === "quiz"){ const q = m.quiz[slide.qi]; return ["Give 30 seconds of silent thinking, then a show of hands (or fingers 1–4) before you reveal.", "Correct answer: " + q.o[q.a] + ".", "Ask a learner who chose a different option to explain their thinking first."]; }
  if (slide.kind === "wrap") return ["Read the checkpoint task aloud and show where to upload the output.", "Exit ticket: one thing learned, one question still open.", "Remind learners to mark sections as done and fill in the self-rating on their own devices."];
  const n = [], ints = slide.sec.interactive ? [].concat(slide.sec.interactive) : [], html = String(typeof slide.sec.html === "function" ? "" : slide.sec.html);
  ints.forEach(x => {
    if (/^sandbox:/.test(x)) n.push("Mission Lab: pairs wire it first, then code it. Circulate; ask “What does the Serial Monitor tell you?” before giving hints.");
    else if (/^(as|web):/.test(x)) n.push("Sandbox challenge: learners attempt on their own devices for 5–8 minutes, then share one fix with a neighbor.");
    else if (/Viz|Inside|anim|Journey|cycle/i.test(x)) n.push("Animation: Predict–Observe–Explain. Ask learners to predict what happens, run it, then explain the difference.");
    else n.push("Interactive (" + x + "): demonstrate once on the projector, then let learners try it on their devices.");
  });
  if (/<table/i.test(html)) n.push("Table: ask learners to compare two columns and say one difference in their own words.");
  if (/class="callout aic|AI rule|Proto/i.test(html)) n.push("AI moment: model the six rules. Attempt first, then prompt with PARTS, then verify.");
  if (/mis\(|Common mistake|Watch out/i.test(html)) n.push("Highlight the common mistake on this slide; ask who has made it before.");
  if (!n.length) n.push("Explain in 2–3 minutes, then check understanding with a quick question.");
  return n;
}
function presState(){ if (!PRES) return null; const s = PRES.slides, i = PRES.i, notes = store.get(pnKey(), {}), key = PRES.m.id + "|" + (s[i].id || s[i].kind + (s[i].qi != null ? s[i].qi : ""));
  return {module:PRES.m.id, moduleTitle:PRES.m.title, i, n:s.length, title:s[i].title, next:s[i + 1] ? s[i + 1].title : "(end)", minutes:presMinutes(PRES.m, s[i]),
    auto:presAutoNotes(PRES.m, s[i]), mine:notes[key] || "", key, start:PRES.start, slideStart:PRES.slideStart, countdownEnd:PRES.countdownEnd || 0, black:!!PRES.black,
    outline:s.map(x => x.title), plan:s.map(x => presMinutes(PRES.m, x))}; }
function presBroadcast(){ if (presChan && PRES) presChan.postMessage({type:"state", state:presState()}); }

function startPresenting(id){
  const m = MODULES[id]; if (!m || !canPresent()) return;
  if (location.hash.split("?")[0] !== "#/m/" + id){ location.hash = "#/m/" + id; setTimeout(() => startPresenting(id), 400); return; }
  stopPresenting(true);
  PRES = {m, slides:presSlides(m), i:0, start:Date.now(), slideStart:Date.now(), moved:[], black:false, countdownEnd:0};
  const o = document.createElement("div"); o.id = "pres"; o.setAttribute("role", "dialog"); o.setAttribute("aria-label", "Presentation: " + m.title);
  o.innerHTML = `<div class="pres-stage" id="presStage"></div><div class="pres-black" id="presBlack" hidden></div>
   <div class="pres-bar" id="presBar"><button class="pres-b" id="pPrev" title="Previous (←)" aria-label="Previous slide">◀</button><span class="pres-n" id="pN"></span><button class="pres-b" id="pNext" title="Next (→ or Space)" aria-label="Next slide">▶</button>
    <div class="pres-prog"><i id="pProg"></i></div><span class="pres-clock mono" id="pClock">0:00</span><span class="pres-cd mono" id="pCd" hidden></span>
    <button class="pres-b" data-cd="3" title="3-minute countdown">3′</button><button class="pres-b" data-cd="5" title="5-minute countdown">5′</button><button class="pres-b" data-cd="10" title="10-minute countdown">10′</button>
    <button class="pres-b" id="pBlack" title="Blank the screen (B)">B</button><button class="pres-b" id="pFull" title="Full screen (F)">⛶</button><button class="pres-b pres-wide" id="pView" title="Open presenter view in a new window (P)">Presenter view</button><button class="pres-b pres-wide" id="pExit" title="Exit (Esc)">Exit</button></div>`;
  document.body.appendChild(o); document.body.classList.add("presenting");
  $("#pPrev").onclick = () => presGo(PRES.i - 1); $("#pNext").onclick = () => presGo(PRES.i + 1);
  $("#pBlack").onclick = presToggleBlack; $("#pFull").onclick = presFullscreen; $("#pView").onclick = openPresenterView; $("#pExit").onclick = () => stopPresenting();
  o.querySelectorAll("[data-cd]").forEach(b => b.onclick = () => presCountdown(+b.dataset.cd));
  $("#presBlack").onclick = presToggleBlack;
  document.addEventListener("keydown", presKeys);
  PRES.tick = setInterval(presTick, 500);
  presGo(0); logEvent(id, "present", "present_start", String(PRES.slides.length));
}
function presRestore(){ (PRES && PRES.moved || []).forEach(([el, ph]) => { if (ph.parentNode) ph.parentNode.replaceChild(el, ph); }); if (PRES) PRES.moved = []; }
function presGo(i){
  if (!PRES) return; i = Math.max(0, Math.min(PRES.slides.length - 1, i)); presRestore(); PRES.i = i; PRES.slideStart = Date.now();
  const s = PRES.slides[i], m = PRES.m, st = $("#presStage"); st.scrollTop = 0; st.className = "pres-stage pres-" + s.kind;
  if (s.kind === "title"){
    st.innerHTML = `<div class="pres-title"><p class="pres-k">${esc(unitOf(m.id).title.split(":")[0])} • Module ${esc(m.id)}</p><h1>${esc(m.title)}</h1>${m.intro ? `<p class="pres-lede">${m.intro}</p>` : ""}
      <div class="pres-obj"><b>By the end of this session, you will be able to:</b><ul>${m.objectives.map(o => `<li>${esc(o)}</li>`).join("")}</ul></div>
      <p class="pres-meta">About ${m.minutes} minutes · Checkpoint ${esc(m.checkpoint.code)} · Follow along: open Module ${esc(m.id)} on your device</p></div>`;
  } else if (s.kind === "section"){
    const el = document.getElementById("s-" + s.id);
    st.innerHTML = `<div class="pres-sec"><p class="pres-k">${esc(m.id)} · ${i} of ${m.sections.length}</p></div>`;
    if (el){ const ph = document.createComment("pres"); el.parentNode.replaceChild(ph, el); PRES.moved.push([el, ph]); st.firstChild.appendChild(el); el.style.opacity = ""; el.style.transform = ""; }
  } else if (s.kind === "quiz"){
    const q = m.quiz[s.qi];
    st.innerHTML = `<div class="pres-quiz"><p class="pres-k">Check for understanding · ${s.qi + 1} of ${m.quiz.length}</p><h2>${esc(q.q)}</h2>
      <ol class="pres-opts" type="A">${q.o.map((o, k) => `<li data-k="${k}">${esc(o)}</li>`).join("")}</ol>
      <div class="controls"><button class="btn primary" id="pReveal" type="button">Reveal answer</button></div><div class="pres-exp" id="pExp" hidden><b>Answer: ${"ABCD"[q.a]}.</b> ${esc(q.e || "")}</div></div>`;
    $("#pReveal").onclick = () => { st.querySelectorAll(".pres-opts li").forEach(li => li.classList.add(+li.dataset.k === q.a ? "ok" : "dim")); $("#pExp").hidden = false; $("#pReveal").hidden = true; presBroadcast(); };
  } else {
    st.innerHTML = `<div class="pres-title"><p class="pres-k">Wrap-up</p><h1>Checkpoint ${esc(m.checkpoint.code)}</h1>
      <div class="pres-obj"><b>Task</b><p>${esc(m.checkpoint.task)}</p><b>Met when</b><p>${esc(m.checkpoint.met)}</p><b>Upload</b><p>${esc(m.checkpoint.upload)}</p></div>
      <p class="pres-meta">On your device: mark sections as done, answer the quiz, choose your self-rating, and upload your output in Module ${esc(m.id)}.</p></div>`;
  }
  $("#pN").textContent = `${i + 1} / ${PRES.slides.length}`; $("#pProg").style.width = ((i + 1) / PRES.slides.length * 100) + "%";
  A(st.firstElementChild, {opacity:[0, 1], x:[24, 0]}, {duration:.3});
  presBroadcast();
}
function presKeys(e){
  if (!PRES || /input|textarea|select/i.test((e.target.tagName || "")) || e.target.isContentEditable) return;
  const k = e.key;
  if (k === "ArrowRight" || k === "PageDown" || (k === " " && !e.shiftKey)){ e.preventDefault(); presGo(PRES.i + 1); }
  else if (k === "ArrowLeft" || k === "PageUp" || (k === " " && e.shiftKey)){ e.preventDefault(); presGo(PRES.i - 1); }
  else if (k === "Home"){ presGo(0); } else if (k === "End"){ presGo(PRES.slides.length - 1); }
  else if (k === "b" || k === "B" || k === "."){ presToggleBlack(); }
  else if (k === "f" || k === "F"){ presFullscreen(); }
  else if (k === "p" || k === "P"){ openPresenterView(); }
  else if (k === "Escape" && !document.fullscreenElement){ stopPresenting(); }
}
function presToggleBlack(){ if (!PRES) return; PRES.black = !PRES.black; $("#presBlack").hidden = !PRES.black; presBroadcast(); }
function presFullscreen(){ try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch(e){} }
function presCountdown(min){ if (!PRES) return; PRES.countdownEnd = min ? Date.now() + min * 60000 : 0; presBroadcast(); presTick(); }
const mmss = ms => { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
function presTick(){ if (!PRES || !$("#pClock")) return; $("#pClock").textContent = mmss(Date.now() - PRES.start);
  const cd = $("#pCd"); if (PRES.countdownEnd){ const left = PRES.countdownEnd - Date.now(); cd.hidden = false; cd.textContent = left > 0 ? "⏱ " + mmss(left) : "⏱ Time!"; cd.classList.toggle("done", left <= 0); } else cd.hidden = true; }
function stopPresenting(quiet){
  if (!PRES) return; presRestore(); clearInterval(PRES.tick); document.removeEventListener("keydown", presKeys);
  const o = $("#pres"); if (o) o.remove(); document.body.classList.remove("presenting");
  if (document.fullscreenElement) try { document.exitFullscreen(); } catch(e){}
  if (!quiet && presChan) presChan.postMessage({type:"ended"});
  PRES = null;
}
function openPresenterView(){ const w = window.open(location.pathname + "#/presenter", "b2bPresenter", "width=1100,height=720"); if (!w) toast("Allow pop-ups for this site to open the presenter view."); setTimeout(presBroadcast, 1200); }
if (presChan) presChan.onmessage = e => { const d = e.data || {};
  if (!PRES) return;
  if (d.type === "cmd"){ if (d.cmd === "next") presGo(PRES.i + 1); else if (d.cmd === "prev") presGo(PRES.i - 1); else if (d.cmd === "go") presGo(d.i); else if (d.cmd === "black") presToggleBlack(); else if (d.cmd === "countdown") presCountdown(d.min); else if (d.cmd === "hello") presBroadcast(); }
  if (d.type === "note"){ const notes = store.get(pnKey(), {}); notes[d.key] = d.text; store.set(pnKey(), notes); } };

/* ---- the presenter view (second window / second screen) ---- */
function viewPresenter(){
  document.body.classList.add("presenter-console");
  $("#view").innerHTML = `<div class="pv"><div class="pv-top"><b id="pvMod">Waiting for the presentation…</b><span class="mono pv-clock" id="pvClock">0:00</span></div>
   <div class="pv-grid"><div class="pv-now"><p class="pres-k">Now <span id="pvN"></span></p><h2 id="pvTitle">Open a module and press “Present”.</h2><p class="explain" id="pvMin"></p>
     <h3>Teaching notes</h3><ul id="pvAuto"></ul><label class="pv-mine"><b>My notes for this slide</b> <span class="explain">(saved on this device)</span><textarea class="dinput" id="pvMine" rows="4" placeholder="e.g. Show the photo of my own DHT module here."></textarea></label></div>
    <div class="pv-side"><p class="pres-k">Next</p><h3 id="pvNext">–</h3>
     <div class="pv-cd"><b>Activity timer</b><div class="pv-cd-v mono" id="pvCd">–</div><div class="controls"><button class="btn small" data-min="1">1′</button><button class="btn small" data-min="3">3′</button><button class="btn small" data-min="5">5′</button><button class="btn small" data-min="10">10′</button><button class="btn small" data-min="0">Stop</button></div></div>
     <p class="pres-k">Outline</p><ol class="pv-outline" id="pvOutline"></ol></div></div>
   <div class="pv-bar"><button class="btn big" id="pvPrev">◀ Previous</button><button class="btn big" id="pvBlack">Blank screen</button><button class="btn primary big" id="pvNextB">Next ▶</button></div></div>`;
  let st = null;
  const send = (cmd, extra) => presChan && presChan.postMessage(Object.assign({type:"cmd", cmd}, extra || {}));
  $("#pvPrev").onclick = () => send("prev"); $("#pvNextB").onclick = () => send("next"); $("#pvBlack").onclick = () => send("black");
  document.querySelectorAll(".pv-cd [data-min]").forEach(b => b.onclick = () => send("countdown", {min:+b.dataset.min}));
  $("#pvMine").oninput = e => { if (st && presChan) presChan.postMessage({type:"note", key:st.key, text:e.target.value}); };
  document.addEventListener("keydown", e => { if (/textarea|input/i.test(e.target.tagName)) return; if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); send("next"); } if (e.key === "ArrowLeft") send("prev"); if (e.key === "b") send("black"); });
  const draw = () => { if (!st) return;
    $("#pvMod").textContent = "Module " + st.module + ": " + st.moduleTitle; $("#pvN").textContent = (st.i + 1) + " / " + st.n; $("#pvTitle").textContent = st.title;
    $("#pvMin").textContent = "Suggested time: about " + st.minutes + " min" + (st.black ? " · Screen is blank" : "");
    $("#pvAuto").innerHTML = st.auto.map(x => `<li>${esc(x)}</li>`).join(""); if (document.activeElement !== $("#pvMine")) $("#pvMine").value = st.mine;
    $("#pvNext").textContent = st.next; $("#pvBlack").textContent = st.black ? "Show screen" : "Blank screen";
    $("#pvOutline").innerHTML = st.outline.map((t, k) => `<li class="${k === st.i ? "on" : k < st.i ? "past" : ""}"><button type="button" data-i="${k}">${esc(t)}</button><span>${st.plan[k]}′</span></li>`).join("");
    $("#pvOutline").querySelectorAll("button").forEach(b => b.onclick = () => send("go", {i:+b.dataset.i})); };
  if (presChan) presChan.onmessage = e => { const d = e.data || {}; if (d.type === "state"){ st = d.state; draw(); } if (d.type === "ended"){ st = null; $("#pvTitle").textContent = "The presentation ended."; } };
  setInterval(() => { if (!st) return; $("#pvClock").textContent = mmss(Date.now() - st.start) + " total · " + mmss(Date.now() - st.slideStart) + " on this slide";
    const cd = $("#pvCd"); if (st.countdownEnd){ const l = st.countdownEnd - Date.now(); cd.textContent = l > 0 ? mmss(l) : "Time!"; cd.classList.toggle("done", l <= 0); } else cd.textContent = "–"; }, 500);
  send("hello");
}
