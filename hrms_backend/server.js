// ============================================================
// MERGED SERVER FILE - FULLY FIXED VERSION
// ============================================================

const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const mongoose = require("mongoose");


const connectDB = require("./config/db");

// ── Models ─────────────────────────────────────────────────────────────
const User = require("./models/User");
const Company = require("./models/Company");
const HelpdeskTicket = require("./models/HelpdeskTicket");
const Payslip = require("./models/payslip");
const Event = require("./models/Event");

// ── Route imports ──────────────────────────────────────────────────────
const userRoutes         = require("./routes/userRoutes");
const birthdayRoutes     = require("./routes/birthdayRoutes");
const holidayRoutes      = require("./routes/holidayCalendarRoutes");
const companyRoutes      = require("./routes/companyRoutes");
const jobcardRoutes      = require("./routes/jobcardRoutes");
const rmJobcardRoutes    = require("./routes/rmJobcardRoutes");
const eventRoutes        = require("./routes/eventRoutes");
const aboutUsRoutes      = require("./routes/aboutUsRoutes");
const galleryRoutes      = require("./routes/galleryRoutes");
const helpdeskRoutes     = require("./routes/helpdesk");
const payslipRoutes      = require("./routes/payslipRoutes");
const leaveRoutes        = require("./routes/leaveRoutes");
const attendanceRoutes   = require("./routes/attendanceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Upload directories ─────────────────────────────────────────────────
const uploadDir     = path.join(__dirname, "uploads");
const docsDir       = path.join(__dirname, "uploads", "documents");
const calendarDir   = path.join(__dirname, "uploads", "calendars");
const galleryDir    = path.join(__dirname, "uploads", "gallery");
const attendanceDir = path.join(__dirname, "uploads", "attendance");

[uploadDir, docsDir, calendarDir, galleryDir, attendanceDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ── Middleware ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files ───────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));
app.use("/uploads", express.static(uploadDir));
app.use("/gallery", express.static(galleryDir));

// ── Session ────────────────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "hr_portal_secret_2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// ── Auth Middleware ────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  next();
}

// ── Avatar Upload ──────────────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    cb(
      null,
      `avatar_${req.session.userId || "temp"}_${Date.now()}${ext}`
    );
  },
});

const avatarUpload = multer({
  storage: avatarStorage,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// ── PUBLIC ROUTES ──────────────────────────────────────────────────────
app.use("/api/birthdays", birthdayRoutes);
app.use("/api/holiday-calendar", holidayRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/about", aboutUsRoutes);
app.use("/api/helpdesk", helpdeskRoutes);
app.use("/api/payslip", payslipRoutes);

// ── PROTECTED ROUTES ───────────────────────────────────────────────────
app.use("/api/users", requireAuth, userRoutes);
app.use("/api/events", requireAuth, eventRoutes);
app.use("/api/jobcards", requireAuth, jobcardRoutes);
app.use("/api/rm-jobcards", requireAuth, rmJobcardRoutes);
app.use("/api/gallery", requireAuth, galleryRoutes);
app.use("/api/leaves", requireAuth, leaveRoutes);
app.use("/api/attendance", requireAuth, attendanceRoutes);
app.use("/api/notifications", requireAuth, notificationRoutes);

// ── LOGIN API ──────────────────────────────────────────────────────────
app.post("/api/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
      });
    }

    const user = await User.findOne({
      email: {
        $regex: new RegExp(`^${email}$`, "i"),
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    req.session.userId = user._id.toString();

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({
      success: true,
      user: safeUser,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error",
    });
  }
});
app.get("/create-admin", async (req, res) => {

  try {

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      fullName: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "Admin",
      status: "Active"
    });

    await admin.save();

    res.send("Admin created successfully");

  } catch (err) {

    console.log(err);

    res.send(err.message);

  }

});

// ── LOGOUT ─────────────────────────────────────────────────────────────
app.post("/api/logout", (req, res) => {

  req.session.destroy();

  res.json({
    success: true,
  });

});

