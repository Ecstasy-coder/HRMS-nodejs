const express = require("express");
const router = express.Router();

const {
    getBirthdays
} = require("../controllers/birthdayController");

router.get("/", getBirthdays);

module.exports = router;