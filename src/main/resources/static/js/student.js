
/* ==========================================
   SMART CAMPUS - COMPLAINT MANAGEMENT
   ========================================== */

const ticketForm = document.getElementById("ticketForm");
const ticketTableBody = document.getElementById("ticketTableBody");
const refreshBtn = document.getElementById("refreshBtn");

// Submit a new complaint
if (ticketForm) {
    ticketForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (currentUserRole !== "STUDENT") {
            alert("Only students can create complaints");
            return;
        }

        const ticket = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            category: document.getElementById("category").value,
            priority: document.getElementById("priority").value,
            building: document.getElementById("building").value,
            floor: document.getElementById("floor").value,
            room: document.getElementById("room").value,
            equipment: document.getElementById("equipment").value
        };

        try {
            const response = await fetch("/api/tickets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(ticket)
            });

            if (!response.ok) {
                throw new Error("Failed to create ticket");
            }

            alert("Ticket created successfully!");

            ticketForm.reset();
            await loadTickets();

        } catch (error) {
            alert("Error: " + error.message);
        }
    });
}

// Load staff from the selected department
async function loadDepartmentStaff(
    department,
    staffSelect,
    assignedStaffId
) {
    try {
        const response = await fetch(
            `/api/tickets/staff?department=${encodeURIComponent(department)}`
        );

        if (!response.ok) {
            throw new Error("Failed to load department staff");
        }

        const staffList = await response.json();

        staffSelect.innerHTML = "";

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select Staff";
        staffSelect.appendChild(defaultOption);

        staffList.forEach(function(staff) {
            const option = document.createElement("option");

            option.value = staff.id;
            option.textContent =
                staff.name + " (ID: " + staff.id + ")";

            staffSelect.appendChild(option);
        });

        if (assignedStaffId != null) {
            staffSelect.value = String(assignedStaffId);
        }

    } catch (error) {
        console.error("Error loading staff:", error);

        staffSelect.innerHTML = "";

        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Unable to load staff";

        staffSelect.appendChild(option);
        staffSelect.disabled = true;
    }
}

// Retrieve complaints
async function loadTickets() {
    try {
        const response = await fetch("/api/tickets");

        if (!response.ok) {
            throw new Error("Failed to load tickets");
        }

        const tickets = await response.json();

        // Dashboard statistics
        document.getElementById("totalComplaints").textContent =
            tickets.length;

        document.getElementById("openComplaints").textContent =
            tickets.filter(ticket =>
                ticket.status === "OPEN"
            ).length;

        document.getElementById("inProgressComplaints").textContent =
            tickets.filter(ticket =>
                ticket.status === "IN_PROGRESS"
            ).length;

        document.getElementById("resolvedComplaints").textContent =
            tickets.filter(ticket =>
                ticket.status === "RESOLVED"
            ).length;

        ticketTableBody.innerHTML = "";

        tickets.forEach(function(ticket) {
            const row = document.createElement("tr");

            const values = [
                ticket.id,
                ticket.title,
                ticket.category,
                ticket.assignedDepartment || "Not Assigned",
                ticket.assignedStaff || "Not Assigned",
                `${ticket.building || "-"}, ${ticket.floor || "-"}, ${ticket.room || "-"} | Equipment: ${ticket.equipment || "Not specified"}`,
                ticket.priority,
                ticket.status
            ];

            values.forEach(function(value) {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");

            // STAFF and ADMIN actions
            if (
                currentUserRole === "STAFF" ||
                currentUserRole === "ADMIN"
            ) {
                const staffSelect = document.createElement("select");

                const loadingOption = document.createElement("option");
                loadingOption.value = "";
                loadingOption.textContent = "Loading staff...";

                staffSelect.appendChild(loadingOption);
                staffSelect.disabled = true;

                const assignBtn = document.createElement("button");
                assignBtn.textContent = "Assign";
                assignBtn.disabled = true;

                loadDepartmentStaff(
                    ticket.assignedDepartment,
                    staffSelect,
                    ticket.assignedStaffId
                ).then(function() {
                    if (
                        staffSelect.options.length > 0 &&
                        staffSelect.options[0].textContent === "Select Staff"
                    ) {
                        staffSelect.disabled = false;
                        assignBtn.disabled = false;
                    }
                });

                assignBtn.addEventListener("click", async function() {
                    const staffId = staffSelect.value;

                    if (staffId === "") {
                        alert("Please select a staff member");
                        return;
                    }

                    try {
                        const response = await fetch(
                            `/api/tickets/${ticket.id}/assign?staffId=${encodeURIComponent(staffId)}`,
                            { method: "PUT" }
                        );

                        if (!response.ok) {
                            throw new Error("Failed to assign staff");
                        }

                        alert("Staff assigned successfully!");
                        await loadTickets();

                    } catch (error) {
                        alert("Error: " + error.message);
                    }
                });

                actionCell.appendChild(staffSelect);
                actionCell.appendChild(assignBtn);

                // Status selection
                const statusSelect = document.createElement("select");

                const statuses = [
                    "OPEN",
                    "IN_PROGRESS",
                    "RESOLVED",
                    "CLOSED"
                ];

                statuses.forEach(function(status) {
                    const option = document.createElement("option");
                    option.value = status;
                    option.textContent = status;
                    statusSelect.appendChild(option);
                });

                statusSelect.value = ticket.status;

                const updateBtn = document.createElement("button");
                updateBtn.textContent = "Update";

                updateBtn.addEventListener("click", function() {
                    updateTicketStatus(
                        ticket.id,
                        statusSelect.value
                    );
                });

                actionCell.appendChild(statusSelect);
                actionCell.appendChild(updateBtn);
            }

            // ADMIN-only delete action
            if (currentUserRole === "ADMIN") {
                const deleteBtn = document.createElement("button");

                deleteBtn.textContent = "Delete";
                deleteBtn.className = "delete-btn";

                deleteBtn.addEventListener("click", function() {
                    deleteTicket(ticket.id);
                });

                actionCell.appendChild(deleteBtn);
            }

            row.appendChild(actionCell);
            ticketTableBody.appendChild(row);
        });

    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Refresh complaints
if (refreshBtn) {
    refreshBtn.addEventListener("click", loadTickets);
}

// Update complaint status
async function updateTicketStatus(id, status) {
    try {
        const response = await fetch(
            `/api/tickets/${id}/status?status=${encodeURIComponent(status)}`,
            { method: "PUT" }
        );

        if (!response.ok) {
            throw new Error("Failed to update ticket status");
        }

        alert("Ticket status updated successfully!");
        await loadTickets();

    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Delete complaint
async function deleteTicket(id) {
    const confirmation = confirm(
        "Are you sure you want to delete this ticket?"
    );

    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch(`/api/tickets/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete ticket");
        }

        alert("Ticket deleted successfully!");
        await loadTickets();

    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Initialize dashboard after authentication
async function initializeDashboard() {
    const loggedIn = await loadCurrentUser();

    if (loggedIn) {
        await loadTickets();
    }
}

initializeDashboard();
