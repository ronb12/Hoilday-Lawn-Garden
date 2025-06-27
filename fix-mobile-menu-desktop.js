#!/usr/bin/env node

const fs = require('fs');

function fixMobileMenuDesktop(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Remove the duplicate mobile tab bar CSS rule that appears after the main style block
        const duplicatePattern = /\/\* Mobile Tab Bar - Hide on Desktop \*\/\s*@media \(min-width: 769px\) \{\s*\.mobile-tab-bar \{ display: none !important; \}\s*\}/g;
        
        if (duplicatePattern.test(content)) {
            content = content.replace(duplicatePattern, '');
            modified = true;
            console.log(`✅ Removed duplicate mobile tab bar CSS from ${filePath}`);
        }

        // Ensure the mobile tab bar is hidden by default
        const defaultHidePattern = /\.mobile-tab-bar \{\s*display: none !important;\s*\}/;
        if (!defaultHidePattern.test(content)) {
            // Add the default hide rule if it doesn't exist
            const insertPoint = content.indexOf('main {');
            if (insertPoint !== -1) {
                const beforeMain = content.substring(0, insertPoint);
                const afterMain = content.substring(insertPoint);
                content = beforeMain + '    /* Mobile Tab Bar - Hidden by default */\n    .mobile-tab-bar {\n        display: none !important;\n    }\n    \n    ' + afterMain;
                modified = true;
                console.log(`✅ Added default mobile tab bar hide rule to ${filePath}`);
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed mobile menu desktop issue in ${filePath}`);
        } else {
            console.log(`ℹ️  No changes needed for ${filePath}`);
        }

    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

// Fix the about.html file
fixMobileMenuDesktop('about.html'); 