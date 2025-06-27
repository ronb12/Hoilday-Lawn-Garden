#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 MASTER SITE CHECK - Holliday Lawn & Garden\n');
console.log('=' .repeat(60));

// Main pages to check
const mainPages = [
    'index.html', 'about.html', 'services.html', 'education.html', 'faq.html', 
    'contact.html', 'login.html', 'register.html', 'pay-your-bill.html', 
    'admin-login.html', 'admin-dashboard.html', 'customer-dashboard.html'
];

// Admin pages
const adminPages = [
    'appointments.html', 'customers.html', 'staff.html', 'payments.html', 
    'messages.html', 'inventory.html', 'analytics.html', 'add-appointment.html', 
    'add-customer.html', 'add-staff.html', 'add-payment.html'
];

// All pages to check
const allPages = [...mainPages, ...adminPages];

// Results storage
const results = {
    totalPages: allPages.length,
    checkedPages: 0,
    errors: [],
    warnings: [],
    success: [],
    brokenLinks: [],
    missingFiles: [],
    cssIssues: [],
    jsIssues: [],
    mobileIssues: [],
    seoIssues: []
};

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

function checkFileExists(filePath) {
    return fs.existsSync(filePath);
}

function readFileContent(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        return null;
    }
}

function checkHTMLStructure(content, filename) {
    const issues = [];
    
    // Check for basic HTML structure
    if (!content.includes('<!DOCTYPE html>')) {
        issues.push('Missing DOCTYPE declaration');
    }
    
    if (!content.includes('<html')) {
        issues.push('Missing HTML tag');
    }
    
    if (!content.includes('<head>')) {
        issues.push('Missing head section');
    }
    
    if (!content.includes('<body>')) {
        issues.push('Missing body section');
    }
    
    // Check for required meta tags
    if (!content.includes('<meta name="viewport"')) {
        issues.push('Missing viewport meta tag');
    }
    
    if (!content.includes('<meta charset="')) {
        issues.push('Missing charset meta tag');
    }
    
    // Check for title
    if (!content.includes('<title>')) {
        issues.push('Missing title tag');
    }
    
    // Check for proper closing tags
    const openTags = (content.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (content.match(/<\/[^>]*>/g) || []).length;
    if (Math.abs(openTags - closeTags) > 5) {
        issues.push('Possible unclosed HTML tags');
    }
    
    return issues;
}

function checkCSSIssues(content, filename) {
    const issues = [];
    
    // Check for inline styles (should be minimized)
    const inlineStyles = content.match(/<style[^>]*>[\s\S]*?<\/style>/g) || [];
    if (inlineStyles.length > 2) {
        issues.push('Too many inline style blocks - consider external CSS');
    }
    
    // Check for mobile tab bar CSS
    if (content.includes('mobile-tab-bar') && !content.includes('@media (min-width: 768px)')) {
        issues.push('Mobile tab bar missing desktop hiding CSS');
    }
    
    // Check for responsive design
    if (!content.includes('@media') && !content.includes('responsive')) {
        issues.push('No responsive design media queries found');
    }
    
    return issues;
}

function checkJavaScriptIssues(content, filename) {
    const issues = [];
    
    // Check for incomplete script blocks
    const incompleteScripts = content.match(/document\.addEventListener\('DOMContentLoaded', function\(\) \{[\s\S]*?<\/script>/g) || [];
    incompleteScripts.forEach((script, index) => {
        if (!script.includes('});')) {
            issues.push(`Incomplete JavaScript block #${index + 1}`);
        }
    });
    
    // Check for console errors
    if (content.includes('console.error')) {
        issues.push('Contains console.error statements (should be removed in production)');
    }
    
    // Check for missing script files
    const scriptTags = content.match(/<script[^>]*src="([^"]*)"[^>]*>/g) || [];
    scriptTags.forEach(script => {
        const srcMatch = script.match(/src="([^"]*)"/);
        if (srcMatch) {
            const src = srcMatch[1];
            if (!src.startsWith('http') && !src.startsWith('//') && !checkFileExists(src)) {
                issues.push(`Missing script file: ${src}`);
            }
        }
    });
    
    return issues;
}

function checkSEOIssues(content, filename) {
    const issues = [];
    
    // Check for meta description
    if (!content.includes('<meta name="description"')) {
        issues.push('Missing meta description');
    }
    
    // Check for Open Graph tags
    if (!content.includes('og:title') && !content.includes('og:description')) {
        issues.push('Missing Open Graph meta tags');
    }
    
    // Check for proper heading structure
    const h1Count = (content.match(/<h1[^>]*>/g) || []).length;
    if (h1Count > 1) {
        issues.push('Multiple H1 tags found (should be only one per page)');
    }
    
    // Check for alt attributes on images
    const imgTags = content.match(/<img[^>]*>/g) || [];
    imgTags.forEach(img => {
        if (!img.includes('alt=')) {
            issues.push('Image missing alt attribute');
        }
    });
    
    return issues;
}

function checkMobileIssues(content, filename) {
    const issues = [];
    
    // Check for mobile tab bar
    if (content.includes('mobile-tab-bar')) {
        if (!content.includes('@media (min-width: 768px)')) {
            issues.push('Mobile tab bar missing desktop hiding CSS');
        }
    }
    
    // Check for hamburger menu (should be removed)
    if (content.includes('hamburger') || content.includes('mobile-menu')) {
        issues.push('Hamburger menu found (should be removed)');
    }
    
    // Check for responsive viewport
    if (!content.includes('viewport')) {
        issues.push('Missing responsive viewport meta tag');
    }
    
    return issues;
}

function checkBrokenLinks(content, filename) {
    const brokenLinks = [];
    
    // Check for broken internal links
    const internalLinks = content.match(/href="([^"]*\.html)"/g) || [];
    internalLinks.forEach(link => {
        const hrefMatch = link.match(/href="([^"]*)"/);
        if (hrefMatch) {
            const href = hrefMatch[1];
            if (!checkFileExists(href)) {
                brokenLinks.push(`Broken internal link: ${href}`);
            }
        }
    });
    
    // Check for broken asset links
    const assetLinks = content.match(/src="(assets\/[^"]*)"/g) || [];
    assetLinks.forEach(link => {
        const srcMatch = link.match(/src="([^"]*)"/);
        if (srcMatch) {
            const src = srcMatch[1];
            if (!checkFileExists(src)) {
                brokenLinks.push(`Missing asset file: ${src}`);
            }
        }
    });
    
    return brokenLinks;
}

