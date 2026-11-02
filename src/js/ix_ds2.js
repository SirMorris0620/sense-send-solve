/* ============ Data science labs, part 2 (modules 4.4 - 4.8). Uses dsLab, kp, kpis, rows2 from ix_ds1.js ============ */

/* ---------- 4.4 MQ gas sensor: log-log calibration ---------- */
INTERACTIVES.mqCurveLab = el => {
  const A = 116.6020682, B = -2.769034857;   // widely used fit for the MQ-135 CO2 curve (ppm = a * (Rs/R0)^b); check your own datasheet
  const r = DS.rng(8), ratio = [0.55, 0.65, 0.8, 1, 1.3, 1.7, 2.2, 3], ppm = ratio.map(q => A * q ** B * (1 + 0.04 * DS.normal(r)));
  dsLab(el, {id: "mqCurveLab", title: "Gas-sensor lab: turn Rs/R0 into ppm with a log transform", intro: "The datasheet curve is bent on normal axes but becomes a straight line on log-log axes. Fit the line, then read ppm from any ratio.",
    ctl: [{id: "ax", label: "Axes", type: "sel", v: "log", opts: [["lin", "normal axes (curved)"], ["log", "log-log axes (straight)"]]}, {id: "q", label: "Your reading Rs/R0", min: 0.5, max: 3, step: .05, v: 1.2}],
    draw: v => { const f = DS.loglogFit(ratio, ppm), qq = Array.from({length: 60}, (_, i) => 0.5 + i * 2.5 / 59), L = v.ax === "log", tx = q => L ? Math.log10(q) : q, ty = p => L ? Math.log10(p) : p, est = f.ppm(v.q);
      const svg = DS.chart({w: 640, h: 260, xlab: L ? "log10(Rs/R0)" : "Rs/R0", ylab: L ? "log10(ppm)" : "ppm", lines: [{x: qq.map(tx), y: qq.map(q => ty(f.ppm(q))), label: "fit", color: "#4F46E5", width: 2.4}], points: ratio.map((q, i) => ({x: tx(q), y: ty(ppm[i]), r: 4.5, color: "#475569"})).concat([{x: tx(v.q), y: ty(est), r: 7, color: "#C2410C", shape: "square"}])});
      return `${DS.fig(svg, `On ${L ? "log-log" : "normal"} axes the curve is ${L ? "a straight line" : "bent"}. Your ratio ${v.q} reads ≈ ${DS.f(est, 0)} ppm. The line fits with R² = ${DS.f(f.r2, 4)}.`, rows2(["Rs/R0", "ppm (datasheet points)"], ratio.map((q, i) => [q, DS.f(ppm[i], 1)])))}
      ${kpis([kp("slope b", DS.f(f.b, 3)), kp("a (ppm at ratio 1)", DS.f(f.a, 1)), kp("R² of line", DS.f(f.r2, 4), "good"), kp("ppm at your ratio", DS.f(est, 0) + " ppm", "warn")])}
      ${MX.eq(`ppm = ${MX.v("a")} · (Rs/R0)${MX.sup(MX.v("b"))}`, `⟹ log${MX.sub("10")}(ppm) = log${MX.sub("10")}(${MX.v("a")}) + ${MX.v("b")} · log${MX.sub("10")}(Rs/R0)`)}
      <div class="stepcalc">Fitted line: log10(ppm) = ${DS.f(f.c, 3)} + (${DS.f(f.b, 3)}) × log10(Rs/R0)
For Rs/R0 = ${v.q}: log10(${v.q}) = ${DS.f(Math.log10(v.q), 3)}
log10(ppm) = ${DS.f(f.c, 3)} + (${DS.f(f.b, 3)}) × ${DS.f(Math.log10(v.q), 3)} = ${DS.f(f.c + f.b * Math.log10(v.q), 3)}
ppm = 10^${DS.f(f.c + f.b * Math.log10(v.q), 3)} = ${DS.f(est, 1)}</div>
      <p class="explain">A straight line is easy to fit with ordinary least squares; a curve is not. The trick: <b>transform the variables so the relationship becomes linear</b>, fit, then transform back. The fitted slope is negative because more gas means a <i>lower</i> Rs. These ppm values are only as good as R0 (the sensor's resistance in clean air), so calibrate R0 outdoors after a 24-hour warm-up, and treat MQ readings as <b>relative</b>, not laboratory-grade.</p>`; }});
};

