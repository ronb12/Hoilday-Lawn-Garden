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

pages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Remove hamburger button HTML
    content = content.replace(/<button[^>]*class="[^"]*hamburger[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '');

    // Remove hamburger menu CSS blocks (inline)
    content = content.replace(/\/\* Hamburger menu only on mobile \*\/[\s\S]*?\}/g, '');
    content = content.replace(/\.hamburger[\s\S]*?\}/g, '');
    content = content.replace(/\.hamburger\s*\{[^}]*\}/g, '');
    content = content.replace(/\.hamburger(\s|\.|:|,|\{|\[)[\s\S]*?\}/g, '');

    // Remove hamburger menu JS (event listeners, querySelector, etc.)
    content = content.replace(/(var|let|const)\s+hamburger\s*=\s*document\.querySelector\([^)]*\);?/g, '');
    content = content.replace(/hamburger\.addEventListener\([^)]*\);?/g, '');
    content = content.replace(/hamburger\.classList\.[^;]*;/g, '');
    content = content.replace(/hamburger\.setAttribute\([^)]*\);?/g, '');
    content = content.replace(/if\s*\(hamburger[^)]*\)[\s\S]*?\}/g, '');

    // Remove any remaining references to .hamburger in style or script tags
    content = content.replace(/\.hamburger[^}]*\}/g, '');

    // Remove any empty <style> or <script> tags left behind
    content = content.replace(/<style>\s*<\/style>/g, '');
    content = content.replace(/<script>\s*<\/script>/g, '');

    // Remove any hamburger menu comments
    content = content.replace(/<!--.*hamburger menu.*-->/gi, '');

    // Remove any hamburger menu test code
    content = content.replace(/testHamburgerMenu\([^)]*\);?/g, '');

    // Remove any hamburger menu related aria attributes
    content = content.replace(/aria-label="Toggle menu"/g, '');
    content = content.replace(/aria-controls="nav-menu"/g, '');
    content = content.replace(/aria-expanded="(true|false)"/g, '');

    // Remove any leftover blank lines
    content = content.replace(/\n{3,}/g, '\n\n');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Removed hamburger menu from ${page}`);
});
console.log('\n🎉 All hamburger menu code removed!'); 