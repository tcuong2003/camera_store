export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  condition: string;
  brand: string;
  priceCategory: 'under_3m' | '3m_5m' | '5m_10m' | 'above_10m';
  category: string;
  deviceType?: string;
  images: string[];
  description?: string;
  accessories?: string;
  warranty?: string;
  isAvailable: boolean;
  featured?: boolean;
  views?: number;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  type: 'price' | 'brand' | 'device_type' | 'category';
  order?: number;
  isActive?: boolean;
}

// Cleared mock data - Real database data from MongoDB Atlas only
export const FALLBACK_PRODUCTS: Product[] = [];
export const FALLBACK_CATEGORIES: Category[] = [];
