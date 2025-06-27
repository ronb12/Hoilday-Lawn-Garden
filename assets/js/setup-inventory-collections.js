import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, writeBatch, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACm0j7I8RX4ExIQRoejfk1HZMOQRGigBw",
    authDomain: "holiday-lawn-and-garden.firebaseapp.com",
    projectId: "holiday-lawn-and-garden",
    storageBucket: "holiday-lawn-and-garden.firebasestorage.app",
    messagingSenderId: "135322230444",
    appId: "1:135322230444:web:1a487b25a48aae07368909",
    measurementId: "G-KD6TBWR4ZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM elements
const initCollectionsBtn = document.getElementById('initCollections');
const addSampleDataBtn = document.getElementById('addSampleData');
const configureSystemBtn = document.getElementById('configureSystem');
const resetSystemBtn = document.getElementById('resetSystem');
const setupLog = document.getElementById('setupLog');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');

// Status elements
const initStatus = document.getElementById('initStatus');
const sampleDataStatus = document.getElementById('sampleDataStatus');
const configStatus = document.getElementById('configStatus');
const resetStatus = document.getElementById('resetStatus');

// Stats elements
const totalItems = document.getElementById('totalItems');
const categories = document.getElementById('categories');
const lowStock = document.getElementById('lowStock');
const totalValue = document.getElementById('totalValue');

// Sample inventory data
const sampleInventory = [
    {
        name: "Lawn Mower Gas",
        category: "Fuel",
        quantity: 50,
        unit: "gallons",
        price: 3.50,
        supplier: "Local Gas Station",
        reorderPoint: 10,
        location: "Storage Shed A"
    },
    {
        name: "Fertilizer - Spring Mix",
        category: "Fertilizer",
        quantity: 25,
        unit: "bags",
        price: 45.00,
        supplier: "Garden Supply Co",
        reorderPoint: 5,
        location: "Storage Shed B"
    },
    {
        name: "Weed Killer",
        category: "Pesticides",
        quantity: 15,
        unit: "bottles",
        price: 28.00,
        supplier: "Chemical Supply Inc",
        reorderPoint: 3,
        location: "Storage Shed A"
    },
    {
        name: "Garden Hose",
        category: "Equipment",
        quantity: 8,
        unit: "pieces",
        price: 35.00,
        supplier: "Hardware Store",
        reorderPoint: 2,
        location: "Equipment Room"
    },
    {
        name: "Pruning Shears",
        category: "Tools",
        quantity: 12,
        unit: "pairs",
        price: 22.00,
        supplier: "Tool Supply Co",
        reorderPoint: 4,
        location: "Tool Cabinet"
    },
    {
        name: "Mulch - Pine Bark",
        category: "Mulch",
        quantity: 30,
        unit: "bags",
        price: 15.00,
        supplier: "Landscape Supply",
        reorderPoint: 8,
        location: "Storage Shed B"
    },
    {
        name: "Seeds - Grass Mix",
        category: "Seeds",
        quantity: 20,
        unit: "pounds",
        price: 12.00,
        supplier: "Seed Company",
        reorderPoint: 5,
        location: "Storage Shed A"
    }
];

// Check authentication
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || userDoc.data().role !== "admin") {
            window.location.href = 'admin-login.html';
            return;
        }
        addLog('info', 'Admin authentication verified. Ready to proceed with setup.');
        loadInventoryStats();
    } catch (error) {
        console.error('Error checking admin role:', error);
        window.location.href = 'admin-login.html';
    }
});

// Load inventory statistics
function loadInventoryStats() {
    const unsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
        });
        
        const totalCount = items.length;
        const uniqueCategories = [...new Set(items.map(item => item.category))].length;
        const lowStockCount = items.filter(item => item.quantity <= item.reorderPoint).length;
        const totalValueCalc = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        totalItems.textContent = totalCount;
        categories.textContent = uniqueCategories;
        lowStock.textContent = lowStockCount;
        totalValue.textContent = `$${totalValueCalc.toFixed(2)}`;
    });
}

// Utility functions
function addLog(type, message) {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `<span>[${new Date().toLocaleTimeString()}]</span> ${message}`;
    setupLog.appendChild(logEntry);
    setupLog.scrollTop = setupLog.scrollHeight;
}

function showStatus(element, type, message) {
    element.innerHTML = `<div class="status ${type}"><i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>${message}</div>`;
}

function updateProgress(percent) {
    progressBar.style.display = 'block';
    progressFill.style.width = `${percent}%`;
}

