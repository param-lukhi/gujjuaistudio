'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrencyINR } from '@/lib/utils';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Package,
  CheckCircle2,
  MessageSquare,
  PlusCircle,
  Mail,
  Building,
  Phone,
  ArrowRight,
  User,
  History,
  LogOut,
  Sparkles,
  ExternalLink,
  Video
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, bookingsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/bookings'),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfileData(data.user);
        setStats(data.stats);
      }

      if (bookingsRes.ok) {
        const bkgData = await bookingsRes.json();
        setBookings(Array.isArray(bkgData) ? bkgData : []);
      }
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const user = session?.user;

  // Find upcoming booking (Pending or Confirmed)
  const upcomingBooking = bookings.find(
    (b) => b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS'
  );

  if (loading || status === 'loading') {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-36 bg-surface-100/50 rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-28 bg-surface-100/50 rounded-2xl" />
            <div className="h-28 bg-surface-100/50 rounded-2xl" />
            <div className="h-28 bg-surface-100/50 rounded-2xl" />
            <div className="h-28 bg-surface-100/50 rounded-2xl" />
          </div>
          <div className="h-64 bg-surface-100/50 rounded-3xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Welcome Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex items-center gap-4 sm:gap-6 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-cyan p-0.5 shadow-xl shrink-0">
              {profileData?.image ? (
                <img src={profileData.image} alt={user?.name || 'User'} className="w-full h-full rounded-[14px] object-cover" />
              ) : (
                <div className="w-full h-full bg-[#080B11] rounded-[14px] flex items-center justify-center font-bold text-2xl text-brand-400">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome, {profileData?.name || user?.name || 'Client'}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-brand-500/20 border border-brand-500/40 text-brand-300 uppercase tracking-wider">
                  {profileData?.role || 'CLIENT'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-500" /> {profileData?.email || user?.email}
                </span>
                {profileData?.businessName && (
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-gray-500" /> {profileData.businessName}
                  </span>
                )}
                {profileData?.phoneNumber && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-500" /> {profileData.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
            <Link
              href="/book"
              className="btn-glow flex-1 md:flex-initial px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:scale-105 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-brand-300" />
              Book a Service
            </Link>
          </div>
        </div>

        {/* UPCOMING BOOKING SECTION */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CalendarCheck className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-black text-white">Upcoming Booking</h2>
            </div>
            <Link
              href="/dashboard/bookings"
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View All Bookings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingBooking ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-950/40 via-surface-100/50 to-surface-100/30 border border-brand-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-brand-300 bg-brand-500/20 px-2 py-0.5 rounded-lg border border-brand-500/30">
                    {upcomingBooking.bookingRef}
                  </span>
                  <StatusBadge status={upcomingBooking.status} />
                </div>
                <h3 className="font-bold text-white text-base">
                  Service: <span className="text-brand-300">{upcomingBooking.packageName}</span>
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-400" />
                    <strong>Date:</strong> {upcomingBooking.bookingDate || 'Scheduled Soon'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent-cyan" />
                    <strong>Time:</strong> {upcomingBooking.bookingTime || 'Flexible'}
                  </span>
                  <span>
                    <strong>Price:</strong> {formatCurrencyINR(upcomingBooking.price)}
                  </span>
                </div>
              </div>

              <Link
                href="/dashboard/bookings"
                className="btn-glow px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-md shadow-brand-500/20"
              >
                View Booking
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-surface-100/40 border border-surface-200/50 text-center space-y-3">
              <p className="text-xs text-gray-400">You do not have any upcoming bookings scheduled right now.</p>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600/30 hover:bg-brand-600/50 border border-brand-500/40 text-xs font-bold text-white transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Book a Service Now
              </Link>
            </div>
          )}
        </div>

        {/* QUICK ACTIONS SECTION */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <Link
              href="/dashboard/bookings"
              className="glass-panel p-4 rounded-2xl border border-surface-200/80 hover:border-brand-500/40 hover:bg-white/5 transition-all text-center space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">My Bookings</p>
            </Link>

            <Link
              href="/book"
              className="glass-panel p-4 rounded-2xl border border-surface-200/80 hover:border-accent-cyan/40 hover:bg-white/5 transition-all text-center space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Book a Service</p>
            </Link>

            <Link
              href="/dashboard/profile"
              className="glass-panel p-4 rounded-2xl border border-surface-200/80 hover:border-accent-violet/40 hover:bg-white/5 transition-all text-center space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-violet/20 text-accent-violet flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Profile</p>
            </Link>

            <Link
              href="/dashboard/bookings"
              className="glass-panel p-4 rounded-2xl border border-surface-200/80 hover:border-emerald-500/40 hover:bg-white/5 transition-all text-center space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">Booking History</p>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="glass-panel p-4 rounded-2xl border border-surface-200/80 hover:border-rose-500/40 hover:bg-rose-500/10 transition-all text-center space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <LogOut className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-rose-300">Logout</p>
            </button>
          </div>
        </div>

        {/* Dashboard Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-surface-200/80 space-y-2 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-white tracking-tight">{bookings.length}</p>
            <p className="text-xs text-gray-400 font-semibold">Total Bookings</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-surface-200/80 space-y-2 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-white tracking-tight">
              {bookings.filter((b) => b.status === 'COMPLETED').length}
            </p>
            <p className="text-xs text-gray-400 font-semibold">Completed Reels</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-surface-200/80 space-y-2 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-white tracking-tight">
              {bookings.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED').length}
            </p>
            <p className="text-xs text-gray-400 font-semibold">Active Bookings</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-surface-200/80 space-y-2 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-accent-violet/20 text-accent-violet flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-white tracking-tight">{stats.unreadMessages}</p>
            <p className="text-xs text-gray-400 font-semibold">Unread Messages</p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
