// Service Cache Implementation
const CACHE_NAME = 'holliday-services-v3';
const SERVICES_KEY = 'cached-services-v3';

// Service data structure
const services = {
  'lawn-maintenance': {
    id: 'lawn-maintenance',
    title: 'Lawn Maintenance',
    icon: 'fas fa-leaf',
    description: 'Professional lawn care services to keep your yard looking its best year-round.',
    features: [
      'Regular mowing and edging',
      'Fertilization and weed control',
      'Leaf removal and cleanup',
      'Seasonal maintenance'
    ]
  },
  'landscaping': {
    id: 'landscaping',
    title: 'Landscaping',
    icon: 'fas fa-tree',
    description: 'Transform your outdoor space with our expert landscaping services.',
    features: [
      'Custom landscape design',
      'Plant installation',
      'Hardscaping',
      'Irrigation systems'
    ]
  },
  'garden-care': {
    id: 'garden-care',
    title: 'Garden Care',
    icon: 'fas fa-seedling',
    description: 'Specialized care for your garden to ensure healthy, beautiful plants.',
    features: [
      'Garden maintenance',
      'Plant health care',
      'Seasonal planting',
      'Garden design'
    ]
  }
};

// Initialize service cache
async function initializeServiceCache() {
  try {
    // Clear old cache versions
    const oldKeys = Object.keys(localStorage).filter(key => key.startsWith('cached-services-'));
    oldKeys.forEach(key => localStorage.removeItem(key));
    
    // Store services in localStorage for offline access
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
    console.log('Service cache initialized successfully');
  } catch (error) {
    console.error('Error initializing service cache:', error);
  }
}

// Get all services
function getAllServices() {
  try {
    const cachedServices = localStorage.getItem(SERVICES_KEY);
    if (!cachedServices) {
      // If no cache exists, initialize it
      initializeServiceCache();
      return services;
    }
    return JSON.parse(cachedServices);
  } catch (error) {
    console.error('Error retrieving services:', error);
    return services;
  }
}

// Get a specific service by ID
function getServiceById(serviceId) {
  try {
    const cachedServices = getAllServices();
    return cachedServices[serviceId] || null;
  } catch (error) {
    console.error('Error retrieving service:', error);
    return null;
  }
}

// Update service cache
async function updateServiceCache(newServices) {
  try {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(newServices));
    console.log('Service cache updated successfully');
  } catch (error) {
    console.error('Error updating service cache:', error);
  }
}

// Clear service cache
async function clearServiceCache() {
  try {
    // Clear all service-related caches
    const oldKeys = Object.keys(localStorage).filter(key => key.startsWith('cached-services-'));
    oldKeys.forEach(key => localStorage.removeItem(key));
    
    // Clear service worker cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    console.log('Service cache cleared successfully');
  } catch (error) {
    console.error('Error clearing service cache:', error);
  }
}

// Initialize cache when the script loads
initializeServiceCache();

// Export functions for use in other modules
export {
  getAllServices,
  getServiceById,
  updateServiceCache,
  clearServiceCache
}; 