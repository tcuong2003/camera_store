const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug sản phẩm là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Giá bán là bắt buộc'],
      min: [0, 'Giá không thể âm'],
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    condition: {
      type: String,
      required: [true, 'Tình trạng ngoại hình là bắt buộc'],
      trim: true,
      default: 'Ngoại hình 98% - Hoạt động hoàn hảo',
    },
    brand: {
      type: String,
      required: [true, 'Thương hiệu là bắt buộc'],
      trim: true,
    },
    priceCategory: {
      type: String,
      enum: ['under_3m', '3m_5m', '5m_10m', 'above_10m'],
      required: [true, 'Tầm giá là bắt buộc'],
    },
    category: {
      type: String,
      required: [true, 'Loại danh mục là bắt buộc'],
      trim: true,
      default: 'may-anh-cu',
    },
    deviceType: {
      type: String,
      default: 'Mirrorless',
      trim: true,
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Cần ít nhất 1 hình ảnh sản phẩm',
      },
    },
    description: {
      type: String,
      default: '',
    },
    accessories: {
      type: String,
      default: 'Pin zin, Sạc zin, Dây đeo, Nắp body, Tặng kèm thẻ nhớ 32GB',
    },
    warranty: {
      type: String,
      default: 'Bảo hành 06 tháng phần cứng - Bao test 07 ngày lỗi 1 đổi 1',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', brand: 'text', description: 'text' });
productSchema.index({ order: 1 });
productSchema.index({ price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ priceCategory: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
