import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, orderBy, limit, onSnapshot, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "../firebase-config.js";
import { showLoading, hideLoading, showNotification, showModal, closeModal, createNotification } from "./utils.js";

const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const dashboardStats = document.getElementById("dashboardStats");
const recentAppointments = document.getElementById("recentAppointments");
const refreshDashboard = document.getElementById("refreshDashboard");
const logoutButton = document.getElementById("logoutButton");

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
        
        // Set up real-time listeners
        setupRealtimeListeners();

        // Load dashboard data
        await Promise.all([
            loadDashboardStats(),
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
            where("status", "in", ["scheduled", "in-progress"])
        );

        onSnapshot(appointmentsQuery, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    // Refresh appointments list when an appointment is updated or added
                    loadRecentAppointments();
                    // Refresh overview stats
                    loadDashboardStats();
                }
            });
        });

        // Listen for payment changes
        const paymentsQuery = query(
            collection(db, "payments"),
            where("status", "==", "completed")
        );

        onSnapshot(paymentsQuery, () => {
            loadDashboardStats();
        });

        // Listen for customer changes
        const customersQuery = collection(db, "users");
        onSnapshot(customersQuery, () => {
            loadDashboardStats();
        });
    } catch (error) {
        console.error("Error setting up real-time listeners:", error);
        showNotification("Error setting up real-time updates", "error");
    }
}

async function loadDashboardStats() {
    try {
        const stats = await getDashboardStats();
        if (!dashboardStats) {
            console.error("Dashboard stats element not found");
            return;
        }
        updateDashboardStats(stats);
    } catch (error) {
        console.error("Error loading dashboard stats:", error);
        showNotification("Error loading statistics", "error");
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

        // Get active appointments
        const activeAppointmentsQuery = query(
            collection(db, "appointments"),
            where("status", "in", ["scheduled", "in-progress"])
        );
        const activeAppointmentsSnapshot = await getDocs(activeAppointmentsQuery);
        const activeAppointments = activeAppointmentsSnapshot.size;

        // Get monthly revenue
        const monthlyPaymentsQuery = query(
            collection(db, "payments"),
            where("status", "==", "completed")
        );
        const monthlyPaymentsSnapshot = await getDocs(monthlyPaymentsQuery);
        const monthlyRevenue = monthlyPaymentsSnapshot.docs.reduce((total, doc) => total + (doc.data().amount || 0), 0);

        // Get customer satisfaction
        const ratingsQuery = query(collection(db, "ratings"));
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating);
        const satisfaction = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;

        return {
            totalCustomers,
            activeAppointments,
            monthlyRevenue,
            satisfaction
        };
    } catch (error) {
        console.error("Error getting dashboard stats:", error);
        throw error;
    }
}

function updateDashboardStats(stats) {
    if (!dashboardStats) return;

    dashboardStats.innerHTML = `
        <div class="stat-card">
            <h3>Total Customers</h3>
            <p>${stats.totalCustomers}</p>
        </div>
        <div class="stat-card">
            <h3>Active Appointments</h3>
            <p>${stats.activeAppointments}</p>
        </div>
        <div class="stat-card">
            <h3>Monthly Revenue</h3>
            <p>$${stats.monthlyRevenue.toFixed(2)}</p>
        </div>
        <div class="stat-card">
            <h3>Customer Satisfaction</h3>
            <p>${stats.satisfaction}/5.0</p>
        </div>
    `;
}

async function getRecentAppointments() {
    try {
        // Simplified query to avoid index requirements
        const appointmentsQuery = query(
            collection(db, "appointments"),
            where("status", "in", ["scheduled", "in-progress"]),
            limit(5)
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        return appointmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting recent appointments:", error);
        throw error;
    }
}

async function loadRecentAppointments() {
    try {
        const appointments = await getRecentAppointments();
        if (!recentAppointments) {
            console.error("Recent appointments element not found");
            return;
        }
        updateRecentAppointments(appointments);
    } catch (error) {
        console.error("Error loading recent appointments:", error);
        showNotification("Error loading appointments", "error");
    }
}

function updateRecentAppointments(appointments) {
    if (!recentAppointments) return;

    if (appointments.length === 0) {
        recentAppointments.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>No recent appointments</p>
            </div>
        `;
        return;
    }

    recentAppointments.innerHTML = appointments.map(appointment => `
        <div class="appointment-card">
            <h4>${appointment.service || 'Service'}</h4>
            <p><i class="fas fa-calendar"></i> Date: ${formatDate(appointment.date)}</p>
            <p><i class="fas fa-user"></i> Customer: ${appointment.customerName || 'N/A'}</p>
            <p><i class="fas fa-clock"></i> Status: ${appointment.status || 'Pending'}</p>
        </div>
    `).join('');
}

function setupEventListeners() {
    if (refreshDashboard) {
        refreshDashboard.addEventListener('click', () => {
            initializeDashboard(auth.currentUser);
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await auth.signOut();
                window.location.href = 'admin-login.html';
            } catch (error) {
                console.error('Error signing out:', error);
                showNotification('Error signing out', 'error');
            }
        });
    }
}

function formatDate(date) {
    if (!date) return 'N/A';
    const d = date.toDate();
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
