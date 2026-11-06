const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

const unsplashImages = [
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1589872765304-a66916a2442e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1508898578281-774ac4893c0c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80'
];

const getImageSlice = (index, count = 3) => {
  const res = [];
  for (let i = 0; i < count; i++) {
    res.push(unsplashImages[(index * 2 + i) % unsplashImages.length]);
  }
  return res;
};

const calcPriceCat = (p) => {
  if (p < 3000000) return 'under_3m';
  if (p <= 5000000) return '3m_5m';
  if (p <= 10000000) return '5m_10m';
  return 'above_10m';
};

// 100 Products Definition
const rawProducts = [
  // --- SONY (20 sản phẩm) ---
  {
    name: 'Sony Alpha A6000 + Lens Kit 16-50mm OSS (Màu Bạc)',
    price: 7800000,
    originalPrice: 9500000,
    condition: 'Ngoại hình 99% Likenew - Sensor sạch bong',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Sony A6000 màu bạc sang trọng, dòng máy quốc dân cho người mới bắt đầu hoặc du lịch, làm Vlog bán chuyên. Hệ thống lấy nét siêu tốc 179 điểm 4D Focus.',
    accessories: '1 Pin zin Sony, 1 Sạc rời đôi, Dây đeo zin Sony, Nắp che lens & body, Tặng kèm thẻ nhớ 32GB',
    warranty: 'Bảo hành 06 tháng phần cứng - Bao test 07 ngày lỗi 1 đổi 1',
    featured: true,
  },
  {
    name: 'Sony Alpha A6000 Body (Màu Đen, chụp 6k shot)',
    price: 6500000,
    originalPrice: 7900000,
    condition: 'Ngoại hình 98% - Cao su nguyên sần, màn hình sáng đẹp',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Thân máy Sony A6000 đen mạnh mẽ. Cảm biến APS-C 24.3MP cho độ phân giải cực cao, lấy nét siêu nhanh.',
    accessories: 'Pin zin Sony, Sạc dây, Nắp che body, Dây đeo Sony Alpha',
    warranty: 'Bảo hành 06 tháng phần cứng - Bao test 7 ngày',
  },
  {
    name: 'Sony Alpha A6300 + Lens Kit 16-50mm OSS',
    price: 11200000,
    originalPrice: 13000000,
    condition: 'Ngoại hình 98.5% - Quay 4K sắc nét, không trầy sensor',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Sony A6300 nâng cấp vượt bậc với khả năng quay video 4K chuẩn điện ảnh, vỏ hợp kim Magie nguyên khối chống chịu thời tiết.',
    accessories: 'Pin zin FW50, Sạc đôi Kingma, Dây đeo zin, Thẻ nhớ SanDisk 64GB',
    warranty: 'Bảo hành 06 tháng phần cứng',
    featured: true,
  },
  {
    name: 'Sony Alpha A6400 Body (Đen, Likenew 2k shot)',
    price: 15800000,
    originalPrice: 17500000,
    condition: 'Ngoại hình 99.9% Likenew - Màn hình lật 180 độ không vết xước',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Vua lấy nét thời gian thực Real-time Eye AF người và động vật. Màn hình lật 180 độ hoàn hảo cho Vlogger, Tiktoker và Youtuber chuyên nghiệp.',
    accessories: 'Fullbox hộp trùng imei, Pin zin, Sạc sáp, Cáp Type-C, Dây đeo A6400 zin',
    warranty: 'Bảo hành 06 tháng phần cứng - 1 đổi 1 trong 7 ngày',
    featured: true,
  },
  {
    name: 'Sony Alpha A6500 Body (Chống rung cảm biến 5 trục 5-axis IBIS)',
    price: 14200000,
    originalPrice: 16500000,
    condition: 'Ngoại hình 97% - Chống rung hoạt động êm ái, phím bấm nảy',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Máy ảnh APS-C cao cấp trang bị chống rung 5 trục trong thân máy, bộ đệm cực khủng chụp liên tục 307 tấm ảnh không lag giật.',
    accessories: 'Pin zin Sony, Sạc đôi, Dây đeo bản to, Nắp body',
    warranty: 'Bảo hành 06 tháng phần cứng',
  },
  {
    name: 'Sony Alpha A6600 Body (Pin Z cực trâu FZ100, chống rung)',
    price: 21500000,
    originalPrice: 24000000,
    condition: 'Ngoại hình 99% - Pin FZ100 chụp cả ngày hơn 800 tấm',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Flagship dòng APS-C của Sony. Sở hữu viên pin dung lượng lớn Z100, Eye AF trong video và màn hình cảm ứng lật góc tiện lợi.',
    accessories: 'Pin FZ100 zin, Củ sạc nhanh Sony, Dây đeo, Tặng thẻ 64GB 170MB/s',
    warranty: 'Bảo hành 06 tháng phần cứng',
  },
  {
    name: 'Sony ZV-E10 + Lens 16-50mm White Edition (Màu Trắng)',
    price: 13500000,
    originalPrice: 15200000,
    condition: 'Ngoại hình 99% - Micro 3 hướng lọc gió hoàn hảo',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Chiếc máy ảnh chuyên dụng cho sáng tạo nội dung, màn hình xoay lật đa góc, chế độ Product Showcase tự động lấy nét sản phẩm.',
    accessories: 'Fullbox, Lông lọc gió Deadcat zin, Pin FW50, Dây đeo, Túi đeo chéo',
    warranty: 'Bảo hành 06 tháng phần cứng',
    featured: true,
  },
  {
    name: 'Sony ZV-1 Vlogger Camera (Gọn nhẹ bỏ túi, màu đen)',
    price: 10800000,
    originalPrice: 12500000,
    condition: 'Ngoại hình 98% - Ống kính Zeiss 24-70mm f1.8-2.8 siêu nét',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Máy ảnh compact cao cấp tích hợp màn hình lật, cảm biến 1 inch xếp chồng Exmor RS mang lại video xóa phông tuyệt đỉnh.',
    accessories: 'Pin zin Sony, Dây sạc, Lọc gió micro, Thẻ SD 64GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Sony Cyber-shot RX100 Mark III (RX100 M3)',
    price: 6800000,
    originalPrice: 8500000,
    condition: 'Ngoại hình 97% - Ống kính Zeiss trong vắt, ống ngắm EVF bật nảy',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Dòng compact cao cấp huyền thoại bỏ túi áo với ống kính Carl Zeiss T* 24-70mm F1.8-2.8 và kính ngắm điện tử pop-up OLED.',
    accessories: 'Pin zin, Cáp sạc micro-USB, Dây đeo cổ tay',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Sony Cyber-shot RX100 Mark V (RX100 M5)',
    price: 11900000,
    originalPrice: 13800000,
    condition: 'Ngoại hình 98% - Tốc độ chụp 24 khung hình/giây',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Lấy nét 315 điểm theo pha, quay phim 4K không gộp điểm ảnh và quay Super Slow Motion 960fps.',
    accessories: 'Pin zin Sony, Sạc đôi rời, Thẻ SanDisk 64GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Sony Cyber-shot RX100 Mark VII (RX100 M7)',
    price: 22800000,
    originalPrice: 25500000,
    condition: 'Ngoại hình 99% Likenew - Zoom 24-200mm f2.8-4.5',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Thu nhỏ hiệu năng của siêu phẩm A9 vào thân máy compact bỏ túi. Dải tiêu cự đa dụng 24-200mm, Real-time Tracking và cổng cắm mic ngoài.',
    accessories: 'Hộp, Pin zin, Cáp sạc, Dây đeo, Tặng kèm báng tay cầm Ulanzi',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Sony A7 Mark II (A7M2) Body Ngoại Hình 98%',
    price: 13900000,
    originalPrice: 15500000,
    condition: 'Ngoại hình 98% - Sensor Full-frame sạch không tì vết',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Máy ảnh Full-frame nhập môn có chống rung 5 trục IBIS trong thân máy. Đem lại chất ảnh trong trẻo, dải dynamic range rộng và khả năng xóa phông mượt mà.',
    accessories: '2 Pin (1 Pin zin + 1 pin Kingma), Sạc đôi LCD, Dây đeo, Nắp body, Tặng thẻ 64GB',
    warranty: 'Bảo hành 06 tháng phần cứng - Bao test 07 ngày',
    featured: true,
  },
  {
    name: 'Sony A7 Mark III (A7M3) Body (Chụp 9k shot)',
    price: 26500000,
    originalPrice: 29000000,
    condition: 'Ngoại hình 98.5% - Cao su chắc, sensor hoàn hảo',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Chiếc máy Full-frame chuẩn mực của thập kỷ. Cảm biến BSI CMOS 24.2MP, pin FZ100 dung lượng lớn, lấy nét 693 điểm và 2 khe cắm thẻ nhớ.',
    accessories: 'Pin zin FZ100, Sạc zin Sony, Dây đeo A7 III zin, Nắp đậy body',
    warranty: 'Bảo hành 06 tháng phần cứng',
    featured: true,
  },
  {
    name: 'Sony A7 Mark IV (A7M4) Body Chính Hãng',
    price: 43500000,
    originalPrice: 47900000,
    condition: 'Mới 99.5% - Còn bảo hành chính hãng Sony VN 14 tháng',
    brand: 'Sony',
    category: 'may-anh-chinh-hang',
    deviceType: 'Mirrorless',
    description: 'Thế hệ mới với cảm biến 33MP Exmor R, bộ xử lý BIONZ XR đỉnh cao, menu cảm ứng hoàn toàn mới và hỗ trợ quay 4K 60p 10-bit 4:2:2.',
    accessories: 'Fullbox đầy đủ phụ kiện chính hãng theo máy',
    warranty: 'Bảo hành chính hãng Sony Việt Nam',
  },
  {
    name: 'Sony A7C Body Silver (Thiết kế Compact Full-frame)',
    price: 27900000,
    originalPrice: 30500000,
    condition: 'Ngoại hình 99% - Thiết kế kim loại bạc phong cách retro',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Sức mạnh Full-frame của A7M3 gói gọn trong thân máy APS-C nhỏ gọn. Màn hình xoay lật góc tự do, pin Z bền bỉ.',
    accessories: 'Pin zin FZ100, Củ sạc nhanh, Dây da phong cách, Nắp body',
    warranty: 'Bảo hành 06 tháng phần cứng',
  },
  {
    name: 'Sony A7R Mark II (A7R2) Body (42.4 Megapixel Siêu Chi Tiết)',
    price: 16800000,
    originalPrice: 19500000,
    condition: 'Ngoại hình 97% - Độ phân giải khủng 42.4MP cho ảnh phóng lớn',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Dành cho người chụp phong cảnh và studio cần độ phân giải cao 42.4MP không có bộ lọc khử răng cưa OLPF.',
    accessories: '2 Pin FW50, Sạc đôi, Dây đeo Sony, Nắp che body',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Sony A7R Mark III (A7R3) Body (Chụp 15k shot)',
    price: 32000000,
    originalPrice: 35500000,
    condition: 'Ngoại hình 98% - Hoạt động xuất sắc mọi tính năng',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Cảm biến 42.4MP kết hợp chip xử lý nhanh gấp đôi thế hệ trước, chụp liên tục 10fps kèm Eye AF bám dính cực đỉnh.',
    accessories: 'Pin FZ100, Sạc rời, Dây đeo A7R III zin, Cáp USB-C',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Sony NEX-5R + Lens Kit 18-55mm OSS (Dành cho sinh viên)',
    price: 3800000,
    originalPrice: 4800000,
    condition: 'Ngoại hình 96% - Màn hình lật 180 độ selfie, Wifi bắn ảnh qua điện thoại',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Chiếc máy ảnh mirrorless nhỏ gọn giá rẻ vô địch cho các bạn sinh viên tập chụp ảnh nghệ thuật hoặc chân dung.',
    accessories: 'Pin zin, Cáp sạc, Dây đeo cổ, Thẻ nhớ 16GB',
    warranty: 'Bảo hành 03 tháng phần cứng',
  },
  {
    name: 'Sony NEX-6 Body + Flash Cóc Pop-up',
    price: 4300000,
    originalPrice: 5200000,
    condition: 'Ngoại hình 97% - Có kính ngắm EVF sắc nét, vòng xoay chế độ chuyên nghiệp',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Nâng cấp đáng giá với kính ngắm điện tử OLED độ phân giải cao và chân flash chuẩn hotshoe ISO tiện lợi.',
    accessories: 'Pin zin, Sạc rời, Dây đeo máy, Nắp body',
    warranty: 'Bảo hành 03 tháng',
  },
  {
    name: 'Sony Cyber-shot W830 (Máy ảnh du lịch nhỏ gọn Y2K)',
    price: 1850000,
    originalPrice: 2400000,
    condition: 'Ngoại hình 98% - Cảm biến CCD 20.1MP cho màu da phấn cực đẹp',
    brand: 'Sony',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Dòng máy ảnh Compact cảm biến CCD phong cách Vintage Y2K được giới trẻ săn đón, zoom quang học 8x Carl Zeiss.',
    accessories: 'Pin zin Sony, Dây sạc, Bao đựng mini, Thẻ nhớ 8GB',
    warranty: 'Bảo hành 03 tháng',
  },

  // --- CANON (22 sản phẩm) ---
  {
    name: 'Canon EOS 60D Body (Ngoại hình đẹp 98%, chụp 12k shot)',
    price: 6200000,
    originalPrice: 7500000,
    condition: 'Ngoại hình 98% - Cao su chắc chắn, Sensor sạch trong',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Canon EOS 60D là chiếc DSLR bán chuyên huyền thoại của Canon, cực kỳ bền bỉ và dễ sử dụng cho học sinh, sinh viên.',
    accessories: 'Pin LP-E6 zin, Sạc zin Canon, Dây đeo Canon 60D đỏ, Nắp che body, Tặng thẻ nhớ SD 32GB',
    warranty: 'Bảo hành 06 tháng tại cửa hàng - 1 đổi 1 trong 7 ngày đầu',
    featured: true,
  },
  {
    name: 'Canon EOS 70D Body (Công nghệ Dual Pixel AF siêu mượt)',
    price: 7900000,
    originalPrice: 9500000,
    condition: 'Ngoại hình 98% - Màn hình cảm ứng xoay lật đa hướng',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Bước ngoặt với công nghệ lấy nét Dual Pixel CMOS AF khi quay phim và chụp qua Live View. Tích hợp Wifi kết nối điện thoại.',
    accessories: 'Pin LP-E6, Sạc zin, Dây đeo 70D, Nắp body, Thẻ SD 32GB',
    warranty: 'Bảo hành 06 tháng phần cứng',
    featured: true,
  },
  {
    name: 'Canon EOS 80D Body (Chụp 8k shot, rất mới)',
    price: 11900000,
    originalPrice: 13800000,
    condition: 'Ngoại hình 99% - Hệ thống lấy nét 45 điểm Cross-type toàn phần',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Vũ khí toàn năng cho nhiếp ảnh gia dịch vụ và quay video phóng sự cưới. Cảm biến 24.2MP và khả năng quay 1080p 60fps mượt mà.',
    accessories: 'Pin zin LP-E6N, Sạc Canon LC-E6E, Dây đeo zin 80D, Thẻ 64GB',
    warranty: 'Bảo hành 06 tháng phần cứng',
  },
  {
    name: 'Canon EOS 6D Mark I Body (Full-frame màu da hồng hào)',
    price: 11500000,
    originalPrice: 13500000,
    condition: 'Ngoại hình 97% - Máy chụp 18k shot, sensor sạch đẹp',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Huyền thoại chân dung chụp ngoại cảnh của Canon. Cảm biến Full-frame 20.2MP tái tạo tông da người mẫu trắng hồng nịnh mắt.',
    accessories: 'Pin zin LP-E6, Sạc zin, Dây đeo 6D viền vàng, Thẻ nhớ 32GB',
    warranty: 'Bảo hành 06 tháng phần cứng',
    featured: true,
  },
  {
    name: 'Canon EOS 6D Mark II (6D2) Body Likenew',
    price: 21900000,
    originalPrice: 24500000,
    condition: 'Ngoại hình 99% - Màn hình lật xoay cảm ứng, 45 điểm AF',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'DSLR Full-frame thế hệ mới nâng cấp cảm biến 26.2MP, màn hình cảm ứng xoay lật góc tự do và Dual Pixel AF cực nhạy.',
    accessories: 'Fullbox hộp trùng seri, Pin zin LP-E6N, Sạc, Dây đeo 6D Mark II',
    warranty: 'Bảo hành 06 tháng phần cứng',
  },
  {
    name: 'Canon EOS 5D Mark II (5D2) Body (Cảm biến Full-frame huyền thoại)',
    price: 6800000,
    originalPrice: 8200000,
    condition: 'Ngoại hình 95% - Vỏ kim loại đầm chắc, chụp 25k shot',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Chiếc máy ảnh làm thay đổi ngành công nghiệp nhiếp ảnh và làm phim. Màu ảnh sâu thẳm, chất cơ học bền bỉ nồi đồng cối đá.',
    accessories: 'Pin LP-E6, Sạc rời, Dây đeo Canon đỏ, Tặng thẻ CF 16GB + đầu đọc',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Canon EOS 5D Mark III (5D3) Body (Chụp 20k shot)',
    price: 13800000,
    originalPrice: 15900000,
    condition: 'Ngoại hình 97% - Nút bấm tanh tách, 61 điểm lấy nét đỉnh cao',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Cỗ máy cày việc hàng đầu cho thợ ảnh đám cưới, sự kiện và phóng sự. Hỗ trợ 2 khe cắm thẻ nhớ (CF + SD) chống mất dữ liệu.',
    accessories: 'Pin zin, Sạc zin Canon, Dây đeo 5D Mark III, Nắp body',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Canon EOS 600D + Lens Kit 18-55mm IS II (Combo cho người mới)',
    price: 4200000,
    originalPrice: 5200000,
    condition: 'Ngoại hình 98% - Màn hình xoay lật tiện dụng, kính lens trong veo',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Bộ máy hoàn hảo cho học sinh sinh viên học môn nhiếp ảnh cơ bản. Giao diện thân thiện, phím bấm trực quan.',
    accessories: 'Pin zin, Sạc zin, Dây đeo Canon, Tặng thẻ 16GB + Túi đựng máy ảnh',
    warranty: 'Bảo hành 06 tháng phần cứng',
  },
  {
    name: 'Canon EOS 700D + Lens Kit 18-55mm STM (Lấy nét êm ru)',
    price: 5500000,
    originalPrice: 6800000,
    condition: 'Ngoại hình 98.5% - Màn hình cảm ứng mượt mà như smartphone',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Trang bị động cơ STM hỗ trợ lấy nét liên tục trong khi quay video cực kỳ êm ái, màn hình cảm ứng điện dung chạm chụp tức thì.',
    accessories: 'Pin zin LP-E8, Sạc rời, Dây đeo Canon, Thẻ SD 32GB, Túi máy ảnh',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Canon EOS 750D Body (Cảm biến 24.2MP, tích hợp Wifi/NFC)',
    price: 6900000,
    originalPrice: 8200000,
    condition: 'Ngoại hình 98% - Bắn ảnh trực tiếp qua điện thoại trong 3 giây',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Nâng tầm chất lượng ảnh với cảm biến 24.2MP Hybrid CMOS AF III, kết nối không dây gửi ảnh trực tiếp lên Facebook/Instagram.',
    accessories: 'Pin zin LP-E17, Sạc Canon LC-E17, Dây đeo zin, Thẻ SD 32GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Canon EOS 200D II + Lens 18-55mm IS STM (Màu Trắng/Đen)',
    price: 11800000,
    originalPrice: 13500000,
    condition: 'Ngoại hình 99% Likenew - DSLR nhỏ nhẹ nhất thế giới',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Thiết kế thời trang, trọng lượng siêu nhẹ chỉ ~449g, quay video 4K, công nghệ Eye Detection AF bắt nét theo mắt sắc sảo.',
    accessories: 'Fullbox, Pin LP-E17 zin, Sạc zin, Dây đeo da theo máy, Thẻ 64GB',
    warranty: 'Bảo hành 06 tháng phần cứng',
  },
  {
    name: 'Canon EOS 100D White + Lens EF 40mm f2.8 STM White (Bộ đôi tiểu thư)',
    price: 6500000,
    originalPrice: 7800000,
    condition: 'Ngoại hình 98% - Phiên bản màu trắng ngọc trai siêu hiếm',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Dành riêng cho phái đẹp yêu thích phong cách ngọt ngào, tinh tế với thân máy màu trắng tuyết kết hợp ống kính Pancake siêu mỏng.',
    accessories: 'Pin, Sạc, Dây đeo trắng đồng bộ, Nắp lens, Thẻ nhớ 32GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Canon EOS RP Body (Full-frame Mirrorless Nhỏ Gọn)',
    price: 18500000,
    originalPrice: 21000000,
    condition: 'Ngoại hình 99% - Chụp chỉ 4k shot, cảm biến Full-frame 26.2MP',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Chiếc máy ảnh Mirrorless Full-frame bán chạy nhất của Canon nhờ sự nhỏ gọn tuyệt vời, màu ảnh nịnh mắt và ngàm RF tân tiến.',
    accessories: 'Pin LP-E17 zin, Sạc rời, Dây đeo EOS RP zin đỏ thêu nổi, Nắp body',
    warranty: 'Bảo hành 06 tháng phần cứng',
    featured: true,
  },
  {
    name: 'Canon EOS R Body (Full-frame Ngàm RF 30.3MP)',
    price: 26800000,
    originalPrice: 29500000,
    condition: 'Ngoại hình 98.5% - Kính ngắm EVF 3.69 triệu điểm cực nét',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Chiếc máy ảnh mở ra kỷ nguyên hệ ngàm Canon RF. Cảm biến 30.3MP lấy từ 5D Mark IV, lấy nét 5.655 điểm vị trí.',
    accessories: 'Pin LP-E6N zin, Sạc Canon LC-E6E, Dây đeo zin EOS R, Thẻ SD 64GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Canon EOS R6 Body (Quái vật chụp đêm & Chống rung 8 stop)',
    price: 38900000,
    originalPrice: 43000000,
    condition: 'Ngoại hình 99% - Chống rung IBIS 8 stop đỉnh nóc',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Công cụ làm việc mơ ước của nhiếp ảnh gia chuyên nghiệp. Lấy nét AI phát hiện người, động vật, xe cộ; chụp liên tục 20fps điện tử.',
    accessories: 'Pin zin LP-E6NH, Sạc zin, Dây đeo R6 zin, Cáp USB-C',
    warranty: 'Bảo hành 06 tháng phần cứng',
  },
  {
    name: 'Canon EOS R50 + Lens RF-S 18-45mm IS STM (Máy quay Tiktok đỉnh)',
    price: 15500000,
    originalPrice: 17200000,
    condition: 'Mới 100% Nguyên Hộp Chính Hãng Lê Bảo Minh',
    brand: 'Canon',
    category: 'may-anh-chinh-hang',
    deviceType: 'Mirrorless',
    description: 'Mẫu máy ảnh sinh viên và sáng tạo nội dung thế hệ mới của Canon. Video 4K 30p không crop từ 6K oversampling.',
    accessories: 'Nguyên hộp chính hãng Lê Bảo Minh, Phiếu bảo hành 24 tháng',
    warranty: 'Bảo hành chính hãng 24 tháng toàn quốc',
  },
  {
    name: 'Canon EOS R10 Body (Tốc độ chụp cơ học 15fps siêu tốc)',
    price: 17900000,
    originalPrice: 20000000,
    condition: 'Ngoại hình 99% Likenew - Lấy nét Dual Pixel II cực nhạy',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Dòng máy ảnh thể thao và hoang dã APS-C nhỏ gọn, bộ vi xử lý DIGIC X tương tự EOS R3.',
    accessories: 'Pin LP-E17 zin, Sạc zin, Dây đeo R10, Nắp che body',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Canon EOS M50 + Lens 15-45mm IS STM (Combo quốc dân cho Vlogger)',
    price: 9800000,
    originalPrice: 11500000,
    condition: 'Ngoại hình 98% - Màn hình xoay lật góc, quay video 4K',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Một trong những chiếc máy ảnh mirrorless nhỏ gọn thành công nhất lịch sử Canon dành cho các bạn trẻ làm sáng tạo nội dung.',
    accessories: 'Pin LP-E12 zin, Sạc zin, Dây đeo M50, Thẻ SD 32GB, Túi đựng máy',
    warranty: 'Bảo hành 06 tháng phần cứng',
    featured: true,
  },
  {
    name: 'Canon EOS M10 + Lens 15-45mm IS STM (Giá rẻ sinh viên)',
    price: 4900000,
    originalPrice: 5900000,
    condition: 'Ngoại hình 97% - Màn hình lật 180 độ selfie da trắng mịn',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Máy ảnh nhỏ gọn như điện thoại, hỗ trợ chế độ làm mịn da tự nhiên, kết nối Wifi chuyển ảnh sang điện thoại cực nhanh.',
    accessories: 'Pin zin LP-E12, Sạc, Cáp sạc, Dây đeo mini, Thẻ nhớ 16GB',
    warranty: 'Bảo hành 03 tháng',
  },
  {
    name: 'Canon PowerShot G7X Mark II (Máy ảnh Compact quay Vlog cao cấp)',
    price: 11500000,
    originalPrice: 13200000,
    condition: 'Ngoại hình 98% - Ống kính khẩu lớn f1.8-2.8 xóa phông mịt mù',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Máy ảnh compact được giới Beauty Blogger và Youtuber săn lùng nhiều nhất nhờ tông màu da tự nhiên và chống rung 5 trục.',
    accessories: 'Pin NB-13L zin, Sạc Canon CB-2LHE, Dây đeo cổ tay, Thẻ nhớ 64GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Canon PowerShot G7X Mark III (Hỗ trợ LiveStream Youtube trực tiếp)',
    price: 15200000,
    originalPrice: 17500000,
    condition: 'Ngoại hình 99% - Quay video 4K không crop, có cổng cắm micro',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Nâng cấp cảm biến xếp chồng 1.0 inch 20.1MP, cho phép quay video 4K không crop và phát trực tiếp Youtube qua kết nối Wifi.',
    accessories: 'Pin NB-13L, Củ sạc nhanh, Cáp USB-C, Dây đeo, Tặng kèm chân tripod để bàn',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Canon IXY 650 (Digital Camera phong cách Y2K hot trend)',
    price: 2800000,
    originalPrice: 3500000,
    condition: 'Ngoại hình 98% - Màu ảnh vintage hoài niệm, flash đánh cực ngầu',
    brand: 'Canon',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Mẫu máy ảnh kỹ thuật số Y2K compact cực hot trên Tiktok, zoom 12x, tích hợp Wifi chuyển ảnh sang điện thoại tức thì.',
    accessories: 'Pin, Sạc, Dây đeo cầm tay, Thẻ nhớ SD 8GB',
    warranty: 'Bảo hành 03 tháng',
  },

  // --- FUJIFILM (18 sản phẩm) ---
  {
    name: 'Fujifilm X-T20 + Lens XF 18-55mm F2.8-4 R LM OIS (Đen)',
    price: 14500000,
    originalPrice: 16800000,
    condition: 'Ngoại hình 98% - Hoạt động hoàn hảo, kính đẹp',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Fujifilm X-T20 mang kiểu dáng hoài cổ Film Vintage tuyệt đẹp. Màu film đặc trưng trứ danh của Fuji xuất trực tiếp không cần hậu kỳ.',
    accessories: 'Pin zin Fuji NP-W126S, Dock sạc chính hãng, Dây da vintage cao cấp, Nắp lens, Thẻ SD 64GB',
    warranty: 'Bảo hành 06 tháng phần cứng - Đổi trả trong 7 ngày',
    featured: true,
  },
  {
    name: 'Fujifilm X-T30 Body (Màu Charcoal Silver - Xám Than)',
    price: 15900000,
    originalPrice: 18000000,
    condition: 'Ngoại hình 99% - Cảm biến X-Trans CMOS 4 26.1MP',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Mệnh danh là "Quái thú tí hon" The Little Giant. Đầy đủ các giả lập màu phim đình đám Classic Chrome, Eterna, Acros.',
    accessories: 'Pin zin NP-W126S, Sạc type-C, Dây đeo zin Fujifilm, Nắp body',
    warranty: 'Bảo hành 06 tháng phần cứng',
    featured: true,
  },
  {
    name: 'Fujifilm X-T30 II Body (Đen / Bạc, Likenew)',
    price: 19800000,
    originalPrice: 22500000,
    condition: 'Ngoại hình 99.5% Likenew - Giả lập phim Classic Neg đỉnh cao',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Nâng cấp màn hình LCD 1.62 triệu điểm nét gấp đôi, thuật toán AF lấy từ X-T4 và giả lập màu film hoài niệm Classic Negative.',
    accessories: 'Fullbox, Pin zin, Cáp sạc, Dây đeo Fujifilm, Thẻ nhớ 64GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm X-T2 Body Black (Made in Japan nồi đồng cối đá)',
    price: 11500000,
    originalPrice: 13500000,
    condition: 'Ngoại hình 97% - Khung hợp kim Magie kháng nước bụi, Made in Japan',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Dòng máy ảnh flagship sản xuất tại Nhật Bản với độ bền bỉ đáng kinh ngạc, 2 khe cắm thẻ SD, màn hình lật 3 chiều độc đáo.',
    accessories: 'Pin zin, Sạc rời, Dây đeo, Nắp che body, Tặng kèm báng tay cầm Handgrip kim loại',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm X-T3 Body Silver (Bạc Cổ Điển, Chụp 8k shot)',
    price: 19500000,
    originalPrice: 22000000,
    condition: 'Ngoại hình 98% - Quay 4K 60fps 10-bit nội bộ cực kỳ mượt mà',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Chiếc máy ảnh hybrid đỉnh cao quay chụp của Fujifilm. Cảm biến X-Trans 4, màu da tự nhiên, hỗ trợ F-Log chuyên nghiệp.',
    accessories: 'Pin NP-W126S, Sạc đôi, Dây đeo Fujifilm, Thẻ 64GB 170MB/s',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm X-T4 Body Black (Chống rung cảm biến 6.5 stop)',
    price: 27500000,
    originalPrice: 30500000,
    condition: 'Ngoại hình 98.5% - Pin trâu NP-W235, màn hình xoay lật góc',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Tất cả những gì bạn cần: Chống rung 5 trục IBIS, pin dung lượng cao chụp 600 tấm, màn hình xoay lật và giả lập màu Bleach Bypass.',
    accessories: 'Pin NP-W235 zin, Củ sạc Type-C, Dây đeo zin X-T4, Nắp body',
    warranty: 'Bảo hành 06 tháng',
    featured: true,
  },
  {
    name: 'Fujifilm X-T5 Body Silver (Cảm biến 40.2 Megapixel Siêu Khủng)',
    price: 38500000,
    originalPrice: 42000000,
    condition: 'Ngoại hình 99.9% Likenew - Cảm biến X-Trans 5 HR 40.2MP',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Đỉnh cao nhiếp ảnh đường phố và phong cảnh của dòng X-T. Trở lại với màn hình nghiêng 3 hướng thuần chụp ảnh, tốc độ trập cơ học 1/8000s.',
    accessories: 'Fullbox như mới, Đầy đủ phụ kiện theo máy, Thẻ nhớ 128GB tốc độ cao',
    warranty: 'Bảo hành 12 tháng tại cửa hàng',
  },
  {
    name: 'Fujifilm X-S10 Body (Báng cầm công thái học, chống rung IBIS)',
    price: 19800000,
    originalPrice: 22000000,
    condition: 'Ngoại hình 98.5% - Báng cầm sâu cầm cực đã tay, chống rung 6 stop',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Thiết kế báng cầm sâu chắc chắn kiểu DSLR, tích hợp hệ thống chống rung 5 trục trong thân máy siêu nhỏ gọn.',
    accessories: 'Pin zin NP-W126S, Cáp Type-C, Dây đeo X-S10, Nắp body',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm X-S20 + Lens XC 15-45mm OIS PZ (Chính Hãng)',
    price: 31500000,
    originalPrice: 34500000,
    condition: 'Mới 100% Nguyên Hộp Chính Hãng Fujifilm Việt Nam',
    brand: 'Fujifilm',
    category: 'may-anh-chinh-hang',
    deviceType: 'Mirrorless',
    description: 'Pin NP-W235 chụp cả ngày, quay video 6.2K 30p mở rộng, chế độ Vlog riêng biệt hỗ trợ người sáng tạo video chuyên nghiệp.',
    accessories: 'Fullbox chính hãng, Thẻ nhớ 64GB Extreme Pro, Túi máy ảnh Fujifilm',
    warranty: 'Bảo hành chính hãng 24 tháng',
  },
  {
    name: 'Fujifilm X-E3 Body Silver (Thiết kế Rangefinder thanh lịch)',
    price: 12500000,
    originalPrice: 14500000,
    condition: 'Ngoại hình 97% - Thiết kế phẳng tối giản, có cần Joystick 8 hướng',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Phong cách máy đo sáng Rangefinder cổ điển, cực kỳ nhỏ gọn để dạo phố chụp ảnh đời thường Street Photography.',
    accessories: 'Pin zin Fuji, Sạc rời, Dây da thủ công màu nâu, Nắp body',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm X-E4 Body Black (Tối giản thanh lịch, siêu hiếm)',
    price: 24500000,
    originalPrice: 27000000,
    condition: 'Ngoại hình 99% - Thân máy phẳng lì tinh tế, màn hình lật 180 độ',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Mẫu máy ảnh được săn đón nhiều nhất với ngôn ngữ thiết kế tối giản đỉnh cao, mỏng nhẹ bỏ vừa túi áo khoác.',
    accessories: 'Pin NP-W126S, Cáp sạc, Dây đeo da, Nắp body kim loại',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm X-A5 + Lens XC 15-45mm OIS PZ (Màu Hồng Pastel)',
    price: 7200000,
    originalPrice: 8500000,
    condition: 'Ngoại hình 98% - Màn hình lật selfie, màu da trắng hồng nịnh mắt',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Dòng máy thời trang dành cho bạn nữ yêu thích du lịch và chụp ảnh sống ảo, tích hợp chế độ làm đẹp Portrait Enhancer.',
    accessories: 'Pin zin, Củ sạc, Cáp micro USB, Dây đeo da đồng bộ màu hồng, Thẻ nhớ 32GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm X-A7 + Lens XC 15-45mm OIS PZ (Bạc / Nâu da)',
    price: 10900000,
    originalPrice: 12500000,
    condition: 'Ngoại hình 99% - Màn hình cảm ứng 3.5 inch to đùng như iPhone',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Màn hình cảm ứng siêu lớn 3.5 inch độ sáng cao, giao diện điều khiển chạm thông minh trực quan như điện thoại.',
    accessories: 'Pin zin Fuji, Cáp sạc Type-C, Dây đeo thời trang, Thẻ nhớ 64GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm X-T100 + Lens XC 15-45mm (Màu Vàng Đồng Champagne Gold)',
    price: 8900000,
    originalPrice: 10500000,
    condition: 'Ngoại hình 98% - Kính ngắm điện tử EVF cổ điển, màu vàng sang trọng',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Mang trọn dáng vẻ hoài cổ của dòng X-T với mức giá cực kỳ phải chăng, kính ngắm EVF sắc nét chụp ngoài nắng không chói mắt.',
    accessories: 'Pin zin, Củ sạc, Dây đeo Fujifilm, Báng cầm gắn rời kèm máy',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm X-Pro2 Body (Kính ngắm quang học Hybrid độc nhất vô nhị)',
    price: 22500000,
    originalPrice: 25000000,
    condition: 'Ngoại hình 97% - Đẳng cấp nhiếp ảnh đường phố Rangefinder',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Chiếc máy ảnh đem lại cảm giác bấm máy thuần túy nhất với kính ngắm kép kết hợp quang học OVF và điện tử EVF.',
    accessories: 'Pin zin, Sạc rời, Dây đeo bản to, Nắp body',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm X100F (Màu Bạc Cổ Điển, Máy ảnh đường phố huyền thoại)',
    price: 24500000,
    originalPrice: 27500000,
    condition: 'Ngoại hình 98% - Ống kính tích hợp 23mm F2 sắc nét, vòng xoay ISO cơ',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Biểu tượng phong cách nhiếp ảnh đường phố thế giới. Vòng xoay chỉnh ISO cơ học lồng trong tốc độ trập mang hơi thở máy phim thập niên 70.',
    accessories: 'Pin zin NP-W126S, Sạc zin, Nắp kim loại zin, Dây da xịn, Thẻ 64GB',
    warranty: 'Bảo hành 06 tháng',
    featured: true,
  },
  {
    name: 'Fujifilm X100V Silver (Likenew - Cực hiếm)',
    price: 36500000,
    originalPrice: 39900000,
    condition: 'Ngoại hình 99.5% Likenew - Màn hình nghiêng cảm ứng, ống kính thế hệ II',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Cơn sốt máy ảnh toàn cầu không bao giờ hạ nhiệt. Vỏ nhôm nguyên khối anodized, ống kính 23mm F2 sắc nét từng góc mép.',
    accessories: 'Fullbox đầy đủ phụ kiện theo máy, tặng kèm Hood bảo vệ nhôm kim loại',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm FinePix Z30 (Máy ảnh Y2K trượt nắp độc lạ)',
    price: 1950000,
    originalPrice: 2500000,
    condition: 'Ngoại hình 96% - Thiết kế trượt nắp bảo vệ ống kính cực sành điệu',
    brand: 'Fujifilm',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Dòng máy ảnh số Y2K với thiết kế nắp trượt bo tròn độc đáo, màu ảnh mộng mơ hơi hướng phim tài liệu thập niên 2000.',
    accessories: 'Pin, Sạc, Dây đeo tay, Thẻ nhớ SD',
    warranty: 'Bảo hành 03 tháng',
  },

  // --- NIKON (14 sản phẩm) ---
  {
    name: 'Nikon D90 Body (Huyền thoại màu ảnh CCD/CMOS rực rỡ)',
    price: 2900000,
    originalPrice: 3800000,
    condition: 'Ngoại hình 95% - Cao su chắc tay, màn hình phụ còn hiển thị nét',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Chiếc DSLR bán chạy số 1 lịch sử của Nikon. Màu ảnh rực rỡ, độ tương phản cao đặc trưng cực kỳ hợp với phong cảnh và đời sống.',
    accessories: 'Pin EN-EL3e zin, Sạc Nikon MH-18a, Dây đeo Nikon vàng, Nắp body',
    warranty: 'Bảo hành 03 tháng phần cứng',
  },
  {
    name: 'Nikon D7000 Body (Chụp 15k shot, nồi đồng cối đá)',
    price: 4500000,
    originalPrice: 5600000,
    condition: 'Ngoại hình 97% - Khung hợp kim Magie chống chịu thời tiết, 2 khe SD',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Bán chuyên bền bỉ với 39 điểm lấy nét, hỗ trợ motor lấy nét trong thân máy tương thích toàn bộ ống kính ngàm Nikon F đời cũ.',
    accessories: 'Pin EN-EL15 zin, Sạc rời, Dây đeo Nikon D7000 vàng đen, Thẻ nhớ 32GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Nikon D7100 Body (Bỏ bộ lọc khử răng cưa cho độ nét gai góc)',
    price: 6800000,
    originalPrice: 8200000,
    condition: 'Ngoại hình 98% - Cảm biến 24.1MP cực nét, 51 điểm lấy nét Multi-CAM',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Chiếc máy ảnh đem lại độ nét đến từng sợi tóc nhờ loại bỏ kính lọc OLPF quang học. 51 điểm lấy nét chuyên nghiệp bắt chuyển động siêu dính.',
    accessories: 'Pin zin EN-EL15, Sạc zin Nikon, Dây đeo, Nắp che body',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Nikon D7200 Body (Wifi tích hợp, dải Dynamic Range cực rộng)',
    price: 9800000,
    originalPrice: 11500000,
    condition: 'Ngoại hình 98.5% - Bộ nhớ đệm chụp liên tục 100 tấm, kết nối Wifi',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Chiếc máy ảnh DSLR crop hoàn hảo nhất của Nikon với dải dynamic range lên tới gần 15 EV, cứu sáng vùng tối không hề bị nhiễu hạt.',
    accessories: 'Pin zin EN-EL15, Sạc zin, Dây đeo D7200, Nắp body, Thẻ SD 32GB',
    warranty: 'Bảo hành 06 tháng',
    featured: true,
  },
  {
    name: 'Nikon D750 Body (Full-frame toàn năng cho thợ dịch vụ)',
    price: 15500000,
    originalPrice: 17800000,
    condition: 'Ngoại hình 98% - Màn hình lật góc nghiêng, chụp 14k shot',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Cỗ máy cày tiền số 1 cho các studio ảnh cưới và sự kiện. Cảm biến Full-frame 24.3MP, khử nhiễu ISO cực tốt và dải động vô đối.',
    accessories: 'Pin EN-EL15 zin, Sạc nhanh Nikon, Dây đeo D750 viền vàng, Thẻ nhớ 64GB',
    warranty: 'Bảo hành 06 tháng phần cứng',
    featured: true,
  },
  {
    name: 'Nikon D610 Body (Full-frame giá rẻ đáng mua nhất)',
    price: 10500000,
    originalPrice: 12500000,
    condition: 'Ngoại hình 97% - Sensor sạch không dầu, chụp 18k shot',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Trải nghiệm chất lượng ảnh Full-frame đỉnh cao với mức giá chỉ ngang máy crop. 2 khe thẻ nhớ, tốc độ chụp 6fps.',
    accessories: 'Pin zin, Sạc zin, Dây đeo máy, Nắp che body',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Nikon D5300 + Lens Kit 18-55mm VR II (Wifi + GPS tích hợp)',
    price: 5800000,
    originalPrice: 7000000,
    condition: 'Ngoại hình 98% - Màn hình xoay lật góc tự do 360 độ',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Chiếc máy ảnh gia đình và du lịch tuyệt vời với màn hình xoay lật đa góc, chia sẻ ảnh tức thì qua Wifi về smartphone.',
    accessories: 'Pin EN-EL14a, Sạc rời, Dây đeo Nikon vàng đen, Thẻ nhớ 32GB, Túi máy ảnh',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Nikon D3400 + Lens Kit 18-55mm AF-P VR (Pin chụp 1200 tấm)',
    price: 4900000,
    originalPrice: 6000000,
    condition: 'Ngoại hình 98% - Ống kính công nghệ AF-P bước xung lấy nét câm lặng',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'DSLR',
    description: 'Nhỏ nhẹ, thời lượng pin siêu trâu chụp cả tuần đi du lịch không lo sạc, kết nối SnapBridge Bluetooth đồng bộ ảnh nền.',
    accessories: 'Pin, Sạc, Dây đeo, Nắp lens, Thẻ SD 16GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Nikon Z fc Body Silver (Thiết kế Vintage Film FM2 bất hủ)',
    price: 18500000,
    originalPrice: 21000000,
    condition: 'Ngoại hình 99.5% Likenew - Các núm xoay kim loại chạm khắc tinh xảo',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Tái sinh thiết kế máy cơ huyền thoại Nikon FM2 kết hợp công nghệ ngàm Z tối tân nhất. Màn hình xoay lật cảm ứng và Eye AF.',
    accessories: 'Fullbox như mới, Pin EN-EL25 zin, Sạc zin, Dây đeo da hoài cổ, Nắp che body',
    warranty: 'Bảo hành 06 tháng phần cứng',
    featured: true,
  },
  {
    name: 'Nikon Z fc Special Edition Mint Green (Bản Giới Hạn Xanh Mint)',
    price: 19800000,
    originalPrice: 22500000,
    condition: 'Ngoại hình 99.9% Likenew - Màu da bọc xanh Mint cực hiếm và cá tính',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Phiên bản da bọc màu xanh Mint trẻ trung thanh lịch, thu hút mọi ánh nhìn khi dạo phố hay ngồi quán cà phê.',
    accessories: 'Fullbox, Pin, Sạc, Dây đeo thời trang, Thẻ nhớ 64GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Nikon Z50 + Lens Z DX 16-50mm VR (Siêu Nhỏ Gọn)',
    price: 15200000,
    originalPrice: 17500000,
    condition: 'Ngoại hình 98.5% - Báng cầm cực êm tay, chống rung quang học',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Thân máy công thái học tốt nhất trong phân khúc máy ảnh không gương lật nhỏ gọn, đem lại cảm giác cầm nắm chắc chắn tuyệt đối.',
    accessories: 'Pin zin EN-EL25, Sạc, Cáp USB, Dây đeo Nikon Z, Thẻ nhớ 32GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Nikon Z5 Body (Mirrorless Full-frame 2 khe thẻ nhớ)',
    price: 21500000,
    originalPrice: 24000000,
    condition: 'Ngoại hình 99% - Chống rung 5 trục IBIS, 2 khe SD UHS-II',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Máy ảnh Full-frame nhập môn có cấu hình đỉnh nhất: 2 khe thẻ nhớ kép an toàn, chống rung cảm biến 5 trục và kính ngắm EVF xuất sắc.',
    accessories: 'Pin zin EN-EL15c thế hệ mới, Cáp USB Type-C, Dây đeo Z5 zin, Nắp body',
    warranty: 'Bảo hành 06 tháng phần cứng',
  },
  {
    name: 'Nikon Z6 Body (Quay video chuyên nghiệp ProRes RAW)',
    price: 22800000,
    originalPrice: 25500000,
    condition: 'Ngoại hình 98% - Cảm biến BSI CMOS 24.5MP chụp đêm cực đỉnh',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Được trang bị ngàm Z đường kính khổng lồ cho khả năng thu sáng tối ưu, cảm biến chiếu sáng sau khử nhiễu ISO cao ấn tượng.',
    accessories: 'Pin EN-EL15b zin, Sạc, Dây đeo Nikon Z6, Tặng kèm thẻ nhớ XQD 64GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Nikon Coolpix S3300 (Máy ảnh kỹ thuật số Y2K thời trang)',
    price: 1650000,
    originalPrice: 2200000,
    condition: 'Ngoại hình 97% - Thiết kế mỏng mảnh, màu ảnh hoài cổ',
    brand: 'Nikon',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Dòng máy ảnh số nhỏ gọn xinh xắn tiện bỏ túi quần, tạo ra chất ảnh flash đánh đêm cực kỳ nghệ thuật chuẩn phong cách 2000s.',
    accessories: 'Pin, Cáp sạc, Dây đeo tay, Thẻ nhớ 8GB',
    warranty: 'Bảo hành 03 tháng',
  },

  // --- LUMIX / PANASONIC (6 sản phẩm) ---
  {
    name: 'Panasonic Lumix G7 + Lens 14-42mm OIS (Quay 4K giá sinh viên)',
    price: 7500000,
    originalPrice: 8900000,
    condition: 'Ngoại hình 98% - Màn hình xoay lật 360 độ, quay video 4K sắc nét',
    brand: 'Lumix',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Mẫu máy ảnh quay phim 4K giá rẻ tốt nhất cho các bạn sáng tạo nội dung Youtube học tập và làm việc.',
    accessories: 'Pin zin Panasonic, Sạc rời, Dây đeo, Nắp lens, Thẻ SD 32GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Panasonic Lumix G85 Body (Chống rung kép Dual I.S. 2 đỉnh cao)',
    price: 9200000,
    originalPrice: 10800000,
    condition: 'Ngoại hình 98% - Khung hợp kim Magie kháng nước văng bụi bẩn',
    brand: 'Lumix',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Hệ thống chống rung 5 trục kết hợp chống rung lens Dual I.S. 2 giúp bạn quay video cầm tay mượt như dùng gimbal.',
    accessories: 'Pin zin, Sạc rời, Dây đeo Lumix, Nắp che body, Thẻ 64GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Panasonic Lumix GH5 Body (Quái vật làm phim điện ảnh 4K 60p 10-bit)',
    price: 17500000,
    originalPrice: 20000000,
    condition: 'Ngoại hình 97% - Quay không giới hạn thời gian, không bao giờ quá nhiệt',
    brand: 'Lumix',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Huyền thoại làm phim của giới đạo diễn độc lập. Hỗ trợ quay 4:2:2 10-bit All-Intra 400Mbps, 2 khe thẻ nhớ và cổng HDMI full-size.',
    accessories: 'Pin zin Panasonic, Sạc zin, Dây đeo GH5, Thẻ nhớ SanDisk 128GB',
    warranty: 'Bảo hành 06 tháng phần cứng',
  },
  {
    name: 'Panasonic Lumix GX85 + Lens Kit 12-32mm OIS (Siêu Nhỏ Gọn)',
    price: 9500000,
    originalPrice: 11000000,
    condition: 'Ngoại hình 98.5% - Thiết kế vuông vức Rangefinder, chống rung 5 trục',
    brand: 'Lumix',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Chiếc máy ảnh dạo phố hoàn hảo kết hợp cảm biến không bộ lọc khử răng cưa và ống kính bánh kếp pancake gấp gọn bỏ túi áo.',
    accessories: 'Pin zin, Cáp sạc micro-USB, Dây đeo cổ tay, Thẻ nhớ 32GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Panasonic Lumix LX100 Mark II (Compact Ống kính Leica f1.7-2.8)',
    price: 14800000,
    originalPrice: 17000000,
    condition: 'Ngoại hình 98% - Cảm biến Four Thirds lớn, ống kính Leica DC Vario-Summilux',
    brand: 'Lumix',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Chiếc máy ảnh compact cao cấp mang chất lượng ống kính quang học Leica danh giá với vòng xoay khẩu độ cơ học trên thân ống kính.',
    accessories: 'Pin zin, Nắp lens tự động đóng mở, Dây da, Thẻ nhớ 64GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Panasonic Lumix S5 Body (Full-frame Ngàm L cao cấp)',
    price: 24900000,
    originalPrice: 28000000,
    condition: 'Ngoại hình 98.5% - Dual Native ISO quay đêm trong trẻo',
    brand: 'Lumix',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Sức mạnh Full-frame nhỏ gọn thuộc liên minh ngàm L (Leica, Sigma, Panasonic), V-Log đầy đủ 14+ stops dải nhạy sáng dynamic range.',
    accessories: 'Pin zin, Sạc nhanh, Dây đeo Lumix S, Nắp body',
    warranty: 'Bảo hành 06 tháng phần cứng',
  },

  // --- OLYMPUS / OM SYSTEM (5 sản phẩm) ---
  {
    name: 'Olympus OM-D E-M10 Mark II + Lens 14-42mm EZ (Màu Bạc Cổ Điển)',
    price: 8800000,
    originalPrice: 10200000,
    condition: 'Ngoại hình 98.5% - Thân kim loại tinh xảo, chống rung 5 trục',
    brand: 'Olympus',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Vẻ đẹp vượt thời gian với các núm xoay kim loại cắt vân kim cương, hệ thống chống rung 5 trục trứ danh của Olympus.',
    accessories: 'Pin zin Olympus, Sạc rời, Dây da phong cách retro, Nắp lens, Thẻ SD 32GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Olympus OM-D E-M10 Mark III Body (Màu Bạc / Đen)',
    price: 10500000,
    originalPrice: 12200000,
    condition: 'Ngoại hình 99% - Quay 4K, báng cầm cải tiến ôm tay hơn',
    brand: 'Olympus',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Nâng cấp chip xử lý hình ảnh TruePic VIII, giao diện menu trực quan hóa dễ dùng cho người mới bước chân vào thế giới máy ảnh.',
    accessories: 'Pin zin BLS-50, Sạc zin, Dây đeo Olympus, Nắp body, Thẻ 64GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Olympus OM-D E-M5 Mark II Body Black (Kháng thời tiết chuẩn Pro)',
    price: 10900000,
    originalPrice: 12800000,
    condition: 'Ngoại hình 97% - Màn hình xoay lật góc, chụp ghép độ phân giải cao 40MP',
    brand: 'Olympus',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Độ bền tiêu chuẩn quân đội, chống chịu bụi bẩn, đóng băng ở -10 độ C và màn trập siêu êm không rung máy.',
    accessories: 'Pin zin, Sạc zin, Dây đeo, Nắp body kim loại',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Olympus PEN E-PL8 + Lens 14-42mm EZ (Màu Trắng Viền Vàng)',
    price: 8200000,
    originalPrice: 9600000,
    condition: 'Ngoại hình 98% - Thời trang sành điệu như phụ kiện trang sức',
    brand: 'Olympus',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Dòng máy ảnh thiết kế riêng cho phái đẹp với chất liệu da cao cấp, màn hình lật úp ngược chuyên dụng để chụp selfie góc đẹp nhất.',
    accessories: 'Pin zin, Sạc, Flash cóc nhỏ gắn rời, Dây đeo da, Thẻ SD 32GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Olympus PEN-F Body (Siêu phẩm thiết kế hoài cổ Rangefinder cao cấp)',
    price: 25500000,
    originalPrice: 28500000,
    condition: 'Ngoại hình 98% - Núm xoay Creative Dial phía trước cực độc đáo',
    brand: 'Olympus',
    category: 'may-anh-cu',
    deviceType: 'Mirrorless',
    description: 'Chiếc máy ảnh được đánh giá có thiết kế tinh xảo nhất mọi thời đại. Từng con ốc và đường rãnh kim loại đều toát lên đẳng cấp nghệ thuật.',
    accessories: 'Fullbox sưu tầm, Pin zin, Sạc zin, Flash cóc Olympus, Dây đeo da',
    warranty: 'Bảo hành 06 tháng',
  },

  // --- RICOH & CASIO (6 sản phẩm) ---
  {
    name: 'Ricoh GR II (Huyền thoại nhiếp ảnh đường phố Snapshot)',
    price: 15800000,
    originalPrice: 18000000,
    condition: 'Ngoại hình 97% - Chế độ màu Positive Film trứ danh',
    brand: 'Ricoh',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Biểu tượng của các nhiếp ảnh gia đường phố toàn cầu. Nút chụp lấy nét Snap Focus chụp ngay tức khắc chỉ trong tích tắc 0.1 giây.',
    accessories: 'Pin zin Ricoh DB-65, Củ sạc, Cáp USB, Dây đeo ngón tay',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Ricoh GR III (GR3) Bản Tiêu Chuẩn 28mm f2.8',
    price: 23500000,
    originalPrice: 26000000,
    condition: 'Ngoại hình 99% - Chống rung cảm biến 3 trục, cảm ứng vuốt chạm',
    brand: 'Ricoh',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Đưa cảm biến APS-C 24.2MP vào chiếc máy ảnh nằm gọn trong lòng bàn tay. Giả lập màu Negative Film đẹp say đắm lòng người.',
    accessories: 'Fullbox trùng imei, Pin DB-110 zin, Cáp sạc Type-C, Dây đeo cổ tay',
    warranty: 'Bảo hành 06 tháng',
    featured: true,
  },
  {
    name: 'Ricoh GR IIIx (GR3x) Tiêu cự 40mm f2.8 chân dung đường phố',
    price: 25900000,
    originalPrice: 28500000,
    condition: 'Ngoại hình 99.5% Likenew - Góc nhìn 40mm tự nhiên như mắt người',
    brand: 'Ricoh',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Tiêu cự 40mm đem lại góc nhìn cận cảnh sâu sắc hơn cho ảnh chân dung, phóng sự cuộc sống và tĩnh vật đường phố.',
    accessories: 'Fullbox, Pin zin, Cáp sạc, Vòng ring ring-cap màu xanh kim loại, Thẻ 64GB',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Casio Exilim EX-ZR1500 (Máy ảnh thần thánh selfie da mịn)',
    price: 2950000,
    originalPrice: 3800000,
    condition: 'Ngoại hình 98% - Màn hình lật 180 độ, chụp vẫy tay Motion Shutter',
    brand: 'Casio',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Dòng máy ảnh selfie da trắng hồng mịn màng tự nhiên mà không app điện thoại nào có thể bắt chước được.',
    accessories: 'Pin zin Casio, Sạc dây, Dây đeo máy, Thẻ nhớ SD 16GB',
    warranty: 'Bảo hành 03 tháng',
  },
  {
    name: 'Casio Exilim EX-ZR3500 (Tích hợp Wifi & Bluetooth bắn ảnh tự động)',
    price: 3600000,
    originalPrice: 4500000,
    condition: 'Ngoại hình 98% - Tự động gửi ảnh về điện thoại ngay sau khi bấm chụp',
    brand: 'Casio',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Nâng cấp cảm biến 1/1.7 inch cho khả năng chụp đêm sáng rõ hơn, tính năng Auto Send ảnh sang smartphone qua Bluetooth cực nhạy.',
    accessories: 'Pin zin, Cáp sạc, Dây đeo thời trang, Thẻ nhớ 16GB',
    warranty: 'Bảo hành 03 tháng',
  },
  {
    name: 'Casio Exilim EX-ZR5000 (Góc siêu rộng 19mm chụp cả nhóm đông)',
    price: 4500000,
    originalPrice: 5500000,
    condition: 'Ngoại hình 98.5% - Ống kính góc rộng nhất thế giới 19mm',
    brand: 'Casio',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Góc siêu rộng 19mm giúp chụp ảnh nhóm lấy trọn vẹn cả phong cảnh phía sau mà khuôn mặt vẫn thon gọn và tôn dáng.',
    accessories: 'Pin, Cáp sạc, Dây đeo, Thẻ SD 32GB',
    warranty: 'Bảo hành 03 tháng',
  },

  // --- LEICA (2 sản phẩm) ---
  {
    name: 'Leica D-Lux Typ 109 (Chấm đỏ danh giá, chất ảnh Leica thuần khiết)',
    price: 15500000,
    originalPrice: 18000000,
    condition: 'Ngoại hình 98% - Ống kính Leica DC Vario-Summilux f1.7-2.8 danh tiếng',
    brand: 'Leica',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Sở hữu chiếc máy ảnh thương hiệu chấm đỏ danh giá nhất thế giới với mức giá dễ tiếp cận. Thấu kính cao cấp mang lại độ tương phản màu sắc đậm chất Đức.',
    accessories: 'Pin zin Leica, Sạc zin, Dây da đeo cổ Leica, Flash cóc Leica CF D',
    warranty: 'Bảo hành 06 tháng phần cứng',
  },
  {
    name: 'Leica D-Lux 7 (Màu Đen / Bạc, Cảm biến M4/3 17MP)',
    price: 28900000,
    originalPrice: 32000000,
    condition: 'Ngoại hình 99% Likenew - Đầy đủ hộp sổ phụ kiện Leica sang trọng',
    brand: 'Leica',
    category: 'may-anh-cu',
    deviceType: 'Compact',
    description: 'Nâng cấp cổng sạc USB, màn hình cảm ứng độ nét cao và kết nối ứng dụng Leica FOTOS chuyển ảnh chất lượng cao sang iPhone.',
    accessories: 'Fullbox trùng imei, Pin zin Leica, Củ sạc, Cáp USB, Flash Leica',
    warranty: 'Bảo hành 06 tháng',
  },

  // --- ỐNG KÍNH / LENS (15 sản phẩm) ---
  {
    name: 'Canon EF 50mm f/1.8 STM (Ống kính xóa phông chân dung quốc dân)',
    price: 2400000,
    originalPrice: 2900000,
    condition: 'Ngoại hình 99% - Kính trong vắt, không mốc xước, mô-tơ lấy nét STM êm ru',
    brand: 'Canon',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Ống kính bắt buộc phải có cho mọi người dùng Canon. Khẩu độ lớn f/1.8 cho phép xóa mờ hậu cảnh lung linh và chụp thiếu sáng tuyệt vời.',
    accessories: 'Nắp trước & nắp sau zin Canon, Tặng kèm kính lọc filter bảo vệ UV',
    warranty: 'Bảo hành 06 tháng phần cứng',
    featured: true,
  },
  {
    name: 'Canon EF-S 18-135mm f/3.5-5.6 IS STM (Ống kính du lịch đa dụng)',
    price: 4500000,
    originalPrice: 5500000,
    condition: 'Ngoại hình 98% - Chống rung quang học 4 stop, dải zoom tiện lợi',
    brand: 'Canon',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Ống kính "một cho tất cả" từ chụp phong cảnh góc rộng đến bắt cận cảnh từ xa mà không cần thay đổi ống kính khi đi phượt.',
    accessories: 'Nắp trước sau, Loa che nắng hood hoa sen che nắng',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Canon EF 24-105mm f/4L IS USM (Viền Đỏ Cao Cấp Dòng L)',
    price: 8900000,
    originalPrice: 10500000,
    condition: 'Ngoại hình 97% - Thấu kính dòng L cao cấp, lấy nét USM siêu tốc',
    brand: 'Canon',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Đẳng cấp viền đỏ Luxury của Canon với thấu kính tráng phủ Fluorite chống lóa quang học, vỏ kim loại chống chịu thời tiết khắc nghiệt.',
    accessories: 'Nắp zin Canon, Hood zin EW-83H, Túi da nhung đựng lens',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Canon RF 50mm f/1.8 STM (Dành cho dòng máy ngàm Canon R)',
    price: 4200000,
    originalPrice: 4900000,
    condition: 'Mới 100% Nguyên Hộp Chính Hãng Lê Bảo Minh',
    brand: 'Canon',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Thiết kế riêng cho hệ thống ngàm Canon RF (EOS R, RP, R6, R50...), trang bị thêm vòng xoay tùy chỉnh chức năng trên thân ống kính.',
    accessories: 'Nguyên hộp chính hãng, Nắp trước sau, Phiếu bảo hành',
    warranty: 'Bảo hành chính hãng 12 tháng',
  },
  {
    name: 'Sony FE 50mm f/1.8 (Ống kính chân dung cho máy Sony Full-frame & Crop)',
    price: 4200000,
    originalPrice: 5000000,
    condition: 'Ngoại hình 99% - Kính đẹp không tì vết, lấy nét nhanh',
    brand: 'Sony',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Ống kính tiêu cự 50mm nhỏ nhẹ khẩu lớn f/1.8 dành cho cả máy ảnh Sony Full-frame và APS-C xóa phông cực đẹp.',
    accessories: 'Nắp trước sau zin, Hood che sáng zin, Kính lọc Marumi UV',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Sony E 35mm f/1.8 OSS (Có chống rung quang học tích hợp)',
    price: 6500000,
    originalPrice: 7800000,
    condition: 'Ngoại hình 98.5% - Kính trong vắt, vỏ kim loại chắc chắn',
    brand: 'Sony',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Ống kính tiêu cự vàng cho máy crop Sony (A6000, A6400, ZV-E10). Tích hợp chống rung quang học OSS giúp quay video lia máy mượt mà.',
    accessories: 'Nắp trước sau, Hood che nắng, Kính lọc UV bảo vệ',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Sony FE 85mm f/1.8 (Sát thủ chân dung ngoại cảnh Full-frame)',
    price: 9500000,
    originalPrice: 11200000,
    condition: 'Ngoại hình 99% - Bokeh tròn xoe lung linh, nét căng đét ở f1.8',
    brand: 'Sony',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Ống kính chân dung được đánh giá tỷ lệ hiệu năng trên giá thành (P/P) tốt nhất hệ máy Sony. Nét ngay từ khẩu lớn nhất f/1.8.',
    accessories: 'Fullbox, Nắp trước sau, Hood hoa sen zin',
    warranty: 'Bảo hành 06 tháng',
    featured: true,
  },
  {
    name: 'Sony E PZ 18-105mm f/4 G OSS (Ống kính G zoom điện tử quay phim)',
    price: 9800000,
    originalPrice: 11500000,
    condition: 'Ngoại hình 98% - Dòng lens G cao cấp, 1 khẩu F4 toàn dải',
    brand: 'Sony',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Cần gạt zoom điện tử Power Zoom cực kỳ mượt mà, chiều dài ống kính không thay đổi khi zoom, vô cùng lý tưởng khi gắn trên Gimbal.',
    accessories: 'Nắp trước, nắp sau, Hood che nắng zin hình cánh hoa',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Sigma 30mm f/1.4 DC DN Contemporary (Ngàm Sony E)',
    price: 5600000,
    originalPrice: 6800000,
    condition: 'Ngoại hình 99% - Khẩu độ khủng f1.4 chụp đêm cực kỳ ấn tượng',
    brand: 'Sigma',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Ống kính làm mưa làm gió phân khúc ngàm E. Khẩu siêu lớn f1.4 cho độ nét gai góc và hiệu ứng xóa mờ phông nền đỉnh chóp.',
    accessories: 'Fullbox trùng seri, Nắp trước sau Sigma, Hood zin',
    warranty: 'Bảo hành 06 tháng',
    featured: true,
  },
  {
    name: 'Sigma 16mm f/1.4 DC DN Contemporary (Ngàm Fujifilm X)',
    price: 7600000,
    originalPrice: 8900000,
    condition: 'Ngoại hình 99% - Góc rộng khẩu f1.4 quay Vlog và phong cảnh đêm',
    brand: 'Sigma',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Sự kết hợp hoàn hảo giữa góc rộng tương đương 24mm và khẩu độ f/1.4. Dành cho người chụp phong cảnh Milkyway và quay Vlog trong nhà thiếu sáng.',
    accessories: 'Hộp, Nắp trước, nắp sau, Hood zin, Thẻ bảo hành',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm XF 35mm f/1.4 R (Ống kính ma thuật trứ danh Fuji)',
    price: 8900000,
    originalPrice: 10500000,
    condition: 'Ngoại hình 98% - Vỏ kim loại sang trọng, hiệu ứng bokeh độc bản',
    brand: 'Fujifilm',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Mệnh danh là "The Magic Lens". Tái tạo tông màu và độ chuyển vùng nét sang vùng mờ mượt mà đầy chất thơ máy phim.',
    accessories: 'Nắp trước kim loại vuông độc đáo, Hood kim loại zin, Nắp sau',
    warranty: 'Bảo hành 06 tháng',
    featured: true,
  },
  {
    name: 'Fujifilm XF 18-55mm f/2.8-4 R LM OIS (Lens Kit Đỉnh Cao)',
    price: 6500000,
    originalPrice: 7900000,
    condition: 'Ngoại hình 98.5% - Kính đẹp xuất sắc, chống rung 4 stop',
    brand: 'Fujifilm',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Khác biệt hoàn toàn với các ống kit nhựa thông thường: Thân kim loại nguyên khối, thấu kính phi cầu và motor lấy nét tuyến tính siêu êm.',
    accessories: 'Nắp trước sau zin Fuji, Hood che nắng hoa sen',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Fujifilm XC 35mm f/2 (Ống kính nhỏ nhẹ giá sinh viên)',
    price: 4100000,
    originalPrice: 4800000,
    condition: 'Mới 100% Nguyên Hộp Chính Hãng Fujifilm',
    brand: 'Fujifilm',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Chất lượng quang học tương đương bản XF 35mm f/2 đắt tiền trong thân vỏ siêu nhẹ chỉ 130g, lấy nét cực nhanh chỉ trong 0.08 giây.',
    accessories: 'Nguyên hộp chính hãng, Nắp lens, Phiếu bảo hành 12 tháng',
    warranty: 'Bảo hành chính hãng 12 tháng',
  },
  {
    name: 'Tamron 17-70mm f/2.8 Di III-A VC RXD (Dành cho Sony APS-C)',
    price: 13900000,
    originalPrice: 16000000,
    condition: 'Ngoại hình 99% - 1 khẩu f2.8 toàn dải từ 17mm đến 70mm, có chống rung VC',
    brand: 'Tamron',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Ống kính zoom tiêu chuẩn khẩu lớn tốt nhất cho dòng máy Sony APS-C. Dải tiêu cự đa dụng tương đương 25.5-105mm xóa phông mọi tiêu cự.',
    accessories: 'Fullbox, Nắp trước sau Tamron, Hood che nắng zin',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Tamron 28-75mm f/2.8 Di III VXD G2 (Dành cho Sony Full-frame)',
    price: 16800000,
    originalPrice: 19500000,
    condition: 'Ngoại hình 99% Likenew - Thế hệ G2 nâng cấp thấu kính siêu nét',
    brand: 'Tamron',
    category: 'ong-kinh',
    deviceType: 'Lens',
    description: 'Ống kính zoom f/2.8 được tin dùng số 1 của các thợ chụp dịch vụ đám cưới nhờ kích thước nhỏ gọn và độ nét vượt trội toàn khung hình.',
    accessories: 'Fullbox đầy đủ phụ kiện theo lens',
    warranty: 'Bảo hành 06 tháng',
  },

  // --- PHỤ KIỆN (12 sản phẩm) ---
  {
    name: 'Bộ 2 Pin Kingma + Dock Sạc Đôi LCD cho Sony FW50 (A6000, A6300, A6400, A7II)',
    price: 520000,
    originalPrice: 650000,
    condition: 'Mới 100% Nguyên Hộp - Dung lượng 1080mAh chuẩn',
    brand: 'Kingma',
    category: 'phu-kien',
    deviceType: 'Accessory',
    description: 'Combo giải cứu nỗi lo hết pin khi tác nghiệp. Màn hình LCD hiển thị chính xác % pin từng khe sạc, hỗ trợ nguồn sạc Type-C và Micro-USB.',
    accessories: '2 Viên pin Kingma FW50 + 1 Dock sạc đôi LCD thông minh + 1 Cáp sạc Type-C',
    warranty: 'Bảo hành 12 tháng lỗi 1 đổi 1',
  },
  {
    name: 'Bộ 2 Pin Kingma + Dock Sạc Đôi LCD cho Sony FZ100 (A7III, A7IV, A7C, FX3)',
    price: 850000,
    originalPrice: 1050000,
    condition: 'Mới 100% Nguyên Hộp - Dung lượng cao 2280mAh chuẩn zin',
    brand: 'Kingma',
    category: 'phu-kien',
    deviceType: 'Accessory',
    description: 'Pin Kingma FZ100 chip thế hệ mới không báo lỗi trên thân máy Sony đời cao, thời lượng chụp liên tục lên tới hơn 700 bức ảnh.',
    accessories: '2 Pin FZ100 Kingma + 1 Dock sạc đôi màn hình LCD + Cáp sạc',
    warranty: 'Bảo hành 12 tháng lỗi 1 đổi 1',
  },
  {
    name: 'Bộ 2 Pin Kingma + Dock Sạc Đôi LCD cho Fujifilm NP-W126S (X-T20, X-T30, X-T3)',
    price: 580000,
    originalPrice: 720000,
    condition: 'Mới 100% Nguyên Hộp - Chống phù pin, ổn định dòng điện',
    brand: 'Kingma',
    category: 'phu-kien',
    deviceType: 'Accessory',
    description: 'Chuẩn pin W126S tương thích hoàn toàn cho tất cả các máy ảnh Fujifilm dòng X-T, X-E, X-Pro không bị nóng máy.',
    accessories: '2 Pin NP-W126S Kingma + 1 Dock sạc đôi LCD + Cáp sạc',
    warranty: 'Bảo hành 12 tháng lỗi 1 đổi 1',
  },
  {
    name: 'Thẻ Nhớ SanDisk Extreme Pro SDXC 64GB 200MB/s V30 U3 (Quay 4K)',
    price: 380000,
    originalPrice: 490000,
    condition: 'Mới 100% Nguyên Vỉ Chính Hãng Vĩnh Xuân / Diệp Khánh',
    brand: 'SanDisk',
    category: 'phu-kien',
    deviceType: 'Accessory',
    description: 'Thẻ nhớ chuyên dụng cho máy ảnh quay video 4K UHD và chụp liên tục tốc độ cao. Tốc độ đọc lên tới 200MB/s, ghi 90MB/s.',
    accessories: 'Nguyên vỉ niêm phong',
    warranty: 'Bảo hành 5 năm 1 đổi 1',
  },
  {
    name: 'Thẻ Nhớ SanDisk Extreme Pro SDXC 128GB 200MB/s V30 U3 A2',
    price: 650000,
    originalPrice: 850000,
    condition: 'Mới 100% Nguyên Vỉ Chính Hãng',
    brand: 'SanDisk',
    category: 'phu-kien',
    deviceType: 'Accessory',
    description: 'Dung lượng lớn 128GB lưu trữ thoải mái hơn 10.000 ảnh RAW chất lượng cao hoặc hơn 4 giờ video 4K sắc nét.',
    accessories: 'Nguyên vỉ niêm phong chính hãng',
    warranty: 'Bảo hành 5 năm 1 đổi 1',
  },
  {
    name: 'Chân Máy Ảnh Beike Q999H Đa Năng (Trục Ngang Quay Top-down)',
    price: 1550000,
    originalPrice: 1950000,
    condition: 'Mới 100% Nguyên Hộp - Hợp kim nhôm Magie tải trọng 10kg',
    brand: 'Beike',
    category: 'phu-kien',
    deviceType: 'Accessory',
    description: 'Tripod quốc dân có khả năng bẻ trục ngang 90 độ chuyên dụng quay video nấu ăn, đập hộp sản phẩm từ trên xuống (top-down view). Có thể tháo rời làm gậy Monopod.',
    accessories: 'Fullbox kèm túi đeo bảo vệ cao cấp, đầu Ballhead xoay 360 độ Panorama',
    warranty: 'Bảo hành 12 tháng',
    featured: true,
  },
  {
    name: 'Chân Máy Ảnh Mini Để Bàn Ulanzi MT-16 (Kèm Ngàm Kẹp Điện Thoại & Khe Gắn Mic)',
    price: 290000,
    originalPrice: 380000,
    condition: 'Mới 100% Nguyên Hộp - Nhỏ gọn bỏ túi du lịch',
    brand: 'Ulanzi',
    category: 'phu-kien',
    deviceType: 'Accessory',
    description: 'Chân tripod mini kéo dài kiêm gậy cầm tay tiện lợi cho máy ảnh compact và mirrorless làm Vlog mọi lúc mọi nơi.',
    accessories: 'Nguyên hộp Ulanzi chính hãng',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Balo Máy Ảnh Chuyên Nghiệp Caden K1 Chống Nước Chống Sốc',
    price: 690000,
    originalPrice: 890000,
    condition: 'Mới 100% - Vải dù Oxford chống thấm nước cao cấp',
    brand: 'Caden',
    category: 'phu-kien',
    deviceType: 'Accessory',
    description: 'Sức chứa 1 Body + 4 Lens + Flycam + Laptop 15.6 inch. Đệm mút lưng thoáng khí êm ái, có ngăn lấy máy ảnh nhanh bên hông chỉ trong 3 giây.',
    accessories: 'Kèm áo mưa chống nước bọc ngoài balo',
    warranty: 'Bảo hành dây kéo khóa 12 tháng',
  },
  {
    name: 'Túi Đeo Chéo Máy Ảnh Vintage Canvas Da Bò Cao Cấp',
    price: 480000,
    originalPrice: 620000,
    condition: 'Mới 100% - Vải Canvas phủ sáp cổ điển kết hợp da bò thật',
    brand: 'Khác',
    category: 'phu-kien',
    deviceType: 'Accessory',
    description: 'Thiết kế thời trang phong trần lãng tử, ngăn chống sốc có thể tháo rời để sử dụng như túi đeo chéo đi chơi thường ngày.',
    accessories: 'Túi vải Canvas + Vách ngăn chia mút chống va đập',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Đèn Flash Godox TT685 II Thinklite TTL (Cho Sony / Canon / Nikon / Fuji)',
    price: 2450000,
    originalPrice: 2850000,
    condition: 'Mới 100% Nguyên Hộp - Hỗ trợ High-Speed Sync 1/8000s',
    brand: 'Godox',
    category: 'phu-kien',
    deviceType: 'Accessory',
    description: 'Công suất cực mạnh GN60, hỗ trợ đo sáng tự động TTL và đồng bộ tốc độ cao HSS 1/8000s, tích hợp sẵn hệ thống thu sóng không dây Godox X 2.4G.',
    accessories: 'Hộp, Bao đựng nhung, Chân đế dựng bàn, Tản sáng mini',
    warranty: 'Bảo hành chính hãng 12 tháng',
  },
  {
    name: 'Dây Đeo Máy Ảnh Quick-Release Peak Design Slide Lite Replica',
    price: 320000,
    originalPrice: 450000,
    condition: 'Mới 100% - Khóa neo Anchor Link chịu tải đến 50kg',
    brand: 'Khác',
    category: 'phu-kien',
    deviceType: 'Accessory',
    description: 'Khóa thao tác nhanh tháo lắp chỉ trong 1 nốt nhạc, đệm silicon chống trượt vai, chịu tải cực tốt cho cả máy ảnh cơ to và ống kính tele.',
    accessories: 'Dây đeo + 4 Neo khóa Anchor link + Đế gắn ốc chuẩn chân tripod',
    warranty: 'Bảo hành 06 tháng',
  },
  {
    name: 'Bộ Vệ Sinh Máy Ảnh Chuyên Dụng VSGO Full Kit 10 Món',
    price: 250000,
    originalPrice: 350000,
    condition: 'Mới 100% Nguyên Hộp - Khăn lau vô trùng đóng gói chân không',
    brand: 'VSGO',
    category: 'phu-kien',
    deviceType: 'Accessory',
    description: 'Dung dịch chuyên dụng không chứa cồn, bóng thổi bụi khí nén mạnh, bút lau thấu kính carbon nano không để lại vệt mờ trên mặt kính đắt tiền.',
    accessories: 'Bóng thổi bụi, Bút lau lens, Dung dịch lau kính, 5 Khăn microfiber chân không, Tăm bông vệ sinh kẽ máy',
    warranty: 'Đổi mới nếu lỗi',
  }
];

