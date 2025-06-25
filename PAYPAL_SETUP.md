# PayPal Integration Setup

This document explains how to set up PayPal integration for the Holliday Lawn & Garden website.

## Files Overview

### Client-Side Files
- `api/paypal.js` - Client-side PayPal integration for browser use
- `pay-your-bill.html` - Payment page that uses the PayPal integration

### Server-Side Files
- `api/paypal-server.js` - Server-side PayPal API endpoints
- `server.js` - Express server that serves the PayPal API

## Setup Instructions

### 1. PayPal Developer Account
1. Create a PayPal Developer account at https://developer.paypal.com/
2. Create a new app to get your Client ID and Client Secret
3. Choose between Sandbox (testing) and Live (production) environment

### 2. Environment Variables
Create a `.env` file in the root directory with your PayPal credentials:

```env
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
```

### 3. Update Client ID in paypal.js
In `api/paypal.js`, replace `YOUR_PAYPAL_CLIENT_ID` with your actual PayPal Client ID:

```javascript
script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_ACTUAL_CLIENT_ID&currency=USD';
```

### 4. Install Dependencies
If you haven't already, install the required Node.js packages:

```bash
npm install express cors dotenv @paypal/checkout-server-sdk
```

### 5. Start the Server
Run the server to enable PayPal API endpoints:

```bash
node server.js
```

## How It Works

### Client-Side Flow
1. User visits `pay-your-bill.html`
2. The page loads the PayPal SDK from PayPal's CDN
3. PayPal buttons are rendered in the `#paypal-button-container`
4. When user clicks PayPal button:
   - Order is created using PayPal's client-side API
   - User is redirected to PayPal for payment
   - After payment, user returns and payment is captured
   - Success/error messages are displayed

### Server-Side Flow (Optional)
For enhanced security, you can use the server-side endpoints:
- `POST /api/create-paypal-order` - Creates a PayPal order
- `POST /api/capture-paypal-payment` - Captures a completed payment

## Testing

### Sandbox Testing
1. Use PayPal Sandbox environment for testing
2. Use PayPal Sandbox test accounts for payments
3. Test both successful and failed payment scenarios

### Production
1. Switch to PayPal Live environment
2. Update Client ID and Secret to production values
3. Test with real PayPal accounts

## Security Considerations

1. **Never expose Client Secret in client-side code**
2. **Use HTTPS in production**
3. **Validate all input data**
4. **Implement proper error handling**
5. **Store payment records securely**

## Troubleshooting

### Common Issues

1. **"require is not defined" error**
   - This was fixed by separating client-side and server-side code
   - Client-side code now uses browser-compatible JavaScript

2. **PayPal buttons not loading**
   - Check if PayPal SDK is loading correctly
   - Verify Client ID is correct
   - Check browser console for errors

3. **Payment not processing**
   - Verify PayPal account is properly configured
   - Check server logs for API errors
   - Ensure environment variables are set correctly

## Support

For PayPal-specific issues, refer to:
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Checkout SDK](https://developer.paypal.com/docs/checkout/)
- [PayPal Support](https://www.paypal.com/support/) 