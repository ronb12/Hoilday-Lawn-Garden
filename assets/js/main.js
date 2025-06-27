// Tab functionality
document.addEventListener('DOMContentLoaded', function () {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      // Add active class to clicked button
      button.classList.add('active');

      // Show corresponding tab pane
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
});

// Clear cache and reload
function clearCacheAndReload() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.active.postMessage('CLEAR_CACHE');
    });
  }
  // Force reload from server
  window.location.reload(true);
}

// Handle PWA installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', e => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  console.log('✅ PWA install prompt ready');

  // Create and show the install button
  createInstallButton();
});

// Handle successful installation
window.addEventListener('appinstalled', (evt) => {
  console.log('✅ App was successfully installed');
  // Hide the install button
  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.style.display = 'none';
  }
  // Clear the deferredPrompt
  deferredPrompt = null;
});

// Create the install button
function createInstallButton() {
  // Remove existing install button if it exists
  const existingBtn = document.getElementById('installBtn');
  if (existingBtn) {
    existingBtn.remove();
  }

  // Check if we're on mobile
  const isMobile = window.innerWidth <= 768;
  
  // Check if we're on the index page
  const isIndexPage = window.location.pathname.endsWith('index.html') || 
                     window.location.pathname.endsWith('/') || 
                     window.location.pathname === '';
  
  // Only show install button on mobile and index page
  if (!isMobile || !isIndexPage) {
    return;
  }

  // Create the install button
  const installBtn = document.createElement('button');
  installBtn.id = 'installBtn';
  installBtn.className = 'pwa-install-button';
  installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
  installBtn.title = 'Install Holliday\'s Lawn & Garden App';
  
  // Add styles to the button - positioned at top for mobile
  installBtn.style.cssText = `
    position: fixed;
    top: 90px;
    left: 50%;
    transform: translateX(-50%);
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    font-family: 'Montserrat', sans-serif;
    max-width: 200px;
    white-space: nowrap;
  `;

  // Add hover effect
  installBtn.addEventListener('mouseenter', () => {
    installBtn.style.background = '#45a049';
    installBtn.style.transform = 'translateX(-50%) translateY(-1px)';
    installBtn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
  });

  installBtn.addEventListener('mouseleave', () => {
    installBtn.style.background = '#4caf50';
    installBtn.style.transform = 'translateX(-50%) translateY(0)';
    installBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  });

  // Handle install button click
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      // Show user-friendly message
      showNotification('App is already installed or not available for installation', 'info');
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      console.log('Install prompt shown');

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome === 'accepted' ? '✅ Installed' : '❌ Dismissed'} the app`);

      if (outcome === 'accepted') {
        showNotification('App installed successfully! You can now access it from your home screen.', 'success');
      }

      // Hide the button after user choice
      installBtn.style.display = 'none';

      // Clear the deferredPrompt
      deferredPrompt = null;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      showNotification('Failed to install app. Please try again.', 'error');
    }
  });

  // Add the button to the body
  document.body.appendChild(installBtn);

  // Auto-hide the button after 10 seconds if not clicked (shorter for mobile)
  setTimeout(() => {
    if (installBtn && installBtn.style.display !== 'none') {
      installBtn.style.opacity = '0.7';
      installBtn.style.transform = 'translateX(-50%) scale(0.95)';
    }
  }, 10000);
}

// Show notification function
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existingNotification = document.getElementById('pwa-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'pwa-notification';
  notification.textContent = message;
  
  const colors = {
    success: '#4caf50',
    error: '#f44336',
    info: '#2196f3'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10001;
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize Firebase
function initializeFirebaseDB() {
  return new Promise((resolve, reject) => {
    try {
      if (window.firebaseConfig) {
        // Firebase is already initialized
        resolve();
      } else {
        reject(new Error('Firebase configuration not found'));
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();

      try {
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        // Add timestamp
        data.timestamp = new Date().toISOString();

        // Save to Firestore
        await window.db.collection('contact-submissions').add(data);

        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Sorry, there was an error submitting your message. Please try again.');
      }
    });
  }
});
