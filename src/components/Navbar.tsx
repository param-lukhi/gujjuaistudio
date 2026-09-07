'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import {
  Sparkles,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Package,
  MessageSquare,
  MailCheck,
  Heart,
  Star,
  Bell,
  Settings,
  Lock,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState('continue');

  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch real-time unread notification count
  useEffect(() => {
    if (isAuthenticated) {
      const fetchCount = async () => {
        try {
          const res = await fetch('/api/notifications');
          if (res.ok) {
            const data = await res.json();
            setUnreadNotifications(data.unreadCount ?? 0);
          }
        } catch (e) {
          // silent fail
        }
      };
      fetchCount();
      const interval = setInterval(fetchCount, 30000); // 30s auto-refresh
      return () => clearInterval(interval);
    } else {
      setUnreadNotifications(0);
    }
  }, [isAuthenticated, pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'AI Reels', href: '/reels' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && !path.startsWith('/#') && pathname.startsWith(path)) return true;
    return false;
  };

  const handleProtectedAction = (e: React.MouseEvent, actionTitle: string, href: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setPendingAction(actionTitle);
      setShowLoginModal(true);
    } else {
      router.push(href);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#080B11]/90 backdrop-blur-md border-b border-surface-200/50 py-3.5 shadow-2xl'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300 border border-brand-500/30 bg-[#080B11] shrink-0">
                <img
                  src="/logo.png"
                  alt="Gujju AI Studio Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  Gujju AI <span className="text-brand-400 font-black">Studio</span>
                </span>
                <span className="text-[10px] text-gray-400 tracking-wider uppercase font-semibold">
                  AI Reels & Commercial Ads
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 glass-panel px-4 py-1.5 rounded-full border-surface-200/40">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-white bg-brand-600/30 border border-brand-500/40 shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Action Area */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={(e) => handleProtectedAction(e, 'book an AI reel service', '/book')}
                className="btn-glow px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
              >
                Book Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {!isAuthenticated ? (
                <>
                  {pathname !== '/login' && pathname !== '/register' && (
                    <Link
                      href="/login"
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-surface-100/60 hover:bg-surface-100 border border-surface-200/60 transition-all flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5 text-brand-400" />
                      Login
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600/30 hover:bg-brand-600/50 border border-brand-500/40 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-brand-400" />
                    My Dashboard
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    Logout
                  </button>
                  <Link
                    href="/dashboard/notifications"
                    className="relative p-2.5 rounded-xl bg-surface-100/60 hover:bg-surface-100 border border-surface-200/60 text-gray-300 hover:text-white transition-all"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 p-1 rounded-full border border-brand-500/40 hover:border-brand-400 bg-surface-100/60 transition-all focus:outline-none"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-md">
                        {user?.image ? (
                          <img
                            src={user.image}
                            alt={user.name || 'User'}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#0D121F] rounded-full flex items-center justify-center font-bold text-xs text-brand-400">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-64 glass-panel bg-[#0D121F]/95 border border-brand-500/30 rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        {/* User Header Info */}
                        <div className="p-3 border-b border-surface-200/50 mb-1">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center font-bold text-xs text-brand-300 shrink-0">
                              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-xs text-white truncate">{user?.name || 'User'}</p>
                              <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Dropdown Items */}
                        <div className="space-y-0.5 text-xs font-medium text-gray-300">
                          {user?.role === 'ADMIN' && (
                            <Link
                              href="/admin"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-brand-400 font-bold bg-brand-500/10 hover:bg-brand-500/20 transition-all"
                            >
                              <ShieldCheck className="w-4 h-4 text-brand-400" />
                              Admin Panel
                            </Link>
                          )}

                          <Link
                            href="/dashboard/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                          >
                            <User className="w-4 h-4 text-brand-400" />
                            👤 My Profile
                          </Link>

                          <Link
                            href="/dashboard/orders"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                          >
                            <Package className="w-4 h-4 text-accent-cyan" />
                            📦 My Orders
                          </Link>

                          <Link
                            href="/dashboard/chats"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                          >
                            <MessageSquare className="w-4 h-4 text-accent-violet" />
                            💬 My Chats
                          </Link>

                          <Link
                            href="/dashboard/replies"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                          >
                            <MailCheck className="w-4 h-4 text-emerald-400" />
                            📨 Admin Replies
                          </Link>

                          <Link
                            href="/dashboard/saved"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                          >
                            <Heart className="w-4 h-4 text-rose-400" />
                            ❤️ Saved Services
                          </Link>

                          <Link
                            href="/dashboard/saved"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                          >
                            <Star className="w-4 h-4 text-amber-400" />
                            ⭐ Favorites
                          </Link>

                          <Link
                            href="/dashboard/notifications"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                          >
                            <Bell className="w-4 h-4 text-sky-400" />
                            🔔 Notifications
                          </Link>

                          <Link
                            href="/dashboard/settings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                            ⚙ Account Settings
                          </Link>

                          <Link
                            href="/dashboard/settings?tab=password"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                          >
                            <Lock className="w-4 h-4 text-amber-400" />
                            🔒 Change Password
                          </Link>

                          <div className="pt-1 border-t border-surface-200/50 mt-1">
                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                signOut({ callbackUrl: '/login' });
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 font-semibold transition-all"
                            >
                              <LogOut className="w-4 h-4" />
                              🚪 Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-surface-100 border border-surface-200 text-gray-300 hover:text-white"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden glass-panel border-b border-surface-200/80 px-4 pt-3 pb-6 mt-3 space-y-3 animate-in fade-in slide-in-from-top-4 max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'text-white bg-brand-600/30 border border-brand-500/40'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-surface-200/60 flex flex-col gap-2.5">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-center text-gray-200 bg-surface-100 border border-surface-200 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-brand-400" />
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-center text-gray-200 bg-surface-100 border border-surface-200 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-accent-cyan" />
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-center text-white bg-brand-600/30 border border-brand-500/40 flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-400" />
                    My Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/login' });
                    }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-center text-rose-400 bg-surface-100 border border-surface-200 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              )}

              <button
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleProtectedAction(e, 'book a reel package', '/book');
                }}
                className="btn-glow w-full py-3 rounded-xl text-sm font-bold text-center text-white flex items-center justify-center gap-2"
              >
                Book Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Guest Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectUrl="/book"
        actionTitle={pendingAction}
      />
    </>
  );
}
