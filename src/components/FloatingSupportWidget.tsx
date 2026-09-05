'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, Sparkles, User, Mail } from 'lucide-react';

const WHATSAPP_NUMBER = '919925263558';
const WHATSAPP_PREFILLED_MESSAGE = encodeURIComponent(
  'Hello Gujju AI Studio, I want to inquire about AI video ads'
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_PREFILLED_MESSAGE}`;

export default function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'AI Video Ads Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message.');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: 'AI Video Ads Inquiry',
        message: '',
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Buttons Container (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
        
        {/* Quick Message Popup Card */}
        {isOpen && (
          <div className="w-[90vw] sm:w-[380px] rounded-3xl bg-[#0B0F19]/95 backdrop-blur-xl border border-surface-200/80 shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 mb-2">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-cyan p-4 sm:p-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight">Gujju AI Studio</h3>
                  <p className="text-[11px] text-white/80 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Online • Typically replies in 15 mins
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
                aria-label="Close message popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
              {/* WhatsApp Quick Action Banner */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-[#25D366]/30">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.417 0-8.002 3.584-8.003 8.001 0 1.41.368 2.784 1.066 3.994l-1.134 4.14 4.239-1.112c1.172.64 2.497.978 3.829.979h.003c4.418 0 8.003-3.585 8.003-8.003 0-4.417-3.585-8-8.003-8z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white group-hover:text-[#25D366] transition-colors">Instant WhatsApp Chat</p>
                    <p className="text-[11px] text-gray-400">+91 99252 63558</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#25D366]/20 text-[#25D366]">Chat →</span>
              </a>

              {/* Message Form Header */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200/60" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
                  <span className="bg-[#0B0F19] px-2">Or Send Studio Message</span>
                </div>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-base">Message Sent Successfully!</h4>
                  <p className="text-xs text-gray-300">
                    Thank you! Our AI team will review your inquiry and get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-xs font-bold text-white border border-surface-200 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {error && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">
                      Your Name <span className="text-brand-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-100/90 border border-surface-200 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">
                      Email or Mobile Phone <span className="text-brand-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email or phone"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-100/90 border border-surface-200 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-surface-100/90 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 transition-all"
                    >
                      <option value="AI Video Ads Inquiry">AI Video Ads Inquiry</option>
                      <option value="Bulk Reels Package">Bulk Reels Package</option>
                      <option value="Custom Brand Retainer">Custom Brand Retainer</option>
                      <option value="Support & Revision">Support & Revision</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">
                      Message <span className="text-brand-400">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your product or requirements..."
                      className="w-full p-2.5 rounded-xl bg-surface-100/90 border border-surface-200 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-glow w-full py-2.5 rounded-xl font-bold text-white text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message to Team</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Floating Buttons Column (Message button directly ABOVE WhatsApp button) */}
        <div className="flex flex-col items-center gap-3">
          
          {/* Floating Message Action Button (Above WhatsApp) */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-accent-cyan text-white shadow-2xl shadow-brand-500/40 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Toggle Quick Message Box"
            title="Send us a message"
          >
            {/* Subtle Pulse */}
            <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-20 pointer-events-none" />

            {/* Icon */}
            {isOpen ? (
              <X className="w-6 h-6 text-white relative z-10 transition-transform duration-200" />
            ) : (
              <MessageSquare className="w-6 h-6 text-white relative z-10 transition-transform duration-200" />
            )}

            {/* Tooltip on hover */}
            <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-[#0B0F19]/90 border border-surface-200/80 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              Send a Message
            </span>
          </button>

          {/* Floating WhatsApp Action Button (Bottom) */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp (+91 99252 63558)"
          >
            {/* Pulsing Ripple Effect */}
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />

            {/* WhatsApp SVG Icon */}
            <svg className="w-7 h-7 fill-current relative z-10" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.417 0-8.002 3.584-8.003 8.001 0 1.41.368 2.784 1.066 3.994l-1.134 4.14 4.239-1.112c1.172.64 2.497.978 3.829.979h.003c4.418 0 8.003-3.585 8.003-8.003 0-4.417-3.585-8-8.003-8z" />
            </svg>

            {/* Online Green Badge */}
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            </span>

            {/* Tooltip on hover */}
            <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-[#0B0F19]/90 border border-surface-200/80 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              Chat on WhatsApp
            </span>
          </a>

        </div>

      </div>
    </>
  );
}
