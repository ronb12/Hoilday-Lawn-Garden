const fs = require('fs'),
  path = require('path');
class ImageLoader {
  constructor() {
    this.htmlDir = '.';
  }
  async enhanceImages() {
    const e = this.findFiles(this.htmlDir, ['.html']);
    for (const t of e)
      try {
        let e = fs.readFileSync(t, 'utf8');
        (e = this.enhanceImageTags(e)), (e = this.addPreloadHints(e)), fs.writeFileSync(t, e);
      } catch (e) {}
  }
  enhanceImageTags(e) {
    return e.replace(/<img([^>]*)>/g, (e, t) => {
      t.includes('loading=') || (t += ' loading="lazy"');
      const a = t.match(/src="([^"]*)"/);
      if (a) {
        return `\n          <picture>\n            <source srcset="${a[1].replace(/\.(jpg|jpeg|png)$/, '.webp')}" type="image/webp">\n            <img${t}>\n          </picture>`;
      }
      return `<img${t}>`;
    });
  }
  addPreloadHints(e) {
    const t = (e.match(/<img[^>]*class="[^"]*hero[^"]*"[^>]*>/g) || [])
      .map(e => {
        const t = e.match(/src="([^"]*)"/);
        if (t) {
          const e = t[1];
          return `\n    <link rel="preload" as="image" href="${e.replace(/\.(jpg|jpeg|png)$/, '.webp')}" type="image/webp">\n    <link rel="preload" as="image" href="${e}" type="image/${this.getImageType(e)}">`;
        }
        return '';
      })
      .join('');
    return e.replace(/<head>/, `<head>${t}`);
  }
  getImageType(e) {
    switch (path.extname(e).toLowerCase()) {
      case '.jpg':
      case '.jpeg':
        return 'jpeg';
      case '.png':
        return 'png';
      default:
        return 'image';
    }
  }
  findFiles(e, t) {
    let a = [];
    const n = fs.readdirSync(e);
    for (const r of n) {
      const n = path.join(e, r);
      fs.statSync(n).isDirectory()
        ? (a = a.concat(this.findFiles(n, t)))
        : t.some(e => r.endsWith(e)) && a.push(n);
    }
    return a;
  }
}
const loader = new ImageLoader();
loader.enhanceImages();
