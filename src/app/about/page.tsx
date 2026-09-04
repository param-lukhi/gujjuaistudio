import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  Sparkles, Zap, ShieldCheck, Heart, Award, ArrowRight, 
  Video, Users, Cpu, Clock, CheckCircle2, TrendingUp, 
  Layers, Palette, MessageSquare, Globe
} from 'lucide-react';

export const metadata = {
  title: 'About Us | Gujju AI Studio - Leading AI Reel Production House',
  description: 'Learn about Gujju AI Studio, Gujarat’s premier AI product video agency helping e-commerce, D2C brands, and businesses create scroll-stopping commercial reels.',
};

export default function AboutPage() {
  const stats = [
    { value: '500+', label: 'AI Reels Delivered', icon: Video },
    { value: '48h', label: 'Average Turnaround', icon: Clock },
    { value: '₹600', label: 'Starting Price Point', icon: Zap },
    { value: '98%', label: 'Client Satisfaction', icon: Heart },
  ];

  const pillars = [
    {
      title: 'Cinematic AI Visuals',
      desc: 'We utilize state-of-the-art Generative AI models (Runway Gen-3, Kling AI, Luma) to render photo-realistic lighting, fluid dynamic camera movements, and cinematic depth.',
      icon: Cpu,
      color: 'from-brand-600 to-accent-cyan',
    },
    {
      title: 'Multilingual Regional Voiceovers',
      desc: 'Connect intimately with Indian consumers through hyper-natural studio voiceovers in Hindi, Gujarati, and English with regional nuances and emotional cadence.',
      icon: MessageSquare,
      color: 'from-accent-cyan to-brand-500',
    },
    {
      title: 'Ultra-Fast 2-Day Delivery',
      desc: 'Eliminate 3-week waiting times and expensive camera crews. Get ready-to-publish 4K vertical reels for Instagram and Shorts in just 48 hours.',
      icon: Zap,
      color: 'from-amber-500 to-brand-500',
    },
    {
      title: 'E-Commerce ROI Focus',
      desc: 'Every video is meticulously structured with hook psychology, retention pacing, and clear calls-to-action designed to lower customer acquisition costs.',
      icon: TrendingUp,
      color: 'from-emerald-500 to-accent-cyan',
    },
  ];

  const industries = [
    { name: 'Fashion & Apparel', count: '100+ Reels' },
    { name: 'Jewelry & Luxury', count: '90+ Reels' },
    { name: 'Beauty & Skincare', count: '80+ Reels' },
    { name: 'Food & Gourmet', count: '75+ Reels' },
    { name: 'Electronics & Gadgets', count: '70+ Reels' },
    { name: 'Restaurant & Cafes', count: '60+ Reels' },
    { name: 'Home & Lifestyle', count: '50+ Reels' },
  ];

  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#080B11] text-white selection:bg-brand-500 selection:text-white">
      <Navbar />

      <div className="pt-28 pb-20 space-y-24">
        
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6 overflow-hidden">
          {/* Glowing background ambient lights */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute top-10 right-10 w-80 h-80 bg-accent-cyan/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-300 shadow-lg shadow-brand-500/10">
            <Sparkles className="w-4 h-4 text-accent-cyan animate-pulse" />
            <span>Pioneering Generative AI Video in India</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            We Craft <span className="text-gradient-blue">Scroll-Stopping</span> AI Product Reels
          </h1>

          <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Gujju AI Studio was born with a single mission: to empower Indian brands, local businesses, and creators with world-class, commercial-grade AI video advertising at a fraction of traditional production costs.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/book"
              className="btn-glow px-8 py-3.5 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2 shadow-xl shadow-brand-500/30 hover:scale-105 transition-transform"
            >
              Book Your AI Reel
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/reels"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold text-gray-200 bg-surface-100/80 hover:bg-surface-200 border border-surface-200/80 transition-all hover:text-white"
            >
              Explore AI Reel Gallery
            </Link>
          </div>
        </section>

        {/* Key Metrics / Stats */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/70 text-center space-y-2 hover:border-brand-500/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Our Story & Vision */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                Our Story & Vision
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Born in Gujarat. Built for the Modern Indian Digital Economy.
              </h2>

              <p className="text-gray-300 text-sm leading-relaxed">
                Traditional product video shoots cost ₹25,000 to ₹1,00,000+, take weeks of coordination with studios, camera equipment, models, and locations, and are often out of reach for growing D2C brands, local retailers, and MSMEs.
              </p>

              <p className="text-gray-300 text-sm leading-relaxed">
                At <strong>Gujju AI Studio</strong>, we reimagined video creation from first principles. By combining high-end generative diffusion models with custom neural voice synthesis and Hollywood-grade post-production, we deliver mesmerizing 4K commercial reels starting at just ₹600 in 2 days.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  '100% Commercial Use License on all deliverables',
                  'Hindi, Gujarati, and English native voiceover options',
                  '9:16 Vertical optimization for Instagram Reels, YouTube Shorts, and TikTok',
                  'Dedicated WhatsApp support and live booking tracking'
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-gray-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Feature Card */}
            <div className="glass-panel p-8 rounded-3xl border border-brand-500/30 bg-gradient-to-b from-brand-950/40 to-surface-50 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="flex items-center justify-between border-b border-surface-200/50 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Gujju AI Production Pipeline</h3>
                  <p className="text-xs text-gray-400">Next-Gen Video Generation Engine</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand-600 text-white">
                  v2.5 AI Core
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { step: '01', title: 'Product Image & Brief Analysis', sub: 'Extracting lighting vectors, angles, and color palettes' },
                  { step: '02', title: 'Neural Scene Simulation', sub: 'Generative 3D environmental camera sweep & dynamics' },
                  { step: '03', title: 'Regional Voice & Audio Design', sub: 'Hindi/Gujarati/English voiceover sync & sound effects' },
                  { step: '04', title: '4K Upscaling & Final Delivery', sub: 'Color graded, crisply rendered, and ready to publish' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3.5 rounded-2xl bg-surface-100/60 border border-surface-200/60">
                    <span className="font-mono font-black text-brand-400 text-sm">{item.step}</span>
                    <div>
                      <h4 className="font-bold text-white text-xs">{item.title}</h4>
                      <p className="text-[11px] text-gray-400">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Why Choose Us / Pillars */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Why Top Indian Brands Choose Us
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              We engineer commercial reels built specifically to capture attention in the first 3 seconds and drive clicks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-3xl border border-surface-200/70 space-y-4 hover:border-brand-500/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 text-brand-300 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Industries Served */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-surface-200/80 space-y-8 text-center">
            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Specialized in 7 High-Growth Sectors
              </h2>
              <p className="text-xs text-gray-400">
                Custom cinematic styles tuned for each unique commercial category.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {industries.map((ind, i) => (
                <div key={i} className="p-4 rounded-2xl bg-surface-100/60 border border-surface-200/60 space-y-1 text-left">
                  <h4 className="font-bold text-white text-xs sm:text-sm">{ind.name}</h4>
                  <p className="text-[10px] text-brand-400 font-mono font-semibold">{ind.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-brand-500/40 bg-gradient-to-b from-brand-950/30 to-surface-50 space-y-6 shadow-2xl">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Transform Your Product into a Viral AI Reel?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
              Choose your package, pick your preferred date and time slot, and receive your finished AI reel in 2 days.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/book"
                className="btn-glow px-8 py-3.5 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2 shadow-lg shadow-brand-500/30"
              >
                Book Your AI Reel Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-7 py-3.5 rounded-xl text-sm font-semibold text-gray-300 bg-surface-100 hover:bg-surface-200 hover:text-white border border-surface-200 transition-all"
              >
                Contact Studio Team
              </Link>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
