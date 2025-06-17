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
    onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { showLoading, hideLoading, showNotification, showModal, closeModal, formatDate, formatTime, formatStatus, formatServiceType, handleError } from "../utils.js";

// Import Firebase configuration
import { firebaseConfig } from '../firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
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

// Add event listeners for new appointment management features
function setupEventListeners() {
    if (refreshDashboard) {
        refreshDashboard.addEventListener("click", () => {
            loadDashboardStats();
            loadRecentAppointments();
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
    
    // Add new event listeners for appointment management
    const viewAllAppointmentsBtn = document.getElementById("viewAllAppointments");
    if (viewAllAppointmentsBtn) {
        viewAllAppointmentsBtn.addEventListener("click", loadAllAppointments);
    }
    
    // Make functions available globally for onclick handlers
    window.updateAppointmentStatus = updateAppointmentStatus;
    window.cancelAppointment = cancelAppointment;
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin dashboard initialized");
});

// Customer Management Functions
async function viewAllCustomers() {
    try {
        showLoading("Loading customers...");
        const customersQuery = query(
            collection(db, "users"),
            where("role", "==", "customer"),
            orderBy("createdAt", "desc")
        );
        
        const customersSnapshot = await getDocs(customersQuery);
        const customers = customersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        showCustomersModal(customers);
    } catch (error) {
        handleError(error, "Error loading customers");
    } finally {
        hideLoading();
    }
}

function showCustomersModal(customers) {
    const content = `
        <h2>All Customers</h2>
        <div class="customers-list">
            ${customers.map(customer => `
                <div class="customer-card" data-id="${customer.id}">
                    <div class="customer-header">
                        <h3>${customer.displayName || 'No Name'}</h3>
                        <span class="status ${customer.status || 'active'}">${formatStatus(customer.status || 'active')}</span>
                    </div>
                    <div class="customer-details">
                        <p><strong>Email:</strong> ${customer.email}</p>
                        <p><strong>Phone:</strong> ${customer.phone || 'Not provided'}</p>
                        <p><strong>Address:</strong> ${customer.address || 'Not provided'}</p>
                        <p><strong>Member Since:</strong> ${formatDate(customer.createdAt)}</p>
                    </div>
                    <div class="customer-actions">
                        <button onclick="viewCustomerDetails('${customer.id}')" class="btn-primary">
                            View Details
                        </button>
                        <button onclick="editCustomer('${customer.id}')" class="btn-secondary">
                            Edit
                        </button>
                        ${customer.status !== 'inactive' ? `
                            <button onclick="deactivateCustomer('${customer.id}')" class="btn-danger">
                                Deactivate
                            </button>
                        ` : `
                            <button onclick="activateCustomer('${customer.id}')" class="btn-success">
                                Activate
                            </button>
                        `}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    showModal(content);
}

async function addNewCustomer() {
    const content = `
        <h2>Add New Customer</h2>
        <form id="newCustomerForm" class="form">
            <div class="form-group">
                <label for="customerName">Full Name</label>
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
            <div class="form-actions">
                <button type="submit" class="btn-primary">Add Customer</button>
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `;
    
    const modal = showModal(content);
    const form = modal.querySelector('#newCustomerForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            showLoading("Adding new customer...");
            
            const customerData = {
                displayName: form.customerName.value,
                email: form.customerEmail.value,
                phone: form.customerPhone.value,
                address: form.customerAddress.value,
                role: 'customer',
                status: 'active',
                createdAt: serverTimestamp()
            };
            
            // Create user document
            const userRef = doc(collection(db, "users"));
            await setDoc(userRef, customerData);
            
            showNotification("Customer added successfully");
            closeModal();
            viewAllCustomers(); // Refresh the customers list
        } catch (error) {
            handleError(error, "Error adding customer");
        } finally {
            hideLoading();
        }
    });
}

