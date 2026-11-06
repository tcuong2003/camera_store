const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Admin = require('./models/Admin');
const slugify = require('slugify');

dotenv.config();

const sampleProducts = [
  {
    name: 'Sony Alpha A6000 + Lens Kit 16-50mm OSS (Màu Bạc)',
    price: 7800000,
    originalPrice: 9500000,
    condition: 'Ngoại hình 99% Likenew - Sensor sạch bong, không trầy xước',
    brand: 'Sony',
    priceCategory: '5m_10m',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1589872765304-a66916a2442e?auto=format&fit=crop&w=1000&q=80',
    ],
    description: `Sony A6000 màu bạc cực kỳ sang trọng, dòng máy quốc dân cho người mới bắt đầu hoặc người chụp du lịch, làm Vlog bán chuyên.
- Hệ thống lấy nét siêu tốc 179 điểm theo pha 4D Focus.
- Cảm biến APS-C 24.3 MP cho ảnh sắc nét, màu sắc tươi tắn.
- Màn hình lật linh hoạt, tích hợp Wifi/NFC chuyển ảnh nhanh sang điện thoại qua app Imaging Edge Mobile.
- Ống kính kit 16-50mm nhỏ gọn kèm chống rung OSS mượt mà.`,
    accessories: '1 Pin zin Sony, 1 Sạc rời đôi, Dây đeo zin Sony, Nắp che lens & body, Tặng kèm thẻ nhớ SanDisk 32GB 100MB/s + Túi đựng máy ảnh',
    warranty: 'Bảo hành 06 tháng phần cứng - Bao test 07 ngày lỗi 1 đổi 1 tận nơi tại TP.HCM',
    isAvailable: true,
    featured: true,
  },
  {
    name: 'Fujifilm X-T20 + Lens XF 18-55mm F2.8-4 R LM OIS (Đen)',
    price: 14500000,
    originalPrice: 16800000,
    condition: 'Ngoại hình 98% - Hoạt động hoàn hảo, kính đẹp không mốc xước',
    brand: 'Fujifilm',
    priceCategory: 'above_10m',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1589872765304-a66916a2442e?auto=format&fit=crop&w=1000&q=80',
    ],
    description: `Fujifilm X-T20 mang kiểu dáng hoài cổ Film Vintage tuyệt đẹp. Màu film đặc trưng trứ danh của Fuji như Classic Chrome, Velvia, Astia cho ảnh xuất trực tiếp không cần hậu kỳ.
- Cảm biến X-Trans CMOS III 24.3MP + chip X-Processor Pro.
- Kèm lens chất lượng cao XF 18-55mm f/2.8-4 có chống rung cực tốt, build kim loại đầm tay.
- Màn hình cảm ứng lật, quay video 4K sắc nét.`,
    accessories: 'Pin zin Fuji NP-W126S, Dock sạc chính hãng, Dây da vintage cao cấp, Nắp lens, Hood che nắng, Thẻ SD 64GB',
    warranty: 'Bảo hành 06 tháng phần cứng - Đổi trả trong 7 ngày nếu có lỗi nhà sản xuất',
    isAvailable: true,
    featured: true,
  },
  {
    name: 'Canon EOS 60D Body (Ngoại hình đẹp 98%, chụp 12k shot)',
    price: 6200000,
    originalPrice: 7500000,
    condition: 'Ngoại hình 98% - Cao su chắc chắn, Sensor sạch trong',
    brand: 'Canon',
    priceCategory: '5m_10m',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    images: [
      'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
    ],
    description: `Canon EOS 60D là chiếc DSLR bán chuyên huyền thoại của Canon, cực kỳ bền bỉ và dễ sử dụng cho học sinh, sinh viên, người mới bắt đầu học nhiếp ảnh.
- Cảm biến 18MP APS-C cho màu da tự nhiên đặc trưng Canon.
- Màn hình xoay lật 3.0 inch độ nét cao tiện lợi chụp nhiều góc khó.
- Màn hình phụ trên đỉnh máy kiểm tra thông số nhanh chóng.
- Pin dung lượng cao chụp 800 - 1000 kiểu ảnh mỗi lần sạc.`,
    accessories: 'Pin LP-E6 zin, Sạc zin Canon, Dây đeo Canon 60D đỏ, Nắp che body, Tặng thẻ nhớ SD 32GB',
    warranty: 'Bảo hành 06 tháng tại cửa hàng - 1 đổi 1 trong 7 ngày đầu',
    isAvailable: true,
    featured: true,
  },
  {
    name: 'Sony A7 Mark II (A7M2) Body Ngoại Hình 98%',
    price: 13900000,
    originalPrice: 15500000,
    condition: 'Ngoại hình 98% - 14k shot, Sensor sạch trong, cao su nguyên vẹn',
    brand: 'Sony',
    priceCategory: 'above_10m',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    images: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
    ],
    description: `Chiếc máy ảnh Full-frame giá tốt nhất phân khúc! Sony A7 Mark II sở hữu cảm biến Full-Frame 24.3 MP cùng hệ thống chống rung 5 trục SteadyShot INSIDE ngay trong thân máy.
- Chống rung 5 trục giúp chụp thiếu sáng với lens MF mượt mà không rung lắc.
- Khả năng xử lý ISO cực tốt, dải tương phản động Dynamic Range rộng.
- Hỗ trợ quay phim chế độ S-Log2 cho dân làm video.`,
    accessories: '2 Pin (1 Pin zin + 1 pin Kingma), Sạc đôi LCD, Dây đeo, Nắp body, Tặng thẻ 64GB',
    warranty: 'Bảo hành 06 tháng phần cứng - Hỗ trợ kỹ thuật trọn đời',
    isAvailable: true,
    featured: true,
  },
  {
    name: 'Canon EOS 600D (Rebel T3i) + Lens 18-55mm IS II',
    price: 4300000,
    originalPrice: 5200000,
    condition: 'Ngoại hình 97% - Máy hoạt động êm ái, kính lens trong veo',
    brand: 'Canon',
    priceCategory: '3m_5m',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
    ],
    description: `Combo máy ảnh cơ bản giá rẻ tuyệt vời cho sinh viên và người mới tập chụp. Có màn hình xoay lật 360 độ tiện chụp selfie hoặc quay clip bài tập.
- 18 triệu điểm ảnh độ phân giải cao.
- Quay video Full HD 1080p có micro âm thanh rõ.
- Ống kính kèm chống rung IS II chụp thiếu sáng ổn định.`,
    accessories: 'Pin zin, Sạc zin, Dây đeo zin, Nắp trước sau ống kính, Thẻ 16GB, Túi máy ảnh',
    warranty: 'Bảo hành 03 tháng - Bao test 7 ngày lỗi đổi máy khác',
    isAvailable: true,
    featured: false,
  },
  {
    name: 'Nikon D7100 Body Ngoại Hình Đẹp (Chụp 15k shot)',
    price: 6900000,
    originalPrice: 8000000,
    condition: 'Ngoại hình 98% - Sơn sần nguyên bản, nút bấm nảy tanh tách',
    brand: 'Nikon',
    priceCategory: '5m_10m',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    images: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1589872765304-a66916a2442e?auto=format&fit=crop&w=1000&q=80',
    ],
    description: `Dòng máy Semi-Pro nổi tiếng trâu bò của Nikon. Vỏ hợp kim magie chống chịu thời tiết, cảm biến 24.1MP loại bỏ bộ lọc khử răng cưa OLPF cho độ nét gai góc tuyệt đối.
- 51 điểm lấy nét với 15 điểm Cross-type siêu nhạy.
- Hai khe cắm thẻ nhớ SD tiện lưu trữ hoặc backup tức thời.`,
    accessories: 'Pin zin Nikon EN-EL15, Sạc zin MH-25, Dây đeo Nikon D7100, Nắp body, Thẻ 32GB',
    warranty: 'Bảo hành 06 tháng - 1 đổi 1 trong tuần đầu',
    isAvailable: true,
    featured: false,
  },
  {
    name: 'Ricoh GR III (GR3) - Bản Đường Phố Street Edition',
    price: 22500000,
    originalPrice: 24500000,
    condition: 'Ngoại hình 99.9% Likenew Fullbox - Chưa một vết xước',
    brand: 'Ricoh',
    priceCategory: 'above_10m',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1589872765304-a66916a2442e?auto=format&fit=crop&w=1000&q=80',
    ],
    description: `Vua máy ảnh đường phố (Street Photography)! Kích thước nhét vừa vặn túi quần nhưng mang sức mạnh cảm biến lớn APS-C 24.2 MP cùng ống kính 28mm f/2.8 sắc nét từng chi tiết.
- Tính năng Snap Focus chụp chớp khoảnh khắc tức thì.
- Chống rung 3 trục trong thân máy cực kỳ nhỏ gọn.
- Bộ màu Film High-Contrast Black & White và Positive Film trứ danh.`,
    accessories: 'Hộp Fullbox đầy đủ phụ kiện, 2 Pin zin DB-110, Cáp sạc Type-C, Vòng kim loại ring cam độc quyền, Dây đeo tay chính hãng, Tặng thẻ 64GB',
    warranty: 'Bảo hành 09 tháng phần cứng - Bao test 15 ngày',
    isAvailable: true,
    featured: true,
  },
  {
    name: 'Canon IXY 650 (PowerShot ELPH 360 HS) Nhỏ Gọn Bỏ Túi',
    price: 2450000,
    originalPrice: 3200000,
    condition: 'Ngoại hình 97% - Ống kính kính trong veo, zoom mượt mà',
    brand: 'Canon',
    priceCategory: 'under_3m',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    images: [
      'https://images.unsplash.com/photo-1589872765304-a66916a2442e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
    ],
    description: `Chiếc máy ảnh kỹ thuật số compact phong cách Y2K đang cực sốt trong giới trẻ. Màu ảnh hoài niệm, có đèn flash đánh sáng tự nhiên chụp đêm tôn da cực đỉnh.
- Cảm biến CMOS 20.2 MP cùng zoom quang học 12x.
- Có sẵn Wifi chuyển ảnh thẳng sang iPhone hoặc Android ngay lập tức.`,
    accessories: 'Pin zin, Sạc rời, Dây đeo cổ tay, Thẻ nhớ 16GB, Bao da mini',
    warranty: 'Bảo hành 03 tháng - Bao test 7 ngày',
    isAvailable: true,
    featured: false,
  },
  {
    name: 'Lumix DMC-GF9 (GX850) Kèm Lens 12-32mm Mega O.I.S',
    price: 4900000,
    originalPrice: 5800000,
    condition: 'Ngoại hình 98% - Máy màu cam bạc thời trang, màn hình dán cường lực',
    brand: 'Lumix',
    priceCategory: '3m_5m',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1000&q=80',
    ],
    description: `Máy ảnh Panasonic Lumix GF9 chuyên chụp chân dung, du lịch và Vlog:
- Màn hình lật 180 độ lên phía trước tự sướng chụp selfie cực đẹp với nhiều chế độ làm mịn da.
- Hỗ trợ quay phim 4K 30fps và tính năng chụp 4K Photo độc đáo.
- Thiết kế siêu nhỏ nhẹ thời trang, thay đổi được nhiều ống kính ngàm M43.`,
    accessories: 'Pin zin, Cáp sạc, Dây đeo, Nắp lens, Thẻ nhớ tốc độ cao 32GB',
    warranty: 'Bảo hành 06 tháng - Bao test 7 ngày',
    isAvailable: true,
    featured: false,
  },
  {
    name: 'Nikon Coolpix S3300 Vintage Y2K Mini',
    price: 1850000,
    originalPrice: 2400000,
    condition: 'Ngoại hình 96% - Hoạt động trơn tru, flash đánh khỏe',
    brand: 'Nikon',
    priceCategory: 'under_3m',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    images: [
      'https://images.unsplash.com/photo-1589872765304-a66916a2442e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
    ],
    description: `Máy ảnh compact cổ điển phong cách Vintage hoài niệm đầu thập niên 2010. Cho màu ảnh ngả vàng ấm áp, tone film tự nhiên rất được các bạn học sinh sinh viên chuộng chụp kỷ niệm.`,
    accessories: 'Pin, Sạc đa năng, Đầu đọc thẻ cho điện thoại, Thẻ nhớ 8GB',
    warranty: 'Bảo hành 01 tháng - Bao test 03 ngày',
    isAvailable: true,
    featured: false,
  },
  {
    name: 'Olympus OM-D E-M10 Mark II Body (Màu Bạc)',
    price: 6800000,
    originalPrice: 8200000,
    condition: 'Ngoại hình 98% - Máy đẹp không cấn móp, sensor hoàn hảo',
    brand: 'Olympus',
    priceCategory: '5m_10m',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
    ],
    description: `Thiết kế đậm chất cổ điển tựa như máy film cơ khí những năm 1970. Chống rung 5 trục trứ danh của Olympus ngay trong body cho ảnh nét căng dù chụp đêm ở tốc độ màn trập chậm.
- Kính ngắm điện tử OLED độ phân giải cao 2.36 triệu điểm.
- Hàng chục bộ lọc hiệu ứng Art Filter nghệ thuật.`,
    accessories: 'Pin zin Olympus BLS-50, Sạc zin, Dây đeo Olympus, Nắp body, Thẻ SD 32GB',
    warranty: 'Bảo hành 06 tháng - Bao test 7 ngày',
    isAvailable: true,
    featured: false,
  },
  {
    name: 'Lens Sony FE 50mm F1.8 (Chân Dung Xóa Phông Full-Frame)',
    price: 3600000,
    originalPrice: 4800000,
    condition: 'Ngoại hình 99% Likenew - Kính trong vắt, không mốc rễ',
    brand: 'Sony',
    priceCategory: '3m_5m',
    category: 'ong-kinh',
    deviceType: 'Lens',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
    ],
    description: `Ống kính fix tiêu cự chuẩn 50mm với khẩu độ lớn f/1.8 xóa phông mịt mù, tạo hiệu ứng bokeh tròn đẹp mắt. Thích hợp chụp chân dung ngoài trời lẫn trong quán cafe thiếu sáng.`,
    accessories: 'Nắp trước sau chính hãng Sony, Loa che sáng (Hood)',
    warranty: 'Bảo hành 06 tháng - Bao test 7 ngày',
    isAvailable: true,
    featured: false,
  },
];

