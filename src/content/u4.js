/* ============ UNIT 4: DATA SCIENCE FOR IoT. The prototype is the data-collection tool; the analysis is the product. ============
   Modules 4.1-4.3 here, 4.4-4.6 in u4b.js, 4.7-4.9 in u4c.js. Aligned to the DS4E strands A-E. All maths is computed in ds_kit.js and tested. */
const ds4eMap = rows => `<div class="callout think"><b>Where this fits in the data science progressions</b><p>${rows}</p><p class="explain">Strands from ${ct("ds4e")}: <b>A</b> Dispositions and Responsibility · <b>B</b> Creation and Curation · <b>C</b> Analysis and Modeling Techniques · <b>D</b> Interpreting Problems and Results · <b>E</b> Visualization and Communication.</p></div>`;
const synthData = code("python", `# PRACTICE DATA (no kit needed): one day of readings every 5 minutes, with deliberate problems to find and fix.
# Run every cell in this unit from top to bottom: later cells use variables made by earlier ones.
import numpy as np, pandas as pd, matplotlib.pyplot as plt
rng = np.random.default_rng(42)
t = pd.date_range('2026-11-02 00:00', periods=288, freq='5min')
h = (t.hour + t.minute / 60).to_numpy()
s = np.sin((h - 9) / 24 * 2 * np.pi)                       # a smooth daily cycle
temp = 27 + 4 * s + rng.normal(0, 0.3, len(t))               # DHT22 / TMP36 (deg C)
hum = 70 - 2.2 * (temp - 27) + rng.normal(0, 1.5, len(t))    # DHT22 (%)
light = np.clip(50 + 45 * s, 0, 100) + rng.normal(0, 3, len(t))    # LDR (% of full scale)
gas = 1 + 0.04 * (temp - 24) + rng.normal(0, 0.01, len(t))   # MQ-135, Rs/R0 ratio
gas[(h > 11.5) & (h < 12.5)] += 0.25                          # a real event around noon
dist = 25 + rng.normal(0, 0.6, len(t))                       # ultrasonic (cm), wall at 25 cm
pir = [0]
for _ in range(len(t) - 1):                                  # PIR: 1 = motion
    pir.append(int(rng.random() < (0.75 if pir[-1] else 0.10)))
df = pd.DataFrame({'timestamp': t, 'temp_c': temp.round(1), 'hum_pct': hum.round(1), 'light_pct': light.round(1),
                   'gas_ratio': gas.round(3), 'dist_cm': dist.round(1), 'pir': pir})
df.loc[100, 'temp_c'] = 85.0                  # a sensor glitch
df.loc[[40, 41, 150], 'hum_pct'] = np.nan     # missing readings
df.loc[[30, 95, 200], 'dist_cm'] = [180, 240, 400]   # ghost echoes
df = pd.concat([df, df.iloc[[10]]])           # a duplicate row
df.shape`, "Colab: make practice data");
COURSE.push({id:"u4", title:"Unit 4: Data analysis and data science", sub:"The prototype collects the data. You turn it into evidence, an app or dashboard, and a report.", blurb:"The robotics prototype is a data-collection tool. This unit teaches the analysis that turns its messy readings into evidence: cleaning, smoothing, feature engineering, calibration, anomaly detection, filtering, correlation, prediction and testing, with the mathematics shown step by step and an interactive lab for every method. It ends with a dashboard that shows results and interpretation, and a data report. No kit? Use the practice data.", modules:[

 {id:"4.1", title:"The data science workflow and collecting data you can trust", minutes:150,
  intro:"Your Arduino is an edge device: it turns physical things (heat, light, gas, distance, motion) into numbers. The numbers are messy. Data science is the work of getting from messy numbers to a decision you can defend. In this module you see the whole loop, collect data properly, and learn why noise is not the enemy if you understand it.",
  objectives:["Describe the data science loop and say what can go wrong at each stage.","Turn a problem into a measurable question.","Plan sampling (how often, how long, where) and write a data dictionary.","Explain why averaging n readings reduces random error by a factor of √n.","Log sensor data to a CSV, from the Sheet or from Serial."],
  sections:[
   {id:"loop", title:"The loop: ask, collect, clean, explore, model, report", keys:"data science workflow loop pipeline cycle", html:ds4eMap("Strand A: dispositions and responsibility. Strand B: creating data. This module is the map for everything after it.")+`
    <p class="plain"><b>In plain words (no maths needed)</b>Think of cooking from a new recipe: you taste, adjust, taste again. Data science is the same loop. You <b>ask</b> a question, <b>collect</b> data, <b>clean</b> it, <b>explore</b> it, <b>model</b> it and <b>report</b>. Tasting something strange sends you back a step, and that is normal, not failure.</p>
    
    <p>Data science is not a straight line. You ask, collect, clean, explore, model and report, and then something in the exploration sends you back to collect again. Each stage has its own typical mistake. Click through them.</p>
    <p>The prototype you built in Units 1 to 3 is stage 2. Everything in Unit 4 is stages 3 to 6. Your <b>deliverables</b> are (1) the prototype that collects data, (2) an app or dashboard that shows the results and what they mean, and (3) a <b>data report</b> that argues from the analysis.</p>
    ${srcs(["ds4e"])}`, interactive:"dsPipeline"},
   {id:"q", title:"From problem to a measurable question", keys:"question measurable variable hypothesis decision", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>A good question has a <b>number, a unit, a place and a time</b>. “Is it hot?” cannot be answered. “Does the greenhouse stay below 32 °C between 10 am and 3 pm?” can: you know exactly what to measure and what counts as yes.</p>
    
    <p>"Is the greenhouse bad?" cannot be answered. "Does the greenhouse stay under 32 °C between 10 am and 3 pm on school days?" can. A good question names <b>what</b> you measure (variable and unit), <b>where</b>, <b>when</b>, and the <b>decision</b> the answer will change (for example, switch the fan on).</p>
    ${ex("one prototype, one question, one decision", `<p><b>Prototype:</b> a smart greenhouse. <b>Sensors:</b> DHT22 and MQ-135. <b>Question:</b> "How often does the heat index exceed 38 °C between 10 am and 3 pm, and does the gas ratio rise at the same time?" <b>Decision:</b> set the fan threshold, and decide whether the fan helps air quality as well as temperature.</p>`)}
    ${tryit("Write your own question in one sentence. Underline the variable, the unit, the place, the time and the decision. If one is missing, the question is not ready.")}`, interactive:"kpiBuilder"},
   {id:"sample", title:"Sampling: how often, how long, where", keys:"sampling interval nyquist convenience random systematic bias", html:`
    <p class="plain"><b>In plain words (no maths needed)</b><b>Sampling</b> means how often you look. Look too rarely and you miss quick changes, like taking one photo a day of a running race. A safe rule: sample at least <b>twice as fast</b> as the quickest change you care about, and record for long enough to see a few repeats of the pattern (a few days for daily cycles).</p>
    
    <p><b>How often?</b> At least twice as fast as the fastest change you care about (a room's temperature changes over minutes, so one reading per minute is plenty; a door opening takes seconds). <b>How long?</b> Long enough to see the cycle: at least one full day for temperature, a week for a daily pattern with a trend. <b>Where?</b> Away from heat sources, with a second sensor if you can.</p>
    <p>A <b>convenience sample</b> (the reading you happened to take) is easy but can mislead. A <b>systematic sample</b> (every 5 minutes on a timer) reduces bias (${ct("gaise")}).</p>
    ${ex("how many readings is that?", `<p>One reading every 5 minutes is 12 per hour, so 12 × 24 = <b>288 per day</b>. Over 7 days that is 2,016 rows. At about 60 bytes a row that is 120 KB: tiny. A Google Sheet holds up to 10 million cells, so for these small experiments the limit is your patience, not storage.</p>`)}
    ${srcs(["gaise"])}`, interactive:["samplingLab","dataVolume"]},
   {id:"noise", title:"Noise and the square-root law", keys:"noise random error standard error average sqrt n", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>Every sensor wobbles a little, even in a perfectly steady room. That wobble is <b>noise</b>. If you take many readings and average them, the ups and downs cancel out. The catch: to make the wobble <b>half</b> as big you need <b>four times</b> as many readings, so there are diminishing returns.</p>
    
    <p>Every reading is <b>truth + error</b>. The random part of the error is called noise. The good news: if the errors are random, averaging several readings cancels some of them. The size of the leftover error of the average of <i>n</i> readings is the <b>standard error</b>:</p>
    ${MX.eq(`SE = ${MX.fr(MX.v("σ"), MX.rt(MX.v("n")))}`)}
    <p>where σ is the standard deviation of a single reading. Four times as many readings halves the error. That law has a price: 100 readings are only 10 times better than 1, not 100 times. And averaging cannot fix a <b>bias</b> (a sensor that always reads 1 °C high). Bias needs calibration (module 4.3).</p>
    ${ex("DHT22 noise", `<p>A DHT22 sits in still air; one reading has σ = 0.5 °C. Average 25 readings: SE = 0.5 ÷ √25 = 0.5 ÷ 5 = <b>0.1 °C</b>. To reach 0.05 °C you need σ/√n = 0.05, so n = (0.5 ÷ 0.05)² = <b>100</b> readings.</p>`)}
    ${mis(`Thinking that more readings always make the data accurate. Noise shrinks like 1/√n, but bias, a badly placed sensor, or a wrong unit does not shrink at all.`)}`, interactive:"noiseLab"},
   {id:"get", title:"Getting the data out: Sheet, CSV and Serial", keys:"csv serial pyserial sheet export data dictionary tidy", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>Your data must leave the board as a tidy table: <b>one row per reading, one column per measurement, and a timestamp</b>. A CSV file is just a text file with commas between the boxes; every spreadsheet and Python can open it.</p>
    
    <p>Three routes into Python. <b>1. From your Sheet</b> (Units 2 and 3): File → Download → CSV, or publish the Sheet as CSV. <b>2. From Serial</b>: the board prints one line per reading and a small program on your computer saves them. <b>3. Practice data</b>: the cell below, for learners without a kit. Whatever the route, write the <b>data dictionary</b> first: without units, <code>25</code> means nothing.</p>
    <table class="t"><tr><th>Column</th><th>Meaning</th><th>Unit</th><th>Sensor</th><th>Valid range</th></tr>
     <tr><td>timestamp</td><td>When the reading was stored</td><td>date-time</td><td>server clock</td><td>—</td></tr>
     <tr><td>temp_c</td><td>Air temperature</td><td>°C</td><td>DHT22 or TMP36</td><td>−10 to 60</td></tr>
     <tr><td>hum_pct</td><td>Relative humidity</td><td>%</td><td>DHT22</td><td>0 to 100</td></tr>
     <tr><td>light_pct</td><td>Light level</td><td>% of full scale</td><td>LDR</td><td>0 to 100</td></tr>
     <tr><td>gas_ratio</td><td>Rs/R0, gas sensor</td><td>unitless ratio</td><td>MQ-135</td><td>0.2 to 5</td></tr>
     <tr><td>dist_cm</td><td>Distance to nearest object</td><td>cm</td><td>HC-SR04</td><td>2 to 400</td></tr>
     <tr><td>pir</td><td>Motion</td><td>0 or 1</td><td>HC-SR501</td><td>0 or 1</td></tr></table>
    <p>Tidy data (${ct("tidy")}): each variable is a column, each observation is a row.</p>
    ${code("python", `# OPTIONAL, run on your own computer (not in Colab): save Serial lines to a CSV. pip install pyserial
import serial, csv, time
port = serial.Serial('COM3', 115200, timeout=2)      # use /dev/ttyACM0 on Linux, /dev/cu.usbmodem... on Mac
with open('readings.csv', 'a', newline='') as f:
    w = csv.writer(f)
    while True:
        line = port.readline().decode(errors='ignore').strip()   # e.g. 29.4,68.2,55
        if line: w.writerow([time.strftime('%Y-%m-%d %H:%M:%S'), *line.split(',')])`, "On your computer: pySerial logger (not run in Colab)")}
    ${synthData}
    ${srcs(["tidy","pyserial","pandas"])}`, interactive:"dataVolume"},
   {id:"ethics", title:"Responsibility: what not to collect", keys:"privacy ethics consent personal data", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>Collect only what you need to answer your question. If people can be identified (in a room, on a camera, by a phone), get their permission first, or choose a sensor that does not identify anyone, like a PIR or a door counter.</p>
    
    <p>A temperature log is harmless. A log of when each named person enters a room is not, and a PIR in a classroom is close to that line. Before you collect, ask: <b>Do we need it? Who could be harmed if it leaked? Have the people agreed? How long do we keep it? Who can see it?</b> Aggregate (counts per hour) rather than identify (who was there), and say so in your report.</p>`, interactive:"privacySort"}   ,{id:"casestudy", title:"Case study and experiment", keys:"case study experiment example worked numbers", html:`
    <div class="casebox"><b>Case study: the greenhouse question</b>Mina wants to know whether the greenhouse stays under 32 °C between 10:00 and 15:00. Her DHT22 wobbles by about ±0.5 °C on a single reading. Averaging 9 readings (one every 10 seconds) shrinks the wobble to about 0.5 ÷ √9 = <b>±0.17 °C</b>. Her averages at 10:00, 11:00 and 12:00 are 30.8, 31.9 and 32.6 °C. The honest answer: <b>“It exceeded 32 °C from about 11:30 on, by a margin larger than the sensor error.”</b> A precise question produced a precise answer.</div>
    <div class="expbox"><b>Try it yourself</b>Take 20 readings of your room, one every 5 seconds. Write down the smallest and largest. Then average the first 5 and the last 5 readings. Which two numbers are closer together: the single readings, or the two averages? Explain why.</div>`}
  ],
  quiz:[
   {q:"Which is a measurable question?", o:["Is the greenhouse bad?","Does the greenhouse stay under 32 °C between 10 am and 3 pm on school days?","Is the sensor nice?","Why is it hot?"], a:1, e:"It names the variable, unit, place, time and an implied decision.", w:["Too vague to measure.","","Not measurable.","Too broad."]},
   {q:"One reading has σ = 2 °C. You average 16 readings. The standard error of the average is…", o:["2 °C","0.5 °C","0.125 °C","8 °C"], a:1, e:"SE = σ/√n = 2/4 = 0.5 °C.", w:["That is one reading's noise.","","Divided by n, not √n.","Multiplied instead of divided."]},
   {q:"Averaging 1,000 readings will NOT fix…", o:["Random noise","A sensor that always reads 1.5 °C too high","A single dropped reading","Jumpy values"], a:1, e:"Averaging reduces random error, not bias. Bias needs calibration.", w:["It reduces this.","","","It reduces this."]},
   {q:"Which data deserves the most care?", o:["Room temperature","When each named student enters the lab","Light level","Distance to a wall"], a:1, e:"Data about people's presence is personal.", w:["","","",""]},
   {q:"The data science loop is drawn as a loop because…", o:["It looks nicer","Findings in later stages often send you back to collect or clean again","The stages must repeat exactly three times","Models always fail the first time"], a:1, e:"Exploring often reveals a collection or cleaning problem.", w:["","","",""]}
  ],
  rating:["I think of data as numbers on a screen.","I can write a measurable question.","I can plan sampling and a data dictionary.","I can explain noise, bias, and the √n law to a classmate."],
  checkpoint:{code:"U4-C1", task:"Write your measurable question, the decision it informs, a sampling plan (interval, duration, places), and a seven-row data dictionary for your prototype. Add one sentence about data you will not collect.", met:"Question names variable, unit, place, time and decision; plan justifies the interval; dictionary has units and ranges.", upload:"Upload your plan."},
  refs:["ds4e","gaise","tidy","pandas","pyserial"]
 },

 {id:"4.2", title:"Python, Colab and describing data with maths you can check", minutes:210,
  intro:"Now you analyse. You load the data into pandas in Google Colab, inspect and clean it while keeping the raw copy, and describe it with the statistics every report needs: mean, median, standard deviation, quartiles and the box plot. Every formula is worked by hand first, then by code.",
  objectives:["Run code in Colab; load a CSV or Sheet into a DataFrame.","Find missing values, duplicates and impossible values, and keep a cleaning log.","Compute and interpret mean, median, sample SD, MAD, quartiles and IQR by hand and in code.","Choose the right summary when an outlier is present.","Make a histogram and a box plot with a title, axes and units."],
  sections:[
   {id:"colab", title:"Your first Colab notebook", keys:"colab notebook cell python pandas", html:ds4eMap("Strand B: create, clean and curate data.")+`
    <p class="plain"><b>In plain words (no maths needed)</b>A Colab <b>notebook</b> is a document made of small boxes called cells. Some cells hold text, some hold Python code you run one at a time. Nothing to install: it all runs in your browser, so a mistake costs you nothing.</p>
    
    <p>Colab (${ct("colab")}) is a notebook of <b>cells</b>. Text cells explain; code cells run Python; press <b>Shift+Enter</b> to run one. Variables stay in memory between cells, so run them in order. Save a copy: <b>File → Save a copy in Drive</b>.</p>
    <p>Run the practice-data cell from module 4.1 first (it creates <code>df</code>). To use your own Sheet instead:</p>
    ${code("python", `# Your own data: File > Download > CSV from your Sheet, upload it in Colab (folder icon), then:
# df = pd.read_csv('readings.csv', parse_dates=['timestamp'])
# For practice, df already exists from the previous cell.
df.head()`, "Colab: look at the data")}
    ${srcs(["colab","pandas"])}`, interactive:""},
   {id:"inspect", title:"Inspect before you trust, then clean with a log", keys:"info describe isna duplicated dtypes clean drop interpolate raw copy", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>Before drawing anything, look at the table the way you would check ingredients for mould: how many rows, any blanks, any impossible numbers (a room at 400 °C)? Then clean, and <b>write down</b> what you changed so someone else can repeat it.</p>
    
    ${code("python", `print(df.shape)
print(df.isna().sum())            # missing values per column
print(df.duplicated().sum())      # duplicate rows
print(df.describe().round(1))     # min and max reveal impossible values (temp 85?) and ghost echoes (dist 400?)`, "Colab: inspect")}
    <p>Look for: a <b>maximum</b> far from the rest (glitch), <b>NaN</b> (missing), a repeated timestamp (duplicate), and a value in the wrong unit. Then clean, but <b>never overwrite the raw data</b> and write down every change:</p>
    ${code("python", `raw = df.copy()                                      # untouched copy
clean = df.drop_duplicates().copy()
clean['timestamp'] = pd.to_datetime(clean['timestamp'])
clean = clean.set_index('timestamp').sort_index()
log = {'rows_raw': len(raw), 'duplicates_removed': len(raw) - len(clean)}

bad = ~clean['temp_c'].between(-10, 60)               # sensor's valid range
log['temp_out_of_range'] = int(bad.sum())
clean.loc[bad, 'temp_c'] = np.nan
clean['hum_imputed'] = clean['hum_pct'].isna()        # flag, so repairs stay visible
for col in ['temp_c', 'hum_pct']:
    clean[col] = clean[col].interpolate(limit=6)      # repair gaps of up to 6 readings (30 min)
log['hum_repaired'] = int(clean['hum_imputed'].sum())
print(log)`, "Colab: clean and keep a log")}
    ${mis(`Using <code>dropna()</code> on the whole table. One missing humidity value would delete the entire row, including a good temperature reading. Repair or drop column by column, and count what you did.`)}`, interactive:["imputeLab"]},
   {id:"mean", title:"Centre and spread: mean, SD, median, MAD", keys:"mean median standard deviation variance sample n-1 mad robust", html:`
    <p class="plain"><b>In plain words (no maths needed)</b><b>Mean</b> = the fair-share value (add up, divide by count). <b>Median</b> = the middle person if everyone lines up by height. <b>SD</b> (standard deviation) = how far readings typically stray from the mean. One wild glitch drags the mean but barely moves the median, so the median is the safer “typical” value for messy data.</p>
    
    <p>A <b>summary statistic</b> replaces many numbers with one. You need two kinds: where the data is centred, and how spread out it is.</p>
    ${MX.eq(`mean  x̄ = ${MX.fr("Σ" + MX.v("x") + MX.sub("i"), MX.v("n"))}`, `sample variance  s² = ${MX.fr("Σ(" + MX.v("x") + MX.sub("i") + " − x̄)²", MX.v("n") + " − 1")}`, `standard deviation  s = ${MX.rt("s²")}`)}
    <p><b>Worked by hand.</b> Readings 28, 31, 29, 30, 27 (°C). Sum = 145, n = 5, so x̄ = 29. Deviations from the mean: −1, 2, 0, 1, −2. Squared: 1, 4, 0, 1, 4; their sum is 10. Variance s² = 10 ÷ (5 − 1) = 2.5. SD s = √2.5 = <b>1.58 °C</b>.</p>
    <p><b>Why n − 1?</b> The mean was calculated from the same five readings, so the readings sit a little closer to <i>their own</i> mean than to the true mean. Dividing by n − 1 instead of n corrects that for a sample.</p>
    <p>The <b>median</b> is the middle value of the sorted data (the average of the two middle values when n is even). The <b>MAD</b> (median absolute deviation) is the median of |x − median|. Both ignore extreme values, so they are called <b>robust</b>. One bad reading can move the mean and SD a lot but barely moves the median and MAD: try it in the lab.</p>
    ${ex("which summary for the report?", `<p>A day of 288 temperatures runs from about 23 to 31 °C, and one glitch reads 85 °C. The mean rises from 26.99 to 27.20 °C and the SD jumps from 2.84 to 4.44 °C, while the median moves only from 26.95 to 27.00 °C. <b>First find and explain the glitch</b> (it is a sensor error, so repair it), then report the mean and SD of the cleaned data. If you cannot clean it, report the median and MAD.</p>`)}`, interactive:["statsLab","gx_stats"]},
   {id:"quart", title:"Quartiles, IQR and the box plot", keys:"quartile iqr box plot outlier fence percentile quantile", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>Line the numbers up in order and cut them into four equal groups. The <b>box</b> in a box plot shows where the middle half of your data lives; the <b>whiskers</b> show the normal range; dots beyond them are unusual values worth a closer look (not automatically errors).</p>
    
    <p>Sort the data. The <b>quartiles</b> cut it into four equal parts: Q1 has 25% of values below it, the median (Q2) 50%, Q3 75%. The <b>IQR</b> = Q3 − Q1 is the spread of the middle half. A common rule flags a value as a possible outlier if it is below <b>Q1 − 1.5 × IQR</b> or above <b>Q3 + 1.5 × IQR</b> (the "fences"). This is how a box plot draws its whiskers.</p>
    ${MX.eq(`position  h = (n − 1) · p     value = x${MX.sub("⌊h⌋")} + (h − ⌊h⌋)(x${MX.sub("⌊h⌋+1")} − x${MX.sub("⌊h⌋")})`)}
    <p>Software uses this linear-interpolation rule (pandas <code>quantile</code> does by default). Different textbooks use slightly different rules, so tiny differences are normal: always say which one you used.</p>
    ${code("python", `s = clean['temp_c']
q1, med, q3 = s.quantile([0.25, 0.5, 0.75])
iqr = q3 - q1
print(f'mean {s.mean():.2f}  SD {s.std():.2f}  median {med:.2f}  IQR {iqr:.2f}')
print('fences:', round(q1 - 1.5 * iqr, 2), 'to', round(q3 + 1.5 * iqr, 2))
fig, ax = plt.subplots(1, 2, figsize=(9, 3))
ax[0].hist(s.dropna(), bins=15, color='#4F46E5'); ax[0].set(title='Temperature, one day', xlabel='deg C', ylabel='readings')
ax[1].boxplot(s.dropna(), vert=False); ax[1].set(title='Box plot', xlabel='deg C')
plt.tight_layout(); plt.show()`, "Colab: summary and plots")}
    <p>Every chart needs a title that says what you see, labelled axes with units, and a source. A flagged value is a <b>question</b>, not a verdict: check the sensor log before deleting it.</p>`, interactive:["chartChooser","dashCritique"]},
   {id:"by", title:"Group and compare", keys:"groupby hour resample compare", html:`
    <p class="plain"><b>In plain words (no maths needed)</b><b>Group and compare</b> means sorting your rows into piles (by hour, by day, by room) and summarising each pile. It answers questions like “what is a typical temperature at 3 pm?”</p>
    
    <p>Questions are usually about <b>comparisons</b>: morning versus afternoon, room A versus room B, fan on versus off. Group the data, then summarise each group.</p>
    ${code("python", `clean['hour'] = clean.index.hour
by_hour = clean.groupby('hour')['temp_c'].agg(['mean', 'std', 'min', 'max']).round(2)
print(by_hour.loc[[6, 12, 15, 21]])
hourly = clean[['temp_c', 'hum_pct']].resample('1h').mean()      # one row per hour
hourly.plot(title='Hourly mean, one day', ylabel='deg C / %'); plt.show()`, "Colab: group and resample")}
    ${tip("Use the same time zone everywhere", "<p>Sensors, the Sheet and Python can disagree about the time zone. Decide once (for example Asia/Manila), say so in the data dictionary, and convert at the start.</p>")}`, interactive:["sandbox:sb_stats"]}   ,{id:"casestudy", title:"Case study and experiment", keys:"case study experiment example worked numbers", html:`
    <div class="casebox"><b>Case study: the glitch that fooled the average</b>Seven readings of a classroom: 24.1, 24.3, 24.2, 24.4, 24.1, <b>29.8</b>, 24.3 °C. The <b>mean</b> is 175.2 ÷ 7 = <b>25.03 °C</b>. Sort them: 24.1, 24.1, 24.2, <b>24.3</b>, 24.3, 24.4, 29.8, so the <b>median</b> is <b>24.3 °C</b>. One glitch dragged the mean up by 0.73 °C and the median barely noticed. When data is messy, report the median (and look at the glitch).</div>
    <div class="expbox"><b>Try it yourself</b>Make up 10 temperature readings in a Colab cell, then change one to 99. Print mean and median before and after. Which one moved? Now do the same with your real data from Unit 3.</div>`}
  ],
  quiz:[
   {q:"Readings 4, 6, 8. What is the sample standard deviation?", o:["1","2","2.45","4"], a:1, e:"Mean 6; deviations −2, 0, 2; squares 4, 0, 4 sum to 8; divide by n−1 = 2 to get 4; √4 = 2.", w:["","","That divides by n (8/3) then takes the root.","That is the variance."]},
   {q:"Why divide by n − 1 for a sample SD?", o:["To make the number bigger for no reason","Because the mean was computed from the same data, so the spread would otherwise be slightly too small","Because one reading is always wrong","To match the Sheet"], a:1, e:"The deviations from the sample mean are a little smaller than from the true mean.", w:["","","",""]},
   {q:"A single glitch of 85 °C appears in a log of normal 26–31 °C readings. Which statistic changes least?", o:["Mean","Standard deviation","Median","Variance"], a:2, e:"The median depends only on the middle of the sorted data.", w:["","","",""]},
   {q:"Q1 = 27, Q3 = 31. What is the upper outlier fence?", o:["35","37","31","33"], a:1, e:"IQR = 4; 31 + 1.5×4 = 37.", w:["","","",""]},
   {q:"What should you do before deleting a flagged outlier?", o:["Nothing; delete it","Find out why (sensor log, wiring) and decide, then record the decision","Replace it with 0","Average it with its neighbours without telling anyone"], a:1, e:"Flagged means investigate. Record what you did.", w:["","","",""]}
  ],
  rating:["Statistics are formulas I memorise.","I can compute a mean and SD by hand.","I can explain why n−1, and choose a robust statistic.","I can clean data, keep a log, and summarise it in a report."],
  checkpoint:{code:"U4-C2", task:"In Colab, load your data (or the practice data), clean it with a log, and produce a summary table (mean, SD, median, IQR) and a box plot with labelled axes. Write two sentences interpreting them.", met:"Log shows counts of each repair; table matches the code; chart has title, units and a source; interpretation names the unit.", upload:"Upload the notebook link or a PDF of it."},
  refs:["colab","pandas","gaise","tidy","ds4e"]
 },

 {id:"4.3", title:"Temperature and humidity: missing data, smoothing, decomposition, features and calibration", minutes:240,
  intro:"The DHT11/DHT22 and TMP36 give continuous numbers over time. This module teaches five methods that data scientists use on exactly this kind of data: repairing missing values, smoothing noise, splitting a series into trend, daily cycle and residual, engineering new variables such as heat index and dew point, and calibrating a sensor with a fitted curve.",
  objectives:["Impute missing values with forward-fill and linear interpolation and compare their error.","Smooth with a moving average and an exponential moving average, and explain the lag trade-off.","Decompose a series into trend + seasonal + residual and use the residual to find anomalies.","Engineer heat index and dew point from temperature and humidity.","Fit a calibration curve, report R², and avoid overfitting with a test set."],
  sections:[
   {id:"impute", title:"Handling missing data: delete, forward-fill or interpolate", keys:"missing data imputation linear interpolation locf forward fill", html:ds4eMap("Strand B: curate data. Strand D: interpret results honestly, including what you repaired.")+`
    <p class="plain"><b>In plain words (no maths needed)</b>Gaps happen: Wi-Fi drops, wires wobble. You can <b>delete</b> the gap, <b>copy the last value forward</b>, or <b>draw a straight line across it</b> (interpolation). A short gap in a slowly changing value can be bridged with a line. A long gap should stay a gap: never invent a whole afternoon.</p>
    
    <p>Wires loosen and Wi-Fi drops, so readings go missing. Deleting rows breaks the timeline and can bias averages. Two simple repairs keep the timeline:</p>
    ${MX.eq(`<b>Forward-fill (LOCF):</b>  ŷ${MX.sub("i")} = y${MX.sub("a")}      (repeat the last good value)`, `<b>Linear interpolation:</b>  ŷ${MX.sub("i")} = y${MX.sub("a")} + (y${MX.sub("b")} − y${MX.sub("a")}) · ${MX.fr("i − a", "b − a")}`)}
    <p>Here <i>a</i> is the last good reading and <i>b</i> the next good one. <b>Worked example:</b> 27.0 °C at 2:00 and 29.4 °C at 2:20, readings every 5 minutes. The gap has b − a = 4 steps, so each step adds (29.4 − 27.0)/4 = 0.6 °C: the repaired values are 27.6, 28.2, 28.8. Forward-fill would give 27.0 for all three.</p>
    <p><b>Use case (DHT22 in a server room):</b> a 15-minute gap while the temperature rises 2 °C. Interpolation follows the rise; forward-fill stays flat and then jumps. For a switch (door open/closed) forward-fill is the better choice, because the value really does hold until it changes. For a gap longer than a few readings, <b>neither is honest</b>: leave it missing and say so.</p>
    ${code("python", `# Test the repair: hide known readings, repair, compare with the truth
truth = clean['temp_c'].copy()
holes = truth.copy(); holes.iloc[108:120] = np.nan        # 12 missing readings (1 hour) while the temperature is rising
ffill = holes.ffill(); lin = holes.interpolate(method='linear')
mask = holes.isna()
rmse = lambda a: float(np.sqrt(((a[mask] - truth[mask]) ** 2).mean()))
print('forward-fill error:', round(rmse(ffill), 2), 'deg C   interpolation error:', round(rmse(lin), 2), 'deg C')
# Data-quality summary for the report: raw vs repaired
print(pd.DataFrame({'raw_missing': [int(holes.isna().sum())], 'after_repair': [int(lin.isna().sum())]}))`, "Colab: compare imputation methods")}
    ${srcs(["pandas"])}`, interactive:["imputeLab","gx_clean"]},
   {id:"smooth", title:"Smoothing: moving average and EMA", keys:"moving average smoothing ema exponential lag window noise", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>Smoothing blurs the tiny wiggles so the real trend shows. A <b>moving average</b> replaces each point by the average of the last few. The price you pay is delay: the smoothed line reacts a little later than the real one.</p>
    
    <p>A TMP36 on a breadboard jumps about by ±0.5 °C. A <b>moving average</b> replaces each reading with the mean of a window of w readings:</p>
    ${MX.eq(`trailing:  s${MX.sub("t")} = ${MX.fr("1", MX.v("w"))} Σ y${MX.sub("t−k")}  (k = 0 … w−1)`, `exponential (EMA):  s${MX.sub("t")} = α·y${MX.sub("t")} + (1 − α)·s${MX.sub("t−1")}`)}
    <p><b>Worked by hand</b> (w = 3): readings 28.0, 28.6, 28.2, 29.0, 29.4. The trailing average at the last reading is (28.2 + 29.0 + 29.4) ÷ 3 = <b>28.87</b>. For the EMA with α = 0.4, previous smoothed value 28.0 and new reading 29.0: s = 0.4 × 29.0 + 0.6 × 28.0 = <b>28.40</b>.</p>
    <p><b>The trade-off.</b> A bigger window (or smaller α) gives a calmer line but reacts later: that delay is <b>lag</b>. A <i>centred</i> window has no lag but needs future readings, so it is for reports only. A robot that must act now (the fan, the cooling motor) needs a trailing average or an EMA.</p>
    <p><b>Use case (automated motor cooling):</b> the fan switches on at 40 °C. Raw TMP36 noise crosses 40 °C and back many times (the fan chatters). A 7-point average crosses once, cleanly. For the report you show <b>raw versus smoothed</b> on one chart.</p>
    ${code("python", `t = clean['temp_c']
sm = pd.DataFrame({'raw': t,
                   'trailing_7': t.rolling(7).mean(),
                   'centred_7': t.rolling(7, center=True).mean(),
                   'ema_0.3': t.ewm(alpha=0.3, adjust=False).mean()})
sm.iloc[60:140].plot(figsize=(9, 3.2), title='Raw vs smoothed temperature', ylabel='deg C'); plt.show()
print(sm.iloc[100:104].round(2))`, "Colab: smoothing")}`, interactive:["smoothLab","sandbox:sb_filter"]},
   {id:"decomp", title:"Time-series decomposition: trend, seasonal, residual", keys:"decomposition trend seasonal residual additive period time series", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>A long record is a mix of layers: a slow <b>trend</b> (warmer week), a repeating <b>cycle</b> (day and night), and <b>what is left</b> (noise and surprises). Splitting them is like separating a song into bass, melody and static, so you can look at each one alone.</p>
    
    <p>Temperature has a daily cycle. Is a 2 pm peak "normal", or an anomaly? <b>Decomposition</b> separates the series into parts that add up to the readings:</p>
    ${MX.eq(`${MX.v("y")}${MX.sub("t")} = ${MX.v("T")}${MX.sub("t")} + ${MX.v("S")}${MX.sub("t")} + ${MX.v("R")}${MX.sub("t")}      (trend + seasonal + residual)`)}
    <ol><li><b>Trend T:</b> a centred moving average over one whole period (24 hourly readings). It averages away the daily wave and leaves the slow drift.</li>
    <li><b>Seasonal S:</b> subtract the trend, then average each hour of the day across the days; centre these to sum to 0. This is the typical shape of a day.</li>
    <li><b>Residual R</b> = y − T − S: what the trend and daily cycle cannot explain.</li></ol>
    <p><b>Reading it.</b> A bump at 2 pm lives in S and is normal. A bump at 3 am that is not in S lands in R. Flag residuals beyond about 3 residual SDs. <b>Use case (smart greenhouse):</b> the trend shows the greenhouse warming across the week; the seasonal part gives the daily peak time (when to ventilate); the residual flags a door left open.</p>
    <p>You need at least two full periods to estimate a seasonal pattern, so one day is not enough: use a week of hourly readings.</p>
    ${code("python", `from statsmodels.tsa.seasonal import seasonal_decompose
r2 = np.random.default_rng(7)
hrs = pd.date_range('2026-11-02', periods=168, freq='h')           # one week, hourly
wk = pd.Series(26 + 0.03 * np.arange(168) + 4 * np.sin((hrs.hour - 9) / 24 * 2 * np.pi) + r2.normal(0, 0.35, 168), index=hrs)
wk.iloc[75] += 5                                                    # a door left open at 3 am
d = seasonal_decompose(wk, model='additive', period=24)
d.plot(); plt.show()
z = d.resid / d.resid.std()
print('anomalies (|residual| > 3 SD):'); print(wk[z.abs() > 3])`, "Colab: decomposition")}
    ${srcs(["fpp3","statsmodels"])}`, interactive:["decomposeLab"]},
   {id:"feature", title:"Feature engineering: heat index and dew point", keys:"feature engineering heat index dew point derived variable", html:`
    <p class="plain"><b>In plain words (no maths needed)</b>A <b>feature</b> is a new column you build from old ones. People care about comfort, not raw numbers, so we combine temperature and humidity into a “feels-like” value (heat index). New columns often tell a clearer story than the originals.</p>
    
    <p>A <b>feature</b> is a column a model or a chart uses. <b>Feature engineering</b> builds better columns from the raw ones. Temperature and humidity separately are weaker than the one number that combines them for how hot it <i>feels</i>: the <b>heat index</b> (apparent temperature). The U.S. National Weather Service computes it (${ct("heatindex")}) by converting to °F, then using a regression:</p>
    ${MX.eq(`HI = −42.379 + 2.049·T + 10.143·RH − 0.2248·T·RH − 0.00684·T² − 0.0548·RH² + 0.00123·T²·RH + 0.000853·T·RH² − 0.00000199·T²·RH²`, `(T in °F, RH in %, valid for about T ≥ 80 °F and RH ≥ 40%)`)}
    <p>The <b>dew point</b> is the temperature at which the air is full of moisture (condensation, mould, fog). The Magnus formula gives it from T (°C) and RH:</p>
    ${MX.eq(`γ = ln(${MX.fr("RH", "100")}) + ${MX.fr("17.625·T", "243.04 + T")}`, `T${MX.sub("d")} = ${MX.fr("243.04·γ", "17.625 − γ")}`)}
    <p><b>Worked by hand</b> for 33 °C and 70% RH: T = 33 × 9/5 + 32 = 91.4 °F. Substituting gives HI ≈ 110.2 °F = 43.5 °C: it feels about 10 °C hotter than the thermometer. Dew point: γ = ln(0.70) + 17.625×33/(243.04+33) = −0.3567 + 2.1071 = 1.7504, so T<sub>d</sub> = 243.04 × 1.7504 / (17.625 − 1.7504) = 26.8 °C. When T<sub>d</sub> is close to the air temperature the air is nearly saturated.</p>
    <p><b>Use case (smart greenhouse):</b> the fan switches on at a <b>heat index</b> threshold, not a temperature threshold, because humid air at 33 °C stresses plants and people far more than dry air at 33 °C. Always state the formula's valid range in your report.</p>
    ${code("python", `def heat_index_c(tc, rh):
    T = tc * 9 / 5 + 32
    hi = -42.379 + 2.04901523*T + 10.14333127*rh - 0.22475541*T*rh - 0.00683783*T**2 \\
         - 0.05481717*rh**2 + 0.00122874*T**2*rh + 0.00085282*T*rh**2 - 0.00000199*T**2*rh**2
    return (hi - 32) * 5 / 9

def dew_point_c(tc, rh):
    g = np.log(rh / 100) + 17.625 * tc / (243.04 + tc)
    return 243.04 * g / (17.625 - g)

print(round(heat_index_c(33, 70), 1), round(dew_point_c(33, 70), 1))     # about 43.5 and 26.8
clean['heat_index_c'] = heat_index_c(clean['temp_c'], clean['hum_pct'])
clean['dew_point_c'] = dew_point_c(clean['temp_c'], clean['hum_pct'])
print(clean[['temp_c', 'hum_pct', 'heat_index_c', 'dew_point_c']].describe().round(1))`, "Colab: engineered features")}
    ${srcs(["heatindex"])}`, interactive:["heatIndexLab"]},
   {id:"calib", title:"Calibration and polynomial regression", keys:"calibration regression polynomial r squared overfitting test set least squares", html:`
    <p class="plain"><b>In plain words (no maths needed)</b><b>Calibration</b> compares your cheap sensor with a trusted one and finds a correction rule (a straight line, sometimes a gentle curve) from “what my sensor says” to “what is true”. Always test the rule on readings you did <b>not</b> use to build it; otherwise you are only marking your own homework.</p>
    
    <p>A TMP36 gives volts; you need °C. The datasheet says T = 100·(V − 0.5), but your sensor and your ADC are not perfect. <b>Calibrate</b>: measure the same temperatures with a trusted thermometer and fit a curve from voltage to temperature. The straight-line fit by <b>least squares</b> minimises the sum of squared errors:</p>
    ${MX.eq(`b = ${MX.fr("Sxy", "Sxx")} = ${MX.fr("Σ(" + MX.v("x") + "−x̄)(" + MX.v("y") + "−ȳ)", "Σ(" + MX.v("x") + "−x̄)²")}      a = ȳ − b·x̄`, `R² = 1 − ${MX.fr("SSE", "SST")} = 1 − ${MX.fr("Σ(" + MX.v("y") + "−ŷ)²", "Σ(" + MX.v("y") + "−ȳ)²")}`)}
    <p><b>Worked by hand</b> (x = 1, 2, 3, 4; y = 2.1, 3.9, 6.2, 7.8): x̄ = 2.5, ȳ = 5.0; Sxy = 9.7; Sxx = 5; so b = 9.7 ÷ 5 = 1.94 and a = 5.0 − 1.94 × 2.5 = 0.15. SSE = 0.082 and SST = 18.9, so R² = 1 − 0.082/18.9 ≈ 0.996: the line explains 99.6% of the variation. Try it in the practice below.</p>
    <p>A <b>polynomial</b> adds terms (x², x³ …) so the curve can bend. More terms always make the training error smaller, but a high-degree curve starts chasing noise: <b>overfitting</b>. The remedy is to hold back some points (the <b>test set</b>) and judge the curve by its error on them. Choose the simplest curve whose test error is small.</p>
    <p><b>Use case (motor cooling system):</b> a calibration chart of voltage against reference °C with the fitted line and its R², plus the test RMSE in °C, is the deliverable that proves your thermometer reads true.</p>
    ${code("python", `r3 = np.random.default_rng(33)
v = np.linspace(0.55, 1.0, 16)
ref = 100 * (v - 0.5) + 6 * np.sin((v - 0.5) * 12) + r3.normal(0, 0.9, 16)      # reference thermometer (deg C)
test = np.arange(16) % 4 == 2                                                   # every 4th point is held back
for deg in (1, 2, 3, 7):
    c = np.polyfit(v[~test], ref[~test], deg)
    rm = lambda m: np.sqrt(np.mean((np.polyval(c, v[m]) - ref[m]) ** 2))
    print(f'degree {deg}: train RMSE {rm(~test):.2f} C   TEST RMSE {rm(test):.2f} C')`, "Colab: calibration curve")}`, interactive:["polyFitLab","gx_curve"]}   ,{id:"casestudy", title:"Case study and experiment", keys:"case study experiment example worked numbers", html:`
    <div class="casebox"><b>Case study: two missing minutes</b>A logger recorded 24.0 °C at minute 0 and 24.9 °C at minute 3; minutes 1 and 2 are missing because Wi-Fi dropped. A straight line between them steps up by (24.9 − 24.0) ÷ 3 = 0.3 °C per minute, so the filled values are <b>24.3</b> and <b>24.6 °C</b>. That is fair for a slowly warming room, but it would be <b>wrong</b> for a room where a door was opened at minute 2. Always write down what you filled and why.</div>
    <div class="expbox"><b>Try it yourself</b>Take 10 minutes of your own data. Remove 2 values at random (set them to NaN). Fill them three ways: forward-fill, interpolate, delete. Compare the three charts. Which one looks most like the original?</div>`}
  ],
  quiz:[
   {q:"27.0 °C at 2:00 and 29.4 °C at 2:20, every 5 minutes. Linear interpolation gives 2:10 as…", o:["27.0","28.2","29.4","27.6"], a:1, e:"2:10 is two of four steps: 27.0 + 2 × 0.6 = 28.2.", w:["That is forward-fill.","","","That is the 2:05 value."]},
   {q:"A fan controller must react to temperature right now. Which smoother?", o:["Centred moving average","Trailing moving average or EMA","No smoothing is ever allowed","A moving average over the next hour"], a:1, e:"A centred average needs future readings; a trailing one uses only the past.", w:["","","",""]},
   {q:"In a decomposition, a 3 am spike that is not part of the normal day shows up mainly in the…", o:["Trend","Seasonal part","Residual","Axis labels"], a:2, e:"Trend and seasonal explain slow drift and the normal daily shape. What is left is the residual.", w:["","","",""]},
   {q:"Why use heat index rather than temperature alone to switch a ventilation fan?", o:["It is always a lower number","Humidity changes how hot it feels, so the combined feature predicts stress better","It needs no sensor","It is required by law"], a:1, e:"Feature engineering combines columns into a more useful one.", w:["","","",""]},
   {q:"Training error falls from 1.0 to 0.1 as the polynomial degree rises, but test error rises from 1.2 to 3.4. This is…", o:["A better model","Overfitting","A broken sensor","Bias"], a:1, e:"The curve is memorising noise in the training points.", w:["","","",""]},
   {q:"The honest way to report that 8 readings were interpolated:", o:["Do not mention it","State the count and method in a data-quality summary and keep a flag column","Delete the whole day","Replace them with zeros"], a:1, e:"Transparency lets others judge your choice.", w:["","","",""]}
  ],
  rating:["I delete missing rows.","I can interpolate and forward-fill by hand.","I can smooth, decompose and engineer a feature, and say what each does.","I can calibrate a sensor with a curve, report R² and test error, and explain overfitting."],
  checkpoint:{code:"U4-C3", task:"Using temperature and humidity (your own or practice), produce: (1) a data-quality summary (raw vs repaired counts), (2) a raw-vs-smoothed line graph, (3) a trend/seasonal/residual chart with any anomaly marked, and (4) a heat-index column with its valid range stated. Add one sentence interpreting each.", met:"Each chart has title, axes and units; the summary shows counts and the method; the heat-index range is stated; interpretations are limited to what the data supports.", upload:"Upload your four outputs."},
  refs:["pandas","statsmodels","fpp3","heatindex","ds4e","gaise"]
 },

]});
