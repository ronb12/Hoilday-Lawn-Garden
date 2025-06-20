// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyACm0j7I8RX4ExIQRoejfk1HZMOQRGigBw',
  authDomain: 'holiday-lawn-and-garden.firebaseapp.com',
  projectId: 'holiday-lawn-and-garden',
  storageBucket: 'holiday-lawn-and-garden.firebasestorage.app',
  messagingSenderId: '135322230444',
  appId: '1:135322230444:web:1a487b25a48aae07368909',
  measurementId: 'G-KD6TBWR4ZT',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Initialize Firestore
const db = firebase.firestore();

// Initialize Auth
const auth = firebase.auth();

// Handle form submissions
document.addEventListener('DOMContentLoaded', function () {
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      try {
        await db.collection('quotes').add(formData);
        alert('Thank you for your inquiry! We will contact you soon.');
        quoteForm.reset();
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting your request. Please try again.');
      }
    });
  }
});
