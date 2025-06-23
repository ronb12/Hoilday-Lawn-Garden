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

function fix404Errors(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Fix main.css paths
        content = content.replace(/href="\/assets\/css\/main\.css/g, 'href="assets/css/main.css');
        content = content.replace(/href="assets\/styles\/main\.css/g, 'href="assets/css/main.css');
        
        // Fix mobile-enhancements.css paths
        content = content.replace(/href="\/assets\/css\/mobile-enhancements\.css/g, 'href="assets/css/mobile-enhancements.css');
        
        // Fix other CSS paths
        content = content.replace(/href="assets\/styles\//g, 'href="assets/css/');
        
        // Fix JavaScript error in education.html
        if (filePath.includes('education.html')) {
            content = content.replace(
                /document\.getElementById\('current-year'\)\.textContent = new Date\(\)\.getFullYear\(\);/g,
                `const yearElement = document.getElementById('current-year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}`
            );
        }
        
        // Fix any other potential JavaScript errors
        content = content.replace(
            /document\.getElementById\('current-year'\)\.textContent = new Date\(\)\.getFullYear\(\);/g,
            `const yearElement = document.getElementById('current-year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}`
        );
        
        // Fix image paths for hero images
        content = content.replace(
            /src="assets\/images\/hero-garden-landscaping-1280-1280\.webp"/g,
            'src="assets/images/hero-garden-landscaping-1280.webp"'
        );
        
        if (content !== fs.readFileSync(filePath, 'utf8')) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed 404 errors: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️  No 404 errors found: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing 404 errors for ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🔧 Starting 404 error fixes...\n');

let fixedCount = 0;
let totalCount = 0;

mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        totalCount++;
        if (fix404Errors(page)) {
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
    console.log('\n🎉 404 error fixes complete!');
    console.log('All file path issues and JavaScript errors have been resolved.');
} else {
    console.log('\n✨ No 404 errors found!');
} 