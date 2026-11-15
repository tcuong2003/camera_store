import React from 'react';
import { Camera } from 'lucide-react';

export default function ProductDetailLoading() {
  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 bg-slate-200 rounded-md w-48" />

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Gallery Skeleton */}
        <div className="lg:col-span-7 space-y-3">
          <div className="aspect-[4/3] bg-slate-100 border border-slate-200 rounded-2xl w-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-200/90 flex items-center justify-center text-slate-400 mb-2">
              <Camera className="w-8 h-8 text-slate-400" />
            </div>
            <div className="h-3.5 w-32 bg-slate-200 rounded-full" />
          </div>
          <div className="flex gap-2.5 overflow-x-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200/90 rounded-xl shrink-0" />
            ))}
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-slate-200 rounded-lg" />
            <div className="h-6 w-24 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          <div className="h-20 bg-slate-100 border border-slate-200 rounded-2xl" />
          <div className="h-12 bg-slate-200 rounded-2xl" />
          <div className="h-12 bg-slate-100 border border-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
