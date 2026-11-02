/* ============ UNIT 4, modules 4.4 - 4.6: gas sensors, distance and motion, light and buttons ============ */
COURSE.find(u => u.id === "u4").modules.push(

 {id:"4.4", title:"Air quality and gas sensors: log transforms, scaling and anomaly detection", minutes:240,
  intro:"MQ-2 and MQ-135 sensors do not give parts per million directly: they give a voltage that depends on the gas in a curved way. This module shows three methods: a log transform to turn the datasheet curve into ppm, feature scaling so different sensors can be compared, and anomaly detection (a rolling z-score and an isolation forest) to catch a leak against ordinary background noise.",
  objectives:["Convert a gas sensor's Rs/R0 to ppm with a log-log line, by hand and in code.","Scale features with Min-Max and Z-score, and explain when each fails.","Detect anomalies with a rolling z-score and an isolation forest, and tune the threshold for false alarms and misses.","Produce a scatter plot of normalised readings and an anomaly-flag report with timestamps."],
  sections:[
   {id:"log", title:"Logarithmic transformation: from voltage to ppm", keys:"mq gas sensor log transform power law rs r0 ppm datasheet calibration", html:ds4eMap("Strand B: creating data from a sensor. Strand C: choosing a transformation so a simple model fits.")+`
    <p class="plain"><b>In plain words (no maths needed)</b>Some sensors respond in multiples: doubling the gas does not double the signal. A <b>logarithm</b> answers “how many times do I multiply by 10 to get here?” and turns that curved relationship into a straight line, which is easy to work with. You will use the calculator; you only need the idea.</p>
    
    <p>An MQ sensor is a heated metal-oxide element whose resistance <b>Rs</b> falls as gas concentration rises. You measure a voltage across a load resistor, convert it to Rs, and divide by <b>R0</b>, the resistance in clean air. The datasheet plots <b>Rs/R0 against ppm</b> on log-log axes, where each curve is nearly a straight line. A straight line on log-log axes means a <b>power law</b>:</p>
    ${MX.eq(`ppm = ${MX.v("a")} · (Rs/R0)${MX.sup(MX.v("b"))}`, `⟹ log${MX.sub("10")}(ppm) = log${MX.sub("10")}(${MX.v("a")}) + ${MX.v("b")} · log${MX.sub("10")}(Rs/R0)`)}
    <p>The second line is a straight line in the transformed variables, so ordinary least squares (module 4.3) can fit it: slope <i>b</i>, intercept log₁₀(<i>a</i>). Then transform back with 10<sup>y</sup>. <b>Worked by hand</b> with the widely used MQ-135 CO₂ fit a = 116.6, b = −2.769 (check your own datasheet): for Rs/R0 = 0.8, log₁₀(0.8) = −0.0969; log₁₀(ppm) = 2.0667 + (−2.769)(−0.0969) = 2.3350; ppm = 10<sup>2.3350</sup> ≈ <b>216 ppm</b>. The slope is negative: <i>more gas means lower Rs</i>.</p>
    <p><b>Use case (air-quality tracker):</b> chart ppm over a school day. Peaks at lunchtime and after PE are the story; the report must also say the readings are <b>relative</b>: R0 changes with age, temperature and humidity, so calibrate R0 outdoors after a 24-hour warm-up, and never use a hobby MQ sensor as a safety instrument.</p>
    ${code("python", `# Fit the datasheet curve on log-log axes, then use it to convert readings
ratio = np.array([0.55, 0.65, 0.8, 1.0, 1.3, 1.7, 2.2, 3.0])               # points read off the datasheet curve
ppm_pts = 116.6 * ratio ** -2.769 * (1 + 0.04 * np.random.default_rng(8).normal(size=8))
b, loga = np.polyfit(np.log10(ratio), np.log10(ppm_pts), 1)                   # slope and intercept of the straight line
a = 10 ** loga
print(f'fitted: ppm = {a:.1f} * (Rs/R0)^{b:.3f}')
to_ppm = lambda r: a * np.asarray(r) ** b
clean['gas_ppm'] = to_ppm(clean['gas_ratio'])
print(clean[['gas_ratio', 'gas_ppm']].describe().round(1))`, "Colab: log-log calibration")}
    ${mis(`Fitting a straight line to ppm against Rs/R0 on normal axes. The curve is bent, so the line misses badly at both ends. Transform first, fit second.`)}
    ${srcs(["mq135","statsmodels"])}`, interactive:["mqCurveLab","gx_curve"]},
   {id:"scale", title:"Feature scaling: Min-Max and Z-score", keys:"scaling normalization standardization minmax zscore feature", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>Different measurements live on different rulers (temperature 0–40, light 0–1023). <b>Scaling</b> puts them on one ruler so the big numbers do not drown the small ones. <b>Min-max</b> squeezes everything into 0–1. A <b>z-score</b> says “how many typical wobbles above or below average”.</p>
    
    <p>An MQ sensor reads about 150 to 900 and an LDR 0 to 1023. A model that measures <i>distance</i> between rows (clustering, nearest neighbours, anomaly detection) would treat the bigger numbers as more important, just because of the units. <b>Scaling</b> puts every feature on a comparable range.</p>
    ${MX.eq(`<b>Min-Max:</b>  ${MX.v("x′")} = ${MX.fr(MX.v("x") + " − " + MX.v("x") + MX.sub("min"), MX.v("x") + MX.sub("max") + " − " + MX.v("x") + MX.sub("min"))}      <b>Z-score:</b>  ${MX.v("z")} = ${MX.fr(MX.v("x") + " − x̄", "s")}`)}
    <p><b>Worked by hand</b> for the gas readings 300, 340, 360, 420, 500, 380 and x = 420: Min-Max = (420 − 300)/(500 − 300) = <b>0.60</b>. Mean = 383.3, s = 69.8, so z = (420 − 383.3)/69.8 = <b>0.53</b>: a bit above average.</p>
    <p><b>Which one?</b> Min-Max gives exactly 0 to 1, which is neat for charts, but one extreme reading (1500 in the lab) squashes everything else. Z-score has no fixed limits and handles that better. The golden rule: <b>fit the scaler on the training data only</b>, then apply the same numbers to new data. Using the whole dataset leaks information from the future.</p>
    ${code("python", `from sklearn.preprocessing import MinMaxScaler, StandardScaler
feat = clean[['gas_ratio', 'light_pct', 'temp_c']].dropna()
cut = int(len(feat) * 0.7)                                   # first 70% = training
mm = MinMaxScaler().fit(feat.iloc[:cut]); zs = StandardScaler().fit(feat.iloc[:cut])
scaled = pd.DataFrame(zs.transform(feat), index=feat.index, columns=feat.columns)
print(scaled.describe().round(2).loc[['mean', 'std', 'min', 'max']])
plt.scatter(scaled['gas_ratio'], scaled['light_pct'], s=8, c='#4F46E5')
plt.xlabel('gas (z-score)'); plt.ylabel('light (z-score)'); plt.title('Normalised gas vs light'); plt.show()`, "Colab: scale features")}`, interactive:["scalingLab","gx_scale"]},
   {id:"anom", title:"Anomaly detection: thresholds and isolation forests", keys:"anomaly detection isolation forest rolling z score threshold unsupervised leak false alarm", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>An <b>anomaly</b> is a reading that does not fit with what normally happens. A simple rule: flag anything more than about <b>three typical wobbles</b> from normal. An <b>isolation forest</b> is a cleverer helper: odd points are easy to cut off from the crowd with just a few random cuts.</p>
    
    <p>A gas leak is a reading that does not fit the recent background. Two ideas, both useful:</p>
    <p><b>1. Rolling z-score.</b> Compare each reading with the mean and SD of the previous w readings:</p>
    ${MX.eq(`${MX.v("z")}${MX.sub("i")} = ${MX.fr(MX.v("x") + MX.sub("i") + " − mean(previous w)", "SD(previous w)")}      flag if |z| > threshold (often 3)`)}
    <p>It is easy to explain, but a long spike inflates the window's SD, so later spikes hide (<i>masking</i>), and the window needs a sensible length.</p>
    <p><b>2. Isolation forest</b> (${ct("isoforest")}). Build many random trees: at each step pick a random cut value between the minimum and maximum. A strange reading sits alone and is separated after only a few cuts (a <i>short path</i>); an ordinary one needs many. The anomaly score is</p>
    ${MX.eq(`${MX.v("s")}(${MX.v("x")}) = 2${MX.sup("−E[h(" + MX.v("x") + ")] / c(" + MX.v("n") + ")")}      c(${MX.v("n")}) = 2(ln(${MX.v("n")}−1) + 0.5772) − 2(${MX.v("n")}−1)/${MX.v("n")}`)}
    <p>where E[h(x)] is the average path length over the trees and c(n) normalises it. <b>Worked by hand</b> with n = 100: c(100) = 2(4.595 + 0.577) − 1.98 = 8.36. A reading with average path 4 scores 2<sup>−4/8.36</sup> = <b>0.72</b> (suspicious); one with path 8.4 scores 0.50 (ordinary). Scores near 1 are anomalies, near 0.5 normal, well below 0.5 very ordinary. No bell curve is assumed, and it handles several columns together.</p>
    <p><b>The threshold is a decision, not a fact.</b> Lower it and you catch more leaks and raise more false alarms. For a gas alarm a miss is worse than a false alarm, so you accept some false alarms; for a text message to the teacher you may want fewer. Report both counts.</p>
    ${code("python", `from sklearn.ensemble import IsolationForest
g = clean['gas_ratio'].dropna()
z = (g - g.rolling(20).mean().shift(1)) / g.rolling(20).std().shift(1)         # compare with the PREVIOUS 20 readings
flag_z = z.abs() > 3
X = pd.concat([g, clean['temp_c']], axis=1).dropna()
iso = IsolationForest(n_estimators=200, contamination=0.04, random_state=0).fit(X)
flag_if = pd.Series(iso.predict(X) == -1, index=X.index)                       # -1 means anomaly
print('rolling z flagged', int(flag_z.sum()), '  isolation forest flagged', int(flag_if.sum()))
ax = g.plot(figsize=(9, 3), color='#475569', title='Gas ratio with anomaly flags', ylabel='Rs/R0')
ax.scatter(g.index[flag_if.reindex(g.index, fill_value=False)], g[flag_if.reindex(g.index, fill_value=False)], c='#C2410C', marker='x', s=40, label='isolation forest'); ax.legend(); plt.show()
print(pd.DataFrame({'gas_ratio': g[flag_if.reindex(g.index, fill_value=False)]}).head(8))   # the anomaly flags report`, "Colab: anomaly detection")}
    <p><b>Not every flag is a leak.</b> In the practice data the forest also flags three readings around 2 to 3 am: the quiet bottom of the daily cycle, which a 4% contamination setting forces it to call unusual. A flag is a <i>question</i>: check the time, the other sensors and the wiring before you sound a siren.</p>
    <p><b>Use case (gas-leak detector):</b> the deliverable is an <b>anomaly-flag report</b>: a table of timestamps, the reading, the score or z-value, and which method flagged it, plus a sentence on what the siren threshold costs in false alarms.</p>
    ${srcs(["isoforest"])}`, interactive:["anomalyLab","sandbox:sb_anomaly"]}   ,{id:"casestudy", title:"Case study and experiment", keys:"case study experiment example worked numbers", html:`
    <div class="casebox"><b>Case study: the kitchen air alarm</b>An MQ-135 sits at a clean-air baseline of 300 with a typical wobble (SD) of 10. Rule: alarm when a reading is more than 3 wobbles above normal, i.e. above 300 + 3 × 10 = <b>330</b>. A reading of 450 gives a z-score of (450 − 300) ÷ 10 = <b>15</b>: clearly an event. Min-max scaling of 300, 330, 450 onto 0–1 gives <b>0, 0.2, 1</b> because (330 − 300) ÷ 150 = 0.2. Both tricks answer the same question: “how unusual is this reading?”</div>
    <div class="expbox"><b>Try it yourself</b>Record 2 minutes of baseline in clean air, then 1 minute near a marker pen or hand sanitiser. Compute the baseline mean and SD in Colab, set the alarm at mean + 3 SD, and count how many readings trigger it.</div>`}
  ],
  quiz:[
   {q:"On log-log axes the MQ curve is a straight line. That means the relationship is a…", o:["Linear relationship","Power law, ppm = a·(Rs/R0)^b","Sine wave","Random"], a:1, e:"A straight line between log(ppm) and log(Rs/R0) means ppm = a·(Rs/R0)^b.", w:["It is linear only after taking logs.","","",""]},
   {q:"The MQ-135 slope b is negative because…", o:["The sensor is broken","More gas lowers the sensor's resistance Rs, so Rs/R0 falls as ppm rises","Logs are always negative","The ADC is upside down"], a:1, e:"The sensing element's resistance drops in the presence of the gas.", w:["","","",""]},
   {q:"Min-Max scaling is damaged most by…", o:["A single extreme reading","Having 1,000 rows","Negative numbers","A long unit name"], a:0, e:"The maximum sets the divisor, so one huge value squashes all the others.", w:["","","",""]},
   {q:"You fit a scaler on the whole dataset before splitting train and test. The problem is…", o:["Nothing","Information from the test data leaks into training","The scaler is too slow","It removes outliers"], a:1, e:"Fit scalers on training data only, then reuse the same numbers.", w:["","","",""]},
   {q:"For a gas leak alarm, which error is usually more costly?", o:["A false alarm","A missed leak","They are always equal","Neither matters"], a:1, e:"You accept more false alarms to avoid a miss, and report both.", w:["","","",""]},
   {q:"An isolation-forest score close to 1 means the reading was…", o:["Hard to isolate: very ordinary","Easy to isolate: likely an anomaly","Missing","Scaled"], a:1, e:"Short path length gives a high score.", w:["","","",""]}
  ],
  rating:["Sensor numbers are readings in ppm.","I can explain why we take logs and fit a line.","I can scale features correctly and spot when Min-Max fails.","I can tune an anomaly threshold and report false alarms and misses."],
  checkpoint:{code:"U4-C4", task:"For a gas sensor (your own or practice): fit a log-log calibration and state its R², scale two features, flag anomalies with one method, and produce an anomaly-flag table with timestamps and the false-alarm trade-off in one sentence.", met:"Fit and R² reported; scaler fitted on training data only; flagged table has timestamps; the limits of an MQ sensor are stated.", upload:"Upload your notebook and the flag table."},
  refs:["mq135","isoforest","sklearn","pandas","gaise"]
 },

 {id:"4.5", title:"Distance and motion sensors: filtering, error metrics and Markov chains", minutes:240,
  intro:"The HC-SR04 gives sudden impossible spikes (ghost echoes) that would crash a rover; the PIR gives a stream of 0s and 1s. You learn to clean the spikes with a Hampel filter, to measure how good a sensor really is with MAE, RMSE and bias against a laser measure, and to model motion as a Markov chain with a transition matrix.",
  objectives:["Detect and replace ghost echoes with a Hampel filter, working one window by hand.","Compare a rolling z-score with a Hampel filter and explain masking.","Compute MAE, RMSE and bias against a reference and read an error histogram.","Estimate a two-state Markov transition matrix from a PIR log and read occupancy from it."],
  sections:[
   {id:"hampel", title:"Outlier filtering: rolling z-scores and the Hampel filter", keys:"hampel filter outlier ghost echo ultrasonic median mad rolling z winsorization", html:ds4eMap("Strand B: curate data by pruning noise. Strand C: choose a method that matches the kind of error.")+`
    <p class="plain"><b>In plain words (no maths needed)</b>Sometimes a distance sensor shouts a wrong number (a ghost echo off a wall corner). The <b>Hampel filter</b> compares each reading with the middle value of its neighbours; if it is far off, it swaps in that middle value. The good readings are left alone.</p>
    
    <p>An ultrasonic sensor reading a wall 20 cm away may suddenly report 10, 11, <b>500</b>, 12 cm: an echo bounced off something far away. Averaging would drag the line toward 500. We want to <b>find</b> the impossible reading and <b>replace</b> it.</p>
    <p>The <b>Hampel filter</b> compares each reading with the <b>median</b> of the window around it and uses the <b>MAD</b> as its yardstick, because the median and MAD are not fooled by the spike:</p>
    ${MX.eq(`MAD = median(|${MX.v("x")}${MX.sub("j")} − median|)      σ̂ = 1.4826 · MAD`, `flag ${MX.v("x")}${MX.sub("i")} if |${MX.v("x")}${MX.sub("i")} − median| > ${MX.v("t")} · σ̂      replace it with the median`)}
    <p>The constant 1.4826 makes the MAD comparable to a standard deviation for bell-shaped noise; t is usually 3. <b>Worked by hand</b> on the window 20.1, 19.8, <b>120</b>, 20.3, 20.0: sorted = 19.8, 20.0, 20.1, 20.3, 120, so the median is <b>20.1</b>. Deviations |x − 20.1| = 0, 0.3, 99.9, 0.2, 0.1; sorted 0, 0.1, 0.2, 0.3, 99.9, so MAD = <b>0.2</b> and σ̂ = 1.4826 × 0.2 = 0.30. The limit is 3 × 0.30 = 0.89. The reading 120 is 99.9 away: far beyond 0.89, so it is flagged and replaced by 20.1. A rolling z-score would use the window's mean and SD, which the 120 itself inflates (mean 40, SD 44), so its z is only about 1.8: <b>it hides itself</b>. That is why Hampel is the better tool here.</p>
    <p><b>Winsorization</b> is a related idea: instead of replacing outliers, you clip extreme values to a chosen percentile (say the 1st and 99th). It keeps the data's size but changes the numbers, so report it.</p>
    <p><b>Use case (maze-solving rover):</b> filter ghost echoes before the controller sees them, so the rover does not brake for an object that is not there. The filter only works while fewer than half the values in a window are bad.</p>
    ${code("python", `def hampel(s, k=5, t=3):
    w = 2 * k + 1
    med = s.rolling(w, center=True, min_periods=1).median()
    mad = s.rolling(w, center=True, min_periods=1).apply(lambda x: np.median(np.abs(x - np.median(x))), raw=True)
    out = (s - med).abs() > t * 1.4826 * mad
    return s.where(~out, med), out
dist_clean, flagged = hampel(clean['dist_cm'], k=10, t=5)   # the sensor reports to 0.1 cm, so a quiet window has a tiny MAD: t = 5 avoids false flags
print('ghost echoes found:', int(flagged.sum()), ' at', list(clean.index[flagged].strftime('%H:%M')))
pd.DataFrame({'raw': clean['dist_cm'], 'cleaned': dist_clean}).plot(figsize=(9, 3), title='Ultrasonic: raw vs Hampel-cleaned', ylabel='cm'); plt.show()`, "Colab: Hampel filter")}
    ${srcs(["hampelref","pandas"])}`, interactive:["hampelLab","gx_clean2"]},
   {id:"err", title:"Model accuracy: MAE, RMSE and bias", keys:"mae rmse bias error accuracy evaluation reference laser histogram", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>How wrong is the sensor? <b>MAE</b> is the average size of the mistakes. <b>RMSE</b> is similar but punishes big mistakes extra. <b>Bias</b> asks whether the mistakes lean one way (always too high?). Always compare against a trusted reference.</p>
    
    <p>How good is the sensor? Measure the same distances with a <b>reference</b> (a laser tape) and compare. For each pair the <b>error</b> is e = sensor − truth. Three summaries:</p>
    ${MX.eq(`bias = ${MX.fr("1", MX.v("n"))} Σ e${MX.sub("i")}      MAE = ${MX.fr("1", MX.v("n"))} Σ |e${MX.sub("i")}|      RMSE = ${MX.rt(MX.fr("1", MX.v("n")) + " Σ e" + MX.sub("i") + "²")}`)}
    <p><b>Worked by hand.</b> Truth 20, 40, 60, 80; sensor 20.5, 41.2, 59.0, 82.3. Errors: +0.5, +1.2, −1.0, +2.3. Bias = (0.5 + 1.2 − 1.0 + 2.3)/4 = <b>+0.75 cm</b> (reads a little high on average). MAE = (0.5 + 1.2 + 1.0 + 2.3)/4 = <b>1.25 cm</b>. Squares: 0.25, 1.44, 1.00, 5.29, mean 1.995, so RMSE = √1.995 = <b>1.41 cm</b>.</p>
    <p><b>Reading them.</b> RMSE is never smaller than MAE, and the gap tells you about big misses: squaring punishes them. Use RMSE when a large error is dangerous (hitting a wall), MAE for a typical error. <b>Bias</b> shows a systematic offset, which calibration can fix; a random error cannot be fixed that way. Always give the unit, and show the <b>error histogram</b>: its centre is the bias and its width is the random error.</p>
    ${code("python", `truth = 25.0                                                           # wall measured with a laser tape
for name, s in [('raw', clean['dist_cm']), ('cleaned', dist_clean)]:
    e = s - truth
    print(f'{name:8s} bias {e.mean():+.2f}  MAE {e.abs().mean():.2f}  RMSE {np.sqrt((e**2).mean()):.2f}  (cm)')
(dist_clean - truth).plot.hist(bins=20, color='#4F46E5', figsize=(6, 3), title='Error of cleaned distance'); plt.xlabel('error (cm)'); plt.show()`, "Colab: error metrics")}
    <p><b>Report deliverable:</b> an error-distribution histogram of raw measurements against the laser truth and a one-line summary: "RMSE 1.4 cm, MAE 1.25 cm, bias +0.75 cm over four distances".</p>`, interactive:["errorMetricsLab"]},
   {id:"markov", title:"Markov chains and transition matrices for PIR data", keys:"markov chain transition matrix pir occupancy state probability stationary", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>A <b>Markov chain</b> asks one tiny question: “given the room is occupied <i>now</i>, what is the chance it is occupied in the next minute?” You write the chances of staying or switching in a little table. From it you can estimate how long an occupied spell usually lasts.</p>
    
    <p>A PIR logs a string such as 0,0,1,1,0,0,0,1,0. There are two <b>states</b>: quiet (0) and motion (1). Count how often each state is followed by each state to get a <b>transition matrix</b> of conditional probabilities, such as P(Motion | No motion). The <b>Markov</b> idea is that the next state depends only on the current one.</p>
    ${MX.eq(`P(j | i) = ${MX.fr("number of i → j transitions", "number of transitions starting at i")}`)}
    <p><b>Worked by hand</b> on 0,0,1,1,0,0,0,1,0,0,0 (11 readings, 10 pairs): 0→0 occurs 5 times, 0→1 twice, 1→0 twice, 1→1 once. So P(1|0) = 2/7 = <b>0.29</b> and P(0|0) = 5/7 = 0.71; P(0|1) = 2/3 = 0.67 and P(1|1) = 1/3 = 0.33. Each row sums to 1.</p>
    <p>In the long run the share of time spent in motion is the <b>stationary</b> probability: π₁ = P(1|0) / (P(1|0) + P(0|1)) = 0.286 / (0.286 + 0.667) = <b>0.30</b>, an <b>occupancy rate</b> of 30%. A large P(1|1) means people stay put once they arrive: the room has busy spells.</p>
    <p>With few readings the estimates wobble; with hundreds they settle (the law of large numbers). <b>Use case (room occupancy):</b> compute the matrix for each hour of the day, then switch lights off only when P(motion | quiet) is low. For privacy keep counts and rates, not who was there.</p>
    ${code("python", `x = clean['pir'].astype(int)
pairs = pd.DataFrame({'now': x.iloc[:-1].values, 'next': x.iloc[1:].values})
counts = pd.crosstab(pairs['now'], pairs['next'])
P = counts.div(counts.sum(axis=1), axis=0)
print(counts); print(P.round(2))
pi1 = P.loc[0, 1] / (P.loc[0, 1] + P.loc[1, 0])
print(f'long-run share of time with motion: {pi1:.0%}   (observed: {x.mean():.0%})')`, "Colab: transition matrix")}`, interactive:["markovLab"]}   ,{id:"casestudy", title:"Case study and experiment", keys:"case study experiment example worked numbers", html:`
    <div class="casebox"><b>Case study: the ghost echo</b>The true distance to a wall is 100 cm. An HC-SR04 returns 100.2, 99.8, 100.1, <b>0</b> (no echo), 99.9 and <b>154</b> (ghost). Averaging the errors without cleaning gives (0.2 + 0.2 + 0.1 + 100 + 0.1 + 54) ÷ 6 = <b>25.8 cm</b> MAE: terrible! Remove the two impossible values and the MAE is (0.2 + 0.2 + 0.1 + 0.1) ÷ 4 = <b>0.15 cm</b>. Filtering turned an unusable sensor into a good one. For the PIR: if “occupied stays occupied” 90 % of the time, an occupied spell lasts on average 1 ÷ (1 − 0.9) = <b>10 steps</b>.</div>
    <div class="expbox"><b>Try it yourself</b>Aim an ultrasonic sensor at a wall at a measured distance (use a ruler). Log 60 readings. Compute MAE with and without removing 0 and very large values. How many readings were “bad”?</div>`}
  ],
  quiz:[
   {q:"Window 20.1, 19.8, 120, 20.3, 20.0: the median is…", o:["40.0","20.1","120","19.8"], a:1, e:"Sorted 19.8, 20.0, 20.1, 20.3, 120: the middle is 20.1.", w:["That is the mean.","","",""]},
   {q:"Why can a rolling z-score miss a ghost echo that a Hampel filter catches?", o:["The spike inflates the mean and SD that the z-score uses","Z-scores only work on temperature","Hampel is newer","They always agree"], a:0, e:"The median and MAD are not distorted by the spike.", w:["","","",""]},
   {q:"Errors +0.5, +1.2, −1.0, +2.3. The bias is…", o:["+0.75","+1.25","1.41","0"], a:0, e:"Mean of the signed errors: 3.0 ÷ 4 = 0.75.", w:["","That is the MAE.","That is the RMSE.",""]},
   {q:"RMSE much larger than MAE tells you…", o:["Errors are all about the same size","A few large errors dominate","The sensor has no bias","The reference is wrong"], a:1, e:"Squaring emphasises big misses.", w:["","","",""]},
   {q:"In a Markov chain the next state depends on…", o:["All earlier states","Only the current state","The time of day only","Nothing"], a:1, e:"That is the Markov property.", w:["","","",""]},
   {q:"P(1|0) = 0.2 and P(0|1) = 0.2. The long-run share of time in state 1 is…", o:["20%","50%","80%","0%"], a:1, e:"π₁ = 0.2/(0.2+0.2) = 0.5.", w:["","","",""]}
  ],
  rating:["Outliers should just be deleted.","I can find a ghost echo with a Hampel filter.","I can compute MAE, RMSE and bias and say what each means.","I can build a transition matrix and report occupancy while protecting privacy."],
  checkpoint:{code:"U4-C5", task:"Clean an ultrasonic series with a Hampel filter, report the error before and after (RMSE, MAE, bias in cm) with an error histogram, and build a PIR transition matrix with the occupancy rate. State the privacy decision you made.", met:"Flags listed with times; metrics have units; histogram labelled; matrix rows sum to 1; privacy decision stated.", upload:"Upload your notebook."},
  refs:["hampelref","pandas","gaise","ds4e"]
 },

 {id:"4.6", title:"Light and buttons: binning, time windows and correlation", minutes:210,
  intro:"The photoresistor (LDR) gives a continuous number that is often easier to use as a few categories; a pushbutton gives noisy pulses that become useful only when you group them over time. Then you ask how all your variables relate: the correlation matrix, with Pearson and Spearman, and a heat map.",
  objectives:["Convert a continuous reading into categories with equal-width and quantile bins.","Debounce a button in software and compute a rate in a rolling time window.","Compute Pearson's r by hand and explain what Spearman's ρ adds.","Read a correlation heat map and avoid claiming cause from correlation."],
  sections:[
   {id:"bin", title:"Binning and quantization: Dark, Dim, Bright", keys:"binning quantile equal width discretization ordinal categories ldr light", html:ds4eMap("Strand C: transform variables. Strand E: choose displays that suit categorical data.")+`
    <p class="plain"><b>In plain words (no maths needed)</b><b>Binning</b> turns numbers into labels: 0–199 “Dark”, 200–600 “Dim”, above that “Bright”. It is easier to talk about, but you lose detail, so choose the edges from your data, not from guesswork.</p>
    
    <p>A solar tracker does not need 1,024 light levels; it needs to know <i>dark, dim or bright</i>. <b>Binning</b> cuts a number line into intervals and gives each interval a label. Two ways:</p>
    ${MX.eq(`<b>Equal width:</b>  edge${MX.sub("i")} = min + (max − min) · ${MX.fr("i", "k")}`, `<b>Quantile:</b>  edge${MX.sub("i")} = the (i/k) quantile, so each bin holds about n/k readings`)}
    <p><b>Worked by hand.</b> LDR 0 to 900, three equal-width bins: width = 900/3 = 300, edges 0, 300, 600, 900. A reading of 640 falls in 600 to 900: <b>Bright</b>. Now the quantile version: eight sorted readings 10, 40, 90, 150, 300, 420, 610, 800. The first edge is the 1/3 quantile: h = (8 − 1) × 1/3 = 2.33, so edge = 90 + 0.33 × (150 − 90) = <b>110</b>.</p>
    <p><b>Which one?</b> A classroom LDR is dark most of the day, so equal-width bins put most readings in one bin and leave others nearly empty. Quantile bins keep the groups balanced, which is better for charts and for models, but the edges are less round to explain. <b>The edges are your decision: write them in the report</b> so another person can repeat it.</p>
    ${code("python", `ldr = clean['light_pct'].dropna()
width_bins = pd.cut(ldr, bins=3, labels=['Dark', 'Dim', 'Bright'])
quant_bins = pd.qcut(ldr, q=3, labels=['Dark', 'Dim', 'Bright'])
print(pd.DataFrame({'equal_width': width_bins.value_counts(), 'quantile': quant_bins.value_counts()}))
print('quantile edges:', ldr.quantile([0, 1/3, 2/3, 1]).round(1).tolist())
quant_bins.value_counts().reindex(['Dark', 'Dim', 'Bright']).plot.bar(color='#4F46E5', title='Readings per light level', ylabel='count'); plt.show()`, "Colab: binning")}
    <p><b>Use case (solar tracker):</b> bin the light, then report how often each light zone occurs and what the motor did in each. The deliverable is a <b>binned frequency chart</b>.</p>`, interactive:["binningLab","gx_explore"]},
   {id:"window", title:"Debouncing and time-window aggregation", keys:"debounce button chatter bounce rolling window rate aggregation resample", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>A button press can “chatter”, registering many presses for one push. <b>Debouncing</b> ignores repeats within a very short time. A <b>time window</b> then counts presses per minute so you get a tidy rate instead of a pile of events.</p>
    
    <p>When you press a button its contacts bounce and the board sees several quick on/off pulses. <b>Hardware</b> debouncing uses a capacitor. <b>Software</b> debouncing ignores any event within a short time of the previous accepted one (20 to 50 ms is a good start). After that you can turn the pulses into a feature by counting them in a <b>window</b>:</p>
    ${MX.eq(`rate = ${MX.fr("number of presses in the window", "window length (s)")}`)}
    <p><b>Worked by hand:</b> 9 clean presses in a 6 s window give 9 ÷ 6 = <b>1.5 presses per second</b>. A <i>rolling</i> window slides one step at a time, so the rate updates continuously; a <i>fixed</i> window (every 5 s) gives one number per bucket.</p>
    <p>Too short a debounce keeps the bounces (the count is too high); too long merges real quick presses (too low). <b>Use case (interaction rate):</b> a museum exhibit or a robot's control panel: chart presses per minute through the day to see when it is used most, without storing who pressed.</p>
    ${code("python", `# Simulate raw contact events: 10 real presses, each with 1 to 4 bounces a few milliseconds apart
r4 = np.random.default_rng(19)
presses = [1.2, 2.0, 2.6, 6.8, 7.3, 8.1, 8.6, 9.0, 14.5, 15.2]
raw_ev = sorted(p + k * r4.uniform(0.002, 0.012) for p in presses for k in range(r4.integers(1, 5)))
keep, last = [], -1.0
for e in raw_ev:
    if (e - last) * 1000 >= 50: keep.append(e)          # ignore anything within 50 ms of the previous event
    last = e
print(len(raw_ev), 'raw events ->', len(keep), 'presses after debounce')
ev = pd.Series(1, index=pd.to_datetime(keep, unit='s'))
rate = ev.rolling('5s').sum() / 5                       # presses per second in the last 5 s
rate.plot(drawstyle='steps-post', figsize=(8, 2.6), title='Button presses per second (rolling 5 s)', ylabel='per s'); plt.show()`, "Colab: debounce and window rate")}`, interactive:["timeWindowLab"]},
   {id:"corr", title:"Correlation: Pearson, Spearman and the heat map", keys:"correlation pearson spearman heatmap matrix association causation outlier", html:`
    <p class="plain"><b>In plain words (no maths needed)</b><b>Correlation</b> (r) runs from −1 to +1 and says how closely two things move together. +1: they rise together. −1: one rises as the other falls. 0: no straight-line link. It <b>never</b> proves that one causes the other; the sun may heat the room <i>and</i> brighten it.</p>
    
    <p>Do two variables rise and fall together? <b>Pearson's r</b> measures how well the points follow a <i>straight line</i>, from −1 (perfect downhill) through 0 (no line) to +1 (perfect uphill):</p>
    ${MX.eq(`r = ${MX.fr("Sxy", MX.rt("Sxx · Syy"))} = ${MX.fr("Σ(" + MX.v("x") + "−x̄)(" + MX.v("y") + "−ȳ)", MX.rt("Σ(" + MX.v("x") + "−x̄)² · Σ(" + MX.v("y") + "−ȳ)²"))}`)}
    <p><b>Worked by hand</b> (x = 1, 2, 3, 4, 5; y = 2, 4, 5, 4, 5): x̄ = 3, ȳ = 4; Sxy = 6, Sxx = 10, Syy = 6; r = 6/√60 = <b>0.77</b>, a fairly strong upward association. <b>Spearman's ρ</b> is the same calculation done on the <b>ranks</b> (1st, 2nd, 3rd …): it measures any steadily rising or falling relationship and resists outliers. For x = 1 to 5 and y = x² = 1, 4, 9, 16, 25, Pearson is 0.98 (a curve is not a line) but Spearman is exactly <b>1</b> (always rising).</p>
    <p>A <b>correlation matrix</b> lists r for every pair; a <b>heat map</b> colours it, and you should always print the numbers in the cells. <b>Use case:</b> how does a rise in light relate to humidity, temperature and the solar panel's output over the day? <b>Warning:</b> correlation is not causation. Light and temperature rise together here because both follow the sun, and the fan correlates with temperature because the controller switches it on when it is hot (the arrow runs the other way). Say "is associated with".</p>
    ${code("python", `clean['panel_v'] = 0.05 * clean['light_pct'] + np.random.default_rng(5).normal(0, 0.9, len(clean))   # simulated panel output (V)
cols = ['light_pct', 'temp_c', 'hum_pct', 'panel_v']
for method in ('pearson', 'spearman'):
    C = clean[cols].corr(method=method)
    fig, ax = plt.subplots(figsize=(4.2, 3.6))
    im = ax.imshow(C, cmap='coolwarm', vmin=-1, vmax=1); ax.set_xticks(range(4), cols, rotation=40); ax.set_yticks(range(4), cols)
    for i in range(4):
        for j in range(4): ax.text(j, i, f'{C.iloc[i, j]:.2f}', ha='center', va='center')
    ax.set_title(method.title() + ' correlation'); plt.colorbar(im); plt.tight_layout(); plt.show()`, "Colab: correlation heat map")}`, interactive:["corrLab"]}   ,{id:"casestudy", title:"Case study and experiment", keys:"case study experiment example worked numbers", html:`
    <div class="casebox"><b>Case study: the reading-lamp study</b>A light sensor reads 150, 410 and 850. With Dark below 200, Dim 200–600 and Bright above 600, the labels are <b>Dark, Dim, Bright</b>. Over a week, outside temperature and indoor light have a correlation of r = <b>+0.80</b>: strong. Squaring it, r² = 0.64, means about <b>64 %</b> of the ups and downs are shared. The sun likely drives both: <b>association is not cause</b>.</div>
    <div class="expbox"><b>Try it yourself</b>Log light and temperature for one day. Compute the correlation in Colab. Then write one sentence saying what you can claim and one sentence saying what you cannot.</div>`}
  ],
  quiz:[
   {q:"LDR range 0 to 900, three equal-width bins. A reading of 640 is…", o:["Dark","Dim","Bright","Out of range"], a:2, e:"Edges are 0, 300, 600, 900, so 640 is in the last bin.", w:["","","",""]},
   {q:"Quantile bins differ from equal-width bins because they…", o:["Make every bin the same width","Make every bin hold about the same number of readings","Remove outliers","Need no data"], a:1, e:"Quantile edges follow the data.", w:["","","",""]},
   {q:"A debounce time that is far too long will…", o:["Count bounces as presses","Merge real quick presses together so the count is too low","Fix the button for ever","Make no difference"], a:1, e:"Presses closer together than the debounce time are ignored.", w:["","","",""]},
   {q:"y = x² for x = 1 to 5. Which is true?", o:["Pearson = Spearman = 1","Spearman = 1 and Pearson is slightly less than 1","Both are 0","Pearson = 1 and Spearman = 0"], a:1, e:"The relationship always rises (Spearman 1) but is not a straight line (Pearson 0.98).", w:["","","",""]},
   {q:"The fan is ON when the room is hot; the data show a strong fan–temperature correlation. Best reading?", o:["The fan heats the room","They are associated; the control rule makes temperature drive the fan","There is no relationship","Correlation proves the fan works"], a:1, e:"Think about which way the arrow could run.", w:["","","",""]},
   {q:"One extreme bad reading mostly spoils…", o:["Spearman's ρ","Pearson's r","Neither","The median"], a:1, e:"Pearson uses the actual values; Spearman uses ranks.", w:["","","",""]}
  ],
  rating:["I look at correlation numbers without checking the picture.","I can bin a reading and defend my edges.","I can compute a rate in a window and Pearson's r by hand.","I can read a heat map, choose Pearson or Spearman, and avoid causal language."],
  checkpoint:{code:"U4-C6", task:"Produce: (1) a binned frequency chart of light with your bin edges written out, (2) a presses-per-window chart after debouncing, and (3) a correlation heat map with numbers in the cells for light, temperature, humidity and an output of your choice. Write two sentences: one association you can see and one reason it does not prove cause.", met:"Edges stated; debounce time stated; heat map has numbers and a scale; interpretation avoids causal claims.", upload:"Upload your three charts."},
  refs:["pandas","gaise","ds4e","tidy"]
 }
);
