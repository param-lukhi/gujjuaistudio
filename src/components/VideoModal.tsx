'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { X, Play, Pause, Volume2, VolumeX, Sparkles, ArrowRight, Eye, Clock, Smartphone, CheckCircle2 } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    category: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: string;
    views?: number;
  } | null;
}

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : null;
}

function getVimeoEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : null;
}

export default function VideoModal({ isOpen, onClose, item }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen || !item) return null;

  const ytEmbed = getYouTubeEmbedUrl(item.videoUrl);
  const vimeoEmbed = getVimeoEmbedUrl(item.videoUrl);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto lg:overflow-hidden bg-[#0A0E17] border border-surface-200/80 rounded-3xl shadow-2xl z-10 flex flex-col lg:flex-row items-center justify-between p-4 sm:p-6 gap-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105"
          aria-label="Close Preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 9:16 VERTICAL PHONE REEL FRAME */}
        <div className="w-full max-w-[310px] sm:max-w-[340px] shrink-0 mx-auto">
          <div className="relative aspect-[9/16] w-full rounded-3xl overflow-hidden glass-panel border-2 border-brand-500/40 p-2 sm:p-2.5 shadow-2xl shadow-brand-500/25 glow-box-blue group bg-black">
            
            {/* Inner Video Container */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              {ytEmbed ? (
                <iframe
                  src={ytEmbed}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : vimeoEmbed ? (
                <iframe
                  src={vimeoEmbed}
                  title={item.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={item.videoUrl}
                    autoPlay
                    preload="auto"
                    playsInline
                    loop
                    muted={isMuted}
                    poster={item.thumbnailUrl || undefined}
                    className="w-full h-full object-contain sm:object-cover bg-black cursor-pointer"
                    onClick={togglePlay}
                  />

                  {/* Floating Quick Controls Bar (Play/Pause & Mute) */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-20">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs flex items-center gap-1.5 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                      <span className="text-[10px] font-semibold">{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs flex items-center gap-1.5 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-semibold">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>
                  </div>
                </>
              )}

              {/* 9:16 Badge Indicator */}
              <div className="absolute top-3 left-3 z-20 pointer-events-none">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-600/90 backdrop-blur-md text-white border border-brand-400/40 flex items-center gap-1 shadow-md">
                  <Smartphone className="w-3 h-3" />
                  9:16 AI Reel
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Video Info Details */}
        <div className="flex-1 w-full flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            
            {/* Category & Duration Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/15 text-brand-400 border border-brand-500/30">
                {item.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-300 font-mono bg-surface-100 px-2.5 py-1 rounded-full border border-surface-200">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                {item.duration || '30s'}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                ✓ 9:16 Vertical HD
              </span>
            </div>

            {/* Reel Title */}
            <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {item.title}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              AI-generated ultra-realistic commercial product reel with dynamic camera sweeps, cinematic lighting, and custom sound design. Built for viral engagement on social media.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-surface-100/60 border border-surface-200/60 space-y-1">
                <div className="text-[10px] uppercase font-bold text-gray-400">Aspect Ratio</div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-brand-400" />
                  9:16 Vertical (Reels / Shorts)
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-surface-100/60 border border-surface-200/60 space-y-1">
                <div className="text-[10px] uppercase font-bold text-gray-400">Resolution & Quality</div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  4K Ultra HD AI Render
                </div>
              </div>
            </div>

            {/* Platform Trust Box */}
            <div className="p-3.5 rounded-2xl bg-surface-100/40 border border-surface-200/50 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-300">
                <span>Ideal Platforms</span>
                <span className="font-semibold text-brand-300">Instagram Reels, YouTube Shorts, Meta Ads</span>
              </div>
              {item.views !== undefined && (
                <div className="flex items-center justify-between text-gray-300">
                  <span>Showcase Views</span>
                  <span className="font-semibold text-white flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-brand-400" />
                    {item.views.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2">
            <Link
              href={`/book?category=${encodeURIComponent(item.category)}`}
              onClick={onClose}
              className="btn-glow w-full py-3.5 rounded-2xl text-sm font-bold text-white text-center flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 hover:scale-[1.01] transition-transform"
            >
              <Sparkles className="w-4 h-4 text-brand-300" />
              Order Similar 9:16 AI Reel
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

