import React from 'react';
import Link from 'next/link';
import { Camera, Phone, MessageSquare, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 pt-10 pb-24 sm:pb-10 mt-14 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">MÁY ẢNH TOP 1</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thương hiệu chuyên cung cấp các dòng máy ảnh cũ, máy ảnh lướt chọn lọc, ống kính và phụ kiện chính hãng tại Sài Gòn. Uy tín, trách nhiệm và hỗ trợ kỹ thuật tận tâm cho cộng đồng nhiếp ảnh.
            </p>
            <div className="text-xs text-amber-600 font-mono font-semibold">
              Website: sp.mayanhtop1.com
            </div>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Liên hệ Chốt Đơn</h4>
            <div className="space-y-2.5 text-xs">
              <a
                href="tel:0986834449"
                className="flex items-center gap-2 text-slate-700 hover:text-amber-600 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hotline / Gọi điện: <strong className="text-slate-900 font-mono">0986.834.449</strong></span>
              </a>
              <a
                href="https://zalo.me/0986834449"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Zalo tư vấn &amp; gửi ảnh: <strong className="text-slate-900 font-mono">0986.834.449</strong></span>
              </a>
              <div className="flex items-start gap-2 text-slate-500">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Địa chỉ giao dịch &amp; test máy trực tiếp tại TP. Hồ Chí Minh (Sài Gòn)</span>
              </div>
            </div>
          </div>

          {/* Quick links & instruction */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Cách thức mua hàng</h4>
            <ul className="text-xs text-slate-500 space-y-2">
              <li>1. Xem danh mục album máy ảnh ưng ý theo tầm giá và hãng.</li>
              <li>2. Bấm nút <strong className="text-slate-800">"Nhắn Zalo"</strong> hoặc chụp màn hình sản phẩm.</li>
              <li>3. Gửi cho chủ shop qua Zalo <strong className="text-slate-800 font-mono">0986.834.449</strong> để kiểm tra tình trạng máy thực tế.</li>
              <li>4. Nhận máy trực tiếp tại shop hoặc ship COD tận nhà an toàn.</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} MÁY ẢNH TOP 1 - Chuyên máy ảnh cũ Sài Gòn. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-slate-700 transition-colors">
              Đăng nhập Quản trị
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
