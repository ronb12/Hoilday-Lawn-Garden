// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Import utility functions
import { showLoading, hideLoading, showNotification, showModal, closeModal } from "../utils.js";

// Import feature modules
import { viewAnalytics } from "./analytics.js";
import { manageInventory } from "./inventory.js";
import { viewStaff, addStaff } from "./staff.js";
import { viewMessages, sendBulkMessage } from "./communication.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const refreshDashboardBtn = document.getElementById("refreshDashboardBtn");
const logoutButton = document.getElementById("logoutButton");
const dashboardStats = document.getElementById("dashboardStats");
const recentAppointments = document.getElementById("recentAppointments");
const viewAllAppointmentsBtn = document.getElementById("viewAllAppointmentsBtn");
const addNewAppointmentBtn = document.getElementById("addNewAppointmentBtn");
const viewAllCustomersBtn = document.getElementById("viewAllCustomersBtn");
const addNewCustomerBtn = document.getElementById("addNewCustomerBtn");
const viewAllPaymentsBtn = document.getElementById("viewAllPaymentsBtn");
const processPaymentBtn = document.getElementById("processPaymentBtn");
const viewAnalyticsBtn = document.getElementById("viewAnalyticsBtn");
const generateReportBtn = document.getElementById("generateReportBtn");
const manageInventoryBtn = document.getElementById("manageInventoryBtn");
const scheduleMaintenanceBtn = document.getElementById("scheduleMaintenanceBtn");
const viewStaffBtn = document.getElementById("viewStaffBtn");
const addStaffBtn = document.getElementById("addStaffBtn");
const viewMessagesBtn = document.getElementById("viewMessagesBtn");
const sendBulkMessageBtn = document.getElementById("sendBulkMessageBtn");

// Mobile navigation buttons
const mobileAppointmentsBtn = document.getElementById("mobileAppointmentsBtn");
const mobileCustomersBtn = document.getElementById("mobileCustomersBtn");
const mobilePaymentsBtn = document.getElementById("mobilePaymentsBtn");
const mobileAnalyticsBtn = document.getElementById("mobileAnalyticsBtn");
const mobileInventoryBtn = document.getElementById("mobileInventoryBtn");
const mobileStaffBtn = document.getElementById("mobileStaffBtn");
const mobileMessagesBtn = document.getElementById("mobileMessagesBtn");

// Initialize dashboard
async function initializeDashboard() {
    try {
        showLoading("Loading dashboard data...");
        
        // Set up real-time listeners
        setupRealtimeListeners();

        // Load dashboard data
        await Promise.all([
            loadDashboardStats(),
            loadRecentAppointments(),
            loadRecentCustomers(),
            loadRecentPayments()
        ]);

        // Set up event listeners
        setupEventListeners();

        hideLoading();
    } catch (error) {
        console.error("Error initializing dashboard:", error);
        showNotification("Error loading dashboard data", "error");
        hideLoading();
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const [customersSnapshot, appointmentsSnapshot, paymentsSnapshot] = await Promise.all([
            getDocs(collection(db, "customers")),
            getDocs(collection(db, "appointments")),
            getDocs(collection(db, "payments"))
        ]);

        const totalCustomers = customersSnapshot.size;
        const totalAppointments = appointmentsSnapshot.size;
        const totalRevenue = paymentsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
        const pendingPayments = paymentsSnapshot.docs.filter(doc => doc.data().status === "pending").length;

        dashboardStats.innerHTML = `
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
    } catch (error) {
        console.error("Error loading dashboard stats:", error);
        showNotification("Error loading statistics", "error");
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

        if (appointmentsSnapshot.empty) {
            recentAppointments.innerHTML = '<p class="empty">No recent appointments</p>';
            return;
        }

        recentAppointments.innerHTML = appointmentsSnapshot.docs.map(doc => {
            const appointment = doc.data();
            return `
                <div class="appointment-card">
                    <h4>${appointment.serviceType}</h4>
                    <p><i class="fas fa-user"></i> ${appointment.customerName}</p>
                    <p><i class="fas fa-calendar"></i> ${formatDate(appointment.date)}</p>
                    <p><i class="fas fa-clock"></i> ${formatTime(appointment.time)}</p>
                    <p><i class="fas fa-info-circle"></i> ${appointment.status}</p>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Error loading recent appointments:", error);
        showNotification("Error loading appointments", "error");
    }
}

