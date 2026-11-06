const Product = require('../models/Product');
const slugify = require('slugify');

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
      limit = 24,
    } = req.query;

    const query = {};

    // Filter by availability (default: only show available on client unless specified)
    if (isAvailable !== undefined && isAvailable !== '') {
      query.isAvailable = isAvailable === 'true';
    }

    // Search keyword
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

    // Filter by Brand (can be single or multiple comma-separated)
    if (brand && brand !== 'all') {
      const brands = brand.split(',').map((b) => b.trim());
      query.brand = { $in: brands.map((b) => new RegExp(`^${b}$`, 'i')) };
    }

    // Filter by Price Category
    if (priceCategory && priceCategory !== 'all') {
      const priceCats = priceCategory.split(',').map((p) => p.trim());
      query.priceCategory = { $in: priceCats };
    }

    // Filter by Category (device type or section)
    if (category && category !== 'all') {
      const categories = category.split(',').map((c) => c.trim());
      query.category = { $in: categories };
    }

    // Filter by Device Type
    if (deviceType && deviceType !== 'all') {
      query.deviceType = new RegExp(`^${deviceType}$`, 'i');
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'views_desc') {
      sortOption = { views: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 24;
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

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

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm này',
      });
    }

    // Increment views
    product.views = (product.views || 0) + 1;
    await product.save({ validateBeforeSave: false });

    // Get related products from same brand or category
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

// @desc    Get single product by ID (Admin)
// @route   GET /api/products/:id
// @access  Private/Admin
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
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
    } = req.body;

    if (!name || !price || !brand) {
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

    // Generate unique slug
    let baseSlug = slugify(name, { lower: true, strict: true, locale: 'vi' });
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await Product.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${count}`;
      count++;
    }

    // Determine priceCategory if not provided
    const computedPriceCategory = priceCategory || calculatePriceCategory(Number(price));

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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm để cập nhật',
      });
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
    } = req.body;

    if (name && name !== product.name) {
      let baseSlug = slugify(name, { lower: true, strict: true, locale: 'vi' });
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
      if (!priceCategory) {
        product.priceCategory = calculatePriceCategory(Number(price));
      }
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

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật sản phẩm: ' + error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm để xóa',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa sản phẩm thành công',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm: ' + error.message,
    });
  }
};

// @desc    Get stats for admin dashboard
// @route   GET /api/products/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
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
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminStats,
};
