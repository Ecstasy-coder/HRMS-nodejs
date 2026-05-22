const express = require("express");

const router = express.Router();

const {

  createJobCard,
  getJobCards,
  updateJobCard

} = require(
  "../controllers/jobCardController"
);

router.post("/", createJobCard);

router.get("/", getJobCards);

router.put("/:id", updateJobCard);

module.exports = router;