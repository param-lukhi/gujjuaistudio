'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Sparkles, Play, ArrowRight, ShieldCheck, Zap, Award, Star, 
  Check, Headphones, Film, Video, Eye, ThumbsUp, Flame 
} from 'lucide-react';
import { useAuthModal } from './providers/AuthModalContext';

export interface HeroShowcaseData {
  // Left Hero Copy
  heroTopPill?: string;
  heroHeadlineMain?: string;
  heroHeadlineGradient?: string;
  heroSubheadline?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  heroSecondaryText?: string;
  heroSecondaryLink?: string;
  
  // Key Stats Counters
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
  trustText?: string;

  // 9:16 Video Reel Card
  badgeText?: string;
  durationText?: string;
  category?: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  buttonText?: string;
  buttonLink?: string;

  // Floating Badge 1 (Top-Left)
  floatingBadge1Title?: string;
  floatingBadge1Sub?: string;
  floatingBadge1Icon?: string;
  floatingBadge1Color?: string;

  // Floating Badge 2 (Bottom-Right)
  floatingBadge2Title?: string;
  floatingBadge2Sub?: string;
  floatingBadge2Icon?: string;
  floatingBadge2Color?: string;
}

const DEFAULT_HERO: HeroShowcaseData = {
  heroTopPill: 'Next-Gen AI Product Video Ads • Fast 2-Day Delivery',
  heroHeadlineMain: 'AI Product Ads That',
  heroHeadlineGradient: 'Stop the Scroll.',
  heroSubheadline: 'Transform simple product photos into viral, high-converting vertical video reels. Powered by hyper-realistic AI models, cinematic voiceovers, and dynamic visual effects.',
  heroCtaText: 'Book Your AI Reel Now',
  heroCtaLink: '/book',
  heroSecondaryText: 'Watch Portfolio',
  heroSecondaryLink: '/portfolio',
  
  stat1Value: '2 Days',
  stat1Label: 'Guaranteed Delivery',
  stat2Value: '₹600',
  stat2Label: 'Starter Packages',
  stat3Value: '10x CTR',
  stat3Label: 'Instagram Boost',
  trustText: '4.9/5 by 150+ Brands',

  badgeText: 'AI Reel Demo',
  durationText: '00:30',
  category: 'Fashion & Luxury',
  title: 'Luxury Silk Saree AI Showcase',
  description: 'Generated purely from 2 flat product photos. Complete with AI lighting & model animation.',
  videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-golden-dress-40995-large.mp4',
  buttonText: 'View All 7 Categories',
  buttonLink: '/portfolio',
  
  floatingBadge1Title: 'Commercial Rights',
  floatingBadge1Sub: '100% Monetization',
  floatingBadge1Icon: 'check',
  floatingBadge1Color: 'emerald',

  floatingBadge2Title: 'AI Voiceover',
  floatingBadge2Sub: 'Hindi & English',
  floatingBadge2Icon: 'zap',
  floatingBadge2Color: 'brand',
};

// Helper for rendering dynamic icon for floating badge
function renderBadgeIcon(iconKey?: string) {
  switch (iconKey) {
    case 'shield':
      return <ShieldCheck className="w-4 h-4" />;
    case 'sparkles':
      return <Sparkles className="w-4 h-4" />;
    case 'zap':
      return <Zap className="w-4 h-4" />;
    case 'star':
      return <Star className="w-4 h-4" />;
    case 'headphones':
      return <Headphones className="w-4 h-4" />;
    case 'film':
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'flame':
      return <Flame className="w-4 h-4" />;
    case 'check':
    default:
      return <Check className="w-4 h-4" />;
  }
}

// Helper for color styles
function getBadgeColorStyles(colorKey?: string) {
  switch (colorKey) {
    case 'cyan':
      return 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/40';
    case 'violet':
      return 'bg-accent-violet/20 text-accent-violet border-accent-violet/40';
    case 'amber':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'rose':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    case 'brand':
      return 'bg-brand-500/20 text-brand-400 border-brand-500/40';
    case 'emerald':
    default:
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  }
}