/* ---------- 4.4 feature scaling ---------- */
INTERACTIVES.scalingLab = el => {
  dsLab(el, {id: "scalingLab", title: "Scaling lab: Min-Max or Z-score?", intro: "An MQ sensor reads about 150 to 900. An LDR reads 0 to 1023. A distance-based model would treat the bigger numbers as more important. Scale them to compare fairly.",
    ctl: [{id: "m", label: "Scaling", type: "sel", v: "mm", opts: [["raw", "none (raw)"], ["mm", "Min-Max (0 to 1)"], ["z", "Z-score (mean 0, SD 1)"]]}, {id: "out", label: "Add one extreme gas reading", type: "chk", v: false}],
    draw: v => { const r = DS.rng(4), n = 40, gas = Array.from({length: n}, () => 300 + 90 * DS.normal(r)), ldr = Array.from({length: n}, () => 520 + 160 * DS.normal(r)); if (v.out) gas[0] = 1500;
      const f = a => v.m === "mm" ? DS.minmax(a) : v.m === "z" ? DS.zscores(a) : a, g = f(gas), l = f(ldr), lo = Math.min(...g, ...l), hi = Math.max(...g, ...l);
      const svg = DS.chart({w: 640, h: 270, xlab: "gas (scaled)", ylab: "LDR (scaled)", x: [lo - (hi - lo) * .05, hi + (hi - lo) * .05], y: [lo - (hi - lo) * .05, hi + (hi - lo) * .05], points: g.map((x, i) => ({x, y: l[i], r: 3.6, color: i === 0 && v.out ? "#C2410C" : "#4F46E5", shape: i === 0 && v.out ? "x" : "circle"}))});
      const gm = Math.min(...gas), gM = Math.max(...gas), ex = gas[1];
      return `${DS.fig(svg, v.m === "raw" ? "Raw: the cloud is stretched along one axis because the units differ." : `Scaled: both sensors now live on a comparable range${v.out ? ", but the extreme reading squashes everyone else when using Min-Max" : ""}.`, rows2(["gas raw", "LDR raw", "gas scaled", "LDR scaled"], gas.map((x, i) => [DS.f(x, 0), DS.f(ldr[i], 0), DS.f(g[i], 3), DS.f(l[i], 3)])))}
      ${kpis([kp("gas range", DS.f(Math.min(...g), 2) + " to " + DS.f(Math.max(...g), 2)), kp("LDR range", DS.f(Math.min(...l), 2) + " to " + DS.f(Math.max(...l), 2))])}
      ${MX.eq(`Min-Max:  ${MX.v("x′")} = ${MX.fr(MX.v("x") + " − " + MX.v("x") + MX.sub("min"), MX.v("x") + MX.sub("max") + " − " + MX.v("x") + MX.sub("min"))}`, `Z-score:  ${MX.v("z")} = ${MX.fr(MX.v("x") + " − μ", "σ")}`)}
      <div class="stepcalc">Example gas value x = ${DS.f(ex, 1)}
Min-Max: (${DS.f(ex, 1)} − ${DS.f(gm, 1)}) / (${DS.f(gM, 1)} − ${DS.f(gm, 1)}) = ${DS.f((ex - gm) / (gM - gm), 3)}
Z-score: (${DS.f(ex, 1)} − ${DS.f(DS.mean(gas), 1)}) / ${DS.f(DS.sd(gas), 1)} = ${DS.f((ex - DS.mean(gas)) / DS.sd(gas), 3)}</div>
      <p class="explain">Tick the extreme reading with Min-Max: almost every normal point is crushed into a corner because the maximum is now huge. <b>Z-score</b> is less affected. Rule of thumb: Min-Max when you know the true limits (a 0–1023 ADC); Z-score when the data is roughly bell-shaped or has no fixed limits. <b>Always compute the minimum, maximum, mean and SD from the training data only</b>, then reuse them on new data.</p>`; }});
};

