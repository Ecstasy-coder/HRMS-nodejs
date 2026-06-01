const mongoose = require('mongoose');

const attendanceUploadSchema = new mongoose.Schema({
  fileName:         { type: String, required: true },
  originalName:     { type: String },
  date:             { type: String },          // attendance date YYYY-MM-DD
  uploadedBy:       { type: String, default: 'HR Admin' },
  recordsProcessed: { type: Number, default: 0 },
  filePath:         { type: String },
  status:           { type: String, default: 'Processed' }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceUpload', attendanceUploadSchema);
