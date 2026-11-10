const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('slugify');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to determine priceCategory based on price
const calculatePriceCategory = (price) => {
  if (price < 3000000) return 'under_3m';
  if (price <= 5000000) return '3m_5m';
  if (price <= 10000000) return '5m_10m';
  return 'above_10m';
};

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      search,
      brand,
      priceCategory,
      category,
      deviceType,
      isAvailable,
      sort,
      page = 1,
      limit = 25,
    } = req.query;

    if (!isDbConnected()) {
      return res.status(500).json({ success: false, message: 'Cơ sở dữ liệu MongoDB chưa kết nối.' });
    }

    const query = {};

    if (isAvailable !== undefined && isAvailable !== '') {
      query.isAvailable = isAvailable === 'true';
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { condition: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    if (brand && brand !== 'all') {
      const brands = brand.split(',').map((b) => b.trim());
      query.brand = { $in: brands.map((b) => new RegExp(`^${b}$`, 'i')) };
    }

    if (priceCategory && priceCategory !== 'all') {
      const priceCats = priceCategory.split(',').map((p) => p.trim());
      const priceConditions = [];

      for (const cat of priceCats) {
        if (cat === 'under_3m') {
          priceConditions.push({ price: { $lt: 3000000 } });
        } else if (cat === '3m_5m') {
          priceConditions.push({ price: { $gte: 3000000, $lte: 5000000 } });
        } else if (cat === '5m_10m') {
          priceConditions.push({ price: { $gte: 5000000, $lte: 10000000 } });
        } else if (cat === 'above_10m') {
          priceConditions.push({ price: { $gt: 10000000 } });
        } else {
          let catDoc = null;
          if (mongoose.Types.ObjectId.isValid(cat)) {
            catDoc = await Category.findById(cat);
          }
          if (!catDoc) {
            catDoc = await Category.findOne({ type: 'price', $or: [{ slug: cat }, { name: cat }] });
          }
          if (catDoc && (catDoc.minPrice !== null || catDoc.maxPrice !== null)) {
            const cond = {};
            if (catDoc.minPrice !== null && catDoc.minPrice !== undefined) cond.$gte = catDoc.minPrice;
            if (catDoc.maxPrice !== null && catDoc.maxPrice !== undefined) cond.$lte = catDoc.maxPrice;
            if (Object.keys(cond).length > 0) priceConditions.push({ price: cond });
          } else {
            priceConditions.push({ priceCategory: cat });
          }
        }
      }

      if (priceConditions.length === 1) {
        Object.assign(query, priceConditions[0]);
      } else if (priceConditions.length > 1) {
        query.$or = query.$or ? [...query.$or, ...priceConditions] : priceConditions;
      }
    }

    if (category && category !== 'all') {
      const categories = category.split(',').map((c) => c.trim());
      query.$or = [
        { category: { $in: categories } },
        { deviceType: { $in: categories } },
      ];
    }

    if (deviceType && deviceType !== 'all') {
      query.deviceType = new RegExp(`^${deviceType}$`, 'i');
    }

    let sortOption = { order: 1, createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'views_desc') sortOption = { views: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    // Run count and query in parallel with lean documents for maximum speed
    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      products,
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách sản phẩm: ' + error.message,
    });
  }
};

// @desc    Get single product by slug or ID
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!isDbConnected()) {
      return res.status(500).json({ success: false, message: 'Cơ sở dữ liệu MongoDB chưa kết nối.' });
    }

    let query = { slug };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }

    const product = await Product.findOne(query);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm này',
      });
    }

    product.views = (product.views || 0) + 1;
    await product.save({ validateBeforeSave: false });

    const related = await Product.find({
      _id: { $ne: product._id },
      $or: [{ brand: product.brand }, { priceCategory: product.priceCategory }],
      isAvailable: true,
    })
      .limit(4)
      .select('name slug price originalPrice condition images brand');

    return res.status(200).json({
      success: true,
      product,
      related,
    });
  } catch (error) {
    console.error('Error in getProductBySlug:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin sản phẩm: ' + error.message,
    });
  }
};

