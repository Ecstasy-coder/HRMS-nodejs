// const Payroll =
// require("../models/Payroll");

// const SalaryStructure =
// require("../models/SalaryStructure");


// // ============================
// // RUN PAYROLL
// // ============================

// const runPayroll = async (req, res) => {
//   try {
//      const selectedMonth = req.body.month || "05";
//     const selectedYear = req.body.year || "2026";

//     const monthNames = [
//       "January","February","March","April","May","June",
//       "July","August","September","October","November","December"
//     ];

//     const monthText =
//       `${monthNames[parseInt(selectedMonth)-1]} ${selectedYear}`;

//      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
//     const endDate = new Date(selectedYear, selectedMonth, 1);

//     // Check existing payroll
//     const existingPayroll = await Payroll.find({
//       month: selectedMonth,
//       year: selectedYear
//     });


//     // FIRST CLICK → Create payroll in Draft
//     if (existingPayroll.length === 0) {
//      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
//   const endDate = new Date(selectedYear, selectedMonth, 1);

//  const salaryData = await SalaryStructure.find();

//   if (salaryData.length === 0) {
//     return res.json({
//       message: "No employee found for selected month"
//     });
//   }

//     for (const item of salaryData) {

//   // Skip if no effectiveFrom
//   if (!item.effectiveFrom) {
//     continue;
//   }

//   // Convert effectiveFrom string to Date
//   const effectiveDate =
//   new Date(item.effectiveFrom);

//   const effectiveMonth =
//   String(effectiveDate.getMonth() + 1)
//   .padStart(2, "0");

//   const effectiveYear =
//   String(effectiveDate.getFullYear());

//   // Only selected month payroll
//   if (
//     effectiveMonth !== selectedMonth ||
//     effectiveYear !== selectedYear
//   ) {
//     continue;
//   }

//   // Salary calculations
//   const grossSalary =
//     Number(item.basicSalary || 0) +
//     Number(item.hra || 0) +
//     Number(item.conveyance || 0) +
//     Number(item.medical || 0) +
//     Number(item.specialAllowance || 0) +
//     Number(item.otherAllowance || 0);

//   const deductions =
//     Number(item.pfEmployee || 0) +
//     Number(item.esiEmployee || 0) +
//     Number(item.professionalTax || 0) +
//     Number(item.tds || 0);

//   const netSalary =
//     grossSalary - deductions;

//   await Payroll.findOneAndUpdate(

//     {
//       empCode: item.empCode,
//       month: selectedMonth,
//       year: selectedYear
//     },

//     {
//       employeeId: item.empCode,
//       employeeName: item.employeeName,
//       designation: item.designation,
//       department: item.department || "Engineering",

//       empCode: item.empCode,

//       month: selectedMonth,
//       year: selectedYear,
//       monthText: monthText,

//       attendance: 26,
//       workingDays: 26,
//       presentDays: 26,
//       absentDays: 0,

//       grossSalary: grossSalary,

//       deductions: deductions,

//       netSalary: netSalary,

//       pfEmployee: item.pfEmployee || 0,
//       esiEmployee: item.esiEmployee || 0,
//       professionalTax:
//       item.professionalTax || 0,

//       tds: item.tds || 0,

//       bankName: item.bankName || "",
//       accountNumber:
//       item.accountNumber || "",

//       ifscCode:
//       item.ifscCode || "",

//       pan:
//       item.panNumber || "",

//       uan:
//       item.uanNumber || "",

//       pfNumber:
//       item.pfNumber || "",

//       joiningDate:
//       item.joiningDate || "",

//       paymentDate:
//       new Date().toLocaleDateString(),

//       status: "Draft"
//     },

//     {
//       upsert: true,
//       new: true
//     }

//   );

// }

//       return res.json({
//         message: "Payroll Created in Draft"
//       });
//     }

//     // SECOND CLICK → Draft → Finalized
//     const draftPayroll = await Payroll.find({  month: selectedMonth,
//       year: selectedYear, status: "Draft" });

//     if (draftPayroll.length > 0) {
//       await Payroll.updateMany(
//         { month: selectedMonth,
//           year: selectedYear, status: "Draft" },
//         { $set: { status: "Finalized" } }
//       );

//       return res.json({
//         message: "Payroll Finalized Successfully"
//       });
//     }

//     // THIRD CLICK → Finalized → Paid
//     const finalizedPayroll = await Payroll.find({
//       month: selectedMonth,
//       year: selectedYear,
//       status: "Finalized"
//     });

