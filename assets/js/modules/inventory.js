// Use global window.db

// Manage inventory
async function manageInventory() {
    try {
        window.showLoading("Loading inventory...");
        const [equipmentSnapshot, suppliesSnapshot, maintenanceSnapshot] = await Promise.all([
            window.db.collection("equipment").get(),
            window.db.collection("supplies").get(),
            window.db.collection("maintenance").where("status", "==", "pending").get()
        ]);
        const equipment = equipmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const supplies = suppliesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const pendingMaintenance = maintenanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.showModal(`
            <div class="modal-header">
                <h2>Inventory Management</h2>
                <button class="modal-close" onclick="window.closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="inventory-tabs">
                    <button class="tab-btn active" onclick="window.inventory.switchTab('equipment')">Equipment</button>
                    <button class="tab-btn" onclick="window.inventory.switchTab('supplies')">Supplies</button>
                    <button class="tab-btn" onclick="window.inventory.switchTab('maintenance')">Maintenance</button>
                </div>
                <div class="inventory-content">
                    <div id="equipmentTab" class="inventory-tab active">
                        <div class="inventory-header">
                            <h3>Equipment</h3>
                            <button onclick="window.inventory.addEquipment()" class="btn btn-primary"><i class="fas fa-plus"></i> Add Equipment</button>
                        </div>
                        <div class="inventory-grid">
                            ${equipment.map(item => `
                                <div class="inventory-card">
                                    <h3>${item.name}</h3>
                                    <p><i class="fas fa-tag"></i> ${item.type}</p>
                                    <p><i class="fas fa-info-circle"></i> ${item.description}</p>
                                    <p><i class="fas fa-calendar"></i> Last Maintenance: ${window.formatDate(item.lastMaintenance)}</p>
                                    <p><i class="fas fa-tools"></i> Status: <span class="status ${item.status}">${item.status}</span></p>
                                    <div class="inventory-actions">
                                        <button onclick="window.inventory.scheduleMaintenance('${item.id}')" class="btn btn-warning"><i class="fas fa-tools"></i> Schedule Maintenance</button>
                                        <button onclick="window.inventory.editEquipment('${item.id}')" class="btn btn-secondary"><i class="fas fa-edit"></i> Edit</button>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                    <div id="suppliesTab" class="inventory-tab">
                        <div class="inventory-header">
                            <h3>Supplies</h3>
                            <button onclick="window.inventory.addSupply()" class="btn btn-primary"><i class="fas fa-plus"></i> Add Supply</button>
                        </div>
                        <div class="inventory-grid">
                            ${supplies.map(item => `
                                <div class="inventory-card">
                                    <h3>${item.name}</h3>
                                    <p><i class="fas fa-box"></i> Quantity: ${item.quantity}</p>
                                    <p><i class="fas fa-exclamation-triangle"></i> Reorder Level: ${item.reorderLevel}</p>
                                    <p><i class="fas fa-dollar-sign"></i> Unit Cost: $${item.unitCost.toFixed(2)}</p>
                                    <div class="inventory-actions">
                                        <button onclick="window.inventory.reorderSupply('${item.id}')" class="btn btn-warning"><i class="fas fa-shopping-cart"></i> Reorder</button>
                                        <button onclick="window.inventory.editSupply('${item.id}')" class="btn btn-secondary"><i class="fas fa-edit"></i> Edit</button>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                    <div id="maintenanceTab" class="inventory-tab">
                        <div class="inventory-header">
                            <h3>Maintenance Schedule</h3>
                            <button onclick="window.inventory.scheduleMaintenance()" class="btn btn-primary"><i class="fas fa-plus"></i> Schedule Maintenance</button>
                        </div>
                        <div class="inventory-grid">
                            ${pendingMaintenance.map(item => `
                                <div class="inventory-card">
                                    <h3>${item.equipmentName}</h3>
                                    <p><i class="fas fa-calendar"></i> Due Date: ${window.formatDate(item.dueDate)}</p>
                                    <p><i class="fas fa-tools"></i> Type: ${item.type}</p>
                                    <p><i class="fas fa-info-circle"></i> ${item.description}</p>
                                    <div class="inventory-actions">
                                        <button onclick="window.inventory.completeMaintenance('${item.id}')" class="btn btn-success"><i class="fas fa-check"></i> Complete</button>
                                        <button onclick="window.inventory.editMaintenance('${item.id}')" class="btn btn-secondary"><i class="fas fa-edit"></i> Edit</button>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
            </div>
        `);
    } catch (error) {
        console.error("Error loading inventory:", error);
        window.showNotification("Error loading inventory", "error");
    } finally {
        window.hideLoading();
    }
}

// Switch inventory tab
function switchTab(tab) {
    const tabs = document.querySelectorAll(".inventory-tab");
    const buttons = document.querySelectorAll(".tab-btn");
    tabs.forEach(t => t.classList.remove("active"));
    buttons.forEach(b => b.classList.remove("active"));
    document.getElementById(`${tab}Tab`).classList.add("active");
    event.target.classList.add("active");
}

// Format date
function formatDate(date) {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// Export functions for use in HTML
window.inventory = {
    manageInventory,
    switchTab,
    addEquipment: () => window.showNotification("Add equipment functionality coming soon", "info"),
    editEquipment: (id) => window.showNotification("Edit equipment functionality coming soon", "info"),
    addSupply: () => window.showNotification("Add supply functionality coming soon", "info"),
    editSupply: (id) => window.showNotification("Edit supply functionality coming soon", "info"),
    reorderSupply: (id) => window.showNotification("Reorder supply functionality coming soon", "info"),
    scheduleMaintenance: (equipmentId) => window.showNotification("Schedule maintenance functionality coming soon", "info"),
    completeMaintenance: (id) => window.showNotification("Complete maintenance functionality coming soon", "info"),
    editMaintenance: (id) => window.showNotification("Edit maintenance functionality coming soon", "info")
}; 