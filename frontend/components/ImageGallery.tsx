'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Maximize2, X, Camera } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sanitize = (url: string) => (url ? url.replace(/\.(heic|heif)$/i, '.jpg') : url);

  const rawList = images && images.length > 0 ? images : [];
  const imageList = rawList.map(sanitize);

  if (imageList.length === 0) {
    return (
      <div className="aspect-[4/3] w-full rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
        <Camera className="w-12 h-12 text-slate-300 mb-2" />
        <span className="text-sm font-semibold text-slate-500">Chưa có ảnh thực tế</span>
        <span className="text-xs text-slate-400 mt-1">Sản phẩm này hiện chưa được tải ảnh lên hệ thống</span>
      </div>
    );
  }

  const currentImage = imageList[selectedIndex];

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % imageList.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productName.replace(/\s+/g, '-').toLowerCase()}-anh-${selectedIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      window.open(currentImage, '_blank');
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Large Image View */}
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 group shadow-md">
        <img
          src={currentImage}
          alt={`${productName} - Ảnh ${selectedIndex + 1}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.includes('.heic') || target.src.includes('.heif')) {
              target.src = target.src.replace(/\.(heic|heif)$/i, '.jpg');
            }
          }}
          className="w-full h-full object-contain sm:object-cover"
        />

        {/* Counter Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 border border-white/20 text-xs font-mono font-bold shadow">
            Ảnh thật {selectedIndex + 1} / {imageList.length}
          </span>
        </div>

        {/* Top Right Actions: Download & Fullscreen */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 backdrop-blur-md border border-white/20 shadow transition-all"
            title="Tải ảnh này về máy để gửi Zalo cho shop"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 backdrop-blur-md border border-white/20 shadow transition-all"
            title="Phóng to toàn màn hình"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Arrows */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white backdrop-blur border border-white/20 transition-transform active:scale-95"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white backdrop-blur border border-white/20 transition-transform active:scale-95"
              aria-label="Ảnh kế tiếp"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails strip */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto py-2 px-1 scrollbar-thin overscroll-x-contain touch-pan-x">
          {imageList.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-400/70 shadow-md shadow-amber-500/20 opacity-100'
                    : 'border-slate-200 hover:border-slate-300 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.includes('.heic') || target.src.includes('.heif')) {
                      target.src = target.src.replace(/\.(heic|heif)$/i, '.jpg');
                    }
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-white bg-slate-950/80 px-1 rounded">
                  #{idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-sm sm:text-base line-clamp-1">
                {productName} (Ảnh {selectedIndex + 1}/{imageList.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Lưu ảnh</span>
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={currentImage}
              alt={productName}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('.heic') || target.src.includes('.heif')) {
                  target.src = target.src.replace(/\.(heic|heif)$/i, '.jpg');
                }
              }}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />

            {imageList.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-xl"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-xl"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails in Fullscreen */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-3 px-2">
            {imageList.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedIndex === idx ? 'border-amber-500 ring-2 ring-amber-400/80 shadow-lg' : 'border-slate-800 opacity-50 hover:opacity-80'
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
