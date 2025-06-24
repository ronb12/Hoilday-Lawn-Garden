// Comprehensive HTML Fix Script
// Fixes common HTML validation errors across all pages

const fs = require('fs');
const path = require('path');

// List of main pages to fix
const mainPages = [
    'about.html',
    'services.html', 
    'contact.html',
    'education.html',
    'faq.html',
    'pay-your-bill.html',
    'login.html',
    'register.html'
];

function fixHtmlFile(filePath) {
    console.log(`Fixing ${filePath}...`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Fix 1: Remove duplicate footer sections
        content = content.replace(/<ul>\s*<li><a href="privacy-policy\.html">Privacy Policy<\/a><\/li>\s*<li><a href="terms\.html">Terms of Service<\/a><\/li>\s*<\/ul>\s*<\/div>\s*<\/div>/g, '</div>\n</div>');
        
        // Fix 2: Add missing closing main tags
        content = content.replace(/(<\/section>\s*)(<footer class="footer">)/g, '$1</main>\n$2');
        
        // Fix 3: Fix malformed footer structure
        content = content.replace(/(<div class="footer-section">\s*<h3>Follow Us<\/h3>\s*<div class="social-links">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="footer-bottom">\s*<div class="copyright">\s*<p>© 2024 Holliday's Lawn &amp; Garden\. All rights reserved\.<\/p>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/footer>)/g, 
            (match) => {
                // Ensure proper structure
                return match.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/footer>/, '</div>\n</div>\n</footer>');
            });
        
        // Fix 4: Remove extra closing divs before footer
        content = content.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/footer>)/g, '</div>\n</div>\n</footer>');
        
        // Fix 5: Ensure proper main tag closure
        if (content.includes('<main role="main">') && !content.includes('</main>')) {
            content = content.replace(/(<\/section>\s*)(<footer)/g, '$1</main>\n$2');
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

// Run fixes on all main pages
console.log('Starting comprehensive HTML cleanup...\n');

let fixedCount = 0;
mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        if (fixHtmlFile(page)) {
            fixedCount++;
        }
    } else {
        console.log(`⚠️  File not found: ${page}`);
    }
});

console.log(`\n✅ Cleanup complete! Fixed ${fixedCount} files.`);
console.log('\nRunning validation check...\n');

// Run validation after fixes
const { execSync } = require('child_process');
try {
    const result = execSync('npx htmlhint index.html about.html services.html contact.html education.html faq.html pay-your-bill.html login.html register.html', { encoding: 'utf8' });
    console.log('Validation Results:');
    console.log(result);
} catch (error) {
    console.log('Remaining validation errors:');
    console.log(error.stdout);
} 