// Placeholder modules/customer_dashboard.js
console.log('modules/customer_dashboard.js loaded'); 

import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy, limit, addDoc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { app, auth, db } from "../firebase-config.js";

// Notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
    <span>${message}</span>
    <button class="notification-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Add styles if not already present
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
      }
      .notification-error { background: #dc3545; }
      .notification-success { background: #28a745; }
      .notification-warning { background: #ffc107; color: #212529; }
      .notification-info { background: #17a2b8; }
      .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        font-size: 1rem;
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

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
    if (!userDoc.exists()) {
      console.log('No user document found for:', user.uid);
      return false;
    }
    
    const userData = userDoc.data();
    console.log('User data for admin check:', userData);
    console.log('isAdmin field:', userData.isAdmin);
    console.log('role field:', userData.role);
    
    // Check for both possible admin fields to handle different user creation scenarios
    const isAdmin = userData.isAdmin === true || userData.role === 'admin';
    console.log('Is user admin?', isAdmin);
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

// Improved session management
function handleSession(user) {
    try {
        if (user) {
            // Store minimal session data
            const sessionData = {
                email: user.email,
                uid: user.uid,
                lastActive: new Date().toISOString()
            };
            sessionStorage.setItem('user', JSON.stringify(sessionData));
        } else {
            sessionStorage.removeItem('user');
        }
    } catch (error) {
        console.error('Error handling session:', error);
        sessionStorage.removeItem('user');
    }
}

// Improved error handling for PayPal
function handlePayPalError(error) {
    console.warn('PayPal integration issue:', error);
    showNotification('Payment processing may be limited. Please contact support if you need assistance.', 'warning');
}

// Update authentication state observer
onAuthStateChanged(auth, async (user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'No user');
    
    if (!user) {
        handleSession(null);
        window.location.href = 'login.html';
        return;
    }

    // Check if user is admin
    const isAdmin = await checkAdminAccess(user);
    if (isAdmin) {
        window.location.href = 'admin-dashboard.html';
        return;
    }

    // Handle session
    handleSession(user);

    // Initialize dashboard
    try {
        await initializeDashboard(user);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showNotification('Error loading dashboard. Please try again.', 'error');
    }
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

// Improved service history loading
async function loadServiceHistory(userId) {
    try {
        console.log('Loading service history for user:', userId);
        const servicesQuery = query(
            collection(db, 'services'),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );
        
        const servicesSnapshot = await getDocs(servicesQuery);
        const serviceHistoryContainer = document.getElementById('serviceHistory');
        
        if (!serviceHistoryContainer) return;
        
        if (servicesSnapshot.empty) {
            serviceHistoryContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No service history found</p>
                </div>
            `;
            return;
        }
        
        serviceHistoryContainer.innerHTML = servicesSnapshot.docs.map(doc => {
            const service = doc.data();
            return `
                <div class="service-card">
                    <h4>${service.type}</h4>
                    <p><i class="fas fa-calendar"></i> Date: ${formatDate(service.date)}</p>
                    <p><i class="fas fa-dollar-sign"></i> Amount: $${service.amount.toFixed(2)}</p>
                    <p><i class="fas fa-info-circle"></i> Status: ${service.status}</p>
                    ${service.notes ? `<p><i class="fas fa-sticky-note"></i> Notes: ${service.notes}</p>` : ''}
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading service history:', error);
        const serviceHistoryContainer = document.getElementById('serviceHistory');
        if (serviceHistoryContainer) {
            serviceHistoryContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading service history. Please try again later.</p>
                </div>
            `;
        }
    }
}

// Improved unpaid invoices loading
async function loadUnpaidInvoices(userId) {
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
        
        if (!unpaidInvoicesContainer) return;
        
        if (invoicesSnapshot.empty) {
            unpaidInvoicesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-invoice"></i>
                    <p>No unpaid invoices</p>
                </div>
            `;
            return;
        }
        
        unpaidInvoicesContainer.innerHTML = invoicesSnapshot.docs.map(doc => {
            const invoice = doc.data();
            return `
                <div class="invoice-card">
                    <h4>Invoice #${doc.id.slice(-6)}</h4>
                    <p><i class="fas fa-calendar"></i> Due Date: ${formatDate(invoice.dueDate)}</p>
                    <p><i class="fas fa-dollar-sign"></i> Amount: $${invoice.amount.toFixed(2)}</p>
                    <div class="invoice-actions">
                        <button onclick="viewInvoice('${doc.id}')" class="btn btn-sm btn-info">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button onclick="payInvoice('${doc.id}')" class="btn btn-sm btn-success">
                            <i class="fas fa-credit-card"></i> Pay Now
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading unpaid invoices:', error);
        const unpaidInvoicesContainer = document.getElementById('unpaidInvoices');
        if (unpaidInvoicesContainer) {
            unpaidInvoicesContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading invoices. Please try again later.</p>
                </div>
            `;
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
    try {
        const appointmentsContainer = document.getElementById('appointmentsContainer');
        if (!appointmentsContainer) return;

        const appointmentsQuery = query(
            collection(db, 'appointments'),
            where('userId', '==', auth.currentUser.uid),
            orderBy('date', 'desc')
        );

        // Set up real-time listener for appointments
        onSnapshot(appointmentsQuery, (snapshot) => {
            const appointments = [];
            snapshot.forEach((doc) => {
                appointments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            if (appointments.length === 0) {
                appointmentsContainer.innerHTML = `
                    <div class="no-appointments">
                        <i class="fas fa-calendar-times"></i>
                        <p>No appointments found</p>
                    </div>
                `;
                return;
            }

            appointmentsContainer.innerHTML = appointments
                .map(appointment => createAppointmentElement(appointment.id, appointment))
                .join('');
        });

    } catch (error) {
        console.error('Error loading appointments:', error);
        showNotification('Error loading appointments', 'error');
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
    try {
        showLoading();
        const appointmentRef = doc(db, 'appointments', appointmentId);
        const appointmentDoc = await getDoc(appointmentRef);

        if (!appointmentDoc.exists()) {
            throw new Error('Appointment not found');
        }

        const appointmentData = appointmentDoc.data();
        if (appointmentData.userId !== auth.currentUser.uid) {
            throw new Error('Unauthorized to cancel this appointment');
        }

        // Update appointment status
        await updateDoc(appointmentRef, {
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
            cancelledBy: auth.currentUser.uid
        });

        // Create a notification for admin
        const notificationRef = doc(collection(db, 'notifications'));
        await setDoc(notificationRef, {
            type: 'appointment_cancelled',
            title: 'Appointment Cancelled',
            message: `Customer ${auth.currentUser.email} cancelled an appointment`,
            appointmentId: appointmentId,
            read: false,
            createdAt: new Date().toISOString()
        });

        showNotification('Appointment cancelled successfully', 'success');
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showNotification('Error cancelling appointment', 'error');
    } finally {
        hideLoading();
    }
} 