// ── PROFILE API ────────────────────────────────────────────────────────
app.get("/api/profile", requireAuth, async (req, res) => {

  try {

    const user = await User.findById(req.session.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(user);

  } catch (err) {

    res.status(500).json({
      error: "Server error",
    });

  }

});

// ── UPDATE PROFILE ────────────────────────────────────────────────────
app.put("/api/profile", requireAuth, async (req, res) => {
  try {
    const { fullName, phone, designation } = req.body;
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, error: "Full name is required" });
    }
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      {
        fullName:    fullName.trim(),
        phone:       (phone       || "").trim(),
        designation: (designation || "").trim()
      },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, user, message: "Profile updated successfully!" });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ── AVATAR UPLOAD ─────────────────────────────────────────────────────
app.post("/api/profile/avatar", requireAuth, (req, res, next) => {
  avatarUpload.single("avatar")(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
    const avatarUrl = "/uploads/" + req.file.filename;
    // Remove old avatar file if stored locally
    const existing = await User.findById(req.session.userId).select("avatar");
    if (existing && existing.avatar && existing.avatar.startsWith("/uploads/")) {
      const oldFilePath = path.join(__dirname, existing.avatar.replace(/^\//, ""));
      if (fs.existsSync(oldFilePath)) { try { fs.unlinkSync(oldFilePath); } catch (_) {} }
    }
    await User.findByIdAndUpdate(req.session.userId, { avatar: avatarUrl });
    res.json({ success: true, avatar: avatarUrl, message: "Photo updated!" });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ── AVATAR DELETE ─────────────────────────────────────────────────────
app.delete("/api/profile/avatar", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select("avatar");
    if (user && user.avatar && user.avatar.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, user.avatar.replace(/^\//, ""));
      if (fs.existsSync(filePath)) { try { fs.unlinkSync(filePath); } catch (_) {} }
    }
    await User.findByIdAndUpdate(req.session.userId, { avatar: "" });
    res.json({ success: true, message: "Photo removed!" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ── CHANGE PASSWORD ───────────────────────────────────────────────────
app.put("/api/profile/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, error: "All password fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: "New passwords do not match" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
    }
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ success: false, error: "Current password is incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ success: true, message: "Password changed successfully!" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ── SETTINGS GET ──────────────────────────────────────────────────────
app.get("/api/settings", requireAuth, async (req, res) => {
  try {
    const company = await Company.findOne();
    const data = company
      ? {
          company_name:    company.companyName || "",
          company_email:   company.email       || "",
          company_website: company.website     || "",
          company_address: company.address     || ""
        }
      : { company_name: "", company_email: "", company_website: "", company_address: "" };
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ── SETTINGS SAVE ─────────────────────────────────────────────────────
app.post("/api/settings", requireAuth, async (req, res) => {
  try {
    const { company_name, company_email, company_website, company_address } = req.body;
    let company = await Company.findOne();
    if (company) {
      company = await Company.findByIdAndUpdate(
        company._id,
        { companyName: company_name, email: company_email, website: company_website, address: company_address },
        { new: true }
      );
    } else {
      company = await Company.create({
        companyName: company_name, email: company_email,
        website: company_website, address: company_address
      });
    }
    res.json({ success: true, data: company, message: "Settings saved successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ── PAGE ROUTES ────────────────────────────────────────────────────────
app.get("/", async (req, res) => {

  if (req.session.userId) {
    try {
      const u = await User.findById(req.session.userId).select("role");
      if (u && u.role === "Admin") return res.redirect("/admin/dashboard.html");
    } catch (_) {}
    return res.redirect("/dashboard.html");
  }

  res.sendFile(
    path.join(__dirname, "..", "frontend", "login.html")
  );

});

app.get("/profile", (req, res) => {

  if (!req.session.userId) {
    return res.redirect("/");
  }

  res.sendFile(
    path.join(__dirname, "..", "frontend", "profile.html")
  );

});

app.get("/users", (req, res) => {

  if (!req.session.userId) {
    return res.redirect("/");
  }

  res.sendFile(
    path.join(__dirname, "..", "frontend", "users.html")
  );

});

app.get("/gallery", (req, res) => {

  res.sendFile(
    path.join(__dirname, "../frontend/gallery.html")
  );

});

// ══════════════════════════════════════════════════════════════
// ADMIN AUTH MIDDLEWARE
// ══════════════════════════════════════════════════════════════
async function requireAdmin(req, res, next) {

  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  try {

    const user = await User.findById(req.session.userId)
      .select("role status");

    if (
      !user ||
      user.role !== "Admin" ||
      user.status === "Inactive"
    ) {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    req.adminUser = user;

    next();

  } catch (err) {

    res.status(500).json({
      success: false,
      error: "Server error",
    });

  }

}

// ══════════════════════════════════════════════════════════════
// ADMIN PAGE ROUTES (FIXED)
// ══════════════════════════════════════════════════════════════

// Admin Main Page
app.get("/admin", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "..",
      "frontend",
      "admin",
      "index.html"
    )
  );

});

// Admin Root Redirect
app.get("/admin/", (req, res) => {
  res.redirect("/admin");
});

// Dynamic Admin Routes (FIXED VERSION)
app.get(/^\/admin\/(.*)/, (req, res) => {

  let file = req.params[0];

  if (!file || file.trim() === "") {
    file = "index.html";
  }

  const filePath = path.join(
    __dirname,
    "..",
    "frontend",
    "admin",
    file
  );

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  return res.redirect("/admin");

});

// ══════════════════════════════════════════════════════════════
// HR DASHBOARD API  /api/dashboard
// ══════════════════════════════════════════════════════════════
app.get('/api/dashboard', requireAuth, async (req, res) => {
  try {
    const JobCard = require('./models/jobcard');
    const Leave   = require('./models/Leave');
    const HolidayCalendar = require('./models/HolidayCalendar');

    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear  = now.getFullYear();

    // My job cards this month
    const startMonth = new Date(thisYear, thisMonth, 1);
    const endMonth   = new Date(thisYear, thisMonth + 1, 0, 23, 59, 59);
    const myCards = await JobCard.find({ userId: user._id, date: { $gte: startMonth, $lte: endMonth } });

    const cards = {
      total: myCards.length,
      pending:  myCards.filter(c => c.status === 'pending').length,
      approved: myCards.filter(c => c.status === 'approved').length,
      rejected: myCards.filter(c => c.status === 'rejected').length,
    };

    // Upcoming events
    const upcomingEvents = await Event.find({ date: { $gte: now } }).sort({ date: 1 }).limit(5);

    // Birthdays TODAY only (match both month and day)
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay   = String(now.getDate()).padStart(2, '0');
    const allUsers = await User.find({ status: 'Active', birthday: { $exists: true, $ne: '' } }).select('fullName birthday department avatar');
    const birthdayPeople = allUsers.filter(u => {
      if (!u.birthday) return false;
      const parts = String(u.birthday).split('-');
      if (parts.length < 3) return false;
      // Support YYYY-MM-DD and DD-MM-YYYY
      const m = parts[0].length === 4 ? parts[1] : parts[1];
      const d = parts[0].length === 4 ? parts[2] : parts[0];
      return m === todayMonth && d === todayDay;
    });

    // New members (last 30 days)
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const newMembers = await User.find({ createdAt: { $gte: thirtyDaysAgo } }).select('fullName department role avatar createdAt').limit(5);

    res.json({ success: true, user, cards, upcomingEvents, birthdayPeople, newMembers });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ══════════════════════════════════════════════════════════════
// ADMIN API ROUTES  /api/admin/*
// ══════════════════════════════════════════════════════════════

// GET /api/admin/dashboard
app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    const JobCard = require('./models/jobcard');
    const now = new Date();

    // Stats
    const totalUsers     = await User.countDocuments();
    const employees      = await User.countDocuments({ role: 'Employee' });
    // HR cards awaiting admin: currentStage hr_approved (status may be 'pending' or not yet set)
    const pendingHRCards = await JobCard.countDocuments({ currentStage: 'hr_approved' });
    const totalPendingJC = await JobCard.countDocuments({ currentStage: { $in: ['employee','rm_approved','hr_approved'] } });
    const upcomingCount  = await Event.countDocuments({ eventDate: { $gte: now } }).catch(() =>
      Event.countDocuments({ date: { $gte: now } }).catch(() => 0)
    );

    // New members (last 30 days)
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const newMembers = await User.find({ createdAt: { $gte: thirtyDaysAgo } })
      .select('fullName department role avatar createdAt joinedDate').sort({ createdAt: -1 }).limit(10);

    // Upcoming events list (next 7 days)
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    let upcomingEventsList = [];
    try {
      upcomingEventsList = await Event.find({ eventDate: { $gte: now, $lte: sevenDays } })
        .sort({ eventDate: 1 }).limit(5);
      if (!upcomingEventsList.length) {
        upcomingEventsList = await Event.find({ date: { $gte: now, $lte: sevenDays } })
          .sort({ date: 1 }).limit(5);
      }
    } catch(e) {}

    // Today's birthdays
    const today = new Date();
    const todayMonth = String(today.getMonth() + 1).padStart(2,'0');
    const todayDay   = String(today.getDate()).padStart(2,'0');
    const allUsers = await User.find({ birthday: { $ne: null, $ne: '' } }).select('fullName department birthday');
    const todayBirthdays = allUsers.filter(u => {
      if (!u.birthday) return false;
      const parts = String(u.birthday).split('-');
      if (parts.length === 3) {
        const m = parts[0].length === 4 ? parts[1] : parts[1];
        const d = parts[0].length === 4 ? parts[2] : parts[0];
        return m === todayMonth && d === todayDay;
      }
      return false;
    });

    res.json({
      success: true,
      stats:   { totalUsers, employees, pendingHRCards, totalPendingJC, upcomingEvents: upcomingCount },
      newMembers,
      upcomingEventsList,
      todayBirthdays
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const stats = {
      total:     users.length,
      active:    users.filter(u => u.status === 'Active').length,
      employees: users.filter(u => u.role === 'Employee').length,
      managers:  users.filter(u => u.role === 'Reporting Manager').length,
      hrAdmins:  users.filter(u => u.role === 'HR Admin').length,
      finance:   users.filter(u => u.role === 'Finance').length,
    };
    res.json({ success: true, users, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/admin/birthdays
app.get('/api/admin/birthdays', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ status: 'Active', birthday: { $exists: true, $ne: '' } })
      .select('fullName birthday department role avatar');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/admin/jobcards?filter=pending|approved|rejected|all
app.get('/api/admin/jobcards', requireAdmin, async (req, res) => {
  try {
    const JobCard = require('./models/jobcard');
    const { filter } = req.query;
    let query = {};

    if (filter === 'pending') {
      // Pending = any card the admin has NOT yet made a final decision on
      // This includes: hr_approved (ready for admin), rm_approved (with HR), employee (with RM)
      // Status is still 'pending' and currentStage is not 'done'
      query = { currentStage: { $ne: 'done' }, status: 'pending' };
    } else if (filter === 'approved') {
      query = { currentStage: 'done', status: 'approved' };
    } else if (filter === 'rejected') {
      query = { currentStage: 'done', status: 'rejected' };
    }
    // 'all' or undefined → no filter, show everything

    const cards = await JobCard.find(query).sort({ createdAt: -1 });

    // Counts for KPI row
    const hrToReview     = await JobCard.countDocuments({ currentStage: 'hr_approved', status: 'pending' });
    const rmCardsPending = await JobCard.countDocuments({ currentStage: 'rm_approved', status: 'pending' });
    const empCardsPending= await JobCard.countDocuments({ currentStage: 'employee',    status: 'pending' });

    res.json({ success: true, cards, counts: { hrToReview, rmCardsPending, empCardsPending } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/admin/jobcards/:id/review  (used by frontend)
app.put('/api/admin/jobcards/:id/review', requireAdmin, async (req, res) => {
  try {
    const JobCard = require('./models/jobcard');
    const { status, adminComment, rating, comment } = req.body;
    const resolvedStatus = (status || 'rejected').toLowerCase();

    const card = await JobCard.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, error: 'Card not found' });

    card.status       = resolvedStatus;
    card.currentStage = 'done';
    card.adminComment = adminComment || comment || '';
    if (rating) card.rating = Number(rating);
    await card.save();

    res.json({ success: true, card, message: `Job card ${resolvedStatus} successfully` });
  } catch (err) {
    console.error('admin jobcards PUT review:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/admin/jobcards/:id/review  (legacy support)
app.post('/api/admin/jobcards/:id/review', requireAdmin, async (req, res) => {
  try {
    const JobCard = require('./models/jobcard');
    const { action, status, rating, comment } = req.body;
    const resolvedStatus = status ? status.toLowerCase() : (action === 'approve' ? 'approved' : 'rejected');

    const card = await JobCard.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, error: 'Card not found' });

    card.status       = resolvedStatus;
    card.currentStage = 'done';
    card.adminComment = comment || '';
    if (rating) card.rating = Number(rating);
    await card.save();
    res.json({ success: true, card });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/admin/hr-leaves?status=Pending|Approved|Rejected|all
app.get('/api/admin/hr-leaves', requireAdmin, async (req, res) => {
  try {
    const Leave = require('./models/Leave');
    const status = req.query.status || 'Pending';

    // Find HR staff user IDs
    const hrRoles = ['HR Admin', 'HR', 'hr', 'hr admin'];
    const hrUsers = await User.find({ role: { $in: hrRoles } }).select('_id fullName');
    const hrIds   = hrUsers.map(u => u._id);

    // Build filter
    let query = { userId: { $in: hrIds } };
    if (status !== 'all') {
      // Capitalise first letter to match enum ('Pending','Approved','Rejected')
      const cap = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      query.status = cap;
    }

    const leaves = await Leave.find(query).sort({ createdAt: -1 });

    // Populate reviewer name for display
    const enriched = await Promise.all(leaves.map(async l => {
      const obj = l.toObject();
      if (!obj.userFullName) {
        const u = hrUsers.find(u => u._id.toString() === l.userId.toString());
        obj.userFullName = u?.fullName || 'HR Staff';
      }
      return obj;
    }));

    // Stats across ALL HR leaves regardless of filter
    const allHR = await Leave.find({ userId: { $in: hrIds } });
    const stats = {
      total:    allHR.length,
      pending:  allHR.filter(l => l.status === 'Pending').length,
      approved: allHR.filter(l => l.status === 'Approved').length,
      rejected: allHR.filter(l => l.status === 'Rejected').length,
    };

    res.json({ success: true, leaves: enriched, stats });
  } catch (err) {
    console.error('admin hr-leaves GET error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/admin/hr-leaves/:id/review  (frontend uses PUT)
app.put('/api/admin/hr-leaves/:id/review', requireAdmin, async (req, res) => {
  try {
    const Leave = require('./models/Leave');
    const { status, adminComment, comment } = req.body;
    const resolvedStatus = status || (req.body.action === 'approve' ? 'Approved' : 'Rejected');

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, error: 'Leave not found' });

    leave.status       = resolvedStatus;
    leave.adminComment = adminComment || comment || '';
    leave.reviewedBy   = req.adminUser?.fullName || 'Admin';
    leave.reviewedAt   = new Date();
    await leave.save();

    res.json({ success: true, leave, message: `Leave ${resolvedStatus.toLowerCase()} successfully` });
  } catch (err) {
    console.error('admin hr-leaves PUT error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/admin/hr-leaves/:id/review  (legacy support)
app.post('/api/admin/hr-leaves/:id/review', requireAdmin, async (req, res) => {
  try {
    const Leave = require('./models/Leave');
    const { action, status, comment, adminComment } = req.body;
    const resolvedStatus = status || (action === 'approve' ? 'Approved' : 'Rejected');

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, error: 'Leave not found' });

    leave.status       = resolvedStatus;
    leave.adminComment = adminComment || comment || '';
    leave.reviewedBy   = req.adminUser?.fullName || 'Admin';
    leave.reviewedAt   = new Date();
    await leave.save();

    res.json({ success: true, leave, message: `Leave ${resolvedStatus.toLowerCase()} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/admin/analysis
app.get('/api/admin/analysis', requireAdmin, async (req, res) => {
  try {
    const JobCard = require('./models/jobcard');
    const { period = 'monthly', month, year, dept } = req.query;
    const now = new Date();
    const m = parseInt(month) || now.getMonth() + 1;
    const y = parseInt(year)  || now.getFullYear();

    let dateFilter = {};
    if (period === 'monthly') {
      dateFilter = { $gte: new Date(y, m - 1, 1), $lte: new Date(y, m, 0, 23, 59, 59) };
    } else {
      dateFilter = { $gte: new Date(y, 0, 1), $lte: new Date(y, 11, 31, 23, 59, 59) };
    }

    let userFilter = { status: 'Active' };
    if (dept && dept !== 'All Departments') userFilter.department = dept;

    const allUsers = await User.find(userFilter).select('_id fullName role department');
    const userIds  = allUsers.map(u => u._id);
    const cards    = await JobCard.find({ userId: { $in: userIds }, date: dateFilter });

    // Per-user stats
    const userMap = {};
    allUsers.forEach(u => { userMap[u._id.toString()] = { ...u.toObject(), cards: [], avgRating: 0 }; });
    cards.forEach(c => {
      const uid = c.userId.toString();
      if (userMap[uid]) userMap[uid].cards.push(c);
    });

    const usersWithCards = Object.values(userMap).map(u => {
      const rated = u.cards.filter(c => c.rating > 0);
      u.avgRating = rated.length > 0 ? (rated.reduce((s, c) => s + c.rating, 0) / rated.length).toFixed(1) : 0;
      u.cardCount = u.cards.length;
      return u;
    });

    const employees = usersWithCards.filter(u => u.role === 'Employee');
    const managers  = usersWithCards.filter(u => u.role === 'Reporting Manager');
    const hrStaff   = usersWithCards.filter(u => ['HR Admin','HR'].includes(u.role));

    const avgAll = usersWithCards.filter(u => u.avgRating > 0);
    const orgAvgRating = avgAll.length ? (avgAll.reduce((s, u) => s + parseFloat(u.avgRating), 0) / avgAll.length).toFixed(1) : 0;
    const highPerformers = employees.filter(u => parseFloat(u.avgRating) >= 4.0).length;
    const needAttention  = usersWithCards.filter(u => parseFloat(u.avgRating) > 0 && parseFloat(u.avgRating) < 2.5).length;

    res.json({
      success: true,
      stats: { orgAvgRating, totalUsers: allUsers.length, highPerformers, totalCards: cards.length, needAttention },
      employees, managers, hrStaff
    });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ══════════════════════════════════════════════════════════════
// HOLIDAY DATES  /api/holiday-dates
// Store and retrieve individual holiday date entries
// ══════════════════════════════════════════════════════════════
const HolidayDate = require('./models/HolidayDate');

// GET /api/holiday-dates?year=YYYY  — list all holidays for a year
app.get('/api/holiday-dates', requireAuth, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const holidays = await HolidayDate.find({ year }).sort({ date: 1 });
    res.json({ success: true, holidays });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/holiday-dates  — add a holiday (HR only)
app.post('/api/holiday-dates', requireAuth, async (req, res) => {
  try {
    const { date, name, type } = req.body;
    if (!date || !name) return res.status(400).json({ success: false, error: 'date and name required' });
    const year = parseInt(date.split('-')[0]);
    // Upsert by date
    const holiday = await HolidayDate.findOneAndUpdate(
      { date },
      { date, name, year, type: type || 'Holiday' },
      { upsert: true, new: true }
    );
    res.json({ success: true, holiday });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/holiday-dates/:id
app.delete('/api/holiday-dates/:id', requireAuth, async (req, res) => {
  try {
    await HolidayDate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// MY ATTENDANCE  GET /api/attendance/my-records
// Returns attendance records for the currently logged-in user.
// Query params: ?month=MM&year=YYYY  (both required)
// ══════════════════════════════════════════════════════════════
app.get('/api/attendance/my-records', requireAuth, async (req, res) => {
  try {
    const AttendanceRecord = require('./models/AttendanceRecord');
    const user = await User.findById(req.session.userId).select('fullName empCode');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, error: 'month and year are required' });
    }

    const m         = String(month).padStart(2, '0');
    const startDate = `${year}-${m}-01`;
    const endDate   = `${year}-${m}-31`;

    // Match by empCode (exact) OR employeeName (case-insensitive partial)
    const nameRegex = new RegExp(user.fullName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const query = {
      date: { $gte: startDate, $lte: endDate },
      $or: [
        { employeeName: nameRegex },
        ...(user.empCode ? [{ empCode: user.empCode }] : [])
      ]
    };

    const records = await AttendanceRecord.find(query).sort({ date: 1 });

    // Fetch holiday dates for this month
    const holidays = await HolidayDate.find({
      year: parseInt(year),
      date: { $gte: startDate, $lte: endDate }
    }).select('date name type');

    res.json({ success: true, records, holidays, user: { fullName: user.fullName, empCode: user.empCode } });
  } catch (err) {
    console.error('my-records error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ══════════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════════

async function start() {

  try {

    await connectDB();

    app.listen(PORT, () => {

      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`HR Portal: http://localhost:${PORT}`);
      console.log(`Admin Portal: http://localhost:${PORT}/admin`);

    });

  } catch (err) {

    console.error("❌ Failed to start:", err);

    process.exit(1);

  }

}

start();