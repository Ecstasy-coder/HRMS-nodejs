const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

/* Ensure upload directory exists at startup */
const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),

  /* Filename: doc_<userId>_<timestamp>.<ext>  — always unique */
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `doc_${req.params.id}_${Date.now()}${ext}`);
  }
});

/* Allow common document & image types; 10 MB max */
const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg', 'image/png', 'image/webp',
    'text/plain'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Accepted: PDF, Word, Excel, images, TXT'), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});
