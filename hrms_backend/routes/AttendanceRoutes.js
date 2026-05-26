const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

router.get("/", async(req, res) => {
    try {
        const attendance = await Attendance.find().sort({ date: -1 });
        res.json({ success: true, count: attendance.length, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Fetch ALL records for EMP001 — filtering done on frontend
router.get("/employee", async(req, res) => {
    try {
        const attendance = await Attendance.find({ employeeId: "EMP001" }).sort({ date: 1 });
        res.json({ success: true, count: attendance.length, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/manager/:managerName", async(req, res) => {
    try {
        const attendance = await Attendance.find({
            employeeName: req.params.managerName
        }).sort({ date: -1 });
        res.json({ success: true, count: attendance.length, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;