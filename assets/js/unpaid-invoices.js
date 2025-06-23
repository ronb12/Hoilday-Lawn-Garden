import { app } from './firebase-config.js';
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

async function loadUnpaidInvoices(userId) {
  console.log('Loading unpaid invoices for user:', userId);
  const container = document.querySelector("#unpaidInvoices ul");
  if (!container) {
    console.error('Unpaid invoices container not found');
    return;
  }
  
  try {
    // Show loading state
    container.innerHTML = '<li class="empty">Loading invoices...</li>';
    
    // Query unpaid invoices for the user
    const q = query(
      collection(db, "invoices"),
      where("userId", "==", userId),
      where("status", "==", "unpaid")
    );
    
    console.log('Executing query:', q);
    const snap = await getDocs(q);
    console.log('Query results:', snap.size, 'documents found');
    
    if (snap.empty) {
      console.log('No unpaid invoices found');
      container.innerHTML = '<li class="empty">No unpaid invoices</li>';
      return;
    }
    
    // Clear loading state and populate invoices
    container.innerHTML = "";
    snap.forEach(doc => {
      const invoice = doc.data();
      console.log('Processing invoice:', invoice);
      const date = invoice.date?.toDate() ? new Date(invoice.date.toDate()).toLocaleDateString() : 'N/A';
      const amount = invoice.amount ? invoice.amount.toFixed(2) : '0.00';
      
      container.innerHTML += `
        <li class="invoice-item">
          <div class="invoice-info">
            <strong>Invoice #${invoice.invoiceNumber || 'N/A'}</strong>
            <span class="date">${date}</span>
          </div>
          <div class="invoice-details">
            <span class="amount">$${amount}</span>
            <button class="action-button" onclick="window.location.href='/pay-your-bill.html?invoice=${invoice.invoiceNumber || ''}'">
              Pay Now
            </button>
          </div>
        </li>
      `;
    });
  } catch (error) {
    console.error('Error loading unpaid invoices:', error);
    container.innerHTML = '<li class="empty">Error loading invoices. Please try again later.</li>';
  }
}

// Export the function
export { loadUnpaidInvoices };

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', user ? 'User logged in' : 'No user');
  if (user) {
    loadUnpaidInvoices(user.uid);
  }
}); 