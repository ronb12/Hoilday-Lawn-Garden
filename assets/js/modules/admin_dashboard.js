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
const viewAllCustomers = document.getElementById("viewAllCustomers");
const addNewCustomer = document.getElementById("addNewCustomer");
const viewAllPayments = document.getElementById("viewAllPayments");
const processPayment = document.getElementById("processPayment");

// Check if user is logged in and is an admin
onAuthStateChanged(auth, async (user) => {
    console.log("Auth state changed:", user ? "User logged in" : "User logged out");
    
    if (user) {
        try {
            showLoading("Verifying admin access...");
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists() || userDoc.data().role !== "admin") {
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
            <h4>${appointment.service || "Service"}</h4>
            <p><i class="fas fa-calendar"></i> Date: ${formatDate(appointment.date)}</p>
            <p><i class="fas fa-user"></i> Customer: ${appointment.customerName || "N/A"}</p>
            <p><i class="fas fa-clock"></i> Status: ${appointment.status || "Pending"}</p>
        </div>
    `).join("");
}

// Customer Management Functions
async function viewAllCustomers() {
    try {
        showLoading("Loading customers...");
        const customersQuery = query(collection(db, "users"));
        const customersSnapshot = await getDocs(customersQuery);
        const customers = customersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        showModal("All Customers", `
            <div class="customers-list">
                ${customers.map(customer => `
                    <div class="customer-card">
                        <h4>${customer.name || "N/A"}</h4>
                        <p><i class="fas fa-envelope"></i> ${customer.email || "N/A"}</p>
                        <p><i class="fas fa-phone"></i> ${customer.phone || "N/A"}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${customer.address || "N/A"}</p>
                    </div>
                `).join("")}
            </div>
        `);
    } catch (error) {
        console.error("Error loading customers:", error);
        showNotification("Error loading customers", "error");
    } finally {
        hideLoading();
    }
}

async function addNewCustomer() {
    showModal("Add New Customer", `
        <form id="addCustomerForm" class="form">
            <div class="form-group">
                <label for="customerName">Name</label>
                <input type="text" id="customerName" required>
            </div>
            <div class="form-group">
                <label for="customerEmail">Email</label>
                <input type="email" id="customerEmail" required>
            </div>
            <div class="form-group">
                <label for="customerPhone">Phone</label>
                <input type="tel" id="customerPhone" required>
            </div>
            <div class="form-group">
                <label for="customerAddress">Address</label>
                <textarea id="customerAddress" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Add Customer</button>
        </form>
    `);

    const form = document.getElementById("addCustomerForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            showLoading("Adding customer...");
            const customerData = {
                name: document.getElementById("customerName").value,
                email: document.getElementById("customerEmail").value,
                phone: document.getElementById("customerPhone").value,
                address: document.getElementById("customerAddress").value,
                createdAt: new Date(),
                role: "customer"
            };

            const docRef = doc(collection(db, "users"));
            await setDoc(docRef, customerData);
            
            showNotification("Customer added successfully", "success");
            closeModal();
            loadDashboardStats();
        } catch (error) {
            console.error("Error adding customer:", error);
            showNotification("Error adding customer", "error");
        } finally {
            hideLoading();
        }
    });
}

// Payment Management Functions
async function viewAllPayments() {
    try {
        showLoading("Loading payments...");
        const paymentsQuery = query(collection(db, "payments"));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const payments = paymentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        showModal("All Payments", `
            <div class="payments-list">
                ${payments.map(payment => `
                    <div class="payment-card">
                        <h4>Payment #${payment.id.slice(-6)}</h4>
                        <p><i class="fas fa-dollar-sign"></i> Amount: $${payment.amount?.toFixed(2) || "0.00"}</p>
                        <p><i class="fas fa-calendar"></i> Date: ${formatDate(payment.date)}</p>
                        <p><i class="fas fa-user"></i> Customer: ${payment.customerName || "N/A"}</p>
                        <p><i class="fas fa-check-circle"></i> Status: ${payment.status || "Pending"}</p>
                    </div>
                `).join("")}
            </div>
        `);
    } catch (error) {
        console.error("Error loading payments:", error);
        showNotification("Error loading payments", "error");
    } finally {
        hideLoading();
    }
}

async function processPayment() {
    showModal("Process New Payment", `
        <form id="processPaymentForm" class="form">
            <div class="form-group">
                <label for="customerSelect">Customer</label>
                <select id="customerSelect" required>
                    <option value="">Select a customer</option>
                </select>
            </div>
            <div class="form-group">
                <label for="paymentAmount">Amount</label>
                <input type="number" id="paymentAmount" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="paymentDescription">Description</label>
                <textarea id="paymentDescription" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Process Payment</button>
        </form>
    `);

    // Load customers into select
    try {
        const customersQuery = query(collection(db, "users"));
        const customersSnapshot = await getDocs(customersQuery);
        const customerSelect = document.getElementById("customerSelect");
        
        customersSnapshot.docs.forEach(doc => {
            const customer = doc.data();
            const option = document.createElement("option");
            option.value = doc.id;
            option.textContent = customer.name || customer.email;
            customerSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading customers:", error);
        showNotification("Error loading customers", "error");
    }

    const form = document.getElementById("processPaymentForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            showLoading("Processing payment...");
            const paymentData = {
                customerId: document.getElementById("customerSelect").value,
                customerName: document.getElementById("customerSelect").selectedOptions[0].textContent,
                amount: parseFloat(document.getElementById("paymentAmount").value),
                description: document.getElementById("paymentDescription").value,
                date: new Date(),
                status: "completed"
            };

            const docRef = doc(collection(db, "payments"));
            await setDoc(docRef, paymentData);
            
            showNotification("Payment processed successfully", "success");
            closeModal();
            loadDashboardStats();
        } catch (error) {
            console.error("Error processing payment:", error);
            showNotification("Error processing payment", "error");
        } finally {
            hideLoading();
        }
    });
}

function setupEventListeners() {
    if (refreshDashboard) {
        refreshDashboard.addEventListener("click", () => {
            initializeDashboard(auth.currentUser);
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            try {
                await auth.signOut();
                window.location.href = "admin-login.html";
            } catch (error) {
                console.error("Error signing out:", error);
                showNotification("Error signing out", "error");
            }
        });
    }

    if (viewAllCustomers) {
        viewAllCustomers.addEventListener("click", viewAllCustomers);
    }

    if (addNewCustomer) {
        addNewCustomer.addEventListener("click", addNewCustomer);
    }

    if (viewAllPayments) {
        viewAllPayments.addEventListener("click", viewAllPayments);
    }

    if (processPayment) {
        processPayment.addEventListener("click", processPayment);
    }
}

function formatDate(date) {
    if (!date) return "N/A";
    const d = date.toDate();
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
