class ErrorHandler {
  constructor() {
    (this.notificationContainer = this.createNotificationContainer()),
      this.setupGlobalErrorHandling();
  }
  createNotificationContainer() {
    const n = document.createElement('div');
    return (n.className = 'notification-container'), document.body.appendChild(n), n;
  }
  setupGlobalErrorHandling() {
    window.addEventListener('error', n => {
      this.handleError(n.error || new Error(n.message));
    }),
      window.addEventListener('unhandledrejection', n => {
        this.handleError(n.reason);
      });
  }
  handleError(n) {
    this.showNotification(n.message || 'An unexpected error occurred', 'error');
  }
  showNotification(n, i = 'info', o = 5e3) {
    const t = document.createElement('div');
    (t.className = `notification notification-${i} slide-in`),
      (t.innerHTML = `\n      <div class="notification-content">\n        <i class="notification-icon ${this.getIconClass(i)}"></i>\n        <span class="notification-message">${n}</span>\n      </div>\n      <button class="notification-close" aria-label="Close notification">&times;</button>\n    `),
      this.notificationContainer.appendChild(t);
    return (
      t.querySelector('.notification-close').addEventListener('click', () => {
        this.closeNotification(t);
      }),
      o > 0 &&
        setTimeout(() => {
          this.closeNotification(t);
        }, o),
      t
    );
  }
  closeNotification(n) {
    n.classList.add('fade-out'),
      n.addEventListener('animationend', () => {
        n.remove();
      });
  }
  getIconClass(n) {
    const i = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle',
    };
    return i[n] || i.info;
  }
  success(n, i) {
    return this.showNotification(n, 'success', i);
  }
  error(n, i) {
    return this.showNotification(n, 'error', i);
  }
  warning(n, i) {
    return this.showNotification(n, 'warning', i);
  }
  info(n, i) {
    return this.showNotification(n, 'info', i);
  }
}
const style = document.createElement('style');
(style.textContent =
  '\n  .notification-container {\n    position: fixed;\n    top: 20px;\n    right: 20px;\n    z-index: 9999;\n    display: flex;\n    flex-direction: column;\n    gap: 10px;\n    max-width: 350px;\n  }\n\n  .notification {\n    background: white;\n    border-radius: 4px;\n    box-shadow: 0 2px 5px rgba(0,0,0,0.2);\n    padding: 12px 16px;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    animation: slideIn 0.3s ease-out;\n  }\n\n  .notification-content {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n  }\n\n  .notification-icon {\n    font-size: 1.25rem;\n  }\n\n  .notification-success {\n    border-left: 4px solid #4CAF50;\n  }\n\n  .notification-success .notification-icon {\n    color: #4CAF50;\n  }\n\n  .notification-error {\n    border-left: 4px solid #dc3545;\n  }\n\n  .notification-error .notification-icon {\n    color: #dc3545;\n  }\n\n  .notification-warning {\n    border-left: 4px solid #ffc107;\n  }\n\n  .notification-warning .notification-icon {\n    color: #ffc107;\n  }\n\n  .notification-info {\n    border-left: 4px solid #17a2b8;\n  }\n\n  .notification-info .notification-icon {\n    color: #17a2b8;\n  }\n\n  .notification-close {\n    background: none;\n    border: none;\n    color: #6c757d;\n    cursor: pointer;\n    font-size: 1.25rem;\n    padding: 0;\n    margin-left: 12px;\n  }\n\n  .notification-close:hover {\n    color: #343a40;\n  }\n\n  .fade-out {\n    animation: fadeOut 0.3s ease-in forwards;\n  }\n\n  @keyframes fadeOut {\n    from {\n      opacity: 1;\n      transform: translateX(0);\n    }\n    to {\n      opacity: 0;\n      transform: translateX(100%);\n    }\n  }\n\n  @media (max-width: 768px) {\n    .notification-container {\n      left: 20px;\n      right: 20px;\n      max-width: none;\n    }\n  }\n'),
  document.head.appendChild(style);
const errorHandler = new ErrorHandler();
export { ErrorHandler };
