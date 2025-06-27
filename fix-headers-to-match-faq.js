const fs = require('fs');
const path = require('path');

// Main pages to update (excluding utility/payment pages)
const mainPages = [
    'index.html', 'about.html', 'services.html', 'education.html', 'faq.html', 
    'contact.html', 'gallery.html', 'testimonials.html', 'privacy.html', 'terms.html',
    'login.html', 'register.html', 'create-account.html', 'forgot-password.html',
    'pay-your-bill.html', 'customer-dashboard.html', 'admin-dashboard.html',
    'admin-login.html', 'dashboard.html', 'appointments.html', 'customers.html',
    'staff.html', 'payments.html', 'messages.html', 'inventory.html', 'analytics.html',
    'add-appointment.html', 'add-customer.html', 'add-staff.html', 'add-payment.html',
    'assign-accounts.html', 'check-accounts.html', 'generate-report.html',
    'schedule-maintenance.html', 'bulk-message.html', 'sitemap.html'
];

// Correct header template matching faq.html exactly
const correctHeader = `  <!-- Loading & Error Validation -->
  <div id="loading" class="loading" role="status" aria-label="Loading page content">
    <div class="spinner" aria-hidden="true"></div>
  </div>
  <div id="error" class="error-message" role="alert" aria-live="polite"></div>  <!-- Header Navigation -->
    <div id="error" class="error-message" role="alert" aria-live="polite"></div>  <!-- Header Navigation -->
  <header class="main-header">
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

function updatePage(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Remove any existing loading/error divs and headers
        const loadingErrorRegex = /<!-- Loading & Error Validation -->[\s\S]*?<div id="error" class="error-message" role="alert" aria-live="polite"><\/div>/gi;
        const headerRegex = /<header[^>]*class="main-header"[^>]*>[\s\S]*?<\/header>/gi;
        const errorDivRegex = /<div id="error" class="error-message" role="alert" aria-live="polite"><\/div>\s*<!-- Header Navigation -->/gi;
        
        // Remove existing structures
        content = content.replace(loadingErrorRegex, '');
        content = content.replace(headerRegex, '');
        content = content.replace(errorDivRegex, '');
        
        // Find the body tag and insert the correct header structure
        const bodyTagRegex = /<body[^>]*>/i;
        const bodyMatch = content.match(bodyTagRegex);
        
        if (bodyMatch) {
            const insertPosition = bodyMatch.index + bodyMatch[0].length;
            content = content.slice(0, insertPosition) + '\n' + correctHeader + '\n' + content.slice(insertPosition);
            updated = true;
        }
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️  No changes needed: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🚀 Starting header fix to match FAQ page...\n');

let updatedCount = 0;
let totalCount = 0;

mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        totalCount++;
        if (updatePage(page)) {
            updatedCount++;
        }
    } else {
        console.log(`⚠️  File not found: ${page}`);
    }
});

console.log(`\n📊 Summary:`);
console.log(`   Total pages processed: ${totalCount}`);
console.log(`   Pages updated: ${updatedCount}`);
console.log(`   Pages unchanged: ${totalCount - updatedCount}`);

if (updatedCount > 0) {
    console.log('\n🎉 Header fix complete!');
    console.log('All headers now match the FAQ page structure exactly.');
} else {
    console.log('\n✨ All pages already have the correct header structure!');
} 