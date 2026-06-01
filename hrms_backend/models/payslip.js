const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    basicSalary: {
        type: Number,
        required: true
    },
    joiningDate: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("Employee", employeeSchema);