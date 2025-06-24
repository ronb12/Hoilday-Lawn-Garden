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

// Initialize Analytics with error handling
let analytics = null;
try {
  // Check if analytics is supported before initializing
  isSupported().then(yes => yes ? getAnalytics(app) : null)
    .then(analyticsInstance => {
      analytics = analyticsInstance;
      console.log('Firebase Analytics initialized successfully');
    })
    .catch(error => {
      console.warn('Firebase Analytics initialization failed:', error);
      analytics = null;
    });
} catch (error) {
  console.warn('Firebase Analytics not available:', error);
  analytics = null;
}

// Storage cleanup function to handle IndexedDB space issues
function cleanupStorage() {
  try {
    // Clear old service worker caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.startsWith('holliday-cache-')) {
            caches.delete(cacheName);
          }
        });
      });
    }
    
    // Clear IndexedDB if possible
    if ('indexedDB' in window) {
      const request = indexedDB.deleteDatabase('firebaseLocalStorageDb');
      request.onsuccess = () => console.log('IndexedDB cleared successfully');
      request.onerror = () => console.warn('Could not clear IndexedDB');
    }
    
    // Clear localStorage if it's getting too large
    if (localStorage.length > 100) {
      const keysToKeep = ['user', 'authUser', 'firebase:authUser'];
      const keysToRemove = Object.keys(localStorage).filter(key => !keysToKeep.includes(key));
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.warn('Storage cleanup failed:', error);
  }
}

// Run storage cleanup on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', cleanupStorage);
}

export { app, analytics, auth, db, firebaseConfig, cleanupStorage }; 