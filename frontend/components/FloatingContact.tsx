'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function FloatingContact() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showScrollTop) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
      {/* Scroll to top button only */}
      <button
        onClick={scrollToTop}
        className="p-2.5 sm:p-3 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 shadow-md backdrop-blur-md border border-slate-200 transition-all hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Lên đầu trang"
        title="Lên đầu trang"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
}
