import React from 'react';
import ProductDetailClient from '../../../components/ProductDetailClient';
import { fetchProductByIdOrSlug, formatVND } from '../../../lib/api';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const data = await fetchProductByIdOrSlug(slug);
  if (!data || !data.product) {
    return {
      title: 'Chi tiết sản phẩm máy ảnh | MÁY ẢNH TOP 1',
    };
  }

  const p = data.product;
  return {
    title: `${p.name} (${p.condition}) | MÁY ẢNH TOP 1 Sài Gòn`,
    description: `Xem album ảnh chụp thật ${p.name}. Tình trạng ${p.condition}, giá ${formatVND(p.price)}. Phụ kiện: ${p.accessories}. Hotline/Zalo: 0986834449`,
    openGraph: {
      title: `${p.name} - Giá: ${formatVND(p.price)}`,
      description: p.condition,
      images: p.images && p.images[0] ? [p.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const data = await fetchProductByIdOrSlug(slug);

  return <ProductDetailClient slug={slug} initialData={data} />;
}
