// Placeholder customer-dashboard.js
console.log('customer-dashboard.js loaded');

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

// Function to load customer data
async function loadCustomerData(userId) {
    try {
        const customerDoc = await getDoc(doc(db, 'customers', userId));
        if (customerDoc.exists()) {
            const customerData = customerDoc.data();
            
            // Update customer name
            const customerNameElement = document.getElementById('customerName');
            if (customerNameElement) {
                customerNameElement.textContent = customerData.name || 'Customer';
            }
            
            // Update account number
            const accountNumberElement = document.getElementById('accountNumber');
            if (accountNumberElement && customerData.accountNumber) {
                accountNumberElement.textContent = customerData.accountNumber;
            }
            
            // Load other customer data...
        }
    } catch (error) {
        console.error('Error loading customer data:', error);
    }
}

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadCustomerData(user.uid);
    } else {
        window.location.href = '/login.html';
    }
}); 