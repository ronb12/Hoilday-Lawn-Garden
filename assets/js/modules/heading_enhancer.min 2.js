const fs = require('fs'),
  path = require('path');
class HeadingEnhancer {
  constructor() {
    this.htmlDir = '.';
  }
  async enhanceHeadings() {
    const e = this.findFiles(this.htmlDir, ['.html']);
    for (const n of e)
      try {
        let e = fs.readFileSync(n, 'utf8');
        (e = this.fixHeadingHierarchy(e)),
          (e = this.addMissingHeadings(e, n)),
          fs.writeFileSync(n, e);
      } catch (e) {}
  }
  fixHeadingHierarchy(e) {
    const n = e.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/g) || [];
    let t = 0,
      i = e;
    for (const e of n) {
      const n = parseInt(e.match(/<h([1-6])/)[1]);
      if (n <= t + 1) {
        t = n;
        continue;
      }
      const a = t + 1,
        s = e.replace(/<h[1-6]/, `<h${a}`);
      (i = i.replace(e, s)), (t = a);
    }
    return i;
  }
  addMissingHeadings(e, n) {
    const t = path.basename(n, '.html');
    if (!e.includes('<h1')) {
      const n = `<h1 class="main-heading">${this.getTitle(t)}</h1>`;
      e.includes('<main>')
        ? (e = e.replace('<main>', `<main>\n    ${n}`))
        : e.includes('<div class="content">') &&
          (e = e.replace('<div class="content">', `<div class="content">\n    ${n}`));
    }
    const i = e.match(/<section[^>]*>/g) || [];
    for (const n of i) {
      if (!e.substring(e.indexOf(n), e.indexOf('</section>', e.indexOf(n))).includes('<h2')) {
        const t = `<h2 class="section-heading">${this.getSectionTitle(n)}</h2>`;
        e = e.replace(n, `${n}\n    ${t}`);
      }
    }
    return e;
  }
  getTitle(e) {
    return (
      {
        index: 'Welcome to Holliday Lawn & Garden',
        about: 'About Holliday Lawn & Garden',
        services: 'Our Professional Services',
        contact: 'Contact Holliday Lawn & Garden',
        gallery: 'Our Work Gallery',
        login: 'Login to Your Account',
        register: 'Create Your Account',
        dashboard: 'Your Dashboard',
        profile: 'Your Profile',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
      }[e] || 'Holliday Lawn & Garden'
    );
  }
  getSectionTitle(e) {
    return (
      {
        hero: 'Professional Lawn Care Services',
        services: 'Our Services',
        about: 'About Us',
        testimonials: 'What Our Clients Say',
        contact: 'Get in Touch',
        gallery: 'Our Work',
        cta: 'Ready to Get Started?',
        footer: 'Contact Information',
      }[e.match(/class="([^"]*)"/)?.[1] || ''] || 'Section'
    );
  }
  findFiles(e, n) {
    let t = [];
    const i = fs.readdirSync(e);
    for (const a of i) {
      const i = path.join(e, a);
      fs.statSync(i).isDirectory()
        ? (t = t.concat(this.findFiles(i, n)))
        : n.some(e => a.endsWith(e)) && t.push(i);
    }
    return t;
  }
}
const enhancer = new HeadingEnhancer();
enhancer.enhanceHeadings();
export { HeadingEnhancer };
