const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

    employeeId: String,
    date: String,
    punchIn: String,
    punchOut: String,
    workingHours: String,
    status: String

});

module.exports = mongoose.model("Attendance", attendanceSchema);