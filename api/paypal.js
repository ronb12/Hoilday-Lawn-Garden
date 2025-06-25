// Simple PayPal integration using already-loaded SDK
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

    // Check if PayPal SDK is available
    if (!window.paypal) {
        console.error('PayPal SDK not available');
        if (loading) {
            loading.style.display = 'none';
        }
        if (fallback) {
            fallback.style.display = 'block';
        }
        return;
    }

    console.log('PayPal SDK available, rendering buttons...');
    
    // Hide loading state
    if (loading) {
        loading.style.display = 'none';
    }
    
    window.paypal.Buttons({
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
        // Show fallback if rendering fails
        if (fallback) {
            fallback.style.display = 'block';
        }
    });
}

// Export functions for use in other scripts
window.PayPalIntegration = {
    renderPayPalButtons
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('PayPal integration script loaded');
    // The buttons will be rendered by the main page script
});
