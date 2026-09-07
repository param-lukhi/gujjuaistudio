import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import StatusBadge from '@/components/StatusBadge';
import { prisma } from '@/lib/db';
import { formatCurrencyINR } from '@/lib/utils';
import { ShoppingBag, Film, IndianRupee, Clock, ArrowUpRight, TrendingUp, Sparkles, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  let bookings: any[] = [];
  let reelsCount = 0;
  let messagesCount = 0;
  let totalRevenue = 0;
  let pendingCount = 0;

  try {
    bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    reelsCount = await prisma.portfolioItem.count();
    messagesCount = await prisma.contactMessage.count({ where: { status: 'UNREAD' } });

    const allBookings = await prisma.booking.findMany();
    totalRevenue = allBookings.reduce((sum, b) => sum + b.price, 0);
    pendingCount = allBookings.filter(b => b.status === 'PENDING' || b.status === 'IN_PROGRESS').length;
  } catch (e) {
    console.error('Db fetch error in admin overview:', e);
  }

  return (
    <div className="flex min-h-screen bg-[#080B11]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 lg:pt-8 space-y-6 sm:space-y-8 overflow-y-auto min-w-0 w-full">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-200/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Welcome back, Studio Admin. Here is today's agency overview.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/portfolio"
              className="btn-glow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
            >
              <Film className="w-3.5 h-3.5" />
              + Add AI Reel
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-surface-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{formatCurrencyINR(totalRevenue)}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>All completed & active orders</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-surface-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Orders</span>
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{pendingCount}</div>
            <div className="text-[11px] text-brand-400">In production / pending</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-surface-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Portfolio Reels</span>
              <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 text-accent-cyan flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{reelsCount}</div>
            <div className="text-[11px] text-gray-400">Across 7 Categories</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-surface-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Unread Messages</span>
              <div className="w-9 h-9 rounded-xl bg-accent-violet/10 text-accent-violet flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{messagesCount}</div>
            <div className="text-[11px] text-accent-violet">Client Inquiries</div>
          </div>

        </div>

        {/* Recent Orders Table */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-200/70 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-200/50 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-400" />
              Recent Client Orders
            </h3>
            <Link
              href="/admin/bookings"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No recent bookings recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-surface-100/60 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-surface-200/60">
                  <tr>
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Client / Business</th>
                    <th className="p-3">Package</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200/40 font-medium">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-100/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-brand-400">{b.bookingRef}</td>
                      <td className="p-3">
                        <div className="text-white font-bold">{b.clientName}</div>
                        <div className="text-[10px] text-gray-400">{b.businessName}</div>
                      </td>
                      <td className="p-3 text-gray-200">{b.packageName}</td>
                      <td className="p-3 font-bold text-white">{formatCurrencyINR(b.price)}</td>
                      <td className="p-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="p-3 text-gray-400">
                        {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
