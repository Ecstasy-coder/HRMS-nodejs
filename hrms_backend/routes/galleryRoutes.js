// ============================================================
// FILE: backend/routes/galleryRoutes.js
// ============================================================

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

const {
  createFestival,
  getFestivals,
  getActiveFestivals,
  updateFestival,
  toggleActive,
  deleteFestival,
  uploadPhotos,
  deletePhoto
} = require('../controllers/galleryController');

// ── Ensure gallery upload directory exists ────────────────────
const galleryDir = path.join(__dirname, '..', 'uploads', 'gallery');
if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

// ── Multer storage config ─────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, galleryDir),
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = `gallery_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },  // 8 MB per photo
  fileFilter: (req, file, cb) => {
    // Accept all common image types — some browsers send different MIME strings
    const allowed = [
      'image/jpeg', 'image/jpg', 'image/png',
      'image/webp', 'image/gif', 'image/bmp',
      'image/tiff', 'image/svg+xml'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Also accept anything whose original name looks like an image
      const ext = path.extname(file.originalname).toLowerCase();
      const imgExts = ['.jpg','.jpeg','.png','.webp','.gif','.bmp','.tiff','.svg'];
      if (imgExts.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`));
      }
    }
  }
});

// ── Multer error-handling wrapper ─────────────────────────────
// This ensures multer errors (size, type) return a JSON response
// instead of hanging or crashing the request.
function handleUpload(req, res, next) {
  upload.array('photos', 20)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific error (e.g. file too large)
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      // Our custom fileFilter error
      return res.status(400).json({ error: err.message || 'Invalid file type' });
    }
    next();
  });
}

// ── Festival routes ───────────────────────────────────────────
router.get('/',             getFestivals);       // All (admin manage page)
router.get('/active',       getActiveFestivals); // Active only (public gallery)
router.post('/',            createFestival);     // Create festival
router.put('/:id',          updateFestival);     // Edit festival details
router.patch('/:id/toggle', toggleActive);       // Toggle active / hidden
router.delete('/:id',       deleteFestival);     // Delete festival + all photos

// ── Photo routes ──────────────────────────────────────────────
// Using handleUpload wrapper so any multer error sends a proper JSON response
router.post('/:id/photos',            handleUpload, uploadPhotos);
router.delete('/:id/photos/:photoId', deletePhoto);

module.exports = router;
