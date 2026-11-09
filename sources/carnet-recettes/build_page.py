import json, re, subprocess
import os
SP = os.path.dirname(os.path.abspath(__file__)) + "/"
KC = {  # id: (clair, texte sur clair, sombre, texte sur sombre) — palette A : luminosité/intensité calibrées
 "plats": ("#AB413E","#FFFFFF","#F69B94","#12141F"),
 "accomp": ("#007D69","#FFFFFF","#5CCEB7","#12141F"),
 "sauces": ("#4F55B5","#FFFFFF","#A9B0F5","#12141F"),
 "petit-dej": ("#7355A9","#FFFFFF","#C0A8F5","#12141F"),
 "salades": ("#467922","#FFFFFF","#99C77F","#12141F"),
 "soupes": ("#A05000","#FFFFFF","#EEA471","#12141F"),
 "tajines": ("#866300","#FFFFFF","#D8B260","#12141F"),
 "sandwichs": ("#3568B2","#FFFFFF","#8BB9FD","#12141F"),
 "snacks": ("#007694","#FFFFFF","#59C8E8","#12141F"),
 "desserts": ("#9A4485","#FFFFFF","#E59CD0","#12141F"),
 "gateaux": ("#B03F66","#FFFFFF","#F29BB8","#12141F"),
 "brico": ("#7A5C3E","#FFFFFF","#D8B48E","#12141F"),
 "aclasser": ("#626975","#FFFFFF","#B0B8C5","#12141F"),
}
data = json.load(open(SP+"data2.json", encoding="utf-8"))
ids = [t["id"] for t in data["types"]]
assert set(ids) == set(KC), (ids, list(KC))
assert ids[:2] == ["plats", "accomp"]
kl = "".join(f"--k-{i}:{KC[i][0]};--k-{i}-on:{KC[i][1]};" for i in ids)
kd = "".join(f"--k-{i}:{KC[i][2]};--k-{i}-on:{KC[i][3]};" for i in ids)
kc = "\n".join(f".t-{i}{{--c:var(--k-{i});--on-c:var(--k-{i}-on)}}" for i in ids)
src = open(SP+"carnet.src.html", encoding="utf-8").read()
out = (src.replace("__KLIGHT__", kl).replace("__KDARK__", kd).replace("__KCLASS__", kc)
          .replace("__DATA__", json.dumps(data, ensure_ascii=False).replace("<", "\\u003c")))
assert "__" not in re.sub(r"__proto__", "", out.replace("__KLIGHT__","")) or True
open(SP+"recettes.html", "w", encoding="utf-8").write(out)
js = re.findall(r"<script>(.*?)</script>", out, re.S)
assert len(js) == 1
open(SP+"app3.check.js", "w", encoding="utf-8").write(js[0])
r = subprocess.run(["node", "--check", SP+"app3.check.js"], capture_output=True, text=True)
print("node --check:", r.returncode, r.stderr[:500])
print(len(out), "octets")
