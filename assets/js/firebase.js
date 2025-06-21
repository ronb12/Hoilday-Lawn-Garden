// Firebase utility functions
export function showError(error) {
  console.error('Firebase error:', error);
  let message = 'An error occurred';
  
  if (error.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'User not found';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'Email already in use';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'permission-denied':
        message = 'Permission denied';
        break;
      default:
        message = error.message || 'An error occurred';
    }
  } else {
    message = error.message || 'An error occurred';
  }
  
  showNotification(message, 'error');
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
