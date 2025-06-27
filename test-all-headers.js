// Comprehensive Header Test Script
// Tests headers across all main pages to ensure consistency and professionalism

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

const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
};

function addResult(page, test, status, message) {
    testResults.total++;
    if (status === 'PASS') {
        testResults.passed++;
    } else {
        testResults.failed++;
    }
    
    testResults.details.push({
        page,
        test,
        status,
        message
    });
    
    console.log(`[${status}] ${page} - ${test}: ${message}`);
}

function testHeaderStructure(page) {
    const header = document.querySelector('.main-header');
    const logo = document.querySelector('.logo img');
    const navMenu = document.querySelector('#nav-menu');
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    const loginButtons = document.querySelector('.login-buttons');
    
    // Test header existence
    if (!header) {
        addResult(page, 'Header Element', 'FAIL', 'Main header not found');
        return false;
    }
    addResult(page, 'Header Element', 'PASS', 'Header found');
    
    // Test logo
    if (!logo) {
        addResult(page, 'Logo', 'FAIL', 'Logo not found');
    } else {
        addResult(page, 'Logo', 'PASS', 'Logo found');
    }
    
    // Test navigation menu
    if (!navMenu) {
        addResult(page, 'Navigation Menu', 'FAIL', 'Navigation menu not found');
    } else {
        addResult(page, 'Navigation Menu', 'PASS', 'Navigation menu found');
    }
    
    // Test navigation links
    if (!navLinks) {
        addResult(page, 'Navigation Links', 'FAIL', 'Navigation links not found');
    } else {
        const links = navLinks.querySelectorAll('a');
        addResult(page, 'Navigation Links', 'PASS', `${links.length} navigation links found`);
    }
    
    // Test hamburger menu
    if (!hamburger) {
        addResult(page, 'Hamburger Menu', 'FAIL', 'Hamburger menu not found');
    } else {
        addResult(page, 'Hamburger Menu', 'PASS', 'Hamburger menu found');
    }
    
    // Test login buttons
    if (!loginButtons) {
        addResult(page, 'Login Buttons', 'FAIL', 'Login buttons not found');
    } else {
        const buttons = loginButtons.querySelectorAll('.btn-login');
        addResult(page, 'Login Buttons', 'PASS', `${buttons.length} login buttons found`);
    }
    
    return true;
}

function testHeaderStyling(page) {
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    const styles = window.getComputedStyle(header);
    
    // Test positioning
    if (styles.position === 'fixed') {
        addResult(page, 'Header Position', 'PASS', 'Header is fixed positioned');
    } else {
        addResult(page, 'Header Position', 'FAIL', `Header position is ${styles.position}, should be fixed`);
    }
    
    // Test z-index
    const zIndex = parseInt(styles.zIndex);
    if (zIndex >= 1000) {
        addResult(page, 'Header Z-Index', 'PASS', `Z-index is ${zIndex}`);
    } else {
        addResult(page, 'Header Z-Index', 'FAIL', `Z-index is ${zIndex}, should be >= 1000`);
    }
    
    // Test background
    if (styles.backgroundColor.includes('white') || styles.backgroundColor.includes('rgb(255, 255, 255)')) {
        addResult(page, 'Header Background', 'PASS', 'Header has white background');
    } else {
        addResult(page, 'Header Background', 'FAIL', `Header background is ${styles.backgroundColor}`);
    }
    
    // Test box shadow
    if (styles.boxShadow !== 'none') {
        addResult(page, 'Header Shadow', 'PASS', 'Header has box shadow');
    } else {
        addResult(page, 'Header Shadow', 'FAIL', 'Header missing box shadow');
    }
    
    // Test height
    const height = header.offsetHeight;
    if (height >= 60 && height <= 100) {
        addResult(page, 'Header Height', 'PASS', `Header height is ${height}px`);
    } else {
        addResult(page, 'Header Height', 'FAIL', `Header height is ${height}px, should be 60-100px`);
    }
}

function testBodySpacing(page) {
    const bodyStyles = window.getComputedStyle(document.body);
    const paddingTop = parseInt(bodyStyles.paddingTop);
    
    if (paddingTop >= 60) {
        addResult(page, 'Body Spacing', 'PASS', `Body padding-top is ${paddingTop}px`);
    } else {
        addResult(page, 'Body Spacing', 'FAIL', `Body padding-top is ${paddingTop}px, should be >= 60px`);
    }
}

