'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Sparkles, User, Building, Mail, Phone, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create account.');
        setLoading(false);
      } else {
        setSuccessMessage('Account created! Signing you in...');
        
        // Auto-login after registration
        const loginRes = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (loginRes?.ok) {
          router.push(callbackUrl);
        } else {
          router.push(`/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
      }
    } catch (err: any) {
      setErrorMessage('Network error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to connect with Google.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg relative z-10">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-surface-200/80 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-cyan p-0.5 mx-auto shadow-lg shadow-brand-500/30">
            <div className="w-full h-full bg-[#080B11] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Register to book AI reels, choose dates & time slots, and manage orders.
          </p>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 text-xs sm:text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs sm:text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google Quick Sign Up / Login Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-3.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-sm font-semibold text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-black/20"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>
          <span>{googleLoading ? 'Connecting with Google...' : 'Sign up / Continue with Google'}</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-200/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0c1017] px-3 text-gray-500 font-medium">Or register with email</span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
              Full Name <span className="text-brand-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Raj Patel"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
              Email Address <span className="text-brand-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@business.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                Phone Number <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                Business / Brand Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Surat Jewels"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                Password <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                Confirm Password <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </span>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-3 text-xs text-gray-400 border-t border-surface-200/50">
          Already have an account?{' '}
          <Link
            href={callbackUrl && callbackUrl !== '/dashboard' ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login'}
            className="font-bold text-brand-400 hover:text-brand-300"
          >
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#080B11]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-28 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-brand-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent-cyan/15 rounded-full blur-[100px] pointer-events-none" />

        <Suspense fallback={<div className="min-h-[500px]" />}>
          <RegisterForm />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
