import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PortfolioGrid from '@/components/PortfolioGrid';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Sparkles, ArrowRight, Play, Flame } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReelsPage({
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
    <main className="min-h-screen flex flex-col pt-24 bg-[#080B11] text-white">
      <Navbar />

      {/* Header Banner */}
      <section className="py-14 bg-hero-gradient border-b border-surface-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-400">
            <Flame className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Trending AI Reels • Free Public Access</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Trending AI <span className="text-gradient-blue">Reels</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            Watch high-energy 9:16 vertical AI reels curated across Fashion, Jewelry, Food, Electronics, and Lifestyle.
          </p>
        </div>
      </section>

      {/* Reels Grid */}
      <PortfolioGrid
        items={portfolioItems}
        initialCategory={initialCat}
        title="Trending AI Reels Gallery"
        subtitle="Watch sample reels and pick your favorite style for your next viral campaign."
      />

      {/* CTA Section */}
      <section className="py-16 bg-surface-50 border-t border-surface-200/50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white">
            Want a Custom AI Reel Like These?
          </h2>
          <p className="text-gray-300 text-sm">
            Packages starting at just ₹600 with music sync, cinematic effects, and script included.
          </p>
          <div className="pt-2">
            <Link
              href="/book"
              className="btn-glow px-8 py-3.5 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2 shadow-lg shadow-brand-500/30 hover:scale-105 transition-all"
            >
              Book Your AI Reel Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
