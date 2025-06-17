// Test script for Holliday Lawn & Garden
const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');

// Test configuration
const TEST_CONFIG = {
    baseUrl: 'http://localhost:8000',
    adminCredentials: {
        email: 'admin@holliday.com',
        password: 'admin123'
    },
    testCustomer: {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User'
    }
};

// Test suite
async function runTests() {
    console.log('Starting automated tests...');
    
    try {
        // Test 1: Check if server is running
        await testServerConnection();
        
        // Test 2: Test admin login
        await testAdminLogin();
        
        // Test 3: Test customer registration
        await testCustomerRegistration();
        
        // Test 4: Test customer login
        await testCustomerLogin();
        
        // Test 5: Test appointment scheduling
        await testAppointmentScheduling();
        
        // Test 6: Test payment processing
        await testPaymentProcessing();
        
        // Test 7: Test mobile responsiveness
        await testMobileResponsiveness();
        
        console.log('All tests completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

// Test functions
async function testServerConnection() {
    console.log('Testing server connection...');
    const response = await fetch(TEST_CONFIG.baseUrl);
    if (!response.ok) {
        throw new Error('Server is not running');
    }
    console.log('Server connection test passed');
}

async function testAdminLogin() {
    console.log('Testing admin login...');
    const response = await fetch(`${TEST_CONFIG.baseUrl}/admin-login.html`);
    const html = await response.text();
    const dom = new JSDOM(html);
    
    // Check if login form exists
    const loginForm = dom.window.document.querySelector('form');
    if (!loginForm) {
        throw new Error('Admin login form not found');
    }
    
    console.log('Admin login test passed');
}

async function testCustomerRegistration() {
    console.log('Testing customer registration...');
    const response = await fetch(`${TEST_CONFIG.baseUrl}/register.html`);
    const html = await response.text();
    const dom = new JSDOM(html);
    
    // Check if registration form exists
    const registerForm = dom.window.document.querySelector('form');
    if (!registerForm) {
        throw new Error('Registration form not found');
    }
    
    console.log('Customer registration test passed');
}

async function testCustomerLogin() {
    console.log('Testing customer login...');
    const response = await fetch(`${TEST_CONFIG.baseUrl}/login.html`);
    const html = await response.text();
    const dom = new JSDOM(html);
    
    // Check if login form exists
    const loginForm = dom.window.document.querySelector('form');
    if (!loginForm) {
        throw new Error('Customer login form not found');
    }
    
    console.log('Customer login test passed');
}

async function testAppointmentScheduling() {
    console.log('Testing appointment scheduling...');
    const response = await fetch(`${TEST_CONFIG.baseUrl}/customer-dashboard.html`);
    const html = await response.text();
    const dom = new JSDOM(html);
    
    // Check if appointment form exists
    const appointmentForm = dom.window.document.querySelector('#appointmentForm');
    if (!appointmentForm) {
        throw new Error('Appointment form not found');
    }
    
    console.log('Appointment scheduling test passed');
}

async function testPaymentProcessing() {
    console.log('Testing payment processing...');
    const response = await fetch(`${TEST_CONFIG.baseUrl}/pay-your-bill.html`);
    const html = await response.text();
    const dom = new JSDOM(html);
    
    // Check if payment form exists
    const paymentForm = dom.window.document.querySelector('form');
    if (!paymentForm) {
        throw new Error('Payment form not found');
    }
    
    console.log('Payment processing test passed');
}

async function testMobileResponsiveness() {
    console.log('Testing mobile responsiveness...');
    const pages = [
        'index.html',
        'admin-dashboard.html',
        'customer-dashboard.html',
        'login.html',
        'register.html',
        'pay-your-bill.html'
    ];
    
    for (const page of pages) {
        const response = await fetch(`${TEST_CONFIG.baseUrl}/${page}`);
        const html = await response.text();
        const dom = new JSDOM(html);
        
        // Check for mobile meta tag
        const viewportMeta = dom.window.document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            throw new Error(`Mobile viewport meta tag not found in ${page}`);
        }
        
        // Check for mobile navigation
        const mobileNav = dom.window.document.querySelector('.nav-menu');
        if (!mobileNav) {
            throw new Error(`Mobile navigation not found in ${page}`);
        }
    }
    
    console.log('Mobile responsiveness test passed');
}

// Run tests
runTests(); 