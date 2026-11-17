// Service worker - Ferme Porcine (Gestion Porcine)
// Stratégie : réseau d'abord (toujours la dernière version), cache en secours hors connexion.
// Pour forcer une mise à jour sur toutes les tablettes, changez simplement le numéro de version.
const VERSION = 'gestion-porcine-v2-2026-11-17';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // ne touche pas aux autres sites

  event.respondWith(
    fetch(req)
      .then((rep) => {
        if (rep && rep.status === 200) {
          const copie = rep.clone();
          caches.open(VERSION).then((c) => c.put(req, copie));
        }
        return rep;
      })
      .catch(() =>
        caches.match(req).then((enCache) => enCache || (req.mode === 'navigate' ? caches.match('./') : undefined))
      )
  );
});
