/* ══════════════════════════════════════════
   MODULE MAP — every page in sidebar
══════════════════════════════════════════ */

const MODULE_MAP = {

    "dashboard": {
        name: "Dashboard",
        icon: "fas fa-th-large"
    },

    "salary-structure": {
        name: "Salary Structure",
        icon: "fa-solid fa-dollar-sign"
    },

    "payroll": {
        name: "Payroll Processing",
        icon: "fa-solid fa-credit-card"
    },

    "payslip": {
        name: "My Payslips",
        icon: "fas fa-sack-dollar"
    },

    "importantevent": {
        name: "Important Events",
        icon: "far fa-star"
    },

    "calendar": {
        name: "Holiday Calendar",
        icon: "far fa-calendar"
    },

    "attendance": {
        name: "My Attendance",
        icon: "fas fa-calendar-check"
    },

    "my-leaves": {
        name: "My Leaves",
        icon: "far fa-calendar-alt"
    },

    "profile": {
        name: "My Profile",
        icon: "fas fa-user"
    }

};


/* ══════════════════════════════════════════
   DATE ARRAYS
══════════════════════════════════════════ */

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];


/* ══════════════════════════════════════════
   LIVE DATE
══════════════════════════════════════════ */

function setDate() {

    const dateEl =
        document.getElementById(
            "topbar-date"
        );

    if (!dateEl) return;

    const d = new Date();

    dateEl.textContent =
        `${DAYS[d.getDay()]},
        ${d.getDate()}
        ${MONTHS[d.getMonth()]}
        ${d.getFullYear()}`;
}


/* ══════════════════════════════════════════
   MODULE FROM PAGE NAME
══════════════════════════════════════════ */

function setModule() {

    const moduleName =
        document.getElementById(
            "topbar-module-name"
        );

    const moduleIcon =
        document.getElementById(
            "topbar-icon"
        );

    if (!moduleName || !moduleIcon) {
        return;
    }

    const raw =
        location.pathname
        .split("/")
        .pop();

    const slug =
        decodeURIComponent(raw)
        .replace(".html", "")
        .toLowerCase();

    console.log("Current Page:", slug);

    const mod =
        MODULE_MAP[slug] ||
        MODULE_MAP["dashboard"];

    moduleName.textContent =
        mod.name;

    moduleIcon.className =
        mod.icon;
}


/* ══════════════════════════════════════════
   AVATAR INITIALS
══════════════════════════════════════════ */

function setAvatar() {

    const avatar =
        document.getElementById(
            "topbar-avatar"
        );

    if (!avatar) return;

    const user =
        JSON.parse(
            localStorage.getItem("user") || "{}"
        );

    const username =
        user.name ||
        user.username ||
        user.fullName ||
        "";

    if (!username) return;

    const initials =
        username
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    avatar.textContent =
        initials;
}


/* ══════════════════════════════════════════
   LOAD TOPBAR
══════════════════════════════════════════ */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        fetch("topbar.html")

        .then(res => res.text())

        .then(data => {

            document.getElementById(
                "topbar-container"
            ).innerHTML = data;

            setModule();

            setDate();

            setAvatar();

            setInterval(
                setDate,
                60000
            );

        });

    }
);