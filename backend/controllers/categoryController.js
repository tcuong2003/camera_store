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
      // Automatically merge categories used in products if not already in cats
      const products = memoryStore.getMemoryProducts();
      const existingSlugs = new Set(cats.map((c) => (c.slug || c.name || '').toLowerCase()));
      for (const p of products) {
        if (p.category && !existingSlugs.has(p.category.toLowerCase())) {
          existingSlugs.add(p.category.toLowerCase());
          const newCat = {
            name: p.category,
            slug: p.category,
            type: 'category',
            order: cats.length + 1,
            isActive: true,
          };
          cats.push(newCat);
          memoryStore.addMemoryCategory(newCat);
        }
        if (p.brand && !existingSlugs.has(p.brand.toLowerCase())) {
          existingSlugs.add(p.brand.toLowerCase());
          const newBrand = {
            name: p.brand,
            slug: slugify(p.brand, { lower: true, strict: true, locale: 'vi' }),
            type: 'brand',
            order: cats.length + 1,
            isActive: true,
          };
          cats.push(newBrand);
          memoryStore.addMemoryCategory(newBrand);
        }
      }
      if (type) cats = cats.filter((c) => c.type === type);
      return res.status(200).json({ success: true, categories: cats });
    }

    const query = { isActive: true };
    if (type) query.type = type;

    const categories = await Category.find(query).sort({ type: 1, order: 1 }).lean();
    
    // Also merge any categories and brands from products
    try {
      const productCategories = await Product.distinct('category');
      const productBrands = await Product.distinct('brand');
      const existingSlugs = new Set(categories.map((c) => (c.slug || c.name || '').toLowerCase()));

      for (const catName of productCategories) {
        if (catName && !existingSlugs.has(catName.toLowerCase())) {
          existingSlugs.add(catName.toLowerCase());
          categories.push({
            name: catName,
            slug: catName,
            type: 'category',
            order: 99,
            isActive: true,
          });
        }
      }

      for (const brandName of productBrands) {
        if (brandName && !existingSlugs.has(brandName.toLowerCase())) {
          existingSlugs.add(brandName.toLowerCase());
          categories.push({
            name: brandName,
            slug: slugify(brandName, { lower: true, strict: true, locale: 'vi' }),
            type: 'brand',
            order: 99,
            isActive: true,
          });
        }
      }
    } catch (e) {
      // Ignore distinct error if any
    }

    let result = categories;
    if (type) result = result.filter((c) => c.type === type);

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    return res.status(200).json({
      success: true,
      categories: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh mục: ' + error.message,
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, type, order } = req.body;
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục và loại là bắt buộc',
      });
    }

    const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });

    if (!isDbConnected()) {
      const newCat = { name, slug, type, order: order || 0, isActive: true };
      memoryStore.addMemoryCategory(newCat);
      return res.status(201).json({ success: true, message: 'Tạo danh mục thành công', category: newCat });
    }

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Danh mục này đã tồn tại',
      });
    }

    const category = new Category({
      name,
      slug,
      type,
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

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { name, type, order, isActive } = req.body;

    if (!isDbConnected()) {
      const updated = memoryStore.updateMemoryCategory(req.params.id, {
        ...(name ? { name, slug: slugify(name, { lower: true, strict: true, locale: 'vi' }) } : {}),
        ...(type ? { type } : {}),
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

    if (!category) {
      const slug = slugify(name || req.params.id, { lower: true, strict: true, locale: 'vi' });
      category = new Category({
        name: name || req.params.id,
        slug,
        type: type || 'category',
        order: order || 0,
      });
    } else {
      if (name) {
        category.name = name;
        category.slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
      }
      if (type) category.type = type;
      if (order !== undefined) category.order = order;
      if (isActive !== undefined) category.isActive = isActive;
    }

    await category.save();

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
