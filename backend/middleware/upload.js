const multer = require('multer');
const path = require('path');

// Use memory storage for direct Cloudinary stream/upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow all image formats: phone camera (HEIC/HEIF), web/screenshots (JPG/PNG/WEBP/GIF), JFIF, BMP, TIFF, AVIF, RAW/DNG
  const allowedExts = /\.(jpe?g|png|webp|gif|heic|heif|jfif|bmp|tiff?|avif|svg|dng|raw|cr2|nef|arw)$/i;
  const isExtAllowed = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const isMimeAllowed = !file.mimetype || file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream';

  if (isExtAllowed || isMimeAllowed) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận các định dạng ảnh (JPG, PNG, WEBP, GIF, HEIC, JFIF, BMP, TIFF, AVIF, RAW)!'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max per image (supports high-res phone & camera photos)
    files: 20, // Up to 20 images at once
  },
  fileFilter,
});

module.exports = upload;
