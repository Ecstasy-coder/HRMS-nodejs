const express = require("express");
const router = express.Router();
const payslipController = require("../controllers/payslipController");

router.get("/", payslipController.getAllPayslips);
router.get("/:employeeId", payslipController.getPayslipByEmployee);
router.post("/", payslipController.createPayslip);
router.put("/:id", payslipController.updatePayslip);
router.delete("/:id", payslipController.deletePayslip);

module.exports = router;
