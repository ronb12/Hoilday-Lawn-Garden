import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACm0j7I8RX4ExIQRoejfk1HZMOQRGigBw",
    authDomain: "holiday-lawn-and-garden.firebaseapp.com",
    projectId: "holiday-lawn-and-garden",
    storageBucket: "holiday-lawn-and-garden.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM elements
const staffTable = document.getElementById('staff-table');
const staffTbody = document.getElementById('staff-tbody');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const searchInput = document.getElementById('search-staff');
const roleFilter = document.getElementById('role-filter');
const statusFilter = document.getElementById('status-filter');
const sortBySelect = document.getElementById('sort-by');

// Stats elements
const totalStaffEl = document.getElementById('total-staff');
const activeStaffEl = document.getElementById('active-staff');
const managersEl = document.getElementById('managers');
const avgRatingEl = document.getElementById('avg-rating');

let staff = [];
let filteredStaff = [];

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.email && user.email.includes('admin')) {
            loadStaff();
            setupEventListeners();
        } else {
            window.location.href = 'admin-login.html';
        }
    } else {
        window.location.href = 'admin-login.html';
    }
});

// Load staff from Firebase
async function loadStaff() {
    try {
        loadingDiv.style.display = 'block';
        staffTable.style.display = 'none';
        errorDiv.style.display = 'none';

        const staffRef = collection(db, 'staff');
        const q = query(staffRef, orderBy('createdAt', 'desc'));
        
        onSnapshot(q, (snapshot) => {
            staff = [];
            snapshot.forEach((doc) => {
                staff.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            updateStats();
            filterStaff();
            loadingDiv.style.display = 'none';
            staffTable.style.display = 'table';
        });

    } catch (error) {
        console.error('Error loading staff:', error);
        showError('Failed to load staff. Please try again.');
    }
}

// Update statistics
function updateStats() {
    const total = staff.length;
    const active = staff.filter(s => s.status === 'active').length;
    const managers = staff.filter(s => s.role === 'manager').length;
    const avgRating = staff.length > 0 
        ? (staff.reduce((sum, s) => sum + (s.rating || 0), 0) / staff.length).toFixed(1)
        : '0.0';

    totalStaffEl.textContent = total;
    activeStaffEl.textContent = active;
    managersEl.textContent = managers;
    avgRatingEl.textContent = avgRating;
}

// Filter staff
function filterStaff() {
    const searchTerm = searchInput.value.toLowerCase();
    const roleFilterValue = roleFilter.value;
    const statusFilterValue = statusFilter.value;
    const sortBy = sortBySelect.value;

    filteredStaff = staff.filter(member => {
        const matchesSearch = !searchTerm || 
            member.name?.toLowerCase().includes(searchTerm) ||
            member.email?.toLowerCase().includes(searchTerm) ||
            member.phone?.includes(searchTerm);
        
        const matchesRole = !roleFilterValue || member.role === roleFilterValue;
        const matchesStatus = !statusFilterValue || member.status === statusFilterValue;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort staff
    filteredStaff.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            case 'role':
                return (a.role || '').localeCompare(b.role || '');
            case 'hire-date':
                const dateA = a.hireDate?.toDate() || new Date(a.hireDate);
                const dateB = b.hireDate?.toDate() || new Date(b.hireDate);
                return dateB - dateA;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return 0;
        }
    });

    renderStaff();
}

// Render staff in table
function renderStaff() {
    staffTbody.innerHTML = '';

    if (filteredStaff.length === 0) {
        staffTbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #666;">
                    No staff members found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }

    filteredStaff.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div>
                    <strong>${member.name || 'N/A'}</strong>
                    <br>
                    <small style="color: #666;">ID: ${member.id}</small>
                </div>
            </td>
            <td>
                <div>
                    <div>${member.email || 'N/A'}</div>
                    <div style="color: #666;">${member.phone || 'N/A'}</div>
                </div>
            </td>
            <td>
                <span style="text-transform: capitalize;">${member.role || 'N/A'}</span>
            </td>
            <td>
                <div>
                    ${member.skills?.map(skill => 
                        `<span style="background: #e3f2fd; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin: 0.1rem;">${skill}</span>`
                    ).join(' ') || 'No skills listed'}
                </div>
            </td>
            <td>
                <span class="staff-status status-${member.status || 'inactive'}">
                    ${member.status || 'inactive'}
                </span>
            </td>
            <td>
                <div style="display: flex; align-items: center;">
                    <span style="margin-right: 0.5rem;">${member.rating || 0}</span>
                    <div style="color: #FFD700;">
                        ${'★'.repeat(Math.floor(member.rating || 0))}${'☆'.repeat(5 - Math.floor(member.rating || 0))}
                    </div>
                </div>
            </td>
            <td>
                ${formatDate(member.hireDate)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-small" onclick="viewStaff('${member.id}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-primary btn-small" onclick="editStaff('${member.id}')">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteStaff('${member.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </td>
        `;
        staffTbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterStaff);
    roleFilter.addEventListener('change', filterStaff);
    statusFilter.addEventListener('change', filterStaff);
    sortBySelect.addEventListener('change', filterStaff);
}

// Utility functions
function formatDate(date) {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
}

// Global functions
window.viewStaff = function(staffId) {
    alert(`View staff member ${staffId}`);
};

window.editStaff = function(staffId) {
    window.location.href = `add-staff.html?id=${staffId}`;
};

window.deleteStaff = async function(staffId) {
    if (confirm('Are you sure you want to delete this staff member?')) {
        try {
            await deleteDoc(doc(db, 'staff', staffId));
        } catch (error) {
            console.error('Error deleting staff member:', error);
            showError('Failed to delete staff member. Please try again.');
        }
    }
};

window.exportStaff = function() {
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Name,Email,Phone,Role,Status,Rating,Hire Date\n" +
        filteredStaff.map(member => 
            `"${member.name || ''}","${member.email || ''}","${member.phone || ''}","${member.role || ''}","${member.status || ''}","${member.rating || 0}","${formatDate(member.hireDate)}"`
        ).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "staff.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.refreshStaff = function() {
    loadStaff();
};

window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
};
