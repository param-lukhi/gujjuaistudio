import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { prisma } from '@/lib/db';
import { formatCurrencyINR } from '@/lib/utils';
import { BarChart3, TrendingUp, DollarSign, Film, ShoppingBag } from 'lucide-react';

export const revalidate = 0;

export default async function AnalyticsPage() {
  let totalBookings = 0;
  let totalRevenue = 0;
  let starterCount = 0;
  let proCount = 0;
  let premiumCount = 0;

  try {
    const bookings = await prisma.booking.findMany();
    totalBookings = bookings.length;
    totalRevenue = bookings.reduce((acc, b) => acc + b.price, 0);
    starterCount = bookings.filter(b => b.packageId === 'starter').length;
    proCount = bookings.filter(b => b.packageId === 'professional').length;
    premiumCount = bookings.filter(b => b.packageId === 'premium').length;
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="flex min-h-screen bg-[#080B11]">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
        
        <div className="border-b border-surface-200/50 pb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Analytics & Performance</h1>
          <p className="text-xs text-gray-400">Order breakdown by package, revenue trajectory, and category statistics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-surface-200/70 space-y-2">
            <span className="text-xs text-gray-400 font-semibold uppercase">Total Revenue Generated</span>
            <div className="text-3xl font-black text-emerald-400">{formatCurrencyINR(totalRevenue)}</div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-surface-200/70 space-y-2">
            <span className="text-xs text-gray-400 font-semibold uppercase">Total Bookings Count</span>
            <div className="text-3xl font-black text-brand-400">{totalBookings}</div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-surface-200/70 space-y-2">
            <span className="text-xs text-gray-400 font-semibold uppercase">Average Order Value</span>
            <div className="text-3xl font-black text-accent-cyan">
              {formatCurrencyINR(totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 1200)}
            </div>
          </div>
        </div>

        {/* Package Popularity Breakdown */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-200/70 space-y-6">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-400" />
            Bookings Distribution by Package
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-300 font-semibold mb-1">
                <span>🥈 Professional Package (₹1200)</span>
                <span>{proCount} orders</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-100 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${totalBookings > 0 ? (proCount / totalBookings) * 100 : 60}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-300 font-semibold mb-1">
                <span>🥇 Premium Package (₹2300)</span>
                <span>{premiumCount} orders</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-100 overflow-hidden">
                <div className="h-full bg-accent-violet rounded-full" style={{ width: `${totalBookings > 0 ? (premiumCount / totalBookings) * 100 : 30}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-300 font-semibold mb-1">
                <span>🥉 Starter Package (₹600)</span>
                <span>{starterCount} orders</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-100 overflow-hidden">
                <div className="h-full bg-accent-cyan rounded-full" style={{ width: `${totalBookings > 0 ? (starterCount / totalBookings) * 100 : 10}%` }} />
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
