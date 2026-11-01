/* ============ UNIT 1 (added): SDGs, prompt gallery, Blink simulation, programming foundations ============ */
/* ---- UN Sustainable Development Goals (names and colors from the UN SDG communication guidelines) ---- */
const SDG_GOALS = [
 [1,"No poverty","#E5243B","A smart meter that helps a family see which appliance makes the electricity bill high."],
 [2,"Zero hunger","#DDA63A","Temperature and humidity logging in a school garden greenhouse or a mushroom house."],
 [3,"Good health and well-being","#4C9F38","An MQ-135 air-quality indicator near the school gate or canteen kitchen, so people can see when the air is stuffy or smoky."],
 [4,"Quality education","#C5192D","A classroom comfort monitor (heat, humidity, light) that helps teachers keep rooms fit for learning."],
 [5,"Gender equality","#FF3A21","Data on whether a facility (lighting in a corridor, a restroom) is safe and usable for everyone."],
 [6,"Clean water and sanitation","#26BDE2","A water-tank level sensor that reveals leaks and overflows."],
 [7,"Affordable and clean energy","#FCC30B","A light sensor that flags rooms left lit in daylight or after class."],
 [8,"Decent work and economic growth","#A21942","Heat logging in a small workshop or canteen kitchen to protect workers."],
 [9,"Industry, innovation and infrastructure","#FD6925","Low-cost sensors that let a school build and maintain its own monitoring."],
 [10,"Reduced inequalities","#DD1367","Comparing conditions between rooms or barangays to target help where it is needed most."],
 [11,"Sustainable cities and communities","#FD9D24","Air-quality trend with an MQ-135 in a busy corridor; bin fill-levels with an HC-SR04 for waste collection."],
 [12,"Responsible consumption and production","#BF8B2E","Food-storage temperature logging to reduce spoilage; tracking equipment loans so tools are reused."],
 [13,"Climate action","#3F7E44","A river or canal water-level logger that adds local evidence to early warning."],
 [14,"Life below water","#0A97D9","Logging water temperature in a school aquarium or fish pond."],
 [15,"Life on land","#56C02B","Soil and air conditions in a tree nursery."],
 [16,"Peace, justice and strong institutions","#00689D","Transparent, privacy-respecting records (for example, open data from a community sensor)."],
 [17,"Partnerships for the goals","#19486A","Sharing your open design and data with another school or your LGU."]];
