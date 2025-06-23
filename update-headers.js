const fs = require('fs');
const path = require('path');

// Standardized header structure
const standardHeader = `  <!-- Header -->
  <header class="main-header">
    <div class="logo">
      <a href="index.html">
        <picture>
          <source srcset="assets/images/hollidays-logo.optimized-1280.webp" type="image/webp">
          <img src="assets/images/hollidays-logo.optimized-1280.png" alt="Holliday's Lawn &amp; Garden Logo" loading="lazy">
        </picture>
      </a>
    </div>
    <nav id="nav-menu">
      <button class="hamburger" aria-label="Toggle menu" aria-controls="nav-menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="services.html">Services</a></li>
        <li><a href="education.html">Education</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="pay-your-bill.html">Pay Your Bill</a></li>
      </ul>
      <div class="login-buttons">
        <a href="login.html" class="btn-login btn-customer">
          <i class="fas fa-user"></i>
          Customer Login
        </a>
        <a href="admin-login.html" class="btn-login btn-admin">
          <i class="fas fa-lock"></i>
          Admin Login
        </a>
      </div>
    </nav>
  </header>`;

// Files that have already been updated manually
const alreadyUpdated = [
  'index.html',
  'about.html',
  'services.html',
  'education.html',
  'faq.html',
  'contact.html',
  'pay-your-bill.html',
  'login.html',
  'register.html',
  'gallery.html',
  'testimonials.html',
  'admin-login.html',
  'forgot-password.html',
  'create-account.html',
  'privacy.html',
  'terms.html',
  'privacy-policy.html',
  'dashboard.html',
  'customer-dashboard.html',
  'sitemap.html'
];

// Files to skip (backups, special pages, etc.)
const skipFiles = [
  'index.html.backup',
  'education.html.backup',
  'faq.html.backup',
  'receipt.html.backup',
  'education-fresh.html',
  'template.html',
  'template 2.html',
  'testimonials 2.html',
  'dashboard 2.html',
  '404.html',
  '404 2.html',
  'offline.html',
  'offline 2.html',
  'error.html',
  'payment-success.html',
  'payment-failed.html',
  'payment-cancelled.html',
  'payment-declined.html',
  'payment-disputed.html',
  'payment-error.html',
  'payment-expired.html',
  'payment-hold.html',
  'payment-invalid.html',
  'payment-limit.html',
  'payment-locked.html',
  'payment-maintenance.html',
  'payment-overdue.html',
  'payment-partial.html',
  'payment-pending.html',
  'payment-processing.html',
  'payment-refunded.html',
  'payment-reversed.html',
  'payment-timeout.html',
  'payment-voided.html'
];

function updateHeaderInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file already has the correct structure
    if (content.includes('<div class="login-buttons">')) {
      console.log(`✓ ${filePath} - Already has correct structure`);
      return;
    }
    
    // Find the old header structure and replace it
    const oldHeaderRegex = /<!-- Header -->\s*<header class="main-header">[\s\S]*?<\/header>/;
    const match = content.match(oldHeaderRegex);
    
    if (match) {
      const newContent = content.replace(oldHeaderRegex, standardHeader);
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ Updated ${filePath}`);
    } else {
      console.log(`⚠ ${filePath} - No header found to update`);
    }
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
  }
}

function main() {
  const htmlFiles = fs.readdirSync('.')
    .filter(file => file.endsWith('.html'))
    .filter(file => !alreadyUpdated.includes(file))
    .filter(file => !skipFiles.includes(file))
    .filter(file => !file.includes('.backup'))
    .filter(file => !file.includes('.final_backup'));

  console.log('Updating headers in HTML files...\n');
  
  htmlFiles.forEach(file => {
    updateHeaderInFile(file);
  });
  
  console.log(`\nCompleted! Updated ${htmlFiles.length} files.`);
}

main(); 