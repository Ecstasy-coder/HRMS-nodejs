// DOM Element Selectors
const payrollTable = document.getElementById("payrollTable");
const historyTable = document.getElementById("historyTable");
const runBtn = document.querySelector(".run-btn");
const viewBtn = document.querySelector(".view-btn");
const csvBtn = document.querySelector(".csv-btn");
const payrollMonth = document.getElementById("payrollMonth");
const finalizeBtn = document.getElementById("finalizeBtn");
const markPaidBtn = document.getElementById("markPaidBtn");
const paymentControls = document.getElementById("paymentControls"); 
const adjustPayrollBtn = document.getElementById("adjustPayrollBtn");

/* =========================
   VIEW BUTTON
========================= */
if (viewBtn) {
    viewBtn.addEventListener("click", () => {
        const selectedValue = payrollMonth.value;
        const [year, month] = selectedValue.split("-");

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const formattedMonth = `${monthNames[parseInt(month) - 1]} ${year}`;
        document.getElementById("payrollMonthText").innerText = formattedMonth;
        runBtn.innerHTML = `▶ Run Payroll — ${formattedMonth}`;

        loadPayroll();
    });
}

/* =========================
   RUN PAYROLL
========================= */
if (runBtn) {
    runBtn.addEventListener("click", runPayroll);
}

async function runPayroll() {
    const selectedValue = payrollMonth.value; 
    const [year, month] = selectedValue.split("-");
    
    try {
        const response = await fetch("http://localhost:5000/api/payroll/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ month, year })
        });

        const result = await response.json();
        if (!response.ok) {
            alert(result.message || "Payroll Generation Failed");
            return;
        }

        await loadPayroll();
        alert(result.message || "Payroll Processed Successfully");
    } catch (error) {
        console.error(error);
        alert("Payroll Failed");
    }
}


/* =========================
   FINALIZE PAYROLL
========================= */
if (finalizeBtn) {
    finalizeBtn.addEventListener("click", finalizePayroll);
}

async function finalizePayroll() {
    if (!payrollMonth || !payrollMonth.value) return;
    const [year, month] = payrollMonth.value.split("-");
    
    try {
        const response = await fetch("http://localhost:5000/api/payroll/finalize", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ month, year })
        });

        const result = await response.json();
        if (!response.ok) {
            alert(result.message || "Finalize Failed");
            return;
        }

        alert("Payroll Finalized Successfully!");
        await loadPayroll();
    } catch (error) {
        console.error(error);
        alert("Finalize Failed");
    }
}

/* =========================
   MARK AS PAID
========================= */
if (markPaidBtn) {
    markPaidBtn.addEventListener("click", markAsPaid);
}

async function markAsPaid() {
    const paymentMethod = document.getElementById("paymentMethod").value;
    const paymentDate = document.getElementById("paymentDate").value;
    const utrNumber = document.getElementById("utrNumber").value;

    if (!paymentMethod) { alert("Select payment method"); return; }
    if (!paymentDate) { alert("Select payment date"); return; }
    if (!utrNumber) { alert("Enter UTR / Reference number"); return; }

    const [year, month] = payrollMonth.value.split("-");

    try {
        const response = await fetch("http://localhost:5000/api/payroll/paid", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                month,
                year,
                paymentMethod,
                paymentDate: new Date(paymentDate).toLocaleDateString(),
                utrNumber
            })
        });

        const result = await response.json();
        if (!response.ok) {
            alert(result.message || "Payment Update Failed");
            return;
        }

        alert("Payroll marked as paid");
        
        document.getElementById("paymentMethod").value = "";
        document.getElementById("paymentDate").value = "";
        document.getElementById("utrNumber").value = "";

        await loadPayroll();
    } catch (error) {
        console.error(error);
        alert("Payment update failed");
    }
}

