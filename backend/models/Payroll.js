const mongoose =
require("mongoose");

const payrollSchema =
new mongoose.Schema({

employeeId:String,
employeeName:String,
designation:String,
department:String,
empCode:String,

month:String,

attendance:Number,

workingDays:Number,
presentDays:Number,
absentDays:Number,
lateDays:Number,
halfDays:Number,
paidLeaves:Number,
lopDays:Number,
otHours:Number,
paidDays:Number,

grossSalary:Number,
deductions:Number,
netSalary:Number,

pfEmployee:Number,
esiEmployee:Number,
professionalTax:Number,
tds:Number,

pfEmployer:Number,
esiEmployer:Number,

status:String,

bankName:String,
accountNumber:String,
ifscCode:String,

pan:String,
uan:String,
pfNumber:String,

joiningDate:String,

paymentDate:String

});

module.exports =
mongoose.model(
"Payroll",
payrollSchema
);