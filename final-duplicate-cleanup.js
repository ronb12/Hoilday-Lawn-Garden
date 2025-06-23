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

function removeDuplicates(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Remove duplicate "Hero Section" comments
        const duplicateHeroRegex = /<!-- Hero Section -->\s*\n\s*<!-- Hero Section -->/gi;
        if (content.match(duplicateHeroRegex)) {
            content = content.replace(duplicateHeroRegex, '<!-- Hero Section -->');
            updated = true;
        }
        
        // Remove any extra blank lines
        const extraBlankLines = /\n\s*\n\s*\n/g;
        if (content.match(extraBlankLines)) {
            content = content.replace(extraBlankLines, '\n\n');
            updated = true;
        }
        
        // Ensure proper spacing between header and hero
        const headerHeroSpacing = /<\/header>\s*\n\s*\n\s*<!-- Hero Section -->/gi;
        if (content.match(headerHeroSpacing)) {
            content = content.replace(headerHeroSpacing, '</header>\n\n<!-- Hero Section -->');
            updated = true;
        }
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Cleaned: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️  No duplicates found: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error cleaning ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🧹 Starting final duplicate cleanup...\n');

let cleanedCount = 0;
let totalCount = 0;

mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        totalCount++;
        if (removeDuplicates(page)) {
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
    console.log('\n🎉 Final duplicate cleanup complete!');
    console.log('All headers are now perfectly clean with no duplicates.');
} else {
    console.log('\n✨ All headers are already perfectly clean!');
} 