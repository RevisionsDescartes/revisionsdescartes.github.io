import datetime as _dt
OLD_SW, NEW_SW = "carnet-v31", "carnet-v32"   # à chaque publication : NEW_SW devient OLD_SW et le numéro augmente
_MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
_d = _dt.date.today()
BUILD = NEW_SW.split("-v")[1] + " · " + str(_d.day) + " " + _MOIS[_d.month - 1] + " " + str(_d.year)
import json, re, subprocess
import os
SP = os.path.dirname(os.path.abspath(__file__)) + "/"
OUT = SP + "pwa/"
bp = open(SP+"build_page.py", encoding="utf-8").read()
ns = {}; exec(re.search(r"KC = \{.*?\n\}", bp, re.S).group(0), ns); KC = ns["KC"]

data = json.load(open(SP+"data2.json", encoding="utf-8"))
types = {t["id"] for t in data["types"]}
KEYS = ["id","name","type","cook","servings","src","date","url","btn","lvl","ing","probable","ingNote","steps","stepsNote","tips","sum"]
extra = []
for d in json.load(open(SP+"userdocs.json", encoding="utf-8")):
    x = d["data"]; ing = [s.strip() for s in x.get("ing", []) if s.strip()]
    extra.append(dict(id=d["id"], name=x["name"].strip(), type=x["type"] if x["type"] in types else "aclasser",
        cook=x.get("cook",""), servings=x.get("servings",""), src="Ajoutée", date=x.get("created",""),
        url=x.get("url",""), btn="Ouvrir le lien ↗", lvl="user", ing=ing, probable=[], ingNote="",
        steps=[s.strip() for s in x.get("steps", []) if s.strip()], stepsNote="", tips=[], sum=", ".join(ing[:4]), ts=x.get("ts",0)))
seed = []
for r in extra + data["recipes"]:
    o = {k: r.get(k, [] if k in ("ing","probable","steps","tips") else "") for k in KEYS}; o["ts"] = r.get("ts", 0)
    seed.append(o)
assert len({r["id"] for r in seed}) == len(seed)
data["recipes"] = seed
json.dump({"recipes": seed}, open(OUT+"recettes.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(OUT+"recettes.json", "a").write("\n")

ids = [t["id"] for t in data["types"]]
kl = "".join(f"--k-{i}:{KC[i][0]};--k-{i}-on:{KC[i][1]};" for i in ids)
kd = "".join(f"--k-{i}:{KC[i][2]};--k-{i}-on:{KC[i][3]};" for i in ids)
kc = "\n".join(f".t-{i}{{--c:var(--k-{i});--on-c:var(--k-{i}-on)}}" for i in ids)
src = open(SP+"carnet.src.html", encoding="utf-8").read()
css_part = src[:src.index('<script type="application/json"')]
css_part = css_part.replace("</style>", ".foot { margin: 0.4rem 0 0; font-size: 0.85rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0 1.4rem; }\n.foot a, .linkbtn { display: inline-flex; align-items: center; min-height: 2.75rem; }\n.linkbtn { background: none; border: 0; padding: 0; font: inherit; font-size: 0.85rem; color: var(--accent); text-decoration: underline; cursor: pointer; }\n.reordering .rowbtns { position: sticky; top: 0.6rem; z-index: 20; }\n.howto { margin-top: 0; padding: 0 1rem 0.9rem 2.2rem; }\n.reordering .tile[data-type] { cursor: grab; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; position: relative; }\n.grip { position: absolute; top: 0.6rem; right: 0.75rem; font-size: 1.2rem; line-height: 1; letter-spacing: -0.15em; opacity: 0.75; }\n.tile.placeholder { opacity: 0.35; outline: 2px dashed var(--c); outline-offset: -2px; }\n.tile.ghost { position: fixed; z-index: 100; margin: 0; pointer-events: none; box-shadow: 0 12px 30px rgba(0,0,0,0.3); transform: scale(1.04); opacity: 0.97; }\ninput[type=\"password\"] { font: inherit; font-size: 1rem; color: var(--fg); background: var(--surface); border: 1px solid var(--line); border-radius: 0.7rem; padding: 0.65rem 0.75rem; min-height: 2.9rem; width: 100%; }\n</style>")
css_part = css_part.replace("</style>", open(SP+"extra2.css", encoding="utf-8").read() + "</style>")
app = open(SP+"pwa.app.js", encoding="utf-8").read().replace("__BUILD__", BUILD)
full = css_part + '<script type="application/json" id="data">__DATA__</script>\n<script>\n' + app + '</script>\n'
full = (full.replace("__KLIGHT__", kl).replace("__KDARK__", kd).replace("__KCLASS__", kc)
          .replace("__DATA__", json.dumps(data, ensure_ascii=False).replace("<", "\\u003c")))
i = full.index('<div class="wrap">')
head, body = full[:i], full[i:]
head = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
head = head.replace("</style>", "html { -webkit-text-size-adjust: 100%; }\nbody { margin: 0; }\n</style>")
reg = "<script>if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}</script>\n"
page = ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content">\n'
  '<meta name="theme-color" content="#2238B4">\n<meta name="color-scheme" content="light dark">\n'
  '<link rel="manifest" href="manifest.json">\n<link rel="icon" type="image/png" href="icon-192.png">\n'
  '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n' + head + '\n</head>\n<body>\n' + body + reg + '</body>\n</html>\n')
open(OUT+"index.html", "w", encoding="utf-8").write(page)
js = re.findall(r"<script>(.*?)</script>", page, re.S)
for n, s in enumerate(js):
    open(SP+f"pwa_check{n}.js", "w", encoding="utf-8").write(s)
    print("script", n, "node --check", subprocess.run(["node", "--check", SP+f"pwa_check{n}.js"], capture_output=True, text=True).returncode)
sw = open(OUT+"sw.js", encoding="utf-8").read().replace(OLD_SW, NEW_SW)
open(OUT+"sw.js", "w", encoding="utf-8").write(sw)
print("recettes:", len(seed), "page", len(page))
