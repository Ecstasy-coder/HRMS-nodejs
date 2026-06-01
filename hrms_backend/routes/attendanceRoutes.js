const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

const ctrl = require('../controllers/attendanceController');

// ── Ensure upload directory exists ──────────────────────────
const attDir = path.join(__dirname, '..', 'uploads', 'attendance');
if (!fs.existsSync(attDir)) fs.mkdirSync(attDir, { recursive: true });

// ── Multer – accept ANY file type ────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, attDir),
  filename:    (req, file, cb) => cb(null, `att_${Date.now()}_${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
});

// ── Routes ───────────────────────────────────────────────────
router.get('/stats',    ctrl.getStats);
router.get('/daily',    ctrl.getDailyView);
router.get('/monthly',  ctrl.getMonthlySummary);
router.get('/uploads',  ctrl.getUploadHistory);
router.post('/upload',  upload.single('file'), ctrl.uploadAttendance);

module.exports = router;
