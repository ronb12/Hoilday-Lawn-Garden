import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Admin UIDs
const ADMIN_UIDS = ['UB8vAhpsgFZJTsYngb33BRAV2Rh1'];

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

            console.log("Attempting admin login for:", email);

            // First attempt Firebase authentication
            console.log("Attempting Firebase authentication");
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Firebase authentication successful for user:", user.uid);

            // Check if the user is in the admin UIDs list
            if (!ADMIN_UIDS.includes(user.uid)) {
                console.error("User is not in admin UIDs list");
                await auth.signOut();
                throw new Error("Invalid email or password");
            }

            // Check if the user has admin status in users collection
            console.log("Checking user document for admin status");
            const userDoc = await getDoc(doc(db, "users", user.uid));
            console.log("User document exists:", userDoc.exists());
            
            if (!userDoc.exists()) {
                // Create the user document if it doesn't exist
                console.log("Creating user document with admin status");
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    isAdmin: true,
                    createdAt: new Date().toISOString()
                });
            } else if (!userDoc.data().isAdmin) {
                console.error("User document exists but is not marked as admin");
                await auth.signOut();
                throw new Error("Invalid email or password");
            }

            console.log("Admin login successful");
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
            let errorMessage = "Invalid email or password";
            
            // Provide more specific error messages for debugging
            if (error.code === "auth/user-not-found") {
                errorMessage = "No account found with this email";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Incorrect password";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many failed attempts. Please try again later";
            }
            
            showNotification(errorMessage, "error");
            const submitButton = e.target.querySelector("button[type=submit]");
            submitButton.disabled = false;
            submitButton.textContent = "Login to Admin Panel";
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