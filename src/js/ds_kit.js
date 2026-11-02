/* ============ DATA SCIENCE KIT: math, models, charts, guided exercises ============
   Everything here is plain JavaScript so the numbers shown in the course are computed live and can be tested in Node.
   Formulas follow the references listed in refs.js (NIST handbook, Liu et al. 2008, Kaplan and Meier 1958, NWS heat index, Magnus). */
const DS = {};

/* ---------- random numbers (seeded, so every learner sees the same practice data) ---------- */
DS.rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
DS.normal = r => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

/* ---------- descriptive statistics ---------- */
DS.sum = a => a.reduce((s, v) => s + v, 0);
DS.mean = a => DS.sum(a) / a.length;
DS.variance = a => { const m = DS.mean(a); return DS.sum(a.map(v => (v - m) ** 2)) / (a.length - 1); };   // sample variance (n - 1)
DS.sd = a => Math.sqrt(DS.variance(a));
DS.quantile = (a, p) => { const s = [...a].sort((x, y) => x - y), h = (s.length - 1) * p, lo = Math.floor(h), hi = Math.ceil(h); return s[lo] + (h - lo) * (s[hi] - s[lo]); };   // linear interpolation (the default in pandas and numpy)
DS.median = a => DS.quantile(a, 0.5);
DS.mad = a => { const m = DS.median(a); return DS.median(a.map(v => Math.abs(v - m))); };   // median absolute deviation
DS.iqr = a => DS.quantile(a, 0.75) - DS.quantile(a, 0.25);
DS.boxStats = a => { const q1 = DS.quantile(a, 0.25), q3 = DS.quantile(a, 0.75), i = q3 - q1, lo = q1 - 1.5 * i, hi = q3 + 1.5 * i; return {q1, med: DS.median(a), q3, iqr: i, lo, hi, out: a.filter(v => v < lo || v > hi)}; };
DS.minmax = a => { const lo = Math.min(...a), hi = Math.max(...a); return a.map(v => (v - lo) / (hi - lo)); };
DS.zscores = a => { const m = DS.mean(a), s = DS.sd(a); return a.map(v => (v - m) / s); };
DS.rmse = (p, t) => Math.sqrt(DS.mean(p.map((v, i) => (v - t[i]) ** 2)));
DS.mae = (p, t) => DS.mean(p.map((v, i) => Math.abs(v - t[i])));
DS.bias = (p, t) => DS.mean(p.map((v, i) => v - t[i]));
DS.pearson = (x, y) => { const mx = DS.mean(x), my = DS.mean(y); let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < x.length; i++){ sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; } return sxy / Math.sqrt(sxx * syy); };
DS.rank = a => { const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]), r = new Array(a.length); let i = 0; while (i < idx.length){ let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; const avg = (i + j) / 2 + 1; for (let k = i; k <= j; k++) r[idx[k][1]] = avg; i = j + 1; } return r; };
DS.spearman = (x, y) => DS.pearson(DS.rank(x), DS.rank(y));

/* ---------- missing data, smoothing, decomposition (module 4.3) ---------- */
DS.locf = y => { const o = [...y]; for (let i = 1; i < o.length; i++) if (Number.isNaN(o[i])) o[i] = o[i - 1]; return o; };
DS.lerpFill = y => { const o = [...y], n = o.length; let i = 0; while (i < n){ if (!Number.isNaN(o[i])){ i++; continue; } let j = i; while (j < n && Number.isNaN(o[j])) j++;
  const a = i - 1, b = j; if (a < 0 && b >= n) return o; for (let k = i; k < j; k++){ o[k] = a < 0 ? o[b] : b >= n ? o[a] : o[a] + (o[b] - o[a]) * (k - a) / (b - a); } i = j; } return o; };
DS.movavgTrail = (y, w) => y.map((_, i) => { const s = Math.max(0, i - w + 1), seg = y.slice(s, i + 1); return DS.mean(seg); });   // uses only past values, like code running on the board
DS.movavgCenter = (y, w) => y.map((_, i) => { const h = Math.floor(w / 2), s = i - h, e = i + h; if (s < 0 || e >= y.length) return NaN; return DS.mean(y.slice(s, e + 1)); });
DS.ema = (y, alpha) => { const o = []; y.forEach((v, i) => o.push(i ? alpha * v + (1 - alpha) * o[i - 1] : v)); return o; };
DS.decompose = (y, period) => {   // additive model: y = trend + seasonal + residual
  const n = y.length; let trend;
  if (period % 2 === 1) trend = DS.movavgCenter(y, period);
  else { trend = y.map((_, i) => { const h = period / 2; if (i - h < 0 || i + h >= n) return NaN; let s = 0.5 * y[i - h] + 0.5 * y[i + h]; for (let k = i - h + 1; k <= i + h - 1; k++) s += y[k]; return s / period; }); }
  const det = y.map((v, i) => v - trend[i]), per = Array.from({length: period}, () => []);
  det.forEach((v, i) => { if (!Number.isNaN(v)) per[i % period].push(v); });
  let sea = per.map(p => DS.mean(p)); const c = DS.mean(sea); sea = sea.map(v => v - c);
  const seasonal = y.map((_, i) => sea[i % period]), resid = y.map((v, i) => v - trend[i] - seasonal[i]);
  return {trend, seasonal, resid, pattern: sea};
};

