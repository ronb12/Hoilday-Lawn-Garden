#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Main pages to check
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

function checkHeader(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const issues = [];
        const checks = [];

        // Check 1: Header structure exists
        if (!content.includes('<header class="main-header') && !content.includes('<header class="main-header"')) {
            issues.push('❌ Missing main-header element');
        } else {
            checks.push('✅ Header structure present');
        }

        // Check 2: Logo exists
        if (!content.includes('hollidays-logo')) {
            issues.push('❌ Missing logo image');
        } else {
            checks.push('✅ Logo present');
        }

        // Check 3: Navigation menu exists
        if (!content.includes('<nav id="nav-menu') && !content.includes('<nav id="nav-menu"')) {
            issues.push('❌ Missing nav-menu element');
        } else {
            checks.push('✅ Navigation menu present');
        }

        // Check 4: Navigation links exist
        const requiredLinks = ['index.html', 'about.html', 'services.html', 'education.html', 'faq.html', 'contact.html', 'pay-your-bill.html'];
        const missingLinks = requiredLinks.filter(link => !content.includes(`href="${link}"`));
        if (missingLinks.length > 0) {
            issues.push(`❌ Missing navigation links: ${missingLinks.join(', ')}`);
        } else {
            checks.push('✅ All navigation links present');
        }

        // Check 5: Login buttons exist
        if (!content.includes('login-buttons')) {
            issues.push('❌ Missing login-buttons container');
        } else {
            checks.push('✅ Login buttons container present');
        }

        // Check 6: Customer login button exists
        if (!content.includes('btn-customer')) {
            issues.push('❌ Missing customer login button');
        } else {
            checks.push('✅ Customer login button present');
        }

        // Check 7: Admin login button exists
        if (!content.includes('btn-admin')) {
            issues.push('❌ Missing admin login button');
        } else {
            checks.push('✅ Admin login button present');
        }

        // Check 8: Login buttons are NOT hidden on mobile
        const mobileHidePatterns = [
            /\.login-buttons\s*\{\s*display:\s*none\s*!important;\s*\}/,
            /\.login-buttons\s*\{\s*display:\s*none\s*;\s*\}/,
            /\.btn-login\s*\{\s*display:\s*none\s*!important;\s*\}/,
            /\.btn-login\s*\{\s*display:\s*none\s*;\s*\}/,
            /\.login-buttons\s*\{\s*visibility:\s*hidden\s*!important;\s*\}/,
            /\.login-buttons\s*\{\s*opacity:\s*0\s*!important;\s*\}/,
            /\.login-buttons\s*\{\s*position:\s*absolute\s*!important;\s*\}/,
            /\.login-buttons\s*\{\s*left:\s*-9999px\s*!important;\s*\}/,
            /@media\s*\(max-width:\s*768px\)[^}]*\.login-buttons[^}]*display:\s*none/
        ];

        const hasHideRules = mobileHidePatterns.some(pattern => pattern.test(content));
        if (hasHideRules) {
            issues.push('❌ Login buttons still have hide rules on mobile');
        } else {
            checks.push('✅ Login buttons visible on mobile (no hide rules)');
        }

        // Check 9: Mobile tab bar exists
        if (!content.includes('mobile-tab-bar')) {
            issues.push('❌ Missing mobile tab bar');
        } else {
            checks.push('✅ Mobile tab bar present');
        }

        // Check 10: Font Awesome icons are loaded
        if (!content.includes('font-awesome') && !content.includes('fa-')) {
            issues.push('❌ Font Awesome icons not loaded');
        } else {
            checks.push('✅ Font Awesome icons loaded');
        }

        // Check 11: CSS for login buttons exists
        if (!content.includes('.btn-login') || !content.includes('.login-buttons')) {
            issues.push('❌ Missing CSS for login buttons');
        } else {
            checks.push('✅ Login buttons CSS present');
        }

        // Check 12: Responsive design media queries exist
        if (!content.includes('@media (max-width: 768px)')) {
            issues.push('❌ Missing mobile responsive media queries');
        } else {
            checks.push('✅ Mobile responsive design present');
        }

        return {
            file: filePath,
            issues: issues,
            checks: checks,
            hasIssues: issues.length > 0
        };
    } catch (error) {
        return {
            file: filePath,
            issues: [`❌ Error reading file: ${error.message}`],
            checks: [],
            hasIssues: true
        };
    }
}

// Check all main pages
console.log('🔍 Checking all headers on main pages...\n');

let totalIssues = 0;
let totalChecks = 0;
const results = [];

mainPages.forEach(page => {
    if (fs.existsSync(page)) {
        const result = checkHeader(page);
        results.push(result);
        totalIssues += result.issues.length;
        totalChecks += result.checks.length;
    } else {
        console.log(`⚠️  File not found: ${page}`);
    }
});

// Display results
results.forEach(result => {
    console.log(`📄 ${result.file}:`);
    if (result.hasIssues) {
        result.issues.forEach(issue => console.log(`  ${issue}`));
    }
    result.checks.forEach(check => console.log(`  ${check}`));
    console.log('');
});

// Summary
console.log('📊 SUMMARY:');
console.log(`✅ Total checks passed: ${totalChecks}`);
console.log(`❌ Total issues found: ${totalIssues}`);
console.log(`📄 Pages checked: ${results.length}`);

if (totalIssues === 0) {
    console.log('\n🎉 All headers are consistent and working properly!');
} else {
    console.log('\n⚠️  Some issues were found. Please review and fix them.');
}

// Check for consistency across pages
console.log('\n🔍 CONSISTENCY CHECK:');
const headerStructures = results.map(r => {
    if (r.checks.length > 0) {
        return r.checks.filter(c => c.includes('present')).length;
    }
    return 0;
});

const avgChecks = headerStructures.reduce((a, b) => a + b, 0) / headerStructures.length;
const consistency = (avgChecks / 12) * 100; // 12 total checks

console.log(`📈 Header consistency: ${consistency.toFixed(1)}%`);

if (consistency >= 90) {
    console.log('✅ Headers are highly consistent across pages');
} else if (consistency >= 75) {
    console.log('⚠️  Headers are mostly consistent, some variations found');
} else {
    console.log('❌ Headers have significant inconsistencies');
} 