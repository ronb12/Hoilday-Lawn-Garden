const CACHE_VERSION = 'v15';
const CACHE_NAME = `holliday-cache-${CACHE_VERSION}`;
const MAX_CACHE_SIZE = 25 * 1024 * 1024; // Reduced to 25MB limit
const MAX_CACHE_ENTRIES = 10; // Reduced to 10 entries

// Aggressive storage cleanup function
async function aggressiveStorageCleanup() {
  try {
    console.log('Service Worker: Starting aggressive storage cleanup...');
    
    // Clear all caches except current
    const cacheNames = await caches.keys();
    console.log('Service Worker: Found caches:', cacheNames);
    
    await Promise.all(cacheNames.map(async cacheName => {
      if (cacheName !== CACHE_NAME) {
        try {
          await caches.delete(cacheName);
          console.log('Service Worker: Deleted old cache:', cacheName);
        } catch (error) {
          console.warn('Service Worker: Failed to delete cache:', cacheName, error);
        }
      }
    }));
    
    // Limit current cache size
    const currentCache = await caches.open(CACHE_NAME);
    const keys = await currentCache.keys();
    
    if (keys.length > MAX_CACHE_ENTRIES) {
      const keysToDelete = keys.slice(0, keys.length - MAX_CACHE_ENTRIES);
      await Promise.all(keysToDelete.map(key => currentCache.delete(key)));
      console.log('Service Worker: Cleaned up cache entries, kept:', MAX_CACHE_ENTRIES);
    }
    
    // Clear IndexedDB if possible
    if ('indexedDB' in self) {
      try {
        const databases = await indexedDB.databases();
        await Promise.all(databases.map(async dbInfo => {
          const request = indexedDB.deleteDatabase(dbInfo.name);
          await new Promise((resolve) => {
            request.onsuccess = () => {
              console.log('Service Worker: Deleted IndexedDB:', dbInfo.name);
              resolve();
            };
            request.onerror = () => {
              console.warn('Service Worker: Failed to delete IndexedDB:', dbInfo.name);
              resolve();
            };
          });
        }));
      } catch (error) {
        console.warn('Service Worker: IndexedDB cleanup failed:', error);
      }
    }
    
    console.log('Service Worker: Storage cleanup completed');
  } catch (error) {
    console.error('Service Worker: Storage cleanup failed:', error);
  }
}

// Install event - cache assets with aggressive cleanup
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  // Force skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    aggressiveStorageCleanup().then(() => {
      return caches.open(CACHE_NAME).then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        
        // Cache only essential assets with relative paths
        const essentialAssets = [
          './',
          './index.html',
          './assets/css/main.min.css',
          './assets/images/hollidays-logo.optimized-1280.png',
          './manifest.json',
          './offline.html'
        ];
        
        const cachePromises = essentialAssets.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn(`Failed to cache ${asset}:`, err);
            return Promise.resolve();
          });
        });
        return Promise.all(cachePromises);
      });
    }).catch(err => {
      console.error('Service Worker install failed:', err);
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
      return self.clients.claim();
    }).catch(err => {
      console.error('Service Worker activation failed:', err);
      return Promise.resolve();
    })
  );
});

// Fetch event - Network first, minimal caching
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip all Firebase and analytics requests to prevent storage issues
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('google-analytics') ||
      event.request.url.includes('gstatic.com/firebasejs') ||
      event.request.url.includes('firebaseinstallations.googleapis.com') ||
      event.request.url.includes('analytics.google.com')) {
    return;
  }

  // Skip caching for dynamic content
  if (event.request.url.includes('?') || 
      event.request.url.includes('api/') ||
      event.request.url.includes('dashboard')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful HTML responses
        if (response.status === 200 && 
            response.headers.get('content-type')?.includes('text/html') &&
            !event.request.url.includes('dashboard')) {
          
          const responseClone = response.clone();
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
    console.log('Storage quota exceeded, performing cleanup...');
    aggressiveStorageCleanup();
  }
});

// Periodic cleanup every 10 minutes
setInterval(aggressiveStorageCleanup, 10 * 60 * 1000); 