/* ---------- derived features: heat index and dew point ---------- */
DS.cToF = c => c * 9 / 5 + 32;
DS.fToC = f => (f - 32) * 5 / 9;
DS.heatIndexF = (T, RH) => {   // US National Weather Service: Steadman's simple formula first, Rothfusz regression when the simple value is 80 F or more
  let hi = 0.5 * (T + 61 + (T - 68) * 1.2 + RH * 0.094);
  if ((hi + T) / 2 >= 80){
    hi = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH - 0.00683783 * T * T - 0.05481717 * RH * RH + 0.00122874 * T * T * RH + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
    if (RH < 13 && T >= 80 && T <= 112) hi -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    else if (RH > 85 && T >= 80 && T <= 87) hi += ((RH - 85) / 10) * ((87 - T) / 5);
  }
  return hi;
};
DS.heatIndexC = (tc, rh) => DS.fToC(DS.heatIndexF(DS.cToF(tc), rh));
DS.dewPointC = (tc, rh) => { const b = 17.625, c = 243.04, g = Math.log(rh / 100) + b * tc / (c + tc); return c * g / (b - g); };   // Magnus formula (Alduchov and Eskridge constants)

/* ---------- least squares: straight lines, polynomials, many predictors ---------- */
DS.solve = (A, b) => {   // Gaussian elimination with partial pivoting
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++){ let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]];
    if (Math.abs(M[c][c]) < 1e-12) M[c][c] = 1e-12;
    for (let r = c + 1; r < n; r++){ const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } }
  const x = new Array(n).fill(0); for (let i = n - 1; i >= 0; i--){ let s = M[i][n]; for (let k = i + 1; k < n; k++) s -= M[i][k] * x[k]; x[i] = s / M[i][i]; } return x;
};
DS.ols = (X, y) => {   // X: rows of predictors (without the intercept column). Returns [intercept, b1, b2, ...]
  const A = X.map(r => [1, ...r]), p = A[0].length, XtX = Array.from({length: p}, () => new Array(p).fill(0)), Xty = new Array(p).fill(0);
  A.forEach((r, i) => { for (let a = 0; a < p; a++){ Xty[a] += r[a] * y[i]; for (let b = 0; b < p; b++) XtX[a][b] += r[a] * r[b]; } });
  return DS.solve(XtX, Xty);
};
DS.olsPredict = (coef, X) => X.map(r => coef[0] + r.reduce((s, v, i) => s + coef[i + 1] * v, 0));
DS.r2 = (y, yhat) => { const m = DS.mean(y); return 1 - DS.sum(y.map((v, i) => (v - yhat[i]) ** 2)) / DS.sum(y.map(v => (v - m) ** 2)); };
DS.linfit = (x, y) => { const mx = DS.mean(x), my = DS.mean(y); let sxy = 0, sxx = 0; x.forEach((v, i) => { sxy += (v - mx) * (y[i] - my); sxx += (v - mx) ** 2; }); const b = sxy / sxx, a = my - b * mx; return {a, b, r2: DS.r2(y, x.map(v => a + b * v))}; };
DS.polyfit = (x, y, deg) => {   // x is centered and scaled first so high degrees stay stable
  const mx = DS.mean(x), s = DS.sd(x) || 1, z = x.map(v => (v - mx) / s), coef = DS.ols(z.map(v => Array.from({length: deg}, (_, k) => v ** (k + 1))), y);
  const pred = v => { const t = (v - mx) / s; return coef.reduce((acc, c, k) => acc + c * t ** k, 0); };
  return {coef, pred, r2: DS.r2(y, x.map(pred)), rmse: DS.rmse(x.map(pred), y)};
};
DS.loglogFit = (ratio, ppm) => { const f = DS.linfit(ratio.map(v => Math.log10(v)), ppm.map(v => Math.log10(v))); return {m: f.b, c: f.a, a: 10 ** f.a, b: f.b, r2: f.r2, ppm: r => 10 ** f.a * r ** f.b}; };   // ppm = a * (Rs/R0)^b

/* ---------- cleaning sensor glitches (module 4.5) ---------- */
DS.hampel = (y, k, t) => {
  const out = [], rep = [...y], info = [];
  y.forEach((v, i) => { const w = y.slice(Math.max(0, i - k), Math.min(y.length, i + k + 1)), m = DS.median(w), s = 1.4826 * DS.mad(w), flag = Math.abs(v - m) > t * s && s > 0;
    info.push({i, med: m, s, lo: m - t * s, hi: m + t * s, flag}); if (flag){ out.push(i); rep[i] = m; } });
  return {out, rep, info};
};
DS.rollingZ = (y, w) => y.map((v, i) => { if (i < w) return 0; const seg = y.slice(i - w, i), s = DS.sd(seg); return s ? (v - DS.mean(seg)) / s : 0; });

