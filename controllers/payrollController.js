const Payroll =
require("../models/Payroll");

const calculatePayroll =
require("../services/payrollService");

const runPayroll =
async (req,res)=>{

const {

employeeId,
basic,
bonus,
deductions,
month

} = req.body;

const salary =
calculatePayroll(
basic,
bonus,
deductions
);

const payroll =
await Payroll.create({

employeeId,

month,

grossSalary:
salary.grossSalary,

deductions,

netSalary:
salary.netSalary,

status:"Paid"

});

res.json(payroll);

};

const getPayroll =
async(req,res)=>{

const data =
await Payroll.find();

res.json(data);

};

module.exports = {

runPayroll,
getPayroll

};