//     if (finalizedPayroll.length > 0) {
//       await Payroll.updateMany(
//         { month: selectedMonth,
//           year: selectedYear, status: "Finalized" },
//         {
//           $set: {
//             status: "Paid",
//             paymentDate: new Date().toLocaleDateString()
//           }
//         }
//       );

//       return res.json({
//         message: "Payroll Paid Successfully"
//       });
//     }

//     // Already Paid
//     return res.json({
//       message: "Payroll generated sucessufully"
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: error.message
//     });
//   }
// };


// // ============================
// // GET ALL PAYROLLS
// // ============================

// const getPayroll = async (req, res) => {
//   try {
//     const { month, year } = req.query;

//     let query = {};

//   //  if (month && year) {
//   //     const monthNames = [
//   //       "January", "February", "March", "April", "May", "June",
//   //       "July", "August", "September", "October", "November", "December"
//   //     ];

//   //     const monthText = `${monthNames[Number(month) - 1]} ${year}`;

//   //     // search only month field
//   //     query = { month: monthText };
//   //   }

   
//     if (month) query.month = month;
//     if (year) query.year = year;


//     const data = await Payroll.find(query);

//     res.json({
//       totalRecords: data.length,
//       data
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message
//     });
//   }
// };

// // ============================
// // GET SINGLE PAYSLIP
// // ============================

// // const getPayslip =
// // async(req,res)=>{

// // try{

// // const payroll =
// // await Payroll.findById(
// // req.params.id
// // );

// // if(!payroll){

// // return res.status(404).json({

// // message:"Payslip not found"

// // });

// // }

// // res.json(payroll);

// // }

// // catch(error){

// // res.status(500).json({

// // message:error.message

// // });

// // }

// // };


// const mongoose = require("mongoose");

// const getPayslip = async (req, res) => {
//   try {
//     const id = req.params.id;

//     console.log("Received ID:", id);

//     let payroll = await Payroll.findById(id);

//     console.log("Found Payroll:", payroll);

//     if (!payroll) {
//       return res.status(404).json({
//         message: "Payslip not found"
//       });
//     }

//     res.json(payroll);

//   } catch (error) {
//     console.log("Error:", error.message);

//     res.status(500).json({
//       message: error.message
//     });
//   }
// };

// // const getPayslip = async (req, res) => {
// //   try {
// //     const empCode = req.params.id;

// //     const payroll = await Payroll.findOne({
// //       empCode: empCode
// //     });

// //     if (!payroll) {
// //       return res.status(404).json({
// //         message: "Payslip not found"
// //       });
// //     }

// //     res.json(payroll);

// //   } catch (error) {
// //     res.status(500).json({
// //       message: error.message
// //     });
// //   }
// // };

// const updatePayrollStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     // only allow valid status
//     if (!["Draft", "Finalized", "Paid"].includes(status)) {
//       return res.status(400).json({
//         message: "Invalid status"
//       });
//     }

//     const payroll = await Payroll.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!payroll) {
//       return res.status(404).json({
//         message: "Payroll not found"
//       });
//     }

//     res.json({
//       message: "Status updated successfully",
//       payroll
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: error.message
//     });
//   }
// };
// module.exports = {

// runPayroll,
// getPayroll,
// getPayslip,
// updatePayrollStatus

// };

const Payroll = require("../models/Payroll");
const SalaryStructure = require("../models/SalaryStructure");

