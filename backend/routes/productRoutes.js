const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  reorderProducts,
  deleteProduct,
  getAdminStats,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Protected routes (Admin)
router.get('/admin/stats', protect, getAdminStats);
router.post('/', protect, createProduct);
router.put('/reorder', protect, reorderProducts);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
