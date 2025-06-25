const fs = require('fs');
const path = require('path');

// List of pages to fix
const pages = [
    'index.html', 'about.html', 'services.html', 'education.html', 'faq.html',
    'contact.html', 'login.html', 'register.html', 'pay-your-bill.html',
    'admin-login.html', 'admin-dashboard.html', 'customer-dashboard.html',
    'appointments.html', 'customers.html', 'staff.html', 'payments.html',
    'messages.html', 'inventory.html', 'analytics.html', 'add-appointment.html',
    'add-customer.html', 'add-staff.html', 'add-payment.html'
];

// Standard meta description template
const getMetaDescription = (pageName) => {
    const descriptions = {
        'index.html': 'Professional lawn care and landscaping services in your area. Get expert lawn maintenance, garden care, and landscaping solutions.',
        'about.html': 'Learn about Holliday\'s Lawn & Garden - your trusted partner for professional lawn care and landscaping services.',
        'services.html': 'Comprehensive lawn care and landscaping services including maintenance, design, and commercial solutions.',
        'education.html': 'Educational resources and tips for lawn care, gardening, and landscaping from the experts.',
        'faq.html': 'Frequently asked questions about our lawn care and landscaping services.',
        'contact.html': 'Contact Holliday\'s Lawn & Garden for professional lawn care and landscaping services.',
        'login.html': 'Customer login portal for Holliday\'s Lawn & Garden services.',
        'register.html': 'Create your account to access Holliday\'s Lawn & Garden services.',
        'pay-your-bill.html': 'Pay your lawn care and landscaping service bills securely online.',
        'admin-login.html': 'Administrative login portal for Holliday\'s Lawn & Garden.',
        'admin-dashboard.html': 'Administrative dashboard for managing lawn care services.',
        'customer-dashboard.html': 'Customer dashboard for managing your lawn care account.',
        'appointments.html': 'Schedule and manage your lawn care appointments.',
        'customers.html': 'Customer management portal for lawn care services.',
        'staff.html': 'Staff management portal for lawn care operations.',
        'payments.html': 'Payment management and processing for lawn care services.',
        'messages.html': 'Communication portal for lawn care service messages.',
        'inventory.html': 'Inventory management for lawn care equipment and supplies.',
        'analytics.html': 'Analytics and reporting for lawn care business operations.',
        'add-appointment.html': 'Add new appointments for lawn care services.',
        'add-customer.html': 'Add new customers to the lawn care system.',
        'add-staff.html': 'Add new staff members to the lawn care team.',
        'add-payment.html': 'Add new payments to the lawn care system.'
    };
    return descriptions[pageName] || 'Professional lawn care and landscaping services.';
};

// Standard Open Graph tags
const getOpenGraphTags = (pageName, title) => {
    return `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${getMetaDescription(pageName)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="./${pageName}" />
    <meta property="og:image" content="assets/images/hollidays-logo.optimized-1280.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${getMetaDescription(pageName)}" />`;
};

// Fix viewport meta tag
const fixViewportMeta = (content) => {
    if (!content.includes('viewport')) {
        return content.replace('<meta charset="utf-8"/>', 
            '<meta charset="utf-8"/>\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />');
    }
    return content;
};

// Fix meta description
const fixMetaDescription = (content, pageName) => {
    if (!content.includes('name="description"')) {
        const description = getMetaDescription(pageName);
        return content.replace('<title>', 
            `<meta name="description" content="${description}" />\n<title>`);
    }
    return content;
};

// Fix Open Graph tags
const fixOpenGraphTags = (content, pageName) => {
    if (!content.includes('og:title')) {
        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        if (titleMatch) {
            const title = titleMatch[1];
            const ogTags = getOpenGraphTags(pageName, title);
            return content.replace('</title>', 
                `</title>${ogTags}`);
        }
    }
    return content;
};

// Remove console.error statements
const removeConsoleErrors = (content) => {
    return content.replace(/console\.error\([^)]*\);?/g, '');
};

