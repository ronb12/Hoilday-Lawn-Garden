const fs = require('fs');
const path = require('path');

// Loading CSS to ensure proper loading overlay styling
const loadingCSS = `
    /* Loading Overlay Styles */
    .loading {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(255, 255, 255, 0.95) !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      z-index: 9999 !important;
      transition: opacity 0.3s ease, visibility 0.3s ease !important;
    }
    
    .loading.hidden {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    
    .spinner {
      width: 50px !important;
      height: 50px !important;
      border: 4px solid #f3f3f3 !important;
      border-top: 4px solid #2e7d32 !important;
      border-radius: 50% !important;
      animation: spin 1s linear infinite !important;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Error Message Styles */
    .error-message {
      display: none !important;
      position: fixed !important;
      top: 20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background: #f44336 !important;
      color: white !important;
      padding: 1rem 2rem !important;
      border-radius: 4px !important;
      z-index: 10000 !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
    }
    
    .error-message.show {
      display: block !important;
    }`;

// Enhanced loading JavaScript
const loadingJS = `
  <script>
    // Enhanced loading management
    (function() {
      var loading = document.getElementById('loading');
      var error = document.getElementById('error');
      
      // Hide loading after page load
      function hideLoading() {
        if (loading) {
          loading.classList.add('hidden');
          setTimeout(function() {
            loading.style.display = 'none';
          }, 300);
        }
      }
      
      // Show error message
      function showError(message) {
        if (error) {
          error.textContent = message;
          error.classList.add('show');
          setTimeout(function() {
            error.classList.remove('show');
          }, 5000);
        }
      }
      
      // Hide loading when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideLoading);
      } else {
        hideLoading();
      }
      
      // Hide loading when window loads
      window.addEventListener('load', hideLoading);
      
      // Fallback: hide loading after 3 seconds
      setTimeout(hideLoading, 3000);
      
      // Handle errors
      window.addEventListener('error', function(e) {
        console.error('Page error:', e.error);
        showError('An error occurred while loading the page. Please refresh.');
      });
    })();
  </script>`;

// Get all HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

console.log(`🔧 Fixing loading issues across ${htmlFiles.length} HTML files...\n`);

let filesUpdated = 0;
let filesSkipped = 0;

htmlFiles.forEach(file => {
  console.log(`Processing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Add loading CSS if not present
  if (!content.includes('Loading Overlay Styles') || !content.includes('.loading {')) {
    // Find the last </style> tag and add our CSS before it
    const lastStyleIndex = content.lastIndexOf('</style>');
    if (lastStyleIndex !== -1) {
      content = content.slice(0, lastStyleIndex) + loadingCSS + '\n  ' + content.slice(lastStyleIndex);
      modified = true;
      console.log(`  ✅ Added loading CSS`);
    }
  }

  // Replace or add enhanced loading JavaScript
  const loadingScriptPattern = /<script>\s*window\.addEventListener\('load',\s*function\(\)\s*\{\s*var loading = document\.getElementById\('loading'\);\s*if \(loading\) loading\.style\.display = 'none';\s*\}\);\s*<\/script>/;
  
  if (loadingScriptPattern.test(content)) {
    content = content.replace(loadingScriptPattern, loadingJS);
    modified = true;
    console.log(`  ✅ Enhanced loading JavaScript`);
  } else if (!content.includes('Enhanced loading management')) {
    // Add loading JavaScript before closing body tag
    const bodyCloseIndex = content.lastIndexOf('</body>');
    if (bodyCloseIndex !== -1) {
      content = content.slice(0, bodyCloseIndex) + loadingJS + '\n' + content.slice(bodyCloseIndex);
      modified = true;
      console.log(`  ✅ Added loading JavaScript`);
    }
  }

  // Ensure loading overlay exists
  if (!content.includes('id="loading"')) {
    // Add loading overlay after body tag
    const bodyIndex = content.indexOf('<body>');
    if (bodyIndex !== -1) {
      const loadingHTML = `
  <!-- Loading & Error Validation -->
  <div id="loading" class="loading" role="status" aria-label="Loading page content">
    <div class="spinner" aria-hidden="true"></div>
  </div>
  <div id="error" class="error-message" role="alert" aria-live="polite"></div>`;
      content = content.slice(0, bodyIndex + 7) + loadingHTML + content.slice(bodyIndex + 7);
      modified = true;
      console.log(`  ✅ Added loading overlay HTML`);
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    filesUpdated++;
    console.log(`  ✅ Updated ${file}`);
  } else {
    console.log(`  ⏭️  No changes needed for ${file}`);
    filesSkipped++;
  }
});

console.log(`\n📊 LOADING ISSUE FIX SUMMARY:`);
console.log(`Files updated: ${filesUpdated}`);
console.log(`Files skipped: ${filesSkipped}`);
console.log(`Total files processed: ${htmlFiles.length}`);

if (filesUpdated > 0) {
  console.log(`\n✅ Loading issues fixed across ${filesUpdated} pages!`);
  console.log(`🎯 All pages now feature:`);
  console.log(`   • Proper loading overlay styling`);
  console.log(`   • Enhanced loading JavaScript with fallbacks`);
  console.log(`   • Error handling and display`);
  console.log(`   • Smooth loading transitions`);
  console.log(`   • Multiple loading completion triggers`);
} else {
  console.log(`\n✅ All loading mechanisms already working properly!`);
} 