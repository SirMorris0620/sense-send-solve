/* ============ MISSION LAB: wire it, code it, run it (replaces the plain sandbox UI) ============
   The C++ runs in the simulator worker (sim.js) in virtual time; the result is then replayed in real time
   as an animated scene with the Serial Monitor beside it. */
function scenVal(S, name, t){ const f = S[name]; if (!f) return 0; let v = f.base; if (f.ramp) for (const r of f.ramp){ if (t >= r[0] && t < r[1]) v = r[2] + (r[3] - r[2]) * (t - r[0]) / (r[1] - r[0]); else if (t >= r[1] && r[4]) v = r[3]; } if (f.steps) for (const s of f.steps){ if (t >= s[0] && t < s[1]) v = typeof s[2] === "number" ? s[2] : v; } if (f.wave) v += f.wave[0] * Math.sin(t / f.wave[1]); return v; }
const MISSIONS = {
 sb_blink:{scene:"desk", parts:["led"], story:"The robotics club needs a “power on” light for its prototype. Wire an LED and make it blink once per second."},
 sb_pattern:{scene:"desk", parts:["led"], story:"A signal lamp for the club's model lighthouse: three quick flashes, then darkness, again and again."},
 sb_timer:{scene:"desk", parts:["led"], story:"A heartbeat LED that never misses a beat, while the board reports “tick” every second. No waiting allowed."},
 sb_dht:{scene:"classroom", parts:["dht"], story:"Room 204 feels hot after lunch. Log clean temperature and humidity data, and survive a loose wire without printing nonsense."},
 sb_sonar:{scene:"parking", parts:["hcsr04","led"], story:"The school's parking area needs a bumper warning: a red light when a car is closer than 20 cm to the wall."},
 sb_ldr:{scene:"street", parts:["ldr","led"], story:"A night light for the corridor: calibrate the light sensor, and switch the lamp on only when it is really dark."},
 sb_mq:{scene:"kitchen", parts:["mq","buzzer"], story:"The canteen kitchen wants a reminder to ventilate. Learn the clean-air baseline, then sound the buzzer when the air changes a lot."},
 sb_wifi:{scene:"router", parts:[], story:"Get the board online, and keep it online even when someone restarts the router."},
 sb_logger:{scene:"cloud", parts:["dht"], story:"Send Room 204's readings to the virtual Apps Script web app, so they land in the Google Sheet."},
 sb_combo:{scene:"combo", parts:["dht","ldr","led"], story:"A comfort alarm: light the LED only when the room is hot AND the curtains are closed."}};
Object.assign(MISSIONS, {
 sb_button:{scene:"bench", parts:["button", "led"], story:"The robotics club's demo board needs a real switch: press once to turn the lamp on, press again to turn it off."},
 sb_fade:{scene:"bench", parts:["led"], story:"A “breathing” status light for a sleeping robot: it should glow brighter, then dimmer, again and again."},
 sb_rgb:{scene:"bench", parts:["rgb"], story:"A mood lamp for the reading corner. Mix red, green and blue light to show four colours in turn."},
 sb_buzzer:{scene:"bench", parts:["buzzer"], story:"The school bell prototype plays the first three notes of a scale, then rests."},
 sb_tmp36:{scene:"bench", parts:["tmp36"], story:"Room 204 is warming up through the morning. Turn the raw TMP36 number into degrees Celsius."},
 sb_pir:{scene:"bench", parts:["pir", "led"], story:"The corridor light should come on when someone walks by and stay on a little while after they leave."},
 sb_servo:{scene:"bench", parts:["hcsr04", "servo"], story:"A school-gate barrier: an ultrasonic sensor sees the car and a servo lifts the bar."},
 sb_motor:{scene:"bench", parts:["motor"], story:"Your robot's wheel: start gently, run full speed, stop, then back up."},
 sb_ts:{scene:"bench", parts:["dht"], story:"Room 204's temperature and humidity chart on ThingSpeak looks wrong. Fix the sketch behind it."},
 sb_fb1:{scene:"bench", parts:["dht"], story:"The Firebase demo prints success messages, yet the console shows an empty database. Find out why."},
 sb_fb2:{scene:"bench", parts:["dht"], story:"The teacher locked the database. Only a signed-in device may write."},
 sb_aws:{scene:"bench", parts:["dht"], story:"Your readings should land in a DynamoDB table in the cloud, but API Gateway turns every request away."},
 sb_mqtt:{scene:"bench", parts:["dht", "led"], story:"A device on AWS IoT Core: it publishes telemetry and obeys a command from the console."},
 sb_blynk:{scene:"bench", parts:["dht", "led"], story:"The class dashboard in the Blynk app should show live temperature and a working lamp switch."},
 sb_stats:{scene:"bench", parts:[], story:"Before you trust a sensor, summarise its data: centre, spread, smallest and largest value."},
 sb_filter:{scene:"bench", parts:["hcsr04"], story:"The distance sensor sometimes glitches. Clean the signal so a single bad reading cannot trigger an alarm."},
 sb_anomaly:{scene:"bench", parts:["tmp36"], story:"A freezer monitor must notice a sudden change without raising false alarms."},
 sb_guardian:{scene:"bench", parts:["pir", "ldr", "rgb", "buzzer"], story:"Capstone: a room guardian that tells a visitor from an intruder using motion and light."}
});
function aiHintPrompt(o){ const clean = String(o.code || "").replace(/(WIFI_PASS\w*|API_KEY\w*|PASSWORD\w*)(\s*=\s*)"[^"]*"/gi, '$1$2"[removed]"').replace(/(key\s*=\s*)'[^']*'/gi, "$1'[removed]'").slice(0, 3500);
  return `Persona: You are a patient ${o.lang || "Arduino"} tutor for beginners. Give hints, not the full solution.
Act: Help me pass the failing checks below with one or two hints, then ask me one question that helps me find the fix myself. Do not write the corrected program.
Recipient: A beginner learning IoT prototyping in the course "Sense, Send, Solve".
Theme: ${o.board ? "Board: " + o.board + ". " : ""}Challenge: ${o.title}. Task: ${String(o.task || "").replace(/<[^>]+>/g, "")}
Failing checks: ${o.fails && o.fails.length ? o.fails.join(" | ") : "(I have not run it yet)"}
My code (secrets removed):
${clean}
Structure: Hint 1, Hint 2 (only if needed), then one question.`; }

