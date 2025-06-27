const fs = require('fs');

// Files that need manifest.json reference added
const filesToFix = [
  '404.html',
  'error.html', 
  'sitemap.html',
  'testimonials 2.html',
  'testimonials.html'
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Fixing ${file}...`);
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace site.webmanifest with manifest.json
    content = content.replace(/href="\/site\.webmanifest"/g, 'href="/manifest.json"');
    
    // Add manifest.json if it doesn't exist
    if (!content.includes('manifest.json')) {
      // Find the favicon links and add manifest after them
      const faviconPattern = /<link href="[^"]*favicon[^"]*"[^>]*>/g;
      const matches = content.match(faviconPattern);
      if (matches && matches.length > 0) {
        const lastFavicon = matches[matches.length - 1];
        const manifestLink = lastFavicon.replace(/href="[^"]*"/, 'href="/manifest.json"').replace(/rel="[^"]*"/, 'rel="manifest"');
        content = content.replace(lastFavicon, lastFavicon + '\n' + manifestLink);
      }
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File ${file} not found`);
  }
});

console.log('Manifest.json references fixed!'); 