/* ---------- 4.4 anomaly detection ---------- */
INTERACTIVES.anomalyLab = el => {
  dsLab(el, {id: "anomalyLab", title: "Anomaly lab: threshold vs isolation forest", intro: "A gas sensor in a kitchen: normal drift plus three real spike events covering six readings (known, so you can score each method). Tune the detector.",
    ctl: [{id: "m", label: "Method", type: "sel", v: "z", opts: [["z", "rolling z-score"], ["iso", "isolation forest"]]}, {id: "t", label: "Threshold (z, or score ×100)", min: 20, max: 99, v: 60}, {id: "win", label: "Rolling window", min: 5, max: 40, v: 20}],
    draw: v => { const N = 200, r = DS.rng(12), x = Array.from({length: N}, (_, i) => i), y = x.map(i => 1 + 0.15 * Math.sin(i / 25) + 0.02 * DS.normal(r)), truth = [60, 61, 130, 170, 171, 172]; y[60] += .35; y[61] += .3; y[130] += .5; y[170] += .4; y[171] += .45; y[172] += .38;
      let flag, lab; const t = v.t;
      if (v.m === "z"){ const z = DS.rollingZ(y, v.win); flag = x.filter(i => Math.abs(z[i]) > t / 10); lab = `|z| > ${DS.f(t / 10, 1)}`; }
      else { const F = DS.isoForest(y.map(q => ({v: q})).map(q => q.v), 100, 128, DS.rng(3)), sc = y.map(q => F.score(q)); flag = x.filter(i => sc[i] > t / 100); lab = `score > ${DS.f(t / 100, 2)}`; }
      const hit = flag.filter(i => truth.includes(i)).length, fp = flag.length - hit, miss = truth.length - hit;
      const svg = DS.chart({w: 640, h: 250, xlab: "reading number", ylab: "gas ratio", lines: [{x, y, label: "", color: "#475569", width: 1.6}], points: flag.map(i => ({x: i, y: y[i], r: 5, color: "#C2410C", shape: "x"})).concat(truth.filter(i => !flag.includes(i)).map(i => ({x: i, y: y[i], r: 5, color: "#BE185D", shape: "square"})))});
      return `${DS.fig(svg, `Rule ${lab}: ${flag.length} flagged. ${hit} of ${truth.length} real spikes caught, ${fp} false alarms, ${miss} missed (magenta squares).`, rows2(["i", "value", "flagged", "real spike"], x.filter(i => flag.includes(i) || truth.includes(i)).map(i => [i, DS.f(y[i], 3), flag.includes(i) ? "yes" : "no", truth.includes(i) ? "yes" : "no"])))}
      ${kpis([kp("caught", hit + " / " + truth.length, "good"), kp("false alarms", fp, fp ? "warn" : "good"), kp("missed", miss, miss ? "warn" : "good")])}
      ${v.m === "z" ? MX.eq(`${MX.v("z")}${MX.sub("i")} = ${MX.fr(MX.v("x") + MX.sub("i") + " − mean(previous w)", "SD(previous w)")}`) : MX.eq(`${MX.v("s")}(${MX.v("x")}) = 2${MX.sup("−E[" + MX.v("h") + "(" + MX.v("x") + ")] / c(" + MX.v("n") + ")")}`, `c(${MX.v("n")}) = 2(ln(${MX.v("n")}−1) + 0.5772) − 2(${MX.v("n")}−1)/${MX.v("n")}`)}
      <p class="explain">${v.m === "z" ? "A rolling z-score asks: how many SDs is this reading from the last w readings? A <b>long</b> spike (three readings in a row) makes the window's SD grow, so later spikes are hidden: this is called <i>masking</i>. Try window 40, then 8." : "An isolation forest builds many random trees that split the data at random cut points. Odd readings are separated after very few cuts (a short path), so their score is close to 1; ordinary readings need many cuts (score near 0.5). No distribution has to be assumed. The threshold is a <b>decision</b>: lower it and you catch more leaks but raise more false alarms."} In a gas-leak alarm a miss costs more than a false alarm, so you accept some false alarms.</p>`; }});
};

