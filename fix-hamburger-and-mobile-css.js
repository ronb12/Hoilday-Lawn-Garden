const fs = require('fs');
const path = require('path');

const pages = [
    'index.html', 'about.html', 'services.html', 'education.html', 'faq.html',
    'contact.html', 'login.html', 'register.html', 'pay-your-bill.html',
    'admin-login.html', 'admin-dashboard.html', 'customer-dashboard.html',
    'appointments.html', 'customers.html', 'staff.html', 'payments.html',
    'messages.html', 'inventory.html', 'analytics.html', 'add-appointment.html',
    'add-customer.html', 'add-staff.html', 'add-payment.html'
];

const hamburgerCSS = `\n/* Hamburger menu only on mobile */\n@media (min-width: 769px) {\n  .hamburger { display: none !important; }\n}\n`;
const mobileTabBarCSS = `\n/* Mobile Tab Bar - Hide on Desktop */\n@media (min-width: 769px) {\n  .mobile-tab-bar { display: none !important; }\n}\n`;

pages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Ensure hamburger menu CSS is present
    if (!content.includes('/* Hamburger menu only on mobile */')) {
        content = content.replace('</style>', hamburgerCSS + '</style>');
        changed = true;
    }
    // Ensure mobile tab bar CSS is present
    if (!content.includes('/* Mobile Tab Bar - Hide on Desktop */')) {
        content = content.replace('</style>', mobileTabBarCSS + '</style>');
        changed = true;
    }
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated hamburger/mobile tab bar CSS in ${page}`);
    } else {
        console.log(`⏭️  No changes needed for ${page}`);
    }
});
console.log('\n🎉 Hamburger menu and mobile tab bar CSS fixes complete!'); 