const sampleCategories = [
  // Price ranges
  { name: 'Dưới 3 triệu', slug: 'under_3m', type: 'price', order: 1 },
  { name: '3 - 5 triệu', slug: '3m_5m', type: 'price', order: 2 },
  { name: '5 - 10 triệu', slug: '5m_10m', type: 'price', order: 3 },
  { name: 'Trên 10 triệu', slug: 'above_10m', type: 'price', order: 4 },

  // Brands
  { name: 'Canon', slug: 'canon', type: 'brand', order: 1 },
  { name: 'Sony', slug: 'sony', type: 'brand', order: 2 },
  { name: 'Nikon', slug: 'nikon', type: 'brand', order: 3 },
  { name: 'Fujifilm', slug: 'fujifilm', type: 'brand', order: 4 },
  { name: 'Lumix', slug: 'lumix', type: 'brand', order: 5 },
  { name: 'Olympus', slug: 'olympus', type: 'brand', order: 6 },
  { name: 'Ricoh', slug: 'ricoh', type: 'brand', order: 7 },
  { name: 'Casio', slug: 'casio', type: 'brand', order: 8 },

  // Device types / categories
  { name: 'Máy ảnh cũ Sài Gòn', slug: 'may-anh-cu', type: 'category', order: 1 },
  { name: 'Máy ảnh chính hãng', slug: 'may-anh-chinh-hang', type: 'category', order: 2 },
  { name: 'Ống kính (Lens)', slug: 'ong-kinh', type: 'category', order: 3 },
  { name: 'Phụ kiện máy ảnh', slug: 'phu-kien', type: 'category', order: 4 },

  // Device format
  { name: 'Mirrorless', slug: 'mirrorless', type: 'device_type', order: 1 },
  { name: 'DSLR', slug: 'dslr', type: 'device_type', order: 2 },
  { name: 'Compact / Y2K', slug: 'compact', type: 'device_type', order: 3 },
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mayanhtop1';
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing collections
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Admin.deleteMany({});
    console.log('[Seed] Cleaned old products, categories, admins.');

    // Create Admin
    const defaultUser = process.env.ADMIN_USERNAME || 'admin';
    const defaultPass = process.env.ADMIN_PASSWORD || 'mayanhtop1@2026';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPass, salt);

    await Admin.create({
      username: defaultUser,
      passwordHash,
      name: 'Chủ Cửa Hàng - MÁY ẢNH TOP 1',
      role: 'admin',
    });
    console.log(`[Seed] Created admin account: ${defaultUser} / ${defaultPass}`);

    // Create Categories
    await Category.insertMany(sampleCategories);
    console.log(`[Seed] Seeded ${sampleCategories.length} categories.`);

    // Create Products with slugs
    const productsWithSlugs = sampleProducts.map((p) => {
      const slug = slugify(p.name, { lower: true, strict: true, locale: 'vi' });
      return { ...p, slug };
    });

    await Product.insertMany(productsWithSlugs);
    console.log(`[Seed] Seeded ${productsWithSlugs.length} camera products.`);

    console.log('[Seed] Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedDB();
