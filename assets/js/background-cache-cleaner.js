// Background cache cleaner service worker
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
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