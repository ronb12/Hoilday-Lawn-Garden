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

// Standardized header template on one line with consistent button sizes
const standardizedHeader = `  <!-- Loading & Error Validation -->
  <div id="loading" class="loading" role="status" aria-label="Loading page content">
    <div class="spinner" aria-hidden="true"></div>
  </div>

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
</header>

<!-- Hero Section -->`;

// Enhanced CSS for consistent button sizes and header layout
const enhancedCSS = `
    /* Enhanced Header and Button Styles */
    .main-header {
        background: #fff !important;
        min-height: 70px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 0 2rem !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 1000 !important;
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
        font-size: 0.9rem !important;
        min-width: 120px !important;
        text-align: center !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.5rem !important;
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
        
        .btn-login {
            min-width: 140px !important;
            font-size: 0.85rem !important;
        }
    }
    
    @media (max-width: 900px) {
        .main-header .nav-links {
            margin-top: 0 !important;
            padding-top: 0.5em !important;
        }
    }
`;

function updatePage(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Remove existing header structure
        const headerRegex = /<header[^>]*class="main-header"[^>]*>[\s\S]*?<\/header>/gi;
        const loadingErrorRegex = /<!-- Loading & Error Validation -->[\s\S]*?<div class="spinner" aria-hidden="true"><\/div>\s*<\/div>/gi;
        
        // Remove existing structures
        content = content.replace(loadingErrorRegex, '');
        content = content.replace(headerRegex, '');
        
        // Find the body tag and insert the standardized header structure
        const bodyTagRegex = /<body[^>]*>/i;
        const bodyMatch = content.match(bodyTagRegex);
        
        if (bodyMatch) {
            const insertPosition = bodyMatch.index + bodyMatch[0].length;
            content = content.slice(0, insertPosition) + '\n' + standardizedHeader + '\n' + content.slice(insertPosition);
            updated = true;
        }
        
        // Add enhanced CSS if not already present
        if (!content.includes('/* Enhanced Header and Button Styles */')) {
            const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
            const lastStyleMatch = [...content.matchAll(styleTagRegex)].pop();
            
            if (lastStyleMatch) {
                const insertPosition = lastStyleMatch.index + lastStyleMatch[0].length;
                content = content.slice(0, insertPosition) + '\n<style>\n' + enhancedCSS + '\n</style>' + content.slice(insertPosition);
            } else {
                // Insert before closing head tag
                const headCloseIndex = content.indexOf('</head>');
                if (headCloseIndex !== -1) {
                    content = content.slice(0, headCloseIndex) + '\n<style>\n' + enhancedCSS + '\n</style>\n' + content.slice(headCloseIndex);
                }
            }
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
console.log('🚀 Starting header layout standardization...\n');

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
    console.log('\n🎉 Header layout standardization complete!');
    console.log('All headers are now on one line with consistent button sizes.');
} else {
    console.log('\n✨ All pages already have the correct header layout!');
} 