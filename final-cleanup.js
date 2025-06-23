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

function finalCleanup(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Remove duplicate "Header" comments
        const duplicateHeaderRegex = /<!-- Header -->\s*\n\s*<!-- Header -->/gi;
        if (content.match(duplicateHeaderRegex)) {
            content = content.replace(duplicateHeaderRegex, '<!-- Header -->');
            updated = true;
        }
        
        // Remove duplicate "Hero Section" comments
        const duplicateHeroRegex = /<!-- Hero Section -->\s*\n\s*<!-- Hero Section -->/gi;
        if (content.match(duplicateHeroRegex)) {
            content = content.replace(duplicateHeroRegex, '<!-- Hero Section -->');
            updated = true;
        }
        
        // Fix the hero section structure - remove the extra "<!-- Hero Section -->" that appears after main
        const extraHeroRegex = /<!-- Main Content -->\s*\n\s*<!-- Hero Section -->\s*\n\s*\n\s*<!-- Header -->\s*\n\s*<!-- Hero Section -->/gi;
        if (content.match(extraHeroRegex)) {
            content = content.replace(extraHeroRegex, '<!-- Main Content -->\n<!-- Hero Section -->');
            updated = true;
        }
        
        // Remove any remaining extra "Header" comments
        const extraHeaderRegex = /<!-- Header -->\s*\n\s*<!-- Hero Section -->/gi;
        if (content.match(extraHeaderRegex)) {
            content = content.replace(extraHeaderRegex, '<!-- Hero Section -->');
            updated = true;
        }
        
        // Remove multiple consecutive empty lines
        const multipleEmptyLines = /\n\s*\n\s*\n/g;
        if (content.match(multipleEmptyLines)) {
            content = content.replace(multipleEmptyLines, '\n\n');
            updated = true;
        }
        
        if (updated) {
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
console.log('🧹 Starting final cleanup...\n');

let cleanedCount = 0;
let totalCount = 0;

mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        totalCount++;
        if (finalCleanup(page)) {
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
    console.log('\n🎉 Final cleanup complete!');
    console.log('All headers are now perfectly clean and consistent.');
} else {
    console.log('\n✨ All headers are already perfectly clean!');
} 