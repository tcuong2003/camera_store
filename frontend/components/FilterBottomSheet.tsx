'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  SlidersHorizontal,
  DollarSign,
  Camera,
  ArrowUpDown,
  Layers,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  FilterState,
  PRICE_OPTIONS,
  BRAND_OPTIONS,
  SORT_OPTIONS,
  CATEGORY_OPTIONS,
  CategoryOption,
} from './FilterBar';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (newFilters: FilterState) => void;
  totalCount: number;
  availableCategories?: string[];
  initialSection?: 'all' | 'price' | 'brand' | 'sort' | 'category';
  brandOptions?: { label: string; value: string }[];
  categoryOptions?: CategoryOption[];
  priceOptions?: { label: string; value: string }[];
}

export default function FilterBottomSheet({
  isOpen,
  onClose,
  filters,
  onApply,
  totalCount,
  availableCategories = [],
  initialSection = 'all',
  brandOptions,
  categoryOptions,
  priceOptions,
}: FilterBottomSheetProps) {
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const [sheetMin, setSheetMin] = useState<string>(
    filters.minPrice !== undefined && filters.minPrice !== null ? filters.minPrice.toString() : ''
  );
  const [sheetMax, setSheetMax] = useState<string>(
    filters.maxPrice !== undefined && filters.maxPrice !== null ? filters.maxPrice.toString() : ''
  );
  const sheetContentRef = useRef<HTMLDivElement>(null);

  const formatNumberWithDots = (val: string | number): string => {
    if (val === '' || val === null || val === undefined) return '';
    const num = typeof val === 'number' ? val : Number(val.toString().replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const activeBrands = brandOptions && brandOptions.length > 0 ? brandOptions : [{ label: 'Tất cả hãng', value: 'all' }];
  const activeCategories: CategoryOption[] = categoryOptions && categoryOptions.length > 0 ? categoryOptions : [{ label: 'Tất cả danh mục', value: 'all', type: 'all' as const }];
  const activePrices = priceOptions && priceOptions.length > 0 ? priceOptions : [{ label: 'Tất cả khoảng giá', value: 'all' }];

  // Sync tempFilters when opened
  useEffect(() => {
    if (isOpen) {
      setTempFilters(filters);
      setSheetMin(filters.minPrice !== undefined && filters.minPrice !== null ? filters.minPrice.toString() : '');
      setSheetMax(filters.maxPrice !== undefined && filters.maxPrice !== null ? filters.maxPrice.toString() : '');
      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, filters]);

  // Scroll to requested section on open
  useEffect(() => {
    if (isOpen && initialSection !== 'all') {
      const el = document.getElementById(`filter-section-${initialSection}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [isOpen, initialSection]);

  const hasPriceFilter =
    (tempFilters.minPrice !== null && tempFilters.minPrice !== undefined) ||
    (tempFilters.maxPrice !== null && tempFilters.maxPrice !== undefined) ||
    (tempFilters.priceCategory && tempFilters.priceCategory !== 'all');

  const activeFilterCount =
    (hasPriceFilter ? 1 : 0) +
    (tempFilters.brand !== 'all' ? 1 : 0) +
    (tempFilters.category !== 'all' ? 1 : 0) +
    (tempFilters.sort !== 'newest' ? 1 : 0);

  const handleReset = () => {
    setSheetMin('');
    setSheetMax('');
    setTempFilters({
      priceCategory: 'all',
      minPrice: null,
      maxPrice: null,
      brand: 'all',
      category: 'all',
      sort: 'newest',
    });
  };

  const handlePriceRangeUpdate = (minStr: string, maxStr: string) => {
    setSheetMin(minStr);
    setSheetMax(maxStr);
    const minVal = minStr ? Number(minStr.replace(/\D/g, '')) : null;
    const maxVal = maxStr ? Number(maxStr.replace(/\D/g, '')) : null;
    if (minVal === null && maxVal === null) {
      setTempFilters((prev) => ({ ...prev, minPrice: null, maxPrice: null, priceCategory: 'all' }));
    } else {
      setTempFilters((prev) => ({
        ...prev,
        minPrice: minVal,
        maxPrice: maxVal,
        priceCategory: `custom_${minVal || 0}_${maxVal || ''}`,
      }));
    }
  };

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  const handleCategorySelect = (opt: CategoryOption) => {
    if (opt.value === 'all') {
      setTempFilters((prev) => ({ ...prev, category: 'all' }));
    } else {
      setTempFilters((prev) => ({ ...prev, category: opt.value }));
    }
  };

  const isCatActive = (opt: CategoryOption) => {
    if (opt.value === 'all') return tempFilters.category === 'all';
    return tempFilters.category?.toLowerCase() === opt.value.toLowerCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Bottom Sheet Container */}
      <div
        ref={sheetContentRef}
        className="relative z-10 w-full max-w-2xl mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[88vh] animate-in slide-in-from-bottom duration-300 overflow-hidden"
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 cursor-grab flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-500" />
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Bộ Lọc Tìm Kiếm Máy Ảnh
            </h3>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Đóng bộ lọc"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 overscroll-contain">
          {/* Section 1: Khoảng giá */}
          <div id="filter-section-price" className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-500" />
                <span>Khoảng giá (VNĐ)</span>
              </label>
              {hasPriceFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setSheetMin('');
                    setSheetMax('');
                    setTempFilters((p) => ({ ...p, priceCategory: 'all', minPrice: null, maxPrice: null }));
                  }}
                  className="text-[11px] text-amber-600 font-semibold hover:underline cursor-pointer"
                >
                  Xóa lọc giá
                </button>
              )}
            </div>

            {/* Nhập khoảng giá từ - đến */}
            <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Từ đ"
                    value={formatNumberWithDots(sheetMin)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      handlePriceRangeUpdate(raw, sheetMax);
                    }}
                    className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 text-center"
                  />
                </div>

                <span className="text-slate-400 font-bold text-sm shrink-0">-</span>

                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Đến đ"
                    value={formatNumberWithDots(sheetMax)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      handlePriceRangeUpdate(sheetMin, raw);
                    }}
                    className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Thương hiệu */}
          <div id="filter-section-brand" className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-500" />
                <span>Thương hiệu máy ảnh</span>
              </label>
              {tempFilters.brand !== 'all' && (
                <button
                  type="button"
                  onClick={() => setTempFilters((p) => ({ ...p, brand: 'all' }))}
                  className="text-[11px] text-amber-600 font-semibold hover:underline cursor-pointer"
                >
                  Mặc định
                </button>
              )}
            </div>
            {/* Lưới các thẻ thương hiệu */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {activeBrands.map((opt) => {
                const active = tempFilters.brand.toLowerCase() === opt.value.toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTempFilters((prev) => ({ ...prev, brand: opt.value }))}
                    className={`h-11 px-1.5 rounded-xl text-xs font-bold text-center transition-all border flex items-center justify-center cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/40'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="leading-tight truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Danh mục & Dòng máy */}
          <div id="filter-section-category" className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Danh mục sản phẩm</span>
              </label>
              {tempFilters.category !== 'all' && (
                <button
                  type="button"
                  onClick={() => setTempFilters((p) => ({ ...p, category: 'all' }))}
                  className="text-[11px] text-amber-600 font-semibold hover:underline cursor-pointer"
                >
                  Mặc định
                </button>
              )}
            </div>
            {/* Lưới 2 cột đều đặn: tất cả các thẻ có cùng chiều rộng 50% và chiều cao h-11 */}
            <div className="grid grid-cols-2 gap-2">
              {activeCategories.map((opt) => {
                const active = isCatActive(opt);
                return (
                  <button
                    key={`${opt.type}-${opt.value}`}
                    type="button"
                    onClick={() => handleCategorySelect(opt)}
                    className={`h-11 px-3 rounded-xl text-xs font-semibold text-center transition-all border flex items-center justify-center cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/40 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Sắp xếp */}
          <div id="filter-section-sort" className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-amber-500" />
              <span>Sắp xếp hiển thị</span>
            </label>
            {/* Lưới 3 cột: 3 thẻ đều nhau 1/3 hàng */}
            <div className="grid grid-cols-3 gap-2">
              {SORT_OPTIONS.map((opt) => {
                const active = tempFilters.sort === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTempFilters((prev) => ({ ...prev, sort: opt.value }))}
                    className={`h-11 px-1.5 rounded-xl text-xs font-semibold text-center transition-all border flex items-center justify-center cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Fixed Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thiết lập lại</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Áp dụng bộ lọc</span>
          </button>
        </div>
      </div>
    </div>
  );
}
