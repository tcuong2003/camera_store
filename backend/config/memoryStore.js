const slugify = require('slugify');

const initialProducts = [
  {
    _id: 'prod-1',
    name: 'Sony Alpha A6000 + Lens Kit 16-50mm OSS (Màu Bạc)',
    slug: 'sony-alpha-a6000-lens-kit-16-50mm-oss-mau-bac',
    price: 7800000,
    originalPrice: 9500000,
    condition: 'Ngoại hình 99% Likenew - Sensor sạch bong',
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
    views: 128,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'prod-2',
    name: 'Fujifilm X-T20 + Lens XF 18-55mm F2.8-4 R LM OIS (Đen)',
    slug: 'fujifilm-x-t20-lens-xf-18-55mm-f2-8-4-r-lm-ois-den',
    price: 14500000,
    originalPrice: 16800000,
    condition: 'Ngoại hình 98% - Hoạt động hoàn hảo, kính đẹp',
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
    views: 245,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'prod-3',
    name: 'Canon EOS 60D Body (Ngoại hình đẹp 98%, chụp 12k shot)',
    slug: 'canon-eos-60d-body-ngoai-hinh-dep-98-chup-12k-shot',
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
    views: 92,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'prod-4',
    name: 'Sony A7 Mark II (A7M2) Body Ngoại Hình 98%',
    slug: 'sony-a7-mark-ii-a7m2-body-ngoai-hinh-98',
    price: 13900000,
    originalPrice: 15500000,
    condition: 'Ngoại hình 98% - 14k shot, Sensor sạch trong',
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
    views: 312,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'prod-5',
    name: 'Canon EOS 600D (Rebel T3i) + Lens 18-55mm IS II',
    slug: 'canon-eos-600d-rebel-t3i-lens-18-55mm-is-ii',
    price: 4300000,
    originalPrice: 5200000,
    condition: 'Ngoại hình 97% - Máy hoạt động êm ái, kính trong veo',
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
    views: 74,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'prod-6',
    name: 'Nikon D7100 Body Ngoại Hình Đẹp (Chụp 15k shot)',
    slug: 'nikon-d7100-body-ngoai-hinh-dep-chup-15k-shot',
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
    views: 89,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'prod-7',
    name: 'Ricoh GR III (GR3) - Bản Đường Phố Street Edition',
    slug: 'ricoh-gr-iii-gr3-ban-duong-pho-street-edition',
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
    ],
    description: `Vua máy ảnh đường phố (Street Photography)! Kích thước nhét vừa vặn túi quần nhưng mang sức mạnh cảm biến lớn APS-C 24.2 MP cùng ống kính 28mm f/2.8 sắc nét từng chi tiết.
- Tính năng Snap Focus chụp chớp khoảnh khắc tức thì.
- Chống rung 3 trục trong thân máy cực kỳ nhỏ gọn.
- Bộ màu Film High-Contrast Black & White và Positive Film trứ danh.`,
    accessories: 'Hộp Fullbox đầy đủ phụ kiện, 2 Pin zin DB-110, Cáp sạc Type-C, Vòng ring cam độc quyền, Thẻ 64GB',
    warranty: 'Bảo hành 09 tháng phần cứng - Bao test 15 ngày',
    isAvailable: true,
    featured: true,
    views: 410,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'prod-8',
    name: 'Canon IXY 650 (PowerShot ELPH 360 HS) Nhỏ Gọn Bỏ Túi',
    slug: 'canon-ixy-650-powershot-elph-360-hs-nho-gon-bo-tui',
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
    description: `Chiếc máy ảnh compact phong cách Y2K cổ điển đang cực sốt trong giới trẻ. Màu ảnh hoài niệm, có đèn flash đánh sáng tự nhiên chụp đêm tôn da cực đỉnh.
- Cảm biến CMOS 20.2 MP cùng zoom quang học 12x.
- Có sẵn Wifi chuyển ảnh thẳng sang iPhone hoặc Android ngay lập tức.`,
    accessories: 'Pin zin, Sạc rời, Dây đeo cổ tay, Thẻ nhớ 16GB, Bao da mini',
    warranty: 'Bảo hành 03 tháng - Bao test 7 ngày',
    isAvailable: true,
    featured: false,
    views: 180,
    createdAt: new Date().toISOString(),
  },
];

const initialCategories = [
  { name: 'Dưới 3 triệu', slug: 'under_3m', type: 'price', order: 1 },
  { name: '3 - 5 triệu', slug: '3m_5m', type: 'price', order: 2 },
  { name: '5 - 10 triệu', slug: '5m_10m', type: 'price', order: 3 },
  { name: 'Trên 10 triệu', slug: 'above_10m', type: 'price', order: 4 },
  { name: 'Canon', slug: 'canon', type: 'brand', order: 1 },
  { name: 'Sony', slug: 'sony', type: 'brand', order: 2 },
  { name: 'Nikon', slug: 'nikon', type: 'brand', order: 3 },
  { name: 'Fujifilm', slug: 'fujifilm', type: 'brand', order: 4 },
  { name: 'Lumix', slug: 'lumix', type: 'brand', order: 5 },
  { name: 'Olympus', slug: 'olympus', type: 'brand', order: 6 },
  { name: 'Ricoh', slug: 'ricoh', type: 'brand', order: 7 },
  { name: 'Casio', slug: 'casio', type: 'brand', order: 8 },
];

let memoryProducts = [...initialProducts];
let memoryCategories = [...initialCategories];

module.exports = {
  getMemoryProducts: () => memoryProducts,
  setMemoryProducts: (prods) => { memoryProducts = prods; },
  addMemoryProduct: (p) => {
    memoryProducts.unshift(p);
    return p;
  },
  updateMemoryProduct: (id, updates) => {
    const idx = memoryProducts.findIndex((p) => p._id === id);
    if (idx !== -1) {
      memoryProducts[idx] = { ...memoryProducts[idx], ...updates, updatedAt: new Date().toISOString() };
      return memoryProducts[idx];
    }
    return null;
  },
  deleteMemoryProduct: (id) => {
    memoryProducts = memoryProducts.filter((p) => p._id !== id);
  },
  getMemoryCategories: () => memoryCategories,
  addMemoryCategory: (c) => {
    memoryCategories.push(c);
    return c;
  },
  deleteMemoryCategory: (slug) => {
    memoryCategories = memoryCategories.filter((c) => c.slug !== slug);
  },
};
