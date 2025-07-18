import { CONFIG } from './config.js';
import { ErrorHandler, handleError } from './error-handler.js';
function initializeUI() {
  const e = document.querySelector('.hamburger'),
    t = document.querySelector('.mobile-menu'),
    r = document.querySelector('.mobile-menu-close');
  e &&
    e.addEventListener('click', () => {
      t?.classList.add('active');
    }),
    r &&
      r.addEventListener('click', () => {
        t?.classList.remove('active');
      });
  const a = document.querySelector('.nav-links'),
    i = document.querySelectorAll('.nav-tab-header');
  a &&
    i.length > 0 &&
    (i.forEach(e => {
      const t = e.parentElement.querySelector('.nav-tab-content'),
        r = e.querySelector('.fa-chevron-down');
      e.setAttribute('role', 'tab'),
        e.setAttribute('aria-selected', 'false'),
        e.setAttribute('aria-expanded', 'false'),
        t.setAttribute('role', 'tabpanel'),
        t.setAttribute('aria-hidden', 'true'),
        e.addEventListener('click', () => {
          const a = e.classList.contains('active');
          i.forEach(e => {
            const t = e.parentElement.querySelector('.nav-tab-content'),
              r = e.querySelector('.fa-chevron-down');
            e.classList.remove('active'),
              e.setAttribute('aria-selected', 'false'),
              e.setAttribute('aria-expanded', 'false'),
              t.classList.remove('active'),
              t.setAttribute('aria-hidden', 'true'),
              r && (r.style.transform = 'rotate(0deg)');
          }),
            a ||
              (e.classList.add('active'),
              e.setAttribute('aria-selected', 'true'),
              e.setAttribute('aria-expanded', 'true'),
              t.classList.add('active'),
              t.setAttribute('aria-hidden', 'false'),
              r && (r.style.transform = 'rotate(180deg)'));
        }),
        e.addEventListener('keydown', t => {
          ('Enter' !== t.key && ' ' !== t.key) || (t.preventDefault(), e.click());
        });
    }),
    window.addEventListener('resize', () => {
      window.innerWidth > 768 &&
        i.forEach(e => {
          const t = e.parentElement.querySelector('.nav-tab-content'),
            r = e.querySelector('.fa-chevron-down');
          e.classList.remove('active'),
            e.setAttribute('aria-selected', 'false'),
            e.setAttribute('aria-expanded', 'false'),
            t.classList.remove('active'),
            t.setAttribute('aria-hidden', 'true'),
            r && (r.style.transform = 'rotate(0deg)');
        });
    }),
    document.addEventListener('keydown', e => {
      'Escape' === e.key &&
        i.forEach(e => {
          const t = e.parentElement.querySelector('.nav-tab-content'),
            r = e.querySelector('.fa-chevron-down');
          e.classList.remove('active'),
            e.setAttribute('aria-selected', 'false'),
            e.setAttribute('aria-expanded', 'false'),
            t.classList.remove('active'),
            t.setAttribute('aria-hidden', 'true'),
            r && (r.style.transform = 'rotate(0deg)');
        });
    }),
    document.addEventListener('click', e => {
      a.contains(e.target) ||
        i.forEach(e => {
          const t = e.parentElement.querySelector('.nav-tab-content'),
            r = e.querySelector('.fa-chevron-down');
          e.classList.remove('active'),
            e.setAttribute('aria-selected', 'false'),
            e.setAttribute('aria-expanded', 'false'),
            t.classList.remove('active'),
            t.setAttribute('aria-hidden', 'true'),
            r && (r.style.transform = 'rotate(0deg)');
        });
    })),
    document.querySelectorAll('a[href^="#"]').forEach(e => {
      e.addEventListener('click', function (e) {
        e.preventDefault();
        const t = document.querySelector(this.getAttribute('href'));
        t && t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
}
function setupEventListeners() {
  document.querySelectorAll('form').forEach(e => {
    e.addEventListener('submit', handleFormSubmit);
  });
  document.querySelectorAll('.nav-links a').forEach(e => {
    e.addEventListener('click', handleNavigation);
  });
}
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const e = './service-worker.js';
    navigator.serviceWorker
      .register(e)
      .then(e => {})
      .catch(e => {});
  }
}
function initializeFirebase() {
  try {
    if ('undefined' != typeof firebase) {
      firebase.auth(), firebase.firestore();
      firebase.analytics &&
        firebase
          .analytics()
          .logEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
          });
    }
  } catch (e) {}
}
function handleFormSubmit(e) {
  e.preventDefault();
  try {
    const t = e.target,
      r = new FormData(t),
      a = Object.fromEntries(r.entries());
    switch (t.id) {
      case 'contact-form':
        handleContactForm(a);
        break;
      case 'login-form':
        handleLoginForm(a);
        break;
      case 'payment-form':
        handlePaymentForm(a);
    }
  } catch (e) {
    ErrorHandler.handleError(e, 'Form Submission');
  }
}
function handleNavigation(e) {
  const t = e.currentTarget.getAttribute('href');
  document.body.classList.add('loading'),
    t && t.startsWith('/') && (e.preventDefault(), (window.location.href = t));
}
function initTabs() {
  const e = document.querySelectorAll('.tab-button'),
    t = document.querySelectorAll('.tab-content');
  e.forEach(r => {
    r.addEventListener('click', () => {
      const a = r.getAttribute('data-tab');
      e.forEach(e => e.classList.remove('active')),
        t.forEach(e => e.classList.remove('active')),
        r.classList.add('active'),
        document.getElementById(a).classList.add('active');
    });
  });
}
function initializeComponents() {
  'undefined' != typeof AOS && AOS.init(), initializeCustomComponents();
}
function initializeCustomComponents() {}
document.addEventListener('DOMContentLoaded', function () {
  try {
    initializeUI(), setupEventListeners(), registerServiceWorker(), initializeFirebase();
    const e = document.querySelector('.mobile-menu-close'),
      t = document.querySelector('.nav-links');
    e &&
      t &&
      e.addEventListener('click', function () {
        t.classList.remove('active'), document.body.classList.remove('menu-open');
      });
  } catch (e) {}
}),
  document.querySelector('.tabs') && initTabs();
export {
  initializeUI,
  setupEventListeners,
  registerServiceWorker,
  initializeFirebase,
  handleFormSubmit,
  handleNavigation,
};
export {
  initializeUI,
  setupEventListeners,
  registerServiceWorker,
  initializeFirebase,
  handleFormSubmit,
  handleNavigation,
  initTabs,
  initializeComponents,
  initializeCustomComponents,
};
