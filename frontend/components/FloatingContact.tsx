'use client';

import React from 'react';
import { Phone, MessageSquare, ChevronUp } from 'lucide-react';

export default function FloatingContact() {
  const hotline = '0986834449';
  const zaloUrl = `https://zalo.me/${hotline}`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="pointer-events-auto p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md backdrop-blur-md border border-slate-200 transition-all active:scale-95"
        aria-label="Lên đầu trang"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Floating Hotline Button */}
      <a
        href={`tel:${hotline}`}
        className="pointer-events-auto group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-xl shadow-emerald-900/20 border border-emerald-400/40 transition-all duration-300 hover:scale-105 active:scale-95"
        title="Gọi điện hotline 0986.834.449"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <Phone className="w-4 h-4 fill-current" />
        <span className="font-bold text-xs sm:text-sm tracking-wide font-mono">0986.834.449</span>
      </a>

      {/* Floating Zalo Button */}
      <a
        href={zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto group relative flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-xl shadow-blue-900/20 border border-blue-400/40 transition-all duration-300 hover:scale-105 active:scale-95"
        title="Chat Zalo chốt đơn ngay"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageSquare className="w-4 h-4 fill-current" />
        <span className="font-bold text-xs sm:text-sm tracking-wide">Zalo Tư Vấn</span>
      </a>
    </div>
  );
}
