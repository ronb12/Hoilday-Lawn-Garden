import { getFirestore, collection, doc, setDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const db = getFirestore(app);

// Function to generate a unique account number
function generateAccountNumber() {
    const prefix = 'HLG'; // Holliday Lawn & Garden
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3 random digits
    return `${prefix}${timestamp}${random}`;
}

// Function to assign account numbers to existing customers
async function assignAccountNumbers() {
    try {
        const customersRef = collection(db, 'customers');
        const customersSnapshot = await getDocs(customersRef);
        
        const updates = [];
        customersSnapshot.forEach((doc) => {
            const customerData = doc.data();
            if (!customerData.accountNumber) {
                const accountNumber = generateAccountNumber();
                updates.push(updateDoc(doc.ref, { accountNumber }));
            }
        });

        await Promise.all(updates);
        console.log('Account numbers assigned successfully');
    } catch (error) {
        console.error('Error assigning account numbers:', error);
        throw error;
    }
}

// Function to get customer by account number
async function getCustomerByAccountNumber(accountNumber) {
    try {
        const customersRef = collection(db, 'customers');
        const q = query(customersRef, where('accountNumber', '==', accountNumber));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return {
                id: querySnapshot.docs[0].id,
                ...querySnapshot.docs[0].data()
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting customer by account number:', error);
        throw error;
    }
}

// Function to create a new customer with account number
async function createCustomerWithAccount(customerData) {
    try {
        const accountNumber = generateAccountNumber();
        const customerWithAccount = {
            ...customerData,
            accountNumber,
            createdAt: new Date().toISOString()
        };

        const customersRef = collection(db, 'customers');
        const newCustomerRef = doc(customersRef);
        await setDoc(newCustomerRef, customerWithAccount);

        return {
            id: newCustomerRef.id,
            ...customerWithAccount
        };
    } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
    }
}

export {
    generateAccountNumber,
    assignAccountNumbers,
    getCustomerByAccountNumber,
    createCustomerWithAccount
}; 