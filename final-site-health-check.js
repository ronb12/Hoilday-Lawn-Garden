const fs = require('fs');
const path = require('path');

const pages = [
    'index.html', 'about.html', 'services.html', 'education.html', 'faq.html',
    'contact.html', 'login.html', 'register.html', 'pay-your-bill.html',
    'admin-login.html', 'admin-dashboard.html', 'customer-dashboard.html',
    'appointments.html', 'customers.html', 'staff.html', 'payments.html',
    'messages.html', 'inventory.html', 'analytics.html', 'add-appointment.html',
    'add-customer.html', 'add-staff.html', 'add-payment.html', 'testimonials.html',
    'gallery.html', 'terms.html', 'privacy-policy.html'
];

const analyticsPatterns = [
    /google-analytics\.com/,
    /gtag\(/,
    /ga\(/,
    /googletagmanager\.com/,
    /fbq\(/,
    /facebook\.com\/tr\//,
    /mixpanel/,
    /hotjar/,
    /clarity/,
    /matomo/
];

console.log('🔍 Final Site Health Check - Advanced Areas\n');

let issues = [];

pages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    let pageIssues = [];
    
    // 1. Performance hints
    if (content.length > 200000) pageIssues.push('Large HTML file (may impact performance)');
    if ((content.match(/<img /g) || []).length > 20) pageIssues.push('Many images on page (check lazy loading/optimization)');
    if (content.includes('style="') && (content.match(/style="/g) || []).length > 20) pageIssues.push('Many inline styles (move to CSS)');
    
    // 2. Broken links (static check)
    const linkMatches = content.match(/href="([^"]+)"/gi) || [];
    linkMatches.forEach(link => {
        const url = link.replace(/href=|"/g, '');
        if (url.startsWith('http') && !url.includes('hollidaylawngarden.com') && !url.includes('mailto:') && !url.includes('tel:')) {
            pageIssues.push(`External link: ${url} (check if valid)`);
        }
        if (url.endsWith('.html') && !fs.existsSync(path.join(__dirname, url))) {
            pageIssues.push(`Broken internal link: ${url}`);
        }
    });
    
    // 3. Form presence and basic validation
    if (content.includes('<form')) {
        if (!content.includes('required')) pageIssues.push('Form(s) missing required fields');
        if (!content.match(/type="email"/)) pageIssues.push('Form(s) missing email input type');
        if (!content.match(/type="password"/)) pageIssues.push('Form(s) missing password input type');
    }
    
    // 4. Accessibility basics
    if ((content.match(/<img /g) || []).length > 0 && !content.includes('alt=')) pageIssues.push('Images missing alt attributes');
    if (!content.includes('aria-label') && !content.includes('aria-')) pageIssues.push('Missing ARIA labels (navigation, forms, etc)');
    if (!content.includes('tabindex')) pageIssues.push('No tabindex found (check keyboard navigation)');
    if (!content.includes('lang="en"')) pageIssues.push('Missing lang attribute on html');
    
    // 5. PWA/Service Worker
    if (page === 'index.html') {
        if (!content.includes('service-worker.js')) pageIssues.push('No service worker registered');
        if (!content.includes('manifest.json')) pageIssues.push('No web app manifest linked');
    }
    
    // 6. Security headers (static check)
    if (!content.includes('Content-Security-Policy')) pageIssues.push('No Content-Security-Policy meta tag');
    if (!content.includes('X-Frame-Options')) pageIssues.push('No X-Frame-Options meta tag');
    if (!content.includes('X-Content-Type-Options')) pageIssues.push('No X-Content-Type-Options meta tag');
    if (!content.includes('Referrer-Policy')) pageIssues.push('No Referrer-Policy meta tag');
    
    // 7. Image optimization
    const imgTags = content.match(/<img [^>]+>/gi) || [];
    imgTags.forEach(img => {
        if (!img.includes('loading="lazy"')) pageIssues.push('Image missing loading="lazy"');
        if (!img.includes('srcset')) pageIssues.push('Image missing srcset for responsive loading');
    });
    
    // 8. Analytics/tracking scripts
    analyticsPatterns.forEach(pattern => {
        if (pattern.test(content)) pageIssues.push('Analytics/tracking script detected');
    });
    
    if (pageIssues.length > 0) {
        issues.push({ page, pageIssues });
        console.log(`⚠️  ${page} - ${pageIssues.length} issues`);
        pageIssues.forEach(issue => console.log(`   • ${issue}`));
    } else {
        console.log(`✅ ${page} - No issues found`);
    }
});

console.log('\n📊 FINAL SITE HEALTH SUMMARY');
console.log('============================');
console.log(`Pages checked: ${pages.length}`);
console.log(`Pages with issues: ${issues.length}`);
console.log('');
if (issues.length === 0) {
    console.log('🎉 All advanced checks passed! Your site is in excellent health.');
} else {
    console.log('⚠️  Some advanced issues found. Review the above and consider manual/automated tools for deeper checks.');
}
console.log('\n🔍 Health check complete!'); 