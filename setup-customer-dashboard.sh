#!/bin/bash

# Create the modules directory if it doesn't exist
mkdir -p assets/js/modules

# Write the customer dashboard JavaScript code
cat > assets/js/modules/customer_dashboard.js << 'EOL'
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

// Check if user is admin
async function checkAdminAccess(user) {
  if (!user) return false;
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    return userDoc.exists() && userDoc.data().role === 'admin';
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

// Authentication state observer
onAuthStateChanged(auth, async (user) => {
  console.log('Auth state changed:', user ? 'User logged in' : 'No user');
  
  if (!user) {
    // Check if we have a stored session
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Attempt to restore the session
        signInWithEmailAndPassword(auth, userData.email, userData.password)
          .catch(() => {
            // If restoration fails, redirect to login
            sessionStorage.removeItem('user');
            window.location.href = 'login.html';
          });
      } catch (error) {
        sessionStorage.removeItem('user');
        window.location.href = 'login.html';
      }
    } else {
      window.location.href = 'login.html';
    }
    return;
  }

  // Check if user is admin
  const isAdmin = await checkAdminAccess(user);
  if (isAdmin) {
    // Redirect admin users to admin dashboard
    window.location.href = 'admin-dashboard.html';
    return;
  }

  // Store user session
  sessionStorage.setItem('user', JSON.stringify({
    email: user.email,
    uid: user.uid
  }));

  // Initialize dashboard for regular users
  initializeDashboard(user);
});

export async function initializeDashboard(user) {
  console.log('=== Firebase User Object ===');
  console.log('User:', user);
  console.log('User metadata:', user.metadata);
  console.log('User creation time:', user.metadata.creationTime);
  console.log('User last sign in:', user.metadata.lastSignInTime);
  console.log('User display name:', user.displayName);
  console.log('User email:', user.email);
  console.log('User UID:', user.uid);
  
  // Update UI with user info
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const customerName = document.getElementById('customerName');
  const userName = document.getElementById('userName');
  
  if (profileName) profileName.textContent = user.displayName || 'Customer';
  if (profileEmail) profileEmail.textContent = user.email || '';
  if (customerName) customerName.textContent = user.displayName || 'Customer';
  if (userName) userName.textContent = user.displayName || 'Customer';

  // Load user's data from Firestore
  try {
    console.log('=== Firestore Data ===');
    console.log('Fetching user document from Firestore for ID:', user.uid);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('Raw Firestore data:', userData);
      console.log('Firestore document metadata:', userDoc.metadata);
      
      // Add Firebase user creation time directly
      userData.memberSince = user.metadata.creationTime;
      console.log('Added memberSince:', userData.memberSince);
      
      // Log all available date fields
      console.log('=== Date Fields ===');
      console.log('memberSince:', userData.memberSince);
      console.log('createdAt:', userData.createdAt);
      console.log('joinDate:', userData.joinDate);
      console.log('registrationDate:', userData.registrationDate);
      console.log('signupDate:', userData.signupDate);
      console.log('creationTime:', userData.creationTime);
      console.log('timestamp:', userData.timestamp);
      
      // Load service history
      await loadServiceHistory(user.uid);
      
      updateDashboardUI(userData);
    } else {
      console.log('No user document found in Firestore');
      // Create user document if it doesn't exist
      await updateDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        memberSince: user.metadata.creationTime,
        role: 'customer'
      });
    }
    
    // Load unpaid invoices
    await loadUnpaidInvoices(user.uid);
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

async function loadServiceHistory(userId) {
  try {
    console.log('Loading service history for user:', userId);
    const servicesQuery = query(
      collection(db, 'services'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(1)
    );
    
    const servicesSnapshot = await getDocs(servicesQuery);
    const lastService = servicesSnapshot.docs[0];
    
    if (lastService) {
      const serviceData = lastService.data();
      console.log('Last service data:', serviceData);
      
      const profileLastService = document.getElementById('profileLastService');
      if (profileLastService) {
        const serviceDate = serviceData.date?.toDate();
        profileLastService.textContent = serviceDate ? serviceDate.toLocaleDateString() : 'Not available';
      }
    } else {
      console.log('No service history found');
      const profileLastService = document.getElementById('profileLastService');
      if (profileLastService) {
        profileLastService.textContent = 'No services yet';
      }
    }
  } catch (error) {
    console.error('Error loading service history:', error);
    const profileLastService = document.getElementById('profileLastService');
    if (profileLastService) {
      profileLastService.textContent = 'Error loading service history';
    }
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
      e.stopPropagation();
      window.location.href = 'profile.html';
    });
  }

  const quickEditProfileBtn = document.getElementById('quickEditProfileBtn');
  if (quickEditProfileBtn) {
    quickEditProfileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
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
  console.log('=== Updating Dashboard UI ===');
  console.log('User data:', userData);
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
  const userName = document.getElementById('userName');

  if (profileName) profileName.textContent = userData.displayName || userData.name || 'Customer';
  if (profileEmail) profileEmail.textContent = userData.email || '';
  if (profilePhone) profilePhone.textContent = userData.phone || 'Not provided';
  if (userName) userName.textContent = userData.displayName || userData.name || 'Customer';
  
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
  
  // Handle join date display
  if (profileJoinDate) {
    const joinDate = userData.memberSince || userData.createdAt || userData.joinDate || userData.registrationDate;
    if (joinDate) {
      const date = joinDate.toDate ? joinDate.toDate() : new Date(joinDate);
      profileJoinDate.textContent = date.toLocaleDateString();
    } else {
      profileJoinDate.textContent = 'Not available';
    }
  }
  
  if (customerName) customerName.textContent = userData.displayName || userData.name || 'Customer';
}
EOL

# Make the script executable
chmod +x setup-customer-dashboard.sh 