const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('slugify');
const memoryStore = require('../config/memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all categories or filter by type
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const { type } = req.query;

    if (!isDbConnected()) {
      let cats = [...memoryStore.getMemoryCategories()];
      if (type) cats = cats.filter((c) => c.type === type);
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return res.status(200).json({ success: true, categories: cats });
    }

    const query = { isActive: true };
    if (type) query.type = type;

    const categories = await Category.find(query).sort({ type: 1, order: 1 }).lean();

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const formatMillion = (num) => {
  if (num === null || num === undefined) return '';
  if (num >= 1000000) {
    const m = num / 1000000;
    return Number.isInteger(m) ? `${m} triệu` : `${m.toFixed(1)} triệu`;
  }
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, type, order, minPrice, maxPrice } = req.body;
    let finalName = (name || '').trim();
    let min = null;
    let max = null;

    if (type === 'price') {
      min = minPrice !== undefined && minPrice !== '' && minPrice !== null ? Number(minPrice) : null;
      max = maxPrice !== undefined && maxPrice !== '' && maxPrice !== null ? Number(maxPrice) : null;
      if (!finalName) {
        if (min === null && max !== null) {
          finalName = `Dưới ${formatMillion(max)}`;
        } else if (min !== null && max !== null) {
          finalName = `Từ ${formatMillion(min)} - ${formatMillion(max)}`;
        } else if (min !== null && max === null) {
          finalName = `Trên ${formatMillion(min)}`;
        } else {
          finalName = 'Tất cả khoảng giá';
        }
      }
    }

    if (!finalName || !type) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục và loại là bắt buộc',
      });
    }

    let slug = slugify(finalName, { lower: true, strict: true, locale: 'vi' });
    if (!slug) slug = `price-${min || 0}-${max || 'max'}`;

    if (!isDbConnected()) {
      const newCat = {
        name: finalName,
        slug,
        type,
        minPrice: min,
        maxPrice: max,
        order: order || 0,
        isActive: true,
      };
      memoryStore.addMemoryCategory(newCat);
      return res.status(201).json({ success: true, message: 'Tạo danh mục thành công', category: newCat });
    }

    let existing = await Category.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = new Category({
      name: finalName,
      slug,
      type,
      minPrice: min,
      maxPrice: max,
      order: order || 0,
    });

    await category.save();

    return res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công',
      category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const escapeRegex = (str) => (str ? str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '');

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { name, type, order, isActive, minPrice, maxPrice } = req.body;
    let min = minPrice !== undefined && minPrice !== '' && minPrice !== null ? Number(minPrice) : null;
    let max = maxPrice !== undefined && maxPrice !== '' && maxPrice !== null ? Number(maxPrice) : null;

    if (!isDbConnected()) {
      const updated = memoryStore.updateMemoryCategory(req.params.id, {
        ...(name ? { name, slug: slugify(name, { lower: true, strict: true, locale: 'vi' }) } : {}),
        ...(type ? { type } : {}),
        ...(minPrice !== undefined ? { minPrice: min } : {}),
        ...(maxPrice !== undefined ? { maxPrice: max } : {}),
        ...(order !== undefined ? { order } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      });
      return res.status(200).json({ success: true, message: 'Cập nhật danh mục thành công', category: updated });
    }

    let category = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      category = await Category.findById(req.params.id);
    }
    if (!category) {
      category = await Category.findOne({
        $or: [{ slug: req.params.id }, { name: req.params.id }],
      });
    }

    const oldName = category ? category.name : null;
    const oldSlug = category ? category.slug : null;

    if (!category) {
      const slug = slugify(name || req.params.id, { lower: true, strict: true, locale: 'vi' });
      category = new Category({
        name: name || req.params.id,
        slug,
        type: type || 'category',
        minPrice: min,
        maxPrice: max,
        order: order || 0,
      });
    } else {
      if (name) {
        category.name = name;
        category.slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
      }
      if (type) category.type = type;
      if (minPrice !== undefined) category.minPrice = min;
      if (maxPrice !== undefined) category.maxPrice = max;
      if (order !== undefined) category.order = order;
      if (isActive !== undefined) category.isActive = isActive;
    }

    await category.save();

    // Synchronize affected products if brand or category name was changed
    if (name && oldName && name !== oldName) {
      if (category.type === 'brand') {
        const brandRegex = new RegExp(`^(${escapeRegex(oldName)}|${escapeRegex(oldSlug)})$`, 'i');
        await Product.updateMany(
          { brand: brandRegex },
          { $set: { brand: name } }
        );
      } else if (category.type === 'category' || !category.type) {
        const catRegex = new RegExp(`^(${escapeRegex(oldSlug)}|${escapeRegex(oldName)})$`, 'i');
        await Product.updateMany(
          { category: catRegex },
          { $set: { category: category.slug } }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    if (!isDbConnected()) {
      memoryStore.deleteMemoryCategory(req.params.id);
      return res.status(200).json({ success: true, message: 'Xóa danh mục thành công' });
    }

    let category = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      category = await Category.findById(req.params.id);
    }
    if (!category) {
      category = await Category.findOne({
        $or: [{ slug: req.params.id }, { name: req.params.id }],
      });
    }
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục để xóa',
      });
    }

    // Unlink from products (set to empty string so products just lose the deleted brand/category without side-effects)
    if (category.type === 'brand') {
      const brandRegex = new RegExp(`^(${escapeRegex(category.name)}|${escapeRegex(category.slug)})$`, 'i');
      await Product.updateMany(
        { brand: brandRegex },
        { $set: { brand: '' } }
      );
    } else if (category.type === 'category') {
      const catRegex = new RegExp(`^(${escapeRegex(category.slug)}|${escapeRegex(category.name)})$`, 'i');
      await Product.updateMany(
        { category: catRegex },
        { $set: { category: '' } }
      );
    }

    await Category.findByIdAndDelete(category._id);

    return res.status(200).json({
      success: true,
      message: 'Xóa danh mục thành công',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
