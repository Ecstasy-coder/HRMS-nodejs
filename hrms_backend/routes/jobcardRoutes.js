const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/jobcardController");

// Employee submits a job card
router.post("/",        ctrl.createJobCard);    // POST /api/jobcards

// Employee views their own job cards
router.get("/",         ctrl.getMyJobCards);    // GET  /api/jobcards

// HR / Admin views ALL job cards
router.get("/all",      ctrl.getAllJobCards);   // GET  /api/jobcards/all

// Employee edits their own card (only if still at employee stage)
router.put("/:id",      ctrl.updateJobCard);   // PUT  /api/jobcards/:id

// RM / HR / Admin reviews a card (stage-based)
router.put("/:id/review", ctrl.reviewJobCard); // PUT  /api/jobcards/:id/review

// Employee deletes a pending card
router.delete("/:id",   ctrl.deleteJobCard);   // DELETE /api/jobcards/:id

module.exports = router;
