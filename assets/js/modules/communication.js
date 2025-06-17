// Import Firebase modules
import { getFirestore, collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { showLoading, hideLoading, showNotification, showModal, closeModal } from "../utils.js";

const db = getFirestore();

// View messages
export async function viewMessages() {
    try {
        showLoading("Loading messages...");
        const messagesQuery = query(
            collection(db, "messages"),
            orderBy("timestamp", "desc")
        );
        const messagesSnapshot = await getDocs(messagesQuery);

        showModal(`
            <div class="modal-header">
                <h2>Messages</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="messages-grid">
                    ${messagesSnapshot.docs.map(doc => {
                        const message = doc.data();
                        return `
                            <div class="message-card">
                                <h3>${message.subject}</h3>
                                <p><i class="fas fa-user"></i> From: ${message.senderName}</p>
                                <p><i class="fas fa-calendar"></i> ${formatDate(message.timestamp)}</p>
                                <p><i class="fas fa-info-circle"></i> ${message.content}</p>
                                <div class="message-actions">
                                    <button onclick="communication.replyToMessage('${doc.id}')" class="btn btn-primary">
                                        <i class="fas fa-reply"></i> Reply
                                    </button>
                                    <button onclick="communication.deleteMessage('${doc.id}')" class="btn btn-danger">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `);
    } catch (error) {
        console.error("Error loading messages:", error);
        showNotification("Error loading messages", "error");
    } finally {
        hideLoading();
    }
}

// Send bulk message
export async function sendBulkMessage() {
    try {
        showModal(`
            <div class="modal-header">
                <h2>Send Bulk Message</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="bulkMessageForm" class="form">
                    <div class="form-group">
                        <label for="subject">Subject</label>
                        <input type="text" id="subject" name="subject" required>
                    </div>
                    <div class="form-group">
                        <label for="content">Message</label>
                        <textarea id="content" name="content" rows="5" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="recipients">Recipients</label>
                        <select id="recipients" name="recipients" multiple required>
                            <option value="all">All Customers</option>
                            <option value="active">Active Customers</option>
                            <option value="inactive">Inactive Customers</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Send Message</button>
                    </div>
                </form>
            </div>
        `);

        document.getElementById("bulkMessageForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const messageData = {
                subject: formData.get("subject"),
                content: formData.get("content"),
                recipients: formData.getAll("recipients"),
                timestamp: serverTimestamp(),
                senderName: "Admin",
                senderId: "admin"
            };

            try {
                await addDoc(collection(db, "messages"), messageData);
                showNotification("Bulk message sent successfully", "success");
                closeModal();
            } catch (error) {
                console.error("Error sending bulk message:", error);
                showNotification("Error sending bulk message", "error");
            }
        });
    } catch (error) {
        console.error("Error showing bulk message form:", error);
        showNotification("Error showing bulk message form", "error");
    }
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

// Export functions for use in HTML
window.communication = {
    viewMessages,
    sendBulkMessage,
    replyToMessage: (id) => {
        // TODO: Implement reply to message functionality
        showNotification("Reply to message functionality coming soon", "info");
    },
    deleteMessage: (id) => {
        // TODO: Implement delete message functionality
        showNotification("Delete message functionality coming soon", "info");
    }
}; 