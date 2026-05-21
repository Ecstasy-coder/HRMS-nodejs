const salaryTableBody =
document.getElementById(
"salaryTableBody"
);

const saveBtn =
document.querySelector(
".save-btn"
);

const inputs =
document.querySelectorAll(
"input"
);

const grossBox =
document.querySelector(
".salary-box"
);

function calculateSalary(){

const basic =
Number(inputs[6].value) || 0;

const hra =
Number(inputs[7].value) || 0;

const conveyance =
Number(inputs[8].value) || 0;

const medical =
Number(inputs[9].value) || 0;

const special =
Number(inputs[10].value) || 0;

const pf =
Number(inputs[11].value) || 0;

const tax =
Number(inputs[12].value) || 0;

const other =
Number(inputs[13].value) || 0;

const gross =
basic +
hra +
conveyance +
medical +
special;

const totalDeduction =
pf + tax + other;

const net =
gross - totalDeduction;

grossBox.innerHTML =
`₹ ${net.toFixed(2)}`;

return {

basic,
hra,
gross,
net

};

}

inputs.forEach((input)=>{

input.addEventListener(
"input",
calculateSalary
);

});

saveBtn.addEventListener(
"click",
async ()=>{

const salaryData =
calculateSalary();

const data = {

employeeName:
inputs[0].value,

designation:
inputs[1].value,

joiningDate:
inputs[2].value,

pan:
inputs[3].value,

uan:
inputs[4].value,

pfNumber:
inputs[5].value,

basicSalary:
salaryData.basic,

hra:
salaryData.hra,

grossSalary:
salaryData.gross,

netSalary:
salaryData.net

};

const response =
await fetch(
"/api/salary",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify(data)

}

);

const result =
await response.json();

loadSalary();

alert(
"Salary Structure Saved"
);

}
);

async function loadSalary(){

const response =
await fetch("/api/salary");

const salaries =
await response.json();

salaryTableBody.innerHTML = "";

salaries.forEach((item)=>{

salaryTableBody.innerHTML += `

<tr>

<td>
₹ ${item.basicSalary}
</td>

<td>
₹ ${item.hra}
</td>

<td>
₹ ${item.grossSalary}
</td>

<td>
₹ ${item.netSalary}
</td>

</tr>

`;

});

}

loadSalary();