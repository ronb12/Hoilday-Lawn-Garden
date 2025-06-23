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

function cleanPage(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Remove extra blank lines and spacing
        const extraSpacing = /\n\s*\n\s*\n/g;
        const multipleSpaces = /[ ]{2,}/g;
        
        // Clean up spacing
        content = content.replace(extraSpacing, '\n\n');
        content = content.replace(multipleSpaces, ' ');
        
        // Ensure proper spacing after header comment
        content = content.replace(/<!-- Header Navigation -->\s*\n\s*\n\s*\n/g, '<!-- Header Navigation -->\n\n');
        
        // Remove any extra whitespace around the header
        const headerRegex = /(<header class="main-header">[\s\S]*?<\/header>)/gi;
        content = content.replace(headerRegex, (match) => {
            return match.trim();
        });
        
        if (content !== fs.readFileSync(filePath, 'utf8')) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Cleaned: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️  No cleanup needed: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error cleaning ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🧹 Starting header cleanup to match Pay Your Bill page...\n');

let cleanedCount = 0;
let totalCount = 0;

mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        totalCount++;
        if (cleanPage(page)) {
            cleanedCount++;
        }
    } else {
        console.log(`⚠️  File not found: ${page}`);
    }
});

console.log(`\n📊 Summary:`);
console.log(`   Total pages processed: ${totalCount}`);
console.log(`   Pages cleaned: ${cleanedCount}`);
console.log(`   Pages unchanged: ${totalCount - cleanedCount}`);

if (cleanedCount > 0) {
    console.log('\n🎉 Header cleanup complete!');
    console.log('All headers now match the Pay Your Bill page structure exactly.');
} else {
    console.log('\n✨ All headers are already clean!');
} 