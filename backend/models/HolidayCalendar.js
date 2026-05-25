const mongoose = require("mongoose");

const holidayCalendarSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    year: {
        type: Number,
        required: true
    },

    filePath: {
        type: String,
        required: true
    },

    fileName: {
        type: String,
        required: true
    },

    fileSize: {
        type: String,
        required: true
    },

    mimeType: {
        type: String,
        required: true
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model(
    "HolidayCalendar",
    holidayCalendarSchema
);