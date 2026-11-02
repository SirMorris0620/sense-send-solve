/* ============ Data science labs, part 1 (modules 4.1 - 4.3) ============
   Every lab: sliders/buttons -> numbers + chart + the arithmetic written out. All maths comes from ds_kit.js (DS). */

/* a tiny lab builder: controls on top, output below, redraw on every change */
function dsLab(el, o){
  const id = o.id, st = o.init ? o.init() : {};
  const ctl = (o.ctl || []).map(c => {
    if (c.type === "sel") return `<label>${c.label} <select data-c="${c.id}" class="dinput">${c.opts.map(([v, t]) => `<option value="${v}"${String(v) === String(c.v) ? " selected" : ""}>${t}</option>`).join("")}</select></label>`;
    if (c.type === "chk") return `<label><input type="checkbox" data-c="${c.id}"${c.v ? " checked" : ""}> ${c.label}</label>`;
    return `<label>${c.label} <input type="range" data-c="${c.id}" min="${c.min}" max="${c.max}" step="${c.step || 1}" value="${c.v}" aria-label="${esc(c.label)}"> <b data-o="${c.id}">${c.v}</b></label>`;
  }).join("") + (o.btns || []).map(b => `<button type="button" class="btn small" data-b="${b[0]}">${b[1]}</button>`).join("");
  el.innerHTML = bench(o.title, `${o.intro ? `<p class="explain">${o.intro}</p>` : ""}<div class="dsctl">${ctl}</div><div class="dsOut" aria-live="polite"></div>`);
  const out = $(".dsOut", el); let used = false;
  const vals = () => { const v = {}; el.querySelectorAll("[data-c]").forEach(n => { v[n.dataset.c] = n.type === "checkbox" ? n.checked : n.type === "range" ? +n.value : (isNaN(+n.value) || n.value === "" ? n.value : +n.value); const b = el.querySelector(`[data-o="${n.dataset.c}"]`); if (b) b.textContent = n.value; }); return v; };
  const draw = () => { out.innerHTML = o.draw(vals(), st); };
  el.querySelectorAll("[data-c]").forEach(n => n.addEventListener("input", () => { draw(); if (!used){ used = true; markAct(id, "used"); } }));
  el.querySelectorAll("[data-b]").forEach(n => n.addEventListener("click", () => { o.on[n.dataset.b](vals(), st); draw(); if (!used){ used = true; markAct(id, "used"); } }));
  draw();
}
const kp = (label, value, cls) => `<div class="kpi ${cls || ""}"><b>${value}</b><span>${label}</span></div>`;
const kpis = arr => `<div class="kpis">${arr.join("")}</div>`;
const rows2 = (head, rows) => [head, ...rows];

