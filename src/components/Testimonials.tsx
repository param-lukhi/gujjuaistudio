'use client';

import React from 'react';
import { Star, Quote, Sparkles } from 'lucide-react';

export interface ReviewType {
  id: string;
  clientName: string;
  business: string;
  rating: number;
  comment: string;
  avatarUrl?: string | null;
}

const DEFAULT_REVIEWS: ReviewType[] = [
  {
    id: '1',
    clientName: 'Rahul Patel',
    business: 'Surat Silk Prints',
    rating: 5,
    comment: 'Gujju AI Studio delivered a 30s product reel that generated 4.2k orders on Instagram in just 5 days! The AI voiceover in Hindi was spot on.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '2',
    clientName: 'Priya Sharma',
    business: 'Aura Glow Cosmetics',
    rating: 5,
    comment: 'The quality of the AI generated model and lighting for our serum was mindblowing. Stopped the scroll instantly for our Meta Ads!',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '3',
    clientName: 'Jayesh Mehta',
    business: 'Urban Bites Restaurant',
    rating: 5,
    comment: 'Super fast delivery in 2 days. The background music and cinematic cuts made our food look ultra-luxurious.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  }
];

export default function Testimonials({ reviews = DEFAULT_REVIEWS }: { reviews?: ReviewType[] }) {
  return (
    <section className="py-16 md:py-24 bg-surface-50/50 relative border-y border-surface-200/50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Client Success Stories</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Loved by 150+ Indian Brands
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            See how our AI product reels are driving massive engagement and sales boost for e-commerce, D2C brands, and local businesses.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="glass-panel p-8 rounded-3xl border border-surface-200/60 hover:border-brand-500/40 transition-all duration-300 flex flex-col justify-between relative group"
            >
              <Quote className="w-10 h-10 text-brand-500/20 absolute top-6 right-6 group-hover:text-brand-500/30 transition-colors" />

              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex text-amber-400 gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-sm text-gray-300 leading-relaxed font-normal italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-6 border-t border-surface-200/50 mt-6">
                <img
                  src={rev.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={rev.clientName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-brand-500/40"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{rev.clientName}</h4>
                  <p className="text-xs text-brand-400 font-medium">{rev.business}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
