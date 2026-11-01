/* ============ APPS SCRIPT SANDBOX: a simulated Google Apps Script web app with a virtual Spreadsheet ============ */
const AS_WORKER = String.raw`
let __log=[], __clock=Date.UTC(2026,9,8,4,30,0), __lockHeld=false, __lockCount=0, __props={};
const console={log:(...a)=>__log.push(a.map(x=>typeof x==="object"?JSON.stringify(x):String(x)).join(" ")), error:(...a)=>__log.push("ERROR: "+a.join(" ")), warn:(...a)=>__log.push("WARN: "+a.join(" ")), info:(...a)=>__log.push(a.join(" "))};
const Logger={log:(...a)=>{ console.log(...a); }};
const RealDate=Date; class FakeDate extends RealDate { constructor(...a){ if(a.length) super(...a); else super(__clock); } static now(){ return __clock; } }
Date=FakeDate;
function __a1(a1){ const m=String(a1).toUpperCase().match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+)?)?$/); if(!m) throw new Error("Range not found: "+a1); const col=s=>[...s].reduce((t,c)=>t*26+c.charCodeAt(0)-64,0); return {r:+m[2], c:col(m[1]), nr:m[4]?(+m[4]-+m[2]+1):(m[3]?null:1), nc:m[3]?(col(m[3])-col(m[1])+1):1}; }
function __sheet(name, data){ const S={_n:name, _d:data};
  const rng=(r,c,nr,nc)=>({ getValues(){ const out=[]; for(let i=0;i<nr;i++){ const row=[]; for(let j=0;j<nc;j++){ const v=(S._d[r-1+i]||[])[c-1+j]; row.push(v===undefined?"":v); } out.push(row);} return out; },
    getValue(){ const v=(S._d[r-1]||[])[c-1]; return v===undefined?"":v; },
    setValues(v){ if(!Array.isArray(v)||!Array.isArray(v[0])) throw new Error("The parameters (number[]) don't match the method signature for SpreadsheetApp.Range.setValues: use a 2D array like [[a, b, c]]."); if(v.length!==nr||v[0].length!==nc) throw new Error("The number of rows/columns in the data does not match the range. The data has "+v.length+" rows and "+v[0].length+" columns but the range has "+nr+" rows and "+nc+" columns."); for(let i=0;i<nr;i++){ S._d[r-1+i]=S._d[r-1+i]||[]; for(let j=0;j<nc;j++) S._d[r-1+i][c-1+j]=v[i][j]; } return this; },
    setValue(v){ S._d[r-1]=S._d[r-1]||[]; S._d[r-1][c-1]=v; return this; }, getNumRows(){ return nr; }, getNumColumns(){ return nc; }, getRow(){ return r; }, getColumn(){ return c; }, getA1Notation(){ return "R"+r+"C"+c; }, clearContent(){ for(let i=0;i<nr;i++) for(let j=0;j<nc;j++) if(S._d[r-1+i]) S._d[r-1+i][c-1+j]=""; return this; } });
  return { getName(){ return name; }, appendRow(row){ if(!Array.isArray(row)) throw new Error("appendRow needs an array, e.g. sheet.appendRow([a, b, c])."); S._d.push(row.slice()); return this; },
    getLastRow(){ let n=S._d.length; while(n>0 && (S._d[n-1]||[]).every(v=>v===""||v==null)) n--; return n; }, getLastColumn(){ return S._d.reduce((m,r)=>Math.max(m,(r||[]).length),0); }, getMaxRows(){ return Math.max(1000,S._d.length); },
    getRange(a,b,c,d){ if(typeof a==="string"){ const x=__a1(a); return rng(x.r,x.c,x.nr==null?Math.max(1,S._d.length-x.r+1):x.nr,x.nc); } if(!(a>=1)) throw new Error("Those rows are out of bounds. (getRange row must be 1 or more; you passed "+a+")"); if(!(b>=1)) throw new Error("Those columns are out of bounds. (getRange column must be 1 or more)"); return rng(a,b,c||1,d||1); },
    getDataRange(){ const lr=Math.max(1,this.getLastRow()), lc=Math.max(1,this.getLastColumn()); return rng(1,1,lr,lc); }, setFrozenRows(){ return this; }, clear(){ S._d.length=0; return this; }, deleteRow(i){ S._d.splice(i-1,1); return this; }, getSheetName(){ return name; } }; }
let __book={};
const SpreadsheetApp={ getActiveSpreadsheet(){ return __ss; }, getActive(){ return __ss; }, openById(id){ return __ss; }, openByUrl(u){ return __ss; }, flush(){} };
const __ss={ getSheetByName(n){ return __book[n] ? __book[n].api : null; }, insertSheet(n){ if(__book[n]) throw new Error("A sheet with the name \""+n+"\" already exists."); const d=[]; __book[n]={d, api:__sheet(n,d)}; return __book[n].api; }, getSheets(){ return Object.values(__book).map(x=>x.api); }, getName(){ return "Classroom IoT Data"; }, getId(){ return "1AbcDEF_demo"; }, getSpreadsheetTimeZone(){ return "Asia/Manila"; }, getActiveSheet(){ return Object.values(__book)[0].api; } };
const ContentService={ MimeType:{TEXT:"text/plain", JSON:"application/json", CSV:"text/csv", JAVASCRIPT:"application/javascript"}, createTextOutput(s){ let c=s===undefined?"":String(s), m="text/plain"; return {__tout:true, setMimeType(x){ m=x; return this; }, getContent(){ return c; }, getMimeType(){ return m; }, setContent(x){ c=String(x); return this; }, append(x){ c+=String(x); return this; }}; } };
const HtmlService={ createHtmlOutput(s){ return {__hout:true, c:String(s||""), setTitle(){ return this; }, addMetaTag(){ return this; }, setXFrameOptionsMode(){ return this; }, getContent(){ return this.c; }}; }, createHtmlOutputFromFile(n){ return HtmlService.createHtmlOutput("<!-- page "+n+".html -->"); }, createTemplateFromFile(n){ return {evaluate(){ return HtmlService.createHtmlOutput("<!-- page "+n+".html -->"); }}; }, XFrameOptionsMode:{ALLOWALL:"ALLOWALL"} };
const LockService={ getScriptLock(){ return { waitLock(ms){ __lockHeld=true; __lockCount++; }, tryLock(ms){ __lockHeld=true; __lockCount++; return true; }, releaseLock(){ __lockHeld=false; }, hasLock(){ return __lockHeld; } }; }, getDocumentLock(){ return LockService.getScriptLock(); } };
const PropertiesService={ getScriptProperties(){ return { getProperty(k){ return __props[k]==null?null:__props[k]; }, setProperty(k,v){ __props[k]=String(v); return this; }, getProperties(){ return Object.assign({},__props); }}; } };
const Session={ getScriptTimeZone(){ return "Asia/Manila"; }, getActiveUser(){ return {getEmail(){ return ""; }}; } };
const Utilities={ formatDate(d,tz,f){ const t=new RealDate(+d+8*3600000), p=n=>String(n).padStart(2,"0"); return String(f).replace("yyyy",t.getUTCFullYear()).replace("MM",p(t.getUTCMonth()+1)).replace("dd",p(t.getUTCDate())).replace("HH",p(t.getUTCHours())).replace("mm",p(t.getUTCMinutes())).replace("ss",p(t.getUTCSeconds())); }, sleep(ms){ __clock+=ms; } };
const MailApp={ sendEmail(){ __log.push("(MailApp.sendEmail called: no email is sent in the sandbox)"); } };
onmessage=e=>{ const {code, sheets, requests, props}=e.data; __book={}; Object.keys(sheets).forEach(n=>{ const d=sheets[n].map(r=>r.slice()); __book[n]={d, api:__sheet(n,d)}; }); __props=Object.assign({},props||{});
  const results=[]; let defErr=null, fns={};
  try { fns=(new Function(code+"\n;return {doGet: typeof doGet==='function'?doGet:null, doPost: typeof doPost==='function'?doPost:null};"))(); } catch(x){ defErr=(x&&x.message)||String(x); }
  if(!defErr) for(const rq of requests){ __log=[]; __clock+=rq.wait||12000; __lockHeld=false; const lockBefore=__lockCount; let out=null, err=null;
    const P={}; Object.keys(rq.params||{}).forEach(k=>P[k]=String(rq.params[k])); const Ps={}; Object.keys(P).forEach(k=>Ps[k]=[P[k]]);
    const ev={parameter:P, parameters:Ps, queryString:Object.keys(P).map(k=>encodeURIComponent(k)+"="+encodeURIComponent(P[k])).join("&")||null, pathInfo:undefined, contextPath:"", contentLength:rq.body?rq.body.length:-1, postData:rq.body?{contents:rq.body, length:rq.body.length, type:rq.ctype||"text/plain", name:"postData"}:undefined};
    try { const fn=rq.method==="POST"?fns.doPost:fns.doGet; if(!fn) throw new Error("Script function not found: "+(rq.method==="POST"?"doPost":"doGet")); out=fn(ev); } catch(x){ err=(x&&x.message)||String(x); }
    let body=null, mime=null, kind=null; if(out&&out.__tout){ body=out.getContent(); mime=out.getMimeType(); kind="text"; } else if(out&&out.__hout){ body=out.getContent(); mime="text/html"; kind="html"; } else if(!err){ err=out===undefined?"The script completed but did not return anything.":"The script returned a value that is not a TextOutput or HtmlOutput (use ContentService.createTextOutput(...))."; }
    results.push({rq, body, mime, kind, err, log:__log.slice(), locked:__lockCount>lockBefore, rowsAfter:__book.Readings?__book.Readings.d.length:0}); }
  const sh={}; Object.keys(__book).forEach(n=>sh[n]=__book[n].d.map(r=>r.map(v=>v instanceof RealDate?{__date:+v}:v)));
  postMessage({results, sheets:sh, defErr, props:__props}); };`;
