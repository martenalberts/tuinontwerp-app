// Service worker van de tuinontwerp-app (gemaakt door pwa_bouw.py, niet met de hand aanpassen)
const VERSIE = 'tuin-0bac4de94b85';
const LOKAAL = ["index.html", "tuin-3d.html", "tuin-plattegrond.html", "tuin-legplan-40x80.html", "dossier/sfeerbeelden.html", "dossier/ontwerpdossier.html", "dossier/sfeerbeeld-1-vanuit-tuindeur.jpg", "dossier/sfeerbeeld-2-vanaf-pergola-terras.jpg", "dossier/sfeerbeeld-3-vanaf-galerij.jpg", "dossier/sfeerbeeld-4-vanaf-poort.jpg", "dossier/plattegrond.png", "dossier/installatie.png", "dossier/Ontwerpdossier-tuinontwerp.pdf", "iconen/icoon-192.png", "iconen/icoon-512.png", "iconen/icoon-maskable-512.png", "iconen/apple-touch-icon.png", "manifest.webmanifest"];
const EXTERN = ["https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSIE);
    await c.addAll(['./', ...LOKAAL]);
    await Promise.all(EXTERN.map(u => fetch(u, {mode: 'no-cors'}).then(r => c.put(u, r)).catch(() => {})));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSIE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // eigen pagina's: eerst online proberen (altijd de nieuwste), anders uit de cache
    e.respondWith(fetch(req).then(r => {
      if (r.ok) { const k = r.clone(); caches.open(VERSIE).then(c => c.put(req, k)); }
      return r;
    }).catch(() => caches.match(req, {ignoreSearch: true})));
  } else {
    // bibliotheken en lettertypes: uit de cache, op de achtergrond bijwerken
    e.respondWith(caches.open(VERSIE).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
  }
});
