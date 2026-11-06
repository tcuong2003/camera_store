const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mayanhtop1_secret_jwt_key_2026');

      const admin = await Admin.findById(decoded.id).select('-passwordHash');
      if (!admin) {
        // If seeded admin id or mock
        if (decoded.username === 'admin') {
          req.admin = { id: decoded.id, username: 'admin', role: 'admin' };
          return next();
        }
        return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });
      }

      req.admin = admin;
      next();
    } catch (error) {
      console.error('JWT auth error:', error.message);
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Yêu cầu token xác thực của Quản trị viên' });
  }
};

module.exports = { protect };
