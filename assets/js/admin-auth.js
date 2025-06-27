import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

console.log("Admin auth script loading...");

// Firebase configuration
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

// DOM Elements
const loadingOverlay = document.getElementById("loading-overlay");
const loadingMessage = document.getElementById("loading-message");
const errorContainer = document.getElementById("error-container");
const errorMessage = document.getElementById("errorMessage");

// Show loading overlay
function showLoading(message = "Loading...") {
  console.log("showLoading called:", message);
  if (loadingMessage) loadingMessage.textContent = message;
  if (loadingOverlay) loadingOverlay.style.display = "flex";
}

// Hide loading overlay
function hideLoading() {
  console.log("hideLoading called");
  if (loadingOverlay) {
    console.log("Setting loadingOverlay display to none");
    loadingOverlay.style.display = "none";
  } else {
    console.log("loadingOverlay element not found");
  }
}

// Show error message
function showError(message) {
  console.log("showError called:", message);
  if (errorMessage) errorMessage.textContent = message;
  if (errorContainer) errorContainer.style.display = "block";
  hideLoading();
}

// Check if we're already on the login page to prevent redirect loops
function isOnLoginPage() {
  return window.location.pathname.includes('admin-login.html');
}

// Check authentication state
onAuthStateChanged(auth, async (user) => {
  console.log("Admin auth check - user:", user ? user.email : "null");
  console.log("Current page:", window.location.pathname);
  
  if (user) {
    // User is signed in - immediately hide loading and check admin status
    console.log("User is signed in, checking admin status...");
    hideLoading(); // Hide loading immediately for authenticated users
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        // User is admin, allow access
        console.log("Admin access confirmed for:", user.email);
        return; // Success - page is ready
      } else {
        // User is not admin
        console.log("Access denied - user is not admin");
        if (!isOnLoginPage()) {
          showError("Access denied. Admin privileges required.");
          setTimeout(() => {
            window.location.href = "admin-login.html";
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      if (!isOnLoginPage()) {
        showError("Error verifying admin status. Please try again or contact support.");
        setTimeout(() => {
          window.location.href = "admin-login.html";
        }, 2000);
      }
    }
  } else {
    // No user is signed in - show loading and redirect
    console.log("No user signed in, redirecting to login");
    showLoading("Please log in to access the admin dashboard.");
    if (!isOnLoginPage()) {
      setTimeout(() => {
        window.location.href = "admin-login.html";
      }, 2000);
    }
  }
});

// Initialize on DOM load - don't show loading by default
document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin auth DOM loaded");
  // Only show loading if we don't have a user yet
  const currentUser = auth.currentUser;
  if (!currentUser) {
    showLoading("Checking authentication...");
  }
});

// Export for use in other modules
export { app, auth, db };
