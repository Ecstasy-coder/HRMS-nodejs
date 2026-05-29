// topbar-init.js — include on every page
const MODULE_MAP = {
    "dashboard": { name: "Dashboard", icon: "far fa-th-large" },
    "attendance": { name: "Attendance", icon: "far fa-check-square" },
    "holiday-calendar": { name: "Holiday Calendar", icon: "far fa-calendar" },
    "events": { name: "Events", icon: "far fa-star" },
    "help-desk": { name: "Help Desk", icon: "far fa-comment" },
    "manage-users": { name: "Manage Users", icon: "far fa-user" },
    "leave-approvals": { name: "Leave Approvals", icon: "fa-regular fa-envelope" },
    "gallery": { name: "Gallery", icon: "far fa-image" },
};

function initTopbar() {
    // Auto-detect module from filename: leave-approvals.html → "leave-approvals"
    const slug = location.pathname.split("/").pop().replace(".html", "");
    const mod = MODULE_MAP[slug] || MODULE_MAP["dashboard"];

    document.getElementById("topbar-module-name").textContent = mod.name;
    document.getElementById("topbar-icon").className = mod.icon;

    // Live date, updates every minute
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function setDate() {
        const d = new Date();
        document.getElementById("topbar-date").textContent =
            `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
    setDate();
    setInterval(setDate, 60000);

    // Set avatar initials from logged-in user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const initials = (user.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    document.getElementById("topbar-avatar").textContent = initials;
}

initTopbar();