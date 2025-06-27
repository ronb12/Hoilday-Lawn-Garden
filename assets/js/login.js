// Placeholder login.js
console.log('login.js loaded'); 

import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Set custom parameters for Google sign-in
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const submitButton = e.target.querySelector("button[type=submit]");
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

            // First, check if the email is in the customers collection
            const customerDoc = await getDoc(doc(db, "customers", email));
            if (!customerDoc.exists()) {
                // If not in customers collection, check if they're an admin
                try {
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    
                    // Check if user is admin in users collection
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists() && userDoc.data().role === 'admin') {
                        // Admin user - redirect to admin login
                        await auth.signOut();
                        window.location.href = "admin-login.html";
                        return;
                    } else {
                        // Not admin and not customer - sign out and show error
                        await auth.signOut();
                        throw new Error("Invalid email or password. Please check your credentials.");
                    }
                } catch (authError) {
                    throw new Error("Invalid email or password. Please check your credentials.");
                }
            }

            // Customer exists - proceed with login
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create or update user document for customer
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: 'customer',
                customerId: email,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            }, { merge: true });

            // Show success message
            const successMessage = document.getElementById("successMessage");
            if (successMessage) {
                successMessage.style.display = "block";
            }

            // Redirect to customer dashboard
            setTimeout(() => {
                window.location.href = "customer-dashboard.html";
            }, 1500);

        } catch (error) {
            console.error("Login error:", error);
            showNotification(error.message, "error");
            const submitButton = e.target.querySelector("button[type=submit]");
            submitButton.disabled = false;
            submitButton.textContent = "Sign In";
        }
    });
}

const googleSignInButton = document.getElementById("googleSignIn");
if (googleSignInButton) {
    googleSignInButton.addEventListener("click", async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if the user is in the customers collection
            const customerDoc = await getDoc(doc(db, "customers", user.email));
            if (!customerDoc.exists()) {
                // If not in customers collection, check if they're an admin
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    // Admin user - redirect to admin login
                    await auth.signOut();
                    window.location.href = "admin-login.html";
                    return;
                } else {
                    // Not admin and not customer - sign out and show error
                    await auth.signOut();
                    throw new Error("Invalid email or password. Please check your credentials.");
                }
            }

            // Customer exists - create or update user document
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: 'customer',
                customerId: user.email,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            }, { merge: true });

            // Show success message
            const successMessage = document.getElementById("successMessage");
            if (successMessage) {
                successMessage.style.display = "block";
            }

            // Redirect to customer dashboard
            setTimeout(() => {
                window.location.href = "customer-dashboard.html";
            }, 1500);

        } catch (error) {
            console.error("Google sign-in error:", error);
            showNotification(error.message, "error");
        }
    });
}

function showNotification(message, type = "error") {
    const errorContainer = document.getElementById("error-container");
    const errorMessage = document.getElementById("errorMessage");
    
    if (errorContainer && errorMessage) {
        errorContainer.style.display = "block";
        errorMessage.textContent = message;
        
        // Hide the error message after 5 seconds
        setTimeout(() => {
            errorContainer.style.display = "none";
        }, 5000);
    }
} 