'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FilterBar, { FilterState } from '../components/FilterBar';
import ProductGrid from '../components/ProductGrid';
import { fetchProducts } from '../lib/api';
import { Product } from '../lib/mockData';
import { Camera, Sparkles, MessageSquare, ShieldCheck, HeartHandshake, CheckCircle } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Hero Welcome Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Album Trưng Bày Thực Tế - Không Đăng Ảo</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Kho Máy Ảnh Tuyển Chọn <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              MÁY ẢNH TOP 1 SÀI GÒN
            </span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Xem trọn bộ album 5 - 10 ảnh ngoại hình tự chụp cho từng chiếc máy ảnh. Lọc nhanh theo tầm giá sinh viên đến chuyên nghiệp, chọn máy ưng ý chụp màn hình gửi Zalo <strong>0986.834.449</strong> chốt đơn ngay!
          </p>

          {/* Quick benefit pills */}
          <div className="pt-2 flex flex-wrap gap-3 text-xs text-stone-300 font-medium">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Bảo hành 06 tháng phần cứng
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Bao test 1 đổi 1 trong 7 ngày
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Đầy đủ pin, sạc, thẻ nhớ sẵn dùng
            </span>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section>
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          totalCount={totalCount}
        />
      </section>

      {/* Search keyword display indicator */}
      {searchKeyword && (
        <div className="flex items-center justify-between bg-stone-900 border border-amber-500/30 px-4 py-2.5 rounded-xl text-xs sm:text-sm">
          <span className="text-stone-300">
            Kết quả tìm kiếm cho: <strong className="text-amber-400 font-mono">"{searchKeyword}"</strong> ({totalCount} máy)
          </span>
          <button
            onClick={() => router.push('/')}
            className="text-amber-400 hover:text-white underline font-semibold"
          >
            Xóa tìm kiếm
          </button>
        </div>
      )}

      {/* Product Grid / Album View */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-500" />
            <span>Danh mục máy ảnh đang có sẵn</span>
          </h2>
          <span className="text-xs text-stone-400">
            Cập nhật liên tục mỗi ngày
          </span>
        </div>

        <ProductGrid
          products={products}
          isLoading={isLoading}
          onResetFilters={handleReset}
        />
      </section>

      {/* Simple 3-Step Purchase Guide Banner */}
      <section className="bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 sm:p-8">
        <h3 className="text-center text-lg sm:text-xl font-bold text-white mb-6">
          Quy trình chọn máy &amp; chốt đơn cực kỳ đơn giản
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-stone-900/90 border border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-3">
              1
            </div>
            <h4 className="font-bold text-stone-200 text-sm">Lướt xem album ảnh máy</h4>
            <p className="text-xs text-stone-400 mt-1">
              Bấm vào từng máy để xem kỹ từ 5 - 10 ảnh ngoại hình chụp thật, kiểm tra số shot, phụ kiện và tình trạng kính.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-stone-900/90 border border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-3">
              2
            </div>
            <h4 className="font-bold text-stone-200 text-sm">Chụp màn hình hoặc bấm Nhắn Zalo</h4>
            <p className="text-xs text-stone-400 mt-1">
              Bấm trực tiếp nút <strong>"Nhắn Zalo"</strong> tại sản phẩm hoặc tải ảnh về máy để gửi cho shop.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-stone-900/90 border border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-3">
              3
            </div>
            <h4 className="font-bold text-stone-200 text-sm">Tư vấn chi tiết &amp; Nhận máy</h4>
            <p className="text-xs text-stone-400 mt-1">
              Chủ shop tư vấn tận tình, ghé shop test trực tiếp hoặc nhận hàng ship COD mở hộp kiểm tra rồi thanh toán.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://zalo.me/0986834449"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl hover:shadow-blue-500/25 active:scale-95 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat Zalo với Chủ Shop: 0986.834.449</span>
          </a>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-400">Đang tải danh mục máy ảnh...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
