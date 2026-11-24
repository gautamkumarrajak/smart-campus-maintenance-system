
/* ==========================================
   SMART CAMPUS - STAFF DASHBOARD
   ========================================== */

const departmentSelect = document.getElementById("department");
const loadBtn = document.getElementById("loadBtn");
const staffTicketTable = document.getElementById("staffTicketTable");

// Department change request elements
const departmentChangeSection =
    document.getElementById("departmentChange");

const departmentChangeLink =
    document.querySelector('a[href="#departmentChange"]');

const departmentChangeForm =
    document.getElementById("departmentChangeForm");

const requestedDepartmentSelect =
    document.getElementById("requestedDepartment");

const departmentChangeReason =
    document.getElementById("departmentChangeReason");

const submitDepartmentRequestBtn =
    document.getElementById("submitDepartmentRequestBtn");

const departmentRequestMessage =
    document.getElementById("departmentRequestMessage");

const departmentRequestTable =
    document.getElementById("departmentRequestTable");

const refreshDepartmentRequestsBtn =
    document.getElementById("refreshDepartmentRequestsBtn");


/* ==========================================
   DEPARTMENT CHANGE VISIBILITY
   ========================================== */

// Hide or show department change feature
function setDepartmentChangeVisibility(visible) {

    if (departmentChangeSection) {
        departmentChangeSection.hidden = !visible;
        departmentChangeSection.style.display =
            visible ? "" : "none";
    }

    if (departmentChangeLink) {
        departmentChangeLink.hidden = !visible;
        departmentChangeLink.style.display =
            visible ? "" : "none";
    }
}

// Hide initially until user role is verified
setDepartmentChangeVisibility(false);


/* ==========================================
   DEPARTMENT COMPLAINTS
   ========================================== */

// Load complaints when button is clicked
loadBtn.addEventListener("click", loadDepartmentTickets);

// Load complaints for selected department
async function loadDepartmentTickets() {

    const department = departmentSelect.value;

    if (department === "") {
        alert("Please select a department");
        return;
    }

    try {

        const response = await fetch(
            `/api/tickets/department?name=${encodeURIComponent(department)}`
        );

        if (!response.ok) {

            if (response.status === 403) {
                throw new Error(
                    "You do not have permission to view this department"
                );
            }

            throw new Error("Failed to load complaints");
        }

        const tickets = await response.json();

        staffTicketTable.innerHTML = "";

        tickets.forEach(function(ticket) {

            const row = document.createElement("tr");

            const values = [
                ticket.id,
                ticket.title,
                `${ticket.building || "-"}, ${ticket.floor || "-"}, ${ticket.room || "-"}`,
                ticket.equipment || "Not specified",
                ticket.priority,
                ticket.status
            ];

            values.forEach(function(value) {

                const cell = document.createElement("td");

                cell.textContent = value ?? "";

                row.appendChild(cell);
            });

            // Action column
            const actionCell = document.createElement("td");

            // Status dropdown
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

            // Update status button
            const updateBtn = document.createElement("button");

            updateBtn.textContent = "Update";

            updateBtn.addEventListener("click", async function() {

                try {

                    const response = await fetch(
                        `/api/tickets/${ticket.id}/status?status=${encodeURIComponent(statusSelect.value)}`,
                        {
                            method: "PUT"
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Failed to update status");
                    }

                    alert("Complaint status updated successfully!");

                    await loadDepartmentTickets();

                } catch (error) {

                    alert("Error: " + error.message);
                }
            });

            actionCell.appendChild(statusSelect);
            actionCell.appendChild(updateBtn);

            row.appendChild(actionCell);

            staffTicketTable.appendChild(row);
        });

        // Display message if no complaints exist
        if (tickets.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.className = "empty-message";

            cell.textContent =
                "No complaints found for this department.";

            row.appendChild(cell);

            staffTicketTable.appendChild(row);
        }

    } catch (error) {

        alert("Error: " + error.message);
    }
}


/* ==========================================
   DEPARTMENT CHANGE REQUEST
   ========================================== */

// Display success or error messages
function showDepartmentRequestMessage(message, type) {

    departmentRequestMessage.textContent = message;
    departmentRequestMessage.className = type;
}


// Submit a new department change request
async function submitDepartmentChangeRequest(event) {

    event.preventDefault();

    // Only STAFF can submit department change requests
    if (currentUserRole !== "STAFF") {
        return;
    }

    const requestedDepartment =
        requestedDepartmentSelect.value;

    const reason =
        departmentChangeReason.value.trim();

    if (!requestedDepartment) {

        showDepartmentRequestMessage(
            "Please select a department.",
            "error"
        );

        return;
    }

    if (requestedDepartment === currentUser.department) {

        showDepartmentRequestMessage(
            "You are already assigned to this department.",
            "error"
        );

        return;
    }

    submitDepartmentRequestBtn.disabled = true;
    submitDepartmentRequestBtn.textContent = "Submitting...";

    try {

        const response = await fetch(
            "/api/department-requests",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    requestedDepartment: requestedDepartment,
                    reason: reason
                })
            }
        );

        const message = await response.text();

        if (!response.ok) {

            throw new Error(
                message || "Failed to submit request"
            );
        }

        showDepartmentRequestMessage(
            message,
            "success"
        );

        // Clear the form
        departmentChangeForm.reset();

        // Refresh request history
        await loadDepartmentChangeRequests();

    } catch (error) {

        showDepartmentRequestMessage(
            error.message,
            "error"
        );

    } finally {

        submitDepartmentRequestBtn.disabled = false;

        submitDepartmentRequestBtn.textContent =
            "Submit Request";
    }
}


