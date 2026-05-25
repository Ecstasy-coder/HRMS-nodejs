// // // Date
// const today = new Date();
// document.getElementById("date").innerText =
// today.toLocaleDateString("en-US", {
//     weekday: "long",
//     day: "numeric",
//     month: "long",
//     year: "numeric"
// });

// // Example with data:

// const payslips = [
//     {
//         month: "May 2026",
//         gross: 1329.23,
//         takeHome: 1329.23,
//         bonus: 100,
//         pf: 50,
//         present: "1.0 / 26 days",
//         paidOn: "13 May 2026"
//     }
// ];


// const container = document.querySelector(".cards");
// const summaryCards = document.querySelector(".summary-cards");

// // Clear cards
// container.innerHTML = "";

// if (payslips.length === 0) {
//     summaryCards.style.display = "none";

//     container.innerHTML = `
//         <div class="no-data">
//             <i class="fa fa-file-circle-xmark"></i>
//             <h2>No Payslip Available</h2>
//             <p>No salary slip found for this employee.</p>
//         </div>
//     `;
// } else {
//     // summaryCards.style.display = "flex";

//     let totalGross = 0;
//     let totalTakeHome = 0;
//     let totalBonus = 0;
//     let totalPF = 0;

//     payslips.forEach(p => {
//         totalGross += p.gross;
//         totalTakeHome += p.takeHome;
//         totalBonus += p.bonus;
//         totalPF += p.pf;

//         container.innerHTML += `
//             <div class="payslip-card">
//                 <div class="card-header">
//                     <h3>${p.month}</h3>
//                     <span class="paid">
//                         <i class="fa fa-circle-check"></i> Paid
//                     </span>
//                 </div>

//                 <div class="salary-boxes">
//                     <div class="salary gross">
//                         <h5>GROSS</h5>
//                         <p>₹${p.gross.toFixed(2)}</p>
//                     </div>

//                     <div class="salary take-home">
//                         <h5>NET TAKE HOME</h5>
//                         <p>₹${p.takeHome.toFixed(2)}</p>
//                     </div>
//                 </div>

//                 <div class="details">
//                     <p><strong>Present:</strong> ${p.present}</p>
//                     <p><strong>Paid on:</strong> ${p.paidOn}</p>
//                 </div>

//                 <div class="card-buttons">
//                     <button class="view-btn">
//                         <i class="fa fa-eye"></i> View Payslip
//                     </button>
//                     <button class="pdf-btn">
//                         <i class="fa fa-download"></i> PDF
//                     </button>
//                 </div>
//             </div>
//         `;
//     });

//     document.getElementById("monthsPaid").innerText = payslips.length;
//     document.getElementById("totalGross").innerText = `₹${totalGross.toFixed(2)}`;
//     document.getElementById("totalTakeHome").innerText = `₹${totalTakeHome.toFixed(2)}`;
//     document.getElementById("totalBonus").innerText = `₹${totalBonus.toFixed(2)}`;
//     document.getElementById("totalPF").innerText = `₹${totalPF.toFixed(2)}`;
// }

// document.addEventListener("click", function(e) {
//     if (e.target.closest(".view-btn")) {
//         window.location.href = "paybill.html";
//     }
// });

// Date
const today = new Date();
document.getElementById("date").innerText =
today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});

async function loadPayslips() {
    try {
        const empCode = "ECS000685";

       // or

        // const user = JSON.parse(localStorage.getItem("user"));

     //const empCode = user.empCode;



        // Correct API
        const response = await fetch(`/api/payslip/${empCode}`);
        const data = await response.json();
        
        console.log(data);

        const container = document.querySelector(".cards");
        const summaryCards = document.querySelector(".summary-cards");

        container.innerHTML = "";

        // Backend returns single object, convert to array
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
            totalGross += Number(p.grossSalary || 0);
            totalTakeHome += Number(p.netSalary || 0);
            totalBonus += Number(p.bonus || 0);
            totalPF += Number(p.pfEmployee || 0);

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

        // Summary
        document.getElementById("monthsPaid").innerText = payslips.length;
        document.getElementById("totalGross").innerText = `₹${totalGross.toFixed(2)}`;
        document.getElementById("totalTakeHome").innerText = `₹${totalTakeHome.toFixed(2)}`;
        document.getElementById("totalBonus").innerText = `₹${totalBonus.toFixed(2)}`;
        document.getElementById("totalPF").innerText = `₹${totalPF.toFixed(2)}`;

    } catch (error) {
        console.error("Error loading payslips:", error);
    }
}

// Load data from database
loadPayslips();

// View button click
document.addEventListener("click", function(e) {
    if (e.target.closest(".view-btn")) {
        const id = e.target.closest(".view-btn").dataset.id;
        window.location.href = `paybill.html?id=${id}`;
    }


     // PDF button
    if (e.target.closest(".pdf-btn")) {
        const id = e.target.closest(".pdf-btn").dataset.id;

        const printWindow = window.open(`paybill.html?id=${id}`, "_blank");

        // Wait for dynamic data to load before printing
        setTimeout(() => {
            printWindow.print();
        }, 2000);   // 2 seconds wait
    }
});
