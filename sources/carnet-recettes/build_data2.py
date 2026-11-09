import json

import os
SP = os.path.dirname(os.path.abspath(__file__)) + "/"
old = json.load(open(SP + "data.json", encoding="utf-8"))
OLD = {r["id"]: r for r in old["recipes"]}

TYPES = [
    ("plats", "Plats"),
    ("accomp", "Accompagnements"),
    ("sauces", "Sauces"),
    ("petit-dej", "Petit-déjeuner"),
    ("salades", "Salades"),
    ("soupes", "Soupes"),
    ("tajines", "Tajines"),
    ("sandwichs", "Sandwichs / Pizzas"),
    ("snacks", "Snacks & apéro"),
    ("desserts", "Desserts"),
    ("gateaux", "Gâteaux"),
    ("brico", "Astuces Brico"),
    ("aclasser", "À classer"),
]

PANCAKES_ING = [
    "90 g de flocons d'avoine",
    "2 œufs (environ 100 à 110 g)",
    "20 g de miel (1 c. à soupe)",
    "60 ml de lait (¼ de tasse)",
    "125 g de yaourt grec (½ tasse)",
    "2 à 3 g de cannelle (½ c. à café)",
    "1 pincée de sel",
    "2 à 3 g de levure chimique (½ c. à café)",
    "2,5 ml d'extrait de vanille (½ c. à café)",
    "1 c. à café de beurre ou d'huile de coco, pour la poêle",
]
PANCAKES_STEPS = [
    "Mixer les 90 g de flocons d'avoine pendant 10 à 15 secondes pour obtenir une farine.",
    "Ajouter les œufs, le miel, le lait, le yaourt, la vanille, la cannelle, le sel et la levure.",
    "Mixer jusqu'à ce que la pâte soit bien lisse.",
    "Faire chauffer une poêle graissée à feu moyen.",
    "Cuire de petites louches de pâte, 2 à 3 minutes par côté.",
]
PANCAKES_TIPS = [
    "Laisser reposer la pâte 5 minutes pour des pancakes plus moelleux : les flocons absorbent le liquide.",
    "Une banane écrasée dans la pâte fonctionne aussi.",
    "Garnitures possibles : miel, bananes ou fruits rouges, beurre de cacahuète.",
    "Peser les ingrédients directement dans le bol du mixeur posé sur une balance évite de la vaisselle.",
]

POULET_ING = [
    "500 g de blanc de poulet, en morceaux",
    "3 c. à soupe de sauce soja",
    "2 c. à soupe de miel",
    "1 c. à soupe de vinaigre (ou jus de citron)",
    "2 gousses d'ail hachées",
    "1 c. à café de gingembre (facultatif)",
    "1 c. à soupe d'huile",
    "1 c. à café de maïzena (facultatif, pour épaissir)",
    "Graines de sésame",
    "Poivre",
]
POULET_STEPS = [
    "Marinade : mélanger la sauce soja, le miel, l'ail, le gingembre et le vinaigre. Ajouter le poulet et laisser mariner 15 à 30 minutes (10 minutes suffisent).",
    "Cuisson : chauffer l'huile dans une poêle et faire revenir le poulet à feu moyen-vif jusqu'à ce qu'il soit bien doré.",
    "Sauce : verser la marinade dans la poêle et laisser mijoter 5 à 8 minutes, jusqu'à ce que la sauce épaississe et devienne brillante.",
    "Finition : ajouter les graines de sésame. Ajuster : un peu de miel si c'est trop salé, un peu de sauce soja si c'est trop doux.",
]