/* ---------- Markov chains for 0/1 sensors (PIR) ---------- */
DS.markov2 = seq => { const c = [[0, 0], [0, 0]]; for (let i = 1; i < seq.length; i++) c[seq[i - 1]][seq[i]]++;
  const P = c.map(r => { const s = r[0] + r[1]; return s ? [r[0] / s, r[1] / s] : [0.5, 0.5]; }), pi1 = P[0][1] / (P[0][1] + P[1][0] || 1);
  return {counts: c, P, stationary: [1 - pi1, pi1]}; };
DS.aggregate = (vals, size, how) => { const o = []; for (let i = 0; i < vals.length; i += size){ const seg = vals.slice(i, i + size); o.push(how === "mean" ? DS.mean(seg) : DS.sum(seg)); } return o; };

/* ---------- binning ---------- */
DS.edgesQuantile = (a, k) => Array.from({length: k + 1}, (_, i) => DS.quantile(a, i / k));
DS.edgesWidth = (a, k) => { const lo = Math.min(...a), hi = Math.max(...a); return Array.from({length: k + 1}, (_, i) => lo + (hi - lo) * i / k); };
DS.binIndex = (v, edges) => { for (let i = 1; i < edges.length; i++) if (v <= edges[i]) return i - 1; return edges.length - 2; };
DS.histogram = (a, edges) => { const c = new Array(edges.length - 1).fill(0); a.forEach(v => c[DS.binIndex(v, edges)]++); return c; };

/* ---------- classification: logistic regression, confusion matrix ---------- */
DS.sigmoid = z => 1 / (1 + Math.exp(-z));
DS.logisticInit = () => ({w: 0, b: 0, step: 0});
DS.logisticStep = (st, x, y, lr) => {   // one step of gradient descent on the log-loss, one predictor (x should be scaled)
  let gw = 0, gb = 0, loss = 0; x.forEach((v, i) => { const p = DS.sigmoid(st.w * v + st.b); gw += (p - y[i]) * v; gb += (p - y[i]); loss += -(y[i] * Math.log(p + 1e-12) + (1 - y[i]) * Math.log(1 - p + 1e-12)); });
  const n = x.length; st.w -= lr * gw / n; st.b -= lr * gb / n; st.step++; st.loss = loss / n; return st; };
DS.logLoss = (st, x, y) => DS.mean(x.map((v, i) => { const p = DS.sigmoid(st.w * v + st.b); return -(y[i] * Math.log(p + 1e-12) + (1 - y[i]) * Math.log(1 - p + 1e-12)); }));
DS.confusion = (y, yhat) => { let tp = 0, fp = 0, fn = 0, tn = 0; y.forEach((v, i) => { if (v && yhat[i]) tp++; else if (!v && yhat[i]) fp++; else if (v && !yhat[i]) fn++; else tn++; });
  const n = y.length, prec = tp / (tp + fp || 1), rec = tp / (tp + fn || 1); return {tp, fp, fn, tn, n, acc: (tp + tn) / n, prec, rec, f1: 2 * prec * rec / (prec + rec || 1)}; };

/* ---------- hypothesis testing: chi-square test of independence ---------- */
DS.gammaln = x => { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); let s = 1.000000000190015; for (let j = 0; j < 6; j++) s += c[j] / ++y; return -t + Math.log(2.5066282746310005 * s / x); };
DS.gammaP = (a, x) => {   // regularized lower incomplete gamma function P(a, x)
  if (x <= 0) return 0;
  if (x < a + 1){ let ap = a, sum = 1 / a, del = sum; for (let n = 0; n < 300; n++){ ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-14) break; } return sum * Math.exp(-x + a * Math.log(x) - DS.gammaln(a)); }
  let b = x + 1 - a, c = 1 / 1e-300, d = 1 / b, h = d; for (let i = 1; i < 300; i++){ const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300; c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-14) break; }
  return 1 - Math.exp(-x + a * Math.log(x) - DS.gammaln(a)) * h; };
DS.chi2p = (stat, df) => 1 - DS.gammaP(df / 2, stat / 2);
DS.chi2pdf = (x, df) => x <= 0 ? 0 : Math.exp((df / 2 - 1) * Math.log(x) - x / 2 - (df / 2) * Math.log(2) - DS.gammaln(df / 2));
DS.chiSquare = obs => { const R = obs.length, C = obs[0].length, rt = obs.map(r => DS.sum(r)), ct = obs[0].map((_, j) => DS.sum(obs.map(r => r[j]))), N = DS.sum(rt);
  const exp = obs.map((r, i) => r.map((_, j) => rt[i] * ct[j] / N)), terms = obs.map((r, i) => r.map((o, j) => (o - exp[i][j]) ** 2 / exp[i][j])), stat = DS.sum(terms.map(r => DS.sum(r))), df = (R - 1) * (C - 1);
  return {rt, ct, N, exp, terms, stat, df, p: DS.chi2p(stat, df), minExp: Math.min(...exp.map(r => Math.min(...r)))}; };

/* ---------- survival analysis: Kaplan-Meier ---------- */
DS.km = (times, events) => {   // events[i] = 1 if the failure was seen, 0 if the item was still working when we stopped watching (censored)
  const ts = [...new Set(times.filter((t, i) => events[i]))].sort((a, b) => a - b); let S = 1; const rows = [];
  ts.forEach(t => { const atRisk = times.filter(v => v >= t).length, d = times.filter((v, i) => v === t && events[i]).length, c = times.filter((v, i) => v === t && !events[i]).length; S *= (1 - d / atRisk); rows.push({t, atRisk, d, S}); });
  return rows; };
