import React, { Suspense } from 'react';
import CatalogClient from '../components/CatalogClient';
import { fetchProducts, fetchCategories } from '../lib/api';
import { Product, Category } from '../lib/mockData';

// Incremental Static Regeneration (ISR): Edge revalidates every 30 seconds
export const revalidate = 30;

export default async function HomePage() {
  let initialProducts: Product[] = [];
  let initialTotalCount = 0;
  let initialTotalPages = 1;
  let initialCategories: Category[] = [];

  try {
    const [prodRes, catRes] = await Promise.allSettled([
      fetchProducts({ limit: 25 }, false),
      fetchCategories(undefined, false),
    ]);

    if (prodRes.status === 'fulfilled' && prodRes.value) {
      initialProducts = prodRes.value.products || [];
      initialTotalCount = prodRes.value.total || initialProducts.length;
      initialTotalPages = prodRes.value.totalPages || 1;
    }

    if (catRes.status === 'fulfilled' && catRes.value) {
      initialCategories = catRes.value || [];
    }
  } catch (err) {
    console.warn('Initial SSR fetch warning on homepage:', err);
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Đang tải danh mục máy ảnh...</div>}>
      <CatalogClient
        initialProducts={initialProducts}
        initialTotalCount={initialTotalCount}
        initialTotalPages={initialTotalPages}
        initialCategories={initialCategories}
      />
    </Suspense>
  );
}
