fetch("./sidebar.html")
    .then((response) => response.text())
    .then((data) => {
        document.getElementById("sidebarContainer").innerHTML = data;
    })
    .catch((error) => {
        console.log("Sidebar loading failed:", error);
    });

function loadSidebarUser() {
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const name = user.name || "User";
    const role = user.role || "Manager";
    const department = user.department || "Department";

    const sidebarAvatar = document.getElementById("sidebarAvatar");
    const sidebarName = document.getElementById("sidebarName");
    const sidebarRole = document.getElementById("sidebarRole");
    const sidebarDepartment = document.getElementById("sidebarDepartment");

    if (sidebarAvatar) sidebarAvatar.textContent = name.charAt(0).toUpperCase();
    if (sidebarName) sidebarName.textContent = name;
    if (sidebarRole) sidebarRole.textContent = role;
    if (sidebarDepartment) sidebarDepartment.textContent = department;
}

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
}