import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACm0j7I8RX4ExIQRoejfk1HZMOQRGigBw",
    authDomain: "holiday-lawn-and-garden.firebaseapp.com",
    projectId: "holiday-lawn-and-garden",
    storageBucket: "holiday-lawn-and-garden.firebasestorage.app",
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
const reportContainer = document.getElementById('report-container');
const reportTypeSelect = document.getElementById('report-type');
const dateRangeStart = document.getElementById('date-range-start');
const dateRangeEnd = document.getElementById('date-range-end');
const generateBtn = document.getElementById('generate-report');
const exportBtn = document.getElementById('export-report');

let reportData = {
    payments: [],
    appointments: [],
    customers: [],
    staff: [],
    inventory: [],
    messages: []
};

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.email && user.email.includes('admin')) {
            loadAllData();
            setupEventListeners();
        } else {
            window.location.href = 'admin-login.html';
        }
    } else {
        window.location.href = 'admin-login.html';
    }
});

// Load all data for reports
async function loadAllData() {
    try {
        loadingDiv.style.display = 'block';
        errorDiv.style.display = 'none';

        // Load payments
        const paymentsRef = collection(db, 'payments');
        onSnapshot(paymentsRef, (snapshot) => {
            reportData.payments = [];
            snapshot.forEach((doc) => {
                reportData.payments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        });

        // Load appointments
        const appointmentsRef = collection(db, 'appointments');
        onSnapshot(appointmentsRef, (snapshot) => {
            reportData.appointments = [];
            snapshot.forEach((doc) => {
                reportData.appointments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        });

        // Load customers
        const customersRef = collection(db, 'customers');
        onSnapshot(customersRef, (snapshot) => {
            reportData.customers = [];
            snapshot.forEach((doc) => {
                reportData.customers.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        });

        // Load staff
        const staffRef = collection(db, 'staff');
        onSnapshot(staffRef, (snapshot) => {
            reportData.staff = [];
            snapshot.forEach((doc) => {
                reportData.staff.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        });

        // Load inventory
        const inventoryRef = collection(db, 'inventory');
        onSnapshot(inventoryRef, (snapshot) => {
            reportData.inventory = [];
            snapshot.forEach((doc) => {
                reportData.inventory.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        });

        // Load messages
        const messagesRef = collection(db, 'messages');
        onSnapshot(messagesRef, (snapshot) => {
            reportData.messages = [];
            snapshot.forEach((doc) => {
                reportData.messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        });

        loadingDiv.style.display = 'none';

    } catch (error) {
        console.error('Error loading report data:', error);
        showError('Failed to load report data. Please try again.');
    }
}

// Setup event listeners
function setupEventListeners() {
    generateBtn.addEventListener('click', generateReport);
    exportBtn.addEventListener('click', exportReport);
    
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    dateRangeStart.value = startDate.toISOString().split('T')[0];
    dateRangeEnd.value = endDate.toISOString().split('T')[0];
}

// Generate report
function generateReport() {
    const reportType = reportTypeSelect.value;
    const startDate = new Date(dateRangeStart.value);
    const endDate = new Date(dateRangeEnd.value);
    
    if (startDate > endDate) {
        showError('Start date must be before end date.');
        return;
    }

    loadingDiv.style.display = 'block';
    
    setTimeout(() => {
        let reportContent = '';
        
        switch (reportType) {
            case 'financial':
                reportContent = generateFinancialReport(startDate, endDate);
                break;
            case 'operational':
                reportContent = generateOperationalReport(startDate, endDate);
                break;
            case 'customer':
                reportContent = generateCustomerReport(startDate, endDate);
                break;
            case 'staff':
                reportContent = generateStaffReport();
                break;
            case 'inventory':
                reportContent = generateInventoryReport();
                break;
            case 'comprehensive':
                reportContent = generateComprehensiveReport(startDate, endDate);
                break;
            default:
                reportContent = '<p>Please select a report type.</p>';
        }
        
        reportContainer.innerHTML = reportContent;
        loadingDiv.style.display = 'none';
        exportBtn.style.display = 'inline-block';
    }, 1000);
}

// Generate financial report
function generateFinancialReport(startDate, endDate) {
    const paymentsInRange = reportData.payments.filter(p => {
        const paymentDate = p.createdAt?.toDate() || new Date(p.createdAt);
        return paymentDate >= startDate && paymentDate <= endDate;
    });
    
    const totalRevenue = paymentsInRange.reduce((sum, p) => sum + (p.amount || 0), 0);
    const successfulPayments = paymentsInRange.filter(p => p.status === 'completed').length;
    const failedPayments = paymentsInRange.filter(p => p.status === 'failed').length;
    const pendingPayments = paymentsInRange.filter(p => p.status === 'pending').length;
    
    return `
        <div style="padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2>Financial Report</h2>
            <p><strong>Period:</strong> ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
                <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>$${totalRevenue.toFixed(2)}</h3>
                    <p>Total Revenue</p>
                </div>
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${successfulPayments}</h3>
                    <p>Successful Payments</p>
                </div>
                <div style="background: #fff3e0; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${pendingPayments}</h3>
                    <p>Pending Payments</p>
                </div>
                <div style="background: #ffebee; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${failedPayments}</h3>
                    <p>Failed Payments</p>
                </div>
            </div>
            
            <h3>Payment Methods</h3>
            <div style="margin: 1rem 0;">
                ${generatePaymentMethodBreakdown(paymentsInRange)}
            </div>
        </div>
    `;
}

// Generate operational report
function generateOperationalReport(startDate, endDate) {
    const appointmentsInRange = reportData.appointments.filter(a => {
        const appointmentDate = a.createdAt?.toDate() || new Date(a.createdAt);
        return appointmentDate >= startDate && appointmentDate <= endDate;
    });
    
    const totalAppointments = appointmentsInRange.length;
    const completedAppointments = appointmentsInRange.filter(a => a.status === 'completed').length;
    const cancelledAppointments = appointmentsInRange.filter(a => a.status === 'cancelled').length;
    const completionRate = totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0;
    
    return `
        <div style="padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2>Operational Report</h2>
            <p><strong>Period:</strong> ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
                <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalAppointments}</h3>
                    <p>Total Appointments</p>
                </div>
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${completedAppointments}</h3>
                    <p>Completed</p>
                </div>
                <div style="background: #fff3e0; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${cancelledAppointments}</h3>
                    <p>Cancelled</p>
                </div>
                <div style="background: #f3e5f5; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${completionRate}%</h3>
                    <p>Completion Rate</p>
                </div>
            </div>
            
            <h3>Service Distribution</h3>
            <div style="margin: 1rem 0;">
                ${generateServiceBreakdown(appointmentsInRange)}
            </div>
        </div>
    `;
}

// Generate customer report
function generateCustomerReport(startDate, endDate) {
    const customersInRange = reportData.customers.filter(c => {
        const customerDate = c.createdAt?.toDate() || new Date(c.createdAt);
        return customerDate >= startDate && customerDate <= endDate;
    });
    
    const totalCustomers = reportData.customers.length;
    const newCustomers = customersInRange.length;
    const activeCustomers = reportData.customers.filter(c => c.status === 'active').length;
    const avgRating = reportData.customers.length > 0 
        ? (reportData.customers.reduce((sum, c) => sum + (c.rating || 0), 0) / reportData.customers.length).toFixed(1)
        : '0.0';
    
    return `
        <div style="padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2>Customer Report</h2>
            <p><strong>Period:</strong> ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
                <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalCustomers}</h3>
                    <p>Total Customers</p>
                </div>
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${newCustomers}</h3>
                    <p>New Customers</p>
                </div>
                <div style="background: #fff3e0; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${activeCustomers}</h3>
                    <p>Active Customers</p>
                </div>
                <div style="background: #f3e5f5; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${avgRating}/5.0</h3>
                    <p>Average Rating</p>
                </div>
            </div>
        </div>
    `;
}

// Generate staff report
function generateStaffReport() {
    const totalStaff = reportData.staff.length;
    const activeStaff = reportData.staff.filter(s => s.status === 'active').length;
    const managers = reportData.staff.filter(s => s.role === 'manager').length;
    const avgRating = reportData.staff.length > 0 
        ? (reportData.staff.reduce((sum, s) => sum + (s.rating || 0), 0) / reportData.staff.length).toFixed(1)
        : '0.0';
    
    return `
        <div style="padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2>Staff Report</h2>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
                <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalStaff}</h3>
                    <p>Total Staff</p>
                </div>
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${activeStaff}</h3>
                    <p>Active Staff</p>
                </div>
                <div style="background: #fff3e0; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${managers}</h3>
                    <p>Managers</p>
                </div>
                <div style="background: #f3e5f5; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${avgRating}/5.0</h3>
                    <p>Average Rating</p>
                </div>
            </div>
        </div>
    `;
}

// Generate inventory report
function generateInventoryReport() {
    const totalItems = reportData.inventory.length;
    const lowStock = reportData.inventory.filter(item => (item.quantity || 0) <= (item.reorderLevel || 10) && (item.quantity || 0) > 0).length;
    const outOfStock = reportData.inventory.filter(item => (item.quantity || 0) === 0).length;
    const totalValue = reportData.inventory.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
    
    return `
        <div style="padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2>Inventory Report</h2>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
                <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalItems}</h3>
                    <p>Total Items</p>
                </div>
                <div style="background: #fff3e0; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${lowStock}</h3>
                    <p>Low Stock</p>
                </div>
                <div style="background: #ffebee; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${outOfStock}</h3>
                    <p>Out of Stock</p>
                </div>
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>$${totalValue.toFixed(2)}</h3>
                    <p>Total Value</p>
                </div>
            </div>
        </div>
    `;
}

// Generate comprehensive report
function generateComprehensiveReport(startDate, endDate) {
    return `
        <div style="padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2>Comprehensive Business Report</h2>
            <p><strong>Period:</strong> ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            
            <div style="margin: 2rem 0;">
                ${generateFinancialReport(startDate, endDate).replace('<div style="padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">', '').replace('</div>', '')}
            </div>
            
            <div style="margin: 2rem 0;">
                ${generateOperationalReport(startDate, endDate).replace('<div style="padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">', '').replace('</div>', '')}
            </div>
            
            <div style="margin: 2rem 0;">
                ${generateCustomerReport(startDate, endDate).replace('<div style="padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">', '').replace('</div>', '')}
            </div>
            
            <div style="margin: 2rem 0;">
                ${generateStaffReport().replace('<div style="padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">', '').replace('</div>', '')}
            </div>
            
            <div style="margin: 2rem 0;">
                ${generateInventoryReport().replace('<div style="padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">', '').replace('</div>', '')}
            </div>
        </div>
    `;
}

// Helper functions
function generatePaymentMethodBreakdown(payments) {
    const methodCounts = {};
    payments.forEach(payment => {
        const method = payment.method || 'unknown';
        methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    
    return Object.entries(methodCounts).map(([method, count]) => 
        `<div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
            <span style="text-transform: capitalize;">${method}</span>
            <span>${count}</span>
        </div>`
    ).join('');
}

function generateServiceBreakdown(appointments) {
    const serviceCounts = {};
    appointments.forEach(appointment => {
        const service = appointment.serviceType || 'unknown';
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });
    
    return Object.entries(serviceCounts).map(([service, count]) => 
        `<div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
            <span style="text-transform: capitalize;">${service}</span>
            <span>${count}</span>
        </div>`
    ).join('');
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
}

// Export report
window.exportReport = function() {
    const reportType = reportTypeSelect.value;
    const reportContent = reportContainer.innerHTML;
    
    // Create a new window with the report content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h2 { color: #333; }
                    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
                    .stat-box { padding: 1rem; border-radius: 8px; text-align: center; }
                </style>
            </head>
            <body>
                ${reportContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
};
