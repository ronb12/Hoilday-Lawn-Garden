const CACHE_VERSION = 'v11';
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
  
  // Force skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache:', CACHE_NAME);
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        // Log which asset failed to cache
        console.error('Failed to cache asset during install:', err);
        // Don't fail the install if some assets can't be cached
        return Promise.resolve();
      });
    }).catch(err => {
      console.error('Service Worker install failed:', err);
      // Don't fail the install
      return Promise.resolve();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(keys => {
      console.log('Found caches:', keys);
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('Deleting old cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      // Claim all clients immediately
      return self.clients.claim();
    }).catch(err => {
      console.error('Service Worker activation failed:', err);
      // Don't fail activation
      return Promise.resolve();
    })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
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

// Handle service worker state changes
self.addEventListener('statechange', event => {
  console.log('Service Worker state changed:', event.target.state);
});
