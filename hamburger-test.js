const fs = require('fs');

console.log('🍔 Testing Hamburger Menu on Website Pages...\n');

const results = {
    total: 0,
    passed: 0,
    failed: 0,
    issues: []
};

// Files to exclude from testing (test files, etc.)
const excludeFiles = [
    'hamburger-test.html',
    'browser-test-hamburger.html',
    'visual-hamburger-test.html',
    'mobile-only-hamburger-test.html',
    'manual-hamburger-test.js',
    'hamburger-test.js',
    'fix-main-navigation.js',
    'fix-hamburger-menu.js'
];

function testPage(filename) {
    try {
        const content = fs.readFileSync(filename, 'utf8');
        const issues = [];
        
        // Check for hamburger button
        if (!/<button[^>]*class="[^"]*hamburger[^"]*"[^>]*>/i.test(content)) {
            issues.push('Missing hamburger button');
        }
        
        // Check for hamburger CSS
        if (!/\.hamburger\s*\{/i.test(content)) {
            issues.push('Missing hamburger CSS');
        }
        
        // Check for mobile responsive CSS
        if (!/@media.*max-width.*768px.*\{[^}]*\.hamburger[^}]*display:\s*block/i.test(content)) {
            issues.push('Missing mobile responsive CSS');
        }
        
        // Check for JavaScript
        if (!/hamburger.*addEventListener|querySelector.*hamburger/i.test(content)) {
            issues.push('Missing hamburger JavaScript');
        }
        
        // Check for nav-links
        if (!/<ul[^>]*class="[^"]*nav-links[^"]*"[^>]*>/i.test(content)) {
            issues.push('Missing nav-links');
        }
        
        const passed = issues.length === 0;
        results.total++;
        
        if (passed) {
            results.passed++;
            console.log(`✅ ${filename}`);
        } else {
            results.failed++;
            console.log(`❌ ${filename}`);
            issues.forEach(issue => console.log(`   - ${issue}`));
            results.issues.push({ filename, issues });
        }
        
    } catch (error) {
        console.log(`❌ ${filename} - Error: ${error.message}`);
        results.failed++;
        results.total++;
    }
}

// Get all HTML files and test them, excluding test files
const htmlFiles = fs.readdirSync('.')
    .filter(file => file.endsWith('.html'))
    .filter(file => !excludeFiles.includes(file))
    .sort();

console.log(`Testing ${htmlFiles.length} website pages (excluding test files)...\n`);

htmlFiles.forEach(testPage);

// Summary
console.log('\n📊 SUMMARY:');
console.log(`Total website pages: ${results.total}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log(`Success rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

if (results.failed > 0) {
    console.log('\n❌ FAILED PAGES:');
    results.issues.forEach(item => {
        console.log(`\n${item.filename}:`);
        item.issues.forEach(issue => console.log(`  - ${issue}`));
    });
}

// Show which main navigation pages are working
const mainPages = ['index.html', 'about.html', 'services.html', 'contact.html', 'faq.html', 'education.html', 'login.html', 'register.html', 'admin-login.html', 'customer-dashboard.html', 'admin-dashboard.html', 'pay-your-bill.html', 'gallery.html', 'testimonials.html'];

console.log('\n🎯 MAIN NAVIGATION PAGES STATUS:');
mainPages.forEach(page => {
    const passed = results.issues.find(item => item.filename === page) === undefined;
    console.log(`${passed ? '✅' : '❌'} ${page}`);
}); 