let asWorkerUrl = null;
function runAppsScript(code, sheets, requests, props){ return new Promise(res => {
  if (!asWorkerUrl) asWorkerUrl = URL.createObjectURL(new Blob([AS_WORKER], {type:"text/javascript"}));
  const w = new Worker(asWorkerUrl); const to = setTimeout(() => { w.terminate(); res({defErr:"TIMEOUT", results:[], sheets:{}}); }, 4000);
  w.onmessage = e => { clearTimeout(to); w.terminate(); res(e.data); };
  w.onerror = e => { clearTimeout(to); w.terminate(); res({defErr:e.message || "error", results:[], sheets:{}}); e.preventDefault(); };
  w.postMessage({code, sheets, requests, props}); }); }
const fmtCell = v => v && v.__date ? new Date(v.__date + 8 * 3600000).toISOString().replace("T", " ").slice(0, 19) : v;
const AS_HEADER = ["timestamp","device_id","sensor","value"];
const asSeed = () => ({Readings:[AS_HEADER, [{__date:Date.UTC(2026,9,8,4,0,0)},"team1-esp32s3","temp_c",29.4], [{__date:Date.UTC(2026,9,8,4,0,0)},"team1-esp32s3","hum_pct",68.1], [{__date:Date.UTC(2026,9,8,4,10,0)},"team1-esp32s3","temp_c",29.9], [{__date:Date.UTC(2026,9,8,4,10,0)},"team1-esp32s3","hum_pct",67.5], [{__date:Date.UTC(2026,9,8,4,20,0)},"team1-esp32s3","temp_c",30.6]].map(r => r.map(v => v && v.__date ? v : v)) });
function seedForWorker(){ const s = asSeed(); return {Readings:s.Readings.map(r => r.map(v => v && v.__date ? new Date(v.__date) : v))}; }

