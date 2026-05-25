const payrollTable =
document.getElementById(
"payrollTable"
);

const historyTable =
document.getElementById(
"historyTable"
);

const runBtn =
document.querySelector(
".run-btn"
);

const viewBtn =
document.querySelector(
".view-btn"
);

const csvBtn =
document.querySelector(
".csv-btn"
);

const payrollMonth =
document.getElementById(
"payrollMonth"
);


/* =========================
   VIEW BUTTON
========================= */

viewBtn.addEventListener(
"click",
()=>{

alert(
"Viewing Payroll for " +
document.getElementById(
"recordMonth"
).innerHTML
);

}
);


/* =========================
   RUN PAYROLL
========================= */

runBtn.addEventListener(
"click",
runPayroll
);

async function runPayroll(){

try{

await fetch(
"http://localhost:5000/api/payroll/run",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

month:
document.getElementById(
"recordMonth"
).innerHTML

})

}

);

loadPayroll();

alert(
"Payroll Generated Successfully"
);

}

catch(error){

console.log(error);

alert(
"Payroll Failed"
);

}

}


/* =========================
   LOAD PAYROLL
========================= */

async function loadPayroll(){

const response =
await fetch("http://localhost:5000/api/payroll");

const payrolls =
await response.json();

payrollTable.innerHTML = "";

historyTable.innerHTML = "";

let totalGross = 0;

let totalNet = 0;

payrolls.forEach((item)=>{

totalGross +=
item.grossSalary || 0;

totalNet +=
item.netSalary || 0;

payrollTable.innerHTML += `

<tr>

<td>
<div class="emp-name">
${item.employeeName || "Employee"}
</div>

<div class="emp-role">
${item.designation || "Developer"} · ${item.empCode || "EMP001"}
</div>
</td>

<td>
${item.attendance || 26}.0 / 26
<br>
<span class="absent">
${26-(item.attendance || 26)}.0 absent
</span>
</td>

<td>
₹ ${item.overtimeRate || 0}
</td>

<td>
₹ ${item.grossSalary || 0}
</td>

<td>
₹ 0
</td>

<td class="deduction">
₹ ${item.totalDeduction || 0}
</td>

<td class="net">
₹ ${item.netSalary || 0}
</td>

<td>
<span class="paid-status">
${item.status || "Paid"}
</span>
</td>

<td>
<button
class="payslip-btn"
onclick="openPayslip('${item._id}')">
Payslip
</button>
</td>

</tr>
`;
});


/* =========================
   HISTORY TABLE
========================= */

const monthMap = {};

payrolls.forEach(item => {
    const month = item.month || "Unknown";

    if (!monthMap[month]) {
        monthMap[month] = {
            employees: 0,
            gross: 0,
            net: 0,
            processedBy: "Finance Manager",
            processedOn: new Date().toLocaleString()
        };
    }

    monthMap[month].employees++;
    monthMap[month].gross += item.grossSalary || 0;
    monthMap[month].net += item.netSalary || 0;
});

historyTable.innerHTML = "";

Object.keys(monthMap).forEach(month => {
    const data = monthMap[month];

    historyTable.innerHTML += `
    <tr>
        <td>${month}</td>
        <td>${data.employees}</td>
        <td>₹ ${data.gross}</td>
        <td>₹ ${data.net}</td>
        <td>${data.processedBy}</td>
        <td>${data.processedOn}</td>
    </tr>
    `;
});


/* =========================
   TOP STATS
========================= */

document.getElementById(
"employeeCount"
).innerHTML =
payrolls.length;

document.getElementById(
"paidCount"
).innerHTML =
payrolls.length;

document.getElementById(
"grossTotal"
).innerHTML =
`₹ ${totalGross}`;

document.getElementById(
"netTotal"
).innerHTML =
`₹ ${totalNet}`;

}


/* =========================
   PAYSLIP PAGE OPEN
========================= */

function openPayslip(id){

window.location.href =

`paybill.html?id=${id}`;

}


/* =========================
   CSV DOWNLOAD
========================= */

csvBtn.addEventListener(
"click",
downloadCSV
);

function downloadCSV(){

let csv =
"Employee,Month,Gross,Deductions,Net Salary\n";

fetch("http://localhost:5000/api/payroll")

.then(res=>res.json())

.then(data=>{

data.forEach((item)=>{

csv +=

`${item.employeeName},
${item.month},
${item.grossSalary},
${item.deductions},
${item.netSalary}\n`;

});

const blob =
new Blob(
[csv],
{type:"text/csv"}
);

const url =
window.URL.createObjectURL(
blob
);

const a =
document.createElement("a");

a.href = url;

a.download =
"payroll-report.csv";

a.click();

});

}


/* =========================
   INITIAL LOAD
========================= */

loadPayroll();
function openPayslip(id){

window.location.href =
`paybill.html?id=${id}`;

}

