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
import { Camera, DollarSign, SlidersHorizontal, ArrowUpDown, ChevronDown } from 'lucide-react';

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
        {/* Header Bar: Title + 2 Custom Dropdowns (Khoảng giá & Thương hiệu) + Sắp xếp */}
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

          {/* Mobile Filter Action Bar (< md): Pills opening Bottom Sheet Modal */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x w-full">
            {/* Primary trigger button */}
            <button
              type="button"
              onClick={() => openFilterSheet('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                activeFilterCount > 0
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/40'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Bộ lọc</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-amber-600 text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Price Pill */}
            <button
              type="button"
              onClick={() => openFilterSheet('price')}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs shrink-0 transition-all border cursor-pointer ${
                filters.priceCategory !== 'all'
                  ? 'bg-amber-50 text-amber-700 border-amber-300 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              <span className="max-w-[120px] truncate">
                {filters.priceCategory !== 'all' ? selectedPriceLabel : 'Khoảng giá'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Brand Pill */}
            <button
              type="button"
              onClick={() => openFilterSheet('brand')}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs shrink-0 transition-all border cursor-pointer ${
                filters.brand !== 'all'
                  ? 'bg-amber-50 text-amber-700 border-amber-300 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-amber-500" />
              <span className="max-w-[100px] truncate">
                {filters.brand !== 'all' ? selectedBrandLabel : 'Thương hiệu'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Sort Pill */}
            <button
              type="button"
              onClick={() => openFilterSheet('sort')}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs shrink-0 transition-all border cursor-pointer ${
                filters.sort !== 'newest'
                  ? 'bg-slate-900 text-white border-slate-900 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="max-w-[110px] truncate">{selectedSortLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Desktop Filter Dropdowns (>= md) */}
          <div className="hidden md:flex items-center gap-2.5 sm:gap-3 w-auto min-w-0">
            {/* Bộ lọc 1: Khoảng giá (Từ đâu đến đâu) */}
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
              placeholder="Tất cả thương hiệu"
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
