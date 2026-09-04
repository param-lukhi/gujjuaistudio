import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import PortfolioGrid from '@/components/PortfolioGrid';
import PricingCard from '@/components/PricingCard';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Sparkles, ArrowRight, Video, Zap, ShieldCheck, Headphones, Send } from 'lucide-react';

export const revalidate = 0;

export default async function HomePage() {
  let portfolioItems: any[] = [];
  try {
    portfolioItems = await prisma.portfolioItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
  } catch (e) {
    console.error('Db fetch fallback:', e);
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Value Propositions / Why Choose Us */}
      <section className="py-16 bg-surface-50/60 border-y border-surface-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="glass-panel p-6 rounded-2xl border-surface-200/60 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">2-Day Lightning Delivery</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Get high-converting vertical video reels ready for Meta Ads and Reels in just 48 hours.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-surface-200/60 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Hyper-Realistic AI Models</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                No expensive studio rentals or model hiring required. AI generates stunning product presentations.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-surface-200/60 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-accent-violet/20 text-accent-violet flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Human AI Voiceover</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Custom voiceovers in Hindi, English, and Gujarati tailored to reach your target shoppers.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-surface-200/60 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">100% Commercial Rights</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Full licensing rights included to run paid Meta Ads, Instagram Reels, and Amazon brand videos.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Portfolio Reels */}
      <PortfolioGrid
        items={portfolioItems}
        showAllButton={true}
        title="Featured AI Reel Showcase"
        subtitle="Explore scroll-stopping product video ads across 7 specialized industry categories."
      />

      {/* Pricing Section */}
      <PricingCard />

      {/* Client Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* Quick Contact Section */}
      <section className="py-20 bg-gradient-to-b from-[#080B11] to-[#04060A] relative border-t border-surface-200/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-400">
            <Send className="w-3.5 h-3.5" />
            <span>Ready to Skyrocket Your Sales?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Transform Your Product Photos Into <br />
            <span className="text-gradient-blue">High-Converting Video Ads</span> Today.
          </h2>

          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
            Book your reel package starting at just ₹600 or get in touch with our AI creation team.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/book"
              className="btn-glow px-8 py-4 rounded-xl text-base font-bold text-white shadow-xl shadow-brand-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-brand-300" />
              Book Reel Now (From ₹600)
            </Link>

            <Link
              href="/contact"
              className="px-7 py-4 rounded-xl text-base font-semibold text-gray-200 glass-panel hover:bg-surface-100 border border-surface-200/80 transition-all flex items-center gap-2"
            >
              Contact Team
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
