'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type {
  FilterState,
  CategoryOption,
} from '../components/FilterBar';
import {
  PRICE_OPTIONS,
  BRAND_OPTIONS,
  SORT_OPTIONS,
  CATEGORY_OPTIONS,
} from '../components/FilterBar';
import ProductGrid from '../components/ProductGrid';
import CustomDropdown from '../components/CustomDropdown';
import PriceFilterDropdown from '../components/PriceFilterDropdown';
import FilterBottomSheet from '../components/FilterBottomSheet';
import Pagination from '../components/Pagination';
import { fetchProducts, fetchCategories } from '../lib/api';
import { Product, Category } from '../lib/mockData';
import { Camera, SlidersHorizontal, RotateCcw, DollarSign, ArrowUpDown, Layers } from 'lucide-react';

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
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null,
    brand: searchParams.get('brand') || 'all',
    category: searchParams.get('category') || 'all',
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
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          brand: filters.brand,
          category: filters.category,
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
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
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
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.priceCategory !== 'all') params.set('priceCategory', newFilters.priceCategory);
    if (newFilters.brand !== 'all') params.set('brand', newFilters.brand);
    if (newFilters.category !== 'all') params.set('category', newFilters.category);
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
      minPrice: null,
      maxPrice: null,
      brand: 'all',
      category: 'all',
      sort: 'newest',
    });
  };

  const [categoriesData, setCategoriesData] = useState<Category[]>([]);

  const reloadCategories = React.useCallback(() => {
    fetchCategories(undefined, true)
      .then((cats) => {
        if (Array.isArray(cats)) setCategoriesData(cats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    reloadCategories();

    // Cross-tab synchronization & auto-refresh on tab focus
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mayanhtop1_categories_updated') {
        reloadCategories();
      }
    };

    const handleFocus = () => {
      reloadCategories();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [reloadCategories]);

  const dynamicPriceOptions = React.useMemo(() => {
    const backendPrices = categoriesData.filter((c) => c.type === 'price');
    const list = [{ label: 'Tất cả khoảng giá', value: 'all' }];
    if (backendPrices.length > 0) {
      const seen = new Set(['all']);
      backendPrices.forEach((c) => {
        const val = c.slug || c.name;
        if (!seen.has(val.toLowerCase())) {
          seen.add(val.toLowerCase());
          list.push({ label: c.name, value: val });
        }
      });
    }
    return list;
  }, [categoriesData]);

  const dynamicBrandOptions = React.useMemo(() => {
    const backendBrands = categoriesData.filter((c) => c.type === 'brand');
    const list = [{ label: 'Tất cả hãng', value: 'all' }];
    const seen = new Set(['all']);

    backendBrands.forEach((b) => {
      const val = b.name.trim();
      if (val && !seen.has(val.toLowerCase())) {
        seen.add(val.toLowerCase());
        list.push({ label: val, value: val });
      }
    });

    products.forEach((p) => {
      if (p.brand && p.brand.trim() && !seen.has(p.brand.trim().toLowerCase())) {
        seen.add(p.brand.trim().toLowerCase());
        list.push({ label: p.brand.trim(), value: p.brand.trim() });
      }
    });

    return list;
  }, [categoriesData, products]);

  const dynamicCategoryOptions = React.useMemo(() => {
    const backendCategories = categoriesData.filter((c) => c.type === 'category');
    const list: CategoryOption[] = [{ label: 'Tất cả danh mục', value: 'all', type: 'all' }];
    const seen = new Set(['all']);

    backendCategories.forEach((c) => {
      const val = c.slug || c.name;
      if (!seen.has(val.toLowerCase())) {
        seen.add(val.toLowerCase());
        list.push({
          label: c.name,
          value: val,
          type: 'category',
        });
      }
    });

    products.forEach((p) => {
      if (p.category && p.category.trim() && !seen.has(p.category.trim().toLowerCase())) {
        seen.add(p.category.trim().toLowerCase());
        list.push({
          label: p.category.trim(),
          value: p.category.trim(),
          type: 'category',
        });
      }
    });

    return list;
  }, [categoriesData, products]);

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

  const hasPriceFilter =
    (filters.minPrice !== null && filters.minPrice !== undefined) ||
    (filters.maxPrice !== null && filters.maxPrice !== undefined) ||
    (filters.priceCategory && filters.priceCategory !== 'all');

  const activeFilterCount =
    (hasPriceFilter ? 1 : 0) +
    (filters.brand !== 'all' ? 1 : 0) +
    (filters.category !== 'all' ? 1 : 0) +
    (filters.sort !== 'newest' ? 1 : 0);

  const formatShortPrice = (num: number): string => {
    if (num >= 1000000) {
      const m = num / 1000000;
      return Number.isInteger(m) ? `${m} tr` : `${m.toFixed(1)} tr`;
    }
    return `${Math.round(num / 1000)}k`;
  };

  const selectedCategoryLabel =
    dynamicCategoryOptions.find((o) => o.value.toLowerCase() === filters.category.toLowerCase())?.label ||
    (filters.category === 'all' ? 'Tất cả danh mục' : filters.category);

  const selectedPriceLabel = React.useMemo(() => {
    if (filters.minPrice && filters.maxPrice) {
      return `${formatShortPrice(filters.minPrice)} - ${formatShortPrice(filters.maxPrice)}`;
    }
    if (filters.minPrice && !filters.maxPrice) {
      return `Từ ${formatShortPrice(filters.minPrice)}`;
    }
    if (!filters.minPrice && filters.maxPrice) {
      return `Dưới ${formatShortPrice(filters.maxPrice)}`;
    }
    if (filters.priceCategory && filters.priceCategory !== 'all') {
      const found = dynamicPriceOptions.find((o) => o.value === filters.priceCategory);
      if (found) return found.label;
    }
    return 'Khoảng giá';
  }, [filters.minPrice, filters.maxPrice, filters.priceCategory, dynamicPriceOptions]);
  const selectedBrandLabel =
    dynamicBrandOptions.find((o) => o.value.toLowerCase() === filters.brand.toLowerCase())?.label ||
    filters.brand ||
    'Thương hiệu';
  const selectedSortLabel = SORT_OPTIONS.find((o) => o.value === filters.sort)?.label || 'Sắp xếp';

  return (
    <div ref={catalogTopRef} className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 sm:pb-3 space-y-4 sm:space-y-6">
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

      {/* 2. Product Grid Section with 3 Sub-filters (Danh mục, Khoảng giá & Thương hiệu) */}
      <section className="space-y-4 w-full">
        {/* Header Bar:
            - Left: Title & Count
            - Mobile (< md): Single "Bộ lọc (+count)" button triggering Bottom Sheet
            - Tablet & Desktop (>= md): 4 CustomDropdowns (Danh mục, Khoảng giá, Thương hiệu, Sắp xếp)
        */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Top/Left: Title & Total Count (and Mobile-only Filter Button on < md) */}
          <div className="flex items-center justify-between gap-2 w-full lg:w-auto min-w-0">
            {/* Title & Count */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
              <h2 className="text-xs sm:text-base md:text-lg font-bold text-slate-900 truncate min-w-0">
                <span className="hidden sm:inline">Danh mục máy ảnh đang có sẵn</span>
                <span className="sm:hidden">Danh mục máy ảnh</span>
              </h2>
              <span className="text-[10px] sm:text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-300 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                {totalCount} máy
              </span>
            </div>

            {/* Mobile-only Filter Button (< md) */}
            <div className="flex md:hidden items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => openFilterSheet('all')}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 ${
                  activeFilterCount > 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25 ring-2 ring-amber-400/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">Bộ lọc</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full bg-white text-amber-700 font-black text-[10px] shadow-xs shrink-0">
                    +{activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tablet & Desktop Custom Dropdowns (>= md): Danh mục, Khoảng giá, Thương hiệu, Sắp xếp */}
          <div className="hidden md:flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto min-w-0">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors px-2 py-1.5 cursor-pointer inline-flex items-center gap-1 shrink-0"
                title="Xóa tất cả bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            )}

            {/* Bộ lọc 1: Danh mục sản phẩm (nằm bên trái filter dropdown tất cả khoảng giá) */}
            <CustomDropdown
              options={dynamicCategoryOptions}
              value={filters.category}
              onChange={(val) => handleFilterChange({ ...filters, category: val })}
              icon={<Layers className="w-4 h-4 text-amber-600" />}
              placeholder="Tất cả danh mục"
              className="flex-1 lg:flex-initial min-w-[130px]"
            />

            {/* Bộ lọc 2: Khoảng giá */}
            <PriceFilterDropdown
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              priceCategory={filters.priceCategory}
              onChange={(minPrice, maxPrice, priceCategory) => {
                handleFilterChange({
                  ...filters,
                  minPrice,
                  maxPrice,
                  priceCategory: priceCategory || 'all',
                });
              }}
              className="flex-1 lg:flex-initial min-w-[140px]"
            />

            {/* Bộ lọc 3: Thương hiệu */}
            <CustomDropdown
              options={dynamicBrandOptions}
              value={filters.brand}
              onChange={(val) => handleFilterChange({ ...filters, brand: val })}
              icon={<SlidersHorizontal className="w-4 h-4 text-amber-600" />}
              placeholder="Tất cả hãng"
              className="flex-1 lg:flex-initial min-w-[110px]"
            />

            {/* Sắp xếp */}
            <CustomDropdown
              options={SORT_OPTIONS}
              value={filters.sort}
              onChange={(val) => handleFilterChange({ ...filters, sort: val })}
              icon={<ArrowUpDown className="w-4 h-4 text-slate-500" />}
              placeholder="Sắp xếp"
              align="right"
              className="flex-1 lg:flex-initial min-w-[120px]"
            />
          </div>
        </div>

        {/* Active Filter Chips (if any filter is selected) */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs px-1">
            <span className="text-slate-500 font-medium">Đang lọc:</span>
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-semibold text-xs">
                <span>{selectedCategoryLabel}</span>
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
            {hasPriceFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-semibold text-xs">
                <span>{selectedPriceLabel}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, priceCategory: 'all', minPrice: null, maxPrice: null })}
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
          brandOptions={dynamicBrandOptions}
          categoryOptions={dynamicCategoryOptions}
          priceOptions={dynamicPriceOptions}
        />

        {/* Product Grid / Album View (4x4 = 16 items per page) */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          onResetFilters={handleReset}
        />

        {/* 3. Pagination Controls */}
        {!isLoading && products.length > 0 && (
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
