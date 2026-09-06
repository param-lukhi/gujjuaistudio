'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck, X, Lock } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';

export interface PackageType {
  id: string;
  slug: string;
  name: string;
  price: number;
  duration: string;
  revisions: string;
  deliveryDays: string;
  features: string[];
  popular?: boolean;
}

interface PricingProps {
  packages?: PackageType[];
}

const DEFAULT_PACKAGES: PackageType[] = [
  {
    id: 'starter',
    slug: 'starter',
    name: '🥉 Starter Package',
    price: 600,
    duration: 'Up to 15 Seconds',
    revisions: '1 Revision',
    deliveryDays: 'Delivery in 2 Days',
    features: [
      '1 AI Product Reel',
      'Up to 15 Seconds',
      '1 Revisions',
      'Delivery in 2 Days',
      '1080p HD Vertical Reel Format'
    ],
    popular: false,
  },
  {
    id: 'professional',
    slug: 'professional',
    name: '🥈 Professional Package',
    price: 1200,
    duration: 'Up to 30 Seconds Each',
    revisions: '1 Revision',
    deliveryDays: 'Delivery in 2 Days',
    features: [
      '1 AI Product Reels',
      'Up to 30 Seconds Each',
      'AI Voiceover (Hindi / English)',
      'Commercial Use Rights',
      '1 Revisions',
      'Delivery in 2 Days',
      '4K Ultra HD Reel Format'
    ],
    popular: true,
  },
  {
    id: 'premium',
    slug: 'premium',
    name: '🥇 Premium Package',
    price: 2300,
    duration: 'Up to 60 Seconds Each',
    revisions: '1 Revision',
    deliveryDays: 'Delivery in 2 Days',
    features: [
      '1 AI Product Reels',
      'Up to 60 Seconds Each',
      'AI Voiceover',
      'Background Music',
      '1 Revisions',
      'Delivery in 2 Days',
      'Cinematic Script & VFX',
      'Full Commercial & Ad Rights'
    ],
    popular: false,
  },
];

export default function PricingCard({ packages = DEFAULT_PACKAGES }: PricingProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedPkgSlug, setSelectedPkgSlug] = useState<string | null>(null);

  // Auth form modal state
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectPackage = (slug: string) => {
    if (session?.user) {
      router.push(`/book?package=${slug}`);
    } else {
      setSelectedPkgSlug(slug);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (authMode === 'LOGIN') {
        const res = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (res?.error) {
          throw new Error('Invalid email or password credentials.');
        }
      } else {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.error || 'Registration failed.');

        await signIn('credentials', {
          redirect: false,
          email,
          password,
        });
      }

      const slugToBook = selectedPkgSlug || 'professional';
      setSelectedPkgSlug(null);
      router.push(`/book?package=${slugToBook}`);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-24 relative" id="pricing">
      {/* Auth Modal if package clicked while logged out */}
      {selectedPkgSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0D111A] p-6 sm:p-8 rounded-3xl border border-brand-500/30 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedPkgSlug(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Login / Register Required</h3>
              <p className="text-xs text-gray-400">
                Please Sign In or Create an Account to proceed with your booking.
              </p>
            </div>

            <div className="flex border-b border-surface-200/50 pb-2 gap-2">
              <button
                type="button"
                onClick={() => setAuthMode('LOGIN')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${authMode === 'LOGIN' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('REGISTER')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${authMode === 'REGISTER' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'REGISTER' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav Patel"
                    className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xl shadow-brand-500/30 transition flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : authMode === 'LOGIN' ? 'Login & Continue Booking' : 'Register & Continue Booking'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Glow background */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[350px] bg-brand-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-400">
            <Zap className="w-3.5 h-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Simple & Affordable Pricing
          </h2>
          <p className="text-gray-300 text-sm sm:text-base">
            No hidden costs. Choose a plan tailored for your brand growth.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const isPopular = pkg.popular;
            return (
              <div
                key={pkg.id}
                className={`glass-panel rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 ${isPopular
                    ? 'border-brand-500 bg-brand-950/20 shadow-2xl shadow-brand-500/20 scale-105 z-10'
                    : 'border-surface-200/50 hover:border-surface-200'
                  }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-600 to-accent-violet text-white text-xs font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    MOST POPULAR
                  </div>
                )}

                <div>
                  {/* Package Title */}
                  <h3 className="text-xl font-extrabold text-white mb-2">
                    {pkg.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 my-5">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {formatCurrencyINR(pkg.price)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">/ reel</span>
                  </div>

                  <p className="text-xs text-gray-400 border-b border-surface-200/50 pb-5 mb-6">
                    {pkg.deliveryDays} • {pkg.revisions}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3.5 text-sm mb-8">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isPopular ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-200 text-brand-400'
                          }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={() => handleSelectPackage(pkg.slug)}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 transition-all ${isPopular
                      ? 'btn-glow text-white shadow-xl shadow-brand-500/30 hover:scale-105'
                      : 'bg-surface-100 hover:bg-surface-200 text-white border border-surface-200 hover:border-brand-500/50'
                    }`}
                >
                  Select {pkg.name.split(' ')[1] || 'Package'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Guarantee Note */}
        <div className="mt-12 p-4 rounded-2xl glass-panel border-surface-200/60 max-w-2xl mx-auto flex items-center justify-center gap-3 text-xs text-gray-300 text-center">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Need bulk reels for your agency or e-commerce store? Contact us for custom monthly retainer pricing!</span>
        </div>

      </div>
    </section>
  );
}