/* ---------- 4.1 the workflow, as a loop (not a one-way pipe) ---------- */
INTERACTIVES.dsPipeline = el => {
  const S = [
    ["Ask", "A question you can measure: \"Does the greenhouse stay below 32 °C between 10 am and 3 pm?\"", "A vague question (\"is it hot?\") gives data nobody can use.", "Write the question, the variable, the unit, the place and the time."],
    ["Sense and collect", "The Arduino reads the sensor on a timer and logs one row per reading (timestamp, device, values).", "A loose wire, a dead battery or a Wi-Fi drop leaves gaps or garbage.", "Log to Serial first, then to your Sheet. Keep the raw file untouched."],
    ["Clean", "Find missing values, duplicates, impossible values and glitches. Decide, and write down, what you do about each one.", "Silently deleting rows hides the problem and can bias the answer.", "Use imputation or filters, and keep a before-and-after count."],
    ["Explore", "Summaries and pictures: mean, spread, trends, daily cycles, correlations.", "A pretty chart can hide a spike or fool you with its axis.", "Always look at the raw points, not only the average."],
    ["Model and test", "Fit a line, flag anomalies, predict one variable from others, and test on data the model has not seen.", "A model that fits the past perfectly may fail tomorrow (overfitting).", "Hold back a test set. Report the error in the sensor's own unit."],
    ["Report and decide", "A dashboard and a short report: the evidence, what it means, what is uncertain, and what to do.", "A conclusion stronger than the data supports.", "State the limits. Give a number with its error."]
  ];
  dsLab(el, {id: "dsPipeline", title: "The data science loop", intro: "Real projects go around this loop many times: a surprise in <i>Explore</i> sends you back to <i>Collect</i>. Pick a stage.",
    ctl: [{id: "s", label: "Stage", type: "sel", v: 0, opts: S.map((s, i) => [i, `${i + 1}. ${s[0]}`])}],
    draw: v => { const s = S[v.s]; return `<div class="dsrow"><div><p><b>${s[0]}.</b> ${s[1]}</p><p><span class="tag flag">Watch out</span> ${s[2]}</p><p><span class="tag okk">Habit</span> ${s[3]}</p></div>
      <svg class="dschart" viewBox="0 0 340 276" role="img" aria-label="Six stages arranged in a ring, clockwise, repeating"><defs><marker id="ar" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 8 4 0 8z" fill="#C2410C"/></marker></defs>
      ${(() => { const cx = 170, cy = 122, R = 78, pt = (deg, r) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)], ang = i => -90 + i * 60;
        const arcs = S.map((_, i) => { const a = pt(ang(i) + 21, R), b = pt(ang(i) + 39, R); return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} A${R} ${R} 0 0 1 ${b[0].toFixed(1)} ${b[1].toFixed(1)}" fill="none" stroke="#C2410C" stroke-width="2.5" marker-end="url(#ar)"/>`; }).join("");
        const nodes = S.map((x, i) => { const [nx, ny] = pt(ang(i), R), [lx, ly] = pt(ang(i), R + 38), on = i === v.s, side = Math.cos(ang(i) * Math.PI / 180), anchor = Math.abs(side) < .2 ? "middle" : side > 0 ? "start" : "end", lxx = Math.abs(side) < .2 ? nx : nx + (side > 0 ? 26 : -26), lyy = Math.abs(side) < .2 ? (ly + (Math.sin(ang(i) * Math.PI / 180) < 0 ? -4 : 12)) : ny + 4;
          return `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${on ? 22 : 18}" fill="${on ? "#4F46E5" : "#E0E7FF"}" stroke="#4F46E5" stroke-width="2.5"/><text x="${nx.toFixed(1)}" y="${(ny + 5).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="700" fill="${on ? "#fff" : "#1E1B4B"}">${i + 1}</text><text x="${lxx.toFixed(1)}" y="${lyy.toFixed(1)}" text-anchor="${anchor}" font-size="12" font-weight="${on ? 800 : 600}" fill="currentColor">${x[0].split(" ")[0]}</text>`; }).join("");
        return arcs + nodes + `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#C2410C">repeat</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="11" fill="currentColor">and improve</text>`; })()}
      <text x="170" y="270" text-anchor="middle" font-size="11" fill="currentColor">Surprise in 4 or 5? Go back to 2 or 3.</text></svg></div>`; }});
};

/* ---------- 4.1 noise and averaging ---------- */
INTERACTIVES.noiseLab = el => {
  dsLab(el, {id: "noiseLab", title: "Noise lab: why averaging works", intro: "The true temperature is 25.0 °C. Every reading has random noise. Slide the noise (SD, σ) and the number of readings you average (n).",
    ctl: [{id: "sd", label: "Noise σ (°C)", min: 0.2, max: 3, step: 0.1, v: 1}, {id: "n", label: "Readings averaged, n", min: 1, max: 100, v: 9}], btns: [["again", "Take new readings"]], init: () => ({seed: 7}), on: {again: (v, s) => { s.seed += 11; }},
    draw: (v, s) => { const r = DS.rng(s.seed), N = 100, xs = Array.from({length: N}, (_, i) => i + 1), ys = xs.map(() => 25 + v.sd * DS.normal(r)), run = xs.map(i => DS.mean(ys.slice(0, i))), avg = DS.mean(ys.slice(0, v.n)), se = v.sd / Math.sqrt(v.n);
      const svg = DS.chart({w: 640, h: 250, xlab: "reading number", ylab: "°C", x: [1, N], y: [21, 29], points: xs.map((x, i) => ({x, y: ys[i], r: 2.4, color: "#475569", o: .55})), lines: [{x: xs, y: run, label: "running mean", color: "#4F46E5", width: 2.5}], hlines: [{y: 25, label: "truth 25.0", color: "#C2410C"}], vlines: [{x: v.n, color: "#0F766E", label: `n = ${v.n}`}]});
      return `${DS.fig(svg, `Grey dots are single readings; the indigo line is the average so far. After ${v.n} readings the average is ${DS.f(avg, 2)} °C (truth 25.00).`, rows2(["n", "reading", "running mean"], xs.slice(0, 40).map((x, i) => [x, DS.f(ys[i], 2), DS.f(run[i], 2)])))}
      ${kpis([kp("average of first n", DS.f(avg, 2) + " °C"), kp("expected error σ/√n", "± " + DS.f(se, 2) + " °C", se < 0.3 ? "good" : "warn"), kp("one reading's error σ", "± " + DS.f(v.sd, 2) + " °C")])}
      ${MX.eq(`SE = ${MX.fr(MX.v("σ"), MX.rt(MX.v("n")))} = ${MX.fr(DS.f(v.sd, 2), MX.rt(v.n))} = ${DS.f(se, 3)}`)}<p class="explain">To halve the error you need <b>four times</b> as many readings, because of the square root. That is why taking 100 readings is not 100 times better than 1.</p>`; }});
};

/* ---------- 4.2 descriptive statistics, every step shown ---------- */
INTERACTIVES.statsLab = el => {
  dsLab(el, {id: "statsLab", title: "Statistics lab: type your own readings", intro: "Edit the readings (comma-separated). Watch every step of mean, standard deviation, median and quartiles. Try changing 33.9 to 3.39 or to 39.",
    ctl: [{id: "txt", label: "Readings (°C)", type: "sel", v: "28.1, 28.4, 28.2, 28.6, 28.3, 28.5, 28.2, 28.4, 33.9", opts: [["28.1, 28.4, 28.2, 28.6, 28.3, 28.5, 28.2, 28.4, 33.9", "9 readings with one spike"], ["28.1, 28.4, 28.2, 28.6, 28.3, 28.5, 28.2, 28.4, 28.3", "same, spike removed"], ["20, 22, 24, 26, 28, 30, 32", "evenly spread"], ["31, 31, 31, 31, 31", "no variation"]]}],
    draw: v => { const a = v.txt.split(",").map(Number).filter(Number.isFinite), n = a.length; if (n < 3) return "<p>Need at least three numbers.</p>";
      const m = DS.mean(a), dev = a.map(x => x - m), sq = dev.map(d => d * d), ss = DS.sum(sq), vr = ss / (n - 1), sd = Math.sqrt(vr), s = [...a].sort((x, y) => x - y), b = DS.boxStats(a), mad = DS.mad(a);
      const svg = DS.chart({w: 640, h: 150, xlab: "°C", ylab: "", x: [Math.min(...a) - 1, Math.max(...a) + 1], y: [0, 3], points: a.map(x => ({x, y: 1.5, r: 5, color: b.out && b.out.includes(x) ? "#C2410C" : "#4F46E5", shape: b.out && b.out.includes(x) ? "x" : "circle"})), vlines: [{x: m, color: "#4F46E5", label: "mean"}, {x: b.med, color: "#0F766E", label: "median"}], bands: [{y1: 0.9, y2: 2.1, x1: b.q1, x2: b.q3}]});
      return `${DS.fig(svg, `Mean ${DS.f(m, 2)}, median ${DS.f(b.med, 2)}. ${b.out && b.out.length ? "Orange × marks a value beyond the 1.5×IQR fence." : "No value is beyond the fences."}`, rows2(["value", "value − mean", "(value − mean)²"], a.map((x, i) => [x, DS.f(dev[i], 3), DS.f(sq[i], 3)])))}
      <div class="stepcalc">n = ${n}
