import React from 'react';
import Link from 'next/link';
import { Camera, Phone, MessageSquare, MapPin, ShieldCheck, Clock, Truck, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-950 border-t border-stone-800 text-stone-300 pt-12 pb-24 sm:pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges: Store Commitments */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 border-b border-stone-800">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-900/50 border border-stone-800/80">
            <ShieldCheck className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Bảo hành 06 Tháng</h4>
              <p className="text-xs text-stone-400 mt-0.5">Phần cứng an tâm, 1 đổi 1 trong 7 ngày</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-900/50 border border-stone-800/80">
            <Award className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Ảnh Thật 100%</h4>
              <p className="text-xs text-stone-400 mt-0.5">Ngoại hình tự chụp kỹ càng từng góc máy</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-900/50 border border-stone-800/80">
            <Truck className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Giao Hàng Toàn Quốc</h4>
              <p className="text-xs text-stone-400 mt-0.5">Ship COD kiểm tra máy trước khi thanh toán</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-900/50 border border-stone-800/80">
            <Clock className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Hỗ Trợ 24/7</h4>
              <p className="text-xs text-stone-400 mt-0.5">Tư vấn chọn máy đúng nhu cầu và tầm giá</p>
            </div>
          </div>
        </div>

        {/* Middle columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-bold shadow-md">
                <Camera className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">MÁY ẢNH TOP 1</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Thương hiệu chuyên cung cấp các dòng máy ảnh cũ, máy ảnh lướt chọn lọc, ống kính và phụ kiện chính hãng tại Sài Gòn. Uy tín, trách nhiệm và hỗ trợ kỹ thuật tận tâm cho cộng đồng nhiếp ảnh.
            </p>
            <div className="text-xs text-amber-400 font-mono">
              Website: sp.mayanhtop1.com
            </div>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Liên hệ Chốt Đơn</h4>
            <div className="space-y-2.5 text-xs">
              <a
                href="tel:0986834449"
                className="flex items-center gap-2 text-stone-300 hover:text-amber-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hotline / Gọi điện: <strong>0986.834.449</strong></span>
              </a>
              <a
                href="https://zalo.me/0986834449"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-stone-300 hover:text-blue-400 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Zalo tư vấn &amp; gửi ảnh: <strong>0986.834.449</strong></span>
              </a>
              <div className="flex items-start gap-2 text-stone-400">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Địa chỉ giao dịch &amp; test máy trực tiếp tại TP. Hồ Chí Minh (Sài Gòn)</span>
              </div>
            </div>
          </div>

          {/* Quick links & instruction */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Cách thức mua hàng</h4>
            <ul className="text-xs text-stone-400 space-y-2">
              <li>1. Xem danh mục album máy ảnh ưng ý theo tầm giá và hãng.</li>
              <li>2. Bấm nút <strong>"Nhắn Zalo"</strong> hoặc chụp màn hình sản phẩm.</li>
              <li>3. Gửi cho chủ shop qua Zalo <strong>0986.834.449</strong> để kiểm tra tình trạng máy thực tế.</li>
              <li>4. Nhận máy trực tiếp tại shop hoặc ship COD tận nhà an toàn.</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} MÁY ẢNH TOP 1 - Chuyên máy ảnh cũ Sài Gòn. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-stone-300 transition-colors">
              Đăng nhập Quản trị
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
