const fs=require('fs'); const code=fs.readFileSync(require('path').join(__dirname,'..','..','backend','Code.gs'),'utf8');
const book={}; const CACHE={}; const MAILS=[]; let MAILQ=100;
function mkSheet(name){ const d=[]; const S={_d:d,
  appendRow(r){ d.push(r.slice()); }, setFrozenRows(){}, getLastRow(){ return d.length; },
  getDataRange(){ return S.getRange(1,1,Math.max(1,d.length),Math.max(1,...d.map(r=>r.length))); },
  getRange(r,c,nr,nc){ if(typeof r==='string'){ const col=r.charCodeAt(0)-64; return S.getRange(1,col,Math.max(1,d.length),1); } nr=nr||1; nc=nc||1;
    const R={ getValue(){ return ((d[r-1]||[])[c-1]); }, setValue(v){ while(d.length<r) d.push([]); d[r-1][c-1]=v; return R; },
      getValues(){ const o=[]; for(let i=0;i<nr;i++){ const row=[]; for(let j=0;j<nc;j++) row.push(((d[r-1+i]||[])[c-1+j])??''); o.push(row);} return o; },
      setValues(v){ v.forEach((row,i)=>{ while(d.length<r+i) d.push([]); row.forEach((x,j)=>d[r-1+i][c-1+j]=x); }); return R; },
      createTextFinder(t){ let ent=false, mc=true; const F={ matchEntireCell(b){ent=b;return F;}, matchCase(b){mc=b;return F;},
        findAll(){ const out=[]; for(let i=0;i<nr;i++) for(let j=0;j<nc;j++){ const v=String(((d[r-1+i]||[])[c-1+j])??''); const a=mc?v:v.toLowerCase(), b=mc?t:t.toLowerCase(); if(ent? a===b : a.includes(b)) out.push({getRow:()=>r+i, getValue:()=>v}); } return out; },
        findNext(){ return F.findAll()[0]||null; } }; return F; } }; return R; } }; return S; }
const ss={ getId:()=>'SS1', getSheetByName:n=>book[n]||null, insertSheet:n=>(book[n]=mkSheet(n)) };
const props={ADMIN_PIN:'4321', ADMIN_EMAILS:'teacher@school.edu.ph', GEMINI_API_KEY:'AIzaFAKE', AI_DAILY_LIMIT:'2'};
let fetched=[];
const ctx={ SpreadsheetApp:{getActiveSpreadsheet:()=>ss, openById:()=>ss}, PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]??null, setProperty:(k,v)=>props[k]=v})},
 ContentService:{MimeType:{JSON:'json'}, createTextOutput:s=>({s, setMimeType(){return this;}})}, LockService:{getScriptLock:()=>({waitLock(){},tryLock(){return true;},releaseLock(){}})},
 MailApp:{getRemainingDailyQuota:()=>MAILQ, sendEmail:o=>{ if(process.env.MAIL_FAIL) throw new Error('Exception: You do not have permission to call MailApp.sendEmail. Required permissions: https://www.googleapis.com/auth/script.send_mail'); MAILS.push(o); MAILQ--; }},
 CacheService:{getScriptCache:()=>({get:k=>CACHE[k]??null, put:(k,v)=>{CACHE[k]=String(v);}, remove:k=>{delete CACHE[k];}})},
 Utilities:{DigestAlgorithm:{SHA_256:'sha256'}, Charset:{UTF_8:'utf8'}, computeDigest:(a,s)=>[...require('crypto').createHash('sha256').update(s,'utf8').digest()].map(b=>b>127?b-256:b), getUuid:()=>require('crypto').randomUUID(), formatDate:(d)=>d.toISOString().slice(0,10), base64Decode:s=>Buffer.from(s,'base64'), newBlob:(b,m,n)=>({b,m,n})},
 Session:{getScriptTimeZone:()=>'Asia/Manila'},
 UrlFetchApp:{fetch:(u,o)=>{ fetched.push([u,JSON.parse(o.payload)]); if(/gemini-flash-latest/.test(u)) return {getResponseCode:()=>503, getContentText:()=>'busy'}; return {getResponseCode:()=>200, getContentText:()=>JSON.stringify({candidates:[{content:{parts:[{text:'Use a divider because ECHO is 5 V.'}]}}]})}; }},
 DriveApp:{ createFolder:n=>({getId:()=>'ROOT', createFolder:m=>({getUrl:()=>'https://drive.google.com/drive/folders/F1', createFile:b=>({getUrl:()=>'https://drive/file/'+b.n})})}), getFolderById:id=>({createFolder:m=>({getUrl:()=>'https://drive.google.com/drive/folders/F1'}), createFile:b=>({getUrl:()=>'https://drive/file/'+b.n})}) },
 console };
const http=require('http');
const api=new Function(...Object.keys(ctx), code+';return {doPost,doGet,setup};')(...Object.values(ctx)); api.setup();
props.ADMIN_EMAILS='tina@example.com,boss@example.com';
const html=fs.readFileSync(require('path').join(__dirname,'..','..','dist','index.html'),'utf8').replace('API_URL: "",', 'API_URL: "/exec",').split('const apiReady = () => /^https:\\/\\/script\\.google\\.com\\//.test(CONFIG.API_URL);').join('const apiReady = () => true;');
http.createServer((req,res)=>{
  if(req.url.startsWith('/exec') && req.method==='POST'){ let b=''; req.on('data',c=>b+=c); req.on('end',()=>{ const o=api.doPost({postData:{contents:b}}); res.setHeader('Content-Type','application/json'); res.end(o.s); }); return; }
  if(req.url.startsWith('/exec?')){ const q=Object.fromEntries(new URL('http://x'+req.url).searchParams); const o=api.doGet({parameter:q}); res.end(o.s); return; }
  if(req.url==='/lastcode'){ const m=MAILS[MAILS.length-1]; res.end(JSON.stringify({to:m&&m.to, code:m&&(m.subject.match(/(\d{6})/)||[])[1], n:MAILS.length})); return; }
  if(req.url.startsWith('/raw')){ let b=''; req.on('data',c=>b+=c); req.on('end',()=>{ const o=api.doPost({postData:{contents:b}}); res.end(o.s); }); return; }
  if(req.url==='/dump'){ res.end(JSON.stringify({Learners:book.Learners._d, Progress:book.Progress._d, Uploads:book.Uploads._d, AI:book.AI._d.length, Events:book.Events._d.length, Access:book.Access._d.length, AILog:book.AILog._d.length, Feedback:(book.Feedback||{_d:[]})._d, Sessions:(book.Sessions||{_d:[]})._d, Errors:(book.Errors||{_d:[]})._d, Learners:book.Learners._d})); return; }
  res.setHeader('Content-Type','text/html'); res.end(html);
}).listen(8850, ()=>console.log('up', html.includes('const apiReady = () => true;')));