# type, somme (ligne de liste), niveau d'ingrédients, ingrédients, note, extras
E = {
    "pancakes-ecrit": dict(type="petit-dej", sum="Flocons d'avoine, œufs, miel, yaourt grec, lait", lvl="complete",
        ing=PANCAKES_ING, steps=PANCAKES_STEPS, tips=PANCAKES_TIPS, servings="Environ 2 personnes",
        ingNote="Recette écrite envoyée dans la discussion, version en grammes et millilitres.",
        btn="Voir le reel d'origine (probable) ↗"),
    "pancakes-yt": dict(type="petit-dej", sum="Flocons d'avoine, œufs", lvl="title",
        ing=["Flocons d'avoine", "Œufs"],
        ingNote="D'après le titre de la vidéo (en allemand). Les autres ingrédients ne sont pas connus. Cette version peut différer de la recette écrite ci-dessus."),
    "sandwich-oeuf-fromage": dict(type="sandwichs", sum="Œufs, fromage", lvl="title",
        ing=["Œufs", "Fromage", "Pain"],
        ingNote="D'après le titre et le début de la description (en allemand). Le type de pain et les autres ingrédients ne sont pas connus."),
    "salades-ete": dict(type="salades", sum="3 salades composées", lvl="none", ing=[],
        ingNote="La vidéo présente 3 salades. Leurs ingrédients ne sont pas relevés ici."),
    "guacamole": dict(type="snacks", sum="Ingrédients inconnus", lvl="none", ing=[],
        ingNote="Le lien mène à une recherche Perplexity, pas à une vidéo. Elle contient la réponse.",
        btn="Voir la recherche ↗"),
    "tajine-kefta": dict(type="tajines", sum="Kefta, œufs", lvl="title",
        ing=["Kefta (viande hachée)", "Œufs"],
        probable=["Sauce tomate", "Oignon", "Épices"],
        ingNote="D'après le titre : « Tajine kefta et œufs ». La description annonce une liste d'ingrédients que je n'ai pas pu lire."),
    "tenders": dict(type="plats", sum="Poulet, chapelure panko", lvl="partial",
        ing=["Poulet (tenders)", "Chapelure panko", "Une sauce pour tremper"],
        ingNote="D'après la description de la vidéo. Les quantités ne sont pas connues."),
    "tortilla-oeufs": dict(type="plats", sum="Tortilla, œufs", lvl="partial",
        ing=["Tortilla", "2 œufs", "Eau"],
        ingNote="D'après la description de la vidéo.",
        steps=["Verser de l'eau dans un bol.", "Tremper une tortilla dans l'eau.", "La poser dans une poêle.", "Casser 2 œufs dessus."],
        stepsNote="Début de la description de la vidéo. La suite est dans la vidéo."),
    "flatbread-viral": dict(type="aclasser", sum="Flatbread italien…", lvl="partial",
        ing=["1 flatbread italien"],
        ingNote="La description commence par cet ingrédient, le reste n'est pas lisible. Le type de plat n'est pas connu."),
    "poulet-soja-miel": dict(type="plats", sum="Poulet, sauce soja, miel, ail, gingembre", lvl="complete",
        ing=POULET_ING, steps=POULET_STEPS, servings="3 à 4 personnes",
        ingNote="Recette écrite envoyée dans la discussion. Style asiatique."),
    "hasselback": dict(type="accomp", sum="Pommes de terre…", lvl="partial",
        ing=["Petites pommes de terre (6)"],
        ingNote="La vidéo annonce 3 ingrédients principaux. Seules les pommes de terre sont lisibles dans la description."),
    "pain-pdt-fromage": dict(type="snacks", sum="Pomme de terre, mozzarella, farine, lait", lvl="partial",
        ing=["90 g de farine de force (à pain)", "55 g de lait", "10 g de beurre non salé, fondu", "1 pincée de sel",
             "1 pomme de terre moyenne", "2 c. à soupe de mayonnaise", "Mozzarella", "Miel"],
        ingNote="Traduit de la description coréenne de la vidéo. Les quantités de mozzarella et de miel ne sont pas indiquées. Recette sans four, sans levure, sans œuf."),
    "mais-souffle": dict(type="snacks", sum="Maïs", lvl="title", ing=["Maïs"],
        ingNote="D'après le titre : « Air fryer pop! ». Aucune autre information."),
    "sandwich-oeuf-mayo": dict(type="sandwichs", sum="Œufs, mayonnaise, concombre", lvl="title",
        ing=["Œufs", "Mayonnaise", "Concombre", "Pain"],
        ingNote="D'après le titre : « Egg mayo & Cucumber Sandwich »."),
    "gateau-yaourt": dict(type="desserts", sum="Yaourt…", lvl="title", ing=["Yaourt"],
        ingNote="La vidéo annonce 3 ingrédients. Seul le yaourt ressort du titre. L'auteur propose la recette imprimable via la description YouTube."),
    "noix-caramel": dict(type="snacks", sum="Noix, miel", lvl="partial",
        ing=["200 g de noix", "Eau", "2 c. à soupe de miel"],
        ingNote="La description est coupée après le miel : il manque au moins un ingrédient (1 c. à soupe)."),
    "recette-simple": dict(type="aclasser", sum="Ingrédients inconnus", lvl="none", ing=[],
        ingNote="Le titre est coupé dans le lien Perplexity. Ni le plat ni le type ne sont connus.", btn="Voir la recherche ↗"),
}

BTN = {"YouTube": "Voir la vidéo ↗", "Perplexity": "Voir la recherche ↗", "Texte": "Voir le reel ↗"}

recipes = []
for r in old["recipes"]:
    e = E[r["id"]]
    n = dict(id=r["id"], name=r["name"], cook=r["cook"], src=r["src"], date=r["date"], url=r["url"])
    n.update({k: v for k, v in e.items() if k != "btn"})
    n.setdefault("steps", [])
    n.setdefault("tips", [])
    n.setdefault("probable", [])
    n.setdefault("servings", "")
    n.setdefault("stepsNote", "")
    n["btn"] = e.get("btn") or (BTN.get(r["src"], "Ouvrir ↗") if r["url"] else "")
    recipes.append(n)

# contrôles
ids = [r["id"] for r in recipes]
tids = [t[0] for t in TYPES]
assert len(recipes) == 17 and set(ids) == set(E) == set(OLD)
assert not (set(ids) & set(tids)) and not ({"accueil", "a-identifier"} & (set(ids) | set(tids)))
assert all(r["type"] in tids for r in recipes)
reserved = {"settings", "sidebar", "customize", "upgrade", "downloads"}
assert not (reserved & (set(ids) | set(tids)))
import re
assert all(re.fullmatch(r"[a-z0-9-]+", i) for i in ids + tids)
from collections import Counter
cnt = Counter(r["type"] for r in recipes)
print({t: cnt.get(t, 0) for t in tids}, sum(cnt.values()))

data = dict(types=[dict(id=i, label=l) for i, l in TYPES], recipes=recipes,
            pendingYt=old["pendingYt"], pendingFb=old["pendingFb"])
json.dump(data, open(SP + "data2.json", "w", encoding="utf-8"), ensure_ascii=False)
print(len(json.dumps(data, ensure_ascii=False)), "octets")
