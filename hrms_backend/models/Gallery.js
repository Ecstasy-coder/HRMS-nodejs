// ============================================================
// FILE: backend/models/Gallery.js
// ============================================================

const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  filename:    { type: String, required: true },
  path:        { type: String, required: true },
  caption:     { type: String, default: '' },
  uploadedAt:  { type: Date, default: Date.now }
});

const GallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    eventDate: {
      type: String,
      default: ''
    },
    emoji: {
      type: String,
      default: '📷'
    },
    primaryColor: {
      type: String,
      default: '#2563eb'
    },
    secondaryColor: {
      type: String,
      default: '#7c3aed'
    },
    bgLight: {
      type: String,
      default: '#f8fafc'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    photos: [PhotoSchema]
  },
  { timestamps: true }
);

// Auto-generate slug from name (async style — no next() needed in Mongoose 6+)
GallerySchema.pre('save', async function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Gallery', GallerySchema);
