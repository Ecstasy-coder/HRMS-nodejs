const Leave = require("../models/Leave");
const User = require("../models/RMusers");


// =====================================
// APPLY LEAVE (RM)
// =====================================
const applyLeave = async(req, res) => {
    try {
        const {
            rmId,
            rmName,
            leaveType,
            leaveCode,
            fromDate,
            toDate,
            days,
            alternateMobile,
            reason
        } = req.body;

        const user =
            await User.findOne({ rmId });

        // Balance validation only
        if (
            leaveCode === "CL" &&
            user &&
            user.leaveBalances.CL.left < days
        ) {
            return res.status(400).json({
                success: false,
                message: `Insufficient Casual Leave balance. Available: ${user.leaveBalances.CL.left} days`
            });
        }

        if (
            leaveCode === "SL" &&
            user &&
            user.leaveBalances.SL.left < days
        ) {
            return res.status(400).json({
                success: false,
                message: `Insufficient Sick Leave balance. Available: ${user.leaveBalances.SL.left} days`
            });
        }

        // Create leave only
        const leave =
            await Leave.create({
                rmId,
                rmName,
                leaveType,
                leaveCode,
                fromDate,
                toDate,
                days,
                alternateMobile,
                reason,
                status: "Pending"
            });

        res.status(201).json({
            success: true,
            message: "Leave request submitted",
            leave
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Error applying leave",
            error: error.message
        });
    }
};


// =====================================
// GET MY LEAVES (RM)
// =====================================
const getMyLeaves = async(req, res) => {
    try {

        const { rmId } =
        req.params;

        const leaves =
            await Leave.find({
                rmId
            }).sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            leaves
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Error fetching leaves",
            error: error.message
        });
    }
};


// =====================================
// GET ALL LEAVES (HR)
// =====================================
const getAllLeaves = async(req, res) => {
    try {

        const leaves =
            await Leave.find()
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            leaves
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Error fetching leaves",
            error: error.message
        });
    }
};


// =====================================
// APPROVE LEAVE (HR)
// =====================================
const approveLeave = async(req, res) => {
    try {

        const { id } =
        req.params;

        const leave =
            await Leave.findById(id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave not found"
            });
        }

        if (
            leave.status !==
            "Pending"
        ) {
            return res.status(400).json({
                success: false,
                message: "Only pending leaves can be approved"
            });
        }

        // Get User
        const user =
            await User.findOne({
                rmId: leave.rmId
            });

        // Update balance ONLY AFTER APPROVAL
        if (user) {

            const code =
                leave.leaveCode;

            // CL & SL
            if (
                code === "CL" ||
                code === "SL"
            ) {

                user.leaveBalances[
                    code
                ].used += leave.days;

                user.leaveBalances[
                    code
                ].left -= leave.days;
            }

            // LOP
            else if (
                code === "LOP"
            ) {

                user.leaveBalances
                    .LOP.used += leave.days;

                user.leaveBalances
                    .LOP.left =
                    user.leaveBalances
                    .LOP.total -
                    user.leaveBalances
                    .LOP.used;

                if (
                    user.leaveBalances
                    .LOP.left < 0
                ) {
                    user.leaveBalances
                        .LOP.left = 0;
                }
            }

            await user.save();
        }

        // Approve Leave
        leave.status =
            "Approved";

        leave.approvedBy =
            "HR";

        await leave.save();

        res.status(200).json({
            success: true,
            message: "Leave approved successfully",
            leave,
            updatedBalances: user && user.leaveBalances ? user.leaveBalances : []
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Error approving leave",
            error: error.message
        });
    }
};


// =====================================
// REJECT LEAVE (HR)
// =====================================
const rejectLeave = async(req, res) => {
    try {

        const { id } =
        req.params;

        const leave =
            await Leave.findById(id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave not found"
            });
        }

        if (
            leave.status !==
            "Pending"
        ) {
            return res.status(400).json({
                success: false,
                message: "Only pending leaves can be rejected"
            });
        }

        // Just reject
        leave.status =
            "Rejected";

        leave.approvedBy =
            "HR";

        await leave.save();

        res.status(200).json({
            success: true,
            message: "Leave rejected",
            leave
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Error rejecting leave",
            error: error.message
        });
    }
};


// =====================================
// CANCEL LEAVE (RM)
// =====================================
const cancelLeave = async(req, res) => {
    try {

        const { id } =
        req.params;

        const leave =
            await Leave.findById(id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave not found"
            });
        }

        if (
            leave.status !==
            "Pending"
        ) {
            return res.status(400).json({
                success: false,
                message: "Only pending leave can be cancelled"
            });
        }

        // Just cancel
        leave.status =
            "Cancelled";

        await leave.save();

        res.status(200).json({
            success: true,
            message: "Leave cancelled",
            leave
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Error cancelling leave",
            error: error.message
        });
    }
};


// =====================================
// GET USER BALANCES
// =====================================
const getUserBalances = async(req, res) => {
    try {

        const { rmId } =
        req.params;

        const user =
            await User.findOne({
                rmId
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            balances: user.leaveBalances
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Error fetching balances",
            error: error.message
        });
    }
};


// =====================================
// CREATE / UPDATE USER
// =====================================
const createOrUpdateUser =
    async(req, res) => {
        try {

            const {
                rmId,
                rmName,
                email,
                role,
                reportingManager,
                alternateMobile
            } = req.body;

            let user =
                await User.findOne({
                    rmId
                });

            if (user) {

                user.rmName =
                    rmName ||
                    user.rmName;

                user.email =
                    email ||
                    user.email;

                user.role =
                    role ||
                    user.role;

                user.reportingManager =
                    reportingManager !==
                    undefined ?
                    reportingManager :
                    user.reportingManager;

                user.alternateMobile =
                    alternateMobile ||
                    user.alternateMobile;

                await user.save();

            } else {

                user =
                    await User.create({
                        rmId,
                        rmName,
                        email,
                        role,
                        reportingManager,
                        alternateMobile
                    });
            }

            res.status(200).json({
                success: true,
                user
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: "Error creating user",
                error: error.message
            });
        }
    };


module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    approveLeave,
    rejectLeave,
    cancelLeave,
    getUserBalances,
    createOrUpdateUser
};