// Event listeners
initCollectionsBtn.addEventListener('click', async () => {
    try {
        initCollectionsBtn.disabled = true;
        addLog('info', 'Starting collection initialization...');
        updateProgress(10);

        const batch = writeBatch(db);
        
        for (let i = 0; i < sampleInventory.length; i++) {
            const item = sampleInventory[i];
            const docRef = doc(collection(db, 'inventory'));
            batch.set(docRef, {
                ...item,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'active'
            });
            updateProgress(10 + (i / sampleInventory.length) * 80);
        }

        await batch.commit();
        updateProgress(100);
        
        addLog('success', 'Inventory collections initialized successfully!');
        showStatus(initStatus, 'success', 'Collections created with sample data');
        
        setTimeout(() => {
            updateProgress(0);
            progressBar.style.display = 'none';
        }, 2000);
        
    } catch (error) {
        addLog('error', `Error initializing collections: ${error.message}`);
        showStatus(initStatus, 'error', 'Failed to initialize collections');
    } finally {
        initCollectionsBtn.disabled = false;
    }
});

addSampleDataBtn.addEventListener('click', async () => {
    try {
        addSampleDataBtn.disabled = true;
        addLog('info', 'Adding additional sample data...');
        updateProgress(10);

        const additionalItems = [
            {
                name: "Leaf Blower",
                category: "Equipment",
                quantity: 3,
                unit: "pieces",
                price: 150.00,
                supplier: "Equipment Supply Co",
                reorderPoint: 1,
                location: "Equipment Room"
            },
            {
                name: "Garden Rake",
                category: "Tools",
                quantity: 6,
                unit: "pieces",
                price: 18.00,
                supplier: "Tool Supply Co",
                reorderPoint: 2,
                location: "Tool Cabinet"
            }
        ];

        for (let i = 0; i < additionalItems.length; i++) {
            const item = additionalItems[i];
            await addDoc(collection(db, 'inventory'), {
                ...item,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'active'
            });
            updateProgress(10 + (i / additionalItems.length) * 80);
        }

        updateProgress(100);
        addLog('success', 'Additional sample data added successfully!');
        showStatus(sampleDataStatus, 'success', 'Sample data added');
        
    } catch (error) {
        addLog('error', `Error adding sample data: ${error.message}`);
        showStatus(sampleDataStatus, 'error', 'Failed to add sample data');
    } finally {
        addSampleDataBtn.disabled = false;
        setTimeout(() => {
            updateProgress(0);
            progressBar.style.display = 'none';
        }, 2000);
    }
});

configureSystemBtn.addEventListener('click', async () => {
    try {
        configureSystemBtn.disabled = true;
        addLog('info', 'Configuring system settings...');
        updateProgress(25);

        const configData = {
            categories: ['Fuel', 'Fertilizer', 'Pesticides', 'Equipment', 'Tools', 'Mulch', 'Seeds'],
            units: ['gallons', 'bags', 'bottles', 'pieces', 'pairs', 'pounds', 'boxes'],
            locations: ['Storage Shed A', 'Storage Shed B', 'Equipment Room', 'Tool Cabinet'],
            suppliers: ['Local Gas Station', 'Garden Supply Co', 'Chemical Supply Inc', 'Hardware Store', 'Tool Supply Co', 'Landscape Supply', 'Seed Company', 'Equipment Supply Co'],
            settings: {
                lowStockThreshold: 5,
                autoReorder: false,
                notifications: true
            }
        };

        await addDoc(collection(db, 'system_config'), {
            ...configData,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        updateProgress(100);
        addLog('success', 'System configuration completed!');
        showStatus(configStatus, 'success', 'System configured successfully');
        
    } catch (error) {
        addLog('error', `Error configuring system: ${error.message}`);
        showStatus(configStatus, 'error', 'Failed to configure system');
    } finally {
        configureSystemBtn.disabled = false;
        setTimeout(() => {
            updateProgress(0);
            progressBar.style.display = 'none';
        }, 2000);
    }
});

resetSystemBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to reset all inventory data? This action cannot be undone!')) {
        return;
    }

    try {
        resetSystemBtn.disabled = true;
        addLog('warning', 'Resetting all inventory data...');
        updateProgress(10);

        const querySnapshot = await getDocs(collection(db, 'inventory'));
        const batch = writeBatch(db);
        
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        updateProgress(100);
        
        addLog('success', 'All inventory data has been reset!');
        showStatus(resetStatus, 'success', 'System reset completed');
        
    } catch (error) {
        addLog('error', `Error resetting system: ${error.message}`);
        showStatus(resetStatus, 'error', 'Failed to reset system');
    } finally {
        resetSystemBtn.disabled = false;
        setTimeout(() => {
            updateProgress(0);
            progressBar.style.display = 'none';
        }, 2000);
    }
}); 