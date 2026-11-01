/* ============ VIRTUAL BOARD: C++ -> JS translation and a simulated board with sensors, Wi-Fi, and a virtual Apps Script server ============ */
const SIM_BOARD = {
  s3:      {defs:["ESP32","ARDUINO_ARCH_ESP32","CONFIG_IDF_TARGET_ESP32S3"], adc:4095, ldr:"1", mq:"2", led:"15", buzzer:"16", builtin:"LED_BUILTIN"},
  esp8266: {defs:["ESP8266","ARDUINO_ARCH_ESP8266"], adc:1023, ldr:"A0", mq:"A0", led:"D0", buzzer:"D7", builtin:"LED_BUILTIN"},
  uno:     {defs:["ARDUINO_UNOR4_WIFI","ARDUINO_ARCH_RENESAS"], adc:1023, ldr:"A0", mq:"A1", led:"6", buzzer:"7", builtin:"LED_BUILTIN"}
};
/* ---- string-aware mapper: applies fn only to code outside strings/comments ---- */
function mapCode(s, fn){ let out = "", buf = "", i = 0; while (i < s.length){ const ch = s[i];
  if (ch === '"' || ch === "'" || ch === "`"){ out += fn(buf); buf = ""; let j = i + 1; while (j < s.length && s[j] !== ch){ if (s[j] === "\\") j++; j++; } out += s.slice(i, j + 1); i = j + 1; continue; }
  if (ch === "/" && s[i + 1] === "/"){ const j = s.indexOf("\n", i); const k = j < 0 ? s.length : j; out += fn(buf) + s.slice(i, k); buf = ""; i = k; continue; }
  if (ch === "/" && s[i + 1] === "*"){ const j = s.indexOf("*/", i + 2); const k = j < 0 ? s.length : j + 2; out += fn(buf) + s.slice(i, k).replace(/[^\n]/g, " "); buf = ""; i = k; continue; }
  buf += ch; i++; } return out + fn(buf); }
