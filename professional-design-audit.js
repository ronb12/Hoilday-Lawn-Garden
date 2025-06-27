const fs = require('fs');
const path = require('path');

// List of all main pages to audit
const pages = [
    'index.html', 'about.html', 'services.html', 'education.html', 'faq.html',
    'contact.html', 'login.html', 'register.html', 'pay-your-bill.html',
    'admin-login.html', 'admin-dashboard.html', 'customer-dashboard.html',
    'appointments.html', 'customers.html', 'staff.html', 'payments.html',
    'messages.html', 'inventory.html', 'analytics.html', 'add-appointment.html',
    'add-customer.html', 'add-staff.html', 'add-payment.html', 'testimonials.html',
    'gallery.html', 'terms.html', 'privacy-policy.html'
];

console.log('🔍 Professional Design Audit - Checking All Pages...\n');

let totalIssues = 0;
let pagesWithIssues = 0;
let professionalScore = 0;

pages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${page} - FILE NOT FOUND`);
        totalIssues++;
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    let pageScore = 100; // Start with perfect score
    
    console.log(`📄 Checking ${page}...`);
    
    // 1. Check for proper HTML structure
    if (!content.includes('<!DOCTYPE html>')) {
        issues.push('Missing DOCTYPE declaration');
        pageScore -= 10;
    }
    
    if (!content.includes('<html lang="en">')) {
        issues.push('Missing or incorrect HTML lang attribute');
        pageScore -= 5;
    }
    
    if (!content.includes('<head>') || !content.includes('</head>')) {
        issues.push('Missing head section');
        pageScore -= 10;
    }
    
    if (!content.includes('<body>') || !content.includes('</body>')) {
        issues.push('Missing body section');
        pageScore -= 10;
    }
    
    // 2. Check for essential meta tags
    if (!content.includes('viewport')) {
        issues.push('Missing viewport meta tag');
        pageScore -= 5;
    }
    
    if (!content.includes('charset')) {
        issues.push('Missing charset declaration');
        pageScore -= 5;
    }
    
    if (!content.includes('description') && !content.includes('og:description')) {
        issues.push('Missing meta description');
        pageScore -= 5;
    }
    
    // 3. Check for proper title
    if (!content.includes('<title>') || content.includes('<title></title>')) {
        issues.push('Missing or empty title tag');
        pageScore -= 10;
    }
    
    // 4. Check for Montserrat font
    if (!content.includes('Montserrat') && !content.includes('montserrat')) {
        issues.push('Missing Montserrat font');
        pageScore -= 5;
    }
    
    // 5. Check for proper heading structure
    const h1Matches = content.match(/<h1[^>]*>/gi);
    if (!h1Matches) {
        issues.push('Missing H1 heading');
        pageScore -= 10;
    } else if (h1Matches.length > 1) {
        issues.push(`Multiple H1 headings (${h1Matches.length})`);
        pageScore -= 15;
    }
    
    // 6. Check for hero section visibility
    if (content.includes('class="hero"') || content.includes('class=\'hero\'')) {
        if (!content.includes('.hero h1 { display: block !important;')) {
            issues.push('Hero section H1 may not be visible');
            pageScore -= 5;
        }
    }
    
    // 7. Check for mobile tab bar CSS
    if (!content.includes('.mobile-tab-bar') || !content.includes('@media (min-width: 769px)')) {
        issues.push('Missing mobile tab bar or desktop hiding CSS');
        pageScore -= 5;
    }
    
    // 8. Check for hamburger menu (should be removed)
    if (content.includes('hamburger') || content.includes('Hamburger')) {
        issues.push('Hamburger menu code still present');
        pageScore -= 10;
    }
    
    // 9. Check for broken links
    const linkMatches = content.match(/href="[^"]*"/gi);
    if (linkMatches) {
        linkMatches.forEach(link => {
            if (link.includes('http://') || link.includes('https://')) {
                if (link.includes('hollidaylawngarden.com') && !link.includes('./')) {
                    issues.push('Absolute URL should be relative');
                    pageScore -= 2;
                }
            }
        });
    }
    
    // 10. Check for console.error statements (should be removed in production)
    if (content.includes('console.error')) {
        issues.push('Console.error statements found (remove in production)');
        pageScore -= 3;
    }
    
    // 11. Check for proper footer
    if (!content.includes('footer') && !content.includes('Footer')) {
        issues.push('Missing footer section');
        pageScore -= 5;
    }
    
    // 12. Check for proper navigation
    if (!content.includes('nav') && !content.includes('navigation')) {
        issues.push('Missing navigation section');
        pageScore -= 5;
    }
    
    // 13. Check for accessibility attributes
    if (content.includes('<img') && !content.includes('alt=')) {
        issues.push('Images missing alt attributes');
        pageScore -= 3;
    }
    
    // 14. Check for proper CSS loading
    if (!content.includes('.css') && !content.includes('<style>')) {
        issues.push('No CSS found');
        pageScore -= 10;
    }
    
    // 15. Check for proper JavaScript loading
    if (content.includes('onclick') || content.includes('onload') || content.includes('onerror')) {
        if (!content.includes('<script>') && !content.includes('.js')) {
            issues.push('Inline JavaScript found (should be external)');
            pageScore -= 3;
        }
    }
    
    // Display results
    if (issues.length === 0) {
        console.log(`✅ ${page} - PERFECT (Score: ${pageScore}/100)`);
    } else {
        console.log(`⚠️  ${page} - ${issues.length} issues (Score: ${pageScore}/100)`);
        issues.forEach(issue => {
            console.log(`   • ${issue}`);
        });
        pagesWithIssues++;
        totalIssues += issues.length;
    }
    
    professionalScore += pageScore;
    console.log('');
});

// Calculate overall score
const averageScore = professionalScore / pages.length;
const overallGrade = averageScore >= 95 ? 'A+' : 
                    averageScore >= 90 ? 'A' : 
                    averageScore >= 85 ? 'B+' : 
                    averageScore >= 80 ? 'B' : 
                    averageScore >= 75 ? 'C+' : 
                    averageScore >= 70 ? 'C' : 'D';

console.log('📊 PROFESSIONAL DESIGN AUDIT RESULTS');
console.log('=====================================');
console.log(`📄 Pages Checked: ${pages.length}`);
console.log(`⚠️  Pages with Issues: ${pagesWithIssues}`);
console.log(`🔧 Total Issues Found: ${totalIssues}`);
console.log(`📈 Average Score: ${averageScore.toFixed(1)}/100`);
console.log(`🏆 Overall Grade: ${overallGrade}`);
console.log('');

if (totalIssues === 0) {
    console.log('🎉 EXCELLENT! All pages meet professional design standards!');
} else if (averageScore >= 90) {
    console.log('✅ GOOD! Minor issues found but overall professional quality.');
} else if (averageScore >= 80) {
    console.log('⚠️  ACCEPTABLE! Some issues need attention for professional standards.');
} else {
    console.log('❌ NEEDS WORK! Significant issues found that need immediate attention.');
}

console.log('\n📋 RECOMMENDATIONS:');
if (totalIssues === 0) {
    console.log('• Your site is ready for production!');
    console.log('• Consider running performance tests');
    console.log('• Monitor user feedback after launch');
} else {
    console.log('• Fix the identified issues above');
    console.log('• Run this audit again after fixes');
    console.log('• Consider professional review for critical pages');
}

console.log('\n�� Audit Complete!'); 