// ============================================================
// FILE: backend/controllers/galleryController.js
// ============================================================

const Gallery = require('../models/Gallery');
const path    = require('path');
const fs      = require('fs');

// ─── CREATE festival ────────────────────────────────────────
// POST /api/gallery
exports.createFestival = async (req, res) => {
  try {
    const { name, eventDate, emoji, primaryColor, secondaryColor, bgLight } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Festival name is required' });
    }

    // Ensure slug uniqueness by appending timestamp if needed
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await Gallery.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const festival = new Gallery({
      name:           name.trim(),
      slug,
      eventDate:      eventDate || '',
      emoji:          emoji || '📷',
      primaryColor:   primaryColor || '#2563eb',
      secondaryColor: secondaryColor || '#7c3aed',
      bgLight:        bgLight || '#f8fafc',
      isActive:       true,
      photos:         []
    });

    await festival.save();

    res.status(201).json({ success: true, message: 'Festival added!', festival });
  } catch (err) {
    console.error('createFestival error:', err);
    res.status(500).json({ error: 'Server error while creating festival' });
  }
};

// ─── READ all festivals ──────────────────────────────────────
// GET /api/gallery
exports.getFestivals = async (req, res) => {
  try {
    const festivals = await Gallery.find().sort({ createdAt: -1 });
    res.json({ success: true, festivals });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── READ active festivals (for public gallery view) ────────
// GET /api/gallery/active
exports.getActiveFestivals = async (req, res) => {
  try {
    const festivals = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, festivals });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── UPDATE festival details ─────────────────────────────────
// PUT /api/gallery/:id
exports.updateFestival = async (req, res) => {
  try {
    const { name, eventDate, emoji, primaryColor, secondaryColor, bgLight } = req.body;

    const festival = await Gallery.findById(req.params.id);
    if (!festival) return res.status(404).json({ error: 'Festival not found' });

    if (name)           festival.name           = name.trim();
    if (eventDate !== undefined) festival.eventDate = eventDate;
    if (emoji)          festival.emoji          = emoji;
    if (primaryColor)   festival.primaryColor   = primaryColor;
    if (secondaryColor) festival.secondaryColor = secondaryColor;
    if (bgLight)        festival.bgLight        = bgLight;

    await festival.save();
    res.json({ success: true, message: 'Festival updated!', festival });
  } catch (err) {
    res.status(500).json({ error: 'Server error while updating' });
  }
};

// ─── TOGGLE active/hidden ────────────────────────────────────
// PATCH /api/gallery/:id/toggle
exports.toggleActive = async (req, res) => {
  try {
    const festival = await Gallery.findById(req.params.id);
    if (!festival) return res.status(404).json({ error: 'Not found' });

    festival.isActive = !festival.isActive;
    await festival.save();

    res.json({ success: true, isActive: festival.isActive, message: `Festival ${festival.isActive ? 'activated' : 'hidden'}` });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── DELETE festival + all its photos ───────────────────────
// DELETE /api/gallery/:id
exports.deleteFestival = async (req, res) => {
  try {
    const festival = await Gallery.findById(req.params.id);
    if (!festival) return res.status(404).json({ error: 'Not found' });

    // Delete all uploaded photo files from disk
    festival.photos.forEach(photo => {
      const fullPath = path.join(__dirname, '..', photo.path);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch {}
      }
    });

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Festival deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── UPLOAD photos to a festival ────────────────────────────
// POST /api/gallery/:id/photos
exports.uploadPhotos = async (req, res) => {
  try {
    const festival = await Gallery.findById(req.params.id);
    if (!festival) return res.status(404).json({ error: 'Festival not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const newPhotos = req.files.map(file => ({
      filename:   file.filename,
      path:       `/uploads/gallery/${file.filename}`,
      caption:    '',
      uploadedAt: new Date()
    }));

    festival.photos.push(...newPhotos);
    await festival.save();

    res.json({
      success: true,
      message: `${newPhotos.length} photo(s) uploaded!`,
      photos:  newPhotos,
      festival
    });
  } catch (err) {
    console.error('uploadPhotos error:', err);
    res.status(500).json({ error: 'Server error while uploading' });
  }
};

// ─── DELETE single photo from festival ──────────────────────
// DELETE /api/gallery/:id/photos/:photoId
exports.deletePhoto = async (req, res) => {
  try {
    const festival = await Gallery.findById(req.params.id);
    if (!festival) return res.status(404).json({ error: 'Festival not found' });

    const photo = festival.photos.id(req.params.photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Delete file from disk
    const fullPath = path.join(__dirname, '..', photo.path);
    if (fs.existsSync(fullPath)) {
      try { fs.unlinkSync(fullPath); } catch {}
    }

    photo.deleteOne();
    await festival.save();

    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
