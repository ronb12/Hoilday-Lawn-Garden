import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
// Check authentication
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Check if user is admin by looking up their role in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
                loadMessages();
                setupEventListeners();
            } else {
                window.location.href = 'admin-login.html';
            }
        } catch (error) {
            console.error('Error checking admin role:', error);
            window.location.href = 'admin-login.html';
        }
    } else {
        window.location.href = 'admin-login.html';
    }
});
// Load messages from Firebase
async function loadMessages() {
    try {
        loadingDiv.style.display = 'block';
        messagesTable.style.display = 'none';
        errorDiv.style.display = 'none';

        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'));
        
        onSnapshot(q, (snapshot) => {
            messages = [];
            snapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            updateStats();
            filterMessages();
            loadingDiv.style.display = 'none';
            messagesTable.style.display = 'table';
        });

    } catch (error) {
        console.error('Error loading messages:', error);
        showError('Failed to load messages. Please try again.');
    }
}

// Update statistics
function updateStats() {
    const total = messages.length;
    const unread = messages.filter(m => !m.read).length;
    const urgent = messages.filter(m => m.priority === 'urgent').length;
    const responded = messages.filter(m => m.status === 'responded').length;
    const responseRate = total > 0 ? ((responded / total) * 100).toFixed(1) : 0;

    totalMessagesEl.textContent = total;
    unreadMessagesEl.textContent = unread;
    urgentMessagesEl.textContent = urgent;
    responseRateEl.textContent = `${responseRate}%`;
}

// Filter messages
function filterMessages() {
    const searchTerm = searchInput.value.toLowerCase();
    const typeFilterValue = typeFilter.value;
    const statusFilterValue = statusFilter.value;
    const sortBy = sortBySelect.value;

    filteredMessages = messages.filter(message => {
        const matchesSearch = !searchTerm || 
            message.subject?.toLowerCase().includes(searchTerm) ||
            message.senderName?.toLowerCase().includes(searchTerm) ||
            message.senderEmail?.toLowerCase().includes(searchTerm) ||
            message.content?.toLowerCase().includes(searchTerm);
        
        const matchesType = !typeFilterValue || message.type === typeFilterValue;
        const matchesStatus = !statusFilterValue || message.status === statusFilterValue;

        return matchesSearch && matchesType && matchesStatus;
    });

    // Sort messages
    filteredMessages.sort((a, b) => {
        switch (sortBy) {
            case 'date':
                const dateA = a.createdAt?.toDate() || new Date(a.createdAt);
                const dateB = b.createdAt?.toDate() || new Date(b.createdAt);
                return dateB - dateA;
            case 'priority':
                const priorityOrder = { urgent: 3, high: 2, normal: 1, low: 0 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            case 'sender':
                return (a.senderName || '').localeCompare(b.senderName || '');
            case 'unread':
                return (a.read ? 1 : 0) - (b.read ? 1 : 0);
            default:
                return 0;
        }
    });

    renderMessages();
}

// Render messages in table
function renderMessages() {
    messagesTbody.innerHTML = '';

    if (filteredMessages.length === 0) {
        messagesTbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #666;">
                    No messages found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }

    filteredMessages.forEach(message => {
        const row = document.createElement('tr');
        const isUnread = !message.read;
        row.className = isUnread ? 'unread-message' : '';
        
        row.innerHTML = `
            <td>
                <div>
                    <strong style="${isUnread ? 'font-weight: bold;' : ''}">${message.subject || 'No Subject'}</strong>
                    <br>
                    <small style="color: #666;">From: ${message.senderName || message.senderEmail || 'Unknown'}</small>
                </div>
            </td>
            <td>
                <div>
                    <div>${message.senderName || 'N/A'}</div>
                    <div style="color: #666;">${message.senderEmail || 'N/A'}</div>
                </div>
            </td>
            <td>
                <span style="text-transform: capitalize;">${message.type || 'general'}</span>
            </td>
            <td>
                <span class="message-priority priority-${message.priority || 'normal'}">
                    ${message.priority || 'normal'}
                </span>
            </td>
            <td>
                <span class="message-status status-${message.status || 'new'}">
                    ${message.status || 'new'}
                </span>
            </td>
            <td>
                ${formatDate(message.createdAt)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-small" onclick="viewMessage('${message.id}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-primary btn-small" onclick="replyMessage('${message.id}')">
                        <i class="fas fa-reply"></i>
                        Reply
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteMessage('${message.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </td>
        `;
        messagesTbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterMessages);
    typeFilter.addEventListener('change', filterMessages);
    statusFilter.addEventListener('change', filterMessages);
    sortBySelect.addEventListener('change', filterMessages);
}

// Utility functions
function formatDate(date) {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
}

// Global functions
window.viewMessage = function(messageId) {
    const message = messages.find(m => m.id === messageId);
    if (message) {
        // Mark as read
        if (!message.read) {
            updateDoc(doc(db, 'messages', messageId), { read: true });
        }
        
        // Show message details
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.5); display: flex; align-items: center; 
            justify-content: center; z-index: 1000;
        `;
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80%; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3>${message.subject || 'No Subject'}</h3>
                    <button onclick="this.closest('div[style*=\'position: fixed\']').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>From:</strong> ${message.senderName || 'Unknown'} (${message.senderEmail || 'No email'})<br>
                    <strong>Date:</strong> ${formatDate(message.createdAt)}<br>
                    <strong>Type:</strong> ${message.type || 'General'}<br>
                    <strong>Priority:</strong> ${message.priority || 'Normal'}
                </div>
                <div style="border-top: 1px solid #eee; padding-top: 1rem;">
                    <strong>Message:</strong><br>
                    <div style="white-space: pre-wrap; margin-top: 0.5rem;">${message.content || 'No content'}</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
};

window.replyMessage = function(messageId) {
    const message = messages.find(m => m.id === messageId);
    if (message) {
        // Create reply form
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.5); display: flex; align-items: center; 
            justify-content: center; z-index: 1000;
        `;
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 600px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3>Reply to: ${message.subject || 'No Subject'}</h3>
                    <button onclick="this.closest('div[style*=\'position: fixed\']').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
                </div>
                <form id="reply-form">
                    <div style="margin-bottom: 1rem;">
                        <label><strong>To:</strong></label>
                        <input type="email" value="${message.senderEmail || ''}" readonly style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label><strong>Subject:</strong></label>
                        <input type="text" value="Re: ${message.subject || 'No Subject'}" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label><strong>Message:</strong></label>
                        <textarea rows="6" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
                    </div>
                    <div style="text-align: right;">
                        <button type="button" onclick="this.closest('div[style*=\'position: fixed\']').remove()" style="margin-right: 1rem;">Cancel</button>
                        <button type="submit" style="background: #4CAF50; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Send Reply</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('reply-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            // Here you would implement the actual reply functionality
            alert('Reply sent successfully!');
            modal.remove();
        });
    }
};

window.deleteMessage = async function(messageId) {
    if (confirm('Are you sure you want to delete this message?')) {
        try {
            await deleteDoc(doc(db, 'messages', messageId));
        } catch (error) {
            console.error('Error deleting message:', error);
            showError('Failed to delete message. Please try again.');
        }
    }
};

window.exportMessages = function() {
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Subject,Sender,Type,Priority,Status,Date\n" +
        filteredMessages.map(message => 
            `"${message.subject || ''}","${message.senderName || ''}","${message.type || ''}","${message.priority || ''}","${message.status || ''}","${formatDate(message.createdAt)}"`
        ).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "messages.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.refreshMessages = function() {
    loadMessages();
};

window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
};
