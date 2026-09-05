'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Sparkles, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const verified = searchParams.get('verified');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (verified === 'true') {
      setSuccessMessage('Email verified successfully! You can now log in.');
    }
    if (errorParam) {
      if (errorParam === 'invalid-verification-link') {
        setErrorMessage('Invalid verification link.');
      } else if (errorParam === 'expired-verification-token') {
        setErrorMessage('Verification token has expired. Please register or request a new link.');
      } else if (errorParam === 'OAuthAccountNotLinked') {
        setErrorMessage('This email is associated with a different login provider.');
      } else {
        setErrorMessage('An error occurred during authentication.');
      }
    }
  }, [verified, errorParam]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // Redirect logged in users based on role
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(callbackUrl);
      }
    }
  }, [status, session, router, callbackUrl]);

  // Handle Send Login OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address first.');
      return;
    }

    setSendingOtp(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/send-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      setOtpSent(true);
      setCountdown(60);
      setSuccessMessage('6-Digit OTP sent to your email address!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const credentials: any = {
        redirect: false,
        email,
      };

      if (authMode === 'otp') {
        if (!otp || otp.trim().length !== 6) {
          setErrorMessage('Please enter the valid 6-digit OTP code.');
          setLoading(false);
          return;
        }
        credentials.otp = otp.trim();
        credentials.authType = 'otp';
      } else {
        if (!password) {
          setErrorMessage('Please enter your password.');
          setLoading(false);
          return;
        }
        credentials.password = password;
        credentials.authType = 'password';
      }

      const res = await signIn('credentials', credentials);

      if (res?.error) {
        setErrorMessage(res.error);
        setLoading(false);
      } else if (res?.ok) {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();

        if (sessionData?.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push(callbackUrl);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-surface-200/80 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-cyan p-0.5 mx-auto shadow-lg shadow-brand-500/30">
            <div className="w-full h-full bg-[#080B11] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Sign in using your preferred method
          </p>
        </div>

        {/* Tab Switcher: Password vs OTP */}
        <div className="grid grid-cols-2 p-1 bg-surface-100/90 rounded-2xl border border-surface-200/80">
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'password'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'otp'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email OTP
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Email Address or Mobile Number</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or mobile number"
                className="w-full bg-surface-100/80 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Mode Fields */}
          {authMode === 'password' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-surface-100/80 border border-surface-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* OTP Mode Fields */}
          {authMode === 'otp' && (
            <div className="space-y-3">
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !email}
                  className="w-full py-3 rounded-xl bg-brand-600/30 hover:bg-brand-600/50 border border-brand-500/40 text-xs font-bold text-brand-300 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {sendingOtp ? (
                    <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-brand-300 border-t-transparent" />
                  ) : (
                    '📩 Send 6-Digit OTP'
                  )}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300">Enter 6-Digit OTP</label>
                    <button
                      type="button"
                      disabled={countdown > 0 || sendingOtp}
                      onClick={handleSendOtp}
                      className="text-xs font-semibold text-brand-400 hover:text-brand-300 disabled:opacity-40 transition-colors"
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-surface-100/80 border border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl py-3 text-center text-lg tracking-[8px] font-mono text-white placeholder-gray-600 outline-none transition-all"
                  />
                </div>
              )}
            </div>
          )}

          {/* Remember Me */}
          {authMode === 'password' && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-200 bg-surface-100 text-brand-600 focus:ring-brand-500 accent-brand-600"
                />
                <span className="text-xs text-gray-300 font-medium">Remember me</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (authMode === 'otp' && (!otpSent || otp.length !== 6))}
            className="btn-glow w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                {authMode === 'otp' ? 'Verify & Sign In' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-200/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0c1017] px-3 text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-3 rounded-xl bg-surface-100 hover:bg-surface-100/80 border border-surface-200 text-sm font-semibold text-gray-200 flex items-center justify-center gap-3 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>{googleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
        </button>

        {/* Footer Prompt */}
        <div className="text-center pt-3 text-xs text-gray-400 border-t border-surface-200/50">
          <div>
            Don't have an account?{' '}
            <Link
              href={callbackUrl && callbackUrl !== '/dashboard' ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/register'}
              className="font-bold text-brand-400 hover:text-brand-300"
            >
              Create Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}


export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#080B11]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-28 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent-cyan/15 rounded-full blur-[100px] pointer-events-none" />

        <Suspense fallback={<div className="min-h-[400px]" />}>
          <LoginForm />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
