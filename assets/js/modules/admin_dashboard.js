// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    doc, 
    getDoc, 
    updateDoc, 
    addDoc, 
    setDoc, 
    serverTimestamp, 
    onSnapshot,
    limit 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Import Firebase configuration
import { firebaseConfig } from '../firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const dashboardStats = document.getElementById('dashboardStats');
const recentAppointments = document.getElementById('recentAppointments');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingMessage = document.getElementById('loading-message');

// PayPal Configuration
const PAYPAL_CLIENT_ID = 'YOUR_PAYPAL_CLIENT_ID'; // Replace with your PayPal client ID

// Initialize PayPal
function initializePayPal() {
    paypal.Buttons({
        // Set up the transaction
        createOrder: async function(data, actions) {
            try {
                const paymentData = {
                    amount: document.getElementById('paymentAmount').value,
                    currency: 'USD',
                    description: document.getElementById('paymentDescription').value
                };

                // Create order in your backend
                const response = await fetch('/api/create-paypal-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(paymentData)
                });

                const order = await response.json();
                return order.id;
            } catch (error) {
                handleError(error, "Error creating PayPal order");
            }
        },

        // Finalize the transaction
        onApprove: async function(data, actions) {
            try {
                showLoading("Processing payment...");

                // Capture the funds
                const response = await fetch('/api/capture-paypal-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        orderId: data.orderID
                    })
                });

                const captureData = await response.json();

                // Record the payment in Firestore
                await recordPayment({
                    orderId: data.orderID,
                    amount: captureData.amount,
                    status: 'completed',
                    paymentMethod: 'paypal',
                    transactionId: captureData.id
                });

                showNotification("Payment processed successfully");
                closePaymentModal();
                refreshDashboard();
            } catch (error) {
                handleError(error, "Error processing payment");
            } finally {
                hideLoading();
            }
        },

        // Handle errors
        onError: function(err) {
            handleError(err, "PayPal payment error");
        }
    }).render('#paypal-button-container');
}

// Process new payment
async function processNewPayment() {
    const content = `
        <h2>Process New Payment</h2>
        <form id="paymentForm" class="form">
            <div class="form-group">
                <label for="customerSelect">Customer</label>
                <select id="customerSelect" required>
                    <option value="">Select Customer</option>
                </select>
            </div>
            <div class="form-group">
                <label for="paymentAmount">Amount ($)</label>
                <input type="number" id="paymentAmount" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label for="paymentDescription">Description</label>
                <input type="text" id="paymentDescription" required>
            </div>
            <div id="paypal-button-container"></div>
        </form>
    `;

    const modal = showModal(content);
    
    // Load customers for dropdown
    try {
        const customersQuery = query(
            collection(db, "users"),
            where("role", "==", "customer")
        );
        const customersSnapshot = await getDocs(customersQuery);
        const customerSelect = modal.querySelector('#customerSelect');
        
        customersSnapshot.forEach(doc => {
            const customer = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = customer.displayName || customer.email;
            customerSelect.appendChild(option);
        });

        // Initialize PayPal buttons
        initializePayPal();
    } catch (error) {
        handleError(error, "Error loading customers");
    }
}

// Record payment in Firestore
async function recordPayment(paymentData) {
    try {
        const paymentRef = await addDoc(collection(db, "payments"), {
            ...paymentData,
            userId: document.getElementById('customerSelect').value,
            date: serverTimestamp(),
            customerName: document.getElementById('customerSelect').selectedOptions[0].textContent
        });

        return paymentRef.id;
    } catch (error) {
        handleError(error, "Error recording payment");
        throw error;
    }
}

// View all payments
async function viewAllPayments() {
    try {
        showLoading("Loading payments...");
        const paymentsQuery = query(
            collection(db, "payments"),
            orderBy("date", "desc")
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const payments = paymentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        showPaymentsModal(payments);
    } catch (error) {
        handleError(error, "Error loading payments");
    } finally {
        hideLoading();
    }
}

// Show payments modal
function showPaymentsModal(payments) {
    const content = `
        <h2>All Payments</h2>
        <div class="payments-list">
            ${payments.map(payment => `
                <div class="payment-card" data-id="${payment.id}">
                    <div class="payment-header">
                        <h3>Payment #${payment.id.slice(-6)}</h3>
                        <span class="status ${payment.status}">${formatStatus(payment.status)}</span>
                    </div>
                    <div class="payment-details">
                        <p><strong>Amount:</strong> $${payment.amount.toFixed(2)}</p>
                        <p><strong>Date:</strong> ${formatDate(payment.date)}</p>
                        <p><strong>Customer:</strong> ${payment.customerName || 'Unknown'}</p>
                        <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
                        <p><strong>Transaction ID:</strong> ${payment.transactionId || 'N/A'}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    showModal(content);
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    
    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    script.onload = () => {
        console.log('PayPal SDK loaded');
    };
    document.body.appendChild(script);
});