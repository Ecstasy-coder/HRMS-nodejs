const mongoose =
require("mongoose");

const salarySchema =
new mongoose.Schema({

employeeId: String,

basicSalary: Number,

hra: Number,

allowance: Number,

bonus: Number,

pf: Number,

tax: Number

});

module.exports =
mongoose.model(
"SalaryStructure",
salarySchema
);