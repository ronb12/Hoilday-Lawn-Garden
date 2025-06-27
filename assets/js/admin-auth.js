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
    // User is signed in, check if they're an admin
    try {
      console.log("Checking admin status for user:", user.email);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      console.log("User doc exists:", userDoc.exists());
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User role:", userData.role);
        
        if (userData.role === "admin") {
          // User is admin, allow access
          console.log("Admin access granted for:", user.email);
          hideLoading();
          return; // Success - don't redirect
        } else {
          console.log("User is not admin, role is:", userData.role);
        }
      } else {
        console.log("User document does not exist");
      }
      
      // User is not admin or document doesn't exist
      if (!isOnLoginPage()) {
        console.log("Access denied - redirecting to login");
        showError("Access denied. Admin privileges required.");
        setTimeout(() => {
          window.location.href = "admin-login.html";
        }, 2000);
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
    // No user is signed in
    console.log("No user signed in");
    if (!isOnLoginPage()) {
      console.log("Redirecting to login page");
      showError("Please log in to access the admin dashboard.");
      setTimeout(() => {
        window.location.href = "admin-login.html";
      }, 2000);
    }
  }
});

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin auth DOM loaded, checking authentication...");
  showLoading("Checking authentication...");
});

// Export for use in other modules
export { app, auth, db };
