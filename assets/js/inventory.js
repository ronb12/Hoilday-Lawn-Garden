import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
// Check authentication
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Check if user is admin by looking up their role in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
                loadInventory();
                setupEventListeners();
            } else {
                window.location.href = 'admin-login.html';
            }
        } catch (error) {
            console.error('Error checking admin role:', error);
            window.location.href = 'admin-login.html';
        }
    } else {
        window.location.href = 'admin-login.html';
    }
});
// Load inventory from Firebase
async function loadInventory() {
    try {
        loadingDiv.style.display = 'block';
        inventoryTable.style.display = 'none';
        errorDiv.style.display = 'none';

        const inventoryRef = collection(db, 'inventory');
        const q = query(inventoryRef, orderBy('createdAt', 'desc'));
        
        onSnapshot(q, (snapshot) => {
            inventory = [];
            snapshot.forEach((doc) => {
                inventory.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            updateStats();
            filterInventory();
            loadingDiv.style.display = 'none';
            inventoryTable.style.display = 'table';
        });

    } catch (error) {
        console.error('Error loading inventory:', error);
        showError('Failed to load inventory. Please try again.');
    }
}

// Update statistics
function updateStats() {
    const total = inventory.length;
    const lowStock = inventory.filter(item => (item.quantity || 0) <= (item.reorderLevel || 10) && (item.quantity || 0) > 0).length;
    const outOfStock = inventory.filter(item => (item.quantity || 0) === 0).length;
    const totalValue = inventory.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);

    totalItemsEl.textContent = total;
    lowStockEl.textContent = lowStock;
    outOfStockEl.textContent = outOfStock;
    totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
}

// Filter inventory
function filterInventory() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilterValue = categoryFilter.value;
    const statusFilterValue = statusFilter.value;
    const sortBy = sortBySelect.value;

    filteredInventory = inventory.filter(item => {
        const matchesSearch = !searchTerm || 
            item.name?.toLowerCase().includes(searchTerm) ||
            item.sku?.toLowerCase().includes(searchTerm) ||
            item.category?.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !categoryFilterValue || item.category === categoryFilterValue;
        const matchesStatus = !statusFilterValue || 
            (statusFilterValue === 'in-stock' && (item.quantity || 0) > 0) ||
            (statusFilterValue === 'low-stock' && (item.quantity || 0) <= (item.reorderLevel || 10) && (item.quantity || 0) > 0) ||
            (statusFilterValue === 'out-of-stock' && (item.quantity || 0) === 0);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort inventory
    filteredInventory.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            case 'quantity':
                return (a.quantity || 0) - (b.quantity || 0);
            case 'price':
                return (b.price || 0) - (a.price || 0);
            case 'category':
                return (a.category || '').localeCompare(b.category || '');
            default:
                return 0;
        }
    });

    renderInventory();
}

// Render inventory in table
function renderInventory() {
    inventoryTbody.innerHTML = '';

    if (filteredInventory.length === 0) {
        inventoryTbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #666;">
                    No inventory items found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }

    filteredInventory.forEach(item => {
        const row = document.createElement('tr');
        const stockStatus = (item.quantity || 0) === 0 ? 'out-of-stock' : 
                           (item.quantity || 0) <= (item.reorderLevel || 10) ? 'low-stock' : 'in-stock';
        
        row.innerHTML = `
            <td>
                <div>
                    <strong>${item.name || 'N/A'}</strong>
                    <br>
                    <small style="color: #666;">SKU: ${item.sku || 'N/A'}</small>
                </div>
            </td>
            <td>
                <span style="text-transform: capitalize;">${item.category || 'N/A'}</span>
            </td>
            <td>
                <strong>${item.quantity || 0}</strong>
            </td>
            <td>
                <strong>$${(item.price || 0).toFixed(2)}</strong>
            </td>
            <td>
                <span class="stock-status status-${stockStatus}">
                    ${stockStatus.replace('-', ' ')}
                </span>
            </td>
            <td>
                ${item.supplier || 'N/A'}
            </td>
            <td>
                ${formatDate(item.createdAt)}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-small" onclick="viewItem('${item.id}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-primary btn-small" onclick="editItem('${item.id}')">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteItem('${item.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </td>
        `;
        inventoryTbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterInventory);
    categoryFilter.addEventListener('change', filterInventory);
    statusFilter.addEventListener('change', filterInventory);
    sortBySelect.addEventListener('change', filterInventory);
}

// Utility functions
function formatDate(date) {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
}

// Global functions
window.viewItem = function(itemId) {
    alert(`View item ${itemId}`);
};

window.editItem = function(itemId) {
    window.location.href = `add-inventory.html?id=${itemId}`;
};

window.deleteItem = async function(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            await deleteDoc(doc(db, 'inventory', itemId));
        } catch (error) {
            console.error('Error deleting item:', error);
            showError('Failed to delete item. Please try again.');
        }
    }
};

window.exportInventory = function() {
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Name,SKU,Category,Quantity,Price,Status,Supplier\n" +
        filteredInventory.map(item => 
            `"${item.name || ''}","${item.sku || ''}","${item.category || ''}","${item.quantity || 0}","${item.price || 0}","${(item.quantity || 0) === 0 ? 'out-of-stock' : (item.quantity || 0) <= (item.reorderLevel || 10) ? 'low-stock' : 'in-stock'}","${item.supplier || ''}"`
        ).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.refreshInventory = function() {
    loadInventory();
};

window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
};