// Load request history for logged-in STAFF
async function loadDepartmentChangeRequests() {

    // Only STAFF can view personal request history
    if (currentUserRole !== "STAFF") {
        return;
    }

    refreshDepartmentRequestsBtn.disabled = true;

    try {

        const response = await fetch(
            "/api/department-requests/my"
        );

        if (!response.ok) {

            throw new Error(
                "Failed to load department change requests"
            );
        }

        const requests = await response.json();

        departmentRequestTable.innerHTML = "";

        if (requests.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;

            cell.textContent =
                "You have not submitted any department change requests.";

            row.appendChild(cell);

            departmentRequestTable.appendChild(row);

            return;
        }

        requests.forEach(function(request) {

            const row = document.createElement("tr");

            const values = [
                request.id,
                request.currentDepartment,
                request.requestedDepartment,
                request.reason || "—"
            ];

            values.forEach(function(value) {

                const cell = document.createElement("td");

                cell.textContent = value ?? "—";

                row.appendChild(cell);
            });

            // Status badge
            const statusCell = document.createElement("td");

            const statusBadge = document.createElement("span");

            statusBadge.className =
                "department-request-status " +
                request.status.toLowerCase();

            statusBadge.textContent = request.status;

            statusCell.appendChild(statusBadge);

            row.appendChild(statusCell);

            // Requested date
            const dateCell = document.createElement("td");

            dateCell.textContent = request.requestedAt
                ? new Date(request.requestedAt).toLocaleString()
                : "—";

            row.appendChild(dateCell);

            departmentRequestTable.appendChild(row);
        });

    } catch (error) {

        departmentRequestTable.innerHTML = "";

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = error.message;

        row.appendChild(cell);

        departmentRequestTable.appendChild(row);

    } finally {

        refreshDepartmentRequestsBtn.disabled = false;
    }
}


// Submit form event
departmentChangeForm.addEventListener(
    "submit",
    submitDepartmentChangeRequest
);

// Refresh history event
refreshDepartmentRequestsBtn.addEventListener(
    "click",
    loadDepartmentChangeRequests
);


/* ==========================================
   INITIALIZE STAFF DASHBOARD
   ========================================== */

async function initializeStaffPanel() {

    // Shared authentication and profile loading
    const loggedIn = await loadCurrentUser();

    if (!loggedIn) {
        return;
    }

    /* ======================================
       STAFF ACCESS
       ====================================== */

    if (currentUserRole === "STAFF") {

        // Show department change feature only for STAFF
        setDepartmentChangeVisibility(true);

        if (!currentUser.department) {

            alert("No department assigned to your account");

            loadBtn.disabled = true;

            // Staff can still view request history
            await loadDepartmentChangeRequests();

            return;
        }

        // Automatically select assigned department
        departmentSelect.value = currentUser.department;

        if (departmentSelect.value !== currentUser.department) {

            alert("Assigned department not found in dropdown");

            loadBtn.disabled = true;

            return;
        }

        // STAFF cannot change department directly
        departmentSelect.disabled = true;

        // Automatically load department complaints
        await loadDepartmentTickets();

        // Load department change request history
        await loadDepartmentChangeRequests();

    }

    /* ======================================
       ADMIN ACCESS
       ====================================== */

    else if (currentUserRole === "ADMIN") {

        // ADMIN can select any department
        departmentSelect.disabled = false;

        // Hide department change section and sidebar link
        setDepartmentChangeVisibility(false);

    }

    /* ======================================
       UNAUTHORIZED ACCESS
       ====================================== */

    else {

        // STUDENT cannot access Staff Dashboard
        window.location.href = "/pages/index.html";
    }
}

// Run when Staff Dashboard opens
initializeStaffPanel();
