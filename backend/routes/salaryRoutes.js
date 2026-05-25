// /* routes/salaryRoutes.js */

// const express =
// require("express");

// const router =
// express.Router();

// const {

// getSalaryStructures,
// getSalaryByEmployee,
// createSalaryStructure,
// updateSalaryStructure,
// deleteSalaryStructure

// } = require(
// "../controllers/salaryController"
// );

// /* GET ALL SALARY STRUCTURES */

// router.get(
// "/",
// getSalaryStructures
// );

// /* GET EMPLOYEE HISTORY */

// router.get(
// "/employee/:empCode",
// getSalaryByEmployee
// );

// /* CREATE SALARY STRUCTURE */

// router.post(
// "/",
// createSalaryStructure
// );

// /* UPDATE SALARY STRUCTURE */

// router.put(
// "/:id",
// updateSalaryStructure
// );

// /* DELETE SALARY STRUCTURE */

// router.delete(
// "/:id",
// deleteSalaryStructure
// );

// module.exports =
// router;


// 2nd modification
const express =
require("express");

const router =
express.Router();

const {

getSalary,
createSalary

} = require(
"../controllers/salaryController"
);

/* GET */

router.get(
"/",
getSalary
);

/* POST */

router.post(
"/",
createSalary
);

module.exports =
router;

