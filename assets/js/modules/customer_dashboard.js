// Placeholder modules/customer_dashboard.js
console.log('modules/customer_dashboard.js loaded'); 

import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy, limit, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
    
    // Initialize appointment form
    initializeAppointmentForm();
    
    // Load appointments
    await loadAppointments();
  } catch (error) {
    console.error('Error loading user data:', error);
    showNotification('Error loading user data', 'error');
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

export async function loadUnpaidInvoices(userId) {
  try {
    console.log('Loading unpaid invoices for user:', userId);
    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('userId', '==', userId),
      where('status', '==', 'unpaid'),
      orderBy('dueDate', 'asc')
    );
    
    const invoicesSnapshot = await getDocs(invoicesQuery);
    const unpaidInvoicesContainer = document.getElementById('unpaidInvoices');
    
    if (unpaidInvoicesContainer) {
      if (invoicesSnapshot.empty) {
        unpaidInvoicesContainer.innerHTML = '<p>No unpaid invoices</p>';
      } else {
        unpaidInvoicesContainer.innerHTML = `
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${invoicesSnapshot.docs.map(doc => `
                <tr>
                  <td>${doc.data().invoiceNumber || 'N/A'}</td>
                  <td>$${doc.data().amount || '0.00'}</td>
                  <td>${doc.data().dueDate?.toDate().toLocaleDateString() || 'N/A'}</td>
                  <td>
                    <button class="btn-primary" onclick="payInvoice('${doc.id}')">Pay Now</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }
  } catch (error) {
    console.error('Error loading unpaid invoices:', error);
    const unpaidInvoicesContainer = document.getElementById('unpaidInvoices');
    if (unpaidInvoicesContainer) {
      unpaidInvoicesContainer.innerHTML = '<p>Error loading unpaid invoices</p>';
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
      showNotification('Error signing out', 'error');
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

// Initialize appointment form
function initializeAppointmentForm() {
    const appointmentForm = document.getElementById('appointmentForm');
    const preferredDateInput = document.getElementById('preferredDate');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    preferredDateInput.min = today;
    
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const serviceType = document.getElementById('serviceType').value;
            const preferredDate = document.getElementById('preferredDate').value;
            const preferredTime = document.getElementById('preferredTime').value;
            const serviceNotes = document.getElementById('serviceNotes').value;
            
            try {
                showLoading('Scheduling appointment...');
                
                // Create appointment in Firestore
                const appointmentData = {
                    customerId: auth.currentUser.uid,
                    serviceType,
                    preferredDate,
                    preferredTime,
                    serviceNotes,
                    status: 'pending',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };
                
                const appointmentRef = await addDoc(collection(db, 'appointments'), appointmentData);
                
                // Update UI
                showNotification('Appointment scheduled successfully!', 'success');
                appointmentForm.reset();
                
                // Refresh appointments list
                loadAppointments();
                
            } catch (error) {
                console.error('Error scheduling appointment:', error);
                showNotification('Failed to schedule appointment. Please try again.', 'error');
            } finally {
                hideLoading();
            }
        });
    }
}

// Load appointments
async function loadAppointments() {
    const appointmentsList = document.querySelector('.appointments-list');
    const noAppointments = document.querySelector('.no-appointments');
    
    if (!appointmentsList) return;
    
    try {
        showLoading('Loading appointments...');
        
        // Query appointments for current user
        const appointmentsQuery = query(
            collection(db, 'appointments'),
            where('customerId', '==', auth.currentUser.uid),
            where('status', 'in', ['pending', 'confirmed']),
            orderBy('preferredDate', 'asc')
        );
        
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        
        if (appointmentsSnapshot.empty) {
            appointmentsList.innerHTML = '';
            noAppointments.style.display = 'block';
            return;
        }
        
        noAppointments.style.display = 'none';
        appointmentsList.innerHTML = '';
        
        appointmentsSnapshot.forEach(doc => {
            const appointment = doc.data();
            const appointmentElement = createAppointmentElement(doc.id, appointment);
            appointmentsList.appendChild(appointmentElement);
        });
        
    } catch (error) {
        console.error('Error loading appointments:', error);
        showNotification('Failed to load appointments', 'error');
    } finally {
        hideLoading();
    }
}

// Create appointment element
function createAppointmentElement(id, appointment) {
    const div = document.createElement('div');
    div.className = 'appointment-item';
    div.innerHTML = `
        <div class="appointment-header">
            <h4>${formatServiceType(appointment.serviceType)}</h4>
            <span class="status-badge ${appointment.status}">${formatStatus(appointment.status)}</span>
        </div>
        <div class="appointment-details">
            <p><i class="fas fa-calendar"></i> ${formatDate(appointment.preferredDate)}</p>
            <p><i class="fas fa-clock"></i> ${formatTimeSlot(appointment.preferredTime)}</p>
            ${appointment.serviceNotes ? `<p><i class="fas fa-info-circle"></i> ${appointment.serviceNotes}</p>` : ''}
        </div>
        ${appointment.status === 'pending' ? `
            <div class="appointment-actions">
                <button class="action-btn cancel-btn" data-id="${id}">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        ` : ''}
    `;
    
    // Add cancel button handler
    const cancelBtn = div.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => cancelAppointment(id));
    }
    
    return div;
}

// Helper functions
function formatServiceType(type) {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTimeSlot(timeSlot) {
    const timeMap = {
        'morning': '8:00 AM - 12:00 PM',
        'afternoon': '12:00 PM - 4:00 PM',
        'evening': '4:00 PM - 6:00 PM'
    };
    return timeMap[timeSlot] || timeSlot;
}

// Cancel appointment
async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
        showLoading('Cancelling appointment...');
        
        await updateDoc(doc(db, 'appointments', appointmentId), {
            status: 'cancelled',
            updatedAt: serverTimestamp()
        });
        
        showNotification('Appointment cancelled successfully', 'success');
        loadAppointments();
        
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showNotification('Failed to cancel appointment', 'error');
    } finally {
        hideLoading();
    }
} 