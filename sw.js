const CACHE_NAME = 'wc-2026-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/bracket.css',
  './js/data.js',
  './js/db.js',
  './js/app.js',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
