// ── Attendance Controller ─────────────────────────────────────
const fs   = require('fs');
const path = require('path');
const csv  = require('csv-parser');

const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceUpload = require('../models/AttendanceUpload');
const User             = require('../models/User');

/* ── helpers ─────────────────────────────────────────────── */
function normalizeStatus(s) {
  const v = String(s || '').toLowerCase().trim();
  if (v.includes('absent'))    return 'Absent';
  if (v.includes('late'))      return 'Late';
  if (v.includes('half'))      return 'Half Day';
  return 'Present';
}

// Normalize arbitrary column name to a lowercase alphanumeric key
// Strips ALL whitespace, underscores, dashes, dots, slashes, brackets, #
function normalizeRow(row) {
  const r = {};
  Object.keys(row).forEach(k => {
    const normalized = k.toLowerCase().replace(/[\s_\-./\\()#]+/g, '');
    r[normalized] = String(row[k] || '').trim();
  });
  return r;
}

// Normalize any date format to YYYY-MM-DD
function normalizeDate(val, fallback) {
  if (!val) return fallback;
  const s = String(val).trim();
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD/MM/YYYY or DD-MM-YYYY
  const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}`;
  // Excel serial number (numeric string 5 digits)
  if (/^\d{5}$/.test(s)) {
    const serial = parseInt(s, 10);
    const d = new Date((serial - 25569) * 86400 * 1000);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }
  // Try JS Date parse
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return fallback;
}

function rowToRecord(r, date, uploadId) {
  return {
    uploadId,
    employeeId:   r.employeeid   || r.id        || r.empid     || '',
    employeeName: r.employeename || r.name       || r.fullname  || r.employee || '',
    empCode:      r.empcode      || r.code       || r.employeecode || r.empno || r.employeeno || '',
    department:   r.department   || r.dept       || r.deptname  || r.departmentname || r.deptid || '',
    date:         normalizeDate(r.date || r.attendancedate || r.attdate, date),
    inTime:       r.intime       || r.punchin    || r.checkin   || r.in || r.firstin || '',
    outTime:      r.outtime      || r.punchout   || r.checkout  || r.out || r.lastout || '',
    workingHours: r.workinghours || r.duration   || r.hours     || r.totalhrs || r.workhrs || r.netwh || r.worktime || r.totalworkinghours || '',
    status:       normalizeStatus(r.status       || r.attstatus || r.attendancestatus || r.s || r.attendstatus || '')
  };
}

/* ── UPLOAD ──────────────────────────────────────────────── */
exports.uploadAttendance = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Attendance date is required.' });
    }

    // Fetch the uploader's name from session
    let uploadedByName = 'HR Admin';
    try {
      const uploader = await User.findById(req.session.userId).select('fullName');
      if (uploader) uploadedByName = uploader.fullName;
    } catch (_) {}

    const originalName = req.file.originalname;
    const fileName     = req.file.filename;
    const filePath     = `/uploads/attendance/${fileName}`;
    const ext          = path.extname(originalName).toLowerCase();

    // Create upload history record first
    const uploadRecord = await AttendanceUpload.create({
      fileName,
      originalName,
      date,
      uploadedBy: uploadedByName,
      filePath,
      status: 'Processing'
    });

    let recordsProcessed = 0;

    if (ext === '.csv') {
      /* ── CSV parsing ── */
      const rows = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', row => rows.push(row))
          .on('end', resolve)
          .on('error', reject);
      });

      const docs = rows.map(row => rowToRecord(normalizeRow(row), date, uploadRecord._id));
      if (docs.length) {
        await AttendanceRecord.insertMany(docs);
        recordsProcessed = docs.length;
      }

    } else if (ext === '.xlsx' || ext === '.xls') {
      /* ── XLSX parsing ── */
      try {
        const XLSX      = require('xlsx');
        const workbook  = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const rows      = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const docs      = rows.map(row => rowToRecord(normalizeRow(row), date, uploadRecord._id));
        if (docs.length) {
          await AttendanceRecord.insertMany(docs);
          recordsProcessed = docs.length;
        }
      } catch (xlsxErr) {
        console.warn('XLSX parse warning:', xlsxErr.message);
      }
    }
    // For any other file type → just record the upload (no row parsing)

    await AttendanceUpload.findByIdAndUpdate(uploadRecord._id, {
      recordsProcessed,
      status: 'Processed'
    });

    res.json({ success: true, message: 'File uploaded successfully.', recordsProcessed });

  } catch (err) {
    console.error('Attendance upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── STATS (today's summary, optional ?date= override) ───── */
exports.getStats = async (req, res) => {
  try {
    // Support ?date= param so frontend can query any date's stats
    const now   = new Date();
    // Use local date (IST/server timezone) not UTC
    const pad   = n => String(n).padStart(2, '0');
    const today = req.query.date ||
      `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const totalEmployees = await User.countDocuments({ status: 'Active' });

    const [presentToday, lateToday, halfToday] = await Promise.all([
      AttendanceRecord.countDocuments({ date: today, status: 'Present' }),
      AttendanceRecord.countDocuments({ date: today, status: 'Late' }),
      AttendanceRecord.countDocuments({ date: today, status: 'Half Day' })
    ]);

    const absentToday = Math.max(0, totalEmployees - presentToday - lateToday - halfToday);

    res.json({ success: true, presentToday, absentToday, lateToday, totalEmployees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── DAILY VIEW ───────────────────────────────────────────── */
exports.getDailyView = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required.' });

    const records = await AttendanceRecord.find({ date }).sort({ employeeName: 1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── MONTHLY SUMMARY ─────────────────────────────────────── */
exports.getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ success: false, message: 'Month and year required.' });

    const m         = String(month).padStart(2, '0');
    const startDate = `${year}-${m}-01`;
    const endDate   = `${year}-${m}-31`;

    const records = await AttendanceRecord.find({
      date: { $gte: startDate, $lte: endDate }
    });

    // Group by employeeId (fallback to name)
    const empMap = {};
    records.forEach(r => {
      const key = r.employeeId || r.employeeName || 'unknown';
      if (!empMap[key]) {
        empMap[key] = {
          employeeId: r.employeeId, employeeName: r.employeeName,
          empCode: r.empCode, department: r.department,
          presentDays: 0, absentDays: 0, lateDays: 0, halfDays: 0, workingDays: 0
        };
      }
      const e = empMap[key];
      e.workingDays++;
      const s = (r.status || '').toLowerCase();
      if      (s === 'present')  e.presentDays++;
      else if (s === 'absent')   e.absentDays++;
      else if (s === 'late')   { e.lateDays++;   e.presentDays++; }
      else if (s === 'half day') e.halfDays++;
    });

    const summaryList = Object.values(empMap).sort((a, b) =>
      (a.employeeName || '').localeCompare(b.employeeName || '')
    );

    res.json({ success: true, records: summaryList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── UPLOAD HISTORY ───────────────────────────────────────── */
exports.getUploadHistory = async (req, res) => {
  try {
    const uploads = await AttendanceUpload.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, uploads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
