const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
        subject: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,

            enum: [
                "Payroll Issue",
                "HR Query",
                "IT Support",
                "Leave & Attendance",
                "General Complaint"
            ]
        },

        priority: {
            type: String,
            required: true,

            enum: [
                "Low",
                "Medium",
                "High",
                "Critical"
            ],

            default: "Medium"
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        raisedByRole: {
            type: String,
            default: "report_manager"
        },

        status: {
            type: String,

            enum: [
                "Open",
                "In Progress",
                "Resolved",
                "Closed"
            ],

            default: "Open"
        }
    },

    { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);