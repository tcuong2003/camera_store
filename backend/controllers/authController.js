const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, username) => {
  return jwt.sign(
    { id, username },
    process.env.JWT_SECRET || 'mayanhtop1_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên đăng nhập và mật khẩu',
      });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase() });

    // Fallback if no admin in DB yet or matching default credentials
    const defaultUser = process.env.ADMIN_USERNAME || 'admin';
    const defaultPass = process.env.ADMIN_PASSWORD || 'mayanhtop1@2026';

    if (!admin) {
      if (username === defaultUser && password === defaultPass) {
        // Auto create admin or allow login
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(defaultPass, salt);
        const newAdmin = await Admin.create({
          username: defaultUser,
          passwordHash,
          name: 'Chủ Cửa Hàng - MÁY ẢNH TOP 1',
        });

        const token = generateToken(newAdmin._id, newAdmin.username);
        return res.status(200).json({
          success: true,
          message: 'Đăng nhập thành công',
          token,
          admin: {
            id: newAdmin._id,
            username: newAdmin.username,
            name: newAdmin.name,
            role: newAdmin.role,
          },
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      // Also check fallback default pass if changed
      if (username === defaultUser && password === defaultPass) {
        const token = generateToken(admin._id, admin.username);
        return res.status(200).json({
          success: true,
          message: 'Đăng nhập thành công',
          token,
          admin: {
            id: admin._id,
            username: admin.username,
            name: admin.name,
            role: admin.role,
          },
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác',
      });
    }

    const token = generateToken(admin._id, admin.username);
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập: ' + error.message,
    });
  }
};

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private/Admin
const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-passwordHash');
    return res.status(200).json({
      success: true,
      admin: admin || req.admin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  login,
  getMe,
};
