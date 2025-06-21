// Admin Dashboard JavaScript

// Set global db and auth if not already set
if (!window.db) window.db = firebase.firestore();
if (!window.auth) window.auth = firebase.auth();

// Setup real-time listeners for dashboard updates
function setupRealtimeListeners() {
    try {
        console.log("Setting up real-time listeners...");
        // Listen for new appointments
        window.db.collection("appointments")
            .orderBy("date", "desc")
            .limit(5)
            .onSnapshot((snapshot) => {
                console.log("Appointments updated");
            }, (error) => {
                console.error("Error listening to appointments:", error);
            });

        // Listen for new customers
        window.db.collection("customers")
            .orderBy("createdAt", "desc")
            .limit(5)
            .onSnapshot((snapshot) => {
                console.log("Customers updated");
            }, (error) => {
                console.error("Error listening to customers:", error);
            });

        // Listen for new payments
        window.db.collection("payments")
            .orderBy("date", "desc")
            .limit(5)
            .onSnapshot((snapshot) => {
                console.log("Payments updated");
            }, (error) => {
                console.error("Error listening to payments:", error);
            });

        console.log("Real-time listeners set up successfully");
    } catch (error) {
        console.error("Error setting up real-time listeners:", error);
    }
}

// Initialize dashboard
async function initializeDashboard() {
    try {
        console.log("Initializing dashboard...");
        
        // Set up real-time listeners
        setupRealtimeListeners();

        // Set up event listeners
        setupEventListeners();

        console.log("Dashboard initialized successfully");
    } catch (error) {
        console.error("Error initializing dashboard:", error);
    }
}

// Setup event listeners for all buttons
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Global function assignments for onclick handlers
    window.viewAppointments = () => {
        window.location.href = 'appointments.html';
    };

    window.viewCustomers = () => {
        window.location.href = 'customers.html';
    };

    window.viewPayments = () => {
        window.location.href = 'payments.html';
    };

    window.viewAnalytics = () => {
        window.location.href = 'analytics.html';
    };

    window.viewInventory = () => {
        window.location.href = 'inventory.html';
    };

    window.viewStaff = () => {
        window.location.href = 'staff.html';
    };

    window.viewMessages = () => {
        window.location.href = 'messages.html';
    };

    // Mobile navigation
    const mobileAppointmentsBtn = document.getElementById("mobileAppointmentsBtn");
    const mobileCustomersBtn = document.getElementById("mobileCustomersBtn");
    const mobilePaymentsBtn = document.getElementById("mobilePaymentsBtn");
    const mobileAnalyticsBtn = document.getElementById("mobileAnalyticsBtn");
    const mobileInventoryBtn = document.getElementById("mobileInventoryBtn");
    const mobileStaffBtn = document.getElementById("mobileStaffBtn");
    const mobileMessagesBtn = document.getElementById("mobileMessagesBtn");

    if (mobileAppointmentsBtn) {
        mobileAppointmentsBtn.addEventListener("click", window.viewAppointments);
    }

    if (mobileCustomersBtn) {
        mobileCustomersBtn.addEventListener("click", window.viewCustomers);
    }

    if (mobilePaymentsBtn) {
        mobilePaymentsBtn.addEventListener("click", window.viewPayments);
    }

    if (mobileAnalyticsBtn) {
        mobileAnalyticsBtn.addEventListener("click", window.viewAnalytics);
    }

    if (mobileInventoryBtn) {
        mobileInventoryBtn.addEventListener("click", window.viewInventory);
    }

    if (mobileStaffBtn) {
        mobileStaffBtn.addEventListener("click", window.viewStaff);
    }

    if (mobileMessagesBtn) {
        mobileMessagesBtn.addEventListener("click", window.viewMessages);
    }

    console.log("Event listeners set up successfully");
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard DOM loaded, initializing...');
    initializeDashboard();
});

// Export functions to global scope
window.initializeDashboard = initializeDashboard;
window.setupRealtimeListeners = setupRealtimeListeners;
window.setupEventListeners = setupEventListeners;
