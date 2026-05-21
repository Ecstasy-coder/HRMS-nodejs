const express = require("express");

const router = express.Router();

const {

getSalary,

createSalary

} = require("../controllers/salaryController");

router.get("/salary", getSalary);

router.post("/salary", createSalary);

module.exports = router;