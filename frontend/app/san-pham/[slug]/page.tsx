import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImageGallery from '../../../components/ImageGallery';
import ProductCard from '../../../components/ProductCard';
import { fetchProductBySlug, formatVND, getZaloChatUrl } from '../../../lib/api';
import {
  Phone,
  MessageSquare,
  ChevronRight,
  Camera,
  ArrowLeft,
  Info,
} from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const data = await fetchProductBySlug(slug);
  if (!data || !data.product) {
    return {
      title: 'Không tìm thấy sản phẩm | MÁY ẢNH TOP 1',
    };
  }

  const p = data.product;
  return {
    title: `${p.name} (${p.condition}) | MÁY ẢNH TOP 1 Sài Gòn`,
    description: `Xem album ảnh chụp thật ${p.name}. Tình trạng ${p.condition}, giá ${formatVND(p.price)}. Phụ kiện: ${p.accessories}. Hotline/Zalo: 0986834449`,
    openGraph: {
      title: `${p.name} - Giá: ${formatVND(p.price)}`,
      description: p.condition,
      images: p.images && p.images[0] ? [p.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const data = await fetchProductBySlug(slug);

  if (!data || !data.product) {
    notFound();
  }

  const { product, related } = data;
  const zaloChatUrl = getZaloChatUrl(product.name);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
        <Link href="/" className="hover:text-amber-600 flex items-center gap-1 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Danh mục máy ảnh</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-600">{product.brand}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout (Gallery on left, Details & Actions on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Image Album Gallery (7 cols on desktop) */}
        <div className="lg:col-span-7">
          <ImageGallery images={product.images} productName={product.name} />

          {/* Screenshot & Zalo tip box */}
          <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-slate-700 flex items-start gap-3 shadow-sm">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Mẹo chọn máy nhanh:</strong> Quý khách có thể bấm biểu tượng <strong>Tải ảnh</strong> ở góc ảnh hoặc <strong>chụp ảnh màn hình</strong> chiếc máy này, sau đó bấm nút chat Zalo bên dưới để gửi thẳng cho chủ shop chốt đơn giữ máy!
            </div>
          </div>
        </div>

        {/* Right Column: Specifications & Direct Purchase Actions (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Badges: Brand & Condition */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                {product.deviceType || 'Máy ảnh'}
              </span>
              {product.isAvailable ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sẵn hàng tại Sài Gòn
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                  Đã bán / Tạm hết
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Giá bán công khai:</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono tracking-tight">
                  {formatVND(product.price)}
                </span>
              </div>
              {product.originalPrice && product.originalPrice > product.price ? (
                <div className="text-right">
                  <span className="text-xs text-slate-400 block mb-1">Giá niêm yết:</span>
                  <span className="text-slate-400 text-sm sm:text-base line-through font-mono">
                    {formatVND(product.originalPrice)}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Key Specifications Grid */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <span className="font-bold text-slate-500 w-28 shrink-0">Tình trạng máy:</span>
                <span className="text-amber-700 font-bold">{product.condition}</span>
              </div>

              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <span className="font-bold text-slate-500 w-28 shrink-0">Phụ kiện kèm theo:</span>
                <span className="text-slate-800">{product.accessories || 'Đầy đủ pin, sạc, thẻ nhớ, dây đeo'}</span>
              </div>

              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <span className="font-bold text-slate-500 w-28 shrink-0">Chế độ bảo hành:</span>
                <span className="text-emerald-700 font-semibold">
                  {product.warranty || 'Bảo hành 06 tháng phần cứng - Bao test 07 ngày 1 đổi 1'}
                </span>
              </div>

              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <span className="font-bold text-slate-500 w-28 shrink-0">Hình thức giao dịch:</span>
                <span className="text-slate-700">Ghé test trực tiếp tại Sài Gòn hoặc Ship COD toàn quốc</span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons (Call-to-Action) */}
          <div className="space-y-3 pt-2">
            {/* Primary CTA: Zalo */}
            <a
              href={zaloChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-base shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>Nhắn Zalo Tư Vấn / Chốt Đơn Máy Này</span>
            </a>

            {/* Secondary CTA: Phone Call */}
            <a
              href="tel:0986834449"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Gọi Hotline Trực Tiếp: 0986.834.449</span>
            </a>
          </div>
        </div>
      </div>

      {/* Description & Detailed Content */}
      {product.description && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-500" />
            <span>Mô tả chi tiết &amp; đánh giá máy</span>
          </h2>
          <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-2">
            {product.description}
          </div>
        </section>
      )}

      {/* Related Products Section */}
      {related && related.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" />
              <span>Các dòng máy tương tự cùng tầm giá</span>
            </h2>
            <Link href="/" className="text-xs text-amber-600 hover:text-amber-700 font-semibold">
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map((item) => (
              <ProductCard key={item._id || item.slug} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
