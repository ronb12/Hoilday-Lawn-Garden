import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxGUOlJv6XqJGvHhJhHhJhHhJhHhJhHhJh",
    authDomain: "holliday-lawn-garden.firebaseapp.com",
    projectId: "holliday-lawn-garden",
    storageBucket: "holliday-lawn-garden.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM elements
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const revenueChart = document.getElementById('revenue-chart');
const appointmentsChart = document.getElementById('appointments-chart');
const servicesChart = document.getElementById('services-chart');
const customerGrowthChart = document.getElementById('customer-growth-chart');

// Stats elements
const totalRevenueEl = document.getElementById('total-revenue');
const totalAppointmentsEl = document.getElementById('total-appointments');
const totalCustomersEl = document.getElementById('total-customers');
const avgRatingEl = document.getElementById('avg-rating');
const monthlyRevenueEl = document.getElementById('monthly-revenue');
const monthlyAppointmentsEl = document.getElementById('monthly-appointments');
const completionRateEl = document.getElementById('completion-rate');
const customerSatisfactionEl = document.getElementById('customer-satisfaction');

let analyticsData = {
    payments: [],
    appointments: [],
    customers: [],
    services: []
};

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.email && user.email.includes('admin')) {
            loadAnalyticsData();
        } else {
            window.location.href = 'admin-login.html';
        }
    } else {
        window.location.href = 'admin-login.html';
    }
});

