import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImageGallery from '../../../components/ImageGallery';
import ProductCard from '../../../components/ProductCard';
import ZaloChatButton from '../../../components/ZaloChatButton';
import { fetchProductBySlug, formatVND } from '../../../lib/api';
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

const CATEGORY_NAMES: Record<string, string> = {
  'may-anh-cu': 'Máy ảnh cũ',
  'may-anh-chinh-hang': 'Máy ảnh chính hãng',
  'ong-kinh': 'Ống kính (Lens)',
  'phu-kien': 'Phụ kiện máy ảnh',
  'Mirrorless': 'Mirrorless',
  'DSLR': 'DSLR',
  'Compact': 'Compact / Y2K',
};

const getCategoryLabel = (category?: string, deviceType?: string) => {
  if (category) {
    return CATEGORY_NAMES[category] || category;
  }
  if (deviceType) {
    return CATEGORY_NAMES[deviceType] || deviceType;
  }
  return 'Máy ảnh';
};

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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8">
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
        </div>

        {/* Right Column: Specifications & Direct Purchase Actions (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-start space-y-5">
          <div className="space-y-4">
            {/* Badges: Brand & Category */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                {getCategoryLabel(product.category, product.deviceType)}
              </span>
              {!product.isAvailable && (
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                  Đã bán / Tạm hết
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price Box (CellphoneS style) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Giá bán công khai:</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-red-600 tracking-tight">
                  {formatVND(product.price)}
                </span>
              </div>
              {product.originalPrice && product.originalPrice > product.price ? (
                <div className="text-right">
                  <span className="text-xs text-slate-400 block mb-1">Giá niêm yết:</span>
                  <span className="text-slate-400 text-sm sm:text-base line-through">
                    {formatVND(product.originalPrice)}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Primary Action Buttons (Call-to-Action) */}
          <div className="space-y-3 pt-2">
            {/* Primary CTA: Zalo with auto product link */}
            <ZaloChatButton productName={product.name} slug={product.slug} />

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
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Info className="w-5 h-5 text-amber-500" />
            <span>Mô tả chi tiết &amp; đánh giá máy</span>
          </h2>
          <div
            className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_p]:my-2 [&_table]:w-full [&_table]:border-collapse [&_th]:bg-slate-50 [&_th]:p-3 [&_th]:text-left [&_td]:p-3 [&_td]:border-b [&_td]:border-slate-100"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
            {related.map((item) => (
              <ProductCard key={item._id || item.slug} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
