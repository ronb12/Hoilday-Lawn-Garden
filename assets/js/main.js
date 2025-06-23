import { app, auth, db } from './firebase-config.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

console.log("main.js loaded");

// Service data directly in main.js for reliability
const services = {
  'lawn-maintenance': {
    id: 'lawn-maintenance',
    title: 'Lawn Maintenance',
    icon: '🌱',
    description: 'Keep your lawn looking its best with our comprehensive maintenance services.',
    features: [
      'Regular mowing and edging',
      'Lawn fertilization',
      'Weed control',
      'Leaf removal',
      'Seasonal clean-up'
    ]
  },
  'landscaping': {
    id: 'landscaping',
    title: 'Landscaping',
    icon: '🏡',
    description: 'Transform your outdoor space with our professional landscaping services.',
    features: [
      'Custom landscape design',
      'Garden installation',
      'Hardscaping',
      'Mulching',
      'Plant selection and installation'
    ]
  },
  'garden-care': {
    id: 'garden-care',
    title: 'Garden Care',
    icon: '🌸',
    description: 'Expert care for your garden to ensure healthy, beautiful plants year-round.',
    features: [
      'Garden maintenance',
      'Plant care and pruning',
      'Flower bed maintenance',
      'Seasonal planting',
      'Garden clean-up'
    ]
  },
  'commercial': {
    id: 'commercial',
    title: 'Commercial Services',
    icon: '🏢',
    description: 'Professional landscaping and maintenance solutions for businesses and commercial properties.',
    features: [
      'Commercial property maintenance',
      'Business landscape design',
      'Regular maintenance schedules',
      'Seasonal commercial services',
      'Property enhancement'
    ]
  },
  'pressure-washing': {
    id: 'pressure-washing',
    title: 'Pressure Washing',
    icon: '🚿',
    description: 'Restore the beauty of your property with our professional pressure washing services.',
    features: [
      'House washing',
      'Driveway and sidewalk cleaning',
      'Deck and patio cleaning',
      'Fence cleaning',
      'Commercial building cleaning',
      'Soft washing for delicate surfaces',
      'Mold and mildew removal'
    ]
  }
};

// Get all services function
function getAllServices() {
  return services;
}

// Get a specific service by ID
function getServiceById(serviceId) {
  return services[serviceId] || null;
}

// Immediate service loading check
setTimeout(() => {
  console.log('Immediate service check...');
  const servicesGrid = document.querySelector('.services-grid');
  if (servicesGrid && servicesGrid.children.length === 0) {
    console.log('Services grid is empty, attempting to load services...');
    try {
      renderServiceCards(services);
    } catch (error) {
      console.error('Error in immediate service loading:', error);
      renderFallbackServices();
    }
  }
}, 100);

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
  'admin-login.html',
  'pay-your-bill.html'
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
// Only use hamburger and navLinks (.nav-links) for toggling the menu

document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const body = document.body;

    if (hamburger) {
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-controls", "nav-menu");

        hamburger.addEventListener("click", function() {
            const isExpanded = hamburger.getAttribute("aria-expanded") === "true";
            hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
            body.classList.toggle("menu-open");
            hamburger.setAttribute("aria-expanded", !isExpanded);
            body.style.overflow = !isExpanded ? "hidden" : "";
        });

        document.addEventListener("click", function(event) {
            const isClickInside = hamburger.contains(event.target) || navLinks.contains(event.target);
            if (!isClickInside && navLinks.classList.contains("active")) {
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
                body.classList.remove("menu-open");
                body.style.overflow = "";
                hamburger.setAttribute("aria-expanded", "false");
            }
        });

        document.addEventListener("keydown", function(event) {
            if (event.key === "Escape" && navLinks.classList.contains("active")) {
                hamburger.classList.remove("active");
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
                if (window.innerWidth > 768 && navLinks.classList.contains("active")) {
                    hamburger.classList.remove("active");
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
                if (navLinks.classList.contains("active")) {
                    hamburger.classList.remove("active");
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
  console.log('DOM Content Loaded - checking for services');
  const servicesGrid = document.querySelector('.services-grid');
  console.log('Services grid found:', servicesGrid);
  
  if (servicesGrid) {
    console.log('Loading services...');
    try {
      const services = getAllServices();
      console.log('Services loaded:', services);
      if (services && Object.keys(services).length > 0) {
        renderServiceCards(services);
      } else {
        console.error('No services data found');
        // Fallback: render basic service cards
        renderFallbackServices();
      }
    } catch (error) {
      console.error('Error loading services:', error);
      renderFallbackServices();
    }
  } else {
    console.log('No services grid found on this page');
  }

  const serviceId = window.location.hash.substring(1);
  if (serviceId) {
    const service = getServiceById(serviceId);
    if (service) {
      renderServiceDetails(service);
    }
  }
});

// Fallback service rendering if cache fails
function renderFallbackServices() {
  console.log('Rendering fallback services');
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) return;
  
  const fallbackServices = {
    'lawn-maintenance': {
      title: 'Lawn Maintenance',
      icon: '🌱',
      description: 'Keep your lawn looking its best with our comprehensive maintenance services.',
      features: ['Regular mowing and edging', 'Lawn fertilization', 'Weed control', 'Leaf removal', 'Seasonal clean-up']
    },
    'landscaping': {
      title: 'Landscaping',
      icon: '🏡',
      description: 'Transform your outdoor space with our professional landscaping services.',
      features: ['Custom landscape design', 'Garden installation', 'Hardscaping', 'Mulching', 'Plant selection and installation']
    },
    'garden-care': {
      title: 'Garden Care',
      icon: '🌸',
      description: 'Expert care for your garden to ensure healthy, beautiful plants year-round.',
      features: ['Garden maintenance', 'Plant care and pruning', 'Flower bed maintenance', 'Seasonal planting', 'Garden clean-up']
    },
    'commercial': {
      title: 'Commercial Services',
      icon: '🏢',
      description: 'Professional landscaping and maintenance solutions for businesses and commercial properties.',
      features: ['Commercial property maintenance', 'Business landscape design', 'Regular maintenance schedules', 'Seasonal commercial services', 'Property enhancement']
    },
    'pressure-washing': {
      title: 'Pressure Washing',
      icon: '🚿',
      description: 'Restore the beauty of your property with our professional pressure washing services.',
      features: ['House washing', 'Driveway and sidewalk cleaning', 'Deck and patio cleaning', 'Fence cleaning', 'Commercial building cleaning']
    }
  };
  
  renderServiceCards(fallbackServices);
}

function renderServiceCards(services) {
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) {
    console.log('Services grid not found');
    return;
  }

  console.log('Rendering services:', services);
  
  servicesGrid.innerHTML = Object.values(services).map(service => `
    <div class="service-card">
      <div class="service-icon">
        <span class="service-emoji">${service.icon}</span>
      </div>
      <h3>${service.title}</h3>
      <p>${service.description}</p>
      <div class="service-features">
        <ul>
          ${service.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>
      <a href="contact.html" class="btn btn-primary">Get Quote</a>
    </div>
  `).join('');
  
  console.log('Services rendered successfully');
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

// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    console.log('Registering service worker...');
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Add cache clearing to page load
window.addEventListener('load', () => {
  // Hide loading spinner
  const loadingSpinner = document.getElementById('loading');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'none';
  }
});

// Fallback to hide loading spinner after 5 seconds
setTimeout(() => {
  const loadingSpinner = document.getElementById('loading');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'none';
  }
}, 5000);
