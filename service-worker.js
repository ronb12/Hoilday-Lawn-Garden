const CACHE_VERSION = 'v3';
const CACHE_NAME = 'holliday-lawn-garden-' + CACHE_VERSION;
const ASSETS_TO_CACHE = [
  '/Holliday-Lawn-Garden/',
  '/Holliday-Lawn-Garden/index.html',
  '/Holliday-Lawn-Garden/about.html',
  '/Holliday-Lawn-Garden/services.html',
  '/Holliday-Lawn-Garden/contact.html',
  '/Holliday-Lawn-Garden/education.html',
  '/Holliday-Lawn-Garden/pay-your-bill.html',
  '/Holliday-Lawn-Garden/assets/css/main.css',
  '/Holliday-Lawn-Garden/assets/js/main.js',
  '/Holliday-Lawn-Garden/assets/images/favicon/favicon-16x16.png',
  '/Holliday-Lawn-Garden/assets/images/favicon/favicon-32x32.png',
  '/Holliday-Lawn-Garden/assets/images/favicon/apple-touch-icon.png',
  '/Holliday-Lawn-Garden/assets/images/favicon/android-chrome-192x192.png',
  '/Holliday-Lawn-Garden/assets/images/favicon/android-chrome-512x512.png',
];

// Install event - cache assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return caches.open(CACHE_NAME).then(cache => {
        console.log('Opened new cache');
        return cache.addAll(ASSETS_TO_CACHE);
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  if (url.pathname.includes('.html')) {
    const cacheBuster = '?v=' + CACHE_VERSION;
    if (!url.search.includes(cacheBuster)) {
      url.search += (url.search ? '&' : '?') + cacheBuster;
      event.respondWith(fetch(url.toString()));
      return;
    }
  }
  
  if (url.pathname.includes('faq.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        const cacheTime = response.headers.get('sw-cache-time');
        if (cacheTime && Date.now() - new Date(cacheTime).getTime() > 3600000) {
          return fetchAndCache(event.request);
        }
        return response;
      }
      return fetchAndCache(event.request);
    })
  );
});

// Helper function to fetch and cache
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response;
    }

    const responseToCache = response.clone();
    const headers = new Headers(responseToCache.headers);
    headers.append('sw-cache-time', new Date().toISOString());

    const cachedResponse = new Response(responseToCache.body, {
      status: responseToCache.status,
      statusText: responseToCache.statusText,
      headers: headers
    });

    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, cachedResponse);

    return response;
  } catch (error) {
    console.error('Fetch failed:', error);
    return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
  }
}

// Add message event listener for cache clearing
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
