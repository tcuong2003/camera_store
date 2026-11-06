'use client';

import React from 'react';
import { Layers, RotateCcw } from 'lucide-react';

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

export const CATEGORY_OPTIONS = [
  { label: 'Tất cả danh mục', value: 'all', type: 'all' },
  { label: 'Máy ảnh cũ', value: 'may-anh-cu', type: 'category' },
  { label: 'Máy ảnh chính hãng', value: 'may-anh-chinh-hang', type: 'category' },
  { label: 'Ống kính (Lens)', value: 'ong-kinh', type: 'category' },
  { label: 'Phụ kiện máy ảnh', value: 'phu-kien', type: 'category' },
  { label: 'Mirrorless', value: 'Mirrorless', type: 'deviceType' },
  { label: 'DSLR', value: 'DSLR', type: 'deviceType' },
  { label: 'Compact / Y2K', value: 'Compact', type: 'deviceType' },
];

export const PRICE_OPTIONS = [
  { label: 'Tất cả khoảng giá', value: 'all' },
  { label: 'Dưới 3.000.000 đ', value: 'under_3m' },
  { label: 'Từ 3.000.000 đ - 5.000.000 đ', value: '3m_5m' },
  { label: 'Từ 5.000.000 đ - 10.000.000 đ', value: '5m_10m' },
  { label: 'Trên 10.000.000 đ', value: 'above_10m' },
];

export const BRAND_OPTIONS = [
  { label: 'Tất cả thương hiệu', value: 'all' },
  { label: 'Sony', value: 'Sony' },
  { label: 'Canon', value: 'Canon' },
  { label: 'Fujifilm', value: 'Fujifilm' },
  { label: 'Nikon', value: 'Nikon' },
  { label: 'Lumix', value: 'Lumix' },
  { label: 'Olympus', value: 'Olympus' },
  { label: 'Ricoh', value: 'Ricoh' },
  { label: 'Casio', value: 'Casio' },
];

export const SORT_OPTIONS = [
  { label: 'Mới cập nhật', value: 'newest' },
  { label: 'Giá: Thấp → Cao', value: 'price_asc' },
  { label: 'Giá: Cao → Thấp', value: 'price_desc' },
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

  const handleCategorySelect = (opt: typeof CATEGORY_OPTIONS[0]) => {
    if (opt.value === 'all') {
      onChange({ ...filters, category: 'all', deviceType: 'all' });
    } else if (opt.type === 'category') {
      onChange({ ...filters, category: opt.value, deviceType: 'all' });
    } else if (opt.type === 'deviceType') {
      onChange({ ...filters, category: 'all', deviceType: opt.value });
    }
  };

  const isCatActive = (opt: typeof CATEGORY_OPTIONS[0]) => {
    if (opt.value === 'all') return filters.category === 'all' && filters.deviceType === 'all';
    if (opt.type === 'category') return filters.category === opt.value;
    if (opt.type === 'deviceType') return filters.deviceType === opt.value;
    return false;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
      {/* Category Pills Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base">
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Danh mục sản phẩm</span>
        </div>

        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-semibold px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa tất cả lọc</span>
          </button>
        )}
      </div>

      {/* Category Pills List */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {CATEGORY_OPTIONS.map((opt) => {
          const active = isCatActive(opt);
          return (
            <button
              key={opt.value}
              onClick={() => handleCategorySelect(opt)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                active
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/40 scale-[1.02]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80'
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
