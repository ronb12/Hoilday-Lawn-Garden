const fs = require('fs');
const path = require('path');

// Standard header structure to use across all pages
const standardHeader = `<header class="main-header">
  <div class="logo">
    <a href="index.html">
      <picture>
        <source srcset="assets/images/hollidays-logo.webp" type="image/webp" />
        <img src="assets/images/hollidays-logo.webp" alt="Holliday's Lawn & Garden Logo" loading="lazy" />
      </picture>
    </a>
  </div>
  <button class="hamburger" aria-controls="nav-menu" aria-expanded="false" aria-label="Toggle menu">
    <span></span><span></span><span></span>
  </button>
  <nav id="nav-menu" aria-label="Main navigation">
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="education.html">Education</a></li>
      <li><a href="faq.html">FAQ</a></li>
      <li><a href="contact.html">Contact</a></li>
      <li><a href="pay-your-bill.html">Pay Your Bill</a></li>
      <li class="login-buttons">
        <a class="btn-login btn-customer" href="login.html"><i class="fas fa-user"></i> Customer Login</a>
        <a class="btn-login btn-admin" href="admin-login.html"><i class="fas fa-lock"></i> Admin Login</a>
      </li>
    </ul>
  </nav>
</header>`;

// Standard header CSS to add to all pages
const headerCSS = `
    .main-header { 
      background: #fff !important; 
      min-height: 70px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 0 2rem !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    }
    .logo {
      display: flex !important;
      align-items: center !important;
    }
    .logo img {
      height: 50px !important;
      width: auto !important;
    }
    .nav-links { 
      display: flex !important;
      align-items: center !important;
      list-style: none !important;
      margin: 0 !important;
      padding: 0 !important;
      gap: 2rem !important;
    }
    .nav-links a { 
      padding-top: 0 !important; 
      padding-bottom: 0 !important; 
      color: #333 !important; 
      font-weight: 500 !important;
      text-decoration: none !important;
      transition: color 0.3s ease !important;
    }
    .nav-links a:hover {
      color: #2e7d32 !important;
    }
    .nav-links li { 
      display: flex; 
      align-items: center; 
    }
    .login-buttons {
      display: flex !important;
      gap: 1rem !important;
      align-items: center !important;
    }
    .btn-login {
      padding: 0.5rem 1rem !important;
      border-radius: 4px !important;
      text-decoration: none !important;
      font-weight: 500 !important;
      transition: all 0.3s ease !important;
    }
    .btn-customer {
      background: #2e7d32 !important;
      color: white !important;
    }
    .btn-admin {
      background: #1565c0 !important;
      color: white !important;
    }
    .btn-login:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
    }
    .hamburger {
      display: none !important;
    }
    @media (max-width: 768px) {
      .main-header {
        padding: 0 1rem !important;
      }
      .nav-links { 
        display: none !important; 
        position: absolute !important; 
        top: 100% !important; 
        left: 0 !important; 
        right: 0 !important; 
        background: var(--color-primary, #4caf50) !important; 
        padding: 1rem !important; 
        flex-direction: column !important; 
        align-items: center !important; 
        box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important;
        z-index: 1000 !important;
      }
      .nav-links.active { 
        display: flex !important; 
      }
      .hamburger { 
        display: block !important; 
      }
      .login-buttons {
        flex-direction: column !important;
        gap: 0.5rem !important;
      }
    }`;

// Get all HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

console.log(`🔧 Fixing headers across ${htmlFiles.length} HTML files...\n`);

let filesUpdated = 0;
let filesSkipped = 0;

