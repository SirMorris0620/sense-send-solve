"""Server-side checks for the pre-test, post-test, and certificate (run against test/backend/mock_server.js)."""
import json, os, re, sys, urllib.request
U = os.environ.get("MOCK_URL", "http://127.0.0.1:8850/")
def raw(d): return json.loads(urllib.request.urlopen(urllib.request.Request(U + "raw", data=json.dumps(d).encode(), method="POST")).read())
gs = open(os.path.join(os.path.dirname(__file__), "..", "..", "backend", "Code.gs"), encoding="utf-8").read()
KEY = json.loads(re.search(r"const TEST_KEY = (\[.*?\]);", gs).group(1)); MODS = json.loads(re.search(r"const MODULE_IDS = (\[.*?\]);", gs).group(1)); TRACKS = json.loads(re.search(r"const TRACK_IDS = (\[.*?\]);", gs).group(1))
res = {}
def reg(e, g): return raw({"action":"register","email":e,"givenName":g,"lastName":"Test","name":g+" Test","age":30,"role":"Teacher","gradeLevels":["Grade 10"],"school":"S","privacyConsent":True})["token"]
def finish_modules(tok, tracks=True): raw({"action":"event","token":tok,"events":[{"ts":1,"moduleId":m,"itemId":"module","type":"module_done","value":"1"} for m in MODS + (TRACKS[:1] if tracks else [])]})
wrong = [(k + 1) % 4 for k in KEY]
a = reg("amy@example.com", "Amy")
r = raw({"action":"test","token":a,"kind":"pre","answers":[-1] * len(KEY)}); res["pre-test scored on server"] = r.get("ok") and r["score"] == 0 and r["total"] == len(KEY)
r = raw({"action":"test","token":a,"kind":"pre","answers":KEY}); res["pre-test only once (no retake to inflate gain)"] = r.get("already") is True and r["score"] == 0
res["wrong answer count rejected"] = raw({"action":"test","token":a,"kind":"pre","answers":[0, 1]}).get("error") == "bad_answers"
res["post-test locked until all modules complete"] = raw({"action":"test","token":a,"kind":"post","answers":KEY}).get("error") == "not_eligible"
res["certificate refused before completion"] = raw({"action":"certificate","token":a,"name":"Amy Test"}).get("error") == "modules_incomplete"
finish_modules(a, tracks=False)
res["core modules alone are not enough: one IoT track is required"] = raw({"action":"test","token":a,"kind":"post","answers":KEY}).get("error") == "not_eligible"
finish_modules(a)
outs = [raw({"action":"test","token":a,"kind":"post","answers":wrong}) for _ in range(3)]
res["failing post-test does not pass"] = all(o.get("ok") and not o["passed"] for o in outs) and outs[-1]["attemptsLeft"] == 0
res["post-test attempts limited to 3"] = raw({"action":"test","token":a,"kind":"post","answers":KEY}).get("error") == "no_attempts"
res["no certificate without a passing post-test"] = raw({"action":"certificate","token":a,"name":"Amy Test"}).get("error") == "post_not_passed"
b = reg("ben@example.com", "Ben"); raw({"action":"test","token":b,"kind":"pre","answers":wrong}); finish_modules(b)
r = raw({"action":"test","token":b,"kind":"post","answers":KEY}); res["passing post-test passes"] = r.get("passed") is True and r["percent"] == 100
res["name required"] = raw({"action":"certificate","token":b,"name":"  "}).get("error") == "name_required"
c = raw({"action":"certificate","token":b,"name":"Ben <b>Test</b>"}); res["certificate issued with an ID"] = c.get("ok") and re.match(r"^SSS-[A-Z0-9]{4}-[A-Z0-9]{4}$", c["cert"]["id"]) and c["cert"]["hours"] > 0
res["HTML stripped from certificate name"] = "<" not in c["cert"]["name"]
c2 = raw({"action":"certificate","token":b,"name":"Someone Else"}); res["certificate issued once (name locked)"] = c2["cert"]["id"] == c["cert"]["id"] and c2["cert"]["name"] == c["cert"]["name"]
v = raw({"action":"verifyCert","id":c["cert"]["id"].lower()}); res["public verification works"] = v.get("found") and v["name"] == c["cert"]["name"] and "email" not in v
res["fake certificate ID not found"] = raw({"action":"verifyCert","id":"SSS-0000-0000"}).get("found") is False
r = raw({"action":"lookup","email":"ben@example.com"}); code = json.loads(urllib.request.urlopen(U + "lastcode").read())["code"]
s = raw({"action":"verify","email":"ben@example.com","code":code}); res["sign-in returns test summary for other devices"] = s["tests"]["pre"] is not None and len(s["tests"]["post"]) == 1 and s["tests"]["cert"]["id"] == c["cert"]["id"]
for k, val in res.items(): print(("PASS " if val else "FAIL ") + k)
print(sum(bool(v) for v in res.values()), "/", len(res)); sys.exit(0 if all(res.values()) else 1)