mean = (${a.join(" + ")}) / ${n} = ${DS.f(DS.sum(a), 2)} / ${n} = ${DS.f(m, 3)}
sum of squared deviations = ${DS.f(ss, 3)}
sample variance = ${DS.f(ss, 3)} / (${n} − 1) = ${DS.f(vr, 3)}
standard deviation = √${DS.f(vr, 3)} = ${DS.f(sd, 3)}
sorted: ${s.join(", ")}
median = ${DS.f(b.med, 2)}   Q1 = ${DS.f(b.q1, 2)}   Q3 = ${DS.f(b.q3, 2)}   IQR = ${DS.f(b.q3 - b.q1, 2)}
fences = Q1 − 1.5·IQR = ${DS.f(b.q1 - 1.5 * (b.q3 - b.q1), 2)}  to  Q3 + 1.5·IQR = ${DS.f(b.q3 + 1.5 * (b.q3 - b.q1), 2)}</div>
      ${kpis([kp("mean", DS.f(m, 2)), kp("median", DS.f(b.med, 2)), kp("SD (n − 1)", DS.f(sd, 2), sd > 1 ? "warn" : ""), kp("MAD", DS.f(mad, 2))])}
      <p class="explain">Why divide by <b>n − 1</b>? The mean was computed from the same data, so the deviations are slightly too small; n − 1 corrects that for a sample. Notice how a single spike drags the <b>mean</b> and the <b>SD</b> but barely moves the <b>median</b> and <b>MAD</b>: these are called <i>robust</i> statistics.</p>`; }});
};

/* ---------- 4.3 missing data ---------- */
INTERACTIVES.imputeLab = el => {
  dsLab(el, {id: "imputeLab", title: "Missing-data lab: delete, forward-fill, or interpolate?", intro: "The kit lost some readings (blank points). The hidden truth is shown so you can measure which repair is closest.",
    ctl: [{id: "gap", label: "Gap length (readings)", min: 1, max: 30, v: 8}, {id: "pos", label: "Gap starts at", min: 10, max: 85, v: 18}, {id: "who", label: "Show", type: "sel", v: "all", opts: [["all", "all three repairs"], ["locf", "forward-fill (LOCF)"], ["lin", "linear interpolation"], ["del", "delete rows"]]}],
    draw: v => { const D = DS.day(11, 288), idx = Array.from({length: 100}, (_, i) => i), truth = idx.map(i => D.temp[i + 150]), y = [...truth]; for (let k = 0; k < v.gap; k++) y[v.pos + k] = NaN;
      const loc = DS.locf(y), lin = DS.lerpFill(y), hole = idx.filter(i => Number.isNaN(y[i])), e = f => DS.rmse(hole.map(i => f[i]), hole.map(i => truth[i]));
      const L = [{x: idx, y: truth, label: "truth", color: "#475569", dash: "2 3", width: 1.5}];
      if (v.who === "all" || v.who === "locf") L.push({x: idx, y: loc, label: "LOCF", color: "#C2410C", dash: "7 4", width: 2.2});
      if (v.who === "all" || v.who === "lin") L.push({x: idx, y: lin, label: "linear", color: "#4F46E5", width: 2.4});
      if (v.who === "del") L.push({x: idx, y: y, label: "delete: gap", color: "#BE185D", width: 2.4});
      const svg = DS.chart({w: 640, h: 260, xlab: "reading number (5 min apart)", ylab: "°C", lines: L.map(l => ({...l, label: ""})), bands: [{y1: -100, y2: 100, x1: v.pos, x2: v.pos + v.gap - 1, color: "rgba(194,65,12,.10)"}]});
      const a = v.pos - 1, b2 = v.pos + v.gap, k = Math.min(2, v.gap);
      return `${DS.fig(svg, `The shaded band is the gap. Grey dotted = truth, orange dashed = forward-fill, indigo = interpolation. Forward-fill error ${DS.f(e(loc), 2)} °C, interpolation error ${DS.f(e(lin), 2)} °C (RMSE over the missing points). Deleting leaves ${v.gap} holes in the timeline.`, rows2(["i", "truth", "LOCF", "linear"], hole.map(i => [i, DS.f(truth[i], 2), DS.f(loc[i], 2), DS.f(lin[i], 2)])))}
      ${kpis([kp("LOCF error (RMSE)", DS.f(e(loc), 2) + " °C", e(loc) > e(lin) ? "warn" : "good"), kp("Linear error (RMSE)", DS.f(e(lin), 2) + " °C", "good"), kp("rows lost if deleted", v.gap + " of 100")])}
      <div class="stepcalc">Linear interpolation fills point i between the last good reading (index ${a}, ${DS.f(truth[a], 2)} °C) and the next good reading (index ${b2}, ${DS.f(truth[b2], 2)} °C):
