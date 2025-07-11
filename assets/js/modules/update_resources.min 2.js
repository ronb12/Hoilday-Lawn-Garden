const fs = require('fs'),
  path = require('path');
class ResourceUpdater {
  constructor() {
    this.htmlDir = '.';
  }
  async updateResources() {
    const e = this.findFiles(this.htmlDir, ['.html']);
    for (const s of e)
      try {
        let e = fs.readFileSync(s, 'utf8');
        (e = this.updateCSSLinks(e)),
          (e = this.updateJSSources(e)),
          (e = this.updateImageSources(e)),
          (e = this.addResourceHints(e)),
          fs.writeFileSync(s, e);
      } catch (e) {}
  }
  updateCSSLinks(e) {
    return e.replace(/<link[^>]*href="([^"]*\.css)"[^>]*>/g, (e, s) => {
      if (s.includes('.min.css')) return e;
      const t = s.replace('.css', '.min.css');
      return e.replace(s, t);
    });
  }
  updateJSSources(e) {
    return e.replace(/<script[^>]*src="([^"]*\.js)"[^>]*>/g, (e, s) => {
      if (s.includes('.min.js')) return e;
      const t = s.replace('.js', '.min.js');
      return e.replace(s, t);
    });
  }
  updateImageSources(e) {
    return e.replace(/<img[^>]*src="([^"]*\.(jpg|jpeg|png))"[^>]*>/g, (e, s) => {
      const t = s.replace(/\.(jpg|jpeg|png)$/, '.webp');
      return e.replace(s, t);
    });
  }
  addResourceHints(e) {
    const s = [
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      '<link rel="dns-prefetch" href="https://fonts.googleapis.com">',
      '<link rel="dns-prefetch" href="https://fonts.gstatic.com">',
    ].join('\n    ');
    return e.replace(/<head>/, `<head>\n    ${s}`);
  }
  findFiles(e, s) {
    let t = [];
    const r = fs.readdirSync(e);
    for (const c of r) {
      const r = path.join(e, c);
      fs.statSync(r).isDirectory()
        ? (t = t.concat(this.findFiles(r, s)))
        : s.some(e => c.endsWith(e)) && t.push(r);
    }
    return t;
  }
}
const updater = new ResourceUpdater();
updater.updateResources();
export { ResourceUpdater };