/* =========================
   LOAD PAYROLL & HISTORY
========================= */
async function loadPayroll() {
    try {
        if (!payrollMonth || !payrollMonth.value) return;

        const [selectedYear, selectedMonth] = payrollMonth.value.split("-");
        const response = await fetch(`http://localhost:5000/api/payroll?month=${selectedMonth}&year=${selectedYear}`);

        if (!response.ok) throw new Error("Server error");

        const result = await response.json();
        const payrolls = result.data || [];

        payrollTable.innerHTML = "";

        const historyResponse = await fetch("http://localhost:5000/api/payroll");
        const historyResult = await historyResponse.json();
        const allPayrolls = historyResult.data || []; 

        const statusText = document.getElementById("payrollStatusText");

        if (payrolls.length === 0) {
            payrollTable.innerHTML = `<tr><td colspan="9" style="text-align:center;">No payroll record found</td></tr>`;
            document.getElementById("payrollCount").innerText = 0;
            document.getElementById("draftCount").innerText = 0;
            document.getElementById("finalizedCount").innerText = 0;
            document.getElementById("paidCount").innerText = 0;
            document.getElementById("totalGross").innerText = "₹ 0";
            document.getElementById("totalNet").innerText = "₹ 0";

            if (statusText) statusText.innerHTML = "No payroll records initialized for this month.";
            if (finalizeBtn) finalizeBtn.style.display = "none";
            if (adjustPayrollBtn) adjustPayrollBtn.style.display = "none"; 
            if (paymentControls) paymentControls.style.display = "none";
        } else {
            let totalGross = 0;
            let totalNet = 0;

            payrolls.forEach((item) => {
                totalGross += item.grossSalary || 0;
                totalNet += item.netSalary || 0;

                payrollTable.innerHTML += `
                <tr>
                    <td>
                        <div class="emp-name">${item.employeeName || "-"}</div>
                        <div class="emp-role">${item.designation || "-"} · ${item.employeeId || "-"}</div>
                    </td>
                    <td>${item.attendance || 0}</td>
                    <td>${item.overtimeRate || 0}</td>
                    <td>₹ ${item.grossSalary || 0}</td>
                    <td>₹ ${item.variablePay || 0}</td>
                    <td>₹ ${item.deductions || 0}</td> 
                    <td>₹ ${item.netSalary || 0}</td>
                    <td><span class="status-badge">${item.status || "Draft"}</span></td>
                    <td>
                        ${
                            item.status?.toLowerCase() === "draft"
                            ? `<button class="adjust-btn" onclick="openAdjustModal('${item._id}')">Adjust</button>`
                            : ""
                        }
                        <button class="payslip-btn" onclick="openPayslip('${item._id}')">Payslip</button>
                    </td>
                </tr>`;
            });

            const draft = payrolls.filter(item => item.status?.toLowerCase() === "draft").length;
            const finalized = payrolls.filter(item => item.status?.toLowerCase() === "finalized").length;
            const paid = payrolls.filter(item => item.status?.toLowerCase() === "paid").length;

            document.getElementById("payrollCount").innerText = payrolls.length;
            document.getElementById("draftCount").innerText = draft;
            document.getElementById("finalizedCount").innerText = finalized;
            document.getElementById("paidCount").innerText = paid;
            document.getElementById("totalGross").innerText = `₹ ${totalGross}`;
            document.getElementById("totalNet").innerText = `₹ ${totalNet}`;

            /* ==========================================
               STATE MACHINE PANEL CONTROLS
            ========================================== */
            if (statusText) {
                if (draft === payrolls.length && payrolls.length > 0) {
                    statusText.innerHTML = `<strong>Status: DRAFT.</strong> Review all records. Finalize when ready.`;
                    if (finalizeBtn) finalizeBtn.style.display = "inline-block";
                    if (adjustPayrollBtn) adjustPayrollBtn.style.display = "inline-block"; 
                    if (paymentControls) paymentControls.style.display = "none";
                } 
                else if (finalized === payrolls.length && payrolls.length > 0) {
                    statusText.innerHTML = `<strong>Status: FINALIZED.</strong> Salaries disbursed? Mark as paid to complete the cycle.`;
                    if (finalizeBtn) finalizeBtn.style.display = "none";
                    if (adjustPayrollBtn) adjustPayrollBtn.style.display = "none"; 
                    if (paymentControls) paymentControls.style.display = "flex"; 
                } 
                else if (paid === payrolls.length && payrolls.length > 0) {
                    statusText.innerHTML = `<strong>Status: PAID.</strong> Salary transactions have been completed for this month.`;
                    if (finalizeBtn) finalizeBtn.style.display = "none";
                    if (adjustPayrollBtn) adjustPayrollBtn.style.display = "none"; 
                    if (paymentControls) paymentControls.style.display = "none";
                }
                else {
                    statusText.innerHTML = `<strong>Status: MIXED.</strong> Items are split across multiple states.`;
                    if (finalizeBtn) finalizeBtn.style.display = "inline-block";
                    if (adjustPayrollBtn) adjustPayrollBtn.style.display = "inline-block"; 
                    if (paymentControls) paymentControls.style.display = "flex";
                }
            }
        }

        /* DYNAMIC HISTORY GENERATION */
        const monthMap = {};
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        allPayrolls.forEach(item => {
            const monthIdx = parseInt(item.month) - 1;
            const displayMonth = monthNames[monthIdx] ? `${monthNames[monthIdx]} ${item.year}` : `${item.month}-${item.year}`;
            
            if (!monthMap[displayMonth]) {
                monthMap[displayMonth] = {
                    employeeCodes: new Set(),
                    gross: 0,
                    net: 0,
                    processedBy: "Finance Manager",
                    processedOn: item.paymentDate || new Date().toLocaleDateString()
                };
            }
            monthMap[displayMonth].employeeCodes.add(item.employeeId);
            monthMap[displayMonth].gross += item.grossSalary || 0;
            monthMap[displayMonth].net += item.netSalary || 0;
        });

        historyTable.innerHTML = "";
        Object.keys(monthMap).forEach(key => {
            const data = monthMap[key];
            historyTable.innerHTML += `
            <tr>
                <td><strong>${key}</strong></td>
                <td>${data.employeeCodes.size} Employees</td>
                <td><span class="text-success">₹ ${data.gross}</span></td>
                <td><strong>₹ ${data.net}</strong></td>
                <td>${data.processedBy}</td>
                <td>${data.processedOn}</td>
            </tr>`;
        });

    } catch (error) {
        console.error(error);
    }
}

