
/* ==========================================
   SMART CAMPUS - ADMIN DASHBOARD
   ========================================== */

const approveStaffForm = document.getElementById("approveStaffForm");
const staffEmail = document.getElementById("staffEmail");
const staffDepartment = document.getElementById("staffDepartment");
const adminMessage = document.getElementById("adminMessage");

const usersTableBody = document.getElementById("usersTableBody");
const searchUsers = document.getElementById("searchUsers");
const refreshUsers = document.getElementById("refreshUsers");

// Department change request elements
const adminDepartmentRequestsTable =
    document.getElementById("adminDepartmentRequestsTable");

const refreshDepartmentRequests =
    document.getElementById("refreshDepartmentRequests");

const departmentReviewMessage =
    document.getElementById("departmentReviewMessage");

// ==========================================
// APPROVE MAINTENANCE STAFF
// ==========================================

approveStaffForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (currentUserRole !== "ADMIN") {
        alert("Only administrators can approve staff");
        return;
    }

    const email = staffEmail.value.trim();
    const department = staffDepartment.value;

    try {
        const response = await fetch("/api/admin/approve-staff", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, department })
        });

        adminMessage.textContent = await response.text();

        if (response.ok) {
            adminMessage.style.color = "green";
            approveStaffForm.reset();
            await loadUsers();
        } else {
            adminMessage.style.color = "red";
        }

    } catch (error) {
        adminMessage.textContent = "Unable to connect to server";
        adminMessage.style.color = "red";
    }
});

// ==========================================
// LOAD REGISTERED USERS
// ==========================================

async function loadUsers() {
    try {
        const response = await fetch("/api/admin/users");

        if (!response.ok) {
            throw new Error("Failed to load users");
        }

        const users = await response.json();

        usersTableBody.innerHTML = "";

        users.forEach(function(user) {
            const row = document.createElement("tr");

            [
                user.name,
                user.email,
                user.role,
                user.department
            ].forEach(function(value) {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");

            // Approve a registered student as staff
            if (user.role === "STUDENT") {
                const approveBtn = document.createElement("button");

                approveBtn.textContent = "Approve as Staff";
                approveBtn.className = "approve-btn";
                approveBtn.type = "button";

                approveBtn.addEventListener("click", function() {
                    staffEmail.value = user.email;

                    approveStaffForm.scrollIntoView({
                        behavior: "smooth"
                    });

                    staffDepartment.focus();
                });

                actionCell.appendChild(approveBtn);
            }

            // Change department of existing staff
            else if (user.role === "STAFF") {
                const changeBtn = document.createElement("button");

                changeBtn.textContent = "Change Department";
                changeBtn.className = "change-dept-btn";
                changeBtn.type = "button";

                changeBtn.addEventListener("click", async function() {
                    await changeStaffDepartment(user);
                });

                actionCell.appendChild(changeBtn);
            }

            // No action for administrator accounts
            else {
                actionCell.textContent = "-";
            }

            row.appendChild(actionCell);
            usersTableBody.appendChild(row);
        });

        filterUsers();

    } catch (error) {
        console.error("Error loading users:", error);
    }
}

// ==========================================
// CHANGE STAFF DEPARTMENT
// ==========================================

async function changeStaffDepartment(user) {
    const departments = [
        "Electrical Maintenance",
        "IT Support",
        "Network Support",
        "Plumbing Maintenance",
        "General Maintenance",
        "Technical Support",
        "Administration"
    ];

    const departmentSelect = document.createElement("select");

    departments.forEach(function(name) {
        const option = document.createElement("option");

        option.value = name;
        option.textContent = name;

        departmentSelect.appendChild(option);
    });

    if (departments.includes(user.department)) {
        departmentSelect.value = user.department;
    }

    const selected = await new Promise(function(resolve) {
        const popup = document.createElement("dialog");
        popup.className = "department-dialog";

        const heading = document.createElement("h3");
        heading.textContent = "Change Staff Department";

        const buttons = document.createElement("div");
        buttons.className = "dialog-buttons";

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.type = "button";

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.type = "button";

        buttons.append(saveBtn, cancelBtn);
        popup.append(heading, departmentSelect, buttons);

        document.body.appendChild(popup);

        let completed = false;

        function finish(value) {
            if (completed) {
                return;
            }

            completed = true;
            popup.close();
            popup.remove();
            resolve(value);
        }

        saveBtn.addEventListener("click", function() {
            finish(departmentSelect.value);
        });

        cancelBtn.addEventListener("click", function() {
            finish(null);
        });

        popup.addEventListener("cancel", function(event) {
            event.preventDefault();
            finish(null);
        });

        popup.showModal();
    });

    if (selected === null) {
        return;
    }

    try {
        const response = await fetch(
            "/api/admin/update-department",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: user.email,
                    department: selected
                })
            }
        );

        const message = await response.text();

        alert(message);

        if (response.ok) {
            await loadUsers();
        }

    } catch (error) {
        alert("Unable to update department");
    }
}

