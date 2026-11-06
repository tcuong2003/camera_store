const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Tên đăng nhập là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
    },
    name: {
      type: String,
      default: 'Chủ Cửa Hàng - MÁY ẢNH TOP 1',
    },
    role: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('Admin', adminSchema);
