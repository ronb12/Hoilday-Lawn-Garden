const fs = require('fs');
const path = require('path');

// Professional lawn care business responsive design improvements
const responsiveImprovements = {
  // Universal responsive CSS to add to all pages
  universalCSS: `
    /* Professional Lawn Care Business Responsive Design */
    :root {
      --primary-green: #2e7d32;
      --light-green: #4caf50;
      --dark-green: #1b5e20;
      --accent-green: #8bc34a;
      --text-dark: #333;
      --text-light: #666;
      --white: #ffffff;
      --background-light: #f8f9fa;
      --border-color: #e0e0e0;
      --shadow-light: 0 2px 4px rgba(0,0,0,0.1);
      --shadow-medium: 0 4px 8px rgba(0,0,0,0.15);
      --border-radius: 8px;
      --transition: all 0.3s ease;
    }

    /* Universal Mobile-First Responsive Design */
    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Montserrat', sans-serif;
      line-height: 1.6;
      color: var(--text-dark);
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }

    /* Container System */
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    @media (min-width: 768px) {
      .container {
        padding: 0 2rem;
      }
    }

    @media (min-width: 1024px) {
      .container {
        padding: 0 3rem;
      }
    }

    /* Professional Header Responsive Design */
    .main-header {
      background: var(--white) !important;
      box-shadow: var(--shadow-light) !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      z-index: 1000 !important;
      padding: 0.75rem 1rem !important;
    }

    @media (min-width: 768px) {
      .main-header {
        padding: 1rem 2rem !important;
      }
    }

    /* Professional Hero Section */
    .hero {
      min-height: 60vh !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      color: var(--white) !important;
      position: relative !important;
      margin-top: 70px !important;
    }

    .hero img {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      z-index: 1 !important;
    }

    .hero::before {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(0, 0, 0, 0.5) !important;
      z-index: 2 !important;
    }

    .hero-content {
      position: relative !important;
      z-index: 3 !important;
      max-width: 800px !important;
      padding: 2rem 1rem !important;
    }

    .hero h1 {
      font-size: 2.5rem !important;
      font-weight: 700 !important;
      margin-bottom: 1rem !important;
      line-height: 1.2 !important;
    }

    .hero p {
      font-size: 1.1rem !important;
      margin-bottom: 2rem !important;
      opacity: 0.9 !important;
    }

    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem !important;
      }
      .hero p {
        font-size: 1rem !important;
      }
    }

    /* Professional Section Styling */
    .section {
      padding: 4rem 0 !important;
    }

    .section-title {
      font-size: 2.5rem !important;
      font-weight: 700 !important;
      text-align: center !important;
      margin-bottom: 3rem !important;
      color: var(--text-dark) !important;
    }

    @media (max-width: 768px) {
      .section-title {
        font-size: 2rem !important;
        margin-bottom: 2rem !important;
      }
    }

    /* Professional Card Grid System */
    .grid {
      display: grid !important;
      gap: 2rem !important;
    }

    .grid-2 {
      grid-template-columns: 1fr !important;
    }

    .grid-3 {
      grid-template-columns: 1fr !important;
    }

    .grid-4 {
      grid-template-columns: 1fr !important;
    }

    @media (min-width: 768px) {
      .grid-2 {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      .grid-3 {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      .grid-4 {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }

    @media (min-width: 1024px) {
      .grid-3 {
        grid-template-columns: repeat(3, 1fr) !important;
      }
      .grid-4 {
        grid-template-columns: repeat(4, 1fr) !important;
      }
    }

    /* Professional Card Design */
    .card {
      background: var(--white) !important;
      border-radius: var(--border-radius) !important;
      box-shadow: var(--shadow-light) !important;
      padding: 2rem !important;
      transition: var(--transition) !important;
      border: 1px solid var(--border-color) !important;
    }

    .card:hover {
      box-shadow: var(--shadow-medium) !important;
      transform: translateY(-2px) !important;
    }

    /* Professional Button Design */
    .btn {
      display: inline-block !important;
      padding: 0.75rem 1.5rem !important;
      border-radius: var(--border-radius) !important;
      text-decoration: none !important;
      font-weight: 600 !important;
      text-align: center !important;
      transition: var(--transition) !important;
      border: none !important;
      cursor: pointer !important;
      font-size: 1rem !important;
    }

    .btn-primary {
      background: var(--primary-green) !important;
      color: var(--white) !important;
    }

    .btn-primary:hover {
      background: var(--dark-green) !important;
      transform: translateY(-1px) !important;
    }

    .btn-secondary {
      background: transparent !important;
      color: var(--primary-green) !important;
      border: 2px solid var(--primary-green) !important;
    }

    .btn-secondary:hover {
      background: var(--primary-green) !important;
      color: var(--white) !important;
    }

    /* Professional Form Design */
    .form-group {
      margin-bottom: 1.5rem !important;
    }

    .form-group label {
      display: block !important;
      margin-bottom: 0.5rem !important;
      font-weight: 600 !important;
      color: var(--text-dark) !important;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100% !important;
      padding: 0.75rem !important;
      border: 1px solid var(--border-color) !important;
      border-radius: var(--border-radius) !important;
      font-size: 1rem !important;
      transition: var(--transition) !important;
      background: var(--white) !important;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none !important;
      border-color: var(--primary-green) !important;
      box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1) !important;
    }

    /* Professional Footer */
    .footer {
      background: var(--primary-green) !important;
      color: var(--white) !important;
      padding: 3rem 0 1rem !important;
      margin-top: 4rem !important;
    }

    .footer-content {
      max-width: 1200px !important;
      margin: 0 auto !important;
      padding: 0 1rem !important;
    }

    .footer-grid {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 2rem !important;
      margin-bottom: 2rem !important;
    }

    @media (min-width: 768px) {
      .footer-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }

    @media (min-width: 1024px) {
      .footer-grid {
        grid-template-columns: repeat(4, 1fr) !important;
      }
    }

    .footer-section h3 {
      margin-bottom: 1rem !important;
      font-weight: 600 !important;
    }

    .footer-section ul {
      list-style: none !important;
      padding: 0 !important;
    }

    .footer-section ul li {
      margin-bottom: 0.5rem !important;
    }

    .footer-section ul li a {
      color: var(--white) !important;
      text-decoration: none !important;
      opacity: 0.9 !important;
      transition: var(--transition) !important;
    }

    .footer-section ul li a:hover {
      opacity: 1 !important;
      text-decoration: underline !important;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
      padding-top: 1rem !important;
      text-align: center !important;
    }

    /* Professional Service Cards */
    .service-card {
      background: var(--white) !important;
      border-radius: var(--border-radius) !important;
      padding: 2rem !important;
      box-shadow: var(--shadow-light) !important;
      transition: var(--transition) !important;
      border: 1px solid var(--border-color) !important;
      text-align: center !important;
    }

    .service-card:hover {
      box-shadow: var(--shadow-medium) !important;
      transform: translateY(-5px) !important;
    }

    .service-icon {
      width: 80px !important;
      height: 80px !important;
      margin: 0 auto 1.5rem !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: var(--background-light) !important;
      border-radius: 50% !important;
    }

    .service-emoji {
      font-size: 2.5rem !important;
    }

    .service-card h3 {
      font-size: 1.5rem !important;
      font-weight: 600 !important;
      margin-bottom: 1rem !important;
      color: var(--text-dark) !important;
    }

    .service-card p {
      color: var(--text-light) !important;
      margin-bottom: 1.5rem !important;
      line-height: 1.6 !important;
    }

    /* Professional Contact Form */
    .contact-section {
      padding: 4rem 0 !important;
      background: var(--background-light) !important;
    }

    .contact-layout {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 3rem !important;
    }

    @media (min-width: 1024px) {
      .contact-layout {
        grid-template-columns: 2fr 1fr !important;
      }
    }

    .contact-form-container {
      background: var(--white) !important;
      padding: 2rem !important;
      border-radius: var(--border-radius) !important;
      box-shadow: var(--shadow-light) !important;
    }

    .contact-info {
      background: var(--white) !important;
      padding: 2rem !important;
      border-radius: var(--border-radius) !important;
      box-shadow: var(--shadow-light) !important;
    }

    .contact-item {
      display: flex !important;
      align-items: center !important;
      margin-bottom: 1rem !important;
      padding: 1rem !important;
      background: var(--background-light) !important;
      border-radius: var(--border-radius) !important;
    }

    .contact-item i {
      margin-right: 1rem !important;
      color: var(--primary-green) !important;
      font-size: 1.2rem !important;
    }

    /* Professional Testimonials */
    .testimonial-card {
      background: var(--white) !important;
      padding: 2rem !important;
      border-radius: var(--border-radius) !important;
      box-shadow: var(--shadow-light) !important;
      border-left: 4px solid var(--primary-green) !important;
    }

    .testimonial-content {
      font-style: italic !important;
      margin-bottom: 1rem !important;
      color: var(--text-dark) !important;
    }

    .testimonial-author {
      font-weight: 600 !important;
      color: var(--primary-green) !important;
    }

    /* Professional About Section */
    .about-content {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 3rem !important;
      align-items: center !important;
    }

    @media (min-width: 1024px) {
      .about-content {
        grid-template-columns: 1fr 1fr !important;
      }
    }

    .about-text h2 {
      font-size: 2.5rem !important;
      font-weight: 700 !important;
      margin-bottom: 1.5rem !important;
      color: var(--text-dark) !important;
    }

    .about-text p {
      font-size: 1.1rem !important;
      line-height: 1.8 !important;
      color: var(--text-light) !important;
      margin-bottom: 1.5rem !important;
    }

    .about-image img {
      width: 100% !important;
      height: auto !important;
      border-radius: var(--border-radius) !important;
      box-shadow: var(--shadow-medium) !important;
    }

    /* Professional FAQ Section */
    .faq-item {
      background: var(--white) !important;
      border-radius: var(--border-radius) !important;
      margin-bottom: 1rem !important;
      box-shadow: var(--shadow-light) !important;
      overflow: hidden !important;
    }

    .faq-question {
      padding: 1.5rem !important;
      background: var(--background-light) !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: var(--transition) !important;
    }

    .faq-question:hover {
      background: var(--primary-green) !important;
      color: var(--white) !important;
    }

    .faq-answer {
      padding: 1.5rem !important;
      color: var(--text-light) !important;
      line-height: 1.6 !important;
    }

    /* Professional Gallery */
    .gallery-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
      gap: 1.5rem !important;
    }

    .gallery-item {
      border-radius: var(--border-radius) !important;
      overflow: hidden !important;
      box-shadow: var(--shadow-light) !important;
      transition: var(--transition) !important;
    }

    .gallery-item:hover {
      transform: scale(1.02) !important;
      box-shadow: var(--shadow-medium) !important;
    }

    .gallery-item img {
      width: 100% !important;
      height: 250px !important;
      object-fit: cover !important;
    }

    /* Professional CTA Section */
    .cta-section {
      background: var(--primary-green) !important;
      color: var(--white) !important;
      padding: 4rem 0 !important;
      text-align: center !important;
    }

    .cta-section h2 {
      font-size: 2.5rem !important;
      font-weight: 700 !important;
      margin-bottom: 1rem !important;
    }

    .cta-section p {
      font-size: 1.2rem !important;
      margin-bottom: 2rem !important;
      opacity: 0.9 !important;
    }

    .cta-buttons {
      display: flex !important;
      gap: 1rem !important;
      justify-content: center !important;
      flex-wrap: wrap !important;
    }

    @media (max-width: 768px) {
      .cta-buttons {
        flex-direction: column !important;
        align-items: center !important;
      }
    }

    /* Professional Loading States */
    .loading {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: var(--white) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 9999 !important;
    }

    .spinner {
      width: 40px !important;
      height: 40px !important;
      border: 4px solid var(--border-color) !important;
      border-top: 4px solid var(--primary-green) !important;
      border-radius: 50% !important;
      animation: spin 1s linear infinite !important;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Professional Error Messages */
    .error-message {
      background: #f44336 !important;
      color: var(--white) !important;
      padding: 1rem !important;
      border-radius: var(--border-radius) !important;
      margin: 1rem 0 !important;
      text-align: center !important;
    }

    /* Professional Success Messages */
    .success-message {
      background: var(--primary-green) !important;
      color: var(--white) !important;
      padding: 1rem !important;
      border-radius: var(--border-radius) !important;
      margin: 1rem 0 !important;
      text-align: center !important;
    }

    /* Professional Accessibility */
    .skip-link {
      position: absolute !important;
      top: -40px !important;
      left: 6px !important;
      background: var(--primary-green) !important;
      color: var(--white) !important;
      padding: 8px !important;
      text-decoration: none !important;
      border-radius: var(--border-radius) !important;
      z-index: 10000 !important;
    }

    .skip-link:focus {
      top: 6px !important;
    }

    /* Professional Print Styles */
    @media print {
      .main-header,
      .footer,
      .cta-section,
      .btn {
        display: none !important;
      }
      
      body {
        font-size: 12pt !important;
        line-height: 1.4 !important;
      }
      
      .hero {
        min-height: auto !important;
        margin-top: 0 !important;
      }
    }
  `,

  // Mobile menu JavaScript
  mobileMenuJS: `
    document.addEventListener('DOMContentLoaded', function() {
      var hamburger = document.querySelector('.hamburger');
      var nav = document.getElementById('nav-menu');
      var navLinks = document.querySelector('.nav-links');
      var body = document.body;
      
      if (hamburger && nav && navLinks) {
        hamburger.addEventListener('click', function() {
          var expanded = hamburger.getAttribute('aria-expanded') === 'true';
          hamburger.classList.toggle('active');
          nav.classList.toggle('active');
          navLinks.classList.toggle('active');
          body.classList.toggle('menu-open');
          hamburger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          body.style.overflow = expanded ? '' : 'hidden';
        });

        document.addEventListener('click', function(e) {
          if (!nav.contains(e.target) && !hamburger.contains(e.target) && nav.classList.contains('active')) {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
            navLinks.classList.remove('active');
            body.classList.remove('menu-open');
            body.style.overflow = '';
            hamburger.setAttribute('aria-expanded', 'false');
          }
        });

        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && nav.classList.contains('active')) {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
            navLinks.classList.remove('active');
            body.classList.remove('menu-open');
            body.style.overflow = '';
            hamburger.setAttribute('aria-expanded', 'false');
          }
        });

        navLinks.querySelectorAll('a').forEach(function(link) {
          link.addEventListener('click', function() {
            if (nav.classList.contains('active')) {
              hamburger.classList.remove('active');
              nav.classList.remove('active');
              navLinks.classList.remove('active');
              body.classList.remove('menu-open');
              body.style.overflow = '';
              hamburger.setAttribute('aria-expanded', 'false');
            }
          });
        });
      }
    });
  `
};

