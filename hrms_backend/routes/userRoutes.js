const express   = require('express');
const router    = express.Router();
const docUpload = require('../middleware/docUpload');

const {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  toggleStatus,
  deleteUser,
  uploadDocument,
  getUserDocuments,
  deleteDocument
} = require('../controllers/userController');

/* ── User CRUD ──────────────────────────────────────────────── */
router.get('/',    getUsers);        // GET  /api/users
router.post('/',   addUser);         // POST /api/users
router.get('/:id', getUserById);     // GET  /api/users/:id
router.put('/:id', updateUser);      // PUT  /api/users/:id

/* ── Status toggle ──────────────────────────────────────────── */
router.patch('/:id/status', toggleStatus); // PATCH /api/users/:id/status

/* ── Delete user (also removes files) ──────────────────────── */
router.delete('/:id', deleteUser);   // DELETE /api/users/:id

/* ── Documents ──────────────────────────────────────────────── */
// Upload a document for a user
router.post(
  '/:id/documents',
  docUpload.single('document'),
  uploadDocument
); // POST /api/users/:id/documents

// List documents for a user
router.get('/:id/documents', getUserDocuments); // GET /api/users/:id/documents

// Delete a specific document
router.delete('/:id/documents/:docId', deleteDocument); // DELETE /api/users/:id/documents/:docId

module.exports = router;