/* Targets and indicators quoted from the UN global indicator framework (United Nations Statistics Division) */
const SDG_TARGETS = {
 "2.4":["By 2030, ensure sustainable food production systems and implement resilient agricultural practices that increase productivity and production, that help maintain ecosystems, that strengthen capacity for adaptation to climate change, extreme weather, drought, flooding and other disasters and that progressively improve land and soil quality","2.4.1 Proportion of agricultural area under productive and sustainable agriculture","DHT in a greenhouse or mushroom house; LDR for light"],
 "3.9":["By 2030, substantially reduce the number of deaths and illnesses from hazardous chemicals and air, water and soil pollution and contamination","3.9.1 Mortality rate attributed to household and ambient air pollution","MQ-135 (relative air quality: a trend, not a certified measurement)"],
 "4.4":["By 2030, substantially increase the number of youth and adults who have relevant skills, including technical and vocational skills, for employment, decent jobs and entrepreneurship","4.4.1 Proportion of youth and adults with information and communications technology (ICT) skills, by type of skill","This course itself: electronics, programming and data skills"],
 "4.a":["Build and upgrade education facilities that are child, disability and gender sensitive and provide safe, non-violent, inclusive and effective learning environments for all","4.a.1 Proportion of schools offering basic services, by type of service","DHT (heat, humidity), LDR (lighting), MQ-135 / SPS30 (air) in classrooms"],
 "6.4":["By 2030, substantially increase water-use efficiency across all sectors and ensure sustainable withdrawals and supply of freshwater to address water scarcity and substantially reduce the number of people suffering from water scarcity","6.4.1 Change in water-use efficiency over time","HC-SR04 above a water tank"],
 "7.3":["By 2030, double the global rate of improvement in energy efficiency","7.3.1 Energy intensity measured in terms of primary energy and GDP","LDR (lights left on), DHT (when a fan or air-conditioner is really needed)"],
 "11.5":["By 2030, significantly reduce the number of deaths and the number of people affected and substantially decrease the direct economic losses relative to global gross domestic product caused by disasters, including water-related disasters, with a focus on protecting the poor and people in vulnerable situations","11.5.1 Number of deaths, missing persons and directly affected persons attributed to disasters per 100,000 population","HC-SR04 water-level logger (evidence and awareness, not a certified warning system)"],
 "11.6":["By 2030, reduce the adverse per capita environmental impact of cities, including by paying special attention to air quality and municipal and other waste management","11.6.2 Annual mean levels of fine particulate matter (e.g. PM2.5 and PM10) in cities (population weighted)","SPS30 outdoors; HC-SR04 bin fill-level for waste collection (11.6.1)"],
 "12.3":["By 2030, halve per capita global food waste at the retail and consumer levels and reduce food losses along production and supply chains, including post-harvest losses","","DHT in a canteen storeroom or a harvest store"],
 "12.5":["By 2030, substantially reduce waste generation through prevention, reduction, recycling and reuse","12.5.1 National recycling rate, tons of material recycled","HC-SR04 recycling-bin levels so bins are emptied when full; a PIR counter to learn when a recycling corner is actually used"],
 "13.1":["Strengthen resilience and adaptive capacity to climate-related hazards and natural disasters in all countries","13.1.1 Number of deaths, missing persons and directly affected persons attributed to disasters per 100,000 population","HC-SR04 river or drain level; DHT heat logging during heat waves"],
 "13.3":["Improve education, awareness-raising and human and institutional capacity on climate change mitigation, adaptation, impact reduction and early warning","13.3.1 Number of countries that have integrated mitigation, adaptation, impact reduction and early warning into primary, secondary and tertiary curricula","Any dashboard that makes local climate data visible to a community"]};
