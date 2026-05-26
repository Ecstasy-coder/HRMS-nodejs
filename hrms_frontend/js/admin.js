const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user || user.role !== "admin") {
    window.location.href = "index.html";
}

document.getElementById("userInfo").innerText =
    `${user.name} | ${user.email} | Role: ${user.role}`;

async function createUser() {
    const name = document.getElementById("newName").value;
    const email = document.getElementById("newEmail").value;
    const password = document.getElementById("newPassword").value;
    const role = document.getElementById("newRole").value;
    const msg = document.getElementById("createMessage");

    if (!name || !email || !password || !role) {
        msg.style.color = "red";
        msg.innerText = "Please fill all fields";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/admin/create-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, email, password, role }),
        });

        const data = await res.json();

        msg.style.color = data.success ? "green" : "red";
        msg.innerText = data.message;

    } catch (error) {
        msg.style.color = "red";
        msg.innerText = "Admin user creation failed";
    }
}

function logoutUser() {
    localStorage.clear();
    window.location.href = "index.html";
}