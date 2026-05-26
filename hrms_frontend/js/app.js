const API_URL = "http://localhost:5000/api";

const authBox = document.getElementById("authBox");
const dashboardBox = document.getElementById("dashboardBox");

const authMessage = document.getElementById("authMessage");
const createMessage = document.getElementById("createMessage");

const dashboardTitle = document.getElementById("dashboardTitle");
const userInfo = document.getElementById("userInfo");
const statsCards = document.getElementById("statsCards");
const accessList = document.getElementById("accessList");

const createUserBox = document.getElementById("createUserBox");
const newRole = document.getElementById("newRole");

window.onload = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
        const role = user.role;

        if (role === "admin") window.location.href = "admin.html";
        else if (role === "hr") window.location.href = "hr.html";
        else if (role === "manager") window.location.href = "manager.html";
        else if (role === "employee") window.location.href = "employee.html";
        else if (role === "finance") window.location.href = "finance.html";
    }
};

async function registerAdmin() {
    const name = document.getElementById("adminName").value;
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    try {
        const res = await fetch(`${API_URL}/auth/register-admin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        authMessage.style.color = data.success ? "green" : "red";
        authMessage.innerText = data.message;
    } catch (error) {
        authMessage.innerText = "Server error";
    }
}

// async function loginUser() {
//     const email = document.getElementById("loginEmail").value;
//     const password = document.getElementById("loginPassword").value;

//     try {
//         const res = await fetch(`${API_URL}/auth/login`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ email, password }),
//         });

//         const data = await res.json();

//         if (!data.success) {
//             authMessage.style.color = "red";
//             authMessage.innerText = data.message;
//             return;
//         }

//         localStorage.setItem("token", data.token);
//         localStorage.setItem("user", JSON.stringify(data.user));

//         showDashboard(data.user);
//         loadDashboard(data.user.role);
//     } catch (error) {
//         authMessage.innerText = "Server error";
//     }
// }


async function loginUser() {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {

        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const data = await res.json();

        if (!data.success) {
            authMessage.style.color = "red";
            authMessage.innerText = data.message;
            return;
        }

        // Store login data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // ROLE BASED REDIRECT

        if (data.user.role === "admin") {
            window.location.href = "admin.html";
        } else if (data.user.role === "hr") {
            window.location.href = "hr.html";
        } else if (data.user.role === "manager") {
            window.location.href = "manager.html";
        } else if (data.user.role === "employee") {
            window.location.href = "employee.html";
        } else if (data.user.role === "finance") {
            window.location.href = "finance.html";
        } else {
            alert("Invalid role");
        }

    } catch (error) {
        authMessage.innerText = "Server error";
    }
}

function showDashboard(user) {
    authBox.classList.add("hidden");
    dashboardBox.classList.remove("hidden");

    dashboardTitle.innerText = `${capitalize(user.role)} Dashboard`;
    userInfo.innerText = `${user.name} | ${user.email} | Role: ${user.role}`;

    setupCreateUserForm(user.role);
}

function setupCreateUserForm(role) {
    newRole.innerHTML = "";

    if (role === "admin") {
        createUserBox.classList.remove("hidden");

        newRole.innerHTML = `
      <option value="">Select Role</option>
      <option value="hr">HR</option>
      <option value="finance">Finance</option>
    `;
    } else if (role === "hr") {
        createUserBox.classList.remove("hidden");

        newRole.innerHTML = `
      <option value="">Select Role</option>
      <option value="manager">Manager</option>
      <option value="employee">Employee</option>
    `;
    } else {
        createUserBox.classList.add("hidden");
    }
}

async function loadDashboard(role) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_URL}/dashboard/${role}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message);
            logoutUser();
            return;
        }

        displayStats(data.stats || {});
        displayAccess(data.access || []);
    } catch (error) {
        alert("Dashboard loading failed");
    }
}

function displayStats(stats) {
    statsCards.innerHTML = "";

    const keys = Object.keys(stats);

    if (keys.length === 0) {
        statsCards.innerHTML = `
      <div class="card">
        <h4>Status</h4>
        <h2>Active</h2>
      </div>
    `;
        return;
    }

    keys.forEach((key) => {
        statsCards.innerHTML += `
      <div class="card">
        <h4>${formatKey(key)}</h4>
        <h2>${stats[key]}</h2>
      </div>
    `;
    });
}

function displayAccess(access) {
    accessList.innerHTML = "";

    access.forEach((item) => {
        accessList.innerHTML += `<li>${item}</li>`;
    });
}

async function createUser() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const name = document.getElementById("newName").value;
    const email = document.getElementById("newEmail").value;
    const password = document.getElementById("newPassword").value;
    const role = document.getElementById("newRole").value;

    if (!name || !email || !password || !role) {
        createMessage.style.color = "red";
        createMessage.innerText = "Please fill all fields";
        return;
    }

    let endpoint = "";

    if (user.role === "admin") {
        endpoint = `${API_URL}/auth/admin/create-user`;
    } else if (user.role === "hr") {
        endpoint = `${API_URL}/auth/hr/create-user`;
    } else {
        createMessage.innerText = "You do not have permission";
        return;
    }

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, email, password, role }),
        });

        const data = await res.json();

        createMessage.style.color = data.success ? "green" : "red";
        createMessage.innerText = data.message;

        if (data.success) {
            document.getElementById("newName").value = "";
            document.getElementById("newEmail").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("newRole").value = "";

            loadDashboard(user.role);
        }
    } catch (error) {
        createMessage.style.color = "red";
        createMessage.innerText = "User creation failed";
    }
}

function logoutUser() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "index.html";
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatKey(key) {
    return key
        .replace("total", "Total ")
        .replace(/([A-Z])/g, " $1")
        .trim();
}