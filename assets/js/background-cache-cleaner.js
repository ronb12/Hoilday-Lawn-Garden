// Background cache cleaner service worker
const CACHE_NAME = 'holliday-lawn-garden-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/js/main.min.js',
  '/assets/js/hero.js',
  '/assets/images/hollidays-logo.optimized-1280.png',
  '/assets/images/hollidays-logo.optimized-1280.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        try {
            // Clear all caches
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );

            // Clear IndexedDB
            const databases = await self.indexedDB.databases();
            await Promise.all(
                databases.map(db => {
                    if (db.name) {
                        return new Promise((resolve, reject) => {
                            const request = self.indexedDB.deleteDatabase(db.name);
                            request.onsuccess = () => resolve();
                            request.onerror = () => reject(request.error);
                        });
                    }
                })
            );

            // Notify all clients that cache is cleared
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'CACHE_CLEARED',
                    success: true
                });
            });
        } catch (error) {
            // Notify clients of error
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'CACHE_CLEARED',
                    success: false,
                    error: error.message
                });
            });
        }
    }
}); 