htmlFiles.forEach(file => {
  console.log(`Processing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Check if this is a main page that should have full navigation
  const isMainPage = [
    'index.html', 'about.html', 'services.html', 'contact.html', 
    'education.html', 'faq.html', 'gallery.html', 'testimonials.html',
    'privacy.html', 'terms.html', 'pay-your-bill.html'
  ].includes(file);

  // Check if this is a user-facing page that should have navigation but maybe different login buttons
  const isUserPage = [
    'login.html', 'register.html', 'forgot-password.html', 'customer-dashboard.html',
    'profile.html', 'receipt.html'
  ].includes(file);

  // Check if this is an admin page that might need different navigation
  const isAdminPage = [
    'admin.html', 'admin-login.html', 'admin-dashboard.html', 'analytics.html',
    'appointments.html', 'customers.html', 'payments.html', 'staff.html',
    'inventory.html', 'messages.html'
  ].includes(file);

  // Skip payment status pages and utility pages
  const skipPages = [
    'payment-success.html', 'payment-failed.html', 'payment-cancelled.html',
    'payment-declined.html', 'payment-disputed.html', 'payment-error.html',
    'payment-expired.html', 'payment-hold.html', 'payment-invalid.html',
    'payment-limit.html', 'payment-locked.html', 'payment-maintenance.html',
    'payment-overdue.html', 'payment-partial.html', 'payment-pending.html',
    'payment-processing.html', 'payment-refunded.html', 'payment-reversed.html',
    'payment-timeout.html', 'payment-voided.html', 'offline.html', 'error.html',
    '404.html', '404 2.html', 'template.html', 'template 2.html',
    'check-firebase.html', 'check-accounts.html', 'assign-accounts.html',
    'bulk-message.html', 'generate-report.html', 'run-assignment.html',
    'setup-inventory-collections.html', 'setup-staff-collections.html',
    'add-appointment.html', 'add-customer.html', 'add-payment.html', 'add-staff.html',
    'schedule-maintenance.html', 'sitemap.html'
  ];

  if (skipPages.includes(file)) {
    console.log(`  ⏭️  Skipping ${file} (utility/payment page)`);
    filesSkipped++;
    return;
  }

  // Replace old header structure with new one
  const oldHeaderPattern = /<header class="main-header">.*?<\/header>/s;
  if (oldHeaderPattern.test(content)) {
    content = content.replace(oldHeaderPattern, standardHeader);
    modified = true;
    console.log(`  ✅ Updated header structure`);
  }

  // Add header CSS if not already present
  if (!content.includes('.main-header {') || !content.includes('display: flex !important')) {
    // Find the last </style> tag and add our CSS before it
    const lastStyleIndex = content.lastIndexOf('</style>');
    if (lastStyleIndex !== -1) {
      content = content.slice(0, lastStyleIndex) + headerCSS + '\n  ' + content.slice(lastStyleIndex);
      modified = true;
      console.log(`  ✅ Added header CSS`);
    }
  }

  // Add mobile menu JavaScript if not present
  if (!content.includes('hamburger.addEventListener') && !content.includes('DOMContentLoaded')) {
    const mobileMenuScript = `
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      var hamburger = document.querySelector('.hamburger');
      var nav = document.getElementById('nav-menu');
      var navLinks = document.querySelector('.nav-links');
      var body = document.body;
      
      if (hamburger && nav && navLinks) {
        hamburger.addEventListener('click', function() {
          var expanded = hamburger.getAttribute('aria-expanded') === 'true';
          hamburger.classList.toggle('active');
          nav.classList.toggle('active');
          navLinks.classList.toggle('active');
          body.classList.toggle('menu-open');
          hamburger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          body.style.overflow = expanded ? '' : 'hidden';
        });

        document.addEventListener('click', function(e) {
          if (!nav.contains(e.target) && !hamburger.contains(e.target) && nav.classList.contains('active')) {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
            navLinks.classList.remove('active');
            body.classList.remove('menu-open');
            body.style.overflow = '';
            hamburger.setAttribute('aria-expanded', 'false');
          }
        });

        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && nav.classList.contains('active')) {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
            navLinks.classList.remove('active');
            body.classList.remove('menu-open');
            body.style.overflow = '';
            hamburger.setAttribute('aria-expanded', 'false');
          }
        });

        navLinks.querySelectorAll('a').forEach(function(link) {
          link.addEventListener('click', function() {
            if (nav.classList.contains('active')) {
              hamburger.classList.remove('active');
              nav.classList.remove('active');
              navLinks.classList.remove('active');
              body.classList.remove('menu-open');
              body.style.overflow = '';
              hamburger.setAttribute('aria-expanded', 'false');
            }
          });
        });
      }
    });
  </script>`;

    // Add before closing body tag
    const bodyCloseIndex = content.lastIndexOf('</body>');
    if (bodyCloseIndex !== -1) {
      content = content.slice(0, bodyCloseIndex) + mobileMenuScript + '\n' + content.slice(bodyCloseIndex);
      modified = true;
      console.log(`  ✅ Added mobile menu JavaScript`);
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    filesUpdated++;
    console.log(`  ✅ Updated ${file}`);
  } else {
    console.log(`  ⏭️  No changes needed for ${file}`);
    filesSkipped++;
  }
});

console.log(`\n📊 SUMMARY:`);
console.log(`Files updated: ${filesUpdated}`);
console.log(`Files skipped: ${filesSkipped}`);
console.log(`Total files processed: ${htmlFiles.length}`);

if (filesUpdated > 0) {
  console.log(`\n✅ Header alignment and professional styling applied to ${filesUpdated} pages!`);
} else {
  console.log(`\n✅ All pages already have proper header structure!`);
} 