async function viewCustomerDetails(customerId) {
    try {
        showLoading("Loading customer details...");
        
        // Get customer data
        const customerDoc = await getDoc(doc(db, "users", customerId));
        if (!customerDoc.exists()) {
            throw new Error("Customer not found");
        }
        
        const customer = customerDoc.data();
        
        // Get customer's appointments
        const appointmentsQuery = query(
            collection(db, "appointments"),
            where("userId", "==", customerId),
            orderBy("date", "desc")
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointments = appointmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Get customer's payments
        const paymentsQuery = query(
            collection(db, "payments"),
            where("userId", "==", customerId),
            orderBy("date", "desc")
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const payments = paymentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        const content = `
            <h2>Customer Details</h2>
            <div class="customer-profile">
                <div class="profile-header">
                    <h3>${customer.displayName || 'No Name'}</h3>
                    <span class="status ${customer.status || 'active'}">${formatStatus(customer.status || 'active')}</span>
                </div>
                <div class="profile-details">
                    <p><strong>Email:</strong> ${customer.email}</p>
                    <p><strong>Phone:</strong> ${customer.phone || 'Not provided'}</p>
                    <p><strong>Address:</strong> ${customer.address || 'Not provided'}</p>
                    <p><strong>Member Since:</strong> ${formatDate(customer.createdAt)}</p>
                </div>
            </div>
            
            <div class="customer-history">
                <h3>Recent Appointments</h3>
                <div class="appointments-list">
                    ${appointments.length > 0 ? appointments.map(appointment => `
                        <div class="appointment-item">
                            <p><strong>Service:</strong> ${formatServiceType(appointment.serviceType)}</p>
                            <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                            <p><strong>Status:</strong> ${formatStatus(appointment.status)}</p>
                        </div>
                    `).join('') : '<p>No appointments found</p>'}
                </div>
                
                <h3>Payment History</h3>
                <div class="payments-list">
                    ${payments.length > 0 ? payments.map(payment => `
                        <div class="payment-item">
                            <p><strong>Amount:</strong> $${payment.amount.toFixed(2)}</p>
                            <p><strong>Date:</strong> ${formatDate(payment.date)}</p>
                            <p><strong>Status:</strong> ${formatStatus(payment.status)}</p>
                        </div>
                    `).join('') : '<p>No payments found</p>'}
                </div>
            </div>
            
            <div class="modal-actions">
                <button onclick="editCustomer('${customerId}')" class="btn-primary">Edit Customer</button>
                <button onclick="closeModal()" class="btn-secondary">Close</button>
            </div>
        `;
        
        showModal(content);
    } catch (error) {
        handleError(error, "Error loading customer details");
    } finally {
        hideLoading();
    }
}

async function editCustomer(customerId) {
    try {
        showLoading("Loading customer data...");
        
        const customerDoc = await getDoc(doc(db, "users", customerId));
        if (!customerDoc.exists()) {
            throw new Error("Customer not found");
        }
        
        const customer = customerDoc.data();
        
        const content = `
            <h2>Edit Customer</h2>
            <form id="editCustomerForm" class="form">
                <div class="form-group">
                    <label for="customerName">Full Name</label>
                    <input type="text" id="customerName" value="${customer.displayName || ''}" required>
                </div>
                <div class="form-group">
                    <label for="customerEmail">Email</label>
                    <input type="email" id="customerEmail" value="${customer.email}" required>
                </div>
                <div class="form-group">
                    <label for="customerPhone">Phone</label>
                    <input type="tel" id="customerPhone" value="${customer.phone || ''}" required>
                </div>
                <div class="form-group">
                    <label for="customerAddress">Address</label>
                    <textarea id="customerAddress" required>${customer.address || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Save Changes</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        `;
        
        const modal = showModal(content);
        const form = modal.querySelector('#editCustomerForm');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                showLoading("Updating customer...");
                
                const updates = {
                    displayName: form.customerName.value,
                    email: form.customerEmail.value,
                    phone: form.customerPhone.value,
                    address: form.customerAddress.value,
                    updatedAt: serverTimestamp()
                };
                
                await updateDoc(doc(db, "users", customerId), updates);
                
                showNotification("Customer updated successfully");
                closeModal();
                viewAllCustomers(); // Refresh the customers list
            } catch (error) {
                handleError(error, "Error updating customer");
            } finally {
                hideLoading();
            }
        });
    } catch (error) {
        handleError(error, "Error loading customer data");
    } finally {
        hideLoading();
    }
}

async function deactivateCustomer(customerId) {
    try {
        showLoading("Deactivating customer...");
        
        await updateDoc(doc(db, "users", customerId), {
            status: 'inactive',
            updatedAt: serverTimestamp()
        });
        
        showNotification("Customer deactivated successfully");
        viewAllCustomers(); // Refresh the customers list
    } catch (error) {
        handleError(error, "Error deactivating customer");
    } finally {
        hideLoading();
    }
}

async function activateCustomer(customerId) {
    try {
        showLoading("Activating customer...");
        
        await updateDoc(doc(db, "users", customerId), {
            status: 'active',
            updatedAt: serverTimestamp()
        });
        
        showNotification("Customer activated successfully");
        viewAllCustomers(); // Refresh the customers list
    } catch (error) {
        handleError(error, "Error activating customer");
    } finally {
        hideLoading();
    }
}