function openPayslip(id) { window.location.href = `paybill.html?id=${id}`; }
window.onload = () => { loadPayroll(); };

/* ==========================================
   ADJUSTMENT POPUP OVERLAY ACTION HANDLERS
========================================= */
let selectedPayrollId = null;

if (adjustPayrollBtn) {
    adjustPayrollBtn.addEventListener("click", () => {
        openAdjustModal(null); 
    });
}

async function openAdjustModal(id) {
    selectedPayrollId = id;
    const modal = document.getElementById("adjustModal");
    
    // Smooth high priority viewport rendering switch override
    modal.style.setProperty("display", "flex", "important");

    // Batch configuration route template setup
    if (!id) {
        document.getElementById("adjustTitle").innerText = `Adjust Batch Entries (Draft)`;
        document.getElementById("bonus").value = 0;
        document.getElementById("incentive").value = 0;
        document.getElementById("arrear").value = 0;
        document.getElementById("otherEarning").value = 0;
        document.getElementById("advanceRecovery").value = 0;
        document.getElementById("otherDeduction").value = 0;
        document.getElementById("financeRemark").value = "";
        return;
    }

    // Individual employee adjustment data tracking logic
    try {
        const response = await fetch(`http://localhost:5000/api/payroll/${id}`);
        const result = await response.json();
        const payroll = result.data || result;

        document.getElementById("adjustTitle").innerText = `Adjust: ${payroll.employeeName || "Employee"}`;
        document.getElementById("bonus").value = payroll.bonus || 0;
        document.getElementById("incentive").value = payroll.incentive || 0;
        document.getElementById("arrear").value = payroll.arrear || 0;
        document.getElementById("otherEarning").value = payroll.otherEarning || 0;
        document.getElementById("advanceRecovery").value = payroll.advanceRecovery || 0;
        document.getElementById("otherDeduction").value = payroll.otherDeduction || 0;
        document.getElementById("financeRemark").value = payroll.financeRemark || "";

    } catch (error) {
        console.error(error);
        alert("Failed to load payroll parameters.");
    }
}

function closeAdjustModal() {
    const modal = document.getElementById("adjustModal");
    modal.style.setProperty("display", "none", "important");
}

async function saveAdjustment() {
    try {
        const url = selectedPayrollId 
            ? `http://localhost:5000/api/payroll/adjust/${selectedPayrollId}`
            : `http://localhost:5000/api/payroll/adjust/batch`;

        const response = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                month: payrollMonth.value.split("-")[1],
                year: payrollMonth.value.split("-")[0],
                bonus: Number(document.getElementById("bonus").value),
                incentive: Number(document.getElementById("incentive").value),
                arrear: Number(document.getElementById("arrear").value),
                otherEarning: Number(document.getElementById("otherEarning").value),
                advanceRecovery: Number(document.getElementById("advanceRecovery").value),
                otherDeduction: Number(document.getElementById("otherDeduction").value),
                financeRemark: document.getElementById("financeRemark").value
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Adjustment could not be completed.");
            return;
        }

        alert("Payroll adjusted successfully");
        closeAdjustModal();
        loadPayroll();
    } catch (error) {
        console.error(error);
        alert("Adjustment processing error.");
    }
}


csvBtn.addEventListener("click", async () => {
    // Get the selected month/year from your UI
    const [year, month] = payrollMonth.value.split("-");
    
    try {
        const response = await fetch(`http://localhost:5000/api/payroll/export?month=${month}&year=${year}`);

        if (!response.ok) throw new Error("Failed to download CSV");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payroll-${year}-${month}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error(error);
        alert("CSV download failed");
    }
});