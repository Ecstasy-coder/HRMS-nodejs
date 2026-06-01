const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  uploadId:     { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceUpload' },
  employeeId:   { type: String, trim: true, default: '' },
  employeeName: { type: String, trim: true, default: '' },
  empCode:      { type: String, trim: true, default: '' },
  department:   { type: String, trim: true, default: '' },
  date:         { type: String, index: true }, // YYYY-MM-DD
  inTime:       { type: String, default: '' }, // HH:mm
  outTime:      { type: String, default: '' }, // HH:mm
  workingHours: { type: String, default: '' }, // e.g. "8h 30m"
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day'],
    default: 'Present'
  }
}, { timestamps: true });

attendanceRecordSchema.index({ employeeId: 1, date: 1 });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
