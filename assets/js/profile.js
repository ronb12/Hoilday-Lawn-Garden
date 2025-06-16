// Profile Management JavaScript
import { handleError, handleFirebaseError } from './error-handler.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, getDocs, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { showError } from './firebase.js';
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication state
  onAuthStateChanged(auth, user => {
    if (!user) {
      // If not logged in, redirect to login page
      window.location.href = '/login.html';
      return;
    }

    // User is logged in, initialize profile
    loadUserProfile(user);
  });

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSubmit);
  }
});

async function loadUserProfile(user) {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      updateProfileUI(userData);
    } else {
      handleError(new Error('User data not found'), 'loadUserProfile');
    }
  } catch (error) {
    handleFirebaseError(error);
  }
}

function updateProfileUI(userData) {
  // Update profile information
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    // Set form values
    document.getElementById('displayName').value = userData.displayName || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('phone').value = userData.phone || '';
    document.getElementById('address').value = userData.address || '';
  }
}

function initializeEventListeners() {
  // Add event listeners for profile interactions
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSubmit);
  }

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  try {
    const formData = {
      displayName: document.getElementById('displayName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value
    };

    await updateDoc(doc(db, 'users', user.uid), formData);
    showNotification('Profile updated successfully', 'success');
  } catch (error) {
    console.error('Error updating profile:', error);
    showNotification('Error updating profile', 'error');
  }
}

function handleLogout() {
  auth
    .signOut()
    .then(() => {
      sessionStorage.removeItem('user');
      window.location.href = '/login.html';
    })
    .catch(error => {
      handleFirebaseError(error);
    });
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
} 