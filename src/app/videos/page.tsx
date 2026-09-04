import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PortfolioGrid from '@/components/PortfolioGrid';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Sparkles, ArrowRight, Video, Play, Film } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function VideosPage({
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
            <Film className="w-3.5 h-3.5" />
            <span>Public Video Gallery • Free to Watch</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Commercial AI <span className="text-gradient-blue">Videos</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            Explore high-converting commercial videos generated with cutting-edge AI for brands, e-commerce, and restaurants.
          </p>
        </div>
      </section>

      {/* Portfolio / Videos Grid */}
      <PortfolioGrid
        items={portfolioItems}
        initialCategory={initialCat}
        title="Browse Commercial Videos"
        subtitle="Click any video to play in full-screen high definition. No login required."
      />

      {/* CTA Section */}
      <section className="py-16 bg-surface-50 border-t border-surface-200/50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to Create an AI Video for Your Brand?
          </h2>
          <p className="text-gray-300 text-sm">
            Turn your product photos or ideas into high-definition viral videos with fast 48-hour delivery.
          </p>
          <div className="pt-2">
            <Link
              href="/book"
              className="btn-glow px-8 py-3.5 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2 shadow-lg shadow-brand-500/30 hover:scale-105 transition-all"
            >
              Book Video Project
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