// Load all analytics data
async function loadAnalyticsData() {
    try {
        loadingDiv.style.display = 'block';
        errorDiv.style.display = 'none';

        // Load payments
        const paymentsRef = collection(db, 'payments');
        onSnapshot(paymentsRef, (snapshot) => {
            analyticsData.payments = [];
            snapshot.forEach((doc) => {
                analyticsData.payments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            updateAnalytics();
        });

        // Load appointments
        const appointmentsRef = collection(db, 'appointments');
        onSnapshot(appointmentsRef, (snapshot) => {
            analyticsData.appointments = [];
            snapshot.forEach((doc) => {
                analyticsData.appointments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            updateAnalytics();
        });

        // Load customers
        const customersRef = collection(db, 'customers');
        onSnapshot(customersRef, (snapshot) => {
            analyticsData.customers = [];
            snapshot.forEach((doc) => {
                analyticsData.customers.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            updateAnalytics();
        });

        // Load services
        const servicesRef = collection(db, 'services');
        onSnapshot(servicesRef, (snapshot) => {
            analyticsData.services = [];
            snapshot.forEach((doc) => {
                analyticsData.services.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            updateAnalytics();
        });

    } catch (error) {
        console.error('Error loading analytics data:', error);
        showError('Failed to load analytics data. Please try again.');
    }
}

// Update all analytics
function updateAnalytics() {
    if (analyticsData.payments.length > 0 || analyticsData.appointments.length > 0 || 
        analyticsData.customers.length > 0 || analyticsData.services.length > 0) {
        
        updateStats();
        updateCharts();
        loadingDiv.style.display = 'none';
    }
}

// Update statistics
function updateStats() {
    // Revenue calculations
    const totalRevenue = analyticsData.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    const monthlyRevenue = analyticsData.payments.filter(p => {
        const paymentDate = p.createdAt?.toDate() || new Date(p.createdAt);
        return paymentDate > thisMonth;
    }).reduce((sum, p) => sum + (p.amount || 0), 0);

    // Appointment calculations
    const totalAppointments = analyticsData.appointments.length;
    const monthlyAppointments = analyticsData.appointments.filter(a => {
        const appointmentDate = a.createdAt?.toDate() || new Date(a.createdAt);
        return appointmentDate > thisMonth;
    }).length;
    const completedAppointments = analyticsData.appointments.filter(a => a.status === 'completed').length;
    const completionRate = totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0;

    // Customer calculations
    const totalCustomers = analyticsData.customers.length;
    const avgRating = analyticsData.customers.length > 0 
        ? (analyticsData.customers.reduce((sum, c) => sum + (c.rating || 0), 0) / analyticsData.customers.length).toFixed(1)
        : '0.0';

    // Update DOM elements
    totalRevenueEl.textContent = `$${totalRevenue.toFixed(2)}`;
    totalAppointmentsEl.textContent = totalAppointments;
    totalCustomersEl.textContent = totalCustomers;
    avgRatingEl.textContent = avgRating;
    monthlyRevenueEl.textContent = `$${monthlyRevenue.toFixed(2)}`;
    monthlyAppointmentsEl.textContent = monthlyAppointments;
    completionRateEl.textContent = `${completionRate}%`;
    customerSatisfactionEl.textContent = `${avgRating}/5.0`;
}

// Update charts
function updateCharts() {
    updateRevenueChart();
    updateAppointmentsChart();
    updateServicesChart();
    updateCustomerGrowthChart();
}

// Revenue chart
function updateRevenueChart() {
    const monthlyData = getMonthlyData(analyticsData.payments, 'amount');
    
    revenueChart.innerHTML = `
        <div style="padding: 1rem; text-align: center;">
            <h4>Monthly Revenue</h4>
            <div style="display: flex; justify-content: space-between; align-items: end; height: 200px; margin-top: 1rem;">
                ${monthlyData.map(month => `
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="background: linear-gradient(to top, #4CAF50, #8BC34A); 
                                    width: 30px; height: ${Math.max(20, (month.value / Math.max(...monthlyData.map(m => m.value))) * 180)}px; 
                                    border-radius: 4px 4px 0 0;"></div>
                        <div style="font-size: 0.8rem; margin-top: 0.5rem;">${month.label}</div>
                        <div style="font-size: 0.7rem; color: #666;">$${month.value.toFixed(0)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Appointments chart
function updateAppointmentsChart() {
    const monthlyData = getMonthlyData(analyticsData.appointments, 'count');
    
    appointmentsChart.innerHTML = `
        <div style="padding: 1rem; text-align: center;">
            <h4>Monthly Appointments</h4>
            <div style="display: flex; justify-content: space-between; align-items: end; height: 200px; margin-top: 1rem;">
                ${monthlyData.map(month => `
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="background: linear-gradient(to top, #2196F3, #03A9F4); 
                                    width: 30px; height: ${Math.max(20, (month.value / Math.max(...monthlyData.map(m => m.value))) * 180)}px; 
                                    border-radius: 4px 4px 0 0;"></div>
                        <div style="font-size: 0.8rem; margin-top: 0.5rem;">${month.label}</div>
                        <div style="font-size: 0.7rem; color: #666;">${month.value}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Services chart
function updateServicesChart() {
    const serviceCounts = {};
    analyticsData.appointments.forEach(appointment => {
        if (appointment.serviceType) {
            serviceCounts[appointment.serviceType] = (serviceCounts[appointment.serviceType] || 0) + 1;
        }
    });

    const serviceData = Object.entries(serviceCounts).map(([service, count]) => ({
        service,
        count
    })).sort((a, b) => b.count - a.count);

    servicesChart.innerHTML = `
        <div style="padding: 1rem; text-align: center;">
            <h4>Service Distribution</h4>
            <div style="margin-top: 1rem;">
                ${serviceData.map(service => `
                    <div style="display: flex; justify-content: space-between; align-items: center; 
                                margin: 0.5rem 0; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <span>${service.service}</span>
                        <span style="background: #FF9800; color: white; padding: 0.2rem 0.5rem; 
                                    border-radius: 12px; font-size: 0.8rem;">${service.count}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Customer growth chart
function updateCustomerGrowthChart() {
    const monthlyData = getMonthlyData(analyticsData.customers, 'count');
    
    customerGrowthChart.innerHTML = `
        <div style="padding: 1rem; text-align: center;">
            <h4>Customer Growth</h4>
            <div style="display: flex; justify-content: space-between; align-items: end; height: 200px; margin-top: 1rem;">
                ${monthlyData.map(month => `
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="background: linear-gradient(to top, #9C27B0, #E91E63); 
                                    width: 30px; height: ${Math.max(20, (month.value / Math.max(...monthlyData.map(m => m.value))) * 180)}px; 
                                    border-radius: 4px 4px 0 0;"></div>
                        <div style="font-size: 0.8rem; margin-top: 0.5rem;">${month.label}</div>
                        <div style="font-size: 0.7rem; color: #666;">${month.value}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Helper function to get monthly data
function getMonthlyData(data, valueType) {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        
        let value = 0;
        if (valueType === 'amount') {
            value = data.filter(item => {
                const itemDate = item.createdAt?.toDate() || new Date(item.createdAt);
                return itemDate.getMonth() === date.getMonth() && 
                       itemDate.getFullYear() === date.getFullYear();
            }).reduce((sum, item) => sum + (item.amount || 0), 0);
        } else {
            value = data.filter(item => {
                const itemDate = item.createdAt?.toDate() || new Date(item.createdAt);
                return itemDate.getMonth() === date.getMonth() && 
                       itemDate.getFullYear() === date.getFullYear();
            }).length;
        }
        
        months.push({ label: monthLabel, value });
    }
    
    return months;
}

// Utility functions
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
}

// Global functions
window.refreshAnalytics = function() {
    loadAnalyticsData();
};

window.exportAnalytics = function() {
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Metric,Value\n" +
        `Total Revenue,$${analyticsData.payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}\n` +
        `Total Appointments,${analyticsData.appointments.length}\n` +
        `Total Customers,${analyticsData.customers.length}\n` +
        `Average Rating,${analyticsData.customers.length > 0 ? (analyticsData.customers.reduce((sum, c) => sum + (c.rating || 0), 0) / analyticsData.customers.length).toFixed(1) : '0.0'}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
};
