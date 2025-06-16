// Register the background service worker
async function registerBackgroundWorker() {
    try {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/assets/js/background-cache-cleaner.js', {
                scope: '/'
            });
            console.log('Service Worker registered successfully:', registration);
            return registration;
        }
        throw new Error('Service Workers are not supported in this browser');
    } catch (error) {
        console.warn('Service Worker registration failed:', error);
        return null;
    }
}

// Function to clear browser caches using background worker
async function clearBrowserCache() {
    try {
        const registration = await registerBackgroundWorker();
        if (registration) {
            await registration.update();
            console.log('Cache updated successfully');
        }
        
        // Clear application cache
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('Application cache cleared');
        }

        // Clear browser cache
        if ('clearBrowserData' in window) {
            await window.clearBrowserData();
            console.log('Browser cache cleared');
        }

        return true;
    } catch (error) {
        console.error('Error clearing cache:', error);
        return false;
    }
}

// Initialize cache clearing when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    const cacheStatus = document.getElementById('cache-status');

    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', async () => {
            try {
                clearCacheBtn.disabled = true;
                clearCacheBtn.textContent = 'Clearing...';
                
                const success = await clearBrowserCache();
                
                if (success) {
                    cacheStatus.textContent = 'Cache cleared successfully!';
                    cacheStatus.className = 'success';
                } else {
                    cacheStatus.textContent = 'Cache clearing failed. Please try again.';
                    cacheStatus.className = 'error';
                }
            } catch (error) {
                console.error('Error during cache clearing:', error);
                cacheStatus.textContent = 'An error occurred. Please try again.';
                cacheStatus.className = 'error';
            } finally {
                clearCacheBtn.disabled = false;
                clearCacheBtn.textContent = 'Clear Cache';
            }
        });
    }
});

// Export function for use in other scripts
export { clearBrowserCache }; 