// Setup event listeners
function setupEventListeners() {
    // Global function assignments for onclick handlers
    window.viewAppointments = () => {
        showModal('appointmentsModal');
        loadAppointments();
    };

    window.viewCustomers = () => {
        showModal('customersModal');
        loadCustomers();
    };

    window.viewPayments = () => {
        showModal('paymentsModal');
        loadPayments();
    };

    window.viewAnalytics = () => {
        showModal('analyticsModal');
        loadAnalytics();
    };

    window.viewInventory = () => {
        showModal('inventoryModal');
        loadInventory();
    };

    window.viewStaff = () => {
        showModal('staffModal');
        loadStaff();
    };

    window.viewMessages = () => {
        showModal('messagesModal');
        loadMessages();
    };

    // Event listeners for buttons
    if (refreshDashboardBtn) {
        refreshDashboardBtn.addEventListener("click", initializeDashboard);
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            try {
                await signOut(auth);
                window.location.href = "login.html";
            } catch (error) {
                console.error("Error signing out:", error);
                showNotification("Error signing out", "error");
            }
        });
    }

    // Appointments
    if (viewAllAppointmentsBtn) {
        viewAllAppointmentsBtn.addEventListener("click", window.viewAppointments);
    }

    if (addNewAppointmentBtn) {
        addNewAppointmentBtn.addEventListener("click", () => {
            showModal('addAppointmentModal');
        });
    }

    // Customers
    if (viewAllCustomersBtn) {
        viewAllCustomersBtn.addEventListener("click", window.viewCustomers);
    }

    if (addNewCustomerBtn) {
        addNewCustomerBtn.addEventListener("click", () => {
            showModal('addCustomerModal');
        });
    }

    // Payments
    if (viewAllPaymentsBtn) {
        viewAllPaymentsBtn.addEventListener("click", window.viewPayments);
    }

    if (processPaymentBtn) {
        processPaymentBtn.addEventListener("click", () => {
            showModal('processPaymentModal');
        });
    }

    // Analytics
    if (viewAnalyticsBtn) {
        viewAnalyticsBtn.addEventListener("click", viewAnalytics);
    }

    if (generateReportBtn) {
        generateReportBtn.addEventListener("click", () => {
            showModal('generateReportModal');
        });
    }

    // Inventory
    if (manageInventoryBtn) {
        manageInventoryBtn.addEventListener("click", manageInventory);
    }

    if (scheduleMaintenanceBtn) {
        scheduleMaintenanceBtn.addEventListener("click", () => {
            showModal('scheduleMaintenanceModal');
        });
    }

    // Staff
    if (viewStaffBtn) {
        viewStaffBtn.addEventListener("click", viewStaff);
    }

    if (addStaffBtn) {
        addStaffBtn.addEventListener("click", addStaff);
    }

    // Communication
    if (viewMessagesBtn) {
        viewMessagesBtn.addEventListener("click", viewMessages);
    }

    if (sendBulkMessageBtn) {
        sendBulkMessageBtn.addEventListener("click", sendBulkMessage);
    }

    // Mobile navigation event listeners
    if (mobileAppointmentsBtn) {
        mobileAppointmentsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.viewAppointments();
        });
    }

    if (mobileCustomersBtn) {
        mobileCustomersBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.viewCustomers();
        });
    }

    if (mobilePaymentsBtn) {
        mobilePaymentsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.viewPayments();
        });
    }

    if (mobileAnalyticsBtn) {
        mobileAnalyticsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.viewAnalytics();
        });
    }

    if (mobileInventoryBtn) {
        mobileInventoryBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.viewInventory();
        });
    }

    if (mobileStaffBtn) {
        mobileStaffBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.viewStaff();
        });
    }

    if (mobileMessagesBtn) {
        mobileMessagesBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.viewMessages();
        });
    }
}

// Format date
function formatDate(date) {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// Format time
function formatTime(time) {
    if (!time) return "N/A";
    return time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            initializeDashboard();
        } else {
            window.location.href = "login.html";
        }
    });
});

// Export functions for use in HTML
window.adminDashboard = {
    viewAnalytics,
    manageInventory,
    scheduleMaintenance,
    viewStaff,
    viewMessages,
    switchInventoryTab: (tab) => {
        const tabs = document.querySelectorAll(".inventory-tab");
        const buttons = document.querySelectorAll(".tab-btn");
        
        tabs.forEach(t => t.classList.remove("active"));
        buttons.forEach(b => b.classList.remove("active"));
        
        document.getElementById(`${tab}Tab`).classList.add("active");
        event.target.classList.add("active");
    }
};