// @desc    Get single product by ID or Slug (Public)
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      return res.status(500).json({ success: false, message: 'Cơ sở dữ liệu MongoDB chưa kết nối.' });
    }

    let query = { slug: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { slug: id }] };
    }

    const product = await Product.findOne(query);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    product.views = (product.views || 0) + 1;
    await product.save({ validateBeforeSave: false });

    const related = await Product.find({
      _id: { $ne: product._id },
      $or: [{ brand: product.brand }, { priceCategory: product.priceCategory }],
      isAvailable: true,
    })
      .limit(4)
      .select('name slug price originalPrice condition images brand');

    return res.status(200).json({ success: true, product, related });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      condition,
      brand,
      priceCategory,
      category,
      deviceType,
      images,
      description,
      accessories,
      warranty,
      isAvailable,
      featured,
      order,
    } = req.body;

    if (!name || price === undefined || price === null || price === '' || !brand) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ Tên máy, Giá và Thương hiệu',
      });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cần có ít nhất 1 ảnh sản phẩm',
      });
    }

    let baseSlug = slugify(name, { lower: true, strict: true, locale: 'vi' }) || 'may-anh';
    let uniqueSlug = baseSlug;

    const computedPriceCategory = priceCategory || calculatePriceCategory(Number(price));

    if (!isDbConnected()) {
      return res.status(500).json({ success: false, message: 'Cơ sở dữ liệu MongoDB chưa kết nối.' });
    }

    let count = 1;
    while (await Product.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${count}`;
      count++;
    }

    const targetOrder = order !== undefined && order !== '' ? Number(order) : 1;
    if (targetOrder > 0) {
      await Product.updateMany({ order: { $gte: targetOrder } }, { $inc: { order: 1 } });
    }

    const product = new Product({
      name,
      slug: uniqueSlug,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      condition: condition || 'Ngoại hình 98% - Hoạt động hoàn hảo',
      brand,
      priceCategory: computedPriceCategory,
      category: category || 'may-anh-cu',
      deviceType: deviceType || 'Mirrorless',
      images,
      description: description || '',
      accessories: accessories || 'Pin zin, Sạc zin, Dây đeo, Nắp body, Tặng kèm thẻ nhớ 32GB',
      warranty: warranty || 'Bảo hành 06 tháng phần cứng - Bao test 07 ngày lỗi 1 đổi 1',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      featured: featured || false,
      order: targetOrder,
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      message: 'Đã thêm sản phẩm mới thành công!',
      product: savedProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tạo sản phẩm: ' + error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      return res.status(500).json({ success: false, message: 'Cơ sở dữ liệu MongoDB chưa kết nối.' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để cập nhật' });
    }

    const {
      name,
      price,
      originalPrice,
      condition,
      brand,
      priceCategory,
      category,
      deviceType,
      images,
      description,
      accessories,
      warranty,
      isAvailable,
      featured,
      order,
    } = req.body;

    if (name && name !== product.name) {
      let baseSlug = slugify(name, { lower: true, strict: true, locale: 'vi' }) || 'may-anh';
      let uniqueSlug = baseSlug;
      let count = 1;
      while (await Product.findOne({ slug: uniqueSlug, _id: { $ne: product._id } })) {
        uniqueSlug = `${baseSlug}-${count}`;
        count++;
      }
      product.slug = uniqueSlug;
      product.name = name;
    }

    if (price !== undefined) {
      product.price = Number(price);
      if (!priceCategory) product.priceCategory = calculatePriceCategory(Number(price));
    }
    if (priceCategory) product.priceCategory = priceCategory;
    if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
    if (condition) product.condition = condition;
    if (brand) product.brand = brand;
    if (category) product.category = category;
    if (deviceType) product.deviceType = deviceType;
    if (images && Array.isArray(images) && images.length > 0) product.images = images;
    if (description !== undefined) product.description = description;
    if (accessories !== undefined) product.accessories = accessories;
    if (warranty !== undefined) product.warranty = warranty;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;
    if (featured !== undefined) product.featured = featured;

    if (order !== undefined && order !== '') {
      const newPos = Math.max(1, Number(order));
      const oldPos = product.order || 9999;
      if (newPos < oldPos) {
        await Product.updateMany(
          { order: { $gte: newPos, $lt: oldPos } },
          { $inc: { order: 1 } }
        );
      } else if (newPos > oldPos) {
        await Product.updateMany(
          { order: { $gt: oldPos, $lte: newPos } },
          { $inc: { order: -1 } }
        );
      }
      product.order = newPos;
    }

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật sản phẩm: ' + error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isDbConnected()) {
      return res.status(500).json({ success: false, message: 'Cơ sở dữ liệu MongoDB chưa kết nối.' });
    }

    await Product.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Đã xóa sản phẩm thành công' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa sản phẩm: ' + error.message });
  }
};

// @desc    Get stats for admin dashboard
// @route   GET /api/products/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(500).json({ success: false, message: 'Cơ sở dữ liệu MongoDB chưa kết nối.' });
    }

    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({ isAvailable: true });
    const soldOutProducts = totalProducts - availableProducts;

    const brandStats = await Product.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const priceCatStats = await Product.aggregate([
      { $group: { _id: '$priceCategory', count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        availableProducts,
        soldOutProducts,
        brandStats,
        priceCatStats,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reorder products (change display position)
// @route   PUT /api/products/reorder
// @access  Private/Admin
const reorderProducts = async (req, res) => {
  try {
    const { productId, newOrder, orderedIds } = req.body;

    if (!isDbConnected()) {
      return res.status(500).json({ success: false, message: 'Cơ sở dữ liệu MongoDB chưa kết nối.' });
    }

    if (orderedIds && Array.isArray(orderedIds)) {
      const bulkOps = orderedIds.map((id, idx) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { order: idx + 1 } },
        },
      }));
      await Product.bulkWrite(bulkOps);
      return res.status(200).json({ success: true, message: 'Đã cập nhật vị trí sản phẩm thành công' });
    }

    if (productId && newOrder !== undefined) {
      const targetPos = Math.max(1, parseInt(newOrder, 10) || 1);
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
      }

      const oldOrder = product.order || 9999;
      if (targetPos < oldOrder) {
        await Product.updateMany(
          { order: { $gte: targetPos, $lt: oldOrder } },
          { $inc: { order: 1 } }
        );
      } else if (targetPos > oldOrder) {
        await Product.updateMany(
          { order: { $gt: oldOrder, $lte: targetPos } },
          { $inc: { order: -1 } }
        );
      }

      product.order = targetPos;
      await product.save();

      return res.status(200).json({ success: true, message: 'Đã cập nhật vị trí sản phẩm', product });
    }

    return res.status(400).json({ success: false, message: 'Thiếu thông tin vị trí sắp xếp' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật vị trí: ' + error.message });
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  reorderProducts,
  deleteProduct,
  getAdminStats,
};
