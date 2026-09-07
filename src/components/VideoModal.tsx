'use client';

import React from 'react';
import Link from 'next/link';
import { X, Play, Sparkles, ArrowRight, Eye, Clock } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    category: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: string;
    views?: number;
  } | null;
}

export default function VideoModal({ isOpen, onClose, item }: VideoModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto md:overflow-hidden bg-surface-50 border border-surface-200/80 rounded-2xl sm:rounded-3xl shadow-2xl z-10 flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
          aria-label="Close Preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Frame */}
        <div className="w-full md:w-3/5 bg-black relative aspect-[9/16] md:aspect-[3/4] flex items-center justify-center overflow-hidden max-h-[48vh] sm:max-h-[60vh] md:max-h-[70vh]">
          <video
            src={item.videoUrl}
            controls
            autoPlay
            playsInline
            loop
            className="w-full h-full object-cover"
            poster={item.thumbnailUrl}
          />
        </div>

        {/* Video Info Details */}
        <div className="w-full md:w-2/5 p-5 sm:p-6 flex flex-col justify-between space-y-4 sm:space-y-6 bg-surface-50">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/30">
                {item.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {item.duration}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white leading-snug">
              {item.title}
            </h3>

            <p className="text-xs text-gray-400 leading-relaxed">
              AI-generated ultra-realistic commercial product reel with dynamic camera sweeps, cinematic lighting, and custom sound design.
            </p>

            <div className="p-3.5 rounded-xl bg-surface-100/60 border border-surface-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-300">
                <span>Resolution</span>
                <span className="font-semibold text-white">4K Vertical (9:16)</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span>Ideal Platforms</span>
                <span className="font-semibold text-brand-400">Instagram Reels & Shorts</span>
              </div>
              {item.views && (
                <div className="flex items-center justify-between text-gray-300">
                  <span>Views</span>
                  <span className="font-semibold text-white flex items-center gap-1">
                    <Eye className="w-3 h-3 text-brand-400" />
                    {item.views.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={`/book?category=${encodeURIComponent(item.category)}`}
              onClick={onClose}
              className="btn-glow w-full py-3 rounded-xl text-sm font-bold text-white text-center flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 hover:scale-[1.02] transition-transform"
            >
              <Sparkles className="w-4 h-4 text-brand-300" />
              Order Similar AI Reel
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
