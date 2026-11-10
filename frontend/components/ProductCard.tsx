'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '../lib/mockData';
import { formatVND } from '../lib/api';
import { Images } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

// Helper to strip HTML tags and clean up whitespace for plain text preview
const stripHtml = (html?: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

export default function ProductCard({ product }: ProductCardProps) {
  const rawThumbnail = product.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
  const thumbnail = rawThumbnail.replace(/\.(heic|heif)$/i, '.jpg');
  const imageCount = product.images?.length || 1;
  const plainDesc = stripHtml(product.description);
  const displayBrand = !product.brand || !product.brand.trim() || product.brand.toLowerCase() === 'other' || product.brand.toLowerCase() === 'khac'
    ? 'Khác'
    : product.brand;

  const productPath = product._id || product.slug;

  return (
    <Link
      href={`/san-pham/${productPath}`}
      prefetch={false}
      className="group bg-white border border-slate-200 hover:border-amber-500/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/90 flex flex-col justify-between cursor-pointer"
    >
      {/* Thumbnail / Album Cover */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={thumbnail}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.includes('.heic') || target.src.includes('.heif')) {
              target.src = target.src.replace(/\.(heic|heif)$/i, '.jpg');
            } else {
              target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
            }
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Featured Badge (Top-left if featured) */}
        {product.featured && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wide shadow-sm">
              Nổi bật
            </span>
          </div>
        )}

        {/* Album Image Count (Top-right) */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-mono border border-white/20 shadow">
            <Images className="w-3 h-3 text-amber-400" />
            <span>{imageCount} ảnh</span>
          </span>
        </div>

        {/* Brand Tag (Bottom-left overlay) */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-slate-800 text-[11px] font-bold border border-slate-200 shadow-sm">
            {displayBrand}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Product Name */}
          <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>

          {/* Price display (CellphoneS style: wraps cleanly on small mobile cards without overflowing) */}
          <div className="mt-1.5 sm:mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
            <span className="text-red-600 font-extrabold text-sm sm:text-base md:text-lg tracking-tight shrink-0">
              {formatVND(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price ? (
              <span className="text-slate-400 text-[11px] sm:text-xs line-through shrink-0">
                {formatVND(product.originalPrice)}
              </span>
            ) : null}
          </div>

          {/* Product description preview (Clean text stripped of HTML, truncated with ...) */}
          {plainDesc && (
            <p className="mt-1.5 text-slate-500 text-xs line-clamp-2 leading-relaxed">
              {plainDesc}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
