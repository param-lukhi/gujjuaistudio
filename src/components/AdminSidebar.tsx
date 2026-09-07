'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  Film,
  ShoppingBag,
  PackageCheck,
  MessageSquare,
  Star,
  Bell,
  Settings,
  BarChart3,
  LogOut,
  Sparkles,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Hero Reel Showcase', href: '/admin/hero', icon: Sparkles },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Manage Bookings', href: '/admin/bookings', icon: ShoppingBag },
    { name: 'Manage Portfolio', href: '/admin/portfolio', icon: Film },
    { name: 'Manage Packages', href: '/admin/packages', icon: PackageCheck },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Contact Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Manage Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Website Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const navContent = (
    <>
      <div className="space-y-6 sm:space-y-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-brand-500/30 shadow-md shadow-brand-500/20 bg-[#080B11] shrink-0">
            <img
              src="/logo.png"
              alt="Gujju AI Studio Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block">
              Gujju AI Studio
            </span>
            <span className="text-[10px] text-accent-cyan uppercase font-bold tracking-wider block">
              Admin Portal
            </span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-surface-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="pt-6 border-t border-surface-200/60 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-gray-400 hover:text-white bg-surface-100/50 hover:bg-surface-100 transition-colors"
        >
          <span>View Live Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Admin Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sticky Top Header for < lg screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#080B11]/95 backdrop-blur-md border-b border-surface-200/60 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-brand-500/30 bg-[#080B11] shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-extrabold text-xs text-white block leading-tight">Gujju AI Studio</span>
            <span className="text-[9px] text-accent-cyan uppercase font-bold tracking-wider block">Admin</span>
          </div>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-surface-100 border border-surface-200 text-gray-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
          aria-label="Toggle Admin Navigation"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="text-[11px]">Menu</span>
        </button>
      </div>

      {/* Mobile Drawer (Slide-out) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[80vw] bg-[#090D16] border-r border-surface-200/70 p-5 flex flex-col justify-between h-full z-10 overflow-y-auto animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Permanent Sidebar on lg+ screens */}
      <aside className="hidden lg:flex w-64 bg-surface-50 border-r border-surface-200/60 min-h-screen p-5 flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
        {navContent}
      </aside>
    </>
  );
}
