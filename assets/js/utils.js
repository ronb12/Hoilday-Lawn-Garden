// Utility functions for both admin and customer dashboards
// No imports, use global firebase

const db = firebase.firestore();

// Notification system
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Loading indicator
function showLoading(message = "Loading...") {
    const loading = document.createElement("div");
    loading.id = "loadingOverlay";
    loading.innerHTML = `
        <div class="loading-spinner"></div>
        <p>${message}</p>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById("loadingOverlay");
    if (loading) {
        loading.remove();
    }
}

// Modal system
function showModal(content) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    const closeButton = modal.querySelector(".close-button");
    closeButton.onclick = () => modal.remove();
    return modal;
}

function closeModal() {
    const modal = document.querySelector(".modal");
    if (modal) {
        modal.remove();
    }
}

// Date formatting
function formatDate(date) {
    if (!date) return "N/A";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

// Time formatting
function formatTime(time) {
    if (!time) return "N/A";
    const d = time instanceof Date ? time : new Date(time);
    return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Status formatting
function formatStatus(status) {
    const statusMap = {
        "scheduled": "Scheduled",
        "in-progress": "In Progress",
        "completed": "Completed",
        "cancelled": "Cancelled",
        "pending": "Pending",
        "paid": "Paid",
        "unpaid": "Unpaid"
    };
    return statusMap[status] || status;
}

// Service type formatting
function formatServiceType(type) {
    const typeMap = {
        "lawn-mowing": "Lawn Mowing",
        "hedge-trimming": "Hedge Trimming",
        "garden-maintenance": "Garden Maintenance",
        "irrigation": "Irrigation",
        "landscaping": "Landscaping"
    };
    return typeMap[type] || type;
}

// Error handling
function handleError(error, message = "An error occurred") {
    console.error(message, error);
    showNotification(message, "error");
}

// Data validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^\+?[\d\s-]{10,}$/.test(phone);
}

// Firestore helpers
async function getUserData(userId) {
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        return userDoc.exists ? userDoc.data() : null;
    } catch (error) {
        handleError(error, "Error fetching user data");
        return null;
    }
}

async function updateUserData(userId, data) {
    try {
        await db.collection("users").doc(userId).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        handleError(error, "Error updating user data");
        return false;
    }
}

// Expose functions globally
window.showNotification = showNotification;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showModal = showModal;
window.closeModal = closeModal;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.formatStatus = formatStatus;
window.formatServiceType = formatServiceType;
window.handleError = handleError;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.getUserData = getUserData;
window.updateUserData = updateUserData;