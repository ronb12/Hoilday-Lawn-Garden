const fs = require('fs');
const path = require('path');

// List of pages to fix
const pages = [
    'index.html', 'about.html', 'services.html', 'education.html', 'faq.html',
    'contact.html', 'login.html', 'register.html', 'pay-your-bill.html',
    'admin-login.html', 'admin-dashboard.html', 'customer-dashboard.html',
    'appointments.html', 'customers.html', 'staff.html', 'payments.html',
    'messages.html', 'inventory.html', 'analytics.html', 'add-appointment.html',
    'add-customer.html', 'add-staff.html', 'add-payment.html'
];

console.log('🔧 Fixing design issues identified by automated tests...');

pages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix 1: Ensure hero titles are visible
    // Add display: block to hero h1 elements if they're not visible
    if (content.includes('<div class="hero">') || content.includes('<section class="hero">')) {
        // Check if hero has h1 that might be hidden
        const heroH1Regex = /<h1[^>]*class="[^"]*hero[^"]*"[^>]*>/gi;
        if (heroH1Regex.test(content)) {
            // Add CSS to ensure hero h1 is visible
            const styleTag = '<style>\n.hero h1 { display: block !important; visibility: visible !important; }\n</style>';
            if (!content.includes('.hero h1 { display: block !important;')) {
                content = content.replace('</head>', `${styleTag}\n</head>`);
                changed = true;
                console.log(`✅ Fixed hero title visibility in ${page}`);
            }
        }
    }

    // Fix 2: Ensure only one H1 per page
    // Count H1 tags and convert extra ones to H2 if there are more than 1
    const h1Matches = content.match(/<h1[^>]*>/gi);
    if (h1Matches && h1Matches.length > 1) {
        console.log(`⚠️  Found ${h1Matches.length} H1 tags in ${page}, converting extras to H2`);
        
        // Keep the first H1, convert others to H2
        let h1Count = 0;
        content = content.replace(/<h1([^>]*)>/gi, (match, attributes) => {
            h1Count++;
            if (h1Count === 1) {
                return match; // Keep first H1
            } else {
                return `<h2${attributes}>`; // Convert others to H2
            }
        });
        
        // Also replace closing tags
        let h1CloseCount = 0;
        content = content.replace(/<\/h1>/gi, (match) => {
            h1CloseCount++;
            if (h1CloseCount === 1) {
                return match; // Keep first closing H1
            } else {
                return '</h2>'; // Convert others to H2
            }
        });
        
        changed = true;
        console.log(`✅ Fixed multiple H1 tags in ${page}`);
    }

    // Fix 3: Ensure hero sections have proper structure
    if (content.includes('class="hero"') && !content.includes('<h1')) {
        // Add a default H1 if hero section exists but has no H1
        content = content.replace(
            /(<div[^>]*class="[^"]*hero[^"]*"[^>]*>)/i,
            '$1\n        <h1>Welcome to Holliday Lawn & Garden</h1>'
        );
        changed = true;
        console.log(`✅ Added missing H1 to hero section in ${page}`);
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

console.log('🎨 Design issues fixed! Running design tests again...'); 