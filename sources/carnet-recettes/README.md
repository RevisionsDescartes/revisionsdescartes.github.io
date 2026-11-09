# Carnet de recettes — sources

Code source de l'appli publiée dans `archives/carnet-recettes/`.
Les recettes elles-mêmes sont dans le dépôt `RevisionsDescartes/carnet-recettes` (`recettes.json`).

## Fichiers
- `pwa.app.js` : tout le code de l'appli.
- `carnet.src.html` + `extra2.css` : gabarit de la page et styles.
- `build_page.py` : palette de couleurs des types (`KC`).
- `data2.json` : liste des types et liens d'origine (« À traiter »).
- `build_pwa.py` : fabrique `pwa/index.html` et incrémente la version du service worker.
- `pwa/` : manifeste, icônes, service worker, jeu de recettes d'essai.
- `t*.js` : tests (Playwright).

## Fabriquer et publier
1. Dans `build_pwa.py`, passer `OLD_SW, NEW_SW` au numéro suivant.
2. `python3 build_pwa.py`
3. Tests : installer Playwright (`npm install playwright`), puis `cd pwa && python3 -m http.server 8765`, et dans un autre terminal `node tbar.js` (etc., un fichier par sujet ; `tupd.js` utilise `srv_cache.py`).
4. Copier `pwa/index.html` et `pwa/sw.js` dans `archives/carnet-recettes/`.

## Ajouter un type de plat
`data2.json` (liste `types`), `build_page.py` (couleurs `KC`), `pwa.app.js` (icône dans `ICONS`).