y(i) = y${MX.sub("a")} + (y${MX.sub("b")} − y${MX.sub("a")}) × (i − a)/(b − a)
for i = ${a + k}:  ${DS.f(truth[a], 2)} + (${DS.f(truth[b2], 2)} − ${DS.f(truth[a], 2)}) × ${k}/${b2 - a} = ${DS.f(lin[a + k], 2)} °C   (truth was ${DS.f(truth[a + k], 2)})</div>
      <p class="explain">Forward-fill repeats the last value: fine for a few readings or for a step-like signal (a switch). Interpolation draws a straight bridge: better for slow, smooth signals like temperature. For a very long gap, <b>neither is honest</b>: mark the data as missing and say so in your report.</p>`; }});
};

/* ---------- 4.3 smoothing ---------- */
INTERACTIVES.smoothLab = el => {
  dsLab(el, {id: "smoothLab", title: "Smoothing lab: moving average and EMA", intro: "A TMP36 on a breadboard is noisy. Smooth it, then see the trade-off: more smoothing means less noise but more lag.",
    ctl: [{id: "m", label: "Method", type: "sel", v: "trail", opts: [["trail", "trailing moving average"], ["center", "centred moving average"], ["ema", "exponential (EMA)"]]}, {id: "w", label: "Window w", min: 1, max: 25, v: 7}, {id: "a", label: "EMA α (×100)", min: 5, max: 100, v: 30}, {id: "noise", label: "Noise σ (°C)", min: 0, max: 1.5, step: .1, v: .6}],
    draw: v => { const N = 120, r = DS.rng(5), x = Array.from({length: N}, (_, i) => i), truth = x.map(i => 24 + (i > 50 ? Math.min(8, (i - 50) * 0.25) : 0)), raw = truth.map(t => t + v.noise * DS.normal(r));
      const sm = v.m === "trail" ? DS.movavgTrail(raw, v.w) : v.m === "center" ? DS.movavgCenter(raw, v.w % 2 ? v.w : v.w + 1) : DS.ema(raw, v.a / 100);
      const ok = x.filter(i => Number.isFinite(sm[i])), er = f => DS.rmse(ok.map(i => f[i]), ok.map(i => truth[i]));
      const svg = DS.chart({w: 640, h: 260, xlab: "reading number", ylab: "°C", lines: [{x, y: raw, label: "raw", color: "#94A3B8", width: 1.3}, {x, y: truth, label: "truth", color: "#475569", dash: "2 3", width: 1.5}, {x, y: sm, label: "smoothed", color: "#4F46E5", width: 2.6}]});
      const i0 = 70, w = v.w, seg = raw.slice(Math.max(0, i0 - w + 1), i0 + 1);
      return `${DS.fig(svg, `Raw error ${DS.f(er(raw), 2)} °C; smoothed error ${DS.f(er(sm), 2)} °C. The smoothed line ${v.m === "center" ? "has no lag (it looks both ways)" : "trails the real rise: that is the lag"}.`, rows2(["i", "raw", "smoothed", "truth"], x.slice(0, 50).map(i => [i, DS.f(raw[i], 2), DS.f(sm[i], 2), DS.f(truth[i], 2)])))}
      ${kpis([kp("raw error (RMSE)", DS.f(er(raw), 2) + " °C"), kp("smoothed error", DS.f(er(sm), 2) + " °C", "good")])}
      <div class="stepcalc">${v.m === "ema" ? `EMA: s(t) = α·x(t) + (1 − α)·s(t − 1),  α = ${DS.f(v.a / 100, 2)}\nExample: s(70) = ${DS.f(v.a / 100, 2)} × ${DS.f(raw[70], 2)} + ${DS.f(1 - v.a / 100, 2)} × ${DS.f(sm[69], 2)} = ${DS.f(sm[70], 2)}` : `Trailing MA at i = ${i0} with w = ${w}: add the last ${seg.length} readings and divide by ${seg.length}\n(${seg.map(q => DS.f(q, 1)).join(" + ")}) / ${seg.length} = ${DS.f(DS.mean(seg), 2)}`}</div>
      <p class="explain">Try w = 1 (no smoothing), then w = 25 (the rise is blurred and late). Choose the smallest window that gives a calm line. For a control loop (a fan switching on) use a trailing average or EMA, because a centred average needs the future, which a real robot does not have yet.</p>`; }});
};

/* ---------- 4.3 decomposition ---------- */
INTERACTIVES.decomposeLab = el => {
  dsLab(el, {id: "decomposeLab", title: "Decomposition lab: trend + daily cycle + residual", intro: "Five days of hourly greenhouse temperature. The model splits every reading into three parts. A true anomaly shows up in the residual, not in the raw line.",
    ctl: [{id: "spike", label: "Add an anomaly (°C)", min: 0, max: 8, step: .5, v: 0}, {id: "tr", label: "Warming trend (°C/day)", min: 0, max: 2, step: .1, v: .6}],
    draw: v => { const N = 120, r = DS.rng(21), x = Array.from({length: N}, (_, i) => i), y = x.map(i => 26 + v.tr * i / 24 + 4 * Math.sin((i % 24 - 9) / 24 * 2 * Math.PI) + 0.35 * DS.normal(r)); y[75] += v.spike;
      const d = DS.decompose(y, 24), rs = d.resid.filter(Number.isFinite), s = DS.sd(rs), flag = x.filter(i => Number.isFinite(d.resid[i]) && Math.abs(d.resid[i]) > 3 * s);
      const mk = (yy, lab, col, h) => DS.chart({w: 640, h: h || 150, xlab: "", ylab: lab, lines: [{x, y: yy, label: "", color: col, width: 2}], points: lab === "residual" ? flag.map(i => ({x: i, y: d.resid[i], r: 5, color: "#C2410C", shape: "x"})) : []});
      return `${DS.fig(mk(y, "observed", "#475569"), "Observed temperature: a daily wave on top of a slow rise.", rows2(["hour", "observed", "trend", "seasonal", "residual"], x.map(i => [i, DS.f(y[i], 2), DS.f(d.trend[i], 2), DS.f(d.seasonal[i], 2), DS.f(d.resid[i], 2)])))}
      ${DS.fig(mk(d.trend, "trend", "#4F46E5"), "Trend: a centred 24-hour moving average removes the daily wave.")}
      ${DS.fig(mk(d.seasonal, "seasonal", "#0F766E"), "Seasonal: the average shape of a day (the same every day).")}
      ${DS.fig(mk(d.resid, "residual", "#BE185D"), flag.length ? `Residual: ${flag.length} point(s) beyond 3 SD (SD = ${DS.f(s, 2)} °C), marked with an orange ×. That is the anomaly.` : `Residual: only random noise (SD = ${DS.f(s, 2)} °C). Nothing is beyond 3 SD.`)}
      ${MX.eq(`${MX.v("y")}${MX.sub("t")} = ${MX.v("T")}${MX.sub("t")} + ${MX.v("S")}${MX.sub("t")} + ${MX.v("R")}${MX.sub("t")}`)}
      <p class="explain"><b>T</b> is the trend, <b>S</b> the seasonal part (period 24 readings), <b>R</b> the leftover. Step: (1) average over one full period to get T; (2) subtract T and average each hour of the day to get S (then centre it to sum to 0); (3) R = y − T − S. A 2 pm peak is <i>normal</i>: it lives in S. A peak at 3 am would not fit S and would appear in R.</p>`; }});
};

/* ---------- 4.3 feature engineering: heat index and dew point ---------- */
INTERACTIVES.heatIndexLab = el => {
  dsLab(el, {id: "heatIndexLab", title: "Feature lab: heat index and dew point from two sensors", intro: "Temperature and humidity together tell you more than either alone. Slide them and see the engineered features and the fan decision.",
    ctl: [{id: "t", label: "Air temp (°C)", min: 20, max: 42, step: .5, v: 33}, {id: "rh", label: "Humidity (%)", min: 20, max: 100, v: 70}, {id: "thr", label: "Fan ON at heat index ≥ (°C)", min: 28, max: 45, v: 38}],
    draw: v => { const tf = DS.cToF(v.t), hi = DS.heatIndexC(v.t, v.rh), dp = DS.dewPointC(v.t, v.rh), on = hi >= v.thr, cat = hi < 27 ? "comfortable" : hi < 32 ? "caution" : hi < 41 ? "extreme caution" : hi < 54 ? "danger" : "extreme danger";
      const T = Array.from({length: 23}, (_, i) => 20 + i), svg = DS.chart({w: 640, h: 250, xlab: "air temperature (°C)", ylab: "feels-like (°C)", lines: [40, 60, 80].map((h, k) => ({x: T, y: T.map(t => DS.heatIndexC(t, h)), label: h + "% RH", color: ["#0F766E", "#4F46E5", "#C2410C"][k], dash: ["", "7 4", "2 3"][k], width: 2.2})).concat([{x: T, y: T, label: "T itself", color: "#94A3B8", width: 1}]), points: [{x: v.t, y: hi, r: 6, color: "#BE185D"}], hlines: [{y: v.thr, label: "fan ON", color: "#B91C1C"}]});
      return `${DS.fig(svg, `At ${v.t} °C and ${v.rh}% humidity it feels like ${DS.f(hi, 1)} °C (${cat}). Dew point ${DS.f(dp, 1)} °C. The fan is ${on ? "ON" : "OFF"}.`, rows2(["T °C", "HI @40%", "HI @60%", "HI @80%"], T.map(t => [t, DS.f(DS.heatIndexC(t, 40), 1), DS.f(DS.heatIndexC(t, 60), 1), DS.f(DS.heatIndexC(t, 80), 1)])))}
      ${kpis([kp("heat index", DS.f(hi, 1) + " °C", on ? "warn" : "good"), kp("dew point", DS.f(dp, 1) + " °C"), kp("fan", on ? "ON" : "OFF", on ? "warn" : "good")])}
      <div class="stepcalc">1. Convert: T°F = ${v.t} × 9/5 + 32 = ${DS.f(tf, 1)} °F
