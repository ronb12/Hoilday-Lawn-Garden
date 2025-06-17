import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, orderBy, limit, onSnapshot, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "../firebase-config.js";
import { showLoading, hideLoading, showNotification, showModal, closeModal, createNotification } from "./utils.js";

const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const adminName = document.getElementById("adminName");
const adminRole = document.getElementById("adminRole");
const logoutBtn = document.getElementById("logoutBtn");
const headerLogoutBtn = document.getElementById("headerLogoutBtn");
const adminOverview = document.getElementById("adminOverview");
const recentAppointments = document.getElementById("recentAppointments");
const dateRange = document.getElementById("dateRange");
const appointmentFilter = document.getElementById("appointmentFilter");

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
            showLoading("Verifying admin access...");
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists() || userDoc.data().role !== 'admin') {
                console.error("User is not an admin");
                await auth.signOut();
                window.location.href = "login.html";
                return;
            }

            console.log("Initializing admin dashboard for user:", user.email);
            await initializeDashboard(user);
        } catch (error) {
            console.error("Error checking admin status:", error);
            showNotification("Error verifying admin status", "error");
            await auth.signOut();
            window.location.href = "admin-login.html";
        } finally {
            hideLoading();
        }
    } else {
        window.location.href = "admin-login.html";
    }
});

async function initializeDashboard(user) {
    try {
        showLoading("Loading dashboard data...");
        
        // Update admin profile info
        if (adminName) adminName.textContent = user.email;
        if (adminRole) adminRole.textContent = "Administrator";

        // Set up real-time listeners
        setupRealtimeListeners();

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

function setupRealtimeListeners() {
    try {
        // Listen for appointment changes
        const appointmentsQuery = query(
            collection(db, "appointments"),
            orderBy("date", "desc")
        );

        onSnapshot(appointmentsQuery, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "modified" || change.type === "added") {
                    // Refresh appointments list when an appointment is updated or added
                    loadRecentAppointments();
                    // Refresh overview stats
                    loadAdminOverview();
                }
            });
        });

        // Listen for payment changes
        const paymentsQuery = query(
            collection(db, "payments"),
            orderBy("date", "desc")
        );

        onSnapshot(paymentsQuery, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    // Refresh overview stats when payments change
                    loadAdminOverview();
                }
            });
        });

        // Listen for customer changes
        const customersQuery = query(collection(db, "users"));
        onSnapshot(customersQuery, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    // Refresh overview stats when customer data changes
                    loadAdminOverview();
                }
            });
        });
    } catch (error) {
        console.error("Error setting up real-time listeners:", error);
        showNotification("Error setting up real-time updates", "error");
    }
}

