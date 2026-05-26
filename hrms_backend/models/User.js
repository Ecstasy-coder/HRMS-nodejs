// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         trim: true,
//     },

//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true,
//         trim: true,
//     },

//     password: {
//         type: String,
//         required: true,
//     },

//     role: {
//         type: String,
//         enum: ["admin", "hr", "manager", "finance", "employee"],
//         required: true,
//     },

//     createdBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         default: null,
//     },
// }, { timestamps: true });

// module.exports = mongoose.model("User", userSchema);




const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["admin", "hr", "manager", "finance", "employee"],
        required: true,
    },

    employeeId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },

    department: {
        type: String,
        trim: true,
        default: "",
    },

    designation: {
        type: String,
        trim: true,
        default: "",
    },

    phoneNumber: {
        type: String,
        trim: true,
        default: "",
    },

    dateOfBirth: {
        type: Date,
        default: null,
    },

    dateOfJoining: {
        type: Date,
        default: null,
    },

    // Only employee will have managerId
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);