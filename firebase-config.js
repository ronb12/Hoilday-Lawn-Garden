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

// Export for use in other files
window.firebaseConfig = firebaseConfig;

// Initialize Firebase DB
window.initializeFirebaseDB = function () {
  return new Promise((resolve, reject) => {
    try {
      if (window.firebaseConfig) {
        resolve();
      } else {
        reject(new Error('Firebase configuration not found'));
      }
    } catch (error) {
      reject(error);
    }
  });
};
