const mongoose = require("mongoose");

const holidayDateSchema = new mongoose.Schema(
  {
    date: {
      type: String,      // "YYYY-MM-DD"
      required: true
    },

    name: {
      type: String,      // "Republic Day"
      required: true
    },

    type: {
      type: String,
      enum: ["Holiday", "Week Off"],
      default: "Holiday"
    },

    year: {
      type: Number,
      required: true
    },

    calendarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HolidayCalendar"
    }
  },
  { timestamps: true }
);

// Index for fast lookup by year + date range
holidayDateSchema.index({ year: 1, date: 1 });

module.exports = mongoose.model("HolidayDate", holidayDateSchema);