'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  LayoutDashboard,
  User,
  Package,
  CalendarCheck,
  MessageSquare,
  MailCheck,
  Bell,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const user = session?.user;

  const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
    { name: 'My Orders', href: '/dashboard/orders', icon: Package },
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
    { name: 'Messages', href: '/dashboard/chats', icon: MessageSquare },
    { name: 'Replies', href: '/dashboard/replies', icon: MailCheck },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Saved Services', href: '/dashboard/saved', icon: Heart },
    { name: 'Account Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#080B11] text-white">
      <Navbar />

      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        {/* Mobile Sidebar Toggle Button */}
        <div className="lg:hidden mb-4 flex items-center justify-between glass-panel p-4 rounded-2xl border border-surface-200/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center font-bold text-xs text-brand-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="font-bold text-sm text-white truncate">{user?.name || 'Client Dashboard'}</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl bg-surface-100 border border-surface-200 text-gray-300 hover:text-white flex items-center gap-2 text-xs font-semibold"
          >
            {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            Menu
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar */}
          <aside
            className={`lg:col-span-3 lg:block ${
              mobileSidebarOpen ? 'block' : 'hidden'
            } sticky top-28 space-y-4`}
          >
            <div className="glass-panel p-4 rounded-3xl border border-surface-200/80 shadow-xl space-y-6">
              
              {/* User Profile Overview Mini Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-950/60 to-surface-100/40 border border-brand-500/20 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-md shrink-0">
                  {user?.image ? (
                    <img src={user.image} alt={user.name || 'User'} className="w-full h-full rounded-[14px] object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#080B11] rounded-[14px] flex items-center justify-center font-bold text-sm text-brand-400">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-sm text-white truncate">{user?.name || 'Client'}</h4>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase">
                    {user?.role || 'CLIENT'}
                  </span>
                </div>
              </div>

              {/* Sidebar Menu Links */}
              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-gradient-to-r from-brand-600/40 to-brand-500/20 text-white border border-brand-500/50 shadow-md shadow-brand-500/10'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-gray-400'}`} />
                      {link.name}
                    </Link>
                  );
                })}

                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all mt-3"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Admin Control Panel
                  </Link>
                )}
              </nav>

              {/* Logout Button */}
              <div className="pt-4 border-t border-surface-200/50">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>

            </div>
          </aside>

          {/* Main Dashboard Content View */}
          <main className="lg:col-span-9 space-y-6">
            {children}
          </main>

        </div>
      </div>

      <Footer />
    </div>
  );
}
