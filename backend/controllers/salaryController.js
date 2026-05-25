const SalaryStructure =
require("../models/SalaryStructure");

/* ===================================
   GET ALL SALARY STRUCTURES
=================================== */

const getSalary = async (req, res) => {

try {

const salaries =
await SalaryStructure.find()
.sort({ createdAt: -1 });

console.log(
"Fetched Salaries:",
salaries
);

res.status(200).json(
salaries
);

}
catch (error) {

console.log(
"GET ERROR:",
error
);

res.status(500).json({

success: false,
message: error.message

});

}

};

/* ===================================
   CREATE SALARY STRUCTURE
=================================== */

const createSalary = async (req, res) => {

try {

console.log(
"Incoming Request Body:",
req.body
);

const salary =
new SalaryStructure({

employeeName:
req.body.employeeName,

empCode:
req.body.empCode,

designation:
req.body.designation,

joiningDate:
req.body.joiningDate,

effectiveFrom:
req.body.effectiveFrom,

panNumber:
req.body.panNumber,

uanNumber:
req.body.uanNumber,

pfNumber:
req.body.pfNumber,

bankName:
req.body.bankName,

accountNumber:
req.body.accountNumber,

ifscCode:
req.body.ifscCode,

basicSalary:
req.body.basicSalary,

hra:
req.body.hra,

conveyance:
req.body.conveyance,

medical:
req.body.medical,

specialAllowance:
req.body.specialAllowance,

otherAllowance:
req.body.otherAllowance,

overtimeRate:
req.body.overtimeRate,

pfEmployee:
req.body.pfEmployee,

pfEmployer:
req.body.pfEmployer,

esiEmployee:
req.body.esiEmployee,

esiEmployer:
req.body.esiEmployer,

professionalTax:
req.body.professionalTax,

otherStatutory:
req.body.otherStatutory,

tds:
req.body.tds,

otherDeduction:
req.body.otherDeduction,

grossSalary:
req.body.grossSalary,

totalDeduction:
req.body.totalDeduction,

netSalary:
req.body.netSalary,

annualSalary:
req.body.annualSalary,

notes:
req.body.notes

});

const savedSalary =
await salary.save();

console.log(
"Saved Salary:",
savedSalary
);

res.status(201).json({

success: true,
message:
"Salary Structure Saved Successfully",

data: savedSalary

});

}
catch (error) {

console.log(
"POST ERROR:",
error
);

res.status(500).json({

success: false,
message: error.message

});

}

};

/* ===================================
   EXPORTS
=================================== */

const getSalaryById = async (req, res) => {
  try {

    const salary = await SalaryStructure.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary not found"
      });
    }

    res.status(200).json(salary);

  } catch (error) {

    console.log("GET BY ID ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {

getSalary,
createSalary,
 getSalaryById

};