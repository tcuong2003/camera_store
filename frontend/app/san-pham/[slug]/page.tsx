import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImageGallery from '../../../components/ImageGallery';
import ProductCard from '../../../components/ProductCard';
import { fetchProductBySlug, formatVND, getZaloChatUrl } from '../../../lib/api';
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Share2,
  ChevronRight,
  Sparkles,
  Camera,
  Layers,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-400">
        <Link href="/" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Danh mục máy ảnh</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
        <span className="text-stone-300">{product.brand}</span>
        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
        <span className="text-stone-100 font-medium truncate max-w-[200px] sm:max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout (Gallery on left, Details & Actions on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Image Album Gallery (7 cols on desktop) */}
        <div className="lg:col-span-7">
          <ImageGallery images={product.images} productName={product.name} />

          {/* Screenshot & Zalo tip box */}
          <div className="mt-4 p-4 rounded-2xl bg-stone-900 border border-stone-800 text-xs text-stone-300 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-100">Mẹo chọn máy nhanh:</strong> Quý khách có thể bấm biểu tượng <strong>Tải ảnh</strong> ở góc ảnh hoặc <strong>chụp ảnh màn hình</strong> chiếc máy này, sau đó bấm nút chat Zalo bên dưới để gửi thẳng cho chủ shop chốt đơn giữ máy!
            </div>
          </div>
        </div>

        {/* Right Column: Specifications & Direct Purchase Actions (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Badges: Brand & Condition */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="px-3 py-1 rounded-lg bg-stone-800 text-stone-200 text-xs font-semibold">
                {product.deviceType || 'Máy ảnh'}
              </span>
              {product.isAvailable ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Sẵn hàng tại Sài Gòn
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
                  Đã bán / Tạm hết
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-stone-400 block mb-1">Giá bán công khai:</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                  {formatVND(product.price)}
                </span>
              </div>
              {product.originalPrice && product.originalPrice > product.price ? (
                <div className="text-right">
                  <span className="text-xs text-stone-500 block mb-1">Giá niêm yết:</span>
                  <span className="text-stone-500 text-sm sm:text-base line-through font-mono">
                    {formatVND(product.originalPrice)}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Key Specifications Grid */}
            <div className="space-y-3 bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <span className="font-bold text-stone-400 w-28 shrink-0">Tình trạng máy:</span>
                <span className="text-amber-400 font-semibold">{product.condition}</span>
              </div>

              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <span className="font-bold text-stone-400 w-28 shrink-0">Phụ kiện kèm theo:</span>
                <span className="text-stone-200">{product.accessories || 'Đầy đủ pin, sạc, thẻ nhớ, dây đeo'}</span>
              </div>

              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <span className="font-bold text-stone-400 w-28 shrink-0">Chế độ bảo hành:</span>
                <span className="text-emerald-400 font-medium">
                  {product.warranty || 'Bảo hành 06 tháng phần cứng - Bao test 07 ngày 1 đổi 1'}
                </span>
              </div>

              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <span className="font-bold text-stone-400 w-28 shrink-0">Hình thức giao dịch:</span>
                <span className="text-stone-300">Ghé test trực tiếp tại Sài Gòn hoặc Ship COD toàn quốc</span>
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
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-base shadow-xl shadow-blue-600/25 active:scale-[0.99] transition-all"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>Nhắn Zalo Tư Vấn / Chốt Đơn Máy Này</span>
            </a>

            {/* Secondary CTA: Phone Call */}
            <a
              href="tel:0986834449"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-sm border border-stone-700 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Gọi Hotline Trực Tiếp: 0986.834.449</span>
            </a>
          </div>
        </div>
      </div>

      {/* Description & Detailed Content */}
      {product.description && (
        <section className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-500" />
            <span>Mô tả chi tiết &amp; đánh giá máy</span>
          </h2>
          <div className="text-stone-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-2">
            {product.description}
          </div>
        </section>
      )}

      {/* Related Products Section */}
      {related && related.length > 0 && (
        <section className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" />
              <span>Các dòng máy tương tự cùng tầm giá</span>
            </h2>
            <Link href="/" className="text-xs text-amber-400 hover:text-white font-medium">
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
