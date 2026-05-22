const path   = require('path');
const fs     = require('fs');
const bcrypt = require('bcryptjs');
const User   = require('../models/User');

/* ══════════════════════════════════════════════
   GET  /api/users
   Returns all users (password excluded), newest first.
══════════════════════════════════════════════ */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   GET  /api/users/:id
══════════════════════════════════════════════ */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   POST /api/users
   Creates a new user. Password is hashed before storing.
══════════════════════════════════════════════ */
exports.addUser = async (req, res) => {
  try {
    const {
      fullName, email, password, role, department, designation,
      employeeCode, phone, birthday, joinedDate, gender, reportingManager
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email and password are required' });
    }

    /* Check for duplicate email */
    const exists = await User.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
    });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: fullName.trim(),
      email:    email.trim().toLowerCase(),
      password: hashed,
      role, department, designation, employeeCode,
      phone, birthday, joinedDate, gender, reportingManager,
      status: 'Active'
    });

    const safeUser = user.toObject();
    delete safeUser.password;
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   PUT  /api/users/:id
   Updates user fields. If a new password is supplied it is hashed.
══════════════════════════════════════════════ */
exports.updateUser = async (req, res) => {
  try {
    const { password, ...data } = req.body;

    /* Only hash & save password if a non-empty value was sent */
    if (password && password.trim()) {
      data.password = await bcrypt.hash(password.trim(), 12);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   PATCH /api/users/:id/status
   Toggles status between Active ↔ Inactive.
══════════════════════════════════════════════ */
exports.toggleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
    await user.save();

    res.json({ success: true, status: user.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   DELETE /api/users/:id
   Deletes user + their avatar + all their document files.
══════════════════════════════════════════════ */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    /* Remove avatar from disk */
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }

    /* Remove all document files from disk */
    (user.documents || []).forEach(doc => {
      const docPath = path.join(__dirname, '..', 'uploads', 'documents', doc.fileName);
      if (fs.existsSync(docPath)) fs.unlinkSync(docPath);
    });

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   POST /api/users/:id/documents
   Uploads a document and stores metadata in user.documents[].
══════════════════════════════════════════════ */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.documents.push({
      fileName:     req.file.filename,
      originalName: req.file.originalname,
      filePath:     `/uploads/documents/${req.file.filename}`,
      mimeType:     req.file.mimetype,
      size:         req.file.size
    });

    await user.save();

    res.status(201).json({ success: true, documents: user.documents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   GET  /api/users/:id/documents
══════════════════════════════════════════════ */
exports.getUserDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('documents');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   DELETE /api/users/:id/documents/:docId
   Deletes the document record from MongoDB and the file from disk.
══════════════════════════════════════════════ */
exports.deleteDocument = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const doc = user.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    /* Remove file from disk */
    const filePath = path.join(__dirname, '..', 'uploads', 'documents', doc.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    doc.deleteOne();
    await user.save();

    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
