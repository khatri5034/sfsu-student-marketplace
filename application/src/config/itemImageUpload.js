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
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    const allowedExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif'
    ];

    if (
      allowedMimeTypes.includes(file.mimetype) &&
      allowedExtensions.includes(ext)
    ) {
      return cb(null, true);
    }

    cb(new Error('Invalid image type. Only JPEG, PNG, and GIF are allowed.'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = itemImageUpload;