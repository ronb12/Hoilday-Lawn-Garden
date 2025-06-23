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

// Final perfect CSS with zero spacing
const finalPerfectCSS = `
    /* Final Perfect Header and Hero - Zero Spacing */
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
    
    /* Hero Section - ZERO SPACING */
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
        margin-top: 0 !important;
        padding: 0 !important;
        top: 70px !important;
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
    
    /* Body and Main Content - ZERO SPACING */
    body {
        padding-top: 0 !important;
        margin: 0 !important;
    }
    
    main {
        margin: 0 !important;
        padding: 0 !important;
    }
    
    @media (max-width: 768px) {
        body {
            padding-top: 0 !important;
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

function fixFinalSpacing(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Remove any existing CSS
        const cssRegex = /\/\* (Perfect|Final).*?@media \(max-width: 900px\)[\s\S]*?}/gi;
        content = content.replace(cssRegex, '');
        
        // Remove white space between header and main
        content = content.replace(/(<\/header>)\s*\n\s*(<!-- Main Content -->)\s*\n\s*(<main)/g, '$1\n$2\n$3');
        
        // Remove any extra line breaks and indentation
        content = content.replace(/(<\/header>)\s*\n\s*(<main)/g, '$1\n$2');
        
        // Insert final perfect CSS before closing head tag
        const headCloseIndex = content.indexOf('</head>');
        if (headCloseIndex !== -1) {
            content = content.slice(0, headCloseIndex) + '\n<style>\n' + finalPerfectCSS + '\n</style>\n' + content.slice(headCloseIndex);
            updated = true;
        }
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed final spacing: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️  No changes needed: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing final spacing for ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🎯 Starting final spacing fix...\n');

let fixedCount = 0;
let totalCount = 0;

mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        totalCount++;
        if (fixFinalSpacing(page)) {
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
    console.log('\n🎉 Final spacing fix complete!');
    console.log('ZERO spacing between header and hero sections achieved.');
} else {
    console.log('\n✨ All pages already have perfect spacing!');
} 