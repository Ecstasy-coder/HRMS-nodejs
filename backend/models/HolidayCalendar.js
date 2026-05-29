const mongoose = require(
    "mongoose"
);

const holidayCalendarSchema =
    new mongoose.Schema({

            title: {
                type: String,
                required: true,
            },

            year: {
                type: Number,
                required: true,
            },

            fileName: {
                type: String,
                required: true,
            },

            filePath: {
                type: String,
                required: true,
            },

            fileType: {
                type: String,
                required: true,
            },

            fileSize: {
                type: String,
                required: true,
            },

            uploadedBy: {
                type: String,
                default: "HR Admin",
            },

        },

        {
            timestamps: true,
        }
    );

module.exports = mongoose.model(
    "HolidayCalendar",
    holidayCalendarSchema
);