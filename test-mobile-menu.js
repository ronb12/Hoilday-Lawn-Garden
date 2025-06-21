const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlDir = '.';

function getAllHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(filePath));
    } else if (file.endsWith('.html')) {
      results.push(filePath);
    }
  });
  return results;
}

function checkMobileMenu(html, file) {
  const $ = cheerio.load(html);
  const hamburger = $('.hamburger');
  const navLinks = $('.nav-links');
  const nav = $('#nav-menu, nav#nav-menu, nav');
  let result = { file, pass: true, issues: [] };

  if (hamburger.length === 0) {
    result.pass = false;
    result.issues.push('Missing .hamburger button');
  } else {
    // Check ARIA attributes
    if (!hamburger.attr('aria-label')) {
      result.pass = false;
      result.issues.push('Missing aria-label on .hamburger');
    }
    if (!hamburger.attr('aria-controls')) {
      result.pass = false;
      result.issues.push('Missing aria-controls on .hamburger');
    }
    if (!hamburger.attr('aria-expanded')) {
      result.pass = false;
      result.issues.push('Missing aria-expanded on .hamburger');
    }
  }

  if (navLinks.length === 0) {
    result.pass = false;
    result.issues.push('Missing .nav-links');
  }

  if (nav.length === 0) {
    result.pass = false;
    result.issues.push('Missing #nav-menu or nav#nav-menu');
  }

  // Check for mobile menu script
  const scripts = $('script').map((i, el) => $(el).attr('src') || $(el).html()).get().join(' ');
  if (!/hamburger|mobile[-_]menu|menu-open|aria-expanded/.test(scripts)) {
    result.pass = false;
    result.issues.push('No mobile menu JS found');
  }

  return result;
}

function main() {
  const files = getAllHtmlFiles(htmlDir);
  let results = [];
  let passCount = 0;
  let failCount = 0;

  files.forEach(file => {
    const html = fs.readFileSync(file, 'utf8');
    const res = checkMobileMenu(html, file);
    results.push(res);
    if (res.pass) passCount++;
    else failCount++;
  });

  console.log('MOBILE MENU TEST RESULTS');
  console.log('========================');
  results.forEach(res => {
    if (res.pass) {
      console.log(`✅ ${res.file}`);
    } else {
      console.log(`❌ ${res.file}`);
      res.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  });
  console.log('========================');
  console.log(`PASS: ${passCount}`);
  console.log(`FAIL: ${failCount}`);
  console.log(`SUCCESS RATE: ${(passCount / files.length * 100).toFixed(1)}%`);
}

main(); 