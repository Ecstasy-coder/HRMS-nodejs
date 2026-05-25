/* =========================
   EMPLOYEE DATA
========================= */

const employees = [

{
name:"Chandan Kumar Giri",
department:"Engineering",
status:"orange",
empCode:"ECS000682",
designation:"Frontend Developer",
joiningDate:"2025-06-12",
pan:"ABCDE1234F",
uan:"556677889",
pf:"987654321",
bank:"HDFC Bank",
account:"458796321456",
ifsc:"HDFC0001122"
},

{
name:"Deepthi Sannayila",
department:"Engineering",
status:"green",
empCode:"ECS000683",
designation:"UI Developer",
joiningDate:"2024-04-18",
pan:"PQRSX9087L",
uan:"778899665",
pf:"456123789",
bank:"ICICI Bank",
account:"741258963852",
ifsc:"ICIC0004412"
},

{
name:"Finance Manager",
department:"Finance",
status:"red",
empCode:"ECS000685",
designation:"Finance Department",
joiningDate:"2024-04-30",
pan:"PQRSX90876",
uan:"778890000",
pf:"456156748",
bank:"SBI Bank",
account:"741258963800",
ifsc:"ICIC0004400"
},

{
name:"Lokesh",
department:"IT",
status:"orange",
empCode:"ECS000630",
designation:"Frontend Developer",
joiningDate:"2025-06-12",
pan:"ABCDE1500",
uan:"5566776000",
pf:"987654101",
bank:"uco Bank",
account:"4587963212000",
ifsc:"HDFC0001000"
},

];
      
       // when admin data come
//let employees = [];
//let selectedEmployee = null;

/* =========================
   ELEMENTS
========================= */

const employeeScroll =
document.getElementById(
"employeeScroll"
);

const employeeTitle =
document.getElementById(
"employeeTitle"
);

const historyBody =
document.getElementById(
"historyBody"
);

const saveBtn =
document.getElementById(
"saveBtn"
);

const cancelBtn =
document.getElementById(
"cancelBtn"
);

/* =========================
   DATE
========================= */

document.getElementById(
"todayDate"
).innerHTML =
new Date().toLocaleDateString(
"en-GB",
{
weekday:"long",
day:"numeric",
month:"long",
year:"numeric"
}
);

/* =========================
   LOAD EMPLOYEES
========================= */

function loadEmployees(){

employeeScroll.innerHTML = "";

employees.forEach((emp,index)=>{

employeeScroll.innerHTML += `

<div
class="employee-item"
onclick="selectEmployee(${index})">

<div class="employee-avatar">

${emp.name
.split(" ")
.map(word=>word[0])
.join("")
.substring(0,2)}

</div>

<div class="employee-info">

<div class="employee-name">
${emp.name}
</div>

<div class="employee-department">
${emp.department}
</div>

</div>

<div class="status-dot ${emp.status}">
</div>

</div>

`;

});

}

loadEmployees();

/* =========================
   SELECT EMPLOYEE
========================= */

function selectEmployee(index){
        // when data come from admin
   // selectedEmployee = employees[index];

document.getElementById(
"emptyState"
).style.display =
"none";

document.getElementById(
"salaryContainer"
).classList.remove(
"hidden"
);

const emp =
employees[index];

console.log(
"Selected Employee:",
emp.name
);

employeeTitle.innerHTML =
`${emp.name} — New Salary Structure`;

document.getElementById(
"empCode"
).value =
emp.empCode;

document.getElementById(
"designation"
).value =
emp.designation;

document.getElementById(
"joiningDate"
).value =
emp.joiningDate;

document.getElementById(
"panNumber"
).value =
emp.pan;

document.getElementById(
"uanNumber"
).value =
emp.uan;

document.getElementById(
"pfNumber"
).value =
emp.pf;

document.getElementById(
"bankName"
).value =
emp.bank;

document.getElementById(
"accountNumber"
).value =
emp.account;

document.getElementById(
"ifscCode"
).value =
emp.ifsc;

/* ACTIVE CARD */

document
.querySelectorAll(
".employee-item"
)
.forEach(item=>{

item.classList.remove(
"active"
);

});

document
.querySelectorAll(
".employee-item"
)[index]
.classList.add(
"active"
);

loadHistory(emp.name);

}

