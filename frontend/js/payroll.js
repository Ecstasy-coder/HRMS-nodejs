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

viewBtn.addEventListener(
"click",
()=>{

alert(
"Viewing Payroll for " +
document.getElementById(
"monthInput"
).value
);

}
);

runBtn.addEventListener(
"click",
runPayroll
);

async function runPayroll(){

const response =
await fetch("/api/salary");

const salaries =
await response.json();

for(const item of salaries){

const payrollData = {

employeeId:
item.employeeName,

designation:
item.designation,

empCode:
item.empCode || "EMP0043",

attendance:
Math.floor(
Math.random()*3
),

grossSalary:
item.grossSalary,

deductions:
0,

netSalary:
item.netSalary,

month:"May 2026",

status:"Paid"

};

await fetch(
"/api/payroll/run",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify(
payrollData
)

}

);

}

loadPayroll();

alert(
"Payroll Generated Successfully"
);

}

async function loadPayroll(){

const response =
await fetch("/api/payroll");

const payrolls =
await response.json();

payrollTable.innerHTML = "";

historyTable.innerHTML = "";

let totalGross = 0;

let totalNet = 0;

payrolls.forEach((item)=>{

totalGross += item.grossSalary;

totalNet += item.netSalary;

payrollTable.innerHTML += `

<tr>

<td>

<div class="emp-name">
${item.employeeId}
</div>

<div class="emp-role">
Engineering ·
${item.empCode}
</div>

</td>

<td>

${item.attendance}.0 / 26

<br>

<span class="absent">

${26-item.attendance}.0 absent

</span>

</td>

<td>—</td>

<td>
₹ ${item.grossSalary}
</td>

<td>—</td>

<td class="deduction">
₹ ${item.deductions}
</td>

<td class="net">
₹ ${item.netSalary}
</td>

<td>

<span class="paid-status">
Paid
</span>

</td>

<td>

<button class="payslip-btn">

Payslip

</button>

</td>

</tr>

`;

historyTable.innerHTML += `

<tr>

<td>May 2026</td>

<td>0</td>

<td>₹ 0.00</td>

<td>₹ 0.00</td>

<td>Finance Manager</td>

<td>
20 May 2026 04:43
</td>

</tr>

`;

});

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

loadPayroll();
const csvBtn =
document.querySelector(
".csv-btn"
);

csvBtn.addEventListener(
"click",
downloadCSV
);

function downloadCSV(){

let csv =
"Employee,Month,Gross,Deductions,Net Salary\n";

fetch("/api/payroll")

.then(res=>res.json())

.then(data=>{

data.forEach((item)=>{

csv +=
`${item.employeeId},
${item.month},
${item.grossSalary},
${item.deductions},
${item.netSalary}\n`;

});

const blob =
new Blob([csv],
{type:"text/csv"});

const url =
window.URL.createObjectURL(blob);

const a =
document.createElement("a");

a.href = url;

a.download =
"payroll-report.csv";

a.click();

});

}