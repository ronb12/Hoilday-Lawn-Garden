// Test script to verify mobile tab bar functionality
console.log('Testing mobile tab bar on pay-your-bill page...');

// Check if mobile tab bar element exists
const mobileTabBar = document.querySelector('.mobile-tab-bar');
if (mobileTabBar) {
    console.log('✅ Mobile tab bar element found');
    console.log('Mobile tab bar display style:', window.getComputedStyle(mobileTabBar).display);
    console.log('Mobile tab bar position:', window.getComputedStyle(mobileTabBar).position);
    console.log('Mobile tab bar z-index:', window.getComputedStyle(mobileTabBar).zIndex);
} else {
    console.log('❌ Mobile tab bar element not found');
}

// Check if we're on mobile viewport
const isMobile = window.innerWidth <= 768;
console.log('Viewport width:', window.innerWidth);
console.log('Is mobile viewport:', isMobile);

// Check mobile tab bar links
const mobileTabLinks = document.querySelectorAll('.mobile-tab-bar a');
console.log('Number of mobile tab links:', mobileTabLinks.length);

mobileTabLinks.forEach((link, index) => {
    console.log(`Link ${index + 1}:`, {
        href: link.getAttribute('href'),
        text: link.textContent.trim(),
        isActive: link.classList.contains('active')
    });
});

// Test responsive behavior
function testResponsive() {
    const mobileTabBar = document.querySelector('.mobile-tab-bar');
    if (mobileTabBar) {
        const display = window.getComputedStyle(mobileTabBar).display;
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile && display === 'flex') {
            console.log('✅ Mobile tab bar correctly shown on mobile');
        } else if (!isMobile && display === 'none') {
            console.log('✅ Mobile tab bar correctly hidden on desktop');
        } else {
            console.log('❌ Mobile tab bar display issue:', {
                isMobile,
                display,
                expected: isMobile ? 'flex' : 'none'
            });
        }
    }
}

// Run test on load and resize
testResponsive();
window.addEventListener('resize', testResponsive);

console.log('Mobile tab bar test completed'); 