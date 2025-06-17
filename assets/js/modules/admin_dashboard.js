// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Import Firebase configuration
import { firebaseConfig } from "../firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const dashboardStats = document.getElementById("dashboardStats");
const recentAppointments = document.getElementById("recentAppointments");
const loadingOverlay = document.getElementById("loading-overlay");
const loadingMessage = document.getElementById("loading-message");

// PayPal Configuration
const PAYPAL_CLIENT_ID = "YOUR_PAYPAL_CLIENT_ID"; // Replace with your PayPal client ID

// Initialize dashboard
async function initializeDashboard() {
    try {
        showLoading("Loading dashboard data...");
        
        // Load dashboard stats
        await loadDashboardStats();
        
        // Load recent appointments
        await loadRecentAppointments();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize PayPal
        initializePayPal();
    } catch (error) {
        handleError(error, "Error initializing dashboard");
    } finally {
        hideLoading();
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Get total customers
        const customersQuery = query(
            collection(db, "users"),
            where("role", "==", "customer")
        );
        const customersSnapshot = await getDocs(customersQuery);
        const totalCustomers = customersSnapshot.size;
        
        // Get total appointments
        const appointmentsQuery = query(
            collection(db, "appointments")
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const totalAppointments = appointmentsSnapshot.size;
        
        // Get total revenue
        const paymentsQuery = query(
            collection(db, "payments"),
            where("status", "==", "completed")
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const totalRevenue = paymentsSnapshot.docs.reduce((sum, doc) => {
            const payment = doc.data();
            return sum + (payment.amount || 0);
        }, 0);
        
        // Get pending payments
        const pendingPaymentsQuery = query(
            collection(db, "payments"),
            where("status", "==", "pending")
        );
        const pendingPaymentsSnapshot = await getDocs(pendingPaymentsQuery);
        const pendingPayments = pendingPaymentsSnapshot.size;
        
        // Update dashboard stats
        const statsHTML = `
            <div class="stat-card">
                <h3>Total Customers</h3>
                <p>${totalCustomers}</p>
            </div>
            <div class="stat-card">
                <h3>Total Appointments</h3>
                <p>${totalAppointments}</p>
            </div>
            <div class="stat-card">
                <h3>Total Revenue</h3>
                <p>$${totalRevenue.toFixed(2)}</p>
            </div>
            <div class="stat-card">
                <h3>Pending Payments</h3>
                <p>${pendingPayments}</p>
            </div>
        `;
        
        dashboardStats.innerHTML = statsHTML;
    } catch (error) {
        handleError(error, "Error loading dashboard stats");
    }
}

// Load recent appointments
async function loadRecentAppointments() {
    try {
        const appointmentsQuery = query(
            collection(db, "appointments"),
            orderBy("date", "desc"),
            limit(5)
        );
        
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointments = appointmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Get customer details for each appointment
        const appointmentsWithCustomers = await Promise.all(
            appointments.map(async (appointment) => {
                const customerDoc = await getDoc(doc(db, "users", appointment.userId));
                return {
                    ...appointment,
                    customerName: customerDoc.data()?.displayName || "Unknown Customer"
                };
            })
        );
        
        // Update appointments display
        const appointmentsHTML = appointmentsWithCustomers.map(appointment => `
            <div class="appointment-card">
                <h4>${appointment.customerName}</h4>
                <p><strong>Service:</strong> ${formatServiceType(appointment.serviceType)}</p>
                <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
                <p><strong>Status:</strong> <span class="status ${appointment.status}">${formatStatus(appointment.status)}</span></p>
            </div>
        `).join("");
        
        recentAppointments.innerHTML = appointmentsHTML || "<p>No recent appointments</p>";
    } catch (error) {
        handleError(error, "Error loading recent appointments");
    }
}

// Set up event listeners
function setupEventListeners() {
    // Refresh button
    document.getElementById("refreshDashboard").addEventListener("click", () => {
        initializeDashboard();
    });
    
    // Logout button
    document.getElementById("logoutButton").addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "login.html";
        } catch (error) {
            handleError(error, "Error signing out");
        }
    });
    
    // Customer management buttons
    document.getElementById("viewAllCustomers").addEventListener("click", viewAllCustomers);
    document.getElementById("addNewCustomer").addEventListener("click", addNewCustomer);
    
    // Payment management buttons
    document.getElementById("viewAllPayments").addEventListener("click", viewAllPayments);
    document.getElementById("processPayment").addEventListener("click", processNewPayment);
}

// Format service type
function formatServiceType(serviceType) {
    return serviceType
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

// Format time
function formatTime(time) {
    if (!time) return "N/A";
    return time;
}

// Format status
function formatStatus(status) {
    return status
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Show loading overlay
function showLoading(message = "Loading...") {
    loadingMessage.textContent = message;
    loadingOverlay.style.display = "flex";
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.style.display = "none";
}

// Show error notification
function handleError(error, message) {
    console.error(message, error);
    alert(`${message}: ${error.message}`);
}

// Initialize PayPal
function initializePayPal() {
    paypal.Buttons({
        // Set up the transaction
        createOrder: async function(data, actions) {
            try {
                const paymentData = {
                    amount: document.getElementById("paymentAmount").value,
                    currency: "USD",
                    description: document.getElementById("paymentDescription").value
                };

                // Create order in your backend
                const response = await fetch("/api/create-paypal-order", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
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
                const response = await fetch("/api/capture-paypal-payment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
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
                    status: "completed",
                    paymentMethod: "paypal",
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
    }).render("#paypal-button-container");
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
        const customerSelect = modal.querySelector("#customerSelect");
        
        customersSnapshot.forEach(doc => {
            const customer = doc.data();
            const option = document.createElement("option");
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
            userId: document.getElementById("customerSelect").value,
            date: serverTimestamp(),
            customerName: document.getElementById("customerSelect").selectedOptions[0].textContent
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
                        <p><strong>Customer:</strong> ${payment.customerName || "Unknown"}</p>
                        <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
                        <p><strong>Transaction ID:</strong> ${payment.transactionId || "N/A"}</p>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
    
    showModal(content);
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initializeDashboard();
    
    // Load PayPal SDK
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    script.onload = () => {
        console.log("PayPal SDK loaded");
    };
    document.body.appendChild(script);
});