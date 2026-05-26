const User = require("../models/User");

const adminDashboard = async(req, res) => {
    const totalHR = await User.countDocuments({ role: "hr" });
    const totalFinance = await User.countDocuments({ role: "finance" });
    const totalManagers = await User.countDocuments({ role: "manager" });
    const totalEmployees = await User.countDocuments({ role: "employee" });

    res.json({
        success: true,
        dashboard: "Admin Dashboard",
        user: req.user,
        stats: {
            totalHR,
            totalFinance,
            totalManagers,
            totalEmployees,
        },
        access: ["Create HR", "Create Finance", "View All Users"],
    });
};

const hrDashboard = async(req, res) => {
    const totalManagers = await User.countDocuments({ role: "manager" });
    const totalEmployees = await User.countDocuments({ role: "employee" });

    res.json({
        success: true,
        dashboard: "HR Dashboard",
        user: req.user,
        stats: {
            totalManagers,
            totalEmployees,
        },
        access: ["Create Manager", "Create Employee", "Manage Employees"],
    });
};

const managerDashboard = async(req, res) => {
    res.json({
        success: true,
        dashboard: "Manager Dashboard",
        user: req.user,
        access: ["View Team", "Approve Leave", "Track Employee Work"],
    });
};

const financeDashboard = async(req, res) => {
    res.json({
        success: true,
        dashboard: "Finance Dashboard",
        user: req.user,
        access: ["Payroll", "Salary Management", "Payslips"],
    });
};

const employeeDashboard = async(req, res) => {
    res.json({
        success: true,
        dashboard: "Employee Dashboard",
        user: req.user,
        access: ["View Profile", "Apply Leave", "View Payslip"],
    });
};

module.exports = {
    adminDashboard,
    hrDashboard,
    managerDashboard,
    financeDashboard,
    employeeDashboard,
};