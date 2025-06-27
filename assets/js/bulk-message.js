import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACm0j7I8RX4ExIQRoejfk1HZMOQRGigBw",
    authDomain: "holiday-lawn-and-garden.firebaseapp.com",
    projectId: "holiday-lawn-and-garden",
    storageBucket: "holiday-lawn-and-garden.firebasestorage.app",
    messagingSenderId: "135322230444",
    appId: "1:135322230444:web:1a487b25a48aae07368909",
    measurementId: "G-KD6TBWR4ZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM elements
const customerList = document.getElementById('customer-list');
const selectedCount = document.getElementById('selected-count');
const totalCustomers = document.getElementById('total-customers');
const selectedCustomers = document.getElementById('selected-customers');
const selectAllCheckbox = document.getElementById('select-all-customers');
const searchInput = document.getElementById('search-customers');
const statusFilter = document.getElementById('status-filter');
const serviceFilter = document.getElementById('service-filter');
const messageSubject = document.getElementById('message-subject');
const messageType = document.getElementById('message-type');
const messageContent = document.getElementById('message-content');
const sendBtn = document.getElementById('send-btn');
const messageHistory = document.getElementById('message-history');

let customers = [];
let selectedCustomerIds = new Set();
let filteredCustomers = [];

// Check authentication
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Check if user is admin by looking up their role in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
                loadCustomers();
                loadMessageHistory();
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

