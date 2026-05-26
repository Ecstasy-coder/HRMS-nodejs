const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
    adminDashboard,
    hrDashboard,
    managerDashboard,
    financeDashboard,
    employeeDashboard,
} = require("../controllers/dashboardController");

router.get("/admin", protect, allowRoles("admin"), adminDashboard);
router.get("/hr", protect, allowRoles("hr"), hrDashboard);
router.get("/manager", protect, allowRoles("manager"), managerDashboard);
router.get("/finance", protect, allowRoles("finance"), financeDashboard);
router.get("/employee", protect, allowRoles("employee"), employeeDashboard);

module.exports = router;