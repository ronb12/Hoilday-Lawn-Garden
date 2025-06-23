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

// Standard header template matching education.html
const standardHeader = `  <div id="error" class="error-message" role="alert" aria-live="polite"></div>  <!-- Header Navigation -->
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

// Standard CSS for headers and heroes
const standardCSS = `
    /* Standard Header and Hero Styles */
    body {
        padding-top: 100px;
        margin: 0;
        font-family: 'Montserrat', Arial, sans-serif;
        background: #f7f7f7;
        color: #222;
    }
    
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
    
    .hero {
        position: relative;
        width: 100vw;
        min-height: 60vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #222;
        overflow: hidden;
        margin-top: 80px;
    }
    
    .hero img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 1;
        filter: brightness(0.6);
    }
    
    .hero-content {
        position: relative;
        z-index: 2;
        text-align: center;
        color: #fff;
        padding: 2rem;
        max-width: 800px;
    }
    
    .hero-content h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
        font-weight: 600;
        letter-spacing: 1px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .hero-content p {
        font-size: 1.25rem;
        font-weight: 400;
        margin-bottom: 2rem;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
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
        
        .hero-content h1 {
            font-size: 2rem;
        }
        
        .hero-content p {
            font-size: 1rem;
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
        
        // Check if page has a hero section
        const hasHero = content.includes('class="hero"') || content.includes('class=\'hero\'');
        
        // Replace existing header with standard header
        const headerRegex = /<header[^>]*class="main-header"[^>]*>[\s\S]*?<\/header>/gi;
        if (headerRegex.test(content)) {
            content = content.replace(headerRegex, standardHeader);
            updated = true;
        }
        
        // Add standard CSS if not already present
        if (!content.includes('/* Standard Header and Hero Styles */')) {
            const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
            const lastStyleMatch = [...content.matchAll(styleTagRegex)].pop();
            
            if (lastStyleMatch) {
                const insertPosition = lastStyleMatch.index + lastStyleMatch[0].length;
                content = content.slice(0, insertPosition) + '\n<style>\n' + standardCSS + '\n</style>' + content.slice(insertPosition);
            } else {
                // Insert before closing head tag
                const headCloseIndex = content.indexOf('</head>');
                if (headCloseIndex !== -1) {
                    content = content.slice(0, headCloseIndex) + '\n<style>\n' + standardCSS + '\n</style>\n' + content.slice(headCloseIndex);
                }
            }
            updated = true;
        }
        
        // Ensure hero section is properly structured
        if (hasHero) {
            // Fix hero structure if needed
            const heroRegex = /<section[^>]*class="hero"[^>]*>([\s\S]*?)<\/section>/gi;
            const heroDivRegex = /<div[^>]*class="hero"[^>]*>([\s\S]*?)<\/div>/gi;
            
            if (heroRegex.test(content)) {
                content = content.replace(heroRegex, (match, heroContent) => {
                    return `<div class="hero">${heroContent}</div>`;
                });
                updated = true;
            }
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
console.log('🚀 Starting header and hero standardization...\n');

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
    console.log('\n🎉 Header and hero standardization complete!');
    console.log('All headers now match the education.html structure.');
    console.log('All heroes are properly displayed with consistent styling.');
} else {
    console.log('\n✨ All pages already have the correct header and hero structure!');
} 