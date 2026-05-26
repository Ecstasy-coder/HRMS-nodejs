const mongoose = require("mongoose");

const myJobCardSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    projectName: {
        type: String,
        required: true
    },
    hoursWorked: {
        type: Number,
        required: true
    },
    workDescription: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Sent to HR", "Reviewed", "Rejected"],
        default: "Sent to HR"
    }
}, { timestamps: true });

module.exports = mongoose.model("MyJobCard", myJobCardSchema);