INTERACTIVES.sdgGoals = function(el){
  let sel = 11;
  el.innerHTML = bench("The 17 Sustainable Development Goals", `<div class="sdg-grid">${SDG_GOALS.map(g => `<button type="button" class="sdg-tile" data-g="${g[0]}" style="--c:${g[2]}"><b>${g[0]}</b><span>${esc(g[1])}</span></button>`).join("")}</div><div class="ix-out sdgOut"></div>`);
  const seen = new Set();
  const show = n => { sel = n; seen.add(n); const g = SDG_GOALS[n - 1], ts = Object.keys(SDG_TARGETS).filter(t => t.split(".")[0] === String(n));
    el.querySelectorAll(".sdg-tile").forEach(b => b.classList.toggle("sel", +b.dataset.g === n));
    $(".sdgOut", el).innerHTML = `<div class="sdg-head" style="--c:${g[2]}"><b>SDG ${g[0]}</b> ${esc(g[1])}</div><p><b>A prototype idea:</b> ${esc(g[3])}</p>${ts.length ? ts.map(t => `<div class="sdg-target"><b>Target ${t}</b> “${esc(SDG_TARGETS[t][0])}.”${SDG_TARGETS[t][1] ? `<span class="explain">Indicator ${esc(SDG_TARGETS[t][1])}</span>` : ""}<span class="explain"><b>Course sensors:</b> ${esc(SDG_TARGETS[t][2])}</span></div>`).join("") : `<p class="explain">This course quotes only a few targets. Read all of Goal ${n}'s targets at <a href="https://sdgs.un.org/goals/goal${n}" target="_blank" rel="noopener">sdgs.un.org</a>.</p>`}`;
    if (seen.size >= 4) markAct("sdgGoals", "used"); };
  el.querySelectorAll(".sdg-tile").forEach(b => b.onclick = () => show(+b.dataset.g)); show(sel);
};
INTERACTIVES.sdgMatcher = function(el){
  const S = [["A Grade 10 team puts an MQ-135 in the canteen to log air quality while the kitchen is cooking.", [["11.6","best","Air quality in a community is the measurement; indicator 11.6.2 is about air quality in cities. An MQ-135 gives a relative index, not a certified measurement."],["3.9","fits","Health from air pollution is the reason it matters, but the prototype measures exposure, not illness."],["7.3","weak","Nothing here is about energy efficiency."]]],
   ["An HC-SR04 above the school's water tank logs the level every 10 minutes to spot leaks and overflows.", [["6.4","best","Water-use efficiency: finding leaks and overflow wastes less water."],["11.6","weak","11.6 is about air quality and waste in cities."],["13.1","weak","Not a climate hazard."]]],
   ["A DHT22 in Room 204 helps the adviser decide when to open windows or turn on fans.", [["4.a","best","A safe and effective learning environment."],["7.3","fits","Only if the data is used to run fans or air-conditioning less often."],["3.9","weak","Heat is not chemical or pollution contamination."]]],
   ["A barangay's canal water-level logger shows residents how fast the water rose during heavy rain.", [["11.5","best","Water-related disasters: people affected and losses."],["13.1","best","Resilience to climate-related hazards also fits well."],["6.4","weak","This is about floods, not water-use efficiency."]]],
   ["An LDR in each classroom flags lights left on when daylight is enough.", [["7.3","best","Energy efficiency."],["4.a","fits","Good lighting is part of an effective learning environment."],["2.4","weak","Not about food production."]]],
   ["The school garden club logs greenhouse temperature and humidity to time watering and shading.", [["2.4","best","Sustainable, resilient food production."],["12.3","fits","If it also prevents harvest losses."],["11.6","weak","Not city air or waste."]]]];
  let i = 0, score = 0; const done = {};
  el.innerHTML = bench("Match the prototype to an SDG target", `<p class="explain">Pick the target that fits best. Several can fit, so read the reason after each choice.</p><div class="ix-out smQ"></div><div class="choicecards smO"></div><div class="ix-out smX" hidden></div><div class="controls"><button class="btn smP" type="button">Previous</button><button class="btn primary smN" type="button">Next</button><span class="explain smS"></span></div>`);
  const draw = () => { const s = S[i]; $(".smQ", el).innerHTML = `<b>Prototype ${i + 1} of ${S.length}.</b> ${esc(s[0])}`;
    $(".smO", el).innerHTML = s[1].map((o, k) => `<button type="button" data-k="${k}"><b>Target ${o[0]}</b><small>${esc(SDG_TARGETS[o[0]][0].slice(0, 120))}…</small></button>`).join(""); $(".smX", el).hidden = true;
    $(".smP", el).disabled = i === 0; $(".smN", el).disabled = i === S.length - 1; $(".smS", el).textContent = `${Object.keys(done).length} of ${S.length} answered • best-fit choices: ${score}`;
    el.querySelectorAll(".smO button").forEach(b => b.onclick = () => { const o = s[1][+b.dataset.k]; b.classList.add(o[1] === "best" ? "ok" : o[1] === "fits" ? "mid" : "no");
      if (!(i in done)){ done[i] = o[1]; if (o[1] === "best") score++; }
      $(".smX", el).hidden = false; $(".smX", el).innerHTML = `<b>${o[1] === "best" ? "✓ Best fit." : o[1] === "fits" ? "◐ It fits, but another target fits better." : "✗ A weak fit."}</b> ${esc(o[2])}`;
      $(".smS", el).textContent = `${Object.keys(done).length} of ${S.length} answered • best-fit choices: ${score}`; if (Object.keys(done).length === S.length) markAct("sdgMatcher", score + "/" + S.length); }); };
  $(".smP", el).onclick = () => { i = Math.max(0, i - 1); draw(); }; $(".smN", el).onclick = () => { i = Math.min(S.length - 1, i + 1); draw(); }; draw();
};

