/* =========================
   GLOBALS
========================= */
let latestSalaryId = null;

const employees = [
  {
    name: "Chandan Kumar Giri",
    department: "Engineering",
    status: "orange",
    empCode: "ECS000682",
    designation: "Frontend Developer",
    joiningDate: "2025-06-12",
    pan: "ABCDE1234F",
    uan: "556677889",
    pf: "987654321",
    bank: "HDFC Bank",
    account: "458796321456",
    ifsc: "HDFC0001122"
  },
  {
    name: "Deepthi Sannayila",
    department: "Engineering",
    status: "green",
    empCode: "EMP0043",
    designation: "Software Developer",
    joiningDate: "2026-03-01",
    pan: "KJHGFDS",
    uan: "lkjhgvc",
    pf: "lkjbhvc",
    bank: "dfvbvcfdfgh",
    account: "sdfgffhfds",
    ifsc: "SDFGHFD"
  },
  {
    name: "Finance Manager",
    department: "Finance",
    status: "red",
    empCode: "ECS000685",
    designation: "Finance Department",
    joiningDate: "2024-04-30",
    pan: "PQRSX90876",
    uan: "778890000",
    pf: "456156748",
    bank: "SBI Bank",
    account: "741258963800",
    ifsc: "ICIC0004400"
  },
  {
    name: "Lokesh",
    department: "IT",
    status: "orange",
    empCode: "ECS000630",
    designation: "Frontend Developer",
    joiningDate: "2025-06-12",
    pan: "ABCDE1500",
    uan: "5566776000",
    pf: "987654101",
    bank: "UCO Bank",
    account: "4587963212000",
    ifsc: "HDFC0001000"
  }
];

/* =========================
   ELEMENTS
========================= */
const employeeScroll = document.getElementById("employeeScroll");
const employeeTitle = document.getElementById("employeeTitle");
const historyBody = document.getElementById("historyBody");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const editBtn = document.getElementById("editLatestBtn");

let isEditMode = false;

function setUpdateMode() {
  isEditMode = true;
  saveBtn.classList.add("update-mode");
  saveBtn.innerHTML = `<i class="fa-solid fa-check"></i> Update Structure`;
}

