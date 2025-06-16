// Register the background service worker
async function registerBackgroundWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/assets/js/background-cache-cleaner.js', {
            scope: '/'
        });
        console.log('Background cache cleaner registered:', registration);
        return registration;
    } catch (error) {
        console.error('Error registering background worker:', error);
        return null;
    }
}

// Function to clear browser caches using background worker
async function clearBrowserCache() {
    try {
        // Register the background worker if not already registered
        const registration = await registerBackgroundWorker();
        if (!registration) {
            throw new Error('Failed to register background worker');
        }

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;

        // Get the active service worker
        const worker = registration.active;
        if (!worker) {
            throw new Error('No active service worker');
        }

        // Send message to clear cache
        worker.postMessage({ type: 'CLEAR_CACHE' });

        // Return a promise that resolves when the cache is cleared
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Cache clearing timed out'));
            }, 10000); // 10 second timeout

            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'CACHE_CLEARED') {
                    clearTimeout(timeout);
                    if (event.data.success) {
                        resolve(true);
                    } else {
                        reject(new Error(event.data.error || 'Failed to clear cache'));
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error clearing cache:', error);
        return false;
    }
}

// Initialize cache clearing when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await clearBrowserCache();
        // Reload the page after cache is cleared
        window.location.reload(true);
    } catch (error) {
        console.error('Error during cache clearing:', error);
    }
});

// Export function for use in other scripts
export { clearBrowserCache }; 