DS.kmMedian = rows => { const r = rows.find(x => x.S <= 0.5); return r ? r.t : null; };

/* ---------- anomaly detection: isolation forest (Liu, Ting and Zhou, 2008) ---------- */
DS.cn = n => n <= 1 ? 0 : n === 2 ? 1 : 2 * (Math.log(n - 1) + 0.5772156649) - 2 * (n - 1) / n;   // average path length of an unsuccessful search in a binary tree
DS.isoTree = (data, rng, depth, maxDepth) => {
  if (depth >= maxDepth || data.length <= 1) return {size: data.length};
  const lo = Math.min(...data), hi = Math.max(...data); if (lo === hi) return {size: data.length};
  const cut = lo + (hi - lo) * rng(); return {cut, l: DS.isoTree(data.filter(v => v < cut), rng, depth + 1, maxDepth), r: DS.isoTree(data.filter(v => v >= cut), rng, depth + 1, maxDepth)}; };
DS.isoPath = (tree, v, depth = 0) => tree.cut === undefined ? depth + DS.cn(tree.size) : DS.isoPath(v < tree.cut ? tree.l : tree.r, v, depth + 1);
DS.isoForest = (data, nTrees, sample, rng) => { const psi = Math.min(sample, data.length), maxDepth = Math.ceil(Math.log2(psi)), trees = [];
  for (let t = 0; t < nTrees; t++){ const s = []; const pool = [...data]; for (let i = 0; i < psi; i++) s.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]); trees.push(DS.isoTree(s, rng, 0, maxDepth)); }
  const score = v => 2 ** (-DS.mean(trees.map(t => DS.isoPath(t, v))) / DS.cn(psi)); return {trees, score, psi, avgPath: v => DS.mean(trees.map(t => DS.isoPath(t, v)))}; };

/* ---------- supervised learning: regression trees and a random forest ---------- */
DS.treeFit = (X, y, depth, maxDepth, minLeaf, rng, mtry) => {
  if (depth >= maxDepth || y.length < 2 * minLeaf) return {v: DS.mean(y)};
  const p = X[0].length; let feats = Array.from({length: p}, (_, i) => i); if (mtry && mtry < p){ feats = feats.sort(() => rng() - 0.5).slice(0, mtry); }
  let best = null; const tot = DS.sum(y.map(v => (v - DS.mean(y)) ** 2));
  feats.forEach(f => { const idx = y.map((_, i) => i).sort((a, b) => X[a][f] - X[b][f]); let sl = 0, sl2 = 0, sr = DS.sum(y), sr2 = DS.sum(y.map(v => v * v)); const n = y.length;
    for (let k = 0; k < n - 1; k++){ const v = y[idx[k]]; sl += v; sl2 += v * v; sr -= v; sr2 -= v * v; const nl = k + 1, nr = n - nl; if (nl < minLeaf || nr < minLeaf || X[idx[k]][f] === X[idx[k + 1]][f]) continue;
      const sse = (sl2 - sl * sl / nl) + (sr2 - sr * sr / nr); if (!best || sse < best.sse) best = {sse, f, cut: (X[idx[k]][f] + X[idx[k + 1]][f]) / 2}; } });
  if (!best || best.sse >= tot - 1e-12) return {v: DS.mean(y)};
  const li = [], ri = []; X.forEach((r, i) => (r[best.f] <= best.cut ? li : ri).push(i));
  return {f: best.f, cut: best.cut, l: DS.treeFit(li.map(i => X[i]), li.map(i => y[i]), depth + 1, maxDepth, minLeaf, rng, mtry), r: DS.treeFit(ri.map(i => X[i]), ri.map(i => y[i]), depth + 1, maxDepth, minLeaf, rng, mtry)}; };
DS.treePredict = (t, r) => t.v !== undefined ? t.v : DS.treePredict(r[t.f] <= t.cut ? t.l : t.r, r);
DS.forestFit = (X, y, nTrees, maxDepth, minLeaf, rng) => { const trees = [], n = y.length, mtry = Math.max(1, Math.floor(Math.sqrt(X[0].length)) || 1);
  for (let t = 0; t < nTrees; t++){ const bi = Array.from({length: n}, () => Math.floor(rng() * n)); trees.push(DS.treeFit(bi.map(i => X[i]), bi.map(i => y[i]), 0, maxDepth, minLeaf, rng, X[0].length > 2 ? mtry + 1 : X[0].length)); }
  return {trees, predict: r => DS.mean(trees.map(t => DS.treePredict(t, r)))}; };
DS.importance = (model, X, y, rng) => { const base = DS.rmse(X.map(r => model.predict(r)), y); return X[0].map((_, f) => { const col = X.map(r => r[f]), perm = [...col].sort(() => rng() - 0.5), Xp = X.map((r, i) => r.map((v, j) => j === f ? perm[i] : v)); return DS.rmse(Xp.map(r => model.predict(r)), y) - base; }); };
DS.split = (n, frac, rng) => { const idx = Array.from({length: n}, (_, i) => i).sort(() => rng() - 0.5), k = Math.round(n * frac); return {train: idx.slice(0, k), test: idx.slice(k)}; };

