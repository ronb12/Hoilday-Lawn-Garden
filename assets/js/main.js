import { app, auth, db } from './firebase-config.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAllServices, getServiceById } from './service-cache.js';

console.log("main.js loaded");

// List of pages that should not redirect
const publicPages = [
  'index.html',
  'about.html',
  'services.html',
  'education.html',
  'faq.html',
  'contact.html',
  'privacy.html',
  'terms.html',
  'gallery.html',
  'offline.html',
  'admin-login.html'
];

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User role:", userData.role);
        const currentPage = window.location.pathname.split("/").pop();
        if (!publicPages.includes(currentPage)) {
          if (userData.role === "admin" && currentPage !== "admin-dashboard.html") {
            window.location.href = "admin-dashboard.html";
          } else if (userData.role === "user" && currentPage !== "customer-dashboard.html") {
            window.location.href = "customer-dashboard.html";
          }
        }
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  }
});

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("User role:", userData.role);
      if (userData.role === "admin") {
        window.location.href = "admin-dashboard.html";
      } else {
        window.location.href = "customer-dashboard.html";
      }
    } else {
      showError("User data not found. Please contact support.");
    }
  } catch (error) {
    console.error("Login error:", error);
    showError("Invalid email or password.");
  }
});

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  try {
    await auth.signOut();
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
    showError("Error signing out. Please try again.");
  }
});

function showError(message) {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  } else {
    alert(message);
  }
}

// Mobile Menu Functionality
document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.querySelector(".hamburger");
    const nav = document.querySelector("nav");
    const navLinks = document.querySelector(".nav-links");
    const body = document.body;

    if (hamburger) {
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-controls", "nav-menu");
        nav.setAttribute("id", "nav-menu");

        hamburger.addEventListener("click", function() {
            const isExpanded = hamburger.getAttribute("aria-expanded") === "true";
            hamburger.classList.toggle("active");
            nav.classList.toggle("active");
            navLinks.classList.toggle("active");
            body.classList.toggle("menu-open");
            hamburger.setAttribute("aria-expanded", !isExpanded);
            body.style.overflow = !isExpanded ? "hidden" : "";
        });

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
  const servicesGrid = document.querySelector('.services-grid');
  if (servicesGrid) {
    const services = getAllServices();
    renderServiceCards(services);
  }

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

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/Holliday-Lawn-Garden/service-worker.js');
      console.log('ServiceWorker registration successful');
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  });
}

// Add cache clearing to page load
window.addEventListener('load', () => {
  // Hide loading spinner
  const loadingSpinner = document.getElementById('loading');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'none';
  }

  // Clear cache on every page load
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.update();
      });
    });
  }
});

// Add cache clearing to visibility change
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.update();
        });
      });
    }
  }
});

// Fallback to hide loading spinner after 5 seconds
setTimeout(() => {
  const loadingSpinner = document.getElementById('loading');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'none';
  }
}, 5000);

// Function to clear cache and reload
function clearCacheAndReload() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
  // Only reload if we haven't already reloaded
  if (sessionStorage.getItem('hasReloaded') !== 'true') {
    window.location.reload(true);
  }
}

// Listen for service worker messages to reload the page
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'RELOAD_PAGE') {
      window.location.reload(true); // Force reload from the server
    }
  });
}
