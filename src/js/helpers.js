/* ============ CONTENT HELPERS ============ */
const ex = (t, h) => `<div class="callout ex"><b>Worked example: ${t}</b>${h}</div>`;
const mis = h => `<div class="callout mis"><b>Common mistake</b>${h}</div>`;
const tip = (t, h) => `<div class="callout tip"><b>${t}</b>${h}</div>`;
const tryit = h => `<div class="callout try"><b>Try it</b>${h}</div>`;
const safety = h => `<div class="callout safe"><b>Safety first</b>${h}</div>`;
const aibox = (t, h) => `<div class="callout aic"><b>${t}</b>${h}</div>`;
const think = h => `<div class="callout think"><b>Stop and think</b>${h}</div>`;
const srcs = keys => `<p class="srcline">Sources: ${keys.map(k => { const r = REF[k]; if (!r) return k; const short = r[0].split(".")[0].replace(/\s*\(\d{4}[a-z]?\)|\s*\(n\.d\.[^)]*\)/, ""); return r[1] ? `<a href="${r[1]}" target="_blank" rel="noopener">${esc(cite(k))}</a>` : esc(cite(k)); }).join(" • ")}</p>`;
function citeAuthor(a){ a = a.replace(/\s*\((?:Ed|Eds)\.\)\.?/g, "").trim(); const toks = a.split(/,\s*&\s*|,\s*|\s&\s/).map(x => x.trim()).filter(Boolean), ini = x => /^(?:[A-Z][a-z]?\.[\s-]?)+$/.test(x);
  if (!toks.some(ini)) return [a.replace(/\.$/, "")];
  const names = []; for (let i = 0; i < toks.length; i++){ if (ini(toks[i])) continue; names.push(toks[i].replace(/\.$/, "")); }
  return names; }
/* APA in-text citation from a reference key: "Author, Year" */
function cite(k){ const r = REF[k]; if (!r) return k; const m = r[0].match(/^(.+?)\s\((\d{4}[a-z]?|n\.d\.(?:-[a-z])?)(?:,[^)]*)?\)/); if (!m) return r[0].slice(0, 40);
  const names = citeAuthor(m[1]); const au = names.length >= 3 ? names[0] + " et al." : names.length === 2 ? names[0] + " & " + names[1] : names[0];
  return `${au}, ${m[2]}`; }
