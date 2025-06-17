import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"; import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"; import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"; import { getAllServices, getServiceById } from './service-cache.js'; const firebaseConfig = { apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", authDomain: "holliday-lawn-garden.firebaseapp.com", projectId: "holliday-lawn-garden", storageBucket: "holliday-lawn-garden.appspot.com", messagingSenderId: "123456789012", appId: "1:123456789012:web:abcdef1234567890" }; // Initialize Firebase only if it hasn't been initialized yet let app; if (!getApps().length) { app = initializeApp(firebaseConfig); } else { app = getApps()[0]; } const db = getFirestore(app); const auth = getAuth(app); console.log("main.js loaded"); // List of pages that should not redirect const publicPages = [ 'index.html', 'about.html', 'services.html', 'education.html', 'faq.html', 'contact.html', 'privacy.html', 'terms.html', 'gallery.html', 'offline.html', 'admin-login.html' ]; onAuthStateChanged(auth, async (user) => { if (user) { try { const userDoc = await getDoc(doc(db, "users", user.uid)); if (userDoc.exists()) { const userData = userDoc.data(); console.log("User role:", userData.role); const currentPage = window.location.pathname.split("/").pop(); if (!publicPages.includes(currentPage)) { if (userData.role === "admin" && currentPage !== "admin-dashboard.html") { window.location.href = "admin-dashboard.html"; } else if (userData.role === "user" && currentPage !== "customer-dashboard.html") { window.location.href = "customer-dashboard.html"; } } } } catch (error) { console.error("Error checking user role:", error); } } }); document.getElementById("loginForm")?.addEventListener("submit", async (e) => { e.preventDefault(); const email = document.getElementById("email").value; const password = document.getElementById("password").value; try { const userCredential = await signInWithEmailAndPassword(auth, email, password); const user = userCredential.user; const userDoc = await getDoc(doc(db, "users", user.uid)); if (userDoc.exists()) { const userData = userDoc.data(); console.log("User role:", userData.role); if (userData.role === "admin") { window.location.href = "admin-dashboard.html"; } else { window.location.href = "customer-dashboard.html"; } } else { showError("User data not found. Please contact support."); } } catch (error) { console.error("Login error:", error); showError("Invalid email or password."); } }); document.getElementById("logoutBtn")?.addEventListener("click", async () => { try { await auth.signOut(); window.location.href = "login.html"; } catch (error) { console.error("Logout error:", error); showError("Error signing out. Please try again."); } }); function showError(message) { const errorDiv = document.getElementById("error-message"); if (errorDiv) { errorDiv.textContent = message; errorDiv.style.display = "block"; } else { alert(message); } }

// Mobile Menu Functionality
document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.querySelector(".hamburger");
    const nav = document.querySelector("nav");
    const navLinks = document.querySelector(".nav-links");
    const body = document.body;

    if (hamburger) {
        // Set initial ARIA state
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-controls", "nav-menu");
        nav.setAttribute("id", "nav-menu");

        hamburger.addEventListener("click", function() {
            const isExpanded = hamburger.getAttribute("aria-expanded") === "true";
            
            // Toggle classes
            hamburger.classList.toggle("active");
            nav.classList.toggle("active");
            navLinks.classList.toggle("active");
            body.classList.toggle("menu-open");
            
            // Update ARIA state
            hamburger.setAttribute("aria-expanded", !isExpanded);
            
            // Prevent body scroll when menu is open
            if (!isExpanded) {
                body.style.overflow = "hidden";
            } else {
                body.style.overflow = "";
            }
        });

        // Close menu when clicking outside
        document.addEventListener("click", function(event) {
            const isClickInside = nav.contains(event.target) || hamburger.contains(event.target);
            if (!isClickInside && nav.classList.contains("active")) {
                hamburger.classList.remove("active");
                nav.classList.remove("active");
                navLinks.classList.remove("active");
                body.classList.remove("menu-open");
                body.style.overflow = "";
                hamburger.setAttribute("aria-expanded", "false");
            }
        });

        // Close menu on escape key
        document.addEventListener("keydown", function(event) {
            if (event.key === "Escape" && nav.classList.contains("active")) {
                hamburger.classList.remove("active");
                nav.classList.remove("active");
                navLinks.classList.remove("active");
                body.classList.remove("menu-open");
                body.style.overflow = "";
                hamburger.setAttribute("aria-expanded", "false");
            }
        });

        // Close menu on window resize
        let resizeTimer;
        window.addEventListener("resize", function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768 && nav.classList.contains("active")) {
                    hamburger.classList.remove("active");
                    nav.classList.remove("active");
                    navLinks.classList.remove("active");
                    body.classList.remove("menu-open");
                    body.style.overflow = "";
                    hamburger.setAttribute("aria-expanded", "false");
                }
            }, 250);
        });

        // Handle navigation link clicks
        const navItems = navLinks.querySelectorAll("a");
        navItems.forEach(link => {
            link.addEventListener("click", function() {
                if (nav.classList.contains("active")) {
                    hamburger.classList.remove("active");
                    nav.classList.remove("active");
                    navLinks.classList.remove("active");
                    body.classList.remove("menu-open");
                    body.style.overflow = "";
                    hamburger.setAttribute("aria-expanded", "false");
                }
            });
        });
    }
});

// Service-related functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize service cards if they exist on the page
  const servicesGrid = document.querySelector('.services-grid');
  if (servicesGrid) {
    const services = getAllServices();
    renderServiceCards(services);
  }

  // Initialize service details if on a service page
  const serviceId = window.location.hash.substring(1);
  if (serviceId) {
    const service = getServiceById(serviceId);
    if (service) {
      renderServiceDetails(service);
    }
  }
});

function renderServiceCards(services) {
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) return;

  servicesGrid.innerHTML = Object.values(services).map(service => `
    <div class="service-card">
      <div class="service-icon">
        <i class="${service.icon}"></i>
      </div>
      <h3>${service.title}</h3>
      <p>${service.description}</p>
      <a href="services.html#${service.id}" class="btn btn-secondary">Learn More</a>
    </div>
  `).join('');
}

function renderServiceDetails(service) {
  const serviceDetails = document.querySelector('.service-details');
  if (!serviceDetails) return;

  serviceDetails.innerHTML = `
    <div class="service-header">
      <div class="service-icon">
        <i class="${service.icon}"></i>
      </div>
      <h2>${service.title}</h2>
    </div>
    <div class="service-content">
      <p>${service.description}</p>
      <div class="service-features">
        <h3>Our Services Include:</h3>
        <ul>
          ${service.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

// Cache control
if ('serviceWorker' in navigator) {
  // Register service worker
  navigator.serviceWorker.register('/Holliday-Lawn-Garden/service-worker.js')
    .then(registration => {
      console.log('ServiceWorker registration successful');
      
      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 3600000);
    })
    .catch(error => {
      console.error('ServiceWorker registration failed:', error);
    });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data === 'RELOAD_PAGE') {
      window.location.reload();
    }
  });
}

// Function to clear cache and reload
function clearCacheAndReload() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
  window.location.reload(true);
}

// Add cache clearing to page load
window.addEventListener('load', () => {
  // Hide loading spinner
  const loadingSpinner = document.getElementById('loading');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'none';
  }

  // Clear cache on page load if needed
  if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
    clearCacheAndReload();
  }
});

// Fallback to hide loading spinner after 5 seconds
setTimeout(() => {
  const loadingSpinner = document.getElementById('loading');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'none';
  }
}, 5000);