/* ---- tiny C preprocessor: #if defined(X) || defined(Y), #ifdef, #ifndef, #elif, #else, #endif ---- */
function preprocess(src, defs){
  const D = new Set(defs), stack = [];
  const evalCond = c => { c = c.replace(/defined\s*\(\s*(\w+)\s*\)/g, (m, x) => D.has(x) ? "1" : "0").replace(/defined\s+(\w+)/g, (m, x) => D.has(x) ? "1" : "0").replace(/\b[A-Za-z_]\w*\b/g, x => D.has(x) ? "1" : "0");
    try { return !!(new Function("return (" + c + ");"))(); } catch(e){ return false; } };
  const active = () => stack.every(s => s.on);
  return src.split("\n").map(l => { const t = l.trim(); let m;
    if ((m = t.match(/^#\s*ifdef\s+(\w+)/))) { stack.push({on:D.has(m[1]), done:D.has(m[1])}); return ""; }
    if ((m = t.match(/^#\s*ifndef\s+(\w+)/))) { stack.push({on:!D.has(m[1]), done:!D.has(m[1])}); return ""; }
    if ((m = t.match(/^#\s*if\s+(.+)/))) { const v = evalCond(m[1]); stack.push({on:v, done:v}); return ""; }
    if ((m = t.match(/^#\s*elif\s+(.+)/))) { const s = stack[stack.length - 1]; if (s){ if (s.done) s.on = false; else { s.on = evalCond(m[1]); s.done = s.on; } } return ""; }
    if (/^#\s*else\b/.test(t)) { const s = stack[stack.length - 1]; if (s){ s.on = !s.done; s.done = true; } return ""; }
    if (/^#\s*endif\b/.test(t)) { stack.pop(); return ""; }
    if (!active()) return "";
    if ((m = t.match(/^#\s*define\s+(\w+)\s*$/))) { D.add(m[1]); return ""; }
    return l; }).join("\n");
}
const T_ = "(?:unsigned\\s+long\\s+long|unsigned\\s+long|unsigned\\s+int|unsigned\\s+char|long\\s+long|long|int|short|float|double|bool|boolean|String|byte|char|uint8_t|uint16_t|uint32_t|uint64_t|int8_t|int16_t|int32_t|int64_t|size_t|word)";
const INT_T = /^(unsigned\s+long\s+long|unsigned\s+long|unsigned\s+int|unsigned\s+char|long\s+long|long|int|short|byte|uint8_t|uint16_t|uint32_t|uint64_t|int8_t|int16_t|int32_t|int64_t|size_t|word)$/;
const OBJ_T = {DHT:"__DHT", TinyGPSPlus:"__GPS", MFRC522:"__RFID", SensirionI2cSps30:"__SPS30", HTTPClient:"__HTTP", WiFiClientSecure:"__CLIENT", WiFiClient:"__CLIENT", WiFiSSLClient:"__SSL", SoftwareSerial:"__SWSERIAL", HardwareSerial:"__HWSERIAL"};
/* while (cond) { ... }  ->  while (cond) { __tick(); ... } so that busy loops still let simulated time pass (balanced parentheses) */
function convertWhile(src){ return mapCode(src, c => { let out = "", i = 0; const re = /\bwhile\s*\(/g; let m;
  while ((m = re.exec(c))){ let j = re.lastIndex, d = 1; while (j < c.length && d){ if (c[j] === "(") d++; else if (c[j] === ")") d--; j++; }
    let k = j; while (k < c.length && /\s/.test(c[k])) k++;
    if (c[k] === "{"){ out += c.slice(i, k + 1) + " __tick();"; i = k + 1; } else if (c[k] === ";"){ out += c.slice(i, j) + " { __tick(); }"; i = k + 1; } else { out += c.slice(i, j); i = j; }
    re.lastIndex = j; }
  return out + c.slice(i); }); }
/* static variables inside functions keep their value between calls: hoist them to the top of the program */
function hoistStatics(src){ const hoisted = []; const lines = src.split("\n").map(l => { const m = l.match(/^(\s+)static\s+([^;]+;)\s*(\/\/.*)?$/); if (m){ hoisted.push(m[2]); return ""; } return l; }); return hoisted.join("\n") + "\n" + lines.join("\n"); }
/* same-length copy of the source with string and comment contents blanked, so code can be scanned safely */
function maskCode(s){ let out = "", i = 0; while (i < s.length){ const ch = s[i];
  if (ch === '"' || ch === "'"){ let j = i + 1; while (j < s.length && s[j] !== ch && s[j] !== "\n"){ if (s[j] === "\\") j++; j++; } out += ch + "x".repeat(Math.max(0, Math.min(j, s.length) - i - 1)) + (j < s.length ? s[j] : ""); i = j + 1; continue; }
  if (ch === "/" && s[i + 1] === "/"){ const j = s.indexOf("\n", i); const k = j < 0 ? s.length : j; out += " ".repeat(k - i); i = k; continue; }
  if (ch === "/" && s[i + 1] === "*"){ const j = s.indexOf("*/", i + 2); const k = j < 0 ? s.length : j + 2; out += s.slice(i, k).replace(/[^\n]/g, " "); i = k; continue; }
  out += ch; i++; } return out.slice(0, s.length); }
/* rewrite "type name = initializer" so integer variables keep C++ integer math and floats print with decimals */
function rewriteDecls(src, ints, flts){
  const re = new RegExp("\\b(const\\s+)?(?:volatile\\s+)?(" + T_.slice(3, -1) + ")\\s+([A-Za-z_]\\w*)\\s*=(?!=)\\s*", "g");
  const mk = maskCode(src); let out = "", last = 0, m;
  while ((m = re.exec(mk))){ const t = m[2].replace(/\s+/g, " "), isInt = INT_T.test(t), isF = /^(float|double)$/.test(t);
    let i = re.lastIndex, depth = 0; while (i < mk.length){ const ch = mk[i]; if ("([{".includes(ch)) depth++; else if (")]}".includes(ch)){ if (depth === 0) break; depth--; } else if ((ch === ";" || ch === ",") && depth === 0) break; i++; }
    const init = src.slice(re.lastIndex, i).trim(); if (isInt) ints.add(m[3]); if (isF) flts.add(m[3]);
    out += src.slice(last, m.index) + `${m[1] ? "const" : "let"} ${m[3]} = ` + (isInt ? `__int(${init})` : isF ? `__flt(${init})` : init); last = i; re.lastIndex = i; }
  return out + src.slice(last);
}
function cppToJs(src, board){
  const notes = []; const B = SIM_BOARD[board] || SIM_BOARD.s3;
  let s = hoistStatics(preprocess(src.replace(/\r/g, "").replace(/\t/g, "  "), B.defs));
  s = mapCode(s, c => c.replace(/^\s*#\s*(include|undef|pragma|error|warning).*$/gm, "").replace(/\bstatic\s+/g, "").replace(/\b(0x[0-9a-fA-F]+|\d+)(?:ULL|ull|UL|ul|LU|lu|LL|ll|U|u|L|l)\b/g, "$1").replace(/\b(\d+\.\d*|\.\d+)[fF]\b/g, "$1").replace(/\bsizeof\s*\(\s*(\w+)\s*\)/g, "__sizeof($1)").replace(/\bsizeof\s+(\w+)/g, "__sizeof($1)"));
  s = s.replace(/^\s*#define\s+(\w+)\s+(.+)$/gm, "const $1 = $2;");
  // array initialisers: Type name[] = { ... };  ->  let name = [ ... ];  (the braces may contain strings)
  s = mapCode(s, c => c.replace(new RegExp("\\b(?:const\\s+)?" + T_ + "\\s+(\\w+)\\s*\\[\\s*\\w*\\s*\\]\\s*=\\s*\\{", "g"), "let $1 = [\u0001"));
  for (let k = s.indexOf("[\u0001"); k >= 0; k = s.indexOf("[\u0001")){ let i = k + 2, q = null, depth = 0;
    for (; i < s.length; i++){ const ch = s[i]; if (q){ if (ch === "\\") i++; else if (ch === q) q = null; continue; } if (ch === '"' || ch === "'") { q = ch; continue; } if (ch === "{") depth++; else if (ch === "}"){ if (!depth) break; depth--; } }
    s = s.slice(0, k + 1) + s.slice(k + 2, i) + "]" + s.slice(i + 1); }
  const ints = new Set(), flts = new Set();
  s = rewriteDecls(s, ints, flts);
  s = mapCode(s, c => {
    c = c
      // objects: Type name(args); and Type name;
      .replace(new RegExp("\\b(" + Object.keys(OBJ_T).join("|") + ")\\s+(\\w+)\\s*\\(([^)]*)\\)\\s*;", "g"), (m, t, n, a) => `let ${n} = ${OBJ_T[t]}(${a});`)
      .replace(new RegExp("\\b(" + Object.keys(OBJ_T).join("|") + ")\\s+(\\w+)\\s*;", "g"), (m, t, n) => `let ${n} = ${OBJ_T[t]}();`)
      // functions with reference parameters (SPS30)
      .replace(/(\w+)\.readDataReadyFlag\(\s*(\w+)\s*\)/g, "(($2 = $1.__ready()), 0)")
      .replace(/(\w+)\.readMeasurementValues(?:Uint16|Float)\(([^)]*)\)/g, (m, o, a) => `(([${a}] = ${o}.__mv()), 0)`)
      // String methods that change the string in place
      .replace(/(\w+)\.(toUpperCase|toLowerCase|trim)\(\)\s*;/g, "$1 = $1.$2();")
      .replace(/\.length\(\)/g, ".length")
      // char pointers and arrays
      .replace(/\b(?:static\s+)?(const\s+)?char\s*\*\s*(\w+)\s*=/g, (m, k) => (k ? "const " : "let ") + m.match(/(\w+)\s*=$/)[1] + " =")
      .replace(new RegExp("\\b(?:const\\s+)?" + T_ + "\\s+(\\w+)\\s*\\[\\s*\\w*\\s*\\]\\s*=\\s*\\{([^}]*)\\}", "g"), "let $1 = [$2]")
      .replace(new RegExp("\\b(?:const\\s+)?" + T_ + "\\s+(\\w+)\\s*\\[\\s*(\\w+)\\s*\\]\\s*;", "g"), "let $1 = new Array($2).fill(0);")
      // function definitions
      .replace(new RegExp("\\b(?:static\\s+)?(void|" + T_.slice(3, -1) + ")\\s+(\\w+)\\s*\\(([^)]*)\\)\\s*\\{", "g"), (m, t, name, ps) => `function ${name}(${ps.split(",").map(p => p.trim()).filter(p => p && p !== "void").map(p => p.replace(/=.*$/, "").trim().split(/[\s&*]+/).pop()).join(", ")}) {`)
      // casts
      .replace(/\(\s*(?:char)\s*\)\s*/g, "").replace(/\(\s*(?:unsigned\s+)?(?:int|long|byte|uint8_t|uint16_t|uint32_t|int16_t|int32_t)\s*\)\s*([\w.]+(?:\([^()]*\))?)/g, "__int($1)").replace(/\(\s*(?:float|double)\s*\)\s*/g, "")
      .replace(/\bstatic_cast<\s*(?:int|long)\s*>\s*\(/g, "__int(").replace(/\bstatic_cast<\s*\w+\s*>\s*\(/g, "(");
    // remaining declarations without values (or later in a comma list)
    c = c.replace(new RegExp("\\b(const\\s+)?(?:static\\s+)?(?:volatile\\s+)?" + T_ + "\\s+(?=[A-Za-z_]\\w*\\s*(?:=|;|,|\\)))", "g"), (m, k) => k ? "const " : "let ");
    return c.replace(/\bString\s*\(/g, "__String(").replace(/\bF\s*\(/g, "(").replace(/\bNULL\b|\bnullptr\b/g, "null")
      .replace(/\}\s*while\b/g, "}__DOWHILE__").replace(/\bdo\s*\{/g, "do { __tick();");
  });
  s = convertWhile(s).replace(/__DOWHILE__/g, " while");
  // integer re-assignments keep integer math
  if (ints.size) s = mapCode(s, c => c.replace(new RegExp("(^|[^\\w.])(" + [...ints].join("|") + ")\\s*=(?!=)\\s*([^;]+);", "g"), (m, pre, n, e, off, str) => /\b(let|const)\s*$/.test(str.slice(Math.max(0, off - 10), off + pre.length)) ? m : `${pre}${n} = __int(${e});`));
  if (flts.size) s = mapCode(s, c => c.replace(new RegExp("(^|[^\\w.])(" + [...flts].join("|") + ")\\s*=(?!=)\\s*([^;]+);", "g"), (m, pre, n, e, off, str) => /\b(let|const)\s*$/.test(str.slice(Math.max(0, off - 10), off + pre.length)) ? m : `${pre}${n} = __flt(${e});`));
  return {js:s, notes};
}
function cppLint(src){ const errs = [];
  let b = 0, p = 0; mapCode(src, c => { for (const ch of c){ if (ch === "{") b++; if (ch === "}") b--; if (ch === "(") p++; if (ch === ")") p--; } return c; });
  if (b !== 0) errs.push(b > 0 ? `You have ${b} more { than }. Every opening brace needs a closing brace.` : `You have ${-b} more } than {.`);
  if (p !== 0) errs.push(p > 0 ? "A parenthesis ( is not closed." : "There is an extra ).");
  src.split("\n").forEach((l, i) => { const t = mapCode(l, c => c.replace(/\/\/.*$/, "")).replace(/\/\*.*?\*\//g, "").trim();
    if (t && !/[;{}:,]$/.test(t) && !/^(#|\/\/|\/\*|\*)/.test(t) && !/^(if|else|for|while|switch|do|void|int|float|bool|long|unsigned|String|case|default)\b.*\)?$/.test(t) && !/^else$/.test(t) && !/[+\-*/%&|<>=!?]$/.test(t) && /[\w)\]"']$/.test(t) && !/^\w[\w\s*&]*\([^)]*\)$/.test(t)) errs.push(`Line ${i + 1} may be missing a semicolon (;) at the end: “${t}”.`); });
  const names = {serial:"Serial", digitalwrite:"digitalWrite", pinmode:"pinMode", analogread:"analogRead", Delay:"delay", Millis:"millis", Digitalwrite:"digitalWrite", Analogread:"analogRead", wifi:"WiFi", Wifi:"WiFi"};
  const code0 = mapCode(src, c => c);
  Object.keys(names).forEach(w => { if (new RegExp("\\b" + w + "\\b").test(mapCode(src, c => c.replace(/\/\/.*$/gm, ""))) && !new RegExp("\\b" + names[w] + "\\b").test(code0.replace(new RegExp("\\b" + w + "\\b", "g"), ""))) errs.push(`“${w}” should be written “${names[w]}”. C++ is case-sensitive.`); });
  return errs.slice(0, 4); }

/* ---- the worker: a simulated board ---- */
let SIM_WORKER = String.raw`
class Done {}
let __T=0,__LIMIT=0,__ev=[],__ser=[],__buf="",__pins={},__modes={},__maxDelay=0,__dhtLast=-1e9,__dhtFast=false,__adcMax=4095,__S={},__B={},__net=[],__rows=[],__samples=[],__pulseCalls=0,__flags={},__wifi={state:0,start:0,ssid:"",pass:""};
function __adv(ms){ __T+=ms; if(__T>__LIMIT) throw new Done(); }
function __tick(){ __adv(1); }
function __val(name,t){ const f=__S[name]; if(!f) return 0; let v=f.base; if(f.ramp) for(const r of f.ramp){ if(t>=r[0]&&t<r[1]) v = r[2]+(r[3]-r[2])*(t-r[0])/(r[1]-r[0]); else if(t>=r[1]&&r[4]) v=r[3]; } if(f.steps) for(const s of f.steps){ if(t>=s[0]&&t<s[1]) v = (typeof s[2]==="number") ? s[2] : v; } if(f.wave) v += f.wave[0]*Math.sin(t/f.wave[1]); return v; }
function __emitPin(p,v){ p=String(p); if(__pins[p]!==v){ __pins[p]=v; __ev.push({t:__T,pin:p,v}); } }
function __out(s){ __buf+=s; let i; while((i=__buf.indexOf("\n"))>=0){ __ser.push({t:__T,text:__buf.slice(0,i)}); __buf=__buf.slice(i+1);} if(__ser.length>600) throw new Done(); }
function __fmt(v,d){ let fl=false; if(v instanceof Number){ v=v.valueOf(); fl=true; } if(typeof v==="number"){ const isI=Number.isInteger(v)&&!fl; if(isI){ if(d===16) return Math.trunc(v).toString(16).toUpperCase(); if(d===2) return Math.trunc(v).toString(2); if(d===8) return Math.trunc(v).toString(8); return String(v); } if(isNaN(v)) return "nan"; if(!isFinite(v)) return v>0?"inf":"-inf"; return v.toFixed(d==null?2:d); } if(typeof v==="boolean") return v?"1":"0"; if(v==null) return ""; return String(v); }
function __int(x){ if(typeof x==="string"){ if(/^\s*-?\d/.test(x)) return parseInt(x); return x; } const n=Number(x); return isFinite(n)?Math.trunc(n):0; }
function __flt(x){ const n=Number(x); return new Number(n); }
function __sizeof(x){ return (x&&x.length)||4; }
const HIGH=1,LOW=0,OUTPUT="OUTPUT",INPUT="INPUT",INPUT_PULLUP="INPUT_PULLUP",LED_BUILTIN="LED_BUILTIN",DHT22="DHT22",DHT11="DHT11",NAN=NaN,HEX=16,DEC=10,BIN=2,OCT=8,SERIAL_8N1=0x800001c,true_=1;
const A0="A0",A1="A1",A2="A2",A3="A3",A4="A4",A5="A5",D0="D0",D1="D1",D2="D2",D3="D3",D4="D4",D5="D5",D6="D6",D7="D7",D8="D8",SDA="SDA",SCL="SCL";
function __printf(f,...a){ let i=0; return String(f).replace(/%(-?\d*)(?:\.(\d+))?(l{0,2}|h)?([dfsuxXc%])/g,(m,w,p,l,c)=>{ if(c==="%") return "%"; const v=a[i++]; let s; if(c==="d"||c==="u") s=String(__int(v)); else if(c==="f") s=Number(v).toFixed(p==null?6:+p); else if(c==="x") s=__int(v).toString(16); else if(c==="X") s=__int(v).toString(16).toUpperCase(); else if(c==="c") s=String(v); else s=String(v); if(w){ const n=Math.abs(+w); if(w[0]==="-") s=s.padEnd(n); else s=s.padStart(n, (w[0]==="0")?"0":" "); } return s; }); }
const Serial={begin(){}, print(v,d){__out(__fmt(v,d));}, println(v,d){__out((v===undefined?"":__fmt(v,d))+"\n");}, printf(f,...a){__out(__printf(f,...a));}, write(c){__out(typeof c==="number"?String.fromCharCode(c):String(c));}, available(){return 0;}, read(){return -1;}, flush(){}, setTimeout(){}, valueOf(){return 1;}};
function pinMode(p,m){ __modes[String(p)]=m; } function digitalWrite(p,v){__emitPin(p,v?1:0);} function digitalRead(p){ p=String(p); if(__B.button && p===String(__B.button)) return __val("button",__T)>0.5?LOW:HIGH; return __pins[p]||0;}
function analogWrite(p,v){ __emitPin(p, v>0?1:0); }
function analogReadResolution(b){ __adcMax=Math.pow(2,b)-1; } function analogReference(){} function analogSetAttenuation(){} function analogSetPinAttenuation(){}
function analogRead(p){ p=String(p); let frac=0;
  if(p===String(__B.ldr) && (__S.light && (!__S.gas || __B.ldr!==__B.mq || __flags.adcSensor!=="gas"))) frac=__val("light",__T)/100*0.97+0.01;
  else if(p===String(__B.mq) && __S.gas) frac=__val("gas",__T);
  else if(__S.light && p===String(__B.ldr)) frac=__val("light",__T)/100;
  else frac=0.02+Math.random()*0.01;
  return Math.max(0,Math.min(__adcMax,Math.round(frac*__adcMax+(Math.random()-0.5)*__adcMax*0.004))); }
function analogReadMilliVolts(p){ return Math.round(analogRead(p)/__adcMax*3100); }
function delay(ms){ ms=Number(ms)||0; if(ms<0) ms=0; if(ms>__maxDelay) __maxDelay=ms; __adv(ms); } function delayMicroseconds(us){ __adv((Number(us)||0)/1000); } function yield_(){ }
function millis(){ return Math.floor(__T); } function micros(){ return Math.floor(__T*1000); }
function tone(p,f,d){ __emitPin(p,1); if(d) __flags.toneOff=[String(p),__T+d]; } function noTone(p){ __emitPin(p,0); }
function constrain(x,a,b){ return Math.min(b,Math.max(a,x)); } function map(x,a,b,c,d){ return Math.trunc((x-a)*(d-c)/(b-a)+c); }
function random(a,b){ if(b===undefined){ b=a; a=0; } return a+Math.floor(Math.random()*(b-a)); } function randomSeed(){}
const abs=Math.abs, sqrt=Math.sqrt, pow=Math.pow, floor=Math.floor, ceil=Math.ceil, round=Math.round, sq=x=>x*x, fabs=Math.abs, min=Math.min, max=Math.max, log10=Math.log10, exp=Math.exp, log=Math.log;
const isnan=x=>isNaN(Number(x)), isinf=x=>!isFinite(Number(x));
function __String(v,d){ let fl=false; if(v instanceof Number){ v=v.valueOf(); fl=true; } if(typeof v==="number"){ const isI=Number.isInteger(v)&&!fl; if(isI){ if(d===16) return Math.trunc(v).toString(16); if(d===2) return Math.trunc(v).toString(2); if(d===8) return Math.trunc(v).toString(8); return String(v); } if(isNaN(v)) return "nan"; return v.toFixed(d==null?2:d); } return v==null?"":String(v); }
String.prototype.equals=function(x){ return String(this)===String(x); }; String.prototype.c_str=function(){ return String(this); };
String.prototype.toInt=function(){ return __int(String(this)); }; String.prototype.toFloat=function(){ const n=parseFloat(this); return isNaN(n)?0:n; };
String.prototype.charAt0=String.prototype.charAt; String.prototype.equalsIgnoreCase=function(x){ return String(this).toLowerCase()===String(x).toLowerCase(); };
String.prototype.concat2=function(x){ return String(this)+x; };
/* ---- sensors ---- */
function __readDHT(k,model){ if(__T-__dhtLast<(model==="DHT11"?950:1950)&&k==="t") __dhtFast=true; if(k==="t") __dhtLast=__T; if(__val("dhtfail",__T)>0.5) return NaN; const raw=k==="t"?__val("temp",__T):__val("hum",__T); return new Number(model==="DHT11"?Math.round(raw):+raw.toFixed(1)); }
function __DHT(pin,model){ __flags.dhtPin=String(pin); return {begin(){}, readTemperature(f){ const c=__readDHT("t",model); return f?new Number(c*9/5+32):c; }, readHumidity(){return __readDHT("h",model);}, computeHeatIndex(t,h,f){ const T=f===false?t*9/5+32:t; let hi=0.5*(T+61+((T-68)*1.2)+(h*0.094)); if(hi>=80){ hi=-42.379+2.04901523*T+10.14333127*h-0.22475541*T*h-0.00683783*T*T-0.05481717*h*h+0.00122874*T*T*h+0.00085282*T*h*h-0.00000199*T*T*h*h; } return new Number(f===false?(hi-32)*5/9:hi); }}; }
function pulseIn(pin,level,timeout){ __pulseCalls++; timeout=timeout||1000000; const d=__val("dist",__T); if(!(__flags.trig)) { __adv(timeout/1000); return 0; } __flags.trig=false; const us=d*2/0.0343; if(d>400||us>timeout){ __adv(timeout/1000); return 0; } __adv(us/1000+0.2); return Math.round(us); }
const __dw=digitalWrite; digitalWrite=function(p,v){ if(__B.trig && String(p)===String(__B.trig)){ if(!v && __pins[String(p)]===1) __flags.trig=true; } __dw(p,v); };
const Wire={begin(){}, setClock(){}, beginTransmission(){}, endTransmission(){return 0;}};
const SPS30_I2C_ADDR_69=0x69, SPS30_OUTPUT_FORMAT_OUTPUT_FORMAT_UINT16=0x0500, SPS30_OUTPUT_FORMAT_OUTPUT_FORMAT_FLOAT=0x0300, NO_ERROR=0;
function errorToString(e,buf,n){ }
function __SPS30(){ let started=false, startAt=0; return {begin(){}, stopMeasurement(){ started=false; return 0; }, startMeasurement(){ started=true; startAt=__T; __flags.spsStarted=true; return 0; }, wakeUpSequence(){return 0;}, readSerialNumber(){return 0;}, readProductType(){return 0;}, readFirmwareVersion(){return 0;}, startFanCleaning(){ return 0; },
  __ready(){ return (started && __T-startAt>1000)?1:0; },
  __mv(){ if(!started) return [0,0,0,0,0,0,0,0,0,0]; const p25=__val("pm25",__T), p1=p25*0.78, p4=p25*1.05, p10=p25*1.12; return [Math.round(p1),Math.round(p25),Math.round(p4),Math.round(p10),Math.round(p25*6.1),Math.round(p25*7.0),Math.round(p25*7.2),Math.round(p25*7.25),Math.round(p25*7.3),0.5]; } }; }
/* GPS: NMEA sentences at 9600 baud */
function __nmeaCS(s){ let c=0; for(const ch of s) c^=ch.charCodeAt(0); return c.toString(16).toUpperCase().padStart(2,"0"); }
function __dm(v,isLat){ const a=Math.abs(v), d=Math.floor(a), m=(a-d)*60; return (isLat?String(d).padStart(2,"0"):String(d).padStart(3,"0"))+m.toFixed(5).padStart(8,"0"); }
let __gpsBuf="", __gpsSec=-1;
function __gpsFeed(){ const sec=Math.floor(__T/1000); while(__gpsSec<sec){ __gpsSec++; const t=__gpsSec*1000; const fix=__val("gpsfix",t)>0.5; const hh=String(4+Math.floor((30+__gpsSec/60)/60)%24).padStart(2,"0"), mm=String(Math.floor(30+__gpsSec/60)%60).padStart(2,"0"), ss=String(__gpsSec%60).padStart(2,"0"); const tm=hh+mm+ss+".00";
  const lat=__val("lat",t), lng=__val("lng",t), sats=Math.round(__val("sats",t)), hdop=__val("hdop",t).toFixed(2);
  const gga="GPGGA,"+tm+","+(fix?__dm(lat,true)+","+(lat>=0?"N":"S")+","+__dm(lng,false)+","+(lng>=0?"E":"W"):",,,")+","+(fix?1:0)+","+String(sats).padStart(2,"0")+","+(fix?hdop:"99.99")+","+(fix?"14.0":"")+",M,"+(fix?"46.9":"")+",M,,";
  const rmc="GPRMC,"+tm+","+(fix?"A":"V")+","+(fix?__dm(lat,true)+","+(lat>=0?"N":"S")+","+__dm(lng,false)+","+(lng>=0?"E":"W"):",,,")+","+(fix?"0.21":"")+","+(fix?"":"")+",081026,,,"+(fix?"A":"N");
  __gpsBuf+="$"+gga+"*"+__nmeaCS(gga)+"\r\n$"+rmc+"*"+__nmeaCS(rmc)+"\r\n"; } }
function __mkSerial(){ let begun=false; return {begin(){ begun=true; __flags.gpsBegun=true; }, available(){ if(!begun) return 0; __gpsFeed(); return __gpsBuf.length; }, read(){ __gpsFeed(); if(!__gpsBuf.length) return -1; const c=__gpsBuf[0]; __gpsBuf=__gpsBuf.slice(1); return c; }, print(){}, println(){}, write(){}, flush(){}, setTimeout(){}}; }
const Serial1=__mkSerial(), Serial2=__mkSerial();
function __SWSERIAL(){ return __mkSerial(); } function __HWSERIAL(){ return __mkSerial(); }
function __GPS(){ let cur="", charsProcessed=0, passed=0, failed=0; const st={lat:0,lng:0,locValid:false,locUpd:false,sats:0,satsValid:false,hdop:9999,alt:0,altValid:false,h:0,m:0,s:0,timeValid:false,d:0,mo:0,y:0,dateValid:false,speed:0};
  const loc={isValid(){return st.locValid;}, isUpdated(){return st.locUpd;}, lat(){ st.locUpd=false; return new Number(st.lat); }, lng(){ st.locUpd=false; return new Number(st.lng); }, age(){ return st.locValid?0:4294967295; }};
  const parse=line=>{ const star=line.indexOf("*"); if(star<0) return; const body=line.slice(1,star); if(__nmeaCS(body)!==line.slice(star+1,star+3).toUpperCase()){ failed++; return; } passed++; const f=body.split(",");
    const dm=(v,h)=>{ if(!v) return null; const dot=v.indexOf("."), deg=+v.slice(0,dot-2), mn=+v.slice(dot-2); const x=deg+mn/60; return (h==="S"||h==="W")?-x:x; };
    if(f[0].endsWith("GGA")){ const q=+f[6]; st.sats=+f[7]||0; st.satsValid=true; st.hdop=Math.round((+f[8]||99.99)*100); if(q>0){ st.lat=dm(f[2],f[3]); st.lng=dm(f[4],f[5]); st.locValid=true; st.locUpd=true; st.alt=+f[9]; st.altValid=true; } const t=f[1]; if(t){ st.h=+t.slice(0,2); st.m=+t.slice(2,4); st.s=+t.slice(4,6); st.timeValid=true; } }
    if(f[0].endsWith("RMC")){ const d=f[9]; if(d){ st.d=+d.slice(0,2); st.mo=+d.slice(2,4); st.y=2000+(+d.slice(4,6)); st.dateValid=true; } if(f[2]==="A"){ st.speed=+f[7]||0; } } };
  return {encode(c){ if(typeof c==="number") c=String.fromCharCode(c); charsProcessed++; if(c==="$") cur="$"; else if(c==="\n"){ if(cur) parse(cur.trim()); cur=""; } else if(cur) cur+=c; return false; },
   location:loc, satellites:{value(){return st.sats;}, isValid(){return st.satsValid;}}, hdop:{hdop(){return new Number(st.hdop/100);}, value(){return st.hdop;}, isValid(){return st.satsValid;}},
   altitude:{meters(){return new Number(st.alt);}, isValid(){return st.altValid;}}, speed:{kmph(){return new Number(st.speed*1.852);}, knots(){return new Number(st.speed);}, isValid(){return st.locValid;}},
   time:{hour(){return st.h;}, minute(){return st.m;}, second(){return st.s;}, isValid(){return st.timeValid;}}, date:{day(){return st.d;}, month(){return st.mo;}, year(){return st.y;}, isValid(){return st.dateValid;}},
   charsProcessed(){return charsProcessed;}, passedChecksum(){return passed;}, failedChecksum(){return failed;}}; }
/* RFID */
const SPI={begin(){ __flags.spiBegun=true; }};
function __RFID(ss,rst){ let shown=new Set(), cur=null; const o={uid:{uidByte:[0,0,0,0],size:0,sak:0x08}, PCD_Init(){ __flags.rfidInit=true; }, PCD_DumpVersionToSerial(){ __out("Firmware Version: 0x92 = v2.0\n"); }, PCD_SetAntennaGain(){},
  PICC_IsNewCardPresent(){ if(!__flags.rfidInit) return false; const taps=__S.taps||[]; for(let i=0;i<taps.length;i++){ const tp=taps[i]; if(__T>=tp[0] && __T<tp[0]+1500 && !shown.has(i)){ shown.add(i); cur=tp[1]; return true; } } return false; },
  PICC_ReadCardSerial(){ if(!cur) return false; o.uid.uidByte=cur.slice(); o.uid.size=cur.length; __flags.reads=(__flags.reads||0)+1; return true; }, PICC_HaltA(){ cur=null; }, PCD_StopCrypto1(){}, PICC_GetType(){ return 8; }, PICC_GetTypeName(){ return "MIFARE 1KB"; }};
  return o; }
/* ---- Wi-Fi + HTTP + virtual Apps Script ---- */
const WL_CONNECTED=3, WL_IDLE_STATUS=0, WL_NO_SSID_AVAIL=1, WL_CONNECT_FAILED=4, WL_DISCONNECTED=6, WIFI_STA=1, HTTPC_STRICT_FOLLOW_REDIRECTS=1, HTTPC_FORCE_FOLLOW_REDIRECTS=2, HTTP_CODE_OK=200;
const WiFi={ begin(ssid,pass){ __wifi.ssid=ssid; __wifi.pass=pass; __wifi.start=__T; __wifi.state=1; __net.push({t:__T,dir:"wifi",text:"Joining Wi-Fi \""+ssid+"\"..."}); },
  status(){ const n=__S.net||{}; if(!__wifi.state) return WL_IDLE_STATUS; if(n.mode==="none") return WL_NO_SSID_AVAIL; if(n.ssid && __wifi.ssid!==n.ssid) return WL_NO_SSID_AVAIL; if(n.pass!=null && __wifi.pass!==n.pass) return (__T-__wifi.start>3000)?WL_CONNECT_FAILED:WL_DISCONNECTED;
    if(n.drop && __T>=n.drop[0] && __T<n.drop[1]) { if(__wifi.state===2){ __net.push({t:__T,dir:"wifi",text:"Wi-Fi connection lost"}); __wifi.state=3; } return WL_DISCONNECTED; }
    if(__wifi.state===3){ __wifi.state=1; __wifi.start=__T; return WL_DISCONNECTED; }
    if(__T-__wifi.start>=2200){ if(__wifi.state!==2){ __wifi.state=2; __net.push({t:__T,dir:"wifi",text:"Connected. IP address 192.168.1.42"}); } return WL_CONNECTED; } return WL_DISCONNECTED; },
  localIP(){ return "192.168.1.42"; }, RSSI(){ return -58; }, mode(){}, disconnect(){ __wifi.state=0; }, setAutoReconnect(){}, persistent(){}, reconnect(){ __wifi.state=1; __wifi.start=__T; }, macAddress(){ return "34:85:18:AA:12:7C"; }, SSID(){ return __wifi.ssid; }, hostname(){} };
function __online(){ return WiFi.status()===WL_CONNECTED; }
function __server(url){ /* the virtual Apps Script web app (same rules as the course Code.gs) */
  const m=String(url).match(/^https:\/\/script\.google\.com\/macros\/s\/([^/?]+)\/exec(?:\?(.*))?$/); if(!m) return {code:404, body:"<html>Not Found</html>"};
  const sv=__S.server||{}; if(sv.id && m[1]!==sv.id) return {code:404, body:"<html>Sorry, unable to open the file at this time.</html>"};
  const P={}; (m[2]||"").split("&").filter(Boolean).forEach(kv=>{ const i=kv.indexOf("="); const k=decodeURIComponent(i<0?kv:kv.slice(0,i)); const v=i<0?"":decodeURIComponent(kv.slice(i+1).replace(/\+/g," ")); P[k]=v; });
  if(P.key!==(sv.key||"classroom-key")) return {code:200, body:"ERR:key"};
  if(!P.device_id) return {code:200, body:"ERR:device_id"};
  const known={indexOf:k=>/^[a-z][a-z0-9_]{0,29}$/.test(k)?0:-1}; let n=0; const ts=new Date(Date.UTC(2026,9,8,0,30,0)+__T).toISOString();
  for(const k of Object.keys(P)){ if(k==="key"||k==="device_id") continue; const lk=k.toLowerCase(); if(known.indexOf(lk)<0) continue; const v=P[k]; if(lk!=="uid" && (v===""||isNaN(Number(v)))) return {code:200, body:"ERR:bad_value:"+k}; __rows.push([ts,P.device_id,lk,lk==="uid"?v:Number(v)]); n++; }
  if(!n) return {code:200, body:"ERR:no_readings"};
  return {code:200, body:"OK:"+n}; }
function __request(method,url,body){ __adv(350+Math.random()*250); if(!__online()){ __net.push({t:__T,dir:"err",text:method+" failed: not connected to Wi-Fi"}); return {code:-1, body:""}; }
  const r=__server(url); __net.push({t:__T,dir:"out",text:method+" "+url}); __net.push({t:__T,dir:"in",text:"HTTP "+r.code+"  "+r.body}); return r; }
function __HTTP(){ let url="", resp={code:0,body:""}, follow=false; return { begin(a,b){ url=(b!==undefined?b:a); return true; }, setFollowRedirects(m){ follow=m>0; }, setTimeout(){}, addHeader(){}, setReuse(){},
  GET(){ const r=__request("GET",url); if(r.code===200 && !follow && /script\.google\.com/.test(url)){ resp={code:302, body:"<HTML>Moved Temporarily</HTML>"}; __net.push({t:__T,dir:"in",text:"(302 redirect not followed: the row was still saved)"}); return 302; } resp=r; return r.code; },
  POST(b){ const r=__request("POST",url,b); resp=r; return r.code; }, getString(){ return resp.body; }, end(){}, errorToString(c){ return c===-1?"connection refused":"error "+c; } }; }
function __CLIENT(){ return {setInsecure(){ __flags.insecure=true; }, setCACert(){ __flags.cacert=true; }, setTimeout(){}, stop(){}, connected(){ return false; }}; }
function __SSL(){ let rx="", host=""; return { setTimeout(){}, connect(h,port){ __adv(300); if(!__online()){ __net.push({t:__T,dir:"err",text:"connect("+h+") failed: no Wi-Fi"}); return false; } host=String(h); return true; },
  print(s){ s=String(s); const m=s.match(/^(GET|POST)\s+(\S+)\s+HTTP/); if(!m) return; const url="https://"+host+m[2];
    if(host==="script.google.com"){ const r=__request(m[1],url); if(r.code===200){ const loc="https://script.googleusercontent.com/macros/echo?user_content_key=demo&b="+encodeURIComponent(r.body); rx="HTTP/1.1 302 Moved Temporarily\r\nContent-Type: text/html\r\nLocation: "+loc+"\r\n\r\n<HTML>Moved</HTML>"; } else rx="HTTP/1.1 "+r.code+" Error\r\n\r\n"+r.body; }
    else if(host==="script.googleusercontent.com"){ const b=decodeURIComponent((m[2].match(/[?&]b=([^&]*)/)||[])[1]||""); __net.push({t:__T,dir:"in",text:"HTTP 200  "+b+"  (after following the redirect)"}); rx="HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\n"+b; }
    else { rx="HTTP/1.1 404 Not Found\r\n\r\n"; } },
  println(s){ this.print(s); }, available(){ return rx.length; }, connected(){ return rx.length>0; }, read(){ if(!rx.length) return -1; const c=rx[0]; rx=rx.slice(1); return c; },
  readStringUntil(ch){ const i=rx.indexOf(ch); let out; if(i<0){ out=rx; rx=""; } else { out=rx.slice(0,i); rx=rx.slice(i+1); } return out; }, readString(){ const o=rx; rx=""; return o; }, stop(){ rx=""; } }; }
Array.prototype.append=function(x){ this.push(x); };
onmessage=e=>{ const {js,sim,adc,S,B}=e.data; __LIMIT=sim; __adcMax=adc; __S=S||{}; __B=B||{}; let err=null; __flags.adcSensor=(S&&S.adcSensor)||"";
  let nextSample=0;
  const __sample=()=>{ while(__T>=nextSample && nextSample<=__LIMIT){ const row={t:nextSample}; ["temp","hum","light","dist","gas","pm25"].forEach(k=>{ if(__S[k]) row[k]=+__val(k,nextSample).toFixed(2); }); __samples.push(row); nextSample+=250; } };
  const __adv0=__adv; __adv=function(ms){ __T+=ms; __sample(); if(__flags.toneOff && __T>=__flags.toneOff[1]){ __emitPin(__flags.toneOff[0],0); __flags.toneOff=null; } if(__T>__LIMIT) throw new Done(); };
  try { const tail = "\n;if(typeof setup==='function') setup(); if(typeof loop!=='function') throw new Error('NO_LOOP'); while(true){ loop(); __adv(1); }";
        (new Function(js+tail))(); } catch(x){ if(!(x instanceof Done)) err=(x&&x.message)||String(x); }
  if(__buf) __ser.push({t:__T,text:__buf});
  postMessage({ev:__ev,ser:__ser,maxDelay:__maxDelay,dhtFast:__dhtFast,end:Math.min(__T,__LIMIT),err,net:__net,rows:__rows,samples:__samples,pulseCalls:__pulseCalls,flags:{insecure:!!__flags.insecure,gpsBegun:!!__flags.gpsBegun,rfidInit:!!__flags.rfidInit,spsStarted:!!__flags.spsStarted,reads:__flags.reads||0},wifiState:__wifi.state}); };`;
let simWorkerUrl = null;
function runBoard(code, board, scenario, simMs){ return new Promise(res => {
  if (!simWorkerUrl) simWorkerUrl = URL.createObjectURL(new Blob([SIM_WORKER], {type:"text/javascript"}));
  const tr = cppToJs(code, board), SB = SIM_BOARD[board];
  const plan = k => (PIN_PLAN[k] && PIN_PLAN[k][board] && PIN_PLAN[k][board].k) || {};
  const B = {ldr:plan("ldr").LDR_PIN, mq:plan("mq135").MQ_PIN, trig:plan("hcsr04").TRIG_PIN, button:scenario.button || ""};
  const w = new Worker(simWorkerUrl); const to = setTimeout(() => { w.terminate(); res({err:"TIMEOUT", ev:[], ser:[], end:0, maxDelay:0, net:[], rows:[], samples:[], flags:{}, js:tr.js}); }, 4000);
  w.onmessage = e => { clearTimeout(to); w.terminate(); res(Object.assign(e.data, {js:tr.js, notes:tr.notes})); };
  w.onerror = e => { clearTimeout(to); w.terminate(); res({err:e.message || "error", ev:[], ser:[], end:0, maxDelay:0, net:[], rows:[], samples:[], flags:{}, js:tr.js}); e.preventDefault(); };
  w.postMessage({js:tr.js, sim:simMs, adc:SB.adc, S:scenario, B}); }); }
function friendlyErr(err){
  if (err === "TIMEOUT") return "Your program got stuck in a loop that never waits or ends. Check while loops: does something inside eventually make the condition false, or is there a delay?";
  if (err === "NO_LOOP") return "There is no loop() function. Every Arduino sketch needs void setup() { } and void loop() { }.";
  let m = err.match(/(\w+) is not defined/);
  if (m){ const known = ["Serial","digitalWrite","pinMode","analogRead","delay","millis","dht","WiFi","http","gps","rfid","mfrc522","sensor","pulseIn"]; const near = known.find(k => k.toLowerCase() === m[1].toLowerCase());
    return `“${m[1]}” is not defined.` + (near ? ` Did you mean “${near}”? Capital letters matter.` : " Did you declare it (e.g., int x = 0;) before using it, and spell it the same way everywhere?"); }
  if (/is not a function/.test(err)) return `Something is being called like a function but isn't one (${err}). Check spelling, capital letters, and parentheses.`;
  if (/Unexpected token|Unexpected identifier|missing \)|Invalid or unexpected|Unexpected end/.test(err)) return `The sandbox could not read your code (${err}). Look for a missing semicolon, an unmatched bracket { } or parenthesis ( ), or a missing quote.`;
  if (/Assignment to constant/.test(err)) return "Your code changes a variable declared with const. Remove const if the value needs to change.";
  return "Your code stopped with an error: " + err;
}
