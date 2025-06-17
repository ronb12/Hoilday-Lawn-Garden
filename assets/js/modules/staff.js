// Import Firebase modules
import { getFirestore, collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { showLoading, hideLoading, showNotification, showModal, closeModal } from "../utils.js";

const db = getFirestore();

// View staff
export async function viewStaff() {
    try {
        showLoading("Loading staff...");
        const staffQuery = query(
            collection(db, "staff"),
            orderBy("name")
        );
        const staffSnapshot = await getDocs(staffQuery);

        showModal(`
            <div class="modal-header">
                <h2>Staff Management</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="staff-grid">
                    ${staffSnapshot.docs.map(doc => {
                        const staff = doc.data();
                        return `
                            <div class="staff-card">
                                <img src="${staff.photoURL || 'assets/images/default-avatar.png'}" alt="${staff.name}">
                                <h3>${staff.name}</h3>
                                <p><i class="fas fa-briefcase"></i> ${staff.role}</p>
                                <p><i class="fas fa-phone"></i> ${staff.phone}</p>
                                <p><i class="fas fa-envelope"></i> ${staff.email}</p>
                                <div class="staff-actions">
                                    <button onclick="staff.editStaff('${doc.id}')" class="btn btn-secondary">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button onclick="staff.viewStaffSchedule('${doc.id}')" class="btn btn-primary">
                                        <i class="fas fa-calendar"></i> Schedule
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `);
    } catch (error) {
        console.error("Error loading staff:", error);
        showNotification("Error loading staff", "error");
    } finally {
        hideLoading();
    }
}

// Add staff
export async function addStaff() {
    try {
        showModal(`
            <div class="modal-header">
                <h2>Add New Staff Member</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addStaffForm" class="form">
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="role">Role</label>
                        <select id="role" name="role" required>
                            <option value="technician">Technician</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="photo">Photo URL</label>
                        <input type="url" id="photo" name="photo">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Add Staff Member</button>
                    </div>
                </form>
            </div>
        `);

        document.getElementById("addStaffForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const staffData = {
                name: formData.get("name"),
                role: formData.get("role"),
                phone: formData.get("phone"),
                email: formData.get("email"),
                photoURL: formData.get("photo") || null,
                createdAt: new Date(),
                performance: 0
            };

            try {
                await addDoc(collection(db, "staff"), staffData);
                showNotification("Staff member added successfully", "success");
                closeModal();
                viewStaff();
            } catch (error) {
                console.error("Error adding staff:", error);
                showNotification("Error adding staff member", "error");
            }
        });
    } catch (error) {
        console.error("Error showing add staff form:", error);
        showNotification("Error showing add staff form", "error");
    }
}

// Export functions for use in HTML
window.staff = {
    viewStaff,
    addStaff,
    editStaff: (id) => {
        // TODO: Implement edit staff functionality
        showNotification("Edit staff functionality coming soon", "info");
    },
    viewStaffSchedule: (id) => {
        // TODO: Implement view staff schedule functionality
        showNotification("View staff schedule functionality coming soon", "info");
    }
}; 