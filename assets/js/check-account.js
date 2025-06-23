import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const db = getFirestore(app);

// This script should be included in an HTML file and run in the browser
document.addEventListener('DOMContentLoaded', async () => {
    const outputDiv = document.createElement('div');
    outputDiv.style.padding = '20px';
    outputDiv.style.fontFamily = 'monospace';
    document.body.appendChild(outputDiv);

    try {
        const customersRef = collection(db, 'customers');
        const customersSnapshot = await getDocs(customersRef);
        
        let output = '<h2>Current customers and their account numbers:</h2>';
        customersSnapshot.forEach((doc) => {
            const data = doc.data();
            output += `
                <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc;">
                    <p><strong>Customer ID:</strong> ${doc.id}</p>
                    <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
                    <p><strong>Account Number:</strong> ${data.accountNumber || 'Not assigned'}</p>
                </div>
            `;
        });
        
        outputDiv.innerHTML = output;
    } catch (error) {
        outputDiv.innerHTML = `<p style="color: red;">Error checking account numbers: ${error.message}</p>`;
    }
}); 