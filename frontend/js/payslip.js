// Date
const today = new Date();
document.getElementById("date").innerText =
today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});

// Sample payslip data
const payslips = [
   
];

// Elements
const emptyMessage = document.getElementById("emptyMessage");
const container = document.getElementById("payslipContainer");
const summaryCards = document.querySelector(".summary-cards");

// Check data
if (payslips.length === 0) {
    emptyMessage.style.display = "block";
    container.style.display = "none";
    summaryCards.style.display = "none";
} else {
    emptyMessage.style.display = "none";
    container.style.display = "flex";
    summaryCards.style.display = "flex";

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
            <div class="card">
                <span class="status">✓ Paid</span>
                <h3>${p.month}</h3>

                <div class="salary-box">
                    <div class="salary-item">
                        <h4>Gross</h4>
                        <p>₹${p.gross.toFixed(2)}</p>
                    </div>

                    <div class="salary-item">
                        <h4>Net Take Home</h4>
                        <p>₹${p.takeHome.toFixed(2)}</p>
                    </div>
                </div>

                <p><strong>Present:</strong> ${p.present}</p>
                <p><strong>Paid on:</strong> ${p.paidOn}</p>

                <button class="view-btn">View Payslip</button>
                <button class="pdf-btn">PDF</button>
            </div>
        `;
    });

    // Update summary cards
    document.getElementById("monthsPaid").innerText = payslips.length;
    document.getElementById("totalGross").innerText = `₹${totalGross.toFixed(2)}`;
    document.getElementById("totalTakeHome").innerText = `₹${totalTakeHome.toFixed(2)}`;
    document.getElementById("totalBonus").innerText = `₹${totalBonus.toFixed(2)}`;
    document.getElementById("totalPF").innerText = `₹${totalPF.toFixed(2)}`;
}