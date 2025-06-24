// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACm0j7I8RX4ExIQRoejfk1HZMOQRGigBw",
  authDomain: "holiday-lawn-and-garden.firebaseapp.com",
  projectId: "holiday-lawn-and-garden",
  storageBucket: "holiday-lawn-and-garden.firebasestorage.app",
  messagingSenderId: "135322230444",
  appId: "1:135322230444:web:1a487b25a48aae07368909",
  measurementId: "G-KD6TBWR4ZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Aggressive storage cleanup function
async function aggressiveStorageCleanup() {
  try {
    console.log('Starting aggressive storage cleanup...');
    
    // Clear all service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('Found caches:', cacheNames);
      
      await Promise.all(cacheNames.map(async cacheName => {
        try {
          await caches.delete(cacheName);
          console.log('Deleted cache:', cacheName);
        } catch (error) {
          console.warn('Failed to delete cache:', cacheName, error);
        }
      }));
    }
    
    // Clear all IndexedDB databases
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases();
      console.log('Found IndexedDB databases:', databases);
      
      await Promise.all(databases.map(async dbInfo => {
        try {
          const request = indexedDB.deleteDatabase(dbInfo.name);
          await new Promise((resolve, reject) => {
            request.onsuccess = () => {
              console.log('Deleted IndexedDB:', dbInfo.name);
              resolve();
            };
            request.onerror = () => {
              console.warn('Failed to delete IndexedDB:', dbInfo.name);
              resolve(); // Don't reject, just continue
            };
          });
        } catch (error) {
          console.warn('Error deleting IndexedDB:', dbInfo.name, error);
        }
      }));
    }
    
    // Clear localStorage except essential items
    if (localStorage.length > 0) {
      const keysToKeep = ['user', 'authUser', 'firebase:authUser'];
      const keysToRemove = Object.keys(localStorage).filter(key => !keysToKeep.includes(key));
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log('Removed localStorage key:', key);
        } catch (error) {
          console.warn('Failed to remove localStorage key:', key, error);
        }
      });
    }
    
    // Clear sessionStorage
    if (sessionStorage.length > 0) {
      const keysToRemove = Object.keys(sessionStorage);
      keysToRemove.forEach(key => {
        try {
          sessionStorage.removeItem(key);
          console.log('Removed sessionStorage key:', key);
        } catch (error) {
          console.warn('Failed to remove sessionStorage key:', key, error);
        }
      });
    }
    
    console.log('Storage cleanup completed');
  } catch (error) {
    console.error('Storage cleanup failed:', error);
  }
}

// Check storage quota
async function checkStorageQuota() {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usagePercent = (estimate.usage / estimate.quota) * 100;
      console.log('Storage usage:', `${usagePercent.toFixed(1)}% (${estimate.usage} / ${estimate.quota} bytes)`);
      
      if (usagePercent > 80) {
        console.warn('Storage usage is high, performing cleanup...');
        await aggressiveStorageCleanup();
      }
    }
  } catch (error) {
    console.warn('Could not check storage quota:', error);
  }
}

// Initialize Analytics with error handling and storage management
let analytics = null;
try {
  // Check storage first
  await checkStorageQuota();
  
  // Check if analytics is supported before initializing
  const analyticsSupported = await isSupported();
  if (analyticsSupported) {
    try {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
    } catch (error) {
      console.warn('Firebase Analytics initialization failed, trying cleanup...', error);
      
      // Try cleanup and retry once
      await aggressiveStorageCleanup();
      try {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized after cleanup');
      } catch (retryError) {
        console.warn('Firebase Analytics failed after cleanup, disabling:', retryError);
        analytics = null;
      }
    }
  } else {
    console.log('Firebase Analytics not supported in this environment');
    analytics = null;
  }
} catch (error) {
  console.warn('Firebase Analytics not available:', error);
  analytics = null;
}

// Run storage cleanup on page load and periodically
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    checkStorageQuota();
  });
  
  // Clean up storage every 5 minutes
  setInterval(checkStorageQuota, 5 * 60 * 1000);
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    // Quick cleanup on page unload
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key));
      });
    }
  });
}

export { app, analytics, auth, db, firebaseConfig, aggressiveStorageCleanup, checkStorageQuota }; 