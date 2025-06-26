const fs = require('fs');
const path = require('path');

// Function to recursively find all HTML files
function findHtmlFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files.push(...findHtmlFiles(fullPath));
        } else if (item.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Function to fix main.css references
function fixMainCssReferences(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Replace main.css with main.min.css
        const originalContent = content;
        content = content.replace(/href="assets\/css\/main\.css"/g, 'href="assets/css/main.min.css"');
        content = content.replace(/href="\/assets\/css\/main\.css"/g, 'href="/assets/css/main.min.css"');
        content = content.replace(/href='assets\/css\/main\.css'/g, "href='assets/css/main.min.css'");
        content = content.replace(/href='\/assets\/css\/main\.css'/g, "href='/assets/css/main.min.css'");
        
        // Also fix any versioned references
        content = content.replace(/href="assets\/css\/main\.css\?[^"]*"/g, 'href="assets/css/main.min.css"');
        content = content.replace(/href="\/assets\/css\/main\.css\?[^"]*"/g, 'href="/assets/css/main.min.css"');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed: ${filePath}`);
            modified = true;
        }
        
        return modified;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('Fixing main.css references...');

const htmlFiles = findHtmlFiles('.');
let fixedCount = 0;

for (const file of htmlFiles) {
    if (fixMainCssReferences(file)) {
        fixedCount++;
    }
}

console.log(`\nFixed ${fixedCount} files.`);
console.log('All main.css references have been updated to main.min.css'); 