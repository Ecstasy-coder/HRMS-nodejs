const mongoose =
    require("mongoose");

const JobCardSchema =
    new mongoose.Schema({

        employeeName: {
            type: String,
            required: true
        },

        department: {
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

        date: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Approved",
                "Rejected"
            ],
            default: "Pending"
        },

        managerComment: {
            type: String,
            default: ""
        },

        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        }

    }, {
        timestamps: true
    });

module.exports =
    mongoose.model(
        "JobCard",
        JobCardSchema
    );