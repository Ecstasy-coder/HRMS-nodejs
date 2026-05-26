const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        default: "Rakesh"
    },

    designation: {
        type: String,
        default: "Manager Portal"
    },

    email: {
        type: String,
        required: true,
        unique: true,
        default: "rakeshh@ecstasysolutions.org.in"
    },

    department: {
        type: String,
        default: "Management"
    },

    phone: {
        type: String,
        default: "9381698422"
    },

    birthday: {
        type: String,
        default: "16 Jun"
    },

    joinedDate: {
        type: String,
        default: "16 Apr 2026"
    },

    status: {
        type: String,
        default: "Active"
    },

    notifications: {
        type: Number,
        default: 0
    },

    password: {
        type: String,
        default: "Manager@123"
    }
}, {
    timestamps: true
});

module.exports =
    mongoose.model(
        "Profile",
        userSchema
    );