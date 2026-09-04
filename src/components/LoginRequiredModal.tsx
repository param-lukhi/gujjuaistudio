'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, X, LogIn, UserPlus, ShieldAlert } from 'lucide-react';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
  actionTitle?: string;
}

export default function LoginRequiredModal({
  isOpen,
  onClose,
  redirectUrl = '/dashboard',
  actionTitle = 'continue',
}: LoginRequiredModalProps) {
  if (!isOpen) return null;

  const loginHref = `/login?callbackUrl=${encodeURIComponent(redirectUrl)}`;
  const registerHref = `/register?callbackUrl=${encodeURIComponent(redirectUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0D121F]/95 border border-brand-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-brand-500/30 text-center glass-panel">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white bg-surface-100/60 hover:bg-surface-200 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600/30 via-brand-500/20 to-accent-cyan/20 border border-brand-500/50 flex items-center justify-center mb-5 shadow-lg shadow-brand-500/20">
          <Lock className="w-8 h-8 text-brand-400 animate-pulse" />
        </div>

        {/* Header */}
        <h3 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          🔒 Login Required
        </h3>

        {/* Description */}
        <p className="mt-3 text-sm text-gray-300 leading-relaxed font-medium">
          Please login or create an account to {actionTitle}.
        </p>

        <div className="mt-4 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-brand-400 shrink-0" />
          <span>Guest users cannot book services, send messages, or access orders.</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href={loginHref}
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 border border-brand-400/40 shadow-lg shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>

          <Link
            href={registerHref}
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-gray-200 bg-surface-100 hover:bg-surface-200 hover:text-white border border-surface-200 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-accent-cyan" />
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
