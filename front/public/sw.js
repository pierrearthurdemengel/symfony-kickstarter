// Service Worker - Kickstarter PWA
const CACHE_NAME = 'kickstarter-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Installation : mise en cache des assets statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch : strategie network-first avec fallback cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorer les requetes non-GET et les appels API
  if (request.method !== 'GET' || request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mise en cache de la reponse pour usage hors-ligne
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // Fallback sur le cache en cas de panne reseau
        return caches.match(request).then((cached) => cached || caches.match('/'));
      })
  );
});
