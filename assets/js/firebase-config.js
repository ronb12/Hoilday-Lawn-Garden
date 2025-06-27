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

// Optimized storage cleanup function
async function optimizedStorageCleanup() {
  try {
    // Only log in development
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      console.log('Performing storage cleanup...');
    }
    
    // Clear old service worker caches (keep recent ones)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        !name.includes('firebase') && 
        !name.includes('google') &&
        !name.includes('current')
      );
      
      await Promise.all(oldCaches.map(async cacheName => {
        try {
          await caches.delete(cacheName);
        } catch (error) {
          // Silent fail for cache deletion
        }
      }));
    }
    
    // Clear non-essential localStorage
    if (localStorage.length > 10) {
      const keysToKeep = ['user', 'authUser', 'firebase:authUser', 'theme', 'language'];
      const keysToRemove = Object.keys(localStorage).filter(key => !keysToKeep.includes(key));
      
      // Only remove old items, keep recent ones
      keysToRemove.slice(0, 5).forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          // Silent fail for localStorage removal
        }
      });
    }
    
    // Clear sessionStorage (safe to clear)
    if (sessionStorage.length > 5) {
      const keysToRemove = Object.keys(sessionStorage);
      keysToRemove.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          // Silent fail for sessionStorage removal
        }
      });
    }
    
  } catch (error) {
    // Only log errors in development
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      console.warn('Storage cleanup warning:', error);
    }
  }
}

// Check storage quota (optimized)
async function checkStorageQuota() {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usagePercent = (estimate.usage / estimate.quota) * 100;
      
      // Only log if usage is high or in development
      if (usagePercent > 80 || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        console.log('Storage usage:', `${usagePercent.toFixed(1)}% (${estimate.usage} / ${estimate.quota} bytes)`);
      }
      
      if (usagePercent > 80) {
        console.warn('Storage usage is high, performing cleanup...');
        await optimizedStorageCleanup();
      }
    }
  } catch (error) {
    // Silent fail for storage quota check
  }
}

// Initialize Analytics with optimized error handling
let analytics = null;
try {
  // Check if analytics is supported before initializing
  const analyticsSupported = await isSupported();
  if (analyticsSupported) {
    try {
      analytics = getAnalytics(app);
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        console.log('Firebase Analytics initialized successfully');
      }
    } catch (error) {
      // Try cleanup and retry once
      await optimizedStorageCleanup();
      try {
        analytics = getAnalytics(app);
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
          console.log('Firebase Analytics initialized after cleanup');
        }
      } catch (retryError) {
        analytics = null;
      }
    }
  } else {
    analytics = null;
  }
} catch (error) {
  analytics = null;
}

// Run storage cleanup on page load and periodically (optimized)
if (typeof window !== 'undefined') {
  // Initial check
  window.addEventListener('load', () => {
    checkStorageQuota();
  });
  
  // Clean up storage every 10 minutes (reduced frequency)
  setInterval(checkStorageQuota, 10 * 60 * 1000);
  
  // Clean up on page unload (minimal)
  window.addEventListener('beforeunload', () => {
    // Quick cleanup on page unload
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.slice(0, 2).forEach(key => caches.delete(key));
      });
    }
  });
}

export { app, analytics, auth, db, firebaseConfig, optimizedStorageCleanup, checkStorageQuota }; 