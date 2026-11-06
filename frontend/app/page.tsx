'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FilterBar, {
  FilterState,
  PRICE_OPTIONS,
  BRAND_OPTIONS,
  SORT_OPTIONS,
} from '../components/FilterBar';
import ProductGrid from '../components/ProductGrid';
import { fetchProducts } from '../lib/api';
import { Product } from '../lib/mockData';
import { Camera, DollarSign, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FilterState>({
    priceCategory: searchParams.get('priceCategory') || 'all',
    brand: searchParams.get('brand') || 'all',
    category: searchParams.get('category') || 'all',
    deviceType: searchParams.get('deviceType') || 'all',
    sort: searchParams.get('sort') || 'newest',
  });

  const searchKeyword = searchParams.get('search') || '';

  // Fetch products whenever filters or search query change
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await fetchProducts({
          search: searchKeyword,
          priceCategory: filters.priceCategory,
          brand: filters.brand,
          category: filters.category,
          deviceType: filters.deviceType,
          sort: filters.sort,
        });

        if (isMounted) {
          setProducts(res.products || []);
          setTotalCount(res.total || 0);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [filters, searchKeyword]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Sync URL search params
    const params = new URLSearchParams();
    if (searchKeyword) params.set('search', searchKeyword);
    if (newFilters.priceCategory !== 'all') params.set('priceCategory', newFilters.priceCategory);
    if (newFilters.brand !== 'all') params.set('brand', newFilters.brand);
    if (newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.deviceType !== 'all') params.set('deviceType', newFilters.deviceType);
    if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);

    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/', { scroll: false });
  };

  const handleReset = () => {
    handleFilterChange({
      priceCategory: 'all',
      brand: 'all',
      category: 'all',
      deviceType: 'all',
      sort: 'newest',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
      {/* 1. Filter Section (Danh mục sản phẩm) */}
      <section>
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          totalCount={totalCount}
        />
      </section>

      {/* Search keyword display indicator */}
      {searchKeyword && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-800">
          <span>
            Kết quả tìm kiếm cho: <strong className="text-amber-700 font-mono">"{searchKeyword}"</strong> ({totalCount} máy)
          </span>
          <button
            onClick={() => router.push('/')}
            className="text-amber-700 hover:text-amber-900 underline font-semibold"
          >
            Xóa tìm kiếm
          </button>
        </div>
      )}

      {/* 2. Product Grid Section with 2 Sub-filters (Khoảng giá & Thương hiệu) */}
      <section className="space-y-4">
        {/* Header Bar: Title + 2 Filters (Tầm giá & Thương hiệu) + Sắp xếp */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Title */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" />
              <span>Danh mục máy ảnh đang có sẵn</span>
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-300 px-2.5 py-0.5 rounded-full">
                {totalCount} máy
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật liên tục mỗi ngày
            </p>
          </div>

          {/* Right: 2 Sub-Filters (Khoảng giá, Thương hiệu) & Sắp xếp */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Bộ lọc 1: Khoảng giá (Từ đâu đến đâu) */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-amber-500">
              <DollarSign className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <select
                aria-label="Khoảng giá"
                value={filters.priceCategory}
                onChange={(e) => handleFilterChange({ ...filters, priceCategory: e.target.value })}
                className="bg-transparent text-xs sm:text-sm text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
              >
                {PRICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bộ lọc 2: Thương hiệu */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-amber-500">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <select
                aria-label="Thương hiệu"
                value={filters.brand}
                onChange={(e) => handleFilterChange({ ...filters, brand: e.target.value })}
                className="bg-transparent text-xs sm:text-sm text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
              >
                {BRAND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-amber-500">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                aria-label="Sắp xếp"
                value={filters.sort}
                onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
                className="bg-transparent text-xs sm:text-sm text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid / Album View */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          onResetFilters={handleReset}
        />
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Đang tải danh mục máy ảnh...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
