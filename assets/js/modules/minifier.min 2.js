const fs = require('fs'),
  path = require('path'),
  CleanCSS = require('clean-css'),
  Terser = require('terser');
class Minifier {
  constructor() {
    (this.cssDir = 'assets/styles'), (this.jsDir = 'assets/js');
  }
  async minifyAll() {
    await this.minifyCSS(), await this.minifyJS();
  }
  async minifyCSS() {
    const i = this.findFiles(this.cssDir, ['.css']);
    for (const s of i)
      try {
        const i = fs.readFileSync(s, 'utf8'),
          t = new CleanCSS({ level: 2, format: 'keep-breaks' }).minify(i),
          e = this.getMinPath(s);
        fs.writeFileSync(e, t.styles);
      } catch (i) {}
  }
  async minifyJS() {
    const i = this.findFiles(this.jsDir, ['.js']);
    for (const s of i)
      try {
        const i = fs.readFileSync(s, 'utf8'),
          t = await Terser.minify(i, { compress: !0, mangle: !0, format: { comments: !1 } }),
          e = this.getMinPath(s);
        fs.writeFileSync(e, t.code);
      } catch (i) {}
  }
  getMinPath(i) {
    const s = path.dirname(i),
      t = path.extname(i),
      e = path.basename(i, t);
    return path.join(s, `${e}.min${t}`);
  }
  findFiles(i, s) {
    let t = [];
    const e = fs.readdirSync(i);
    for (const n of e) {
      const e = path.join(i, n);
      fs.statSync(e).isDirectory()
        ? (t = t.concat(this.findFiles(e, s)))
        : s.some(i => n.endsWith(i)) && !n.includes('.min.') && t.push(e);
    }
    return t;
  }
}
const minifier = new Minifier();
minifier.minifyAll();
export { Minifier };
