const galleryImages = [

    "assets/images/2025-12-08.jpg",
    "assets/images/2025-12-09.jpg",
    "assets/images/2026-03-16.jpg"

];

const mainImage =
document.getElementById("mainGalleryImage");

const thumbnails =
document.querySelectorAll(".mini-img");

let current = 0;

/* AUTO SLIDE */

function changeGallery(){

    current++;

    if(current >= galleryImages.length){
        current = 0;
    }

    mainImage.style.opacity = 0;

    setTimeout(()=>{

        mainImage.src = galleryImages[current];

        mainImage.style.opacity = 1;

    },400);

    thumbnails.forEach((img,index)=>{

        img.classList.remove("active");

        if(index === current){
            img.classList.add("active");
        }

    });

}

/* AUTO CHANGE */

setInterval(changeGallery,4000);

/* CLICK CHANGE */

thumbnails.forEach((img,index)=>{

    img.addEventListener("click",()=>{

        current = index;

        mainImage.src = img.src;

        thumbnails.forEach(i=>{
            i.classList.remove("active");
        });

        img.classList.add("active");

    });

});



    // fetch('sidebar.html')
    // .then(response => response.text()) 
    // .then(data => {
    //     document.getElementById('sidebar').innerHTML = data;
    // });

    // document.addEventListener('click', function(e) {
    //     const navLinks = e.target.closest("#sidebar .nav-link");
    //     if (!navLinks) return;

    //     document.querySelectorAll("#sidebar .nav-link").forEach(link => {
    //         link.classList.remove("active");
    //     });   
    
    // });


    document.addEventListener("DOMContentLoaded", () => {

    fetch('/sidebar.html')
    .then(response => response.text())
    .then(data => {
        const sidebar = document.getElementById('sidebar');

        if (sidebar) {
            sidebar.innerHTML = data;
        }
    });

    document.addEventListener('click', function(e) {
        const navLink = e.target.closest("#sidebar .nav-link");
        if (!navLink) return;

        document.querySelectorAll("#sidebar .nav-link").forEach(link => {
            link.classList.remove("active");
        });

        navLink.classList.add("active");
    });

});



  fetch("topbar.html")
            .then(res => res.text())
            .then(html => {
                document.getElementById("topbar-container").innerHTML = html;

                // ✅ Run AFTER topbar is injected
                const MODULE_MAP = {
                    "manager": {
                        name: "Dashboard",
                        icon: "fas fa-th-large"
                    },
                    "dashboard": {
                        name: "Dashboard",
                        icon: "fas fa-th-large"
                    },
                    "myattendence": {
                        name: "My Attendance",
                        icon: "far fa-calendar-check"
                    },
                    "myleaves": {
                        name: "My Leaves",
                        icon: "far fa-calendar-alt"
                    },
                    "leaveapprovals": {
                        name: "Leave Approvals",
                        icon: "far fa-user"
                    },
                    "reviewem": {
                        name: "Review Employee Job Cards",
                        icon: "far fa-user-circle"
                    },
                    "myjobcards": {
                        name: "My Job Cards",
                        icon: "far fa-file-alt"
                    },
                    "ticket": {
                        name: "Help Desk",
                        icon: "far fa-comment"
                    },
                    "calender": {
                        name: "Holiday Calendar",
                        icon: "far fa-calendar"
                    },
                    "birthdays": {
                        name: "Birthdays",
                        icon: "fas fa-birthday-cake"
                    },
                    "impevents": {
                        name: "Important Events",
                        icon: "far fa-star"
                    },
                    "payslips": {
                        name: "My Payslips",
                        icon: "fas fa-sack-dollar"
                    },
                    "analysis": {
                        name: "Analysis",
                        icon: "fas fa-chart-line"
                    },
                    "aboutus": {
                        name: "About Us",
                        icon: "fas fa-circle-info"
                    },
                    "profile": {
                        name: "My Profile",
                        icon: "fas fa-user"
                    },
                };

                const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                // Set module name + icon
                const slug = decodeURIComponent(location.pathname.split("/").pop()).replace(".html", "").toLowerCase();
                const mod = MODULE_MAP[slug] || MODULE_MAP["dashboard"];
                document.getElementById("topbar-module-name").textContent = mod.name;
                document.getElementById("topbar-icon").className = mod.icon;

                // Set live date
                function setDate() {
                    const d = new Date();
                    document.getElementById("topbar-date").textContent =
                        `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
                }
                setDate();
                setInterval(setDate, 60000);

                // Set avatar from localStorage
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                const username = user.name || user.username || user.fullName || "";
                if (username) {
                    const initials = username.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                    document.getElementById("topbar-avatar").textContent = initials;
                }
            });

            /* =========================
   DASHBOARD CARD REDIRECT
========================= */

document.addEventListener(
"DOMContentLoaded",
()=>{

const cards =
document.querySelectorAll(
".quick-card"
);

cards.forEach(card=>{

card.style.cursor = "pointer";

card.addEventListener(
"click",
()=>{

const page =
card.getAttribute(
"data-page"
);

/* VALIDATION */

if(!page){

alert(
"Page not found"
);

return;

}

/* OPEN INSIDE IFRAME */

if(
window.parent &&
window.parent.frames["contentFrame"]
){

window.parent.frames[
"contentFrame"
].location.href = page;

}
else{

window.location.href =
page;

}

});

});

});

/* =========================
   PAYROLL STATUS
========================= */

async function loadPayrollStatus(){

try{

const response =
await fetch(
"http://localhost:5000/api/payroll"
);

const payrolls =
await response.json();

/* TOTAL NET */

let totalNet = 0;

payrolls.forEach(item=>{

totalNet +=
item.netSalary || 0;

});

/* PAID EMPLOYEES */

const paidEmployees =
payrolls.filter(
item=>item.status === "Paid"
).length;

/* STATUS */

const payrollStatus =
paidEmployees > 0
? "Paid"
: "Draft";

/* UPDATE UI */

document.getElementById(
"payrollStatus"
).innerHTML =
payrollStatus;

document.getElementById(
"payrollEmployees"
).innerHTML =
`${paidEmployees} employees`;

document.getElementById(
"payrollAmount"
).innerHTML =
`₹ ${totalNet.toLocaleString()}`;

}
catch(error){

console.log(
"Payroll Status Error",
error
);

}

}

/* =========================
   OPEN PAYROLL PAGE
========================= */

document.addEventListener(
"DOMContentLoaded",
()=>{

const openBtn =
document.getElementById(
"openPayrollBtn"
);

if(openBtn){

openBtn.addEventListener(
"click",
()=>{

/* OPEN INSIDE IFRAME */

if(
window.parent &&
window.parent.frames["contentFrame"]
){

window.parent.frames[
"contentFrame"
].location.href =
"payroll.html";

}
else{

window.location.href =
"payroll.html";

}

});

}

/* LOAD PAYROLL */

loadPayrollStatus();

});