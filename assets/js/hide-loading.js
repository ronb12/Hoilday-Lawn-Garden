// Simple script to hide loading elements on admin pages
// This prevents the "Loading..." messages from showing when users navigate to admin pages

console.log("Hide loading script loaded");

// Function to hide all loading elements
function hideAllLoadingElements() {
    // Hide loading overlays
    const loadingOverlays = document.querySelectorAll('[id*="loading"]');
    loadingOverlays.forEach(element => {
        if (element.style) {
            element.style.display = 'none';
            console.log("Hidden loading element:", element.id);
        }
    });
    
    // Hide elements with loading class
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => {
        if (element.style) {
            element.style.display = 'none';
            console.log("Hidden loading element with class:", element.className);
        }
    });
    
    // Show table elements that should be visible
    const tables = document.querySelectorAll('table[id*="table"]');
    tables.forEach(table => {
        if (table.style) {
            table.style.display = 'table';
            console.log("Showed table:", table.id);
        }
    });
}

// Run immediately when script loads
hideAllLoadingElements();

// Also run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideAllLoadingElements);
} else {
    hideAllLoadingElements();
}

// Run again after a short delay to catch any dynamically added elements
setTimeout(hideAllLoadingElements, 100);
setTimeout(hideAllLoadingElements, 500);
setTimeout(hideAllLoadingElements, 1000);
