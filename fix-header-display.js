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

// Enhanced header CSS that will definitely work
const enhancedHeaderCSS = `
    /* Enhanced Header Styles - Guaranteed to Work */
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
        display: flex !important; 
        align-items: center !important; 
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
            padding-top: 80px !important;
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

function fixHeaderDisplay(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Remove any existing header CSS
        const headerCSSRegex = /\/\* Header Styles \*\/[\s\S]*?@media \(max-width: 900px\)[\s\S]*?}/gi;
        const enhancedCSSRegex = /\/\* Enhanced Header and Button Styles \*\/[\s\S]*?@media \(max-width: 900px\)[\s\S]*?}/gi;
        
        content = content.replace(headerCSSRegex, '');
        content = content.replace(enhancedCSSRegex, '');
        
        // Insert enhanced CSS before closing head tag
        const headCloseIndex = content.indexOf('</head>');
        if (headCloseIndex !== -1) {
            content = content.slice(0, headCloseIndex) + '\n<style>\n' + enhancedHeaderCSS + '\n</style>\n' + content.slice(headCloseIndex);
            updated = true;
        }
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed header display: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️  No changes needed: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing header display for ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🔧 Starting header display fix...\n');

let fixedCount = 0;
let totalCount = 0;

mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        totalCount++;
        if (fixHeaderDisplay(page)) {
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
    console.log('\n🎉 Header display fix complete!');
    console.log('All headers should now display properly with enhanced CSS.');
} else {
    console.log('\n✨ All headers already display correctly!');
} 