const AS = {
 as_hello: {id:"as_hello", title:"Hello, web app", task:"Make <code>doGet(e)</code> return the text <code>Hello from Apps Script</code> using ContentService.", criteria:["doGet exists","It returns a TextOutput (not a plain string)","The text is “Hello from Apps Script”"],
  starter:`function doGet(e) {
  // TODO: return ContentService.createTextOutput("...")
}
`, solution:`function doGet(e) {
  return ContentService.createTextOutput("Hello from Apps Script");
}
`, requests:[{method:"GET", params:{}}], hints:["return ContentService.createTextOutput(\"Hello from Apps Script\");"],
  check:R => { const r = R.results[0]; return [r.err && /not found/.test(r.err) ? fail("There is no doGet function.", "Name it exactly doGet (capital G).") : pass("doGet exists."), r.err ? fail(r.err, "Return ContentService.createTextOutput(...)") : pass("It returns a TextOutput."), !r.err && (r.body || "").trim() === "Hello from Apps Script" ? pass("The reply text is correct.") : fail(`The reply is “${esc(r.body || "")}”.`, "Match the text exactly, including capital letters.")]; }},
 as_params: {id:"as_params", title:"Read a URL parameter", task:"Read <code>e.parameter.name</code> and reply <code>Hello, NAME!</code>. If no name is given, reply <code>Hello, friend!</code>.", criteria:["?name=Ana replies Hello, Ana!","No name replies Hello, friend!"],
  starter:`function doGet(e) {
  const name = e.parameter.name;      // the value after ?name= in the URL
  // TODO: if name is missing, use "friend"
  // TODO: return "Hello, " + name + "!" as a TextOutput
}
`, solution:`function doGet(e) {
  const name = e.parameter.name || "friend";   // || gives a default when name is missing
  return ContentService.createTextOutput("Hello, " + name + "!");
}
`, requests:[{method:"GET", params:{name:"Ana"}}, {method:"GET", params:{}}], hints:["const name = e.parameter.name || \"friend\";","return ContentService.createTextOutput(\"Hello, \" + name + \"!\");"],
  check:R => { const [a, b] = R.results; return [!a.err && a.body === "Hello, Ana!" ? pass("?name=Ana → Hello, Ana!") : fail(`?name=Ana → “${esc(a.err || a.body || "")}”`, "Use e.parameter.name."), !b.err && b.body === "Hello, friend!" ? pass("No name → Hello, friend!") : fail(`No name → “${esc(b.err || b.body || "")}”`, "When e.parameter.name is undefined, use \"friend\" (the || trick).")]; }},
 as_log: {id:"as_log", title:"Log a reading to the Sheet", task:"For <code>?device_id=...&temp_c=...</code>, add one row <code>[new Date(), device_id, \"temp_c\", temp as a number]</code> to the <b>Readings</b> tab and reply <code>OK</code>.", criteria:["One new row per request","The value is stored as a number, not text","The reply is OK"],
  starter:`function doGet(e) {
  const p = e.parameter;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Readings");
  // TODO 1: append [new Date(), p.device_id, "temp_c", Number(p.temp_c)]
  // TODO 2: reply OK
}
`, solution:`function doGet(e) {
  const p = e.parameter;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Readings");
  sheet.appendRow([new Date(), p.device_id, "temp_c", Number(p.temp_c)]);
  return ContentService.createTextOutput("OK");
}
`, requests:[{method:"GET", params:{device_id:"team2-esp8266", temp_c:"30.1"}}, {method:"GET", params:{device_id:"team2-esp8266", temp_c:"30.4"}}], hints:["sheet.appendRow([new Date(), p.device_id, \"temp_c\", Number(p.temp_c)]);","Everything in e.parameter is text: Number(\"30.1\") turns it into the number 30.1."],
  check:R => { const rows = R.sheets.Readings || [], added = rows.slice(6); const out = [];
   out.push(added.length === 2 ? pass("Two requests added two rows.") : fail(`${added.length} rows were added for 2 requests.`, "Use appendRow once per request."));
   out.push(added.length && added.every(r => typeof r[3] === "number" && r[2] === "temp_c" && r[1] === "team2-esp8266") ? pass("Rows have the device, sensor name, and a numeric value.") : fail("Some rows are wrong (or the value is text).", "Wrap the value with Number(p.temp_c)."));
   out.push(R.results.every(r => !r.err && (r.body || "").trim() === "OK") ? pass("Each reply is OK.") : fail(`Reply: “${esc(R.results[0].err || R.results[0].body || "")}”`, "return ContentService.createTextOutput(\"OK\");")); return out; }},
 as_key: {id:"as_key", title:"Protect it with an API key", task:"Only accept requests whose <code>key</code> parameter equals <code>API_KEY</code>. Otherwise reply <code>ERR:key</code> and write nothing. Use <code>LockService</code> around the write.", criteria:["The right key writes a row and replies OK","A wrong or missing key replies ERR:key and writes nothing","The write is protected by a lock"],
  starter:`const API_KEY = "classroom-key";

function doGet(e) {
  const p = e.parameter;
  // TODO 1: if p.key is not API_KEY, return "ERR:key"
  const lock = LockService.getScriptLock();
  // TODO 2: lock.waitLock(10000); then append the row; then lock.releaseLock() (use try/finally)
  return ContentService.createTextOutput("OK");
}
`, solution:`const API_KEY = "classroom-key";

function doGet(e) {
  const p = e.parameter;
  if (p.key !== API_KEY) {
    return ContentService.createTextOutput("ERR:key");     // stop here: nothing is written
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);                                      // wait up to 10 s for other requests to finish
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Readings");
    sheet.appendRow([new Date(), p.device_id, "temp_c", Number(p.temp_c)]);
  } finally {
    lock.releaseLock();                                      // always release, even after an error
  }
  return ContentService.createTextOutput("OK");
}
`, requests:[{method:"GET", params:{key:"classroom-key", device_id:"team3-unor4", temp_c:"31.2"}}, {method:"GET", params:{key:"guess123", device_id:"intruder", temp_c:"99"}}, {method:"GET", params:{device_id:"intruder", temp_c:"99"}}], hints:["if (p.key !== API_KEY) { return ContentService.createTextOutput(\"ERR:key\"); }","lock.waitLock(10000); try { ...appendRow... } finally { lock.releaseLock(); }"],
  check:R => { const [a, b, c] = R.results, rows = (R.sheets.Readings || []).slice(6); return [
   !a.err && a.body === "OK" && rows.some(r => r[1] === "team3-unor4") ? pass("The right key wrote a row.") : fail("The right key did not write a row and reply OK.", "Append the row after the key check."),
   b.body === "ERR:key" && c.body === "ERR:key" && !rows.some(r => r[1] === "intruder") ? pass("Wrong and missing keys were rejected; nothing was written.") : fail("A wrong or missing key was not rejected (or a row was written).", "Compare p.key !== API_KEY first, and return before writing."),
   a.locked ? pass("The write used LockService.") : fail("No lock was used.", "lock.waitLock(10000) before writing, releaseLock() in finally.")]; }},
 as_validate: {id:"as_validate", title:"Validate the data", task:"Accept any of these sensors: <code>temp_c</code>, <code>hum_pct</code>, <code>light_pct</code>. Write one row per sensor that is present. If a value is not a number, reply <code>ERR:bad_value:NAME</code> and write nothing. If no sensor is present, reply <code>ERR:no_readings</code>. Otherwise reply <code>OK:n</code>.", criteria:["Two readings in one request become two rows and OK:2","A non-number is rejected with ERR:bad_value:...","No readings gives ERR:no_readings"],
  starter:`const ALLOWED = ["temp_c", "hum_pct", "light_pct"];

function doGet(e) {
  const p = e.parameter;
  const rows = [];
  const now = new Date();
  for (const name of ALLOWED) {
    if (p[name] === undefined) continue;          // this sensor was not sent
    // TODO 1: if p[name] is empty or not a number, return "ERR:bad_value:" + name
    // TODO 2: rows.push([now, p.device_id, name, Number(p[name])]);
  }
  // TODO 3: if rows is empty, return "ERR:no_readings"
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Readings");
  // TODO 4: write all rows at once with getRange(...).setValues(rows)
  return ContentService.createTextOutput("OK:" + rows.length);
}
`, solution:`const ALLOWED = ["temp_c", "hum_pct", "light_pct"];

function doGet(e) {
  const p = e.parameter;
  const rows = [];
  const now = new Date();
  for (const name of ALLOWED) {
    if (p[name] === undefined) continue;
    if (p[name] === "" || isNaN(Number(p[name]))) {
      return ContentService.createTextOutput("ERR:bad_value:" + name);
    }
    rows.push([now, p.device_id, name, Number(p[name])]);
  }
  if (rows.length === 0) return ContentService.createTextOutput("ERR:no_readings");
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Readings");
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);   // one write for all rows: faster
  return ContentService.createTextOutput("OK:" + rows.length);
}
`, requests:[{method:"GET", params:{device_id:"team4-esp32s3", temp_c:"30.2", hum_pct:"66.0"}}, {method:"GET", params:{device_id:"team4-esp32s3", temp_c:"nan"}}, {method:"GET", params:{device_id:"team4-esp32s3", color:"blue"}}], hints:["isNaN(Number(\"nan\")) is true; isNaN(Number(\"30.2\")) is false.","sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);"],
  check:R => { const [a, b, c] = R.results, rows = (R.sheets.Readings || []).slice(6); return [
   !a.err && a.body === "OK:2" && rows.length === 2 ? pass("Two readings → two rows and OK:2.") : fail(`Reply “${esc(a.err || a.body || "")}” with ${rows.length} new rows.`, "Push one row per allowed sensor, then setValues once."),
   b.body === "ERR:bad_value:temp_c" && rows.length === 2 ? pass("“nan” was rejected and nothing extra was written.") : fail(`For temp_c=nan the reply was “${esc(b.err || b.body || "")}”.`, "Check isNaN(Number(value)) before pushing."),
   c.body === "ERR:no_readings" ? pass("No readings → ERR:no_readings.") : fail(`With no sensor values the reply was “${esc(c.err || c.body || "")}”.`, "if (rows.length === 0) return ... \"ERR:no_readings\"")]; }},
 as_latest: {id:"as_latest", title:"Read back as JSON", task:"For <code>?action=latest&n=3</code>, reply with the last <code>n</code> rows of Readings as a JSON array of objects <code>{timestamp, device_id, sensor, value}</code>, newest last, with the JSON MIME type.", criteria:["The reply is valid JSON with the JSON MIME type","It has exactly n objects, the newest last","Each object has the four fields"],
  starter:`function doGet(e) {
  const p = e.parameter;
  if (p.action === "latest") return latest_(Number(p.n) || 20);
  return ContentService.createTextOutput("ERR:action");
}

function latest_(n) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Readings");
  const last = sheet.getLastRow();                 // includes the header row
  const count = Math.min(n, last - 1);
  // TODO 1: read the last 'count' rows: sheet.getRange(last - count + 1, 1, count, 4).getValues()
  // TODO 2: turn each row [t, d, s, v] into {timestamp: t, device_id: d, sensor: s, value: v}
  // TODO 3: return JSON.stringify(objects) with ContentService.MimeType.JSON
}
`, solution:`function doGet(e) {
  const p = e.parameter;
  if (p.action === "latest") return latest_(Number(p.n) || 20);
  return ContentService.createTextOutput("ERR:action");
}

function latest_(n) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Readings");
  const last = sheet.getLastRow();
  const count = Math.min(n, last - 1);
  if (count < 1) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
  const values = sheet.getRange(last - count + 1, 1, count, 4).getValues();
  const objects = values.map(r => ({timestamp: r[0], device_id: r[1], sensor: r[2], value: r[3]}));
  return ContentService.createTextOutput(JSON.stringify(objects))
    .setMimeType(ContentService.MimeType.JSON);
}
`, requests:[{method:"GET", params:{action:"latest", n:"3"}}], hints:["const values = sheet.getRange(last - count + 1, 1, count, 4).getValues();","values.map(r => ({timestamp: r[0], device_id: r[1], sensor: r[2], value: r[3]}))","ContentService.createTextOutput(JSON.stringify(objects)).setMimeType(ContentService.MimeType.JSON)"],
  check:R => { const r = R.results[0]; let j = null; try { j = JSON.parse(r.body); } catch(e){}
   return [j && r.mime === "application/json" ? pass("Valid JSON with the JSON MIME type.") : fail(r.err ? r.err : j ? "Valid JSON, but the MIME type is " + r.mime + "." : "The reply is not valid JSON.", "Use JSON.stringify(...) and .setMimeType(ContentService.MimeType.JSON)."),
    Array.isArray(j) && j.length === 3 && j[2] && j[2].value === 30.6 ? pass("Exactly 3 objects, newest last.") : fail(Array.isArray(j) ? `${j.length} objects; the last value is ${j.length ? j[j.length - 1].value : "-"}.` : "Not an array.", "Start at row last - count + 1 and read count rows."),
    Array.isArray(j) && j.length && j.every(o => o && "timestamp" in o && "device_id" in o && "sensor" in o && "value" in o) ? pass("Every object has the four fields.") : fail("Some objects are missing fields.", "Map each row to {timestamp, device_id, sensor, value}.")]; }}
};
function mountAppsScript(el, ids){
  const list = ids.map(id => AS[id]).filter(Boolean); let cur = list[0], tries = {};
  const key = c => "sss_as_" + (user ? user.email : "g") + "_" + c.id;
  el.innerHTML = bench("Apps Script sandbox", `${list.length > 1 ? `<div class="sb-tabs" role="tablist">${list.map((c, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="${i === 0}">${esc(c.title)}${act(c.id) === "pass" ? " ✓" : ""}</button>`).join("")}</div>` : ""}
   <div class="sb-task"></div><div class="gs-tabs" style="border-radius:8px 8px 0 0"><span class="on">Code.gs</span></div><textarea class="ed asE" spellcheck="false" autocapitalize="off" autocorrect="off" aria-label="Your Apps Script code"></textarea>
   <div class="controls"><button class="btn primary asRun" type="button">▶ Deploy and send the test requests</button><button class="btn asHint" type="button">Hint</button><button class="btn asAI" type="button">Ask Proto for a hint</button><button class="btn asSol" type="button">Show a solution</button><button class="btn asReset" type="button">Reset code</button></div>
   <details class="asTry"><summary><b>Send your own request</b></summary><div class="controls"><span class="mono explain">…/exec?</span><input class="dinput asQ mono" style="flex:1;min-width:220px" placeholder="key=classroom-key&device_id=team1&temp_c=29.4"><button class="btn small asSend" type="button">Send GET</button></div></details>
   <div class="sb-results" hidden><ul class="reslist asChecks"></ul><div class="ix-grid2"><div><b>Requests and replies</b><div class="netlog asNet" style="max-height:220px"></div><b>Execution log</b><div class="netlog asLog"></div></div><div><b>Readings tab</b><div class="vsheet asSheet"></div></div></div></div>
   <p class="explain">The sandbox imitates the parts of Apps Script used in this course (SpreadsheetApp, ContentService, LockService, PropertiesService, Utilities). Real Apps Script also needs authorization and a deployment; Module 4.2 walks you through both.</p>`);
  const ed = $(".asE", el);
  ed.addEventListener("keydown", e => { if (e.key === "Tab"){ e.preventDefault(); ed.setRangeText("  ", ed.selectionStart, ed.selectionEnd, "end"); } });
  ed.addEventListener("input", () => store.set(key(cur), ed.value));
  const load = () => { el.dataset.cur = cur.id; $(".sb-task", el).innerHTML = `<p><b>Task:</b> ${cur.task}</p><p class="explain"><b>Passes when:</b></p><ul>${cur.criteria.map(c => `<li>${c}</li>`).join("")}</ul>`; ed.value = store.get(key(cur), null) || cur.starter; $(".sb-results", el).hidden = true; };
  el.querySelectorAll(".sb-tabs button").forEach(b => b.onclick = () => { cur = list[+b.dataset.i]; el.querySelectorAll(".sb-tabs button").forEach(x => x.setAttribute("aria-selected", x === b)); load(); });
  $(".asReset", el).onclick = () => { if (confirm("Replace your code with the starter code?")){ store.del(key(cur)); load(); } };
  let hn = 0; $(".asHint", el).onclick = () => { const h = cur.hints[Math.min(hn, cur.hints.length - 1)]; hn++; $(".sb-results", el).hidden = false; $(".asChecks", el).innerHTML = `<li><b>Hint.</b> <code>${esc(h)}</code></li>`; };
  $(".asSol", el).onclick = () => { if ((tries[cur.id] || 0) < 2 && act(cur.id) !== "pass"){ $(".sb-results", el).hidden = false; $(".asChecks", el).innerHTML = `<li>Run your own code at least twice first, and use the hints.</li>`; return; } if (confirm("Load a working solution?")){ ed.value = cur.solution; store.set(key(cur), ed.value); } };
  const show = (R, checks) => { $(".sb-results", el).hidden = false;
    $(".asChecks", el).innerHTML = R.defErr ? `<li class="no">✗ Your code could not run: ${esc(R.defErr)}<span class="explain">Look for a missing bracket, quote, or comma near the line you changed last.</span></li>` : (checks || []).map(c => `<li class="${c.ok ? "ok" : "no"}">${c.ok ? "✓" : "✗"} ${c.msg}${!c.ok && c.hint ? `<span class="explain">${c.hint}</span>` : ""}</li>`).join("");
    $(".asNet", el).textContent = (R.results || []).map(r => `→ GET /exec${r.rq.params && Object.keys(r.rq.params).length ? "?" + Object.keys(r.rq.params).map(k => k + "=" + r.rq.params[k]).join("&") : ""}\n← ${r.err ? "ERROR: " + r.err : `${r.mime}  ${String(r.body).slice(0, 300)}`}`).join("\n\n");
    $(".asLog", el).textContent = (R.results || []).map(r => r.log.join("\n")).filter(Boolean).join("\n") || "(no console.log output)";
    const rows = (R.sheets && R.sheets.Readings) || [];
    $(".asSheet", el).innerHTML = rows.length ? `<table class="t">${rows.slice(-12).map((r, i) => `<tr>${r.map(c => `<${i === 0 && rows.length <= 12 ? "th" : "td"}>${esc(fmtCell(c))}</${i === 0 && rows.length <= 12 ? "th" : "td"}>`).join("")}</tr>`).join("")}</table>${rows.length > 12 ? `<p class="explain">Showing the last 12 of ${rows.length} rows.</p>` : ""}` : `<p class="explain">(empty)</p>`; };
  let lastFails = [];
  $(".asAI", el).onclick = () => { const p = aiHintPrompt({lang:"Google Apps Script (JavaScript)", title:cur.title, task:cur.task, code:ed.value, fails:lastFails});
    sendToProto(p); logEvent(currentModule, cur.id, "ai_hint", "asked"); aiLogAdd({tool:"Proto (course assistant)", framework:"PARTS", task:"Hint for " + cur.title, prompt:p.slice(0, 600)}); toast("Asked Proto for a hint. It was also added to your AI-use log."); };
  $(".asRun", el).onclick = async () => { tries[cur.id] = (tries[cur.id] || 0) + 1; const R = await runAppsScript(ed.value, seedForWorker(), cur.requests, {}); let checks = [];
    if (!R.defErr){ try { checks = cur.check(R); } catch(e){ checks = [fail("Checker error: " + e.message)]; } }
    lastFails = R.defErr ? ["Code could not run: " + R.defErr] : checks.filter(c => !c.ok).map(c => String(c.msg).replace(/<[^>]+>/g, "")); show(R, checks); const ok = !R.defErr && checks.length && checks.every(c => c.ok); logEvent(currentModule, cur.id, "sandbox_run", ok ? "pass" : "fail");
    if (ok && act(cur.id) !== "pass"){ markAct(cur.id, "pass"); confetti(); toast("Challenge passed!"); const t = el.querySelector(`.sb-tabs button[data-i="${list.indexOf(cur)}"]`); if (t) t.textContent = cur.title + " ✓"; } };
  $(".asSend", el).onclick = async () => { const q = $(".asQ", el).value.replace(/^\?/, ""); const params = {}; q.split("&").filter(Boolean).forEach(kv => { const i = kv.indexOf("="); params[decodeURIComponent(i < 0 ? kv : kv.slice(0, i))] = i < 0 ? "" : decodeURIComponent(kv.slice(i + 1)); });
    const R = await runAppsScript(ed.value, seedForWorker(), [{method:"GET", params}], {}); show(R, [{ok:true, msg:"Custom request sent (not graded)."}]); };
  load();
}
