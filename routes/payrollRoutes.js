const express =
require("express");

const router =
express.Router();

const {

runPayroll,
getPayroll

} = require(
"../controllers/payrollController"
);

router.post(
"/payroll/run",
runPayroll
);

router.get(
"/payroll",
getPayroll
);

module.exports = router;