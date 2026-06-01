const mongoose = require("mongoose");

const JobCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    employeeName: { type: String, required: true },
    department:   { type: String, required: true },
    projectName:  { type: String, required: true },
    hoursWorked:  { type: Number, required: true },
    workDescription: { type: String, required: true },
    date: { type: Date, required: true },

    // Multi-stage workflow
    // 'employee' → pending with RM
    // 'rm_approved' → RM approved, pending with HR
    // 'hr_approved' → HR approved, pending with Admin
    // 'done' → Admin has reviewed (final state)
    currentStage: {
      type: String,
      enum: ['employee', 'rm_approved', 'hr_approved', 'done'],
      default: 'employee'
    },

    // Admin final review
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    adminComment: { type: String, default: "" },
    rating:       { type: Number, default: 0, min: 0, max: 5 },

    // RM review
    rmStatus:  { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rmComment: { type: String, default: "" },

    // HR review
    hrStatus:  { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    hrComment: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobCard", JobCardSchema);
