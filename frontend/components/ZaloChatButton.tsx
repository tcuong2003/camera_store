'use client';

import React, { useState, useMemo, useSyncExternalStore } from 'react';
import { MessageSquare, CheckCircle2, Copy } from 'lucide-react';

interface ZaloChatButtonProps {
  productName: string;
  slug: string;
  hotline?: string;
}

const emptySubscribe = () => () => {};
const getLocationHref = () => (typeof window !== 'undefined' ? window.location.href : '');
const getServerLocationHref = () => '';

export default function ZaloChatButton({
  productName,
  slug,
  hotline = '0986834449',
}: ZaloChatButtonProps) {
  const [copiedLinkOnly, setCopiedLinkOnly] = useState(false);
  const currentUrl = useSyncExternalStore(emptySubscribe, getLocationHref, getServerLocationHref);

  const fullMessage = useMemo(() => {
    const link = currentUrl || `https://mayanhtop1.com/san-pham/${slug}`;
    return `Chào shop MÁY ẢNH TOP 1, mình đang quan tâm máy: ${productName}\nLink sản phẩm: ${link}\nCho mình xin thêm ảnh chi tiết và tư vấn nhé!`;
  }, [currentUrl, productName, slug]);

  const zaloUrl = useMemo(() => {
    return `https://zalo.me/${hotline}?text=${encodeURIComponent(fullMessage)}`;
  }, [hotline, fullMessage]);

  const handleZaloClick = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullMessage);
      }
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const handleCopyLinkOnly = async () => {
    try {
      const linkToCopy = currentUrl || (typeof window !== 'undefined' ? window.location.href : `https://mayanhtop1.com/san-pham/${slug}`);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(linkToCopy);
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
    </div>
  );
}