/* ---------- control: a simple PID simulation (servo or motor response) ---------- */
DS.pidSim = o => {   // plant: second-order (damping 0.7, natural frequency 6 rad/s, gain 1); sampled every dt seconds
  const dt = o.dt || 0.02, T = o.T || 6, sp = o.sp || 1, kp = o.kp, ki = o.ki || 0, kd = o.kd || 0, wn = 6, zeta = 0.7; let x = 0, v = 0, integ = 0, prev = sp - x; const ys = [], us = [];
  for (let t = 0; t <= T + 1e-9; t += dt){ const e = sp - x; integ += e * dt; const d = (e - prev) / dt; prev = e; let u = kp * e + ki * integ + kd * d; u = Math.max(-3, Math.min(3, u)); us.push(u); ys.push(x);
    const a = wn * wn * (u - x) - 2 * zeta * wn * v; v += a * dt; x += v * dt; }
  const peak = Math.max(...ys), overshoot = Math.max(0, (peak - sp) / sp * 100), last = ys[ys.length - 1], sse = sp - DS.mean(ys.slice(-Math.round(0.5 / dt)));
  const t10 = ys.findIndex(v => v >= 0.1 * sp), t90 = ys.findIndex(v => v >= 0.9 * sp); let settle = null; for (let i = ys.length - 1; i >= 0; i--){ if (Math.abs(ys[i] - sp) > 0.02 * sp){ settle = (i + 1) * dt; break; } if (i === 0) settle = 0; }
  const iae = DS.sum(ys.map(v => Math.abs(sp - v))) * dt, ise = DS.sum(ys.map(v => (sp - v) ** 2)) * dt;
  return {ys, us, dt, overshoot, steady: sse, rise: t90 >= 0 && t10 >= 0 ? (t90 - t10) * dt : null, settle: settle > T - 0.5 ? null : settle, iae, ise, final: last}; };

/* ---------- practice data generators (no kit needed) ---------- */
DS.day = (seed, n = 288) => {   // one day, every 5 minutes: temperature, humidity, light, gas ratio, with realistic noise
  const r = DS.rng(seed), o = {t: [], temp: [], hum: [], light: [], gas: []};
  for (let i = 0; i < n; i++){ const h = i * 24 / n, s = Math.sin((h - 9) / 24 * 2 * Math.PI);
    const temp = 27 + 4 * s + 0.3 * DS.normal(r), hum = 70 - 2.2 * (temp - 27) + 1.2 * DS.normal(r), light = Math.max(0, Math.min(100, 50 + 45 * s + 3 * DS.normal(r))), gas = 1 + 0.002 * (temp - 24) * 20 + 0.01 * DS.normal(r) + (h > 11.5 && h < 12.5 ? 0.25 : 0);
    o.t.push(h); o.temp.push(temp); o.hum.push(hum); o.light.push(light); o.gas.push(gas); }
  return o; };

/* ---------- formatting ---------- */
DS.f = (v, d = 2) => Number.isFinite(v) ? (Math.abs(v) < 1e-9 ? 0 : v).toFixed(d) : "–";
DS.p = p => p < 0.001 ? "< 0.001" : DS.f(p, 3);

/* =========================================================================================
   BROWSER PART (skipped when this file is loaded in Node for testing)
   ========================================================================================= */