// ========================================================
// 1. RUN PAYROLL (Step 1: Generates Fresh Records as "Draft")
// ========================================================
const runPayroll = async (req, res) => {
  try {
    let selectedMonth = req.body.month || "05"; 
    let selectedYear = req.body.year || "2026";

    if (selectedMonth.includes("-")) {
      const parts = selectedMonth.split("-");
      selectedYear = parts[0];
      selectedMonth = parts[1];
    }

    selectedMonth = String(selectedMonth).padStart(2, "0");
    selectedYear = String(selectedYear);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthText = `${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`;

    const existingPayroll = await Payroll.find({
      month: selectedMonth,
      year: selectedYear
    });

    if (existingPayroll.length > 0) {
      return res.status(400).json({
        message: `Payroll records already exist for ${monthText}. Use Finalize or Mark Paid to progress.`
      });
    }

    const salaryData = await SalaryStructure.find();

    if (salaryData.length === 0) {
      return res.status(404).json({
        message: "No employee found in Salary Structure"
      });
    }

    let processedCount = 0;

    for (const item of salaryData) {
      if (!item.effectiveFrom) continue;

      const effectiveDate = new Date(item.effectiveFrom);
      const effectiveMonth = String(effectiveDate.getMonth() + 1).padStart(2, "0");
      const effectiveYear = String(effectiveDate.getFullYear());

      if (effectiveMonth !== selectedMonth || effectiveYear !== selectedYear) {
        continue; 
      }

      const grossSalary =
        Number(item.basicSalary || 0) +
        Number(item.hra || 0) +
        Number(item.conveyance || 0) +
        Number(item.medical || 0) +
        Number(item.specialAllowance || 0) +
        Number(item.otherAllowance || 0);

      const deductions =
        Number(item.pfEmployee || 0) +
        Number(item.esiEmployee || 0) +
        Number(item.professionalTax || 0) +
        Number(item.tds || 0);

      const netSalary = grossSalary - deductions;

      await Payroll.findOneAndUpdate(
        {
          empCode: item.empCode,
          month: selectedMonth,
          year: selectedYear
        },
        {
          employeeId: item.empCode,
          employeeName: item.employeeName,
          designation: item.designation,
          department: item.department || "Engineering",
          empCode: item.empCode,
          month: selectedMonth,
          year: selectedYear,
          monthText: monthText,
          attendance: 26,
          workingDays: 26,
          presentDays: 26,
          absentDays: 0,
          grossSalary: grossSalary,
          deductions: deductions,
          netSalary: netSalary,
          pfEmployee: item.pfEmployee || 0,
          esiEmployee: item.esiEmployee || 0,
          professionalTax: item.professionalTax || 0,
          tds: item.tds || 0,
          bankName: item.bankName || "",
          accountNumber: item.accountNumber || "",
          ifscCode: item.ifscCode || "",
          pan: item.panNumber || "",
          uan: item.uanNumber || "",
          pfNumber: item.pfNumber || "",
          joiningDate: item.joiningDate || "",
          paymentDate: new Date().toLocaleDateString(),
          status: "Draft",
          // Initializing fields so they default safely to zero
          bonus: 0,
          incentive: 0,
          arrear: 0,
          otherEarning: 0,
          advanceRecovery: 0,
          otherDeduction: 0,
          variablePay: 0,
          financeRemark: ""
        },
        { upsert: true, new: true }
      );

      processedCount++;
    }

    if (processedCount === 0) {
      return res.status(404).json({
        message: `No active employee profiles match the effective target date: ${monthText}`
      });
    }

    return res.json({
      message: "Payroll Created in Draft Successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================================================
// 2. FINALIZE PAYROLL (Step 2: Explicit PUT Target Endpoint)
// ========================================================
const finalizePayroll = async (req, res) => {
  try {
    let { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and Year are required." });
    }

    month = String(month).padStart(2, "0");
    year = String(year);

    const draftRecords = await Payroll.find({ month, year, status: "Draft" });
    if (draftRecords.length === 0) {
      return res.status(400).json({ message: "No active Draft entries found to finalize." });
    }

    await Payroll.updateMany(
      { month, year, status: "Draft" },
      { $set: { status: "Finalized" } }
    );

    res.json({
      success: true,
      message: "Payroll Finalized Successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================================================
// 3. MARK PAYROLL AS PAID (Step 3: Captures Metadata Tracking)
// ========================================================
const markPayrollAsPaid = async (req, res) => {
  try {
    let { month, year, paymentMethod, paymentDate, utrNumber } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and Year parameters are required." });
    }

    if (!paymentMethod || !paymentDate || !utrNumber) {
      return res.status(400).json({ message: "Missing required transaction verification metrics." });
    }

    month = String(month).padStart(2, "0");
    year = String(year);

    const finalizedRecords = await Payroll.find({ month, year, status: "Finalized" });
    if (finalizedRecords.length === 0) {
      return res.status(400).json({ message: "No active Finalized entries found to mark as paid." });
    }

    await Payroll.updateMany(
      { month, year, status: "Finalized" },
      { 
        $set: { 
          status: "Paid",
          paymentMethod: paymentMethod,
          paymentDate: paymentDate, 
          utrNumber: utrNumber      
        } 
      }
    );

    res.json({
      success: true,
      message: "Payroll Marked As Paid Successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================================================
// ADDED: ADJUST AND RECALCULATE INDIVIDUAL PAYROLL ENTRY
// ========================================================
const adjustPayrollEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      bonus, 
      incentive, 
      arrear, 
      otherEarning, 
      advanceRecovery, 
      otherDeduction, 
      financeRemark 
    } = req.body;

    const record = await Payroll.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Payroll record not found." });
    }

    if (record.status.toLowerCase() !== "draft") {
      return res.status(400).json({ message: "Adjustments can only be executed against records currently in Draft status." });
    }

    // Fetch Base Salary configurations to recalculate safely from original parameters
    const structuralBase = await SalaryStructure.findOne({ empCode: record.empCode });
    if (!structuralBase) {
      return res.status(404).json({ message: "Corresponding employee Base Salary structure data missing." });
    }

    // 1. Recalculate original base sums
    const originalGross =
      Number(structuralBase.basicSalary || 0) +
      Number(structuralBase.hra || 0) +
      Number(structuralBase.conveyance || 0) +
      Number(structuralBase.medical || 0) +
      Number(structuralBase.specialAllowance || 0) +
      Number(structuralBase.otherAllowance || 0);

    const originalDeductions =
      Number(structuralBase.pfEmployee || 0) +
      Number(structuralBase.esiEmployee || 0) +
      Number(structuralBase.professionalTax || 0) +
      Number(structuralBase.tds || 0);

    // 2. Parse out modal changes
    const adjBonus = Number(bonus || 0);
    const adjIncentive = Number(incentive || 0);
    const adjArrear = Number(arrear || 0);
    const adjOtherEarning = Number(otherEarning || 0);
    const adjAdvanceRecovery = Number(advanceRecovery || 0);
    const adjOtherDeduction = Number(otherDeduction || 0);

    // Combine earnings variables to populate column (+Variable) on frontend row layouts
    const totalVariablePay = adjBonus + adjIncentive + adjArrear + adjOtherEarning;

    // 3. Re-tally mathematical parameters
    const finalizedGrossSalary = originalGross + totalVariablePay;
    const finalizedDeductions = originalDeductions + adjAdvanceRecovery + adjOtherDeduction;
    const finalizedNetSalary = finalizedGrossSalary - finalizedDeductions;

    // Save variables directly back into Document Instance fields
    record.bonus = adjBonus;
    record.incentive = adjIncentive;
    record.arrear = adjArrear;
    record.otherEarning = adjOtherEarning;
    record.advanceRecovery = adjAdvanceRecovery;
    record.otherDeduction = adjOtherDeduction;
    record.variablePay = totalVariablePay;
    
    record.grossSalary = finalizedGrossSalary;
    record.deductions = finalizedDeductions;
    record.netSalary = finalizedNetSalary;
    record.financeRemark = financeRemark || "";

    await record.save();

    res.json({
      success: true,
      message: "Payroll adjustment processed and recalculated successfully.",
      data: record
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================================================
// 4. UTILITY DATA READ AND UPDATE REQUEST METHODS
// ========================================================

/* GET ALL PAYROLL RECORDS */
const getPayroll = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};

    if (month) query.month = String(month).padStart(2, "0");
    if (year) query.year = String(year);

    const data = await Payroll.find(query);

    res.json({
      totalRecords: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET SINGLE PAYSLIP ID MATCH */
const getPayslip = async (req, res) => {
  try {
    const id = req.params.id;
    let payroll = await Payroll.findById(id);

    if (!payroll) {
      return res.status(404).json({ message: "Payslip not found" });
    }

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* BACKWARD COMPATIBLE SINGLE ROW UPDATE MANIPULATOR */
const updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Draft", "Finalized", "Paid"].includes(status)) {
      return res.status(400).json({ message: "Invalid status context option value structure." });
    }

    const payroll = await Payroll.findByIdAndUpdate(id, { status }, { new: true });

    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    res.json({ message: "Status updated successfully", payroll });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*=============================
       CSV
================================*/       
const exportCSV = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month) query.month = String(month).padStart(2, "0");
    if (year) query.year = String(year);

    const payrolls = await Payroll.find(query);

    if (payrolls.length === 0) {
      return res.status(404).json({ message: "No records found to export." });
    }

    // Define CSV header
    let csv = "Employee ID,Name,Designation,Gross Salary,Deductions,Net Salary,Status\n";

    // Append rows
    payrolls.forEach((item) => {
      csv += `${item.employeeId},${item.employeeName},${item.designation},${item.grossSalary},${item.deductions},${item.netSalary},${item.status}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="payroll-report.csv"');
    
    return res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




module.exports = {
  runPayroll,
  finalizePayroll,
  markPayrollAsPaid,
  adjustPayrollEntry, // Exported to Routes Engine
  getPayroll,
  getPayslip,
  updatePayrollStatus,
   exportCSV
};