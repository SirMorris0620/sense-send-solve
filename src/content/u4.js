/* ============ UNIT 4: DATA SCIENCE FOR IoT (aligned to the DS4E strands A-E) ============ */
const ds4eMap = rows => `<div class="callout think"><b>Where this fits in the data science progressions</b><p>${rows}</p><p class="explain">Strands from ${ct("ds4e")}: <b>A</b> Dispositions and Responsibility · <b>B</b> Creation and Curation · <b>C</b> Analysis and Modeling Techniques · <b>D</b> Interpreting Problems and Results · <b>E</b> Visualization and Communication.</p></div>`;
const synthData = code("python", `# A practice dataset that needs no kit: one day of readings every 5 minutes, with deliberate problems
import numpy as np, pandas as pd
rng = np.random.default_rng(42)
t = pd.date_range('2026-11-02 00:00', periods=288, freq='5min')
h = t.hour + t.minute / 60
temp = 27 + 4 * np.sin((h - 9) / 24 * 2 * np.pi) + rng.normal(0, 0.3, len(t))
hum = 70 - 2.2 * (temp - 27) + rng.normal(0, 1.5, len(t))
light = np.clip(50 + 45 * np.sin((h - 9) / 24 * 2 * np.pi), 0, 100) + rng.normal(0, 3, len(t))
df = pd.DataFrame({'timestamp': t, 'temp_c': temp.round(1), 'hum_pct': hum.round(1), 'light_pct': light.round(1)})
df.loc[100, 'temp_c'] = 85.0                 # a sensor glitch
df.loc[[40, 41, 150], 'hum_pct'] = np.nan    # missing readings
df = pd.concat([df, df.iloc[[10]]])          # a duplicate row
df.shape`, "Colab: make practice data");
COURSE.push({id:"u4", title:"Unit 4: Data science for IoT", sub:"From readings to evidence: collect, clean, explore, model, and communicate", blurb:"Your prototype makes data. This unit turns it into evidence with Python in Google Colab: good questions, honest collection, cleaning, statistics, charts, relationships, simple models, and responsible conclusions. No kit? Use the practice data.", modules:[

 {id:"4.1", title:"Questions and data you can trust", minutes:150,
  intro:"Data science starts with a question, not a chart. You will turn a problem into a measurable question, plan how to collect data fairly, record what a column means, and decide what is safe to collect.",
  objectives:["Turn a real problem into a question that data can answer.","Plan sampling: how often, how long, where, and why that is fair.","Explain the difference between random and convenience samples.","Write a data dictionary (name, unit, sensor, range).","Decide what data should not be collected."],
  sections:[
   {id:"q", title:"From problem to question", keys:"question measurable variable hypothesis", html:ds4eMap("Strand A and B: ask and refine a question; plan how the data will be created.")+`
    <p>"Is the classroom bad?" cannot be answered. "Is the temperature in Room 204 above 30 °C between 1 pm and 3 pm on school days?" can. A good question names: <b>what</b> you measure (variable and unit), <b>where</b>, <b>when</b>, <b>for whom</b>, and <b>what you would do</b> with the answer.</p>
    ${ex("from problem to question", `<p>Problem: students feel sleepy after lunch. Question: does CO₂-related air quality (an MQ-135 trend) or temperature rise most between 12 and 2 pm? Variables: <code>temp_c</code>, <code>gas_ratio</code>. Decision: open windows when the ratio exceeds 1.3 for 10 minutes.</p>`)}
    ${srcs(["ds4e","gaise"])}`, interactive:"kpiBuilder"},
   {id:"sample", title:"Sampling and instruments", keys:"sampling random convenience bias interval nyquist frequency", html:`
    <p><b>How often?</b> Sample at least twice as fast as the thing you want to see change (a room's temperature changes over minutes, so one reading per minute is plenty; a door opening takes seconds). <b>How long?</b> Cover the cycle: one day, or several school days. <b>Where?</b> A sensor next to the board's regulator reads warm; put it where the question is.</p>
    <p>A <b>convenience sample</b> (the reading you happened to take) is easy but can mislead. A <b>random or systematic sample</b> (every 5 minutes on a timer, in several places) reduces bias (${ct("gaise")}).</p>`, interactive:"samplingLab"},
   {id:"dict", title:"Data dictionary and tidy columns", keys:"data dictionary tidy units metadata", html:`
    <p>Write down what each column is. Without units, <code>25</code> is meaningless.</p>
    <table class="t"><tr><th>Column</th><th>Meaning</th><th>Unit</th><th>Sensor</th><th>Valid range</th></tr>
     <tr><td>timestamp</td><td>When the server stored it</td><td>ISO date-time</td><td>Server clock</td><td>—</td></tr>
     <tr><td>device_id</td><td>Which board</td><td>text</td><td>—</td><td>letters, digits, - _</td></tr>
     <tr><td>temp_c</td><td>Air temperature</td><td>°C</td><td>DHT22 or TMP36</td><td>−10 to 60</td></tr>
     <tr><td>hum_pct</td><td>Relative humidity</td><td>%</td><td>DHT22</td><td>0 to 100</td></tr></table>
    <p>Tidy data (${ct("tidy")}): each variable is a column, each observation is a row, each type of unit is a table.</p>
    ${srcs(["tidy"])}`, interactive:"dataVolume"},
   {id:"ethics", title:"Responsibility: what not to collect", keys:"privacy ethics consent personal data", html:`
    <p>Strand A is about responsibility. A temperature log is harmless; a log of when each person enters a room is not. Before you collect: <b>Do we need it? Who could be harmed if it leaked? Have people agreed? How long do we keep it? Who can see it?</b> A PIR sensor can reveal when people are present. Collect the least data that answers your question.</p>`, interactive:"privacySort"}
  ],
  quiz:[
   {q:"Which is a measurable question?", o:["Is the room bad?","Is the room above 30 °C between 1 and 3 pm on school days?","Is the sensor nice?","Why is it hot?"], a:1, e:"It names the variable, unit, place, and time.", w:["Too vague.","","","Too broad to measure."]},
   {q:"A reading you happened to take when you walked by is a…", o:["Random sample","Convenience sample","Census","Calibration"], a:1, e:"Convenience samples are easy but can be biased.", w:["","","",""]},
   {q:"Why write a data dictionary?", o:["It is required by law","So everyone knows what each column and unit means","To make the file bigger","To hide errors"], a:1, e:"Meaning and units prevent mistakes.", w:["","","",""]},
   {q:"Which data deserves the most care?", o:["Room temperature","When each named student enters the lab","Light level","Distance to a wall"], a:1, e:"Data about people's presence is personal.", w:["","","",""]}
  ],
  rating:["I think of data as numbers.","I can write a measurable question.","I can plan sampling and a data dictionary.","I can critique a classmate's data plan for bias and privacy."],
  checkpoint:{code:"U4-C1", task:"Write your measurable question, sampling plan (interval, duration, places), and a four-row data dictionary. Add one sentence about data you will not collect.", met:"Question names variable, place, time, and decision; plan justifies the interval; dictionary has units.", upload:"Upload your plan."},
  refs:["ds4e","gaise","tidy"]
 },

 {id:"4.2", title:"Python and Colab: load and clean data", minutes:180,
  intro:"Real data is messy. You will load readings into pandas in Google Colab, find missing values, duplicates, wrong units, and impossible readings, and decide what to do about each, while keeping the raw data untouched.",
  objectives:["Run code in Colab and load a CSV or a Sheet into a DataFrame.","Inspect shape, types, missing values, and duplicates.","Clean data and keep a record of every change.","Resample irregular readings to a regular interval."],
  sections:[
   {id:"colab", title:"Your first Colab notebook", keys:"colab notebook cell python pandas", html:ds4eMap("Strand B: create, clean, and curate data.")+`
    <p>Colab (${ct("colab")}) is a notebook of <b>cells</b>. Text cells explain; code cells run Python; press <b>Shift+Enter</b> to run a cell. Variables stay in memory between cells. Save to your Drive: <b>File → Save a copy in Drive</b>.</p>
    <p>No kit yet? Start with practice data:</p>
    ${synthData}
    ${srcs(["colab","pandas"])}`, interactive:""},
   {id:"inspect", title:"Inspect before you trust", keys:"info describe isna duplicated dtypes", html:`
    ${code("python", `df.info()                       # types and non-null counts
print(df.isna().sum())          # missing values per column
print(df.duplicated().sum())    # duplicate rows
df.describe()                   # min, max, mean ... spot impossible values (temp 85?)`, "Colab: inspect")}
    <p>Look for: a <b>maximum</b> far from the rest (glitch), a <b>minimum of 0</b> (failed read), <b>NaN</b> (missing), the same timestamp twice (duplicate), and values in the wrong unit (°F instead of °C).</p>`, interactive:""},
   {id:"clean", title:"Clean, and keep a log", keys:"clean drop fillna interpolate resample copy raw", html:`
    ${code("python", `raw = df.copy()                                   # never change the raw data
clean = df.drop_duplicates().copy()
clean['timestamp'] = pd.to_datetime(clean['timestamp'])
clean = clean.set_index('timestamp').sort_index()

# impossible values -> missing (the sensor's valid range is -10..60 C)
clean.loc[~clean['temp_c'].between(-10, 60), 'temp_c'] = np.nan

# fill short gaps by interpolation (only up to 3 readings in a row)
clean = clean.interpolate(limit=3)

# regular 5-minute grid (irregular uploads become tidy rows)
clean = clean.resample('5min').mean()
log = ['removed duplicate rows', 'temp_c outside -10..60 set to missing', 'gaps up to 3 readings interpolated', 'resampled to 5 min']
clean.isna().sum()`, "Colab: clean and log")}
    ${mis(`<p>Silently deleting rows that "look wrong". Decide with a rule (a valid range), apply it to everything, and write it in the log. Hiding an inconvenient value is bad science.</p>`)}
    ${tip("Why interpolate with a limit?", `<p>Filling a 5-minute gap is reasonable; filling a 5-hour gap invents data. A <code>limit</code> keeps the guess small.</p>`)}`, interactive:""},
   {id:"load", title:"Load your own data", keys:"read_csv gspread thingspeak firebase load", html:`
    <table class="t"><tr><th>Track</th><th>How you loaded data in Unit 3</th></tr><tr><td>A</td><td>gspread → DataFrame → <code>pivot_table</code></td></tr><tr><td>B</td><td>requests + ID token → <code>DataFrame.from_dict</code></td></tr><tr><td>C</td><td>boto3 scan → DataFrame (convert Decimal to numbers)</td></tr><tr><td>D</td><td>Exported CSV → <code>read_csv</code></td></tr><tr><td>E</td><td>feeds.csv → <code>read_csv</code></td></tr></table>
    <p>After loading, rename columns to the names in your data dictionary, then run the inspect and clean cells above.</p>`, interactive:""}
  ],
  quiz:[
   {q:"Why keep a copy of the raw data?", o:["To use more memory","So every cleaning step can be checked or undone","Because Colab requires it","To make charts"], a:1, e:"Raw data is the evidence.", w:["","","",""]},
   {q:"df.isna().sum() shows…", o:["The mean","Missing values per column","Duplicate rows","The data types"], a:1, e:"It counts NaN in each column.", w:["","","",""]},
   {q:"A temperature reading of 85 °C in a classroom is probably…", o:["True","A sensor glitch to flag with a rule","A new record","A unit change"], a:1, e:"Impossible values are flagged by a documented valid range.", w:["","","",""]},
   {q:"Why limit interpolation?", o:["Python requires it","To avoid inventing long stretches of data","To save time","To sort the table"], a:1, e:"Small gaps are reasonable to fill; large ones are not.", w:["","","",""]}
  ],
  rating:["I have not used Colab.","I can load data and run cells.","I can find and fix missing values, duplicates, and glitches.","I can explain my cleaning log to a skeptic."],
  checkpoint:{code:"U4-C2", task:"In Colab, load your data (or the practice data), run the inspect cells, clean it, and show your cleaning log.", met:"Notebook shows raw vs clean counts and a log with a rule for each change.", upload:"Upload a screenshot or the notebook link (sharing off if data is personal)."},
  refs:["colab","pandas","tidy","ds4e"]
 },

 {id:"4.3", title:"Describe and visualize", minutes:180,
  intro:"Statistics summarise many numbers into a few. Charts show them. You will compute mean, median, spread, and outliers, choose the right chart, and learn how charts can mislead.",
  objectives:["Compute and interpret mean, median, standard deviation, quartiles, and the outlier rule.","Choose a chart for a question.","Make clear, labelled charts with Matplotlib.","Spot a misleading chart."],
  sections:[
   {id:"stats", title:"Centre and spread", keys:"mean median standard deviation iqr quartile outlier boxplot", html:ds4eMap("Strand C: analysis techniques. Strand E: visualization and communication.")+`
    <p>The <b>mean</b> is the average; the <b>median</b> is the middle value and ignores spikes. The <b>standard deviation</b> (sd) measures typical distance from the mean. The <b>IQR</b> is Q3 − Q1; the <b>boxplot rule</b> marks a value as an outlier if it is below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR.</p>
    ${code("python", `s = clean['temp_c'].dropna()
print(s.mean(), s.median(), s.std())
q1, q3 = s.quantile([0.25, 0.75])
iqr = q3 - q1
outliers = s[(s < q1 - 1.5 * iqr) | (s > q3 + 1.5 * iqr)]
print(len(outliers), 'outliers')`, "Colab: summary and outlier rule")}
    `, interactive:["statsLab","sandbox:sb_stats"]},
   {id:"chart", title:"Choosing a chart", keys:"line bar scatter histogram boxplot chart choice", html:`
    <table class="t"><tr><th>Question</th><th>Chart</th></tr><tr><td>How does it change over time?</td><td>Line</td></tr><tr><td>How are values spread?</td><td>Histogram or boxplot</td></tr><tr><td>Are two measurements related?</td><td>Scatter</td></tr><tr><td>Compare groups (rooms, days)?</td><td>Bar or boxplot per group</td></tr></table>
    ${code("python", `import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(8, 3.5))
ax.plot(clean.index, clean['temp_c'], lw=1)
ax.set_ylabel('Temperature (°C)'); ax.set_title('Room 204 temperature, 2 Nov 2026')
ax.axhline(30, color='red', ls='--', label='30 °C limit'); ax.legend()
plt.tight_layout()`, "Colab: a labelled line chart")}
    <p>Every chart needs a title that says what you see, labelled axes with units, and a source.</p>`, interactive:["chartChooser","dashCritique"]},
   {id:"mislead", title:"Charts that mislead", keys:"misleading chart truncated axis scale", html:`
    <ul><li><b>Cut-off axis</b>: a y-axis starting at 28 °C makes a 1 °C rise look huge.</li><li><b>Too few points</b>: one afternoon is not a trend.</li><li><b>Dual axes</b>: two lines scaled to look related.</li><li><b>Missing context</b>: no unit, no date, no sample size.</li></ul>
    <p>Ask of any chart: <i>who made it, what is missing, and what decision does it push me toward?</i></p>`, interactive:""}
  ],
  quiz:[
   {q:"Which summary ignores a single spike?", o:["Mean","Median","Sum","Maximum"], a:1, e:"The median is resistant to outliers.", w:["","","",""]},
   {q:"The boxplot rule flags a value above…", o:["Q3","Q3 + 1.5 × IQR","The mean","Q1"], a:1, e:"1.5 × IQR beyond the quartiles.", w:["","","",""]},
   {q:"Best chart for 'Are temperature and humidity related?'", o:["Pie","Scatter","Line only","Table"], a:1, e:"Scatter shows relationship between two variables.", w:["","","",""]},
   {q:"A y-axis that starts at 28 °C instead of 0 makes small changes look…", o:["Smaller","Bigger","The same","Invalid always"], a:1, e:"It exaggerates differences; label it clearly or start lower.", w:["","","",""]}
  ],
  rating:["I know the word 'average'.","I can compute mean and median.","I can make a labelled chart and flag outliers.","I can critique a misleading chart."],
  checkpoint:{code:"U4-C3", task:"Pass the statistics mission, then produce one line chart and one histogram from your cleaned data with titles and units.", met:"Mission passes; two labelled charts.", upload:"Upload the charts."},
  refs:["matplotlib","pandas","gaise","ds4e"]
 },

 {id:"4.4", title:"Signals, anomalies, and relationships", minutes:210,
  intro:"Sensor data is a signal with noise, drift, spikes, and real events. You will filter noise, detect unusual readings, measure how two variables move together, fit a line, and test whether a pattern could be chance.",
  objectives:["Smooth with a rolling mean and remove spikes with a rolling median.","Detect anomalies with a z-score rule (on the device and in Python).","Compute correlation and fit a line; explain correlation versus causation.","Use a shuffle test to ask 'could this be chance?'."],
  sections:[
   {id:"filter", title:"Filtering noise", keys:"rolling mean median filter noise spike", html:ds4eMap("Strand C: modeling techniques. Strand D: interpreting results.")+`
    ${code("python", `clean['temp_smooth'] = clean['temp_c'].rolling(5, center=True).median()   # removes spikes
clean['temp_avg'] = clean['temp_c'].rolling(6, center=True).mean()       # smooths jitter
clean[['temp_c', 'temp_smooth']].plot(figsize=(9, 3))`, "Colab: rolling filters")}
    <p>The same idea runs on the board in C++ (a median of 3 or 5 samples). Filter on the device when you must send less data; keep raw data in the cloud when you may need to re-analyse.</p>`, interactive:["signalLab","sandbox:sb_filter"]},
   {id:"anom", title:"Anomaly detection", keys:"anomaly zscore threshold alert", html:`
    <p>A reading is <b>unusual</b> if it is far from the recent normal. The <b>z-score</b> is (value − mean) ÷ sd; |z| &gt; 3 happens by chance in only about 0.3 % of normal data. Compute the mean and sd from the <i>previous</i> readings (not including the new one).</p>
    ${code("python", `w = clean['temp_c'].rolling(20)
z = (clean['temp_c'] - w.mean().shift(1)) / w.std().shift(1)
alerts = clean[z.abs() > 3]
alerts`, "Colab: z-score alerts")}
    ${mis(`<p>Including the new value in its own baseline: a big spike raises the mean and sd and hides itself.</p>`)}`, interactive:"sandbox:sb_anomaly"},
   {id:"rel", title:"Relationships and lines", keys:"correlation regression linear fit causation", html:`
    <p><b>Correlation</b> r runs from −1 to 1: how closely two variables follow a straight line together. A <b>regression line</b> predicts y from x. Correlation is <b>not</b> causation: ice-cream sales and sunburn rise together because of the sun.</p>
    ${code("python", `r = clean['temp_c'].corr(clean['hum_pct'])
import numpy as np
m, b = np.polyfit(clean['temp_c'].dropna(), clean['hum_pct'].reindex(clean['temp_c'].dropna().index).interpolate(), 1)
print('r =', round(r, 2), ' humidity ~', round(m, 2), '* temp +', round(b, 1))`, "Colab: correlation and a line")}`, interactive:"corrLab"},
   {id:"shuffle", title:"Could it be chance?", keys:"shuffle permutation test chance", html:`
    <p>Is the afternoon really warmer than the morning, or could the difference appear by luck? <b>Shuffle</b> the labels many times, record the difference each time, and see how often chance produces a difference as big as the real one.</p>
    ${code("python", `am = clean.between_time('08:00', '11:00')['temp_c'].dropna()
pm = clean.between_time('13:00', '16:00')['temp_c'].dropna()
real = pm.mean() - am.mean()
allv = np.concatenate([am, pm]); n = len(pm); diffs = []
for _ in range(2000):
    rng.shuffle(allv)
    diffs.append(allv[:n].mean() - allv[n:].mean())
print('real difference', round(real, 2), '; shuffles as extreme:', np.mean(np.abs(diffs) >= abs(real)))`, "Colab: a shuffle test")}`, interactive:""}
  ],
  quiz:[
   {q:"A median filter removes…", o:["Slow drift","Single-sample spikes","Everything","The mean"], a:1, e:"It ignores outliers in the window.", w:["","","",""]},
   {q:"Why compute the z-score baseline from previous readings only?", o:["It is faster","A spike would otherwise hide itself","Python requires it","To reduce memory"], a:1, e:"Use the past to judge the present.", w:["","","",""]},
   {q:"r = 0.9 between ice-cream sales and sunburn means…", o:["Ice cream causes sunburn","They move together; a third factor (sun) explains both","The data are wrong","Nothing"], a:1, e:"Correlation is not causation.", w:["","","",""]},
   {q:"In a shuffle test, a tiny fraction of shuffles as extreme as the real difference suggests…", o:["It is probably chance","Chance alone rarely explains it","The test failed","The data are missing"], a:1, e:"Rarely seeing it by chance supports a real difference.", w:["","","",""]}
  ],
  rating:["I see only wiggly lines.","I can filter and flag anomalies.","I can compute correlation and a line.","I can explain correlation versus causation and a shuffle test."],
  checkpoint:{code:"U4-C4", task:"Pass the filter and anomaly missions. In Colab produce one correlation (with r) and one sentence that avoids claiming causation.", met:"Missions pass; r and a careful sentence.", upload:"Upload the notebook cell output."},
  refs:["pandas","sklearn","gaise","ds4e"]
 },

 {id:"4.5", title:"Models, decisions, and responsible conclusions", minutes:210,
  intro:"A model turns data into a prediction or a rule. You will fit a simple predictor, build a threshold classifier and measure its mistakes, compare with published data, count the energy and privacy cost, and write a conclusion that says what you know and do not know.",
  objectives:["Fit and evaluate a simple linear model with a train/test split.","Build a threshold rule and measure false alarms and misses.","Compare your results with an official data source.","Write a conclusion with uncertainty and limits.","Account for the energy and privacy cost of data and cloud tools."],
  sections:[
   {id:"model", title:"A simple predictive model", keys:"scikit-learn linear regression train test split rmse", html:ds4eMap("Strand C: modeling. Strand D: interpret and evaluate. Strand A: responsibility.")+`
    <p>Predict tomorrow's value from today's data only if you can test the prediction. <b>Split</b> the data: fit on the first part (train), measure on the rest (test).</p>
    ${code("python", `from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error
d = clean.dropna(subset=['temp_c', 'hum_pct', 'light_pct'])
X, y = d[['light_pct', 'hum_pct']], d['temp_c']
cut = int(len(d) * 0.7)
model = LinearRegression().fit(X[:cut], y[:cut])
pred = model.predict(X[cut:])
print('mean absolute error on unseen data:', round(mean_absolute_error(y[cut:], pred), 2), '°C')`, "Colab: train and test")}
    ${srcs(["sklearn"])}`, interactive:""},
   {id:"rule", title:"Threshold rules and their mistakes", keys:"threshold false positive false negative confusion", html:`
    <p>Many IoT systems are really rules: <i>if temp &gt; 30 for 10 minutes, send an alert</i>. A rule makes two kinds of mistakes: <b>false alarms</b> (alert when fine) and <b>misses</b> (silent when it matters). Moving the threshold trades one for the other. Decide which mistake is worse for your users.</p>
    ${code("python", `truth = clean['temp_c'] > 30                      # what we call 'too hot'
for th in (29, 30, 31):
    alert = clean['temp_avg'] > th                  # what the system says
    false_alarms = int((alert & ~truth).sum()); misses = int((~alert & truth).sum())
    print(th, 'false alarms', false_alarms, 'misses', misses)`, "Colab: false alarms and misses")}`, interactive:"sandbox:sb_guardian"},
   {id:"compare", title:"Compare with a trusted source", keys:"validate pagasa official data compare", html:`
    <p>Check your data against a trusted source: the official weather station nearest you (for example from your national weather service), or a calibrated thermometer. If your sensor is steadily 2 °C higher, correct it (calibration) or say so in your report. Agreement strengthens a claim; disagreement is a finding, not a failure.</p>`, interactive:""},
   {id:"concl", title:"Write the conclusion", keys:"conclusion limits uncertainty energy privacy", html:`
    <p>A strong conclusion has five parts: <b>answer</b> (to your question), <b>evidence</b> (a number and a chart), <b>uncertainty</b> (sensor accuracy, sample size, period), <b>limits</b> (what you did not measure), and <b>action</b> (what should change). Avoid "proves"; prefer "suggests" when evidence is limited.</p>
    <p><b>Cost check (Strand A):</b> a board that sends every 5 seconds all year creates about 6 million rows and uses cloud and network energy. Send as rarely as your question allows, delete data you no longer need, and keep personal data out.</p>`, interactive:"rubricSelf"}
  ],
  quiz:[
   {q:"Why test a model on data it was not trained on?", o:["To make it slower","To see if it works on new data","Python needs it","To use more rows"], a:1, e:"Training error is optimistic.", w:["","","",""]},
   {q:"Lowering an alert threshold usually causes…", o:["More false alarms, fewer misses","Fewer false alarms, more misses","Nothing","No alerts"], a:0, e:"A lower threshold triggers more often.", w:["","","",""]},
   {q:"Which word is safest in a conclusion from a small sample?", o:["Proves","Suggests","Guarantees","Always"], a:1, e:"Match your language to your evidence.", w:["","","",""]},
   {q:"Sending data every 5 s all year when your question needs 5 min is…", o:["Better science","Wasteful: more storage, energy, and risk","Required","Harmless"], a:1, e:"Collect only what answers the question.", w:["","","",""]}
  ],
  rating:["I know models exist.","I can fit and test a simple model.","I can measure a rule's mistakes and compare with a source.","I can write a limited, honest conclusion."],
  checkpoint:{code:"U4-C5", task:"Using your data, write a five-part conclusion (answer, evidence, uncertainty, limits, action) and one false-alarm/miss table for a threshold you choose.", met:"All five parts; a table with two thresholds.", upload:"Upload your conclusion."},
  refs:["sklearn","gaise","ds4e","pandas"]
 }
]});
