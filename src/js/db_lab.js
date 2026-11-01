/* ============ DATABASE LAB: a mini Google Sheets QUERY engine over a virtual Readings table ============ */
const DB_DATA = (() => { const rows = [], devs = [["team1-esp32s3", 0], ["team2-esp8266", 0.9], ["team3-unor4", -0.6]]; const p = n => String(n).padStart(2, "0");
  for (let k = 0; k < 24; k++){ const h = 7 + Math.floor(k / 2), m = k % 2 ? 30 : 0, ts = `2026-10-08 ${p(h)}:${p(m)}`;
    devs.forEach(([d, off], j) => { const t = +(28.2 + off + 3.2 * Math.sin(Math.PI * Math.max(0, h + m / 60 - 7) / 12) + ((k * 7 + j * 3) % 5) * 0.1).toFixed(1); const hu = +(78 - (t - 27) * 3.1 + ((k + j) % 3) * 0.4).toFixed(1);
      rows.push([ts, d, "temp_c", t]); rows.push([ts, d, "hum_pct", hu]); }); }
  return rows; })();
const DB_HEAD = ["timestamp","device_id","sensor","value"];
function runQuery(q, data){
  const toks = []; const re = /\s*(?:('(?:[^']|'')*'|"(?:[^"]|"")*")|(\d+(?:\.\d+)?)|(<=|>=|!=|<>|=|<|>|\(|\)|,|\*)|([A-Za-z_][A-Za-z_0-9]*))/y; let m, s = q.trim();
  while (re.lastIndex < s.length){ const i = re.lastIndex; m = re.exec(s); if (!m){ if (/^\s*$/.test(s.slice(i))) break; throw new Error(`I could not read the query near “${s.slice(i, i + 12)}”.`); }
    if (m[1]) toks.push({t:"str", v:m[1].slice(1, -1).replace(/''/g, "'").replace(/""/g, '"')}); else if (m[2]) toks.push({t:"num", v:+m[2]}); else if (m[3]) toks.push({t:"op", v:m[3]}); else toks.push({t:"id", v:m[4]}); }
  let i = 0; const peek = () => toks[i], kw = w => toks[i] && toks[i].t === "id" && toks[i].v.toLowerCase() === w, eat = w => { if (!kw(w)) throw new Error(`Expected “${w}”.`); i++; }, opk = o => toks[i] && toks[i].t === "op" && toks[i].v === o;
  const COLS = {A:0, B:1, C:2, D:3}; const col = () => { const x = peek(); if (!x || x.t !== "id" || !(x.v.toUpperCase() in COLS)) throw new Error(`Expected a column letter (A, B, C, or D) but found “${x ? x.v : "the end"}”.`); i++; if (x.v !== x.v.toUpperCase()) throw new Error(`Column letters must be capitals: write ${x.v.toUpperCase()}, not ${x.v}.`); return COLS[x.v]; };
  eat("select"); const sel = [];
  if (opk("*")){ i++; [0, 1, 2, 3].forEach(c => sel.push({c})); } else { do { if (sel.length) i++; const x = peek(); if (x && x.t === "id" && /^(avg|sum|count|max|min)$/i.test(x.v) && toks[i + 1] && toks[i + 1].v === "("){ i += 2; const c = col(); if (!opk(")")) throw new Error("Missing ) after the column."); i++; sel.push({agg:x.v.toLowerCase(), c}); } else sel.push({c:col()}); } while (opk(",")); }
  const operand = () => { const x = peek(); if (!x) throw new Error("The condition is incomplete."); if (x.t === "str" || x.t === "num"){ i++; return {k:x.v}; } return {c:col()}; };
  const cmp = () => { if (kw("not")){ i++; const f = cmp(); return r => !f(r); } if (opk("(")){ i++; const f = orx(); if (!opk(")")) throw new Error("Missing )."); i++; return f; }
    const a = operand(); let op; if (peek() && peek().t === "op"){ op = peek().v; i++; } else if (kw("contains")){ op = "contains"; i++; } else if (kw("starts")){ i++; eat("with"); op = "starts"; } else if (kw("ends")){ i++; eat("with"); op = "ends"; } else throw new Error("Expected a comparison such as =, >, <, contains.");
    const b = operand(); const val = (o, r) => o.c != null ? r[o.c] : o.k;
    return r => { const x = val(a, r), y = val(b, r); switch(op){ case "=": return x == y; case "!=": case "<>": return x != y; case "<": return x < y; case ">": return x > y; case "<=": return x <= y; case ">=": return x >= y; case "contains": return String(x).includes(y); case "starts": return String(x).startsWith(y); case "ends": return String(x).endsWith(y); } return false; }; };
  const andx = () => { let f = cmp(); while (kw("and")){ i++; const g = cmp(), h = f; f = r => h(r) && g(r); } return f; };
  const orx = () => { let f = andx(); while (kw("or")){ i++; const g = andx(), h = f; f = r => h(r) || g(r); } return f; };
  let where = null, group = [], order = [], limit = null;
  while (i < toks.length){ if (kw("where")){ i++; where = orx(); } else if (kw("group")){ i++; eat("by"); do { if (group.length) i++; group.push(col()); } while (opk(",")); } else if (kw("order")){ i++; eat("by"); do { if (order.length) i++; const x = peek(); let o;
      if (x && /^(avg|sum|count|max|min)$/i.test(x.v) && toks[i + 1] && toks[i + 1].v === "("){ i += 2; o = {agg:x.v.toLowerCase(), c:col()}; i++; } else o = {c:col()};
      if (kw("desc")){ i++; o.desc = true; } else if (kw("asc")) i++; order.push(o); } while (opk(",")); }
    else if (kw("limit")){ i++; const x = peek(); if (!x || x.t !== "num") throw new Error("limit needs a number."); limit = x.v; i++; } else if (kw("label")) { i = toks.length; } else throw new Error(`I did not expect “${peek().v}” here. The order is: select … where … group by … order by … limit …`); }
  let rows = data.filter(r => !where || where(r)); const aggs = sel.some(s => s.agg);
  if (aggs || group.length){ sel.forEach(s => { if (!s.agg && !group.includes(s.c)) throw new Error(`Column ${"ABCD"[s.c]} must be inside an aggregate (like avg(${"ABCD"[s.c]})) or listed in group by.`); });
    const groups = new Map(); rows.forEach(r => { const k = JSON.stringify(group.map(g => r[g])); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }); if (!group.length && !groups.size) groups.set("[]", []);
    const A = (f, c, rs) => { const v = rs.map(r => r[c]).filter(x => x !== "" && x != null); if (f === "count") return v.length; const n = v.map(Number); if (!n.length) return ""; if (f === "sum") return n.reduce((a, b) => a + b, 0); if (f === "avg") return n.reduce((a, b) => a + b, 0) / n.length; if (f === "max") return Math.max(...n); if (f === "min") return Math.min(...n); };
    rows = [...groups.values()].map(rs => sel.map(s => s.agg ? A(s.agg, s.c, rs) : rs[0][s.c]));
    if (order.length){ const idx = o => sel.findIndex(s => s.c === o.c && (s.agg || null) === (o.agg || null)); rows.sort((a, b) => { for (const o of order){ const k = idx(o); if (k < 0) continue; if (a[k] < b[k]) return o.desc ? 1 : -1; if (a[k] > b[k]) return o.desc ? -1 : 1; } return 0; }); }
  } else { if (order.length) rows = rows.slice().sort((a, b) => { for (const o of order){ if (a[o.c] < b[o.c]) return o.desc ? 1 : -1; if (a[o.c] > b[o.c]) return o.desc ? -1 : 1; } return 0; }); rows = rows.map(r => sel.map(s => r[s.c])); }
  if (limit != null) rows = rows.slice(0, limit);
  const head = sel.map(s => s.agg ? `${s.agg} ${DB_HEAD[s.c]}` : DB_HEAD[s.c]);
  return {head, rows};
}
const DB_TASKS = [
 ["All readings from team1's ESP32-S3", "select * where B = 'team1-esp32s3'", false, "where B = 'team1-esp32s3' (text in single quotes)"],
 ["Only temperatures above 31 °C (time, device, value)", "select A, B, D where C = 'temp_c' and D > 31", false, "Two conditions joined with and: C = 'temp_c' and D > 31"],
 ["Average temperature for each device", "select B, avg(D) where C = 'temp_c' group by B", false, "avg(D) with group by B; filter to temp_c first"],
 ["The 5 most recent humidity readings from team2 (time and value)", "select A, D where B = 'team2-esp8266' and C = 'hum_pct' order by A desc limit 5", true, "order by A desc limit 5"],
 ["How many readings each device sent", "select B, count(D) group by B", false, "count(D) with group by B"],
 ["The highest temperature each device recorded, hottest first", "select B, max(D) where C = 'temp_c' group by B order by max(D) desc", true, "max(D) ... group by B order by max(D) desc"]
];
const sameRows = (a, b, ordered) => { const f = r => r.map(v => typeof v === "number" ? +v.toFixed(3) : v).join("|"); const A = a.rows.map(f), B = b.rows.map(f); if (A.length !== B.length) return false; return ordered ? A.every((x, i) => x === B[i]) : A.slice().sort().join("\n") === B.slice().sort().join("\n"); };
INTERACTIVES.dbLab = function(el){
  let t = 0; const done = new Set(Object.keys(store.get("sss_dbdone_" + (user ? user.email : "g"), {})).map(Number));
  el.innerHTML = bench("Query lab: Google Sheets QUERY on your readings", `<p class="explain">The Readings table has ${DB_DATA.length} rows (3 boards, every 30 minutes, 07:00–18:30). Columns: <b>A</b> timestamp, <b>B</b> device_id, <b>C</b> sensor, <b>D</b> value. In a real Sheet you would type <code>=QUERY(Readings!A:D, "select …", 1)</code>; here, type only the part inside the quotes.</p>
   <div class="controls dbNav"></div><div class="ix-out dbTask"></div>
   <div class="controls"><input class="dinput mono dbQ" style="flex:1;min-width:240px" placeholder="select * where B = 'team1-esp32s3'" aria-label="Your query"><button class="btn primary dbRun" type="button">Run</button><button class="btn dbHint" type="button">Hint</button></div>
   <div class="dbMsg"></div><div class="vsheet dbOut"></div>`);
  const nav = () => { $(".dbNav", el).innerHTML = DB_TASKS.map((x, k) => `<button class="chip ${k === t ? "sel" : ""} ${done.has(k) ? "ok" : ""}" type="button" data-k="${k}">${k + 1}</button>`).join(""); el.querySelectorAll(".dbNav .chip").forEach(b => b.onclick = () => { t = +b.dataset.k; show(); }); };
  const show = () => { nav(); $(".dbTask", el).innerHTML = `<b>Task ${t + 1}:</b> ${DB_TASKS[t][0]}`; $(".dbMsg", el).innerHTML = ""; table({head:DB_HEAD, rows:DB_DATA.slice(0, 8)}, "First 8 rows of the table:"); };
  const table = (R, cap) => { $(".dbOut", el).innerHTML = `${cap ? `<p class="explain">${cap}</p>` : ""}<table class="t"><tr>${R.head.map(h => `<th>${esc(h)}</th>`).join("")}</tr>${R.rows.slice(0, 30).map(r => `<tr>${r.map(v => `<td>${esc(typeof v === "number" ? +v.toFixed(2) : v)}</td>`).join("")}</tr>`).join("")}</table>${R.rows.length > 30 ? `<p class="explain">… ${R.rows.length - 30} more rows</p>` : ""}`; };
  const run = () => { let q = $(".dbQ", el).value.trim(); const mm = q.match(/QUERY\s*\([^,]*,\s*"([\s\S]*)"\s*(?:,\s*\d+\s*)?\)/i); if (mm) q = mm[1];
    if (!q) return; let R; try { R = runQuery(q, DB_DATA); } catch(e){ $(".dbMsg", el).innerHTML = `<p class="feedback no">${esc(e.message)}</p>`; return; }
    const want = runQuery(DB_TASKS[t][1], DB_DATA), ok = sameRows(R, want, DB_TASKS[t][2]);
    table(R, `${R.rows.length} row${R.rows.length === 1 ? "" : "s"}`);
    $(".dbMsg", el).innerHTML = ok ? `<p class="feedback ok">✓ Correct: this answers task ${t + 1}.</p>` : `<p class="feedback no">✗ The query runs, but the result does not answer the task yet (${R.rows.length} rows; expected ${want.rows.length}).</p>`;
    logEvent(currentModule, "dbLab", "query", q.slice(0, 200));
    if (ok){ done.add(t); store.set("sss_dbdone_" + (user ? user.email : "g"), Object.fromEntries([...done].map(k => [k, 1]))); nav(); if (done.size >= 5) markAct("dbLab", "pass"); if (done.size === DB_TASKS.length) confetti(); } };
  $(".dbRun", el).onclick = run; $(".dbQ", el).onkeydown = e => { if (e.key === "Enter") run(); };
  $(".dbHint", el).onclick = () => { $(".dbMsg", el).innerHTML = `<p class="explain"><b>Hint:</b> <code>${esc(DB_TASKS[t][3])}</code></p>`; };
  show();
};
