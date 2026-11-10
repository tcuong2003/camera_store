'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

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
  fullWidth?: boolean;
  className?: string;
  buttonClassName?: string;
  onAddNew?: (newValue: string) => void;
  addNewLabel?: string;
  addNewPlaceholder?: string;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  icon,
  placeholder = 'Chọn...',
  align = 'left',
  fullWidth = false,
  className = '',
  buttonClassName = '',
  onAddNew,
  addNewLabel = '+ Thêm mới...',
  addNewPlaceholder = 'Nhập tên mới...',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newInputValue, setNewInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Handle click outside to close dropdown & close on page scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAddingNew(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsAddingNew(false);
      }
    };

    const handleScroll = (event: Event) => {
      // Don't close if user is scrolling inside the options popover
      if (containerRef.current && containerRef.current.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
      setIsAddingNew(false);
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

  useEffect(() => {
    if (isAddingNew && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingNew]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setIsAddingNew(false);
  };

  const handleConfirmAddNew = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newInputValue.trim();
    if (trimmed && onAddNew) {
      onAddNew(trimmed);
      setNewInputValue('');
      setIsAddingNew(false);
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative text-left ${fullWidth ? 'w-full block' : 'inline-block'} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-white hover:bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-medium shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer ${
          fullWidth ? 'w-full justify-between' : ''
        } ${
          isOpen ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-slate-200'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-amber-600 shrink-0">{icon}</span>}
          <span className="truncate text-left">{displayLabel}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ml-2 ${
            isOpen ? 'rotate-180 text-amber-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 ${
            fullWidth
              ? 'left-0 right-0 w-full'
              : align === 'right'
              ? 'left-0 sm:left-auto sm:right-0 w-full sm:w-64 max-w-[calc(100vw-2rem)]'
              : 'left-0 w-full sm:w-64 max-w-[calc(100vw-2rem)]'
          } bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 overflow-hidden`}
        >
          {/* Pinned top: Add New option */}
          {onAddNew && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              {isAddingNew ? (
                <div
                  className="flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={newInputValue}
                    onChange={(e) => setNewInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmAddNew();
                      if (e.key === 'Escape') setIsAddingNew(false);
                    }}
                    placeholder={addNewPlaceholder}
                    className="flex-1 bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmAddNew}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingNew(true);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-100/60 rounded-lg transition-colors cursor-pointer"
                >
                  <span>{addNewLabel}</span>
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto scrollbar-thin py-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
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
