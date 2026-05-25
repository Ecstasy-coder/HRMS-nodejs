const mongoose =
require("mongoose");

const salarySchema =
new mongoose.Schema({

employeeName:{
type:String,
required:true
},

empCode:String,
designation:String,
joiningDate:String,
effectiveFrom:String,

panNumber:String,
uanNumber:String,
pfNumber:String,

bankName:String,
accountNumber:String,
ifscCode:String,

basicSalary:Number,
hra:Number,
conveyance:Number,
medical:Number,
specialAllowance:Number,
otherAllowance:Number,
overtimeRate:Number,

pfEmployee:Number,
pfEmployer:Number,
esiEmployee:Number,
esiEmployer:Number,
professionalTax:Number,
otherStatutory:Number,
tds:Number,
otherDeduction:Number,

grossSalary:Number,
totalDeduction:Number,
netSalary:Number,
annualSalary:Number,

notes:String

},
{
timestamps:true
});

module.exports =
mongoose.model(
"SalaryStructure",
salarySchema
);