document.addEventListener("DOMContentLoaded", function() {
    showCurrentDate();
    loadManagerData();
});

function showCurrentDate() {
    const currentDate = document.getElementById("currentDate");

    if (!currentDate) return;

    const date = new Date();

    currentDate.innerText = date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function loadManagerData() {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
        window.location.href = "index.html";
        return;
    }

    const user = JSON.parse(userData);

    const username = user.name || user.username || user.fullName || "User";
    const role = user.role || "manager";
    const department = user.department || "Management";

    document.getElementById("sidebarName").innerText = username;
    document.getElementById("sidebarRole").innerText = formatText(role);
    document.getElementById("sidebarDepartment").innerText = department;

    document.getElementById("welcomeName").innerText = username;
    document.getElementById("welcomeRole").innerText = formatText(role);
    document.getElementById("welcomeDepartment").innerText = department;
    document.getElementById("roleButton").innerText = formatText(role);

    const firstLetter = username.charAt(0).toUpperCase();

    document.getElementById("sidebarAvatar").innerText = firstLetter;
    document.getElementById("topAvatar").innerText = firstLetter;
}

function formatText(text) {
    return text
        .toString()
        .replace("_", " ")
        .replace(/\b\w/g, function(char) {
            return char.toUpperCase();
        });
}

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "index.html";
}