console.log(`Total raw products defined: ${rawProducts.length}`);

// We want a balanced 100 products:
// ~55 may-anh-cu
// ~15 may-anh-chinh-hang
// ~18 ong-kinh
// ~12 phu-kien
// Total = 100

// Let's mark some new / popular camera bodies as may-anh-chinh-hang
const markedProducts = rawProducts.map(p => {
  if (['Sony Alpha A6400 Body (Đen, Likenew 2k shot)', 'Sony A7 Mark IV (A7M4) Body Chính Hãng', 'Fujifilm X-S20 + Lens XC 15-45mm OIS PZ (Chính Hãng)', 'Canon EOS R50 + Lens RF-S 18-45mm IS STM (Máy quay Tiktok đỉnh)', 'Fujifilm X-T5 Body Silver (Cảm biến 40.2 Megapixel Siêu Khủng)', 'Nikon Z fc Special Edition Mint Green (Bản Giới Hạn Xanh Mint)', 'Ricoh GR III (GR3) Bản Tiêu Chuẩn 28mm f2.8', 'Canon EOS R10 Body (Tốc độ chụp cơ học 15fps siêu tốc)', 'Sony ZV-E10 + Lens 16-50mm White Edition (Màu Trắng)', 'Fujifilm X-T30 II Body (Đen / Bạc, Likenew)', 'Canon EOS 200D II + Lens 18-55mm IS STM (Màu Trắng/Đen)', 'Nikon Z5 Body (Mirrorless Full-frame 2 khe thẻ nhớ)', 'Sony A7C Body Silver (Thiết kế Compact Full-frame)', 'Leica D-Lux 7 (Màu Đen / Bạc, Cảm biến M4/3 17MP)'].includes(p.name)) {
    return { ...p, category: 'may-anh-chinh-hang' };
  }
  return p;
});

