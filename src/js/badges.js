/* ============ BADGES ============
   Earned automatically from what learners actually do. Stored on the device and synced to the
   server inside the progress record (as activity "badge_<id>"), so they follow the learner. */
const BADGE_ICONS = {
  spark:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  wrench:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  rocket:'<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 12l3 3M14.5 4.5C17 2 21 3 21 3s1 4-1.5 6.5L13 16l-5-5z"/><circle cx="15.5" cy="8.5" r="1.5"/>',
  trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  bug:'<rect x="8" y="7" width="8" height="12" rx="4"/><path d="M12 7V4M9 4l1.5 2M15 4l-1.5 2M4 11h4M16 11h4M4 16h4M16 16h4"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  wave:'<path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/><path d="M2 17c2-4 4-4 6 0s4 4 6 0 4-4 6 0" opacity=".5"/>',
  code:'<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  scroll:'<path d="M7 3h11a2 2 0 0 1 2 2v12H9v2a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2z"/><path d="M9 8h7M9 12h7"/>',
  plug:'<path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0zM12 17v5"/>',
  brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  growth:'<path d="M3 20h18M6 16v-4M11 16V9M16 16V5"/><path d="m14 7 2-2 2 2"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  leaf:'<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z"/><path d="M5 19 13 11"/>',
  flame:'<path d="M12 22c4 0 7-3 7-7 0-5-4-7-5-12-3 3-4 5-4 8-1-1-2-2-2-4-2 2-3 5-3 8 0 4 3 7 7 7z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  flask:'<path d="M9 3h6M10 3v6L4 19a1.5 1.5 0 0 0 1.3 2h13.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>'
};
const BADGE_CATS = {milestone:["Milestones","#3730A3"], skill:["Skills","#C2410C"], ai:["AI literacy","#7C3AED"], habit:["Habits","#A16207"]};
const bAct = id => (prog.act || {})[id];
const bPassed = ids => ids.filter(id => bAct(id) === "pass").length;
const bDone = ids => ids.filter(id => bAct(id)).length;
const unitIdx = n => COURSE[n - 1] ? COURSE[n - 1].modules : [];
const unitPct = n => { const ms = unitIdx(n), core = ms.filter(m => !m.track), tr = ms.filter(m => m.track), tot = core.length + (tr.length ? 1 : 0); return (core.filter(m => modulePct(m) === 1).length + (tr.some(m => modulePct(m) === 1) ? 1 : 0)) / (tot || 1); };
const perfectQuizzes = () => Object.values(MODULES).filter(m => m.quiz && m.quiz.length && m.quiz.every((q, i) => prog.quiz[m.id + ":" + i] === q.a)).length;
const daysKey = () => "sss_days_" + (user ? user.email : "g");
const activeDays = () => (store.get(daysKey(), []) || []).length;
const SENSOR_ANIMS = ["dhtInside","sonarViz","ldrViz","mqViz","pirViz","servoViz"];
const SENSOR_MISSIONS = ["sb_dht","sb_tmp36","sb_ldr","sb_mq","sb_sonar","sb_pir"];
const ACTUATOR_MISSIONS = ["sb_fade","sb_rgb","sb_buzzer","sb_servo","sb_motor"];
const TRACK_MISSIONS = ["sb_logger","sb_fb2","sb_aws","sb_mqtt","sb_blynk","sb_ts"];
const DATA_MISSIONS = ["sb_stats","sb_filter","sb_anomaly"];
/* [id, name, category, icon, how to earn, progress() -> [have, need]] */
const BADGES = [
  ["first_spark","First Spark","milestone","spark","Take the pre-test and start the course.", () => [preDone() ? 1 : 0, 1]],
  ["foundations","Foundations Builder","milestone","chip","Complete every module in Unit 1.", () => [Math.round(unitPct(1) * unitIdx(1).length), unitIdx(1).length]],
  ["prototyper","Prototyper","milestone","wrench","Complete every module in Unit 2 (sensors and actuators).", () => [Math.round(unitPct(2) * unitIdx(2).length), unitIdx(2).length]],
  ["web_connector","Cloud Connector","milestone","globe","Finish the core module and one IoT track in Unit 3.", () => [Math.round(unitPct(3) * unitIdx(3).length), unitIdx(3).length]],
  ["data_scientist","Data Scientist","milestone","brain","Complete every module in Unit 4.", () => [Math.round(unitPct(4) * unitIdx(4).length), unitIdx(4).length]],
  ["product_maker","Product Maker","milestone","rocket","Complete every module in Unit 5 (capstone).", () => [Math.round(unitPct(5) * unitIdx(5).length), unitIdx(5).length]],
  ["graduate","Sense, Send, Solve","milestone","trophy","Pass the post-test and earn your certificate.", () => [tGet().cert ? 1 : 0, 1]],
  ["bug_squasher","Bug Squasher","skill","bug","Pass 5 sandbox challenges (virtual board, Apps Script, or web).", () => [Math.min(5, Object.keys(prog.act || {}).filter(k => /^(sb_|as_|web_)/.test(k) && prog.act[k] === "pass").length), 5]],
  ["sensor_scout","Sensor Scout","skill","target","Pass the mission for all 6 sensors on the virtual board (DHT, TMP36, light, gas, distance, motion).", () => [bPassed(SENSOR_MISSIONS), SENSOR_MISSIONS.length]],
  ["mission_master","Mission Master","skill","star","Pass every Mission Lab challenge.", () => { const ids = typeof SB !== "undefined" ? Object.keys(SB) : []; return [bPassed(ids), ids.length]; }],
  ["actuator_ace","Actuator Ace","skill","wrench","Pass the LED fade, RGB, buzzer, servo, and motor missions.", () => [bPassed(ACTUATOR_MISSIONS), ACTUATOR_MISSIONS.length]],
  ["track_finisher","Track Finisher","skill","globe","Pass the mission for any IoT track (A–E).", () => [bPassed(TRACK_MISSIONS) > 0 ? 1 : 0, 1]],
  ["data_detective","Data Detective","skill","eye","Pass the statistics, filter, and anomaly missions.", () => [bPassed(DATA_MISSIONS), DATA_MISSIONS.length]],
  ["wiring_pro","Wiring Pro","skill","plug","Wire 7 Mission Lab circuits correctly.", () => [Math.min(7, Object.keys(prog.act || {}).filter(k => /^wire_/.test(k)).length), 7]],
  ["script_wizard","Script Wizard","skill","scroll","Pass every Apps Script sandbox challenge.", () => { const ids = typeof AS !== "undefined" ? Object.keys(AS) : []; return [bPassed(ids), ids.length]; }],
  ["web_builder","Web Builder","skill","code","Finish the guided web tutorial and all 4 web challenges.", () => { const ids = typeof WEB !== "undefined" ? Object.keys(WEB) : []; return [bPassed(ids) + (bAct("webTutorial") ? 1 : 0), ids.length + 1]; }],
  ["sharp_mind","Sharp Mind","skill","brain","Answer every quiz question correctly in 5 modules.", () => [Math.min(5, perfectQuizzes()), 5]],
  ["top_of_class","Top of the Class","skill","star","Score 90% or more on the post-test.", () => [postBest() >= 90 ? 1 : 0, 1]],
  ["growth_mindset","Growth Mindset","skill","growth","Improve by 30 points or more from the pre-test to the post-test.", () => { const t = tGet(); return [t.pre && postBest() - t.pre.percent >= 30 ? 1 : 0, 1]; }],
  ["curious_mind","Curious Mind","skill","wave","Explore all 6 “how it works” animations.", () => [bDone(SENSOR_ANIMS), SENSOR_ANIMS.length]],
  ["transparent_maker","Transparent Maker","ai","shield","Record 5 entries in your AI-use log.", () => [Math.min(5, (store.get(aiLogKey(), []) || []).length), 5]],
  ["change_maker","Change Maker","habit","leaf","Choose an SDG target for your project (Module 5.1).", () => { try { return [getProject().sdg ? 1 : 0, 1]; } catch(e){ return [0, 1]; } }],
  ["feedback_hero","Feedback Hero","habit","chat","Send feedback on 3 modules and on the whole course.", () => { const F = fbGet(); return [Math.min(3, Object.keys(F.mod || {}).length) + (F.course ? 1 : 0), 4]; }],
  ["on_a_roll","On a Roll","habit","flame","Learn on 3 different days.", () => [Math.min(3, activeDays()), 3]],
  ["dedicated","Dedicated Maker","habit","clock","Spend 10 active hours in the course.", () => [Math.min(10, Math.floor((prog.minutes || 0) / 60)), 10]],
  ["explorer","Lab Explorer","habit","map","Try 25 different interactive activities.", () => [Math.min(25, Object.keys(prog.act || {}).filter(k => !/^(badge_|wire_)/.test(k)).length), 25]]
];
const bKey = () => "sss_badges_" + (user ? user.email : "g");
const earned = () => store.get(bKey(), {}) || {};
function badgeSVG(b, on, size){
  const c = on ? BADGE_CATS[b[2]][1] : "#9AA8A1", s = size || 64;
  return `<svg class="bdg-svg ${on ? "on" : ""}" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 3 57 17v30L32 61 7 47V17z" fill="${on ? c : "var(--bg)"}" stroke="${c}" stroke-width="2.5"/>
    <path d="M32 9 52 20.5v23L32 55 12 43.5v-23z" fill="none" stroke="${on ? "rgba(255,255,255,.35)" : "var(--line)"}" stroke-width="1.5"/>
    <g transform="translate(20 20)" fill="none" stroke="${on ? "#fff" : c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${BADGE_ICONS[b[3]] || BADGE_ICONS.star}</g></svg>`;
}
/* Check every badge; celebrate the new ones. Called after progress changes (debounced). */
let badgeQuiet = !!store.get("sss_quiet_badges", false);   // automated tests set this to skip the pop-up
function checkBadges(){
  if (!user) return;
  try { const d = new Date().toISOString().slice(0, 10), days = store.get(daysKey(), []) || []; if (!days.includes(d)){ days.push(d); store.set(daysKey(), days.slice(-400)); } } catch(e){}
  const E = earned(), fresh = [];
  BADGES.forEach(b => { if (E[b[0]]) return; let p; try { p = b[5](); } catch(e){ return; }
    const fromServer = bAct("badge_" + b[0]);
    if ((p[1] > 0 && p[0] >= p[1]) || fromServer){ E[b[0]] = Date.now(); if (!fromServer){ fresh.push(b); markAct("badge_" + b[0], "earned"); } } });
  if (!Object.keys(E).length && !fresh.length) return;
  store.set(bKey(), E);
  if (fresh.length && !badgeQuiet) celebrateBadges(fresh);
  if (fresh.length) renderBadgeCount();
}
function queueBadgeCheck(){ clearTimeout(queueBadgeCheck.t); queueBadgeCheck.t = setTimeout(checkBadges, 400); }
function renderBadgeCount(){ const el = $("#bdgCount"); if (el) el.textContent = Object.keys(earned()).length + "/" + BADGES.length; }
function celebrateBadges(list){
  let d = $("#bdgDlg"); if (!d){ d = document.createElement("dialog"); d.id = "bdgDlg"; d.className = "bdg-dlg"; document.body.appendChild(d); }
  const one = list.length === 1;
  d.innerHTML = `<div class="bdg-pop"><p class="bdg-k">${one ? "New badge" : list.length + " new badges"}</p>
    <div class="bdg-pop-row">${list.slice(0, 6).map(b => `<div class="bdg-pop-i">${badgeSVG(b, true, one ? 112 : 72)}<b>${esc(b[1])}</b>${one ? `<span>${esc(b[4])}</span>` : ""}</div>`).join("")}</div>
    ${list.length > 6 ? `<p class="explain">…and ${list.length - 6} more.</p>` : ""}
    <div class="controls" style="justify-content:center"><button class="btn primary" id="bdgOk" type="button">Nice!</button><a class="btn" href="#/badges" id="bdgAll">See all badges</a></div></div>`;
  try { d.showModal(); } catch(e){ return; }
  A(d.querySelectorAll(".bdg-svg"), {scale:[.3, 1.12, 1], rotate:[-25, 6, 0]}, {duration:.7, delay:stag(0.08)});
  confetti();
  $("#bdgOk").onclick = () => d.close(); $("#bdgAll").onclick = () => d.close();
}
function viewBadges(){
  const E = earned(), n = Object.keys(E).length;
  $("#view").innerHTML = `<p class="crumb">My badges</p><h1>My badges</h1>
   <p class="lede-mod">You have earned <b>${n}</b> of ${BADGES.length} badges. Badges are earned automatically from what you do in the course: finishing units, passing missions, using AI responsibly, and learning steadily.</p>
   <div class="meter bdg-meter"><i style="width:${n / BADGES.length * 100}%"></i></div>
   ${Object.keys(BADGE_CATS).map(cat => `<h2>${BADGE_CATS[cat][0]}</h2><div class="bdg-grid">${BADGES.filter(b => b[2] === cat).map(b => { const on = !!E[b[0]]; let p = [0, 1]; try { p = b[5](); } catch(e){}
     return `<div class="bdg-card ${on ? "on" : ""}" style="--bc:${BADGE_CATS[cat][1]}">${badgeSVG(b, on, 72)}<div class="bdg-tx"><b>${esc(b[1])}</b><span>${esc(b[4])}</span>
      ${on ? `<em>Earned ${new Date(E[b[0]]).toLocaleDateString()}</em>` : `<div class="bdg-prog"><i style="width:${Math.min(100, p[0] / (p[1] || 1) * 100)}%"></i></div><em>${p[0]} of ${p[1]}</em>`}</div></div>`; }).join("")}</div>`).join("")}`;
  A(document.querySelectorAll(".bdg-card"), {opacity:[0, 1], y:[12, 0]}, {delay:stag(0.025), duration:.35});
}
/* small strip for the home page */
function badgeStripHTML(){
  const E = earned(), got = BADGES.filter(b => E[b[0]]).sort((a, b) => E[b[0]] - E[a[0]]);
  const next = BADGES.filter(b => !E[b[0]]).map(b => { let p = [0, 1]; try { p = b[5](); } catch(e){} return [b, p[0] / (p[1] || 1)]; }).sort((a, b) => b[1] - a[1])[0];
  return `<a class="spot span6 bdg-strip" href="#/badges"><div><span class="lbl">Badges</span><h3>${got.length} of ${BADGES.length} earned</h3>${next ? `<span class="lbl">Next up: <b>${esc(next[0][1])}</b> · ${esc(next[0][4])}</span>` : `<span class="lbl">You earned every badge!</span>`}</div>
    <div class="bdg-mini">${(got.length ? got.slice(0, 6) : BADGES.slice(0, 3)).map(b => badgeSVG(b, !!E[b[0]], 44)).join("")}</div></a>`;
}
