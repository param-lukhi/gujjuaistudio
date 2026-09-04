'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: "What do I need to submit to get an AI reel made?",
    a: "All we need are 2 to 4 clear photos of your product (or sample image links) and a brief description of key highlights (e.g. features, target audience). Our AI engines handle the scripting, 3D/AI backdrop generation, model positioning, voiceovers, and editing!"
  },
  {
    q: "How fast is delivery?",
    a: "We guarantee delivery in 2 business days for all standard packages (Starter, Professional, and Premium)."
  },
  {
    q: "Do I get full commercial rights to use the video for Ads?",
    a: "Yes! Both Professional (₹1200) and Premium (₹2300) packages include 100% commercial use rights, allowing you to run Meta Ads, Instagram Boosts, YouTube Shorts, and Amazon product listings with zero copyright risk."
  },
  {
    q: "What languages are available for the AI Voiceover?",
    a: "We support natural human-sounding AI Voiceovers in Hindi (Indian Accent), English (Indian / US accent), and Gujarati."
  },
  {
    q: "What if I need revisions?",
    a: "Every package includes 1 free revision round. You can request text modifications, voiceover adjustments, or pacing changes via your Client Portal."
  },
  {
    q: "Can I order bulk reels for my catalog?",
    a: "Absolutely! If you have multiple SKUs or need recurring monthly reels, contact us via the Contact section or WhatsApp for exclusive multi-reel bundle discounts."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 md:py-24 relative" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-300 text-sm sm:text-base">
            Everything you need to know about ordering AI product video reels with Gujju AI Studio.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-surface-200/60 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-white hover:text-brand-300 transition-colors"
                >
                  <span className="text-base sm:text-lg">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-brand-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-sm text-gray-300 leading-relaxed border-t border-surface-200/30 animate-in fade-in duration-200">
                    <p className="pt-3">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