/* ---------- 4.5 Hampel filter ---------- */
INTERACTIVES.hampelLab = el => {
  dsLab(el, {id: "hampelLab", title: "Ultrasonic lab: catch ghost echoes with a Hampel filter", intro: "The rover measures a wall about 20 cm away. A few echoes bounce off a far object and read hundreds of cm. The filter compares each reading with the median of its neighbours.",
    ctl: [{id: "k", label: "Half-window k", min: 2, max: 10, v: 4}, {id: "t", label: "Threshold t (× scaled MAD)", min: 1, max: 6, step: .5, v: 3}, {id: "n", label: "Ghost echoes", min: 0, max: 8, v: 4}],
    draw: v => { const N = 80, r = DS.rng(2), x = Array.from({length: N}, (_, i) => i), tr = x.map(i => 25 - i * 0.15), y = tr.map(t => t + 0.6 * DS.normal(r)), ghosts = [8, 21, 33, 47, 52, 60, 68, 74].slice(0, v.n); ghosts.forEach((g, j) => { y[g] = 120 + 90 * ((j * 37) % 5) / 4; });
      const H = DS.hampel(y, v.k, v.t), caught = ghosts.filter(g => H.out.includes(g)), fp = H.out.filter(i => !ghosts.includes(i)), cl = DS.rmse(H.rep, tr), raw = DS.rmse(y, tr), i0 = ghosts.length ? ghosts[0] : 30, inf = H.info[i0];
      const svg = DS.chart({w: 640, h: 260, xlab: "reading number", ylab: "distance (cm)", y: [0, 220], lines: [{x, y, label: "raw", color: "#94A3B8", width: 1.4}, {x, y: H.rep, label: "cleaned", color: "#4F46E5", width: 2.4}], points: H.out.map(i => ({x: i, y: y[i], r: 5, color: "#C2410C", shape: "x"}))});
      return `${DS.fig(svg, `${caught.length} of ${ghosts.length} ghost echoes caught, ${fp.length} good readings wrongly changed. Error vs the true distance fell from ${DS.f(raw, 1)} cm to ${DS.f(cl, 1)} cm.`, rows2(["i", "raw", "window median", "limit ±", "flag"], x.filter(i => H.info[i].flag).map(i => [i, DS.f(y[i], 1), DS.f(H.info[i].med, 1), DS.f(v.t * H.info[i].s, 1), "replaced"])))}
      ${kpis([kp("echoes caught", caught.length + " / " + ghosts.length, "good"), kp("false flags", fp.length, fp.length ? "warn" : "good"), kp("RMSE before → after", DS.f(raw, 1) + " → " + DS.f(cl, 1) + " cm")])}
      <div class="stepcalc">Window around reading ${i0} (k = ${v.k}): median = ${DS.f(inf.med, 1)} cm
scaled MAD = 1.4826 × MAD = ${DS.f(inf.s, 2)} cm
limit = t × scaled MAD = ${v.t} × ${DS.f(inf.s, 2)} = ${DS.f(v.t * inf.s, 2)} cm
|${DS.f(y[i0], 1)} − ${DS.f(inf.med, 1)}| = ${DS.f(Math.abs(y[i0] - inf.med), 1)} cm  ${inf.flag ? "> limit → outlier, replace with the median" : "≤ limit → keep"}</div>
      <p class="explain">The Hampel filter uses the <b>median</b> and <b>MAD</b> instead of the mean and SD, so the spike cannot hide itself by inflating the yardstick. The constant 1.4826 makes MAD comparable to an SD for bell-shaped noise. Raise <i>Ghost echoes</i> or lower <i>k</i> and the window gets crowded with bad values: the filter fails when more than about half the window is bad.</p>`; }});
};

