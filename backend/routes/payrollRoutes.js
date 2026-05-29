const express = require("express");
const router = express.Router();
const {
  runPayroll,
  getPayroll,
  getPayslip,
  finalizePayroll,
  markPayrollAsPaid,
  adjustPayrollEntry,  // ADDED: Imported your new adjustment controller

   exportCSV 
} = require("../controllers/payrollController");

/* RUN PAYROLL (POST) */
router.post("/run", runPayroll);

/* GET ALL PAYROLL (GET) */
router.get("/", getPayroll);

/* EXPORT CSV - MUST BE ABOVE DYNAMIC ROUTES */
router.get("/export", exportCSV);

   
/* FINALIZE PAYROLL */
router.put("/finalize", finalizePayroll);

/* MARK PAYROLL AS PAID */
router.put("/paid", markPayrollAsPaid);

/* ADJUST AND RECALCULATE PAYROLL ENTRY */
router.put("/adjust/:id", adjustPayrollEntry); // ADDED: New route for the frontend modal


/* GET SINGLE PAYSLIP (Must remain at the very bottom!) */
router.get("/:id", getPayslip);


module.exports = router;