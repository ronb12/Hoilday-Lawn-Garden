// Utility functions for both admin and customer dashboards
// No imports, use global firebase

// Notification system
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.getElementById("notification-styles")) {
        const style = document.createElement("style");
        style.id = "notification-styles";
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 1rem;
                z-index: 1000;
                max-width: 300px;
                border-left: 4px solid #4caf50;
                animation: slideIn 0.3s ease-out;
            }
            .notification-error {
                border-left-color: #f44336;
            }
            .notification-warning {
                border-left-color: #ff9800;
            }
            .notification-info {
                border-left-color: #2196f3;
            }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #666;
                margin-left: 0.5rem;
            }
            .notification-close:hover {
                color: #333;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Loading indicator
function showLoading(message = "Loading...") {
    const overlay = document.getElementById("loadingOverlay");
    const messageEl = document.getElementById("loadingMessage");
    if (overlay) {
        if (messageEl) messageEl.textContent = message;
        overlay.classList.remove("hidden");
    }
}

function hideLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
        overlay.classList.add("hidden");
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
        const userDoc = await window.db.collection("users").doc(userId).get();
        return userDoc.exists ? userDoc.data() : null;
    } catch (error) {
        handleError(error, "Error fetching user data");
        return null;
    }
}

async function updateUserData(userId, data) {
    try {
        await window.db.collection("users").doc(userId).update({
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

// Loading overlay styles
if (!document.getElementById("loading-overlay-styles")) {
    const style = document.createElement("style");
    style.id = "loading-overlay-styles";
    style.textContent = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
        }
        .loading-overlay.hidden {
            display: none;
        }
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4caf50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

console.log("Utility functions loaded successfully");