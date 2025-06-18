const CACHE_VERSION = 'v10';
const CACHE_NAME = `holliday-cache-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
  'index.html',
  'about.html',
  'services.html',
  'faq.html',
  'contact.html',
  'pay-your-bill.html',
  'education.html',
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
  console.log('Service Worker installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      cache.addAll(ASSETS_TO_CACHE).catch(err => {
        // Log which asset failed to cache
        console.error('Failed to cache asset during install:', err);
      })
    ).catch(err => {
      console.error('Service Worker install failed:', err);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('Deleting old cache:', key);
          return caches.delete(key);
        })
      )
    ).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    }).catch(err => {
      console.error('Service Worker activation failed:', err);
    })
  );
  // Notify all clients to reload
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({ type: 'RELOAD_PAGE' }));
  });
});

// Fetch event
self.addEventListener('fetch', event => {
  // Never cache education.html - always fetch from network
  if (event.request.url.includes('education.html')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
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
    console.log('Clearing all caches...');
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
    }).catch(err => {
      console.error('Error clearing caches:', err);
    });
  }
});

// Error handling
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});