/* =========================
   CALCULATE SALARY
========================= */

function calculateSalary(){

const basic =
parseFloat(
document.getElementById(
"basicSalary"
).value
) || 0;

const hra =
parseFloat(
document.getElementById(
"hra"
).value
) || 0;

const conveyance =
parseFloat(
document.getElementById(
"conveyance"
).value
) || 0;

const medical =
parseFloat(
document.getElementById(
"medical"
).value
) || 0;

const special =
parseFloat(
document.getElementById(
"specialAllowance"
).value
) || 0;

const otherAllowance =
parseFloat(
document.getElementById(
"otherAllowance"
).value
) || 0;

const overtime =
parseFloat(
document.getElementById(
"overtimeRate"
).value
) || 0;

/* GROSS */

const grossSalary =

basic +
hra +
conveyance +
medical +
special +
otherAllowance +
overtime;

/* DEDUCTIONS */

const pfEmployee =
parseFloat(
document.getElementById(
"pfEmployee"
).value
) || 0;

const pfEmployer =
parseFloat(
document.getElementById(
"pfEmployer"
).value
) || 0;

const esiEmployee =
parseFloat(
document.getElementById(
"esiEmployee"
).value
) || 0;

const esiEmployer =
parseFloat(
document.getElementById(
"esiEmployer"
).value
) || 0;

const professionalTax =
parseFloat(
document.getElementById(
"professionalTax"
).value
) || 0;

const otherStatutory =
parseFloat(
document.getElementById(
"otherStatutory"
).value
) || 0;

const tds =
parseFloat(
document.getElementById(
"tds"
).value
) || 0;

const otherDeduction =
parseFloat(
document.getElementById(
"otherDeduction"
).value
) || 0;

/* TOTAL */

const totalDeduction =

pfEmployee +
pfEmployer +
esiEmployee +
esiEmployer +
professionalTax +
otherStatutory +
tds +
otherDeduction;

/* NET */

const netSalary =
grossSalary -
totalDeduction;

/* ANNUAL */

const annualSalary =
netSalary * 12;

/* UPDATE UI */

document.getElementById(
"grossSalary"
).innerHTML =
`₹ ${grossSalary.toLocaleString(
"en-IN",
{
minimumFractionDigits:2
}
)}`;

document.getElementById(
"totalDeduction"
).innerHTML =
`₹ ${totalDeduction.toLocaleString(
"en-IN",
{
minimumFractionDigits:2
}
)}`;

document.getElementById(
"netSalary"
).innerHTML =
`₹ ${netSalary.toLocaleString(
"en-IN",
{
minimumFractionDigits:2
}
)}`;

document.getElementById(
"annualSalary"
).innerHTML =
`₹ ${annualSalary.toLocaleString(
"en-IN",
{
minimumFractionDigits:2
}
)}`;

}

/* =========================
   INPUT EVENTS
========================= */

document
.querySelectorAll(
'input[type="number"]'
)
.forEach(input=>{

input.addEventListener(
"input",
calculateSalary
);

});

/* =========================
   SAVE STRUCTURE
========================= */

