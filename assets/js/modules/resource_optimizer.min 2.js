const fs = require('fs'),
  path = require('path');
class ResourceOptimizer {
  constructor() {
    this.htmlDir = '.';
  }
  async optimizeResources() {
    const e = this.findFiles(this.htmlDir, ['.html']);
    for (const t of e)
      try {
        let e = fs.readFileSync(t, 'utf8');
        (e = this.addResourceHints(e)),
          (e = this.optimizeScriptLoading(e)),
          (e = this.optimizeStyleLoading(e)),
          fs.writeFileSync(t, e);
      } catch (e) {}
  }
  addResourceHints(e) {
    const t = [
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      '<link rel="dns-prefetch" href="https://fonts.googleapis.com">',
      '<link rel="dns-prefetch" href="https://fonts.gstatic.com">',
      '<link rel="preconnect" href="https://cdn.jsdelivr.net">',
      '<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">',
    ].join('\n    ');
    return e.replace(/<head>/, `<head>\n    ${t}`);
  }
  optimizeScriptLoading(e) {
    return e.replace(/<script([^>]*)>/g, (e, t) =>
      t.includes('async') || t.includes('defer') || t.includes('critical')
        ? e
        : `<script${t} defer>`
    );
  }
  optimizeStyleLoading(e) {
    return e.replace(/<link[^>]*rel="stylesheet"[^>]*>/g, e => {
      if (e.includes('critical')) {
        const t = e.match(/href="([^"]*)"/);
        if (t) {
          return `\n    <link rel="preload" href="${t[1]}" as="style">\n    ${e}`;
        }
      }
      return e;
    });
  }
  findFiles(e, t) {
    let i = [];
    const r = fs.readdirSync(e);
    for (const s of r) {
      const r = path.join(e, s);
      fs.statSync(r).isDirectory()
        ? (i = i.concat(this.findFiles(r, t)))
        : t.some(e => s.endsWith(e)) && i.push(r);
    }
    return i;
  }
}
const optimizer = new ResourceOptimizer();
optimizer.optimizeResources();
export { ResourceOptimizer };
