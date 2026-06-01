// ============================================================
// FILE: backend/controllers/leaveController.js
// ============================================================

const Leave = require('../models/Leave');
const User  = require('../models/User');

/* ── helpers ──────────────────────────────────────────────── */

// Count working days between two dates inclusive (Mon–Sat, no Sun)
function countWorkingDays(from, to) {
  let count = 0;
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  while (cur <= end) {
    const day = cur.getDay(); // 0=Sun
    if (day !== 0) count++;   // skip Sundays only (Sat is working)
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// Max CL/SL per year
const LEAVE_LIMITS = { CL: 12, SL: 12, ML: 182 };

/* ── getBalance  GET /api/leaves/balance ─────────────────── */
exports.getBalance = async (req, res) => {
  try {
    const year  = new Date().getFullYear();
    const start = new Date(`${year}-01-01`);
    const end   = new Date(`${year}-12-31T23:59:59`);

    // Only count Approved leaves toward balance
    const leaves = await Leave.find({
      userId: req.session.userId,
      status: 'Approved',
      fromDate: { $gte: start, $lte: end }
    });

    const used = { CL: 0, SL: 0, ML: 0, LOP: 0 };
    leaves.forEach(l => { used[l.leaveType] = (used[l.leaveType] || 0) + l.days; });

    // Fetch user to know gender (ML only for Female)
    const user = await User.findById(req.session.userId).select('gender');

    res.json({
      success: true,
      year,
      balance: {
        CL:  { total: LEAVE_LIMITS.CL,  used: used.CL,  left: LEAVE_LIMITS.CL  - used.CL  },
        SL:  { total: LEAVE_LIMITS.SL,  used: used.SL,  left: LEAVE_LIMITS.SL  - used.SL  },
        ML:  { total: LEAVE_LIMITS.ML,  used: used.ML,  left: LEAVE_LIMITS.ML  - used.ML,
               femaleOnly: true, eligible: user?.gender === 'Female' },
        LOP: { total: null, used: used.LOP, left: null }
      }
    });
  } catch (err) {
    console.error('getBalance error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ── getMyLeaves  GET /api/leaves ────────────────────────── */
exports.getMyLeaves = async (req, res) => {
  try {
    const year  = parseInt(req.query.year) || new Date().getFullYear();
    const start = new Date(`${year}-01-01`);
    const end   = new Date(`${year}-12-31T23:59:59`);

    const leaves = await Leave.find({
      userId:   req.session.userId,
      fromDate: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });

    res.json({ success: true, leaves });
  } catch (err) {
    console.error('getMyLeaves error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ── applyLeave  POST /api/leaves ────────────────────────── */
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, alternateMobile, reason } = req.body;

    if (!leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    const from = new Date(fromDate);
    const to   = new Date(toDate);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    if (from > to) return res.status(400).json({ error: 'From date cannot be after To date.' });

    const days = countWorkingDays(from, to);
    if (days <= 0) return res.status(400).json({ error: 'Leave dates must include at least one working day.' });

    // Check for overlapping leave requests
    const overlap = await Leave.findOne({
      userId: req.session.userId,
      status: { $ne: 'Rejected' },
      $or: [
        { fromDate: { $lte: to }, toDate: { $gte: from } }
      ]
    });
    if (overlap) {
      return res.status(400).json({ error: 'You already have a leave request overlapping these dates.' });
    }

    // Check balance for CL / SL / ML
    if (['CL', 'SL', 'ML'].includes(leaveType)) {
      const year  = from.getFullYear();
      const start = new Date(`${year}-01-01`);
      const end   = new Date(`${year}-12-31T23:59:59`);

      const approved = await Leave.find({
        userId:    req.session.userId,
        leaveType,
        status:    'Approved',
        fromDate:  { $gte: start, $lte: end }
      });
      const usedDays = approved.reduce((s, l) => s + l.days, 0);
      const limit    = LEAVE_LIMITS[leaveType];

      if (usedDays + days > limit) {
        return res.status(400).json({
          error: `Insufficient ${leaveType} balance. You have ${limit - usedDays} days left.`
        });
      }
    }

    const user = await User.findById(req.session.userId).select('fullName department designation');

    const leave = await Leave.create({
      userId:          req.session.userId,
      userFullName:    user.fullName,
      userDepartment:  user.department  || '',
      userDesignation: user.designation || '',
      leaveType,
      fromDate: from,
      toDate:   to,
      days,
      alternateMobile: alternateMobile || '',
      reason
    });

    res.json({ success: true, leave, message: 'Leave request submitted successfully!' });
  } catch (err) {
    console.error('applyLeave error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ── cancelLeave  DELETE /api/leaves/:id ────────────────── */
exports.cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, userId: req.session.userId });
    if (!leave) return res.status(404).json({ error: 'Leave request not found.' });
    if (leave.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending leave requests can be cancelled.' });
    }

    await Leave.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Leave request cancelled.' });
  } catch (err) {
    console.error('cancelLeave error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ══ ADMIN endpoints ════════════════════════════════════════ */

/* ── getAllLeaves  GET /api/leaves/all ───────────────────── */
// Shows Employee, Reporting Manager, Finance leaves only.
// HR Admin / HR role leaves are managed separately in the admin HR Leaves page.
exports.getAllLeaves = async (req, res) => {
  try {
    const year  = parseInt(req.query.year) || new Date().getFullYear();
    const start = new Date(`${year}-01-01`);
    const end   = new Date(`${year}-12-31T23:59:59`);

    // Find IDs of HR Admin / HR users to exclude them
    const hrUsers = await User.find(
      { role: { $in: ['HR Admin', 'HR'] } },
      '_id'
    ).lean();
    const hrUserIds = hrUsers.map(u => u._id);

    const filter = {
      fromDate: { $gte: start, $lte: end },
      userId:   { $nin: hrUserIds }        // exclude HR leaves
    };
    if (req.query.status)    filter.status    = req.query.status;
    if (req.query.leaveType) filter.leaveType = req.query.leaveType;

    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, leaves });
  } catch (err) {
    console.error('getAllLeaves error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* ── reviewLeave  PUT /api/leaves/:id/review ────────────── */
exports.reviewLeave = async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Approved or Rejected.' });
    }

    const reviewer = await User.findById(req.session.userId).select('fullName');

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminComment: adminComment || '',
        reviewedBy:   reviewer?.fullName || 'Admin',
        reviewedAt:   new Date()
      },
      { new: true }
    );

    if (!leave) return res.status(404).json({ error: 'Leave request not found.' });
    res.json({ success: true, leave, message: `Leave ${status.toLowerCase()} successfully.` });
  } catch (err) {
    console.error('reviewLeave error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
