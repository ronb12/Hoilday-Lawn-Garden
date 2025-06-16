import { getFirestore, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
                updates.push(generateAccountNumber().then(accountNumber => {
                    console.log(`Assigning account number ${accountNumber} to customer ${doc.id}`);
                    return updateDoc(doc.ref, { accountNumber });
                }));
            }
        });

        await Promise.all(updates);
        console.log('Account numbers assigned successfully');
        
        // Show the results
        const finalSnapshot = await getDocs(customersRef);
        console.log('\nCurrent customers and their account numbers:');
        finalSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`Customer ID: ${doc.id}`);
            console.log(`Name: ${data.name || 'N/A'}`);
            console.log(`Account Number: ${data.accountNumber || 'Not assigned'}`);
            console.log('-------------------');
        });
    } catch (error) {
        console.error('Error assigning account numbers:', error);
        throw error;
    }
}

// Run the assignment
assignAccountNumbers(); 