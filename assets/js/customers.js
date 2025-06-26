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
const customersTable = document.getElementById('customers-table');
const customersTbody = document.getElementById('customers-tbody');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const searchInput = document.getElementById('search-customer');
const statusFilter = document.getElementById('status-filter');
const serviceFilter = document.getElementById('service-filter');
const sortBySelect = document.getElementById('sort-by');

// Stats elements
const totalCustomersEl = document.getElementById('total-customers');
const activeCustomersEl = document.getElementById('active-customers');
const newCustomersEl = document.getElementById('new-customers');
const avgRatingEl = document.getElementById('avg-rating');

let customers = [];
let filteredCustomers = [];

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Check if user is admin
        if (user.email && user.email.includes('admin')) {
            loadCustomers();
            setupEventListeners();
        } else {
            window.location.href = 'admin-login.html';
        }
    } else {
        window.location.href = 'admin-login.html';
    }
});

// Load customers from Firebase
async function loadCustomers() {
    try {
        loadingDiv.style.display = 'block';
        customersTable.style.display = 'none';
        errorDiv.style.display = 'none';

        const customersRef = collection(db, 'customers');
        const q = query(customersRef, orderBy('createdAt', 'desc'));
        
        onSnapshot(q, (snapshot) => {
            customers = [];
            snapshot.forEach((doc) => {
                customers.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            updateStats();
            filterCustomers();
            loadingDiv.style.display = 'none';
            customersTable.style.display = 'table';
        });

    } catch (error) {
        console.error('Error loading customers:', error);
        showError('Failed to load customers. Please try again.');
    }
}

// Update statistics
function updateStats() {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    const newThisMonth = customers.filter(c => {
        const createdAt = c.createdAt?.toDate() || new Date(c.createdAt);
        return createdAt > thisMonth;
    }).length;
    
    const avgRating = customers.length > 0 
        ? (customers.reduce((sum, c) => sum + (c.rating || 0), 0) / customers.length).toFixed(1)
        : '0.0';

    totalCustomersEl.textContent = total;
    activeCustomersEl.textContent = active;
    newCustomersEl.textContent = newThisMonth;
    avgRatingEl.textContent = avgRating;
}

// Filter customers based on search and filters
function filterCustomers() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;
    const serviceFilterValue = serviceFilter.value;
    const sortBy = sortBySelect.value;

    filteredCustomers = customers.filter(customer => {
        const matchesSearch = !searchTerm || 
            customer.name?.toLowerCase().includes(searchTerm) ||
            customer.email?.toLowerCase().includes(searchTerm) ||
            customer.phone?.includes(searchTerm);
        
        const matchesStatus = !statusFilterValue || customer.status === statusFilterValue;
        const matchesService = !serviceFilterValue || 
            customer.services?.some(service => service.type === serviceFilterValue);

        return matchesSearch && matchesStatus && matchesService;
    });

    // Sort customers
    filteredCustomers.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            case 'date-added':
                const dateA = a.createdAt?.toDate() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate() || new Date(b.createdAt);
                return dateB - dateA;
            case 'last-service':
                const lastServiceA = a.lastService?.toDate() || new Date(a.lastService);
                const lastServiceB = b.lastService?.toDate() || new Date(b.lastService);
                return lastServiceB - lastServiceA;
            case 'total-spent':
                return (b.totalSpent || 0) - (a.totalSpent || 0);
            default:
                return 0;
        }
    });

    renderCustomers();
}

// Render customers in table
function renderCustomers() {
    customersTbody.innerHTML = '';

    if (filteredCustomers.length === 0) {
        customersTbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #666;">
                    No customers found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }

    filteredCustomers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div>
                    <strong>${customer.name || 'N/A'}</strong>
                    <br>
                    <small style="color: #666;">ID: ${customer.id}</small>
                </div>
            </td>
            <td>
                <div>
                    <div>${customer.email || 'N/A'}</div>
                    <div style="color: #666;">${customer.phone || 'N/A'}</div>
                </div>
            </td>
            <td>
                <div>
                    <div>${customer.address?.street || 'N/A'}</div>
                    <div style="color: #666;">
                        ${customer.address?.city || ''}, ${customer.address?.state || ''} ${customer.address?.zip || ''}
                    </div>
                </div>
            </td>
            <td>
                <div>
                    ${customer.services?.map(service => 
                        `<span style="background: #e3f2fd; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin: 0.1rem;">${service.type}</span>`
                    ).join(' ') || 'No services'}
                </div>
            </td>
            <td>
                <span class="customer-status status-${customer.status || 'inactive'}">
                    ${customer.status || 'inactive'}
                </span>
            </td>
            <td>
                <div>
                    <div>${customer.lastService ? formatDate(customer.lastService) : 'No services'}</div>
                    <div style="color: #666;">${customer.totalSpent ? `$${customer.totalSpent.toFixed(2)}` : '$0.00'}</div>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-small" onclick="viewCustomer('${customer.id}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-primary btn-small" onclick="editCustomer('${customer.id}')">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteCustomer('${customer.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </td>
        `;
        customersTbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterCustomers);
    statusFilter.addEventListener('change', filterCustomers);
    serviceFilter.addEventListener('change', filterCustomers);
    sortBySelect.addEventListener('change', filterCustomers);
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

// Global functions for buttons
window.viewCustomer = function(customerId) {
    // Implement customer view functionality
    alert(`View customer ${customerId}`);
};

window.editCustomer = function(customerId) {
    // Navigate to edit customer page
    window.location.href = `add-customer.html?id=${customerId}`;
};

window.deleteCustomer = async function(customerId) {
    if (confirm('Are you sure you want to delete this customer?')) {
        try {
            await deleteDoc(doc(db, 'customers', customerId));
            // Customer will be removed from the list automatically via onSnapshot
        } catch (error) {
            console.error('Error deleting customer:', error);
            showError('Failed to delete customer. Please try again.');
        }
    }
};

window.exportCustomers = function() {
    // Implement export functionality
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Name,Email,Phone,Address,Status,Last Service,Total Spent\n" +
        filteredCustomers.map(c => 
            `"${c.name || ''}","${c.email || ''}","${c.phone || ''}","${c.address?.street || ''}","${c.status || ''}","${formatDate(c.lastService)}","${c.totalSpent || 0}"`
        ).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.refreshCustomers = function() {
    loadCustomers();
};

window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}; 