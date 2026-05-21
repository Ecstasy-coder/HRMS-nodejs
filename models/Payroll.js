const mongoose =
require("mongoose");

const payrollSchema =
new mongoose.Schema({

employeeId:String,

month:String,

grossSalary:Number,

deductions:Number,

netSalary:Number,

status:String

});

module.exports =
mongoose.model(
"Payroll",
payrollSchema
);