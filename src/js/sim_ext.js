/* ============ SIMULATOR EXTENSIONS: PWM, tone, Servo, PIR, TMP36, DC motor, and virtual cloud services ============
   Adds to the worker in sim.js: Servo, analogWrite duty, tone frequency, a PIR with hold time, TMP36 on an analog pin,
   ThingSpeak, Firebase Realtime Database (REST), AWS (API Gateway and MQTT), and Blynk. */
Object.assign(OBJ_T, {Servo:"__SERVO", PubSubClient:"__PUBSUB", BlynkTimer:"__BTIMER", X509List:"__X509", PrivateKey:"__PKEY", WiFiClientSecure:"__CLIENT", WiFiSSLClient:"__SSL"});
const SIM_EXT = String.raw`
let __ext=[],__cloud={ts:[],fb:{},fbLog:[],mqtt:[],ddb:[],blynk:{},blynkLog:[],tsLast:undefined,fbN:0,tok:{}},__lastDuty={},__lastTone={};
const __clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const V0=0,V1=1,V2=2,V3=3,V4=4,V5=5,V6=6,V7=7,V8=8,V9=9,V10=10,V11=11,V12=12,V13=13,V14=14,V15=15;
const BLYNK_PRINT=Serial;
function __pwm(pin,duty){ pin=String(pin); if(__lastDuty[pin]===duty) return; __lastDuty[pin]=duty; if(__ext.length<6000) __ext.push({t:__T,kind:"pwm",pin,duty}); }
let __pwmBits=8,__chan={},__ledcRes={};
analogWrite=function(p,v){ const m=Math.pow(2,__pwmBits)-1; v=Math.round(__clamp(Number(v)||0,0,m)*255/m); __pwm(p,v); __emitPin(p,v>0?1:0); };
function analogWriteResolution(b){ __pwmBits=b; } function analogWriteFrequency(){} function analogWriteRange(r){ __pwmBits=Math.round(Math.log2(r+1)); }
function ledcSetup(ch,f,res){ __ledcRes[ch]=res; return f; } function ledcAttachPin(pin,ch){ __chan[ch]=String(pin); } function ledcAttach(pin,f,res){ __ledcRes[String(pin)]=res; return true; }
function ledcWrite(x,d){ const key=String(x); const pin=__chan[key]!==undefined?__chan[key]:key; const res=__ledcRes[key]||8; const m=Math.pow(2,res)-1; const v=Math.round(__clamp(Number(d)||0,0,m)*255/m); __pwm(pin,v); __emitPin(pin,v>0?1:0); }
const __dwX=digitalWrite; digitalWrite=function(p,v){ __pwm(p,v?255:0); __dwX(p,v); };
tone=function(p,f,d){ p=String(p); f=Number(f)||0; __lastTone[p]=f; if(__ext.length<6000) __ext.push({t:__T,kind:"tone",pin:p,f}); __emitPin(p,1); if(d) __flags.toneOff=[p,__T+d]; };
noTone=function(p){ p=String(p); if(__lastTone[p]){ __lastTone[p]=0; if(__ext.length<6000) __ext.push({t:__T,kind:"tone",pin:p,f:0}); } __emitPin(p,0); };
/* sensors */
const __drX=digitalRead; digitalRead=function(p){ p=String(p);
  if(__B.pir && p===String(__B.pir)){ const c=__S.pir||{}; const warm=c.warm||0; if(__T<warm) return Math.random()<0.35?1:0; const hold=c.hold==null?3000:c.hold; let on=0; (c.steps||[]).forEach(s=>{ if(s[2]===1 && __T>=s[0] && __T<s[1]+hold) on=1; }); return on; }
  if(__B.button && p===String(__B.button)){ const dn=__val(__S.press?"press":"button",__T)>0.5; return __S.btnHigh?(dn?HIGH:LOW):(dn?LOW:HIGH); }
  return __drX(p); };
const __arX=analogRead; analogRead=function(p){ p=String(p);
  if(__B.tmp && p===String(__B.tmp)){ const volts=0.5+__val("temp",__T)/100+(Math.random()-0.5)*0.004; const ref=__B.vref||3.3; return __clamp(Math.round(volts/ref*__adcMax),0,__adcMax); }
  if(__B.pot && p===String(__B.pot)) return __clamp(Math.round(__val("pot",__T)/100*__adcMax),0,__adcMax);
  return __arX(p); };
function __SERVO(){ let pin=null,ang=null; const o={ attach(p){ pin=String(p); if(__ext.length<6000) __ext.push({t:__T,kind:"servo_attach",pin}); return 1; }, detach(){ pin=null; },
  write(a){ a=__clamp(Number(a)||0,0,180); ang=a; if(pin===null){ __flags.servoNoAttach=true; return; } if(__ext.length<6000) __ext.push({t:__T,kind:"servo",pin,angle:Math.round(a)}); },
  writeMicroseconds(us){ o.write((us-544)/(2400-544)*180); }, read(){ return ang==null?90:Math.round(ang); }, attached(){ return pin!==null; } }; return o; }
/* hostnames -> virtual cloud */
function __parseUrl(url){ const m=String(url).match(/^https?:\/\/([^\/?#]+)(\/[^?#]*)?(?:\?([^#]*))?/); if(!m) return null; const P={}; (m[3]||"").split("&").filter(Boolean).forEach(kv=>{ const i=kv.indexOf("="); const k=decodeURIComponent(i<0?kv:kv.slice(0,i)); P[k]=i<0?"":decodeURIComponent(kv.slice(i+1).replace(/\+/g," ")); }); return {host:m[1].toLowerCase(), path:m[2]||"/", P}; }
function __ts(method,u,body){ const cfg=__S.ts||{}; const key=cfg.writeKey||"TS_WRITE_KEY"; const P=Object.assign({},u.P); if(body) String(body).split("&").forEach(kv=>{ const i=kv.indexOf("="); if(i>0) P[decodeURIComponent(kv.slice(0,i))]=decodeURIComponent(kv.slice(i+1).replace(/\+/g," ")); });
  if(u.path!=="/update" && u.path!=="/update.json") return {code:404,body:"Not Found"};
  if(P.api_key!==key) return {code:404,body:"-1"};
  if(__cloud.tsLast!==undefined && __T-__cloud.tsLast<15000) return {code:200,body:"0"};
  const f={}; for(let i=1;i<=8;i++){ const v=P["field"+i]; if(v!==undefined&&v!=="") f[i]=v; } if(!Object.keys(f).length) return {code:200,body:"0"};
  __cloud.tsLast=__T; const id=__cloud.ts.length+1; __cloud.ts.push({id,t:__T,f,status:P.status||""}); return {code:200,body:String(id)}; }
function __fbGet(parts){ let n=__cloud.fb; for(const k of parts){ if(n==null||typeof n!=="object") return null; n=n[k]; } return n===undefined?null:n; }
function __fb(method,u,body,hdr){ const cfg=__S.fb||{}; const fail=(code,msg)=>({code,body:JSON.stringify({error:msg})});
  if(cfg.host && u.host!==cfg.host) return {code:404,body:"The requested URL was not found on this server."};
  if(!/\.json$/.test(u.path)) return {code:404,body:"The requested URL was not found on this server."};
  const mode=cfg.rules||"open";
  if(mode==="locked") return fail(401,"Permission denied");
  if(mode==="auth"){ const t=u.P.auth; if(!t) return fail(401,"Permission denied"); const tk=__cloud.tok[t]; if(!tk) return fail(401,"Auth token is not valid"); if(__T>tk.exp) return fail(401,"Auth token is expired"); }
  const parts=u.path.replace(/\.json$/,"").split("/").filter(Boolean);
  let val; if(method==="PUT"||method==="POST"||method==="PATCH"){ try { val=JSON.parse(body); } catch(e){ return fail(400,"Invalid data; couldn't parse JSON object, array, or value."); } }
  const setAt=(ps,v)=>{ if(!ps.length){ __cloud.fb=(v&&typeof v==="object")?v:{}; return; } let n=__cloud.fb; for(let i=0;i<ps.length-1;i++){ if(n[ps[i]]==null||typeof n[ps[i]]!=="object") n[ps[i]]={}; n=n[ps[i]]; } if(v===null) delete n[ps[ps.length-1]]; else n[ps[ps.length-1]]=v; };
  let out;
  if(method==="GET"){ const v=__fbGet(parts); out=JSON.stringify(v); }
  else if(method==="PUT"){ setAt(parts,val); out=JSON.stringify(val); }
  else if(method==="POST"){ const id="-N"+(1000+(++__cloud.fbN)).toString(36).toUpperCase()+"x"; setAt(parts.concat([id]),val); out=JSON.stringify({name:id}); }
  else if(method==="PATCH"){ const cur=__fbGet(parts); const merged=Object.assign({},(cur&&typeof cur==="object")?cur:{},val); setAt(parts,merged); out=JSON.stringify(val); }
  else if(method==="DELETE"){ setAt(parts,null); out="null"; }
  else return fail(405,"Method not allowed");
  __cloud.fbLog.push({t:__T,method,path:u.path,code:200}); return {code:200,body:out}; }
function __identity(method,u,body){ const cfg=(__S.fb||{}).device||{email:"device@school.edu",password:"device-pass"}; let b={}; try{ b=JSON.parse(body); }catch(e){}
  if(!/accounts:signInWithPassword$/.test(u.path)) return {code:404,body:"Not Found"};
  if(b.email!==cfg.email||b.password!==cfg.password) return {code:400,body:JSON.stringify({error:{code:400,message:"INVALID_LOGIN_CREDENTIALS"}})};
  const tok="ID_TOKEN_"+(Object.keys(__cloud.tok).length+1); __cloud.tok[tok]={exp:__T+3600000}; return {code:200,body:JSON.stringify({idToken:tok,expiresIn:"3600",email:b.email})}; }
function __apigw(method,u,body,hdr){ const cfg=__S.aws||{}; if(method!=="POST") return {code:403,body:JSON.stringify({message:"Missing Authentication Token"})};
  if((hdr["x-api-key"]||"")!==(cfg.apiKey||"API_GW_KEY")) return {code:403,body:JSON.stringify({message:"Forbidden"})};
  let b; try{ b=JSON.parse(body); }catch(e){ return {code:400,body:JSON.stringify({message:"Invalid JSON"})}; }
  __cloud.ddb.push(Object.assign({t:__T},b)); return {code:200,body:JSON.stringify({ok:true,stored:Object.keys(b).length})}; }
function __hostRoute(method,url,body,hdr){ const u=__parseUrl(url); if(!u) return null; hdr=hdr||{};
  if(u.host==="api.thingspeak.com") return __ts(method,u,body);
  if(/\.(firebaseio\.com|firebasedatabase\.app)$/.test(u.host)) return __fb(method,u,body,hdr);
  if(u.host==="identitytoolkit.googleapis.com") return __identity(method,u,body);
  if(/^[a-z0-9]+\.execute-api\.[a-z0-9-]+\.amazonaws\.com$/.test(u.host)) return __apigw(method,u,body,hdr);
  return null; }
__request=function(method,url,body,hdr){ __adv(350+Math.random()*250); if(!__online()){ __net.push({t:__T,dir:"err",text:method+" failed: not connected to Wi-Fi"}); return {code:-1,body:""}; }
  const r=__hostRoute(method,url,body,hdr)||__server(url); __net.push({t:__T,dir:"out",text:method+" "+url+(body?"   body: "+String(body).slice(0,160):"")}); __net.push({t:__T,dir:"in",text:"HTTP "+r.code+"  "+String(r.body).slice(0,200)}); return r; };
__HTTP=function(){ let url="",resp={code:0,body:""},follow=false,hdr={}; const go=(m,b)=>{ resp=__request(m,url,b==null?"":String(b),hdr); return resp.code; };
  return { begin(a,b){ url=String(b!==undefined?b:a); hdr={}; return true; }, setFollowRedirects(m){ follow=m>0; }, setTimeout(){}, addHeader(k,v){ hdr[String(k).toLowerCase()]=String(v); }, setReuse(){}, setAuthorization(){},
  GET(){ const r=__request("GET",url,"",hdr); if(r.code===200 && !follow && /script\.google\.com/.test(url)){ resp={code:302,body:"<HTML>Moved Temporarily</HTML>"}; __net.push({t:__T,dir:"in",text:"(302 redirect not followed: the row was still saved)"}); return 302; } resp=r; return r.code; },
  POST(b){ return go("POST",b); }, PUT(b){ return go("PUT",b); }, PATCH(b){ return go("PATCH",b); }, sendRequest(m,b){ return go(String(m),b); }, getString(){ return resp.body; }, getSize(){ return resp.body.length; }, end(){}, errorToString(c){ return c===-1?"connection refused":"error "+c; } }; };
__CLIENT=function(){ const c={}; return {__certs:c, setInsecure(){ __flags.insecure=true; c.insecure=true; }, setCACert(){ c.ca=true; }, setCertificate(){ c.crt=true; }, setPrivateKey(){ c.key=true; }, setTrustAnchors(){ c.ca=true; }, setClientRSACert(){ c.crt=true; c.key=true; }, setBufferSizes(){}, setTimeout(){}, stop(){}, connected(){ return false; }, connect(){ return __online(); }}; };
function __X509(){ return {}; } function __PKEY(){ return {}; }
__SSL=function(){ let rx="",host="",buf=""; const dispatch=(raw)=>{ const hi=raw.indexOf("\r\n\r\n"); if(hi<0) return false; const head=raw.slice(0,hi); const body=hi<0?"":raw.slice(hi+4); const m=head.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(\S+)\s+HTTP/); if(!m) return false; const hdr={}; head.split("\r\n").slice(1).forEach(l=>{ const i=l.indexOf(":"); if(i>0) hdr[l.slice(0,i).trim().toLowerCase()]=l.slice(i+1).trim(); });
    const need=+(hdr["content-length"]||0); if(body.length<need) return false; const url="https://"+host+m[2];
    if(host==="script.google.com"){ const r=__request(m[1],url,body,hdr); if(r.code===200){ const loc="https://script.googleusercontent.com/macros/echo?user_content_key=demo&b="+encodeURIComponent(r.body); rx="HTTP/1.1 302 Moved Temporarily\r\nContent-Type: text/html\r\nLocation: "+loc+"\r\n\r\n<HTML>Moved</HTML>"; } else rx="HTTP/1.1 "+r.code+" Error\r\n\r\n"; return true; }
    if(host==="script.googleusercontent.com"){ const b=decodeURIComponent((m[2].match(/[?&]b=([^&]*)/)||[])[1]||""); __net.push({t:__T,dir:"in",text:"HTTP 200  "+b+"  (after following the redirect)"}); rx="HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\n"+b; return true; }
    const r=__request(m[1],url,body,hdr); rx="HTTP/1.1 "+r.code+" "+(r.code===200?"OK":"Error")+"\r\nContent-Type: application/json\r\nContent-Length: "+String(r.body).length+"\r\n\r\n"+r.body; return true; };
  const feed=s=>{ buf+=String(s); if(dispatch(buf)) buf=""; };
  return { setTimeout(){}, setInsecure(){ __flags.insecure=true; }, connect(h,port){ __adv(300); if(!__online()){ __net.push({t:__T,dir:"err",text:"connect("+h+") failed: no Wi-Fi"}); return 0; } host=String(h); buf=""; return 1; },
  print(s){ feed(s); return String(s).length; }, println(s){ feed((s===undefined?"":s)+"\r\n"); }, write(s){ feed(typeof s==="number"?String.fromCharCode(s):s); }, flush(){},
  available(){ return rx.length; }, connected(){ return rx.length>0; }, read(){ if(!rx.length) return -1; const c=rx[0]; rx=rx.slice(1); return c; },
  readStringUntil(ch){ const i=rx.indexOf(ch); let out; if(i<0){ out=rx; rx=""; } else { out=rx.slice(0,i); rx=rx.slice(i+1); } return out; }, readString(){ const o=rx; rx=""; return o; }, stop(){ rx=""; } }; };
/* ThingSpeak library */
const ThingSpeak=(function(){ let fields={},status="",last=0; const send=(P)=>{ if(!__online()) return -301; const q=Object.keys(P).map(k=>k+"="+encodeURIComponent(P[k])).join("&"); const r=__request("GET","https://api.thingspeak.com/update?"+q,"",{}); if(r.code!==200) return r.code; if(r.body==="0") return -401; return 200; };
  return { begin(c){ return true; }, setField(n,v){ n=__int(n); if(n<1||n>8) return -201; fields[n]=String(v instanceof Number?v.valueOf():v); return 200; }, setStatus(s){ status=String(s); return 200; },
    writeFields(ch,key){ if(!Object.keys(fields).length) return -210; const P={api_key:key}; Object.keys(fields).forEach(n=>P["field"+n]=fields[n]); if(status) P.status=status; const r=send(P); fields={}; status=""; last=r; return r; },
    writeField(ch,n,v,key){ const P={api_key:key}; P["field"+n]=String(v); last=send(P); return last; },
    readFloatField(ch,n,key){ const e=__cloud.ts[__cloud.ts.length-1]; if(!e||e.f[n]===undefined) return new Number(0); return new Number(parseFloat(e.f[n])); }, getLastReadStatus(){ return last; } }; })();
/* PubSubClient + AWS IoT Core */
function __PUBSUB(cl){ let server="",port=1883,cb=null,conn=false,state=-1,buf=256,lastLoop=0,delivered={}; const subs=[]; const aws=()=>__S.aws||{};
  const log=(dir,text)=>__net.push({t:__T,dir,text});
  const o={ setServer(h,p){ server=String(h); port=+p||1883; return o; }, setCallback(f){ cb=f; return o; }, setBufferSize(n){ buf=+n; return true; }, setKeepAlive(){ return o; }, setSocketTimeout(){ return o; },
  connect(id){ __adv(500); conn=false; if(!__online()){ state=-2; log("err","MQTT connect failed: no Wi-Fi"); return false; }
    if(!/^[a-z0-9]+-ats\.iot\.[a-z0-9-]+\.amazonaws\.com$/.test(server)){ state=-2; log("err","MQTT: could not reach \""+server+"\". Copy the Device data endpoint from AWS IoT Core > Settings."); return false; }
    if(port!==8883){ state=-2; log("err","AWS IoT only accepts MQTT over TLS on port 8883 (you used "+port+")."); return false; }
    const c=(cl&&cl.__certs)||{}; if(!(c.ca&&c.crt&&c.key)){ state=-2; log("err","TLS handshake failed: AWS IoT needs the Amazon root CA, the device certificate, and the private key (setInsecure() is not enough)."); return false; }
    const a=aws(); if(a.clientId && String(id)!==a.clientId){ state=5; log("err","Connection refused: the IoT policy does not allow client ID \""+id+"\"."); return false; }
    conn=true; state=0; lastLoop=__T; log("wifi","MQTT connected to AWS IoT Core as \""+id+"\""); return true; },
  connected(){ return conn; }, state(){ return state; }, disconnect(){ conn=false; state=-1; },
  publish(topic,payload){ topic=String(topic); payload=String(payload); if(!conn) return false; if(buf<5+2+topic.length+payload.length){ log("err","publish() returned false: the message ("+(topic.length+payload.length+7)+" bytes) is bigger than the MQTT buffer ("+buf+"). Call setBufferSize()."); return false; }
    const pre=aws().topicPrefix==null?"sss/":aws().topicPrefix; if(pre && topic.indexOf(pre)!==0){ conn=false; state=-3; log("err","AWS closed the connection: the IoT policy only allows topics starting with \""+pre+"\" (you published to \""+topic+"\")."); return true; }
    __cloud.mqtt.push({t:__T,topic,payload,dir:"in"}); log("out","PUBLISH "+topic+"  "+payload.slice(0,150));
    if(aws().rule){ try{ const j=JSON.parse(payload); __cloud.ddb.push(Object.assign({t:__T,topic},j)); }catch(e){ log("err","IoT rule: payload is not valid JSON, so nothing was written to DynamoDB."); } }
    return true; },
  subscribe(topic){ if(!conn) return false; subs.push(String(topic)); log("out","SUBSCRIBE "+topic); return true; },
  loop(){ if(!conn) return false; if(__T-lastLoop>22000){ conn=false; state=-3; log("err","MQTT connection lost: loop() was not called often enough (keep-alive timeout)."); return false; } lastLoop=__T;
    (aws().inbound||[]).forEach((m,i)=>{ if(!delivered[i] && m[0]<=__T && subs.some(s=>s===m[1]||s==="#")){ delivered[i]=true; __cloud.mqtt.push({t:__T,topic:m[1],payload:m[2],dir:"out"}); log("in","MESSAGE "+m[1]+"  "+m[2]); if(cb) cb(m[1], String(m[2]).split(""), String(m[2]).length); } }); return true; } }; return o; }
/* Blynk */
function __BTIMER(){ const T=[]; return { setInterval(ms,fn){ T.push({ms:Number(ms)||1000,fn,next:__T+(Number(ms)||1000)}); return T.length; }, setTimeout(ms,fn){ T.push({ms:Number(ms)||1000,fn,next:__T+(Number(ms)||1000),once:true}); return T.length; },
  run(){ T.forEach(t=>{ if(t.fn && __T>=t.next){ t.next=__T+t.ms; if(t.once) t.fn=null; if(typeof t.fn==="function") t.fn(); } }); } }; }
const Blynk=(function(){ let ok=false,delivered={},lastRun=0,started=false; const bl=(dir,text)=>__net.push({t:__T,dir,text});
  const mkParam=v=>({ asInt(){ return __int(v); }, asLong(){ return __int(v); }, asFloat(){ return new Number(parseFloat(v)||0); }, asDouble(){ return new Number(parseFloat(v)||0); }, asString(){ return String(v); }, asStr(){ return String(v); } });
  const o={ begin(auth,ssid,pass){ if(!(__flags.blynkDef&&__flags.blynkDef[0]&&__flags.blynkDef[1])) throw new Error("BLYNK_TEMPLATE_ID and BLYNK_TEMPLATE_NAME must be defined (with #define) above the #include lines. Copy them from Blynk.Console > Device > Firmware configuration."); started=true; WiFi.begin(ssid,pass);
      const a=__S.blynk||{}; let n=0; while(WiFi.status()!==WL_CONNECTED){ __adv(500); if(++n>40) throw new Done(); }
      if(String(auth)!==(a.auth||"SSS_BLYNK_TOKEN")){ bl("err","Blynk: invalid auth token. The device keeps retrying; check BLYNK_AUTH_TOKEN."); for(let i=0;i<60;i++) __adv(1000); throw new Done(); }
      __adv(600); ok=true; bl("wifi","Connected to Blynk.Cloud"); if(typeof __BLYNK_CONNECTED==="function") __BLYNK_CONNECTED(); },
    config(){ started=true; }, connect(){ return true; }, connected(){ return ok; }, disconnect(){ ok=false; },
    run(){ if(!started||!ok) return; lastRun=__T; const a=__S.blynk||{}; (a.events||[]).forEach((e,i)=>{ if(!delivered[i] && e[0]<=__T){ delivered[i]=true; const fn=globalThis["__BW_V"+e[1]]; bl("in","App sent V"+e[1]+" = "+e[2]); __cloud.blynk["V"+e[1]]={v:e[2],t:__T,from:"app"}; if(typeof fn==="function") fn(mkParam(e[2])); else bl("err","No BLYNK_WRITE(V"+e[1]+") handler, so the sketch ignored the app."); } }); },
    virtualWrite(pin,val){ if(!ok){ return; } const v=(val instanceof Number)?val.valueOf():val; __cloud.blynk["V"+pin]={v,t:__T,from:"device"}; __cloud.blynkLog.push({t:__T,pin:"V"+pin,v}); if(__cloud.blynkLog.length>200) __cloud.blynkLog.shift(); bl("out","virtualWrite V"+pin+" = "+(typeof v==="number"?+v.toFixed(2):v)); },
    syncVirtual(){}, logEvent(n){ bl("out","logEvent "+n); }, notify(){}, setProperty(){} }; return o; })();
`;
SIM_WORKER = SIM_WORKER.replace("onmessage=e=>", SIM_EXT + "\nonmessage=e=>").replace("net:__net,", "net:__net,ext:__ext,cloud:__cloud,").replace("flags:{insecure:", "flags:{servoNoAttach:!!__flags.servoNoAttach,insecure:").replace("__emitPin(__flags.toneOff[0],0);", "__emitPin(__flags.toneOff[0],0); if(__ext.length<6000) __ext.push({t:__T,kind:'tone',pin:__flags.toneOff[0],f:0}); __lastTone[__flags.toneOff[0]]=0;");
/* translator wrapper: library macros and C++ spellings the base translator does not know */
const _cppToJs0 = cppToJs;
cppToJs = function(src, board){
  src = src.replace(/R"(\w*)\(([\s\S]*?)\)\1"/g, (m, d, body) => JSON.stringify(body))
    .replace(/BLYNK_WRITE\(\s*V(\d+)\s*\)/g, "void __BW_V$1(param)").replace(/BLYNK_CONNECTED\(\s*\)/g, "void __BLYNK_CONNECTED()")
    .replace(/\bBearSSL::/g, "").replace(/\bPROGMEM\b/g, "")
    .replace(/\b(?:const\s+)?char\s+(\w+)\s*\[\s*\]\s*=\s*/g, "const char* $1 = ")
    .replace(/\bX509List\s+(\w+)\s*\(([^)]*)\)\s*;/g, "X509List $1;").replace(/\bPrivateKey\s+(\w+)\s*\(([^)]*)\)\s*;/g, "PrivateKey $1;")
    .replace(/\bHttpClient\b/g, "HttpClient_");
  const r = _cppToJs0(src, board);
  r.js = r.js.replace(/\bfunction __BW_V(\d+)\(param\)/g, "function __BW_V$1(param)").replace(/(^|\n)(\s*)function __BW_V(\d+)/g, "$1$2globalThis.__BW_V$3 = function __BW_V$3");
  r.js += "\n__flags.blynkDef=[typeof BLYNK_TEMPLATE_ID!==\"undefined\",typeof BLYNK_TEMPLATE_NAME!==\"undefined\"];\n";
  return r;
};
/* run the board: every part in scenario.parts gets its pins from the master pin plan */
runBoard = function(code, board, scenario, simMs){ return new Promise(res => {
  if (!simWorkerUrl) simWorkerUrl = URL.createObjectURL(new Blob([SIM_WORKER], {type:"text/javascript"}));
  const tr = cppToJs(code, board), SB = SIM_BOARD[board];
  const kk = (part, name) => (PIN_PLAN[part] && PIN_PLAN[part][board] && PIN_PLAN[part][board].k && PIN_PLAN[part][board].k[name]) || "";
  const parts = scenario.parts || ["ldr", "mq", "tmp36", "button", "pir", "hcsr04"]; const B = {button:scenario.button || "", vref:BOARDS[board].logic};
  const claimed = new Set(); const claim = (role, pin) => { if (pin && !claimed.has(String(pin))){ B[role] = pin; claimed.add(String(pin)); } };
  parts.forEach(p => { if (p === "ldr") claim("ldr", kk("ldr", "LDR_PIN")); if (p === "mq") claim("mq", kk("mq", "MQ_PIN")); if (p === "tmp36") claim("tmp", kk("tmp36", "TMP_PIN")); if (p === "pir") claim("pir", kk("pir", "PIR_PIN")); if (p === "hcsr04") B.trig = kk("hcsr04", "TRIG_PIN"); if (p === "button" && !scenario.button) B.button = kk("button", "BTN_PIN"); if (p === "pot") claim("pot", kk("pot", "POT_PIN")); });
  const w = new Worker(simWorkerUrl); const to = setTimeout(() => { w.terminate(); res({err:"TIMEOUT", ev:[], ser:[], end:0, maxDelay:0, net:[], rows:[], samples:[], ext:[], cloud:{}, flags:{}, js:tr.js}); }, 5000);
  w.onmessage = e => { clearTimeout(to); w.terminate(); res(Object.assign({ext:[], cloud:{}}, e.data, {js:tr.js, notes:tr.notes})); };
  w.onerror = e => { clearTimeout(to); w.terminate(); res({err:e.message || "error", ev:[], ser:[], end:0, maxDelay:0, net:[], rows:[], samples:[], ext:[], cloud:{}, flags:{}, js:tr.js}); e.preventDefault(); };
  w.postMessage({js:tr.js, sim:simMs, adc:SB.adc, S:scenario, B}); }); };
/* helpers for scenes and checkers */
const extOf = (r, kind, pin) => (r.ext || []).filter(e => e.kind === kind && (pin == null || e.pin === String(pin)));
function dutyAt(r, pin, t){ let d = 0; extOf(r, "pwm", pin).forEach(e => { if (e.t <= t) d = e.duty; }); return d; }
function toneAt(r, pin, t){ let f = 0; extOf(r, "tone", pin).forEach(e => { if (e.t <= t) f = e.f; }); return f; }
function servoAt(r, pin, t){ let a = null; extOf(r, "servo", pin).forEach(e => { if (e.t <= t) a = e.angle; }); return a; }
