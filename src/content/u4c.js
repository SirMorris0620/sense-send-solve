/* ============ UNIT 4, modules 4.7 - 4.9: actuators and outcomes, prediction and testing, dashboard and data report ============ */
COURSE.find(u => u.id === "u4").modules.push(

 {id:"4.7", title:"Motors, servos and buzzers: logistic regression, survival analysis and control feedback", minutes:240,
  intro:"Actuators are the robot's answer to the data. In data science they become response variables: did the servo reach its angle (yes/no)? how long did the motor last? how well does the controller track its target? You learn logistic regression for success or failure, Kaplan–Meier survival analysis for time-to-failure, and how to measure a PID control response with overshoot, settling time and error integrals.",
  objectives:["Fit a logistic regression for a yes/no outcome, read the S-curve, and score it with a confusion matrix, precision and recall.","Explain censoring and compute Kaplan–Meier survival steps by hand.","Measure a control response: overshoot, rise time, settling time, steady-state error, IAE and ISE.","Choose a decision threshold by the cost of each kind of mistake."],
  sections:[
   {id:"logit", title:"Logistic regression for success or failure", keys:"logistic regression classification sigmoid gradient descent confusion matrix precision recall threshold servo failure", html:ds4eMap("Strand C: modeling a yes/no outcome. Strand D: judging a model by its mistakes.")+`
    <p class="plain"><b>In plain words (no maths needed)</b><b>Logistic regression</b> predicts a yes/no outcome, such as “did the servo reach its position?”. It gives a <b>probability</b> between 0 and 1. Above 0.5 you say yes. The “confusion matrix” just counts how often it was right and wrong.</p>
    
    <p>A servo is asked to reach an angle within 1 second while carrying different loads. The outcome is 1 (reached it) or 0 (stalled). A straight line would give predictions below 0 and above 1, which are not probabilities. <b>Logistic regression</b> bends the line through the <b>sigmoid</b>, which squeezes any number into 0 to 1:</p>
    ${MX.eq(`P(success) = σ(z) = ${MX.fr("1", "1 + e" + MX.sup("−z"))},     z = ${MX.v("w")}·${MX.v("x")} + ${MX.v("b")}`)}
    <p><b>Worked by hand:</b> if the model gives z = 1.2 for a certain load, e<sup>−1.2</sup> = 0.301, so P = 1/(1 + 0.301) = <b>0.769</b>: about a 77% chance of success. The weights w and b are found by <b>gradient descent</b>: start at 0, then repeatedly nudge w and b a little in the direction that lowers the <b>log-loss</b> (the penalty for confident wrong answers):</p>
    ${MX.eq(`loss = −${MX.fr("1", MX.v("n"))} Σ [ ${MX.v("y")} ln ${MX.v("p")} + (1 − ${MX.v("y")}) ln(1 − ${MX.v("p")}) ]`, `${MX.v("w")} ← ${MX.v("w")} − η · ${MX.fr("1", MX.v("n"))} Σ (${MX.v("p")} − ${MX.v("y")}) ${MX.v("x")}      ${MX.v("b")} ← ${MX.v("b")} − η · ${MX.fr("1", MX.v("n"))} Σ (${MX.v("p")} − ${MX.v("y")})`)}
    <p>η is the learning rate. Press <i>Train</i> in the lab and watch the loss fall as the S-curve forms.</p>
    <p><b>Scoring.</b> Pick a threshold (say 0.5): predict success if P ≥ threshold. Count the four outcomes in a <b>confusion matrix</b>: TP, FP, FN, TN. <b>Precision</b> = TP/(TP+FP) (of the successes predicted, how many were right). <b>Recall</b> = TP/(TP+FN) (of the real successes, how many were found). With TP = 18, FP = 4, FN = 6, TN = 22: accuracy = 40/50 = 80%, precision = 18/22 = <b>0.82</b>, recall = 18/24 = <b>0.75</b>, F1 = 0.78. <b>Accuracy alone misleads</b> when one outcome is rare: a model that always says "no failure" is 99% accurate if failures are 1% of cases, and useless.</p>
    <p><b>Use case (robot arm picking up something fragile):</b> wrongly trusting the servo (a false success) drops the object, so raise the threshold and accept more rejected good trials. For a harmless task use 0.5.</p>
    ${code("python", `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, precision_score, recall_score
r5 = np.random.default_rng(41)
load = r5.uniform(0.5, 4.5, 200)                                       # kg carried by the servo arm
ok = (r5.random(200) < 1 / (1 + np.exp(-3.2 * (3 - load)))).astype(int)   # 1 = reached the angle
X = load.reshape(-1, 1); idx = np.arange(200); tr, te = idx % 4 != 0, idx % 4 == 0
model = LogisticRegression().fit(X[tr], ok[tr])
p = model.predict_proba(X[te])[:, 1]
for thr in (0.5, 0.9):
    yhat = (p >= thr).astype(int)
    print(f'threshold {thr}: precision {precision_score(ok[te], yhat):.2f}  recall {recall_score(ok[te], yhat):.2f}')
    print(confusion_matrix(ok[te], yhat))
print('P(success) at 3 kg:', round(float(model.predict_proba([[3.0]])[0, 1]), 2))`, "Colab: logistic regression")}`, interactive:["logisticLab","gx_act"]},
   {id:"surv", title:"Time-to-event (survival) analysis for motors and buzzers", keys:"survival analysis kaplan meier censoring time to event failure motor median life", html:`
    <p class="plain"><b>In plain words (no maths needed)</b><b>Survival analysis</b> asks “how long until it fails?” even when some parts have <b>not failed yet</b> when the test ends. Those survivors still count: knowing a buzzer lasted at least 20 hours is useful information.</p>
    
    <p>How long does a DC motor last at high load before it fails or overheats? Some motors fail during your test; others are <b>still working when you stop the test</b>. Those are <b>censored</b>: you know they lasted <i>at least</i> that long. Throwing them away would throw away your best motors and underestimate life.</p>
    <p>The <b>Kaplan–Meier</b> estimator keeps censored motors in the "at risk" count until they leave. At each failure time t<sub>i</sub>, with n<sub>i</sub> motors still running and d<sub>i</sub> failures:</p>
    ${MX.eq(`S(${MX.v("t")}) = Π ( 1 − ${MX.fr(MX.v("d") + MX.sub("i"), MX.v("n") + MX.sub("i"))} )   over failure times t${MX.sub("i")} ≤ ${MX.v("t")}`)}
    <p><b>Worked by hand</b> (10 motors; failures at 12, 15, 18 h): at 12 h, n = 10, d = 1 → S = 1 × (1 − 1/10) = <b>0.90</b>; at 15 h, n = 9, d = 1 → S = 0.90 × (1 − 1/9) = <b>0.80</b>; at 18 h, n = 8 → S = 0.80 × (7/8) = <b>0.70</b>. The <b>median life</b> is the first time S drops to 0.5 or below (25 h in the lab). If a motor is censored, it is removed from n for later steps but never counted as a failure.</p>
    <p><b>Use case (motor under three loads):</b> draw one curve per load on the same axes with direct labels. A curve that sits lower is a worse load. Report the median life at each load, and the number of censored motors, because the answer depends on how long you watched.</p>
    ${code("python", `# Kaplan-Meier from scratch (the lifelines package does the same: pip install lifelines)
def kaplan_meier(times, failed):
    d = pd.DataFrame({'t': times, 'f': failed}); S, rows = 1.0, []
    for t in sorted(d.loc[d.f == 1, 't'].unique()):
        n = int((d.t >= t).sum()); k = int(((d.t == t) & (d.f == 1)).sum())
        S *= 1 - k / n; rows.append((t, n, k, round(S, 3)))
    return pd.DataFrame(rows, columns=['hour', 'at_risk', 'failed', 'S'])
light = kaplan_meier([12, 15, 18, 22, 25, 28, 30, 34, 40, 40], [1, 1, 1, 1, 1, 1, 1, 1, 0, 0])
heavy = kaplan_meier([5, 6, 8, 9, 11, 12, 14, 16, 20, 20], [1, 1, 1, 1, 1, 1, 1, 1, 1, 0])
print(light.head(3)); print('median life, light load:', light.loc[light.S <= 0.5, 'hour'].iloc[0], 'h')
plt.step(light.hour, light.S, where='post', label='light load', color='#4F46E5'); plt.step(heavy.hour, heavy.S, where='post', ls='--', label='heavy load', color='#C2410C')
plt.xlabel('hours running'); plt.ylabel('fraction still working'); plt.title('Motor survival by load'); plt.legend(); plt.show()`, "Colab: Kaplan–Meier")}
    ${srcs(["kaplan"])}`, interactive:["survivalLab"]},
   {id:"pid", title:"Control feedback: measuring a PID response", keys:"pid control feedback overshoot settling time steady state error iae ise servo motor", html:`
    <p class="plain"><b>In plain words (no maths needed)</b><b>Feedback control</b>: measure, compare with the goal, push the actuator a little, repeat. A PID controller reacts to the size of the error (<b>P</b>), how long it has lasted (<b>I</b>) and how fast it is changing (<b>D</b>). <b>Overshoot</b> is how far past the goal it swings before settling.</p>
    
    <p>A controller compares the target with the measured value and decides how hard to push. The <b>error</b> is e = target − measured. A PID controller adds three parts:</p>
    ${MX.eq(`${MX.v("u")}(${MX.v("t")}) = K${MX.sub("p")}·${MX.v("e")}(${MX.v("t")}) + K${MX.sub("i")}·∫${MX.v("e")} d${MX.v("t")} + K${MX.sub("d")}·${MX.fr("d" + MX.v("e"), "d" + MX.v("t"))}`)}
    <p><b>P</b> pushes in proportion to the error; alone it leaves a <b>steady-state error</b> (for a simple plant with Kp = 3 the response settles at Kp/(1 + Kp) = 0.75 of the target, an error of 0.25). <b>I</b> adds up past error and removes that leftover, but too much causes <b>overshoot</b> and wobble. <b>D</b> reacts to how fast the error changes and calms the overshoot. The data science part is to <b>measure</b> the response, not to eyeball it:</p>
    <ul><li><b>Overshoot</b> = (peak − target)/target × 100%.</li><li><b>Rise time</b>: from 10% to 90% of the target.</li><li><b>Settling time</b>: when the response stays within ±2% of the target.</li><li><b>Steady-state error</b>: target minus the final value.</li><li><b>IAE</b> = ∫|e| dt and <b>ISE</b> = ∫e² dt boil the whole curve into one number so two tunings can be compared (ISE punishes big errors more).</li></ul>
    <p><b>Worked by hand</b> for IAE: errors 1.0, 0.6, 0.3, 0.1, 0.0 sampled every 0.5 s give IAE = (1.0 + 0.6 + 0.3 + 0.1 + 0) × 0.5 = <b>1.0</b>.</p>
    <p><b>Use case (servo or motor speed):</b> log the commanded and measured position every 20 ms, then compute these metrics for each tuning and put them in a table. The report says which tuning meets "overshoot under 10% and settling under 1 s".</p>
    ${code("python", `def pid_response(kp, ki=0.0, kd=0.0, dt=0.02, T=6.0, sp=1.0, wn=6.0, zeta=0.7):
    x = v = integ = 0.0; prev = sp - x; ys = []
    for _ in range(int(T / dt) + 1):
        e = sp - x; integ += e * dt; d = (e - prev) / dt; prev = e
        u = np.clip(kp * e + ki * integ + kd * d, -3, 3); ys.append(x)       # the motor driver saturates at +/- 3
        v += (wn**2 * (u - x) - 2 * zeta * wn * v) * dt; x += v * dt          # a second-order servo
    return np.array(ys), dt
rows = []
for name, k in {'P only': (3, 0, 0), 'PI': (3, 10, 0), 'PID': (3, 10, 0.3)}.items():
    y, dt = pid_response(*k); e = 1 - y
    outside = np.where(np.abs(e) > 0.02)[0]
    settle = (outside[-1] + 1) * dt if len(outside) else 0
    rows.append([name, round(max(0, y.max() - 1) * 100, 1), round(settle, 2), round(1 - y[-25:].mean(), 3), round(np.abs(e).sum() * dt, 2)])
print(pd.DataFrame(rows, columns=['tuning', 'overshoot_%', 'settle_s', 'steady_error', 'IAE']))`, "Colab: control metrics")}
    ${srcs(["controlbook"])}`, interactive:["pidLab"]}   ,{id:"casestudy", title:"Case study and experiment", keys:"case study experiment example worked numbers", html:`
    <div class="casebox"><b>Case study: how long do buzzers last?</b>Ten buzzers are tested for 20 hours. Failures happen at 5 h, 8 h, 8 h and 12 h; six are still working at the end. Counting survivors step by step: after 5 h, 9 of 10 survive (0.90); at 8 h, 2 of the 9 at risk fail so we multiply by 7 ÷ 9 (0.70); at 12 h, 1 of 7 fails so we multiply by 6 ÷ 7 (<b>0.60</b>). So about <b>60 %</b> survive 20 hours, and the six survivors still counted. For control: a heater steps from 20 °C to 25 °C and peaks at 27 °C. Overshoot = (27 − 25) ÷ (25 − 20) = <b>40 %</b>.</div>
    <div class="expbox"><b>Try it yourself</b>Run a servo or LED timer for 10 minutes while logging “still working?” every minute. Draw the survival curve on paper as a staircase: what is your 5-minute survival?</div>`}
  ],
  quiz:[
   {q:"A model gives z = 0 for a trial. The probability of success is…", o:["0","0.5","1","Undefined"], a:1, e:"σ(0) = 1/(1 + e^0) = 1/2.", w:["","","",""]},
   {q:"Precision answers the question…", o:["Of all real successes, how many did we find?","Of the trials predicted as success, how many truly were?","How many trials were there?","Was the sensor accurate?"], a:1, e:"Precision = TP/(TP+FP).", w:["That is recall.","","",""]},
   {q:"Failures are 1% of cases. A model that always predicts 'no failure' has accuracy…", o:["1%","50%","99%, yet it is useless","0%"], a:2, e:"Accuracy hides the failure of the rare class. Look at recall and precision.", w:["","","",""]},
   {q:"A motor is still running when the test ends. In Kaplan–Meier it is…", o:["Counted as a failure","Deleted from the data","Censored: it stays in the at-risk count until the test ends","Counted twice"], a:2, e:"It leaves the at-risk count without counting as a failure.", w:["","","",""]},
   {q:"10 at risk, 1 fails, then 9 at risk and 1 fails. S after the second failure is…", o:["0.80","0.81","0.90","0.70"], a:0, e:"0.90 × (1 − 1/9) = 0.80.", w:["","","",""]},
   {q:"P-only control leaves a steady-state error. Which term removes it?", o:["Derivative","Integral","A bigger window","Smoothing"], a:1, e:"The integral term accumulates the leftover error.", w:["","","",""]}
  ],
  rating:["I judge a model by accuracy alone.","I can read an S-curve and a confusion matrix.","I can compute precision, recall and one Kaplan–Meier step by hand.","I can tune and measure a controller, and choose a threshold from the cost of mistakes."],
  checkpoint:{code:"U4-C7", task:"For your actuator: fit a logistic model (or run the lab with your data) and report the confusion matrix, precision and recall at two thresholds with the reason for your choice; draw a Kaplan–Meier chart for two loads with the median life; and tabulate overshoot, settling time, steady error and IAE for two PID tunings.", met:"Both thresholds justified by cost; censored motors handled; control metrics have units and a pass/fail against a stated target.", upload:"Upload your notebook."},
  refs:["sklearn","kaplan","controlbook","pandas","ds4e"]
 },

 {id:"4.8", title:"Predicting and testing: regression, random forests and the chi-square test", minutes:240,
  intro:"Now put the sensors together. Predict one variable from the others with multiple linear regression and a random forest, grade the models on data they have not seen, see which sensor mattered, and test whether two things are really associated or whether chance could explain the pattern.",
  objectives:["Fit multiple linear regression and a random forest, with a train/test split and a do-nothing baseline.","Explain overfitting using train and test error.","Read permutation importance without mistaking it for cause.","Run and interpret a chi-square test of independence, working the expected counts by hand."],
  sections:[
   {id:"reg", title:"Multiple linear regression", keys:"multiple linear regression least squares predictors coefficients rmse baseline", html:ds4eMap("Strand C: build and evaluate a model. Strand D: interpret what the model can and cannot say.")+`
    <p class="plain"><b>In plain words (no maths needed)</b><b>Regression</b> finds the best straight-line (or flat-plane) rule that predicts one number from others, for example room temperature from the hour and the outside light. Always compare with the dullest guess possible, “always predict the average”. If your model cannot beat that, it has learned nothing.</p>
    
    <p>Predict gas concentration from temperature, humidity and light. With several predictors the straight line becomes a plane:</p>
    ${MX.eq(`ŷ = ${MX.v("b")}${MX.sub("0")} + ${MX.v("b")}${MX.sub("1")}·temp + ${MX.v("b")}${MX.sub("2")}·humidity + ${MX.v("b")}${MX.sub("3")}·light`, `${MX.v("b")} = (X${MX.sup("T")}X)${MX.sup("−1")} X${MX.sup("T")} ${MX.v("y")}     (the least-squares solution)`)}
    <p>Each coefficient is the change in ŷ for one unit of that predictor <i>with the others held fixed</i>. The least-squares solution is the one that minimises the sum of squared errors, exactly as in the one-variable case, written with matrices so it works for any number of predictors.</p>
    <p><b>Before you trust any model, do three things.</b> (1) <b>Split</b>: fit on 70% of the rows, grade on the 30% it has never seen. (2) Compare with a <b>baseline</b>: always predict the training average; a model must beat it. (3) Report the test error <b>in the sensor's unit</b>. A note for time series: neighbouring readings are almost the same, so a <i>random</i> split makes the test set look easier than the future. A <i>chronological</i> split (train on the earlier part, test on the later) is the honest check, and its error is usually larger.</p>`, interactive:""},
   {id:"rf", title:"Random forest and overfitting", keys:"random forest decision tree overfitting train test importance permutation depth", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>A <b>random forest</b> is a vote among many simple decision trees, each looking at a slightly different slice of the data. It copes with curves but can <b>memorise</b> the training data (overfitting), so you judge it only on data it never saw.</p>
    
    <p>A <b>decision tree</b> asks a series of yes/no questions about the sensors ("is light above 40?") and ends in a leaf that predicts the average of the training rows that landed there. One deep tree memorises its training data. A <b>random forest</b> grows many trees, each on a random re-sample of the rows and a random subset of the sensors, and averages them. The errors of the separate trees partly cancel:</p>
    ${MX.eq(`ŷ = ${MX.fr("1", MX.v("T"))} Σ tree${MX.sub(MX.v("k"))}(x)`)}
    <p><b>Overfitting</b> shows as a growing gap between train and test error. Raise the depth in the lab: training error keeps falling, test error stops improving or rises. A forest also handles curved relationships and interactions that a plane cannot, but it cannot predict outside the range of the training data.</p>
    <p><b>Permutation importance</b> asks: if I shuffle one sensor's column, how much worse does the model get? A big rise in error means the model relied on it. It tells you what the <i>model</i> used, not what <i>causes</i> the gas level; when two sensors are strongly related (temperature and humidity here) they share the credit.</p>
    ${code("python", `from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.inspection import permutation_importance
d = clean[['gas_ratio', 'temp_c', 'hum_pct', 'light_pct']].dropna()
X, y = d[['temp_c', 'hum_pct', 'light_pct']], d['gas_ratio']
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
rmse = lambda a, b: float(np.sqrt(np.mean((np.asarray(a) - np.asarray(b)) ** 2)))
base = rmse(yte, np.full(len(yte), ytr.mean()))
lin = LinearRegression().fit(Xtr, ytr)
rf = RandomForestRegressor(n_estimators=200, max_depth=4, random_state=0).fit(Xtr, ytr)
print(f'baseline {base:.3f} | linear train {rmse(ytr, lin.predict(Xtr)):.3f} test {rmse(yte, lin.predict(Xte)):.3f} | forest train {rmse(ytr, rf.predict(Xtr)):.3f} test {rmse(yte, rf.predict(Xte)):.3f}')
# honest check for time series: train on the earlier 70%, test on the later 30%
cut = int(len(d) * 0.7); rf2 = RandomForestRegressor(n_estimators=200, max_depth=4, random_state=0).fit(X.iloc[:cut], y.iloc[:cut])
print('forest, chronological split, test RMSE:', round(rmse(y.iloc[cut:], rf2.predict(X.iloc[cut:])), 3))
imp = permutation_importance(rf, Xte, yte, n_repeats=20, random_state=0)
print(dict(zip(X.columns, imp.importances_mean.round(4))))`, "Colab: regression, forest and importance")}
    <p><b>What to notice.</b> A forest does not automatically beat a simple model: here the gas level is nearly a straight line in temperature plus one event, so the linear model does as well or better on the random split, and the chronological split is harder than either. A negative importance means shuffling that sensor did not hurt, so the model did not need it.</p>
    <p><b>Use case (air-quality prediction):</b> predict the gas ratio from temperature, humidity and light, so the dashboard can show the expected level next to the measured one; a measured reading far above the prediction is another way to flag an anomaly.</p>
    ${srcs(["breiman","sklearn"])}`, interactive:["mlLab","gx_model"]},
   {id:"chi", title:"Testing a claim: the chi-square test of independence", keys:"chi square hypothesis test p value expected count independence association contingency", html:`
    <p class="plain"><b>In plain words (no maths needed)</b><b>Chi-square</b> asks: are the counts I observe different enough from “no link at all” to be more than luck? A small <b>p-value</b> (say under 0.05) means luck alone is an unlikely explanation. It does not tell you how big or how important the link is.</p>
    
    <p>Are "light level" and "fan ON" linked, or could this pattern appear by chance? Count how many readings fall in each combination (a <b>contingency table</b>), work out what you would <b>expect</b> if the two were unrelated, and measure the gap:</p>
    ${MX.eq(`expected = ${MX.fr("row total × column total", "grand total")}`, `χ² = Σ ${MX.fr("(observed − expected)²", "expected")},     df = (rows − 1)(columns − 1)`)}
    <p><b>Worked by hand.</b> Observed: Dark&amp;OFF 30, Dark&amp;ON 10, Bright&amp;OFF 20, Bright&amp;ON 40 (grand total 100; row totals 40 and 60; column totals 50 and 50). Expected for Dark&amp;OFF = 40 × 50 / 100 = <b>20</b>; the others are 20, 30, 30. Terms: (30−20)²/20 = 5; (10−20)²/20 = 5; (20−30)²/30 = 3.33; (40−30)²/30 = 3.33. χ² = 5 + 5 + 3.33 + 3.33 = <b>16.67</b>, df = 1, and the p-value is about <b>0.00004</b>.</p>
    <p><b>What the p-value means:</b> if there were really no link, the chance of a pattern at least this extreme is about 0.004%. Below the usual (and arbitrary) 0.05 line we say the data are <b>evidence of an association</b>. It does <b>not</b> say how big or important the link is, it is <b>not</b> the probability that the result is wrong, and it cannot show cause. The test also needs expected counts of about 5 or more in every cell.</p>
    ${code("python", `from scipy.stats import chi2_contingency
dd = clean[['light_pct', 'heat_index_c']].dropna()
dd['light_level'] = pd.cut(dd['light_pct'], [-1, 50, 101], labels=['Dark', 'Bright'])
dd['fan'] = np.where(dd['heat_index_c'] > dd['heat_index_c'].quantile(0.6), 'ON', 'OFF')   # a made-up fan rule for practice
table = pd.crosstab(dd['light_level'], dd['fan']); print(table)
chi2, p, dof, expected = chi2_contingency(table, correction=False)
print(f'chi-square {chi2:.2f}, df {dof}, p {p:.2e}  (report very small p-values as p < 0.001)'); print(pd.DataFrame(expected.round(1), index=table.index, columns=table.columns))
# check the example in the text:
print(chi2_contingency([[30, 10], [20, 40]], correction=False)[:3])`, "Colab: chi-square test")}
    ${srcs(["scipystats"])}`, interactive:["chiLab"]}   ,{id:"casestudy", title:"Case study and experiment", keys:"case study experiment example worked numbers", html:`
    <div class="casebox"><b>Case study: does the model beat the guess?</b>To predict room temperature, the dull guess “always the average” is wrong by about 2.0 °C (RMSE). A regression using hour of day and outside light is wrong by 0.8 °C. Improvement: (2.0 − 0.8) ÷ 2.0 = <b>60 %</b>. Now a chi-square check on 100 observations: light on while occupied 40, light on while empty 10, light off while occupied 20, light off while empty 30. If light and occupancy were unrelated we would expect 30, 20, 30, 20. The distance from that: 100÷30 + 100÷20 + 100÷30 + 100÷20 = <b>16.7</b>, far above the 3.84 that would be surprising by luck, so the link is real.</div>
    <div class="expbox"><b>Try it yourself</b>Split your data: build a model on the first 70 % and test it on the last 30 %. Report the error of the model and of the “always guess the average” baseline. Which is better, and by how much?</div>`}
  ],
  quiz:[
   {q:"A model's training RMSE is 0.02 and test RMSE 0.15, close to the baseline 0.16. Best summary?", o:["Excellent","Overfitting: it memorised the training data and barely beats the baseline","The test set is bad","Underfitting"], a:1, e:"A large train–test gap and a test error near the baseline mean it learned the noise.", w:["","","",""]},
   {q:"Why fit and grade a model on different rows?", o:["To save time","Training error is optimistic; test rows show how it does on new data","It is a Colab rule","To use more memory"], a:1, e:"Only unseen data tests generalisation.", w:["","","",""]},
   {q:"Permutation importance of temperature is large. You may say…", o:["Temperature causes the gas level","The model relied heavily on temperature","Temperature is useless","Humidity is irrelevant"], a:1, e:"Importance describes the model, not nature.", w:["","","",""]},
   {q:"Row total 40, column total 50, grand total 100. Expected count for that cell…", o:["20","90","2","40"], a:0, e:"40 × 50 / 100 = 20.", w:["","","",""]},
   {q:"p = 0.03 in a chi-square test. What is the honest wording?", o:["There is a 3% chance the result is wrong","The pattern would be fairly rare if the variables were unrelated: some evidence of an association, with no information about cause or size","Proven cause","The effect is large"], a:1, e:"A p-value is about the data under 'no link', not about truth or importance.", w:["","","",""]},
   {q:"For a time series, the most honest test split is…", o:["Random rows","Earlier rows for training, later rows for testing","Test on the training rows","Only odd rows"], a:1, e:"Neighbouring readings are nearly identical, so a random split flatters the model.", w:["","","",""]}
  ],
  rating:["I fit a model and report one number.","I can split, set a baseline and report test error with a unit.","I can explain overfitting and read importance carefully.","I can run a chi-square test by hand and word the result without overclaiming."],
  checkpoint:{code:"U4-C8", task:"Predict one sensor from the others with regression and a forest: report baseline, train and test RMSE (with units) and a chronological-split check; list the importances with one careful sentence; and run a chi-square test on two categorical variables, showing the expected table and your wording of the p-value.", met:"Baseline reported; test error with unit; importance not described as cause; p-value worded correctly.", upload:"Upload your notebook."},
  refs:["sklearn","breiman","scipystats","gaise","ds4e"]
 },

 {id:"4.9", title:"From analysis to evidence: dashboard, interpretation and the data report", minutes:240,
  intro:"The robot collects the data; your analysis becomes evidence only when someone else can read it. You design a dashboard that shows results and their interpretation, write the interpretation honestly (what the data says, what it does not), and assemble a data report with the analytical deliverables for each sensor.",
  objectives:["Choose dashboard elements that answer the question: KPI tiles, trend with context, anomaly table, interpretation text.","Apply chart rules: titles, units, direct labels, a table fallback, and not relying on colour alone.","Write claims at the right strength: describe, associate, predict, cause.","Assemble a data report that links each claim to a chart or table and states the limits."],
  sections:[
   {id:"dash", title:"Design a results dashboard", keys:"dashboard design kpi trend annotation table fallback accessibility chart", html:ds4eMap("Strand E: visualize and communicate. Strand D: interpret in context.")+`
    <p class="plain"><b>In plain words (no maths needed)</b>A dashboard is a <b>one-page answer</b>: the key number, the trend, and one sentence saying what to do. If the reader needs you beside them to explain it, simplify it.</p>
    
    <p>A dashboard is a small number of answers on one screen. Start from the decision (module 4.1) and put on the page only what helps to make it.</p>
    <table class="t"><tr><th>Element</th><th>Shows</th><th>Why</th></tr>
     <tr><td>KPI tiles</td><td>Latest value, today's mean, number of anomalies</td><td>The answer at a glance, with units</td></tr>
     <tr><td>Trend chart</td><td>Raw and smoothed line, anomaly marks, a threshold line</td><td>Context: is "now" normal?</td></tr>
     <tr><td>Relationships</td><td>Correlation heat map or one scatter plot</td><td>What moves together</td></tr>
     <tr><td>Anomaly table</td><td>Timestamp, value, method</td><td>Action list; also the chart's text alternative</td></tr>
     <tr><td>Interpretation</td><td>2 to 3 sentences in plain language</td><td>Turns a chart into a finding</td></tr>
     <tr><td>Data quality</td><td>Rows used, repaired, missing</td><td>Lets the reader judge the evidence</td></tr></table>
    <p><b>Chart rules.</b> Give every chart a title that states the finding ("Gas ratio rose between 11:30 and 12:30"), label axes with units, label lines directly instead of relying on a colour legend, use a dash style as well as a colour so colour-blind readers can tell series apart, print numbers inside heat-map cells, keep text contrast high, and always provide the same data as a table (every chart in this course has a "Show as table" button for that reason).</p>`, interactive:["dashPreview","chartChooser"]},
   {id:"claims", title:"Interpretation: say exactly as much as the data supports", keys:"interpretation claims causation association prediction uncertainty limits error bars confidence", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>Say <b>exactly</b> as much as the data supports. “Temperature was higher when the fan was off” is an <b>association</b>. “The fan lowers temperature” is a <b>cause</b>, and only a fair experiment (fan on and off in turns, same conditions) can support that.</p>
    
    <p>There is a ladder of claims, and each rung needs stronger evidence:</p>
    <ol><li><b>Describe:</b> "Median temperature was 27.0 °C (IQR 5.6 °C) between 10 am and 3 pm."</li>
    <li><b>Associate:</b> "Heat index and fan state are associated (χ² = 16.7, p &lt; 0.001)."</li>
    <li><b>Predict:</b> "Gas ratio can be predicted from temperature, humidity and light with a test RMSE of 0.03."</li>
    <li><b>Cause:</b> only from a designed comparison (change one thing, hold the rest). Most of our data cannot support it.</li></ol>
    <p>Always attach a number to its <b>uncertainty</b>: sensor accuracy (±0.5 °C), sample size, missing periods, and the validity range of any formula. And always ask what <b>else</b> could explain the pattern: the sun drives light and temperature at once; the controller drives the fan.</p>
    ${ex("one finding, written three ways", `<p><b>Too weak:</b> "There was some variation." <b>Too strong:</b> "The fan reduces air pollution." <b>Right:</b> "Gas ratio was 12% higher between 11:30 and 12:30 than the daily median (anomaly flags: 12 readings, isolation forest). The data are from one room on one day, so we cannot say whether this repeats; the fan was OFF throughout."</p>`)}`, interactive:["gx_report"]},
   {id:"report", title:"The data report", keys:"data report structure deliverables chart table summary rmse calibration anomaly histogram", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>Your report is an <b>argument</b>: the question, how you collected, the evidence (one clear chart, one table), the limits, and the decision. One page of honest reasoning beats ten pages of charts.</p>
    
    <p>The report is the deliverable that shows your analysis, in the order a reader needs it. For each sensor in your prototype, include the analytical outputs below, then the sections that tie them together.</p>
    <table class="t"><tr><th>Sensor</th><th>Method</th><th>Report deliverable</th></tr>
     <tr><td>DHT11 / DHT22</td><td>Decomposition, interpolation</td><td>Time-series plot (trend vs seasonal); data-quality summary (raw vs imputed)</td></tr>
     <tr><td>MQ-2 / MQ-135</td><td>Log transform, scaling, isolation forest</td><td>Scatter plot of normalised readings; anomaly-flag report with timestamps</td></tr>
     <tr><td>HC-SR04</td><td>Hampel filter, RMSE and MAE</td><td>Error histogram against laser truth; RMSE summary</td></tr>
     <tr><td>TMP36</td><td>Moving average, polynomial regression</td><td>Calibration curve with R²; raw vs smoothed line graph</td></tr>
     <tr><td>LDR</td><td>Quantile binning, correlation</td><td>Correlation heat map; binned frequency chart</td></tr>
     <tr><td>Servo, DC motor</td><td>Logistic regression, survival, PID metrics</td><td>Confusion matrix; Kaplan–Meier chart; control-response table</td></tr></table>
    <p>Tick the sections you already have in the builder below to see what a reader will still ask for, then copy the outline.</p>
    ${tip("Make it repeatable", "<p>Someone else should be able to rerun your notebook on your CSV and get your numbers. Put the data dictionary, the cleaning log, the random seeds and the library versions in the report.</p>")}`, interactive:["reportBuilder"]},
   {id:"ship", title:"Getting results into your app", keys:"dashboard sheet results tab csv export apps script publish", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>“Shipping” means the results leave Colab and live where people look, such as a Results tab in your Sheet that your app reads. Re-run the notebook and the dashboard updates.</p>
    
    <p>The simplest honest route from analysis to app: export a small <b>results table</b> from Colab and import it into a <b>Results</b> tab of your Sheet; your Apps Script web app (Unit 3) reads that tab and draws the tiles, chart and interpretation text. Colab itself cannot write to your Sheet without extra sign-in, so a downloaded CSV keeps it simple and safe: no keys leave your hands.</p>
    ${code("python", `# Build a small results table for the dashboard (run after the earlier cells)
results = pd.DataFrame([
    ['mean_temp_c', round(clean['temp_c'].mean(), 2), 'deg C'],
    ['heat_index_max_c', round(clean['heat_index_c'].max(), 1), 'deg C'],
    ['rows_repaired', int(clean['hum_imputed'].sum()), 'rows'],
    ['gas_anomalies', int(flag_if.sum()), 'readings'],
    ['ultrasonic_rmse_cm', round(float(np.sqrt(((dist_clean - 25) ** 2).mean())), 2), 'cm'],
], columns=['metric', 'value', 'unit'])
results['interpretation'] = ['Typical daytime temperature', 'Peak how-hot-it-feels', 'Data quality', 'Review these times', 'Filtered distance error']
results.to_csv('results.csv', index=False)         # then: Colab folder panel > download, and File > Import into the Results tab
results`, "Colab: results table")}
    <p>Then, in Unit 5, you publish the app on GitHub Pages and include the data report with it. Keep the <b>raw data</b>, the <b>cleaning log</b> and the <b>notebook</b> next to the report.</p>`, interactive:["dashPreview"]}   ,{id:"casestudy", title:"Case study and experiment", keys:"case study experiment example worked numbers", html:`
    <div class="casebox"><b>Case study: the same chart, two honest sentences</b>Data: average temperature with the fan off was 28.1 °C and with the fan on 26.9 °C on different days. <b>Overclaim:</b> “The fan lowers the temperature by 1.2 °C.” <b>Supported:</b> “On the days the fan was on, the room averaged 1.2 °C cooler. The days differed in outside weather, so this is an association; an alternating on/off test would be needed to show cause.” The second sentence gives the reader what they need to decide.</div>
    <div class="expbox"><b>Try it yourself</b>Rewrite three conclusions from your own project: one claim you can support, one you cannot yet, and one extra experiment that would settle it.</div>`}
  ],
  quiz:[
   {q:"Which chart title is best?", o:["Chart 1","Gas ratio rose between 11:30 and 12:30","Gas","Data from the sensor"], a:1, e:"A good title states the finding.", w:["","","",""]},
   {q:"Why print numbers inside heat-map cells?", o:["Colour alone is not enough: some readers cannot tell the shades apart","To make the file bigger","It is a Python rule","To hide the colours"], a:0, e:"Never rely on colour alone.", w:["","","",""]},
   {q:"Which sentence claims causation?", o:["Heat index and fan state are associated","The fan reduces air pollution","Median temperature was 27.0 °C","Gas ratio can be predicted with RMSE 0.03"], a:1, e:"Only a designed comparison can support a causal claim.", w:["","","",""]},
   {q:"Which belongs in a data-quality summary?", o:["Only the final chart","Rows used, rows repaired, rows missing, and the method","The author's favourite colour","Nothing"], a:1, e:"Readers must see what you changed.", w:["","","",""]},
   {q:"A report number should include…", o:["As many decimals as possible","Its unit and its uncertainty","Only its colour","Nothing else"], a:1, e:"29.4 °C ± 0.5 °C is a finding; 29.4 is a number.", w:["","","",""]}
  ],
  rating:["A dashboard is a pretty chart.","I can list the elements a decision-oriented dashboard needs.","I can write claims at the right strength with uncertainty.","I can assemble a repeatable data report and feed results to my app."],
  checkpoint:{code:"U4-C9", task:"Design your dashboard (sketch or the preview), then write a data report using the outline: question, data and collection, data-quality summary, exploration, relationships, model or detector, limits and uncertainty, interpretation and recommendation, ethics. Include one deliverable per sensor you used.", met:"Every claim links to a chart or table; limits are stated; numbers carry units and uncertainty; the report can be repeated from the notebook.", upload:"Upload your report (PDF) and dashboard screenshot."},
  refs:["ds4e","gaise","tidy","pandas"]
 }
);
