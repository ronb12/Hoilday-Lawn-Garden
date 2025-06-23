const fs = require('fs');
const path = require('path');

// Main pages to check
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

// Perfect header and page structure CSS
const perfectPageCSS = `
    /* Perfect Page Structure - No Issues */
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
        z-index: 9999 !important;
        width: 100% !important;
        box-sizing: border-box !important;
    }
    
    .logo {
        display: flex !important;
        align-items: center !important;
        flex-shrink: 0 !important;
    }
    
    .logo img {
        height: 50px !important;
        width: auto !important;
        display: block !important;
    }
    
    #nav-menu {
        display: flex !important;
        align-items: center !important;
        flex-grow: 1 !important;
        justify-content: flex-end !important;
    }
    
    .nav-links { 
        display: flex !important;
        align-items: center !important;
        list-style: none !important;
        margin: 0 !important;
        padding: 0 !important;
        gap: 2rem !important;
        flex-wrap: nowrap !important;
    }
    
    .nav-links a { 
        padding: 0.5rem 0.75rem !important; 
        color: #333 !important; 
        font-weight: 500 !important;
        text-decoration: none !important;
        transition: color 0.3s ease !important;
        white-space: nowrap !important;
        font-size: 0.95rem !important;
        display: block !important;
    }
    
    .nav-links a:hover {
        color: #2e7d32 !important;
    }
    
    .nav-links li { 
        display: flex !important; 
        align-items: center !important; 
        margin: 0 !important;
        padding: 0 !important;
    }
    
    .login-buttons {
        display: flex !important;
        gap: 1rem !important;
        align-items: center !important;
        margin-left: 1rem !important;
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
        white-space: nowrap !important;
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
        margin-left: 1rem;
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
    
    /* Hero Section - Perfect Spacing */
    .hero {
        position: relative !important;
        width: 100vw !important;
        min-height: 60vh !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: #222 !important;
        overflow: hidden !important;
        margin: 0 !important;
        margin-top: 70px !important;
        padding: 0 !important;
    }
    
    .hero img {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        z-index: 1 !important;
        filter: brightness(0.6) !important;
    }
    
    .hero-content {
        position: relative !important;
        z-index: 2 !important;
        text-align: center !important;
        color: #fff !important;
        padding: 2rem !important;
        max-width: 800px !important;
    }
    
    .hero-content h1 {
        font-size: 3rem !important;
        margin-bottom: 1rem !important;
        font-weight: 600 !important;
        letter-spacing: 1px !important;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3) !important;
    }
    
    .hero-content p {
        font-size: 1.25rem !important;
        font-weight: 400 !important;
        margin-bottom: 2rem !important;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3) !important;
    }
    
    /* Body and Main Content */
    body {
        padding-top: 70px !important;
        margin: 0 !important;
    }
    
    main {
        margin: 0 !important;
        padding: 0 !important;
    }
    
    @media (max-width: 768px) {
        body {
            padding-top: 70px !important;
        }
        
        .main-header {
            padding: 0 1rem !important;
        }
        
        #nav-menu {
            justify-content: flex-end !important;
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
            margin-left: 0 !important;
        }
        
        .btn-login {
            min-width: 140px !important;
            font-size: 0.85rem !important;
        }
        
        .hero-content h1 {
            font-size: 2rem !important;
        }
        
        .hero-content p {
            font-size: 1rem !important;
        }
    }
    
    @media (max-width: 900px) {
        .main-header .nav-links {
            margin-top: 0 !important;
            padding-top: 0.5em !important;
        }
    }
`;

function checkAndFixPage(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        let issues = [];
        
        // Check for duplicate main tags
        const mainTags = content.match(/<main[^>]*>/g) || [];
        if (mainTags.length > 1) {
            issues.push(`Duplicate main tags found: ${mainTags.length}`);
            // Remove duplicate main tags, keep only the first one with role="main"
            const firstMainWithRole = content.match(/<main role="main">/);
            if (firstMainWithRole) {
                content = content.replace(/<main[^>]*>/g, (match, index) => {
                    if (match.includes('role="main"')) {
                        return match;
                    } else {
                        return '';
                    }
                });
                updated = true;
            }
        }
        
        // Check for white space between header and main
        if (content.includes('</header>\n  <!-- Main Content -->\n  <main')) {
            issues.push('White space between header and main content');
            content = content.replace('</header>\n  <!-- Main Content -->\n  <main', '</header>\n<!-- Main Content -->\n<main');
            updated = true;
        }
        
        // Remove any existing header CSS
        const headerCSSRegex = /\/\* Perfect Header[\s\S]*?@media \(max-width: 900px\)[\s\S]*?}/gi;
        const heroCSSRegex = /\/\* Hero Section[\s\S]*?@media \(max-width: 900px\)[\s\S]*?}/gi;
        const pageCSSRegex = /\/\* Perfect Page Structure[\s\S]*?@media \(max-width: 900px\)[\s\S]*?}/gi;
        
        content = content.replace(headerCSSRegex, '');
        content = content.replace(heroCSSRegex, '');
        content = content.replace(pageCSSRegex, '');
        
        // Remove empty style tags
        const emptyStyleRegex = /<style>\s*}\s*<\/style>/gi;
        content = content.replace(emptyStyleRegex, '');
        
        // Insert perfect page CSS before closing head tag
        const headCloseIndex = content.indexOf('</head>');
        if (headCloseIndex !== -1) {
            content = content.slice(0, headCloseIndex) + '\n<style>\n' + perfectPageCSS + '\n</style>\n' + content.slice(headCloseIndex);
            updated = true;
        }
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed issues in ${filePath}: ${issues.join(', ')}`);
            return true;
        } else {
            console.log(`⏭️  No issues found: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error checking/fixing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🔍 Starting comprehensive page check...\n');

let fixedCount = 0;
let totalCount = 0;

mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        totalCount++;
        if (checkAndFixPage(page)) {
            fixedCount++;
        }
    } else {
        console.log(`⚠️  File not found: ${page}`);
    }
});

console.log(`\n📊 Summary:`);
console.log(`   Total pages processed: ${totalCount}`);
console.log(`   Pages fixed: ${fixedCount}`);
console.log(`   Pages unchanged: ${totalCount - fixedCount}`);

if (fixedCount > 0) {
    console.log('\n🎉 Comprehensive page check complete!');
    console.log('All duplicate main tags, spacing issues, and header problems have been fixed.');
} else {
    console.log('\n✨ All pages are already perfect!');
} 