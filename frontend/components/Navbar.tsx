'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Search, Phone, MessageSquare, X } from 'lucide-react';

function SearchInput({
  isMobile = false,
  onClose,
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/');
    }
    if (onClose) onClose();
  };

  const clearSearch = () => {
    setSearchTerm('');
    router.push('/');
    if (onClose) onClose();
  };

  if (isMobile) {
    return (
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <input
          type="text"
          placeholder="Tìm model máy (Sony, Canon, Fuji...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
          className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-11 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSearchSubmit} className="relative w-full">
      <input
        type="text"
        placeholder="Tìm tên máy (Canon 60D, Sony A6000, Fuji X-T20...)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-slate-100 border border-slate-200 rounded-full py-2.5 pl-11 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all shadow-inner"
      />
      <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
      {searchTerm && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}

export default function Navbar() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200 text-slate-800 shadow-sm overflow-hidden">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-3">
          {/* Logo & Store Title */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink min-w-0 group">
            <img
              src="/logo.png"
              alt="Logo MÁY ẢNH TOP 1"
              className="h-9 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-200 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-black text-sm sm:text-2xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                MÁY ẢNH TOP 1
              </span>
              <span className="hidden min-[400px]:inline sm:inline text-[10px] sm:text-xs text-slate-500 font-medium truncate max-w-[130px] sm:max-w-none">
                Chuyên máy ảnh cũ &amp; phụ kiện uy tín
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar wrapped in Suspense */}
          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl mx-4 sm:mx-6 lg:mx-8">
            <Suspense fallback={<div className="w-full h-10 bg-slate-100 rounded-full animate-pulse" />}>
              <SearchInput />
            </Suspense>
          </div>

          {/* Action Contact Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Mobile search toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Tìm kiếm"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Hotline call */}
            <a
              href="tel:0986834449"
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:border-amber-500 text-slate-700 hover:text-slate-900 transition-all group shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Hotline 24/7</span>
                <span className="text-xs font-bold font-mono text-amber-600">0986.834.449</span>
              </div>
            </a>

            {/* Direct Zalo Button */}
            <a
              href="https://zalo.me/0986834449"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow hover:shadow-blue-500/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <MessageSquare className="w-4 h-4 shrink-0 fill-current" />
              <span>Chat Zalo</span>
            </a>
          </div>
        </div>

        {/* Mobile Search Input Drawer */}
        {isMobileSearchOpen && (
          <div className="md:hidden py-3 pb-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <Suspense fallback={<div className="w-full h-10 bg-slate-100 rounded-xl animate-pulse" />}>
              <SearchInput isMobile onClose={() => setIsMobileSearchOpen(false)} />
            </Suspense>
          </div>
        )}
      </div>
    </header>
  );
}
