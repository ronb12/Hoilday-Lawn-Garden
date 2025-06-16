// Placeholder modules/customer_dashboard.js
console.log('modules/customer_dashboard.js loaded'); 

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX",
  authDomain: "holliday-lawn-garden.firebaseapp.com",
  projectId: "holliday-lawn-garden",
  storageBucket: "holliday-lawn-garden.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456789012"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function initializeDashboard(user) {
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
    
    // Load unpaid invoices
    await loadUnpaidInvoices(user.uid);
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

export async function loadUnpaidInvoices(userId) {
  const container = document.querySelector("#unpaidInvoices ul");
  if (!container) return;
  
  try {
    container.innerHTML = '<li class="empty">Loading invoices...</li>';
    
    const q = query(
      collection(db, "invoices"),
      where("userId", "==", userId),
      where("status", "==", "unpaid")
    );
    
    const snap = await getDocs(q);
    
    if (snap.empty) {
      container.innerHTML = '<li class="empty">No unpaid invoices</li>';
      return;
    }
    
    container.innerHTML = "";
    snap.forEach(doc => {
      const invoice = doc.data();
      container.innerHTML += `
        <li class="invoice-item">
          <div class="invoice-info">
            <strong>Invoice #${invoice.invoiceNumber}</strong>
            <span class="date">${new Date(invoice.date?.toDate()).toLocaleDateString()}</span>
          </div>
          <div class="invoice-details">
            <span class="amount">$${invoice.amount?.toFixed(2) ?? '0.00'}</span>
            <button class="action-button" onclick="window.location.href='/pay-your-bill.html?invoice=${invoice.invoiceNumber}'">
              Pay Now
            </button>
          </div>
        </li>
      `;
    });
  } catch (error) {
    console.error('Error loading unpaid invoices:', error);
    container.innerHTML = '<li class="empty">Error loading invoices. Please try again later.</li>';
  }
}

export function initializeEventListeners() {
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

export function handleLogout() {
  signOut(auth)
    .then(() => {
      sessionStorage.removeItem('user');
      window.location.href = '/login.html';
    })
    .catch(error => {
      console.error('Error signing out:', error);
    });
}

export function updateDashboardUI(userData) {
  // Update dashboard UI with user data
  const customerName = document.getElementById('customerName');
  if (customerName) {
    customerName.textContent = userData.displayName || 'Customer';
  }
} 