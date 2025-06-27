const fs = require('fs');
const path = require('path');

const pages = [
    'index.html', 'about.html', 'services.html', 'education.html', 'faq.html',
    'contact.html', 'login.html', 'register.html', 'pay-your-bill.html',
    'admin-login.html', 'admin-dashboard.html', 'customer-dashboard.html',
    'appointments.html', 'customers.html', 'staff.html', 'payments.html',
    'messages.html', 'inventory.html', 'analytics.html', 'add-appointment.html',
    'add-customer.html', 'add-staff.html', 'add-payment.html', 'testimonials.html',
    'gallery.html', 'terms.html', 'privacy-policy.html'
];

const mobileTabBarHTML = `\n<nav class="mobile-tab-bar" aria-label="Mobile Tab Bar Navigation">\n  <a href="index.html" aria-label="Home"><i class="fas fa-home"></i><span>Home</span></a>\n  <a href="about.html" aria-label="About"><i class="fas fa-leaf"></i><span>About</span></a>\n  <a href="services.html" aria-label="Tools"><i class="fas fa-tools"></i><span>Services</span></a>\n  <a href="pay-your-bill.html" aria-label="Pay Your Bill"><i class="fas fa-credit-card"></i><span>Pay Bill</span></a>\n  <a href="faq.html" aria-label="FAQ"><i class="fas fa-question-circle"></i><span>FAQ</span></a>\n  <a href="contact.html" aria-label="Contact"><i class="fas fa-envelope"></i><span>Contact</span></a>\n  <a href="login.html" aria-label="Login"><i class="fas fa-user"></i><span>Login</span></a>\n</nav>\n`;

const mobileTabBarCSS = `\n<style>\n@media (min-width: 769px) {\n  .mobile-tab-bar { display: none !important; }\n}\n@media (max-width: 768px) {\n  .mobile-tab-bar {\n    display: flex;\n    position: fixed;\n    bottom: 0;\n    left: 0;\n    width: 100vw;\n    height: 64px;\n    background: #fff;\n    border-top: 1px solid #e0e0e0;\n    box-shadow: 0 -2px 8px rgba(0,0,0,0.06);\n    z-index: 2000;\n    justify-content: space-around;\n    align-items: center;\n  }\n  .mobile-tab-bar a {\n    flex: 1 1 0;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    color: #2e7d32;\n    text-decoration: none;\n    font-size: 0.85rem;\n    font-weight: 600;\n    padding: 0.25rem 0;\n    transition: color 0.2s;\n  }\n  .mobile-tab-bar a.active,\n  .mobile-tab-bar a:active,\n  .mobile-tab-bar a:hover {\n    color: #1565c0;\n  }\n  .mobile-tab-bar i {\n    font-size: 1.5rem;\n    margin-bottom: 0.1rem;\n  }\n}\n</style>\n`;

pages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Ensure mobile tab bar CSS is present
    if (!content.includes('.mobile-tab-bar')) {
        content = content.replace('</head>', `${mobileTabBarCSS}\n</head>`);
        changed = true;
    }

    // Ensure mobile tab bar HTML is present before </body>
    if (!content.includes('class="mobile-tab-bar"')) {
        content = content.replace('</body>', `${mobileTabBarHTML}\n</body>`);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Ensured mobile tab bar on ${page}`);
    }
});

console.log('\n🎉 Mobile tab bar is now present and correct on all main pages!'); 