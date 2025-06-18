// Service Cache Implementation
const CACHE_VERSION = 'v7';
const SERVICES_KEY = 'cached-services-' + CACHE_VERSION;

// Service data structure
const services = {
  'lawn-maintenance': {
    id: 'lawn-maintenance',
    title: 'Lawn Maintenance',
    icon: '🌱',
    description: 'Keep your lawn looking its best with our comprehensive maintenance services.',
    features: [
      'Regular mowing and edging',
      'Lawn fertilization',
      'Weed control',
      'Leaf removal',
      'Seasonal clean-up'
    ]
  },
  'landscaping': {
    id: 'landscaping',
    title: 'Landscaping',
    icon: '🏡',
    description: 'Transform your outdoor space with our professional landscaping services.',
    features: [
      'Custom landscape design',
      'Garden installation',
      'Hardscaping',
      'Mulching',
      'Plant selection and installation'
    ]
  },
  'garden-care': {
    id: 'garden-care',
    title: 'Garden Care',
    icon: '🌸',
    description: 'Expert care for your garden to ensure healthy, beautiful plants year-round.',
    features: [
      'Garden maintenance',
      'Plant care and pruning',
      'Flower bed maintenance',
      'Seasonal planting',
      'Garden clean-up'
    ]
  },
  'commercial': {
    id: 'commercial',
    title: 'Commercial Services',
    icon: '🏢',
    description: 'Professional landscaping and maintenance solutions for businesses and commercial properties.',
    features: [
      'Commercial property maintenance',
      'Business landscape design',
      'Regular maintenance schedules',
      'Seasonal commercial services',
      'Property enhancement'
    ]
  },
  'pressure-washing': {
    id: 'pressure-washing',
    title: 'Pressure Washing',
    icon: '🚿',
    description: 'Restore the beauty of your property with our professional pressure washing services.',
    features: [
      'House washing',
      'Driveway and sidewalk cleaning',
      'Deck and patio cleaning',
      'Fence cleaning',
      'Commercial building cleaning',
      'Soft washing for delicate surfaces',
      'Mold and mildew removal'
    ]
  }
};

// Initialize service cache only if needed
async function initializeServiceCache() {
  try {
    const cachedServices = localStorage.getItem(SERVICES_KEY);
    if (!cachedServices) {
      // Only clear old cache versions if we're initializing
      const oldKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('cached-services-') && key !== SERVICES_KEY
      );
      oldKeys.forEach(key => localStorage.removeItem(key));
      
      // Store services in localStorage for offline access
      localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
      console.log('Service cache initialized successfully');
    }
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
    // Clear only the current version cache
    localStorage.removeItem(SERVICES_KEY);
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