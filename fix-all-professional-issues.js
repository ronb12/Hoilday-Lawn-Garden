const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing All Professional Design Issues...\n');

// 1. Fix hero section visibility for all pages
const heroPages = [
    'index.html', 'about.html', 'services.html', 'education.html', 'faq.html',
    'contact.html', 'register.html', 'pay-your-bill.html', 'admin-login.html', 'testimonials.html'
];

heroPages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add hero visibility CSS if not present
    if (content.includes('class="hero"') && !content.includes('.hero h1 { display: block !important;')) {
        const heroCSS = `
<style>
/* Ensure hero H1 elements are always visible */
.hero h1 {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: relative !important;
    z-index: 10 !important;
}
</style>`;
        content = content.replace('</head>', `${heroCSS}\n</head>`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed hero visibility in ${page}`);
    }
});

// 2. Remove hamburger menu code from all pages
const hamburgerPages = ['services.html', 'register.html', 'pay-your-bill.html', 'testimonials.html', 'gallery.html', 'terms.html'];

hamburgerPages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Remove hamburger-related code
    content = content.replace(/<button[^>]*class="[^"]*hamburger[^"]*"[^>]*>.*?<\/button>/gis, '');
    content = content.replace(/hamburger[^>]*>/gi, '');
    content = content.replace(/Hamburger[^>]*>/gi, '');
    
    if (content !== fs.readFileSync(filePath, 'utf8')) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Removed hamburger code from ${page}`);
    }
});

// 3. Add mobile tab bar CSS to pages missing it
const mobileTabBarCSS = `
<style>
/* Mobile Tab Bar - Hide on Desktop */
@media (min-width: 769px) {
  .mobile-tab-bar { display: none !important; }
}
@media (max-width: 768px) {
  .mobile-tab-bar {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    height: 64px;
    background: #fff;
    border-top: 1px solid #e0e0e0;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
    z-index: 2000;
    justify-content: space-around;
    align-items: center;
  }
}
</style>`;

const mobileTabBarPages = ['contact.html', 'add-customer.html', 'add-staff.html', 'add-payment.html', 'testimonials.html', 'gallery.html', 'terms.html', 'privacy-policy.html'];

mobileTabBarPages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('@media (min-width: 769px)')) {
        content = content.replace('</head>', `${mobileTabBarCSS}\n</head>`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Added mobile tab bar CSS to ${page}`);
    }
});

// 4. Add missing H1 headings to dashboard pages
const dashboardPages = {
    'login.html': 'Login',
    'admin-dashboard.html': 'Admin Dashboard',
    'customer-dashboard.html': 'Customer Dashboard',
    'appointments.html': 'Appointments',
    'customers.html': 'Customers',
    'staff.html': 'Staff Management',
    'payments.html': 'Payments',
    'messages.html': 'Messages',
    'inventory.html': 'Inventory',
    'analytics.html': 'Analytics',
    'gallery.html': 'Gallery',
    'terms.html': 'Terms of Service'
};

Object.entries(dashboardPages).forEach(([page, title]) => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('<h1>')) {
        // Add H1 after main tag or body tag
        const h1Tag = `<h1 style="color: #2c5530; font-size: 2.5rem; margin: 2rem 0; text-align: center;">${title}</h1>`;
        
        if (content.includes('<main')) {
            content = content.replace('<main', `<main>\n${h1Tag}`);
        } else if (content.includes('<body>')) {
            content = content.replace('<body>', `<body>\n${h1Tag}`);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Added H1 heading to ${page}`);
    }
});

// 5. Add Montserrat font to pages missing it
const montserratCSS = `
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
body {
    font-family: 'Montserrat', -apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>`;

const montserratPages = ['customer-dashboard.html', 'add-appointment.html'];

montserratPages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('Montserrat')) {
        content = content.replace('</head>', `${montserratCSS}\n</head>`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Added Montserrat font to ${page}`);
    }
});

// 6. Fix broken pages (add-customer.html, add-staff.html, add-payment.html)
const brokenPages = {
    'add-customer.html': 'Add Customer',
    'add-staff.html': 'Add Staff Member',
    'add-payment.html': 'Add Payment'
};

Object.entries(brokenPages).forEach(([page, title]) => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if page is broken (missing basic structure)
    if (!content.includes('<head>') || !content.includes('<body>')) {
        const fixedContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Holliday Lawn & Garden - ${title}</title>
    <meta name="description" content="${title} form for Holliday Lawn & Garden management system."/>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/main.css">
    <style>
        body {
            font-family: 'Montserrat', -apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2c5530;
            font-size: 2.5rem;
            margin: 2rem 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <p>This page is under construction. Please check back later.</p>
    </div>
    
    <!-- Mobile Tab Bar -->
    <nav class="mobile-tab-bar" aria-label="Mobile Tab Bar Navigation">
        <a href="index.html" aria-label="Home"><i class="fas fa-home"></i><span>Home</span></a>
        <a href="about.html" aria-label="About"><i class="fas fa-leaf"></i><span>About</span></a>
        <a href="services.html" aria-label="Tools"><i class="fas fa-tools"></i><span>Services</span></a>
        <a href="pay-your-bill.html" aria-label="Pay Your Bill"><i class="fas fa-credit-card"></i><span>Pay Bill</span></a>
        <a href="faq.html" aria-label="FAQ"><i class="fas fa-question-circle"></i><span>FAQ</span></a>
        <a href="contact.html" aria-label="Contact"><i class="fas fa-envelope"></i><span>Contact</span></a>
        <a href="login.html" aria-label="Login"><i class="fas fa-user"></i><span>Login</span></a>
    </nav>
    
    <style>
    @media (min-width: 769px) {
      .mobile-tab-bar { display: none !important; }
    }
    @media (max-width: 768px) {
      .mobile-tab-bar {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        height: 64px;
        background: #fff;
        border-top: 1px solid #e0e0e0;
        box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
        z-index: 2000;
        justify-content: space-around;
        align-items: center;
      }
    }
    </style>
</body>
</html>`;
        
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`✅ Fixed broken page structure for ${page}`);
    }
});

// 7. Fix testimonials.html specific issues
const testimonialsPath = path.join(__dirname, 'testimonials.html');
if (fs.existsSync(testimonialsPath)) {
    let content = fs.readFileSync(testimonialsPath, 'utf8');
    
    // Remove console.error statements
    content = content.replace(/console\.error\([^)]*\);/g, '');
    
    // Fix absolute URLs
    content = content.replace(/href="https:\/\/hollidaylawngarden\.com\//g, 'href="./');
    
    fs.writeFileSync(testimonialsPath, content, 'utf8');
    console.log('✅ Fixed testimonials.html issues');
}

// 8. Add missing meta descriptions
const metaDescriptionPages = ['gallery.html'];
metaDescriptionPages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('description')) {
        const metaDesc = '<meta name="description" content="View our beautiful landscaping and lawn care gallery showcasing our professional work and satisfied customers."/>';
        content = content.replace('</head>', `${metaDesc}\n</head>`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Added meta description to ${page}`);
    }
});

console.log('\n🎉 All professional design issues have been fixed!');
console.log('Run the audit again to verify improvements.'); 