function checkPageContent(content, filename) {
    const issues = [];
    
    // Check for required sections
    if (!content.includes('main-header') && !content.includes('header')) {
        issues.push('Missing header section');
    }
    
    if (!content.includes('footer')) {
        issues.push('Missing footer section');
    }
    
    // Check for main content
    if (!content.includes('<main') && !content.includes('hero') && !content.includes('section')) {
        issues.push('Missing main content sections');
    }
    
    // Check for navigation
    if (!content.includes('nav-links') && !content.includes('navigation')) {
        issues.push('Missing navigation links');
    }
    
    return issues;
}

function checkPage(filename) {
    log(`Checking ${filename}...`);
    
    const filePath = path.join(process.cwd(), filename);
    const content = readFileContent(filePath);
    
    if (!content) {
        results.errors.push(`Cannot read file: ${filename}`);
        return;
    }
    
    results.checkedPages++;
    
    // Run all checks
    const htmlIssues = checkHTMLStructure(content, filename);
    const cssIssues = checkCSSIssues(content, filename);
    const jsIssues = checkJavaScriptIssues(content, filename);
    const seoIssues = checkSEOIssues(content, filename);
    const mobileIssues = checkMobileIssues(content, filename);
    const brokenLinks = checkBrokenLinks(content, filename);
    const contentIssues = checkPageContent(content, filename);
    
    // Collect all issues
    const allIssues = [
        ...htmlIssues.map(issue => `HTML: ${issue}`),
        ...cssIssues.map(issue => `CSS: ${issue}`),
        ...jsIssues.map(issue => `JavaScript: ${issue}`),
        ...seoIssues.map(issue => `SEO: ${issue}`),
        ...mobileIssues.map(issue => `Mobile: ${issue}`),
        ...contentIssues.map(issue => `Content: ${issue}`)
    ];
    
    if (allIssues.length > 0) {
        results.warnings.push(`${filename}: ${allIssues.length} issues found`);
        allIssues.forEach(issue => {
            results.warnings.push(`  - ${issue}`);
        });
    } else {
        results.success.push(`${filename}: No issues found`);
    }
    
    // Add broken links to results
    brokenLinks.forEach(link => {
        results.brokenLinks.push(`${filename}: ${link}`);
    });
}

function checkRequiredFiles() {
    log('Checking required files...');
    
    const requiredFiles = [
        'assets/css/main.css',
        'assets/js/main.js',
        'manifest.json',
        'service-worker.js',
        'assets/images/hollidays-logo.optimized-1280.png'
    ];
    
    requiredFiles.forEach(file => {
        if (!checkFileExists(file)) {
            results.missingFiles.push(`Missing required file: ${file}`);
        }
    });
}

