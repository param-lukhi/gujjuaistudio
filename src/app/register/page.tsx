'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Sparkles,
  User,
  Building,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  KeyRound,
  Check,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getFirebaseAuth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

export const dynamic = 'force-dynamic';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // Step 1: Form Details, Step 2: OTP Verification
  const [step, setStep] = useState<1 | 2>(1);

  // Selected Method: 'email' | 'mobile'
  const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email');

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Firebase confirmation result reference
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step 1 Submission: Validate and Send OTP (Email via SMTP or Mobile via Google Firebase)
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (authMethod === 'email') {
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    } else {
      if (!formData.phoneNumber.trim() || formData.phoneNumber.replace(/[^0-9]/g, '').length < 8) {
        setErrorMessage('Please enter a valid mobile number with country code (e.g. +91 98765 43210).');
        return;
      }
    }

    if (!formData.password) {
      setErrorMessage('Please create a password.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setSendingOtp(true);

    try {
      if (authMethod === 'email') {
        // Email OTP Flow via Server SMTP
        const res = await fetch('/api/auth/send-register-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'email',
            email: formData.email,
            name: formData.name,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || 'Failed to send Email OTP. Please check your email.');
        } else {
          setStep(2);
          setCountdown(60);
          setSuccessMessage(`6-digit OTP code sent to your Email (${formData.email}).`);
        }
      } else {
        // Mobile OTP Flow via Google Firebase Auth (10,000 Free SMS/Month Worldwide)
        const fb = getFirebaseAuth();

        if (fb) {
          // Format phone number to E.164 standard
          let formattedPhone = formData.phoneNumber.trim();
          if (!formattedPhone.startsWith('+')) {
            const rawDigits = formattedPhone.replace(/[^0-9]/g, '');
            formattedPhone = rawDigits.length === 10 ? `+91${rawDigits}` : `+${rawDigits}`;
          }

          try {
            // Initialize invisible reCAPTCHA verifier
            if (!recaptchaVerifierRef.current) {
              recaptchaVerifierRef.current = new RecaptchaVerifier(fb.auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {},
              });
            }

            const confirmation = await signInWithPhoneNumber(
              fb.auth,
              formattedPhone,
              recaptchaVerifierRef.current
            );

            confirmationResultRef.current = confirmation;
            setStep(2);
            setCountdown(60);
            setSuccessMessage(`6-digit SMS OTP sent to your Mobile Number (${formattedPhone}).`);
          } catch (firebaseErr: any) {
            console.error('Firebase Phone Auth error:', firebaseErr);
            recaptchaVerifierRef.current = null;

            if (firebaseErr.code === 'auth/invalid-phone-number') {
              setErrorMessage('Invalid phone number format. Please enter a valid number with country code (e.g. +91 98765 43210).');
            } else if (firebaseErr.code === 'auth/too-many-requests') {
              setErrorMessage('Too many SMS requests sent. Please wait a few minutes before trying again.');
            } else if (firebaseErr.code === 'auth/unauthorized-domain') {
              setErrorMessage('Please add gujjuaistudio.vercel.app to Firebase Console -> Authentication -> Settings -> Authorized Domains.');
            } else {
              setErrorMessage(firebaseErr.message || 'Failed to send SMS OTP. Please check your connection.');
            }
            setSendingOtp(false);
            return;
          }
        } else {
          // Fallback to server SMS dispatch if Firebase is unavailable
          const res = await fetch('/api/auth/send-register-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'mobile',
              phoneNumber: formData.phoneNumber,
              name: formData.name,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setErrorMessage(data.error || 'Failed to send SMS OTP.');
          } else {
            setStep(2);
            setCountdown(60);
            setSuccessMessage(`6-digit OTP sent to your Mobile Number (${formData.phoneNumber}).`);
          }
        }
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setErrorMessage(
        err.message || 'Failed to send OTP code. Please check your connection and try again.'
      );
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (countdown > 0 || sendingOtp) return;
    setErrorMessage('');
    setSuccessMessage('');
    setSendingOtp(true);

    try {
      if (authMethod === 'email') {
        const res = await fetch('/api/auth/send-register-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'email',
            email: formData.email,
            name: formData.name,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || 'Failed to resend OTP.');
        } else {
          setCountdown(60);
          setSuccessMessage(`New 6-digit OTP sent to ${formData.email}!`);
        }
      } else {
        const fb = getFirebaseAuth();
        if (fb && recaptchaVerifierRef.current) {
          let formattedPhone = formData.phoneNumber.trim();
          if (!formattedPhone.startsWith('+')) {
            const rawDigits = formattedPhone.replace(/[^0-9]/g, '');
            formattedPhone = rawDigits.length === 10 ? `+91${rawDigits}` : `+${rawDigits}`;
          }

          const confirmation = await signInWithPhoneNumber(
            fb.auth,
            formattedPhone,
            recaptchaVerifierRef.current
          );

          confirmationResultRef.current = confirmation;
          setCountdown(60);
          setSuccessMessage(`New 6-digit SMS OTP sent to ${formattedPhone}!`);
        } else {
          const res = await fetch('/api/auth/send-register-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'mobile',
              phoneNumber: formData.phoneNumber,
              name: formData.name,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setErrorMessage(data.error || 'Failed to resend OTP.');
          } else {
            setCountdown(60);
            setSuccessMessage(`New 6-digit OTP sent to ${formData.phoneNumber}!`);
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP & Create Account
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otp || otp.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP verification code.');
      return;
    }

    setVerifying(true);

    try {
      let isFirebaseVerified = false;

      // If Firebase confirmation result is present, verify directly with Google Firebase
      if (authMethod === 'mobile' && confirmationResultRef.current) {
        try {
          await confirmationResultRef.current.confirm(otp.trim());
          isFirebaseVerified = true;
        } catch (firebaseErr: any) {
          console.error('Firebase OTP confirmation error:', firebaseErr);
          setErrorMessage('Invalid OTP verification code. Please check and try again.');
          setVerifying(false);
          return;
        }
      }

      // Submit verified user to backend
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          otp: otp.trim(),
          otpType: authMethod,
          firebaseVerified: isFirebaseVerified,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed. Please try again.');
        setVerifying(false);
      } else {
        setSuccessMessage('Account verified & created successfully! Signing you in...');

        const loginEmailOrPhone =
          authMethod === 'mobile' ? formData.phoneNumber : formData.email;

        // Auto-login upon successful registration
        const loginRes = await signIn('credentials', {
          redirect: false,
          email: loginEmailOrPhone,
          password: formData.password,
        });

        if (loginRes?.ok) {
          router.push(callbackUrl);
        } else {
          router.push(`/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
      }
    } catch (err: any) {
      setErrorMessage('Network error occurred during registration. Please try again.');
      setVerifying(false);
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
      {/* Invisible container for Firebase reCAPTCHA */}
      <div id="recaptcha-container" />

      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-surface-200/80 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-brand-500/30 mx-auto shadow-lg shadow-brand-500/30 bg-[#080B11]">
            <img
              src="/logo.png"
              alt="Gujju AI Studio Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {step === 1 ? 'Create Your Account' : 'Verify Your Account'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            {step === 1
              ? 'Enter your details to receive an Email OTP verification code.'
              : `Enter the 6-digit OTP sent to your Email (${formData.email}).`}
          </p>
        </div>

        {/* Alerts / Notifications */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 text-xs sm:text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs sm:text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: FORM DETAILS */}
        {step === 1 && (
          <>
            {/* Google Quick Sign Up Button */}
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
                <span className="bg-[#0c1017] px-3 text-gray-500 font-medium">
                  Or register with Email
                </span>
              </div>
            </div>

            <form onSubmit={handleProceedToOtp} className="space-y-4">
              {/* Full Name */}
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
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Conditional Field: EMAIL (Only shown if Email Mode is active) */}
              {authMethod === 'email' && (
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
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Conditional Field: MOBILE NUMBER (Only shown if Mobile Mode is active) */}
              {authMethod === 'mobile' && (
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                    Mobile Phone Number <span className="text-brand-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter your mobile number (e.g. +91 98765 43210)"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Business / Brand Name (Optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Business / Brand Name <span className="text-gray-500 text-[10px] normal-case">(Optional)</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Enter your business or brand name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
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
                      placeholder="Enter your password"
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
                      placeholder="Confirm password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100/80 border border-surface-200 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button (Proceed to OTP) */}
              <button
                type="submit"
                disabled={sendingOtp}
                className="btn-glow w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {sendingOtp ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP Code...
                  </span>
                ) : (
                  <>
                    Send 6-Digit OTP to Email Address
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: ENTER OTP & VERIFY */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-surface-100/70 border border-surface-200 space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 text-brand-400 mx-auto flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Enter 6-Digit Verification Code</h3>
              <p className="text-xs text-gray-400">
                We sent a 6-digit OTP code to{' '}
                <span className="font-semibold text-brand-300">
                  {authMethod === 'mobile' ? formData.phoneNumber : formData.email}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-surface-100 border-2 border-brand-500 focus:ring-2 focus:ring-brand-500/40 rounded-2xl py-3.5 text-center text-xl sm:text-2xl tracking-[6px] sm:tracking-[12px] font-mono font-bold text-white placeholder-gray-600 outline-none transition-all shadow-inner"
              />

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <span className="text-gray-400">Didn't receive the OTP?</span>
                <button
                  type="button"
                  disabled={countdown > 0 || sendingOtp}
                  onClick={handleResendOtp}
                  className="font-semibold text-brand-400 hover:text-brand-300 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>

            {/* Verify & Create Account Button */}
            <button
              type="submit"
              disabled={verifying || otp.length !== 6}
              className="btn-glow w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying & Creating Account...
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Verify OTP & Create Account
                </>
              )}
            </button>

            {/* Back Button to Edit Details */}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-xs font-semibold text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Edit Information / Change Method
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center pt-3 text-xs text-gray-400 border-t border-surface-200/50">
          Already have an account?{' '}
          <Link
            href={
              callbackUrl && callbackUrl !== '/dashboard'
                ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : '/login'
            }
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
