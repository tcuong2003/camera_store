import { Product, Category, FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

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

// Generate Zalo chat link
export const getZaloChatUrl = (productName?: string): string => {
  const hotline = process.env.NEXT_PUBLIC_HOTLINE || '0986834449';
  if (!productName) {
    return `https://zalo.me/${hotline}`;
  }
  return `https://zalo.me/${hotline}?text=${encodeURIComponent(`Chào shop MÁY ẢNH TOP 1, mình đang quan tâm máy: ${productName}. Cho mình xin thêm ảnh chi tiết và tư vấn nhé!`)}`;
};

// Fetch products with filters
export const fetchProducts = async (params: FilterParams = {}): Promise<ProductsResponse> => {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.brand && params.brand !== 'all') query.append('brand', params.brand);
    if (params.priceCategory && params.priceCategory !== 'all') query.append('priceCategory', params.priceCategory);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.deviceType && params.deviceType !== 'all') query.append('deviceType', params.deviceType);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, {
      next: { revalidate: 10 },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      throw new Error(`API responded with ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('Backend API unavailable, using resilient fallback data:', error);
    // Filter mock data locally
    let filtered = [...FALLBACK_PRODUCTS];

    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.brand.toLowerCase().includes(s) ||
          (p.condition && p.condition.toLowerCase().includes(s))
      );
    }

    if (params.brand && params.brand !== 'all') {
      const brands = params.brand.toLowerCase().split(',');
      filtered = filtered.filter((p) => brands.includes(p.brand.toLowerCase()));
    }

    if (params.priceCategory && params.priceCategory !== 'all') {
      const cats = params.priceCategory.split(',');
      filtered = filtered.filter((p) => cats.includes(p.priceCategory));
    }

    if (params.category && params.category !== 'all') {
      const cats = params.category.split(',');
      filtered = filtered.filter((p) => cats.includes(p.category));
    }

    if (params.deviceType && params.deviceType !== 'all') {
      filtered = filtered.filter((p) => p.deviceType?.toLowerCase() === params.deviceType?.toLowerCase());
    }

    if (params.sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (params.sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    const pageNum = params.page || 1;
    const limitNum = params.limit || 16;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return {
      success: true,
      count: paginated.length,
      total,
      totalPages,
      currentPage: pageNum,
      products: paginated,
    };
  }
};

// Fetch single product by slug
export const fetchProductBySlug = async (slug: string): Promise<SingleProductResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/slug/${slug}`, {
      next: { revalidate: 10 },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn('Backend API unavailable for slug, checking fallback data:', error);
  }

  const match = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
  if (match) {
    const related = FALLBACK_PRODUCTS.filter(
      (p) => p.slug !== slug && (p.brand === match.brand || p.priceCategory === match.priceCategory)
    ).slice(0, 4);

    return {
      success: true,
      product: match,
      related,
    };
  }

  return null;
};

// Fetch categories
export const fetchCategories = async (type?: string): Promise<Category[]> => {
  try {
    const query = type ? `?type=${type}` : '';
    const res = await fetch(`${API_BASE_URL}/categories${query}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      return data.categories || [];
    }
  } catch (error) {
    console.warn('Failed to fetch categories from API, using fallback:', error);
  }

  if (type) {
    return FALLBACK_CATEGORIES.filter((c) => c.type === type);
  }
  return FALLBACK_CATEGORIES;
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