// Fix mobile tab bar CSS
const fixMobileTabBarCSS = (content) => {
    const mobileTabBarCSS = `
    /* Mobile Tab Bar - Hide on Desktop */
    @media (min-width: 769px) {
        .mobile-tab-bar {
            display: none !important;
        }
    }`;
    
    if (!content.includes('mobile-tab-bar')) {
        return content.replace('</style>', `${mobileTabBarCSS}\n</style>`);
    }
    return content;
};

// Add missing footer to pages that need it
const addMissingFooter = (content, pageName) => {
    const pagesNeedingFooter = ['login.html', 'customer-dashboard.html', 'appointments.html', 
                               'customers.html', 'staff.html', 'payments.html', 'messages.html', 
                               'inventory.html', 'analytics.html', 'add-appointment.html', 
                               'add-customer.html', 'add-staff.html', 'add-payment.html'];
    
    if (pagesNeedingFooter.includes(pageName) && !content.includes('footer')) {
        const footer = `
        <footer class="footer" role="contentinfo">
            <div class="footer-content">
                <div class="footer-grid">
                    <div class="footer-section">
                        <h3>Contact Us</h3>
                        <div class="footer-contact">
                            <span class="footer-owner">Karl Holliday</span>
                            <a href="tel:+15047171887"><i class="fas fa-phone" aria-hidden="true"></i> (504) 717‑1887</a>
                            <a href="mailto:7holliday@gmail.com"><i class="fas fa-envelope" aria-hidden="true"></i> 7holliday@gmail.com</a>
                        </div>
                    </div>
                    <div class="footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="about.html">About Us</a></li>
                            <li><a href="services.html">Services</a></li>
                            <li><a href="education.html">Education</a></li>
                            <li><a href="contact.html">Contact</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h3>Customer Portal</h3>
                        <ul>
                            <li><a href="login.html">Login</a></li>
                            <li><a href="register.html">Register</a></li>
                            <li><a href="pay-your-bill.html">Pay Your Bill</a></li>
                            <li><a href="customer-dashboard.html">Dashboard</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h3>Legal</h3>
                        <ul>
                            <li><a href="privacy.html">Privacy Policy</a></li>
                            <li><a href="terms.html">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© <span id="current-year"></span> Holliday's Lawn & Garden. All rights reserved.</p>
            </div>
        </footer>
        <script>
            const yearElement = document.getElementById('current-year');
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
            }
        </script>`;
        
        return content.replace('</body>', `${footer}\n</body>`);
    }
    return content;
};

// Fix missing body sections
const fixMissingBody = (content) => {
    if (!content.includes('<body>')) {
        return content.replace('</head>', '</head>\n<body>').replace('</html>', '</body>\n</html>');
    }
    return content;
};

// Main fix function
const fixPage = (pageName) => {
    const filePath = path.join(__dirname, pageName);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${pageName}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;
    
    // Apply fixes
    const originalContent = content;
    
    content = fixViewportMeta(content);
    content = fixMetaDescription(content, pageName);
    content = fixOpenGraphTags(content, pageName);
    content = removeConsoleErrors(content);
    content = fixMobileTabBarCSS(content);
    content = addMissingFooter(content, pageName);
    content = fixMissingBody(content);
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed issues in ${pageName}`);
        fixed = true;
    } else {
        console.log(`⏭️  No issues found: ${pageName}`);
    }
    
    return fixed;
};

// Run fixes
console.log('🔧 Starting comprehensive issue fixes...\n');

let fixedCount = 0;
pages.forEach(page => {
    if (fixPage(page)) {
        fixedCount++;
    }
});

console.log(`\n📊 Summary:`);
console.log(`   Total pages processed: ${pages.length}`);
console.log(`   Pages fixed: ${fixedCount}`);
console.log(`   Pages unchanged: ${pages.length - fixedCount}`);

console.log('\n🎉 All issues have been addressed!'); 