const fs = require('fs');
const cheerio = require('cheerio');

const file = 'customer-dashboard.html';
const html = fs.readFileSync(file, 'utf8');
const $ = cheerio.load(html, { xmlMode: false });

$('script[type="module"]').each((i, el) => {
  const scriptContent = $(el).html();
  if (scriptContent.includes('firebase/auth') || scriptContent.includes('firebase/firestore') || scriptContent.includes('firebase.js')) {
    $(el).html(`import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX",
  authDomain: "holliday-lawn-garden.firebaseapp.com",
  projectId: "holliday-lawn-garden",
  storageBucket: "holliday-lawn-garden.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456789012"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication state
  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = '/login.html';
      return;
    }
    initializeDashboard(user);
  });

  // Initialize event listeners
  initializeEventListeners();
});

function initializeEventListeners() {
  // Add event listeners for dashboard interactions
  const logoutButton = document.querySelector('.logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }

  const editProfileLink = document.getElementById('editProfileLink');
  if (editProfileLink) {
    editProfileLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/profile.html';
    });
  }

  const quickEditProfileBtn = document.getElementById('quickEditProfileBtn');
  if (quickEditProfileBtn) {
    quickEditProfileBtn.addEventListener('click', () => {
      window.location.href = '/profile.html';
    });
  }
}

async function initializeDashboard(user) {
  // Update UI with user info
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  if (profileName) profileName.textContent = user.displayName || 'Customer';
  if (profileEmail) profileEmail.textContent = user.email || '';

  // Load user's data from Firestore
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      updateDashboardUI(userData);
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

function handleLogout() {
  signOut(auth)
    .then(() => {
      sessionStorage.removeItem('user');
      window.location.href = '/login.html';
    })
    .catch(error => {
      console.error('Error signing out:', error);
    });
}

// PayPal Button Render
function renderPayPalButton(amount) {
  if (!window.paypal) return;
  paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{ amount: { value: amount } }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        // Call backend or Firestore update here
        window.paymentManager.handlePayPalSuccess(details);
        showNotification('PayPal payment successful!', 'success');
      });
    }
  }).render('#paypal-button-container');
}

// Show PayPal button when payment modal opens
function showPaymentModal() {
  document.getElementById('paymentModal').style.display = 'block';
  setTimeout(() => {
    const amount = document.getElementById('paymentAmount').value || '10.00';
    renderPayPalButton(amount);
  }, 500);
}

// Emergency Request
function handleEmergencyRequest() {
  window.communicationSystem.sendEmergencyRequest();
  showNotification('Emergency request sent!', 'info');
}

// Feedback Submit
async function handleFeedbackSubmit(event) {
  event.preventDefault();
  const feedback = document.getElementById('feedbackText').value;
  const rating = document.getElementById('serviceRating').value;
  await window.communicationSystem.submitFeedback({ feedback, rating });
  showNotification('Feedback submitted!', 'success');
  document.getElementById('feedbackForm').reset();
}
`);
  }
});

fs.writeFileSync(file, $.html(), 'utf8');
console.log('Firebase imports in customer-dashboard.html have been fixed!'); 