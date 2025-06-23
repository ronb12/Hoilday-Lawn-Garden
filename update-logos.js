const fs = require('fs');
const path = require('path');

// Function to update logo references in a file
function updateLogoInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Replace old logo references with optimized versions
    if (content.includes('hollidays-logo.webp')) {
      content = content.replace(
        /<source srcset="assets\/images\/hollidays-logo\.webp"/g,
        '<source srcset="assets/images/hollidays-logo.optimized-1280.webp"'
      );
      content = content.replace(
        /<img[^>]*src="assets\/images\/hollidays-logo\.webp"/g,
        '<img src="assets/images/hollidays-logo.optimized-1280.png"'
      );
      updated = true;
    }
    
    if (content.includes('hollidays-logo.png') && !content.includes('optimized')) {
      content = content.replace(
        /<img[^>]*src="assets\/images\/hollidays-logo\.png"/g,
        '<img src="assets/images/hollidays-logo.optimized-1280.png"'
      );
      updated = true;
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated logo in ${filePath}`);
    } else {
      console.log(`- ${filePath} - Already using optimized logo`);
    }
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
  }
}

function main() {
  const htmlFiles = fs.readdirSync('.')
    .filter(file => file.endsWith('.html'))
    .filter(file => !file.includes('.backup'))
    .filter(file => !file.includes('.final_backup'));

  console.log('Updating logo references in HTML files...\n');
  
  htmlFiles.forEach(file => {
    updateLogoInFile(file);
  });
  
  console.log('\nLogo update completed!');
}

main(); 