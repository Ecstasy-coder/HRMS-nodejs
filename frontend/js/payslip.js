/**
 * Safely updates an element's innerText only if it exists in the DOM.
 */
function safeSetText(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = value;
    } else {
        console.warn(`Element with id "${id}" not found in DOM.`);
    }
}

/**
 * Sets the date display.
 */
function setDate() {
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    safeSetText("date", dateStr);
}

/**
 * Fetches payslips and populates the UI.
 */
async function loadPayslips() {
    try {
        const empCode = "ECS000685";

        //or

    //     const user = JSON.parse(localStorage.getItem("user"));

    //  const empCode = user.empCode;

        const response = await fetch(`/api/payslip/${empCode}`);
        const data = await response.json();
        
        console.log("Data received:", data);

        const container = document.querySelector(".cards");
        if (!container) return;

        container.innerHTML = "";

        const payslips = Array.isArray(data) ? data : (data ? [data] : []);

        let totalGross = 0;
        let totalTakeHome = 0;
        let totalBonus = 0;
        let totalPF = 0;

        payslips.forEach(p => {
            totalGross += Number(p.grossSalary || 0);
            totalTakeHome += Number(p.netSalary || 0);
            totalBonus += Number(p.bonus || 0);
            totalPF += Number(p.pfEmployee || 0);

            container.innerHTML += `
                <div class="payslip-card">
                    <div class="card-header">
                        <h3>${p.month}</h3>
                        <span class="${(p.status || 'Draft').toLowerCase()}">
                            <i class="fa fa-circle-check"></i> ${p.status || "Draft"}
                        </span>
                    </div>
                    <div class="salary-boxes">
                        <div class="salary gross">
                            <h5>GROSS</h5>
                            <p>₹${Number(p.grossSalary || 0).toFixed(2)}</p>
                        </div>
                        <div class="salary take-home">
                            <h5>NET TAKE HOME</h5>
                            <p>₹${Number(p.netSalary || 0).toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="details">
                        <p><strong>Name:</strong> ${p.employeeName || ""}</p>
                        <p><strong>Department:</strong> ${p.department || ""}</p>
                        <p><strong>Employee Code:</strong> ${p.empCode || ""}</p>
                        <p><strong>Present:</strong> ${p.presentDays || 0} / ${p.workingDays || 0} days</p>
                        <p><strong>Paid on:</strong> ${p.paymentDate || ""}</p>
                    </div>
                    <div class="card-buttons">
                        <button class="view-btn" data-id="${p._id}">
                            <i class="fa fa-eye"></i> View Payslip
                        </button>
                        <button class="pdf-btn" data-id="${p._id}">
                            <i class="fa fa-download"></i> PDF
                        </button>
                    </div>
                </div>
            `;
        });

        // Use safeSetText to prevent TypeError if IDs are missing from the page
        safeSetText("monthsPaid", payslips.length);
        safeSetText("totalGross", `₹${totalGross.toFixed(2)}`);
        safeSetText("totalTakeHome", `₹${totalTakeHome.toFixed(2)}`);
        safeSetText("totalBonus", `₹${totalBonus.toFixed(2)}`);
        safeSetText("totalPF", `₹${totalPF.toFixed(2)}`);

    } catch (error) {
        console.error("Error loading payslips:", error);
    }
}

/**
 * Initializes the page by loading HTML components first.
 */
async function initPage() {
    try {
        await Promise.all([
            fetch("sidebar.html").then(r => r.text()).then(d => document.getElementById("sidebar").innerHTML = d),
            fetch("topbar.html").then(r => r.text()).then(d => document.getElementById("topbar-container").innerHTML = d)
        ]);
        
        // Components loaded, now run logic
        setDate();
        loadPayslips();
    } catch (err) {
        console.error("Initialization failed:", err);
    }
}

// Global Event Delegation for buttons
document.addEventListener("click", function(e) {
    const viewBtn = e.target.closest(".view-btn");
    const pdfBtn = e.target.closest(".pdf-btn");

    if (viewBtn) {
        window.location.href = `paybill.html?id=${viewBtn.dataset.id}`;
    }

    if (pdfBtn) {
        const id = pdfBtn.dataset.id;
        const printWindow = window.open(`paybill.html?id=${id}`, "_blank");
        setTimeout(() => printWindow.print(), 2000);
    }
});

// Run
initPage();