/* ---- 1.4 variables as labeled boxes in memory ---- */
INTERACTIVES.varBoxes = function(el){
  const ST = [["int count = 0;","Declare and initialize: make a box named count that holds whole numbers, and put 0 in it.",{count:["int","0"]}],
   ["float tempC = 29.4;","A float box holds numbers with decimals.",{tempC:["float","29.4"]}],
   ["count = count + 1;","Assignment: read the right side (0 + 1), then store the result in the box on the left.",{count:["int","1"]}],
   ["tempC = tempC * 2;","29.4 × 2 = 58.8 replaces the old value.",{tempC:["float","58.8"]}],
   ["int half = 7 / 2;","Both numbers are whole, so C++ does integer division: 3, not 3.5.",{half:["int","3"]}],
   ["float half2 = 7 / 2.0;","One number has a decimal point, so the result is 3.5.",{half2:["float","3.5"]}],
   ["bool ledOn = tempC > 32.0;","A comparison gives true or false. 58.8 > 32.0 is true.",{ledOn:["bool","true"]}],
   ["const int LED_PIN = 15;","const makes a locked box: the value can never change.",{LED_PIN:["const int","15"]}],
   ["LED_PIN = 16;","Compile error: assignment of read-only variable 'LED_PIN'. That is the point of const.",{}]];
  let i = -1, boxes = {};
  el.innerHTML = bench("Variables are labeled boxes", `<div class="vb-grid"><pre class="code vbCode"></pre><div><div class="vb-boxes"></div><p class="ix-out vbOut">Press Next to run the first line.</p></div></div><div class="controls"><button class="btn vbB" type="button">Back</button><button class="btn primary vbN" type="button">Next line</button></div>`);
  const draw = () => { boxes = {}; for (let k = 0; k <= i; k++) Object.assign(boxes, ST[k][2]);
    $(".vbCode", el).innerHTML = ST.map((s, k) => `<span class="${k === i ? "hl" : k < i ? "past" : ""}">${esc(s[0])}</span>`).join("\n");
    const ch = i >= 0 ? Object.keys(ST[i][2]) : [];
    $(".vb-boxes", el).innerHTML = Object.keys(boxes).map(n => `<div class="vbox ${ch.includes(n) ? "new" : ""} ${/const/.test(boxes[n][0]) ? "lock" : ""}"><small>${esc(boxes[n][0])}</small><b>${esc(boxes[n][1])}</b><span>${esc(n)}</span></div>`).join("") || `<p class="explain">(memory is empty)</p>`;
    $(".vbOut", el).innerHTML = i >= 0 ? `<b>${esc(ST[i][0])}</b><br>${esc(ST[i][1])}` : "Press Next to run the first line.";
    $(".vbB", el).disabled = i < 0; $(".vbN", el).disabled = i >= ST.length - 1; if (i >= ST.length - 1) markAct("varBoxes", "done"); };
  $(".vbN", el).onclick = () => { i++; draw(); }; $(".vbB", el).onclick = () => { i--; draw(); }; draw();
};
/* ---- 1.4 function anatomy and parameter playground ---- */
INTERACTIVES.funcLab = function(el){
  const PARTS = [["ret","float","Return type: the kind of value the function gives back. void means it gives nothing back."],["name","toFahrenheit","Name: how you call it. Use a verb that says what it does."],["par","(float celsius)","Parameter list: the inputs. Each parameter has a type and a name, like a variable that exists only inside the function."],["body","{ ... }","Body: the statements that run each time the function is called."],["rtn","return celsius * 9.0 / 5.0 + 32.0;","return sends the result back to the caller and ends the function."],["arg","toFahrenheit(29.4)","The call. 29.4 is the argument: the actual value given to the parameter celsius."]];
  const FN = {
   map:{sig:"long map(long value, long fromLow, long fromHigh, long toLow, long toHigh)", ps:[["value",512],["fromLow",0],["fromHigh",1023],["toLow",0],["toHigh",100]], run:a => { const r = Math.trunc((a[0] - a[1]) * (a[4] - a[3]) / (a[2] - a[1]) + a[3]); return [r, `Re-scales a number from one range to another using whole-number math. ${a[0]} on 0–${a[2]} becomes ${r} on ${a[3]}–${a[4]}.`]; }},
   constrain:{sig:"constrain(x, a, b)", ps:[["x",130],["a",0],["b",100]], run:a => { const r = Math.min(Math.max(a[0], a[1]), a[2]); return [r, `Keeps x between a and b. Useful after calibration: ${a[0]} becomes ${r}.`]; }},
   analogRead:{sig:"int analogRead(uint8_t pin)", ps:[["light on the LDR, in % (the pin is fixed)",60]], run:a => { const b = getBoard(), v = Math.round(Math.min(100, Math.max(0, a[0])) / 100 * BOARDS[b].adcMax); return [v, `Returns a whole number from 0 to ${BOARDS[b].adcMax} on your ${BOARDS[b].short}, proportional to the voltage on the pin (here: light at ${a[0]} %).`]; }},
   digitalWrite:{sig:"void digitalWrite(uint8_t pin, uint8_t value)", ps:[["pin",+pinK(getBoard(), "LED_PIN").replace(/\D/g, "") || 15],["value (1 = HIGH, 0 = LOW)",1]], run:a => [null, `Returns nothing (void). Sets pin ${a[0]} ${a[1] ? "HIGH: the LED turns on" : "LOW: the LED turns off"}.`]},
   delay:{sig:"void delay(unsigned long ms)", ps:[["ms",1500]], run:a => [null, `Returns nothing. Pauses the whole program for ${a[0]} ms (${(a[0] / 1000).toFixed(1)} s). Nothing else happens meanwhile.`]},
   millis:{sig:"unsigned long millis()", ps:[], run:() => { const v = Math.round(performance.now()); return [v, "No parameters. Returns the milliseconds since the board started (here: since this page opened)."]; }},
   pulseIn:{sig:"unsigned long pulseIn(uint8_t pin, uint8_t state, unsigned long timeout)", ps:[["distance (cm)",45],["state (1 = HIGH)",1],["timeout (µs)",30000]], run:a => { const us = Math.round(a[0] * 2 / 0.0343); return us > a[2] ? [0, `The echo would take ${us} µs, longer than the ${a[2]} µs timeout, so pulseIn returns 0.`] : [us, `Returns the length of the HIGH pulse in microseconds: ${us} µs for an object ${a[0]} cm away.`]; }},
   random:{sig:"long random(long min, long max)", ps:[["min",1],["max",7]], run:a => { const r = a[0] + Math.floor(Math.random() * (a[1] - a[0])); return [r, `A whole number from ${a[0]} up to ${a[1] - 1} (max is not included).`]; }}};
  let fn = "map";
  el.innerHTML = bench("Functions: parts, parameters, and arguments", `<pre class="code fl-code"><span data-p="ret">float</span> <span data-p="name">toFahrenheit</span><span data-p="par">(float celsius)</span> <span data-p="body">{
  <span data-p="rtn">return celsius * 9.0 / 5.0 + 32.0;</span>
}</span>

float f = <span data-p="arg">toFahrenheit(29.4)</span>;   // f = 84.92</pre><div class="ix-out flOut">Tap a colored part of the function.</div>
   <h4>Parameter playground</h4><div class="controls"><label>Function <select class="dinput flF">${Object.keys(FN).map(k => `<option>${k}</option>`).join("")}</select></label></div><p class="mono flSig"></p><div class="flP"></div><div class="controls"><button class="btn primary flRun" type="button">Call it</button></div><div class="ix-out flRes"></div>`);
  const seen = new Set();
  el.querySelectorAll(".fl-code [data-p]").forEach(s => s.onclick = e => { e.stopPropagation(); const p = PARTS.find(x => x[0] === s.dataset.p); seen.add(p[0]); el.querySelectorAll(".fl-code [data-p]").forEach(x => x.classList.toggle("on", x === s)); $(".flOut", el).innerHTML = `<b>${esc(p[1])}</b><br>${esc(p[2])}`; if (seen.size >= 5) markAct("funcLab", act("funcLab") || "parts"); });
  const drawF = () => { const f = FN[fn]; $(".flSig", el).textContent = f.sig; $(".flP", el).innerHTML = f.ps.length ? f.ps.map((p, i) => `<label class="sl">${esc(p[0])} <input class="dinput flA" type="number" data-i="${i}" value="${p[1]}"></label>`).join("") : `<p class="explain">This function has no parameters, so the call has no arguments: <code>millis()</code></p>`; $(".flRes", el).textContent = ""; };
  $(".flF", el).onchange = e => { fn = e.target.value; drawF(); };
  $(".flRun", el).onclick = () => { const a = [...el.querySelectorAll(".flA")].map(x => +x.value); const [r, txt] = FN[fn].run(a);
    $(".flRes", el).innerHTML = `<code>${fn}(${a.join(", ")})</code> ${r === null ? "→ (no return value)" : `→ returns <b>${r}</b>`}<p>${esc(txt)}</p>`; markAct("funcLab", "played"); };
  drawF();
};
/* ---- 1.4 trace code like a computer ---- */
INTERACTIVES.codeTracer = function(el){
  const CODE = ["int total = 0;","void setup() {","  Serial.begin(115200);","  for (int i = 1; i <= 3; i++) {","    total = total + i;","    Serial.println(total);","  }","  if (total > 5) {","    Serial.println(\"big\");","  } else {","    Serial.println(\"small\");","  }","}"];
  const T = [[0,{total:0},""],[2,{total:0},""],[3,{total:0,i:1},""],[4,{total:1,i:1},""],[5,{total:1,i:1},"1"],[3,{total:1,i:2},""],[4,{total:3,i:2},""],[5,{total:3,i:2},"3"],[3,{total:3,i:3},""],[4,{total:6,i:3},""],[5,{total:6,i:3},"6"],[3,{total:6,i:4},""],[7,{total:6},""],[8,{total:6},"big"]];
  let k = -1, predicted = false;
  el.innerHTML = bench("Trace the code", `<div class="ix-out ctQ"><b>Predict first:</b> what are the four lines this program prints? <input class="dinput ctP" placeholder="e.g. 1, 2, 3, small"> <button class="btn small ctPB" type="button">Lock in my prediction</button></div>
   <div class="tracer"><div class="lines ctL">${CODE.map((c, i) => `<div data-i="${i}">${esc(c)}</div>`).join("")}</div><div><b>Variables</b><div class="ctV kv"></div><b>Serial Monitor</b><pre class="serial ctS" style="min-height:90px"></pre><p class="explain ctE"></p></div></div>
   <div class="controls"><button class="btn primary ctN" type="button">Step</button><button class="btn ctR" type="button">Restart</button></div>`);
  const out = () => T.slice(0, k + 1).map(t => t[2]).filter(Boolean);
  const draw = () => { const t = T[k]; el.querySelectorAll(".ctL div").forEach(d => d.classList.toggle("hl", t && +d.dataset.i === t[0]));
    $(".ctV", el).innerHTML = t ? Object.keys(t[1]).map(n => `<span>${n}</span><b>${t[1][n]}</b>`).join("") : "<span>(nothing yet)</span><b></b>";
    $(".ctS", el).textContent = out().join("\n");
    $(".ctE", el).textContent = !t ? "Press Step." : t[0] === 3 ? (t[1].i > 3 ? "i is 4: the condition i <= 3 is false, so the loop ends." : `Check the condition: is ${t[1].i} <= 3? Yes, so run the body.`) : t[0] === 4 ? `total = ${t[1].total - t[1].i} + ${t[1].i} = ${t[1].total}` : t[0] === 7 ? "6 > 5 is true, so the if branch runs." : "";
    $(".ctN", el).disabled = k >= T.length - 1;
    if (k >= T.length - 1){ const p = ($(".ctP", el).value || "").replace(/\s/g, "").toLowerCase(); $(".ctE", el).innerHTML = `Done. The output is <b>1, 3, 6, big</b>. ${predicted ? (p === "1,3,6,big" ? "✓ Your prediction was right." : "Compare it with your prediction: where did your thinking differ?") : ""}`; markAct("codeTracer", "done"); } };
  $(".ctPB", el).onclick = () => { predicted = true; $(".ctP", el).disabled = true; toast("Prediction locked in. Now step through."); };
  $(".ctN", el).onclick = () => { k++; draw(); }; $(".ctR", el).onclick = () => { k = -1; draw(); }; draw();
};
