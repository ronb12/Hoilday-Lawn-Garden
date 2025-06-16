import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "../firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const adminName = document.getElementById("adminName");
const adminRole = document.getElementById("adminRole");
const logoutBtn = document.getElementById("logoutBtn");
const adminOverview = document.getElementById("adminOverview");
const recentAppointments = document.getElementById("recentAppointments");
const loadingIndicator = document.getElementById("loadingIndicator");
const notificationContainer = document.getElementById("notificationContainer");

// Quick Action Buttons
const newAppointmentBtn = document.getElementById("newAppointmentBtn");
const addCustomerBtn = document.getElementById("addCustomerBtn");
const generateReportBtn = document.getElementById("generateReportBtn");
const sendNotificationsBtn = document.getElementById("sendNotificationsBtn");

// Check if user is logged in and is an admin
onAuthStateChanged(auth, async (user) => {
    console.log("Auth state changed:", user ? "User logged in" : "User logged out");
    
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists() || userDoc.data().role !== 'admin') {
                console.error("User is not an admin");
                window.location.href = "login.html";
                return;
            }

            console.log("Initializing admin dashboard for user:", user.email);
            await initializeDashboard(user);
        } catch (error) {
            console.error("Error checking admin status:", error);
            showNotification("Error verifying admin status", "error");
        }
    } else {
        window.location.href = "admin-login.html";
    }
});

async function initializeDashboard(user) {
    try {
        showLoading();
        
        // Update admin profile info
        if (adminName) adminName.textContent = user.email;
        if (adminRole) adminRole.textContent = "Administrator";

        // Load dashboard data
        await Promise.all([
            loadAdminOverview(),
            loadRecentAppointments()
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

async function loadAdminOverview() {
    try {
        if (!adminOverview) {
            console.error("Admin overview element not found");
            return;
        }

        const stats = await getDashboardStats();
        
        adminOverview.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <h3>Total Customers</h3>
                    <p class="stat-number">${stats.totalCustomers}</p>
                    <p class="stat-change ${stats.customerChange >= 0 ? 'positive' : 'negative'}">
                        ${stats.customerChange >= 0 ? '+' : ''}${stats.customerChange}% from last month
                    </p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-info">
                    <h3>Active Appointments</h3>
                    <p class="stat-number">${stats.activeAppointments}</p>
                    <p class="stat-change ${stats.appointmentChange >= 0 ? 'positive' : 'negative'}">
                        ${stats.appointmentChange >= 0 ? '+' : ''}${stats.appointmentChange}% from last month
                    </p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="stat-info">
                    <h3>Monthly Revenue</h3>
                    <p class="stat-number">$${stats.monthlyRevenue.toLocaleString()}</p>
                    <p class="stat-change ${stats.revenueChange >= 0 ? 'positive' : 'negative'}">
                        ${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}% from last month
                    </p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="stat-info">
                    <h3>Customer Satisfaction</h3>
                    <p class="stat-number">${stats.satisfaction}/5</p>
                    <p class="stat-change ${stats.satisfactionChange >= 0 ? 'positive' : 'negative'}">
                        ${stats.satisfactionChange >= 0 ? '+' : ''}${stats.satisfactionChange} from last month
                    </p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error loading admin overview:", error);
        showNotification("Error loading dashboard statistics", "error");
    }
}

async function loadRecentAppointments() {
    try {
        if (!recentAppointments) {
            console.error("Recent appointments element not found");
            return;
        }

        const appointments = await getRecentAppointments();
        
        if (appointments.length === 0) {
            recentAppointments.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-calendar-times"></i>
                    <p>No recent appointments</p>
                </div>
            `;
            return;
        }

        recentAppointments.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${appointments.map(appointment => `
                        <tr>
                            <td>${appointment.customerName}</td>
                            <td>${appointment.service}</td>
                            <td>${formatDate(appointment.date)}</td>
                            <td><span class="status-badge ${appointment.status.toLowerCase()}">${appointment.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error("Error loading recent appointments:", error);
        showNotification("Error loading recent appointments", "error");
    }
}

async function getDashboardStats() {
    // TODO: Implement actual data fetching from Firestore
    return {
        totalCustomers: 1234,
        customerChange: 12,
        activeAppointments: 45,
        appointmentChange: 5,
        monthlyRevenue: 12345,
        revenueChange: 8,
        satisfaction: 4.8,
        satisfactionChange: 0.2
    };
}

async function getRecentAppointments() {
    // TODO: Implement actual data fetching from Firestore
    return [
        {
            customerName: "John Smith",
            service: "Lawn Maintenance",
            date: "2024-03-20",
            status: "Confirmed"
        },
        {
            customerName: "Sarah Johnson",
            service: "Garden Design",
            date: "2024-03-21",
            status: "Pending"
        },
        {
            customerName: "Mike Brown",
            service: "Irrigation System",
            date: "2024-03-22",
            status: "Completed"
        }
    ];
}

function setupEventListeners() {
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    if (newAppointmentBtn) {
        newAppointmentBtn.addEventListener("click", () => {
            // TODO: Implement new appointment functionality
            showNotification("New appointment feature coming soon", "info");
        });
    }

    if (addCustomerBtn) {
        addCustomerBtn.addEventListener("click", () => {
            // TODO: Implement add customer functionality
            showNotification("Add customer feature coming soon", "info");
        });
    }

    if (generateReportBtn) {
        generateReportBtn.addEventListener("click", () => {
            // TODO: Implement report generation
            showNotification("Report generation feature coming soon", "info");
        });
    }

    if (sendNotificationsBtn) {
        sendNotificationsBtn.addEventListener("click", () => {
            // TODO: Implement notification sending
            showNotification("Notification feature coming soon", "info");
        });
    }
}

async function handleLogout() {
    try {
        showLoading();
        await signOut(auth);
        window.location.href = "admin-login.html";
    } catch (error) {
        console.error("Error signing out:", error);
        showNotification("Error signing out", "error");
        hideLoading();
    }
}

function showLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = "flex";
    }
}

function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = "none";
    }
}

function showNotification(message, type = "info") {
    if (!notificationContainer) return;

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("fade-out");
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case "success":
            return "fa-check-circle";
        case "error":
            return "fa-exclamation-circle";
        case "warning":
            return "fa-exclamation-triangle";
        default:
            return "fa-info-circle";
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
