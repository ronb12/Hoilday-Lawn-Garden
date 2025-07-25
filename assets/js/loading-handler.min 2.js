class LoadingHandler {
  constructor() {
    (this.overlay = document.getElementById('loading-overlay')),
      (this.message = document.getElementById('loading-message')),
      this.initializeEventListeners();
  }
  initializeEventListeners() {
    document.querySelectorAll('.form-with-loading').forEach(e => {
      e.addEventListener('submit', i => {
        this.showLoading('Processing form...'), e.classList.add('loading');
      });
    }),
      document.querySelectorAll('.button-with-loading').forEach(e => {
        e.addEventListener('click', i => {
          e.closest('form') || (this.showLoading('Processing...'), e.classList.add('loading'));
        });
      }),
      document.querySelectorAll('.link-with-loading').forEach(e => {
        e.addEventListener('click', i => {
          this.showLoading('Loading page...'), e.classList.add('loading');
        });
      }),
      window.addEventListener('load', () => {
        this.hideLoading();
      }),
      window.addEventListener('beforeunload', () => {
        this.showLoading('Saving changes...');
      });
  }
  showLoading(e = 'Loading...') {
    this.overlay &&
      ((this.overlay.style.display = 'flex'), this.message && (this.message.textContent = e));
  }
  hideLoading() {
    this.overlay && (this.overlay.style.display = 'none'),
      document.querySelectorAll('.loading').forEach(e => {
        e.classList.remove('loading');
      });
  }
  setLoadingMessage(e) {
    this.message && (this.message.textContent = e);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  window.loadingHandler = new LoadingHandler();
});
