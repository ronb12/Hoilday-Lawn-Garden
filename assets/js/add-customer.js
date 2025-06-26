import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

// Redirect to login if not admin
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'admin-login.html';
      return;
    }
    // Optionally, check for admin role here
  });

  // Logout button
  const logoutBtn = document.querySelector('.btn-danger');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = 'admin-login.html';
    });
  }

  // Form handling
  const form = document.getElementById('customer-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      try {
        await addDoc(collection(db, 'customers'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        alert('Customer added successfully!');
        form.reset();
      } catch (err) {
        alert('Error adding customer: ' + err.message);
      }
    });
  }
}); 