/* ---------- 4.5 error metrics ---------- */
INTERACTIVES.errorMetricsLab = el => {
  dsLab(el, {id: "errorMetricsLab", title: "Accuracy lab: MAE, RMSE and bias against a laser measure", intro: "Eight distances measured by the ultrasonic sensor and by a laser tape (the truth). Add one bad reading to see why RMSE and MAE differ.",
    ctl: [{id: "bad", label: "Error of the last reading (cm)", min: 0, max: 30, v: 1}, {id: "off", label: "Constant sensor offset (cm)", min: -3, max: 3, step: .5, v: 0}],
    draw: v => { const truth = [20, 40, 60, 80, 100, 120, 150, 200], e0 = [0.4, -0.8, 1.1, -0.3, 0.9, -1.2, 0.5, 0], pred = truth.map((t, i) => t + e0[i] + v.off + (i === 7 ? v.bad : 0)), err = pred.map((p, i) => p - truth[i]), mae = DS.mae(pred, truth), rm = DS.rmse(pred, truth), bi = DS.bias(pred, truth);
      const edges = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 31], cnt = DS.histogram(err.map(e => Math.max(-3.99, Math.min(30.5, e))), edges), bars = cnt.map((c, i) => ({x: i, y: c, w: 1}));
      const svg = DS.chart({w: 640, h: 220, xlab: "error bin (cm): [−4,−3) … [3,4) then 4+", ylab: "count", x: [-.7, 9.7], y: [0, Math.max(3, ...cnt) + 1], bars});
      return `${DS.fig(svg, `Bias ${DS.f(bi, 2)} cm (average direction), MAE ${DS.f(mae, 2)} cm, RMSE ${DS.f(rm, 2)} cm. ${rm > 1.6 * mae ? "RMSE is much bigger than MAE: one large error is dominating." : "RMSE and MAE are close: errors are similar in size."}`, rows2(["truth", "sensor", "error", "|error|", "error²"], truth.map((t, i) => [t, DS.f(pred[i], 1), DS.f(err[i], 2), DS.f(Math.abs(err[i]), 2), DS.f(err[i] ** 2, 2)])))}
      ${kpis([kp("bias (mean error)", DS.f(bi, 2) + " cm"), kp("MAE", DS.f(mae, 2) + " cm", "good"), kp("RMSE", DS.f(rm, 2) + " cm", rm > 1.6 * mae ? "warn" : "good")])}
      ${MX.eq(`MAE = ${MX.fr("1", MX.v("n"))} Σ |ŷ${MX.sub("i")} − ${MX.v("y")}${MX.sub("i")}|`, `RMSE = ${MX.rt(MX.fr("1", MX.v("n")) + " Σ (ŷ" + MX.sub("i") + " − " + MX.v("y") + MX.sub("i") + ")²")}`, `bias = ${MX.fr("1", MX.v("n"))} Σ (ŷ${MX.sub("i")} − ${MX.v("y")}${MX.sub("i")})`)}
      <p class="explain">Squaring makes <b>RMSE punish big errors</b>; MAE treats all errors equally. Use RMSE when a big miss is dangerous (a rover hitting a wall), MAE for a typical error. <b>Bias</b> tells you whether the sensor reads systematically high or low: a constant offset can be fixed by calibration, a random error cannot. Report all three, with the unit.</p>`; }});
};

