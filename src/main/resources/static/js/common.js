
/* ==========================================
   SMART CAMPUS - COMMON JAVASCRIPT
   ========================================== */

let currentUserRole = "";
let currentUser = null;

// ==========================================
// COMMON HELPER FUNCTIONS
// ==========================================

// Display text safely
function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value ?? "";
    }
}

// Show or hide an element
function setVisible(id, visible, displayType = "block") {
    const element = document.getElementById(id);

    if (element) {
        element.style.display = visible
            ? displayType
            : "none";
    }
}

// Get initials from user's name
function getInitials(name) {
    if (!name || !name.trim()) {
        return "U";
    }

    const parts = name.trim().split(/\s+/);

    return parts
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("");
}

// Format role for display
function formatRole(role) {
    if (!role) {
        return "User";
    }

    return role.charAt(0) +
        role.slice(1).toLowerCase();
}

// ==========================================
// AUTHENTICATION
// ==========================================

// Clear previously loaded account details
function clearCurrentUser() {
    currentUser = null;
    currentUserRole = "";
}

// Load currently authenticated user
async function loadCurrentUser() {

    // Clear old account details before loading
    clearCurrentUser();

    try {
        const response = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store"
        });

        if (!response.ok) {
            clearCurrentUser();
            window.location.replace("/pages/login.html");
            return false;
        }

        const user = await response.json();

        if (!user || !user.role) {
            clearCurrentUser();
            window.location.replace("/pages/login.html");
            return false;
        }

        currentUser = user;
        currentUserRole = user.role;

        updateRoleNavigation();
        updateUserProfile();

        return true;

    } catch (error) {
        console.error(
            "Unable to load user details:",
            error
        );

        clearCurrentUser();
        window.location.replace("/pages/login.html");

        return false;
    }
}

// ==========================================
// ROLE-BASED NAVIGATION
// ==========================================

function updateRoleNavigation() {

    const isStudent = currentUserRole === "STUDENT";

    const isStaff =
        currentUserRole === "STAFF" ||
        currentUserRole === "ADMIN";

    const isAdmin = currentUserRole === "ADMIN";

    // Student-only features
    setVisible("reportProblemLink", isStudent);
    setVisible("complaintForm", isStudent);
    setVisible("welcomeReportBtn", isStudent, "inline-flex");
    setVisible("quickReportBtn", isStudent, "flex");

    // Staff features
    setVisible("staffPanelLink", isStaff);
    setVisible("quickStaffBtn", isStaff, "flex");

    // Admin features
    setVisible("adminPanelLink", isAdmin);
    setVisible("quickAdminBtn", isAdmin, "flex");
}

// ==========================================
// USER PROFILE
// ==========================================

function updateUserProfile() {

    if (!currentUser) {
        return;
    }

    const name = currentUser.name || "User";
    const role = formatRole(currentUser.role);
    const initials = getInitials(name);

    // Header
    setText("headerUserName", name);
    setText("headerUserRole", role);
    setText("headerAvatar", initials);

    // Profile card
    setText("profileAvatar", initials);
    setText("profileName", name);
    setText("profileRole", role);
    setText("profileFullName", name);

    // Display registered email address
    setText(
        "profileEmail",
        currentUser.email || "Not available"
    );

    // Department
    const hasDepartment = Boolean(currentUser.department);

    setVisible(
        "profileDepartmentRow",
        hasDepartment,
        "flex"
    );

    setText(
        "profileDepartment",
        hasDepartment ? currentUser.department : "—"
    );

    // Welcome message
    setText("welcomeMessage", `Welcome back, ${name}!`);

    if (currentUserRole === "STUDENT") {
        setText(
            "welcomeSubtitle",
            "Report campus maintenance problems and track your complaints."
        );

    } else if (currentUserRole === "STAFF") {
        setText(
            "welcomeSubtitle",
            "Manage maintenance complaints and monitor their progress."
        );

    } else if (currentUserRole === "ADMIN") {
        setText(
            "welcomeSubtitle",
            "Monitor campus complaints and manage maintenance operations."
        );
    }
}
