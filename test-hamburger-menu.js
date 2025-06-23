// Test script to verify hamburger menu functionality
console.log('Testing hamburger menu functionality...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, testing hamburger menu...');
    
    // Get elements
    const hamburger = document.querySelector('.hamburger');
    const nav = document.getElementById('nav-menu');
    const navLinks = document.querySelector('.nav-links');
    
    console.log('Hamburger element:', hamburger);
    console.log('Nav menu element:', nav);
    console.log('Nav links element:', navLinks);
    
    if (!hamburger || !nav || !navLinks) {
        console.error('Missing required elements for hamburger menu');
        return;
    }
    
    // Test initial state
    console.log('Initial hamburger display:', window.getComputedStyle(hamburger).display);
    console.log('Initial nav-links display:', window.getComputedStyle(navLinks).display);
    
    // Test click functionality
    console.log('Testing hamburger click...');
    hamburger.click();
    
    setTimeout(() => {
        console.log('After click - hamburger active class:', hamburger.classList.contains('active'));
        console.log('After click - nav-links active class:', navLinks.classList.contains('active'));
        console.log('After click - nav-links display:', window.getComputedStyle(navLinks).display);
        
        // Test second click to close
        console.log('Testing second click to close...');
        hamburger.click();
        
        setTimeout(() => {
            console.log('After second click - hamburger active class:', hamburger.classList.contains('active'));
            console.log('After second click - nav-links active class:', navLinks.classList.contains('active'));
            console.log('After second click - nav-links display:', window.getComputedStyle(navLinks).display);
            
            console.log('Hamburger menu test completed!');
        }, 100);
    }, 100);
});

// Test responsive behavior
function testResponsive() {
    const width = window.innerWidth;
    console.log('Current window width:', width);
    
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        const display = window.getComputedStyle(hamburger).display;
        console.log('Hamburger display at', width, 'px:', display);
        
        if (width <= 768) {
            if (display === 'block') {
                console.log('✅ Hamburger menu correctly visible on mobile');
            } else {
                console.log('❌ Hamburger menu should be visible on mobile');
            }
        } else {
            if (display === 'none') {
                console.log('✅ Hamburger menu correctly hidden on desktop');
            } else {
                console.log('❌ Hamburger menu should be hidden on desktop');
            }
        }
    }
}

// Test on load and resize
window.addEventListener('load', testResponsive);
window.addEventListener('resize', testResponsive); 