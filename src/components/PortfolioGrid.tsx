'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Play, Sparkles, Clock, Eye, Film, Volume2, VolumeX } from 'lucide-react';
import VideoModal from './VideoModal';

export interface PortfolioItemType {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  featured?: boolean;
  views?: number;
}

interface PortfolioGridProps {
  items: PortfolioItemType[];
  initialCategory?: string;
  showAllButton?: boolean;
  title?: string;
  subtitle?: string;
}

const CATEGORIES = [
  'All',
  'Fashion',
  'Clothing',
  'Jewelry',
  'Food',
  'Beauty',
  'Electronics',
  'Restaurant'
];

// Helper to extract YouTube video ID
function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

// Helper to derive effective thumbnail URL
function getEffectiveThumbnail(videoUrl?: string, thumbnailUrl?: string): string {
  if (thumbnailUrl && thumbnailUrl.trim() !== '') {
    return thumbnailUrl.trim();
  }
  if (!videoUrl) return '';

  const ytId = getYouTubeId(videoUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  // Cloudinary video thumbnail trick
  if (videoUrl.includes('cloudinary.com') && videoUrl.match(/\.(mp4|mov|webm)$/i)) {
    return videoUrl.replace(/\.(mp4|mov|webm)$/i, '.jpg');
  }

  return '';
}

// Category specific gradients & subtle themes
function getCategoryGradient(cat?: string) {
  switch ((cat || '').toLowerCase()) {
    case 'beauty':
      return 'from-pink-600/40 via-purple-900/50 to-[#080B11]';
    case 'fashion':
    case 'clothing':
      return 'from-violet-600/40 via-indigo-900/50 to-[#080B11]';
    case 'jewelry':
      return 'from-amber-500/40 via-yellow-900/50 to-[#080B11]';
    case 'food':
    case 'restaurant':
      return 'from-orange-600/40 via-red-950/50 to-[#080B11]';
    case 'electronics':
      return 'from-cyan-600/40 via-blue-950/50 to-[#080B11]';
    default:
      return 'from-brand-600/40 via-brand-950/50 to-[#080B11]';
  }
}

function ReelCard({ item, onSelect }: { item: PortfolioItemType; onSelect: () => void }) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const categoryName = item?.category || 'AI Reel';
  const itemTitle = item?.title || 'Commercial AI Video';
  const effectiveThumbnail = getEffectiveThumbnail(item?.videoUrl, item?.thumbnailUrl);
  const ytId = getYouTubeId(item?.videoUrl);
  const isDirectVideo = Boolean(item?.videoUrl) && !ytId && !videoError;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && isDirectVideo) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay was blocked or video not ready
          setIsPlaying(false);
        });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlaying(false);
    if (videoRef.current && isDirectVideo) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl overflow-hidden glass-panel border border-surface-200/60 hover:border-brand-500/60 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-brand-500/25 hover:-translate-y-1.5"
    >
      {/* Reel Card Aspect Ratio */}
      <div className={`relative aspect-[9/16] overflow-hidden bg-gradient-to-b ${getCategoryGradient(categoryName)}`}>
        
        {/* Direct Video element for instant frame preview & hover autoplay */}
        {isDirectVideo ? (
          <video
            ref={videoRef}
            src={item.videoUrl}
            poster={effectiveThumbnail || undefined}
            preload="metadata"
            muted
            playsInline
            loop
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 bg-black"
          />
        ) : effectiveThumbnail && !imageError ? (
          /* Thumbnail Image Fallback (e.g. YouTube or static image) */
          <img
            src={effectiveThumbnail}
            alt={itemTitle}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          /* Graceful Fallback AI Reel Cover when image & video fail to load */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-glow opacity-50 pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center mb-4 text-brand-300 shadow-xl group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-brand-300/90 mb-1">
              {categoryName} • AI Reel
            </span>
            <p className="text-xs font-semibold text-white/90 line-clamp-2 px-2">
              {itemTitle}
            </p>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/40 group-hover:via-black/10 transition-colors pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-600/90 text-white backdrop-blur-md border border-brand-400/40 shadow-sm">
            {categoryName}
          </span>
          
          <div className="flex items-center gap-1.5">
            {isPlaying && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Preview
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-gray-200 bg-black/70 border border-white/10 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Clock className="w-3 h-3 text-brand-400" />
              {item?.duration || '30s'}
            </span>
          </div>
        </div>

        {/* Play Button Glow Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 shadow-xl backdrop-blur-sm ${
              isPlaying
                ? 'opacity-0 scale-75'
                : 'bg-brand-600/80 group-hover:bg-brand-500 text-white border-brand-300/40 group-hover:scale-110 shadow-brand-500/40'
            }`}
          >
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom Text Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1.5 z-10 pointer-events-none">
          <h3 className="text-sm font-bold text-white leading-snug group-hover:text-brand-300 transition-colors line-clamp-2">
            {itemTitle}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
            <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
              {isPlaying ? 'Playing AI Reel...' : 'Click to Play AI Video'}
            </span>
            {item?.views !== undefined && (
              <span className="flex items-center gap-1 text-gray-400 font-mono">
                <Eye className="w-3 h-3 text-brand-400" />
                {item.views} views
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function PortfolioGrid({
  items,
  initialCategory = 'All',
  showAllButton = false,
  title = 'Our AI Product Reels Portfolio',
  subtitle = 'Explore high-converting video ads created for top Indian brands across 7 specialized industries.'
}: PortfolioGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [selectedVideo, setSelectedVideo] = useState<PortfolioItemType | null>(null);

  const safeList = Array.isArray(items) ? items : [];

  const filteredItems = activeCategory === 'All'
    ? safeList
    : safeList.filter(item => (item?.category || '').toLowerCase() === (activeCategory || '').toLowerCase());

  return (
    <section className="py-16 md:py-24 relative">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-brand-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Reel Gallery</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border ${
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-brand-600 text-white border-brand-400 shadow-lg shadow-brand-500/30 scale-105'
                  : 'glass-panel text-gray-300 hover:text-white hover:bg-surface-100/80 border-surface-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Reels */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl border-surface-200/50">
            <p className="text-gray-400 text-sm">No reels found in category "{activeCategory}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, idx) => (
              <ReelCard
                key={item?.id || `reel-${idx}`}
                item={item}
                onSelect={() => setSelectedVideo(item)}
              />
            ))}
          </div>
        )}

        {/* Optional View All Button */}
        {showAllButton && (
          <div className="text-center pt-12">
            <Link
              href="/portfolio"
              className="btn-glow px-8 py-3.5 rounded-xl text-sm font-bold text-white inline-flex items-center gap-2 shadow-lg shadow-brand-500/25 hover:scale-105 transition-all"
            >
              Explore Full 7-Category Reel Showcase
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>

      {/* Video Modal Player */}
      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        item={selectedVideo}
      />
    </section>
  );
}