2. NWS Rothfusz regression (used when the simple estimate ≥ 80 °F):
   HI = −42.379 + 2.04901523·T + 10.14333127·RH − 0.22475541·T·RH − 0.00683783·T² − 0.05481717·RH² + 0.00122874·T²·RH + 0.00085282·T·RH² − 0.00000199·T²·RH²
3. HI = ${DS.f(DS.heatIndexF(tf, v.rh), 1)} °F → back to °C: (${DS.f(DS.heatIndexF(tf, v.rh), 1)} − 32) × 5/9 = ${DS.f(hi, 1)} °C
Dew point (Magnus): γ = ln(RH/100) + 17.625·T/(243.04 + T) = ${DS.f(Math.log(v.rh / 100) + 17.625 * v.t / (243.04 + v.t), 3)};  Td = 243.04·γ/(17.625 − γ) = ${DS.f(dp, 1)} °C</div>
      <p class="explain">This is <b>feature engineering</b>: the new column <code>heat_index_c</code> is a better predictor of discomfort than <code>temp_c</code> alone. The heat-index regression is meant for roughly 27 °C and above and RH ≥ 40%; below that it is not reliable, so say so in your report.</p>`; }});
};

/* ---------- 4.3 calibration curve: polynomial regression ---------- */
INTERACTIVES.polyFitLab = el => {
  const r = DS.rng(33), xs = Array.from({length: 16}, (_, i) => 0.55 + i * 0.03), tru = x => 100 * (x - 0.5) + 6 * Math.sin((x - 0.5) * 12), ys = xs.map(x => tru(x) + 0.9 * DS.normal(r)), isTest = xs.map((_, i) => i % 4 === 2);
  dsLab(el, {id: "polyFitLab", title: "Calibration lab: fit a curve to TMP36 readings", intro: "Voltage (V) against a reference thermometer (°C). Filled dots train the curve; the ringed dots are held back to test it. Raise the degree and watch the training error fall while the test error does not.",
    ctl: [{id: "deg", label: "Polynomial degree", min: 1, max: 7, v: 1}],
    draw: v => { const tr = xs.map((x, i) => i).filter(i => !isTest[i]), te = xs.map((x, i) => i).filter(i => isTest[i]), f = DS.polyfit(tr.map(i => xs[i]), tr.map(i => ys[i]), v.deg), g = x => f.pred(x), xx = Array.from({length: 80}, (_, i) => 0.55 + i * 0.45 / 79);
      const rm = idx => DS.rmse(idx.map(i => g(xs[i])), idx.map(i => ys[i])), my = DS.mean(tr.map(i => ys[i])), r2 = 1 - DS.sum(tr.map(i => (ys[i] - g(xs[i])) ** 2)) / DS.sum(tr.map(i => (ys[i] - my) ** 2));
      const svg = DS.chart({w: 640, h: 270, xlab: "TMP36 output (V)", ylab: "reference °C", y: [-5, 50], lines: [{x: xx, y: xx.map(g), label: "fit deg " + v.deg, color: "#4F46E5", width: 2.6}], points: xs.map((x, i) => ({x, y: ys[i], r: isTest[i] ? 6 : 4, color: isTest[i] ? "#C2410C" : "#475569", shape: isTest[i] ? "square" : "circle"}))});
      return `${DS.fig(svg, `Degree ${v.deg}: training R² = ${DS.f(r2, 3)}, training error ${DS.f(rm(tr), 2)} °C, test error ${DS.f(rm(te), 2)} °C. Grey circles train; orange squares test.`, rows2(["V", "reference °C", "fit °C", "set"], xs.map((x, i) => [DS.f(x, 3), DS.f(ys[i], 2), DS.f(g(x), 2), isTest[i] ? "test" : "train"])))}
      ${kpis([kp("R² (train)", DS.f(r2, 3)), kp("RMSE train", DS.f(rm(tr), 2) + " °C", "good"), kp("RMSE test", DS.f(rm(te), 2) + " °C", rm(te) > 1.6 * rm(tr) + 0.3 ? "warn" : "good")])}
      ${MX.eq(`R² = 1 − ${MX.fr("Σ(" + MX.v("y") + " − ŷ)²", "Σ(" + MX.v("y") + " − ȳ)²")}`)}
      <p class="explain">R² says how much of the variation the curve explains (1 = all). But <b>R² on training data always rises with degree</b>, even when the curve is chasing noise. The honest number is the <b>test error</b>. When test error climbs while train error falls, you are <b>overfitting</b>: choose the lowest degree that still gives a small test error.</p>`; }});
};