/* ---------- math notation without images: fractions, subscripts, equations ---------- */
const MX = {
  fr: (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`,
  sub: s => `<sub>${s}</sub>`, sup: s => `<sup>${s}</sup>`,
  rt: s => `<span class="rt">√<span class="rtb">${s}</span></span>`,
  v: s => `<i class="mv">${s}</i>`,
  eq: (...lines) => `<div class="eq" role="math">${lines.join("<br>")}</div>`
};

/* ---------- accessible SVG charts: direct labels, line styles, table fallback, text summary ---------- */
const PAL = ["#4F46E5", "#EA580C", "#0F766E", "#BE185D", "#475569", "#A16207"];
const DASH = ["", "7 4", "2 3", "10 3 2 3", "", "7 4"];
DS.axis = (lo, hi, n) => { const span = hi - lo || 1, raw = span / n, mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag, step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag, s = Math.floor(lo / step) * step, t = []; for (let v = s; v <= hi + step * 0.001; v += step) if (v >= lo - step * 0.001) t.push(+v.toFixed(10)); return t; };
DS.chart = o => {   // o: {w,h,xlab,ylab,x:[lo,hi],y:[lo,hi],lines:[{x,y,label,color,dash,width,dots}],points:[{x,y,color,label,r,shape}],bars:[{x,y,w,color}],hlines:[{y,label,color}],vlines,bands:[{y1,y2,color}],title}
  const W = o.w || 640, H = o.h || 260, L = 50, R = o.right || 78, T = 16, B = 40, pw = W - L - R, ph = H - T - B;
  const all = [...(o.lines || []).flatMap(l => l.x.map((x, i) => [x, l.y[i]])), ...(o.points || []).map(p => [p.x, p.y]), ...(o.bars || []).flatMap(b => [[b.x, b.y], [b.x, 0]])].filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));
  let xlo = o.x ? o.x[0] : Math.min(...all.map(p => p[0])), xhi = o.x ? o.x[1] : Math.max(...all.map(p => p[0])), ylo = o.y ? o.y[0] : Math.min(...all.map(p => p[1])), yhi = o.y ? o.y[1] : Math.max(...all.map(p => p[1]));
  if (!o.y){ const pad = (yhi - ylo || 1) * 0.08; ylo -= pad; yhi += pad; if (o.bars) ylo = Math.min(0, ylo); }
  const X = v => L + (v - xlo) / (xhi - xlo || 1) * pw, Y = v => T + ph - (v - ylo) / (yhi - ylo || 1) * ph, cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const xt = DS.axis(xlo, xhi, Math.max(3, Math.round(pw / 90))), yt = DS.axis(ylo, yhi, 5), fm = v => Math.abs(v) >= 1000 ? v.toFixed(0) : +v.toFixed(2);
  let s = `<svg class="dschart wide" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || o.ylab || "chart")}" preserveAspectRatio="xMidYMid meet">`;
  (o.bands || []).forEach(b => s += b.x1 !== undefined ? `<rect x="${X(b.x1)}" y="${Y(Math.min(yhi, b.y2))}" width="${Math.max(2, X(b.x2) - X(b.x1))}" height="${Math.max(0, Y(Math.max(ylo, b.y1)) - Y(Math.min(yhi, b.y2)))}" fill="${b.color || "#C7D2FE"}" opacity=".6"/>` : `<rect x="${L}" y="${Y(Math.min(yhi, b.y2))}" width="${pw}" height="${Math.max(0, Y(Math.max(ylo, b.y1)) - Y(Math.min(yhi, b.y2)))}" fill="${b.color || "#FDE68A"}" opacity=".45"/>`);
  yt.forEach(v => s += `<line x1="${L}" x2="${L + pw}" y1="${Y(v)}" y2="${Y(v)}" class="gl"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" class="tk">${fm(v)}</text>`);
  xt.forEach(v => s += `<line x1="${X(v)}" x2="${X(v)}" y1="${T + ph}" y2="${T + ph + 4}" class="ax"/><text x="${X(v)}" y="${T + ph + 17}" text-anchor="middle" class="tk">${fm(v)}</text>`);
  s += `<line x1="${L}" x2="${L + pw}" y1="${T + ph}" y2="${T + ph}" class="ax"/><line x1="${L}" x2="${L}" y1="${T}" y2="${T + ph}" class="ax"/>`;
  if (o.xlab) s += `<text x="${L + pw / 2}" y="${H - 5}" text-anchor="middle" class="al">${esc(o.xlab)}</text>`;
  if (o.ylab) s += `<text x="13" y="${T + ph / 2}" text-anchor="middle" class="al" transform="rotate(-90 13 ${T + ph / 2})">${esc(o.ylab)}</text>`;
  (o.hlines || []).forEach((h, i) => { s += `<line x1="${L}" x2="${L + pw}" y1="${Y(h.y)}" y2="${Y(h.y)}" stroke="${h.color || "#B91C1C"}" stroke-width="1.6" stroke-dasharray="${h.dash || "6 4"}"/>`; if (h.label) s += `<text x="${L + pw + 4}" y="${Y(h.y) + 4}" class="dl" fill="${h.color || "#B91C1C"}">${esc(h.label)}</text>`; });
  (o.vlines || []).forEach(v => { s += `<line x1="${X(v.x)}" x2="${X(v.x)}" y1="${T}" y2="${T + ph}" stroke="${v.color || "#475569"}" stroke-width="1.4" stroke-dasharray="${v.dash || "5 4"}"/>`; if (v.label) s += `<text x="${X(v.x) + 3}" y="${T + 11}" class="dl" fill="${v.color || "#475569"}">${esc(v.label)}</text>`; });
  (o.bars || []).forEach(b => { const bw = (b.w || (xhi - xlo) / (o.bars.length + 1)) / (xhi - xlo || 1) * pw * 0.86; s += `<rect x="${X(b.x) - bw / 2}" y="${Y(Math.max(0, b.y))}" width="${bw}" height="${Math.abs(Y(b.y) - Y(0))}" fill="${b.color || PAL[0]}" rx="2"/>`; if (b.label !== undefined) s += `<text x="${X(b.x)}" y="${Y(Math.max(0, b.y)) - 4}" text-anchor="middle" class="tk b">${esc(b.label)}</text>`; });
  const labs = [];
  (o.lines || []).forEach((l, i) => { const col = l.color || PAL[i % PAL.length]; let d = "", pen = false; l.x.forEach((x, k) => { const y = l.y[k]; if (!Number.isFinite(y)){ pen = false; return; } d += `${pen ? "L" : "M"}${X(x).toFixed(1)},${Y(cl(y, ylo, yhi)).toFixed(1)} `; pen = true; });
    s += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${l.width || 2}" stroke-dasharray="${l.dash !== undefined ? l.dash : DASH[i % DASH.length]}" stroke-linejoin="round"/>`;
    if (l.dots) l.x.forEach((x, k) => { if (Number.isFinite(l.y[k])) s += `<circle cx="${X(x)}" cy="${Y(l.y[k])}" r="${l.dots}" fill="${col}"/>`; });
    if (l.label){ let k = l.y.length - 1; while (k > 0 && !Number.isFinite(l.y[k])) k--; labs.push({x: Math.min(X(l.x[k]) + 5, W - 4), y: Y(cl(l.y[k], ylo, yhi)) + 4, t: l.label, c: col}); } });
  labs.sort((a, b) => a.y - b.y); for (let q = 1; q < labs.length; q++) if (labs[q].y - labs[q - 1].y < 13) labs[q].y = labs[q - 1].y + 13;
  labs.forEach(b => { s += `<text x="${b.x}" y="${b.y}" class="dl" fill="${b.c}">${esc(b.t)}</text>`; });
  (o.points || []).forEach(p => { if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return; const col = p.color || PAL[0], r = p.r || 3.2;
    s += p.shape === "x" ? `<path d="M${X(p.x) - r},${Y(p.y) - r}L${X(p.x) + r},${Y(p.y) + r}M${X(p.x) - r},${Y(p.y) + r}L${X(p.x) + r},${Y(p.y) - r}" stroke="${col}" stroke-width="2"/>` : p.shape === "square" ? `<rect x="${X(p.x) - r}" y="${Y(p.y) - r}" width="${2 * r}" height="${2 * r}" fill="${col}" opacity="${p.o || 0.85}"/>` : `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${r}" fill="${col}" opacity="${p.o || 0.75}"/>`;
    if (p.label) s += `<text x="${X(p.x) + 6}" y="${Y(p.y) - 6}" class="dl" fill="${col}">${esc(p.label)}</text>`; });
  return s + "</svg>";
};
/* a chart plus a text summary and a "Show as table" button (the design skill's rule: never rely on the picture alone) */
DS.fig = (svg, summary, tableRows, caption) => {
  const tb = tableRows && tableRows.length ? `<div class="ch-tbl" hidden><table class="t"><tr>${tableRows[0].map(h => `<th>${esc(h)}</th>`).join("")}</tr>${tableRows.slice(1, 61).map(r => `<tr>${r.map(c => `<td>${esc(typeof c === "number" ? DS.f(c, 2) : c)}</td>`).join("")}</tr>`).join("")}</table>${tableRows.length > 61 ? `<p class="explain">Showing the first 60 rows of ${tableRows.length - 1}.</p>` : ""}</div>` : "";
  return `<figure class="dsfig">${svg}<figcaption><span class="ch-sum">${summary}</span>${tb ? ` <button type="button" class="btn small ch-tbl-btn" aria-expanded="false">Show as table</button>` : ""}${caption ? `<br><span class="explain">${caption}</span>` : ""}</figcaption>${tb}</figure>`; };
