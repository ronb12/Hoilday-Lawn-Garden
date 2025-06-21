// Setup script for Firebase inventory collections
// Run this in the browser console on any page with Firebase initialized

// Firebase configuration (same as in inventory.html)
const firebaseConfig = {
    apiKey: "AIzaSyACm0j7I8RX4ExIQRoejfk1HZMOQRGigBw",
    authDomain: "holiday-lawn-and-garden.firebaseapp.com",
    projectId: "holiday-lawn-and-garden",
    storageBucket: "holiday-lawn-and-garden.firebasestorage.app",
    messagingSenderId: "135322230444",
    appId: "1:135322230444:web:1a487b25a48aae07368909",
    measurementId: "G-KD6TBWR4ZT"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Sample equipment data
const equipmentData = [
    {
        name: "Lawn Mower",
        category: "equipment",
        sku: "LM-001",
        quantity: 3,
        status: "available",
        location: "Garage A",
        description: "Gas-powered lawn mower for large properties",
        lastUpdated: new Date()
    },
    {
        name: "Leaf Blower",
        category: "equipment",
        sku: "LB-002",
        quantity: 2,
        status: "available",
        location: "Garage B",
        description: "Electric leaf blower for fall cleanup",
        lastUpdated: new Date()
    },
    {
        name: "Hedge Trimmer",
        category: "equipment",
        sku: "HT-003",
        quantity: 1,
        status: "maintenance",
        location: "Tool Shed",
        description: "Battery-powered hedge trimmer",
        lastUpdated: new Date()
    },
    {
        name: "Pressure Washer",
        category: "equipment",
        sku: "PW-004",
        quantity: 0,
        status: "out",
        location: "Garage A",
        description: "Commercial pressure washer for driveways",
        lastUpdated: new Date()
    }
];

// Sample supplies data
const suppliesData = [
    {
        name: "Garden Hose",
        category: "supplies",
        sku: "GH-001",
        quantity: 5,
        status: "available",
        location: "Storage Room",
        description: "50ft garden hose with spray nozzle",
        lastUpdated: new Date()
    },
    {
        name: "Fertilizer",
        category: "supplies",
        sku: "FERT-002",
        quantity: 2,
        status: "low",
        location: "Warehouse",
        description: "Organic fertilizer 20lb bag",
        lastUpdated: new Date()
    },
    {
        name: "Grass Seed",
        category: "supplies",
        sku: "GS-003",
        quantity: 8,
        status: "available",
        location: "Warehouse",
        description: "Premium grass seed mix 10lb bag",
        lastUpdated: new Date()
    },
    {
        name: "Mulch",
        category: "supplies",
        sku: "MULCH-004",
        quantity: 0,
        status: "out",
        location: "Warehouse",
        description: "Cedar mulch 2 cubic feet",
        lastUpdated: new Date()
    },
    {
        name: "Safety Gloves",
        category: "supplies",
        sku: "SG-005",
        quantity: 12,
        status: "available",
        location: "Tool Shed",
        description: "Heavy-duty work gloves size L",
        lastUpdated: new Date()
    }
];

// Sample maintenance data
const maintenanceData = [
    {
        equipmentId: "HT-003",
        equipmentName: "Hedge Trimmer",
        issue: "Battery not holding charge",
        status: "pending",
        reportedDate: new Date(),
        priority: "medium",
        assignedTo: "John Smith"
    },
    {
        equipmentId: "LM-001",
        equipmentName: "Lawn Mower",
        issue: "Annual service due",
        status: "pending",
        reportedDate: new Date(),
        priority: "low",
        assignedTo: "Mike Johnson"
    }
];

// Function to create collections and add data
async function setupInventoryCollections() {
    try {
        console.log('Setting up inventory collections...');
        
        // Create equipment collection
        console.log('Creating equipment collection...');
        for (const item of equipmentData) {
            await db.collection('equipment').add(item);
        }
        console.log('Equipment collection created with', equipmentData.length, 'items');
        
        // Create supplies collection
        console.log('Creating supplies collection...');
        for (const item of suppliesData) {
            await db.collection('supplies').add(item);
        }
        console.log('Supplies collection created with', suppliesData.length, 'items');
        
        // Create maintenance collection
        console.log('Creating maintenance collection...');
        for (const item of maintenanceData) {
            await db.collection('maintenance').add(item);
        }
        console.log('Maintenance collection created with', maintenanceData.length, 'items');
        
        console.log('✅ All inventory collections created successfully!');
        console.log('You can now refresh the inventory page to see the data.');
        
    } catch (error) {
        console.error('❌ Error setting up collections:', error);
    }
}

// Function to check if collections exist
async function checkCollections() {
    try {
        console.log('Checking existing collections...');
        
        const equipmentSnapshot = await db.collection('equipment').get();
        const suppliesSnapshot = await db.collection('supplies').get();
        const maintenanceSnapshot = await db.collection('maintenance').get();
        
        console.log('Equipment collection:', equipmentSnapshot.size, 'documents');
        console.log('Supplies collection:', suppliesSnapshot.size, 'documents');
        console.log('Maintenance collection:', maintenanceSnapshot.size, 'documents');
        
        if (equipmentSnapshot.size === 0 && suppliesSnapshot.size === 0 && maintenanceSnapshot.size === 0) {
            console.log('All collections are empty. Run setupInventoryCollections() to add sample data.');
        } else {
            console.log('Collections already have data.');
        }
        
    } catch (error) {
        console.error('Error checking collections:', error);
    }
}

// Auto-run check when script loads
checkCollections();

console.log('📋 Inventory Setup Script Loaded');
console.log('Run setupInventoryCollections() to create collections with sample data');
console.log('Run checkCollections() to see current collection status'); 