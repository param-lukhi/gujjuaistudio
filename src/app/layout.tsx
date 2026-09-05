import type { Metadata } from 'next';
import '@/styles/globals.css';
import NextAuthProvider from '@/components/providers/NextAuthProvider';
import FloatingSupportWidget from '@/components/FloatingSupportWidget';

export const metadata: Metadata = {
  title: 'Gujju AI Studio | AI Product Ads That Stop the Scroll',
  description: 'High-converting AI product reels for e-commerce, D2C brands, and local businesses in India. Fast 2-day delivery with custom AI voiceovers.',
  keywords: ['AI Reels', 'Product Video Ads', 'Gujju AI Studio', 'Instagram Reels Creation', 'E-commerce Video Ads'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#080B11] text-white selection:bg-brand-500 selection:text-white min-h-screen flex flex-col">
        <NextAuthProvider>
          {children}
          <FloatingSupportWidget />
        </NextAuthProvider>
      </body>
    </html>
  );
}