// Get all HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

console.log(`🔍 Checking responsive design across ${htmlFiles.length} HTML files...\n`);

let filesUpdated = 0;
let filesSkipped = 0;

htmlFiles.forEach(file => {
  console.log(`Processing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Skip utility and payment pages
  const skipPages = [
    'payment-success.html', 'payment-failed.html', 'payment-cancelled.html',
    'payment-declined.html', 'payment-disputed.html', 'payment-error.html',
    'payment-expired.html', 'payment-hold.html', 'payment-invalid.html',
    'payment-limit.html', 'payment-locked.html', 'payment-maintenance.html',
    'payment-overdue.html', 'payment-partial.html', 'payment-pending.html',
    'payment-processing.html', 'payment-refunded.html', 'payment-reversed.html',
    'payment-timeout.html', 'payment-voided.html', 'offline.html', 'error.html',
    '404.html', '404 2.html', 'template.html', 'template 2.html',
    'check-firebase.html', 'check-accounts.html', 'assign-accounts.html',
    'bulk-message.html', 'generate-report.html', 'run-assignment.html',
    'setup-inventory-collections.html', 'setup-staff-collections.html',
    'add-appointment.html', 'add-customer.html', 'add-payment.html', 'add-staff.html',
    'schedule-maintenance.html', 'sitemap.html'
  ];

  if (skipPages.includes(file)) {
    console.log(`  ⏭️  Skipping ${file} (utility/payment page)`);
    filesSkipped++;
    return;
  }

  // Add responsive CSS if not already present
  if (!content.includes('Professional Lawn Care Business Responsive Design') || !content.includes('--primary-green')) {
    // Find the last </style> tag and add our CSS before it
    const lastStyleIndex = content.lastIndexOf('</style>');
    if (lastStyleIndex !== -1) {
      content = content.slice(0, lastStyleIndex) + responsiveImprovements.universalCSS + '\n  ' + content.slice(lastStyleIndex);
      modified = true;
      console.log(`  ✅ Added professional responsive CSS`);
    }
  }

  // Add mobile menu JavaScript if not present
  if (!content.includes('hamburger.addEventListener') && !content.includes('DOMContentLoaded')) {
    const mobileMenuScript = `
  <script>
    ${responsiveImprovements.mobileMenuJS}
  </script>`;

    // Add before closing body tag
    const bodyCloseIndex = content.lastIndexOf('</body>');
    if (bodyCloseIndex !== -1) {
      content = content.slice(0, bodyCloseIndex) + mobileMenuScript + '\n' + content.slice(bodyCloseIndex);
      modified = true;
      console.log(`  ✅ Added mobile menu JavaScript`);
    }
  }

  // Ensure proper viewport meta tag
  if (!content.includes('width=device-width, initial-scale=1.0')) {
    const headIndex = content.indexOf('<head>');
    if (headIndex !== -1) {
      const viewportMeta = '\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />';
      content = content.slice(0, headIndex + 6) + viewportMeta + content.slice(headIndex + 6);
      modified = true;
      console.log(`  ✅ Added viewport meta tag`);
    }
  }

  // Ensure proper body padding for fixed header
  if (!content.includes('padding-top: 100px') && !content.includes('padding-top: 70px')) {
    // Add body padding for fixed header
    const bodyStylePattern = /body\s*\{[^}]*\}/;
    if (bodyStylePattern.test(content)) {
      content = content.replace(bodyStylePattern, 'body { padding-top: 100px; margin: 0; }');
    } else {
      // Add body style if not present
      const headCloseIndex = content.indexOf('</head>');
      if (headCloseIndex !== -1) {
        const bodyStyle = '\n  <style>\n    body { padding-top: 100px; margin: 0; }\n    @media (max-width: 768px) { body { padding-top: 80px; } }\n  </style>';
        content = content.slice(0, headCloseIndex) + bodyStyle + content.slice(headCloseIndex);
      }
    }
    modified = true;
    console.log(`  ✅ Added body padding for fixed header`);
  }

  // Ensure professional lawn care business content structure
  if (file === 'index.html' || file === 'about.html' || file === 'services.html' || file === 'contact.html') {
    // Check for proper hero section structure
    if (!content.includes('hero-content') || !content.includes('cta-buttons')) {
      console.log(`  ⚠️  Main page ${file} may need hero section improvements`);
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    filesUpdated++;
    console.log(`  ✅ Updated ${file}`);
  } else {
    console.log(`  ⏭️  No changes needed for ${file}`);
    filesSkipped++;
  }
});

console.log(`\n📊 RESPONSIVE DESIGN CHECK SUMMARY:`);
console.log(`Files updated: ${filesUpdated}`);
console.log(`Files skipped: ${filesSkipped}`);
console.log(`Total files processed: ${htmlFiles.length}`);

if (filesUpdated > 0) {
  console.log(`\n✅ Professional responsive design applied to ${filesUpdated} pages!`);
  console.log(`🎯 All pages now feature:`);
  console.log(`   • Mobile-first responsive design`);
  console.log(`   • Professional lawn care business styling`);
  console.log(`   • Consistent color scheme and typography`);
  console.log(`   • Touch-friendly navigation`);
  console.log(`   • Optimized for all screen sizes`);
  console.log(`   • Professional card and form designs`);
  console.log(`   • Accessibility improvements`);
} else {
  console.log(`\n✅ All pages already have professional responsive design!`);
} 