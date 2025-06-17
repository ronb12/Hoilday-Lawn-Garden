import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { showLoading, hideLoading, showNotification } from './modules/utils.js';

// Initialize Firebase services
const auth = getAuth();
const db = getFirestore();
const googleProvider = new GoogleAuthProvider();

// List of allowed admin emails
const ADMIN_EMAILS = [
    '7holliday@gmail.com',
    'admin@hollidaylawn.com'
];

// DOM Elements
const adminLoginForm = document.getElementById('adminLoginForm');
const googleSignInButton = document.getElementById('googleSignIn');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Check if user is already logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        }
    }
});

// Handle form submission
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading('Logging in...');

    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
        // Check if email is in allowed admin list
        if (!ADMIN_EMAILS.includes(email)) {
            throw new Error('Unauthorized access attempt');
        }

        // Attempt to sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create or update user document
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            await setDoc(userRef, {
                email: user.email,
                role: 'admin',
                createdAt: new Date(),
                lastLogin: new Date()
            });
        } else {
            await setDoc(userRef, {
                lastLogin: new Date()
            }, { merge: true });
        }

        // Show success message and redirect
        successMessage.style.display = 'block';
        errorContainer.style.display = 'none';
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        errorContainer.style.display = 'block';
        errorMessage.textContent = getErrorMessage(error.code);
        successMessage.style.display = 'none';
    } finally {
        hideLoading();
    }
});

// Handle Google Sign In
googleSignInButton.addEventListener('click', async () => {
    showLoading('Signing in with Google...');
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if email is in allowed admin list
        if (!ADMIN_EMAILS.includes(user.email)) {
            await auth.signOut();
            throw new Error('Unauthorized access attempt');
        }

        // Create or update user document
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            await setDoc(userRef, {
                email: user.email,
                role: 'admin',
                createdAt: new Date(),
                lastLogin: new Date()
            });
        } else {
            await setDoc(userRef, {
                lastLogin: new Date()
            }, { merge: true });
        }

        // Show success message and redirect
        successMessage.style.display = 'block';
        errorContainer.style.display = 'none';
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);

    } catch (error) {
        console.error('Google sign-in error:', error);
        errorContainer.style.display = 'block';
        errorMessage.textContent = getErrorMessage(error.code);
        successMessage.style.display = 'none';
    } finally {
        hideLoading();
    }
});

// Helper function to get user-friendly error messages
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/user-disabled':
            return 'This account has been disabled';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection';
        default:
            return 'An error occurred. Please try again';
    }
}