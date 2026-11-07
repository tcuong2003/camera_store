'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle2, Copy, X } from 'lucide-react';

interface ZaloChatButtonProps {
  productName: string;
  slug: string;
  hotline?: string;
}

export default function ZaloChatButton({
  productName,
  slug,
  hotline = '0986834449',
}: ZaloChatButtonProps) {
  const [showToast, setShowToast] = useState(false);
  const [copiedLinkOnly, setCopiedLinkOnly] = useState(false);

  const getFullMessage = () => {
    const currentUrl =
      typeof window !== 'undefined' && window.location.href
        ? window.location.href
        : `https://mayanhtop1.com/san-pham/${slug}`;
    return `Chào shop MÁY ẢNH TOP 1, mình đang quan tâm máy: ${productName}\nLink sản phẩm: ${currentUrl}\nCho mình xin thêm ảnh chi tiết và tư vấn nhé!`;
  };

  const getZaloUrl = () => {
    return `https://zalo.me/${hotline}?text=${encodeURIComponent(getFullMessage())}`;
  };

  const [zaloUrl, setZaloUrl] = useState(() => getZaloUrl());

  useEffect(() => {
    setZaloUrl(getZaloUrl());
  }, [productName, slug, hotline]);

  const handleZaloClick = async () => {
    try {
      const message = getFullMessage();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
        setShowToast(true);
      }
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const handleCopyLinkOnly = async () => {
    try {
      const currentUrl =
        typeof window !== 'undefined' && window.location.href
          ? window.location.href
          : `https://mayanhtop1.com/san-pham/${slug}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
        setCopiedLinkOnly(true);
        setTimeout(() => setCopiedLinkOnly(false), 2500);
      }
    } catch (e) {
      console.warn('Copy link failed:', e);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Primary CTA: Zalo */}
      <a
        href={zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleZaloClick}
        className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-base shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all cursor-pointer"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        <span>Nhắn Zalo Tư Vấn / Chốt Đơn Máy Này</span>
      </a>

      {/* Secondary Quick Action: Copy link */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Muốn gửi link máy cho bạn bè?</span>
        <button
          type="button"
          onClick={handleCopyLinkOnly}
          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors py-1 px-2 rounded-lg hover:bg-blue-50 cursor-pointer"
        >
          {copiedLinkOnly ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">Đã chép link!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép link máy</span>
            </>
          )}
        </button>
      </div>

      {/* Floating or inline toast notification when Zalo is clicked */}
      {showToast && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs shadow-sm flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">
                Đã tự động sao chép link &amp; tin nhắn vào bộ nhớ tạm!
              </p>
              <p className="text-amber-800 mt-1 leading-relaxed">
                Khi khung chat Zalo mở ra, bạn chỉ cần bấm <strong className="font-bold bg-amber-200/80 px-1.5 py-0.5 rounded text-slate-900">Ctrl + V</strong> (hoặc Dán) là toàn bộ lời nhắn và link sản phẩm sẽ hiển thị ngay để gửi shop.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="text-amber-600 hover:text-amber-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
