const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    rmId: { type: String, required: true, unique: true },
    rmName: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["employee", "hr", "reporting_manager"], default: "employee" },
    reportingManager: { type: String, default: null },
    alternateMobile: { type: String, default: "" },
    leaveBalances: {
        CL: { total: { type: Number, default: 12 }, used: { type: Number, default: 0 }, left: { type: Number, default: 12 } },
        SL: { total: { type: Number, default: 12 }, used: { type: Number, default: 0 }, left: { type: Number, default: 12 } },
        LOP: { total: { type: Number, default: 3 }, used: { type: Number, default: 0 }, left: { type: Number, default: 3 } }
    }
}, { timestamps: true });

module.exports = mongoose.model("RMuser", userSchema);