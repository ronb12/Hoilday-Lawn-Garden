// Manual Hamburger Menu Test Script
// Run this in the browser console on any page to test hamburger menu functionality

console.log('🍔 Manual Hamburger Menu Test Starting...');

function testHamburgerMenu() {
    const results = {
        hamburgerButton: false,
        hamburgerCSS: false,
        mobileResponsive: false,
        javascriptFunctionality: false,
        issues: []
    };
    
    // Test 1: Check if hamburger button exists
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        results.hamburgerButton = true;
        console.log('✅ Hamburger button found');
    } else {
        results.issues.push('Hamburger button not found');
        console.log('❌ Hamburger button not found');
    }
    
    // Test 2: Check hamburger CSS
    const hamburgerCSS = document.querySelector('style');
    if (hamburgerCSS && hamburgerCSS.textContent.includes('.hamburger {')) {
        results.hamburgerCSS = true;
        console.log('✅ Hamburger CSS found');
    } else {
        results.issues.push('Hamburger CSS not found');
        console.log('❌ Hamburger CSS not found');
    }
    
    // Test 3: Check mobile responsive CSS
    if (hamburgerCSS && hamburgerCSS.textContent.includes('@media') && hamburgerCSS.textContent.includes('hamburger') && hamburgerCSS.textContent.includes('display: block')) {
        results.mobileResponsive = true;
        console.log('✅ Mobile responsive CSS found');
    } else {
        results.issues.push('Mobile responsive CSS not found');
        console.log('❌ Mobile responsive CSS not found');
    }
    
    // Test 4: Check JavaScript functionality
    const scripts = document.querySelectorAll('script');
    let hasHamburgerJS = false;
    scripts.forEach(script => {
        if (script.textContent.includes('hamburger') && script.textContent.includes('addEventListener')) {
            hasHamburgerJS = true;
        }
    });
    
    if (hasHamburgerJS) {
        results.javascriptFunctionality = true;
        console.log('✅ Hamburger JavaScript found');
    } else {
        results.issues.push('Hamburger JavaScript not found');
        console.log('❌ Hamburger JavaScript not found');
    }
    
    // Test 5: Check current display state
    if (hamburger) {
        const display = window.getComputedStyle(hamburger).display;
        const width = window.innerWidth;
        console.log(`📱 Current window width: ${width}px`);
        console.log(`🍔 Hamburger display: ${display}`);
        
        if (width <= 768 && display === 'block') {
            console.log('✅ Hamburger correctly visible on mobile');
        } else if (width > 768 && display === 'none') {
            console.log('✅ Hamburger correctly hidden on desktop');
        } else {
            console.log('⚠️ Hamburger display may not be correct for current screen size');
        }
    }
    
    // Test 6: Check nav-links structure
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        console.log('✅ Nav-links found');
        const links = navLinks.querySelectorAll('a');
        console.log(`📋 Found ${links.length} navigation links`);
    } else {
        results.issues.push('Nav-links not found');
        console.log('❌ Nav-links not found');
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log(`Hamburger Button: ${results.hamburgerButton ? '✅' : '❌'}`);
    console.log(`Hamburger CSS: ${results.hamburgerCSS ? '✅' : '❌'}`);
    console.log(`Mobile Responsive: ${results.mobileResponsive ? '✅' : '❌'}`);
    console.log(`JavaScript Functionality: ${results.javascriptFunctionality ? '✅' : '❌'}`);
    
    if (results.issues.length > 0) {
        console.log('\n❌ ISSUES FOUND:');
        results.issues.forEach(issue => console.log(`- ${issue}`));
    } else {
        console.log('\n🎉 All tests passed! Hamburger menu should be working correctly.');
    }
    
    return results;
}

// Test click functionality
function testHamburgerClick() {
    console.log('\n🖱️ Testing Hamburger Click Functionality...');
    
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (!hamburger || !navLinks) {
        console.log('❌ Cannot test click - hamburger or nav-links not found');
        return;
    }
    
    // Check initial state
    const initialDisplay = window.getComputedStyle(navLinks).display;
    const initialActive = navLinks.classList.contains('active');
    console.log(`Initial state - Display: ${initialDisplay}, Active class: ${initialActive}`);
    
    // Simulate click
    console.log('🖱️ Clicking hamburger button...');
    hamburger.click();
    
    // Check state after click
    setTimeout(() => {
        const afterDisplay = window.getComputedStyle(navLinks).display;
        const afterActive = navLinks.classList.contains('active');
        console.log(`After click - Display: ${afterDisplay}, Active class: ${afterActive}`);
        
        if (afterDisplay === 'flex' || afterActive) {
            console.log('✅ Hamburger click successfully toggled menu');
        } else {
            console.log('❌ Hamburger click did not toggle menu');
        }
    }, 100);
}

// Run tests
console.log('🔍 Running hamburger menu tests...');
const testResults = testHamburgerMenu();

// If hamburger exists, test click functionality
if (testResults.hamburgerButton) {
    setTimeout(testHamburgerClick, 1000);
}

console.log('\n💡 To test manually:');
console.log('1. Resize browser window to mobile size (<768px)');
console.log('2. Check if hamburger menu appears');
console.log('3. Click hamburger to toggle menu');
console.log('4. Test clicking outside to close');
console.log('5. Test pressing Escape key to close'); 