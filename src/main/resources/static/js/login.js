
/* ==========================================
   SMART CAMPUS - LOGIN & REGISTRATION
   ========================================== */

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

const tabButtons = document.querySelectorAll(".tabs button");

// ==========================================
// SHOW LOGIN FORM
// ==========================================

function showLogin() {
    loginForm.style.display = "block";
    registerForm.style.display = "none";

    message.textContent = "";

    tabButtons.forEach(function(button, index) {
        button.classList.toggle("active", index === 0);
    });
}

// ==========================================
// SHOW REGISTRATION FORM
// ==========================================

function showRegister() {
    loginForm.style.display = "none";
    registerForm.style.display = "block";

    message.textContent = "";

    tabButtons.forEach(function(button, index) {
        button.classList.toggle("active", index === 1);
    });
}

// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    message.textContent = "";

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (response.ok) {
            const data = await response.json();

            message.style.color = "green";
            message.textContent =
                "Login successful! Welcome " + data.name;

            // Server-side authentication controls access.
            // Redirect to the main dashboard.
            window.location.href = "/pages/index.html";

        } else {
            message.style.color = "red";
            message.textContent = "Invalid email or password";
        }

    } catch (error) {
        message.style.color = "red";
        message.textContent = "Unable to connect to server";
    }
});

// ==========================================
// REGISTRATION
// ==========================================

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    message.textContent = "";

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        if (response.ok) {
            registerForm.reset();
            showLogin();

            message.style.color = "green";
            message.textContent =
                "Registration successful! Please login.";

        } else {
            message.style.color = "red";
            message.textContent = await response.text();
        }

    } catch (error) {
        message.style.color = "red";
        message.textContent = "Unable to connect to server";
    }
});

// ==========================================
// INITIALIZE LOGIN PAGE
// ==========================================

showLogin();
