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

function removeSpacing(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Remove the "Header Navigation" comment and extra spacing between header and hero
        const headerHeroSpacingRegex = /<\/header>\s*\n\s*<!-- Header Navigation -->\s*\n\s*\n\s*<!-- Hero Section -->/gi;
        const headerHeroSpacingRegex2 = /<\/header>\s*\n\s*<!-- Header Navigation -->\s*\n\s*<!-- Hero Section -->/gi;
        const headerHeroSpacingRegex3 = /<\/header>\s*\n\s*\n\s*<!-- Hero Section -->/gi;
        
        // Replace with direct connection between header and hero
        content = content.replace(headerHeroSpacingRegex, '</header>\n\n<!-- Hero Section -->');
        content = content.replace(headerHeroSpacingRegex2, '</header>\n\n<!-- Hero Section -->');
        content = content.replace(headerHeroSpacingRegex3, '</header>\n\n<!-- Hero Section -->');
        
        // Also remove any extra blank lines between header and hero
        const extraSpacingRegex = /<\/header>\s*\n\s*\n\s*\n\s*<!-- Hero Section -->/gi;
        content = content.replace(extraSpacingRegex, '</header>\n\n<!-- Hero Section -->');
        
        // Remove any remaining "Header Navigation" comments that might be floating
        const headerCommentRegex = /<!-- Header Navigation -->\s*\n\s*/gi;
        content = content.replace(headerCommentRegex, '');
        
        if (content !== fs.readFileSync(filePath, 'utf8')) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed spacing: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️  No spacing issues: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🚀 Starting header-hero spacing fix...\n');

let fixedCount = 0;
let totalCount = 0;

mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        totalCount++;
        if (removeSpacing(page)) {
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
    console.log('\n🎉 Header-hero spacing fix complete!');
    console.log('All white space between headers and heroes has been removed.');
} else {
    console.log('\n✨ All pages already have proper spacing!');
} 