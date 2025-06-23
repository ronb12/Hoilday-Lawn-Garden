import { assignAccountNumbers } from './account-manager.js';

// Function to run the account number assignment
async function runAccountNumberAssignment() {
    try {
        console.log('Starting account number assignment...');
        await assignAccountNumbers();
        console.log('Account number assignment completed successfully');
        
        // Show success message in the UI
        const messageDiv = document.createElement('div');
        messageDiv.style.padding = '20px';
        messageDiv.style.backgroundColor = '#4CAF50';
        messageDiv.style.color = 'white';
        messageDiv.style.margin = '20px';
        messageDiv.style.borderRadius = '4px';
        messageDiv.textContent = 'Account numbers have been assigned successfully!';
        document.body.appendChild(messageDiv);
        
        // Redirect to check accounts page after 2 seconds
        setTimeout(() => {
            window.location.href = 'check-accounts.html';
        }, 2000);
    } catch (error) {
        console.error('Error in account number assignment:', error);
        
        // Show error message in the UI
        const messageDiv = document.createElement('div');
        messageDiv.style.padding = '20px';
        messageDiv.style.backgroundColor = '#f44336';
        messageDiv.style.color = 'white';
        messageDiv.style.margin = '20px';
        messageDiv.style.borderRadius = '4px';
        messageDiv.textContent = 'Error assigning account numbers: ' + error.message;
        document.body.appendChild(messageDiv);
    }
}

// Run the assignment
runAccountNumberAssignment(); 