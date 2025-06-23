const fs = require('fs');
const path = require('path');

// Files that might reference old header CSS
const filesToCheck = [
    'template.html', 'template 2.html'
];

// Old header CSS patterns to remove
const oldHeaderPatterns = [
    /<link[^>]*header\.css[^>]*>/gi,
    /<link[^>]*header\.min\.css[^>]*>/gi,
    /assets\/styles\/components\/header\.css/gi,
    /assets\/css\/components\/header\.css/gi
];

// Duplicate header CSS sections to remove
const duplicateHeaderCSS = [
    /\/\* Header Styles \*\/[\s\S]*?@media \(max-width: 900px\)[\s\S]*?}/gi,
    /\/\* Professional Header Responsive Design \*\/[\s\S]*?@media \(min-width: 768px\)[\s\S]*?}/gi,
    /\/\* Professional Header Alignment Fixes \*\/[\s\S]*?@media \(max-width: 768px\)[\s\S]*?}/gi,
    /\/\* Standard Header and Hero Styles \*\/[\s\S]*?@media \(max-width: 768px\)[\s\S]*?}/gi
];

function cleanupOldHeaders(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Remove old header CSS file references
        oldHeaderPatterns.forEach(pattern => {
            const newContent = content.replace(pattern, '');
            if (newContent !== content) {
                content = newContent;
                updated = true;
                console.log(`   Removed old header CSS reference from ${filePath}`);
            }
        });
        
        // Remove duplicate header CSS sections
        duplicateHeaderCSS.forEach(pattern => {
            const newContent = content.replace(pattern, '');
            if (newContent !== content) {
                content = newContent;
                updated = true;
                console.log(`   Removed duplicate header CSS section from ${filePath}`);
            }
        });
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Cleaned up old headers: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️  No old headers found: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error cleaning up old headers for ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🧹 Starting cleanup of old header files and references...\n');

let cleanedCount = 0;
let totalCount = 0;

filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
        totalCount++;
        if (cleanupOldHeaders(file)) {
            cleanedCount++;
        }
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

console.log(`\n📊 Summary:`);
console.log(`   Total files processed: ${totalCount}`);
console.log(`   Files cleaned: ${cleanedCount}`);
console.log(`   Files unchanged: ${totalCount - cleanedCount}`);

if (cleanedCount > 0) {
    console.log('\n🎉 Old header cleanup complete!');
    console.log('All old header CSS files and references have been removed.');
    console.log('Only the new enhanced header styles remain.');
} else {
    console.log('\n✨ No old header files found to clean up!');
} 