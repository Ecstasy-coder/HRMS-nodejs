// Date
const today = new Date();
document.getElementById("date").innerText =
today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});

// Example with data:

const payslips = [
    {
        month: "May 2026",
        gross: 1329.23,
        takeHome: 1329.23,
        bonus: 100,
        pf: 50,
        present: "1.0 / 26 days",
        paidOn: "13 May 2026"
    }
];


const container = document.querySelector(".cards");
const summaryCards = document.querySelector(".summary-cards");

// Clear cards
container.innerHTML = "";

if (payslips.length === 0) {
    summaryCards.style.display = "none";

    container.innerHTML = `
        <div class="no-data">
            <i class="fa fa-file-circle-xmark"></i>
            <h2>No Payslip Available</h2>
            <p>No salary slip found for this employee.</p>
        </div>
    `;
} else {
    // summaryCards.style.display = "flex";

    let totalGross = 0;
    let totalTakeHome = 0;
    let totalBonus = 0;
    let totalPF = 0;

    payslips.forEach(p => {
        totalGross += p.gross;
        totalTakeHome += p.takeHome;
        totalBonus += p.bonus;
        totalPF += p.pf;

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
                        <h5>GROSS</h5>
                        <p>₹${p.gross.toFixed(2)}</p>
                    </div>

                    <div class="salary take-home">
                        <h5>NET TAKE HOME</h5>
                        <p>₹${p.takeHome.toFixed(2)}</p>
                    </div>
                </div>

                <div class="details">
                    <p><strong>Present:</strong> ${p.present}</p>
                    <p><strong>Paid on:</strong> ${p.paidOn}</p>
                </div>

                <div class="card-buttons">
                    <button class="view-btn">
                        <i class="fa fa-eye"></i> View Payslip
                    </button>
                    <button class="pdf-btn">
                        <i class="fa fa-download"></i> PDF
                    </button>
                </div>
            </div>
        `;
    });

    document.getElementById("monthsPaid").innerText = payslips.length;
    document.getElementById("totalGross").innerText = `₹${totalGross.toFixed(2)}`;
    document.getElementById("totalTakeHome").innerText = `₹${totalTakeHome.toFixed(2)}`;
    document.getElementById("totalBonus").innerText = `₹${totalBonus.toFixed(2)}`;
    document.getElementById("totalPF").innerText = `₹${totalPF.toFixed(2)}`;
}