import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

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
  const form = document.getElementById('payment-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      try {
        await addDoc(collection(db, 'payments'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        alert('Payment added successfully!');
        form.reset();
      } catch (err) {
        alert('Error adding payment: ' + err.message);
      }
    });
  }
}); 