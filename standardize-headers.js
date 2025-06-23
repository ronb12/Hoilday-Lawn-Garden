#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Main navigation pages that need header standardization
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

// Standard header template
const standardHeader = `  <!-- Header -->
  <header class="main-header">
    <div class="logo">
      <a href="index.html">
        <picture>
          <source srcset="assets/images/hollidays-logo.optimized-1280.webp" type="image/webp">
          <img src="assets/images/hollidays-logo.optimized-1280.png" alt="Holliday's Lawn &amp; Garden Logo" loading="lazy">
        </picture>
      </a>
    </div>
    <nav id="nav-menu">
      <button class="hamburger" aria-label="Toggle menu" aria-controls="nav-menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="services.html">Services</a></li>
        <li><a href="education.html">Education</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="pay-your-bill.html">Pay Your Bill</a></li>
      </ul>
      <div class="login-buttons">
        <a href="login.html" class="btn-login btn-customer">
          <i class="fas fa-user"></i>
          Customer Login
        </a>
        <a href="admin-login.html" class="btn-login btn-admin">
          <i class="fas fa-lock"></i>
          Admin Login
        </a>
      </div>
    </nav>
  </header>`;

// Standard meta tags for logo references
const standardMetaTags = {
    ogImage: '<meta property="og:image" content="assets/images/hollidays-logo.optimized-1280.png" />',
    twitterImage: '<meta name="twitter:image" content="assets/images/hollidays-logo.optimized-1280.png" />'
};

function standardizeHeaders() {
    console.log('🔧 Standardizing headers across main navigation pages...\n');
    
    let processedCount = 0;
    let errorCount = 0;
    
    mainPages.forEach(page => {
        try {
            if (!fs.existsSync(page)) {
                console.log(`⚠️  Skipping ${page} - file not found`);
                return;
            }
            
            console.log(`📄 Processing ${page}...`);
            let content = fs.readFileSync(page, 'utf8');
            let modified = false;
            
            // Replace header section
            const headerRegex = /<!-- Header -->\s*<header class="main-header">[\s\S]*?<\/header>/;
            if (headerRegex.test(content)) {
                content = content.replace(headerRegex, standardHeader);
                modified = true;
                console.log(`  ✅ Updated header markup`);
            }
            
            // Update meta tags for logo references
            const ogImageRegex = /<meta[^>]*property="og:image"[^>]*>/;
            const twitterImageRegex = /<meta[^>]*name="twitter:image"[^>]*>/;
            
            if (ogImageRegex.test(content)) {
                content = content.replace(ogImageRegex, standardMetaTags.ogImage);
                modified = true;
                console.log(`  ✅ Updated og:image meta tag`);
            }
            
            if (twitterImageRegex.test(content)) {
                content = content.replace(twitterImageRegex, standardMetaTags.twitterImage);
                modified = true;
                console.log(`  ✅ Updated twitter:image meta tag`);
            }
            
            // Replace any non-optimized logo references in JSON-LD
            const jsonLdRegex = /"url":\s*"[^"]*hollidays-logo\.png"/g;
            if (jsonLdRegex.test(content)) {
                content = content.replace(jsonLdRegex, '"url": "assets/images/hollidays-logo.optimized-1280.png"');
                modified = true;
                console.log(`  ✅ Updated JSON-LD logo references`);
            }
            
            if (modified) {
                fs.writeFileSync(page, content, 'utf8');
                processedCount++;
                console.log(`  ✅ ${page} standardized successfully`);
            } else {
                console.log(`  ℹ️  ${page} already has standard header`);
            }
            
        } catch (error) {
            console.error(`  ❌ Error processing ${page}:`, error.message);
            errorCount++;
        }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Successfully processed: ${processedCount} pages`);
    console.log(`  ❌ Errors: ${errorCount} pages`);
    console.log(`  📄 Total pages checked: ${mainPages.length}`);
    
    if (errorCount === 0) {
        console.log(`\n🎉 All headers have been standardized successfully!`);
    } else {
        console.log(`\n⚠️  Some pages had errors. Please check the output above.`);
    }
}

// Run the standardization
standardizeHeaders(); 