const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminStats,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);

// Protected routes (Admin)
router.get('/admin/stats', protect, getAdminStats);
router.get('/:id', protect, getProductById);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
