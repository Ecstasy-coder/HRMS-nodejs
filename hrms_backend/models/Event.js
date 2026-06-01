// ============================================================
// FILE: backend/models/Event.js
// ============================================================

const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    // Who created this event (link to User)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Creator name stored at creation time (for easy display)
    creatorName: {
      type: String,
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    // Category values match the filter tabs in the UI
    category: {
      type: String,
      enum: [
        "Performance Review",
        "Company Event",
        "Deadline",
        "Town Hall",
        "Other"
      ],
      default: "Other"
    },

    eventDate: {
      type: Date,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    // Visibility control
    visibleTo: {
      type: String,
      enum: ["All Employees", "HR Only", "Managers Only"],
      default: "All Employees"
    }
  },
  {
    timestamps: true   // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Event", EventSchema);
