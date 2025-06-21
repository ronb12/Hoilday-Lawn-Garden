const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Mobile menu HTML template
const mobileMenuTemplate = `
    <button class="hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-menu">
        <span></span>
        <span></span>
        <span></span>
    </button>
    <nav id="nav-menu">
        <ul class="nav-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="services.html">Services</a></li>
            <li><a href="education.html">Education</a></li>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="pay-your-bill.html">Pay Your Bill</a></li>
            <li class="login-buttons">
                <a href="login.html" class="btn-login btn-customer">
                    <i class="fas fa-user"></i>
                    Customer Login
                </a>
                <a href="admin-login.html" class="btn-login btn-admin">
                    <i class="fas fa-lock"></i>
                    Admin Login
                </a>
            </li>
        </ul>
    </nav>
`;

// Mobile menu JavaScript template
const mobileMenuScript = `
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const hamburger = document.querySelector('.hamburger');
            const nav = document.querySelector('#nav-menu');
            const navLinks = document.querySelector('.nav-links');
            const body = document.body;

            if (hamburger) {
                hamburger.addEventListener('click', function() {
                    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
                    hamburger.classList.toggle('active');
                    nav.classList.toggle('active');
                    navLinks.classList.toggle('active');
                    body.classList.toggle('menu-open');
                    hamburger.setAttribute('aria-expanded', !isExpanded);
                    body.style.overflow = !isExpanded ? 'hidden' : '';
                });

                // Close menu when clicking outside
                document.addEventListener('click', function(event) {
                    const isClickInside = nav.contains(event.target) || hamburger.contains(event.target);
                    if (!isClickInside && nav.classList.contains('active')) {
                        hamburger.classList.remove('active');
                        nav.classList.remove('active');
                        navLinks.classList.remove('active');
                        body.classList.remove('menu-open');
                        body.style.overflow = '';
                        hamburger.setAttribute('aria-expanded', 'false');
                    }
                });

                // Close menu on escape key
                document.addEventListener('keydown', function(event) {
                    if (event.key === 'Escape' && nav.classList.contains('active')) {
                        hamburger.classList.remove('active');
                        nav.classList.remove('active');
                        navLinks.classList.remove('active');
                        body.classList.remove('menu-open');
                        body.style.overflow = '';
                        hamburger.setAttribute('aria-expanded', 'false');
                    }
                });

                // Close menu when clicking on links
                const navItems = navLinks.querySelectorAll('a');
                navItems.forEach(link => {
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
    </script>
`;

// CSS for mobile menu
const mobileMenuCSS = `
    <style>
        /* Mobile Menu Styles */
        .hamburger {
            display: none;
            cursor: pointer;
            padding: 15px;
            z-index: 1000;
            position: relative;
            background: none;
            border: none;
            -webkit-tap-highlight-color: transparent;
            margin-right: 10px;
        }

        .hamburger span {
            display: block;
            width: 25px;
            height: 3px;
            background-color: #2e7d32;
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
        }

        @media (max-width: 768px) {
            .hamburger {
                display: block;
            }

            .nav-links {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 2.5rem;
                z-index: 1000;
                visibility: hidden;
                opacity: 0;
                transform: translateY(-100%);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: none;
                padding: 2rem;
            }

            .nav-links.active {
                visibility: visible;
                opacity: 1;
                transform: translateY(0);
                pointer-events: auto;
            }

            .nav-links a {
                font-size: 1.75rem;
                padding: 1rem 2rem;
                width: 100%;
                text-align: center;
                transition: all 0.3s ease;
                position: relative;
                color: #333333;
                font-weight: 600;
            }

            .nav-links a::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                width: 0;
                height: 3px;
                background: #2e7d32;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                transform: translateX(-50%);
            }

            .nav-links a:hover::after,
            .nav-links a.active::after {
                width: 60%;
            }

            .nav-links a:hover {
                color: #2e7d32;
                transform: translateY(-2px);
            }

            body.menu-open {
                overflow: hidden;
                position: fixed;
                width: 100%;
                height: 100%;
            }
        }

        /* Prevent text selection during menu transitions */
        .nav-links {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }

        /* Ensure smooth scrolling on iOS */
        html {
            -webkit-overflow-scrolling: touch;
        }
    </style>
`;

function getAllHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory() && !filePath.includes('node_modules')) {
            results = results.concat(getAllHtmlFiles(filePath));
        } else if (file.endsWith('.html') && !filePath.includes('node_modules')) {
            results.push(filePath);
        }
    });
    return results;
}

function fixMobileMenu(html, file) {
    const $ = cheerio.load(html);
    
    // Always ensure .hamburger has correct ARIA attributes
    $('.hamburger').each((i, el) => {
        $(el).attr('aria-label', 'Toggle menu');
        $(el).attr('aria-controls', 'nav-menu');
        $(el).attr('aria-expanded', 'false');
    });
    
    // Check if page already has mobile menu
    const existingHamburger = $('.hamburger');
    const existingNav = $('#nav-menu, nav#nav-menu');
    
    if (existingHamburger.length > 0 && existingNav.length > 0) {
        // Add mobile menu script if not present
        const scripts = $('script').map((i, el) => $(el).html()).get().join(' ');
        if (!/hamburger|mobile[-_]menu|menu-open|aria-expanded/.test(scripts)) {
            $('body').append(mobileMenuScript);
        }
        // Add CSS if not present
        const styles = $('style').map((i, el) => $(el).html()).get().join(' ');
        if (!/\.hamburger|\.nav-links/.test(styles)) {
            $('head').append(mobileMenuCSS);
        }
        return $.html();
    }
    
    // Find header or create one
    let header = $('header, .main-header, .header');
    if (header.length === 0) {
        // Create header if none exists
        const body = $('body');
        const firstChild = body.children().first();
        header = $('<header class="main-header"></header>');
        if (firstChild.length > 0) {
            firstChild.before(header);
        } else {
            body.prepend(header);
        }
    }
    // Add mobile menu to header
    header.append(mobileMenuTemplate);
    // Add CSS to head
    $('head').append(mobileMenuCSS);
    // Add JavaScript to body
    $('body').append(mobileMenuScript);
    return $.html();
}

function main() {
    const files = getAllHtmlFiles('.');
    let fixedCount = 0;
    console.log('Fixing mobile menus across all HTML files...');
    files.forEach(file => {
        try {
            const html = fs.readFileSync(file, 'utf8');
            const fixedHtml = fixMobileMenu(html, file);
            fs.writeFileSync(file, fixedHtml);
            fixedCount++;
            console.log(`✅ Fixed: ${file}`);
        } catch (error) {
            console.error(`❌ Error fixing ${file}:`, error.message);
        }
    });
    console.log(`\nFixed ${fixedCount} out of ${files.length} files`);
}

main(); 