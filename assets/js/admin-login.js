import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

const adminLoginForm = document.getElementById("adminLoginForm");
if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("adminEmail").value;
        const password = document.getElementById("adminPassword").value;

        try {
            const submitButton = e.target.querySelector("button[type=submit]");
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

            // First, check if the email is in the admins collection
            const adminDoc = await getDoc(doc(db, "admins", email));
            if (!adminDoc.exists()) {
                throw new Error("Invalid email or password");
            }

            // Then attempt to sign in
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Double-check admin status
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists() || !userDoc.data().isAdmin) {
                // Sign out the user if they're not an admin
                await auth.signOut();
                throw new Error("Invalid email or password");
            }

            // Show success message
            const successMessage = document.getElementById("successMessage");
            if (successMessage) {
                successMessage.style.display = "block";
            }

            // Redirect to admin dashboard
            setTimeout(() => {
                window.location.href = "admin-dashboard.html";
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