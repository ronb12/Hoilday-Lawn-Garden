import { getFirestore, collection, doc, setDoc, getDocs, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const db = getFirestore(app);

// Function to generate a simple account number (HLG + 4 digits)
async function generateAccountNumber() {
    try {
        const customersRef = collection(db, 'customers');
        const customersSnapshot = await getDocs(customersRef);
        const existingNumbers = new Set();
        
        // Get all existing account numbers
        customersSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.accountNumber) {
                existingNumbers.add(data.accountNumber);
            }
        });
        
        // Generate a new number that doesn't exist
        let accountNumber;
        do {
            const number = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits between 1000-9999
            accountNumber = `HLG${number}`;
        } while (existingNumbers.has(accountNumber));
        
        return accountNumber;
    } catch (error) {
        console.error('Error generating account number:', error);
        throw error;
    }
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
                updates.push(generateAccountNumber().then(accountNumber => 
                    updateDoc(doc.ref, { accountNumber })
                ));
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
        const accountNumber = await generateAccountNumber();
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