function testResponsiveBehavior(page) {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (!hamburger || !navLinks) return;
    
    const hamburgerDisplay = window.getComputedStyle(hamburger).display;
    const navLinksDisplay = window.getComputedStyle(navLinks).display;
    const width = window.innerWidth;
    
    if (width <= 768) {
        // Mobile behavior
        if (hamburgerDisplay === 'block') {
            addResult(page, 'Mobile Hamburger', 'PASS', 'Hamburger visible on mobile');
        } else {
            addResult(page, 'Mobile Hamburger', 'FAIL', 'Hamburger should be visible on mobile');
        }
        
        if (navLinksDisplay === 'none') {
            addResult(page, 'Mobile Nav Links', 'PASS', 'Nav links hidden on mobile');
        } else {
            addResult(page, 'Mobile Nav Links', 'FAIL', 'Nav links should be hidden on mobile');
        }
    } else {
        // Desktop behavior
        if (hamburgerDisplay === 'none') {
            addResult(page, 'Desktop Hamburger', 'PASS', 'Hamburger hidden on desktop');
        } else {
            addResult(page, 'Desktop Hamburger', 'FAIL', 'Hamburger should be hidden on desktop');
        }
        
        if (navLinksDisplay === 'flex') {
            addResult(page, 'Desktop Nav Links', 'PASS', 'Nav links visible on desktop');
        } else {
            addResult(page, 'Desktop Nav Links', 'FAIL', 'Nav links should be visible on desktop');
        }
    }
}

function testProfessionalAppearance(page) {
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    const styles = window.getComputedStyle(header);
    
    // Test for professional color scheme
    const backgroundColor = styles.backgroundColor;
    if (backgroundColor.includes('white') || backgroundColor.includes('rgb(255, 255, 255)')) {
        addResult(page, 'Professional Colors', 'PASS', 'Header uses professional white background');
    } else {
        addResult(page, 'Professional Colors', 'FAIL', 'Header should use white background for professionalism');
    }
    
    // Test for proper spacing
    const padding = parseInt(styles.paddingLeft);
    if (padding >= 16) {
        addResult(page, 'Professional Spacing', 'PASS', 'Header has adequate padding');
    } else {
        addResult(page, 'Professional Spacing', 'FAIL', 'Header needs more padding for professional appearance');
    }
    
    // Test for clean typography
    const fontFamily = styles.fontFamily;
    if (fontFamily.includes('sans-serif') || fontFamily.includes('Inter') || fontFamily.includes('Montserrat')) {
        addResult(page, 'Professional Typography', 'PASS', 'Header uses professional font');
    } else {
        addResult(page, 'Professional Typography', 'FAIL', 'Header should use professional sans-serif font');
    }
}

function runPageTest(pageUrl) {
    return new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = pageUrl;
        
        iframe.onload = function() {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                
                // Test header structure
                testHeaderStructure(pageUrl);
                
                // Test header styling
                testHeaderStyling(pageUrl);
                
                // Test body spacing
                testBodySpacing(pageUrl);
                
                // Test responsive behavior
                testResponsiveBehavior(pageUrl);
                
                // Test professional appearance
                testProfessionalAppearance(pageUrl);
                
            } catch (error) {
                addResult(pageUrl, 'Page Load', 'FAIL', `Error loading page: ${error.message}`);
            }
            
            document.body.removeChild(iframe);
            resolve();
        };
        
        iframe.onerror = function() {
            addResult(pageUrl, 'Page Load', 'FAIL', 'Failed to load page');
            document.body.removeChild(iframe);
            resolve();
        };
        
        document.body.appendChild(iframe);
    });
}

async function runAllTests() {
    console.log('🚀 Starting comprehensive header tests...\n');
    
    for (const page of mainPages) {
        console.log(`\n📄 Testing ${page}...`);
        await runPageTest(page);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed} ✅`);
    console.log(`Failed: ${testResults.failed} ❌`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        testResults.details
            .filter(result => result.status === 'FAIL')
            .forEach(result => {
                console.log(`  - ${result.page}: ${result.test} - ${result.message}`);
            });
    }
    
    console.log('\n✅ PROFESSIONAL APPEARANCE CHECK:');
    const professionalTests = testResults.details.filter(result => 
        result.test.includes('Professional') || result.test.includes('Appearance')
    );
    professionalTests.forEach(result => {
        console.log(`  - ${result.page}: ${result.test} - ${result.message}`);
    });
}

// Run tests when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
} 