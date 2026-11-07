'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

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
  const [zaloUrl, setZaloUrl] = useState(() => {
    const defaultUrl = `https://mayanhtop1.com/san-pham/${slug}`;
    const text = `Chào shop MÁY ẢNH TOP 1, mình đang quan tâm máy: ${productName}\nLink sản phẩm: ${defaultUrl}\nCho mình xin thêm ảnh chi tiết và tư vấn nhé!`;
    return `https://zalo.me/${hotline}?text=${encodeURIComponent(text)}`;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      const text = `Chào shop MÁY ẢNH TOP 1, mình đang quan tâm máy: ${productName}\nLink sản phẩm: ${currentUrl}\nCho mình xin thêm ảnh chi tiết và tư vấn nhé!`;
      setZaloUrl(`https://zalo.me/${hotline}?text=${encodeURIComponent(text)}`);
    }
  }, [productName, slug, hotline]);

  return (
    <a
      href={zaloUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-base shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all cursor-pointer"
    >
      <MessageSquare className="w-5 h-5 fill-current" />
      <span>Nhắn Zalo Tư Vấn / Chốt Đơn Máy Này</span>
    </a>
  );
}
