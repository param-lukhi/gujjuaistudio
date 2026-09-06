'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, getSession, signOut } from 'next-auth/react';
import { Sparkles, ShieldCheck, Lock, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // Verify user has ADMIN role
      const session = await getSession();
      if (!session || session.user?.role !== 'ADMIN') {
        await signOut({ redirect: false });
        setError('Access Denied: Owner / Admin privileges required. Client accounts are not authorized to log in via the Owner Portal.');
        setLoading(false);
        return;
      }

      localStorage.setItem('admin_authenticated', 'true');
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#06080E] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Cyber Glowing Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-accent-cyan/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-brand-500/30 shadow-2xl relative z-10 space-y-6">
        
        {/* Owner Portal Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <KeyRound className="w-3.5 h-3.5" />
            Owner & Agency Admin Portal
          </div>
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-brand-500/30 mx-auto shadow-xl shadow-brand-500/20 bg-[#080B11]">
            <img
              src="/logo.png"
              alt="Gujju AI Studio Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Studio Owner Login</h1>
          <p className="text-xs text-gray-400">Exclusive access for Gujju AI Studio Management</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Owner / Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter owner or admin email address"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Admin Security Passcode</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            {loading ? (
              <span>Authenticating Admin...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-brand-300" />
                Sign In to Owner Portal
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 flex items-center justify-between border-t border-surface-200/40 text-xs">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Main Website
          </Link>
          <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Client Portal Login →
          </Link>
        </div>

      </div>
    </main>
  );
}

