// Profile Management JavaScript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, getDocs, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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
      handleError(new Error('User data not found'));
    }
  } catch (error) {
    handleError(error);
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
    
    // Handle address fields
    if (userData.address) {
      // If we have the old address format, try to parse it
      const addressParts = userData.address.split(',').map(part => part.trim());
      if (addressParts.length >= 4) {
        document.getElementById('street').value = addressParts[0] || '';
        document.getElementById('city').value = addressParts[1] || '';
        document.getElementById('state').value = addressParts[2] || '';
        document.getElementById('zipCode').value = addressParts[3] || '';
      }
    } else {
      // Set individual address fields
      document.getElementById('street').value = userData.street || '';
      document.getElementById('city').value = userData.city || '';
      document.getElementById('state').value = userData.state || '';
      document.getElementById('zipCode').value = userData.zipCode || '';
    }
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
      // Store address components separately
      street: document.getElementById('street').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zipCode: document.getElementById('zipCode').value
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
      handleError(error);
    });
}

function handleError(error) {
  console.error('Error:', error);
  let message = 'An error occurred';
  
  if (error.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'User not found';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'Email already in use';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'permission-denied':
        message = 'Permission denied';
        break;
      default:
        message = error.message || 'An error occurred';
    }
  } else {
    message = error.message || 'An error occurred';
  }
  
  showNotification(message, 'error');
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