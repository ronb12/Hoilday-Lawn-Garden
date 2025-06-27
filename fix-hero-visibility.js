const fs = require('fs');
const path = require('path');

// List of pages with hero sections
const pagesWithHero = [
    'admin-login.html', 'faq.html', 'services.html', 'education.html', 
    'register.html', 'contact.html', 'about.html', 'testimonials.html', 
    'index.html', 'pay-your-bill.html'
];

console.log('🔧 Fixing hero section visibility issues...');

pagesWithHero.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Add CSS to ensure hero H1 elements are visible
    const heroVisibilityCSS = `
<style>
/* Ensure hero H1 elements are always visible */
.hero h1 {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: relative !important;
    z-index: 10 !important;
}

/* Ensure hero content is visible */
.hero-content {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}

/* Ensure hero section itself is visible */
.hero {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
}
</style>`;

    // Add the CSS if it doesn't already exist
    if (!content.includes('.hero h1 { display: block !important;')) {
        content = content.replace('</head>', `${heroVisibilityCSS}\n</head>`);
        changed = true;
        console.log(`✅ Added hero visibility CSS to ${page}`);
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

console.log('🎨 Hero visibility issues fixed!'); 