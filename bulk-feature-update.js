const fs = require('fs-extra');

// --- Bulk update for customer-dashboard.html ---
const dashboardPath = 'customer-dashboard.html';
let dashboardHtml = fs.readFileSync(dashboardPath, 'utf8');

// Add PayPal button to payment modal if not present
if (!dashboardHtml.includes('paypal-button-container')) {
  dashboardHtml = dashboardHtml.replace(
    /<button type="submit" class="action-button">Schedule Payment<\/button>/,
    `$&\n              <div id="paypal-button-container" style="margin-top:1rem;"></div>`
  );
}

// Add emergency request and feedback form to messages section if not present
if (!dashboardHtml.includes('handleEmergencyRequest')) {
  dashboardHtml = dashboardHtml.replace(
    /(<section id="messages"[\s\S]*?<div class="feature-header">[\s\S]*?New Message[\s\S]*?<\/button>)/,
    `$1\n            <button class="action-button" style="background:#c62828;" onclick="handleEmergencyRequest()">\n              <i class="fas fa-exclamation-triangle"></i> Emergency Request\n            </button>`
  );
}
if (!dashboardHtml.includes('feedback-container')) {
  dashboardHtml = dashboardHtml.replace(
    /(<div id="messages-container">[\s\S]*?<\/div>)/,
    `$1\n          <div id="feedback-container" style="margin-top:2rem;">\n            <h3>Submit Feedback</h3>\n            <form id="feedbackForm" onsubmit="handleFeedbackSubmit(event)">\n              <div class="form-group">\n                <label for="feedbackText">Feedback</label>\n                <textarea id="feedbackText" required></textarea>\n              </div>\n              <div class="form-group">\n                <label for="serviceRating">Rating</label>\n                <select id="serviceRating" required>\n                  <option value="5">5 - Excellent</option>\n                  <option value="4">4 - Good</option>\n                  <option value="3">3 - Average</option>\n                  <option value="2">2 - Poor</option>\n                  <option value="1">1 - Terrible</option>\n                </select>\n              </div>\n              <button type="submit" class="action-button">Submit Feedback</button>\n            </form>\n          </div>`
  );
}

// Add PayPal SDK and new scripts before </body>
if (!dashboardHtml.includes('paypal.com/sdk/js')) {
  dashboardHtml = dashboardHtml.replace(
    /(<\/body>)/,
    `<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>\n<script>\n  function renderPayPalButton(amount) {\n    if (!window.paypal) return;\n    paypal.Buttons({\n      createOrder: function(data, actions) {\n        return actions.order.create({\n          purchase_units: [{ amount: { value: amount } }]\n        });\n      },\n      onApprove: function(data, actions) {\n        return actions.order.capture().then(function(details) {\n          window.paymentManager.handlePayPalSuccess(details);\n          showNotification('PayPal payment successful!', 'success');\n        });\n      }\n    }).render('#paypal-button-container');\n  }\n  function showPaymentModal() {\n    document.getElementById('paymentModal').style.display = 'block';\n    setTimeout(() => {\n      const amount = document.getElementById('paymentAmount').value || '10.00';\n      renderPayPalButton(amount);\n    }, 500);\n  }\n  function handleEmergencyRequest() {\n    window.communicationSystem.sendEmergencyRequest();\n    showNotification('Emergency request sent!', 'info');\n  }\n  async function handleFeedbackSubmit(event) {\n    event.preventDefault();\n    const feedback = document.getElementById('feedbackText').value;\n    const rating = document.getElementById('serviceRating').value;\n    await window.communicationSystem.submitFeedback({ feedback, rating });\n    showNotification('Feedback submitted!', 'success');\n    document.getElementById('feedbackForm').reset();\n  }\n</script>\n$1`
  );
}

fs.writeFileSync(dashboardPath, dashboardHtml, 'utf8');

// --- Bulk update for assets/js/enhanced-dashboard.js ---
const jsPath = 'assets/js/enhanced-dashboard.js';
let jsCode = fs.readFileSync(jsPath, 'utf8');

// Add PayPal handler to PaymentManager if not present
if (!jsCode.includes('handlePayPalSuccess')) {
  jsCode = jsCode.replace(
    /class PaymentManager \{([\s\S]*?)\n\}/,
    (match, body) =>
      `class PaymentManager {${body}
  async handlePayPalSuccess(details) {
    if (!this.currentUser) return;
    await addDoc(collection(db, 'payments'), {
      userId: this.currentUser.uid,
      amount: details.purchase_units[0].amount.value,
      method: 'paypal',
      status: 'completed',
      transactionId: details.id,
      payer: details.payer,
      date: serverTimestamp()
    });
    this.loadPayments();
  }
}`
  );
}

// Add emergency and feedback to CommunicationSystem if not present
if (!jsCode.includes('sendEmergencyRequest')) {
  jsCode = jsCode.replace(
    /class CommunicationSystem \{([\s\S]*?)\n\}/,
    (match, body) =>
      `class CommunicationSystem {${body}
  async sendEmergencyRequest() {
    if (!this.currentUser) return;
    await addDoc(collection(db, 'emergency_requests'), {
      userId: this.currentUser.uid,
      timestamp: serverTimestamp(),
      status: 'pending'
    });
  }
  async submitFeedback({ feedback, rating }) {
    if (!this.currentUser) return;
    await addDoc(collection(db, 'feedback'), {
      userId: this.currentUser.uid,
      feedback,
      rating: parseInt(rating),
      timestamp: serverTimestamp()
    });
  }
}`
  );
}

fs.writeFileSync(jsPath, jsCode, 'utf8');

console.log('Bulk feature update complete!'); 