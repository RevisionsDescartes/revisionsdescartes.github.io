/* Carnet de recettes : hors ligne. Page = réseau d'abord (3 s, revalidée à chaque fois), sinon copie en cache. */
const V = 'carnet-v30';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
function page(req) {
  return new Promise((resolve) => {
    let done = false;
    const give = (r) => { if (!done && r) { done = true; resolve(r); } };
    const fromCache = () => caches.match('./index.html').then(give);
    const timer = setTimeout(fromCache, 3000);
    fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then((r) => {
      clearTimeout(timer);
      if (r.ok) { const c = r.clone(); caches.open(V).then((x) => x.put('./index.html', c)); give(r); }
      else fromCache();
    }).catch(() => { clearTimeout(timer); fromCache().then(() => { if (!done) { done = true; resolve(Response.error()); } }); });
  });
}
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') { e.respondWith(page(req)); return; }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
    if (r.ok) { const c = r.clone(); caches.open(V).then((x) => x.put(req, c)); }
    return r;
  })));
});
