const JobCard = require("../models/jobcard");
const User = require("../models/User");

// POST /api/jobcards — Employee submits job card
exports.createJobCard = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { projectName, hoursWorked, workDescription, date } = req.body;
    if (!projectName || !hoursWorked || !workDescription || !date)
      return res.status(400).json({ error: "All fields are required" });

    const submittedDate = new Date(date);
    const startOfDay = new Date(submittedDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay   = new Date(submittedDate); endOfDay.setHours(23, 59, 59, 999);

    const existing = await JobCard.findOne({ userId: user._id, date: { $gte: startOfDay, $lte: endOfDay } });
    if (existing) return res.status(400).json({ error: "A job card already exists for this date." });

    // HR Admin / HR users skip the RM review stage — go straight to admin review
    const isHR = ['hr admin', 'hr'].includes((user.role || '').toLowerCase());
    const initialStage = isHR ? 'hr_approved' : 'employee';
    const initialRmStatus = isHR ? 'approved' : 'pending';

    const newCard = new JobCard({
      userId: user._id,
      employeeName: user.fullName,
      department: user.department || "General",
      projectName: projectName.trim(),
      hoursWorked: Number(hoursWorked),
      workDescription: workDescription.trim(),
      date: submittedDate,
      currentStage: initialStage,
      status: "pending",
      rmStatus: initialRmStatus,
      hrStatus: "pending"
    });
    await newCard.save();
    res.status(201).json({ success: true, message: "Job Card submitted successfully!", card: newCard });
  } catch (err) {
    console.error("createJobCard error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/jobcards — My job cards
exports.getMyJobCards = async (req, res) => {
  try {
    const cards = await JobCard.find({ userId: req.session.userId }).sort({ date: -1 });
    res.json({ success: true, cards });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/jobcards/all — All cards (HR/Admin use)
exports.getAllJobCards = async (req, res) => {
  try {
    const cards = await JobCard.find().sort({ date: -1 });
    res.json({ success: true, cards });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/jobcards/:id — Employee edit OR HR/RM review via old interface
exports.updateJobCard = async (req, res) => {
  try {
    const card = await JobCard.findById(req.params.id);
    if (!card) return res.status(404).json({ error: "Not found" });

    const reviewer = await User.findById(req.session.userId).select("role fullName");
    const role = (reviewer?.role || "").toLowerCase();

    // HR reviewing (old review-rm-cards.html interface sends status/rating/comment)
    if ((role === "hr admin" || role === "hr") && req.body.status) {
      const { status, rating, comment } = req.body;
      const normalised = status?.toLowerCase();
      card.hrStatus  = normalised;
      card.hrComment = comment || "";
      if (normalised === "approved") {
        card.currentStage = "hr_approved";
      } else {
        card.currentStage = "done";
        card.status = "rejected";
      }
      if (rating) card.rating = Number(rating);
      await card.save();
      return res.json({ success: true, message: `Card ${normalised}`, card });
    }

    // RM reviewing
    if ((role === "reporting manager" || role === "rm") && req.body.status) {
      const { status, rating, comment } = req.body;
      const normalised = status?.toLowerCase();
      card.rmStatus  = normalised;
      card.rmComment = comment || "";
      if (normalised === "approved") {
        card.currentStage = "rm_approved";
      } else {
        card.currentStage = "done";
        card.status = "rejected";
      }
      if (rating) card.rating = Number(rating);
      await card.save();
      return res.json({ success: true, message: `Card ${normalised}`, card });
    }

    // Employee editing their own card
    if (card.userId.toString() !== req.session.userId.toString())
      return res.status(403).json({ error: "Forbidden" });
    if (card.currentStage !== "employee")
      return res.status(400).json({ error: "Cannot edit a card that has already been reviewed." });

    const today = new Date();
    const diffDays = Math.floor((today - new Date(card.date)) / (1000 * 60 * 60 * 24));
    if (diffDays > 7) return res.status(400).json({ error: "Edit window expired (7 days)." });

    const { projectName, hoursWorked, workDescription } = req.body;
    if (projectName)     card.projectName     = projectName.trim();
    if (hoursWorked)     card.hoursWorked     = Number(hoursWorked);
    if (workDescription) card.workDescription = workDescription.trim();
    await card.save();
    res.json({ success: true, message: "Updated!", card });
  } catch (err) {
    console.error("updateJobCard:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/jobcards/:id/review — RM reviews (approves → moves to HR stage)
exports.reviewJobCard = async (req, res) => {
  try {
    const { status, adminComment, rating, comment } = req.body;
    const resolvedStatus = status;
    if (!["approved", "rejected"].includes(resolvedStatus?.toLowerCase()))
      return res.status(400).json({ error: "Status must be approved or rejected" });

    const card = await JobCard.findById(req.params.id);
    if (!card) return res.status(404).json({ error: "Not found" });

    const reviewer = await User.findById(req.session.userId).select("role fullName");
    const role = reviewer?.role?.toLowerCase() || "";

    if (role === "admin") {
      // Admin final review
      card.status       = resolvedStatus;
      card.adminComment = adminComment || comment || "";
      card.rating       = Number(rating) || 0;
      card.currentStage = "done";
    } else if (role === "hr admin" || role === "hr") {
      // HR review
      card.hrStatus  = resolvedStatus;
      card.hrComment = adminComment || comment || "";
      if (resolvedStatus === "approved") card.currentStage = "hr_approved";
      else { card.currentStage = "done"; card.status = "rejected"; }
    } else {
      // RM review
      card.rmStatus  = resolvedStatus;
      card.rmComment = adminComment || comment || "";
      if (resolvedStatus === "approved") card.currentStage = "rm_approved";
      else { card.currentStage = "done"; card.status = "rejected"; }
    }

    await card.save();
    res.json({ success: true, message: `Card ${resolvedStatus}`, card });
  } catch (err) {
    console.error("reviewJobCard:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/jobcards/:id
exports.deleteJobCard = async (req, res) => {
  try {
    const card = await JobCard.findById(req.params.id);
    if (!card) return res.status(404).json({ error: "Not found" });
    if (card.userId.toString() !== req.session.userId.toString()) return res.status(403).json({ error: "Forbidden" });
    if (card.currentStage !== "employee") return res.status(400).json({ error: "Only pending job cards can be deleted" });
    await JobCard.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
