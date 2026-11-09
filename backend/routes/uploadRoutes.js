const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadImages } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// Upload up to 20 images
router.post('/', protect, upload.array('images', 20), uploadImages);

module.exports = router;
