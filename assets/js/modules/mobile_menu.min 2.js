document.addEventListener('DOMContentLoaded', () => {
  const e = document.querySelector('.hamburger'),
    t = document.querySelector('.main-header nav'),
    s = document.querySelectorAll('.nav-links a'),
    c = document.body;
  e.addEventListener('click', () => {
    t.classList.toggle('active'),
      e.classList.toggle('active'),
      (c.style.overflow = t.classList.contains('active') ? 'hidden' : '');
  }),
    s.forEach(s => {
      s.addEventListener('click', () => {
        t.classList.remove('active'), e.classList.remove('active'), (c.style.overflow = '');
      });
    }),
    document.addEventListener('click', s => {
      t.contains(s.target) ||
        e.contains(s.target) ||
        (t.classList.remove('active'), e.classList.remove('active'), (c.style.overflow = ''));
    }),
    window.addEventListener('resize', () => {
      window.innerWidth > 900 &&
        t.classList.contains('active') &&
        (t.classList.remove('active'), e.classList.remove('active'), (c.style.overflow = ''));
    });
});
export {};
