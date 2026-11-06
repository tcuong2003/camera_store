'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  align?: 'left' | 'right';
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  icon,
  placeholder = 'Chọn...',
  align = 'left',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Handle click outside to close dropdown
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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-white hover:bg-slate-50 border rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
          isOpen ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
        }`}
      >
        {icon && <span className="text-amber-600 shrink-0">{icon}</span>}
        <span className="truncate max-w-[150px] sm:max-w-[190px] text-left">
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          } w-56 sm:w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150 overflow-hidden`}
        >
          <div className="max-h-64 overflow-y-auto scrollbar-thin py-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-amber-50 text-amber-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
