/* ============ INTERACTIVES: UNIT 3 (extra, more hands-on) ============ */
/* tiny syntax coloring for HTML/CSS/JS samples (input is plain text) */
function hlCode(t, lang){ let s = esc(t);
  if (lang === "html") return s.replace(/(&lt;\/?)([a-zA-Z0-9!]+)/g, '$1<span class="hl-tag">$2</span>').replace(/([a-z-]+)=(&quot;|")(.*?)(&quot;|")/g, '<span class="hl-attr">$1</span>=<span class="hl-str">"$3"</span>');
  if (lang === "css") return s.replace(/^(\s*)([^{\n]+)(\{)/, '$1<span class="hl-tag">$2</span>$3').replace(/([a-z-]+)(\s*:)/g, '<span class="hl-attr">$1</span>$2');
  return s.replace(/(&quot;.*?&quot;|"[^"]*")/g, '<span class="hl-str">$1</span>').replace(/\b(function|const|let|return|if|new)\b/g, '<span class="hl-kw">$1</span>').replace(/(\/\/.*)$/, '<span class="hl-cm">$1</span>'); }

/* 3.3 HTML/CSS/JS layers: sample code beside the live page */
INTERACTIVES.webLayers = function(el){
  const L = {
    html:{name:"HTML", job:"structure", lines:[
      ['<h1>Room 204 • Live</h1>', "A heading. The tag name says what the content <b>is</b>, not how it looks."],
      ['<div class="cards">', "A container. The <code>class</code> is a label that CSS can use to style it."],
      ['  <div class="card" id="tempCard">', "One card. An <code>id</code> is a unique name, so JavaScript can find this exact element."],
      ['    Temperature <b id="temp">--</b>', "The <code>--</code> is a placeholder. JavaScript will replace it with the real value."],
      ['  </div>', "Closing tag: every opened element must be closed."],
      ['  <div class="card">Humidity <b id="pm">--</b></div>', "A second card, written on one line."],
      ['</div>', "Closes the container."],
      ['<p id="updated">Loading…</p>', "A status line. Users should always know how fresh the data is."]]},
    css:{name:"CSS", job:"appearance", lines:[
      ['body { font-family: system-ui; background: #EEF2FF; }', "A <b>rule</b>: a selector (<code>body</code>), then property: value pairs inside braces."],
      ['.cards { display: flex; gap: 12px; }', "A dot means “every element with this class”. Flexbox puts the cards side by side."],
      ['.card { background: white; padding: 14px;', "Padding is space inside the card, between its border and its content."],
      ['        border-radius: 12px; box-shadow: 0 2px 8px #0002; }', "Rounded corners and a soft shadow make it look like a card."],
      ['.card b { display: block; font-size: 1.8rem; }', "A <b>descendant</b> selector: only <code>&lt;b&gt;</code> elements inside a card. Big numbers are easy to read from far away."],
      ['.card.hot { background: #FDE2D6; }', "Two classes together: a card that also has the class <code>hot</code>. JavaScript adds that class."]]},
    js:{name:"JavaScript", job:"behavior", lines:[
      ['function update() {', "A <b>function</b>: a named block of steps you can run again and again."],
      ['  const t = 29.4 + Math.random() * 2.4;', "A pretend reading. In your real app, this value comes from your Google Sheet."],
      ['  document.getElementById("temp").textContent = t.toFixed(1) + " °C";', "Find the element with id <code>temp</code> and replace its text. <code>toFixed(1)</code> keeps one decimal."],
      ['  document.getElementById("pm").textContent = Math.round(55 + Math.random() * 10) + " %";', "The same idea for humidity. Always show the unit."],
      ['  document.getElementById("updated").textContent = "Updated " + new Date().toLocaleTimeString();', "Shows the time of the last update."],
      ['  document.getElementById("tempCard").classList.toggle("hot", t > 31);', "Adds the class <code>hot</code> when it is above 31 °C, and removes it otherwise. CSS then turns the card orange: JS changes the <b>state</b>, CSS decides the <b>look</b>."],
      ['}', "End of the function."],
      ['update();', "Run it once right away…"],
      ['setInterval(update, 2000);', "…then every 2000 ms (2 s)."]]}};
  const on = {html:true, css:false, js:false}; let tab = "html", sel = -1;
  el.innerHTML = bench("The three layers of a web page: code and result", `<p class="explain">Turn each layer on and watch the page change. The code on the left is exactly what runs on the right. Tap any line of code to see what it does.</p>
   <div class="controls wl-tog">${Object.keys(L).map(k => `<label class="chk"><input type="checkbox" data-k="${k}" ${on[k] ? "checked" : ""} ${k === "html" ? "disabled" : ""}><span>${L[k].name} (${L[k].job})</span></label>`).join("")}</div>
   <div class="wl-grid"><div class="wl-code"><div class="gs-tabs wl-tabs" role="tablist">${Object.keys(L).map(k => `<button type="button" role="tab" data-k="${k}">${k === "html" ? "index.html" : k === "css" ? "style.css" : "app.js"}</button>`).join("")}</div><ol class="wl-lines"></ol><div class="ix-out wl-note">Tap a line of code.</div></div>
    <div class="wl-prev"><div class="gs-tabs"><span class="on">Result in the browser</span></div><iframe class="wl-f" sandbox="allow-scripts" title="Live result of the sample code"></iframe></div></div>
   <div class="ix-out wlN"></div>`);
  const src = () => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">${on.css ? `<style>${L.css.lines.map(l => l[0]).join("\n")}</style>` : "<style>body{font-family:serif}</style>"}</head><body>${L.html.lines.map(l => l[0]).join("\n")}${on.js ? `<script>${L.js.lines.map(l => l[0]).join("\n")}<\/script>` : ""}</body></html>`;
  const drawCode = () => { el.querySelectorAll(".wl-tabs button").forEach(b => { b.setAttribute("aria-selected", b.dataset.k === tab); b.classList.toggle("off", !on[b.dataset.k]); });
    $(".wl-lines", el).className = "wl-lines mono" + (on[tab] ? "" : " off");
    $(".wl-lines", el).innerHTML = L[tab].lines.map((l, i) => `<li class="${i === sel ? "sel" : ""}" data-i="${i}" tabindex="0">${hlCode(l[0], tab)}</li>`).join("");
    el.querySelectorAll(".wl-lines li").forEach(li => { const go = () => { sel = +li.dataset.i; $(".wl-note", el).innerHTML = `<b>Line ${sel + 1}.</b> ${L[tab].lines[sel][1]}${on[tab] ? "" : ` <span class="explain">(This layer is turned off, so this line is not running.)</span>`}`; drawCode(); markAct("webLayers", "used"); }; li.onclick = go; li.onkeydown = e => { if (e.key === "Enter") go(); }; }); };
  const draw = () => { $(".wl-f", el).srcdoc = src(); drawCode();
    const c = on.css, j = on.js;
    $(".wlN", el).innerHTML = !c && !j ? "<b>HTML only:</b> the content and structure are there (a heading, two cards, a status line), but it looks plain and nothing changes." : c && !j ? "<b>+ CSS:</b> the same HTML now has color, spacing, and a card layout. Still no live data: the numbers are <code>--</code>." : !c && j ? "<b>HTML + JavaScript:</b> numbers update every 2 s, but it still looks plain. Behavior and appearance are separate jobs." : "<b>All three:</b> structure (HTML) + appearance (CSS) + live behavior (JS). JS adds the class <code>hot</code>; CSS decides what “hot” looks like.";
    if (c && j) markAct("webLayers", "done"); };
  el.querySelectorAll(".wl-tog input").forEach(x => x.onchange = () => { on[x.dataset.k] = x.checked; if (x.checked){ tab = x.dataset.k; sel = -1; $(".wl-note", el).textContent = "Tap a line of code."; } draw(); });
  el.querySelectorAll(".wl-tabs button").forEach(b => b.onclick = () => { tab = b.dataset.k; sel = -1; $(".wl-note", el).textContent = "Tap a line of code."; drawCode(); });
  draw();
};

/* 3.3 guided tutorial: write your first web page, step by step */
const WT_START = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My dashboard</title>
</head>
<body>

</body>
</html>`;
const beforeBody = (c, add) => /<\/body>/i.test(c) ? c.replace(/\n?<\/body>/i, "\n" + add + "\n</body>") : c + "\n" + add;
const beforeHeadEnd = (c, add) => /<\/head>/i.test(c) ? c.replace(/<\/head>/i, add + "\n</head>") : add + "\n" + c;
const WT_STEPS = [
  {t:"The skeleton of every page", learn:`<p>Every HTML page has the same skeleton (already in the editor):</p><ul><li><code>&lt;!DOCTYPE html&gt;</code> tells the browser this is modern HTML.</li><li><code>&lt;html lang="en"&gt;</code> wraps everything and says the language (screen readers need it).</li><li><code>&lt;head&gt;</code> holds information <b>about</b> the page: its title and, soon, its styles.</li><li><code>&lt;body&gt;</code> holds everything people <b>see</b>.</li></ul><p>HTML is made of <b>elements</b>. Most have an opening tag and a closing tag with a slash: <code>&lt;h1&gt;Hello&lt;/h1&gt;</code>.</p>`,
   task:`Inside <code>&lt;body&gt;</code>, add a main heading: <code>&lt;h1&gt;Room 204&lt;/h1&gt;</code> (any text is fine).`, add:`<h1>Room 204</h1>`, apply:c => beforeBody(c, "<h1>Room 204</h1>"),
   check:(d, c) => { const h = d.querySelector("body h1"); return h && h.textContent.trim() ? [true, "Your page has a main heading."] : [false, /<h1>/i.test(c) && !/<\/h1>/i.test(c) ? "Your <h1> is not closed: add </h1> after the text." : "No <h1> inside <body> yet. Type it between <body> and </body>."]; }},
  {t:"Paragraphs and ids", learn:`<p>A <code>&lt;p&gt;</code> is a paragraph. Elements can have <b>attributes</b> inside the opening tag, written as <code>name="value"</code>.</p><p>The <code>id</code> attribute gives an element a unique name. You will use it later so JavaScript can find this exact element.</p>`,
   task:`Under the heading, add <code>&lt;p id="status"&gt;Waiting for data…&lt;/p&gt;</code>.`, add:`<p id="status">Waiting for data…</p>`, apply:c => beforeBody(c, `<p id="status">Waiting for data…</p>`),
   check:d => { const p = d.querySelector("p#status"); return p ? [true, "Paragraph with id=\"status\" found."] : d.querySelector("p") ? [false, "There is a <p>, but it has no id=\"status\". Check the spelling and the quotes."] : [false, "No <p> yet."]; }},
  {t:"Your first CSS rule", learn:`<p>CSS changes how things <b>look</b>. Put it inside a <code>&lt;style&gt;</code> element in the <code>&lt;head&gt;</code>. A CSS <b>rule</b> has three parts:</p>${"<pre class=\"code\">h1 {  color: #3730A3; }\n↑      ↑        ↑\nselector property value</pre>"}<p>The <b>selector</b> says which elements, the <b>property</b> says what to change, and the <b>value</b> says how. End each line with a semicolon.</p>`,
   task:`In the <code>&lt;head&gt;</code>, add <code>&lt;style&gt; h1 { color: #3730A3; } &lt;/style&gt;</code>. Try other colors too.`, add:`<style>\n  h1 { color: #3730A3; }\n</style>`, apply:c => beforeHeadEnd(c, `  <style>\n    h1 { color: #3730A3; }\n  </style>`),
   check:(d, c) => { const css = [...d.querySelectorAll("style")].map(s => s.textContent).join("\n"); return /h1\s*\{[^}]*color\s*:\s*[^;}]+/i.test(css) ? [true, "Your h1 has a color rule."] : !css ? [false, "No <style> element yet. Put it inside <head>."] : [false, "The <style> is there, but there is no h1 { color: … } rule. Check the braces { } and the colon."]; }},
  {t:"Classes: style many things at once", learn:`<p>An <code>id</code> is for one element; a <b>class</b> is a label you can give to many elements. In CSS, a class selector starts with a dot: <code>.card</code>.</p><p><code>padding</code> is space inside the box; <code>border-radius</code> rounds the corners.</p>`,
   task:`Add a card in the body: <code>&lt;div class="card"&gt;Temperature &lt;b id="temp"&gt;--&lt;/b&gt;&lt;/div&gt;</code>, and a CSS rule <code>.card { padding: 12px; border-radius: 10px; background: #E0E7FF; }</code>.`,
   add:`<div class="card">Temperature <b id="temp">--</b></div>\n\n/* in <style>: */\n.card { padding: 12px; border-radius: 10px; background: #E0E7FF; }`,
   apply:c => { c = beforeBody(c, `<div class="card">Temperature <b id="temp">--</b></div>`); return /<\/style>/i.test(c) ? c.replace(/<\/style>/i, "  .card { padding: 12px; border-radius: 10px; background: #E0E7FF; }\n  </style>") : beforeHeadEnd(c, "  <style>\n    .card { padding: 12px; border-radius: 10px; background: #E0E7FF; }\n  </style>"); },
   check:d => { const css = [...d.querySelectorAll("style")].map(s => s.textContent).join("\n"), card = d.querySelector(".card"); return !card ? [false, "No element with class=\"card\" yet."] : !d.querySelector(".card #temp") ? [false, "The card needs a <b id=\"temp\"> inside it, for the value."] : !/\.card\s*\{[^}]*padding/i.test(css) ? [false, "Add a .card { … } rule with padding (note the dot)."] : [true, "Card and .card rule found."]; }},
  {t:"A button", learn:`<p>A <code>&lt;button&gt;</code> is something people can click or tap. The text inside it is its name: make it say what will happen. (A button with only an emoji is hard to use with a screen reader.)</p>`,
   task:`Add <code>&lt;button id="refresh"&gt;Refresh&lt;/button&gt;</code> under the card.`, add:`<button id="refresh">Refresh</button>`, apply:c => beforeBody(c, `<button id="refresh">Refresh</button>`),
   check:d => { const b = d.querySelector("button#refresh"); return b && b.textContent.trim() ? [true, "Button found."] : d.querySelector("button") ? [false, "Give the button id=\"refresh\" and some text."] : [false, "No <button> yet."]; }},
  {t:"JavaScript: make it do something", learn:`<p>JavaScript adds <b>behavior</b>. Put it in a <code>&lt;script&gt;</code> just before <code>&lt;/body&gt;</code>, so the elements already exist when it runs.</p><ul><li><code>document.getElementById("refresh")</code> finds the element with that id.</li><li><code>.addEventListener("click", function)</code> says “when it is clicked, run this function”.</li><li><code>() =&gt; { … }</code> is a short way to write a function.</li><li><code>.textContent = "…"</code> replaces the text inside an element.</li></ul>`,
   task:`Make the button put a temperature in <code>#temp</code> and update <code>#status</code>. Type it, then click your button in the preview.`,
   add:`<script>\n  document.getElementById("refresh").addEventListener("click", () => {\n    document.getElementById("temp").textContent = "29.8 °C";\n    document.getElementById("status").textContent = "Updated " + new Date().toLocaleTimeString();\n  });\n<\/script>`,
   apply:c => beforeBody(c, `<script>\n  document.getElementById("refresh").addEventListener("click", () => {\n    document.getElementById("temp").textContent = "29.8 °C";\n    document.getElementById("status").textContent = "Updated " + new Date().toLocaleTimeString();\n  });\n<\/script>`),
   check:(d, c) => { const js = [...d.querySelectorAll("script")].map(s => s.textContent).join("\n"); return !js ? [false, "No <script> yet. Put it just before </body>."] : !/getElementById\(\s*["']refresh["']\s*\)\s*\.addEventListener\(\s*["']click["']/.test(js) ? [false, "Find the button with getElementById(\"refresh\") and call .addEventListener(\"click\", …)."] : !/getElementById\(\s*["']temp["']\s*\)\s*\.textContent\s*=/.test(js) ? [false, "Inside the function, set document.getElementById(\"temp\").textContent = …"] : [true, "Your button is wired up. Click it in the preview!"]; }}
];
INTERACTIVES.webTutorial = function(el){
  const k = "sss_wt_" + (user ? user.email : "g"); let st = store.get(k, {i:0, code:WT_START, done:{}});
  const save = () => store.set(k, st);
  el.innerHTML = bench("Guided tutorial: write your first web page", `<p class="explain">Before the challenges, build a small page one step at a time. Each step teaches one idea. Type the code yourself (typing helps you remember); use <b>Insert it for me</b> only if you are stuck.</p>
   <ol class="wt-prog" aria-label="Tutorial steps">${WT_STEPS.map((s, i) => `<li><button type="button" data-i="${i}" aria-label="Step ${i + 1}: ${esc(s.t)}">${i + 1}</button></li>`).join("")}</ol>
   <div class="wt-grid"><div class="wt-learn"></div><div class="wt-work"><div class="gs-tabs" style="border-radius:8px 8px 0 0"><span class="on">index.html</span></div><textarea class="ed wtE" spellcheck="false" autocapitalize="off" autocorrect="off" aria-label="Your HTML"></textarea>
    <div class="gs-tabs" style="border-radius:8px 8px 0 0;margin-top:10px"><span class="on">Preview (updates as you type)</span></div><iframe class="preview-frame wtF" sandbox="allow-scripts" title="Preview of your page"></iframe></div></div>
   <div class="controls"><button class="btn primary wtChk" type="button">Check this step</button><button class="btn wtIns" type="button">Insert it for me</button><button class="btn wtAI" type="button">Ask Proto to explain</button><button class="btn wtRst" type="button">Start over</button></div><div class="ix-out wtOut" hidden></div>`);
  const ed = $(".wtE", el);
  ed.addEventListener("keydown", e => { if (e.key === "Tab"){ e.preventDefault(); ed.setRangeText("  ", ed.selectionStart, ed.selectionEnd, "end"); } });
  const prev = () => { $(".wtF", el).srcdoc = ed.value; };
  ed.addEventListener("input", () => { st.code = ed.value; save(); clearTimeout(ed.t); ed.t = setTimeout(prev, 500); });
  const draw = () => { const s = WT_STEPS[st.i];
    el.querySelectorAll(".wt-prog button").forEach((b, i) => { b.classList.toggle("on", i === st.i); b.classList.toggle("ok", !!st.done[i]); b.setAttribute("aria-current", i === st.i ? "step" : "false"); });
    $(".wt-learn", el).innerHTML = `<p class="wt-n">Step ${st.i + 1} of ${WT_STEPS.length}</p><h4>${s.t}</h4>${s.learn}<div class="wt-task"><b>Your turn:</b> ${s.task}</div><details><summary class="explain">See the code for this step</summary><pre class="code">${esc(s.add)}</pre></details>`;
    $(".wtOut", el).hidden = true; };
  const check = () => { const d = new DOMParser().parseFromString(ed.value, "text/html"), r = WT_STEPS[st.i].check(d, ed.value), out = $(".wtOut", el); out.hidden = false;
    if (r[0]){ st.done[st.i] = true; save(); const last = st.i === WT_STEPS.length - 1;
      out.innerHTML = `<p class="feedback ok">✓ ${esc(r[1])}</p>${last ? `<p><b>Tutorial complete.</b> You used all three layers: HTML for structure, CSS for appearance, JavaScript for behavior. Now try the challenges below.</p>` : `<button class="btn primary small wtNext" type="button">Next step →</button>`}`;
      if (last){ markAct("webTutorial", "done"); confetti(); } const n = $(".wtNext", el); if (n) n.onclick = () => { st.i++; save(); draw(); };
      el.querySelectorAll(".wt-prog button")[st.i].classList.add("ok"); }
    else out.innerHTML = `<p class="feedback no">✗ ${esc(r[1])}</p>`;
    logEvent(currentModule, "webTutorial", "step" + (st.i + 1), r[0] ? "pass" : "fail"); };
  el.querySelectorAll(".wt-prog button").forEach(b => b.onclick = () => { st.i = +b.dataset.i; save(); draw(); });
  $(".wtChk", el).onclick = check;
  $(".wtIns", el).onclick = () => { ed.value = WT_STEPS[st.i].apply(ed.value); st.code = ed.value; save(); prev(); check(); };
  $(".wtAI", el).onclick = () => { const s = WT_STEPS[st.i], p = `Persona: You are a friendly web development tutor for complete beginners.
Act: Explain, line by line and in plain American English, what this HTML/CSS/JavaScript does. Point out one common mistake beginners make with it. Do not add new features.
Recipient: A beginner on step ${st.i + 1} ("${s.t}") of a first web page tutorial.
Theme: My code so far:
${ed.value.slice(0, 3000)}
Structure: A numbered list (one item per important line), then one "watch out" tip.`;
    sendToProto(p); aiLogAdd({tool:"Proto (course assistant)", framework:"PARTS", task:"Explain tutorial step " + (st.i + 1), prompt:p.slice(0, 600)}); toast("Asked Proto to explain your code. It was added to your AI-use log."); };
  $(".wtRst", el).onclick = () => { if (!confirm("Start the tutorial over? Your page will be reset.")) return; st = {i:0, code:WT_START, done:{}}; save(); ed.value = st.code; prev(); draw(); };
  ed.value = st.code; prev(); draw();
};

/* 3.1 MQTT publish/subscribe playground */
INTERACTIVES.mqttSim = function(el){
  const subs = [{n:"Teacher dashboard", t:"school/+/temp", on:true}, {n:"Room 204 fan", t:"school/room204/temp", on:true}, {n:"Library display", t:"school/library/#", on:true}];
  const match = (f, t) => { const a = f.split("/"), b = t.split("/"); for (let i = 0; i < a.length; i++){ if (a[i] === "#") return true; if (a[i] !== "+" && a[i] !== b[i]) return false; } return a.length === b.length; };
  el.innerHTML = bench("Publish and subscribe", `<p class="explain">Devices publish to a <b>topic</b>; the broker forwards each message to every subscriber whose filter matches. <code>+</code> matches one level; <code>#</code> matches everything below.</p>
   <div class="controls"><label>Topic <select class="dinput mqT"><option>school/room204/temp</option><option>school/library/temp</option><option>school/library/noise</option><option>school/gym/temp</option></select></label><label>Value <input class="dinput mqV" value="29.4" style="width:80px"></label><button class="btn primary mqP" type="button">Publish</button></div>
   <svg class="flowsvg mq-svg" viewBox="0 0 560 190" role="img" aria-label="Publisher, broker, and subscribers"></svg><div class="mq-subs"></div><div class="ix-out mqO">Press Publish.</div>`);
  let last = null;
  const draw = () => { const hit = last ? subs.map(s => s.on && match(s.t, last.t)) : [];
    $(".mq-svg", el).innerHTML = `<rect x="10" y="70" width="100" height="50" rx="8" fill="#1a1d21"/><text x="60" y="99" text-anchor="middle" class="svgtxt b w">Sensor board</text><rect x="210" y="65" width="110" height="60" rx="10" fill="#7C3AED"/><text x="265" y="92" text-anchor="middle" class="svgtxt b w">Broker</text><text x="265" y="108" text-anchor="middle" class="svgtxt w" font-size="10">forwards by topic</text>
     <path d="M110 95 H210" stroke="var(--muted)" stroke-width="2"/>${subs.map((s, i) => `<path d="M320 95 L420 ${30 + i * 65}" stroke="${hit[i] ? "#4F46E5" : "var(--line)"}" stroke-width="${hit[i] ? 3 : 2}"/><rect x="420" y="${10 + i * 65}" width="130" height="42" rx="8" fill="${!s.on ? "var(--bg)" : hit[i] ? "#4F46E5" : "var(--surface)"}" stroke="var(--line)"/><text x="485" y="${30 + i * 65}" text-anchor="middle" class="svgtxt b ${hit[i] ? "w" : ""}" font-size="11">${esc(s.n)}</text><text x="485" y="${44 + i * 65}" text-anchor="middle" class="svgtxt ${hit[i] ? "w" : "mute"}" font-size="9">${esc(s.t)}</text>${hit[i] ? `<circle r="6" fill="#E8B84A"><animateMotion dur=".9s" fill="freeze" path="M320 95 L420 ${30 + i * 65}"/></circle>` : ""}`).join("")}
     ${last ? `<circle r="6" fill="#E8B84A"><animateMotion dur=".6s" fill="freeze" path="M110 95 H210"/></circle>` : ""}`;
    $(".mq-subs", el).innerHTML = subs.map((s, i) => `<label class="chk"><input type="checkbox" data-i="${i}" ${s.on ? "checked" : ""}><span>${esc(s.n)} subscribed</span></label>`).join("");
    el.querySelectorAll(".mq-subs input").forEach(x => x.onchange = () => { subs[+x.dataset.i].on = x.checked; draw(); });
    if (last){ const got = subs.filter((s, i) => hit[i]).map(s => s.n); $(".mqO", el).innerHTML = `Published <code>${esc(last.v)}</code> to <code>${esc(last.t)}</code>. ${got.length ? `Delivered to: <b>${got.map(esc).join(", ")}</b>.` : "<b>Nobody received it:</b> no subscription matched. The broker does not store it for later (unless the message is marked “retained”)."}`; } };
  $(".mqP", el).onclick = () => { last = {t:$(".mqT", el).value, v:$(".mqV", el).value}; draw(); markAct("mqttSim", "used"); };
  draw();
};

/* 3.2 spot the secrets before you share */
INTERACTIVES.secretScan = function(el){
  const lines = [['#include <WiFi.h>', 0], ['const char* WIFI_SSID = "IoT-Lab-2G";', 0, "The network name is usually fine to share (people nearby can see it anyway)."], ['const char* WIFI_PASS = "sunflower2026";', 1, "A real Wi-Fi password: anyone could join your network."],
    ['const char* API_URL = "https://script.google.com/macros/s/AKfycbx123/exec";', 1, "Your web app URL plus the key lets anyone write to your Sheet. Treat the deployment URL as private too."], ['const char* API_KEY = "rm204-7f3k9q";', 1, "The API key is the password for your web app."],
    ['const char* DEVICE_ID = "team1-esp32s3";', 0, "A device name is not a secret."], ['// Teacher: Ms. Cruz, mobile 0917 555 0142', 1, "Personal data (a phone number) does not belong in shared code."], ['void setup() { Serial.begin(115200); }', 0]];
  const picked = {};
  el.innerHTML = bench("Before you share: spot the secrets", `<p class="explain">You are about to paste this sketch into a group chat (or an AI chat). Tap every line that must be removed or replaced first, then press Check.</p><ol class="ss-l mono">${lines.map((l, i) => `<li data-i="${i}" tabindex="0">${esc(l[0])}</li>`).join("")}</ol><div class="controls"><button class="btn primary ssC" type="button">Check</button></div><div class="ix-out ssO" hidden></div>`);
  el.querySelectorAll(".ss-l li").forEach(li => { const t = () => { const i = +li.dataset.i; picked[i] = !picked[i]; li.classList.toggle("pick", picked[i]); }; li.onclick = t; li.onkeydown = e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); t(); } }; });
  $(".ssC", el).onclick = () => { let right = 0; el.querySelectorAll(".ss-l li").forEach(li => { const i = +li.dataset.i, ok = !!picked[i] === !!lines[i][1]; if (ok) right++; li.classList.toggle("ok", ok && lines[i][1]); li.classList.toggle("no", !ok); });
    const o = $(".ssO", el); o.hidden = false; o.innerHTML = `<b>${right} of ${lines.length} lines judged correctly.</b><ul>${lines.filter(l => l[2]).map(l => `<li><code>${esc(l[0].slice(0, 32))}…</code> ${l[2]}</li>`).join("")}</ul><p>Replace secrets with placeholders such as <code>"YOUR_WIFI_PASSWORD"</code>, or keep them in a <code>secrets.h</code> tab that you never share.</p>`;
    if (right === lines.length) markAct("secretScan", "done"); };
};

/* 3.5 why LockService: two boards write at the same moment */
INTERACTIVES.lockRace = function(el){
  el.innerHTML = bench("Two boards, one Sheet, the same moment", `<p class="explain">Board A and Board B both send a reading at the same time. Each one's Apps Script run finds the last row, then writes to the row after it.</p>
   <div class="seg seg-sm lrM"><button type="button" data-m="0" aria-selected="true">Without a lock</button><button type="button" data-m="1">With LockService</button></div><div class="lr-grid"><ol class="lr-steps"></ol><div class="vsheet lr-sheet"></div></div><div class="controls"><button class="btn primary lrGo" type="button">▶ Run</button></div><div class="ix-out lrO" hidden></div>`);
  let mode = 0, tm;
  const steps = m => m ? [["A","waits for the lock… gets it"],["B","waits for the lock (A has it)"],["A","reads last row = 3"],["A","writes row 4: 29.4"],["A","releases the lock"],["B","gets the lock, reads last row = 4"],["B","writes row 5: 31.2"],["B","releases the lock"]]
    : [["A","reads last row = 3"],["B","reads last row = 3"],["A","writes row 4: 29.4"],["B","writes row 4: 31.2 (overwrites A!)"]];
  const sheet = rows => `<table class="t"><tr><th>#</th><th>device</th><th>temp_c</th></tr>${rows.map((r, i) => `<tr class="${r[2] || ""}"><td>${i + 2}</td><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")}</table>`;
  const base = [["team3","28.9"],["team2","29.1"]];
  const run = () => { clearInterval(tm); const S = steps(mode); let i = 0, rows = base.slice(); $(".lrO", el).hidden = true;
    $(".lr-steps", el).innerHTML = S.map(s => `<li class="lr-${s[0]}"><b>${s[0]}</b> ${s[1]}</li>`).join("");
    $(".lr-sheet", el).innerHTML = sheet(rows);
    tm = setInterval(() => { if (!alive(el)) return clearInterval(tm); const li = el.querySelectorAll(".lr-steps li")[i]; if (li) li.classList.add("on"); const s = S[i][1];
      if (/writes row 4: 29.4/.test(s)) rows[2] = ["team1 (A)", "29.4", "new"]; if (/writes row 4: 31.2/.test(s)) rows[2] = ["team4 (B)", "31.2", "bad"]; if (/writes row 5/.test(s)) rows[3] = ["team4 (B)", "31.2", "new"];
      $(".lr-sheet", el).innerHTML = sheet(rows); i++;
      if (i >= S.length){ clearInterval(tm); const o = $(".lrO", el); o.hidden = false; o.innerHTML = mode ? "<b>Both readings saved.</b> The lock makes the runs take turns: only one can read-then-write at a time. That is why the course's Code.gs calls <code>LockService.getScriptLock().waitLock(10000)</code> before writing." : "<b>A reading was lost.</b> Both runs read “last row = 3” before either wrote, so B overwrote A. Nobody saw an error. This is called a <b>race condition</b>. (appendRow is safer than writing to a computed row, but a lock protects any read-then-write.)"; markAct("lockRace", "used"); } }, 800); };
  el.querySelectorAll(".lrM button").forEach(b => b.onclick = () => { mode = +b.dataset.m; el.querySelectorAll(".lrM button").forEach(x => x.setAttribute("aria-selected", x === b)); run(); });
  $(".lrGo", el).onclick = run;
};
