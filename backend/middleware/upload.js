const multer = require('multer');
const path = require('path');

// Use memory storage for direct Cloudinary stream/upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|heic/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('image/');

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận các định dạng ảnh (JPG, PNG, WEBP, GIF, HEIC)!'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max per image
    files: 15, // Up to 15 images at once
  },
  fileFilter,
});

module.exports = upload;
