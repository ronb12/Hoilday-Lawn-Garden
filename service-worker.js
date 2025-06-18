const CACHE_VERSION = 'v7';
const CACHE_NAME = `holliday-cache-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
  'index.html',
  'about.html',
  'services.html',
  'education.html',
  'faq.html',
  'contact.html',
  'assets/css/main.css',
  'assets/js/main.js',
  'assets/js/service-cache.js',
  'assets/images/hollidays-logo.optimized-1280.png',
  'assets/images/favicon/favicon-32x32.png',
  'assets/images/favicon/favicon-16x16.png',
  // Add other static assets as needed
];

// Install event - cache assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      cache.addAll(ASSETS_TO_CACHE).catch(err => {
        // Log which asset failed to cache
        console.error('Failed to cache asset during install:', err);
      })
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
  // Notify all clients to reload
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({ type: 'RELOAD_PAGE' }));
  });
});

// Fetch event
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // Network-first for HTML
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first for assets
    event.respondWith(
      caches.match(event.request).then(
        response => response || fetch(event.request)
      )
    );
  }
});

// Message event for manual cache clearing
self.addEventListener('message', event => {
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('All caches cleared');
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage('RELOAD_PAGE');
        });
      });
    });
  }
});
