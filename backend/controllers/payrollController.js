const Payroll =
require("../models/Payroll");

const SalaryStructure =
require("../models/SalaryStructure");


// ============================
// RUN PAYROLL
// ============================

const runPayroll = async (req, res) => {
  try {
    const month = req.body.month || "May 2026";

    // Check if payroll already exists for this month
    // const existingPayroll = await Payroll.findOne({ month });

    // if (existingPayroll) {
    //   return res.status(400).json({
    //     message: "Payroll already generated for this month"
    //   });
    // }

    const existingPayroll = await Payroll.find({ month });

if (existingPayroll.length > 0) {
   await Payroll.deleteMany({ month });
}

    const salaryData = await SalaryStructure.find();

    for (const item of salaryData) {
      await Payroll.create({
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        designation: item.designation,
        empCode: item.empCode || "EMP0043",
        department: "Engineering",

        month: month,

        attendance: 26,
        workingDays: 26,
        presentDays: 26,
        absentDays: 0,

        lateDays: 0,
        halfDays: 0,
        paidLeaves: 0,
        lopDays: 0,
        otHours: 0,
        paidDays: 26,

        grossSalary: item.grossSalary || 0,

        deductions:
          (item.pfEmployee || 10) +
          (item.esiEmployee || 9) +
          (item.professionalTax || 10) +
          (item.tds || 1211) +
          (item.otherDeduction || 0),

        netSalary: item.netSalary || 0,

        pfEmployee: item.pfEmployee || 10,
        esiEmployee: item.esiEmployee || 9,
        professionalTax: item.professionalTax || 10,
        tds: item.tds || 1211,

        pfEmployer: 12.12,
        esiEmployer: 0,

        status: "Paid",

        bankName: item.bankName || "Bank of India",
        accountNumber: item.accountNumber || "****4547",
        ifscCode: item.ifscCode || "BHID0005670",

        pan: item.pan || "MLFPS6706K",
        uan: item.uan || "102233445",
        pfNumber: item.pfNumber || "234567890",

        joiningDate: item.joiningDate || "04 Mar 2026",
        paymentDate: new Date().toLocaleDateString()
      });
    }

    res.json({
      message: "Payroll Generated Successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// ============================
// GET ALL PAYROLLS
// ============================

const getPayroll =
async(req,res)=>{

try{

const data =
await Payroll.find();

res.json(data);

}

catch(error){

res.status(500).json({

message:error.message

});

}

};


// ============================
// GET SINGLE PAYSLIP
// ============================

// const getPayslip =
// async(req,res)=>{

// try{

// const payroll =
// await Payroll.findById(
// req.params.id
// );

// if(!payroll){

// return res.status(404).json({

// message:"Payslip not found"

// });

// }

// res.json(payroll);

// }

// catch(error){

// res.status(500).json({

// message:error.message

// });

// }

// };


const mongoose = require("mongoose");

const getPayslip = async (req, res) => {
  try {
    const id = req.params.id;

    console.log("Received ID:", id);

    let payroll = await Payroll.findById(id);

    console.log("Found Payroll:", payroll);

    if (!payroll) {
      return res.status(404).json({
        message: "Payslip not found"
      });
    }

    res.json(payroll);

  } catch (error) {
    console.log("Error:", error.message);

    res.status(500).json({
      message: error.message
    });
  }
};

// const getPayslip = async (req, res) => {
//   try {
//     const empCode = req.params.id;

//     const payroll = await Payroll.findOne({
//       empCode: empCode
//     });

//     if (!payroll) {
//       return res.status(404).json({
//         message: "Payslip not found"
//       });
//     }

//     res.json(payroll);

//   } catch (error) {
//     res.status(500).json({
//       message: error.message
//     });
//   }
// };


module.exports = {

runPayroll,
getPayroll,
getPayslip

};