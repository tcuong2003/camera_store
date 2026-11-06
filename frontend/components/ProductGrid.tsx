'use client';

import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../lib/mockData';
import { CameraOff, RotateCcw } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onResetFilters?: () => void;
}

export default function ProductGrid({
  products,
  isLoading = false,
  onResetFilters,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse flex flex-col shadow-sm"
          >
            <div className="aspect-[4/3] bg-slate-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <div className="h-8 bg-slate-200 rounded-xl" />
                <div className="h-8 bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <CameraOff className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Không tìm thấy máy ảnh phù hợp</h3>
        <p className="text-slate-500 text-sm mt-2">
          Hiện tại không có sản phẩm nào khớp với bộ lọc bạn đã chọn. Vui lòng thử đổi mức giá hoặc thương hiệu khác.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Xem tất cả máy ảnh</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id || product.slug} product={product} />
      ))}
    </div>
  );
}
