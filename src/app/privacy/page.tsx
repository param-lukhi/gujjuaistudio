import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, Mail, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Gujju AI Studio',
  description: 'Privacy Policy and data protection terms for Gujju AI Studio services, Google authentication, and user data handling.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-900 text-gray-100 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        {/* Title Block */}
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" /> Legal & Trust
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Last updated: September 6, 2026. This policy outlines how Gujju AI Studio collects, uses, and safeguards your personal information and project assets.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-gray-300">
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-surface-200/60 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand-400" /> 1. Information We Collect
            </h2>
            <p>
              When you use Gujju AI Studio (the "Platform", "Service"), we collect information necessary to provide AI reel production, consultation, account management, and support services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 pl-2">
              <li><strong>Account Credentials:</strong> Name, email address (<code className="text-brand-300">gujjuaistudio@gmail.com</code>), and phone number when you register or sign in.</li>
              <li><strong>Authentication Data:</strong> When logging in via Google OAuth, we receive your basic profile info (name, email, and avatar) authorized through Google's consent screen. We do NOT access your Google password or private drive files.</li>
              <li><strong>Project Assets:</strong> Product photos, brand guidelines, audio files, and script instructions uploaded for video generation.</li>
              <li><strong>Order & Transaction Records:</strong> Service bookings, package selections, and payment reference IDs (handled securely via standard gateways).</li>
            </ul>
          </section>

          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-surface-200/60 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-400" /> 2. How We Use Your Data
            </h2>
            <p>Your information is used strictly to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 pl-2">
              <li>Generate customized AI promotional reels, voiceovers, and video edits for your brand.</li>
              <li>Send OTP verification codes, order status updates, and customer support responses.</li>
              <li>Maintain your client dashboard and order history.</li>
              <li>Improve platform performance and prevent fraudulent access.</li>
            </ul>
            <p className="text-emerald-400 font-medium pt-2">
              ✓ We NEVER sell, rent, or trade your personal data or uploaded client media to third-party advertisers.
            </p>
          </section>

          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-surface-200/60 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-400" /> 3. Data Protection & Security
            </h2>
            <p>
              We implement industry-standard encryption, SSL protocols, and secure cloud storage (Supabase PostgreSQL, Google Cloud, Firebase Auth) to protect your assets against unauthorized access, loss, or alteration.
            </p>
          </section>

          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-surface-200/60 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-400" /> 4. Your Rights & Data Deletion
            </h2>
            <p>
              You have the right to review, update, or request permanent deletion of your account and uploaded assets at any time. Simply send an email request to our privacy team.
            </p>
          </section>

          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-surface-200/60 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-brand-400" /> 5. Contact Us
            </h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy or our data handling practices, please contact us at:
            </p>
            <div className="pt-2 text-white">
              <p className="font-bold">Gujju AI Studio</p>
              <p className="text-brand-400">
                Email: <a href="mailto:gujjuaistudio@gmail.com" className="underline hover:text-brand-300">gujjuaistudio@gmail.com</a>
              </p>
              <p className="text-gray-400">Location: Gujarat, India</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
