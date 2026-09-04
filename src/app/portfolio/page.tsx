import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PortfolioGrid from '@/components/PortfolioGrid';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  let portfolioItems: any[] = [];
  try {
    portfolioItems = await prisma.portfolioItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    console.error('Db fetch fallback:', e);
  }

  const initialCat = searchParams.cat || 'All';

  return (
    <main className="min-h-screen flex flex-col pt-24">
      <Navbar />

      {/* Header Banner */}
      <section className="py-12 bg-hero-gradient border-b border-surface-200/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Reel Showcase</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            AI Video Reel <span className="text-gradient-blue">Portfolio</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            Browse our AI reels across 7 categories: 
            <strong className="text-white"> Fashion, Clothing, Jewelry, Food, Beauty, Electronics, and Restaurant</strong>.
          </p>
        </div>
      </section>

      {/* Portfolio Grid */}
      <PortfolioGrid
        items={portfolioItems}
        initialCategory={initialCat}
        title="Explore All Reel Categories"
        subtitle="Click on any video card to launch full-screen high definition preview."
      />

      {/* CTA Section */}
      <section className="py-16 bg-surface-50 border-t border-surface-200/50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white">
            Impressed by Our AI Quality?
          </h2>
          <p className="text-gray-300 text-sm">
            Get your own product transformed into a scroll-stopping reel in 2 days. Packages start at ₹600.
          </p>
          <div className="pt-2">
            <Link
              href="/book"
              className="btn-glow px-8 py-3.5 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2 shadow-lg shadow-brand-500/30"
            >
              Book Your Reel Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