function setSaveMode() {
  isEditMode = false;
  latestSalaryId = null; // Clear ID after resetting view state
  saveBtn.classList.remove("update-mode");
  saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Structure`;
}

/* =========================
   DATE DISPLAY
========================= */
const todayDate = document.getElementById("todayDate");
if (todayDate) {
  todayDate.innerHTML = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/* =========================
   LOAD EMPLOYEES
========================= */
function loadEmployees() {
  if (!employeeScroll) return;
  employeeScroll.innerHTML = "";

  employees.forEach((emp, index) => {
    employeeScroll.innerHTML += `
      <div class="employee-item" onclick="selectEmployee(${index})">
        <div class="employee-avatar">
          ${emp.name.split(" ").map(word => word[0]).join("").substring(0, 2)}
        </div>
        <div class="employee-info">
          <div class="employee-name">${emp.name}</div>
          <div class="employee-department">${emp.department}</div>
        </div>
        <div class="status-dot ${emp.status}"></div>
      </div>
    `;
  });
}

window.selectEmployee = async function (index) {
  const emp = employees[index];
  
  document.getElementById("emptyState").style.display = "none";
  document.getElementById("salaryContainer").classList.remove("hidden");
  
  employeeTitle.innerHTML = `${emp.name} — New Salary Structure`;
  
  // Fill employee personal files fields
  document.getElementById("empCode").value = emp.empCode;
  document.getElementById("designation").value = emp.designation;
  document.getElementById("joiningDate").value = emp.joiningDate;
  document.getElementById("panNumber").value = emp.pan;
  document.getElementById("uanNumber").value = emp.uan;
  document.getElementById("pfNumber").value = emp.pf;
  document.getElementById("bankName").value = emp.bank;
  document.getElementById("accountNumber").value = emp.account;
  document.getElementById("ifscCode").value = emp.ifsc;

  // Clear numeric form values
  document.querySelectorAll('input[type="number"]').forEach(input => input.value = 0);
  document.getElementById("notes").value = "";
  document.getElementById("effectiveFrom").value = "";

  document.querySelectorAll(".employee-item").forEach(item => item.classList.remove("active"));
  document.querySelectorAll(".employee-item")[index].classList.add("active");

  setSaveMode();
  calculateSalary();
  await loadHistory(emp.name);
};

/* =========================
   CALCULATE SALARY
========================= */
function calculateSalary() {
  const basic = parseFloat(document.getElementById("basicSalary").value) || 0;
  const hra = parseFloat(document.getElementById("hra").value) || 0;
  const conveyance = parseFloat(document.getElementById("conveyance").value) || 0;
  const medical = parseFloat(document.getElementById("medical").value) || 0;
  const special = parseFloat(document.getElementById("specialAllowance").value) || 0;
  const otherAllowance = parseFloat(document.getElementById("otherAllowance").value) || 0;
  const overtime = parseFloat(document.getElementById("overtimeRate").value) || 0;

  const grossSalary = basic + hra + conveyance + medical + special + otherAllowance + overtime;

  const pfEmployee = parseFloat(document.getElementById("pfEmployee").value) || 0;
  const pfEmployer = parseFloat(document.getElementById("pfEmployer").value) || 0;
  const esiEmployee = parseFloat(document.getElementById("esiEmployee").value) || 0;
  const esiEmployer = parseFloat(document.getElementById("esiEmployer").value) || 0;
  const professionalTax = parseFloat(document.getElementById("professionalTax").value) || 0;
  const otherStatutory = parseFloat(document.getElementById("otherStatutory").value) || 0;
  const tds = parseFloat(document.getElementById("tds").value) || 0;
  const otherDeduction = parseFloat(document.getElementById("otherDeduction").value) || 0;

  const totalDeduction = pfEmployee + pfEmployer + esiEmployee + esiEmployer + professionalTax + otherStatutory + tds + otherDeduction;
  const netSalary = grossSalary - totalDeduction;
  const annualSalary = netSalary * 12;

  document.getElementById("grossSalary").innerHTML = `₹ ${grossSalary.toFixed(2)}`;
  document.getElementById("totalDeduction").innerHTML = `₹ ${totalDeduction.toFixed(2)}`;
  document.getElementById("netSalary").innerHTML = `₹ ${netSalary.toFixed(2)}`;
  document.getElementById("annualSalary").innerHTML = `₹ ${annualSalary.toFixed(2)}`;
}

// Attach input calculation triggers
document.querySelectorAll('input[type="number"]').forEach(input => {
  input.addEventListener("input", calculateSalary);
});

/* =========================
   SAVE / UPDATE STRUCTURE
========================= */
if (saveBtn) {
  saveBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    const employeeName = employeeTitle.innerText.split(" — ")[0];
    const effectiveFromVal = document.getElementById("effectiveFrom").value;

    if (!effectiveFromVal) {
      alert("Please select an Effective Date before saving.");
      return;
    }

    const salaryData = {
      employeeName,
      empCode: document.getElementById("empCode").value,
      designation: document.getElementById("designation").value,
      joiningDate: document.getElementById("joiningDate").value,
      effectiveFrom: effectiveFromVal,
      panNumber: document.getElementById("panNumber").value,
      uanNumber: document.getElementById("uanNumber").value,
      pfNumber: document.getElementById("pfNumber").value,
      bankName: document.getElementById("bankName").value,
      accountNumber: document.getElementById("accountNumber").value,
      ifscCode: document.getElementById("ifscCode").value,
      basicSalary: parseFloat(document.getElementById("basicSalary").value) || 0,
      hra: parseFloat(document.getElementById("hra").value) || 0,
      conveyance: parseFloat(document.getElementById("conveyance").value) || 0,
      medical: parseFloat(document.getElementById("medical").value) || 0,
      specialAllowance: parseFloat(document.getElementById("specialAllowance").value) || 0,
      otherAllowance: parseFloat(document.getElementById("otherAllowance").value) || 0,
      overtimeRate: parseFloat(document.getElementById("overtimeRate").value) || 0,
      pfEmployee: parseFloat(document.getElementById("pfEmployee").value) || 0,
      pfEmployer: parseFloat(document.getElementById("pfEmployer").value) || 0,
      esiEmployee: parseFloat(document.getElementById("esiEmployee").value) || 0,
      esiEmployer: parseFloat(document.getElementById("esiEmployer").value) || 0,
      professionalTax: parseFloat(document.getElementById("professionalTax").value) || 0,
      otherStatutory: parseFloat(document.getElementById("otherStatutory").value) || 0,
      tds: parseFloat(document.getElementById("tds").value) || 0,
      otherDeduction: parseFloat(document.getElementById("otherDeduction").value) || 0,
      grossSalary: parseFloat(document.getElementById("grossSalary").innerText.replace(/[₹,]/g, "")) || 0,
      totalDeduction: parseFloat(document.getElementById("totalDeduction").innerText.replace(/[₹,]/g, "")) || 0,
      netSalary: parseFloat(document.getElementById("netSalary").innerText.replace(/[₹,]/g, "")) || 0,
      annualSalary: parseFloat(document.getElementById("annualSalary").innerText.replace(/[₹,]/g, "")) || 0,
      notes: document.getElementById("notes").value
    };

    try {
      let response;
      
      // FIX 1: Send update using targeted ID endpoint if isEditMode is active
      if (isEditMode && latestSalaryId) {
        response = await fetch(`http://localhost:5000/api/salary/${latestSalaryId}`, {
          method: "PUT", // or PATCH depending on your API routing architecture
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(salaryData)
        });

        if (!response.ok) throw new Error("Update operation failed");
        alert("Salary Structure Updated Successfully");
        setSaveMode();
      } else {
        // Create new standalone salary structure entry
        response = await fetch("http://localhost:5000/api/salary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(salaryData)
        });

        if (!response.ok) throw new Error("Creation operation failed");
        alert("Salary Structure Saved Successfully");
      }

      await loadHistory(employeeName);
    } catch (error) {
      console.error(error);
      alert("Failed To Save Salary Structure Data");
    }
  });
}

