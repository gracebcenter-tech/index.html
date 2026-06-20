// Le numéro de version doit être incrémenté à chaque mise à jour du contenu de l'application,
// pour que les anciens caches soient automatiquement supprimés.
const CACHE_VERSION = "v2";
const CACHE_NAME = `alodo-cache-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add("./index.html"))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Stratégie "réseau d'abord" : à chaque ouverture, on essaie de récupérer la dernière
// version sur le réseau. Si ça réussit, on l'enregistre en cache et on l'affiche.
// Si le réseau échoue (pas de connexion), on affiche la dernière version connue en cache.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
  );
});
