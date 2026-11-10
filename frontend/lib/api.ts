import { Product, Category, FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from './mockData';

export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl.replace(/\/$/, '');
  }

  // Browser: relative /api or custom URL
  if (typeof window !== 'undefined') {
    return envUrl || '/api';
  }

  // Node.js server (SSR / Server Component): Must be an absolute URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}${envUrl || '/api'}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${envUrl || '/api'}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}${envUrl || '/api'}`;
  }
  if (process.env.FRONTEND_URL) {
    return `${process.env.FRONTEND_URL.replace(/\/$/, '')}${envUrl || '/api'}`;
  }

  return 'https://mayanhtop1-backend.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface FilterParams {
  search?: string;
  brand?: string;
  priceCategory?: string;
  category?: string;
  deviceType?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  products: Product[];
}

export interface SingleProductResponse {
  success: boolean;
  product: Product;
  related?: Product[];
}

// Utility to format price in VNĐ (CellphoneS style: 13.860.000đ)
export const formatVND = (price: number): string => {
  if (price === undefined || price === null || isNaN(price)) return '0đ';
  const formatted = new Intl.NumberFormat('vi-VN').format(price);
  return `${formatted}đ`;
};

// In-memory cache for ultra-fast instant UI rendering
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 45000; // 45 seconds cache

export const clearApiCache = () => {
  apiCache.clear();
};

// Generate Zalo chat link with optional product URL
export const getZaloChatUrl = (productName?: string, productUrl?: string): string => {
  const hotline = process.env.NEXT_PUBLIC_HOTLINE || '0986834449';
  if (!productName) {
    return `https://zalo.me/${hotline}`;
  }
  const text = productUrl
    ? `Chào shop MÁY ẢNH TOP 1, mình đang quan tâm máy: ${productName}\nLink sản phẩm: ${productUrl}\nCho mình xin thêm ảnh chi tiết và tư vấn nhé!`
    : `Chào shop MÁY ẢNH TOP 1, mình đang quan tâm máy: ${productName}. Cho mình xin thêm ảnh chi tiết và tư vấn nhé!`;
  return `https://zalo.me/${hotline}?text=${encodeURIComponent(text)}`;
};

// Fetch products with filters
export const fetchProducts = async (params: FilterParams = {}, forceRefresh = false): Promise<ProductsResponse> => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.brand && params.brand !== 'all') query.append('brand', params.brand);
  if (params.priceCategory && params.priceCategory !== 'all') query.append('priceCategory', params.priceCategory);
  if (params.category && params.category !== 'all') query.append('category', params.category);
  if (params.deviceType && params.deviceType !== 'all') query.append('deviceType', params.deviceType);
  if (params.sort) query.append('sort', params.sort);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  const cacheKey = `products:${query.toString()}`;
  if (!forceRefresh) {
    const cached = apiCache.get(cacheKey) as CacheEntry<ProductsResponse> | undefined;
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      throw new Error(`API responded with ${res.status}`);
    }

    const data: ProductsResponse = await res.json();
    apiCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.warn('Backend API request error:', error);
    return {
      success: false,
      count: 0,
      total: 0,
      totalPages: 1,
      currentPage: 1,
      products: [],
    };
  }
};

// Fetch single product by id or slug
export const fetchProductByIdOrSlug = async (idOrSlug: string): Promise<SingleProductResponse | null> => {
  const cacheKey = `product:${idOrSlug}`;
  const cached = apiCache.get(cacheKey) as CacheEntry<SingleProductResponse> | undefined;
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const baseUrl = getApiBaseUrl();
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

  // Try both endpoints: by id or by slug
  const endpoints = isObjectId
    ? [`${baseUrl}/products/${idOrSlug}`, `${baseUrl}/products/slug/${idOrSlug}`]
    : [`${baseUrl}/products/slug/${idOrSlug}`, `${baseUrl}/products/${idOrSlug}`];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(30000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.product) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch product from ${url}:`, error);
    }
  }

  return null;
};

export const fetchProductBySlug = fetchProductByIdOrSlug;
export const fetchProductById = fetchProductByIdOrSlug;

// Fetch categories (always fresh by default to prevent stale client sync)
export const fetchCategories = async (type?: string, forceRefresh = true): Promise<Category[]> => {
  const cacheKey = `categories:${type || 'all'}`;
  if (!forceRefresh) {
    const cached = apiCache.get(cacheKey) as CacheEntry<Category[]> | undefined;
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const query = type ? `?type=${type}` : '';
    const res = await fetch(`${API_BASE_URL}/categories${query}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });

    if (res.ok) {
      const data = await res.json();
      const cats = data.categories || [];
      apiCache.set(cacheKey, { data: cats, timestamp: Date.now() });
      return cats;
    }
  } catch (error) {
    console.warn('Failed to fetch categories from API:', error);
  }

  return [];
};

// Admin API calls
export const adminLogin = async (username: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return await res.json();
};

export const adminUploadImages = async (files: File[], token: string) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return await res.json();
};

export const adminCreateProduct = async (productData: Partial<Product>, token: string) => {
  clearApiCache();
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  return await res.json();
};

export const adminUpdateProduct = async (id: string, productData: Partial<Product>, token: string) => {
  clearApiCache();
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  return await res.json();
};

export const adminDeleteProduct = async (id: string, token: string) => {
  clearApiCache();
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};

export const adminGetStats = async (token: string) => {
  const res = await fetch(`${API_BASE_URL}/products/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};

export const notifyCategoriesUpdated = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('mayanhtop1_categories_updated', Date.now().toString());
    } catch {}
  }
};

export const adminCreateCategory = async (
  categoryData: { name: string; type: string; order?: number; minPrice?: number | null; maxPrice?: number | null },
  token: string
) => {
  clearApiCache();
  notifyCategoriesUpdated();
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });
  return await res.json();
};

export const adminUpdateCategory = async (
  id: string,
  categoryData: { name?: string; type?: string; order?: number; isActive?: boolean; minPrice?: number | null; maxPrice?: number | null },
  token: string
) => {
  clearApiCache();
  notifyCategoriesUpdated();
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });
  return await res.json();
};

export const adminDeleteCategory = async (id: string, token: string) => {
  clearApiCache();
  notifyCategoriesUpdated();
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};

export const adminReorderProduct = async (
  data: { productId?: string; newOrder?: number; orderedIds?: string[] },
  token: string
) => {
  clearApiCache();
  const res = await fetch(`${API_BASE_URL}/products/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};
