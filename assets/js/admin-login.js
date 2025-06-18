import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// DOM Elements
const adminLoginForm = document.getElementById('admin-login-form');
const adminEmail = document.getElementById('admin-email');
const adminPassword = document.getElementById('admin-password');
const rememberMe = document.getElementById('remember-me');
const googleSignIn = document.getElementById('googleSignIn');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingMessage = document.getElementById('loading-message');

// Show loading overlay
function showLoading(message = 'Loading...') {
  loadingMessage.textContent = message;
  loadingOverlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
  loadingOverlay.style.display = 'none';
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorContainer.style.display = 'block';
  successMessage.style.display = 'none';
}

// Show success message
function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  errorContainer.style.display = 'none';
}

// Handle form submission
adminLoginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading('Signing in...');

  try {
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail.value, adminPassword.value);
    const user = userCredential.user;

    // Check if user is an admin
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().role === "admin") {
      showSuccess('Login successful! Redirecting to admin dashboard...');
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1500);
    } else {
      await auth.signOut();
      showError('Access denied. Admin privileges required.');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('Invalid email or password. Please try again.');
  } finally {
    hideLoading();
  }
});

// Handle Google Sign In
googleSignIn.addEventListener('click', async () => {
  showLoading('Signing in with Google...');

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user is an admin
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().role === "admin") {
      showSuccess('Login successful! Redirecting to admin dashboard...');
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1500);
    } else {
      await auth.signOut();
      showError('Access denied. Admin privileges required.');
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    showError('Failed to sign in with Google. Please try again.');
  } finally {
    hideLoading();
  }
});

// Handle remember me
if (rememberMe) {
  rememberMe.addEventListener('change', (e) => {
    if (e.target.checked) {
      localStorage.setItem('rememberAdmin', 'true');
    } else {
      localStorage.removeItem('rememberAdmin');
    }
  });
}

// Check for remembered email
window.addEventListener('load', () => {
  if (localStorage.getItem('rememberAdmin') === 'true') {
    rememberMe.checked = true;
    const savedEmail = localStorage.getItem('adminEmail');
    if (savedEmail) {
      adminEmail.value = savedEmail;
    }
  }
});