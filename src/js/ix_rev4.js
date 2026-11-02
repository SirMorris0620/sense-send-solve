/* ============ REVISION 2, PART 4: Unit 3 explainers (jargon cards, request/response story) ============ */

/* ---------- Jargon flip cards ---------- */
INTERACTIVES.jargonCards = function(el){
  const C = [
   ["Router", "the post office of your home", "A box that connects your devices to each other and to the internet. Your board joins it by Wi-Fi, like a phone does.", "Your board needs the router's <b>2.4 GHz</b> network name and password."],
   ["IP address", "a street address for a device", "A number such as <code>192.168.1.23</code> that tells the network <i>which device</i> a message is for.", "The router gives your board one automatically when it joins Wi-Fi."],
   ["Server / cloud", "someone else’s always-on computer", "A computer that is on all the time and waits for requests. “The cloud” means servers you rent instead of owning.", "Google Sheets, Firebase, AWS, Blynk and ThingSpeak all run on servers."],
   ["Client", "the customer", "The one who asks. Your board is a <b>client</b>: it asks the server to store a reading.", "Your sketch is the client program."],
   ["URL", "a full address with instructions", "Text such as <code>https://example.com/exec?temp=29</code>. It names <b>where</b> to go and can carry values after the <code>?</code>.", "Track A sends readings by building a URL."],
   ["Request", "an order slip", "A message from client to server: <b>what you want</b> (GET = give me, POST = take this), <b>where</b>, and any data.", "“POST this temperature to the Sheet.”"],
   ["Response", "the waiter’s reply", "What the server sends back: a <b>status code</b> and usually some data.", "“200 OK, row added.”"],
   ["Status code", "a traffic light for the reply", "A three-digit number. <b>2xx</b> worked. <b>4xx</b> your side went wrong (bad key, wrong address). <b>5xx</b> the server had a problem.", "403 = not allowed; 404 = wrong address; 429 = too many requests."],
   ["API", "a menu of allowed requests", "The list of things a server lets programs ask for, and how to ask. A restaurant menu: you may order only what is on it.", "The Apps Script web address is your own tiny API."],
   ["JSON", "a tidy form with labelled boxes", "Text that stores named values so any program can read it: <code>{\"temp_c\":29.4}</code>.", "Your board sends JSON; Colab reads it back."],
   ["API key / token", "a ticket that proves it’s you", "A long secret string the server checks before it accepts a request.", "Never paste a real key in a public place. Use <code>YOUR_API_KEY</code> in shared code."],
   ["Broker, topic", "a radio station and its channel", "In MQTT the <b>broker</b> is the middle-man; a <b>topic</b> is a channel name. Anyone subscribed to the channel hears every message.", "<code>sss/team1/temp</code>"],
   ["Library", "a toolbox someone else built", "Ready-made code you add with <code>#include</code> so you do not write Wi-Fi or HTTP from scratch.", "<code>WiFi.h</code>, <code>HTTPClient.h</code>, <code>PubSubClient.h</code>"]];
  el.innerHTML = bench("New words, in plain English", `<p class="explain">Thirteen words you will see all through this unit. <b>Tap a card</b> to flip it and read the plain meaning. Nothing to memorise: you will meet each one again, in action.</p>
   <div class="flipcards">${C.map((c, i) => `<button type="button" data-i="${i}" aria-pressed="false"><span class="front"><span class="tag">word ${i + 1}</span><b>${c[0]}</b><span>Think: <i>${c[1]}</i></span></span><span class="back"><b>${c[0]}</b><span>${c[2]}</span><br><span class="explain"><b>In this course:</b> ${c[3]}</span></span></button>`).join("")}</div>
   <div class="ix-out jcN">Cards flipped: 0 / ${C.length}</div>`);
  const seen = new Set();
  el.querySelectorAll(".flipcards button").forEach(b => b.onclick = () => { b.classList.toggle("on"); b.setAttribute("aria-pressed", b.classList.contains("on")); seen.add(b.dataset.i); $(".jcN", el).textContent = `Cards flipped: ${seen.size} / ${C.length}`; if (seen.size === C.length) markAct("jargonCards", "all"); });
};

