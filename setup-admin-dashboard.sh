#!/bin/bash

# Create the directory if it doesn't exist
mkdir -p assets/js

# Create the admin dashboard JavaScript file
cat > assets/js/admin-dashboard.js << 'EOL'
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    addDoc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut,
    updateProfile,
    deleteUser
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Check if user is admin
async function checkAdminAccess(user) {
    if (!user) return false;
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        return userDoc.exists() && userDoc.data().role === 'admin';
    } catch (error) {
        console.error('Error checking admin access:', error);
        return false;
    }
}

// Authentication state observer
onAuthStateChanged(auth, async (user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'No user');
    
    if (!user) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    const isAdmin = await checkAdminAccess(user);
    if (!isAdmin) {
        console.error('Unauthorized access attempt by non-admin user:', user.email);
        showNotification('Unauthorized access. Admin privileges required.', 'error');
        signOut(auth);
        window.location.href = 'admin-login.html';
        return;
    }

    // Initialize all dashboard features
    initializeDashboard(user);
});

// Initialize dashboard features
async function initializeDashboard(user) {
    try {
        console.log('Initializing admin dashboard for user:', user.email);
        
        // Load admin overview
        await loadAdminOverview();
        
        // Load users
        await loadUsers();
        
        // Load services
        await loadServices();
        
        // Load payments
        await loadPayments();
        
        // Load messages
        await loadMessages();
        
        // Load documents
        await loadDocuments();
        
        // Initialize event listeners
        initializeEventListeners();
        
        // Update admin name in header
        const greeting = document.querySelector('.greeting');
        if (greeting) {
            greeting.textContent = `Welcome, ${user.displayName || 'Admin'}!`;
        }
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

// Load admin overview
async function loadAdminOverview() {
    try {
        const usersCount = (await getDocs(collection(db, 'users'))).size;
        const servicesCount = (await getDocs(collection(db, 'services'))).size;
        const paymentsCount = (await getDocs(collection(db, 'payments'))).size;
        const messagesCount = (await getDocs(collection(db, 'messages'))).size;
        
        document.getElementById('admin-overview').innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Users</h3>
                    <p>${usersCount}</p>
                </div>
                <div class="stat-card">
                    <h3>Total Services</h3>
                    <p>${servicesCount}</p>
                </div>
                <div class="stat-card">
                    <h3>Total Payments</h3>
                    <p>${paymentsCount}</p>
                </div>
                <div class="stat-card">
                    <h3>Total Messages</h3>
                    <p>${messagesCount}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading admin overview:', error);
        showNotification('Error loading overview data', 'error');
    }
}

// Load users
async function loadUsers() {
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersContainer = document.getElementById('users-container');
        
        usersContainer.innerHTML = `
            <div class="action-bar">
                <button class="btn-primary" onclick="showModal('addUserModal')">Add User</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${usersSnapshot.docs.map(doc => `
                        <tr>
                            <td>${doc.data().displayName || 'N/A'}</td>
                            <td>${doc.data().email || 'N/A'}</td>
                            <td>${doc.data().role || 'user'}</td>
                            <td>${doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A'}</td>
                            <td>
                                <button class="btn-secondary" onclick="editUser('${doc.id}')">Edit</button>
                                <button class="btn-danger" onclick="deleteUser('${doc.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error loading users', 'error');
    }
}

// Load services
async function loadServices() {
    try {
        const servicesSnapshot = await getDocs(collection(db, 'services'));
        const servicesContainer = document.getElementById('admin-services-container');
        
        servicesContainer.innerHTML = `
            <div class="action-bar">
                <button class="btn-primary" onclick="showModal('addServiceModal')">Add Service</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Duration</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${servicesSnapshot.docs.map(doc => `
                        <tr>
                            <td>${doc.data().name || 'N/A'}</td>
                            <td>$${doc.data().price || '0.00'}</td>
                            <td>${doc.data().duration || '0'} min</td>
                            <td>${doc.data().description || 'N/A'}</td>
                            <td>
                                <button class="btn-secondary" onclick="editService('${doc.id}')">Edit</button>
                                <button class="btn-danger" onclick="deleteService('${doc.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading services:', error);
        showNotification('Error loading services', 'error');
    }
}

// Load payments
async function loadPayments() {
    try {
        const paymentsSnapshot = await getDocs(collection(db, 'payments'));
        const paymentsContainer = document.getElementById('admin-payments-container');
        
        paymentsContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${paymentsSnapshot.docs.map(doc => `
                        <tr>
                            <td>${doc.data().userName || 'N/A'}</td>
                            <td>$${doc.data().amount || '0.00'}</td>
                            <td>${doc.data().date?.toDate().toLocaleDateString() || 'N/A'}</td>
                            <td>
                                <span class="status-badge ${doc.data().status || 'pending'}">
                                    ${doc.data().status || 'pending'}
                                </span>
                            </td>
                            <td>
                                <button class="btn-secondary" onclick="viewPayment('${doc.id}')">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading payments:', error);
        showNotification('Error loading payments', 'error');
    }
}

// Load messages
async function loadMessages() {
    try {
        const messagesSnapshot = await getDocs(collection(db, 'messages'));
        const messagesContainer = document.getElementById('admin-messages-container');
        
        messagesContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>From</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${messagesSnapshot.docs.map(doc => `
                        <tr>
                            <td>${doc.data().from || 'N/A'}</td>
                            <td>${doc.data().subject || 'N/A'}</td>
                            <td>${doc.data().date?.toDate().toLocaleDateString() || 'N/A'}</td>
                            <td>
                                <span class="status-badge ${doc.data().status || 'unread'}">
                                    ${doc.data().status || 'unread'}
                                </span>
                            </td>
                            <td>
                                <button class="btn-secondary" onclick="viewMessage('${doc.id}')">View</button>
                                <button class="btn-danger" onclick="deleteMessage('${doc.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading messages:', error);
        showNotification('Error loading messages', 'error');
    }
}

// Load documents
async function loadDocuments() {
    try {
        const documentsSnapshot = await getDocs(collection(db, 'documents'));
        const documentsContainer = document.getElementById('admin-documents-container');
        
        documentsContainer.innerHTML = `
            <div class="action-bar">
                <button class="btn-primary" onclick="showModal('uploadDocumentModal')">Upload Document</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Upload Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${documentsSnapshot.docs.map(doc => `
                        <tr>
                            <td>${doc.data().name || 'N/A'}</td>
                            <td>${doc.data().type || 'N/A'}</td>
                            <td>${formatFileSize(doc.data().size) || 'N/A'}</td>
                            <td>${doc.data().uploadDate?.toDate().toLocaleDateString() || 'N/A'}</td>
                            <td>
                                <button class="btn-secondary" onclick="downloadDocument('${doc.id}')">Download</button>
                                <button class="btn-danger" onclick="deleteDocument('${doc.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading documents:', error);
        showNotification('Error loading documents', 'error');
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Add user form
    document.getElementById('addUserForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            phone: document.getElementById('userPhone').value,
            role: 'user',
            createdAt: serverTimestamp()
        };
        
        try {
            await addDoc(collection(db, 'users'), userData);
            closeModal('addUserModal');
            loadUsers();
            showNotification('User added successfully', 'success');
        } catch (error) {
            console.error('Error adding user:', error);
            showNotification('Error adding user', 'error');
        }
    });
    
    // Add service form
    document.getElementById('addServiceForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const serviceData = {
            name: document.getElementById('serviceName').value,
            price: parseFloat(document.getElementById('servicePrice').value),
            duration: parseInt(document.getElementById('serviceDuration').value),
            description: document.getElementById('serviceDescription').value,
            createdAt: serverTimestamp()
        };
        
        try {
            await addDoc(collection(db, 'services'), serviceData);
            closeModal('addServiceModal');
            loadServices();
            showNotification('Service added successfully', 'success');
        } catch (error) {
            console.error('Error adding service:', error);
            showNotification('Error adding service', 'error');
        }
    });
    
    // Upload document form
    document.getElementById('uploadDocumentForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = document.getElementById('documentFile').files[0];
        if (!file) {
            showNotification('Please select a file to upload', 'error');
            return;
        }
        
        try {
            const storageRef = ref(storage, `documents/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            const documentData = {
                name: file.name,
                type: file.type,
                size: file.size,
                url: downloadURL,
                uploadDate: serverTimestamp()
            };
            
            await addDoc(collection(db, 'documents'), documentData);
            closeModal('uploadDocumentModal');
            loadDocuments();
            showNotification('Document uploaded successfully', 'success');
        } catch (error) {
            console.error('Error uploading document:', error);
            showNotification('Error uploading document', 'error');
        }
    });
    
    // Logout button
    document.querySelector('.logout-btn')?.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'admin-login.html';
        } catch (error) {
            console.error('Error signing out:', error);
            showNotification('Error signing out', 'error');
        }
    });
}

// Utility functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Export functions for use in HTML
window.showModal = showModal;
window.closeModal = closeModal;
window.editUser = async (userId) => {
    // Implement edit user functionality
};

window.deleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await deleteDoc(doc(db, 'users', userId));
            loadUsers();
            showNotification('User deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Error deleting user', 'error');
        }
    }
};

window.editService = async (serviceId) => {
    // Implement edit service functionality
};

window.deleteService = async (serviceId) => {
    if (confirm('Are you sure you want to delete this service?')) {
        try {
            await deleteDoc(doc(db, 'services', serviceId));
            loadServices();
            showNotification('Service deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting service:', error);
            showNotification('Error deleting service', 'error');
        }
    }
};

window.viewPayment = async (paymentId) => {
    // Implement view payment functionality
};

window.viewMessage = async (messageId) => {
    // Implement view message functionality
};

window.deleteMessage = async (messageId) => {
    if (confirm('Are you sure you want to delete this message?')) {
        try {
            await deleteDoc(doc(db, 'messages', messageId));
            loadMessages();
            showNotification('Message deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting message:', error);
            showNotification('Error deleting message', 'error');
        }
    }
};

window.downloadDocument = async (documentId) => {
    // Implement download document functionality
};

window.deleteDocument = async (documentId) => {
    if (confirm('Are you sure you want to delete this document?')) {
        try {
            const docRef = doc(db, 'documents', documentId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const docData = docSnap.data();
                if (docData.url) {
                    const storageRef = ref(storage, docData.url);
                    await deleteObject(storageRef);
                }
                await deleteDoc(docRef);
                loadDocuments();
                showNotification('Document deleted successfully', 'success');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            showNotification('Error deleting document', 'error');
        }
    }
};
EOL

# Make the script executable
chmod +x setup-admin-dashboard.sh

echo "Admin dashboard JavaScript file has been created successfully!" 