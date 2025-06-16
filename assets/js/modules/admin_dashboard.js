import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "../../firebase-config.js";
import { showLoading, hideLoading, showNotification, showModal, closeModal } from "./utils.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Initialize appointment management
function initializeAppointmentManagement() {
    const appointmentsList = document.querySelector('.appointments-list');
    if (!appointmentsList) return;

    // Load appointments
    loadAppointments();

    // Set up real-time updates
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsQuery = query(
        appointmentsRef,
        where('status', 'in', ['pending', 'confirmed']),
        orderBy('preferredDate', 'asc')
    );

    onSnapshot(appointmentsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
                updateAppointmentUI(change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                removeAppointmentUI(change.doc.id);
            }
        });
    });

    // Set up filter
    const filterSelect = document.getElementById('appointmentFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const status = e.target.value;
            filterAppointments(status);
        });
    }
}

// Filter appointments
function filterAppointments(status) {
    const appointments = document.querySelectorAll('.appointment-item');
    appointments.forEach(appointment => {
        if (status === 'all' || appointment.querySelector('.status-badge').classList.contains(status)) {
            appointment.style.display = 'block';
        } else {
            appointment.style.display = 'none';
        }
    });
}

// Load appointments
async function loadAppointments() {
    const appointmentsList = document.querySelector('.appointments-list');
    const noAppointments = document.querySelector('.no-appointments');
    
    if (!appointmentsList) return;
    
    try {
        showLoading('Loading appointments...');
        
        const appointmentsQuery = query(
            collection(db, 'appointments'),
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
    div.id = `appointment-${id}`;
    
    // Get customer details
    getCustomerDetails(appointment.customerId).then(customerData => {
        div.innerHTML = `
            <div class="appointment-header">
                <div class="customer-info">
                    <h4>${customerData.displayName || customerData.name || 'Customer'}</h4>
                    <p class="customer-email">${customerData.email}</p>
                </div>
                <span class="status-badge ${appointment.status}">${formatStatus(appointment.status)}</span>
            </div>
            <div class="appointment-details">
                <p><i class="fas fa-tools"></i> ${formatServiceType(appointment.serviceType)}</p>
                <p><i class="fas fa-calendar"></i> ${formatDate(appointment.preferredDate)}</p>
                <p><i class="fas fa-clock"></i> ${formatTimeSlot(appointment.preferredTime)}</p>
                ${appointment.serviceNotes ? `<p><i class="fas fa-info-circle"></i> ${appointment.serviceNotes}</p>` : ''}
            </div>
            <div class="appointment-actions">
                ${appointment.status === 'pending' ? `
                    <button class="action-btn confirm-btn" data-id="${id}">
                        <i class="fas fa-check"></i> Confirm
                    </button>
                    <button class="action-btn cancel-btn" data-id="${id}">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                ` : ''}
                <button class="action-btn view-btn" data-id="${id}">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        `;
        
        // Add event listeners
        const confirmBtn = div.querySelector('.confirm-btn');
        const cancelBtn = div.querySelector('.cancel-btn');
        const viewBtn = div.querySelector('.view-btn');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => confirmAppointment(id));
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => cancelAppointment(id));
        }
        if (viewBtn) {
            viewBtn.addEventListener('click', () => viewAppointmentDetails(id, appointment, customerData));
        }
    });
    
    return div;
}

// Get customer details
async function getCustomerDetails(customerId) {
    try {
        const customerDoc = await getDoc(doc(db, 'users', customerId));
        return customerDoc.data() || {};
    } catch (error) {
        console.error('Error getting customer details:', error);
        return {};
    }
}

// Update appointment UI
function updateAppointmentUI(id, appointment) {
    const existingElement = document.getElementById(`appointment-${id}`);
    if (existingElement) {
        const newElement = createAppointmentElement(id, appointment);
        existingElement.replaceWith(newElement);
    } else {
        const appointmentsList = document.querySelector('.appointments-list');
        const noAppointments = document.querySelector('.no-appointments');
        if (appointmentsList && noAppointments) {
            noAppointments.style.display = 'none';
            const appointmentElement = createAppointmentElement(id, appointment);
            appointmentsList.appendChild(appointmentElement);
        }
    }
}

// Remove appointment UI
function removeAppointmentUI(id) {
    const element = document.getElementById(`appointment-${id}`);
    if (element) {
        element.remove();
        
        // Check if list is empty
        const appointmentsList = document.querySelector('.appointments-list');
        const noAppointments = document.querySelector('.no-appointments');
        if (appointmentsList && noAppointments && appointmentsList.children.length === 0) {
            noAppointments.style.display = 'block';
        }
    }
}

// Confirm appointment
async function confirmAppointment(appointmentId) {
    if (!confirm('Are you sure you want to confirm this appointment?')) return;
    
    try {
        showLoading('Confirming appointment...');
        
        await updateDoc(doc(db, 'appointments', appointmentId), {
            status: 'confirmed',
            updatedAt: serverTimestamp()
        });
        
        showNotification('Appointment confirmed successfully', 'success');
        
    } catch (error) {
        console.error('Error confirming appointment:', error);
        showNotification('Failed to confirm appointment', 'error');
    } finally {
        hideLoading();
    }
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
        
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showNotification('Failed to cancel appointment', 'error');
    } finally {
        hideLoading();
    }
}

// View appointment details
function viewAppointmentDetails(id, appointment, customerData) {
    // Create modal content
    const modalContent = `
        <div class="appointment-details-modal">
            <h3>Appointment Details</h3>
            <div class="details-grid">
                <div class="detail-group">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> ${customerData.displayName || customerData.name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${customerData.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${customerData.phone || 'N/A'}</p>
                </div>
                <div class="detail-group">
                    <h4>Service Information</h4>
                    <p><strong>Service Type:</strong> ${formatServiceType(appointment.serviceType)}</p>
                    <p><strong>Date:</strong> ${formatDate(appointment.preferredDate)}</p>
                    <p><strong>Time:</strong> ${formatTimeSlot(appointment.preferredTime)}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${appointment.status}">${formatStatus(appointment.status)}</span></p>
                </div>
                ${appointment.serviceNotes ? `
                    <div class="detail-group">
                        <h4>Additional Notes</h4>
                        <p>${appointment.serviceNotes}</p>
                    </div>
                ` : ''}
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    
    // Show modal
    showModal(modalContent);
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

// Initialize dashboard
export async function initializeDashboard() {
    // Initialize appointment management
    initializeAppointmentManagement();
}

// Export functions for use in other modules
export {
    loadAppointments,
    confirmAppointment,
    cancelAppointment,
    viewAppointmentDetails
}; 