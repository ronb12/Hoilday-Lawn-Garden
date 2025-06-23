const fs = require('fs');

console.log('🔧 Fixing Hamburger Menu on ALL Pages...\n');

// Files to exclude from fixing (test files, etc.)
const excludeFiles = [
    'hamburger-test.html',
    'browser-test-hamburger.html',
    'visual-hamburger-test.html',
    'mobile-only-hamburger-test.html',
    'manual-hamburger-test.js',
    'hamburger-test.js',
    'fix-main-navigation.js',
    'fix-hamburger-menu.js',
    'fix-all-hamburger-menus.js'
];

function fixHamburgerMenu(filename) {
    try {
        let content = fs.readFileSync(filename, 'utf8');
        let modified = false;
        
        console.log(`📄 Processing ${filename}...`);
        
        // Check if hamburger button exists
        if (!/<button[^>]*class="[^"]*hamburger[^"]*"[^>]*>/i.test(content)) {
            console.log(`   - Adding hamburger button`);
            
            // Find nav element and add hamburger button
            const navRegex = /<nav[^>]*id="nav-menu"[^>]*>/i;
            if (navRegex.test(content)) {
                content = content.replace(
                    /(<nav[^>]*id="nav-menu"[^>]*>)/i,
                    `$1
      <button class="hamburger" aria-label="Toggle menu" aria-controls="nav-menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>`
                );
                modified = true;
            }
        }
        
        // Check if hamburger CSS exists
        if (!/\.hamburger\s*\{/i.test(content)) {
            console.log(`   - Adding hamburger CSS`);
            
            // Add hamburger CSS before closing </style> tag
            const hamburgerCSS = `
    .hamburger {
        display: none;
        cursor: pointer;
        padding: 15px;
        z-index: 1000;
        position: relative;
        background: none;
        border: none;
        -webkit-tap-highlight-color: transparent;
        margin-left: 1rem;
    }

    .hamburger span {
        display: block;
        width: 25px;
        height: 3px;
        background-color: var(--primary-green, #2e7d32);
        margin: 5px 0;
        transition: 0.3s;
    }

    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }

    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }`;
            
            content = content.replace(/<\/style>/i, `${hamburgerCSS}
</style>`);
            modified = true;
        }
        
        // Check if mobile responsive CSS exists
        if (!/@media.*max-width.*768px.*\{[^}]*\.hamburger[^}]*display:\s*block/i.test(content)) {
            console.log(`   - Adding mobile responsive CSS`);
            
            // Add mobile responsive CSS
            const mobileCSS = `
    @media (max-width: 768px) {
        .hamburger { 
            display: block;
        }
        
        .nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--primary-green, #2e7d32);
            padding: 1rem;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        .nav-links.active {
            display: flex;
        }
        
        .login-buttons {
            flex-direction: column;
            gap: 0.5rem;
            margin-left: 0;
        }
    }`;
            
            content = content.replace(/<\/style>/i, `${mobileCSS}
</style>`);
            modified = true;
        }
        
        // Check if hamburger JavaScript exists
        if (!/hamburger.*addEventListener|querySelector.*hamburger/i.test(content)) {
            console.log(`   - Adding hamburger JavaScript`);
            
            // Add hamburger JavaScript before closing </body> tag
            const hamburgerJS = `
<script>
document.addEventListener('DOMContentLoaded', function() {
    var hamburger = document.querySelector('.hamburger');
    var nav = document.getElementById('nav-menu');
    var navLinks = document.querySelector('.nav-links');
    var body = document.body;
    
    if (!hamburger || !nav || !navLinks) return;
    
    function closeMenu() {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
        body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
    }
    
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
            closeMenu();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) closeMenu();
    });
    
    navLinks.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', closeMenu);
    });
});
</script>`;
            
            content = content.replace(/<\/body>/i, `${hamburgerJS}
</body>`);
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(filename, content, 'utf8');
            console.log(`   ✅ Fixed ${filename}`);
        } else {
            console.log(`   ✅ ${filename} already has hamburger menu`);
        }
        
    } catch (error) {
        console.log(`   ❌ Error fixing ${filename}: ${error.message}`);
    }
}

// Get all HTML files and fix them, excluding test files
const htmlFiles = fs.readdirSync('.')
    .filter(file => file.endsWith('.html'))
    .filter(file => !excludeFiles.includes(file))
    .sort();

console.log(`Found ${htmlFiles.length} HTML files to process (excluding test files)...\n`);

// Fix all pages
htmlFiles.forEach(fixHamburgerMenu);

console.log('\n🎉 Hamburger menu fixes completed on all pages!');
console.log('Run the test again to verify all fixes.'); 