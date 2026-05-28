const express = require("express");
const router = express.Router();

const {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    approveLeave,
    rejectLeave,
    cancelLeave,
    getUserBalances,
    createOrUpdateUser,
} = require("../controllers/leaveController");

// RM APIs
router.post("/apply", applyLeave);
router.get("/my-leaves/:rmId", getMyLeaves);
router.delete("/cancel/:id", cancelLeave);
router.get("/balances/:rmId", getUserBalances);

// HR APIs
router.get("/all", getAllLeaves);
router.put("/approve/:id", approveLeave);
router.put("/reject/:id", rejectLeave);

// User Management
router.post("/user", createOrUpdateUser);

module.exports = router;