/* ---------- 4.5 Markov chain for PIR motion ---------- */
INTERACTIVES.markovLab = el => {
  dsLab(el, {id: "markovLab", title: "Markov lab: model a PIR sensor as states and transitions", intro: "A PIR gives 0 (no motion) or 1 (motion) every few seconds. Set the real behaviour, simulate a log, then recover the transition matrix from it.",
    ctl: [{id: "p01", label: "P(motion starts | quiet) %", min: 2, max: 60, v: 10}, {id: "p11", label: "P(motion continues | motion) %", min: 20, max: 98, v: 75}, {id: "n", label: "Readings logged", min: 30, max: 600, step: 10, v: 200}], btns: [["new", "New log"]], init: () => ({seed: 5}), on: {new: (v, s) => { s.seed += 13; }},
    draw: (v, s) => { const r = DS.rng(s.seed), seq = [0]; for (let i = 1; i < v.n; i++){ const p = seq[i - 1] ? v.p11 / 100 : v.p01 / 100; seq.push(r() < p ? 1 : 0); }
      const M2 = DS.markov2(seq), c = M2.counts, P = M2.P, occ = DS.mean(seq), tp0 = v.p01 / 100, tp1 = 1 - v.p11 / 100, theo = tp0 / (tp0 + tp1);
      const bx = (x, y, t, on) => `<g><circle cx="${x}" cy="${y}" r="30" fill="${on ? "#4F46E5" : "#E0E7FF"}" stroke="#4F46E5" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-weight="700" fill="${on ? "#fff" : "#1E1B4B"}">${t}</text></g>`;
      const svg = `<svg class="dschart" viewBox="0 0 420 170" role="img" aria-label="Two states, quiet and motion, with arrows labelled by the estimated probabilities"><defs><marker id="mk" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" fill="#1E1B4B"/></marker></defs>${bx(90, 85, "0 quiet", false)}${bx(330, 85, "1 motion", true)}
        <path d="M118 70 C 170 30, 250 30, 302 70" fill="none" stroke="#1E1B4B" stroke-width="2" marker-end="url(#mk)"/><text x="210" y="32" text-anchor="middle" class="dl" fill="#1E1B4B">${DS.f(P[0][1], 2)}  (0→1)</text>
        <path d="M302 102 C 250 142, 170 142, 118 102" fill="none" stroke="#C2410C" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#mk)"/><text x="210" y="150" text-anchor="middle" class="dl" fill="#C2410C">${DS.f(P[1][0], 2)}  (1→0)</text>
        <path d="M70 58 C 50 20, 100 20, 80 56" fill="none" stroke="#1E1B4B" stroke-width="1.6"/><text x="40" y="22" class="dl" fill="#1E1B4B">${DS.f(P[0][0], 2)}</text><path d="M350 58 C 330 20, 380 20, 360 56" fill="none" stroke="#1E1B4B" stroke-width="1.6"/><text x="372" y="22" class="dl" fill="#1E1B4B">${DS.f(P[1][1], 2)}</text></svg>`;
      return `${DS.fig(svg, `Estimated: P(motion | quiet) = ${DS.f(P[0][1], 2)}, P(motion | motion) = ${DS.f(P[1][1], 2)}. Long-run share of time with motion ≈ ${DS.f(M2.stationary[1], 2)}.`, rows2(["from \\ to", "to 0", "to 1"], [["from 0", c[0][0], c[0][1]], ["from 1", c[1][0], c[1][1]]]))}
      <p class="explain">First 60 readings: <code>${seq.slice(0, 60).join("")}</code></p>
      ${kpis([kp("occupancy (observed)", DS.f(occ * 100, 0) + " %"), kp("occupancy (from matrix)", DS.f(M2.stationary[1] * 100, 0) + " %"), kp("true long-run", DS.f(theo * 100, 0) + " %")])}
      <div class="stepcalc">Count the pairs (previous → next):  0→0 = ${c[0][0]},  0→1 = ${c[0][1]},  1→0 = ${c[1][0]},  1→1 = ${c[1][1]}
P(1 | 0) = ${c[0][1]} / (${c[0][0]} + ${c[0][1]}) = ${DS.f(P[0][1], 3)}
P(1 | 1) = ${c[1][1]} / (${c[1][0]} + ${c[1][1]}) = ${DS.f(P[1][1], 3)}
Long-run share in state 1:  π₁ = P(1|0) / (P(1|0) + P(0|1)) = ${DS.f(P[0][1], 3)} / (${DS.f(P[0][1], 3)} + ${DS.f(P[1][0], 3)}) = ${DS.f(M2.stationary[1], 3)}</div>
      ${MX.eq(`P = [ ${DS.f(P[0][0], 2)}  ${DS.f(P[0][1], 2)} ; ${DS.f(P[1][0], 2)}  ${DS.f(P[1][1], 2)} ]    (each row sums to 1)`)}
      <p class="explain">The "Markov" idea: the next state depends only on the <b>current</b> one. Each row of the matrix is a set of probabilities that sums to 1. Use a short log and the estimate wobbles; use 600 readings and it settles near the true value (this is the law of large numbers again). A high P(1|1) means people tend to stay: the room is in a "busy spell".</p>`; }});
};