async function getDashboardStats() {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get total customers
        const customersSnapshot = await getDocs(collection(db, "users"));
        const totalCustomers = customersSnapshot.size;

        // Get last month's customers
        const lastMonthCustomersQuery = query(
            collection(db, "users"),
            where("createdAt", ">=", startOfLastMonth),
            where("createdAt", "<=", endOfLastMonth)
        );
        const lastMonthCustomersSnapshot = await getDocs(lastMonthCustomersQuery);
        const lastMonthCustomers = lastMonthCustomersSnapshot.size;
        const customerChange = lastMonthCustomers === 0 ? 100 : ((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100;

        // Get active appointments
        const activeAppointmentsQuery = query(
            collection(db, "appointments"),
            where("status", "in", ["pending", "confirmed"])
        );
        const activeAppointmentsSnapshot = await getDocs(activeAppointmentsQuery);
        const activeAppointments = activeAppointmentsSnapshot.size;

        // Get last month's active appointments
        const lastMonthAppointmentsQuery = query(
            collection(db, "appointments"),
            where("status", "in", ["pending", "confirmed"]),
            where("date", ">=", startOfLastMonth),
            where("date", "<=", endOfLastMonth)
        );
        const lastMonthAppointmentsSnapshot = await getDocs(lastMonthAppointmentsQuery);
        const lastMonthAppointments = lastMonthAppointmentsSnapshot.size;
        const appointmentChange = lastMonthAppointments === 0 ? 100 : ((activeAppointments - lastMonthAppointments) / lastMonthAppointments) * 100;

        // Get monthly revenue
        const monthlyPaymentsQuery = query(
            collection(db, "payments"),
            where("date", ">=", startOfMonth)
        );
        const monthlyPaymentsSnapshot = await getDocs(monthlyPaymentsQuery);
        const monthlyRevenue = monthlyPaymentsSnapshot.docs.reduce((total, doc) => total + (doc.data().amount || 0), 0);

        // Get last month's revenue
        const lastMonthPaymentsQuery = query(
            collection(db, "payments"),
            where("date", ">=", startOfLastMonth),
            where("date", "<=", endOfLastMonth)
        );
        const lastMonthPaymentsSnapshot = await getDocs(lastMonthPaymentsQuery);
        const lastMonthRevenue = lastMonthPaymentsSnapshot.docs.reduce((total, doc) => total + (doc.data().amount || 0), 0);
        const revenueChange = lastMonthRevenue === 0 ? 100 : ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

        // Get customer satisfaction
        const ratingsQuery = query(collection(db, "ratings"));
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating);
        const satisfaction = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;

        // Get last month's satisfaction
        const lastMonthRatingsQuery = query(
            collection(db, "ratings"),
            where("createdAt", ">=", startOfLastMonth),
            where("createdAt", "<=", endOfLastMonth)
        );
        const lastMonthRatingsSnapshot = await getDocs(lastMonthRatingsQuery);
        const lastMonthRatings = lastMonthRatingsSnapshot.docs.map(doc => doc.data().rating);
        const lastMonthSatisfaction = lastMonthRatings.length > 0 ? (lastMonthRatings.reduce((a, b) => a + b, 0) / lastMonthRatings.length).toFixed(1) : 0;
        const satisfactionChange = lastMonthSatisfaction === 0 ? 0 : satisfaction - lastMonthSatisfaction;

        return {
            totalCustomers,
            customerChange,
            activeAppointments,
            appointmentChange,
            monthlyRevenue,
            revenueChange,
            satisfaction,
            satisfactionChange
        };
    } catch (error) {
        console.error("Error getting dashboard stats:", error);
        throw error;
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

async function getRecentAppointments() {
    try {
        const appointmentsQuery = query(
            collection(db, "appointments"),
            orderBy("date", "desc"),
            limit(5)
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        
        const appointments = await Promise.all(
            appointmentsSnapshot.docs.map(async (doc) => {
                const data = doc.data();
                const userDoc = await getDoc(doc(db, "users", data.userId));
                return {
                    id: doc.id,
                    customerName: userDoc.exists() ? userDoc.data().name : "Unknown",
                    service: data.service,
                    date: data.date,
                    status: data.status
                };
            })
        );

        return appointments;
    } catch (error) {
        console.error("Error getting recent appointments:", error);
        throw error;
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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${appointments.map(appointment => `
                        <tr>
                            <td>${appointment.customerName}</td>
                            <td>${appointment.service}</td>
                            <td>${formatDate(appointment.date)}</td>
                            <td><span class="status-badge ${appointment.status.toLowerCase()}">${appointment.status}</span></td>
                            <td>
                                ${appointment.status === 'pending' ? `
                                    <button class="btn-confirm" onclick="updateAppointmentStatus('${appointment.id}', 'confirmed')">
                                        <i class="fas fa-check"></i> Confirm
                                    </button>
                                ` : ''}
                                ${appointment.status !== 'cancelled' ? `
                                    <button class="btn-cancel" onclick="updateAppointmentStatus('${appointment.id}', 'cancelled')">
                                        <i class="fas fa-times"></i> Cancel
                                    </button>
                                ` : ''}
                            </td>
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

async function updateAppointmentStatus(appointmentId, newStatus) {
    try {
        showLoading();
        const appointmentRef = doc(db, "appointments", appointmentId);
        const appointmentDoc = await getDoc(appointmentRef);
        
        if (!appointmentDoc.exists()) {
            throw new Error("Appointment not found");
        }

        const appointmentData = appointmentDoc.data();
        const userId = appointmentData.userId;

        // Update appointment status
        await updateDoc(appointmentRef, {
            status: newStatus,
            updatedAt: new Date().toISOString(),
            lastUpdatedBy: auth.currentUser.uid
        });

        // Create notification for customer
        await createNotification(
            userId,
            "appointment_update",
            "Appointment Update",
            `Your appointment has been ${newStatus.toLowerCase()}`,
            { appointmentId }
        );

        showNotification(`Appointment ${newStatus.toLowerCase()} successfully`, "success");
    } catch (error) {
        console.error("Error updating appointment status:", error);
        showNotification("Error updating appointment status", "error");
    } finally {
        hideLoading();
    }
}

function setupEventListeners() {
    try {
        // Logout buttons
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        if (headerLogoutBtn) {
            headerLogoutBtn.addEventListener('click', handleLogout);
        }

        // Date range filter
        if (dateRange) {
            dateRange.addEventListener('change', () => {
                loadAdminOverview();
            });
        }

        // Appointment filter
        if (appointmentFilter) {
            appointmentFilter.addEventListener('change', () => {
                loadRecentAppointments();
            });
        }

        // Quick action buttons
        if (newAppointmentBtn) {
            newAppointmentBtn.addEventListener('click', () => {
                showModal(`
                    <h2>New Appointment</h2>
                    <form id="newAppointmentForm">
                        <!-- Form content will be added -->
                    </form>
                `);
            });
        }

        if (addCustomerBtn) {
            addCustomerBtn.addEventListener('click', () => {
                showModal(`
                    <h2>Add New Customer</h2>
                    <form id="newCustomerForm">
                        <!-- Form content will be added -->
                    </form>
                `);
            });
        }

        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                showModal(`
                    <h2>Generate Report</h2>
                    <form id="reportForm">
                        <!-- Form content will be added -->
                    </form>
                `);
            });
        }

        if (sendNotificationsBtn) {
            sendNotificationsBtn.addEventListener('click', () => {
                showModal(`
                    <h2>Send Notifications</h2>
                    <form id="notificationForm">
                        <!-- Form content will be added -->
                    </form>
                `);
            });
        }
    } catch (error) {
        console.error("Error setting up event listeners:", error);
        showNotification("Error setting up dashboard controls", "error");
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = "admin-login.html";
    } catch (error) {
        console.error("Error signing out:", error);
        showNotification("Error signing out", "error");
    }
}

// Utility functions
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Make functions available globally
window.updateAppointmentStatus = updateAppointmentStatus;
