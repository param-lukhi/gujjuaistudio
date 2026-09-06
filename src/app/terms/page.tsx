import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FileText, CheckCircle2, ShieldAlert, Sparkles, Mail, ArrowLeft, RefreshCw } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Gujju AI Studio',
  description: 'Terms and conditions governing the use of Gujju AI Studio services, AI reel production, client rights, and revisions.',
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-bold tracking-wider uppercase">
            <FileText className="w-4 h-4" /> Terms of Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Effective Date: September 6, 2026. Please read these Terms of Service carefully before utilizing Gujju AI Studio services or booking video production packages.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-gray-300">
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-surface-200/60 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" /> 1. Scope of Services
            </h2>
            <p>
              Gujju AI Studio provides Generative AI-powered commercial video production, Instagram/YouTube reel creation, product cinematic animations, regional studio voiceovers (Hindi, Gujarati, English), and creative video marketing solutions for brands and businesses.
            </p>
          </section>

          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-surface-200/60 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-400" /> 2. Commercial Ownership & Intellectual Property
            </h2>
            <p>
              Upon complete payment for ordered reels or packages, you (the client) receive full, unrestricted commercial usage rights to broadcast, publish, advertise, and monetize the delivered video assets across digital and offline channels worldwide.
            </p>
            <p className="text-gray-400 text-xs">
              * Gujju AI Studio retains the right to showcase approved sample deliverables in our portfolio unless a Non-Disclosure Agreement (NDA) is explicitly requested.
            </p>
          </section>

          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-surface-200/60 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-brand-400" /> 3. Revisions & Delivery Timelines
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400 pl-2">
              <li><strong>Turnaround Time:</strong> Standard orders are delivered within 48 to 72 hours following receipt of required brand assets.</li>
              <li><strong>Revisions:</strong> Packages include designated revision rounds (script adjustments, music sync, pacing tweaks). Major directional re-shoots after final approval may incur additional costs.</li>
            </ul>
          </section>

          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-surface-200/60 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-400" /> 4. Acceptable Use Policy
            </h2>
            <p>Clients agree NOT to submit assets or request video generation containing:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-400 pl-2">
              <li>Defamatory, obscene, hateful, or explicit adult content.</li>
              <li>Misleading, fraudulent, or counterfeit goods promotions.</li>
              <li>Copyrighted intellectual property without appropriate licenses.</li>
            </ul>
          </section>

          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-surface-200/60 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-brand-400" /> 5. Questions & Support
            </h2>
            <p>
              For inquiries, customized enterprise SLAs, or support regarding these terms, reach out to:
            </p>
            <div className="pt-2 text-white">
              <p className="font-bold">Gujju AI Studio</p>
              <p className="text-brand-400">
                Email: <a href="mailto:gujjuaistudio@gmail.com" className="underline hover:text-brand-300">gujjuaistudio@gmail.com</a>
              </p>
              <p className="text-gray-400">Gujarat, India</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
