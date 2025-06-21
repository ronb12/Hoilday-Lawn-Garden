import { getFirestore, collection, doc, setDoc, updateDoc, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "../firebase-config.js";

const db = getFirestore(app);

// Utility Functions
export function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const messageEl = document.getElementById('loadingMessage');
    if (overlay && messageEl) {
        messageEl.textContent = message;
        overlay.style.display = 'flex';
    }
}

export function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

export function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <div class="notification-content">
            <p>${message}</p>
        </div>
    `;

    container.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        default:
            return 'fa-info-circle';
    }
}

export function showModal(content) {
    const modal = document.getElementById('appointmentModal');
    const modalContent = modal.querySelector('.modal-content');
    if (modal && modalContent) {
        modalContent.innerHTML = content;
        modal.style.display = 'flex';
    }
}

export function closeModal() {
    const modal = document.getElementById('appointmentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

export async function createNotification(userId, type, title, message, data = {}) {
    try {
        const notificationRef = doc(collection(db, 'notifications'));
        await setDoc(notificationRef, {
            userId,
            type,
            title,
            message,
            data,
            read: false,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

export async function markNotificationAsRead(notificationId) {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            read: true,
            readAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

export function setupNotificationListener(userId, callback) {
    const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(notificationsQuery, (snapshot) => {
        const notifications = [];
        snapshot.forEach((doc) => {
            notifications.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(notifications);
    });
} 