export default function Hero({ initialData }: { initialData?: HeroShowcaseData }) {
  const { data: session } = useSession();
  const { requireAuth } = useAuthModal();
  const [heroData, setHeroData] = useState<HeroShowcaseData>(initialData || DEFAULT_HERO);

  useEffect(() => {
    // Fetch live hero showcase data
    fetch('/api/admin/hero')
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.title || data.heroHeadlineMain)) {
          setHeroData((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  const handleProtectedBookClick = (e: React.MouseEvent) => {
    if (!session?.user) {
      e.preventDefault();
      requireAuth(() => {
        window.location.href = heroData.heroCtaLink || '/book';
      }, heroData.heroCtaLink || '/book');
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-hero-gradient">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-accent-violet/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-400 shadow-lg shadow-brand-500/10">
              <Sparkles className="w-3.5 h-3.5 text-brand-300 animate-pulse" />
              <span>{heroData.heroTopPill || 'Next-Gen AI Product Video Ads • Fast 2-Day Delivery'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
              {heroData.heroHeadlineMain || 'AI Product Ads That'}{' '}
              <br />
              <span className="text-gradient-blue">
                {heroData.heroHeadlineGradient || 'Stop the Scroll.'}
              </span>
            </h1>

            {/* Short Intro */}
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {heroData.heroSubheadline || 'Transform simple product photos into viral, high-converting vertical video reels. Powered by hyper-realistic AI models, cinematic voiceovers, and dynamic visual effects.'}
            </p>

            {/* Stat Counters / Highlights */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 max-w-lg mx-auto lg:mx-0">
              <div className="glass-panel p-2.5 sm:p-3.5 rounded-2xl border-surface-200/50 text-center">
                <div className="text-lg sm:text-2xl font-black text-white">{heroData.stat1Value || '2 Days'}</div>
                <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium leading-tight">{heroData.stat1Label || 'Guaranteed Delivery'}</div>
              </div>
              <div className="glass-panel p-2.5 sm:p-3.5 rounded-2xl border-surface-200/50 text-center">
                <div className="text-lg sm:text-2xl font-black text-brand-400">{heroData.stat2Value || '₹600'}</div>
                <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium leading-tight">{heroData.stat2Label || 'Starter Packages'}</div>
              </div>
              <div className="glass-panel p-2.5 sm:p-3.5 rounded-2xl border-surface-200/50 text-center">
                <div className="text-lg sm:text-2xl font-black text-emerald-400">{heroData.stat3Value || '10x CTR'}</div>
                <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium leading-tight">{heroData.stat3Label || 'Instagram Boost'}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href={heroData.heroCtaLink || '/book'}
                onClick={handleProtectedBookClick}
                className="btn-glow w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white shadow-xl shadow-brand-500/30 hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <Sparkles className="w-5 h-5 text-brand-300" />
                {heroData.heroCtaText || 'Book Your AI Reel Now'}
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href={heroData.heroSecondaryLink || '/portfolio'}
                className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-semibold text-gray-200 hover:text-white glass-panel hover:bg-surface-100/90 border border-surface-200/80 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 text-brand-400 fill-brand-400" />
                {heroData.heroSecondaryText || 'Watch Portfolio'}
              </Link>
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-2 text-xs text-gray-400 flex-wrap">
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-[#080B11]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Client" />
                <img className="w-7 h-7 rounded-full border-2 border-[#080B11]" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="Client" />
                <img className="w-7 h-7 rounded-full border-2 border-[#080B11]" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="Client" />
              </div>
              <div className="flex items-center gap-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="font-semibold text-white">{heroData.trustText || '4.9/5 by 150+ Brands'}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Video Teaser Showcase Card (Dynamic from Database) */}
          <div className="lg:col-span-5 relative flex justify-center w-full px-2 sm:px-0">
            
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-[9/16] rounded-3xl overflow-hidden glass-panel border border-brand-500/40 p-2 sm:p-2.5 shadow-2xl shadow-brand-500/20 glow-box-blue group">
              
              {/* Inner Frame */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black">
                {heroData.videoUrl && (
                  <video
                    key={heroData.videoUrl}
                    src={heroData.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/35 flex flex-col justify-between p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-brand-600/85 backdrop-blur-md text-white border border-brand-400/40 flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      {heroData.badgeText || 'AI Reel Demo'}
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono text-gray-300 bg-black/60 px-2 sm:px-2.5 py-1 rounded-md border border-white/10">
                      {heroData.durationText || '00:30'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-accent-violet/85 text-white shadow-sm">
                      {heroData.category || 'Fashion & Luxury'}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white drop-shadow">
                      {heroData.title || 'Luxury Silk Saree AI Showcase'}
                    </h3>
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                      {heroData.description || 'Generated purely from 2 flat product photos. Complete with AI lighting & model animation.'}
                    </p>
                    <Link
                      href={heroData.buttonLink || '/portfolio'}
                      className="mt-2 w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      {heroData.buttonText || 'View All 7 Categories'}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1 (Top-Left) */}
              <div className="absolute top-2 left-2 sm:-top-4 sm:-left-4 glass-panel p-2 sm:p-3 rounded-xl border-brand-400/40 flex items-center gap-2 sm:gap-2.5 shadow-xl animate-float z-20">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs ${getBadgeColorStyles(heroData.floatingBadge1Color)}`}>
                  {renderBadgeIcon(heroData.floatingBadge1Icon)}
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs font-bold text-white">
                    {heroData.floatingBadge1Title || 'Commercial Rights'}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400">
                    {heroData.floatingBadge1Sub || '100% Monetization'}
                  </div>
                </div>
              </div>

              {/* Floating Badge 2 (Bottom-Right) */}
              <div className="absolute bottom-2 right-2 sm:-bottom-4 sm:-right-4 glass-panel p-2 sm:p-3 rounded-xl border-brand-400/40 flex items-center gap-2 sm:gap-2.5 shadow-xl animate-float z-20" style={{ animationDelay: '2s' }}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs ${getBadgeColorStyles(heroData.floatingBadge2Color)}`}>
                  {renderBadgeIcon(heroData.floatingBadge2Icon || 'zap')}
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs font-bold text-white">
                    {heroData.floatingBadge2Title || 'AI Voiceover'}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400">
                    {heroData.floatingBadge2Sub || 'Hindi & English'}
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
