import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
    try {
        // Get total customers
        const customersSnapshot = await getDocs(collection(db, "users"));
        const totalCustomers = customersSnapshot.size;

        // Get active appointments
        const appointmentsSnapshot = await getDocs(
            query(collection(db, "appointments"), 
            where("status", "in", ["pending", "confirmed"]))
        );
        const activeAppointments = appointmentsSnapshot.size;

        // Get monthly revenue
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const paymentsSnapshot = await getDocs(
            query(collection(db, "payments"),
            where("date", ">=", firstDayOfMonth.toISOString()))
        );
        const monthlyRevenue = paymentsSnapshot.docs.reduce((total, doc) => {
            const payment = doc.data();
            return total + (payment.amount || 0);
        }, 0);

        // Get customer satisfaction
        const reviewsSnapshot = await getDocs(collection(db, "reviews"));
        const satisfaction = reviewsSnapshot.docs.reduce((total, doc) => {
            const review = doc.data();
            return total + (review.rating || 0);
        }, 0) / (reviewsSnapshot.size || 1);

        // Calculate changes from last month
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Last month's customers
        const lastMonthCustomersSnapshot = await getDocs(
            query(collection(db, "users"),
            where("createdAt", ">=", lastMonth.toISOString()),
            where("createdAt", "<=", lastMonthEnd.toISOString()))
        );
        const lastMonthCustomers = lastMonthCustomersSnapshot.size;
        const customerChange = lastMonthCustomers ? 
            ((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0;

        // Last month's appointments
        const lastMonthAppointmentsSnapshot = await getDocs(
            query(collection(db, "appointments"),
            where("date", ">=", lastMonth.toISOString()),
            where("date", "<=", lastMonthEnd.toISOString()))
        );
        const lastMonthAppointments = lastMonthAppointmentsSnapshot.size;
        const appointmentChange = lastMonthAppointments ?
            ((activeAppointments - lastMonthAppointments) / lastMonthAppointments) * 100 : 0;

        // Last month's revenue
        const lastMonthPaymentsSnapshot = await getDocs(
            query(collection(db, "payments"),
            where("date", ">=", lastMonth.toISOString()),
            where("date", "<=", lastMonthEnd.toISOString()))
        );
        const lastMonthRevenue = lastMonthPaymentsSnapshot.docs.reduce((total, doc) => {
            const payment = doc.data();
            return total + (payment.amount || 0);
        }, 0);
        const revenueChange = lastMonthRevenue ?
            ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

        // Last month's satisfaction
        const lastMonthReviewsSnapshot = await getDocs(
            query(collection(db, "reviews"),
            where("date", ">=", lastMonth.toISOString()),
            where("date", "<=", lastMonthEnd.toISOString()))
        );
        const lastMonthSatisfaction = lastMonthReviewsSnapshot.docs.reduce((total, doc) => {
            const review = doc.data();
            return total + (review.rating || 0);
        }, 0) / (lastMonthReviewsSnapshot.size || 1);
        const satisfactionChange = lastMonthSatisfaction ?
            satisfaction - lastMonthSatisfaction : 0;

        return {
            totalCustomers,
            customerChange,
            activeAppointments,
            appointmentChange,
            monthlyRevenue,
            revenueChange,
            satisfaction: satisfaction.toFixed(1),
            satisfactionChange: satisfactionChange.toFixed(1)
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
}

async function getRecentAppointments() {
    try {
        const now = new Date();
        const appointmentsSnapshot = await getDocs(
            query(collection(db, "appointments"),
            where("date", ">=", now.toISOString()),
            orderBy("date", "asc"),
            limit(5))
        );

        const appointments = [];
        for (const doc of appointmentsSnapshot.docs) {
            const appointment = doc.data();
            const customerDoc = await getDoc(doc(db, "users", appointment.userId));
            const customer = customerDoc.data();

            appointments.push({
                id: doc.id,
                customerName: customer?.name || "Unknown Customer",
                service: appointment.service,
                date: appointment.date,
                status: appointment.status
            });
        }

        return appointments;
    } catch (error) {
        console.error("Error fetching recent appointments:", error);
        throw error;
    }
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
