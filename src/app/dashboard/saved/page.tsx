'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/providers/ToastProvider';
import { formatCurrencyINR } from '@/lib/utils';
import {
  Heart,
  Star,
  PlusCircle,
  Trash2,
  Package,
  ArrowRight
} from 'lucide-react';

export default function SavedServicesPage() {
  const { showToast } = useToast();
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedServices();
  }, []);

  const fetchSavedServices = async () => {
    try {
      const res = await fetch('/api/saved-services');
      if (res.ok) {
        const data = await res.json();
        setSaved(data.savedServices || []);
      }
    } catch (e) {
      console.error('Failed to load saved services:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (packageId: string) => {
    try {
      const res = await fetch('/api/saved-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      if (res.ok) {
        showToast('Service removed from saved list', 'info');
        fetchSavedServices();
      }
    } catch (e) {
      showToast('Failed to remove service', 'error');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-surface-100/50 rounded-3xl" />
          <div className="h-36 bg-surface-100/50 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-200/80 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Saved Services & Favorites
              </h1>
              <p className="text-xs text-gray-400">Quick access to your bookmarked AI reel packages for instant checkout.</p>
            </div>
          </div>

          <Link
            href="/pricing"
            className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 transition-all"
          >
            Explore Packages <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Saved List */}
        {saved.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-surface-200/80 text-center space-y-3">
            <Heart className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Saved Services Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Save your favorite AI video packages to quickly re-order anytime from your dashboard.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-lg shadow-brand-500/20"
            >
              Browse Packages
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saved.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-6 rounded-2xl border border-surface-200/80 hover:border-brand-500/40 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-base text-white">{item.serviceName}</h3>
                    <button
                      onClick={() => handleRemove(item.packageId)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-all"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                  <p className="text-xl font-black text-brand-400">{formatCurrencyINR(item.price)}</p>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/book?package=${item.packageId}`}
                    className="btn-glow w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
                  >
                    <PlusCircle className="w-4 h-4" /> Book Package Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
