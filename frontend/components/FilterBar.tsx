'use client';

import React from 'react';
import { Filter, SlidersHorizontal, RotateCcw, Tag, DollarSign, Camera, Layers } from 'lucide-react';

export interface FilterState {
  priceCategory: string;
  brand: string;
  category: string;
  deviceType: string;
  sort: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  totalCount: number;
}

export const PRICE_OPTIONS = [
  { label: 'Tất cả giá', value: 'all' },
  { label: 'Dưới 3 triệu', value: 'under_3m' },
  { label: '3 - 5 triệu', value: '3m_5m' },
  { label: '5 - 10 triệu', value: '5m_10m' },
  { label: 'Trên 10 triệu', value: 'above_10m' },
];

export const BRAND_OPTIONS = [
  { label: 'Tất cả hãng', value: 'all' },
  { label: 'Canon', value: 'Canon' },
  { label: 'Sony', value: 'Sony' },
  { label: 'Fujifilm', value: 'Fujifilm' },
  { label: 'Nikon', value: 'Nikon' },
  { label: 'Lumix', value: 'Lumix' },
  { label: 'Olympus', value: 'Olympus' },
  { label: 'Ricoh', value: 'Ricoh' },
  { label: 'Casio', value: 'Casio' },
];

export const CATEGORY_OPTIONS = [
  { label: 'Tất cả loại máy', value: 'all' },
  { label: 'Máy ảnh cũ', value: 'may-anh-cu' },
  { label: 'Máy ảnh chính hãng', value: 'may-anh-chinh-hang' },
  { label: 'Ống kính (Lens)', value: 'ong-kinh' },
  { label: 'Phụ kiện', value: 'phu-kien' },
];

export const DEVICE_TYPE_OPTIONS = [
  { label: 'Tất cả định dạng', value: 'all' },
  { label: 'Mirrorless', value: 'Mirrorless' },
  { label: 'DSLR', value: 'DSLR' },
  { label: 'Compact / Y2K', value: 'Compact' },
];

export const SORT_OPTIONS = [
  { label: 'Mới cập nhật', value: 'newest' },
  { label: 'Giá thấp → cao', value: 'price_asc' },
  { label: 'Giá cao → thấp', value: 'price_desc' },
];

export default function FilterBar({ filters, onChange, totalCount }: FilterBarProps) {
  const isFiltered =
    filters.priceCategory !== 'all' ||
    filters.brand !== 'all' ||
    filters.category !== 'all' ||
    filters.deviceType !== 'all';

  const resetFilters = () => {
    onChange({
      priceCategory: 'all',
      brand: 'all',
      category: 'all',
      deviceType: 'all',
      sort: 'newest',
    });
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header bar of filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
        <div className="flex items-center gap-2 text-stone-200 font-semibold text-sm sm:text-base">
          <SlidersHorizontal className="w-4 h-4 text-amber-500" />
          <span>Bộ lọc Album máy ảnh</span>
          <span className="text-xs bg-amber-500/10 text-amber-400 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
            {totalCount} sản phẩm
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 hidden sm:inline">Sắp xếp:</span>
            <select
              value={filters.sort}
              onChange={(e) => onChange({ ...filters, sort: e.target.value })}
              className="bg-stone-800 border border-stone-700 text-stone-200 text-xs sm:text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium px-2 py-1 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Price Range Pills */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-stone-400 uppercase tracking-wider font-semibold mb-2">
          <DollarSign className="w-3.5 h-3.5 text-amber-500" />
          <span>Tầm giá</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRICE_OPTIONS.map((opt) => {
            const isActive = filters.priceCategory === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange({ ...filters, priceCategory: opt.value })}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-400 scale-[1.02]'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700/60'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Brand Pills */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-stone-400 uppercase tracking-wider font-semibold mb-2">
          <Camera className="w-3.5 h-3.5 text-amber-500" />
          <span>Thương hiệu</span>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {BRAND_OPTIONS.map((opt) => {
            const isActive = filters.brand === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange({ ...filters, brand: opt.value })}
                className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-stone-800/60 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-800'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Category & Device Type combined in responsive bar */}
      <div className="pt-2 border-t border-stone-800/60 flex flex-wrap items-center gap-2">
        <span className="text-xs text-stone-400 flex items-center gap-1 mr-1">
          <Layers className="w-3.5 h-3.5 text-amber-500" /> Phân loại:
        </span>

        {/* Category Pills */}
        {CATEGORY_OPTIONS.map((opt) => {
          const isActive = filters.category === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, category: opt.value })}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                isActive
                  ? 'bg-stone-100 text-stone-950 font-semibold'
                  : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        <div className="h-4 w-px bg-stone-700 mx-1 hidden sm:block" />

        {/* Device Type Pills */}
        {DEVICE_TYPE_OPTIONS.map((opt) => {
          const isActive = filters.deviceType === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, deviceType: opt.value })}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold'
                  : 'bg-stone-800/40 text-stone-400 hover:text-stone-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
