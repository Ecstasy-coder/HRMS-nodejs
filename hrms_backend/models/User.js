const mongoose = require('mongoose');

/* ── Embedded document schema ─────────────────────────────── */
const documentSchema = new mongoose.Schema({
  fileName:     { type: String, required: true }, // stored filename on disk
  originalName: { type: String, required: true }, // original upload name
  filePath:     { type: String, required: true }, // URL path  e.g. /uploads/documents/xxx.pdf
  mimeType:     String,
  size:         Number,
  uploadedAt:   { type: Date, default: Date.now }
});

/* ── Main User schema ─────────────────────────────────────── */
const userSchema = new mongoose.Schema(
  {
    fullName:         { type: String, required: true, trim: true },
    email:            { type: String, required: true, unique: true, trim: true, lowercase: true },
    password:         { type: String, required: true },

    /* role – only Employee / Reporting Manager managed by HR */
    role:             { type: String, default: 'Employee' },

    department:       { type: String, trim: true },
    designation:      { type: String, trim: true },
    employeeCode:     { type: String, trim: true },
    phone:            { type: String, trim: true },

    birthday:         String,   // date of birth  (YYYY-MM-DD)
    joinedDate:       String,   // date of joining (YYYY-MM-DD)

    gender:           { type: String, enum: ['Male', 'Female', 'Other', ''] },
    reportingManager: String,   // full name of the reporting manager

    status:           { type: String, default: 'Active', enum: ['Active', 'Inactive'] },
    avatar:           String,   // URL path to avatar image

    documents:        [documentSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
