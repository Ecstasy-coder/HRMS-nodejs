const express =
require("express");

const router =
express.Router();

const {

runPayroll,
getPayroll,
getPayslip

} = require(
"../controllers/payrollController"
);


/* RUN PAYROLL */

router.post(
"/run",
runPayroll
);


/* GET ALL PAYROLL */

router.get(
"/",
getPayroll
);


/* GET SINGLE PAYSLIP */

router.get(
"/:id",
getPayslip
);


module.exports =
router;