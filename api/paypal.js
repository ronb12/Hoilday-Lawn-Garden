// Client-side PayPal integration
// This file handles PayPal button rendering and payment processing in the browser

// PayPal SDK loading
function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
        // Check if PayPal SDK is already loaded
        if (window.paypal) {
            resolve(window.paypal);
            return;
        }

        // Load PayPal SDK
        const script = document.createElement('script');
        script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD';
        script.onload = () => {
            if (window.paypal) {
                resolve(window.paypal);
            } else {
                reject(new Error('PayPal SDK failed to load'));
            }
        };
        script.onerror = () => {
            reject(new Error('Failed to load PayPal SDK'));
        };
        document.head.appendChild(script);
    });
}

// Initialize PayPal
async function initializePayPal() {
    try {
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

// Render PayPal buttons
function renderPayPalButtons(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('PayPal container not found:', containerId);
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Initialize PayPal
    initializePayPal().then(paypal => {
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
                return actions.order.capture().then(function(details) {
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
                    const amountDisplay = document.getElementById('amount-display');
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
        }).render(container);
    }).catch(error => {
        console.error('Failed to initialize PayPal:', error);
        container.innerHTML = '<p class="error">PayPal is currently unavailable. Please try again later or contact us for assistance.</p>';
    });
}

// Export functions for use in other scripts
window.PayPalIntegration = {
    initializePayPal,
    createPayPalOrder,
    capturePayPalPayment,
    renderPayPalButtons
};