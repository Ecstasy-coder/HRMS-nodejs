// ============================================================
// FILE: backend/models/Leave.js
// ============================================================

const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userFullName:    { type: String, required: true },
    userDepartment:  { type: String },
    userDesignation: { type: String },

    leaveType: {
      type: String,
      required: true,
      enum: ['CL', 'SL', 'ML', 'LOP']   // Casual, Sick, Maternity, Loss of Pay
    },

    fromDate:        { type: Date, required: true },
    toDate:          { type: Date, required: true },
    days:            { type: Number, required: true },   // calculated by backend

    alternateMobile: { type: String, trim: true },
    reason:          { type: String, required: true, trim: true },

    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Approved', 'Rejected']
    },

    adminComment:    { type: String, trim: true, default: '' },
    reviewedBy:      { type: String, trim: true, default: '' },
    reviewedAt:      { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leave', leaveSchema);