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
  if (loadingMessage) loadingMessage.textContent = message;
  if (loadingOverlay) loadingOverlay.style.display = "flex";
}

// Hide loading overlay
function hideLoading() {
  if (loadingOverlay) loadingOverlay.style.display = "none";
}

// Show error message
function showError(message) {
  if (errorMessage) errorMessage.textContent = message;
  if (errorContainer) errorContainer.style.display = "block";
  hideLoading();
}

// Check authentication state
onAuthStateChanged(auth, async (user) => {
  console.log("Admin auth check - user:", user ? user.email : "null");
  if (user) {
    // User is signed in, check if they're an admin
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        // User is admin, allow access
        console.log("Admin access granted for:", user.email);
        hideLoading();
      } else {
        // User is not admin, redirect to login
        console.log("Access denied - not admin");
        showError("Access denied. Admin privileges required.");
        setTimeout(() => {
          window.location.href = "admin-login.html";
        }, 2000);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      showError("Error verifying admin status. Please try again or contact support.");
      setTimeout(() => {
        window.location.href = "admin-login.html";
      }, 2000);
    }
  } else {
    // No user is signed in, redirect to login
    console.log("No user signed in, redirecting to login");
    showError("Please log in to access the admin dashboard.");
    setTimeout(() => {
      window.location.href = "admin-login.html";
    }, 2000);
  }
});

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin auth DOM loaded, checking authentication...");
  showLoading("Checking authentication...");
});

// Export for use in other modules
export { app, auth, db };
