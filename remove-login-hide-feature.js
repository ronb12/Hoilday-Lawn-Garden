#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Main pages that need the hide feature removed
const mainPages = [
    'index.html',
    'about.html',
    'services.html',
    'education.html',
    'faq.html',
    'contact.html',
    'pay-your-bill.html',
    'login.html',
    'register.html',
    'admin-login.html'
];

function removeLoginHideFeature(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Remove login buttons hide rules from mobile media queries
        const mobileHidePatterns = [
            /\.login-buttons\s*\{\s*display:\s*none\s*!important;\s*\}/g,
            /\.login-buttons\s*\{\s*display:\s*none\s*;\s*\}/g,
            /\.btn-login\s*\{\s*display:\s*none\s*!important;\s*\}/g,
            /\.btn-login\s*\{\s*display:\s*none\s*;\s*\}/g,
            /\.login-buttons\s*\{\s*visibility:\s*hidden\s*!important;\s*\}/g,
            /\.login-buttons\s*\{\s*opacity:\s*0\s*!important;\s*\}/g,
            /\.login-buttons\s*\{\s*position:\s*absolute\s*!important;\s*\}/g,
            /\.login-buttons\s*\{\s*left:\s*-9999px\s*!important;\s*\}/g
        ];

        mobileHidePatterns.forEach(pattern => {
            if (pattern.test(content)) {
                content = content.replace(pattern, '');
                modified = true;
            }
        });

        // Remove specific mobile media query rules
        const mobileMediaQueryPattern = /@media\s*\(max-width:\s*768px\)\s*\{([^}]*\.login-buttons[^}]*)\}/g;
        content = content.replace(mobileMediaQueryPattern, (match, loginRules) => {
            const cleanedRules = loginRules.replace(/\.login-buttons\s*\{[^}]*\}/g, '');
            const cleanedRules2 = cleanedRules.replace(/\.btn-login\s*\{[^}]*\}/g, '');
            return `@media (max-width: 768px) {${cleanedRules2}}`;
        });

        // Remove desktop-specific login button rules that force visibility
        const desktopForcePatterns = [
            /@media\s*\(min-width:\s*769px\)\s*\{[^}]*\.login-buttons[^}]*\}/g,
            /\.login-buttons\s*\{\s*display:\s*flex\s*!important;\s*visibility:\s*visible\s*!important;\s*opacity:\s*1\s*!important;\s*position:\s*relative\s*!important;\s*left:\s*auto\s*!important;\s*\}/g,
            /\.btn-login\s*\{\s*display:\s*inline-flex\s*!important;\s*visibility:\s*visible\s*!important;\s*opacity:\s*1\s*!important;\s*\}/g
        ];

        desktopForcePatterns.forEach(pattern => {
            if (pattern.test(content)) {
                content = content.replace(pattern, '');
                modified = true;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated ${filePath}`);
            return true;
        } else {
            console.log(`⏭️  No changes needed for ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Process all main pages
console.log('🚀 Removing login buttons hide feature from main pages...\n');

let updatedCount = 0;
mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        if (removeLoginHideFeature(page)) {
            updatedCount++;
        }
    } else {
        console.log(`⚠️  File not found: ${page}`);
    }
});

console.log(`\n✅ Completed! Updated ${updatedCount} files.`);
console.log('\n📋 Summary:');
console.log('- Removed login buttons hide rules from mobile media queries');
console.log('- Removed forced visibility rules from desktop media queries');
console.log('- Login buttons will now be visible on both desktop and mobile'); 