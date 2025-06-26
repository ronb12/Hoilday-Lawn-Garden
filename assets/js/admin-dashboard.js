import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
const logoutBtn = document.getElementById("logoutBtn");
const loadingOverlay = document.getElementById("loading-overlay");
const loadingMessage = document.getElementById("loading-message");
const errorContainer = document.getElementById("error-container");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

// Show loading overlay
function showLoading(message = "Loading...") {
  if (loadingMessage) loadingMessage.textContent = message;
  if (loadingOverlay) loadingOverlay.style.display = "flex";
}

// Hide loading overlay
function hideLoading() {
  if (loadingOverlay) loadingOverlay.style.display = "none";
}

// Check authentication state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in, check if they're an admin
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        // User is admin, allow access
        hideLoading();
        showSuccess('Welcome back, Admin!');
        setTimeout(() => {
          if (successMessage) successMessage.style.display = 'none';
        }, 3000);
      } else {
        // User is not admin, show error but do not log out
        showError('Access denied. Admin privileges required.');
        // Optionally, you can disable dashboard functionality here
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      showError('Error verifying admin status. Please try again or contact support.');
      // Optionally, you can disable dashboard functionality here
    }
  } else {
    // No user is signed in, redirect to login
    hideLoading();
    showError('Please log in to access the admin dashboard.');
    setTimeout(() => {
      window.location.href = 'admin-login.html';
    }, 2000);
  }
});
