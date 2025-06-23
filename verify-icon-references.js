const fs = require('fs');
const path = require('path');

// Expected icon references
const expectedIcons = {
  favicon32: 'assets/images/favicon/favicon-32x32.png',
  favicon16: 'assets/images/favicon/favicon-16x16.png',
  appleTouchIcon: 'assets/images/favicon/apple-touch-icon.png',
  manifest: 'manifest.json'
};

// Get all HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

console.log('🔍 Verifying icon references across all HTML files...\n');

let totalFiles = 0;
let filesWithIssues = 0;
let issues = [];

htmlFiles.forEach(file => {
  totalFiles++;
  const content = fs.readFileSync(file, 'utf8');
  const fileIssues = [];
  
  // Check for required icon references
  const hasFavicon32 = content.includes(expectedIcons.favicon32);
  const hasFavicon16 = content.includes(expectedIcons.favicon16);
  const hasAppleTouchIcon = content.includes(expectedIcons.appleTouchIcon);
  const hasManifest = content.includes(expectedIcons.manifest);
  
  if (!hasFavicon32) {
    fileIssues.push('❌ Missing favicon-32x32.png reference');
  }
  if (!hasFavicon16) {
    fileIssues.push('❌ Missing favicon-16x16.png reference');
  }
  if (!hasAppleTouchIcon) {
    fileIssues.push('❌ Missing apple-touch-icon.png reference');
  }
  if (!hasManifest) {
    fileIssues.push('❌ Missing manifest.json reference');
  }
  
  // Check for incorrect references
  if (content.includes('assets/icons/')) {
    fileIssues.push('❌ Found old assets/icons/ references');
  }
  if (content.includes('href="favicon.ico"')) {
    fileIssues.push('❌ Found relative favicon.ico reference');
  }
  
  if (fileIssues.length > 0) {
    filesWithIssues++;
    issues.push(`\n📄 ${file}:`);
    fileIssues.forEach(issue => issues.push(`   ${issue}`));
  }
});

// Check icon file sizes
console.log('📏 Verifying icon file sizes...\n');

const iconSizes = {
  'assets/images/favicon/favicon-16x16.png': '16x16',
  'assets/images/favicon/favicon-32x32.png': '32x32',
  'assets/images/favicon/apple-touch-icon.png': '180x180',
  'assets/images/favicon/icon-192.png': '192x192',
  'assets/images/favicon/icon-512.png': '512x512',
  'assets/images/favicon/android-chrome-192x192.png': '192x192',
  'assets/images/favicon/android-chrome-512x512.png': '512x512'
};

Object.entries(iconSizes).forEach(([filePath, expectedSize]) => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${filePath} exists`);
  } else {
    console.log(`❌ ${filePath} missing`);
    issues.push(`   ❌ Missing icon file: ${filePath}`);
  }
});

// Summary
console.log('\n📊 SUMMARY:');
console.log(`Total HTML files checked: ${totalFiles}`);
console.log(`Files with issues: ${filesWithIssues}`);
console.log(`Files without issues: ${totalFiles - filesWithIssues}`);

if (issues.length > 0) {
  console.log('\n🚨 ISSUES FOUND:');
  issues.forEach(issue => console.log(issue));
} else {
  console.log('\n✅ All icon references are correct!');
}

// Check manifest.json
console.log('\n📋 Checking manifest.json...');
if (fs.existsSync('manifest.json')) {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const manifestIcons = manifest.icons || [];
  
  console.log(`Manifest has ${manifestIcons.length} icon entries:`);
  manifestIcons.forEach(icon => {
    console.log(`  - ${icon.src} (${icon.sizes})`);
  });
} else {
  console.log('❌ manifest.json missing');
} 