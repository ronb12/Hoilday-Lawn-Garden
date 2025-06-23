#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test results storage
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: [],
    details: []
};

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function testHamburgerMenu(htmlContent, filename) {
    const results = {
        filename,
        hasHamburgerButton: false,
        hasHamburgerCSS: false,
        hasHamburgerJS: false,
        hasMobileCSS: false,
        hasActiveClass: false,
        issues: []
    };

    // Test 1: Check for hamburger button HTML
    const hamburgerButtonRegex = /<button[^>]*class="[^"]*hamburger[^"]*"[^>]*>/i;
    if (hamburgerButtonRegex.test(htmlContent)) {
        results.hasHamburgerButton = true;
    } else {
        results.issues.push('Missing hamburger button HTML');
    }

    // Test 2: Check for hamburger CSS
    const hamburgerCSSRegex = /\.hamburger\s*\{/i;
    if (hamburgerCSSRegex.test(htmlContent)) {
        results.hasHamburgerCSS = true;
    } else {
        results.issues.push('Missing hamburger CSS');
    }

    // Test 3: Check for hamburger JavaScript
    const hamburgerJSRegex = /hamburger.*addEventListener|querySelector.*hamburger/i;
    if (hamburgerJSRegex.test(htmlContent)) {
        results.hasHamburgerJS = true;
    } else {
        results.issues.push('Missing hamburger JavaScript');
    }

    // Test 4: Check for mobile responsive CSS
    const mobileCSSRegex = /@media.*max-width.*768px.*\{[^}]*\.hamburger[^}]*display:\s*block/i;
    if (mobileCSSRegex.test(htmlContent)) {
        results.hasMobileCSS = true;
    } else {
        results.issues.push('Missing mobile responsive CSS for hamburger');
    }

    // Test 5: Check for active class handling
    const activeClassRegex = /\.hamburger\.active|hamburger.*classList.*active/i;
    if (activeClassRegex.test(htmlContent)) {
        results.hasActiveClass = true;
    } else {
        results.issues.push('Missing active class handling');
    }

    // Test 6: Check for nav-links structure
    const navLinksRegex = /<ul[^>]*class="[^"]*nav-links[^"]*"[^>]*>/i;
    if (!navLinksRegex.test(htmlContent)) {
        results.issues.push('Missing nav-links structure');
    }

    // Test 7: Check for proper hamburger spans
    const hamburgerSpansRegex = /<button[^>]*class="[^"]*hamburger[^"]*"[^>]*>[\s\S]*?<span><\/span>[\s\S]*?<span><\/span>[\s\S]*?<span><\/span>/i;
    if (!hamburgerSpansRegex.test(htmlContent)) {
        results.issues.push('Missing proper hamburger spans (need 3 spans)');
    }

    return results;
}

function testPage(filename) {
    try {
        const filePath = path.join(process.cwd(), filename);
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        
        const results = testHamburgerMenu(htmlContent, filename);
        
        // Determine if page passed all tests
        const passed = results.issues.length === 0;
        
        if (passed) {
            testResults.passed++;
            log(`✅ ${filename}`, 'green');
        } else {
            testResults.failed++;
            log(`❌ ${filename}`, 'red');
            results.issues.forEach(issue => {
                log(`   - ${issue}`, 'yellow');
            });
        }
        
        testResults.details.push(results);
        testResults.total++;
        
    } catch (error) {
        testResults.failed++;
        testResults.errors.push({ filename, error: error.message });
        log(`❌ ${filename} - Error: ${error.message}`, 'red');
        testResults.total++;
    }
}

function generateReport() {
    log('\n' + '='.repeat(60), 'blue');
    log('HAMBURGER MENU TEST REPORT', 'bold');
    log('='.repeat(60), 'blue');
    
    log(`\n📊 Summary:`, 'bold');
    log(`Total pages tested: ${testResults.total}`, 'blue');
    log(`✅ Passed: ${testResults.passed}`, 'green');
    log(`❌ Failed: ${testResults.failed}`, 'red');
    log(`Success rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'blue');
    
    if (testResults.failed > 0) {
        log(`\n🔍 Failed Pages:`, 'bold');
        testResults.details
            .filter(result => result.issues.length > 0)
            .forEach(result => {
                log(`\n📄 ${result.filename}:`, 'yellow');
                result.issues.forEach(issue => {
                    log(`   - ${issue}`, 'red');
                });
            });
    }
    
    if (testResults.errors.length > 0) {
        log(`\n🚨 Errors:`, 'bold');
        testResults.errors.forEach(error => {
            log(`   ${error.filename}: ${error.error}`, 'red');
        });
    }
    
    log(`\n📋 Detailed Results:`, 'bold');
    testResults.details.forEach(result => {
        const status = result.issues.length === 0 ? '✅' : '❌';
        const color = result.issues.length === 0 ? 'green' : 'red';
        log(`${status} ${result.filename}`, color);
    });
    
    log('\n' + '='.repeat(60), 'blue');
}

// Main execution
async function main() {
    log('🍔 Testing Hamburger Menu on All Pages...', 'bold');
    log('='.repeat(60), 'blue');
    
    // Get all HTML files
    const htmlFiles = fs.readdirSync('.')
        .filter(file => file.endsWith('.html'))
        .sort();
    
    log(`Found ${htmlFiles.length} HTML files to test\n`, 'blue');
    
    // Test each file
    for (const file of htmlFiles) {
        testPage(file);
    }
    
    // Generate report
    generateReport();
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the test
main().catch(error => {
    log(`\n💥 Test failed with error: ${error.message}`, 'red');
    process.exit(1);
}); 