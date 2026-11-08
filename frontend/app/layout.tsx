import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingContact from '../components/FloatingContact';

export const metadata: Metadata = {
  title: 'MÁY ẢNH TOP 1 - Chuyên Máy Ảnh Cũ Sài Gòn | Album Ảnh Thực Tế',
  description: 'Trưng bày danh mục máy ảnh cũ tuyển chọn, Canon, Sony, Fujifilm, Nikon, Lumix. Xem album ảnh thật 100%, bảo hành 06 tháng, tư vấn Zalo chốt đơn nhanh chóng: 0986834449',
  keywords: [
    'máy ảnh cũ sài gòn',
    'máy ảnh top 1',
    'bán máy ảnh canon cũ',
    'máy ảnh sony a6000',
    'máy ảnh fujifilm',
    'máy ảnh compact y2k',
    'mua máy ảnh cũ uy tín hcm',
  ],
  authors: [{ name: 'MÁY ẢNH TOP 1' }],
  metadataBase: new URL('https://sp.mayanhtop1.com'),
  icons: {
    icon: [
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo.png', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'MÁY ẢNH TOP 1 - Chuyên Máy Ảnh Cũ Sài Gòn',
    description: 'Kho máy ảnh cũ tuyển chọn, bảo hành 6 tháng, ảnh thật 100%. Hotline/Zalo: 0986834449',
    type: 'website',
    locale: 'vi_VN',
    siteName: 'MÁY ẢNH TOP 1',
    images: [
      {
        url: '/logo.png',
        width: 1000,
        height: 1000,
        alt: 'Logo MÁY ẢNH TOP 1',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f4f5f7',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="bg-[#f4f5f7] text-slate-800 min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-white max-w-full overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full max-w-full overflow-x-hidden min-w-0 pt-16 sm:pt-20">{children}</main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
