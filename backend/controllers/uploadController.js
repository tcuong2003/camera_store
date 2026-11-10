const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const streamifier = require('stream');
const fs = require('fs');
const path = require('path');

const uploadSingleToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalName || '').toLowerCase().replace('.', '');
    
    // Always convert HEIC/HEIF (phone camera), TIFF, BMP, JFIF, RAW, DNG to standard JPG
    // This guarantees 100% compatibility across all browsers (Chrome, Safari, Edge, Android)
    const isTranscodeRequired = ['heic', 'heif', 'tiff', 'tif', 'bmp', 'jfif', 'dng', 'raw', 'cr2', 'nef', 'arw', 'avif'].includes(ext) || ext === '';

    const uploadOptions = {
      folder: 'mayanhtop1/products',
      resource_type: 'image',
      ...(isTranscodeRequired ? { format: 'jpg' } : {}),
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);

        let finalUrl = result.secure_url;
        // If Cloudinary returned a .heic / .heif or raw extension, rewrite to .jpg
        // Cloudinary dynamically converts and delivers JPEG when requested with .jpg extension
        if (result.format === 'heic' || result.format === 'heif' || /\.(heic|heif|raw|dng|tiff?|bmp|jfif)$/i.test(finalUrl)) {
          finalUrl = finalUrl.replace(/\.[a-zA-Z0-9]+$/, '.jpg');
        }
        resolve(finalUrl);
      }
    );

    const stream = new streamifier.PassThrough();
    stream.end(fileBuffer);
    stream.pipe(uploadStream);
  });
};

// @desc    Upload multiple product images (up to 15)
// @route   POST /api/upload
// @access  Private/Admin
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 ảnh để tải lên' });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'Cloudinary chưa được cấu hình (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Không thể tải ảnh lên.',
      });
    }

    // Upload all images in parallel to Cloudinary
    const uploadPromises = req.files.map((file) =>
      uploadSingleToCloudinary(file.buffer, file.originalname)
    );
    const uploadedUrls = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      count: uploadedUrls.length,
      urls: uploadedUrls,
      message: `Đã tải lên thành công ${uploadedUrls.length} ảnh`,
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi trong quá trình upload ảnh: ' + error.message,
    });
  }
};

module.exports = { uploadImages };