if (typeof document !== "undefined") document.addEventListener("click", e => { const b = e.target.closest && e.target.closest(".ch-tbl-btn"); if (!b) return; const t = b.closest(".dsfig").querySelector(".ch-tbl"); t.hidden = !t.hidden; b.setAttribute("aria-expanded", String(!t.hidden)); b.textContent = t.hidden ? "Show as table" : "Hide table"; });

/* heat-map grid with the numbers printed in each cell (color is never the only signal) */
DS.heat = (labels, mat, o) => { o = o || {}; const n = labels.length, cell = o.cell || 64, lab = o.lab || 74, W = lab + n * cell + 8, H = lab + n * cell + 8;
  const col = v => { const t = Math.max(-1, Math.min(1, v)), a = Math.abs(t); return t >= 0 ? `rgba(79,70,229,${0.08 + 0.85 * a})` : `rgba(234,88,12,${0.08 + 0.85 * a})`; };
  let s = `<svg class="dschart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || "heat map")}">`;
  labels.forEach((l, i) => { s += `<text x="${lab + i * cell + cell / 2}" y="${lab - 8}" text-anchor="middle" class="tk b">${esc(l)}</text><text x="${lab - 8}" y="${lab + i * cell + cell / 2 + 4}" text-anchor="end" class="tk b">${esc(l)}</text>`; });
  mat.forEach((row, i) => row.forEach((v, j) => { s += `<g class="hc" data-i="${i}" data-j="${j}" tabindex="0" role="button" aria-label="${esc(labels[i])} and ${esc(labels[j])}: ${DS.f(v, 2)}"><rect x="${lab + j * cell}" y="${lab + i * cell}" width="${cell - 2}" height="${cell - 2}" rx="6" fill="${o.col ? o.col(v) : col(v)}" stroke="#C7D2FE"/><text x="${lab + j * cell + cell / 2 - 1}" y="${lab + i * cell + cell / 2 + 5}" text-anchor="middle" class="hv"${Math.abs(v) > 0.5 ? ' fill="#fff"' : ""}>${o.fmt ? o.fmt(v) : DS.f(v, 2)}</text></g>`; }));
  return s + "</svg>"; };

