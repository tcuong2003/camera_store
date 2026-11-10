'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Layers, RotateCcw } from 'lucide-react';
import { fetchCategories } from '../lib/api';

export interface FilterState {
  priceCategory: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  brand: string;
  category: string;
  sort: string;
}

export interface CategoryOption {
  label: string;
  value: string;
  type: 'all' | 'category';
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  totalCount: number;
  availableCategories?: string[];
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { label: 'Tất cả danh mục', value: 'all', type: 'all' },
];

export const PRICE_OPTIONS = [
  { label: 'Tất cả khoảng giá', value: 'all' },
];

export const BRAND_OPTIONS = [
  { label: 'Tất cả hãng', value: 'all' },
];

export const SORT_OPTIONS = [
  { label: 'Mới cập nhật', value: 'newest' },
  { label: 'Giá: Thấp → Cao', value: 'price_asc' },
  { label: 'Giá: Cao → Thấp', value: 'price_desc' },
];

export default function FilterBar({ filters, onChange, totalCount, availableCategories }: FilterBarProps) {
  const [extraCats, setExtraCats] = useState<{ label: string; value: string; type?: 'category' }[]>([]);

  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          const custom = cats
            .filter((c) => c.type === 'category')
            .map((c) => ({
              label: c.name,
              value: c.slug || c.name,
              type: 'category' as const,
            }));
          setExtraCats(custom);
        } else {
          setExtraCats([]);
        }
      })
      .catch(() => {
        setExtraCats([]);
      });
  }, []);

  const allCategoryPills: CategoryOption[] = useMemo(() => {
    const list: CategoryOption[] = [{ label: 'Tất cả danh mục', value: 'all', type: 'all' }];
    const existingValues = new Set(['all']);

    extraCats.forEach((c) => {
      const val = (c.value || '').toLowerCase();
      if (val && !existingValues.has(val)) {
        existingValues.add(val);
        list.push({ label: c.label, value: c.value, type: 'category' });
      }
    });

    if (availableCategories) {
      availableCategories.forEach((cat) => {
        const val = (cat || '').toLowerCase();
        if (val && !existingValues.has(val)) {
          existingValues.add(val);
          list.push({ label: cat, value: cat, type: 'category' });
        }
      });
    }

    if (filters.category && filters.category !== 'all' && !existingValues.has(filters.category.toLowerCase())) {
      list.push({ label: filters.category, value: filters.category, type: 'category' });
    }

    return list;
  }, [extraCats, availableCategories, filters.category]);

  const isFiltered =
    filters.priceCategory !== 'all' ||
    (filters.minPrice !== undefined && filters.minPrice !== null) ||
    (filters.maxPrice !== undefined && filters.maxPrice !== null) ||
    filters.brand !== 'all' ||
    filters.category !== 'all';

  const resetFilters = () => {
    onChange({
      priceCategory: 'all',
      minPrice: null,
      maxPrice: null,
      brand: 'all',
      category: 'all',
      sort: 'newest',
    });
  };

  const handleCategorySelect = (opt: CategoryOption) => {
    if (opt.value === 'all') {
      onChange({ ...filters, category: 'all' });
    } else {
      onChange({ ...filters, category: opt.value });
    }
  };

  const isCatActive = (opt: CategoryOption) => {
    if (opt.value === 'all') return filters.category === 'all';
    return filters.category?.toLowerCase() === opt.value.toLowerCase();
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 w-full max-w-full overflow-hidden min-w-0">
      {/* Category Pills Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base">
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Danh mục sản phẩm</span>
        </div>

        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-semibold px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa tất cả lọc</span>
          </button>
        )}
      </div>

      {/* Category Pills List: strictly 1 single scrollable row on all screen sizes */}
      <div className="flex flex-nowrap items-center gap-2 py-1.5 w-full overflow-x-auto scrollbar-none touch-pan-x overscroll-contain">
        {allCategoryPills.map((opt) => {
          const active = isCatActive(opt);
          return (
            <button
              key={`${opt.type}-${opt.value}`}
              onClick={() => handleCategorySelect(opt)}
              className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
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
