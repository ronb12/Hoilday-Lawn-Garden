const fs = require('fs');
const path = require('path');

// List of files with known issues
const filesToFix = [
    'bulk-message.html',
    'profile.html', 
    'payment-success.html',
    'add-payment.html',
    'admin.html',
    'forgot-password.html',
    'setup-inventory-collections.html',
    'testimonials.html'
];

function fixHtmlFile(filePath) {
    console.log(`Fixing ${filePath}...`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Fix 1: Add missing closing main tags
        if (content.includes('<main role="main">') && !content.includes('</main>')) {
            content = content.replace(/(<\/section>\s*)(<footer)/g, '$1</main>\n$2');
        }
        
        // Fix 2: Remove duplicate footer sections (same pattern as before)
        content = content.replace(/<ul>\s*<li><a href="privacy-policy\.html">Privacy Policy<\/a><\/li>\s*<li><a href="terms\.html">Terms of Service<\/a><\/li>\s*<\/ul>\s*<\/div>\s*<\/div>/g, '</div>\n</div>');
        
        // Fix 3: Fix malformed footer structure
        content = content.replace(/(<div class="footer-section">\s*<h3>Follow Us<\/h3>\s*<div class="social-links">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="footer-bottom">\s*<div class="copyright">\s*<p>© 2024 Holliday's Lawn &amp; Garden\. All rights reserved\.<\/p>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/footer>)/g, 
            (match) => {
                return match.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/footer>/, '</div>\n</div>\n</footer>');
            });
        
        // Fix 4: Remove extra closing divs before footer
        content = content.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/footer>)/g, '</div>\n</div>\n</footer>');
        
        // Fix 5: Fix special character escaping in payment-success.html
        content = content.replace(/<\/head><body><</g, '</head>\n<body>\n<');
        content = content.replace(/style="display:none"><div class="spinner"><\/div><p id="loading-message">Loading\.\.\.\.\.\./g, 'style="display:none"><div class="spinner"></div><p id="loading-message">Loading...');
        
        // Fix 6: Add missing title tags for admin pages
        if (content.includes('<head>') && !content.includes('<title>')) {
            content = content.replace(/(<head>)/g, '$1\n    <title>Admin Panel - Holliday\'s Lawn &amp; Garden</title>');
        }
        
        // Write the fixed content back
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed ${filePath}`);
            return true;
        } else {
            console.log(`ℹ️  No changes needed for ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

// Run fixes on all files
console.log('Starting remaining page cleanup...\n');

let fixedCount = 0;
filesToFix.forEach(file => {
    if (fs.existsSync(file)) {
        if (fixHtmlFile(file)) {
            fixedCount++;
        }
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

console.log(`\n✅ Cleanup complete! Fixed ${fixedCount} files.`);
console.log('\nRunning final validation check...\n');

// Run validation after fixes
const { execSync } = require('child_process');
try {
    const result = execSync('npx htmlhint check-firebase.html run-assignment.html bulk-message.html profile.html payment-success.html add-payment.html admin.html forgot-password.html setup-inventory-collections.html testimonials.html', { encoding: 'utf8' });
    console.log('Final Validation Results:');
    console.log(result);
} catch (error) {
    console.log('Remaining validation errors:');
    console.log(error.stdout);
} 