'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Edit,
  Lock,
  LogOut,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  PackageCheck,
  PackageX,
  X,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import {
  adminLogin,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUploadImages,
  adminCreateCategory,
  fetchProducts,
  fetchCategories,
  formatVND,
} from '../../lib/api';
import { Product, Category, FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from '../../lib/mockData';
import CustomDropdown, { DropdownOption } from '../../components/CustomDropdown';
import RichTextEditor from '../../components/RichTextEditor';

export default function AdminPage() {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<string>('admin');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  // Product management state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Admin filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'sold'>('all');
  const [adminPage, setAdminPage] = useState(1);
  const pageSize = 15;

  // Form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [displayPrice, setDisplayPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [displayOriginalPrice, setDisplayOriginalPrice] = useState('');
  const [brand, setBrand] = useState('Sony');
  const [category, setCategory] = useState('may-anh-cu');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);

  // User-added custom brands & categories in dropdown
  const [extraBrands, setExtraBrands] = useState<string[]>([]);
  const [extraCategories, setExtraCategories] = useState<{ label: string; value: string }[]>([]);

  // Fallback / preserved internal fields
  const [condition, setCondition] = useState('Ngoại hình đẹp - Hoạt động hoàn hảo');
  const [deviceType, setDeviceType] = useState('Mirrorless');
  const [accessories, setAccessories] = useState('Đầy đủ pin, sạc, dây đeo sẵn dùng');
  const [warranty, setWarranty] = useState('Bảo hành 06 tháng phần cứng - Bao test 07 ngày lỗi 1 đổi 1');

  // Multi-image upload state
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category management state
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'brand' | 'price' | 'category' | 'device_type'>('brand');

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  // Load token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('mayanhtop1_admin_token');
    const savedUser = localStorage.getItem('mayanhtop1_admin_user');
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) setAdminUser(savedUser);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (token) {
      loadProductsList();
      loadCategoriesList();
    }
  }, [token]);

  const loadProductsList = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetchProducts({ limit: 500 });
      setProducts(res.products || FALLBACK_PRODUCTS);
    } catch (err) {
      console.error(err);
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadCategoriesList = async () => {
    try {
      const cats = await fetchCategories();
      setCategories(cats || FALLBACK_CATEGORIES);
    } catch (err) {
      setCategories(FALLBACK_CATEGORIES);
    }
  };

  // Auth login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await adminLogin(usernameInput, passwordInput);
      if (res.success && res.token) {
        localStorage.setItem('mayanhtop1_admin_token', res.token);
        localStorage.setItem('mayanhtop1_admin_user', res.admin?.username || 'admin');
        setToken(res.token);
        setAdminUser(res.admin?.username || 'admin');
      } else {
        if (usernameInput === 'admin' && passwordInput === 'mayanhtop1@2026') {
          const fakeToken = 'offline_admin_token_2026';
          localStorage.setItem('mayanhtop1_admin_token', fakeToken);
          setToken(fakeToken);
          setAdminUser('admin');
        } else {
          setLoginError(res.message || 'Tài khoản hoặc mật khẩu không chính xác');
        }
      }
    } catch (err) {
      if (usernameInput === 'admin' && passwordInput === 'mayanhtop1@2026') {
        const fakeToken = 'offline_admin_token_2026';
        localStorage.setItem('mayanhtop1_admin_token', fakeToken);
        setToken(fakeToken);
        setAdminUser('admin');
      } else {
        setLoginError('Không thể kết nối đến máy chủ backend. Vui lòng kiểm tra cổng 5001');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mayanhtop1_admin_token');
    localStorage.removeItem('mayanhtop1_admin_user');
    setToken(null);
  };

  // Helper to format numbers with dots (e.g. 7800000 -> 7.800.000)
  const formatWithDots = (val: number | string) => {
    if (!val && val !== 0) return '';
    const clean = String(val).replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(clean));
  };

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setPrice('');
      setDisplayPrice('');
      return;
    }
    const num = Number(raw);
    setPrice(num);
    setDisplayPrice(formatWithDots(num));
  };

  const handleOriginalPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setOriginalPrice('');
      setDisplayOriginalPrice('');
      return;
    }
    const num = Number(raw);
    setOriginalPrice(num);
    setDisplayOriginalPrice(formatWithDots(num));
  };

  // Open modal for new product
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingProduct(null);
    setName('');
    setPrice('');
    setDisplayPrice('');
    setOriginalPrice('');
    setDisplayOriginalPrice('');
    setBrand('Sony');
    setCategory('may-anh-cu');
    setDescription('');
    setCondition('Ngoại hình đẹp - Hoạt động hoàn hảo');
    setDeviceType('Mirrorless');
    setAccessories('Đầy đủ pin, sạc, dây đeo sẵn dùng');
    setWarranty('Bảo hành 06 tháng phần cứng - Bao test 07 ngày lỗi 1 đổi 1');
    setImages([]);
    setIsAvailable(true);
    setFeatured(false);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (p: Product) => {
    setModalMode('edit');
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price);
    setDisplayPrice(p.price ? formatWithDots(p.price) : '');
    setOriginalPrice(p.originalPrice || '');
    setDisplayOriginalPrice(p.originalPrice ? formatWithDots(p.originalPrice) : '');
    setBrand(p.brand);
    setCategory(p.category);
    setDescription(p.description || '');
    setCondition(p.condition || 'Ngoại hình đẹp - Hoạt động hoàn hảo');
    setDeviceType(p.deviceType || 'Mirrorless');
    setAccessories(p.accessories || '');
    setWarranty(p.warranty || '');
    setImages(p.images || []);
    setIsAvailable(p.isAvailable);
    setFeatured(p.featured || false);
    setIsModalOpen(true);
  };

  // Toggle availability inline
  const handleToggleAvailability = async (p: Product) => {
    const updatedStatus = !p.isAvailable;
    try {
      await adminUpdateProduct(p._id, { isAvailable: updatedStatus }, token || '');
      setProducts(products.map((item) => (item._id === p._id ? { ...item, isAvailable: updatedStatus } : item)));
    } catch (err) {
      setProducts(products.map((item) => (item._id === p._id ? { ...item, isAvailable: updatedStatus } : item)));
    }
  };

  // Drag and Drop Upload Handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    if (images.length + files.length > 15) {
      alert('Tối đa 15 ảnh cho mỗi sản phẩm.');
      return;
    }

    setUploadingImages(true);
    setUploadProgress(20);

    try {
      const res = await adminUploadImages(files, token || '');
      setUploadProgress(80);

      if (res.success && res.urls) {
        setImages((prev) => [...prev, ...res.urls]);
      } else {
        const localUrls = files.map((f) => URL.createObjectURL(f));
        setImages((prev) => [...prev, ...localUrls]);
      }
      setUploadProgress(100);
    } catch (err) {
      const localUrls = files.map((f) => URL.createObjectURL(f));
      setImages((prev) => [...prev, ...localUrls]);
    } finally {
      setTimeout(() => {
        setUploadingImages(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  // Helper to auto-calculate price category
  const calcPriceCat = (p: number): 'under_3m' | '3m_5m' | '5m_10m' | 'above_10m' => {
    if (p < 3000000) return 'under_3m';
    if (p <= 5000000) return '3m_5m';
    if (p <= 10000000) return '5m_10m';
    return 'above_10m';
  };

  // Submit product create/edit
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price === '') {
      alert('Vui lòng nhập đầy đủ tên máy và giá bán');
      return;
    }

    if (images.length === 0) {
      alert('Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm');
      return;
    }

    const autoPriceCategory = calcPriceCat(Number(price));
    const autoDeviceType =
      category === 'ong-kinh'
        ? 'Lens'
        : category === 'phu-kien'
        ? 'Accessory'
        : deviceType || 'Mirrorless';

    const payload: Partial<Product> = {
      name,
      price: Number(price),
      originalPrice: originalPrice !== '' ? Number(originalPrice) : 0,
      condition: condition || 'Ngoại hình đẹp - Hoạt động hoàn hảo',
      brand,
      priceCategory: autoPriceCategory,
      category,
      deviceType: autoDeviceType,
      accessories: accessories || 'Đầy đủ phụ kiện theo máy',
      warranty: warranty || 'Bảo hành 06 tháng phần cứng - Bao test 07 ngày lỗi 1 đổi 1',
      description,
      images,
      isAvailable,
      featured,
    };

    try {
      if (modalMode === 'create') {
        const res = await adminCreateProduct(payload, token || '');
        if (res.success && res.product) {
          setProducts([res.product, ...products]);
        } else {
          alert('Không thể lưu sản phẩm lên máy chủ: ' + (res.message || 'Lỗi không xác định'));
          return;
        }
      } else if (modalMode === 'edit' && editingProduct) {
        const res = await adminUpdateProduct(editingProduct._id, payload, token || '');
        if (res.success && res.product) {
          setProducts(products.map((p) => (p._id === editingProduct._id ? res.product : p)));
        } else {
          alert('Không thể cập nhật sản phẩm: ' + (res.message || 'Lỗi không xác định'));
          return;
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Lỗi lưu sản phẩm: ' + String(err));
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi kho?`)) return;

    try {
      await adminDeleteProduct(id, token || '');
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      setProducts(products.filter((p) => p._id !== id));
    }
  };

  // Category Add
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      type: newCatType,
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
  };

  const handleDeleteCategory = (index: number) => {
    setCategories(categories.filter((_, idx) => idx !== index));
  };

  // Filtering products for the admin table
  const filteredProducts = products.filter((p) => {
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const match =
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        (p.condition && p.condition.toLowerCase().includes(s)) ||
        (p.slug && p.slug.toLowerCase().includes(s));
      if (!match) return false;
    }
    if (filterBrand !== 'all' && p.brand.toLowerCase() !== filterBrand.toLowerCase()) {
      return false;
    }
    if (filterCategory !== 'all' && p.category !== filterCategory) {
      return false;
    }
    if (filterStatus === 'available' && !p.isAvailable) return false;
    if (filterStatus === 'sold' && p.isAvailable) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice((adminPage - 1) * pageSize, adminPage * pageSize);

  // Statistics
  const totalCount = products.length;
  const availableCount = products.filter((p) => p.isAvailable).length;
  const soldCount = totalCount - availableCount;
  const brandCount = new Set(products.map((p) => p.brand)).size;

  // Distinct brand list for filtering
  const allBrands = Array.from(new Set([...products.map((p) => p.brand), ...extraBrands])).filter(Boolean);

  // Options for CustomDropdowns
  const baseBrandOptions: DropdownOption[] = [
    { label: 'Sony', value: 'Sony' },
    { label: 'Canon', value: 'Canon' },
    { label: 'Fujifilm', value: 'Fujifilm' },
    { label: 'Nikon', value: 'Nikon' },
    { label: 'Lumix', value: 'Lumix' },
    { label: 'Olympus', value: 'Olympus' },
    { label: 'Ricoh', value: 'Ricoh' },
    { label: 'Casio', value: 'Casio' },
    { label: 'Leica', value: 'Leica' },
    { label: 'Sigma', value: 'Sigma' },
    { label: 'Tamron', value: 'Tamron' },
    { label: 'Kingma', value: 'Kingma' },
    { label: 'SanDisk', value: 'SanDisk' },
    { label: 'Khác', value: 'Khác' },
  ];

  // Merge extra user-added brands
  const allBrandOptions: DropdownOption[] = [
    ...extraBrands.map((b) => ({ label: b, value: b })),
    ...baseBrandOptions.filter((opt) => !extraBrands.includes(opt.value)),
  ];

  const baseCategoryOptions: DropdownOption[] = [
    { label: 'Máy ảnh cũ', value: 'may-anh-cu' },
    { label: 'Máy ảnh chính hãng', value: 'may-anh-chinh-hang' },
    { label: 'Ống kính (Lens)', value: 'ong-kinh' },
    { label: 'Phụ kiện máy ảnh', value: 'phu-kien' },
    { label: 'Mirrorless', value: 'Mirrorless' },
    { label: 'DSLR', value: 'DSLR' },
    { label: 'Compact / Y2K', value: 'Compact' },
  ];

  const allCategoryOptions: DropdownOption[] = useMemo(() => {
    const list: DropdownOption[] = [...extraCategories];
    const seen = new Set(list.map((c) => c.value.toLowerCase()));

    categories
      .filter((c) => c.type === 'category')
      .forEach((c) => {
        const slug = c.slug || c.name;
        if (!seen.has(slug.toLowerCase())) {
          seen.add(slug.toLowerCase());
          list.push({ label: c.name, value: slug });
        }
      });

    products.forEach((p) => {
      if (p.category && !seen.has(p.category.toLowerCase())) {
        seen.add(p.category.toLowerCase());
        list.push({ label: p.category, value: p.category });
      }
    });

    baseCategoryOptions.forEach((opt) => {
      if (!seen.has(opt.value.toLowerCase())) {
        seen.add(opt.value.toLowerCase());
        list.push(opt);
      }
    });

    return list;
  }, [extraCategories, categories, products]);

  const filterBrandOptions: DropdownOption[] = [
    { label: 'Tất cả hãng', value: 'all' },
    ...allBrands.map((b) => ({ label: b, value: b })),
  ];

  const filterCategoryOptions: DropdownOption[] = [
    { label: 'Tất cả danh mục', value: 'all' },
    ...allCategoryOptions,
  ];

  const filterStatusOptions: DropdownOption[] = [
    { label: 'Tất cả trạng thái', value: 'all' },
    { label: 'Đang sẵn hàng', value: 'available' },
    { label: 'Đã bán', value: 'sold' },
  ];

  const catTypeOptions: DropdownOption[] = [
    { label: 'Thương hiệu (Brand)', value: 'brand' },
    { label: 'Tầm giá (Price)', value: 'price' },
    { label: 'Danh mục chính', value: 'category' },
    { label: 'Định dạng máy', value: 'device_type' },
  ];

  // If not logged in, render Admin Login screen
  if (!token) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/logo.png"
              alt="Logo MÁY ẢNH TOP 1"
              className="w-16 h-16 object-contain mx-auto mb-2"
            />
            <h1 className="text-2xl font-black text-slate-900">Quản trị MÁY ẢNH TOP 1</h1>
            <p className="text-xs text-slate-500">
              Đăng nhập để thêm, sửa, xóa máy ảnh và cập nhật album ảnh ngoại hình
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên đăng nhập Admin
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? 'Đang xác thực...' : 'Đăng nhập Quản trị viên'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            Tài khoản mặc định: <code className="text-amber-600 font-mono font-bold">admin</code> / <code className="text-amber-600 font-mono font-bold">mayanhtop1@2026</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Admin Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 font-bold">
              Admin Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Bảng Điều Khiển Danh Mục Máy Ảnh
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Xem trang khách</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs sm:text-sm font-semibold border border-rose-200 transition-colors shadow-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất ({adminUser})</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng máy ảnh</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{totalCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Available */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang sẵn hàng</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight mt-1">{availableCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <PackageCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Sold */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đã chốt bán</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-500 tracking-tight mt-1">{soldCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
            <PackageX className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Brands Count */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thương hiệu</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight mt-1">
              {brandCount} <span className="text-sm font-semibold text-slate-500">hãng</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* PRODUCT MANAGEMENT */}
      <div className="space-y-4">
          {/* Action & Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm máy theo tên, model, hãng, tình trạng..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setAdminPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setAdminPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Synchronized Custom Dropdowns & Add Button */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Brand Filter */}
                <CustomDropdown
                  options={filterBrandOptions}
                  value={filterBrand}
                  onChange={(val) => {
                    setFilterBrand(val);
                    setAdminPage(1);
                  }}
                />

                {/* Category Filter */}
                <CustomDropdown
                  options={filterCategoryOptions}
                  value={filterCategory}
                  onChange={(val) => {
                    setFilterCategory(val);
                    setAdminPage(1);
                  }}
                />

                {/* Status Filter */}
                <CustomDropdown
                  options={filterStatusOptions}
                  value={filterStatus}
                  onChange={(val) => {
                    setFilterStatus(val as any);
                    setAdminPage(1);
                  }}
                />

                {/* Add New Button */}
                <button
                  onClick={handleOpenCreate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Máy Mới</span>
                </button>
              </div>
            </div>

            {/* Filter result feedback */}
            {(searchTerm || filterBrand !== 'all' || filterCategory !== 'all' || filterStatus !== 'all') && (
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>
                  Tìm thấy <strong className="text-slate-800">{filteredProducts.length}</strong> sản phẩm phù hợp
                </span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBrand('all');
                    setFilterCategory('all');
                    setFilterStatus('all');
                    setAdminPage(1);
                  }}
                  className="text-amber-600 hover:underline font-semibold cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>

          {/* Product Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 text-left">Ảnh &amp; Tên sản phẩm</th>
                    <th className="py-3.5 px-4 text-center">Hãng</th>
                    <th className="py-3.5 px-4 text-center">Giá bán</th>
                    <th className="py-3.5 px-4 text-center">Kho ảnh</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p) => (
                      <tr key={p._id || p.slug} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images?.[0] || 'https://via.placeholder.com/80'}
                              alt={p.name}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200 shadow-2xs"
                            />
                            <div className="min-w-0 max-w-[280px] sm:max-w-sm">
                              <Link
                                href={`/san-pham/${p.slug}`}
                                target="_blank"
                                className="font-bold text-slate-900 hover:text-amber-600 line-clamp-2 flex items-center gap-1.5 transition-colors"
                              >
                                <span>{p.name}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap inline-block">
                            {p.brand}
                          </span>
                        </td>
                        {/* Price formatted CellphoneS style (bold red with dots) */}
                        <td className="py-3.5 px-4 text-center font-extrabold text-red-600 whitespace-nowrap text-sm sm:text-base tracking-tight">
                          {formatVND(p.price)}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs font-mono text-slate-500 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 inline-block">
                            {p.images?.length || 0} ảnh
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(p)}
                            title="Bấm để đổi trạng thái Đang bán / Đã bán"
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                              p.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                p.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                              }`}
                            ></span>
                            <span>{p.isAvailable ? 'Đang bán' : 'Đã bán'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-600 transition-colors shadow-2xs cursor-pointer"
                              title="Sửa thông tin & ảnh máy"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition-colors shadow-2xs cursor-pointer"
                              title="Xóa máy khỏi kho"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Admin Table Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3.5 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div>
                  Hiển thị{' '}
                  <strong className="text-slate-800">
                    {(adminPage - 1) * pageSize + 1} - {Math.min(adminPage * pageSize, filteredProducts.length)}
                  </strong>{' '}
                  trên tổng số <strong className="text-slate-800">{filteredProducts.length}</strong> máy
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAdminPage((prev) => Math.max(prev - 1, 1))}
                    disabled={adminPage === 1}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-2xs cursor-pointer"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= adminPage - 1 && pageNum <= adminPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setAdminPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                            adminPage === pageNum
                              ? 'bg-amber-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === adminPage - 2 || pageNum === adminPage + 2) {
                      return (
                        <span key={pageNum} className="px-1 text-slate-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setAdminPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={adminPage === totalPages}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-2xs cursor-pointer"
                    title="Trang sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {modalMode === 'create' ? 'Thêm Máy Ảnh Mới Vào Kho' : `Chỉnh Sửa: ${name}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitProduct} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên sản phẩm máy ảnh *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Sony Alpha A6000 + Lens Kit 16-50mm OSS (Màu Bạc)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Price & Original Price with Realtime Dot Formatting and CellphoneS font */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Giá bán thực tế (VNĐ) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: 7.800.000"
                      value={displayPrice}
                      onChange={handlePriceInput}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-extrabold text-red-600 tracking-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      đ
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Giá niêm yết cũ (nếu có giảm)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ví dụ: 9.500.000"
                      value={displayOriginalPrice}
                      onChange={handleOriginalPriceInput}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-500 line-through focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand & Category with Top "Add New" feature in CustomDropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Thương hiệu *
                  </label>
                  <CustomDropdown
                    options={allBrandOptions}
                    value={brand}
                    onChange={(v) => setBrand(v)}
                    fullWidth
                    onAddNew={(newBrand) => {
                      if (!extraBrands.includes(newBrand)) {
                        setExtraBrands((prev) => [newBrand, ...prev]);
                      }
                      setBrand(newBrand);
                    }}
                    addNewLabel="+ Thêm thương hiệu mới..."
                    addNewPlaceholder="Nhập tên hãng (VD: Hasselblad, DJI...)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phân loại danh mục *
                  </label>
                  <CustomDropdown
                    options={allCategoryOptions}
                    value={category}
                    onChange={(v) => setCategory(v)}
                    fullWidth
                    onAddNew={(newCat) => {
                      const slug = newCat.trim();
                      if (!extraCategories.some((c) => c.value.toLowerCase() === slug.toLowerCase())) {
                        setExtraCategories((prev) => [{ label: newCat.trim(), value: slug }, ...prev]);
                      }
                      setCategory(slug);
                      if (token) {
                        adminCreateCategory({ name: newCat.trim(), type: 'category' }, token).catch(() => {});
                      }
                    }}
                    addNewLabel="+ Thêm danh mục mới..."
                    addNewPlaceholder="Nhập tên danh mục mới..."
                  />
                </div>
              </div>

              {/* Multi-image Upload Zone */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Album ảnh ngoại hình tự chụp (tối đa 15 ảnh) *
                </label>

                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 mx-auto text-amber-600 mb-2" />
                  <p className="text-sm font-bold text-slate-800">
                    Kéo &amp; thả 5 - 10 ảnh vào đây, hoặc <span className="text-amber-600 underline">bấm chọn ảnh</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ JPG, PNG, WEBP tự động nén
                  </p>
                </div>

                {/* Upload Progress Bar */}
                {uploadingImages && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-amber-600 font-semibold">
                      <span>Đang tải ảnh lên...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Image Previews Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs"
                      >
                        <img
                          src={imgUrl}
                          alt={`Ảnh ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-[9px] font-mono bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                          {idx === 0 ? 'Đại diện' : `#${idx + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description - RichTextEditor (Word-like WYSIWYG) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Mô tả chi tiết &amp; đánh giá máy (Soạn thảo văn bản Word)</span>
                  <span className="text-[11px] text-amber-600 font-normal">Hỗ trợ in đậm, bảng thông số, khung cam kết</span>
                </label>
                <RichTextEditor
                  value={description}
                  onChange={(html) => setDescription(html)}
                  placeholder="Nhập bài viết mô tả, thông số kỹ thuật, đánh giá ngoại hình, bảo hành & phụ kiện..."
                  minHeight="220px"
                />
              </div>

              {/* Availability & Featured Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-100 border-slate-300"
                  />
                  <span>Đang có sẵn hàng (bỏ chọn nếu đã bán)</span>
                </label>

                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-100 border-slate-300"
                  />
                  <span>Gắn nhãn Nổi Bật (Featured)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  {modalMode === 'create' ? 'Tạo Sản Phẩm Mới' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
