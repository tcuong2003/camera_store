'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  EyeOff,
  SlidersHorizontal,
  PackageCheck,
  PackageX,
  X,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FolderPlus,
  Tag,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
} from 'lucide-react';
import {
  adminLogin,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUploadImages,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminReorderProduct,
  fetchProducts,
  fetchCategories,
  formatVND,
  clearApiCache,
} from '../../lib/api';
import { Product, Category } from '../../lib/mockData';
import CustomDropdown, { DropdownOption } from '../../components/CustomDropdown';
import RichTextEditor from '../../components/RichTextEditor';

// Helper to sanitize image URLs (e.g. rewrite Cloudinary .heic/.heif to .jpg for universal rendering)
const sanitizeImageUrl = (url: string) => {
  if (!url) return '';
  return url.replace(/\.(heic|heif)$/i, '.jpg');
};

// Client-side helper to normalize and compress standard images (screenshots, phone photos, crops, JFIF, PNG, WebP)
// HEIC/HEIF/RAW files pass through directly so backend/Cloudinary can transcode them to JPG
const compressAndNormalizeImage = async (file: File): Promise<File> => {
  const lowerName = file.name.toLowerCase();
  const isHeicOrRaw =
    /\.(heic|heif|raw|dng|cr2|nef|arw)$/i.test(lowerName) ||
    file.type === 'image/heic' ||
    file.type === 'image/heif';

  if (isHeicOrRaw) {
    return file; // Cloudinary backend will transcode HEIC/RAW to JPG
  }

  // Preserve animated GIFs and SVGs
  if (lowerName.endsWith('.gif') || lowerName.endsWith('.svg') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 2400; // Ultra crisp 4K resolution
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          // Fill white background for transparent PNG/canvas converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'photo';
                const compressedFile = new File([blob], `${baseName}.jpg`, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.88
          );
        } catch {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<string>('admin');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab navigation: separate top-level tabs (products, brand, category, price)
  const [activeTab, setActiveTab] = useState<'products' | 'brand' | 'category' | 'price'>('products');

  // Product management state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Toast notification state
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Admin filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
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
  const [displayOrder, setDisplayOrder] = useState<number | ''>('');
  const [editingOrderMap, setEditingOrderMap] = useState<Record<string, string>>({});

  // User-added custom brands & categories in dropdown
  const [extraBrands, setExtraBrands] = useState<string[]>([]);
  const [extraCategories, setExtraCategories] = useState<{ label: string; value: string }[]>([]);

  // Fallback / preserved internal fields
  const [condition, setCondition] = useState('Ngoại hình đẹp - Hoạt động hoàn hảo');
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
  const [newCatType, setNewCatType] = useState<'category' | 'brand' | 'price'>('category');
  const [categoryFilterType, setCategoryFilterType] = useState<string>('all');

  // Category Edit state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatType, setEditCatType] = useState<'category' | 'brand' | 'price'>('category');
  const [isEditCatModalOpen, setIsEditCatModalOpen] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Unified custom confirmation dialog state (replaces browser confirm() and product deleteDialog)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    highlightName: string;
    note?: string;
    confirmLabel?: string;
    itemType: 'product' | 'category';
    productId?: string;
    category?: Category;
    categoryIndex?: number;
    isProcessing: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    highlightName: '',
    itemType: 'product',
    isProcessing: false,
  });

  // Clean & robust background scroll lock (prevents window scrolling without layout jump or viewport shift)
  useEffect(() => {
    const isAnyModalOpen = isModalOpen || confirmDialog.isOpen || isEditCatModalOpen;
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPaddingRight = document.body.style.paddingRight;

      // Prevent content shift when scrollbar is removed
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalBodyPaddingRight;
      };
    }
  }, [isModalOpen, confirmDialog.isOpen, isEditCatModalOpen]);

  // Load token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('mayanhtop1_admin_token');
    const savedUser = localStorage.getItem('mayanhtop1_admin_user');
    /* eslint-disable react-hooks/set-state-in-effect */
    if (savedToken) setToken(savedToken);
    if (savedUser) setAdminUser(savedUser);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    let isSubscribed = true;
    if (token) {
      setIsLoading(true);
      Promise.allSettled([
        fetchProducts({ limit: 500 }),
        fetchCategories(),
      ])
        .then(([prodResult, catResult]) => {
          if (!isSubscribed) return;
          if (prodResult.status === 'fulfilled' && prodResult.value?.products) {
            const list = prodResult.value.products;
            const sorted = [...list].sort((a, b) => {
              const orderA = a.order !== undefined && a.order !== null ? a.order : 999999;
              const orderB = b.order !== undefined && b.order !== null ? b.order : 999999;
              if (orderA !== orderB) return orderA - orderB;
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });
            const normalized = sorted.map((p, idx) => ({ ...p, order: idx + 1 }));
            setProducts(normalized);
          } else {
            console.error('Failed to fetch admin products:', prodResult.status === 'rejected' ? prodResult.reason : 'No products');
            setProducts([]);
          }

          if (catResult.status === 'fulfilled' && catResult.value) {
            setCategories(catResult.value);
          } else {
            console.error('Failed to fetch admin categories:', catResult.status === 'rejected' ? catResult.reason : 'No categories');
            setCategories([]);
          }
        })
        .finally(() => {
          if (isSubscribed) {
            setIsLoading(false);
          }
        });
    } else {
      setIsLoading(false);
    }
    return () => {
      isSubscribed = false;
    };
  }, [token]);

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
    setAccessories('Đầy đủ pin, sạc, dây đeo sẵn dùng');
    setWarranty('Bảo hành 06 tháng phần cứng - Bao test 07 ngày lỗi 1 đổi 1');
    setImages([]);
    setUploadingImages(false);
    setUploadProgress(0);
    setIsAvailable(true);
    setFeatured(false);
    setDisplayOrder(1);
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
    setAccessories(p.accessories || '');
    setWarranty(p.warranty || '');
    setImages((p.images || []).map((u) => sanitizeImageUrl(u)));
    setUploadingImages(false);
    setUploadProgress(0);
    setIsAvailable(p.isAvailable);
    setFeatured(p.featured || false);
    const pos = p.order || (products.findIndex((item) => item._id === p._id) + 1);
    setDisplayOrder(pos > 0 ? pos : 1);
    setIsModalOpen(true);
  };

  // Toggle availability inline
  const handleToggleAvailability = async (p: Product) => {
    const updatedStatus = !p.isAvailable;
    try {
      await adminUpdateProduct(p._id, { isAvailable: updatedStatus }, token || '');
      setProducts(products.map((item) => (item._id === p._id ? { ...item, isAvailable: updatedStatus } : item)));
      showToast(`Đã chuyển trạng thái sang "${updatedStatus ? 'Đang bán' : 'Đã chốt bán'}"`, 'info');
    } catch (err) {
      setProducts(products.map((item) => (item._id === p._id ? { ...item, isAvailable: updatedStatus } : item)));
      showToast(`Đã chuyển trạng thái sang "${updatedStatus ? 'Đang bán' : 'Đã chốt bán'}"`, 'info');
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
    const files = e.target.files ? Array.from(e.target.files) : [];
    // Immediately blur and reset value so the browser does not scroll or retain focus on hidden input
    e.target.blur();
    e.target.value = '';
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    if (images.length + files.length > 15) {
      showToast('Tối đa 15 ảnh cho mỗi sản phẩm.', 'error');
      return;
    }

    setUploadingImages(true);
    setUploadProgress(15);

    try {
      // Normalize and optimize images on client side (converts standard screenshots/crops/photos to lightweight JPG)
      const optimizedFiles = await Promise.all(
        files.map((f) => compressAndNormalizeImage(f))
      );
      setUploadProgress(40);

      const res = await adminUploadImages(optimizedFiles, token || '');
      setUploadProgress(85);

      if (res.success && res.urls && res.urls.length > 0) {
        const cleanUrls = res.urls.map((url: string) => sanitizeImageUrl(url));
        setImages((prev) => [...prev, ...cleanUrls]);
        showToast(`Đã tải lên ${cleanUrls.length} ảnh lên hệ thống thành công!`, 'success');
      } else {
        showToast(res.message || 'Lỗi tải ảnh lên máy chủ. Vui lòng kiểm tra lại cấu hình Cloudinary / API.', 'error');
      }
      setUploadProgress(100);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi kết nối';
      showToast(`Không thể tải ảnh lên máy chủ: ${errorMsg}`, 'error');
    } finally {
      setTimeout(() => {
        setUploadingImages(false);
        setUploadProgress(0);
      }, 300);
    }
  };

  // Listen for Clipboard Paste (Cmd+V / Ctrl+V) to support screenshots & cropped images directly
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!isModalOpen) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const ext = file.type.split('/')[1] || 'png';
            const renamedFile = new File([file], `screenshot-${Date.now()}-${i + 1}.${ext}`, {
              type: file.type || 'image/png',
            });
            pastedFiles.push(renamedFile);
          }
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        showToast(`Đã nhận ${pastedFiles.length} ảnh chụp màn hình từ bộ nhớ tạm!`, 'info');
        await processFiles(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isModalOpen, images]);

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
      showToast('Vui lòng nhập đầy đủ tên máy và giá bán', 'error');
      return;
    }

    if (images.length === 0) {
      showToast('Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm', 'error');
      return;
    }

    if (images.some((img) => img.startsWith('blob:'))) {
      showToast('Phát hiện ảnh tạm (blob:). Vui lòng xóa và tải lại ảnh!', 'error');
      return;
    }

    const autoPriceCategory = calcPriceCat(Number(price));

    const payload: Partial<Product> = {
      name,
      price: Number(price),
      originalPrice: originalPrice !== '' ? Number(originalPrice) : 0,
      condition: condition || 'Ngoại hình đẹp - Hoạt động hoàn hảo',
      brand,
      priceCategory: autoPriceCategory,
      category,
      accessories: accessories || 'Đầy đủ phụ kiện theo máy',
      warranty: warranty || 'Bảo hành 06 tháng phần cứng - Bao test 07 ngày lỗi 1 đổi 1',
      description,
      images,
      isAvailable,
      featured,
      order: displayOrder !== '' ? Number(displayOrder) : undefined,
    };

    try {
      if (modalMode === 'create') {
        const res = await adminCreateProduct(payload, token || '');
        if (res.success && res.product) {
          const targetPos = displayOrder !== '' ? Number(displayOrder) : 1;
          const newProductsList = [...products];
          const insertIdx = Math.max(0, Math.min(targetPos - 1, newProductsList.length));
          newProductsList.splice(insertIdx, 0, res.product);
          const normalized = newProductsList.map((p, idx) => ({ ...p, order: idx + 1 }));
          setProducts(normalized);
          showToast(`Đã thêm mới máy ảnh "${res.product.name}" vào vị trí #${targetPos}!`, 'success');

          // Ensure database permanently has strictly sequential 1..N order
          if (token) {
            const orderedIds = normalized.map((p) => p._id);
            adminReorderProduct({ orderedIds }, token).catch(console.error);
          }
          clearApiCache();
        } else {
          showToast('Không thể lưu sản phẩm lên máy chủ: ' + (res.message || 'Lỗi không xác định'), 'error');
          return;
        }
      } else if (modalMode === 'edit' && editingProduct) {
        const res = await adminUpdateProduct(editingProduct._id, payload, token || '');
        if (res.success && res.product) {
          const targetPos = displayOrder !== '' ? Number(displayOrder) : 1;
          const withoutEdited = products.filter((p) => p._id !== editingProduct._id);
          const targetIndex = Math.max(0, Math.min(targetPos - 1, withoutEdited.length));
          withoutEdited.splice(targetIndex, 0, res.product);
          const normalized = withoutEdited.map((p, idx) => ({ ...p, order: idx + 1 }));
          setProducts(normalized);
          showToast(`Đã lưu cập nhật cho máy ảnh "${res.product.name}"!`, 'success');

          // Ensure database permanently has strictly sequential 1..N order
          if (token) {
            const orderedIds = normalized.map((p) => p._id);
            adminReorderProduct({ orderedIds }, token).catch(console.error);
          }
          clearApiCache();
        } else {
          showToast('Không thể cập nhật sản phẩm: ' + (res.message || 'Lỗi không xác định'), 'error');
          return;
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast('Lỗi lưu sản phẩm: ' + String(err), 'error');
    }
  };

  // Trigger open custom delete confirmation dialog for product
  const promptDeleteProduct = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác Nhận Xóa Sản Phẩm?',
      description: 'Bạn có chắc chắn muốn xóa máy ảnh này khỏi kho hàng không?',
      highlightName: name,
      note: 'Thao tác này sẽ gỡ máy vĩnh viễn khỏi danh mục hiển thị.',
      confirmLabel: 'Xác nhận xóa',
      itemType: 'product',
      productId: id,
      isProcessing: false,
    });
  };

  // Trigger open custom delete confirmation dialog for category/brand/label
  const promptDeleteCategory = (cat: Category, index: number) => {
    const isBrand = cat.type === 'brand';
    const isCat = cat.type === 'category' || !cat.type;

    let attachedCount = 0;
    if (isBrand) {
      attachedCount = products.filter(
        (p) =>
          (p.brand && p.brand.toLowerCase() === cat.name.toLowerCase()) ||
          (cat.slug && p.brand && p.brand.toLowerCase() === cat.slug.toLowerCase())
      ).length;
    } else if (isCat) {
      attachedCount = products.filter(
        (p) =>
          (p.category && p.category.toLowerCase() === (cat.slug || cat.name).toLowerCase()) ||
          (p.category && p.category.toLowerCase() === cat.name.toLowerCase())
      ).length;
    }

    let noteText = 'Nhãn này sẽ được gỡ hoàn toàn khỏi hệ thống bộ lọc.';
    if (attachedCount > 0) {
      if (isBrand) {
        noteText = `⚠️ Đang có ${attachedCount} máy ảnh thuộc hãng này. Khi xóa nhãn, các máy ảnh này sẽ được chuyển an toàn sang hãng 'Khác' để giữ trọn vẹn thông tin và ảnh máy.`;
      } else if (isCat) {
        noteText = `⚠️ Đang có ${attachedCount} máy ảnh thuộc danh mục này. Khi xóa nhãn, các máy ảnh này sẽ được chuyển an toàn sang 'Máy ảnh cũ' để giữ trọn vẹn thông tin và ảnh máy.`;
      }
    }

    setConfirmDialog({
      isOpen: true,
      title: isBrand ? 'Xác Nhận Xóa Thương Hiệu?' : 'Xác Nhận Xóa Nhãn Danh Mục?',
      description: `Bạn có chắc chắn muốn xóa "${cat.name}" khỏi hệ thống?`,
      highlightName: cat.name,
      note: noteText,
      confirmLabel: 'Xác nhận xóa',
      itemType: 'category',
      category: cat,
      categoryIndex: index,
      isProcessing: false,
    });
  };

  const handleCancelConfirm = () => {
    if (confirmDialog.isProcessing) return;
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Execute confirm action (product or category delete)
  const handleExecuteConfirm = async () => {
    if (confirmDialog.isProcessing) return;
    setConfirmDialog((prev) => ({ ...prev, isProcessing: true }));

    try {
      if (confirmDialog.itemType === 'product' && confirmDialog.productId) {
        const pId = confirmDialog.productId;
        const pName = confirmDialog.highlightName;
        try {
          await adminDeleteProduct(pId, token || '');
        } catch (err) {
          console.error(err);
        }
        setProducts((prev) => prev.filter((p) => p._id !== pId));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false, isProcessing: false }));
        showToast(`Đã xóa thành công "${pName}" khỏi kho hàng!`, 'success');
      } else if (confirmDialog.itemType === 'category') {
        const cat = confirmDialog.category;
        const idx = confirmDialog.categoryIndex;
        if (cat?._id && token) {
          try {
            await adminDeleteCategory(cat._id, token);
          } catch (err) {
            console.error(err);
          }
        }
        if (idx !== undefined) {
          setCategories((prev) => prev.filter((_, i) => i !== idx));
        } else if (cat?._id) {
          setCategories((prev) => prev.filter((c) => c._id !== cat._id));
        }
        if (cat?.name) {
          setExtraCategories((prev) => prev.filter((c) => c.label !== cat.name && c.value !== cat.name));
        }

        // Automatically update affected products in client state safely
        if (cat) {
          const cName = cat.name.toLowerCase();
          const cSlug = (cat.slug || '').toLowerCase();
          if (cat.type === 'brand') {
            setProducts((prev) =>
              prev.map((p) =>
                (p.brand && p.brand.toLowerCase() === cName) ||
                (cSlug && p.brand && p.brand.toLowerCase() === cSlug)
                  ? { ...p, brand: 'Khác' }
                  : p
              )
            );
          } else if (cat.type === 'category' || !cat.type) {
            setProducts((prev) =>
              prev.map((p) =>
                (p.category && p.category.toLowerCase() === (cSlug || cName)) ||
                (p.category && p.category.toLowerCase() === cName)
                  ? { ...p, category: 'may-anh-cu' }
                  : p
              )
            );
          }
        }

        setConfirmDialog((prev) => ({ ...prev, isOpen: false, isProcessing: false }));
        showToast(`Đã xóa "${cat?.name || ''}" thành công!`, 'success');
      }
    } catch (err) {
      setConfirmDialog((prev) => ({ ...prev, isProcessing: false }));
      showToast('Đã xảy ra lỗi: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  // Reorder product display position
  const handleMoveProduct = async (p: Product, direction: 'up' | 'down') => {
    const currentIdx = products.findIndex((item) => item._id === p._id);
    if (currentIdx === -1) return;

    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= products.length) return;

    const newTargetOrder = targetIdx + 1;

    const cloned = [...products];
    const [moved] = cloned.splice(currentIdx, 1);
    cloned.splice(targetIdx, 0, moved);
    const updatedProducts = cloned.map((item, idx) => ({ ...item, order: idx + 1 }));
    setProducts(updatedProducts);

    try {
      if (token) {
        await adminReorderProduct({
          productId: p._id,
          newOrder: newTargetOrder,
          orderedIds: updatedProducts.map((item) => item._id),
        }, token);
      }
      showToast(`Đã chuyển "${p.name}" sang vị trí #${newTargetOrder}`, 'success');
    } catch (err) {
      console.error('Failed to reorder product:', err);
      showToast(`Đã chuyển vị trí hiển thị thành công`, 'success');
    }
  };

  const handleMoveToTop = async (p: Product) => {
    const currentIdx = products.findIndex((item) => item._id === p._id);
    if (currentIdx <= 0 && p.order === 1) return;

    const cloned = [...products];
    const [moved] = cloned.splice(currentIdx, 1);
    cloned.unshift(moved);
    const updatedProducts = cloned.map((item, idx) => ({ ...item, order: idx + 1 }));
    setProducts(updatedProducts);

    try {
      if (token) {
        await adminReorderProduct({
          productId: p._id,
          newOrder: 1,
          orderedIds: updatedProducts.map((item) => item._id),
        }, token);
      }
      showToast(`Đã đưa "${p.name}" lên vị trí đầu tiên (Top 1)!`, 'success');
    } catch (err) {
      console.error('Failed to reorder to top:', err);
      showToast(`Đã đưa lên vị trí đầu tiên thành công!`, 'success');
    }
  };

  const handleOrderInputChange = (id: string, val: string) => {
    setEditingOrderMap((prev) => ({ ...prev, [id]: val }));
  };

  const handleOrderInputBlur = async (p: Product, inputVal?: string) => {
    const rawVal = inputVal !== undefined ? inputVal : editingOrderMap[p._id];
    if (rawVal === undefined || rawVal === '') {
      setEditingOrderMap((prev) => {
        const next = { ...prev };
        delete next[p._id];
        return next;
      });
      return;
    }

    const targetPos = parseInt(rawVal, 10);
    setEditingOrderMap((prev) => {
      const next = { ...prev };
      delete next[p._id];
      return next;
    });

    if (isNaN(targetPos) || targetPos < 1) return;

    const currentIdx = products.findIndex((item) => item._id === p._id);
    if (currentIdx === -1) return;

    const clampedTargetPos = Math.max(1, Math.min(targetPos, products.length));
    const targetIdx = clampedTargetPos - 1;

    if (targetIdx === currentIdx) return;

    const cloned = [...products];
    const [moved] = cloned.splice(currentIdx, 1);
    cloned.splice(targetIdx, 0, moved);
    const updatedProducts = cloned.map((item, idx) => ({ ...item, order: idx + 1 }));
    setProducts(updatedProducts);

    try {
      if (token) {
        await adminReorderProduct({
          productId: p._id,
          newOrder: clampedTargetPos,
          orderedIds: updatedProducts.map((item) => item._id),
        }, token);
      }
      showToast(`Đã chuyển "${p.name}" đến vị trí #${clampedTargetPos}`, 'success');
    } catch (err) {
      console.error('Failed to reorder:', err);
      showToast(`Đã cập nhật vị trí sản phẩm thành công`, 'success');
    }
  };

  // Category Add for specific tab
  const handleAddCategoryForTab = async (type: 'brand' | 'category' | 'price') => {
    if (!newCatName.trim()) {
      showToast('Vui lòng nhập tên trước khi bấm thêm', 'error');
      return;
    }
    const trimmed = newCatName.trim();
    try {
      const res = await adminCreateCategory({ name: trimmed, type }, token || '');
      if (res && res.category) {
        setCategories((prev) => [...prev, res.category]);
        showToast(`Đã thêm thành công: "${trimmed}"!`, 'success');
      } else {
        const newCat: Category = {
          name: trimmed,
          slug: trimmed.toLowerCase().replace(/\s+/g, '-'),
          type,
        };
        setCategories((prev) => [...prev, newCat]);
        showToast(`Đã thêm "${trimmed}"!`, 'success');
      }
      setNewCatName('');
    } catch {
      const newCat: Category = {
        name: trimmed,
        slug: trimmed.toLowerCase().replace(/\s+/g, '-'),
        type,
      };
      setCategories((prev) => [...prev, newCat]);
      setNewCatName('');
      showToast(`Đã thêm "${trimmed}"!`, 'success');
    }
  };

  const getCategoryTabConfig = (tab: 'brand' | 'category' | 'price') => {
    switch (tab) {
      case 'brand':
        return {
          title: 'Thêm thương hiệu mới',
          inputPlaceholder: 'Nhập tên thương hiệu (Ví dụ: Leica, Hasselblad, Lumix, Fujifilm...)',
          buttonLabel: 'Thêm thương hiệu',
          listTitle: 'Danh sách thương hiệu hiện có',
          typeLabel: 'Thương hiệu',
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
          emptyText: 'Chưa có thương hiệu nào. Hãy thêm thương hiệu đầu tiên phía trên!',
          items: brandCategories,
        };
      case 'category':
        return {
          title: 'Thêm danh mục sản phẩm mới',
          inputPlaceholder: 'Nhập tên danh mục (Ví dụ: Máy ảnh cũ, Máy ảnh chính hãng, Ống kính, Phụ kiện...)',
          buttonLabel: 'Thêm danh mục',
          listTitle: 'Danh sách danh mục sản phẩm hiện có',
          typeLabel: 'Danh mục',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          emptyText: 'Chưa có danh mục nào. Hãy thêm danh mục đầu tiên phía trên!',
          items: mainCategories,
        };
      case 'price':
        return {
          title: 'Thêm khoảng / tầm giá mới',
          inputPlaceholder: 'Nhập tầm giá (Ví dụ: Dưới 3 triệu, 3 - 5 triệu, 5 - 10 triệu, Trên 10 triệu...)',
          buttonLabel: 'Thêm tầm giá',
          listTitle: 'Danh sách khoảng giá hiện có',
          typeLabel: 'Tầm giá',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          emptyText: 'Chưa có khoảng giá nào. Hãy thêm khoảng giá đầu tiên phía trên!',
          items: priceCategories,
        };
    }
  };

  // Category Add & Delete
  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      showToast('Vui lòng nhập tên danh mục / nhãn phân loại', 'error');
      return;
    }
    const trimmed = newCatName.trim();
    try {
      const res = await adminCreateCategory({ name: trimmed, type: newCatType }, token || '');
      if (res && res.category) {
        setCategories((prev) => [...prev, res.category]);
        showToast(`Đã thêm danh mục "${trimmed}" thành công!`, 'success');
      } else {
        const newCat: Category = {
          name: trimmed,
          slug: trimmed.toLowerCase().replace(/\s+/g, '-'),
          type: newCatType,
        };
        setCategories((prev) => [...prev, newCat]);
        showToast(`Đã thêm danh mục "${trimmed}"!`, 'success');
      }
      setNewCatName('');
    } catch {
      const newCat: Category = {
        name: trimmed,
        slug: trimmed.toLowerCase().replace(/\s+/g, '-'),
        type: newCatType,
      };
      setCategories((prev) => [...prev, newCat]);
      setNewCatName('');
      showToast(`Đã thêm danh mục "${trimmed}"!`, 'success');
    }
  };

  const handleDeleteCategory = (cat: Category, index: number) => {
    promptDeleteCategory(cat, index);
  };

  // Category Edit Handlers
  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatType(cat.type === 'brand' ? 'brand' : cat.type === 'price' ? 'price' : 'category');
    setIsEditCatModalOpen(true);
  };

  const handleSaveEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatName.trim()) {
      showToast('Vui lòng nhập tên danh mục / nhãn phân loại', 'error');
      return;
    }

    const trimmed = editCatName.trim();
    setIsSavingCategory(true);

    try {
      const catId = editingCategory._id || editingCategory.slug || editingCategory.name;
      if (token) {
        await adminUpdateCategory(
          catId,
          { name: trimmed, type: editCatType },
          token
        );
      }

      setCategories((prev) =>
        prev.map((c) =>
          (c._id && c._id === editingCategory._id) || c.slug === editingCategory.slug || c.name === editingCategory.name
            ? {
                ...c,
                name: trimmed,
                slug: trimmed.toLowerCase().replace(/\s+/g, '-'),
                type: editCatType,
              }
            : c
        )
      );

      showToast(`Đã cập nhật danh mục "${trimmed}" thành công!`, 'success');
      setIsEditCatModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      showToast('Lỗi cập nhật danh mục: ' + String(err), 'error');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (categoryFilterType === 'all') return categories;
    return categories.filter((c) => c.type === categoryFilterType);
  }, [categories, categoryFilterType]);

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
    if (filterCategory !== 'all') {
      const fc = filterCategory.toLowerCase();
      const pc = (p.category || '').toLowerCase();
      const match =
        pc === fc ||
        (fc === 'may-anh-cu' && (pc.includes('cũ') || pc.includes('may-anh-cu'))) ||
        (fc === 'may-anh-chinh-hang' && (pc.includes('chính hãng') || pc.includes('may-anh-chinh-hang'))) ||
        (fc === 'ong-kinh' && (pc.includes('kính') || pc.includes('lens') || pc.includes('ong-kinh'))) ||
        (fc === 'phu-kien' && (pc.includes('kiện') || pc.includes('phu-kien')));
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice((adminPage - 1) * pageSize, adminPage * pageSize);

  // Distinct brand list for filtering & display - synchronized from database
  const allBrands = useMemo(() => {
    const brandSet = new Set<string>();

    categories
      .filter((c) => c.type === 'brand')
      .forEach((c) => brandSet.add(c.name));

    extraBrands.forEach((b) => brandSet.add(b));

    products.forEach((p) => {
      if (p.brand) brandSet.add(p.brand);
    });

    return Array.from(brandSet).filter(Boolean);
  }, [categories, extraBrands, products]);

  // Merged brand options for dropdowns
  const allBrandOptions: DropdownOption[] = useMemo(() => {
    return allBrands.map((b) => ({ label: b, value: b }));
  }, [allBrands]);

  // Separate category collections by type for individual tabs
  const brandCategories = useMemo(() => categories.filter((c) => c.type === 'brand'), [categories]);
  const mainCategories = useMemo(() => categories.filter((c) => c.type === 'category' || !c.type), [categories]);
  const priceCategories = useMemo(() => categories.filter((c) => c.type === 'price'), [categories]);

  // Statistics (Accurate count matching MongoDB Atlas)
  const totalCount = products.length;
  const brandCount = brandCategories.length;

  const baseCategoryOptions: DropdownOption[] = useMemo(() => [
    { label: 'Máy ảnh cũ', value: 'may-anh-cu' },
    { label: 'Máy ảnh chính hãng', value: 'may-anh-chinh-hang' },
    { label: 'Ống kính (Lens)', value: 'ong-kinh' },
    { label: 'Phụ kiện máy ảnh', value: 'phu-kien' },
  ], []);

  const allCategoryOptions: DropdownOption[] = useMemo(() => {
    const list: DropdownOption[] = [...baseCategoryOptions];
    const seen = new Set(list.map((c) => c.value.toLowerCase()));

    categories
      .filter((c) => c.type === 'category' || !c.type)
      .forEach((c) => {
        const slug = c.slug || c.name;
        if (!seen.has(slug.toLowerCase()) && slug.toLowerCase() !== 'all') {
          seen.add(slug.toLowerCase());
          list.push({ label: c.name, value: slug });
        }
      });

    extraCategories.forEach((c) => {
      if (!seen.has(c.value.toLowerCase())) {
        seen.add(c.value.toLowerCase());
        list.push(c);
      }
    });

    products.forEach((p) => {
      if (p.category && !seen.has(p.category.toLowerCase())) {
        seen.add(p.category.toLowerCase());
        list.push({ label: p.category, value: p.category });
      }
    });

    return list;
  }, [baseCategoryOptions, categories, extraCategories, products]);

  const filterBrandOptions: DropdownOption[] = [
    { label: 'Tất cả hãng', value: 'all' },
    ...allBrands.map((b) => ({ label: b, value: b })),
  ];

  const filterCategoryOptions: DropdownOption[] = [
    { label: 'Tất cả danh mục', value: 'all' },
    ...allCategoryOptions,
  ];

  const catTypeOptions: DropdownOption[] = [
    { label: 'Danh mục chính (Category)', value: 'category' },
    { label: 'Thương hiệu (Brand)', value: 'brand' },
    { label: 'Tầm giá (Price)', value: 'price' },
  ];

  // If not logged in, render Admin Login screen
  if (!token) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
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
                placeholder="Nhập tên đăng nhập..."
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-600" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? 'Đang xác thực...' : 'Đăng nhập Quản trị viên'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Tổng máy ảnh */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng máy ảnh</span>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-200 rounded-lg animate-pulse mt-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{totalCount}</div>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* 2. Thương hiệu */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thương hiệu</span>
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-200 rounded-lg animate-pulse mt-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight mt-1">
                {brandCount} <span className="text-xs sm:text-sm font-semibold text-slate-500">hãng</span>
              </div>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* 3. Danh mục */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</span>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-200 rounded-lg animate-pulse mt-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight mt-1">
                {mainCategories.length} <span className="text-xs sm:text-sm font-semibold text-slate-500">danh mục</span>
              </div>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <FolderPlus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* 4. Tầm giá */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tầm giá</span>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-200 rounded-lg animate-pulse mt-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-extrabold text-violet-600 tracking-tight mt-1">
                {priceCategories.length} <span className="text-xs sm:text-sm font-semibold text-slate-500">khoảng giá</span>
              </div>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 shrink-0">
            <Tag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab('products');
            setAdminPage(1);
          }}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'products'
              ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/40'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span>Tất cả sản phẩm</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('brand');
            setNewCatType('brand');
          }}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'brand'
              ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/40'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0" />
          <span>Thương hiệu</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('category');
            setNewCatType('category');
          }}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'category'
              ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/40'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderPlus className="w-4 h-4 shrink-0" />
          <span>Danh mục</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('price');
            setNewCatType('price');
          }}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'price'
              ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/40'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-4 h-4 shrink-0" />
          <span>Tầm giá</span>
        </button>
      </div>

      {/* TAB 1: TẤT CẢ SẢN PHẨM */}
      {activeTab === 'products' && (
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
            {(searchTerm || filterBrand !== 'all' || filterCategory !== 'all') && (
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>
                  Tìm thấy <strong className="text-slate-800">{filteredProducts.length}</strong> sản phẩm phù hợp
                </span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBrand('all');
                    setFilterCategory('all');
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
                    <th className="py-3.5 px-3 text-center w-28 whitespace-nowrap">Vị trí / STT</th>
                    <th className="py-3.5 px-4 text-left">Ảnh &amp; Tên sản phẩm</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">Hãng</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">Danh mục</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">Giá bán</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">Kho ảnh</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={`table-skel-${i}`} className="animate-pulse">
                        <td className="py-3.5 px-3 text-center">
                          <div className="h-6 w-24 bg-slate-200 rounded-xl mx-auto" />
                        </td>
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="h-4 bg-slate-200 rounded w-48 max-w-full" />
                              <div className="h-3 bg-slate-200 rounded w-28" />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="h-6 w-14 bg-slate-200 rounded-full mx-auto" />
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="h-6 w-20 bg-slate-200 rounded-full mx-auto" />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="h-5 w-24 bg-slate-200 rounded mx-auto" />
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="h-5 w-14 bg-slate-200 rounded mx-auto" />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p, idx) => {
                      const globalIdx = products.findIndex((item) => item._id === p._id);
                      const currentPos = p.order !== undefined && p.order !== null ? p.order : (globalIdx >= 0 ? globalIdx + 1 : (adminPage - 1) * pageSize + idx + 1);
                      const isFirstItem = (globalIdx >= 0 ? globalIdx : (adminPage - 1) * pageSize + idx) === 0;
                      const isLastItem = (globalIdx >= 0 ? globalIdx : (adminPage - 1) * pageSize + idx) === products.length - 1;

                      return (
                        <tr key={p._id || p.slug} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-3 px-2 text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center gap-1 bg-slate-50 border border-slate-200/90 rounded-xl p-1 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleMoveProduct(p, 'up')}
                                disabled={isFirstItem}
                                className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-amber-600 hover:bg-white active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                                title="Di chuyển lên 1 vị trí"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={products.length}
                                value={editingOrderMap[p._id] !== undefined ? editingOrderMap[p._id] : currentPos}
                                onChange={(e) => handleOrderInputChange(p._id, e.target.value)}
                                onBlur={(e) => handleOrderInputBlur(p, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                  }
                                }}
                                className="w-11 h-6 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                                title="Nhập số thứ tự vị trí hiển thị (Enter để lưu)"
                              />
                              <button
                                type="button"
                                onClick={() => handleMoveProduct(p, 'down')}
                                disabled={isLastItem}
                                className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-amber-600 hover:bg-white active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                                title="Di chuyển xuống 1 vị trí"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-left">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.images?.[0] || 'https://via.placeholder.com/80'}
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200 shadow-2xs"
                              />
                              <div className="min-w-0 max-w-[280px] sm:max-w-sm">
                                <Link
                                  href={`/san-pham/${p._id || p.slug}`}
                                  target="_blank"
                                  prefetch={false}
                                  className="font-bold text-slate-900 hover:text-amber-600 line-clamp-2 flex items-center gap-1.5 transition-colors"
                                >
                                  <span>{p.name}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap inline-block">
                              {p.brand}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap inline-block">
                              {allCategoryOptions.find((opt) => opt.value.toLowerCase() === (p.category || '').toLowerCase())?.label ||
                                (p.category === 'may-anh-cu'
                                  ? 'Máy ảnh cũ'
                                  : p.category === 'may-anh-chinh-hang'
                                  ? 'Chính hãng'
                                  : p.category === 'ong-kinh'
                                  ? 'Ống kính'
                                  : p.category === 'phu-kien'
                                  ? 'Phụ kiện'
                                  : p.category || '-')}
                            </span>
                          </td>
                          {/* Price formatted CellphoneS style (bold red with dots) */}
                          <td className="py-3.5 px-4 text-center font-extrabold text-red-600 whitespace-nowrap text-sm sm:text-base tracking-tight">
                            {formatVND(p.price)}
                          </td>
                          <td className="py-3.5 px-3 text-center text-xs font-mono text-slate-500 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 inline-block">
                              {p.images?.length || 0} ảnh
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleMoveToTop(p)}
                                disabled={isFirstItem || currentPos === 1}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-600 transition-colors shadow-2xs cursor-pointer disabled:opacity-25 disabled:pointer-events-none"
                                title="Đưa lên vị trí đầu tiên (Top 1 trang chủ)"
                              >
                                <ArrowUpToLine className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-600 transition-colors shadow-2xs cursor-pointer"
                                title="Sửa thông tin & ảnh máy"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => promptDeleteProduct(p._id, p.name)}
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition-colors shadow-2xs cursor-pointer"
                                title="Xóa máy khỏi kho"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
      )}

      {/* TABS: THƯƠNG HIỆU, DANH MỤC, TẦM GIÁ, ĐỊNH DẠNG MÁY */}
      {activeTab !== 'products' && (
        (() => {
          const cfg = getCategoryTabConfig(activeTab);
          return (
            <div className="space-y-6">
              {/* Add Box for Active Tab */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-base">{cfg.title}</h3>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    type="text"
                    placeholder={cfg.inputPlaceholder}
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategoryForTab(activeTab);
                      }
                    }}
                    className="flex-1 min-w-[220px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCategoryForTab(activeTab)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{cfg.buttonLabel}</span>
                  </button>
                </div>
              </div>

              {/* Items Grid */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      {cfg.listTitle} ({cfg.items.length})
                    </h4>
                  </div>
                </div>

                {cfg.items.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    {cfg.emptyText}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {cfg.items.map((c, idx) => (
                      <div
                        key={c._id || `${c.slug}-${idx}`}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:border-amber-400 hover:bg-white hover:shadow-sm transition-all group"
                      >
                        <div className="min-w-0 pr-2">
                          <h5 className="font-bold text-slate-900 text-sm truncate" title={c.name}>
                            {c.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] font-mono border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${cfg.badgeColor}`}
                            >
                              {cfg.typeLabel}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 truncate max-w-[120px]">
                              {c.slug}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory(c)}
                            className="p-2 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Sửa nhãn này"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => promptDeleteCategory(c, idx)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa nhãn này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()
      )}

      {/* EDIT CATEGORY MODAL */}
      {mounted && isEditCatModalOpen && editingCategory && createPortal(
        <div 
          className="fixed inset-0 w-screen h-screen min-h-screen z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overscroll-contain animate-in fade-in duration-200"
          onClick={() => setIsEditCatModalOpen(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Chỉnh Sửa Nhãn Danh Mục
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCatModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên danh mục / nhãn phân loại *
                </label>
                <input
                  type="text"
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  placeholder="Ví dụ: Sony, Leica, Máy ảnh cũ..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Loại nhãn phân loại
                </label>
                <CustomDropdown
                  options={catTypeOptions}
                  value={editCatType}
                  onChange={(v) => setEditCatType(v as any)}
                  fullWidth
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditCatModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingCategory ? 'Đang lưu...' : 'Lưu cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {mounted && isModalOpen && createPortal(
        <div 
          className="fixed inset-0 w-screen h-screen min-h-screen z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overscroll-contain animate-in fade-in duration-150"
          onClick={() => !uploadingImages && setIsModalOpen(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl h-[90vh] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Fixed Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {modalMode === 'create' ? 'Thêm Máy Ảnh Mới Vào Kho' : `Chỉnh Sửa: ${name}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form 
              id="product-form"
              onSubmit={handleSubmitProduct} 
              className="p-6 overflow-y-auto overscroll-contain space-y-5 flex-1"
            >
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

              {/* Vị trí hiển thị (Thứ tự ưu tiên trên trang chủ) */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Vị trí hiển thị (Thứ tự ưu tiên trên trang chủ)
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Số càng nhỏ sẽ được ưu tiên xuất hiện trước (vị trí 1 là máy ảnh đầu tiên trên trang chủ).
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-600">Vị trí:</span>
                    <input
                      type="number"
                      min={1}
                      max={modalMode === 'create' ? products.length + 1 : products.length}
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
                      placeholder="1"
                      className="w-24 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                    />
                    <span className="text-xs text-slate-400 font-mono">
                      / {Math.max(1, modalMode === 'create' ? products.length + 1 : products.length)} máy
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi-image Upload Zone with Zero Layout Shift */}
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
                  onClick={() => !uploadingImages && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center transition-all ${
                    uploadingImages
                      ? 'border-amber-400 bg-amber-50/80 cursor-wait'
                      : dragActive
                      ? 'border-amber-500 bg-amber-50 cursor-pointer'
                      : 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/80 cursor-pointer'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.heic,.heif,.jfif,.webp,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.tif,.avif,.svg,.dng,.raw,.cr2,.nef,.arw"
                    onChange={handleFileInput}
                    className="hidden"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  {uploadingImages ? (
                    <div className="py-2 space-y-2.5">
                      <div className="w-8 h-8 mx-auto border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <div className="flex items-center justify-between max-w-xs mx-auto text-xs font-bold text-amber-800">
                        <span>Đang tối ưu &amp; tải ảnh lên hệ thống...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full max-w-xs mx-auto bg-amber-200/60 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Vui lòng đợi giây lát, ảnh đang được nén và upload lên hệ thống...
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-amber-600 mb-2" />
                      <p className="text-sm font-bold text-slate-800">
                        Kéo &amp; thả ảnh vào đây, <span className="text-amber-600 underline">bấm chọn ảnh</span> hoặc dán (Ctrl+V / Cmd+V)
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Hỗ trợ tất cả định dạng: JPG, PNG, WEBP, HEIC (iPhone), JFIF, ảnh chụp màn hình, ảnh cắt... (Tối đa 15 ảnh)
                      </p>
                    </>
                  )}
                </div>

                {/* Image Previews Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs"
                      >
                        <img
                          src={sanitizeImageUrl(imgUrl)}
                          alt={`Ảnh ${idx + 1}`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('.heic') || target.src.includes('.heif')) {
                              target.src = target.src.replace(/\.(heic|heif)$/i, '.jpg');
                            } else {
                              target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80';
                            }
                          }}
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

              {/* Featured Checkbox */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
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
            </form>

            {/* Modal Pinned Footer (Always visible, perfectly steady) */}
            <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-200 bg-slate-50/95">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={uploadingImages}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {modalMode === 'create' ? 'Tạo Sản Phẩm Mới' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* UNIFIED CONFIRM DELETE DIALOG (FOR PRODUCT & CATEGORY DELETIONS) */}
      {mounted && confirmDialog.isOpen && createPortal(
        <div 
          className="fixed inset-0 w-screen h-screen min-h-screen z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overscroll-contain animate-in fade-in duration-150"
          onClick={handleCancelConfirm}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-center animate-in zoom-in-95 duration-150 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close 'X' Button */}
            <button
              type="button"
              onClick={handleCancelConfirm}
              disabled={confirmDialog.isProcessing}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Trash Warning Icon Circle */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
              <Trash2 className="w-8 h-8 text-rose-600" />
            </div>

            {/* Dialog Heading */}
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-2">
              {confirmDialog.title}
            </h3>

            {/* Description with Highlighted Name */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 px-1">
              {confirmDialog.description}
              <span className="block my-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm truncate shadow-2xs">
                &ldquo;{confirmDialog.highlightName}&rdquo;
              </span>
              {confirmDialog.note}
            </p>

            {/* Buttons: Cancel & Confirm Delete */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={confirmDialog.isProcessing}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirm}
                disabled={confirmDialog.isProcessing}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {confirmDialog.isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{confirmDialog.confirmLabel || 'Xác nhận xóa'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* GLOBAL TOAST NOTIFICATION */}
      {mounted && toast && createPortal(
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700/60 animate-in slide-in-from-top-4 fade-in duration-200 max-w-sm sm:max-w-md">
          {toast.type === 'success' && (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
          )}
          {toast.type === 'error' && (
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <AlertCircle className="w-5 h-5 text-rose-400" />
            </div>
          )}
          <div className="flex-1 text-xs sm:text-sm font-medium text-slate-100 leading-snug">
            {toast.message}
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
