const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    employeeId: String,
    employeeName: String,
    department: String,
    date: String,
    punchIn: String,
    punchOut: String,
    workingHours: String,
    status: String
}, {
    timestamps: true
});

module.exports =
    mongoose.models.Attendance ||
    mongoose.model("Attendance", attendanceSchema);