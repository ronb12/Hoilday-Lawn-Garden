const fs = require('fs');
const path = require('path');

// Main pages to update
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

// Original working header structure
const originalHeader = `  <!-- Loading Spinner -->
  <div id="loading" class="loading" role="status" aria-label="Loading page content">
      <div class="spinner" aria-hidden="true"></div>
  </div>
  
  <!-- Error Message -->
  <div id="error" class="error-message" role="alert" aria-live="polite"></div>
  
  <!-- Header -->
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
              <li class="login-buttons">
                  <a href="login.html" class="btn-login btn-customer">
                      <i class="fas fa-user"></i>
                      Customer Login
                  </a>
                  <a href="admin-login.html" class="btn-login btn-admin">
                      <i class="fas fa-lock"></i>
                      Admin Login
                  </a>
              </li>
          </ul>
      </nav>
  </header>

  <!-- Main Content -->
  <main role="main">
      <!-- Hero Section -->`;

// Original working CSS
const originalCSS = `
    /* Header Styles */
    .main-header {
        background: #fff;
        min-height: 70px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
    }
    
    .logo {
        display: flex;
        align-items: center;
    }
    
    .logo img {
        height: 50px;
        width: auto;
    }
    
    .nav-links { 
        display: flex;
        align-items: center;
        list-style: none;
        margin: 0;
        padding: 0;
        gap: 2rem;
    }
    
    .nav-links a { 
        padding-top: 0; 
        padding-bottom: 0; 
        color: #333; 
        font-weight: 500;
        text-decoration: none;
        transition: color 0.3s ease;
    }
    
    .nav-links a:hover {
        color: #2e7d32;
    }
    
    .nav-links li { 
        display: flex; 
        align-items: center; 
    }
    
    .login-buttons {
        display: flex;
        gap: 1rem;
        align-items: center;
    }
    
    .btn-login {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        min-width: 120px;
        text-align: center;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .btn-customer {
        background: #2e7d32;
        color: white;
    }
    
    .btn-admin {
        background: #1565c0;
        color: white;
    }
    
    .btn-login:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    .hamburger {
        display: none;
        cursor: pointer;
        padding: 15px;
        z-index: 1000;
        position: relative;
        background: none;
        border: none;
        -webkit-tap-highlight-color: transparent;
        margin-right: 10px;
    }

    .hamburger span {
        display: block;
        width: 25px;
        height: 3px;
        background-color: #2e7d32;
        margin: 5px 0;
        transition: 0.3s;
    }

    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }

    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
    
    @media (max-width: 768px) {
        body {
            padding-top: 80px;
        }
        
        .main-header {
            padding: 0 1rem;
        }
        
        .nav-links { 
            display: none; 
            position: absolute; 
            top: 100%; 
            left: 0; 
            right: 0; 
            background: var(--color-primary, #4caf50); 
            padding: 1rem; 
            flex-direction: column; 
            align-items: center; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
            z-index: 1000; 
        }
        
        .nav-links.active { 
            display: flex; 
        }
        
        .hamburger { 
            display: block; 
        }
        
        .login-buttons {
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .btn-login {
            min-width: 140px;
            font-size: 0.85rem;
        }
    }
    
    @media (max-width: 900px) {
        .main-header .nav-links {
            margin-top: 0;
            padding-top: 0.5em;
        }
    }
`;

function restoreOriginalHeader(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Remove all existing header-related content
        const headerRegex = /<header[^>]*class="main-header"[^>]*>[\s\S]*?<\/header>/gi;
        const loadingErrorRegex = /<!-- Loading[^>]*>[\s\S]*?<div class="spinner" aria-hidden="true"><\/div>\s*<\/div>/gi;
        const enhancedCSSRegex = /\/\* Enhanced Header and Button Styles \*\/[\s\S]*?@media \(max-width: 900px\)[\s\S]*?}/gi;
        const headerCSSRegex = /\/\* Header Styles \*\/[\s\S]*?@media \(max-width: 900px\)[\s\S]*?}/gi;
        const duplicateHeroRegex = /<!-- Hero Section -->\s*\n\s*<!-- Hero Section -->/gi;
        const emptyStyleTags = /<style>\s*<\/style>/gi;
        const multipleStyleTags = /<style>\s*{\s*}\s*<\/style>/gi;
        
        // Remove existing structures
        content = content.replace(loadingErrorRegex, '');
        content = content.replace(headerRegex, '');
        content = content.replace(enhancedCSSRegex, '');
        content = content.replace(headerCSSRegex, '');
        content = content.replace(duplicateHeroRegex, '<!-- Hero Section -->');
        content = content.replace(emptyStyleTags, '');
        content = content.replace(multipleStyleTags, '');
        
        // Remove any remaining "Header Navigation" comments
        const headerCommentRegex = /<!-- Header Navigation -->\s*\n\s*/gi;
        content = content.replace(headerCommentRegex, '');
        
        // Find the body tag and insert the original header structure
        const bodyTagRegex = /<body[^>]*>/i;
        const bodyMatch = content.match(bodyTagRegex);
        
        if (bodyMatch) {
            const insertPosition = bodyMatch.index + bodyMatch[0].length;
            content = content.slice(0, insertPosition) + '\n' + originalHeader + '\n' + content.slice(insertPosition);
            updated = true;
        }
        
        // Remove ALL existing header CSS and add original CSS
        content = content.replace(enhancedCSSRegex, '');
        content = content.replace(headerCSSRegex, '');
        
        // Insert original CSS before closing head tag
        const headCloseIndex = content.indexOf('</head>');
        if (headCloseIndex !== -1) {
            content = content.slice(0, headCloseIndex) + '\n<style>\n' + originalCSS + '\n</style>\n' + content.slice(headCloseIndex);
            updated = true;
        }
        
        // Clean up any extra spacing
        const extraBlankLines = /\n\s*\n\s*\n/g;
        content = content.replace(extraBlankLines, '\n\n');
        
        // Remove any remaining extra spaces
        const multipleSpaces = /[ ]{2,}/g;
        content = content.replace(multipleSpaces, ' ');
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Restored: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️  No changes needed: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error restoring ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🔄 Starting original header restoration...\n');

let restoredCount = 0;
let totalCount = 0;

mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        totalCount++;
        if (restoreOriginalHeader(page)) {
            restoredCount++;
        }
    } else {
        console.log(`⚠️  File not found: ${page}`);
    }
});

console.log(`\n📊 Summary:`);
console.log(`   Total pages processed: ${totalCount}`);
console.log(`   Pages restored: ${restoredCount}`);
console.log(`   Pages unchanged: ${totalCount - restoredCount}`);

if (restoredCount > 0) {
    console.log('\n🎉 Original header restoration complete!');
    console.log('All headers now match the original working structure.');
} else {
    console.log('\n✨ All headers are already in original format!');
} 