function checkCSSFiles() {
    log('Checking CSS files...');
    
    const cssFiles = [
        'assets/css/main.css',
        'assets/css/mobile-enhancements.css'
    ];
    
    cssFiles.forEach(file => {
        if (checkFileExists(file)) {
            const content = readFileContent(file);
            if (content) {
                // Check for mobile tab bar CSS
                if (file.includes('main.css') && !content.includes('mobile-tab-bar')) {
                    results.cssIssues.push(`${file}: Missing mobile tab bar CSS`);
                }
                
                // Check for responsive design
                if (!content.includes('@media')) {
                    results.cssIssues.push(`${file}: No responsive design media queries`);
                }
            }
        }
    });
}

function generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MASTER SITE CHECK REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`  Total pages: ${results.totalPages}`);
    console.log(`  Pages checked: ${results.checkedPages}`);
    console.log(`  Success: ${results.success.length}`);
    console.log(`  Warnings: ${results.warnings.length}`);
    console.log(`  Errors: ${results.errors.length}`);
    
    if (results.success.length > 0) {
        console.log(`\n✅ SUCCESSFUL PAGES:`);
        results.success.forEach(success => log(success, 'success'));
    }
    
    if (results.warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS:`);
        results.warnings.forEach(warning => log(warning, 'warning'));
    }
    
    if (results.errors.length > 0) {
        console.log(`\n❌ ERRORS:`);
        results.errors.forEach(error => log(error, 'error'));
    }
    
    if (results.brokenLinks.length > 0) {
        console.log(`\n🔗 BROKEN LINKS:`);
        results.brokenLinks.forEach(link => log(link, 'error'));
    }
    
    if (results.missingFiles.length > 0) {
        console.log(`\n📁 MISSING FILES:`);
        results.missingFiles.forEach(file => log(file, 'error'));
    }
    
    if (results.cssIssues.length > 0) {
        console.log(`\n🎨 CSS ISSUES:`);
        results.cssIssues.forEach(issue => log(issue, 'warning'));
    }
    
    if (results.jsIssues.length > 0) {
        console.log(`\n⚡ JAVASCRIPT ISSUES:`);
        results.jsIssues.forEach(issue => log(issue, 'warning'));
    }
    
    if (results.mobileIssues.length > 0) {
        console.log(`\n📱 MOBILE ISSUES:`);
        results.mobileIssues.forEach(issue => log(issue, 'warning'));
    }
    
    if (results.seoIssues.length > 0) {
        console.log(`\n🔍 SEO ISSUES:`);
        results.seoIssues.forEach(issue => log(issue, 'warning'));
    }
    
    // Overall assessment
    const totalIssues = results.warnings.length + results.errors.length + 
                       results.brokenLinks.length + results.missingFiles.length;
    
    console.log(`\n🎯 OVERALL ASSESSMENT:`);
    if (totalIssues === 0) {
        log('Site is in excellent condition! No issues found.', 'success');
    } else if (totalIssues < 10) {
        log('Site is in good condition with minor issues to address.', 'warning');
    } else if (totalIssues < 20) {
        log('Site has several issues that should be addressed.', 'warning');
    } else {
        log('Site has significant issues that need immediate attention.', 'error');
    }
    
    console.log(`\n📋 RECOMMENDATIONS:`);
    if (results.brokenLinks.length > 0) {
        console.log('  • Fix broken links and missing files');
    }
    if (results.mobileIssues.length > 0) {
        console.log('  • Address mobile responsiveness issues');
    }
    if (results.seoIssues.length > 0) {
        console.log('  • Improve SEO meta tags and structure');
    }
    if (results.cssIssues.length > 0) {
        console.log('  • Review and optimize CSS');
    }
    if (results.jsIssues.length > 0) {
        console.log('  • Clean up JavaScript code');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Master site check complete!');
    console.log('='.repeat(60));
}

// Main execution
async function runMasterCheck() {
    try {
        log('Starting master site check...');
        
        // Check all pages
        log(`Checking ${allPages.length} pages...`);
        allPages.forEach(checkPage);
        
        // Check required files
        checkRequiredFiles();
        
        // Check CSS files
        checkCSSFiles();
        
        // Generate report
        generateReport();
        
    } catch (error) {
        log(`Error during master check: ${error.message}`, 'error');
        process.exit(1);
    }
}

// Run the master check
runMasterCheck(); 