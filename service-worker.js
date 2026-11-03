// Gestion Porcine — service worker : toujours la dernière version si en ligne, copie en cache si hors ligne
const CACHE = 'gestion-porcine-v110';
const FICHIERS = ['./', 'index.html', 'manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(rep => {
        if (rep && rep.ok) { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); }
        return rep;
      })
      .catch(() => caches.match(e.request).then(m => m || caches.match('index.html')))
  );
});
