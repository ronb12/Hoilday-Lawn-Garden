const fs = require('fs');

console.log('🔧 Fixing Remaining Pages with Navigation Issues...\n');

// Pages that need navigation structure added
const pagesToFix = [
    'admin.html',
    'check-firebase.html', 
    'dashboard 2.html',
    'offline 2.html',
    'run-assignment.html',
    'setup-staff-collections.html'
];

function fixNavigationStructure(filename) {
    try {
        let content = fs.readFileSync(filename, 'utf8');
        let modified = false;
        
        console.log(`📄 Processing ${filename}...`);
        
        // Check if nav-links structure exists
        if (!/<ul[^>]*class="[^"]*nav-links[^"]*"[^>]*>/i.test(content)) {
            console.log(`   - Adding nav-links structure`);
            
            // Find nav element and add nav-links
            const navRegex = /<nav[^>]*id="nav-menu"[^>]*>/i;
            if (navRegex.test(content)) {
                const navLinksHTML = `
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="services.html">Services</a></li>
        <li><a href="education.html">Education</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="pay-your-bill.html">Pay Your Bill</a></li>
      </ul>`;
                
                content = content.replace(
                    /(<nav[^>]*id="nav-menu"[^>]*>)/i,
                    `$1${navLinksHTML}`
                );
                modified = true;
            }
        }
        
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
            console.log(`   ✅ ${filename} already has required structure`);
        }
        
    } catch (error) {
        console.log(`   ❌ Error fixing ${filename}: ${error.message}`);
    }
}

// Fix the remaining pages
pagesToFix.forEach(fixNavigationStructure);

console.log('\n🎉 Remaining page fixes completed!');
console.log('Run the test again to verify all fixes.'); 