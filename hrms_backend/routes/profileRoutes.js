// const express = require("express");

// const router = express.Router();

// const {
//     getProfile,
//     updateProfile
// } = require(
//     "../controllers/profileController"
// );

// // ==========================
// // GET PROFILE
// // ==========================
// router.get(
//     "/profile",
//     getProfile
// );

// // ==========================
// // UPDATE PROFILE
// // ==========================
// router.put(
//     "/profile",
//     updateProfile
// );

// module.exports = router;






const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    changePassword,
} = require("../controllers/profileController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

// GET manager profile
router.get(
    "/profile",
    protect,
    allowRoles("manager"),
    getProfile
);

// UPDATE manager profile
router.put(
    "/profile",
    protect,
    allowRoles("manager"),
    updateProfile
);

// CHANGE manager password
router.put(
    "/profile/change-password",
    protect,
    allowRoles("manager"),
    changePassword
);
module.exports = router;