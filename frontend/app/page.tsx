'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FilterBar, {
  FilterState,
  PRICE_OPTIONS,
  BRAND_OPTIONS,
  SORT_OPTIONS,
} from '../components/FilterBar';
import ProductGrid from '../components/ProductGrid';
import CustomDropdown from '../components/CustomDropdown';
import FilterBottomSheet from '../components/FilterBottomSheet';
import Pagination from '../components/Pagination';
import { fetchProducts } from '../lib/api';
import { Product, FALLBACK_PRODUCTS } from '../lib/mockData';
import { Camera, SlidersHorizontal, RotateCcw, DollarSign, ArrowUpDown } from 'lucide-react';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catalogTopRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = parseInt(searchParams.get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FilterState>({
    priceCategory: searchParams.get('priceCategory') || 'all',
    brand: searchParams.get('brand') || 'all',
    category: searchParams.get('category') || 'all',
    deviceType: searchParams.get('deviceType') || 'all',
    sort: searchParams.get('sort') || 'newest',
  });

  const searchKeyword = searchParams.get('search') || '';

  // Fetch products whenever filters, search, or page changes
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
          page: currentPage,
          limit: 25, // 5x5
        });

        if (isMounted) {
          setProducts(res.products || []);
          setTotalCount(res.total || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        if (isMounted) {
          setProducts(FALLBACK_PRODUCTS.slice(0, 25));
          setTotalCount(FALLBACK_PRODUCTS.length);
          setTotalPages(Math.ceil(FALLBACK_PRODUCTS.length / 25));
        }
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
  }, [filters, searchKeyword, currentPage]);

  const updateUrl = (newFilters: FilterState, pageNum: number) => {
    const params = new URLSearchParams();
    if (searchKeyword) params.set('search', searchKeyword);
    if (newFilters.priceCategory !== 'all') params.set('priceCategory', newFilters.priceCategory);
    if (newFilters.brand !== 'all') params.set('brand', newFilters.brand);
    if (newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.deviceType !== 'all') params.set('deviceType', newFilters.deviceType);
    if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (pageNum > 1) params.set('page', pageNum.toString());

    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/', { scroll: false });
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateUrl(newFilters, 1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateUrl(filters, newPage);
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  const availableCategories = React.useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  // Mobile Bottom Sheet Filter state
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetSection, setBottomSheetSection] = useState<'all' | 'price' | 'brand' | 'sort' | 'category'>('all');

  const openFilterSheet = (section: 'all' | 'price' | 'brand' | 'sort' | 'category' = 'all') => {
    setBottomSheetSection(section);
    setIsBottomSheetOpen(true);
  };

  const activeFilterCount =
    (filters.priceCategory !== 'all' ? 1 : 0) +
    (filters.brand !== 'all' ? 1 : 0) +
    (filters.category !== 'all' || filters.deviceType !== 'all' ? 1 : 0) +
    (filters.sort !== 'newest' ? 1 : 0);

  const selectedPriceLabel = PRICE_OPTIONS.find((o) => o.value === filters.priceCategory)?.label || 'Khoảng giá';
  const selectedBrandLabel = BRAND_OPTIONS.find((o) => o.value === filters.brand)?.label || 'Thương hiệu';
  const selectedSortLabel = SORT_OPTIONS.find((o) => o.value === filters.sort)?.label || 'Sắp xếp';

  return (
    <div ref={catalogTopRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* 1. Filter Section (Danh mục sản phẩm) */}
      <section className="w-full">
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          totalCount={totalCount}
          availableCategories={availableCategories}
        />
      </section>

      {/* Search keyword display indicator */}
      {searchKeyword && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-800">
          <span>
            Kết quả tìm kiếm cho: <strong className="text-amber-700 font-mono">&ldquo;{searchKeyword}&rdquo;</strong> ({totalCount} máy)
          </span>
          <button
            onClick={() => {
              setCurrentPage(1);
              router.push('/');
            }}
            className="text-amber-700 hover:text-amber-900 underline font-semibold"
          >
            Xóa tìm kiếm
          </button>
        </div>
      )}

      {/* 2. Product Grid Section with 2 Sub-filters (Khoảng giá & Thương hiệu) */}
      <section className="space-y-4 w-full">
        {/* Header Bar:
            - Left: Title & Count
            - Mobile (< md): Single "Bộ lọc (+count)" button triggering Bottom Sheet
            - Desktop (>= md): 3 CustomDropdowns (Khoảng giá, Thương hiệu, Sắp xếp)
        */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          {/* Left Title */}
          <div className="flex items-center justify-between md:justify-start gap-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 whitespace-nowrap">
                  Danh mục máy ảnh đang có sẵn
                </h2>
              </div>
              <span className="text-[11px] sm:text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-300 px-2 sm:px-2.5 py-0.5 rounded-full shrink-0">
                {totalCount} máy
              </span>
            </div>

            {/* Mobile-only Filter Button (< md) */}
            <div className="flex md:hidden items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openFilterSheet('all')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                  activeFilterCount > 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25 ring-2 ring-amber-400/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Bộ lọc</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full bg-white text-amber-700 font-black text-[10px] shadow-xs">
                    +{activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop-only Custom Dropdowns (>= md): Khoảng giá, Thương hiệu, Sắp xếp */}
          <div className="hidden md:flex items-center gap-2.5 sm:gap-3 w-auto min-w-0">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors px-2 py-1.5 cursor-pointer inline-flex items-center gap-1"
                title="Xóa tất cả bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            )}

            {/* Bộ lọc 1: Khoảng giá */}
            <CustomDropdown
              options={PRICE_OPTIONS}
              value={filters.priceCategory}
              onChange={(val) => handleFilterChange({ ...filters, priceCategory: val })}
              icon={<DollarSign className="w-4 h-4 text-amber-600" />}
              placeholder="Tất cả khoảng giá"
            />

            {/* Bộ lọc 2: Thương hiệu */}
            <CustomDropdown
              options={BRAND_OPTIONS}
              value={filters.brand}
              onChange={(val) => handleFilterChange({ ...filters, brand: val })}
              icon={<SlidersHorizontal className="w-4 h-4 text-amber-600" />}
              placeholder="Tất cả hãng"
            />

            {/* Sắp xếp */}
            <CustomDropdown
              options={SORT_OPTIONS}
              value={filters.sort}
              onChange={(val) => handleFilterChange({ ...filters, sort: val })}
              icon={<ArrowUpDown className="w-4 h-4 text-slate-500" />}
              placeholder="Sắp xếp"
              align="right"
            />
          </div>
        </div>

        {/* Active Filter Chips (if any filter is selected) */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs px-1">
            <span className="text-slate-500 font-medium">Đang lọc:</span>
            {filters.priceCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-semibold text-xs">
                <span>{selectedPriceLabel}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, priceCategory: 'all' })}
                  className="hover:text-red-600 cursor-pointer text-slate-400 hover:scale-110 font-bold"
                  title="Bỏ lọc giá"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.brand !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-semibold text-xs">
                <span>{selectedBrandLabel}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, brand: 'all' })}
                  className="hover:text-red-600 cursor-pointer text-slate-400 hover:scale-110 font-bold"
                  title="Bỏ lọc thương hiệu"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-semibold text-xs">
                <span>{filters.category}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, category: 'all' })}
                  className="hover:text-red-600 cursor-pointer text-slate-400 hover:scale-110 font-bold"
                  title="Bỏ lọc danh mục"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.deviceType !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-semibold text-xs">
                <span>{filters.deviceType}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, deviceType: 'all' })}
                  className="hover:text-red-600 cursor-pointer text-slate-400 hover:scale-110 font-bold"
                  title="Bỏ lọc dòng máy"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.sort !== 'newest' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs">
                <span>{selectedSortLabel}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, sort: 'newest' })}
                  className="hover:text-red-600 cursor-pointer text-slate-400 hover:scale-110 font-bold"
                  title="Bỏ sắp xếp"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer ml-1"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Mobile Bottom Sheet Modal */}
        <FilterBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          filters={filters}
          onApply={handleFilterChange}
          totalCount={totalCount}
          availableCategories={availableCategories}
          initialSection={bottomSheetSection}
        />

        {/* Product Grid / Album View (4x4 = 16 items per page) */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          onResetFilters={handleReset}
        />

        {/* 3. Pagination Controls (4x4) */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
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
