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

function removeEmptyStyles(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Remove empty style tags
        const emptyStyleRegex = /<style>\s*<\/style>/gi;
        if (content.match(emptyStyleRegex)) {
            content = content.replace(emptyStyleRegex, '');
            updated = true;
        }
        
        // Remove style tags with only whitespace
        const whitespaceStyleRegex = /<style>\s*{\s*}\s*<\/style>/gi;
        if (content.match(whitespaceStyleRegex)) {
            content = content.replace(whitespaceStyleRegex, '');
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
            console.log(`⏭️  No empty styles found: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error cleaning ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🧹 Starting final empty style cleanup...\n');

let cleanedCount = 0;
let totalCount = 0;

mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        totalCount++;
        if (removeEmptyStyles(page)) {
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
    console.log('\n🎉 Final empty style cleanup complete!');
    console.log('All pages now have clean CSS without empty style tags.');
} else {
    console.log('\n✨ All pages already have clean CSS!');
} 