/* =========================
   LOAD HISTORY
========================= */
async function loadHistory(employeeName) {
  try {
    const response = await fetch("http://localhost:5000/api/salary");
    const result = await response.json();
    
    // Pull from result array or look inside subcontainer field 'data'
    const allRecords = result.data || result || [];

    historyBody.innerHTML = "";
    latestSalaryId = null;

    const filteredData = allRecords.filter(item => {
      return (
        item.employeeName &&
        employeeName &&
        item.employeeName.toLowerCase().trim() === employeeName.toLowerCase().trim()
      );
    });

    if (filteredData.length === 0) {
      historyBody.innerHTML = `
        <tr>
          <td colspan="25" style="text-align:center; padding:20px; color:gray;">
            No History Found
          </td>
        </tr>`;
      document.getElementById("historyCount").innerHTML = "0 records";
      return;
    }

    // Capture newest ID to link "Edit Latest" fast toggle switch
    latestSalaryId = filteredData[0]._id;

    filteredData.forEach((item) => {
      historyBody.innerHTML += `
        <tr>
          <td><strong>${item.effectiveFrom || "-"}</strong></td>
          <td>₹ ${item.basicSalary || 0}</td>
          <td>₹ ${item.hra || 0}</td>
          <td>₹ ${item.conveyance || 0}</td>
          <td>₹ ${item.medical || 0}</td>
          <td>₹ ${item.specialAllowance || 0}</td>
          <td>₹ ${item.otherAllowance || 0}</td>
          <td>₹ ${item.overtimeRate || 0}</td>
          <td><strong>₹ ${item.grossSalary || 0}</strong></td>
          <td>₹ ${item.pfEmployee || 0}</td>
          <td>₹ ${item.pfEmployer || 0}</td>
          <td>₹ ${item.esiEmployee || 0}</td>
          <td>₹ ${item.esiEmployer || 0}</td>
          <td>₹ ${item.professionalTax || 0}</td>
          <td>₹ ${item.otherStatutory || 0}</td>
          <td>₹ ${item.tds || 0}</td>
          <td>₹ ${item.otherDeduction || 0}</td>
          <td>₹ ${item.totalDeduction || 0}</td>
          <td><strong>₹ ${item.netSalary || 0}</strong></td>
          <td>₹ ${item.annualSalary || 0}</td>
          <td>${item.bankName || "-"}</td>
          <td>${item.accountNumber || "-"}</td>
          <td>${item.ifscCode || "-"}</td>
          <td>${item.notes || "-"}</td>
          <td>
            <button onclick="editRow('${item._id}')" class="history-edit-btn" style="background:#17356f; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">
              Edit
            </button>
          </td>
        </tr>`;
    });

    document.getElementById("historyCount").innerHTML = `${filteredData.length} record(s)`;
  } catch (error) {
    console.error("Error loading history logs:", error);
  }
}

