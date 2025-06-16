// Placeholder modules/customer_dashboard.js
console.log('modules/customer_dashboard.js loaded'); 

import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "../firebase-config.js";

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Handle PayPal script loading errors
window.addEventListener('error', (event) => {
  if (event.filename && event.filename.includes('paypal')) {
    console.warn('PayPal script loading issue:', event.message);
    // Continue with core functionality
  }
}, true);

export async function initializeDashboard(user) {
  console.log('Initializing dashboard for user:', user);
  console.log('User metadata:', user.metadata);
  console.log('User creation time:', user.metadata.creationTime);
  
  // Update UI with user info
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const customerName = document.getElementById('customerName');
  
  if (profileName) profileName.textContent = user.displayName || 'Customer';
  if (profileEmail) profileEmail.textContent = user.email || '';
  if (customerName) customerName.textContent = user.displayName || 'Customer';

  // Load user's data from Firestore
  try {
    console.log('Fetching user document from Firestore for ID:', user.uid);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Add Firebase user creation time directly
      userData.memberSince = user.metadata.creationTime;
      console.log('User data from Firestore:', userData);
      console.log('User document metadata:', userDoc.metadata);
      console.log('Firebase user creation time:', user.metadata.creationTime);
      updateDashboardUI(userData);
    } else {
      console.log('No user document found in Firestore');
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
      window.location.href = 'profile.html';
    });
  }

  const quickEditProfileBtn = document.getElementById('quickEditProfileBtn');
  if (quickEditProfileBtn) {
    quickEditProfileBtn.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
  }
}

export function handleLogout() {
  signOut(auth)
    .then(() => {
      sessionStorage.removeItem('user');
      window.location.href = 'login.html';
    })
    .catch(error => {
      console.error('Error signing out:', error);
    });
}

export function updateDashboardUI(userData) {
  console.log('Updating dashboard UI with user data:', userData);
  console.log('User data fields:', Object.keys(userData));
  console.log('Raw user data:', JSON.stringify(userData, null, 2));
  
  // Update user profile information
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profilePhone = document.getElementById('profilePhone');
  const profileAddress = document.getElementById('profileAddress');
  const profileJoinDate = document.getElementById('profileJoinDate');
  const profileLastService = document.getElementById('profileLastService');
  const customerName = document.getElementById('customerName');

  if (profileName) profileName.textContent = userData.displayName || userData.name || 'Customer';
  if (profileEmail) profileEmail.textContent = userData.email || '';
  if (profilePhone) profilePhone.textContent = userData.phone || 'Not provided';
  
  // Handle address display
  if (profileAddress) {
    if (userData.address) {
      profileAddress.textContent = userData.address;
    } else if (userData.street && userData.city && userData.state && userData.zipCode) {
      profileAddress.textContent = `${userData.street}, ${userData.city}, ${userData.state} ${userData.zipCode}`;
    } else {
      profileAddress.textContent = 'Not provided';
    }
  }
  
  if (customerName) customerName.textContent = userData.displayName || userData.name || 'Customer';
  
  // Format and display join date using Firebase account creation time
  if (profileJoinDate) {
    console.log('Join date data:', {
      memberSince: userData.memberSince,
      createdAt: userData.createdAt,
      joinDate: userData.joinDate,
      registrationDate: userData.registrationDate,
      signupDate: userData.signupDate,
      creationTime: userData.creationTime,
      timestamp: userData.timestamp
    });
    
    if (userData.memberSince) {
      const creationDate = new Date(userData.memberSince);
      console.log('Using memberSince date:', creationDate);
      profileJoinDate.textContent = creationDate.toLocaleDateString();
    } else if (userData.createdAt) {
      const joinDate = userData.createdAt.toDate();
      console.log('Using Firestore createdAt:', joinDate);
      profileJoinDate.textContent = joinDate.toLocaleDateString();
    } else if (userData.joinDate) {
      console.log('Using joinDate:', userData.joinDate);
      profileJoinDate.textContent = new Date(userData.joinDate).toLocaleDateString();
    } else if (userData.registrationDate) {
      console.log('Using registrationDate:', userData.registrationDate);
      profileJoinDate.textContent = new Date(userData.registrationDate).toLocaleDateString();
    } else if (userData.signupDate) {
      console.log('Using signupDate:', userData.signupDate);
      profileJoinDate.textContent = new Date(userData.signupDate).toLocaleDateString();
    } else if (userData.creationTime) {
      console.log('Using creationTime:', userData.creationTime);
      profileJoinDate.textContent = new Date(userData.creationTime).toLocaleDateString();
    } else if (userData.timestamp) {
      console.log('Using timestamp:', userData.timestamp);
      profileJoinDate.textContent = new Date(userData.timestamp).toLocaleDateString();
    } else {
      console.log('No date information available');
      profileJoinDate.textContent = 'Not available';
    }
  }
  
  // Get and display last service
  if (profileLastService) {
    console.log('Service history data:', {
      serviceHistory: userData.serviceHistory,
      lastService: userData.lastService,
      recentServices: userData.recentServices,
      services: userData.services,
      appointments: userData.appointments
    });
    
    if (userData.serviceHistory && userData.serviceHistory.length > 0) {
      const lastService = userData.serviceHistory[userData.serviceHistory.length - 1];
      profileLastService.textContent = `${lastService.type} (${new Date(lastService.date).toLocaleDateString()})`;
    } else if (userData.lastService) {
      profileLastService.textContent = `${userData.lastService.type} (${new Date(userData.lastService.date).toLocaleDateString()})`;
    } else if (userData.recentServices && userData.recentServices.length > 0) {
      const lastService = userData.recentServices[0];
      profileLastService.textContent = `${lastService.type} (${new Date(lastService.date).toLocaleDateString()})`;
    } else if (userData.services && userData.services.length > 0) {
      const lastService = userData.services[userData.services.length - 1];
      profileLastService.textContent = `${lastService.type} (${new Date(lastService.date).toLocaleDateString()})`;
    } else if (userData.appointments && userData.appointments.length > 0) {
      const lastAppointment = userData.appointments[userData.appointments.length - 1];
      profileLastService.textContent = `${lastAppointment.serviceType} (${new Date(lastAppointment.date).toLocaleDateString()})`;
    } else {
      profileLastService.textContent = 'Not available';
    }
  }

  // Update service history if available
  if (userData.serviceHistory) {
    const serviceHistoryList = document.getElementById('serviceHistoryList');
    if (serviceHistoryList) {
      serviceHistoryList.innerHTML = userData.serviceHistory
        .map(service => `
          <li class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">${service.type}</h6>
                <small class="text-muted">${new Date(service.date).toLocaleDateString()}</small>
              </div>
              <span class="badge bg-primary">${service.status}</span>
            </div>
          </li>
        `)
        .join('');
    }
  }
} 