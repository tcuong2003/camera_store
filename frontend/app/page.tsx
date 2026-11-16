import React, { Suspense } from 'react';
import CatalogClient from '../components/CatalogClient';
import { fetchProducts, fetchCategories } from '../lib/api';
import { Product, Category } from '../lib/mockData';

// Incremental Static Regeneration (ISR): Edge revalidates every 30 seconds
export const revalidate = 30;

function CatalogSkeleton() {
  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      <div className="h-12 bg-slate-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-4.5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-[4/3] bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

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
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogClient
        initialProducts={initialProducts}
        initialTotalCount={initialTotalCount}
        initialTotalPages={initialTotalPages}
        initialCategories={initialCategories}
      />
    </Suspense>
  );
}