/* in-text citation for one or more keys by the same author: ct("a","b") -> "Author, n.d.-a, n.d.-b" */
function ct(...keys){ const cs = keys.map(cite); const au = cs[0].replace(/, [^,]+$/, ""); if (cs.every(c => c.startsWith(au + ", "))) return au + ", " + cs.map(c => c.slice(au.length + 2)).sort().join(", "); return cs.join("; "); }
const fig = (inner, cap, credit) => `<figure class="fig">${inner}<figcaption>${cap}${credit ? ` <span class="credit">${credit}</span>` : ""}</figcaption></figure>`;
const code = (lang, src, title) => `<div class="codebox"><div class="codehead"><span>${esc(title || lang)}</span><button class="btn small copybtn" type="button">Copy</button></div><pre class="code"><code>${esc(src.replace(/^\n/, ""))}</code></pre></div>`;
const dlcode = (name, src, title) => `<div class="codebox"><div class="codehead"><span>${esc(title || name)}</span><span><button class="btn small copybtn" type="button">Copy</button> <button class="btn small dlbtn" type="button" data-name="${esc(name)}">Download</button></span></div><pre class="code"><code>${esc(src.replace(/^\n/, ""))}</code></pre></div>`;
/* annotated code: lines = [[code, note], ...]; note may be "" */
function anat(title, lines, opts){
  opts = opts || {};
  let n = 0; const rows = lines.map(([c, note]) => { const k = note ? ++n : 0; return `<div class="aline${k ? " has" : ""}" ${k ? `data-n="${k}"` : ""}><span class="amark">${k || ""}</span><code>${esc(c) || " "}</code></div>`; }).join("");
  let m = 0; const notes = lines.filter(l => l[1]).map(l => `<li data-n="${++m}"><b>${m}.</b> ${l[1]}</li>`).join("");
  const raw = lines.map(l => l[0]).join("\n");
  return `<div class="anat"><div class="anat-title"><span>${title} <span class="explain">Tap a numbered line to see what it does.</span></span><span class="anat-btns"><button class="btn small copybtn" type="button" data-raw="${esc(raw)}">Copy code</button>${opts.file ? ` <button class="btn small dlbtn" type="button" data-name="${esc(opts.file)}" data-raw="${esc(raw)}">Download</button>` : ""}</span></div><div class="anat-code">${rows}</div><ol class="anat-notes">${notes}</ol></div>`;
}
/* Google Sheets mock-up */
function sheet(o){
  const cols = o.headers.length, letters = "ABCDEFGHIJKL".slice(0, cols).split("");
  const cell = (r, c) => o.sel === (letters[c] + (r + 1)) ? " sel" : "";
  return `<div class="gs">${o.tab ? `<div class="gs-tabs">${[].concat(o.tabs || [o.tab]).map(t => `<span class="${t === o.tab ? "on" : ""}">${esc(t)}</span>`).join("")}</div>` : ""}<div class="gs-bar"><span class="gs-name">${o.cellname || o.sel || "A1"}</span><span class="gs-fx">fx</span><span class="gs-formula">${esc(o.formula || "")}</span></div>
   <div class="gs-grid" style="grid-template-columns:34px repeat(${cols},minmax(70px,1fr))"><div class="gs-h"></div>${letters.map(l => `<div class="gs-h">${l}</div>`).join("")}
   <div class="gs-r">1</div>${o.headers.map((h, c) => `<div class="gs-c head${cell(0, c)}">${esc(h)}</div>`).join("")}
   ${o.rows.map((row, r) => `<div class="gs-r">${r + 2}</div>${row.map((v, c) => `<div class="gs-c${cell(r + 1, c)}${typeof v === "number" ? " num" : ""}">${esc(v)}</div>`).join("")}`).join("")}</div>
   ${o.note ? `<p class="gs-note">${o.note}</p>` : ""}<p class="illus">Illustration of Google Sheets</p></div>`;
}
const serialMock = (lines, title) => `<div class="mockwin"><div class="mockbar"><i></i><i></i><i></i><span>${esc(title || "Serial Monitor • 115200 baud")}</span></div><pre class="serial static">${esc(lines.join("\n"))}</pre></div>`;
const browserMock = (url, inner) => `<div class="mockwin"><div class="mockbar"><i></i><i></i><i></i><span class="mono urlbar">${esc(url)}</span></div><div class="browser-body">${inner}</div></div>`;
function steps(list){ return `<ol class="stepsl">${list.map(s => `<li>${s}</li>`).join("")}</ol>`; }
function specTable(rows){ return `<table class="t spec">${rows.map(r => `<tr><th>${esc(r[0])}</th><td>${r[1]}</td></tr>`).join("")}</table>`; }
const kbd = k => `<span class="kbd">${esc(k)}</span>`;
function glossTerm(term, def){ return `<span class="gterm" tabindex="0" data-def="${esc(def)}">${esc(term)}</span>`; }

document.addEventListener("click", e => {
  const c = e.target.closest(".copybtn"); if (c){ const raw = c.dataset.raw || (c.closest(".codebox") ? c.closest(".codebox").querySelector("code").innerText : ""); copyText(raw); return; }
  const d = e.target.closest(".dlbtn"); if (d){ const raw = d.dataset.raw || (d.closest(".codebox") ? d.closest(".codebox").querySelector("code").innerText : ""); downloadText(d.dataset.name || "file.txt", raw); toast("Downloaded " + (d.dataset.name || "file")); return; }
  const a = e.target.closest(".aline.has"); if (a){ const root = a.closest(".anat"), n = a.dataset.n; root.querySelectorAll(".aline").forEach(x => x.classList.toggle("on", x === a)); root.querySelectorAll(".anat-notes li").forEach(li => { const on = li.dataset.n === n; li.classList.toggle("on", on); if (on && innerWidth < 900) li.scrollIntoView({block:"nearest", behavior: reduceMotion() ? "auto" : "smooth"}); }); }
});
/* product photos (loaded from the maker's or a retailer's site, with credit). If a photo cannot load, a text link replaces it. */
function photo(src, alt, credit, link, cls){ return `<figure class="photo ${cls || ""}"><div class="ph-frame"><img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.closest('.ph-frame').classList.add('ph-fail');this.remove()"><span class="ph-alt">${esc(alt)}${link ? ` — <a href="${link}" target="_blank" rel="noopener">view the photo at the source</a>` : ""}</span></div><figcaption>${alt}${credit ? ` <span class="credit">Photo: ${link ? `<a href="${link}" target="_blank" rel="noopener">${esc(credit)}</a>` : esc(credit)}</span>` : ""}</figcaption></figure>`; }
const photoRow = items => `<div class="photo-row">${items.join("")}</div>`;
