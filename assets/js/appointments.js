import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACm0j7I8RX4ExIQRoejfk1HZMOQRGigBw",
    authDomain: "holiday-lawn-and-garden.firebaseapp.com",
    projectId: "holiday-lawn-and-garden",
    storageBucket: "holiday-lawn-and-garden.firebasestorage.app",
    messagingSenderId: "135322230444",
    appId: "1:135322230444:web:1a487b25a48aae07368909",
    measurementId: "G-KD6TBWR4ZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM elements
const appointmentsTable = document.getElementById('appointments-table');
const appointmentsTbody = document.getElementById('appointments-tbody');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const searchInput = document.getElementById('search-appointment');
const statusFilter = document.getElementById('status-filter');
const serviceFilter = document.getElementById('service-filter');
const sortBySelect = document.getElementById('sort-by');

// Stats elements
const totalAppointmentsEl = document.getElementById('total-appointments');
const pendingAppointmentsEl = document.getElementById('pending-appointments');
const completedAppointmentsEl = document.getElementById('completed-appointments');
const cancelledAppointmentsEl = document.getElementById('cancelled-appointments');

let appointments = [];
let filteredAppointments = [];

// Check authentication
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Check if user is admin by looking up their role in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
                loadAppointments();
                setupEventListeners();
            } else {
                window.location.href = 'admin-login.html';
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            window.location.href = 'admin-login.html';
        }
    } else {
        window.location.href = 'admin-login.html';
    }
});

// Load appointments from Firebase
async function loadAppointments() {
    try {
        loadingDiv.style.display = 'block';
        appointmentsTable.style.display = 'none';
        errorDiv.style.display = 'none';

        const appointmentsRef = collection(db, 'appointments');
        const q = query(appointmentsRef, orderBy('createdAt', 'desc'));
        
        onSnapshot(q, (snapshot) => {
            appointments = [];
            snapshot.forEach((doc) => {
                appointments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            updateStats();
            filterAppointments();
            loadingDiv.style.display = 'none';
            appointmentsTable.style.display = 'table';
        });

    } catch (error) {
        console.error('Error loading appointments:', error);
        showError('Failed to load appointments. Please try again.');
    }
}

// Update statistics
function updateStats() {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;

    totalAppointmentsEl.textContent = total;
    pendingAppointmentsEl.textContent = pending;
    completedAppointmentsEl.textContent = completed;
    cancelledAppointmentsEl.textContent = cancelled;
}

// Filter appointments based on search and filters
function filterAppointments() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;
    const serviceFilterValue = serviceFilter.value;
    const sortBy = sortBySelect.value;

    filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = !searchTerm || 
            appointment.customerName?.toLowerCase().includes(searchTerm) ||
            appointment.customerEmail?.toLowerCase().includes(searchTerm) ||
            appointment.serviceType?.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilterValue || appointment.status === statusFilterValue;
        const matchesService = !serviceFilterValue || appointment.serviceType === serviceFilterValue;

        return matchesSearch && matchesStatus && matchesService;
    });

    // Sort appointments
    filteredAppointments.sort((a, b) => {
        switch (sortBy) {
            case 'date':
                const dateA = a.appointmentDate?.toDate() || new Date(a.appointmentDate);
                const dateB = b.appointmentDate?.toDate() || new Date(b.appointmentDate);
                return dateA - dateB;
            case 'customer':
                return (a.customerName || '').localeCompare(b.customerName || '');
            case 'service':
                return (a.serviceType || '').localeCompare(b.serviceType || '');
            case 'status':
                return (a.status || '').localeCompare(b.status || '');
            default:
                return 0;
        }
    });

    renderAppointments();
}

// Render appointments in table
function renderAppointments() {
    appointmentsTbody.innerHTML = '';

    if (filteredAppointments.length === 0) {
        appointmentsTbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #666;">
                    No appointments found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }

    filteredAppointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div>
                    <strong>${appointment.customerName || 'N/A'}</strong>
                    <br>
                    <small style="color: #666;">${appointment.customerEmail || 'N/A'}</small>
                </div>
            </td>
            <td>
                <div>
                    <div>${appointment.serviceType || 'N/A'}</div>
                    <div style="color: #666;">${appointment.description || 'No description'}</div>
                </div>
            </td>
            <td>
                ${formatDate(appointment.appointmentDate)}
            </td>
            <td>
                ${appointment.duration || 'N/A'} minutes
            </td>
            <td>
                <span class="appointment-status status-${appointment.status || 'pending'}">
                    ${appointment.status || 'pending'}
                </span>
            </td>
            <td>
                ${appointment.staffAssigned || 'Unassigned'}
            </td>
            <td>
                ${formatDate(appointment.createdAt)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-small" onclick="viewAppointment('${appointment.id}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-primary btn-small" onclick="editAppointment('${appointment.id}')">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteAppointment('${appointment.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </td>
        `;
        appointmentsTbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterAppointments);
    statusFilter.addEventListener('change', filterAppointments);
    serviceFilter.addEventListener('change', filterAppointments);
    sortBySelect.addEventListener('change', filterAppointments);
}

// Format date for display
function formatDate(date) {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
}

// Export functions for global access
window.exportAppointments = function() {
    // Implementation for exporting appointments
    console.log('Export appointments functionality');
};

window.refreshAppointments = function() {
    loadAppointments();
};

window.viewAppointment = function(id) {
    // Implementation for viewing appointment details
    console.log('View appointment:', id);
};

window.editAppointment = function(id) {
    // Implementation for editing appointment
    console.log('Edit appointment:', id);
};

window.deleteAppointment = function(id) {
    // Implementation for deleting appointment
    console.log('Delete appointment:', id);
};
