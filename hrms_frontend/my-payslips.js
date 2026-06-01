// Date
const today = new Date();
document.getElementById("currentDate").innerText =
  today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

async function loadPayslips() {
  try {
    const empCode = "ECS000685";
    // const user = JSON.parse(localStorage.getItem("user"));
    // const empCode = user.empCode;

    const response = await fetch(`/api/payslip/${empCode}`);
    const data = await response.json();

    console.log(data);

    const container = document.querySelector(".cards");
    const summaryCards = document.querySelector(".summary-cards");

    container.innerHTML = "";

    // Backend returns single object — convert to array
    const payslips = Array.isArray(data) ? data : (data ? [data] : []);

    if (!payslips.length) {
      summaryCards.style.display = "none";
      container.innerHTML = `
        <div class="no-payslip-box">
          <p>No payslips released for 2026. Payslips appear here after HR finalizes monthly payroll.</p>
        </div>
      `;
      return;
    }

    let totalGross = 0;
    let totalTakeHome = 0;
    let totalBonus = 0;
    let totalPF = 0;

    payslips.forEach(p => {
      totalGross    += Number(p.grossSalary  || 0);
      totalTakeHome += Number(p.netSalary    || 0);
      totalBonus    += Number(p.bonus        || 0);
      totalPF       += Number(p.pfEmployee   || 0);

      container.innerHTML += `
        <div class="payslip-card">
          <div class="card-header">
            <h3>${p.month}</h3>
            <span class="paid">
              <i class="fa fa-circle-check"></i> Paid
            </span>
          </div>

          <div class="salary-boxes">
            <div class="salary gross">
              <h5>Gross</h5>
              <p>₹${Number(p.grossSalary || 0).toFixed(2)}</p>
            </div>
            <div class="salary take-home">
              <h5>Net Take Home</h5>
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

    // Summary totals
    document.getElementById("monthsPaid").innerText   = payslips.length;
    document.getElementById("totalGross").innerText   = `₹${totalGross.toFixed(2)}`;
    document.getElementById("totalTakeHome").innerText = `₹${totalTakeHome.toFixed(2)}`;
    document.getElementById("totalBonus").innerText   = `₹${totalBonus.toFixed(2)}`;
    document.getElementById("totalPF").innerText      = `₹${totalPF.toFixed(2)}`;

  } catch (error) {
    console.error("Error loading payslips:", error);
  }
}

// Load payslips from API
loadPayslips();

// Click handlers
document.addEventListener("click", function (e) {
  // View button
  if (e.target.closest(".view-btn")) {
    const id = e.target.closest(".view-btn").dataset.id;
    window.location.href = `paybill.html?id=${id}`;
  }

  // PDF button — open paybill then print after data loads
  if (e.target.closest(".pdf-btn")) {
    const id = e.target.closest(".pdf-btn").dataset.id;
    const printWindow = window.open(`paybill.html?id=${id}`, "_blank");
    setTimeout(() => {
      printWindow.print();
    }, 2000);
  }
});
 // ── Logout ────────────────────────────────────────────────────────────────
  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  }