'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, DollarSign, X } from 'lucide-react';

interface PriceFilterDropdownProps {
  minPrice?: number | null;
  maxPrice?: number | null;
  priceCategory?: string;
  onChange: (minPrice: number | null, maxPrice: number | null, priceCategory?: string) => void;
  className?: string;
  buttonClassName?: string;
}

// Helper to format VND numbers for display
const formatNumberWithDots = (val: string | number): string => {
  if (val === '' || val === null || val === undefined) return '';
  const num = typeof val === 'number' ? val : Number(val.toString().replace(/\D/g, ''));
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('vi-VN').format(num);
};

const formatShortPrice = (num: number): string => {
  if (num >= 1000000) {
    const m = num / 1000000;
    return Number.isInteger(m) ? `${m} tr` : `${m.toFixed(1)} tr`;
  }
  return `${Math.round(num / 1000)}k`;
};

export default function PriceFilterDropdown({
  minPrice,
  maxPrice,
  priceCategory = 'all',
  onChange,
  className = '',
  buttonClassName = '',
}: PriceFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Local state for the inputs inside dropdown
  const [inputMin, setInputMin] = useState<string>(
    minPrice !== undefined && minPrice !== null ? minPrice.toString() : ''
  );
  const [inputMax, setInputMax] = useState<string>(
    maxPrice !== undefined && maxPrice !== null ? maxPrice.toString() : ''
  );

  // Synchronize when props change
  useEffect(() => {
    setInputMin(minPrice !== undefined && minPrice !== null ? minPrice.toString() : '');
    setInputMax(maxPrice !== undefined && maxPrice !== null ? maxPrice.toString() : '');
  }, [minPrice, maxPrice]);

  // Click outside and scroll handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScroll = (event: Event) => {
      if (containerRef.current && containerRef.current.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isOpen]);

  const hasCustomPrice = (minPrice !== undefined && minPrice !== null) || (maxPrice !== undefined && maxPrice !== null);

  // Determine trigger button label
  const getDisplayLabel = () => {
    if (minPrice && maxPrice) {
      return `${formatShortPrice(minPrice)} - ${formatShortPrice(maxPrice)}`;
    }
    if (minPrice && !maxPrice) {
      return `Từ ${formatShortPrice(minPrice)}`;
    }
    if (!minPrice && maxPrice) {
      return `Dưới ${formatShortPrice(maxPrice)}`;
    }
    return 'Tất cả khoảng giá';
  };

  const handleSelectAll = () => {
    setInputMin('');
    setInputMax('');
    onChange(null, null, 'all');
    setIsOpen(false);
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const minVal = inputMin.trim() ? Number(inputMin.replace(/\D/g, '')) : null;
    const maxVal = inputMax.trim() ? Number(inputMax.replace(/\D/g, '')) : null;

    if (minVal === null && maxVal === null) {
      handleSelectAll();
      return;
    }

    // Ensure min <= max if both provided
    let finalMin = minVal;
    let finalMax = maxVal;
    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      finalMin = maxVal;
      finalMax = minVal;
      setInputMin(finalMin.toString());
      setInputMax(finalMax.toString());
    }

    const rangeCat = `custom_${finalMin || 0}_${finalMax || ''}`;
    onChange(finalMin, finalMax, rangeCat);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputMin('');
    setInputMax('');
    handleSelectAll();
  };

  return (
    <div ref={containerRef} className={`relative text-left inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 bg-white hover:bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-medium shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer w-full min-w-[140px] sm:min-w-[160px] ${
          isOpen
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
            : hasCustomPrice
            ? 'border-amber-500/80 bg-amber-50/30 text-amber-900 font-semibold'
            : 'border-slate-200'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="truncate text-left">{getDisplayLabel()}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ml-1.5 ${
            isOpen ? 'rotate-180 text-amber-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-2xl shadow-xl p-3.5 z-30 animate-in fade-in zoom-in-95 duration-150">
          <form onSubmit={handleApply} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Nhập khoảng giá:</span>
              {(inputMin || inputMax || hasCustomPrice) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-amber-600 hover:text-amber-700 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" />
                  <span>Xóa</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Từ đ"
                  value={formatNumberWithDots(inputMin)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setInputMin(raw);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all text-center"
                />
              </div>

              <span className="text-slate-400 font-bold text-sm shrink-0">-</span>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Đến đ"
                  value={formatNumberWithDots(inputMax)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setInputMax(raw);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Áp dụng</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