/* ---------- One request, told as a restaurant story with the real messages ---------- */
INTERACTIVES.restaurantFlow = function(el){
  let sc = 0, st = 0;
  const SC = [
   {n:"Send a reading (POST)", req:'POST /readings HTTP/1.1\nHost: api.example.com\nx-api-key: YOUR_API_KEY\nContent-Type: application/json\n\n{"device_id":"team1","temp_c":29.4}', code:"201 Created", body:'{"ok":true,"row":42}', mood:"ok", story:["The board (customer) writes an order: “Please store this temperature.”","The order travels over Wi-Fi to your router, then across the internet.","The server (kitchen) checks the key, then writes the reading into the database.","The server writes the reply on a slip: <b>201 Created</b> (“done, stored as row 42”).","The slip travels back. Your code reads the status and knows the reading is safe."]},
   {n:"Ask for the latest (GET)", req:'GET /latest?device_id=team1 HTTP/1.1\nHost: api.example.com\nx-api-key: YOUR_API_KEY', code:"200 OK", body:'{"temp_c":29.4,"time":"2026-11-02T10:15:00"}', mood:"ok", story:["The board asks: “What was the latest reading for team1?” (GET means <i>give me</i>).","The question travels over Wi-Fi and the internet.","The server looks it up in the database.","The reply: <b>200 OK</b> with the data in JSON.","Your code reads the JSON and can show the number on a screen."]},
   {n:"Wrong key (403)", req:'POST /readings HTTP/1.1\nHost: api.example.com\nx-api-key: WRONG_KEY\n\n{"device_id":"team1","temp_c":29.4}', code:"403 Forbidden", body:'{"error":"invalid key"}', mood:"bad", story:["The board sends the order, but with the wrong ticket (key).","The order travels as usual.","The server compares the key with its list and <b>does not find it</b>. Nothing is stored.","The reply: <b>403 Forbidden</b> (“you are not allowed”).","Fix: check the key for typos or extra spaces, then try again. Do <b>not</b> keep retrying fast; that can lock you out."]},
   {n:"Wrong address (404)", req:'POST /reading HTTP/1.1\nHost: api.example.com\nx-api-key: YOUR_API_KEY\n\n{"device_id":"team1","temp_c":29.4}', code:"404 Not Found", body:'{"error":"no such path"}', mood:"bad", story:["The order says <code>/reading</code> (missing the s).","It arrives at the right building.","But the kitchen has no dish with that name.","The reply: <b>404 Not Found</b>.","Fix: copy the URL exactly from the tutorial; check every letter."]},
   {n:"Too many orders (429)", req:'POST /readings HTTP/1.1  (the 20th request this minute)\nx-api-key: YOUR_API_KEY\n\n{"device_id":"team1","temp_c":29.4}', code:"429 Too Many Requests", body:'{"error":"slow down"}', mood:"bad", story:["The board is sending an order every second.","Orders keep arriving.","The kitchen is overwhelmed and refuses extra orders.","The reply: <b>429 Too Many Requests</b>.","Fix: send less often (every 15–60 s is plenty for temperature). More data is not better data."]}];
  const NODES = [["Board", "customer", 70], ["Internet", "roads", 280], ["Server", "kitchen", 490]];
  const draw = () => {
    const s = SC[sc], at = [0, 0.5, 1, 1, 0.5, 0][st] ?? 0;   /* start, travel, arrive, reply made, travel back, home (step 4 shows reply home) */
    const posX = [70, 280, 490, 490, 70][st], back = st >= 3;
    const slip = st < 3 ? "order" : "reply", col = back ? (s.mood === "ok" ? "#16a34a" : "#dc2626") : "#4F46E5";
    el.innerHTML = bench("One request, told as a restaurant story", `
     <p class="explain">Every cloud track repeats this same story. Pick a situation, then press <b>Next</b> to follow the slip of paper. The boxes below show the <b>real text</b> your board would send.</p>
     <div class="controls"><label>Situation <select class="rfS">${SC.map((x, i) => `<option value="${i}" ${i === sc ? "selected" : ""}>${x.n}</option>`).join("")}</select></label></div>
     <svg viewBox="0 0 560 130" class="ix-svg" role="img" aria-label="Request travelling from board to server and back"><style>.rN{font:700 13px Atkinson Hyperlegible,sans-serif;fill:currentColor}.rS{font:600 11px Atkinson Hyperlegible,sans-serif;fill:currentColor;opacity:.75}</style>
      <line x1="70" x2="490" y1="62" y2="62" stroke="currentColor" opacity=".3" stroke-width="4" stroke-dasharray="6 6"/>
      ${NODES.map(([n, r, x], i) => `<rect x="${x - 50}" y="30" width="100" height="64" rx="12" fill="${i === 2 ? "#E0E7FF" : i === 0 ? "#DCFCE7" : "#F3F4F6"}" stroke="#374151" stroke-width="2"/><text x="${x}" y="58" text-anchor="middle" class="rN" style="fill:#111">${n}</text><text x="${x}" y="76" text-anchor="middle" class="rS" style="fill:#374151">(${r})</text>`).join("")}
      <g class="rfP" style="transform:translate(${posX}px,0);transition:transform ${reduceMotion() ? 0 : .7}s ease"><rect x="-22" y="6" width="44" height="22" rx="4" fill="${col}"/><text x="0" y="21" text-anchor="middle" class="rS" style="fill:#fff">${slip}</text></g>
      <text x="280" y="120" text-anchor="middle" class="rS">step ${st + 1} of 5</text></svg>
     <div class="ix-out" aria-live="polite"><b>${st + 1}.</b> ${s.story[st]}</div>
     <div class="ix-grid2"><div><p class="explain"><b>What the board sends</b> (request):</p><pre class="code" style="white-space:pre-wrap;margin:0"><code>${esc(s.req)}</code></pre></div>
      <div><p class="explain"><b>What the server answers</b> (response):</p><pre class="code" style="white-space:pre-wrap;margin:0;opacity:${st >= 3 ? 1 : .25}"><code>${st >= 3 ? esc(s.code + "\n\n" + s.body) : "(not sent yet)"}</code></pre></div></div>
     <div class="controls"><button class="btn rfB" type="button" ${st === 0 ? "disabled" : ""}>Back</button><button class="btn primary rfN" type="button" ${st === 4 ? "disabled" : ""}>Next</button></div>`);
    $(".rfS", el).onchange = e => { sc = +e.target.value; st = 0; draw(); markAct("restaurantFlow", "sc" + sc); };
    $(".rfN", el).onclick = () => { st = Math.min(4, st + 1); draw(); if (st === 4) markAct("restaurantFlow", "done"); };
    $(".rfB", el).onclick = () => { st = Math.max(0, st - 1); draw(); };
  };
  draw();
};
