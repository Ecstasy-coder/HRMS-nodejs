const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
    rmId: { type: String, required: true },
    rmName: { type: String, required: true },
    leaveType: { type: String, enum: ["Casual Leave", "Sick Leave", "Loss of Pay"], required: true },
    leaveCode: { type: String, enum: ["CL", "SL", "LOP"], required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    days: { type: Number, required: true },
    alternateMobile: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "Cancelled"], default: "Pending" },
    approvedBy: { type: String, default: "" },
    hrComment: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Leaves", leaveSchema);