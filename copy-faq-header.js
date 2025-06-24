const fs = require('fs');

// The exact header structure from FAQ page
const faqHeader = `  <!-- Header -->
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

// Main pages to update (excluding faq.html since it's the source)
const mainPages = [
    'index.html',
    'about.html',
    'services.html', 
    'education.html',
    'contact.html',
    'pay-your-bill.html',
    'login.html',
    'admin-login.html',
    'register.html',
    'forgot-password.html',
    'create-account.html',
    'testimonials.html',
    'gallery.html',
    'privacy-policy.html',
    'terms.html'
];

function replaceHeaderInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find the header section
        const headerStart = content.indexOf('<header class="main-header">');
        if (headerStart === -1) {
            console.log(`No header found in ${filePath}`);
            return false;
        }
        
        // Find the end of the header
        const headerEnd = content.indexOf('</header>', headerStart);
        if (headerEnd === -1) {
            console.log(`No header end found in ${filePath}`);
            return false;
        }
        
        // Replace the header
        const beforeHeader = content.substring(0, headerStart);
        const afterHeader = content.substring(headerEnd + 9); // +9 for '</header>'
        
        const newContent = beforeHeader + faqHeader + afterHeader;
        
        // Write back to file
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Updated header in ${filePath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
        return false;
    }
}

// Update all main pages
console.log('🔄 Copying FAQ header to all main pages...\n');

let updatedCount = 0;
for (const page of mainPages) {
    if (fs.existsSync(page)) {
        if (replaceHeaderInFile(page)) {
            updatedCount++;
        }
    } else {
        console.log(`⚠️  File not found: ${page}`);
    }
}

console.log(`\n✅ Updated ${updatedCount} out of ${mainPages.length} pages`);
console.log('🎉 All headers now match the FAQ page structure!'); 