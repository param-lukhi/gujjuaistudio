'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import { useToast } from '@/components/providers/ToastProvider';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, Lock, ShieldAlert } from 'lucide-react';

export default function ContactPage() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const isAuthenticated = status === 'authenticated';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to submit message');

      setSubmitted(true);
      showToast('Message sent! You can track admin replies in your dashboard.', 'success');
      setFormData({ name: session?.user?.name || '', email: session?.user?.email || '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      showToast('Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#080B11] text-white pt-24">
      <Navbar />

      <div>
        <section className="py-12 bg-hero-gradient border-b border-surface-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>We are here to help</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              Contact <span className="text-gradient-blue">Gujju AI Studio</span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
              Have questions about your order, custom bulk packages, or enterprise retainers? Reach out to our creation team.
            </p>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Info Side */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <h2 className="text-2xl font-extrabold text-white">Let's Create Viral Ads</h2>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Whether you're an e-commerce startup or an established brand, our team will help you dominate social media with AI product reels.
                </p>
              </div>

              <div className="space-y-4">
                <div className="glass-panel p-5 rounded-2xl border-surface-200/60 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-400 uppercase font-semibold">WhatsApp & Call</h4>
                    <p className="text-sm font-bold text-white">+91 98765 43210</p>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border-surface-200/60 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-400 uppercase font-semibold">Email Support</h4>
                    <p className="text-sm font-bold text-white">contact@gujjuaistudio.com</p>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border-surface-200/60 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-accent-violet/20 text-accent-violet flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-400 uppercase font-semibold">Studio Hub</h4>
                    <p className="text-sm font-bold text-white">Surat & Ahmedabad, Gujarat, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="lg:col-span-7">
              <div className="glass-panel p-8 rounded-3xl border border-surface-200/70 shadow-2xl space-y-6">

                {/* Guest Visitor Warning Notice */}
                {!isAuthenticated && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-bold">Please login to contact us.</span>
                    </div>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0"
                    >
                      Login Now
                    </button>
                  </div>
                )}

                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-white">Message Sent Successfully!</h3>
                    <p className="text-sm text-gray-300 max-w-md mx-auto">
                      Thank you for contacting Gujju AI Studio. You can view official replies in your client dashboard.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-surface-100 text-white hover:bg-surface-200 border border-surface-200 transition-all"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="text-xl font-extrabold text-white">Send Us a Direct Message</h3>

                    {error && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-300">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your full name"
                          disabled={!isAuthenticated}
                          className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200/80 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-300">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email address"
                          disabled={!isAuthenticated}
                          className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200/80 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-300">Subject</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Bulk Order Inquiry / Custom AI Reel"
                        disabled={!isAuthenticated}
                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200/80 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-300">Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your brand and video ad requirements..."
                        disabled={!isAuthenticated}
                        className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200/80 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50"
                      />
                    </div>

                    {isAuthenticated ? (
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-glow w-full py-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 hover:scale-[1.01] transition-transform disabled:opacity-50"
                      >
                        {loading ? (
                          <span>Sending Message...</span>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowLoginModal(true)}
                        className="w-full py-4 rounded-xl text-xs font-bold text-gray-400 bg-surface-100/50 border border-surface-200/60 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4 text-amber-400" />
                        Please login to contact us
                      </button>
                    )}
                  </form>
                )}

              </div>
            </div>

          </div>
        </section>
      </div>

      <Footer />

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectUrl="/contact"
        actionTitle="send messages to support"
      />
    </main>
  );
}
