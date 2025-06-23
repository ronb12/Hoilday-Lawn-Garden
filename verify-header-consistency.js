#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Main navigation pages to verify
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
    'admin-login.html',
    'customer-dashboard.html',
    'admin-dashboard.html'
];

function verifyHeaderConsistency() {
    console.log('🔍 Verifying header consistency across main navigation pages...\n');
    
    let consistentCount = 0;
    let inconsistentCount = 0;
    const issues = [];
    
    mainPages.forEach(page => {
        try {
            if (!fs.existsSync(page)) {
                console.log(`⚠️  Skipping ${page} - file not found`);
                return;
            }
            
            const content = fs.readFileSync(page, 'utf8');
            let pageIssues = [];
            
            // Check for standard header structure
            const hasStandardHeader = /<!-- Header -->\s*<header class="main-header">[\s\S]*?<div class="logo">[\s\S]*?<a href="index\.html">[\s\S]*?<picture>[\s\S]*?<source srcset="assets\/images\/hollidays-logo\.optimized-1280\.webp"[\s\S]*?<img src="assets\/images\/hollidays-logo\.optimized-1280\.png"[\s\S]*?<\/header>/.test(content);
            
            if (!hasStandardHeader) {
                pageIssues.push('Non-standard header structure');
            }
            
            // Check for hamburger menu
            const hasHamburger = /<button class="hamburger"[\s\S]*?<\/button>/.test(content);
            if (!hasHamburger) {
                pageIssues.push('Missing hamburger menu');
            }
            
            // Check for navigation links
            const hasNavLinks = /<ul class="nav-links">[\s\S]*?<\/ul>/.test(content);
            if (!hasNavLinks) {
                pageIssues.push('Missing navigation links');
            }
            
            // Check for login buttons
            const hasLoginButtons = /<div class="login-buttons">[\s\S]*?<\/div>/.test(content);
            if (!hasLoginButtons) {
                pageIssues.push('Missing login buttons');
            }
            
            // Check for non-optimized logo references
            const hasNonOptimizedLogo = /hollidays-logo\.png(?!\.optimized)/.test(content);
            if (hasNonOptimizedLogo) {
                pageIssues.push('Contains non-optimized logo references');
            }
            
            // Check for proper alt text
            const hasProperAltText = /alt="Holliday's Lawn &amp; Garden Logo"/.test(content);
            if (!hasProperAltText) {
                pageIssues.push('Missing or incorrect alt text for logo');
            }
            
            if (pageIssues.length === 0) {
                console.log(`✅ ${page} - Header is consistent`);
                consistentCount++;
            } else {
                console.log(`❌ ${page} - Issues found:`);
                pageIssues.forEach(issue => {
                    console.log(`   • ${issue}`);
                });
                inconsistentCount++;
                issues.push({ page, issues: pageIssues });
            }
            
        } catch (error) {
            console.error(`❌ Error checking ${page}:`, error.message);
            inconsistentCount++;
        }
    });
    
    console.log(`\n📊 Verification Summary:`);
    console.log(`  ✅ Consistent headers: ${consistentCount}`);
    console.log(`  ❌ Inconsistent headers: ${inconsistentCount}`);
    console.log(`  📄 Total pages checked: ${mainPages.length}`);
    
    if (inconsistentCount === 0) {
        console.log(`\n🎉 All headers are perfectly consistent!`);
    } else {
        console.log(`\n⚠️  Found ${inconsistentCount} pages with header issues:`);
        issues.forEach(({ page, issues: pageIssues }) => {
            console.log(`\n📄 ${page}:`);
            pageIssues.forEach(issue => console.log(`   • ${issue}`));
        });
    }
    
    return { consistentCount, inconsistentCount, issues };
}

// Run the verification
verifyHeaderConsistency(); 