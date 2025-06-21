// Use global window.db

// View messages
async function viewMessages() {
    try {
        window.showLoading("Loading messages...");
        const messagesSnapshot = await window.db.collection("messages").orderBy("timestamp", "desc").get();
        window.showModal(`
            <div class="modal-header">
                <h2>Messages</h2>
                <button class="modal-close" onclick="window.closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="messages-grid">
                    ${messagesSnapshot.docs.map(doc => {
                        const message = doc.data();
                        return `
                            <div class="message-card">
                                <h3>${message.subject}</h3>
                                <p><i class="fas fa-user"></i> From: ${message.senderName}</p>
                                <p><i class="fas fa-calendar"></i> ${window.formatDate(message.timestamp)}</p>
                                <p><i class="fas fa-info-circle"></i> ${message.content}</p>
                                <div class="message-actions">
                                    <button onclick="window.communication.replyToMessage('${doc.id}')" class="btn btn-primary"><i class="fas fa-reply"></i> Reply</button>
                                    <button onclick="window.communication.deleteMessage('${doc.id}')" class="btn btn-danger"><i class="fas fa-trash"></i> Delete</button>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `);
    } catch (error) {
        console.error("Error loading messages:", error);
        window.showNotification("Error loading messages", "error");
    } finally {
        window.hideLoading();
    }
}

// Send bulk message
async function sendBulkMessage() {
    try {
        window.showModal(`
            <div class="modal-header">
                <h2>Send Bulk Message</h2>
                <button class="modal-close" onclick="window.closeModal()">&times;</button>
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
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                senderName: "Admin",
                senderId: "admin"
            };
            try {
                await window.db.collection("messages").add(messageData);
                window.showNotification("Bulk message sent successfully", "success");
                window.closeModal();
            } catch (error) {
                console.error("Error sending bulk message:", error);
                window.showNotification("Error sending bulk message", "error");
            }
        });
    } catch (error) {
        console.error("Error showing bulk message form:", error);
        window.showNotification("Error showing bulk message form", "error");
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
    replyToMessage: (id) => window.showNotification("Reply to message functionality coming soon", "info"),
    deleteMessage: (id) => window.showNotification("Delete message functionality coming soon", "info")
}; 