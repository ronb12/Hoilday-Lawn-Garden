// JavaScript file for payments functionality

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
const paymentsTable = document.getElementById('payments-table');
const paymentsTbody = document.getElementById('payments-tbody');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const searchInput = document.getElementById('search-payment');
const statusFilter = document.getElementById('status-filter');
const methodFilter = document.getElementById('method-filter');
const sortBySelect = document.getElementById('sort-by');

// Stats elements
const totalPaymentsEl = document.getElementById('total-payments');
const pendingPaymentsEl = document.getElementById('pending-payments');
const failedPaymentsEl = document.getElementById('failed-payments');
const refundedPaymentsEl = document.getElementById('refunded-payments');

let payments = [];
let filteredPayments = [];

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Check if user is admin
        if (user.email && user.email.includes('admin')) {
            loadPayments();
            setupEventListeners();
        } else {
            window.location.href = 'admin-login.html';
        }
    } else {
        window.location.href = 'admin-login.html';
    }
});

// Load payments from Firebase
async function loadPayments() {
    try {
        loadingDiv.style.display = 'block';
        paymentsTable.style.display = 'none';
        errorDiv.style.display = 'none';

        const paymentsRef = collection(db, 'payments');
        const q = query(paymentsRef, orderBy('createdAt', 'desc'));
        
        onSnapshot(q, (snapshot) => {
            payments = [];
            snapshot.forEach((doc) => {
                payments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            updateStats();
            filterPayments();
            loadingDiv.style.display = 'none';
            paymentsTable.style.display = 'table';
        });

    } catch (error) {
        console.error('Error loading payments:', error);
        showError('Failed to load payments. Please try again.');
    }
}

// Update statistics
function updateStats() {
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
    const failed = payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + (p.amount || 0), 0);
    const refunded = payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.amount || 0), 0);

    totalPaymentsEl.textContent = `$${total.toFixed(2)}`;
    pendingPaymentsEl.textContent = `$${pending.toFixed(2)}`;
    failedPaymentsEl.textContent = `$${failed.toFixed(2)}`;
    refundedPaymentsEl.textContent = `$${refunded.toFixed(2)}`;
}

// Filter payments based on search and filters
function filterPayments() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;
    const methodFilterValue = methodFilter.value;
    const sortBy = sortBySelect.value;

    filteredPayments = payments.filter(payment => {
        const matchesSearch = !searchTerm || 
            payment.customerName?.toLowerCase().includes(searchTerm) ||
            payment.customerEmail?.toLowerCase().includes(searchTerm) ||
            payment.paymentId?.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilterValue || payment.status === statusFilterValue;
        const matchesMethod = !methodFilterValue || payment.method === methodFilterValue;

        return matchesSearch && matchesStatus && matchesMethod;
    });

    // Sort payments
    filteredPayments.sort((a, b) => {
        switch (sortBy) {
            case 'date':
                const dateA = a.createdAt?.toDate() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate() || new Date(b.createdAt);
                return dateB - dateA;
            case 'amount':
                return (b.amount || 0) - (a.amount || 0);
            case 'customer':
                return (a.customerName || '').localeCompare(b.customerName || '');
            default:
                return 0;
        }
    });

    renderPayments();
}

// Render payments in table
function renderPayments() {
    paymentsTbody.innerHTML = '';

    if (filteredPayments.length === 0) {
        paymentsTbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
                    No payments found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }

    filteredPayments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div>
                    <strong>${payment.paymentId || payment.id}</strong>
                </div>
            </td>
            <td>
                <div>
                    <div>${payment.customerName || 'N/A'}</div>
                    <div style="color: #666;">${payment.customerEmail || 'N/A'}</div>
                </div>
            </td>
            <td>
                <strong>$${(payment.amount || 0).toFixed(2)}</strong>
            </td>
            <td>
                <span style="text-transform: capitalize;">${payment.method || 'N/A'}</span>
            </td>
            <td>
                <span class="payment-status status-${payment.status || 'pending'}">
                    ${payment.status || 'pending'}
                </span>
            </td>
            <td>
                ${formatDate(payment.createdAt)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-small" onclick="viewPayment('${payment.id}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-primary btn-small" onclick="editPayment('${payment.id}')">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deletePayment('${payment.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </td>
        `;
        paymentsTbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterPayments);
    statusFilter.addEventListener('change', filterPayments);
    methodFilter.addEventListener('change', filterPayments);
    sortBySelect.addEventListener('change', filterPayments);
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
window.viewPayment = function(paymentId) {
    // Implement payment view functionality
    alert(`View payment ${paymentId}`);
};

window.editPayment = function(paymentId) {
    // Navigate to edit payment page
    window.location.href = `add-payment.html?id=${paymentId}`;
};

window.deletePayment = async function(paymentId) {
    if (confirm('Are you sure you want to delete this payment?')) {
        try {
            await deleteDoc(doc(db, 'payments', paymentId));
            // Payment will be removed from the list automatically via onSnapshot
        } catch (error) {
            console.error('Error deleting payment:', error);
            showError('Failed to delete payment. Please try again.');
        }
    }
};

window.exportPayments = function() {
    // Implement export functionality
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Payment ID,Customer,Amount,Method,Status,Date\n" +
        filteredPayments.map(p => 
            `"${p.paymentId || p.id}","${p.customerName || ''}","${p.amount || 0}","${p.method || ''}","${p.status || ''}","${formatDate(p.createdAt)}"`
        ).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.refreshPayments = function() {
    loadPayments();
};

window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
};
