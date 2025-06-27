const express = require("express");
const router = express.Router();
const paypal = require("@paypal/checkout-server-sdk");

// PayPal client configuration
let environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
);
let client = new paypal.core.PayPalHttpClient(environment);

// Create PayPal order
router.post("/create-paypal-order", async (req, res) => {
    try {
        const { amount, currency = "USD", description } = req.body;

        // Create order request
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: amount
                },
                description: description
            }]
        });

        // Call PayPal API
        const order = await client.execute(request);

        // Return order ID to client
        res.json({
            id: order.result.id,
            status: order.result.status
        });
    } catch (error) {
        console.error("Error creating PayPal order:", error);
        res.status(500).json({
            error: "Failed to create PayPal order",
            details: error.message
        });
    }
});

// Capture PayPal payment
router.post("/capture-paypal-payment", async (req, res) => {
    try {
        const { orderId } = req.body;

        // Create capture request
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        // Call PayPal API
        const capture = await client.execute(request);

        // Return capture details
        res.json({
            id: capture.result.id,
            status: capture.result.status,
            amount: capture.result.purchase_units[0].payments.captures[0].amount.value,
            currency: capture.result.purchase_units[0].payments.captures[0].amount.currency_code
        });
    } catch (error) {
        console.error("Error capturing PayPal payment:", error);
        res.status(500).json({
            error: "Failed to capture PayPal payment",
            details: error.message
        });
    }
});

module.exports = router; 