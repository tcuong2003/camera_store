'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '../lib/mockData';
import { formatVND, getZaloChatUrl } from '../lib/api';
import { MessageSquare, Eye, Images, CheckCircle2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const thumbnail = product.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
  const imageCount = product.images?.length || 1;
  const zaloUrl = getZaloChatUrl(product.name);

  return (
    <div className="group bg-white border border-slate-200 hover:border-amber-500/70 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/80 flex flex-col justify-between">
      {/* Thumbnail / Album Cover with badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Link href={`/san-pham/${product.slug}`} className="block w-full h-full">
          <img
            src={thumbnail}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Condition Badge (Top-left) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-bold shadow-md">
            {product.condition || 'Đẹp 98%'}
          </span>
          {product.featured && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wide shadow-sm">
              Nổi bật
            </span>
          )}
        </div>

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
            {product.brand}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Product Name */}
          <Link href={`/san-pham/${product.slug}`} className="block">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 hover:text-amber-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Price display */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-amber-600 font-extrabold text-base sm:text-lg tracking-tight font-mono">
              {formatVND(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price ? (
              <span className="text-slate-400 text-xs line-through font-mono">
                {formatVND(product.originalPrice)}
              </span>
            ) : null}
          </div>

          {/* Quick specs / Accessories highlight */}
          {product.accessories && (
            <p className="mt-1.5 text-slate-500 text-xs line-clamp-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{product.accessories}</span>
            </p>
          )}
        </div>

        {/* Action Buttons: Xem chi tiết & Nhắn Zalo */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
          <Link
            href={`/san-pham/${product.slug}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Xem máy</span>
          </Link>

          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow hover:shadow-blue-500/20 active:scale-95 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Nhắn Zalo</span>
          </a>
        </div>
      </div>
    </div>
  );
}
