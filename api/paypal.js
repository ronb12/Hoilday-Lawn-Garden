// Client-side PayPal integration
// This file handles PayPal button rendering and payment processing in the browser

// PayPal SDK loading with improved error handling
function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
        // Check if PayPal SDK is already loaded
        if (window.paypal) {
            console.log('PayPal SDK already loaded');
            resolve(window.paypal);
            return;
        }

        console.log('Loading PayPal SDK...');
        
        // Load PayPal SDK with test client ID
        const script = document.createElement('script');
        script.src = 'https://www.paypal.com/sdk/js?client-id=test&currency=USD&components=buttons,funding-eligibility&disable-funding=venmo,paylater';
        script.async = true;
        
        script.onload = () => {
            console.log('PayPal SDK script loaded');
            // Wait a bit for PayPal to initialize
            setTimeout(() => {
                if (window.paypal) {
                    console.log('PayPal SDK initialized successfully');
                    resolve(window.paypal);
                } else {
                    console.error('PayPal SDK not available after script load');
                    reject(new Error('PayPal SDK failed to initialize'));
                }
            }, 500);
        };
        
        script.onerror = () => {
            console.error('Failed to load PayPal SDK script');
            reject(new Error('Failed to load PayPal SDK'));
        };
        
        document.head.appendChild(script);
    });
}

// Initialize PayPal with better error handling
async function initializePayPal() {
    try {
        console.log('Initializing PayPal...');
        const paypal = await loadPayPalSDK();
        console.log('PayPal SDK loaded successfully');
        return paypal;
    } catch (error) {
        console.error('Error loading PayPal SDK:', error);
        throw error;
    }
}

// Create PayPal order (client-side)
async function createPayPalOrder(amount, accountNumber) {
    try {
        // In a real implementation, you would make an API call to your server
        // to create the order securely. For now, we'll use a mock implementation.
        
        // Validate inputs
        if (!amount || amount <= 0) {
            throw new Error('Invalid amount');
        }
        
        if (!accountNumber) {
            throw new Error('Account number is required');
        }

        // Mock order creation - in production, this should call your server
        const orderId = 'mock-order-' + Date.now();
        
        return {
            id: orderId,
            status: 'CREATED'
        };
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        throw error;
    }
}

// Capture PayPal payment (client-side)
async function capturePayPalPayment(orderId) {
    try {
        // In a real implementation, you would make an API call to your server
        // to capture the payment securely. For now, we'll use a mock implementation.
        
        // Mock payment capture - in production, this should call your server
        return {
            id: 'mock-capture-' + Date.now(),
            status: 'COMPLETED',
            amount: {
                value: '10.00',
                currency_code: 'USD'
            },
            payer: {
                name: {
                    given_name: 'Test',
                    surname: 'User'
                }
            }
        };
    } catch (error) {
        console.error('Error capturing PayPal payment:', error);
        throw error;
    }
}

// Render PayPal buttons with improved error handling
function renderPayPalButtons(containerId, options = {}) {
    const container = document.getElementById(containerId);
    const loading = document.getElementById('paypal-loading');
    const fallback = document.getElementById('paypal-fallback');
    
    if (!container) {
        console.error('PayPal container not found:', containerId);
        return;
    }

    console.log('Starting PayPal button rendering...');

    // Show loading state
    if (loading) {
        loading.style.display = 'block';
    }
    if (fallback) {
        fallback.style.display = 'none';
    }

    // Initialize PayPal with retry logic
    let retryCount = 0;
    const maxRetries = 2; // Reduced retries for faster fallback

    function attemptPayPalInit() {
        console.log('Attempting PayPal initialization (attempt ' + (retryCount + 1) + ')');
        
        initializePayPal().then(paypal => {
            console.log('PayPal SDK loaded, rendering buttons...');
            
            // Hide loading state
            if (loading) {
                loading.style.display = 'none';
            }
            
            paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal'
                },
                createOrder: function(data, actions) {
                    const amount = options.amount || document.getElementById('paymentAmount')?.value || '10.00';
                    const account = options.account || document.getElementById('accountNumber')?.value || '';

                    // Validate inputs
                    if (!amount || amount <= 0) {
                        alert('Please enter a valid amount.');
                        return;
                    }

                    if (!account) {
                        alert('Please enter your account number.');
                        return;
                    }

                    console.log('Creating PayPal order for amount:', amount, 'account:', account);

                    // Create order using PayPal's client-side API
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: amount,
                            },
                            description: `Payment for account ${account}`,
                        }],
                    });
                },
                onApprove: function(data, actions) {
                    console.log('PayPal order approved, capturing payment...');
                    return actions.order.capture().then(function(details) {
                        console.log('Payment captured successfully:', details);
                        
                        // Show success message
                        const successMessage = `
Payment completed successfully!

Transaction ID: ${details.id}
Payer: ${details.payer.name.given_name} ${details.payer.name.surname}
Amount: $${details.purchase_units[0].amount.value}
Account: ${document.getElementById('accountNumber')?.value || 'N/A'}

Thank you for your payment!
`;
                        alert(successMessage);

                        // Reset form if it exists
                        const form = document.getElementById('payment-form');
                        if (form) {
                            form.reset();
                        }

                        // Hide amount display if it exists
                        const amountDisplay = document.getElementById('amountDisplay');
                        if (amountDisplay) {
                            amountDisplay.style.display = 'none';
                        }

                        // Call success callback if provided
                        if (options.onSuccess) {
                            options.onSuccess(details);
                        }
                    });
                },
                onError: function(err) {
                    console.error('PayPal Error:', err);
                    alert('An error occurred during payment. Please try again or contact us for assistance.');
                    
                    // Call error callback if provided
                    if (options.onError) {
                        options.onError(err);
                    }
                },
            }).render(container).then(() => {
                console.log('PayPal buttons rendered successfully');
            }).catch((error) => {
                console.error('Error rendering PayPal buttons:', error);
                // Hide loading and show fallback
                if (loading) {
                    loading.style.display = 'none';
                }
                if (fallback) {
                    fallback.style.display = 'block';
                }
            });
        }).catch(error => {
            console.error('Failed to initialize PayPal (attempt ' + (retryCount + 1) + '):', error);
            retryCount++;
            
            if (retryCount < maxRetries) {
                // Retry after a shorter delay
                console.log('Retrying PayPal initialization in ' + (500 * retryCount) + 'ms...');
                setTimeout(attemptPayPalInit, 500 * retryCount);
            } else {
                console.log('PayPal failed to load after ' + maxRetries + ' attempts, showing fallback');
                // Hide loading and show fallback message
                if (loading) {
                    loading.style.display = 'none';
                }
                if (fallback) {
                    fallback.style.display = 'block';
                }
            }
        });
    }

    // Start the initialization process
    attemptPayPalInit();
}

// Export functions for use in other scripts
window.PayPalIntegration = {
    initializePayPal,
    createPayPalOrder,
    capturePayPalPayment,
    renderPayPalButtons
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('PayPal integration script loaded');
    // The buttons will be rendered by the main page script
});