/* =========================
   EDIT ACTIONS
========================= */
window.editRow = async function (id) {
  try {
    const response = await fetch("http://localhost:5000/api/salary");
    const result = await response.json();
    const allData = result.data || result || [];

    const data = allData.find(item => item._id === id);

    if (!data) {
      alert("Salary record not found");
      return;
    }

    // Lock global edit target state references
    latestSalaryId = data._id;

    // Load structure properties to form inputs
    document.getElementById("effectiveFrom").value = data.effectiveFrom || "";
    document.getElementById("basicSalary").value = data.basicSalary || 0;
    document.getElementById("hra").value = data.hra || 0;
    document.getElementById("conveyance").value = data.conveyance || 0;
    document.getElementById("medical").value = data.medical || 0;
    document.getElementById("specialAllowance").value = data.specialAllowance || 0;
    document.getElementById("otherAllowance").value = data.otherAllowance || 0;
    document.getElementById("overtimeRate").value = data.overtimeRate || 0;
    document.getElementById("pfEmployee").value = data.pfEmployee || 0;
    document.getElementById("pfEmployer").value = data.pfEmployer || 0;
    document.getElementById("esiEmployee").value = data.esiEmployee || 0;
    document.getElementById("esiEmployer").value = data.esiEmployer || 0;
    document.getElementById("professionalTax").value = data.professionalTax || 0;
    document.getElementById("otherStatutory").value = data.otherStatutory || 0;
    document.getElementById("tds").value = data.tds || 0;
    document.getElementById("otherDeduction").value = data.otherDeduction || 0;
    document.getElementById("notes").value = data.notes || "";

    calculateSalary();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setUpdateMode();

  } catch (error) {
    console.error(error);
    alert("Failed To Load Edit Data");
  }
};

if (editBtn) {
  editBtn.addEventListener("click", function () {
    if (!latestSalaryId) {
      alert("No Salary Structure Found for this employee");
      return;
    }
    editRow(latestSalaryId);
  });
}

/* =========================
   CANCEL / CLEAR FORM
========================= */
if (cancelBtn) {
  cancelBtn.addEventListener("click", function () {
    document.querySelectorAll('input[type="number"]').forEach(input => input.value = 0);
    document.getElementById("notes").value = "";
    document.getElementById("effectiveFrom").value = "";
    
    setSaveMode();
    calculateSalary();
    alert("Form Cleared Successfully");
  });
}

/* =========================
   SEARCH FILTER
========================= */
const employeeSearch = document.getElementById("employeeSearch");
if (employeeSearch) {
  employeeSearch.addEventListener("input", function () {
    const value = this.value.toLowerCase().trim();
    const cards = document.querySelectorAll(".employee-item");

    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(value) ? "flex" : "none";
    });
  });
}

/* =========================
   INITIALIZATION
========================= */
loadEmployees();
calculateSalary();
console.log("salary.js loaded successfully");