'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type {
  FilterState,
  CategoryOption,
} from './FilterBar';
import {
  PRICE_OPTIONS,
  BRAND_OPTIONS,
  SORT_OPTIONS,
  CATEGORY_OPTIONS,
} from './FilterBar';
import ProductGrid from './ProductGrid';
import CustomDropdown from './CustomDropdown';
import PriceFilterDropdown from './PriceFilterDropdown';
import FilterBottomSheet from './FilterBottomSheet';
import Pagination from './Pagination';
import { fetchProducts, fetchCategories } from '../lib/api';
import { Product, Category } from '../lib/mockData';
import { Camera, SlidersHorizontal, RotateCcw, DollarSign, ArrowUpDown, Layers } from 'lucide-react';

interface CatalogClientProps {
  initialProducts?: Product[];
  initialTotalCount?: number;
  initialTotalPages?: number;
  initialCategories?: Category[];
}

// In-memory module cache to instantly preserve exact product state during client-side navigation
let memoryProductsCache: Product[] | null = null;
let memoryTotalCount = 0;
let memoryTotalPages = 1;

export default function CatalogClient({
  initialProducts = [],
  initialTotalCount = 0,
  initialTotalPages = 1,
  initialCategories = [],
}: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catalogTopRef = useRef<HTMLDivElement>(null);

  // Read initial cache from localStorage/sessionStorage for instant 0.05s client transitions
  const getCachedState = () => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('mayanhtop1_cached_products') || sessionStorage.getItem('mayanhtop1_cached_products');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return null;
  };

  const cached = getCachedState();

  const saveToCache = (productsData: Product[], total: number, pages: number) => {
    memoryProductsCache = productsData;
    memoryTotalCount = total;
    memoryTotalPages = pages;
    if (typeof window === 'undefined') return;
    try {
      const payload = JSON.stringify({
        products: productsData,
        total,
        totalPages: pages,
        time: Date.now(),
      });
      localStorage.setItem('mayanhtop1_cached_products', payload);
      sessionStorage.setItem('mayanhtop1_cached_products', payload);
    } catch {}
  };

  // Initialize product state: priority: In-memory RAM -> SSR props -> localStorage cache -> empty
  const [products, setProducts] = useState<Product[]>(() => {
    if (memoryProductsCache && memoryProductsCache.length > 0) return memoryProductsCache;
    if (initialProducts && initialProducts.length > 0) return initialProducts;
    if (cached?.products) return cached.products;
    return [];
  });

  const [totalCount, setTotalCount] = useState<number>(() => {
    if (memoryProductsCache && memoryProductsCache.length > 0) return memoryTotalCount;
    if (initialTotalCount > 0) return initialTotalCount;
    if (cached?.total !== undefined) return cached.total;
    return initialProducts?.length || 0;
  });

  const [totalPages, setTotalPages] = useState<number>(() => {
    if (memoryProductsCache && memoryProductsCache.length > 0) return memoryTotalPages;
    if (initialTotalPages > 0) return initialTotalPages;
    if (cached?.totalPages !== undefined) return cached.totalPages;
    return 1;
  });

  // If we already have products (from Memory, SSR or Cache), do NOT display skeleton on initial mount!
  const hasInitialData =
    (memoryProductsCache && memoryProductsCache.length > 0) ||
    (initialProducts && initialProducts.length > 0) ||
    (cached && cached.products?.length > 0);
  const [isLoading, setIsLoading] = useState<boolean>(!hasInitialData);

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

  const [searchKeyword, setSearchKeyword] = useState<string>(() => searchParams.get('search') || '');
  const isFirstLoadRef = useRef(true);

  // Sync searchKeyword when searchParams changes (e.g. forward/back browser buttons)
  useEffect(() => {
    const fromUrl = searchParams.get('search') || '';
    if (fromUrl !== searchKeyword) {
      setSearchKeyword(fromUrl);
    }
  }, [searchParams]);

  // Listen to realtime header search events for 0ms reactivity
  useEffect(() => {
    const handleHeaderSearch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setSearchKeyword(customEvent.detail || '');
      setCurrentPage(1);
    };

    window.addEventListener('header-search', handleHeaderSearch);
    return () => {
      window.removeEventListener('header-search', handleHeaderSearch);
    };
  }, []);

  // Save SSR initial data to client cache on mount or recover from local cache
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      saveToCache(initialProducts, initialTotalCount, initialTotalPages);
    } else if (products.length === 0) {
      const c = getCachedState();
      if (c && c.products?.length > 0) {
        setProducts(c.products);
        setTotalCount(c.total || c.products.length);
        setTotalPages(c.totalPages || 1);
        setIsLoading(false);
      }
    }
  }, [initialProducts, initialTotalCount, initialTotalPages]);

  // Fetch / Revalidate products (Stale-While-Revalidate)
  useEffect(() => {
    let isMounted = true;

    const hasActiveFilters =
      Boolean(searchKeyword.trim()) ||
      filters.priceCategory !== 'all' ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      filters.brand !== 'all' ||
      filters.category !== 'all' ||
      filters.sort !== 'newest' ||
      currentPage > 1;

    // If we already have products on screen (whether from RAM, SSR or cache),
    // do NOT show skeleton! Revalidate quietly in the background!
    const hasCurrentProducts = products.length > 0 || hasInitialData;
    const shouldRevalidateSilently = hasCurrentProducts && (!hasActiveFilters || isFirstLoadRef.current);

    if (!shouldRevalidateSilently) {
      setIsLoading(true);
    }

    const loadData = async () => {
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
          const newProducts = res.products || [];

          // Safe reconciliation: only update state if products actually changed to prevent any jitter/flicker
          setProducts((prev) => {
            if (
              prev.length === newProducts.length &&
              prev.every((p, i) => p._id === newProducts[i]?._id && p.updatedAt === newProducts[i]?.updatedAt)
            ) {
              return prev; // SAME ARRAY REFERENCE -> React skips re-render completely!
            }
            return newProducts;
          });

          setTotalCount(res.total || newProducts.length);
          setTotalPages(res.totalPages || 1);

          // Update cache if on default homepage
          if (!hasActiveFilters && currentPage === 1) {
            saveToCache(newProducts, res.total || newProducts.length, res.totalPages || 1);
          }
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        if (isMounted && !hasInitialData) {
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          isFirstLoadRef.current = false;
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [filters, searchKeyword, currentPage]);

  const updateUrl = (newFilters: FilterState, pageNum: number, searchWord: string = searchKeyword) => {
    const params = new URLSearchParams();
    if (searchWord.trim()) params.set('search', searchWord.trim());
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.priceCategory !== 'all') params.set('priceCategory', newFilters.priceCategory);
    if (newFilters.brand !== 'all') params.set('brand', newFilters.brand);
    if (newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (pageNum > 1) params.set('page', pageNum.toString());

    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : '/', { scroll: false });
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
    setSearchKeyword('');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('header-search', { detail: '' }));
    }
    const newFilters: FilterState = {
      priceCategory: 'all',
      minPrice: null,
      maxPrice: null,
      brand: 'all',
      category: 'all',
      sort: 'newest',
    };
    setFilters(newFilters);
    setCurrentPage(1);
    router.replace('/', { scroll: false });
  };

  // Categories state with SSR initialization
  const [categoriesData, setCategoriesData] = useState<Category[]>(() => {
    if (initialCategories && initialCategories.length > 0) return initialCategories;
    return [];
  });

  const reloadCategories = useCallback(() => {
    fetchCategories(undefined, true)
      .then((cats) => {
        if (Array.isArray(cats)) setCategoriesData(cats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    reloadCategories();
    window.addEventListener('focus', reloadCategories);
    return () => window.removeEventListener('focus', reloadCategories);
  }, [reloadCategories]);

  useEffect(() => {
    // Cross-tab synchronization when admin clears cache
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mayanhtop1_categories_updated' || e.key === 'mayanhtop1_cache_cleared_at') {
        reloadCategories();
        // Trigger fresh products re-fetch
        fetchProducts({
          search: searchKeyword,
          priceCategory: filters.priceCategory,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          brand: filters.brand,
          category: filters.category,
          sort: filters.sort,
          page: currentPage,
          limit: 25,
        }).then((res) => {
          if (res.products) {
            setProducts(res.products);
            setTotalCount(res.total || res.products.length);
          }
        });
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [reloadCategories, filters, searchKeyword, currentPage]);

  const dynamicPriceOptions = useMemo(() => {
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

  const dynamicBrandOptions = useMemo(() => {
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

  const dynamicCategoryOptions = useMemo(() => {
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

  const availableCategories = useMemo(() => {
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

  return (
    <div ref={catalogTopRef} className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 sm:pb-3 space-y-4 sm:space-y-6">
      {/* 2. Product Grid Section with 3 Sub-filters (Danh mục, Khoảng giá & Thương hiệu) */}
      <section className="space-y-4 w-full">
        {/* Header Bar */}
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

            {/* Bộ lọc 1: Danh mục sản phẩm */}
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

        {/* Product Grid / Album View */}
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
