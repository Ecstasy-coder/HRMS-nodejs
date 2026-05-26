const express = require("express");
const router = express.Router();

const {
    registerAdmin,
    login,
    adminCreateUser,
    hrCreateUser,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.post("/register-admin", registerAdmin);
router.post("/login", login);

router.post(
    "/admin/create-user",
    protect,
    allowRoles("admin"),
    adminCreateUser
);

router.post(
    "/hr/create-user",
    protect,
    allowRoles("hr"),
    hrCreateUser
);

module.exports = router;