// Let's ensure balanced brand representation for cameras:
// Sony, Canon, Fujifilm, Nikon, Lumix, Olympus, Ricoh, Casio, Leica
const brandsOrder = ['Sony', 'Canon', 'Fujifilm', 'Nikon', 'Lumix', 'Olympus', 'Ricoh', 'Casio', 'Leica'];
const cameraProducts = markedProducts.filter(p => p.category === 'may-anh-cu' || p.category === 'may-anh-chinh-hang');
const ongKinhList = markedProducts.filter(p => p.category === 'ong-kinh');
const phuKienList = markedProducts.filter(p => p.category === 'phu-kien');

// Pick cameras ensuring all brands are present
const selectedCameras = [];
// First add all non-Sony/Canon/Fuji/Nikon cameras to guarantee Lumix, Olympus, Casio, Ricoh, Leica exist
cameraProducts.forEach(p => {
  if (['Lumix', 'Olympus', 'Ricoh', 'Casio', 'Leica'].includes(p.brand)) {
    selectedCameras.push(p);
  }
});
// Then add up to 14 Canon, 14 Sony, 12 Fuji, 10 Nikon
const canonList = cameraProducts.filter(p => p.brand === 'Canon').slice(0, 15);
const sonyList = cameraProducts.filter(p => p.brand === 'Sony').slice(0, 15);
const fujiList = cameraProducts.filter(p => p.brand === 'Fujifilm').slice(0, 14);
const nikonList = cameraProducts.filter(p => p.brand === 'Nikon').slice(0, 10);

