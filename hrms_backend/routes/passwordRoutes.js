const express = require("express");

const router = express.Router();

const {
    changePassword,
} = require("../controllers/profileController");

// Change Password Route
router.put("/change", changePassword);

module.exports = router;