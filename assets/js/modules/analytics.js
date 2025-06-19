// Use global window.db

// View analytics
async function viewAnalytics() {
    try {
        window.showLoading("Loading analytics...");
        
        const [revenueData, serviceData, customerData, staffData] = await Promise.all([
            getRevenueAnalytics(),
            getServiceAnalytics(),
            getCustomerAnalytics(),
            getStaffAnalytics()
        ]);

        const modalContent = `
            <div class="analytics-container">
                <div class="analytics-section">
                    <h3>Revenue Analytics</h3>
                    <canvas id="revenueChart"></canvas>
                    <div class="analytics-summary">
                        <p>Total Revenue: $${revenueData.total.toFixed(2)}</p>
                        <p>Average Transaction: $${revenueData.average.toFixed(2)}</p>
                    </div>
                </div>

                <div class="analytics-section">
                    <h3>Service Analytics</h3>
                    <canvas id="serviceChart"></canvas>
                    <div class="analytics-summary">
                        <p>Most Popular: ${serviceData.mostPopular}</p>
                        <p>Total Services: ${serviceData.total}</p>
                    </div>
                </div>

                <div class="analytics-section">
                    <h3>Customer Analytics</h3>
                    <canvas id="customerChart"></canvas>
                    <div class="analytics-summary">
                        <p>Total Customers: ${customerData.total}</p>
                        <p>New This Month: ${customerData.newThisMonth}</p>
                    </div>
                </div>

                <div class="analytics-section">
                    <h3>Staff Performance</h3>
                    <canvas id="staffChart"></canvas>
                    <div class="analytics-summary">
                        <p>Top Performer: ${staffData.topPerformer}</p>
                        <p>Average Rating: ${staffData.averageRating.toFixed(1)}</p>
                    </div>
                </div>
            </div>
        `;

        window.showModal("Analytics Dashboard", modalContent);

        // Initialize charts after modal is shown
        initializeCharts(revenueData, serviceData, customerData, staffData);
    } catch (error) {
        console.error("Error loading analytics:", error);
        window.showNotification("Error loading analytics", "error");
    } finally {
        window.hideLoading();
    }
}

// Get revenue analytics
async function getRevenueAnalytics() {
    const paymentsSnapshot = await window.db.collection("payments").orderBy("date", "desc").get();
    const payments = paymentsSnapshot.docs.map(doc => doc.data());
    
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const average = total / (payments.length || 1);
    
    const monthlyData = {};
    payments.forEach(payment => {
        const month = new Date(payment.date).toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
    });

    return {
        total,
        average,
        monthlyData
    };
}

// Get service analytics
async function getServiceAnalytics() {
    const appointmentsSnapshot = await window.db.collection("appointments").orderBy("date", "desc").get();
    const appointments = appointmentsSnapshot.docs.map(doc => doc.data());
    
    const serviceCounts = {};
    appointments.forEach(appointment => {
        const service = appointment.service;
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });
    
    const mostPopular = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    return {
        mostPopular,
        total: appointments.length,
        serviceCounts
    };
}

// Get customer analytics
async function getCustomerAnalytics() {
    const customersSnapshot = await window.db.collection("customers").orderBy("createdAt", "desc").get();
    const customers = customersSnapshot.docs.map(doc => doc.data());
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = customers.filter(
        customer => new Date(customer.createdAt) >= startOfMonth
    ).length;

    return {
        total: customers.length,
        newThisMonth
    };
}

// Get staff analytics
async function getStaffAnalytics() {
    const staffSnapshot = await window.db.collection("staff").get();
    const staff = staffSnapshot.docs.map(doc => doc.data());
    
    const topPerformer = staff
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.name || "None";
    
    const averageRating = staff.reduce((sum, member) => sum + (member.rating || 0), 0) / 
        (staff.length || 1);

    return {
        topPerformer,
        averageRating,
        staff
    };
}

// Initialize charts
function initializeCharts(revenueData, serviceData, customerData, staffData) {
    // Revenue Chart
    new Chart(document.getElementById("revenueChart"), {
        type: "line",
        data: {
            labels: Object.keys(revenueData.monthlyData),
            datasets: [{
                label: "Monthly Revenue",
                data: Object.values(revenueData.monthlyData),
                borderColor: "#4CAF50",
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Service Chart
    new Chart(document.getElementById("serviceChart"), {
        type: "pie",
        data: {
            labels: Object.keys(serviceData.serviceCounts),
            datasets: [{
                data: Object.values(serviceData.serviceCounts),
                backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#F44336"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Staff Chart
    new Chart(document.getElementById("staffChart"), {
        type: "bar",
        data: {
            labels: staffData.staff.map(member => member.name),
            datasets: [{
                label: "Rating",
                data: staffData.staff.map(member => member.rating || 0),
                backgroundColor: "#4CAF50"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
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

// Expose main function
window.analytics = { viewAnalytics }; 