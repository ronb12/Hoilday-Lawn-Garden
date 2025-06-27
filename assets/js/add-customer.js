import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACm0j7I8RX4ExIQRoejfk1HZMOQRGigBw",
    authDomain: "holiday-lawn-and-garden.firebaseapp.com",
    projectId: "holiday-lawn-and-garden",
    storageBucket: "holiday-lawn-and-garden.firebasestorage.app",
    messagingSenderId: "135322230444",
    appId: "1:135322230444:web:1a487b25a48aae07368909",
    measurementId: "G-KD6TBWR4ZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'admin-login.html';
      return;
    }
    // Check if user is admin
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        window.location.href = 'admin-login.html';
        return;
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      window.location.href = 'admin-login.html';
      return;
    }
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
