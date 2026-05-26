// const User = require("../models/Profile");

// // ==========================
// // GET PROFILE
// // ==========================
// exports.getProfile =
//     async(req, res) => {

//         try {

//             let user =
//                 await User.findOne();

//             // CREATE DEFAULT USER
//             if (!user) {

//                 user =
//                     await User.create({
//                         fullName: "Rakesh Kumar",

//                         designation: "Manager Portal",

//                         email: "rakeshh@ecstasysolutions.org.in",

//                         department: "Management",

//                         phone: "9381698422",

//                         birthday: "16 Jun",

//                         joinedDate: "16 Apr 2026",

//                         status: "Active",

//                         notifications: 0
//                     });
//             }

//             res.status(200).json({
//                 success: true,
//                 user
//             });

//         } catch (error) {

//             console.log(error);

//             res.status(500).json({
//                 success: false,
//                 message: "Failed to fetch profile"
//             });
//         }
//     };

// // ==========================
// // UPDATE PROFILE
// // ==========================
// exports.updateProfile =
//     async(req, res) => {

//         try {

//             const {
//                 fullName,
//                 designation,
//                 phone,
//                 department
//             } = req.body;

//             let user =
//                 await User.findOne();

//             if (!user) {

//                 return res.status(404)
//                     .json({
//                         success: false,
//                         message: "User not found"
//                     });
//             }

//             // UPDATE FIELDS
//             user.fullName =
//                 fullName ||
//                 user.fullName;

//             user.designation =
//                 designation ||
//                 user.designation;

//             user.phone =
//                 phone ||
//                 user.phone;

//             user.department =
//                 department ||
//                 user.department;

//             await user.save();

//             res.status(200).json({
//                 success: true,
//                 message: "Profile updated successfully",
//                 user
//             });

//         } catch (error) {

//             console.log(error);

//             res.status(500).json({
//                 success: false,
//                 message: "Profile update failed"
//             });
//         }
//     };






const User = require("../models/User");
const bcrypt = require("bcryptjs");
// ==========================
// GET MANAGER PROFILE
// ==========================
exports.getProfile = async(req, res) => {
    try {
        const user = await User.findOne({
            _id: req.user._id,
            role: "manager",
        }).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Manager profile not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
        });
    }
};

// ==========================
// UPDATE MANAGER PROFILE
// ==========================
exports.updateProfile = async(req, res) => {
    try {
        const { fullName, designation, phoneNumber } = req.body;

        const user = await User.findOne({
            _id: req.user._id,
            role: "manager",
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Manager profile not found",
            });
        }

        // manager can update only these fields
        if (fullName) user.name = fullName;
        if (designation) user.designation = designation;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        await user.save();

        const updatedUser = await User.findById(user._id).select("-password");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Profile update failed",
        });
    }
};

// ==========================
// CHANGE MANAGER PASSWORD
// ==========================
exports.changePassword = async(req, res) => {
    try {
        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password, new password and confirm password are required",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match",
            });
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must be minimum 8 characters with 1 uppercase letter and 1 number",
            });
        }

        const user = await User.findOne({
            _id: req.user._id,
            role: "manager",
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Manager not found",
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Password update failed",
        });
    }
};