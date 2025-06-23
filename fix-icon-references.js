const fs = require('fs');
const path = require('path');

// Standard icon references to use
const standardIcons = {
  favicon: 'assets/images/favicon/favicon-32x32.png',
  favicon16: 'assets/images/favicon/favicon-16x16.png',
  favicon32: 'assets/images/favicon/favicon-32x32.png',
  appleTouchIcon: 'assets/images/favicon/apple-touch-icon.png',
  icon192: 'assets/images/favicon/icon-192.png',
  icon512: 'assets/images/favicon/icon-512.png',
  manifest: 'manifest.json'
};

// Get all HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

htmlFiles.forEach(file => {
  console.log(`Processing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Replace various icon reference patterns
  const patterns = [
    // Replace assets/icons/ references with assets/images/favicon/
    {
      regex: /href="assets\/icons\/([^"]+)"/g,
      replacement: (match, iconName) => {
        const mapping = {
          'favicon-32x32.png': standardIcons.favicon32,
          'favicon-16x16.png': standardIcons.favicon16,
          'apple-touch-icon.png': standardIcons.appleTouchIcon,
          'icon-192.png': standardIcons.icon192,
          'icon-512.png': standardIcons.icon512,
          'favicon.ico': 'assets/images/favicon/favicon.ico'
        };
        return `href="${mapping[iconName] || standardIcons.favicon32}"`;
      }
    },
    // Replace relative favicon.ico references
    {
      regex: /href="favicon\.ico"/g,
      replacement: 'href="assets/images/favicon/favicon.ico"'
    },
    // Replace manifest.json references
    {
      regex: /href="manifest\.json"/g,
      replacement: 'href="manifest.json"'
    },
    // Replace site.webmanifest references
    {
      regex: /href="site\.webmanifest"/g,
      replacement: 'href="manifest.json"'
    }
  ];

  patterns.forEach(pattern => {
    const newContent = content.replace(pattern.regex, pattern.replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  // Add missing icon references if they don't exist
  const hasFavicon32 = content.includes('favicon-32x32.png');
  const hasFavicon16 = content.includes('favicon-16x16.png');
  const hasAppleTouchIcon = content.includes('apple-touch-icon');
  const hasManifest = content.includes('manifest.json') || content.includes('site.webmanifest');

  if (!hasFavicon32 || !hasFavicon16 || !hasAppleTouchIcon || !hasManifest) {
    // Find the head tag and add missing icons
    const headMatch = content.match(/<head[^>]*>/);
    if (headMatch) {
      const headEnd = content.indexOf('</head>');
      if (headEnd !== -1) {
        let iconLinks = '';
        
        if (!hasFavicon32) {
          iconLinks += `\n    <link href="${standardIcons.favicon32}" rel="icon" sizes="32x32" type="image/png"/>`;
        }
        if (!hasFavicon16) {
          iconLinks += `\n    <link href="${standardIcons.favicon16}" rel="icon" sizes="16x16" type="image/png"/>`;
        }
        if (!hasAppleTouchIcon) {
          iconLinks += `\n    <link href="${standardIcons.appleTouchIcon}" rel="apple-touch-icon" sizes="180x180"/>`;
        }
        if (!hasManifest) {
          iconLinks += `\n    <link href="${standardIcons.manifest}" rel="manifest"/>`;
        }

        if (iconLinks) {
          content = content.slice(0, headEnd) + iconLinks + '\n' + content.slice(headEnd);
          modified = true;
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`No changes needed for ${file}`);
  }
});

console.log('Icon reference standardization complete!'); 