// Load customers from Firebase
async function loadCustomers() {
    try {
        const customersRef = collection(db, 'customers');
        const q = query(customersRef, orderBy('createdAt', 'desc'));
        
        const snapshot = await getDocs(q);
        customers = [];
        snapshot.forEach((doc) => {
            customers.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        filteredCustomers = [...customers];
        updateCustomerList();
        updateStats();
    } catch (error) {
        console.error('Error loading customers:', error);
        showError('Failed to load customers. Please try again.');
    }
}

// Update customer list display
function updateCustomerList() {
    customerList.innerHTML = '';
    
    if (filteredCustomers.length === 0) {
        customerList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                No customers found matching your criteria.
            </div>
        `;
        return;
    }

    filteredCustomers.forEach(customer => {
        const customerItem = document.createElement('div');
        customerItem.className = 'customer-item';
        customerItem.innerHTML = `
            <input type="checkbox" id="customer-${customer.id}" 
                   ${selectedCustomerIds.has(customer.id) ? 'checked' : ''}
                   onchange="toggleCustomer('${customer.id}')">
            <div class="customer-info">
                <div class="customer-name">${customer.name || 'N/A'}</div>
                <div class="customer-email">${customer.email || 'N/A'}</div>
            </div>
        `;
        customerList.appendChild(customerItem);
    });
}

// Toggle customer selection
function toggleCustomer(customerId) {
    if (selectedCustomerIds.has(customerId)) {
        selectedCustomerIds.delete(customerId);
    } else {
        selectedCustomerIds.add(customerId);
    }
    updateSelectedCount();
    updateStats();
}

// Update selected count
function updateSelectedCount() {
    selectedCount.textContent = `${selectedCustomerIds.size} customers selected`;
    selectedCustomers.textContent = selectedCustomerIds.size;
}

// Update statistics
function updateStats() {
    totalCustomers.textContent = customers.length;
    selectedCustomers.textContent = selectedCustomerIds.size;
}

// Filter customers
function filterCustomers() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const serviceValue = serviceFilter.value;

    filteredCustomers = customers.filter(customer => {
        const matchesSearch = !searchTerm || 
            (customer.name && customer.name.toLowerCase().includes(searchTerm)) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !statusValue || customer.status === statusValue;
        const matchesService = !serviceValue || 
            (customer.services && customer.services.some(service => service.type === serviceValue));

        return matchesSearch && matchesStatus && matchesService;
    });

    updateCustomerList();
}

// Select all customers
function selectAllCustomers() {
    if (selectAllCheckbox.checked) {
        filteredCustomers.forEach(customer => {
            selectedCustomerIds.add(customer.id);
        });
    } else {
        selectedCustomerIds.clear();
    }
    updateCustomerList();
    updateSelectedCount();
    updateStats();
}

// Load message templates
function loadTemplate(templateType) {
    const templates = {
        'welcome': {
            subject: 'Welcome to Holliday\'s Lawn & Garden!',
            content: 'Dear valued customer,\n\nWelcome to Holliday\'s Lawn & Garden! We\'re excited to have you as part of our family.\n\nWe specialize in professional lawn care, landscaping, and garden maintenance services. Our team is committed to keeping your outdoor space beautiful and well-maintained.\n\nIf you have any questions or need to schedule a service, please don\'t hesitate to contact us.\n\nBest regards,\nThe Holliday\'s Team'
        },
        'service-reminder': {
            subject: 'Service Reminder - Holliday\'s Lawn & Garden',
            content: 'Dear valued customer,\n\nThis is a friendly reminder that your scheduled service is approaching.\n\nPlease ensure your property is accessible for our team. If you need to reschedule or have any questions, please contact us as soon as possible.\n\nThank you for choosing Holliday\'s Lawn & Garden!\n\nBest regards,\nThe Holliday\'s Team'
        },
        'promotional': {
            subject: 'Special Offer - Holliday\'s Lawn & Garden',
            content: 'Dear valued customer,\n\nWe\'re excited to offer you a special discount on our services!\n\nTake advantage of our limited-time offer and give your property the care it deserves.\n\nContact us today to learn more about this exclusive deal.\n\nBest regards,\nThe Holliday\'s Team'
        },
        'maintenance': {
            subject: 'Maintenance Notice - Holliday\'s Lawn & Garden',
            content: 'Dear valued customer,\n\nWe wanted to inform you about upcoming maintenance work in your area.\n\nOur team will be working to ensure the highest quality service. We apologize for any inconvenience and appreciate your understanding.\n\nIf you have any concerns, please don\'t hesitate to reach out.\n\nBest regards,\nThe Holliday\'s Team'
        },
        'holiday': {
            subject: 'Holiday Schedule Update - Holliday\'s Lawn & Garden',
            content: 'Dear valued customer,\n\nPlease note our updated holiday schedule.\n\nWe will be adjusting our service times to accommodate the holiday period. Your regular service will be rescheduled accordingly.\n\nThank you for your understanding and continued support.\n\nBest regards,\nThe Holliday\'s Team'
        }
    };

    const template = templates[templateType];
    if (template) {
        messageSubject.value = template.subject;
        messageContent.value = template.content;
    }
}

// Preview message
function previewMessage() {
    if (selectedCustomerIds.size === 0) {
        alert('Please select at least one customer to send the message to.');
        return;
    }

    const previewModal = document.getElementById('preview-modal');
    const previewRecipientCount = document.getElementById('preview-recipient-count');
    const previewContent = document.getElementById('preview-content');

    previewRecipientCount.textContent = `Message will be sent to ${selectedCustomerIds.size} recipients`;
    
    previewContent.innerHTML = `
        <h4>Subject: ${messageSubject.value}</h4>
        <p><strong>Type:</strong> ${messageType.value}</p>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
            <h5>Message Content:</h5>
            <pre style="white-space: pre-wrap; font-family: inherit;">${messageContent.value}</pre>
        </div>
    `;

    previewModal.style.display = 'block';
}

// Close preview modal
function closePreview() {
    document.getElementById('preview-modal').style.display = 'none';
}

// Send bulk message
async function sendBulkMessage() {
    if (selectedCustomerIds.size === 0) {
        alert('Please select at least one customer to send the message to.');
        return;
    }

    if (!messageSubject.value.trim() || !messageContent.value.trim()) {
        alert('Please fill in both subject and message content.');
        return;
    }

    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        const messageData = {
            subject: messageSubject.value,
            type: messageType.value,
            content: messageContent.value,
            recipientCount: selectedCustomerIds.size,
            recipients: Array.from(selectedCustomerIds),
            sentBy: auth.currentUser.uid,
            sentAt: serverTimestamp(),
            status: 'sent'
        };

        await addDoc(collection(db, 'bulk-messages'), messageData);
        
        alert(`Message sent successfully to ${selectedCustomerIds.size} customers!`);
        
        // Reset form
        messageSubject.value = '';
        messageContent.value = '';
        selectedCustomerIds.clear();
        updateCustomerList();
        updateSelectedCount();
        updateStats();
        
        // Reload message history
        loadMessageHistory();
        
    } catch (error) {
        console.error('Error sending bulk message:', error);
        alert('Error sending message. Please try again.');
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
}

// Load message history
async function loadMessageHistory() {
    try {
        const messagesRef = collection(db, 'bulk-messages');
        const q = query(messagesRef, orderBy('sentAt', 'desc'));
        
        const snapshot = await getDocs(q);
        messageHistory.innerHTML = '';
        
        if (snapshot.empty) {
            messageHistory.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">
                        No messages sent yet.
                    </td>
                </tr>
            `;
            return;
        }

        snapshot.forEach((doc) => {
            const message = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${message.sentAt ? new Date(message.sentAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                <td>${message.subject}</td>
                <td>${message.type}</td>
                <td>${message.recipientCount}</td>
                <td><span class="status-badge status-${message.status}">${message.status}</span></td>
                <td>
                    <button class="btn btn-small btn-secondary" onclick="viewMessageDetails('${doc.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            messageHistory.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading message history:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    selectAllCheckbox.addEventListener('change', selectAllCustomers);
    searchInput.addEventListener('input', filterCustomers);
    statusFilter.addEventListener('change', filterCustomers);
    serviceFilter.addEventListener('change', filterCustomers);
}

// Logout function
function logout() {
    signOut(auth).then(() => {
        window.location.href = 'admin-login.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}

// Show error message
function showError(message) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorContainer.style.display = 'block';
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('preview-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
