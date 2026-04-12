const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Upload directory
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

// Ensure directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${timestamp}${ext}`);
  },
});

// Multer middleware
const itemImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = itemImageUpload;