const CACHE_VERSION = 'v13';
const CACHE_NAME = `holliday-cache-${CACHE_VERSION}`;
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './about.html',
  './services.html',
  './faq.html',
  './contact.html',
  './pay-your-bill.html',
  './education.html',
  './assets/css/main.css',
  './assets/css/mobile-enhancements.css',
  './assets/js/main.js',
  './assets/js/hero.js',
  './assets/js/service-cache.js',
  './assets/images/hollidays-logo.optimized-1280.png',
  './assets/images/hollidays-logo.optimized-1280.webp',
  './assets/images/hero-garden-landscaping.jpg',
  './assets/images/favicon/favicon-32x32.png',
  './assets/images/favicon/favicon-16x16.png',
  './assets/images/favicon/apple-touch-icon.png',
  './manifest.json'
];

// Storage cleanup function
async function cleanupStorage() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    // If cache is getting too large, remove oldest entries
    if (keys.length > 20) {
      const oldestKeys = keys.slice(0, keys.length - 20);
      await Promise.all(oldestKeys.map(key => cache.delete(key)));
      console.log('Cleaned up old cache entries');
    }
  } catch (error) {
    console.warn('Cache cleanup failed:', error);
  }
}

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  // Force skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache:', CACHE_NAME);
      
      // Clean up storage first
      return cleanupStorage().then(() => {
        // Cache assets individually to handle failures gracefully
        const cachePromises = ASSETS_TO_CACHE.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn(`Failed to cache ${asset}:`, err);
            return Promise.resolve(); // Don't fail the install
          });
        });
        return Promise.all(cachePromises);
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
          return caches.delete(key).catch(err => {
            console.warn(`Failed to delete cache ${key}:`, err);
            return Promise.resolve();
          });
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

// Fetch event - Network first, then cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip Firebase and analytics requests to prevent storage issues
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('google-analytics') ||
      event.request.url.includes('gstatic.com/firebasejs')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response before using it
        const responseClone = response.clone();
        
        // Cache successful responses (but not too many)
        if (response.status === 200 && response.headers.get('content-type')?.includes('text/html')) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone).catch(err => {
              console.warn('Failed to cache response:', err);
            });
          });
        }
        
        return response;
      })
      .catch(() => {
        // Return cached version if network fails
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          
          // Return offline page for HTML requests
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./offline.html');
          }
          
          return new Response('Network error', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Handle storage quota exceeded
self.addEventListener('storage', event => {
  if (event.key === 'quota-exceeded') {
    console.log('Storage quota exceeded, cleaning up...');
    cleanupStorage();
  }
});