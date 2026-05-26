const express = require("express");
const router = express.Router();

const {
    createJobCard,
    getJobCards,
    approveJobCard,
    rejectJobCard,
    getRatingAnalytics
} = require("../controllers/jobCardController");

router.post("/", createJobCard);
router.get("/", getJobCards);
router.get("/analytics/ratings", getRatingAnalytics);
router.patch("/:id/approve", approveJobCard);
router.patch("/:id/reject", rejectJobCard);

module.exports = router;