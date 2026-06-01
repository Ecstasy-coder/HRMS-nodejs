// ============================================================
// FILE: backend/controllers/eventController.js
// ============================================================

const Event = require("../models/Event");
const User  = require("../models/User");


// ─── CREATE: Add a new event ────────────────────────────────
// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { title, category, eventDate, description, visibleTo } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({ error: "Title and event date are required" });
    }

    const newEvent = new Event({
      createdBy:   user._id,
      creatorName: user.fullName,
      title:       title.trim(),
      category:    category || "Other",
      eventDate:   new Date(eventDate),
      description: description?.trim() || "",
      visibleTo:   visibleTo || "All Employees"
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event added successfully!",
      event:   newEvent
    });

  } catch (err) {
    console.error("createEvent error:", err);
    res.status(500).json({ error: "Server error while saving event" });
  }
};


// ─── READ: Get all events (with optional category filter) ───
// GET /api/events?category=Town Hall
exports.getEvents = async (req, res) => {
  try {
    const filter = {};

    // Optional category filter
    if (req.query.category && req.query.category !== "all") {
      filter.category = req.query.category;
    }

    const events = await Event.find(filter).sort({ eventDate: 1 }); // ascending: upcoming first

    res.json({ success: true, events });

  } catch (err) {
    console.error("getEvents error:", err);
    res.status(500).json({ error: "Server error while fetching events" });
  }
};


// ─── UPDATE: Edit an event ─────────────────────────────────
// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Only creator (or any HR Admin) can edit
    if (event.createdBy.toString() !== req.session.userId.toString()) {
      const user = await User.findById(req.session.userId);
      if (!user || !["HR Admin", "HR"].includes(user.role)) {
        return res.status(403).json({ error: "Forbidden: you cannot edit this event" });
      }
    }

    const { title, category, eventDate, description, visibleTo } = req.body;

    if (title)       event.title       = title.trim();
    if (category)    event.category    = category;
    if (eventDate)   event.eventDate   = new Date(eventDate);
    if (description !== undefined) event.description = description.trim();
    if (visibleTo)   event.visibleTo   = visibleTo;

    await event.save();

    res.json({
      success: true,
      message: "Event updated successfully!",
      event
    });

  } catch (err) {
    console.error("updateEvent error:", err);
    res.status(500).json({ error: "Server error while updating event" });
  }
};


// ─── DELETE: Remove an event ───────────────────────────────
// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Only creator (or any HR Admin) can delete
    if (event.createdBy.toString() !== req.session.userId.toString()) {
      const user = await User.findById(req.session.userId);
      if (!user || !["HR Admin", "HR"].includes(user.role)) {
        return res.status(403).json({ error: "Forbidden: you cannot delete this event" });
      }
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Event deleted successfully!" });

  } catch (err) {
    console.error("deleteEvent error:", err);
    res.status(500).json({ error: "Server error while deleting event" });
  }
};
