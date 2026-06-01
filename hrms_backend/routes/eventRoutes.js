// ============================================================
// FILE: backend/routes/eventRoutes.js
// ============================================================

const express = require("express");
const router  = express.Router();

const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

// GET    /api/events             → Get all events (optional ?category=Town Hall)
router.get("/",    getEvents);

// POST   /api/events             → Create a new event
router.post("/",   createEvent);

// PUT    /api/events/:id         → Edit an event
router.put("/:id", updateEvent);

// DELETE /api/events/:id         → Delete an event
router.delete("/:id", deleteEvent);

module.exports = router;
