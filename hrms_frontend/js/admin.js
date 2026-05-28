const API_BASE_URL = "http://localhost:5000/api/auth";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
        window.location.href = "index.html";
        return;
    }

    const user = JSON.parse(userData);

    if (user.role !== "admin") {
        alert("Access denied. Admin only.");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("userInfo").innerText =
        `${user.name} | ${user.email} | ${user.role}`;
});

async function createUser() {
    const token = localStorage.getItem("token");
    const message = document.getElementById("createMessage");

    const name = document.getElementById("newName").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const password = document.getElementById("newPassword").value.trim();
    const role = document.getElementById("newRole").value;

    if (!name || !email || !password || !role) {
        message.style.color = "red";
        message.innerText = "Name, email, password and role are required";
        return;
    }

    const userData = {
        name,
        email,
        password,
        role,
        employeeId: document.getElementById("employeeId").value.trim(),
        department: document.getElementById("department").value.trim(),
        designation: document.getElementById("designation").value.trim(),
        phoneNumber: document.getElementById("phoneNumber").value.trim(),
        dateOfBirth: document.getElementById("dateOfBirth").value || null,
        dateOfJoining: document.getElementById("dateOfJoining").value || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/admin/create-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            message.style.color = "red";
            message.innerText = data.message || "User creation failed";
            return;
        }

        message.style.color = "green";
        message.innerText = data.message || "User created successfully";

        clearForm();

    } catch (error) {
        console.error("Create user error:", error);
        message.style.color = "red";
        message.innerText = "Server error. Please check backend.";
    }
}

function clearForm() {
    document.getElementById("newName").value = "";
    document.getElementById("newEmail").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("newRole").value = "";
    document.getElementById("employeeId").value = "";
    document.getElementById("department").value = "";
    document.getElementById("designation").value = "";
    document.getElementById("phoneNumber").value = "";
    document.getElementById("dateOfBirth").value = "";
    document.getElementById("dateOfJoining").value = "";
}

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
}