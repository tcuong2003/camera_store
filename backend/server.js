const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads if fallback local storage is used
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'MÁY ẢNH TOP 1 - API Backend',
    version: '1.0.0',
    time: new Date().toISOString(),
    hotline: '0986834449',
    zalo: 'https://zalo.me/0986834449',
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.send('<h1>MÁY ẢNH TOP 1 - Backend API is running!</h1><p>Hotline/Zalo: 0986834449</p>');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy đường dẫn: ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ',
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` MÁY ẢNH TOP 1 - Backend Server running on port ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
