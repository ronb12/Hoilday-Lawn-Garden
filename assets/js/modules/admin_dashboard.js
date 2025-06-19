// No imports, use global firebase and global utility functions
const db = firebase.firestore();
const auth = firebase.auth();

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
        window.showLoading("Loading dashboard data...");
        
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

        window.hideLoading();
    } catch (error) {
        console.error("Error initializing dashboard:", error);
        window.showNotification("Error loading dashboard data", "error");
        window.hideLoading();
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const [customersSnapshot, appointmentsSnapshot, paymentsSnapshot] = await Promise.all([
            db.collection("customers").get(),
            db.collection("appointments").get(),
            db.collection("payments").get()
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
        window.showNotification("Error loading statistics", "error");
    }
}

// Load recent appointments
async function loadRecentAppointments() {
    try {
        const appointmentsQuery = db.collection("appointments").orderBy("date", "desc").limit(5);
        const appointmentsSnapshot = await appointmentsQuery.get();

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
        window.showNotification("Error loading appointments", "error");
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
                await auth.signOut();
                window.location.href = "login.html";
            } catch (error) {
                console.error("Error signing out:", error);
                window.showNotification("Error signing out", "error");
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
    auth.onAuthStateChanged((user) => {
        if (user) {
            initializeDashboard();
        } else {
            window.location.href = "login.html";
        }
    });
});

// Example: Attach main dashboard functions to window.adminDashboard
window.adminDashboard = {
    // Add your main dashboard functions here, e.g.:
    // initializeDashboard, loadDashboardStats, etc.
};
// You can now call window.adminDashboard.initializeDashboard() from HTML or other scripts.

// Load appointments
async function loadAppointments() {
    try {
        const appointmentsQuery = db.collection("appointments").orderBy("date", "desc");
        const appointmentsSnapshot = await appointmentsQuery.get();
        
        const appointmentsContainer = document.getElementById("appointmentsContainer");
        if (!appointmentsContainer) return;

        if (appointmentsSnapshot.empty) {
            appointmentsContainer.innerHTML = '<p class="empty">No appointments found</p>';
            return;
        }

        appointmentsContainer.innerHTML = appointmentsSnapshot.docs.map(doc => {
            const appointment = doc.data();
            return `
                <div class="appointment-card">
                    <h4>${appointment.serviceType}</h4>
                    <p><i class="fas fa-user"></i> ${appointment.customerName}</p>
                    <p><i class="fas fa-calendar"></i> ${formatDate(appointment.date)}</p>
                    <p><i class="fas fa-clock"></i> ${formatTime(appointment.time)}</p>
                    <p><i class="fas fa-info-circle"></i> ${appointment.status}</p>
                    <div class="appointment-actions">
                        <button onclick="editAppointment('${doc.id}')" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteAppointment('${doc.id}')" class="btn btn-sm btn-danger">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Error loading appointments:", error);
        window.showNotification("Error loading appointments", "error");
    }
}

// Load customers
async function loadCustomers() {
    try {
        const customersQuery = db.collection("users").where("role", "==", "customer").orderBy("createdAt", "desc");
        const customersSnapshot = await customersQuery.get();
        
        const customersContainer = document.getElementById("customersContainer");
        if (!customersContainer) return;

        if (customersSnapshot.empty) {
            customersContainer.innerHTML = '<p class="empty">No customers found</p>';
            return;
        }

        customersContainer.innerHTML = customersSnapshot.docs.map(doc => {
            const customer = doc.data();
            return `
                <div class="customer-card">
                    <h4>${customer.displayName || 'No Name'}</h4>
                    <p><i class="fas fa-envelope"></i> ${customer.email}</p>
                    <p><i class="fas fa-phone"></i> ${customer.phone || 'No Phone'}</p>
                    <p><i class="fas fa-calendar"></i> Member since: ${formatDate(customer.createdAt)}</p>
                    <div class="customer-actions">
                        <button onclick="editCustomer('${doc.id}')" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="viewCustomerHistory('${doc.id}')" class="btn btn-sm btn-info">
                            <i class="fas fa-history"></i> History
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Error loading customers:", error);
        window.showNotification("Error loading customers", "error");
    }
}

// Load payments
async function loadPayments() {
    try {
        const paymentsQuery = db.collection("payments").orderBy("date", "desc");
        const paymentsSnapshot = await paymentsQuery.get();
        
        const paymentsContainer = document.getElementById("paymentsContainer");
        if (!paymentsContainer) return;

        if (paymentsSnapshot.empty) {
            paymentsContainer.innerHTML = '<p class="empty">No payments found</p>';
            return;
        }

        paymentsContainer.innerHTML = paymentsSnapshot.docs.map(doc => {
            const payment = doc.data();
            return `
                <div class="payment-card">
                    <h4>Payment #${doc.id.slice(-6)}</h4>
                    <p><i class="fas fa-user"></i> ${payment.customerName}</p>
                    <p><i class="fas fa-dollar-sign"></i> Amount: $${payment.amount.toFixed(2)}</p>
                    <p><i class="fas fa-calendar"></i> Date: ${formatDate(payment.date)}</p>
                    <p><i class="fas fa-info-circle"></i> Status: ${payment.status}</p>
                    <div class="payment-actions">
                        <button onclick="viewPaymentDetails('${doc.id}')" class="btn btn-sm btn-info">
                            <i class="fas fa-eye"></i> Details
                        </button>
                        <button onclick="printReceipt('${doc.id}')" class="btn btn-sm btn-secondary">
                            <i class="fas fa-print"></i> Receipt
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Error loading payments:", error);
        window.showNotification("Error loading payments", "error");
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        const [customersSnapshot, appointmentsSnapshot, paymentsSnapshot] = await Promise.all([
            db.collection("users").get(),
            db.collection("appointments").get(),
            db.collection("payments").get()
        ]);

        const totalCustomers = customersSnapshot.size;
        const totalAppointments = appointmentsSnapshot.size;
        const totalRevenue = paymentsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
        const pendingPayments = paymentsSnapshot.docs.filter(doc => doc.data().status === "pending").length;

        const analyticsContainer = document.getElementById("analyticsContainer");
        if (!analyticsContainer) return;

        analyticsContainer.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>Customer Growth</h3>
                    <div class="chart-container">
                        <canvas id="customerGrowthChart"></canvas>
                    </div>
                </div>
                <div class="analytics-card">
                    <h3>Revenue Overview</h3>
                    <div class="chart-container">
                        <canvas id="revenueChart"></canvas>
                    </div>
                </div>
                <div class="analytics-card">
                    <h3>Service Distribution</h3>
                    <div class="chart-container">
                        <canvas id="serviceDistributionChart"></canvas>
                    </div>
                </div>
                <div class="analytics-card">
                    <h3>Payment Status</h3>
                    <div class="chart-container">
                        <canvas id="paymentStatusChart"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Initialize charts
        initializeCharts();
    } catch (error) {
        console.error("Error loading analytics:", error);
        window.showNotification("Error loading analytics", "error");
    }
}

// Load inventory
async function loadInventory() {
    try {
        const inventoryQuery = db.collection("inventory").orderBy("name", "asc");
        const inventorySnapshot = await inventoryQuery.get();
        
        const inventoryContainer = document.getElementById("inventoryContainer");
        if (!inventoryContainer) return;

        if (inventorySnapshot.empty) {
            inventoryContainer.innerHTML = '<p class="empty">No inventory items found</p>';
            return;
        }

        inventoryContainer.innerHTML = inventorySnapshot.docs.map(doc => {
            const item = doc.data();
            return `
                <div class="inventory-card">
                    <h4>${item.name}</h4>
                    <p><i class="fas fa-box"></i> Quantity: ${item.quantity}</p>
                    <p><i class="fas fa-dollar-sign"></i> Price: $${item.price.toFixed(2)}</p>
                    <p><i class="fas fa-exclamation-triangle"></i> Low Stock: ${item.lowStockThreshold}</p>
                    <div class="inventory-actions">
                        <button onclick="editInventoryItem('${doc.id}')" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="updateStock('${doc.id}')" class="btn btn-sm btn-warning">
                            <i class="fas fa-sync"></i> Update Stock
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Error loading inventory:", error);
        window.showNotification("Error loading inventory", "error");
    }
}

// Load staff
async function loadStaff() {
    try {
        const staffQuery = db.collection("users").where("role", "==", "staff").orderBy("name", "asc");
        const staffSnapshot = await staffQuery.get();
        
        const staffContainer = document.getElementById("staffContainer");
        if (!staffContainer) return;

        if (staffSnapshot.empty) {
            staffContainer.innerHTML = '<p class="empty">No staff members found</p>';
            return;
        }

        staffContainer.innerHTML = staffSnapshot.docs.map(doc => {
            const staff = doc.data();
            return `
                <div class="staff-card">
                    <h4>${staff.displayName || 'No Name'}</h4>
                    <p><i class="fas fa-envelope"></i> ${staff.email}</p>
                    <p><i class="fas fa-phone"></i> ${staff.phone || 'No Phone'}</p>
                    <p><i class="fas fa-user-tag"></i> Role: ${staff.position || 'Staff'}</p>
                    <div class="staff-actions">
                        <button onclick="editStaff('${doc.id}')" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="viewStaffSchedule('${doc.id}')" class="btn btn-sm btn-info">
                            <i class="fas fa-calendar"></i> Schedule
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Error loading staff:", error);
        window.showNotification("Error loading staff", "error");
    }
}

// Load messages
async function loadMessages() {
    try {
        const messagesQuery = db.collection("messages").orderBy("timestamp", "desc");
        const messagesSnapshot = await messagesQuery.get();
        
        const messagesContainer = document.getElementById("messagesContainer");
        if (!messagesContainer) return;

        if (messagesSnapshot.empty) {
            messagesContainer.innerHTML = '<p class="empty">No messages found</p>';
            return;
        }

        messagesContainer.innerHTML = messagesSnapshot.docs.map(doc => {
            const message = doc.data();
            return `
                <div class="message-card">
                    <h4>${message.subject}</h4>
                    <p><i class="fas fa-user"></i> From: ${message.senderName}</p>
                    <p><i class="fas fa-calendar"></i> Date: ${formatDate(message.timestamp)}</p>
                    <p><i class="fas fa-envelope"></i> ${message.content.substring(0, 100)}...</p>
                    <div class="message-actions">
                        <button onclick="viewMessage('${doc.id}')" class="btn btn-sm btn-info">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button onclick="replyToMessage('${doc.id}')" class="btn btn-sm btn-primary">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Error loading messages:", error);
        window.showNotification("Error loading messages", "error");
    }
}
