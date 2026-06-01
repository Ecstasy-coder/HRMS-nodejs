// ============================================================
// FILE: backend/routes/leaveRoutes.js
// ============================================================

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/leaveController');

// Employee routes
router.get('/balance',      ctrl.getBalance);    // GET  /api/leaves/balance
router.get('/',             ctrl.getMyLeaves);   // GET  /api/leaves
router.post('/',            ctrl.applyLeave);    // POST /api/leaves
router.delete('/:id',       ctrl.cancelLeave);   // DELETE /api/leaves/:id

// Admin routes
router.get('/all',          ctrl.getAllLeaves);   // GET  /api/leaves/all
router.put('/:id/review',   ctrl.reviewLeave);   // PUT  /api/leaves/:id/review

module.exports = router;
