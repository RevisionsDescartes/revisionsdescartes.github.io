(function () {
  var BUILD = '__BUILD__';
  var D = JSON.parse(document.getElementById('data').textContent);
  var T = D.types;
  var R = [], byId = Object.create(null), tById = Object.create(null);
  T.forEach(function (t) { tById[t.id] = t; });
  var order = T.map(function (t) { return t.id; });
  function parseOrder(a) {
    var seen = Object.create(null), out = [];
    (Array.isArray(a) ? a : []).forEach(function (id) { if (typeof id === 'string' && tById[id] && !seen[id]) { seen[id] = 1; out.push(id); } });
    T.forEach(function (t) {
      if (seen[t.id]) return;
      // un type ajouté plus tard se place derrière son voisin habituel, sinon avant « À classer »
      var ti = T.indexOf(t), at = -1, k;
      for (k = ti - 1; k >= 0 && at < 0; k--) at = out.indexOf(T[k].id) >= 0 ? out.indexOf(T[k].id) + 1 : -1;
      if (at < 0) { at = out.indexOf('aclasser'); }
      if (at >= 0 && t.id !== 'aclasser') out.splice(at, 0, t.id); else out.push(t.id);
    });
    return out;
  }
  function TS() { return order.map(function (id) { return tById[id]; }); }
  var MEALS = [{ id: 'dejeuner', label: 'Déjeuner', short: 'Déj.' }, { id: 'diner', label: 'Dîner', short: 'Dîn.' }];
  var mById = Object.create(null); MEALS.forEach(function (m) { mById[m.id] = m; });
  var STATUSES = [
    { id: 'essayer', label: 'À essayer', mark: 'À essayer', cls: 't-sandwichs', filter: 'À essayer' },
    { id: 'testee', label: 'Testée', mark: '✓', cls: 't-salades', filter: 'Testées' },
    { id: 'favorite', label: 'Favorite', mark: '★', cls: 't-dejeuner', filter: '★ Favorites' }
  ];
  var sById = Object.create(null); STATUSES.forEach(function (x) { sById[x.id] = x; });
  function cleanStatus(x) { return sById[x] ? x : ''; }
  var RESERVED = { 'a-traiter': 1, 'a-completer': 1, 'recherche': 1, 'partage': 1, 'repas': 1, 'accueil': 1, 'a-identifier': 1, 'ajouter': 1, 'modifier': 1, 'reglages': 1 };
  var view = document.getElementById('view');
  var firstRoute = true;
  var formActive = false;
  function nk(u) { try { return new URL(u).href; } catch (e) { return ''; } }   // clé de comparaison d'un lien
  var ALLP = [], PBY = Object.create(null);
  D.pendingYt.forEach(function (r, i) { ALLP.push({ id: 'Y' + (i + 1), grp: 'YouTube', date: r.date, url: r.url, key: nk(r.url), note: r.note || '', src: 'YouTube', btn: 'Voir la vidéo ↗' }); });
  (function () { var k = 0; Object.keys(D.pendingFb).sort().forEach(function (y) { D.pendingFb[y].forEach(function (r) { k += 1; ALLP.push({ id: 'F' + k, grp: 'Facebook ' + y, date: r.date, url: r.url, key: nk(r.url), note: '', src: 'Facebook', btn: 'Voir le reel ↗' }); }); }); })();
  ALLP.forEach(function (p) { PBY[p.id] = p; });
  var dismissed = [];
  function cleanDismissed(a) {
    var seen = Object.create(null), out = [];
    (Array.isArray(a) ? a : []).forEach(function (u) { var k = typeof u === 'string' ? nk(u) : ''; if (k && !seen[k] && out.length < 3000) { seen[k] = 1; out.push(k); } });
    return out;
  }
  function pendingList() {
    var used = Object.create(null);
    R.forEach(function (r) { if (r.url) used[nk(r.url)] = 1; });
    dismissed.forEach(function (k) { used[k] = 1; });
    return ALLP.filter(function (p) { return !used[p.key]; });
  }
  var LEVELS = {
    complete: ['Liste complète', true],
    partial: ['Liste partielle', false],
    title: ['Déduit du titre', false],
    none: ['Ingrédients inconnus', false],
    user: ['Saisie dans le carnet', true]
  };

  /* Illustrations : formes simples, couleurs héritées du type (voir .themed) */
  var ICONS = {
    plats: '<circle class="b" cx="32" cy="32" r="17"/><circle class="w" cx="32" cy="32" r="11"/><circle class="a" cx="32" cy="32" r="5.5"/>' +
      '<path class="s" d="M6 10v11a4 4 0 0 0 8 0V10M10 10v44"/><path class="s" d="M58 10c-5 4-6 12-6 20h6M58 10v44"/>',
    accomp: '<path class="b" d="M12 31c2-13 10-20 20-20s18 7 20 20z"/><path class="a" d="M6 31h52c0 14-11 25-26 25S6 45 6 31z"/>' +
      '<circle class="w" cx="23" cy="22" r="1.9"/><circle class="w" cx="33" cy="17" r="1.9"/><circle class="w" cx="41" cy="24" r="1.9"/><circle class="w" cx="31" cy="26" r="1.9"/>',
    'petit-dej': '<ellipse class="b" cx="32" cy="53" rx="27" ry="6"/><rect class="a" x="12" y="41" width="40" height="9" rx="4.5"/>' +
      '<rect class="a" x="14" y="31" width="36" height="8" rx="4"/><rect class="a" x="16" y="22" width="32" height="8" rx="4"/>' +
      '<rect class="b" x="26" y="11" width="12" height="8" rx="2.5"/>',
    salades: '<circle class="b" cx="19" cy="30" r="10"/><circle class="b" cx="32" cy="23" r="12"/><circle class="b" cx="46" cy="30" r="10"/>' +
      '<circle class="a" cx="26" cy="22" r="4.5"/><circle class="a" cx="41" cy="27" r="4"/><circle class="a" cx="20" cy="33" r="3.5"/>' +
      '<path class="a" d="M6 36h52c0 13-11 21-26 21S6 49 6 36z"/>',
    soupes: '<path class="s" d="M22 24c-4-4 4-7 0-12M32 24c-4-4 4-7 0-12M42 24c-4-4 4-7 0-12"/>' +
      '<path class="a" d="M6 33h52c0 14-11 24-26 24S6 47 6 33z"/><ellipse class="b" cx="32" cy="33" rx="26" ry="4.5"/>',
    tajines: '<path class="a" d="M32 10c3 0 4 3 5 7l15 24H12l15-24c1-4 2-7 5-7z"/><circle class="b" cx="32" cy="8.5" r="3.5"/>' +
      '<path class="w" d="M19 33h26l1.6 3.2H17.4z"/><path class="b" d="M8 43h48c0 7-5 12-11 12H19c-6 0-11-5-11-12z"/>',
    sandwichs: '<path class="a" d="M8 28c0-10 10-17 24-17s24 7 24 17z"/>' +
      '<ellipse class="w" cx="22" cy="20" rx="2.2" ry="1.3"/><ellipse class="w" cx="32" cy="16.5" rx="2.2" ry="1.3"/><ellipse class="w" cx="43" cy="20.5" rx="2.2" ry="1.3"/>' +
      '<path class="b" d="M6 31c4 5 8-3 13 0s8-3 13 0 8-3 13 0 8-3 13 0v4H6z"/>' +
      '<rect class="a" x="8" y="38" width="48" height="5" rx="2.5"/><path class="a" d="M8 46h48c0 6-4 9-9 9H17c-5 0-9-3-9-9z"/>',
    snacks: '<circle class="b" cx="20" cy="25" r="8"/><circle class="b" cx="32" cy="18" r="9"/><circle class="b" cx="44" cy="25" r="8"/>' +
      '<circle class="b" cx="26" cy="29" r="7"/><circle class="b" cx="38" cy="29" r="7"/>' +
      '<path class="a" d="M14 32h36l-4 25H18z"/><path class="sw" d="M25 35l1.2 19M32 35v19M39 35l-1.2 19"/>',
    desserts: '<path class="a" d="M19 34h26L32 60z"/><path class="sw" d="M24 39l11 12M40 37L28 51"/>' +
      '<circle class="b" cx="32" cy="22" r="14"/><rect class="a" x="15" y="31" width="34" height="6" rx="3"/><circle class="a" cx="32" cy="7" r="4"/>',
    sauces: '<rect class="b" x="21" y="27" width="22" height="31" rx="7"/><rect class="b" x="27" y="15" width="10" height="14" rx="2"/><rect class="a" x="25" y="6" width="14" height="9" rx="2.5"/>' +
      '<rect class="w" x="26" y="36" width="12" height="13" rx="2.5"/>',
    gateaux: '<rect class="a" x="8" y="52" width="48" height="5" rx="2.5"/><rect class="b" x="13" y="31" width="38" height="22" rx="4"/>' +
      '<path class="a" d="M13 35q5 8 9.5 0t9.5 0 9.5 0 9.5 0V33a4 4 0 0 0-4-4H17a4 4 0 0 0-4 4z"/><rect class="a" x="30" y="14" width="4" height="13" rx="1.5"/><circle class="a" cx="32" cy="9" r="3.4"/>',
    brico: '<rect class="a" x="22" y="20" width="10" height="42" rx="5" transform="rotate(45 27 41)"/><circle class="a" cx="43" cy="21" r="14"/>' +
      '<rect class="w" x="43" y="6" width="9" height="15" rx="2" transform="rotate(45 43 21)"/><circle class="b" cx="18" cy="46" r="2.6"/>',
    aclasser: '<circle class="b" cx="32" cy="32" r="24"/><path class="s" d="M24 26c0-5 3.5-8 8-8s8 3 8 8c0 6-8 6-8 12"/><circle class="a" cx="32" cy="46" r="2.8"/>',
    dejeuner: '<circle class="a" cx="32" cy="32" r="12"/><circle class="b" cx="32" cy="32" r="7"/><path class="s" d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.7 5.7M44.7 44.7l5.7 5.7M13.6 50.4l5.7-5.7M44.7 19.3l5.7-5.7"/>',
    diner: '<path class="a" d="M40 8A24 24 0 1 0 56 40 19 19 0 0 1 40 8z"/><circle class="b" cx="49" cy="15" r="3"/><circle class="b" cx="56" cy="27" r="2"/>',
    loupe: '<circle class="b" cx="27" cy="27" r="17"/><circle class="w" cx="27" cy="27" r="10"/><path class="s" style="stroke-width:5" d="M40 40l15 15"/>'
  };

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function plural(n, one, many) { return n + ' ' + (n > 1 ? many : one); }
  function fmt(iso) {
    if (!iso) return '';
    try { var d = new Date(iso + 'T12:00:00'); return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return ''; }
  }
  function soft(label) { return label.replace('Accompagnements', 'Accompagne­ments'); }
  function recipesOf(typeId) { return R.filter(function (r) { return r.type === typeId; }); }
  var TIPTYPES = { brico: 1 };   // types qui ne sont pas des plats : ni repas, ni ingrédients à compléter
  function isTip(r) { return !!TIPTYPES[r.type]; }
  function unitOf(typeId) { return TIPTYPES[typeId] ? ['astuce', 'astuces'] : ['recette', 'recettes']; }
  var AUTO_MEAL = { soupes: 'diner' };   // règle : toute soupe est au dîner, sans rien cocher
  function mealsOf(r) {
    if (TIPTYPES[r.type]) return [];
    var a = r.meals, f = AUTO_MEAL[r.type];
    return (f && a.indexOf(f) < 0) ? cleanMeals(a.concat(f)) : a;
  }
  function incompleteWhy(r) {
    if (TIPTYPES[r.type]) return '';
    if (r.lvl === 'partial' || r.lvl === 'title' || r.lvl === 'none') return (LEVELS[r.lvl] || LEVELS.none)[0];
    return r.ing.length ? '' : 'Aucun ingrédient renseigné';
  }
  function fold(x) { return (x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae'); }
  function searchWords(q) { return fold(q).split(/[^a-z0-9]+/).filter(Boolean); }
  function searchRecipes(q) {
    var words = searchWords(q), out = [];
    if (!words.length) return null;
    R.forEach(function (r) {
      var name = fold(r.name);
      var rest = fold([r.sum, r.ing.join(' '), tById[r.type].label, r.cook, r.src, r.status ? sById[r.status].label : '',
        mealsOf(r).map(function (m) { return mById[m].label; }).join(' '), r.tips.join(' ')].join(' '));
      var score = 0, all = true;
      words.forEach(function (w) { if (name.indexOf(w) >= 0) score += 3; else if (rest.indexOf(w) >= 0) score += 1; else all = false; });
      if (all) out.push({ r: r, score: score });
    });
    out.sort(function (a, b) { return b.score - a.score || a.r.name.localeCompare(b.r.name, 'fr'); });
    return out.map(function (x) { return x.r; });
  }
  var searchQ = '', fstat = '';
  function todoCounts() {
    var recs = {}, aclasser = 0, sans = 0, compl = 0;
    R.forEach(function (r) {
      var a = r.type === 'aclasser', b = !mealsOf(r).length && !isTip(r), c = !!incompleteWhy(r);
      if (a) aclasser++; if (b) sans++; if (c) compl++;
      if (a || c) recs[r.id] = 1;   // « Sans repas » n'entre pas dans le total : Petit-déjeuner, Snacks et Desserts y restent par choix
    });
    return { links: pendingList().length, aclasser: aclasser, sans: sans, compl: compl, recipes: Object.keys(recs).length };
  }
  function recipesOfMeal(mealId) { return R.filter(function (r) { var m = mealsOf(r); return mealId === 'sans' ? (!m.length && !isTip(r)) : m.indexOf(mealId) >= 0; }); }
  function link(href, cls, text) { var a = el('a', cls, text); a.href = href; return a; }
  function ext(href, cls, text) { var a = link(href, cls, text); a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; }
  function back(href, label) { return link(href, 'back', '‹ ' + label); }
  function icon(id, cls) {
    var s = el('span', 'ic-box' + (cls ? ' ' + cls : ''));
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg class="ic" viewBox="0 0 64 64" focusable="false">' + (ICONS[id] || ICONS.aclasser) + '</svg>';
    return s;
  }
  function tcls(typeId) { return 't-' + (tById[typeId] ? typeId : 'aclasser'); }

  /* ---- Stockage local (réglages, copie hors ligne) ---- */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var DEFAULT_REPO = 'RevisionsDescartes/carnet-recettes', FILE = 'recettes.json', BRANCH = 'main';
  var REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
  var cfg = { repo: DEFAULT_REPO, token: '' };
  try {
    var c0 = JSON.parse(lsGet('carnet:cfg') || '{}');
    if (typeof c0.repo === 'string' && REPO_RE.test(c0.repo)) cfg.repo = c0.repo;
    if (typeof c0.token === 'string') cfg.token = c0.token.trim();
  } catch (e) {}
  function saveCfg() { lsSet('carnet:cfg', JSON.stringify(cfg)); }
  function canEdit() { return !!cfg.token; }
  var sync = 'idle';   // idle | ok | offline | missing

  /* ---- Recettes : validation (les données viennent d'un dépôt public, donc non fiables) ---- */
  function str(x, n) { return typeof x === 'string' ? x.trim().slice(0, n) : ''; }
  function cleanList(a, max, n) {
    if (!Array.isArray(a)) return [];
    return a.filter(function (x) { return typeof x === 'string' && x.trim(); }).slice(0, max).map(function (x) { return x.trim().slice(0, n); });
  }
  function cleanUrl(u) {
    if (typeof u !== 'string' || !u) return '';
    try { var x = new URL(u); return (x.protocol === 'https:' || x.protocol === 'http:') ? x.href : ''; } catch (e) { return ''; }
  }
  function cleanMeals(a) {
    var out = [];
    if (Array.isArray(a)) MEALS.forEach(function (m) { if (a.indexOf(m.id) >= 0) out.push(m.id); });
    return out;
  }
  // Associations (« Se marie avec ») : identifiants d'autres fiches. Le lien est enregistré d'un seul côté et affiché des deux.
  function cleanPairs(a, selfId) {
    var seen = Object.create(null), out = [];
    (Array.isArray(a) ? a : []).forEach(function (x) {
      if (typeof x === 'string' && /^[a-z0-9][a-z0-9-]{1,59}$/.test(x) && x !== selfId && !seen[x] && out.length < 40) { seen[x] = 1; out.push(x); }
    });
    return out;
  }
  function partnersOf(r) {
    var seen = Object.create(null), out = [];
    function add(x) { if (x && x.id !== r.id && !seen[x.id]) { seen[x.id] = 1; out.push(x); } }
    r.pairs.forEach(function (id) { add(byId[id]); });
    R.forEach(function (x) { if (x.pairs.indexOf(r.id) >= 0) add(x); });
    return out;
  }
  function applyPair(list, op) {
    var a = op.pair[0], b = op.pair[1], A = null, B = null;
    var out = list.map(function (r) { var c = {}; Object.keys(r).forEach(function (k) { c[k] = r[k]; }); c.pairs = r.pairs.slice(); if (c.id === a) A = c; if (c.id === b) B = c; return c; });
    if (!A || !B || a === b) throw new Error('invalide');
    A.pairs = A.pairs.filter(function (x) { return x !== b; }); B.pairs = B.pairs.filter(function (x) { return x !== a; });
    if (op.on) A.pairs.push(b);
    return out;
  }
  // Plusieurs associations d'une même fiche en un seul enregistrement : { id, add: [ids], del: [ids] }
  function applyPairs(list, ch) {
    var by = Object.create(null);
    var out = list.map(function (r) { var c = {}; Object.keys(r).forEach(function (k) { c[k] = r[k]; }); c.pairs = r.pairs.slice(); by[c.id] = c; return c; });
    var A = by[ch.id]; if (!A) throw new Error('invalide');
    function unlink(b) { A.pairs = A.pairs.filter(function (x) { return x !== b; }); if (by[b]) by[b].pairs = by[b].pairs.filter(function (x) { return x !== A.id; }); }
    cleanPairs(ch.del, A.id).forEach(unlink);
    cleanPairs(ch.add, A.id).forEach(function (b) { if (by[b]) { unlink(b); A.pairs.push(b); } });   // une fiche retirée entre-temps est ignorée
    return out;
  }
  function normalize(o) {
    if (!o || typeof o !== 'object') return null;
    var id = typeof o.id === 'string' ? o.id : '';
    if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(id) || RESERVED[id] || tById[id]) return null;
    var name = str(o.name, 120); if (!name) return null;
    var ing = cleanList(o.ing, 60, 400);
    return {
      id: id, name: name, type: tById[o.type] ? o.type : 'aclasser',
      cook: str(o.cook, 60), servings: str(o.servings, 60),
      src: str(o.src, 40) || 'Ajoutée', date: (typeof o.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.date)) ? o.date : '',
      url: cleanUrl(o.url), btn: str(o.btn, 60) || 'Ouvrir le lien ↗', lvl: LEVELS[o.lvl] ? o.lvl : 'user',
      ing: ing, probable: cleanList(o.probable, 20, 100), ingNote: str(o.ingNote, 600),
      steps: cleanList(o.steps, 60, 600), stepsNote: str(o.stepsNote, 600), tips: cleanList(o.tips, 20, 400),
      sum: str(o.sum, 200) || ing.slice(0, 4).join(', '), ts: typeof o.ts === 'number' ? o.ts : 0,
      meals: cleanMeals(o.meals), status: cleanStatus(o.status), pairs: cleanPairs(o.pairs, id)
    };
  }
  function parseRecipes(data) {
    var seen = Object.create(null), out = [];
    ((data && Array.isArray(data.recipes)) ? data.recipes : []).forEach(function (o) {
      var r = normalize(o); if (r && !seen[r.id]) { seen[r.id] = 1; out.push(r); }
    });
    return out;
  }
  function useList(list) {
    R = list; byId = Object.create(null);
    R.forEach(function (r) { byId[r.id] = r; });
  }
  function setData(list, ord, dis) { useList(list); order = parseOrder(ord); dismissed = dis || dismissed; lsSet('carnet:data', JSON.stringify({ recipes: list, typeOrder: order, dismissed: dismissed })); }

  var seed = parseRecipes({ recipes: D.recipes });
  var cached = null, cachedOrder = null;
  try {
    var cj = JSON.parse(lsGet('carnet:data') || 'null');
    if (Array.isArray(cj)) cached = parseRecipes({ recipes: cj });
    else if (cj && typeof cj === 'object') { cached = parseRecipes(cj); cachedOrder = cj.typeOrder; }
  } catch (e) {}
  useList(cached && cached.length ? cached : seed);
  order = parseOrder(cachedOrder);
  try { dismissed = cleanDismissed((JSON.parse(lsGet('carnet:data') || 'null') || {}).dismissed); } catch (e) {}

  /* ---- Dépôt de données (API GitHub) ---- */
  function b64dec(s) {
    var bin = atob(s.replace(/\s/g, '')), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function b64enc(s) {
    var bytes = new TextEncoder().encode(s), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function api(path, opts) {
    opts = opts || {};
    var h = { 'Accept': 'application/vnd.github+json' };
    if (cfg.token) h['Authorization'] = 'Bearer ' + cfg.token;
    if (opts.body) h['Content-Type'] = 'application/json';
    return fetch('https://api.github.com' + path, { method: opts.method || 'GET', headers: h, body: opts.body, cache: 'no-store' })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) { var e = new Error((j && j.message) || ('HTTP ' + r.status)); e.status = r.status; throw e; }
          return j;
        });
      });
  }
  function fetchRemote() {
    return api('/repos/' + cfg.repo + '/contents/' + FILE + '?ref=' + BRANCH).then(function (j) {
      var data;
      try { data = JSON.parse(b64dec(j.content)); } catch (e) { throw new Error('format'); }
      return { sha: j.sha, recipes: parseRecipes(data), order: parseOrder(data && data.typeOrder), dismissed: cleanDismissed(data && data.dismissed) };
    });
  }
  var lastSync = 0;
  function refreshData(force) {
    if (!force && Date.now() - lastSync < 60000) return Promise.resolve();
    lastSync = Date.now();
    return fetchRemote().then(function (rm) {
      var ord = inflight > 0 ? order : rm.order;
      var changed = JSON.stringify(rm.recipes) !== JSON.stringify(R) || ord.join() !== order.join() || rm.dismissed.join() !== dismissed.join() || sync !== 'ok';
      sync = 'ok'; setData(rm.recipes, ord, rm.dismissed);
      if (changed) rerender();
    }, function (e) {
      var s = e && e.status === 404 ? 'missing' : 'offline';
      if (s !== sync) { sync = s; rerender(); }
    });
  }
  function applyOp(list, op) {
    var out = list.slice(), i = -1;
    out.forEach(function (r, k) { if (r.id === op.id) i = k; });
    if (op.del) { if (i >= 0) out.splice(i, 1); return out; }
    var rec = normalize(op.rec); if (!rec) throw new Error('invalide');
    rec.pairs = i >= 0 ? out[i].pairs.slice() : [];
    if (i >= 0) out[i] = rec; else out.unshift(rec);
    return out;
  }
  /* Remplit plusieurs fiches d'un coup (import depuis NotebookLM) : seuls les champs de contenu changent */
  function applyFill(list, items) {
    var out = list.slice(), at = Object.create(null);
    out.forEach(function (r, k) { at[r.id] = k; });
    (Array.isArray(items) ? items : []).slice(0, 60).forEach(function (it) {
      if (!it || at[it.id] === undefined) return;
      var o = out[at[it.id]], c = {}; Object.keys(o).forEach(function (k) { c[k] = o[k]; });
      c.ing = it.ing; c.steps = it.steps; c.tips = it.tips && it.tips.length ? it.tips : o.tips;
      if (it.cook) c.cook = it.cook; if (it.servings) c.servings = it.servings;
      c.lvl = it.lvl === 'complete' ? 'complete' : 'partial'; c.probable = [];
      c.ingNote = 'Fiche tirée de la transcription de la vidéo (NotebookLM) : à vérifier.'; c.stepsNote = ''; c.sum = '';
      var n = normalize(c); if (n) out[at[it.id]] = n;
    });
    return out;
  }
  /* Écrit une modification : relit toujours la dernière version avant d'appliquer, et réessaie si un autre appareil a écrit entre-temps. */
  function commit(op, message) {
    function attempt(n) {
      return fetchRemote().catch(function (e) {
        if (e && e.status === 404) return { sha: undefined, recipes: R, order: order, dismissed: dismissed };
        throw e;
      }).then(function (rm) {
        var list = op.id ? applyOp(rm.recipes, op) : rm.recipes;
        if (op.pair) list = applyPair(list, op);
        if (op.pairs) list = applyPairs(list, op.pairs);
        if (op.fill) list = applyFill(list, op.fill);
        var ord = op.order ? parseOrder(op.order) : rm.order;
        var dis = op.dismiss ? cleanDismissed(rm.dismissed.concat([op.dismiss])) : rm.dismissed;
        var body = { message: message.slice(0, 120), content: b64enc(JSON.stringify({ recipes: list, typeOrder: ord, dismissed: dis }, null, 1) + '\n'), branch: BRANCH };
        if (rm.sha) body.sha = rm.sha;
        return api('/repos/' + cfg.repo + '/contents/' + FILE, { method: 'PUT', body: JSON.stringify(body) }).then(function () { return { list: list, ord: ord, dis: dis }; }, function (e) {
          if ((e.status === 409 || e.status === 422) && n < 2) return attempt(n + 1);
          throw e;
        });
      });
    }
    return attempt(0).then(function (res) { sync = 'ok'; setData(res.list, res.ord, res.dis); return res.list; });
  }
  /* Retirer une recette : bouton + confirmation. Le lien d'origine n'est plus proposé dans « À traiter ». */
  function removeControl(rec, errEl, statusEl, label) {
    var dz = el('div', 'rmzone');
    var del = el('button', 'btn danger', label || 'Retirer cette recette'); del.type = 'button';
    del.onclick = function () {
      dz.textContent = '';
      var box = el('div', 'confirm');
      box.appendChild(el('p', null, 'Retirer « ' + rec.name + ' » du carnet ?'));
      var wasPending = !!(rec.url && nk(rec.url) && ALLP.some(function (q) { return q.key === nk(rec.url); }));
      var hint = wasPending ? 'Son lien ne sera plus proposé dans « À traiter ». ' : '';
      box.appendChild(el('p', 'help', hint + 'Cette action est définitive.'));
      var row = el('div', 'actions');
      var yes = el('button', 'btn danger', 'Oui, retirer'); yes.type = 'button';
      var no = el('button', 'btn ghost', 'Non, garder'); no.type = 'button';
      no.onclick = function () { dz.textContent = ''; dz.appendChild(del); del.focus(); };
      yes.onclick = function () {
        yes.disabled = true; no.disabled = true; errEl.textContent = ''; statusEl.textContent = 'Suppression…';
        var op = { id: rec.id, del: true };
        if (wasPending) op.dismiss = nk(rec.url);   // sinon le lien d'origine reviendrait dans « À traiter »
        commit(op, 'Retire : ' + rec.name).then(function () {
          location.hash = '#' + rec.type;
        }, function (e) { yes.disabled = false; no.disabled = false; statusEl.textContent = ''; errEl.textContent = writeError(e); });
      };
      row.appendChild(yes); row.appendChild(no); box.appendChild(row); dz.appendChild(box); yes.focus();
    };
    dz.appendChild(del);
    return dz;
  }
  function writeError(e) {
    var s = e && e.status;
    if (s === 401) return 'Jeton refusé ou expiré. Vérifiez-le dans les réglages.';
    if (s === 403 || s === 404) return 'Ce jeton ne peut pas écrire dans le dépôt du carnet (ou le dépôt est introuvable). Vérifiez les réglages.';
    if (s === 409 || s === 422) return 'Le carnet a été modifié ailleurs en même temps. Rechargez la page puis recommencez.';
    if (!s) return 'Pas de connexion : la modification n’a pas été enregistrée.';
    return 'L’enregistrement a échoué (' + s + '). Réessayez.';
  }

  function addButton(href, label) { return link(href, 'btn', label); }
  /* Barre fixe en bas de l'écran : recherche (accueil) et bouton Ajouter (listes) */
  var bar = document.createElement('div'); bar.className = 'bar'; bar.hidden = true;
  var barIn = el('div', 'bar-in'); bar.appendChild(barIn); document.body.appendChild(bar);
  function clearBar() { barIn.textContent = ''; bar.hidden = true; document.body.classList.remove('hasbar'); }
  function showBar(nodes) { nodes.forEach(function (n) { if (n) barIn.appendChild(n); }); bar.hidden = !nodes.some(Boolean); document.body.classList.toggle('hasbar', !bar.hidden); }
  function barAdd(href, label, aria) { var a = link(href, 'btn barbtn', label); if (aria) a.setAttribute('aria-label', aria); return a; }
  function syncHint() {
    if (sync === 'offline') return el('p', 'hint', 'Hors connexion : dernière version enregistrée sur cet appareil.');
    if (sync === 'missing') return el('p', 'hint', 'Dépôt de données introuvable : recettes intégrées à l’appli affichées.');
    return null;
  }

  /* Réorganiser les types : appui long puis glissement (tactile), glisser (souris), flèches (clavier) */
  var reorder = false, inflight = 0, savingP = Promise.resolve(), statusEl = null, reorderOff = null;
  function setStatus(msg, isErr) {
    if (statusEl && statusEl.isConnected) { statusEl.textContent = msg; statusEl.className = isErr ? 'err' : 'status'; }
  }
  function orderFromDom(grid) {
    var vis = Array.prototype.map.call(grid.querySelectorAll('.tile[data-type]'), function (t) { return t.getAttribute('data-type'); });
    return vis.concat(order.filter(function (id) { return vis.indexOf(id) < 0; }));
  }
  function saveOrder(next) {
    if (next.join() === order.join()) return;
    var prev = order.slice(); order = next; inflight += 1;
    setStatus('Enregistrement de l’ordre…');
    savingP = savingP.then(function () { return commit({ order: next }, 'Réorganise les types'); }).then(function () {
      inflight -= 1;
      if (!inflight) setStatus('Ordre enregistré. Vos autres appareils le verront à leur prochaine ouverture.');
    }, function (e) {
      inflight -= 1; order = prev;
      if (reorder) { route(true); setStatus(writeError(e), true); }
    });
  }
  function enableReorder(grid) {
    if (reorderOff) reorderOff();
    var drag = null, timer = null, kbTimer = null, sx = 0, sy = 0, last = { x: 0, y: 0 }, raf = 0, mousePending = null;
    function tiles() { return Array.prototype.slice.call(grid.querySelectorAll('.tile[data-type]')); }
    function xy(e) { var t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e; return { x: t.clientX, y: t.clientY }; }
    function pick(tile, p) {
      var r = tile.getBoundingClientRect(), g = tile.cloneNode(true);
      g.classList.add('ghost'); g.removeAttribute('tabindex'); g.removeAttribute('data-type');
      g.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
      document.body.appendChild(g);
      tile.classList.add('placeholder');
      drag = { tile: tile, ghost: g, dx: p.x - r.left, dy: p.y - r.top };
      try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) {}
      last = p; loop();
    }
    function hit(p) {
      var list = tiles();
      for (var i = 0; i < list.length; i++) {
        var t = list[i]; if (t === drag.tile) continue;
        var r = t.getBoundingClientRect();
        if (p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom) {
          if (list.indexOf(drag.tile) < i) grid.insertBefore(drag.tile, t.nextSibling); else grid.insertBefore(drag.tile, t);
          return;
        }
      }
    }
    function move(p) {
      last = p;
      drag.ghost.style.left = (p.x - drag.dx) + 'px'; drag.ghost.style.top = (p.y - drag.dy) + 'px';
      hit(p);
    }
    function loop() {   /* défilement automatique près des bords */
      if (!drag) return;
      var h = window.innerHeight || 800, v = 0;
      if (last.y < 80) v = -12; else if (last.y > h - 80) v = 12;
      if (v) { try { window.scrollBy(0, v); } catch (e) {} hit(last); }
      raf = requestAnimationFrame(loop);
    }
    function end() {
      clearTimeout(timer); mousePending = null;
      if (!drag) return;
      cancelAnimationFrame(raf);
      if (drag.ghost.parentNode) drag.ghost.parentNode.removeChild(drag.ghost);
      drag.tile.classList.remove('placeholder'); drag = null;
      saveOrder(orderFromDom(grid));
    }
    /* tactile : appui long (350 ms), puis le doigt entraîne la tuile */
    grid.addEventListener('touchstart', function (e) {
      var t = e.target.closest ? e.target.closest('.tile[data-type]') : null;
      if (!t || drag || (e.touches && e.touches.length > 1)) return;
      var p = xy(e); sx = p.x; sy = p.y; last = p;
      clearTimeout(timer); timer = setTimeout(function () { pick(t, last); }, 350);
    }, { passive: true });
    grid.addEventListener('touchmove', function (e) {
      var p = xy(e);
      if (drag) { e.preventDefault(); move(p); return; }
      last = p;
      if (Math.abs(p.x - sx) > 8 || Math.abs(p.y - sy) > 8) clearTimeout(timer);   // l'utilisateur fait défiler la page
    }, { passive: false });
    grid.addEventListener('touchend', end);
    grid.addEventListener('touchcancel', end);
    /* souris : glisser dès 5 px */
    grid.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      var t = e.target.closest ? e.target.closest('.tile[data-type]') : null;
      if (t) mousePending = { tile: t, x: e.clientX, y: e.clientY };
    });
    function onPtrMove(e) {
      if (e.pointerType === 'touch') return;
      var p = { x: e.clientX, y: e.clientY };
      if (drag) { move(p); return; }
      if (mousePending && (Math.abs(p.x - mousePending.x) > 5 || Math.abs(p.y - mousePending.y) > 5) && grid.isConnected) pick(mousePending.tile, { x: mousePending.x, y: mousePending.y }), move(p);
    }
    function onPtrUp(e) { if (e.pointerType !== 'touch') end(); }
    document.addEventListener('pointermove', onPtrMove);
    document.addEventListener('pointerup', onPtrUp);
    reorderOff = function () { document.removeEventListener('pointermove', onPtrMove); document.removeEventListener('pointerup', onPtrUp); reorderOff = null; };
    grid.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    /* clavier : flèches sur une tuile */
    grid.addEventListener('keydown', function (e) {
      var t = e.target; if (!t.getAttribute || !t.getAttribute('data-type')) return;
      var k = e.key, list = tiles(), i = list.indexOf(t);
      if ((k === 'ArrowLeft' || k === 'ArrowUp') && i > 0) grid.insertBefore(t, list[i - 1]);
      else if ((k === 'ArrowRight' || k === 'ArrowDown') && i < list.length - 1) grid.insertBefore(t, list[i + 1].nextSibling);
      else return;
      e.preventDefault(); t.focus();
      clearTimeout(kbTimer); kbTimer = setTimeout(function () { saveOrder(orderFromDom(grid)); }, 700);
    });
  }

  /* Niveau 1 : types de plats */
  var cameFrom = '';   // dernière liste ouverte : sert au lien « retour » de la fiche
  function viewSwitch(mode) {
    var nav = el('nav', 'seg'); nav.setAttribute('aria-label', 'Affichage');
    [['types', '#accueil', 'Types de plat'], ['repas', '#repas', 'Repas']].forEach(function (x) {
      var a = link(x[1], null, x[2]);
      if (mode === x[0]) a.setAttribute('aria-current', 'page');
      nav.appendChild(a);
    });
    return nav;
  }
  function home(mode) {
    mode = (mode === 'repas' && !reorder) ? 'repas' : 'types';
    lsSet('carnet:view', mode);
    view.appendChild(el('h1', null, 'Carnet de recettes'));
    if (reorder) view.appendChild(el('p', 'sub', 'Maintenez une tuile enfoncée, puis faites-la glisser.'));
    var results = null, hb = view;
    if (!reorder) {
      results = el('div', 'results'); results.hidden = true; view.appendChild(results);
      hb = el('div', 'homebody'); view.appendChild(hb);
      hb.appendChild(viewSwitch(mode));
      showBar([searchBox(), canEdit() ? barAdd('#ajouter', '+ Ajouter', 'Ajouter une recette') : null]);
    }
    if (reorder) view.className = 'reordering';
    if (canEdit() && reorder) {
      var row = el('div', 'rowbtns');
      var done = el('button', 'btn', 'Terminé'); done.type = 'button';
      done.onclick = function () { reorder = false; statusEl = null; route(true); };
      row.appendChild(done);
      view.appendChild(row);
    }
    if (reorder) { statusEl = el('p', 'status'); statusEl.setAttribute('aria-live', 'polite'); view.appendChild(statusEl); }
    var hint = reorder ? null : syncHint(); if (hint) hb.appendChild(hint);
    var grid = el('div', 'tiles');
    if (reorder) grid.setAttribute('role', 'list');
    if (mode === 'repas') {
      MEALS.concat([{ id: 'sans', label: 'Sans repas' }]).forEach(function (m) {
        var n = recipesOfMeal(m.id).length;
        if (m.id === 'sans' && !n) return;
        var sans = m.id === 'sans';
        var a = link('#repas/' + m.id, 'tile themed ' + (sans ? 't-aclasser wide' : 't-' + m.id + (n ? ' feat' : '')) + (n ? '' : ' zero'));
        a.appendChild(icon(sans ? 'aclasser' : m.id));
        var tx = el('span', 'txt');
        tx.appendChild(el('span', 'tn', m.label));
        tx.appendChild(el('span', 'tc', n ? plural(n, 'recette', 'recettes') : 'Aucune pour l’instant'));
        a.appendChild(tx);
        grid.appendChild(a);
      });
    } else TS().forEach(function (t) {
      var n = recipesOf(t.id).length;
      if (t.id === 'aclasser' && !n) return;
      var cls = 'tile themed ' + tcls(t.id) + (n ? '' : ' zero');
      var a;
      if (reorder) {
        a = el('div', cls); a.setAttribute('data-type', t.id); a.tabIndex = 0; a.setAttribute('role', 'listitem');
        a.setAttribute('aria-label', t.label + '. Flèches pour déplacer.');
      } else a = link('#' + t.id, cls);
      a.appendChild(icon(t.id));
      if (reorder) { var gr = el('span', 'grip', '⋮⋮'); gr.setAttribute('aria-hidden', 'true'); a.appendChild(gr); }
      var tx = el('span', 'txt');
      tx.appendChild(el('span', 'tn', soft(t.label)));
      tx.appendChild(el('span', 'tc', n ? plural(n, unitOf(t.id)[0], unitOf(t.id)[1]) : 'Aucune pour l’instant'));
      a.appendChild(tx);
      grid.appendChild(a);
    });
    if (!reorder) {
      var tc = todoCounts();
      var q = link('#a-traiter', 'tile queue themed');
      q.appendChild(icon('loupe'));
      var qt = el('span', 'txt');
      qt.appendChild(el('span', 'tn', 'À traiter'));
      qt.appendChild(el('span', 'tc', (tc.links || tc.recipes) ? [tc.links ? plural(tc.links, 'lien', 'liens') : '', tc.recipes ? plural(tc.recipes, 'recette', 'recettes') : ''].filter(Boolean).join(' · ') : 'Rien à traiter'));
      q.appendChild(qt);
      grid.appendChild(q);
    }
    (reorder ? view : hb).appendChild(grid);
    if (reorder) enableReorder(grid);
    else {
      var foot = el('div', 'foot');
      foot.appendChild(link('#reglages', null, 'Réglages · ' + (canEdit() ? 'modification activée' : 'lecture seule')));
      if (canEdit() && mode === 'types') {
        var rb = el('button', 'linkbtn', 'Réorganiser les types'); rb.type = 'button';
        rb.onclick = function () { reorder = true; route(true); try { window.scrollTo(0, 0); } catch (e) {} };
        foot.appendChild(rb);
      }
      hb.appendChild(foot);
    }
    if (results && searchWords(searchQ).length) { showResults(results, hb); }
  }

  /* Recherche */
  function searchBox() {
    var wrap = el('div', 'searchbox');
    var inp = el('input'); inp.type = 'search'; inp.id = 'q'; inp.placeholder = 'Rechercher une recette'; inp.value = searchQ;
    inp.autocomplete = 'off'; inp.setAttribute('enterkeyhint', 'search'); inp.setAttribute('aria-label', 'Rechercher une recette ou un ingrédient');
    inp.addEventListener('input', function () {
      searchQ = inp.value;
      var res = view.querySelector('.results'), body = view.querySelector('.homebody');
      if (res && body) showResults(res, body);
    });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
    wrap.appendChild(inp);
    return wrap;
  }
  function showResults(res, body) {
    var list = searchRecipes(searchQ);
    res.textContent = '';
    if (!list) { res.hidden = true; body.hidden = false; return; }
    res.hidden = false; body.hidden = true;
    var cnt = el('p', 'sub', list.length ? plural(list.length, 'résultat', 'résultats') : 'Aucun résultat'); cnt.setAttribute('role', 'status'); res.appendChild(cnt);
    if (!list.length) { var eb = el('div', 'emptybox'); eb.appendChild(el('p', null, 'Essayez un autre mot, ou un seul mot-clé. La recherche porte sur le nom, les ingrédients, le type, le repas et le statut.')); res.appendChild(eb); return; }
    var ul = el('ul', 'rows');
    list.slice(0, 60).forEach(function (r) {
      var li = el('li'), a = link('#' + r.id, 'row themed ' + tcls(r.type));
      a.appendChild(icon(r.type));
      a.appendChild(el('span', 'rn', r.name));
      var sb = srcBadge(r); if (sb) a.appendChild(sb);
      if (r.status) a.appendChild(statusChip(r.status));
      var why = incompleteWhy(r);
      if (why) { var d = el('span', 'dot'); d.title = why; d.setAttribute('role', 'img'); d.setAttribute('aria-label', 'Recette incomplète : ' + why); a.appendChild(d); }
      a.appendChild(el('span', 'chev', '›'));
      a.addEventListener('click', function () { cameFrom = '#recherche'; });
      li.appendChild(a); ul.appendChild(li);
    });
    res.appendChild(ul);
    if (list.length > 60) res.appendChild(el('p', 'hint', 'Seuls les 60 premiers résultats sont affichés. Précisez votre recherche.'));
  }

  /* Niveau 2 : plats d'un type */
  function typeScreen(t) {
    var all = recipesOf(t.id), items = byStatus(all);
    cameFrom = '#' + t.id; searchQ = '';
    view.className = 'themed ' + tcls(t.id);
    view.appendChild(back('#accueil', 'Types de plats'));
    var ban = el('div', 'banner');
    ban.appendChild(icon(t.id));
    var bt = el('div');
    bt.appendChild(el('h1', null, t.label));
    var un = unitOf(t.id);
    bt.appendChild(el('p', 'sub', fstat ? items.length + ' sur ' + plural(all.length, un[0], un[1]) : (items.length ? plural(items.length, un[0], un[1]) : 'Aucune ' + un[0] + ' pour l’instant')));
    ban.appendChild(bt);
    view.appendChild(ban);
    if (canEdit()) showBar([barAdd('#ajouter/' + t.id, '+ Ajouter à ' + t.label)]);
    var hint = syncHint(); if (hint) view.appendChild(hint);
    var fb = all.length ? filterBar() : null; if (fb) view.appendChild(fb);
    if (all.length && !items.length) {
      var fe = el('div', 'emptybox'); fe.appendChild(el('p', null, 'Aucune ' + un[0] + ' de ce type avec ce statut.'));
      var fr = el('button', 'linkbtn', 'Voir toutes les ' + un[1]); fr.type = 'button'; fr.onclick = function () { fstat = ''; route(true); };
      fe.appendChild(fr); view.appendChild(fe); return;
    }
    if (!items.length) {
      var box = el('div', 'emptybox');
      box.appendChild(el('p', null, t.id === 'soupes'
        ? 'Aucune soupe dans les recettes identifiées. Il y en a peut-être parmi les liens à identifier.'
        : TIPTYPES[t.id] ? 'Aucune astuce pour l’instant. Touchez « Ajouter » pour enregistrer la première.' : 'Aucune recette dans ce type pour l’instant.'));
      if (!TIPTYPES[t.id]) box.appendChild(link('#a-identifier', null, 'Voir les liens à identifier'));
      view.appendChild(box);
      return;
    }
    view.appendChild(rowList(items, true));
  }

  /* Liste condensée : une ligne par recette */
  function statusChip(id) {
    var st = sById[id], c = el('span', 'schip s-' + id, st.mark);
    c.title = st.label; c.setAttribute('role', 'img'); c.setAttribute('aria-label', st.label);
    return c;
  }
  /* Filtre par statut (valable pour toutes les listes tant que l'appli reste ouverte) */
  function filterBar() {
    var any = R.some(function (r) { return r.status; });
    if (!any && !fstat) return null;
    var nav = el('nav', 'fbar'); nav.setAttribute('aria-label', 'Filtrer par statut');
    [{ id: '', filter: 'Toutes' }].concat(STATUSES.slice().reverse()).forEach(function (x) {
      var b = el('button', 'fchip' + (fstat === x.id ? ' on' : ''), x.filter); b.type = 'button';
      b.setAttribute('aria-pressed', fstat === x.id ? 'true' : 'false');
      b.onclick = function () { fstat = x.id; route(true); };
      nav.appendChild(b);
    });
    return nav;
  }
  function byStatus(items) { return fstat ? items.filter(function (r) { return r.status === fstat; }) : items; }
  var expanded = Object.create(null);   // groupes dépliés (vue Repas), conservés tant que l'appli reste ouverte
  var GROUP_MAX = 3;
  function rowList(items, showMeals, key, combo) {
    var ul = el('ul', 'rows');
    var extra = [];
    var anyThumb = items.some(function (r) { return !!thumbSrc(r.url); });   // si au moins une miniature, les autres lignes gardent la même place
    items.forEach(function (r, i) {
      var li = el('li');
      if (key && i >= GROUP_MAX) { extra.push(li); li.hidden = !expanded[key]; }
      var a = link('#' + r.id, 'row');
      if (anyThumb) {
        var th = el('span', 'th'), ts = thumbSrc(r.url);
        var ph = function () { th.className = 'th ph'; th.textContent = ''; th.appendChild(icon(r.type)); };
        if (ts) { var im = thumbImg(ts, null); im.onerror = function () { ph(); }; th.appendChild(im); } else ph();
        a.appendChild(th);
      }
      a.appendChild(el('span', 'rn', r.name));
      var sb = srcBadge(r); if (sb) a.appendChild(sb);
      if (r.status) a.appendChild(statusChip(r.status));
      if (showMeals) mealsOf(r).forEach(function (id) { a.appendChild(el('span', 'mchip', mById[id].short)); });
      var why = incompleteWhy(r);
      if (why) {
        var d = el('span', 'dot'); d.title = why; d.setAttribute('role', 'img'); d.setAttribute('aria-label', 'Recette incomplète : ' + why);
        a.appendChild(d);
      }
      a.appendChild(el('span', 'chev', '›'));
      li.appendChild(a);
      if (combo) comboLine(r, li, anyThumb);
      ul.appendChild(li);
    });
    if (extra.length) {
      var more = el('li'), btn = el('button', 'more', '');
      btn.type = 'button';
      var sync = function () {
        var open = !!expanded[key];
        extra.forEach(function (x) { x.hidden = !open; });
        btn.textContent = open ? 'Réduire' : '···';
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.setAttribute('aria-label', open ? 'Réduire la liste' : 'Afficher les ' + plural(extra.length, 'autre recette', 'autres recettes'));
      };
      btn.onclick = function () { expanded[key] = !expanded[key]; sync(); };
      sync(); more.appendChild(btn); ul.appendChild(more);
    }
    return ul;
  }

  // Onglet Repas : sous chaque plat, ses accompagnements en pastilles et un « + » pour en associer sans quitter la liste
  function comboLine(r, li, indent) {
    var partners = partnersOf(r).filter(function (x) { return !isTip(x); });
    var canAdd = canEdit() && !!MAIN_TYPES[r.type];
    if (!partners.length && !canAdd) return;
    var line = el('div', 'combo' + (indent ? ' ind' : ''));
    if (partners.length) {
      line.appendChild(el('span', 'cavec', 'avec'));
      partners.forEach(function (x) { var c = link('#' + x.id, 'cchip t-' + x.type, x.name); c.title = tById[x.type].label + ' : ' + x.name; line.appendChild(c); });
    }
    li.appendChild(line);
    if (!canAdd) return;
    var perr = el('p', 'perr'); perr.setAttribute('role', 'alert');
    var add = el('button', 'cadd', partners.length ? '+' : '+ accompagnement'); add.type = 'button';
    add.setAttribute('aria-label', 'Associer des accompagnements à ' + r.name);
    add.onclick = function () {
      add.hidden = true;
      pairPicker(r, perr, function (box) { li.insertBefore(box, perr); }, function () { add.hidden = false; add.focus(); });
    };
    line.appendChild(add); li.appendChild(perr);
  }

  /* Niveau 2 (vue Repas) : recettes d'un repas, groupées par type */
  function mealScreen(id) {
    var sans = id === 'sans';
    var m = sans ? { id: 'sans', label: 'Sans repas' } : mById[id];
    var all = recipesOfMeal(id), items = byStatus(all);
    cameFrom = '#repas/' + id; searchQ = '';
    view.className = 'themed ' + (sans ? 't-aclasser' : 't-' + id);
    view.appendChild(back('#repas', 'Repas'));
    var ban = el('div', 'banner');
    ban.appendChild(icon(sans ? 'aclasser' : id));
    var bt = el('div');
    bt.appendChild(el('h1', null, m.label));
    var subP = el('p', 'sub', fstat ? items.length + ' sur ' + plural(all.length, 'recette', 'recettes') : (items.length ? plural(items.length, 'recette', 'recettes') : 'Aucune recette pour l’instant'));
    bt.appendChild(subP);
    ban.appendChild(bt);
    view.appendChild(ban);
    if (canEdit()) showBar([sans ? barAdd('#ajouter', '+ Ajouter une recette') : barAdd('#ajouter/repas-' + id, '+ Ajouter à ' + m.label)]);
    var hint = syncHint(); if (hint) view.appendChild(hint);
    if (sans && all.length) view.appendChild(el('p', 'sub', 'Ces recettes n’ont pas encore de repas. Ouvrez-en une, puis « Modifier ».'));
    var fb = all.length ? filterBar() : null; if (fb) view.appendChild(fb);
    if (all.length && !items.length) {
      var fe = el('div', 'emptybox'); fe.appendChild(el('p', null, 'Aucune recette avec ce statut ici.'));
      var fr = el('button', 'linkbtn', 'Voir toutes les recettes'); fr.type = 'button'; fr.onclick = function () { fstat = ''; route(true); };
      fe.appendChild(fr); view.appendChild(fe); return;
    }
    if (!items.length) {
      var box = el('div', 'emptybox');
      box.appendChild(el('p', null, sans ? 'Toutes les recettes ont un repas.' : 'Aucune recette n’a ce repas pour l’instant. Ouvrez une recette, puis « Modifier », pour lui en donner un.'));
      view.appendChild(box);
      return;
    }
    // Déjeuner / Dîner : d'abord les plats (avec leurs accompagnements), puis les accompagnements, sauces et salades qui ne vont avec aucun plat de ce repas
    var covered = Object.create(null);
    if (!sans) all.forEach(function (r) { if (!SIDE_TYPES[r.type]) partnersOf(r).forEach(function (x) { covered[x.id] = 1; }); });
    var mains = sans ? items : items.filter(function (r) { return !SIDE_TYPES[r.type]; });
    var sides = sans ? [] : items.filter(function (r) { return SIDE_TYPES[r.type] && !covered[r.id]; });
    function groups(list, combo, suffix) {
      TS().forEach(function (t) {
        var g = list.filter(function (r) { return r.type === t.id; });
        if (!g.length) return;
        g.sort(function (a, b) { return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }); });
        var sec = el('section', 'grp themed ' + tcls(t.id));
        var gh = el('div', 'grp-head');
        gh.appendChild(icon(t.id));
        gh.appendChild(el('h2', null, t.label + (suffix || '')));
        gh.appendChild(el('span', 'grp-n', String(g.length)));
        sec.appendChild(gh);
        sec.appendChild(rowList(g, false, sans ? '' : id + '/' + t.id, combo));
        view.appendChild(sec);
      });
    }
    if (!sans && !fstat && mains.length + sides.length) subP.textContent = plural(mains.length + sides.length, 'recette', 'recettes');   // les accompagnements rattachés à un plat ne sont pas comptés à part
    groups(mains, !sans);
    if (sides.length) {
      if (mains.length) view.appendChild(el('p', 'sub sidesnote', 'Sans plat associé dans ce repas :'));
      groups(sides, false);
    }
    if (!mains.length && !sides.length) {   // tout est déjà rattaché à un plat masqué par le filtre
      var fe2 = el('div', 'emptybox'); fe2.appendChild(el('p', null, 'Aucune recette à afficher avec ce statut.')); view.appendChild(fe2);
    }
  }

  /* Niveau 3 : fiche d'un plat */
  function recipeScreen(r) {
    var t = tById[r.type];
    view.className = 'themed ' + tcls(r.type);
    var inMeal = /^#repas\/(\w+)$/.exec(cameFrom);
    var backMeal = inMeal && (inMeal[1] === 'sans' ? !mealsOf(r).length : mealsOf(r).indexOf(inMeal[1]) >= 0) ? (inMeal[1] === 'sans' ? 'Sans repas' : mById[inMeal[1]].label) : '';
    if (cameFrom === '#recherche' && searchWords(searchQ).length) view.appendChild(back('#accueil', 'Recherche'));
    else if (cameFrom === '#a-completer' && incompleteWhy(r)) view.appendChild(back('#a-completer', 'À compléter'));
    else view.appendChild(backMeal ? back(cameFrom, backMeal) : back('#' + t.id, t.label));
    var h = el('div', 'hero'), hs = thumbSrc(r.url);
    if (hs) {
      h.className = 'hero hasphoto';
      var ha = el('a', 'herolink'); ha.href = r.url; ha.target = '_blank'; ha.rel = 'noopener noreferrer'; ha.setAttribute('aria-label', 'Ouvrir la vidéo');
      var hi = thumbImg(hs, 'heroimg'); hi.loading = 'eager';
      hi.onerror = function () { h.className = 'hero'; h.textContent = ''; h.appendChild(icon(r.type)); };
      ha.appendChild(hi); ha.appendChild(el('span', 'play', '▶')); h.appendChild(ha);
    } else h.appendChild(icon(r.type));
    view.appendChild(h);
    view.appendChild(el('h1', null, r.name));
    if (r.cook) { var mc = el('div', 'meta'); mc.appendChild(el('span', 'tag', r.cook)); view.appendChild(mc); }
    if (r.servings) view.appendChild(el('p', 'serv', 'Pour ' + r.servings.charAt(0).toLowerCase() + r.servings.slice(1)));
    if (canEdit()) {
      var sr = el('div', 'statusrow'); sr.setAttribute('role', 'group'); sr.setAttribute('aria-label', 'Statut de la recette');
      var serr = el('p', 'err'); serr.setAttribute('role', 'alert');
      STATUSES.forEach(function (st) {
        var b = el('button', 'fchip' + (r.status === st.id ? ' on' : ''), (st.mark !== st.label ? st.mark + ' ' : '') + st.label); b.type = 'button';
        b.setAttribute('aria-pressed', r.status === st.id ? 'true' : 'false');
        b.onclick = function () {
          var next = r.status === st.id ? '' : st.id, rec2 = {};
          Object.keys(r).forEach(function (k) { rec2[k] = r[k]; }); rec2.status = next;
          Array.prototype.forEach.call(sr.querySelectorAll('button'), function (x) { x.disabled = true; });
          commit({ id: r.id, rec: rec2 }, 'Statut de « ' + r.name + ' » : ' + (next ? st.label : 'aucun')).then(function () { route(true); },
            function (e) { Array.prototype.forEach.call(sr.querySelectorAll('button'), function (x) { x.disabled = false; }); serr.textContent = writeError(e); });
        };
        sr.appendChild(b);
      });
      view.appendChild(sr); view.appendChild(serr);
    }

    var tip = isTip(r);
    var lv = LEVELS[r.lvl] || LEVELS.none;
    var s1 = el('section', 'sheet'); s1.setAttribute('aria-labelledby', 'h-ing');
    var head = el('div', 'sheet-head');
    var h2 = el('h2', null, tip ? 'Matériel' : 'Ingrédients'); h2.id = 'h-ing'; head.appendChild(h2);
    if (!tip) head.appendChild(el('span', 'badge' + (lv[1] ? ' ok' : ''), lv[0]));
    s1.appendChild(head);
    if (r.ing.length) {
      var ul = el('ul', 'ings'); r.ing.forEach(function (x) { ul.appendChild(el('li', null, x)); }); s1.appendChild(ul);
    } else if (r.lvl === 'user' && !tip) s1.appendChild(el('p', 'note', 'Aucun ingrédient renseigné.'));
    if (r.probable && r.probable.length) {
      s1.appendChild(el('p', 'probable', 'Probablement aussi, sans confirmation : ' + r.probable.join(', ').toLowerCase() + '.'));
    }
    if (r.ingNote) s1.appendChild(el('p', 'note', r.ingNote));
    if (!tip || r.ing.length) view.appendChild(s1);

    var s2 = el('section', 'sheet'); s2.setAttribute('aria-labelledby', 'h-rec');
    var h3 = el('h2', null, tip ? 'Astuce' : 'Recette'); h3.id = 'h-rec'; s2.appendChild(h3);
    if (r.steps.length) {
      var ol = el('ol', 'steps'); r.steps.forEach(function (x) { ol.appendChild(el('li', null, x)); }); s2.appendChild(ol);
      if (r.stepsNote) s2.appendChild(el('p', 'note', r.stepsNote));
    } else {
      s2.appendChild(el('p', 'callout', tip
        ? (r.url ? 'Pas encore d’astuce écrite ici. Elle se trouve dans le lien ci‑dessous.' : 'Pas encore d’astuce écrite ici.')
        : r.url ? 'Pas encore de recette écrite ici. Les étapes se trouvent dans le lien ci‑dessous.'
        : 'Pas encore de recette écrite ici.'));
    }
    if (r.tips && r.tips.length) {
      s2.appendChild(el('p', 'tips-title', 'Astuces'));
      var tl = el('ul', 'tips'); r.tips.forEach(function (x) { tl.appendChild(el('li', null, x)); }); s2.appendChild(tl);
    }
    if (r.url) s2.appendChild(ext(r.url, 'btn', r.btn || 'Ouvrir ↗'));
    view.appendChild(s2);
    if (!tip) pairSection(r);
    if (canEdit()) {
      var rb = el('div', 'rowbtns');
      rb.appendChild(link('#modifier/' + r.id, 'btn ghost', tip ? 'Modifier cette astuce' : 'Modifier cette recette'));
      view.appendChild(rb);
      var rmErr = el('p', 'perr'); rmErr.setAttribute('role', 'alert'); var rmSt = el('p', 'status'); rmSt.setAttribute('aria-live', 'polite');
      view.appendChild(removeControl(r, rmErr, rmSt, tip ? 'Retirer cette astuce' : 'Retirer cette recette'));
      view.appendChild(rmErr); view.appendChild(rmSt);
    }
    // Origine, repas, statut et date : toujours tout en bas de la fiche
    var m = el('div', 'meta foot-meta');
    m.appendChild(el('span', 'tag src', r.src));
    mealsOf(r).forEach(function (id) { m.appendChild(el('span', 'tag', mById[id].label)); });
    if (r.status) { var stt = sById[r.status]; m.appendChild(el('span', 'tag st st-' + r.status, (stt.mark !== stt.label ? stt.mark + ' ' : '') + stt.label)); }
    var dt = fmt(r.date);
    if (dt) m.appendChild(el('span', 'date', (r.src === 'Ajoutée' ? 'Ajoutée le ' : 'Partagée le ') + dt));
    view.appendChild(m);
  }

  /* « Se marie avec » : associations entre fiches */
  var SIDE_TYPES = { accomp: 1, sauces: 1, salades: 1 };
  var MAIN_TYPES = { plats: 1, tajines: 1, sandwichs: 1, soupes: 1 };
  // Liste à cocher des associations d'une fiche ; utilisée sur la fiche et dans l'onglet Repas.
  function pairPicker(r, perr, mount, onClose) {
    perr.textContent = '';
    var initial = Object.create(null), sel = Object.create(null);
    partnersOf(r).forEach(function (x) { initial[x.id] = 1; sel[x.id] = 1; });
    var groups = SIDE_TYPES[r.type] ? MAIN_TYPES : SIDE_TYPES;   // depuis un accompagnement : les plats ; sinon : accompagnements, sauces, salades
    var box = el('div', 'pairpick');
    box.appendChild(el('p', 'help', 'Cochez tout ce qui va avec « ' + r.name + ' », puis enregistrez.'));
    var inp = el('input'); inp.type = 'search'; inp.id = 'pq'; inp.placeholder = 'Chercher dans tout le carnet'; inp.autocomplete = 'off'; inp.setAttribute('aria-label', 'Chercher une recette à associer');
    var res = el('div', 'pairres'), hint = el('p', 'help');
    var bar = el('div', 'pairbar');
    var saveB = el('button', 'btn', 'Enregistrer'); saveB.type = 'button';
    var cancel = el('button', 'btn ghost', 'Annuler'); cancel.type = 'button';
    function changes() {
      var addL = [], delL = [];
      Object.keys(sel).forEach(function (id) { if (sel[id] && !initial[id]) addL.push(id); });
      Object.keys(initial).forEach(function (id) { if (!sel[id]) delL.push(id); });
      return { add: addL, del: delL };
    }
    function sync() {
      var c = changes(), n = c.add.length + c.del.length;
      saveB.disabled = !n;
      saveB.textContent = n ? 'Enregistrer (' + n + (n > 1 ? ' changements)' : ' changement)') : 'Enregistrer';
    }
    function item(x) {
      var lab = el('label', 'pairchk t-' + x.type), cb = el('input'); cb.type = 'checkbox'; cb.value = x.id; cb.checked = !!sel[x.id];
      cb.onchange = function () { sel[x.id] = cb.checked ? 1 : 0; sync(); };
      lab.appendChild(cb); lab.appendChild(thumbBox(x)); lab.appendChild(el('span', 'rn', x.name));
      return lab;
    }
    function block(title, items) {
      if (!items.length) return;
      if (title) res.appendChild(el('h3', 'pairh', title));
      var ul = el('ul', 'rows'); items.forEach(function (x) { var li = el('li'); li.appendChild(item(x)); ul.appendChild(li); }); res.appendChild(ul);
    }
    function fill() {
      var ok = function (x) { return x.id !== r.id && !isTip(x); };
      var found = searchRecipes(inp.value), n = 0;
      res.textContent = '';
      if (found) {
        var list = found.filter(ok); n = list.length;
        block('', list.slice(0, 30));
        hint.textContent = !n ? 'Aucune recette ne correspond.' : n > 30 ? 'Les 30 premières sur ' + n + ' : précisez la recherche.' : '';
      } else {
        var shown = Object.create(null);
        order.forEach(function (tid) {
          if (!groups[tid]) return;
          var items = R.filter(function (x) { return x.type === tid && ok(x); }).sort(function (a, b) { return a.name.localeCompare(b.name, 'fr'); });
          items.forEach(function (x) { shown[x.id] = 1; }); n += items.length;
          block(tById[tid].label, items);
        });
        var others = partnersOf(r).filter(function (x) { return !shown[x.id]; });   // déjà associées, hors de ces types : restent visibles pour pouvoir les décocher
        block('Autres associations', others); n += others.length;
        hint.textContent = n ? '' : 'Rien à proposer ici : utilisez la recherche pour associer une autre recette.';
      }
    }
    function shut() { if (box.parentNode) box.parentNode.removeChild(box); }
    cancel.onclick = function () { shut(); onClose(); };
    saveB.onclick = function () {
      var c = changes(); if (!(c.add.length + c.del.length)) return;
      perr.textContent = ''; saveB.disabled = true; cancel.disabled = true; saveB.textContent = 'Enregistrement…';
      var msg = 'Associations de « ' + r.name + ' » :' + (c.add.length ? ' +' + c.add.length : '') + (c.del.length ? ' −' + c.del.length : '');
      commit({ pairs: { id: r.id, add: c.add, del: c.del } }, msg).then(function () { shut(); route(true); },
        function (e) { cancel.disabled = false; sync(); perr.textContent = writeError(e); });
    };
    inp.addEventListener('input', fill);
    bar.appendChild(saveB); bar.appendChild(cancel);
    box.appendChild(inp); box.appendChild(hint); box.appendChild(res); box.appendChild(bar);
    mount(box); fill(); sync();
    try { box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
  }
  function thumbBox(x) {
    var th = el('span', 'th'), ts = thumbSrc(x.url);
    var ph = function () { th.className = 'th ph'; th.textContent = ''; th.appendChild(icon(x.type)); };
    if (ts) { var im = thumbImg(ts, null); im.onerror = ph; th.appendChild(im); } else ph();
    return th;
  }
  function pairSection(r) {
    var partners = partnersOf(r), edit = canEdit();
    if (!partners.length && !edit) return;
    var sec = el('section', 'sheet pairs'); sec.setAttribute('aria-labelledby', 'h-pair');
    var h = el('h2', null, 'Se marie avec'); h.id = 'h-pair'; sec.appendChild(h);
    var perr = el('p', 'perr'); perr.setAttribute('role', 'alert');
    function rowFor(x) {
      var inner = el('span', 'row prow t-' + x.type);
      inner.appendChild(thumbBox(x)); inner.appendChild(el('span', 'rn', x.name)); inner.appendChild(el('span', 'ptype', tById[x.type].label));
      return inner;
    }
    function send(other, on, btns) {
      perr.textContent = ''; btns.forEach(function (b) { b.disabled = true; });
      commit({ pair: [r.id, other.id], on: on }, (on ? 'Associe : ' : 'Dissocie : ') + r.name + ' + ' + other.name).then(function () { route(true); },
        function (e) { btns.forEach(function (b) { b.disabled = false; }); perr.textContent = writeError(e); });
    }
    if (partners.length) {
      var ul = el('ul', 'rows pairlist');
      partners.forEach(function (x) {
        var li = el('li', 'pairli'), a = link('#' + x.id, 'pairlink'); a.appendChild(rowFor(x)); li.appendChild(a);
        if (edit) {
          var rm = el('button', 'unpair', '×'); rm.type = 'button'; rm.setAttribute('aria-label', 'Retirer l’association avec ' + x.name);
          rm.onclick = function () { send(x, false, [rm]); };
          li.appendChild(rm);
        }
        ul.appendChild(li);
      });
      sec.appendChild(ul);
    } else sec.appendChild(el('p', 'note', 'Aucune association pour l’instant.'));
    if (edit) {
      var add = el('button', 'btn ghost', partners.length ? 'Modifier les associations…' : 'Associer…'); add.type = 'button';
      add.onclick = function () {
        add.hidden = true;
        pairPicker(r, perr, function (box) { sec.insertBefore(box, perr); }, function () { add.hidden = false; add.focus(); });
      };
      sec.appendChild(add);
    }
    sec.appendChild(perr);
    view.appendChild(sec);
  }

  /* Ajouter / modifier */
  function lines(s, max, strip) {
    return s.split(/\r?\n/).map(function (x) { x = x.trim(); return strip ? x.replace(/^(\d+\s*[.)]\s*|[-•*]\s+)/, '') : x; })
      .filter(Boolean).slice(0, max).map(function (x) { return x.slice(0, 600); });
  }
  function newId() { return 'r-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function field(id, label, control, help) {
    var d = el('div', 'field');
    var l = el('label', 'lbl', label); l.htmlFor = id;
    d.appendChild(l); d.appendChild(control);
    if (help) d.appendChild(el('p', 'help', help));
    return d;
  }
  function textInput(id, value, max, ph) {
    var i = el('input'); i.type = 'text'; i.id = id; i.maxLength = max; if (ph) i.placeholder = ph; if (value) i.value = value; return i;
  }
  function textArea(id, value, ph) { var t = el('textarea'); t.id = id; if (ph) t.placeholder = ph; if (value) t.value = value; return t; }

  function linkInfo(u) {
    var h = '';
    try { h = new URL(u).hostname.toLowerCase().replace(/^(www|m)\./, ''); } catch (e) {}
    if (/(^|\.)youtube\.com$|^youtu\.be$/.test(h)) return { label: 'YouTube', btn: 'Voir la vidéo ↗' };
    if (/(^|\.)facebook\.com$|^fb\.watch$|^fb\.com$/.test(h)) return { label: 'Facebook', btn: 'Voir le reel ↗' };
    if (/(^|\.)instagram\.com$/.test(h)) return { label: 'Instagram', btn: 'Voir le reel ↗' };
    if (/(^|\.)tiktok\.com$/.test(h)) return { label: 'TikTok', btn: 'Voir la vidéo ↗' };
    return { label: h ? 'sur ' + h : 'sur un site', btn: 'Ouvrir le lien ↗' };
  }
  // Origine de la recette (pastille dans les listes) : YouTube : pictogramme générique ; Facebook : logo fourni par l'utilisateur
  var SRC_SVG = {
    YouTube: '<circle cx="12" cy="12" r="12" fill="var(--src-yt)"/><path d="M9.5 7.6v8.8l7.2-4.4z" fill="var(--src-on)"/>',
    Facebook: ''
  };
  var FB_LOGO = 'data:image/png;base64,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';   // logo fourni par l'utilisateur, 64 px
  function srcOf(r) {
    var l = r.url ? linkInfo(r.url).label : '';
    if (SRC_SVG.hasOwnProperty(l)) return l;
    return SRC_SVG.hasOwnProperty(r.src) ? r.src : '';
  }
  function srcBadge(r) {
    var s = srcOf(r); if (!s) return null;
    var b = el('span', 'src'); b.title = s; b.setAttribute('role', 'img'); b.setAttribute('aria-label', 'Origine : ' + s);
    if (s === 'Facebook') { var im = el('img'); im.src = FB_LOGO; im.alt = ''; im.width = 24; im.height = 24; b.appendChild(im); }
    else b.innerHTML = '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">' + SRC_SVG[s] + '</svg>';
    return b;
  }
  // Miniature d'une vidéo YouTube (image publique, sans clé ni compte). Autres sites : pas de miniature.
  function ytId(u) {
    var x; try { x = new URL(u); } catch (e) { return ''; }
    var h = x.hostname.toLowerCase().replace(/^(www|m|music)\./, ''), id = '', m;
    if (h === 'youtu.be') id = x.pathname.split('/')[1] || '';
    else if (h === 'youtube.com' || h === 'youtube-nocookie.com') {
      if (x.pathname === '/watch') id = x.searchParams.get('v') || '';
      else if ((m = /^\/(shorts|embed|live|v)\/([^/?#]+)/.exec(x.pathname))) id = m[2];
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
  }
  function thumbSrc(u) { var id = ytId(u); return id ? 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg' : ''; }
  function thumbImg(src, cls) {
    var im = el('img', cls); im.src = src; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; im.referrerPolicy = 'no-referrer';
    return im;
  }
  // Clé de comparaison pour repérer un doublon : même vidéo YouTube quelle que soit l'écriture du lien ; sinon adresse sans paramètres de suivi.
  function dupKey(u) {
    var id = ytId(u); if (id) return 'yt:' + id;
    var x; try { x = new URL(u); } catch (e) { return ''; }
    if (!/^https?:$/.test(x.protocol)) return '';
    var keep = [];
    ['v', 'story_fbid', 'fbid', 'id', 'p'].forEach(function (k) { var val = x.searchParams.get(k); if (val) keep.push(k + '=' + val); });
    return x.hostname.toLowerCase().replace(/^(www|m|mobile|web)\./, '') + x.pathname.replace(/\/+$/, '') + (keep.length ? '?' + keep.join('&') : '');
  }
  function findDup(u, exceptId) {
    var k = dupKey(u); if (!k) return null;
    for (var i = 0; i < R.length; i++) if (R[i].id !== exceptId && R[i].url && dupKey(R[i].url) === k) return { rec: R[i] };
    for (var j = 0; j < dismissed.length; j++) if (dupKey(dismissed[j]) === k) return { dismissed: true };
    return null;
  }
  function pickUrl(v) {   // un texte partagé depuis une appli contient souvent du texte autour du lien
    v = (v || '').trim();
    var m = /https?:\/\/[^\s]+/i.exec(v);
    return m ? m[0] : v;
  }
  function autoName(u, iso) { return ('Recette ' + linkInfo(u).label + ' du ' + fmt(iso)).slice(0, 120); }
  // Titre de la vidéo : essai au mieux (YouTube direct, puis service oEmbed public). Jamais bloquant : en cas d'échec on renvoie ''.
  var titleCache = {};
  function getJson(u, ms) {
    return new Promise(function (resolve) {
      var done = false, ctl = (typeof AbortController === 'function') ? new AbortController() : null;
      var t = setTimeout(function () { if (!done) { done = true; if (ctl) ctl.abort(); resolve(null); } }, ms);
      var end = function (v) { if (!done) { done = true; clearTimeout(t); resolve(v); } };
      try {
        fetch(u, ctl ? { signal: ctl.signal, credentials: 'omit', referrerPolicy: 'no-referrer' } : { credentials: 'omit' })
          .then(function (r) { return r.ok ? r.json() : null; }).then(end, function () { end(null); });
      } catch (e) { end(null); }
    });
  }
  function cleanTitle(t) {
    t = (typeof t === 'string' ? t : '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (t.length < 3 || /^https?:\/\//i.test(t)) return '';
    return t.slice(0, 120);
  }
  function fetchTitle(u) {
    if (!u || !/^https?:\/\//i.test(u)) return Promise.resolve('');
    if (titleCache[u] !== undefined) return Promise.resolve(titleCache[u]);
    var enc = encodeURIComponent(u), tries = [];
    if (linkInfo(u).label === 'YouTube') tries.push('https://www.youtube.com/oembed?format=json&url=' + enc);
    tries.push('https://noembed.com/embed?url=' + enc);
    var i = 0;
    function next() {
      if (i >= tries.length) { titleCache[u] = ''; return Promise.resolve(''); }
      return getJson(tries[i++], 6000).then(function (j) {
        var t = j && !j.error ? cleanTitle(j.title) : '';
        if (t) { titleCache[u] = t; return t; }
        return next();
      });
    }
    return next();
  }
  function formScreen(rec, preset, pre, shared) {
    formActive = true;
    var editing = !!rec;
    var sel = rec ? rec.type : (preset && tById[preset] ? preset : '');
    var presetMeal = (!rec && preset && preset.indexOf('repas-') === 0 && mById[preset.slice(6)]) ? preset.slice(6) : '';
    var selMeals = rec ? rec.meals : (presetMeal ? [presetMeal] : []);
    var backHref = pre ? '#a-identifier' : shared ? '#accueil' : (editing ? '#' + rec.id : (presetMeal ? '#repas/' + presetMeal : (sel ? '#' + sel : '#accueil')));
    var backLabel = pre ? 'Liens à identifier' : shared ? 'Types de plats' : (editing ? 'Retour à la recette' : (presetMeal ? mById[presetMeal].label : (sel ? tById[sel].label : 'Types de plats')));
    view.appendChild(back(backHref, backLabel));
    view.appendChild(el('h1', null, editing ? 'Modifier la recette' : (pre ? 'Classer ce lien' : (shared ? 'Ajouter ce lien' : 'Nouvelle recette'))));
    if (pre) view.appendChild(el('p', 'sub', 'Ouvrez le lien pour voir la recette, puis renseignez son nom et son type.'));
    if (shared) view.appendChild(el('p', 'sub', 'Lien reçu par partage. Vérifiez le nom proposé, puis enregistrez : le type est facultatif.'));
    if (!canEdit()) {
      var nb = el('div', 'emptybox');
      nb.appendChild(el('p', null, 'La modification n’est pas activée sur cet appareil.'));
      nb.appendChild(link('#reglages', null, 'Ouvrir les réglages'));
      view.appendChild(nb);
      return;
    }
    var f = el('form', 'form'); f.noValidate = true;
    var topSave = el('button', 'btn topsave', editing ? 'Enregistrer les modifications' : 'Enregistrer la recette'); topSave.type = 'submit';   // même bouton qu'en bas, pour les longs formulaires
    f.appendChild(topSave);
    var topErr = el('p', 'perr'); f.appendChild(topErr);   // reprend le message d'erreur du bas, visible depuis le bouton du haut

    var inUrl = textInput('f-url', rec ? rec.url : (pre ? pre.url : (shared ? shared.url : '')), 500, 'https://…'); inUrl.type = 'url'; inUrl.autocapitalize = 'off'; inUrl.setAttribute('inputmode', 'url');
    inUrl.addEventListener('change', function () { inUrl.value = pickUrl(inUrl.value); });
    inUrl.addEventListener('input', function () {
      if (statusTouched || editing) return;
      var want = inUrl.value.trim() ? 'essayer' : '';
      var r2 = f.querySelector('input[name="status"][value="' + want + '"]'); if (r2) r2.checked = true;
    });
    var urlField = field('f-url', 'Lien de la recette (YouTube, Facebook ou autre)', inUrl,
      (editing || pre) ? '' : 'Vous pouvez coller seulement un lien : le nom et le type sont alors facultatifs, et la recette ira dans « À classer ».');
    var pasteMsg = el('p', 'perr'); pasteMsg.setAttribute('role', 'alert');
    if (!editing && !pre) {
      var pasteBtn = el('button', 'btn ghost pastebtn', 'Coller le lien copié'); pasteBtn.type = 'button';
      pasteBtn.onclick = function () {
        pasteMsg.textContent = '';
        var rd = (navigator.clipboard && navigator.clipboard.readText) ? navigator.clipboard.readText() : Promise.reject(new Error('nope'));
        rd.then(function (txt) {
          var u = /https?:\/\/[^\s]+/i.exec(txt || '');
          if (!u) { pasteMsg.textContent = 'Aucun lien trouvé dans ce qui est copié. Copiez d’abord le lien de la vidéo.'; return; }
          inUrl.value = pickUrl(u[0].replace(/[)\].,;!?]+$/, ''));
          inUrl.dispatchEvent(new Event('input')); proposeTitle();
        }, function () { pasteMsg.textContent = 'Impossible de lire ce qui est copié. Appuyez longuement dans le champ du lien, puis choisissez « Coller ».'; });
      };
      urlField.insertBefore(pasteBtn, inUrl);
    }
    urlField.appendChild(pasteMsg);
    // Alerte doublon : prévient sans bloquer l'enregistrement
    var dupBox = el('p', 'callout dupwarn'); dupBox.hidden = true; dupBox.setAttribute('role', 'status'); urlField.appendChild(dupBox);
    function checkDup() {
      var u = pickUrl(inUrl.value), d = /^https?:\/\//i.test(u) ? findDup(u, rec ? rec.id : null) : null;
      dupBox.textContent = '';
      if (d && d.rec) {
        dupBox.appendChild(document.createTextNode('Ce lien est déjà dans le carnet : « ' + d.rec.name + ' ». '));
        dupBox.appendChild(link('#' + d.rec.id, null, 'Voir la fiche'));
      } else if (d && d.dismissed && !pre) dupBox.textContent = 'Vous avez déjà retiré ce lien du carnet. Vous pouvez quand même l’enregistrer.';
      dupBox.hidden = !dupBox.textContent;
    }
    inUrl.addEventListener('input', checkDup); inUrl.addEventListener('change', checkDup);
    inUrl.addEventListener('paste', function () { setTimeout(checkDup, 0); });
    checkDup();
    f.appendChild(urlField);

    var inName = textInput('f-name', rec ? rec.name : (shared ? shared.name : ''), 120, 'Ex. : Poulet rôti au citron'); inName.autocomplete = 'off';
    f.appendChild(field('f-name', (editing || pre) ? 'Nom du plat' : 'Nom du plat (facultatif si vous collez un lien)', inName,
      editing ? '' : 'Pour une vidéo, le titre est proposé automatiquement ; vous pouvez le modifier.'));
    // Nom = titre de la vidéo, tant que vous n'avez rien saisi vous-même.
    var nameTouched = false, autoFilled = '', basePh = inName.placeholder, titleSeq = 0;
    inName.addEventListener('input', function () { nameTouched = true; });
    function proposeTitle() {
      if (editing) return;
      var u = pickUrl(inUrl.value), seq = ++titleSeq;
      if (!/^https?:\/\//i.test(u)) { inName.placeholder = basePh; return; }
      if (nameTouched || (inName.value.trim() && inName.value !== autoFilled)) return;   // nom saisi ou fourni par l'appli de partage : on le garde
      inName.placeholder = 'Recherche du titre…';
      fetchTitle(u).then(function (t) {
        if (seq !== titleSeq) return;
        inName.placeholder = basePh;
        if (!t || nameTouched || !document.body.contains(inName)) return;
        if (inName.value.trim() && inName.value !== autoFilled) return;
        inName.value = t; autoFilled = t;
      });
    }
    inUrl.addEventListener('change', proposeTitle);
    inUrl.addEventListener('paste', function () { setTimeout(function () { inUrl.value = pickUrl(inUrl.value); proposeTitle(); }, 0); });
    setTimeout(proposeTitle, 0);

    var ft = el('fieldset', 'field');
    ft.appendChild(el('legend', 'lbl', (editing || pre) ? 'Type de plat' : 'Type de plat (facultatif si vous collez un lien)'));
    var grid = el('div', 'chipgrid');
    TS().forEach(function (t) {
      var lab = el('label', 'chip themed ' + tcls(t.id));
      var inp = el('input'); inp.type = 'radio'; inp.name = 'type'; inp.value = t.id; if (sel === t.id) inp.checked = true;
      var cb = el('span', 'cb'); cb.appendChild(icon(t.id)); cb.appendChild(el('span', null, soft(t.label)));
      lab.appendChild(inp); lab.appendChild(cb); grid.appendChild(lab);
    });
    ft.appendChild(grid); f.appendChild(ft);

    var fm = el('fieldset', 'field');
    fm.appendChild(el('legend', 'lbl', 'Repas (facultatif)'));
    var mg = el('div', 'chipgrid');
    MEALS.forEach(function (m) {
      var lab = el('label', 'chip themed t-' + m.id);
      var inp = el('input'); inp.type = 'checkbox'; inp.name = 'meal'; inp.value = m.id; if (selMeals.indexOf(m.id) >= 0) inp.checked = true;
      var cb = el('span', 'cb'); cb.appendChild(icon(m.id)); cb.appendChild(el('span', null, m.label));
      lab.appendChild(inp); lab.appendChild(cb); mg.appendChild(lab);
    });
    var mhelp = el('p', 'help');
    fm.appendChild(mg); fm.appendChild(mhelp); f.appendChild(fm);
    var autoId = AUTO_MEAL.soupes, autoBox = mg.querySelector('input[value="' + autoId + '"]'), autoUser = autoBox.checked;
    function syncMeals() {
      var chk = f.querySelector('input[name="type"]:checked'), isAuto = !!(chk && AUTO_MEAL[chk.value] === autoId);
      if (isAuto && !autoBox.disabled) { autoUser = autoBox.checked; autoBox.checked = true; autoBox.disabled = true; }
      else if (!isAuto && autoBox.disabled) { autoBox.disabled = false; autoBox.checked = autoUser; }
      mhelp.textContent = isAuto ? 'Les soupes sont toujours au dîner. Cochez aussi Déjeuner si besoin.' : 'Cochez les deux si la recette convient au déjeuner et au dîner.';
    }
    grid.addEventListener('change', syncMeals); syncMeals();

    var fs2 = el('fieldset', 'field');
    fs2.appendChild(el('legend', 'lbl', 'Statut (facultatif)'));
    var sg = el('div', 'chipgrid');
    var statusTouched = !!rec;
    [{ id: '', label: 'Aucun', cls: 't-aclasser' }].concat(STATUSES).forEach(function (st) {
      var lab = el('label', 'chip themed ' + st.cls);
      var inp = el('input'); inp.type = 'radio'; inp.name = 'status'; inp.value = st.id;
      inp.checked = (rec ? rec.status : ((pre || shared) ? 'essayer' : '')) === st.id;
      var cb = el('span', 'cb'); cb.appendChild(el('span', null, (st.mark && st.mark !== st.label ? st.mark + ' ' : '') + st.label));
      lab.appendChild(inp); lab.appendChild(cb); sg.appendChild(lab);
    });
    sg.addEventListener('change', function () { statusTouched = true; });
    fs2.appendChild(sg); fs2.appendChild(el('p', 'help', 'Sans choix de votre part, un lien collé passe automatiquement en « À essayer ».'));
    f.appendChild(fs2);

    var inCook = textInput('f-cook', rec && rec.cook, 60, 'Ex. : Four, poêle, sans cuisson');
    var fCook = field('f-cook', 'Cuisson ou méthode (facultatif)', inCook); f.appendChild(fCook);
    var inServ = textInput('f-serv', rec && rec.servings, 60, 'Ex. : 4 personnes');
    var fServ = field('f-serv', 'Nombre de personnes (facultatif)', inServ); f.appendChild(fServ);
    var taIng = textArea('f-ing', rec && rec.ing.join('\n'), '2 œufs\n150 g de farine\n1 pincée de sel');
    var fIng = field('f-ing', 'Ingrédients', taIng, 'Un ingrédient par ligne.'); f.appendChild(fIng);
    var taSteps = textArea('f-steps', rec && rec.steps.join('\n'), 'Mélanger les ingrédients secs.\nAjouter les œufs.\nCuire 20 minutes à 180 °C.');
    var fSteps = field('f-steps', 'Étapes de la recette', taSteps, 'Une étape par ligne. Les numéros sont ajoutés automatiquement.'); f.appendChild(fSteps);
    // Une astuce n'est pas un plat : ni repas, ni cuisson, ni nombre de personnes ; le matériel remplace les ingrédients.
    function syncKind() {
      var chk = f.querySelector('input[name="type"]:checked'), tipKind = !!(chk && TIPTYPES[chk.value]);
      fm.hidden = tipKind; fCook.hidden = tipKind; fServ.hidden = tipKind;
      fIng.querySelector('.lbl').textContent = tipKind ? 'Matériel (facultatif)' : 'Ingrédients';
      fIng.querySelector('.help').textContent = tipKind ? 'Un élément par ligne.' : 'Un ingrédient par ligne.';
      taIng.placeholder = tipKind ? 'Vinaigre blanc\nChiffon microfibre' : '2 œufs\n150 g de farine\n1 pincée de sel';
      fSteps.querySelector('.lbl').textContent = tipKind ? 'Étapes ou description de l’astuce' : 'Étapes de la recette';
      taSteps.placeholder = tipKind ? 'Verser le vinaigre sur le calcaire.\nLaisser agir 30 minutes.\nRincer.' : 'Mélanger les ingrédients secs.\nAjouter les œufs.\nCuire 20 minutes à 180 °C.';
    }
    var nameLbl = f.querySelector('label[for="f-name"]'), nameLbl0 = nameLbl.textContent, fTips = null, saveBtn = null;
    function syncKind2() {
      var chk = f.querySelector('input[name="type"]:checked'), tipKind = !!(chk && TIPTYPES[chk.value]);
      nameLbl.textContent = tipKind ? nameLbl0.replace('Nom du plat', 'Titre de l’astuce') : nameLbl0;
      if (fTips) fTips.hidden = tipKind;
      var lbl = editing ? 'Enregistrer les modifications' : (tipKind ? 'Enregistrer l’astuce' : 'Enregistrer la recette');
      topSave.textContent = lbl; if (saveBtn) saveBtn.textContent = lbl;
    }
    grid.addEventListener('change', syncKind); grid.addEventListener('change', syncKind2); syncKind();
    var taTips = textArea('f-tips', rec && rec.tips.join('\n'), 'Laisser reposer la pâte 5 minutes.');
    taTips.style.minHeight = '5rem';
    fTips = field('f-tips', 'Astuces (facultatif)', taTips, 'Une astuce par ligne.'); f.appendChild(fTips);

    var err = el('p', 'err'); err.setAttribute('role', 'alert');
    var status = el('p', 'status'); status.setAttribute('aria-live', 'polite');
    f.appendChild(err); f.appendChild(status);
    try { new MutationObserver(function () { topErr.textContent = err.textContent; }).observe(err, { childList: true, characterData: true, subtree: true }); } catch (x) {}

    var actions = el('div', 'actions');
    var save = el('button', 'btn', editing ? 'Enregistrer les modifications' : 'Enregistrer la recette'); save.type = 'submit';
    saveBtn = save; syncKind2();
    var cancel = link(backHref, 'btn ghost', 'Annuler');
    actions.appendChild(save); actions.appendChild(cancel); f.appendChild(actions);

    if (editing) f.appendChild(removeControl(rec, err, status));

    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      err.textContent = '';
      var name = inName.value.trim();
      var checked = f.querySelector('input[name="type"]:checked');
      var type = checked ? checked.value : '';
      var url = pickUrl(inUrl.value);
      if (url) {
        var tryUrl = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : 'https://' + url;
        url = cleanUrl(tryUrl);
        if (!url) { err.textContent = 'Ce lien n’est pas valide. Il doit commencer par http ou https.'; inUrl.focus(); return; }
      }
      var viaLink = !editing && !pre && !!url;   // lien collé : nom et type deviennent facultatifs
      var today = new Date().toISOString().slice(0, 10);
      if (!name && viaLink) name = autoName(url, today);
      if (!type && viaLink) type = 'aclasser';
      if (!name) { err.textContent = (editing || pre) ? 'Indiquez le nom du plat.' : 'Indiquez le nom du plat, ou collez un lien.'; inName.focus(); return; }
      if (!type) { err.textContent = 'Choisissez un type de plat.'; var first = f.querySelector('input[name="type"]'); if (first) first.focus(); return; }
      var ing = lines(taIng.value, 60, false), steps = lines(taSteps.value, 60, true), tips = lines(taTips.value, 20, false);
      var id = rec ? rec.id : newId();
      var ingChanged = rec && ing.join('\n') !== rec.ing.join('\n');
      var stepsChanged = rec && steps.join('\n') !== rec.steps.join('\n');
      var reset = rec && ingChanged && rec.lvl !== 'complete';   // liste modifiée à la main : l'ancienne mention de fiabilité ne vaut plus
      var out = {
        id: id, name: name, type: type, cook: TIPTYPES[type] ? '' : inCook.value.trim(), servings: TIPTYPES[type] ? '' : inServ.value.trim(),
        ing: ing, steps: steps, tips: tips, url: url,
        src: rec ? rec.src : (pre ? pre.src : 'Ajoutée'), btn: rec ? rec.btn : (pre ? pre.btn : (url ? linkInfo(url).btn : 'Ouvrir le lien ↗')),
        date: rec && rec.date ? rec.date : (pre && pre.date ? pre.date : today),
        lvl: rec ? (reset ? 'user' : rec.lvl) : 'user',
        probable: rec && !reset ? rec.probable : [], ingNote: rec && !reset ? rec.ingNote : '',
        stepsNote: rec && !stepsChanged ? rec.stepsNote : '',
        sum: rec && !ingChanged ? rec.sum : ing.slice(0, 4).join(', '),
        ts: rec ? rec.ts : Date.now(),
        status: cleanStatus((f.querySelector('input[name="status"]:checked') || {}).value),
        meals: TIPTYPES[type] ? [] : cleanMeals(Array.prototype.map.call(f.querySelectorAll('input[name="meal"]:checked:not(:disabled)'), function (x) { return x.value; }))
      };
      save.disabled = true; topSave.disabled = true; status.textContent = 'Enregistrement…';
      commit({ id: id, rec: out, dismiss: pre ? pre.key : undefined }, (rec ? 'Modifie : ' : 'Ajoute : ') + name).then(function () {
        if (pre) { flash = '« ' + name + ' » enregistrée.'; location.hash = '#a-identifier'; } else location.hash = '#' + id;
      }, function (e) {
        save.disabled = false; topSave.disabled = false; status.textContent = ''; err.textContent = writeError(e);
        try { err.scrollIntoView({ block: 'center' }); } catch (x) {}   // l'erreur est en bas : on l'amène à l'écran même si le clic venait du haut
      });
    });
    view.appendChild(f);
  }

  /* Réglages : dépôt de données et jeton */
  function settingsScreen() {
    formActive = true;
    view.appendChild(back('#accueil', 'Types de plats'));
    view.appendChild(el('h1', null, 'Réglages'));
    view.appendChild(el('p', 'qintro', 'Tout le monde peut lire le carnet. Pour le modifier depuis cet appareil, collez ici un jeton GitHub limité au dépôt du carnet. Le jeton reste sur cet appareil.'));
    var f = el('form', 'form'); f.noValidate = true;
    var inRepo = textInput('c-repo', cfg.repo, 100, DEFAULT_REPO); inRepo.autocapitalize = 'off'; inRepo.autocomplete = 'off';
    f.appendChild(field('c-repo', 'Dépôt des données', inRepo, 'Format : propriétaire/nom'));
    var inTok = el('input'); inTok.type = 'password'; inTok.id = 'c-tok'; inTok.autocomplete = 'off'; inTok.autocapitalize = 'off';
    inTok.placeholder = cfg.token ? 'Jeton enregistré : laissez vide pour le garder' : 'github_pat_…';
    f.appendChild(field('c-tok', 'Jeton GitHub', inTok, 'Ne le partagez avec personne.'));

    var how = el('details', 'qgroup');
    var hs = el('summary'); hs.appendChild(el('span', null, 'Comment créer le jeton')); how.appendChild(hs);
    var ol = el('ol', 'tips howto');
    ['Sur github.com : votre photo de profil, Settings, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token.',
     'Resource owner : le propriétaire du dépôt du carnet. Expiration : 1 an au maximum.',
     'Repository access : « Only select repositories », puis le dépôt du carnet uniquement.',
     'Repository permissions : Contents → « Read and write ». Aucune autre permission.',
     'Generate token, copiez-le tout de suite (il ne sera plus affiché) et collez-le ci-dessus.'
    ].forEach(function (x) { ol.appendChild(el('li', null, x)); });
    how.appendChild(ol); f.appendChild(how);

    var msg = el('p', 'status'); msg.setAttribute('aria-live', 'polite');
    var err = el('p', 'err'); err.setAttribute('role', 'alert');
    f.appendChild(err); f.appendChild(msg);
    var actions = el('div', 'actions');
    var save = el('button', 'btn', 'Enregistrer et tester'); save.type = 'submit';
    actions.appendChild(save);
    if (cfg.token) {
      var forget = el('button', 'btn danger', 'Oublier le jeton'); forget.type = 'button';
      forget.onclick = function () { cfg.token = ''; saveCfg(); lastSync = 0; route(true); };
      actions.appendChild(forget);
    }
    f.appendChild(actions);
    f.addEventListener('submit', function (ev) {
      ev.preventDefault(); err.textContent = ''; msg.textContent = '';
      var repo = inRepo.value.trim();
      if (!REPO_RE.test(repo)) { err.textContent = 'Le dépôt doit s’écrire propriétaire/nom.'; inRepo.focus(); return; }
      var tok = inTok.value.trim();
      cfg.repo = repo; if (tok) cfg.token = tok; saveCfg();
      save.disabled = true; msg.textContent = 'Test de la connexion…';
      api('/repos/' + cfg.repo).then(function (j) {
        save.disabled = false; msg.textContent = '';
        if (j && j.permissions && j.permissions.push) {
          msg.textContent = 'Connexion réussie : vous pouvez modifier le carnet depuis cet appareil.';
        } else if (cfg.token) {
          err.textContent = 'Le dépôt est accessible, mais ce jeton ne peut pas y écrire. Vérifiez la permission Contents : Read and write.';
        } else {
          msg.textContent = 'Dépôt accessible en lecture. Ajoutez un jeton pour pouvoir modifier.';
        }
        refreshData(true);
      }, function (e) {
        save.disabled = false; msg.textContent = '';
        err.textContent = e.status === 401 ? 'Jeton refusé ou expiré.'
          : e.status === 404 ? 'Dépôt introuvable. Vérifiez son nom et que le jeton y a accès.'
          : !e.status ? 'Pas de connexion. Réessayez.' : 'Échec du test (' + e.status + ').';
      });
    });
    view.appendChild(f);

    var bk = el('section', 'sheet'); bk.setAttribute('aria-labelledby', 'h-bk');
    var bh = el('h2', null, 'Sauvegarde'); bh.id = 'h-bk'; bk.appendChild(bh);
    var nIn = R.length;
    var last = lsGet('carnet:backup'), lastTxt = last && /^\d{4}-\d{2}-\d{2}$/.test(last) ? fmt(last) : '';
    bk.appendChild(el('p', 'note', 'Télécharge une copie de vos ' + nIn + ' recettes (fichier recettes.json). Dernière sauvegarde sur cet appareil : ' + (lastTxt || 'aucune') + '.'));
    var bb = el('button', 'btn', 'Télécharger une sauvegarde'); bb.type = 'button';
    var bm = el('p', 'status'); bm.setAttribute('aria-live', 'polite');
    bb.onclick = function () {
      var today = new Date().toISOString().slice(0, 10);
      var txt = JSON.stringify({ recipes: R, typeOrder: order, dismissed: dismissed }, null, 1) + '\n';
      try {
        var url = URL.createObjectURL(new Blob([txt], { type: 'application/json' }));
        var a = el('a'); a.href = url; a.download = 'carnet-recettes-' + today + '.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        lsSet('carnet:backup', today);
        bm.textContent = 'Sauvegarde téléchargée (' + R.length + ' recettes). Cherchez « carnet-recettes-' + today + '.json » dans vos téléchargements.';
      } catch (e) { bm.textContent = 'Le téléchargement a échoué sur cet appareil.'; }
    };
    bk.appendChild(bb); bk.appendChild(bm);
    bk.appendChild(el('p', 'help', 'Pour restaurer : remplacez le fichier recettes.json du dépôt GitHub par cette copie, ou demandez-moi dans Claude. GitHub garde aussi l’historique des versions du fichier.'));
    view.appendChild(bk);
    if (canEdit()) view.appendChild(fillSection());
    view.appendChild(el('p', 'help buildno', 'Version ' + BUILD));
  }

  /* Fiches depuis les vidéos : l'appli prépare les liens et la consigne pour NotebookLM, puis lit sa réponse */
  var FILL_LOT = 10;
  function fillTodo() { return R.filter(function (r) { return !r.ing.length && !isTip(r) && !!ytId(r.url); }); }
  function fillPrompt(lot) {
    return 'Pour chacune des vidéos listées ci-dessous, rédige une fiche recette en français à partir de la transcription de la source dont le titre correspond.\n' +
      'Respecte exactement ce format, en texte simple, sans gras, sans tableau, sans rien écrire avant ni après :\n\n' +
      '### CODE\nCUISSON: durée totale si elle est dite, sinon rien\nPORTIONS: nombre si il est dit, sinon rien\nFIABILITE: complète ou partielle\nINGREDIENTS:\n- un ingrédient par ligne, avec sa quantité si elle est dite\nETAPES:\n1. une étape par ligne\nASTUCES:\n- facultatif\n\n' +
      'Règles :\n- CODE est le code donné devant chaque vidéo (il commence par r-), recopié tel quel.\n- N’invente aucune quantité : si la vidéo ne la donne pas, écris l’ingrédient seul.\n- FIABILITE vaut « complète » seulement si les quantités principales sont données dans la vidéo.\n- Traduis en français si la vidéo est dans une autre langue.\n- Si aucune source ne correspond ou si la transcription est vide, écris la ligne ### CODE puis INTROUVABLE.\n\nVidéos :\n' +
      lot.map(function (r) { return r.id + ' = ' + r.name + ' (https://www.youtube.com/watch?v=' + ytId(r.url) + ')'; }).join('\n') + '\n';
  }
  function parseFill(txt) {
    var out = [], cur = null, sec = '';
    var empty = /^(rien|vide|aucun|aucune|non précisé|non précisée|non indiqué|non indiquée|n\/a|-|—)?\.?$/i;
    function clean(x) { return x.replace(/\*\*|__|`/g, '').replace(/\s*\[\d+(?:\s*[-,–]\s*\d+)*\]/g, '').trim(); }
    function item(x) { return x.replace(/^(\d+\s*[.)]\s*|[-•*·]\s+)/, '').trim(); }
    String(txt || '').slice(0, 200000).split(/\r?\n/).forEach(function (raw) {
      var l = clean(raw); if (!l) return;
      var h = /^[#=\s]*\b(r-[a-z0-9]{6,20})\b\s*$/.exec(l) || /^#{2,}\s*(r-[a-z0-9]{6,20})\b/.exec(l);
      if (h) { cur = { id: h[1], ing: [], steps: [], tips: [], cook: '', servings: '', lvl: 'partial', missing: false }; out.push(cur); sec = ''; return; }
      if (!cur) return;
      if (/^introuvable\b/i.test(l)) { cur.missing = true; return; }
      var m = /^(cuisson|portions?|fiabilit[ée]|ingr[ée]dients?|[ée]tapes?|astuces?)\s*:\s*(.*)$/i.exec(l);
      if (m) {
        var k = m[1].toLowerCase().charAt(0), v = m[2].trim(); if (empty.test(v)) v = '';
        if (k === 'c') { cur.cook = v.slice(0, 60); sec = ''; }
        else if (k === 'p') { cur.servings = v.slice(0, 60); sec = ''; }
        else if (k === 'f') { cur.lvl = /compl/i.test(v) ? 'complete' : 'partial'; sec = ''; }
        else { sec = k === 'i' ? 'ing' : k === 'a' ? 'tips' : 'steps'; if (v) cur[sec].push(item(v)); }
        return;
      }
      if (sec) { var it = item(l); if (it && !empty.test(it) && !/^facultatif$/i.test(it)) cur[sec].push(it.slice(0, sec === 'ing' ? 400 : 600)); }
    });
    out.forEach(function (c) { c.ing = c.ing.slice(0, 60); c.steps = c.steps.slice(0, 60); c.tips = c.tips.slice(0, 20); });
    return out;
  }
  function fillSection() {
    var sec = el('section', 'sheet fill'); sec.setAttribute('aria-labelledby', 'h-fill');
    var h = el('h2', null, 'Fiches depuis les vidéos'); h.id = 'h-fill'; sec.appendChild(h);
    var body = el('div'); sec.appendChild(body);
    function copyBtn(label, getText, done) {
      var b = el('button', 'btn', label); b.type = 'button';
      var st = el('p', 'status'); st.setAttribute('aria-live', 'polite');
      var ta = el('textarea', 'filltxt'); ta.readOnly = true; ta.rows = 4; ta.hidden = true; ta.setAttribute('aria-label', label);
      b.onclick = function () {
        var t = getText();
        var fb = function () { ta.hidden = false; ta.value = t; try { ta.focus(); ta.select(); } catch (e) {} st.textContent = 'Copie automatique impossible : sélectionnez le texte ci-dessous et copiez-le.'; };
        try { navigator.clipboard.writeText(t).then(function () { st.textContent = done; }, fb); } catch (e) { fb(); }
      };
      var w = el('div', 'fillstep'); w.appendChild(b); w.appendChild(st); w.appendChild(ta); return w;
    }
    function draw(msg) {
      body.textContent = '';
      var todo = fillTodo(), lot = todo.slice(0, FILL_LOT);
      if (msg) { var ok = el('p', 'status', msg); ok.setAttribute('role', 'status'); body.appendChild(ok); }
      if (!todo.length) { body.appendChild(el('p', 'note', 'Toutes les recettes YouTube ont déjà leurs ingrédients.')); return; }
      body.appendChild(el('p', 'note', plural(todo.length, 'recette YouTube n’a', 'recettes YouTube n’ont') + ' pas encore d’ingrédients. NotebookLM (notebooklm.google.com) peut les lire à votre place, par lots de ' + FILL_LOT + '.'));
      var ol = el('ol', 'fillsteps');
      var l1 = el('li'); l1.appendChild(el('p', null, 'Dans NotebookLM, créez un carnet et ajoutez ces ' + lot.length + ' liens comme sources (« YouTube » ou « Site web »).'));
      l1.appendChild(copyBtn('Copier les ' + lot.length + ' liens', function () { return lot.map(function (r) { return 'https://www.youtube.com/watch?v=' + ytId(r.url); }).join(' \n'); }, 'Liens copiés.'));
      var l2 = el('li'); l2.appendChild(el('p', null, 'Collez cette consigne dans la discussion de NotebookLM.'));
      l2.appendChild(copyBtn('Copier la consigne', function () { return fillPrompt(lot); }, 'Consigne copiée.'));
      var l3 = el('li'); l3.appendChild(el('p', null, 'Copiez la réponse de NotebookLM et collez-la ici.'));
      var ta = el('textarea', 'filltxt'); ta.rows = 6; ta.id = 'fill-in'; ta.setAttribute('aria-label', 'Réponse de NotebookLM'); ta.placeholder = '### r-…';
      var an = el('button', 'btn', 'Analyser la réponse'); an.type = 'button';
      var err = el('p', 'err'); err.setAttribute('role', 'alert');
      var prev = el('div', 'fillprev');
      l3.appendChild(ta); l3.appendChild(an); l3.appendChild(err); l3.appendChild(prev);
      ol.appendChild(l1); ol.appendChild(l2); ol.appendChild(l3); body.appendChild(ol);
      an.onclick = function () {
        err.textContent = ''; prev.textContent = '';
        var found = parseFill(ta.value), seen = Object.create(null), rows = [], unknown = 0;
        found.forEach(function (c) { var r = byId[c.id]; if (!r || seen[c.id]) { unknown++; return; } seen[c.id] = 1; rows.push({ c: c, r: r }); });
        if (!rows.length) { err.textContent = 'Aucune fiche reconnue. La réponse doit contenir des lignes « ### r-… » comme demandé dans la consigne.'; return; }
        var ul = el('ul', 'fillrows'), boxes = [];
        rows.forEach(function (x) {
          var li = el('li'), lab = el('label', 'fillrow'), cb = el('input'); cb.type = 'checkbox';
          var usable = !x.c.missing && x.c.ing.length > 0;
          cb.checked = usable && !x.r.ing.length; cb.disabled = !usable;
          var tx = el('span', 'dtx'); tx.appendChild(el('span', 'tn2', x.r.name));
          tx.appendChild(el('span', 'td2', !usable ? (x.c.missing ? 'Vidéo introuvable ou sans transcription' : 'Aucun ingrédient dans la réponse')
            : plural(x.c.ing.length, 'ingrédient', 'ingrédients') + ' · ' + plural(x.c.steps.length, 'étape', 'étapes') + ' · ' + (x.c.lvl === 'complete' ? 'liste complète' : 'liste partielle') + (x.r.ing.length ? ' · remplacerait la liste actuelle' : '')));
          lab.appendChild(cb); lab.appendChild(tx); li.appendChild(lab);
          if (usable) { var dt = el('details', 'fillsee'); dt.appendChild(el('summary', null, 'Voir')); var pre = el('p', 'fillpre', x.c.ing.join('\n') + (x.c.steps.length ? '\n\n' + x.c.steps.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n') : '')); dt.appendChild(pre); li.appendChild(dt); }
          ul.appendChild(li); boxes.push({ cb: cb, x: x });
        });
        prev.appendChild(ul);
        if (unknown) prev.appendChild(el('p', 'help', plural(unknown, 'bloc ignoré', 'blocs ignorés') + ' (code inconnu ou en double).'));
        var go = el('button', 'btn primary', ''); go.type = 'button';
        var sync = function () { var n = boxes.filter(function (b) { return b.cb.checked; }).length; go.textContent = 'Enregistrer ' + plural(n, 'fiche', 'fiches'); go.disabled = !n; };
        boxes.forEach(function (b) { b.cb.onchange = sync; }); sync();
        go.onclick = function () {
          var items = boxes.filter(function (b) { return b.cb.checked; }).map(function (b) { return b.x.c; });
          go.disabled = true; err.textContent = ''; go.textContent = 'Enregistrement…';
          commit({ fill: items }, 'Remplit ' + plural(items.length, 'fiche', 'fiches') + ' depuis les vidéos').then(function () {
            draw(plural(items.length, 'fiche enregistrée', 'fiches enregistrées') + '.'); try { sec.scrollIntoView({ block: 'start' }); } catch (e) {}
          }, function (e) { sync(); err.textContent = writeError(e); });
        };
        prev.appendChild(go);
      };
    }
    draw('');
    return sec;
  }

  function missingScreen() {
    view.appendChild(back('#accueil', 'Types de plats'));
    view.appendChild(el('h1', null, 'Recette introuvable'));
    view.appendChild(el('p', 'sub', 'Cette recette n’existe plus ou n’est pas encore chargée.'));
  }

  /* Liens à identifier */
  /* À traiter : toutes les « boîtes » au même endroit */
  function todoScreen() {
    searchQ = '';
    view.appendChild(back('#accueil', 'Types de plats'));
    view.appendChild(el('h1', null, 'À traiter'));
    view.appendChild(el('p', 'qintro', 'Tout ce qui attend d’être complété ou rangé.'));
    var c = todoCounts();
    var ul = el('ul', 'todos');
    [
      { href: '#a-identifier', title: 'Liens à identifier', n: c.links, unit: ['lien', 'liens'], desc: 'Liens partagés dont le nom n’est pas connu' },
      { href: '#aclasser', title: 'À classer', n: c.aclasser, unit: ['recette', 'recettes'], desc: 'Recettes sans type de plat précis' },
      { href: '#repas/sans', title: 'Sans repas', n: c.sans, unit: ['recette', 'recettes'], desc: 'Recettes ni au déjeuner ni au dîner' },
      { href: '#a-completer', title: 'À compléter', n: c.compl, unit: ['recette', 'recettes'], desc: 'Liste d’ingrédients absente ou incomplète' }
    ].forEach(function (x) {
      var li = el('li'), a = link(x.href, 'todo' + (x.n ? '' : ' zero'));
      var tx = el('span', 'dtx');
      tx.appendChild(el('span', 'tn2', x.title));
      tx.appendChild(el('span', 'td2', x.desc));
      a.appendChild(tx);
      a.appendChild(el('span', 'cnt', x.n ? String(x.n) : '✓'));
      a.appendChild(el('span', 'chev', '›'));
      var lab = x.n ? plural(x.n, x.unit[0], x.unit[1]) : 'rien à faire'; a.setAttribute('aria-label', x.title + ' : ' + lab);
      li.appendChild(a); ul.appendChild(li);
    });
    view.appendChild(ul);
  }
  function completeScreen() {
    searchQ = ''; cameFrom = '#a-completer';
    var items = R.filter(function (r) { return !!incompleteWhy(r); });
    view.appendChild(back('#a-traiter', 'À traiter'));
    view.appendChild(el('h1', null, 'À compléter'));
    view.appendChild(el('p', 'qintro', 'Recettes dont la liste d’ingrédients est absente ou incomplète. Un point à droite d’une ligne indique qu’elle est incomplète.'));
    if (!items.length) { var b = el('div', 'emptybox'); b.appendChild(el('p', null, 'Toutes les recettes ont leurs ingrédients.')); view.appendChild(b); return; }
    view.appendChild(rowList(items, true));
  }
  var flash = '', qOpen = Object.create(null), qBack = null, qToast = '', prevH = '';
  /* Position dans la liste « Liens à identifier » : mémorisée quand on ouvre un lien ou le formulaire, retrouvée au retour */
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  try {
    var q0 = JSON.parse(ssGet('carnet:q') || 'null');
    if (q0 && typeof q0.y === 'number' && q0.y >= 0 && q0.y < 1e6) {
      qBack = { y: Math.round(q0.y) };
      Object.keys(q0.open || {}).slice(0, 10).forEach(function (t) { if (q0.open[t] === true) qOpen[String(t).slice(0, 40)] = true; });
    }
  } catch (e) {}
  function rememberQ() {
    qBack = { y: Math.round(window.pageYOffset || 0) };
    var o = {}; Object.keys(qOpen).forEach(function (t) { if (qOpen[t]) o[t] = true; });
    ssSet('carnet:q', JSON.stringify({ y: qBack.y, open: o }));
  }
  var toastEl = null, toastT = 0;
  function showToast(msg) {
    if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
    toastEl = el('div', 'toast', msg); toastEl.setAttribute('role', 'status');
    document.body.appendChild(toastEl);
    clearTimeout(toastT); toastT = setTimeout(function () { if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl); toastEl = null; }, 4500);
  }
  function queueToast() { if (qToast && (window.pageYOffset || 0) > 150) showToast(qToast); qToast = ''; }
  function queueScreen() {
    searchQ = '';
    view.appendChild(back('#a-traiter', 'À traiter'));
    view.appendChild(el('h1', null, 'Liens à identifier'));
    var left = pendingList();
    view.appendChild(el('p', 'qintro', 'Ces liens ont été partagés comme recettes, mais leur nom n’est pas connu. Le numéro permet de les citer dans le chat.' + (canEdit() ? ' Ouvrez un lien, puis classez-le en recette ou retirez-le de la liste.' : '')));
    if (flash) { var fmsg = flash + ' ' + plural(left.length, 'lien restant', 'liens restants') + '.'; var fl = el('p', 'status', fmsg); fl.setAttribute('role', 'status'); view.appendChild(fl); qToast = fmsg; flash = ''; }
    var errBox = el('p', 'err'); errBox.setAttribute('role', 'alert');
    function group(title, rows) {
      var d = el('details', 'qgroup');
      if (qOpen[title]) d.open = true;
      d.addEventListener('toggle', function () { qOpen[title] = d.open; });
      var s = el('summary'); s.appendChild(el('span', null, title)); s.appendChild(el('span', 'n', plural(rows.length, 'lien', 'liens'))); d.appendChild(s);
      var ul = el('ul', 'qlist');
      rows.forEach(function (r) {
        var li = el('li');
        li.appendChild(el('span', 'qid', r.id));
        var dd = el('span', 'qdate', fmt(r.date));
        if (r.note) dd.appendChild(el('small', null, r.note));
        li.appendChild(dd);
        var op = ext(r.url, null, 'Ouvrir ↗'); op.addEventListener('click', rememberQ); li.appendChild(op);
        if (canEdit()) {
          var act = el('div', 'qact');
          var cl = link('#classer/' + r.id, 'btn small', 'Classer'); cl.addEventListener('click', rememberQ);
          var rm = el('button', 'linkbtn dng', 'Retirer'); rm.type = 'button';
          rm.onclick = function () {
            act.textContent = '';
            act.appendChild(el('span', 'qask', 'Retirer ' + r.id + ' de la liste ?'));
            var yes = el('button', 'btn small danger', 'Oui'); yes.type = 'button';
            var no = el('button', 'btn small ghost', 'Non'); no.type = 'button';
            no.onclick = function () { act.textContent = ''; act.appendChild(cl); act.appendChild(rm); rm.focus(); };
            yes.onclick = function () {
              yes.disabled = true; no.disabled = true; errBox.textContent = '';
              commit({ dismiss: r.key }, 'Retire le lien ' + r.id).then(function () {
                flash = 'Lien ' + r.id + ' retiré.'; view.textContent = ''; view.className = ''; queueScreen(); queueToast();
              }, function (e) { yes.disabled = false; no.disabled = false; errBox.textContent = writeError(e); });
            };
            act.appendChild(yes); act.appendChild(no); yes.focus();
          };
          act.appendChild(cl); act.appendChild(rm); li.appendChild(act);
        }
        ul.appendChild(li);
      });
      d.appendChild(ul); return d;
    }
    view.appendChild(errBox);
    var groups = [], byG = Object.create(null);
    left.forEach(function (p) { if (!byG[p.grp]) { byG[p.grp] = []; groups.push(p.grp); } byG[p.grp].push(p); });
    if (!left.length) {
      var box = el('div', 'emptybox'); box.appendChild(el('p', null, 'Tous les liens ont été traités.')); view.appendChild(box);
    }
    groups.forEach(function (g) { view.appendChild(group(g, byG[g])); });
    view.appendChild(el('p', 'hint', 'Facebook demande parfois de se connecter pour ouvrir un reel.'));
  }

  /* Partage depuis une autre appli (Android : Partager > Carnet de recettes) */
  var sharedIn = null;
  function parseShare(sp) {
    var title = (sp.get('title') || '').trim(), text = (sp.get('text') || '').trim(), url = (sp.get('url') || '').trim();
    var re = /https?:\/\/[^\s]+/i, link = '';
    [url, text, title].forEach(function (x) { if (!link) { var m = re.exec(x); if (m) link = m[0].replace(/[)\].,;!?]+$/, ''); } });
    var name = title && !re.test(title) ? title : text.replace(re, '').replace(/\s+/g, ' ').replace(/^["«“'\s:–-]+|["»”'\s:–-]+$/g, '');
    if (name.length < 3 || name.length > 100) name = '';
    return { url: link, name: name };
  }
  try {
    var sp0 = new URLSearchParams(location.search);
    if (sp0.has('url') || sp0.has('text') || sp0.has('title')) {
      sharedIn = parseShare(sp0);
      history.replaceState(null, '', location.pathname + '#partage');
    }
  } catch (e) {}

  function rerender() {
    var h = location.hash || '';
    if (document.activeElement && document.activeElement.id === 'q') {   // saisie en cours : on ne rafraîchit que les résultats
      var res = view.querySelector('.results'), body = view.querySelector('.homebody');
      if (res && body) showResults(res, body);
      return;
    }
    if (formActive || reorder || view.querySelector('.pairpick') || (h === '#a-identifier' && view.querySelector('.qask'))) return;   // pas de rafraîchissement pendant une confirmation
    route(true);
  }
  function route(quiet) {
    var h = (location.hash || '').replace(/^#/, '');
    var restoreQ = (quiet !== true && h === 'a-identifier' && /^classer\//.test(prevH) && qBack) ? qBack.y : null;   // retour du formulaire « Classer » : même position dans la liste
    if (quiet !== true) prevH = h;
    formActive = false;
    clearBar();
    view.textContent = '';
    view.className = '';
    var rec;
    if (byId[h]) recipeScreen(byId[h]);
    else if (tById[h]) typeScreen(tById[h]);
    else if (h.indexOf('repas/') === 0 && (mById[h.slice(6)] || h.slice(6) === 'sans')) mealScreen(h.slice(6));
    else if (h === 'a-identifier') queueScreen();
    else if (h === 'partage') { var sh = sharedIn; sharedIn = null; formScreen(null, '', null, sh); }
    else if (h === 'a-traiter') todoScreen();
    else if (h === 'a-completer') completeScreen();
    else if (h.indexOf('classer/') === 0) { var pi = PBY[h.slice(8)]; var pend = pi && pendingList().indexOf(pi) >= 0; if (pend && canEdit()) formScreen(null, '', pi); else queueScreen(); }
    else if (h === 'reglages') settingsScreen();
    else if (h === 'ajouter' || h.indexOf('ajouter/') === 0) formScreen(null, h.slice(8));
    else if (h.indexOf('modifier/') === 0) {
      rec = byId[h.slice(9)];
      if (rec) formScreen(rec); else missingScreen();
    }
    else if (h === 'repas') home('repas');
    else if (h === 'accueil') home('types');
    else home(lsGet('carnet:view'));
    if (quiet === true) return;
    try { window.scrollTo(0, restoreQ || 0); } catch (e) {}
    queueToast();
    if (!firstRoute) {
      var t = view.querySelector('h1');
      if (t) { t.tabIndex = -1; try { t.focus({ preventScroll: true }); } catch (e) {} }
    }
    firstRoute = false;
  }

  window.addEventListener('hashchange', function () { reorder = false; route(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') refreshData(false); });
  window.addEventListener('online', function () { refreshData(true); });
  route();
  refreshData(true);
})();