/* ---- scenes: each returns SVG for the 640 × 320 world at time t ---- */
const glow = (x, y, r, c, on) => on ? `<circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="${c}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r * 1.7}" fill="${c}" opacity=".28"/>` : "";
const lampSVG = (x, y, on, col, label) => `${glow(x, y, 14, col, on)}<circle cx="${x}" cy="${y}" r="14" fill="${on ? col : "#4b5563"}" stroke="#111" stroke-width="2"/><circle cx="${x - 4}" cy="${y - 4}" r="4" fill="#fff" opacity="${on ? .7 : .2}"/>${label ? `<text x="${x}" y="${y + 30}" text-anchor="middle" class="ms-t">${label}</text>` : ""}`;
const waves = (x, y, on, t) => on ? [0, 1, 2].map(k => { const r = 12 + ((t / 8 + k * 12) % 36); return `<path d="M${x + r} ${y - r * .7} q${r * .4} ${r * .7} 0 ${r * 1.4}" stroke="#7C3AED" stroke-width="3" fill="none" opacity="${1 - r / 50}"/>`; }).join("") : "";
const SCENES = {
 desk:c => `<rect width="640" height="320" fill="#e8eef0"/><rect y="230" width="640" height="90" fill="#c4a27a"/><rect y="226" width="640" height="8" fill="#a8845b"/>
   <circle cx="560" cy="70" r="40" fill="#fff" stroke="#9aa" stroke-width="4"/><path d="M560 70 L560 42 M560 70 L${560 + Math.cos(c.t / 1000 * Math.PI / 30 - Math.PI / 2) * 30} ${70 + Math.sin(c.t / 1000 * Math.PI / 30 - Math.PI / 2) * 30}" stroke="#333" stroke-width="3"/><text x="560" y="128" text-anchor="middle" class="ms-t">${(c.t / 1000).toFixed(1)} s</text>
   <rect x="70" y="150" width="150" height="80" rx="8" fill="${c.bcol}"/><text x="145" y="195" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">${esc(c.bname)}</text>
   <rect x="280" y="170" width="220" height="60" rx="6" fill="#f3efe4" stroke="#d8cfb8"/><path d="M220 180 C250 180 260 196 330 196" stroke="#C2410C" stroke-width="4" fill="none"/><path d="M220 210 C250 210 260 212 430 212" stroke="#222" stroke-width="4" fill="none"/>
   <rect x="336" y="190" width="40" height="12" rx="5" fill="#E8D8B0" stroke="#8a6d3b"/>${lampSVG(410, 168, c.led, "#ff3b3b", "")}<path d="M402 182 L398 198 M418 182 L422 212" stroke="#999" stroke-width="2.5"/>
   <text x="410" y="262" text-anchor="middle" class="ms-big">${c.led ? "LED ON" : "LED off"}</text>`,
 classroom:c => { const T = c.v("temp"), H = c.v("hum"), fail = c.v("dhtfail") > .5, f = Math.min(1, Math.max(0, (T - 20) / 15));
   return `<rect width="640" height="320" fill="#f4efe6"/><rect y="250" width="640" height="70" fill="#d9c7a8"/><rect x="40" y="40" width="180" height="140" fill="#9ed2f5" stroke="#8b6b4a" stroke-width="8"/><circle cx="180" cy="80" r="22" fill="#fcd34d"/><path d="M130 40 V180 M40 110 H220" stroke="#8b6b4a" stroke-width="5"/>
   ${[0, 1, 2].map(k => `<rect x="${260 + k * 110}" y="200" width="80" height="12" rx="3" fill="#a8845b"/><path d="M${268 + k * 110} 212 v38 M${332 + k * 110} 212 v38" stroke="#a8845b" stroke-width="5"/>`).join("")}
   <rect x="300" y="60" width="54" height="40" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>${[0, 1, 2, 3].map(k => `<rect x="306" y="${66 + k * 8}" width="42" height="4" rx="2" fill="#cbd5e1"/>`).join("")}<text x="327" y="118" text-anchor="middle" class="ms-t">DHT22</text>
   ${fail ? `<path d="M327 100 C330 130 300 140 290 160" stroke="#E8B84A" stroke-width="3" fill="none" stroke-dasharray="4 3"/><circle cx="290" cy="160" r="9" fill="#dc2626"/><text x="290" y="164" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">!</text><text x="278" y="182" class="ms-t" fill="#dc2626">loose wire</text>` : `<path d="M327 100 V140" stroke="#E8B84A" stroke-width="3"/>`}
   <rect x="470" y="40" width="30" height="170" rx="15" fill="#fff" stroke="#94a3b8" stroke-width="2"/><rect x="478" y="${200 - f * 150}" width="14" height="${f * 150}" rx="7" fill="#ef4444"/><circle cx="485" cy="214" r="18" fill="#ef4444"/><text x="520" y="80" class="ms-big">${T.toFixed(1)} °C</text><text x="520" y="110" class="ms-t">real temperature</text>
   <text x="520" y="160" class="ms-big">${H.toFixed(0)} %</text><text x="520" y="190" class="ms-t">real humidity</text>${c.parts.includes("led") ? lampSVG(400, 150, c.led, "#ff3b3b", "LED") : ""}`; },
 parking:c => { const d = c.v("dist"), wallX = 560, carX = wallX - 20 - Math.min(150, d) * 2.6;
   return `<rect width="640" height="320" fill="#dfe5ea"/><rect y="250" width="640" height="70" fill="#6b7280"/>${[0, 1, 2, 3, 4].map(k => `<rect x="${40 + k * 120}" y="282" width="60" height="6" fill="#facc15"/>`).join("")}
   <rect x="${wallX}" y="40" width="80" height="210" fill="#9ca3af"/><rect x="${wallX - 14}" y="196" width="18" height="26" rx="3" fill="#1e5aa8"/><circle cx="${wallX - 14}" cy="203" r="4" fill="#cbd5e1"/><circle cx="${wallX - 14}" cy="215" r="4" fill="#cbd5e1"/>
   ${lampSVG(wallX + 40, 110, c.led, "#ff3b3b", "warning")}
   <g transform="translate(${carX - 170} 180)"><path d="M0 50 Q0 30 20 28 L50 26 L80 0 L150 0 L178 26 Q190 28 190 50 Z" fill="#2563EB"/><rect x="90" y="6" width="50" height="20" rx="3" fill="#bfdbfe"/><circle cx="40" cy="58" r="16" fill="#111"/><circle cx="150" cy="58" r="16" fill="#111"/><circle cx="40" cy="58" r="6" fill="#9ca3af"/><circle cx="150" cy="58" r="6" fill="#9ca3af"/></g>
   <path d="M${carX + 20} 160 H${wallX - 22}" stroke="#111" stroke-width="1.5" stroke-dasharray="4 4"/><text x="${(carX + wallX) / 2}" y="152" text-anchor="middle" class="ms-big">${d.toFixed(0)} cm</text>`; },
 street:c => { const L = c.v("light"), sky = L > 90 ? "#fff7d6" : L < 15 ? "#1e1b4b" : `rgb(${Math.round(60 + L * 1.8)},${Math.round(80 + L * 1.6)},${Math.round(140 + L * 1.1)})`;
   return `<rect width="640" height="320" fill="${sky}"/>${L > 30 ? `<circle cx="90" cy="70" r="30" fill="#fcd34d" opacity="${Math.min(1, L / 60)}"/>` : `<circle cx="90" cy="70" r="22" fill="#e5e7eb"/><circle cx="100" cy="64" r="20" fill="${sky}"/>`}
   <rect y="250" width="640" height="70" fill="#374151"/><rect x="0" y="246" width="640" height="6" fill="#9ca3af"/>
   <path d="M420 250 V90 Q420 70 450 70 H480" stroke="#475569" stroke-width="8" fill="none"/><path d="M466 70 h30 l-6 14 h-18 z" fill="#334155"/>${c.led ? `<path d="M470 84 L420 250 H560 L486 84 Z" fill="#fde68a" opacity=".35"/>` : ""}${lampSVG(481, 92, c.led, "#fde047", "")}
   <rect x="220" y="196" width="26" height="26" rx="13" fill="#c2410c"/><path d="M226 204 h14 M226 210 h14 M226 216 h14" stroke="#fde68a"/><text x="233" y="240" text-anchor="middle" class="ms-t" fill="${L < 30 ? "#e5e7eb" : "#111"}">LDR</text>
   ${L < 15 ? `<g transform="translate(205 150)"><path d="M10 40 q-6 -30 8 -34 q4 -12 12 -2 q6 -10 12 2 q8 -6 10 6 q10 0 6 30 z" fill="#f2c094" stroke="#b07a4f"/><text x="30" y="-6" text-anchor="middle" class="ms-t" fill="#e5e7eb">hand over the sensor</text></g>` : ""}
   ${L > 90 ? `<g><rect x="120" y="150" width="50" height="20" rx="6" fill="#334155"/><path d="M170 152 L220 196 L230 222 L170 168 Z" fill="#fff59d" opacity=".75"/><text x="140" y="140" text-anchor="middle" class="ms-t">flashlight</text></g>` : ""}
   <text x="600" y="40" text-anchor="end" class="ms-big" fill="${L < 30 ? "#e5e7eb" : "#111"}">light ${L.toFixed(0)} %</text>`; },
 kitchen:c => { const g = c.v("gas"), puff = g > .25;
   return `<rect width="640" height="320" fill="#f1f5f9"/><rect y="200" width="640" height="120" fill="#cbd5e1"/><rect y="196" width="640" height="10" fill="#94a3b8"/><rect x="60" y="120" width="40" height="76" rx="8" fill="#22c55e"/><rect x="66" y="104" width="20" height="18" fill="#16a34a"/><path d="M86 108 h16" stroke="#16a34a" stroke-width="5"/>
   ${puff ? Array.from({length:9}, (_, k) => `<circle cx="${120 + k * 26 + Math.sin(c.t / 300 + k) * 8}" cy="${110 + Math.cos(c.t / 400 + k) * 12}" r="${16 + k % 3 * 6}" fill="#a78bfa" opacity=".28"/>`).join("") : ""}
   <rect x="380" y="70" width="70" height="56" rx="6" fill="#1e3a8a"/><circle cx="415" cy="98" r="18" fill="#c7cdd3" stroke="#6b7280"/><text x="415" y="142" text-anchor="middle" class="ms-t">MQ-135</text>
   <rect x="520" y="80" width="36" height="36" rx="18" fill="#111"/>${waves(556, 98, c.buz, c.t)}<text x="538" y="142" text-anchor="middle" class="ms-t">buzzer</text>
   <text x="380" y="250" class="ms-big">AO ${(g * (c.b === "s3" ? 4095 : 1023)).toFixed(0)}</text><text x="380" y="276" class="ms-t">${puff ? "cleaning spray in the air" : "clean air"}</text>`; },
 gate:c => { const pm = c.v("pm25"), smoke = Math.min(.75, Math.max(0, (pm - 14) / 50));
   return `<rect width="640" height="320" fill="#dbeafe"/><rect y="240" width="640" height="80" fill="#a3a3a3"/><rect x="40" y="90" width="18" height="150" fill="#1f2937"/><rect x="250" y="90" width="18" height="150" fill="#1f2937"/>${Array.from({length:9}, (_, k) => `<rect x="${64 + k * 20}" y="110" width="6" height="130" fill="#374151"/>`).join("")}<rect x="40" y="70" width="228" height="26" fill="#3730A3"/><text x="154" y="88" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">SCHOOL</text>
   ${[0, 1, 2].map(k => `<g transform="translate(${330 + k * 46} 190)"><circle cx="0" cy="0" r="10" fill="#f2c094"/><rect x="-10" y="10" width="20" height="34" rx="6" fill="${["#ef4444", "#3b82f6", "#22c55e"][k]}"/></g>`).join("")}
   <g opacity="${smoke}">${Array.from({length:10}, (_, k) => `<circle cx="${80 + k * 55 + Math.sin(c.t / 500 + k) * 10}" cy="${150 + Math.cos(c.t / 600 + k) * 20}" r="${40 + k % 3 * 12}" fill="#6b7280"/>`).join("")}</g>
   <rect x="500" y="110" width="110" height="74" rx="8" fill="#0f172a"/><text x="555" y="138" text-anchor="middle" fill="#A5B4FC" font-size="12">PM2.5</text><text x="555" y="166" text-anchor="middle" fill="#fff" font-size="20" font-weight="700">${pm.toFixed(0)}</text>${lampSVG(555, 214, c.led, "#f97316", "")}`; },
 map:c => { const fix = c.v("gpsfix") > .5, n = Math.round(c.v("sats"));
   return `<rect width="640" height="320" fill="#e7f0dc"/><path d="M0 230 L640 170" stroke="#fff" stroke-width="18"/><path d="M200 0 L260 320" stroke="#fff" stroke-width="14"/><rect x="300" y="60" width="200" height="110" rx="20" fill="#a7d08c"/><text x="400" y="120" text-anchor="middle" class="ms-t">Rizal Park</text><rect x="520" y="200" width="100" height="90" fill="#9fc8e8"/><text x="570" y="250" text-anchor="middle" class="ms-t">Manila Bay</text>
   ${Array.from({length:Math.min(12, n)}, (_, k) => `<g transform="translate(${40 + k * 48} ${20 + (k % 2) * 16})"><rect x="-6" y="-4" width="12" height="8" fill="#3730A3"/><rect x="-16" y="-3" width="9" height="6" fill="#2563EB"/><rect x="7" y="-3" width="9" height="6" fill="#2563EB"/></g>`).join("")}
   ${fix ? `<g transform="translate(400 112)"><path d="M0 0 C-14 -18 -14 -36 0 -36 C14 -36 14 -18 0 0 Z" fill="#dc2626"/><circle cx="0" cy="-24" r="5" fill="#fff"/></g>` : `<circle cx="400" cy="110" r="${30 + (c.t / 20) % 30}" fill="none" stroke="#C2410C" stroke-width="2" opacity=".5"/>`}
   <text x="20" y="300" class="ms-big">${fix ? "3D fix ✓" : "searching…"} • ${n} satellites</text>`; },
 door:c => { const tap = (c.S.taps || []).find(tp => c.t >= tp[0] - 900 && c.t < tp[0] + 1500), near = tap ? Math.min(1, (c.t - (tap[0] - 900)) / 900) : 0;
   return `<rect width="640" height="320" fill="#ede9e3"/><rect y="270" width="640" height="50" fill="#b9a68f"/><rect x="250" y="40" width="160" height="230" fill="#8b5e34" stroke="#5c3d1e" stroke-width="6"/><circle cx="390" cy="160" r="8" fill="#e5c07b"/><text x="330" y="30" text-anchor="middle" class="ms-t">ROBOTICS LAB</text>
   <rect x="450" y="120" width="56" height="74" rx="6" fill="#1e40af"/><rect x="458" y="128" width="40" height="58" rx="4" fill="none" stroke="#E8B84A" stroke-width="3"/>${lampSVG(478, 90, c.led, "#22c55e", "")}${waves(506, 160, c.buz, c.t)}
   ${tap ? `<g transform="translate(${620 - near * 140} ${130 + (1 - near) * 40})"><rect x="0" y="0" width="70" height="44" rx="6" fill="#f8fafc" stroke="#94a3b8"/><text x="35" y="27" text-anchor="middle" font-size="9" font-family="JetBrains Mono,monospace">${tap[1].map(x => x.toString(16).toUpperCase().padStart(2, "0")).join(" ")}</text></g>` : ""}
   <text x="20" y="300" class="ms-big">${c.led ? "Door unlocked" : c.buz ? "Card denied" : "Waiting for a card"}</text>`; },
 router:c => { const n = c.S.net || {}, drop = n.drop && c.t >= n.drop[0] && c.t < n.drop[1], st = c.wifi;
   return `<rect width="640" height="320" fill="#eef2f7"/><rect x="380" y="150" width="190" height="56" rx="10" fill="#1f2937"/><path d="M410 150 L396 80 M540 150 L554 80" stroke="#1f2937" stroke-width="7"/>${[0, 1, 2, 3].map(k => `<circle cx="${410 + k * 22}" cy="178" r="5" fill="${drop ? "#4b5563" : k === 3 ? "#22c55e" : "#60a5fa"}"/>`).join("")}<text x="475" y="230" text-anchor="middle" class="ms-t">router “${esc(n.ssid || "IoT-Lab-2G")}” ${drop ? "(restarting…)" : ""}</text>
   ${!drop ? [0, 1, 2].map(k => { const r = 30 + ((c.t / 10 + k * 30) % 90); return `<circle cx="475" cy="120" r="${r}" fill="none" stroke="#60a5fa" stroke-width="2" opacity="${1 - r / 120}"/>`; }).join("") : ""}
   <rect x="70" y="170" width="140" height="70" rx="8" fill="${c.bcol}"/><text x="140" y="210" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">${esc(c.bname)}</text>
   ${[0, 1, 2, 3].map(k => `<rect x="${110 + k * 14}" y="${150 - k * 8}" width="10" height="${10 + k * 8}" rx="2" fill="${st === "on" ? "#22c55e" : st === "joining" && k < 2 ? "#facc15" : "#cbd5e1"}"/>`).join("")}
   <text x="140" y="275" text-anchor="middle" class="ms-big">${st === "on" ? "online" : st === "joining" ? "connecting…" : "offline"}</text>`; },
 cloud:c => { const outs = c.net.filter(x => x.dir === "out"), ins = c.net.filter(x => x.dir === "in" && /OK/.test(x.text)), fly = outs.filter(x => c.t - x.t < 700);
   return `<rect width="640" height="320" fill="#eef6f3"/><rect x="40" y="190" width="130" height="64" rx="8" fill="${c.bcol}"/><text x="105" y="227" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">${esc(c.bname)}</text>
   <path d="M250 120 q0 -40 50 -40 q20 -36 70 -20 q40 -24 70 14 q44 4 40 46 z" fill="#fff" stroke="#9AA5CE" stroke-width="3"/><text x="345" y="110" text-anchor="middle" class="ms-t">Apps Script web app</text>
   <rect x="470" y="160" width="140" height="120" rx="6" fill="#fff" stroke="#4F46E5" stroke-width="3"/><rect x="470" y="160" width="140" height="20" fill="#4F46E5"/><text x="540" y="174" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Readings</text>
   ${Array.from({length:Math.min(6, ins.length * 2)}, (_, k) => `<rect x="478" y="${186 + k * 15}" width="124" height="11" rx="2" fill="${k >= Math.min(6, ins.length * 2) - 2 ? "#bbf7d0" : "#E0E7FF"}"/>`).join("")}<text x="540" y="298" text-anchor="middle" class="ms-t">${ins.length * 2} rows</text>
   ${fly.map(x => { const f = (c.t - x.t) / 700; const px = 170 + f * 300, py = 220 - Math.sin(f * Math.PI) * 120; return `<g transform="translate(${px} ${py})"><rect x="-26" y="-10" width="52" height="20" rx="5" fill="#E8B84A"/><text x="0" y="4" text-anchor="middle" font-size="9" font-family="JetBrains Mono,monospace">GET</text></g>`; }).join("")}
   <text x="20" y="300" class="ms-big">${c.wifi === "on" ? "online" : "connecting…"}</text>`; },
 combo:c => { const T = c.v("temp"), L = c.v("light"), dark = L < 30, f = Math.min(1, Math.max(0, (T - 26) / 8));
   return `<rect width="640" height="320" fill="${dark ? "#cbd2dc" : "#f4efe6"}"/><rect y="250" width="640" height="70" fill="#d9c7a8"/><rect x="40" y="40" width="200" height="150" fill="#9ed2f5" stroke="#8b6b4a" stroke-width="8"/><circle cx="190" cy="80" r="22" fill="#fcd34d"/>
   <rect x="40" y="40" width="${dark ? 100 : 26}" height="150" fill="#7c3aed" opacity=".85"/><rect x="${dark ? 140 : 214}" y="40" width="${dark ? 100 : 26}" height="150" fill="#7c3aed" opacity=".85"/>
   <rect x="430" y="40" width="30" height="170" rx="15" fill="#fff" stroke="#94a3b8" stroke-width="2"/><rect x="438" y="${200 - f * 150}" width="14" height="${f * 150}" rx="7" fill="#ef4444"/><circle cx="445" cy="214" r="18" fill="#ef4444"/><text x="480" y="80" class="ms-big">${T.toFixed(1)} °C</text><text x="480" y="130" class="ms-big">light ${L.toFixed(0)} %</text>
   ${lampSVG(330, 120, c.led, "#ff3b3b", "alarm LED")}<text x="20" y="300" class="ms-big">${c.led ? "hot AND dark: alarm!" : "OK"}</text>`; }
};

/* ---- the mission UI ---- */
function mountSandbox(el, ids){
  const list = ids.map(id => SB[id]).filter(Boolean); if (!list.length){ el.innerHTML = ""; return; }
  let cur = list[0], tries = {}, hintN = {}, play = null, lastChecks = [];
  const me = () => user ? user.email : "g", key = (c, b) => "sss_sb_" + me() + "_" + c.id + "_" + b, wkey = (c, b) => "sss_wire_" + me() + "_" + c.id + "_" + b;
  el.innerHTML = bench(list.length > 1 ? "Mission lab" : "Mission: " + cur.title, `
   ${list.length > 1 ? `<div class="sb-tabs" role="tablist">${list.map((c, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="${i === 0}">${esc(c.title)}${act(c.id) === "pass" ? " ✓" : ""}</button>`).join("")}</div>` : ""}
   <div class="ml-brief"><div class="ml-story"></div><ul class="ml-obj"></ul></div>
   <div class="ml-frame"><div class="ml-scene"><svg class="ml-svg" viewBox="0 0 640 320" role="img" aria-label="Animated mission scene"></svg></div>
    <div class="ml-mon"><div class="ml-mon-head"><b>Serial Monitor</b><span class="explain">115200 baud</span><span class="seg seg-sm ml-view"><button type="button" data-v="mon" aria-selected="true">Monitor</button><button type="button" data-v="plot" aria-selected="false">Plotter</button></span></div><pre class="serial sbSer ml-ser">Press ⬆ Upload to run your sketch.</pre><canvas class="ml-plot" hidden aria-label="Serial Plotter"></canvas></div>
    <div class="ml-play"><button class="btn small ml-pp" type="button" disabled>⏸</button><span class="ml-hud mono">t = 0.0 s</span><input type="range" class="ml-scrub" min="0" max="1000" value="0" disabled aria-label="Replay position"><select class="dinput ml-speed" aria-label="Replay speed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></div></div>
   <div class="ml-steps" role="tablist"><button type="button" class="ml-step" data-s="wire">1. Wire it</button><button type="button" class="ml-step" data-s="code">2. Code it</button><span class="ml-steps-r"><label>Board <select class="dinput sbB">${Object.values(BOARDS).map(b => `<option value="${b.key}">${esc(b.name)}</option>`).join("")}</select></label></span></div>
   <div class="ml-panel ml-wirep"></div>
   <div class="ml-panel ml-codep"><div class="ml-task"></div><div class="edwrap"><textarea class="ed sbE" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Your Arduino code"></textarea></div>
    <div class="controls"><button class="btn primary sbRun" type="button">⬆ Upload</button><button class="btn sbHint" type="button">Hint</button><button class="btn sbAI" type="button">Ask Proto for a hint</button><button class="btn sbSol" type="button">Show a solution</button><button class="btn sbReset" type="button">Reset code</button><button class="btn sbCopy" type="button">Copy</button></div></div>
   <div class="sb-results" hidden><ul class="reslist sbChecks"></ul>
    <div class="sbNetWrap" hidden><b>Network log</b><div class="netlog sbNet"></div><div class="sbSheetBox"><b>Virtual Google Sheet (Readings tab)</b><div class="vsheet sbSheet"></div></div></div>
    <div class="sbCloud" hidden></div><details class="sbJsWrap"><summary class="explain">For the curious: the JavaScript the simulator actually ran</summary><pre class="code sbJs" style="max-height:220px;overflow:auto"></pre></details></div>
   <p class="explain">The simulator runs your C++ on a virtual board with virtual sensors and time, then replays what happened. It is close to a real board, not identical: real hardware has noise, wiring faults, and timing quirks. Always test on the real board too.</p>`);
  const ed = $(".sbE", el), bsel = $(".sbB", el), svg = $(".ml-svg", el);
  bsel.value = getBoard();
  ed.addEventListener("keydown", e => { if (e.key === "Tab"){ e.preventDefault(); ed.setRangeText("  ", ed.selectionStart, ed.selectionEnd, "end"); } });
  ed.addEventListener("input", () => store.set(key(cur, bsel.value), ed.value));
  const meta = () => MISSIONS[cur.id] || {scene:"desk", parts:[], story:""};
  /* --- wiring --- */
  const reqRows = b => [].concat(...meta().parts.map(p => (PIN_PLAN[p] && PIN_PLAN[p][b] ? PIN_PLAN[p][b].con : []).filter(c => c[2] && normPin(b, c[1])).map(c => ({part:p, label:c[0], target:normPin(b, c[1]), color:WIRE[c[2]], note:c[3]}))));
  const reqParts = b => [].concat(...meta().parts.map(p => (PIN_PLAN[p] && PIN_PLAN[p][b] ? PIN_PLAN[p][b].parts : []).map(x => [p, x])));
  const W = () => store.get(wkey(cur, bsel.value), {conns:{}, ticks:{}, ok:false, fails:0});
  const saveW = w => store.set(wkey(cur, bsel.value), w);
  const wired = () => !meta().parts.length || W().ok;
  let selRow = 0;
  const drawWire = (msg) => { const b = bsel.value, rows = reqRows(b), extra = reqParts(b), w = W(), hl = {};
    if (!rows.length){ $(".ml-wirep", el).innerHTML = `<p class="ix-out">No extra wiring for this mission: the board's Wi-Fi is built in. Go to <b>2. Code it</b>.</p>`; return; }
    rows.forEach((r, i) => { if (w.conns[i]) hl[w.conns[i]] = r.color; });
    $(".ml-wirep", el).innerHTML = `<p class="explain">Tap a part's pin on the left, then tap the board pin it connects to. Use the wiring tables in this module if you need them. When every wire is placed, press <b>Check wiring</b>.</p>
     <div class="ml-wire"><div class="ml-parts">${meta().parts.map(p => `<div class="ml-part"><b>${esc(SENSOR_INFO[p].name)}</b>${rows.map((r, i) => r.part === p ? `<button type="button" class="ml-wpin ${i === selRow ? "sel" : ""} ${w.res ? (w.res[i] ? "ok" : "no") : ""}" data-i="${i}"><i style="background:${r.color}"></i><span>${esc(r.label)}</span><span class="ml-to">${w.conns[i] ? "→ " + esc(w.conns[i]) : "not connected"}</span></button>` : "").join("")}</div>`).join("")}
       ${extra.length ? `<div class="ml-part"><b>Before you power up</b>${extra.map((x, k) => `<label class="ml-tick"><input type="checkbox" data-k="${k}" ${w.ticks[k] ? "checked" : ""}> <span>${esc(x[1])}</span></label>`).join("")}</div>` : ""}</div>
      <div class="ml-board">${boardSVG(b, {hl, sel:null})}</div></div>
     <div class="controls"><button class="btn primary ml-chk" type="button">Check wiring</button><button class="btn ml-show" type="button" ${w.fails >= 1 ? "" : "hidden"}>Show me the correct wiring</button><button class="btn ml-clear" type="button">Clear</button></div><div class="ix-out ml-wmsg" ${msg ? "" : "hidden"}>${msg || ""}</div>`;
    el.querySelectorAll(".ml-wpin").forEach(x => x.onclick = () => { selRow = +x.dataset.i; drawWire(); });
    el.querySelectorAll(".ml-wirep .bpin").forEach(g => g.onclick = () => { const w2 = W(); w2.conns[selRow] = g.dataset.pin; delete w2.res; w2.ok = false; saveW(w2); const n = reqRows(bsel.value).findIndex((r, i) => !w2.conns[i]); if (n >= 0) selRow = n; drawWire(); });
    el.querySelectorAll(".ml-tick input").forEach(x => x.onchange = () => { const w2 = W(); w2.ticks[x.dataset.k] = x.checked; w2.ok = false; saveW(w2); });
    $(".ml-chk", el).onclick = checkWire; $(".ml-show", el).onclick = () => { autoWire(); drawWire(`<b>Here is the course wiring.</b> Compare it with yours, and with the wiring table in this module.`); };
    $(".ml-clear", el).onclick = () => { saveW({conns:{}, ticks:{}, ok:false, fails:W().fails}); selRow = 0; drawWire(); }; };
  const checkWire = () => { const b = bsel.value, rows = reqRows(b), extra = reqParts(b), w = W(); w.res = {};
    rows.forEach((r, i) => w.res[i] = !!w.conns[i] && pinMatches(b, w.conns[i], r.target));
    const bad = rows.filter((r, i) => !w.res[i]), ticks = extra.every((x, k) => w.ticks[k]);
    w.ok = !bad.length && ticks; if (!w.ok) w.fails = (w.fails || 0) + 1; saveW(w);
    drawWire(w.ok ? `<b>✓ Wiring correct.</b> Now go to <b>2. Code it</b> and upload.` : `${bad.length ? `<b>${bad.length} wire${bad.length > 1 ? "s" : ""} to fix:</b><ul>${bad.map(r => `<li>${esc(SENSOR_INFO[r.part].short)} <b>${esc(r.label)}</b>: ${w.conns[rows.indexOf(r)] ? `not ${esc(w.conns[rows.indexOf(r)])}.` : "not connected yet."} ${r.target === "GND" ? "It goes to any GND pin." : /3V3|3\.3V|5V|VIN/.test(r.target) ? "Which supply voltage does this part need?" : "Check the wiring table for your board."}</li>`).join("")}</ul>` : ""}${!ticks ? "<b>Tick every “Before you power up” item</b> once you have added those parts." : ""}`);
    if (w.ok){ markAct("wire_" + cur.id, "done"); step("code"); } };
  const autoWire = () => { const b = bsel.value, rows = reqRows(b), extra = reqParts(b), w = W(); rows.forEach((r, i) => w.conns[i] = r.target); extra.forEach((x, k) => w.ticks[k] = true); w.ok = true; w.res = {}; rows.forEach((r, i) => w.res[i] = true); saveW(w); };
  el.mission = {autoWire:() => { autoWire(); drawWire(); }};
  /* --- steps --- */
  const step = s => { el.querySelectorAll(".ml-step").forEach(x => x.setAttribute("aria-selected", x.dataset.s === s)); $(".ml-wirep", el).hidden = s !== "wire"; $(".ml-codep", el).hidden = s !== "code"; if (s === "wire") drawWire(); };
  el.querySelectorAll(".ml-step").forEach(x => x.onclick = () => step(x.dataset.s));
  /* --- scene + replay --- */
  const bcol = b => b === "uno" ? "#008184" : b === "esp8266" ? "#1d2433" : "#1a1d21";
  const wifiAt = (r, t) => { let s = "off"; (r.net || []).forEach(x => { if (x.t > t || x.dir !== "wifi") return; s = /Connected/.test(x.text) ? "on" : /lost/.test(x.text) ? "off" : /Joining/.test(x.text) ? "joining" : s; }); return s; };
  const render = (t) => { const b = bsel.value, P = play, S = P ? P.S : cur.scenario(b), r = P ? P.r : {ev:[], ser:[], net:[]};
    const ctx = {t, S, b, r, v:k => scenVal(S, k, t), led:P ? !!pinAt(r, pinK(b, "LED_PIN"), t) : false, buz:P ? !!pinAt(r, pinK(b, "BUZZER_PIN"), t) : false, net:(r.net || []).filter(x => x.t <= t), wifi:P ? wifiAt(r, t) : "off", bname:BOARDS[b].short, bcol:bcol(b), parts:meta().parts};
    svg.innerHTML = (SCENES[meta().scene] || SCENES.desk)(ctx);
    $(".ml-hud", el).textContent = `t = ${(t / 1000).toFixed(1)} s${P ? ` of ${(P.r.end / 1000).toFixed(0)} s` : ""}`;
    if (P){ const lines = r.ser.filter(x => x.t <= t); const box = $(".ml-ser", el); const txt = lines.slice(-300).map(x => `[${(x.t / 1000).toFixed(2).padStart(6)}] ${x.text}`).join("\n") || "(nothing printed yet)"; if (box.textContent !== txt){ box.textContent = txt; box.scrollTop = box.scrollHeight; }
      if (!$(".ml-plot", el).hidden) drawSerPlot($(".ml-plot", el), lines, P.r.end);
      $(".ml-scrub", el).value = Math.round(t / P.r.end * 1000); } };
  const drawSerPlot = (cv, lines, end) => { const {g, W: Wd, H} = hiDPI(cv); g.clearRect(0, 0, Wd, H); const series = [];
    lines.forEach(l => numsIn(l.text).slice(0, 4).forEach((n, k) => (series[k] = series[k] || []).push([l.t, n])));
    const all = [].concat(...series).map(p => p[1]); if (!all.length){ g.fillStyle = cssv("--muted"); g.font = "12px sans-serif"; g.fillText("Numbers printed by your sketch appear here as lines.", 10, 20); return; }
    const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * .1 || 1, X = t => 6 + t / end * (Wd - 12), Y = v => H - 8 - (v - lo + pad) / (hi - lo + 2 * pad) * (H - 16), cols = ["#2563EB", "#C2410C", "#4F46E5", "#7C3AED"];
    series.forEach((s, k) => { g.strokeStyle = cols[k]; g.lineWidth = 2; g.beginPath(); s.forEach((p, i) => i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))); g.stroke(); });
    g.fillStyle = cssv("--muted"); g.font = "10px sans-serif"; g.fillText(hi.toFixed(1), 4, 12); g.fillText(lo.toFixed(1), 4, H - 2); };
  let stopLoop = null;
  const startReplay = () => { if (stopLoop) stopLoop(); const P = play; P.t = 0; P.playing = true; $(".ml-pp", el).disabled = false; $(".ml-scrub", el).disabled = false; $(".ml-pp", el).textContent = "⏸";
    stopLoop = animLoop(el, (now, dt) => { if (!P.playing) return; P.t = Math.min(P.r.end, P.t + dt * (+$(".ml-speed", el).value)); render(P.t); if (P.t >= P.r.end){ P.playing = false; $(".ml-pp", el).textContent = "↺"; } }, 24); };
  $(".ml-pp", el).onclick = () => { if (!play) return; if (play.t >= play.r.end){ play.t = 0; } play.playing = !play.playing; $(".ml-pp", el).textContent = play.playing ? "⏸" : "▶"; };
  $(".ml-scrub", el).oninput = e => { if (!play) return; play.t = +e.target.value / 1000 * play.r.end; play.playing = false; $(".ml-pp", el).textContent = "▶"; render(play.t); };
  el.querySelectorAll(".ml-view button").forEach(x => x.onclick = () => { el.querySelectorAll(".ml-view button").forEach(y => y.setAttribute("aria-selected", y === x)); const plot = x.dataset.v === "plot"; $(".ml-plot", el).hidden = !plot; $(".ml-ser", el).hidden = plot; if (play) render(play.t); });
  /* --- load a mission --- */
  const load = () => { el.dataset.cur = cur.id; const b = bsel.value, m = meta();
    $(".ml-story", el).innerHTML = `<span class="ml-badge">Mission</span> <b>${esc(cur.title)}</b><p>${esc(m.story)}</p>${cur.scenarioText ? `<p class="explain"><b>What will happen in the virtual world:</b> ${cur.scenarioText}</p>` : ""}`;
    $(".ml-obj", el).innerHTML = cur.criteria.map(c => `<li>${c}</li>`).join("");
    $(".ml-task", el).innerHTML = `<p><b>Task:</b> ${typeof cur.task === "function" ? cur.task(b) : cur.task}</p>`;
    ed.value = store.get(key(cur, b), null) || cur.starter(b); $(".sb-results", el).hidden = true; hintN[cur.id] = 0; play = null; if (stopLoop) stopLoop(); stopLoop = null;
    $(".ml-ser", el).textContent = "Press ⬆ Upload to run your sketch."; $(".ml-pp", el).disabled = true; $(".ml-scrub", el).disabled = true; $(".ml-scrub", el).value = 0; selRow = 0;
    render(0); step(wired() ? "code" : "wire"); };
  el.querySelectorAll(".sb-tabs button").forEach(btn => btn.onclick = () => { cur = list[+btn.dataset.i]; el.querySelectorAll(".sb-tabs button").forEach(x => x.setAttribute("aria-selected", x === btn)); load(); });
  bsel.onchange = () => { setBoard(bsel.value); load(); };
  $(".sbReset", el).onclick = () => { if (!confirm("Replace your code with the starter code?")) return; store.del(key(cur, bsel.value)); load(); };
  $(".sbCopy", el).onclick = () => copyText(ed.value);
  const showMsg = h => { $(".sb-results", el).hidden = false; $(".sbChecks", el).innerHTML = `<li>${h}</li>`; };
  $(".sbHint", el).onclick = () => { const n = hintN[cur.id] || 0, k = Math.min(n, cur.hints.length - 1); hintN[cur.id] = n + 1; showMsg(`<b>Hint ${k + 1} of ${cur.hints.length}.</b> ${cur.hints[k]}`); logEvent(currentModule, cur.id, "hint", n + 1); };
  $(".sbAI", el).onclick = () => { const p = aiHintPrompt({title:cur.title, task:typeof cur.task === "function" ? cur.task(bsel.value) : cur.task, code:ed.value, fails:lastChecks.filter(c => !c.ok).map(c => c.msg.replace(/<[^>]+>/g, "")), board:BOARDS[bsel.value].name});
    sendToProto(p); logEvent(currentModule, cur.id, "ai_hint", "asked"); aiLogAdd({tool:"Proto (course assistant)", framework:"PARTS", task:"Hint for " + cur.title, prompt:p.slice(0, 600)}); toast("Asked Proto for a hint. It was also added to your AI-use log."); };
  $(".sbSol", el).onclick = () => { if ((tries[cur.id] || 0) < 2 && act(cur.id) !== "pass"){ showMsg("Try running your own code at least twice first, and use the hints. Struggling a little is how you learn (UNESCO's first rule for AI applies here too: attempt first)."); return; }
    if (!confirm("Load a working solution? Your code will be replaced (you can undo with Ctrl+Z).")) return; ed.focus(); ed.select(); document.execCommand && document.execCommand("insertText", false, cur.solution(bsel.value)) || (ed.value = cur.solution(bsel.value)); store.set(key(cur, bsel.value), ed.value); logEvent(currentModule, cur.id, "solution", "shown"); };
  $(".sbRun", el).onclick = async () => {
    if (!wired()){ step("wire"); toast("Wire it first: step 1."); drawWire(`<b>Wire the parts first.</b> A real sketch cannot read a sensor that is not connected.`); return; }
    const b = bsel.value, src = ed.value, lint = cppLint(src), btn = $(".sbRun", el);
    tries[cur.id] = (tries[cur.id] || 0) + 1; btn.disabled = true; btn.textContent = "Compiling…"; $(".ml-ser", el).textContent = "Compiling sketch…\nUploading to " + BOARDS[b].short + "…";
    const S = cur.scenario(b); const r = await runBoard(src, b, S, cur.sim);
    btn.disabled = false; btn.textContent = "⬆ Upload";
    $(".sb-results", el).hidden = false; let checks = [];
    if (r.err) checks = [fail(friendlyErr(r.err), lint.length ? lint.join(" ") : "")];
    else { try { checks = cur.check(r, b) || []; } catch(e){ checks = [fail("The checker could not read your output: " + e.message, "Make sure your output matches the format in the task.")]; } if (lint.length && checks.some(c => !c.ok)) checks.push(fail("Possible typing problems:", lint.join(" "))); }
    lastChecks = checks; const ok = checks.length && checks.every(c => c.ok);
    $(".sbChecks", el).innerHTML = checks.map(c => `<li class="${c.ok ? "ok" : "no"}">${c.ok ? "✓" : "✗"} ${c.msg}${!c.ok && c.hint ? `<span class="explain">${c.hint}</span>` : ""}</li>`).join("") + (ok ? `<li class="ok"><b>Mission complete.</b> Now try it on your real board.</li>` : `<li class="explain">Stuck? Use <b>Hint</b>, or <b>Ask Proto for a hint</b> (it sends your code and these checks, and asks for hints, not the answer).</li>`);
    el.querySelectorAll(".ml-obj li").forEach((li, i) => { li.classList.toggle("ok", !r.err && checks[i] && checks[i].ok); li.classList.toggle("no", !!r.err || (checks[i] && !checks[i].ok)); });
    const netUsed = (r.net && r.net.length) || (r.rows && r.rows.length); $(".sbNetWrap", el).hidden = !netUsed;
    if (netUsed){ $(".sbNet", el).textContent = r.net.map(x => `[${(x.t / 1000).toFixed(2)}] ${x.dir === "out" ? "→" : x.dir === "in" ? "←" : x.dir === "err" ? "✗" : "•"} ${x.text}`).join("\n");
      $(".sbSheetBox", el).hidden = !(r.rows && r.rows.length); $(".sbSheet", el).innerHTML = r.rows.length ? `<table class="t"><tr><th>timestamp</th><th>device_id</th><th>sensor</th><th>value</th></tr>${r.rows.slice(-40).map(x => `<tr>${x.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>` : `<p class="explain">No rows yet.</p>`; }
    $(".sbJs", el).textContent = r.js || ""; renderCloud($(".sbCloud", el), r);
    logEvent(currentModule, cur.id, "sandbox_run", ok ? "pass" : "fail");
    if (ok && act(cur.id) !== "pass"){ markAct(cur.id, "pass"); confetti(); toast("Mission complete!"); const t = el.querySelector(`.sb-tabs button[data-i="${list.indexOf(cur)}"]`); if (t) t.textContent = cur.title + " ✓"; }
    if (!r.err){ play = {r, S, t:0, playing:true}; startReplay(); } else { $(".ml-ser", el).textContent = "Upload failed: the sketch did not run. Read the first message below."; }
    A($(".sb-results", el), {opacity:[0,1], y:[8,0]}, {duration:.3}); };
  load();
}