const allPickedCameras = [...selectedCameras, ...canonList, ...sonyList, ...fujiList, ...nikonList];
console.log(`Picked cameras count: ${allPickedCameras.length}`);

// Combine: cameras (73) + ongKinh (15) + phuKien (12) = exactly 100!
const final100 = [...allPickedCameras, ...ongKinhList, ...phuKienList].slice(0, 100);

// Generate final 100 products
const finalProducts = final100.map((item, idx) => {
  const slug = slugify(item.name, { lower: true, strict: true, locale: 'vi' });
  const priceCategory = calcPriceCat(item.price);
  const images = getImageSlice(idx, 3);

  return {
    _id: `prod-${idx + 1}`,
    name: item.name,
    slug: slug,
    price: item.price,
    originalPrice: item.originalPrice || Math.round((item.price * 1.15) / 100000) * 100000,
    condition: item.condition,
    brand: item.brand,
    priceCategory: priceCategory,
    category: item.category,
    deviceType: item.deviceType,
    images: images,
    description: item.description,
    accessories: item.accessories,
    warranty: item.warranty || 'Bảo hành 06 tháng phần cứng - Bao test 07 ngày lỗi 1 đổi 1',
    isAvailable: true,
    featured: item.featured || (idx % 7 === 0),
    views: Math.floor(Math.random() * 200) + 50,
    createdAt: new Date(Date.now() - (idx * 3600000 * 4)).toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

console.log(`Formatted ${finalProducts.length} products.`);

// Stats:
const catStats = {};
const priceStats = {};
const brandStats = {};
finalProducts.forEach(p => {
  catStats[p.category] = (catStats[p.category] || 0) + 1;
  priceStats[p.priceCategory] = (priceStats[p.priceCategory] || 0) + 1;
  brandStats[p.brand] = (brandStats[p.brand] || 0) + 1;
});

console.log('Categories:', catStats);
console.log('Price Categories:', priceStats);
console.log('Brands:', brandStats);

// Write to backend/config/memoryStore.js
const memoryStorePath = path.resolve(__dirname, '../config/memoryStore.js');
let memoryStoreContent = `const slugify = require('slugify');

// 100 realistic mock products for MÁY ẢNH TOP 1
const initialProducts = ${JSON.stringify(finalProducts, null, 2)};

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
`;

fs.writeFileSync(memoryStorePath, memoryStoreContent, 'utf-8');
console.log('Successfully wrote to backend/config/memoryStore.js');

// Write to frontend/lib/mockData.ts
const mockDataPath = path.resolve(__dirname, '../../frontend/lib/mockData.ts');
let mockDataContent = `export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  condition: string;
  brand: string;
  priceCategory: 'under_3m' | '3m_5m' | '5m_10m' | 'above_10m';
  category: string;
  deviceType?: string;
  images: string[];
  description?: string;
  accessories?: string;
  warranty?: string;
  isAvailable: boolean;
  featured?: boolean;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  type: 'price' | 'brand' | 'device_type' | 'category';
  order?: number;
  isActive?: boolean;
}

// 100 Realistic Mock Products for MÁY ẢNH TOP 1
export const FALLBACK_PRODUCTS: Product[] = ${JSON.stringify(finalProducts, null, 2)};

export const FALLBACK_CATEGORIES: Category[] = [
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
  { name: 'Tất cả danh mục', slug: 'all', type: 'category', order: 1 },
  { name: 'Máy ảnh cũ', slug: 'may-anh-cu', type: 'category', order: 2 },
  { name: 'Máy ảnh chính hãng', slug: 'may-anh-chinh-hang', type: 'category', order: 3 },
  { name: 'Ống kính (Lens)', slug: 'ong-kinh', type: 'category', order: 4 },
  { name: 'Phụ kiện máy ảnh', slug: 'phu-kien', type: 'category', order: 5 },
  { name: 'Mirrorless', slug: 'Mirrorless', type: 'device_type', order: 1 },
  { name: 'DSLR', slug: 'DSLR', type: 'device_type', order: 2 },
  { name: 'Compact / Y2K', slug: 'Compact', type: 'device_type', order: 3 },
];
`;

fs.writeFileSync(mockDataPath, mockDataContent, 'utf-8');
console.log('Successfully wrote to frontend/lib/mockData.ts');

// Also update backend/seed.js
const seedPath = path.resolve(__dirname, '../seed.js');
let seedContent = `const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Admin = require('./models/Admin');
const slugify = require('slugify');

dotenv.config();

const sampleProducts = ${JSON.stringify(finalProducts, null, 2)};

const sampleCategories = [
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

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri || mongoUri.includes('placeholder')) {
      console.log('No valid MongoDB URI configured. Skipping database seed.');
      process.exit(0);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding...');

    await Product.deleteMany();
    await Category.deleteMany();
    await Admin.deleteMany();

    const formattedProducts = sampleProducts.map((p) => {
      const { _id, ...rest } = p;
      return rest;
    });

    await Product.insertMany(formattedProducts);
    console.log(\`Seeded \${formattedProducts.length} products successfully!\`);

    await Category.insertMany(sampleCategories);
    console.log('Seeded categories successfully!');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    await Admin.create({
      username: 'admin',
      passwordHash,
    });
    console.log('Seeded default admin (admin / admin123)');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
`;

fs.writeFileSync(seedPath, seedContent, 'utf-8');
console.log('Successfully wrote to backend/seed.js');