// ==========================================
// SEARCH REGISTERED USERS
// ==========================================

function filterUsers() {
    const searchText = searchUsers.value.toLowerCase().trim();

    const rows = usersTableBody.querySelectorAll("tr");

    rows.forEach(function(row) {
        const cells = row.querySelectorAll("td");

        const searchableText = Array.from(cells)
            .slice(0, 4)
            .map(cell => cell.textContent.toLowerCase())
            .join(" ");

        row.style.display = searchableText.includes(searchText)
            ? ""
            : "none";
    });
}

// Search while typing
searchUsers.addEventListener("input", filterUsers);

// Refresh registered users
refreshUsers.addEventListener("click", loadUsers);

// ==========================================
// DEPARTMENT CHANGE REQUEST MANAGEMENT
// ==========================================

// Load all department change requests
async function loadDepartmentRequests() {

    refreshDepartmentRequests.disabled = true;

    try {
        const response = await fetch("/api/department-requests");

        if (!response.ok) {
            throw new Error("Failed to load department requests");
        }

        const requests = await response.json();

        adminDepartmentRequestsTable.innerHTML = "";

        if (requests.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 8;
            cell.textContent = "No department change requests found.";

            row.appendChild(cell);
            adminDepartmentRequestsTable.appendChild(row);
            return;
        }

        requests.forEach(function(request) {

            const row = document.createElement("tr");

            const values = [
                request.id,
                request.staffName,
                request.currentDepartment,
                request.requestedDepartment,
                request.reason || "—"
            ];

            values.forEach(function(value) {
                const cell = document.createElement("td");
                cell.textContent = value ?? "—";
                row.appendChild(cell);
            });

            // Request status
            const statusCell = document.createElement("td");
            const badge = document.createElement("span");

            badge.className =
                "department-request-status " +
                request.status.toLowerCase();

            badge.textContent = request.status;

            statusCell.appendChild(badge);
            row.appendChild(statusCell);

            // Request date
            const dateCell = document.createElement("td");

            dateCell.textContent = request.requestedAt
                ? new Date(request.requestedAt).toLocaleString()
                : "—";

            row.appendChild(dateCell);

            // Action buttons
            const actionCell = document.createElement("td");

            if (request.status === "PENDING") {

                ["APPROVED", "REJECTED"].forEach(function(decision) {

                    const button = document.createElement("button");

                    button.type = "button";
                    button.textContent =
                        decision === "APPROVED" ? "Approve" : "Reject";

                    button.className =
                        decision === "APPROVED"
                            ? "approve-request-btn"
                            : "reject-request-btn";

                    button.addEventListener("click", function() {
                        reviewDepartmentRequest(request.id, decision);
                    });

                    actionCell.appendChild(button);
                });

            } else {
                actionCell.textContent = "Reviewed";
            }

            row.appendChild(actionCell);
            adminDepartmentRequestsTable.appendChild(row);
        });

    } catch (error) {
        adminDepartmentRequestsTable.innerHTML = "";

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 8;
        cell.textContent = error.message;

        row.appendChild(cell);
        adminDepartmentRequestsTable.appendChild(row);

    } finally {
        refreshDepartmentRequests.disabled = false;
    }
}

// ADMIN: Approve or reject a request
async function reviewDepartmentRequest(requestId, decision) {

    const action = decision === "APPROVED"
        ? "approve"
        : "reject";

    if (!confirm(`Are you sure you want to ${action} this request?`)) {
        return;
    }

    departmentReviewMessage.textContent = "";

    // Disable action buttons during the request
    const buttons = adminDepartmentRequestsTable.querySelectorAll(
        ".approve-request-btn, .reject-request-btn"
    );

    buttons.forEach(button => button.disabled = true);

    try {
        const response = await fetch(
            `/api/department-requests/${requestId}/review`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ decision })
            }
        );

        const message = await response.text();

        if (!response.ok) {
            throw new Error(message || "Failed to review request");
        }

        departmentReviewMessage.textContent = message;
        departmentReviewMessage.className = "success";

        await loadDepartmentRequests();
        await loadUsers();

    } catch (error) {
        departmentReviewMessage.textContent = error.message;
        departmentReviewMessage.className = "error";

    } finally {
        buttons.forEach(button => button.disabled = false);
    }
}

// Refresh department change requests
refreshDepartmentRequests.addEventListener(
    "click",
    loadDepartmentRequests
);

// ==========================================
// INITIALIZE ADMIN DASHBOARD
// ==========================================

async function initializeAdminDashboard() {

    const loggedIn = await loadCurrentUser();

    if (!loggedIn) {
        return;
    }

    // Only ADMIN can use this dashboard
    if (currentUserRole !== "ADMIN") {
        window.location.href = "/pages/index.html";
        return;
    }

    // Load registered users
    await loadUsers();

    // Load department change requests
    await loadDepartmentRequests();
}

initializeAdminDashboard();
