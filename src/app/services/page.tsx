import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Sparkles, Layers, Video, Mic, Music, Zap, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ServicesPage() {
  const steps = [
    {
      step: '01',
      title: 'Submit Product Brief & Photos',
      desc: 'Upload 2-4 clean product images via our Book Now wizard. Tell us your key selling points, target audience, and preferred voiceover tone.',
      icon: Layers
    },
    {
      step: '02',
      title: 'AI Scene & Model Synthesis',
      desc: 'Our advanced AI models generate lifelike 3D environments, studio lighting, hyper-realistic digital avatars, and motion paths.',
      icon: Sparkles
    },
    {
      step: '03',
      title: 'AI Voiceover & Audio Mastering',
      desc: 'We generate crystal-clear, emotional voiceovers in Hindi or English, layered with trending background music and punchy sound effects.',
      icon: Mic
    },
    {
      step: '04',
      title: '2-Day Express Delivery & Revisions',
      desc: 'Receive your 4K 9:16 vertical video reel in 48 hours. Review in your Client Portal and request free revisions if needed.',
      icon: Zap
    }
  ];

  const industries = [
    { name: 'Fashion & Luxury', desc: 'AI runway models, silk saree motion, handbag showcases.' },
    { name: 'Clothing & Apparel', desc: 'Streetwear, ethnic wear, jacket try-on dynamic angles.' },
    { name: 'Jewelry & Gemstones', desc: 'Sparkle lighting, gold shimmer, close-up macro details.' },
    { name: 'Food & Gourmet', desc: 'Steam effects, sizzle sounds, appetizing slow-mo highlights.' },
    { name: 'Beauty & Skincare', desc: 'Liquid serum drops, glowing skin texture, cosmetic reveals.' },
    { name: 'Electronics & Gadgets', desc: 'Exploded view VFX, metallic sheen, tech feature callouts.' },
    { name: 'Restaurant & Cafes', desc: 'Ambiance reels, chef dish plating, menu highlight ads.' },
  ];

  return (
    <main className="min-h-screen flex flex-col pt-24">
      <Navbar />

      {/* Header */}
      <section className="py-16 bg-hero-gradient border-b border-surface-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-400">
            <Video className="w-3.5 h-3.5" />
            <span>End-to-End AI Production</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Our AI Video <span className="text-gradient-blue">Services</span> & Process
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            From basic product images to multi-million view viral reels. Discover how our studio leverages generative AI for Indian brand growth.
          </p>
        </div>
      </section>

      {/* Process Workflow Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-white">
            How We Turn Photos Into High-CTR Video Ads
          </h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Simple 4-step streamlined workflow designed for maximum speed and zero hassle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-3xl border border-surface-200/60 relative space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-brand-400/40">{s.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Industry Breakdown */}
      <section className="py-20 bg-surface-50/60 border-y border-surface-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold text-white">
              Specialized Industry AI Workflows
            </h2>
            <p className="text-gray-300 text-sm max-w-xl mx-auto">
              Custom AI visual pipelines calibrated specifically for your niche.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-surface-200/60 flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-base">{ind.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{ind.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-extrabold text-white">Ready to Elevate Your Brand?</h2>
          <p className="text-gray-300 text-sm">Select your package starting at ₹600 with 2-day delivery guarantee.</p>
          <Link
            href="/book"
            className="btn-glow px-8 py-3.5 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2 shadow-lg shadow-brand-500/30"
          >
            Start Your Booking
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
