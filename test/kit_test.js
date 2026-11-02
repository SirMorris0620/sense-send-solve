const DS=require(require('path').join(__dirname,'..','src','js','ds_kit.js'));
let fail=0; const ok=(n,c,info)=>{ if(!c){fail++; console.log('FAIL',n,info)} else console.log('ok  ',n,info===undefined?'':info) };
const near=(a,b,t=1e-6)=>Math.abs(a-b)<=t;
// descriptive: known values
const a=[2,4,4,4,5,5,7,9];
ok('mean',near(DS.mean(a),5)); ok('sample sd',near(DS.sd(a),2.138089935,1e-6),DS.sd(a)); ok('median',DS.median(a)===4.5); ok('quantile q1 (pandas)',near(DS.quantile(a,.25),4),DS.quantile(a,.25));
ok('MAD',DS.mad([1,1,2,2,4,6,9])===1,DS.mad([1,1,2,2,4,6,9]));
// pearson / spearman known
ok('pearson',near(DS.pearson([1,2,3,4,5],[2,4,5,4,5]),0.7745966692,1e-9),DS.pearson([1,2,3,4,5],[2,4,5,4,5]));
ok('spearman monotone',near(DS.spearman([1,2,3,4,5],[1,4,9,16,25]),1));
ok('rank ties',JSON.stringify(DS.rank([10,20,20,30]))==='[1,2.5,2.5,4]');
// heat index NWS table: 90F/70% ~ 106, 80F/40% ~ 80, 96F/50% ~ 108
ok('HI 90F 70%',near(DS.heatIndexF(90,70),105.9,0.5),DS.heatIndexF(90,70)); ok('HI 80F 40%',near(DS.heatIndexF(80,40),80,0.6),DS.heatIndexF(80,40)); ok('HI 96F 50%',near(DS.heatIndexF(96,50),108,1),DS.heatIndexF(96,50));
// dew point: 25C 60% -> 16.7C ; 30C 70% -> 23.9C
ok('dew 25C 60%',near(DS.dewPointC(25,60),16.7,0.1),DS.dewPointC(25,60)); ok('dew 30C 70%',near(DS.dewPointC(30,70),23.9,0.1),DS.dewPointC(30,70));
// interpolation
ok('lerp',JSON.stringify(DS.lerpFill([1,NaN,NaN,4]))==='[1,2,3,4]'); ok('locf',JSON.stringify(DS.locf([1,NaN,NaN,4]))==='[1,1,1,4]');
// poly fit exact
const x=[0,1,2,3,4,5],y=x.map(v=>2+3*v-0.5*v*v); const pf=DS.polyfit(x,y,2); ok('polyfit exact',near(pf.pred(6),2+18-18,1e-6)&&pf.r2>0.999999,pf.pred(6));
const lf=DS.linfit([1,2,3,4],[3,5,7,9]); ok('linfit',near(lf.a,1)&&near(lf.b,2)&&near(lf.r2,1));
// ols multiple
const X=[[1,2],[2,1],[3,5],[4,3],[5,8]], yy=X.map(r=>1+2*r[0]-1*r[1]); const co=DS.ols(X,yy); ok('ols',near(co[0],1,1e-6)&&near(co[1],2,1e-6)&&near(co[2],-1,1e-6),co);
// log-log: ppm=100*r^-2
const rr=[0.5,1,2,4],pp=rr.map(v=>100*v**-2); const ll=DS.loglogFit(rr,pp); ok('loglog',near(ll.a,100,1e-6)&&near(ll.b,-2,1e-9),[ll.a,ll.b]);
// hampel on classic example
const so=[10,11,500,12,11,10,12]; const h=DS.hampel(so,3,3); ok('hampel flags 500',JSON.stringify(h.out)==='[2]'&&h.rep[2]===11,JSON.stringify(h.out)+' '+h.rep[2]);
// markov
const mk=DS.markov2([0,0,1,1,0,0,0,1]); ok('markov counts',JSON.stringify(mk.counts)==='[[3,2],[1,1]]',JSON.stringify(mk.counts)); ok('stationary sums',near(mk.stationary[0]+mk.stationary[1],1));
// chi-square: textbook 2x2 [[20,30],[30,20]] -> chi2=4.0, p=0.0455, df=1
const cs=DS.chiSquare([[20,30],[30,20]]); ok('chi2 stat',near(cs.stat,4,1e-9),cs.stat); ok('chi2 p',near(cs.p,0.0455,0.0003),cs.p);
ok('chi2 crit 3.841',near(DS.chi2p(3.841,1),0.05,0.0005),DS.chi2p(3.841,1)); ok('chi2 df4 9.488',near(DS.chi2p(9.488,4),0.05,0.0005),DS.chi2p(9.488,4));
// kaplan-meier textbook
const km=DS.km([6,6,6,7,10,13,16,22,23],[1,1,1,1,1,1,1,1,1]); ok('km first S',near(km[0].S,1-3/9,1e-9)&&km[0].atRisk===9,km[0]);
const km2=DS.km([3,5,5,8,10],[1,1,0,1,0]); ok('km censored',near(km2[0].S,0.8)&&near(km2[1].S,0.8*(1-1/4))&&near(km2[2].S,0.6*(1-1/2)),km2.map(r=>r.S.toFixed(3)).join(','));
// isolation forest: outlier should score higher than inliers
const r=DS.rng(5), dat=Array.from({length:200},()=>50+DS.normal(r)*2); const f=DS.isoForest(dat,100,64,DS.rng(7)); ok('iso outlier higher',f.score(80)>0.6&&f.score(50)<0.5,[f.score(80).toFixed(3),f.score(50).toFixed(3)]);
ok('c(256)',near(DS.cn(256),10.2448,0.01),DS.cn(256));
// logistic
const xs=[-2,-1,-0.5,0.5,1,2], ys=[0,0,0,1,1,1], st=DS.logisticInit(); for(let i=0;i<2000;i++)DS.logisticStep(st,xs,ys,0.5); ok('logistic separates',DS.sigmoid(st.w*1.5+st.b)>0.9&&DS.sigmoid(st.w*-1.5+st.b)<0.1,[st.w,st.b]);
const cf=DS.confusion([1,1,0,0,1,0],[1,0,0,1,1,0]); ok('confusion',cf.tp===2&&cf.fn===1&&cf.fp===1&&cf.tn===2&&near(cf.acc,4/6)&&near(cf.f1,2/3),cf);
// decomposition recovers a pure seasonal+trend series
const n=96, ser=Array.from({length:n},(_,i)=>10+0.05*i+3*Math.sin(2*Math.PI*i/24)); const dc=DS.decompose(ser,24); const mid=dc.resid.filter(v=>!Number.isNaN(v)); ok('decompose resid small',Math.max(...mid.map(Math.abs))<0.2,Math.max(...mid.map(Math.abs)));
// trees / forest learn y = 2*x0 + x1^2
const rg=DS.rng(11), Xs=Array.from({length:300},()=>[rg()*4,rg()*4]), Ys=Xs.map(r=>2*r[0]+r[1]**2); const sp=DS.split(300,0.7,DS.rng(3)); const fo=DS.forestFit(sp.train.map(i=>Xs[i]),sp.train.map(i=>Ys[i]),40,8,3,DS.rng(9)); const pr=sp.test.map(i=>fo.predict(Xs[i])); const r2=DS.r2(sp.test.map(i=>Ys[i]),pr); ok('forest test r2',r2>0.9,r2);
// PID: P-only steady state error ~ 1/(1+kp); with I it vanishes
const p1=DS.pidSim({kp:1}); ok('P-only sse',near(p1.steady,0.5,0.03),p1.steady); const p2=DS.pidSim({kp:1,ki:2,T:10}); ok('PI removes sse',Math.abs(p2.steady)<0.03,p2.steady); const p3=DS.pidSim({kp:2.5,ki:0,kd:0}); ok('overshoot grows with kp',p3.overshoot>=p1.overshoot,[p1.overshoot,p3.overshoot]);
// rmse / mae
ok('rmse',near(DS.rmse([2,4],[1,1]),Math.sqrt((1+9)/2))); ok('mae',near(DS.mae([2,4],[1,1]),2)); ok('boxStats outlier',DS.boxStats([1,2,3,4,5,6,7,8,9,100]).out.length===1);
// practice day
const d=DS.day(42); ok('day length',d.temp.length===288&&Math.min(...d.temp)>20&&Math.max(...d.temp)<35,[Math.min(...d.temp).toFixed(1),Math.max(...d.temp).toFixed(1)]);
console.log(fail?('FAILED '+fail):'ALL KIT TESTS PASSED'); process.exit(fail?1:0);