/* ---------- guided exercises: a hint ladder, answer checking, common-mistake feedback, worked solution ---------- */
const GXSETS = {};
const GX = {
  mount(el, set){
    const probs = (typeof set.problems === "function" ? set.problems() : set.problems);
    let i = 0; const st = probs.map(() => ({tries: 0, hints: 0, done: false, shown: false}));
    el.innerHTML = bench(set.title, `<p class="explain gxIntro">${set.intro || ""}</p><div class="gxBar"></div><div class="gxBody"></div>`);
    const bar = $(".gxBar", el), body = $(".gxBody", el);
    const draw = () => { const p = probs[i], s = st[i];
      bar.innerHTML = `<div class="gxDots" role="list">${probs.map((q, k) => `<button type="button" role="listitem" class="gxDot${k === i ? " cur" : ""}${st[k].done ? " ok" : ""}" data-k="${k}" aria-label="Problem ${k + 1}${st[k].done ? ", solved" : ""}" aria-current="${k === i}">${st[k].done ? "✓" : k + 1}</button>`).join("")}</div><span class="explain">${st.filter(x => x.done).length} of ${probs.length} solved</span>`;
      const input = p.type === "choice" ? `<div class="gxOpts" role="radiogroup">${p.options.map((o, k) => `<label class="gxOpt"><input type="radio" name="gx${set.id}" value="${k}"> <span>${o}</span></label>`).join("")}</div>`
        : `<label class="gxIn">Your answer <input class="dinput gxVal" type="text" inputmode="decimal" autocomplete="off" aria-describedby="gxFb${set.id}" placeholder="a number"> ${p.unit ? `<b>${p.unit}</b>` : ""}</label>`;
      body.innerHTML = `<div class="gxProb"><p class="gxQ"><span class="gxN">Problem ${i + 1}</span> ${p.prompt}</p>${p.data ? `<div class="gxData">${typeof p.data === "function" ? p.data() : p.data}</div>` : ""}
        ${p.plan ? `<details class="gxPlan"><summary>Plan the steps first</summary><ol>${p.plan.map(x => `<li>${x}</li>`).join("")}</ol></details>` : ""}${input}
        <div class="gxBtns"><button type="button" class="btn primary gxCheck">Check</button><button type="button" class="btn gxHint" ${p.hints && p.hints.length ? "" : "hidden"}>${s.hints ? "Next hint" : "Give me a hint"}</button><button type="button" class="btn gxSol" ${s.tries || s.hints > 1 || s.done ? "" : "disabled"}>Show worked solution</button>
        ${i < probs.length - 1 ? `<button type="button" class="btn gxNext">Next problem →</button>` : ""}</div>
        <div class="gxFb" id="gxFb${set.id}" role="status" aria-live="polite"></div>
        <ol class="gxHints">${(p.hints || []).slice(0, s.hints).map((h, k) => `<li><b>Hint ${k + 1}.</b> ${h}</li>`).join("")}</ol>
        <div class="gxSolBox" ${s.shown ? "" : "hidden"}><b>Worked solution</b>${typeof p.solution === "function" ? p.solution() : p.solution}</div></div>`;
      const fb = $(".gxFb", body), say = (ok, msg) => { fb.className = "gxFb " + (ok ? "ok" : "no"); fb.innerHTML = `<b>${ok ? "✓ Correct." : "Not yet."}</b> ${msg}`; };
      if (s.done) say(true, p.after || "Nice work.");
      $(".gxCheck", body).onclick = () => {
        let ok, v;
        if (p.type === "choice"){ const r = body.querySelector("input:checked"); if (!r){ fb.className = "gxFb no"; fb.textContent = "Choose an option first."; return; } v = +r.value; ok = v === p.answer; }
        else { const raw = $(".gxVal", body).value.trim().replace(",", "."); v = parseFloat(raw); if (raw === "" || Number.isNaN(v)){ fb.className = "gxFb no"; fb.textContent = "Type a number (for example 12.5)."; return; } const tol = p.tol !== undefined ? p.tol : Math.max(Math.abs(p.answer) * 0.01, 0.005); ok = Math.abs(v - p.answer) <= tol; }
        s.tries++; if (ok){ s.done = true; say(true, p.after || "Nice work."); markAct("gx_" + set.id, st.every(x => x.done) ? "done" : "used"); }
        else { const diag = (p.diagnose || []).find(d => d.when(v)); say(false, diag ? diag.msg : (p.type === "choice" ? (p.wrong && p.wrong[v]) || "Look at the data again, then try another option." : "Compare your value with the data. Check units and rounding. Use a hint if you are stuck.")); $(".gxSol", body).disabled = false; }
        bar.querySelectorAll(".gxDot")[i].classList.toggle("ok", s.done); };
      $(".gxHint", body).onclick = () => { if (s.hints < p.hints.length) s.hints++; draw(); };
      $(".gxSol", body).onclick = () => { s.shown = true; draw(); };
      const nx = $(".gxNext", body); if (nx) nx.onclick = () => { i++; draw(); };
      bar.querySelectorAll(".gxDot").forEach(b => b.onclick = () => { i = +b.dataset.k; draw(); });
      const inp = $(".gxVal", body); if (inp) inp.onkeydown = e => { if (e.key === "Enter") $(".gxCheck", body).click(); };
    };
    draw();
  }
};
const gxLab = id => { INTERACTIVES["gx_" + id] = el => GX.mount(el, GXSETS[id]); };
if (typeof module !== "undefined") module.exports = DS;