saveBtn.addEventListener(
"click",
async function(e){

e.preventDefault();

if (!employeeTitle) {
   alert("employeeTitle not found");
   return;
}

const employeeName =
employeeTitle.innerText
.split(" — ")[0];
             //when admin give data
//const employeeName = selectedEmployee.name;
//const empCode = selectedEmployee.empCode;


const salaryData = {

employeeName,

empCode:
document.getElementById(
"empCode"
).value,

designation:
document.getElementById(
"designation"
).value,

joiningDate:
document.getElementById(
"joiningDate"
).value,

effectiveFrom:
document.getElementById(
"effectiveFrom"
).value,

panNumber:
document.getElementById(
"panNumber"
).value,

uanNumber:
document.getElementById(
"uanNumber"
).value,

pfNumber:
document.getElementById(
"pfNumber"
).value,

bankName:
document.getElementById(
"bankName"
).value,

accountNumber:
document.getElementById(
"accountNumber"
).value,

ifscCode:
document.getElementById(
"ifscCode"
).value,

basicSalary:
parseFloat(
document.getElementById(
"basicSalary"
).value
) || 0,

hra:
parseFloat(
document.getElementById(
"hra"
).value
) || 0,

conveyance:
parseFloat(
document.getElementById(
"conveyance"
).value
) || 0,

medical:
parseFloat(
document.getElementById(
"medical"
).value
) || 0,

specialAllowance:
parseFloat(
document.getElementById(
"specialAllowance"
).value
) || 0,

otherAllowance:
parseFloat(
document.getElementById(
"otherAllowance"
).value
) || 0,

overtimeRate:
parseFloat(
document.getElementById(
"overtimeRate"
).value
) || 0,

pfEmployee:
parseFloat(
document.getElementById(
"pfEmployee"
).value
) || 0,

pfEmployer:
parseFloat(
document.getElementById(
"pfEmployer"
).value
) || 0,

esiEmployee:
parseFloat(
document.getElementById(
"esiEmployee"
).value
) || 0,

esiEmployer:
parseFloat(
document.getElementById(
"esiEmployer"
).value
) || 0,

professionalTax:
parseFloat(
document.getElementById(
"professionalTax"
).value
) || 0,

otherStatutory:
parseFloat(
document.getElementById(
"otherStatutory"
).value
) || 0,

tds:
parseFloat(
document.getElementById(
"tds"
).value
) || 0,

otherDeduction:
parseFloat(
document.getElementById(
"otherDeduction"
).value
) || 0,

grossSalary:
parseFloat(
document.getElementById(
"grossSalary"
).innerText
.replace(/[₹,]/g,"")
) || 0,

totalDeduction:
parseFloat(
document.getElementById(
"totalDeduction"
).innerText
.replace(/[₹,]/g,"")
) || 0,

netSalary:
parseFloat(
document.getElementById(
"netSalary"
).innerText
.replace(/[₹,]/g,"")
) || 0,

annualSalary:
parseFloat(
document.getElementById(
"annualSalary"
).innerText
.replace(/[₹,]/g,"")
) || 0,

notes:
document.getElementById(
"notes"
).value

};

// try{

// const response =
// await fetch(
// "/api/salary",
// {

// method:"POST",

// headers:{
// "Content-Type":
// "application/json"
// },

// body:JSON.stringify(
// salaryData
// )

// }
// );

// const result =
// await response.json();

// console.log(
// "Saved Result:",
// result
// );

// alert(
// "Salary Structure Saved Successfully"
// );

// loadHistory(employeeName);

// }
// catch(error){

// console.log(error);

// alert(
// "Failed To Save"
// );

// }


try {

    const response = await fetch("http://localhost:5000/api/salary", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(salaryData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    console.log("Saved Result:", result);

    alert("Salary Structure Saved Successfully");

loadHistory(employeeName);


// const paybillId =
// result._id ||
// result.data?._id ||
// result.payroll?._id;

// console.log("Payslip ID:", paybillId);

// if (!paybillId) {
//     alert("Payslip ID not received from server");
//     return;
// }

// window.open(`http://localhost:5000/paybill?id=${encodeURIComponent(paybillId)}`, "_blank");
}
catch (error) {

    console.log(error);

    alert("Failed To Save");

}

 }
 );

/* =========================
   LOAD HISTORY
========================= */

async function loadHistory(employeeName){

 try{

// console.log(
// "Loading History For:",
// employeeName
// );

// const response =
// await fetch(
// "/api/salary"
// );

// const data =
// await response.json();


const response =
await fetch(
"http://localhost:5000/api/salary"
);

if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
}

const data =
await response.json();
console.log(
"MongoDB Data:",
data
);

if (!historyBody) {
    console.error("historyBody not found");
    return;
}

historyBody.innerHTML = "";

const filteredData =
data.filter(item => {

return (

item.employeeName &&
employeeName &&
item.employeeName
.toLowerCase()
.trim() ===
employeeName
.toLowerCase()
.trim()

);

});

console.log(
"Filtered Data:",
filteredData
);

if(filteredData.length === 0){

historyBody.innerHTML = `

<tr>

<td
colspan="9"
style="
text-align:center;
padding:20px;
color:gray;
">

No History Found

</td>

</tr>

`;

}

filteredData.forEach(item=>{

const row = `

<tr>

<td>
${item.effectiveFrom || "-"}
</td>

<td>
₹ ${item.basicSalary || 0}
</td>

<td>
₹ ${item.hra || 0}
</td>

<td>
₹ ${item.conveyance || 0}
</td>

<td>
₹ ${item.medical || 0}
</td>

<td>
₹ ${item.specialAllowance || 0}
</td>

<td>
₹ ${item.otherAllowance || 0}
</td>

<td>
₹ ${item.overtimeRate || 0}
</td>

<td>
₹ ${item.grossSalary || 0}
</td>

<td>
₹ ${item.pfEmployee || 0}
</td>

<td>
₹ ${item.pfEmployer || 0}
</td>

<td>
₹ ${item.esiEmployee || 0}
</td>

<td>
₹ ${item.esiEmployer || 0}
</td>

<td>
₹ ${item.professionalTax || 0}
</td>

<td>
₹ ${item.otherStatutory || 0}
</td>

<td>
₹ ${item.tds || 0}
</td>

<td>
₹ ${item.otherDeduction || 0}
</td>

<td style="color:red;font-weight:600;">
₹ ${item.totalDeduction || 0}
</td>

<td class="green-text">
₹ ${item.netSalary || 0}
</td>

<td class="green-text">
₹ ${item.annualSalary || 0}
</td>

<td>
${item.bankName || "-"}
</td>

<td>
${item.accountNumber || "-"}
</td>

<td>
${item.ifscCode || "-"}
</td>

<td>
${item.notes || "-"}
</td>

</tr>

`;
historyBody.innerHTML += row;

});

const historyCount =
document.getElementById("historyCount");

if (historyCount) {
   historyCount.innerHTML =
   `${filteredData.length} record(s)`;
}

}
catch(error){

console.log(error);

}

}

/* =========================
   CANCEL
========================= */

cancelBtn.addEventListener(
"click",
function(){

document
.querySelectorAll(
'input[type="number"]'
)
.forEach(input=>{

input.value = 0;

});

document.getElementById(
"notes"
).value = "";

calculateSalary();

alert(
"Form Cleared Successfully"
);

}
);

/* =========================
   SEARCH EMPLOYEE
========================= */

document.getElementById(
"employeeSearch"
).addEventListener(
"input",
function(){

const value =
this.value.toLowerCase();

const cards =
document.querySelectorAll(
".employee-item"
);

cards.forEach(card=>{

const text =
card.innerText.toLowerCase();

card.style.display =
text.includes(value)
? "flex"
: "none";

});

}
);




/*===========================
   for connect Admin data
   ==========================*/
//    async function fetchEmployees() {
//     try {
//         const response = await fetch(
//             "http://localhost:5000/api/employees"
//         );

//         employees = await response.json();

//         loadEmployees();

//     } catch (error) {
//         console.log(error);
//     }
// }

/* =========================
   INIT
========================= */

calculateSalary();

       // when admin data come
//fetchEmployees();