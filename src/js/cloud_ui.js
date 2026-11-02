/* ============ VIRTUAL CLOUD PANEL: shows what ThingSpeak, Firebase, AWS and Blynk "received" ============ */
function renderCloud(box, r){
  if (!box) return; const C = r.cloud || {}; const parts = [];
  const tbl = (head, rows) => `<div class="tscroll"><table class="t"><tr>${head.map(h => `<th>${esc(h)}</th>`).join("")}</tr>${rows.map(x => `<tr>${x.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table></div>`;
  if (C.ts && C.ts.length){
    const f1 = C.ts.map(e => +e.f[1]).filter(v => !isNaN(v)), lo = Math.min(...f1), hi = Math.max(...f1), W = 260, H = 60;
    const pts = f1.map((v, i) => `${(6 + i * (W - 12) / Math.max(1, f1.length - 1)).toFixed(1)},${(H - 8 - (hi === lo ? .5 : (v - lo) / (hi - lo)) * (H - 16)).toFixed(1)}`).join(" ");
    parts.push(`<div class="cloud-card"><b>ThingSpeak channel</b> <span class="explain">(virtual)</span>${f1.length > 1 ? `<svg class="cloud-spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Field 1 chart"><polyline points="${pts}" fill="none" stroke="#4F46E5" stroke-width="2.5"/></svg>` : ""}${tbl(["Entry", "Time (s)", "Field 1", "Field 2", "Field 3"], C.ts.map(e => [e.id, (e.t / 1000).toFixed(1), e.f[1] ?? "", e.f[2] ?? "", e.f[3] ?? ""]))}</div>`); }
  if (C.fb && Object.keys(C.fb).length){
    const txt = JSON.stringify(C.fb, null, 2).split("\n"); parts.push(`<div class="cloud-card"><b>Firebase Realtime Database</b> <span class="explain">(virtual data tree)</span><pre class="code cloud-json">${esc(txt.slice(0, 40).join("\n"))}${txt.length > 40 ? "\n…" : ""}</pre></div>`); }
  if (C.mqtt && C.mqtt.length) parts.push(`<div class="cloud-card"><b>AWS IoT Core: MQTT test client</b> <span class="explain">(virtual)</span>${tbl(["Time (s)", "Direction", "Topic", "Payload"], C.mqtt.slice(-12).map(m => [(m.t / 1000).toFixed(1), m.dir === "in" ? "device → AWS" : "AWS → device", m.topic, m.payload]))}</div>`);
  if (C.ddb && C.ddb.length){ const keys = [...new Set(C.ddb.flatMap(d => Object.keys(d)))].filter(k => k !== "t"); parts.push(`<div class="cloud-card"><b>DynamoDB table</b> <span class="explain">(virtual, ${C.ddb.length} items)</span>${tbl(["time (s)"].concat(keys), C.ddb.slice(-10).map(d => [(d.t / 1000).toFixed(1)].concat(keys.map(k => d[k] ?? ""))))}</div>`); }
  if (C.blynk && Object.keys(C.blynk).length) parts.push(`<div class="cloud-card"><b>Blynk datastreams</b> <span class="explain">(virtual)</span><div class="blynk-grid">${Object.keys(C.blynk).sort().map(k => { const d = C.blynk[k]; return `<div class="blynk-w"><span>${esc(k)}</span><b>${typeof d.v === "number" ? +d.v.toFixed(1) : esc(d.v)}</b><i>${d.from === "app" ? "from the app" : "from the board"}</i></div>`; }).join("")}</div></div>`);
  box.innerHTML = parts.length ? `<h3>What the cloud received</h3>${parts.join("")}` : ""; box.hidden = !parts.length;
}
