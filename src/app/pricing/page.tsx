import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingCard from '@/components/PricingCard';
import FAQ from '@/components/FAQ';
import { prisma } from '@/lib/db';
import { Sparkles } from 'lucide-react';

export const revalidate = 0;

export default async function PricingPage() {
  let dbPackages: any[] = [];
  try {
    const pkgs = await prisma.package.findMany({
      orderBy: { price: 'asc' },
    });
    if (pkgs.length > 0) {
      dbPackages = pkgs.map(p => ({
        ...p,
        features: JSON.parse(p.features || '[]'),
      }));
    }
  } catch (e) {
    console.error('Db fetch fallback for pricing:', e);
  }

  return (
    <main className="min-h-screen flex flex-col pt-24">
      <Navbar />

      {/* Pricing Header */}
      <section className="py-12 bg-hero-gradient border-b border-surface-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exact Standard Rates</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            AI Reel <span className="text-gradient-blue">Pricing Plans</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            Choose the perfect plan for your product video ad campaign. All packages include 2-day delivery and vertical 9:16 reel formatting.
          </p>
        </div>
      </section>

      {/* Main Pricing Cards Component */}
      <PricingCard packages={dbPackages.length > 0 ? dbPackages : undefined} />

      {/* FAQ */}
      <FAQ />

      <Footer />
    </main>
  );
}