// Make customer management functions available globally
window.viewCustomerDetails = viewCustomerDetails;
window.editCustomer = editCustomer;
window.deactivateCustomer = deactivateCustomer;
window.activateCustomer = activateCustomer;

// Payment Management Functions
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
                        <p><strong>Customer:</strong> ${payment.customerName}</p>
                        <p><strong>Method:</strong> ${payment.paymentMethod}</p>
                    </div>
                    <div class="payment-actions">
                        <button onclick="viewPaymentDetails('${payment.id}')" class="btn-primary">
                            View Details
                        </button>
                        ${payment.status === 'pending' ? `
                            <button onclick="processPayment('${payment.id}')" class="btn-success">
                                Process Payment
                            </button>
                        ` : ''}
                        ${payment.status === 'pending' ? `
                            <button onclick="cancelPayment('${payment.id}')" class="btn-danger">
                                Cancel
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    showModal(content);
}

// Enhanced Dashboard Statistics
async function loadEnhancedStats() {
    try {
        showLoading("Loading enhanced statistics...");
        
        // Get all payments for revenue analysis
        const paymentsQuery = query(
            collection(db, "payments"),
            where("status", "==", "completed")
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const payments = paymentsSnapshot.docs.map(doc => doc.data());
        
        // Calculate revenue metrics
        const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const monthlyRevenue = payments
            .filter(payment => {
                const paymentDate = payment.date.toDate();
                const now = new Date();
                return paymentDate.getMonth() === now.getMonth() && 
                       paymentDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, payment) => sum + payment.amount, 0);
        
        // Get service type breakdown
        const serviceTypes = {};
        payments.forEach(payment => {
            if (payment.items) {
                payment.items.forEach(item => {
                    serviceTypes[item.type] = (serviceTypes[item.type] || 0) + item.amount;
                });
            }
        });
        
        // Update dashboard stats
        document.getElementById("totalRevenue").textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById("monthlyRevenue").textContent = `$${monthlyRevenue.toFixed(2)}`;
        
        // Update service type breakdown chart
        updateServiceTypeChart(serviceTypes);
        
    } catch (error) {
        handleError(error, "Error loading enhanced statistics");
    } finally {
        hideLoading();
    }
}

// Customer Search and Filter
function setupCustomerSearch() {
    const searchInput = document.getElementById("customerSearch");
    if (searchInput) {
        searchInput.addEventListener("input", debounce(async (e) => {
            const searchTerm = e.target.value.toLowerCase();
            try {
                showLoading("Searching customers...");
                const customersQuery = query(
                    collection(db, "users"),
                    where("role", "==", "customer")
                );
                const customersSnapshot = await getDocs(customersQuery);
                const customers = customersSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(customer => 
                        customer.displayName.toLowerCase().includes(searchTerm) ||
                        customer.email.toLowerCase().includes(searchTerm) ||
                        (customer.phone && customer.phone.includes(searchTerm))
                    );
                showCustomersModal(customers);
            } catch (error) {
                handleError(error, "Error searching customers");
            } finally {
                hideLoading();
            }
        }, 300));
    }
}

// Customer Activity Log
async function viewCustomerActivity(customerId) {
    try {
        showLoading("Loading customer activity...");
        
        // Get customer's appointments
        const appointmentsQuery = query(
            collection(db, "appointments"),
            where("userId", "==", customerId),
            orderBy("date", "desc")
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointments = appointmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Get customer's payments
        const paymentsQuery = query(
            collection(db, "payments"),
            where("userId", "==", customerId),
            orderBy("date", "desc")
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const payments = paymentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Combine and sort activities
        const activities = [
            ...appointments.map(apt => ({
                type: 'appointment',
                date: apt.date,
                data: apt
            })),
            ...payments.map(payment => ({
                type: 'payment',
                date: payment.date,
                data: payment
            }))
        ].sort((a, b) => b.date.toDate() - a.date.toDate());
        
        const content = `
            <h2>Customer Activity Log</h2>
            <div class="activity-timeline">
                ${activities.map(activity => `
                    <div class="activity-item ${activity.type}">
                        <div class="activity-date">
                            ${formatDate(activity.date)}
                        </div>
                        <div class="activity-content">
                            ${activity.type === 'appointment' ? `
                                <h4>Appointment</h4>
                                <p><strong>Service:</strong> ${activity.data.service}</p>
                                <p><strong>Status:</strong> ${formatStatus(activity.data.status)}</p>
                            ` : `
                                <h4>Payment</h4>
                                <p><strong>Amount:</strong> $${activity.data.amount.toFixed(2)}</p>
                                <p><strong>Status:</strong> ${formatStatus(activity.data.status)}</p>
                            `}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        showModal(content);
    } catch (error) {
        handleError(error, "Error loading customer activity");
    } finally {
        hideLoading();
    }
}

// Service Type Management
async function manageServiceTypes() {
    try {
        showLoading("Loading service types...");
        
        const servicesQuery = query(collection(db, "services"));
        const servicesSnapshot = await getDocs(servicesQuery);
        const services = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        const content = `
            <h2>Manage Service Types</h2>
            <div class="services-list">
                ${services.map(service => `
                    <div class="service-card">
                        <h3>${service.name}</h3>
                        <p><strong>Price:</strong> $${service.price.toFixed(2)}</p>
                        <p><strong>Duration:</strong> ${service.duration} minutes</p>
                        <div class="service-actions">
                            <button onclick="editService('${service.id}')" class="btn-primary">
                                Edit
                            </button>
                            <button onclick="deleteService('${service.id}')" class="btn-danger">
                                Delete
                            </button>
                        </div>
                    </div>
                `).join('')}
                <button onclick="addNewService()" class="btn-success">
                    Add New Service
                </button>
            </div>
        `;
        
        showModal(content);
    } catch (error) {
        handleError(error, "Error loading service types");
    } finally {
        hideLoading();
    }
}

// Payment Reports
async function generatePaymentReport() {
    try {
        showLoading("Generating payment report...");
        
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1); // Last 30 days
        
        const paymentsQuery = query(
            collection(db, "payments"),
            where("date", ">=", startDate),
            orderBy("date", "desc")
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const payments = paymentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Calculate report metrics
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const completedPayments = payments.filter(p => p.status === 'completed');
        const pendingPayments = payments.filter(p => p.status === 'pending');
        const cancelledPayments = payments.filter(p => p.status === 'cancelled');
        
        const content = `
            <h2>Payment Report (Last 30 Days)</h2>
            <div class="report-summary">
                <div class="report-card">
                    <h3>Total Revenue</h3>
                    <p>$${totalAmount.toFixed(2)}</p>
                </div>
                <div class="report-card">
                    <h3>Completed Payments</h3>
                    <p>${completedPayments.length}</p>
                </div>
                <div class="report-card">
                    <h3>Pending Payments</h3>
                    <p>${pendingPayments.length}</p>
                </div>
                <div class="report-card">
                    <h3>Cancelled Payments</h3>
                    <p>${cancelledPayments.length}</p>
                </div>
            </div>
            <div class="report-details">
                <h3>Payment Details</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(payment => `
                            <tr>
                                <td>${formatDate(payment.date)}</td>
                                <td>${payment.customerName}</td>
                                <td>$${payment.amount.toFixed(2)}</td>
                                <td>${formatStatus(payment.status)}</td>
                                <td>${payment.paymentMethod}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="modal-actions">
                <button onclick="exportReport()" class="btn-primary">Export Report</button>
                <button onclick="closeModal()" class="btn-secondary">Close</button>
            </div>
        `;
        
        showModal(content);
    } catch (error) {
        handleError(error, "Error generating payment report");
    } finally {
        hideLoading();
    }
}

// Refund Handling
async function processRefund(paymentId) {
    try {
        showLoading("Processing refund...");
        
        const paymentRef = doc(db, "payments", paymentId);
        const paymentDoc = await getDoc(paymentRef);
        
        if (!paymentDoc.exists()) {
            throw new Error("Payment not found");
        }
        
        const payment = paymentDoc.data();
        
        // Create refund record
        const refundRef = doc(collection(db, "refunds"));
        await setDoc(refundRef, {
            paymentId: paymentId,
            userId: payment.userId,
            amount: payment.amount,
            reason: "Customer request",
            status: "pending",
            createdAt: serverTimestamp(),
            processedBy: auth.currentUser.uid
        });
        
        // Update payment status
        await updateDoc(paymentRef, {
            status: "refunded",
            refundedAt: serverTimestamp()
        });
        
        // Notify customer
        await notifyCustomerOfRefund(payment.userId, paymentId);
        
        showNotification("Refund processed successfully");
        viewAllPayments(); // Refresh the payments list
    } catch (error) {
        handleError(error, "Error processing refund");
    } finally {
        hideLoading();
    }
}

// Make new functions available globally
window.viewCustomerActivity = viewCustomerActivity;
window.manageServiceTypes = manageServiceTypes;
window.generatePaymentReport = generatePaymentReport;
window.processRefund = processRefund;
