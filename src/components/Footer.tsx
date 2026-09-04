import React from 'react';
import Link from 'next/link';
import { Sparkles, Instagram, Youtube, Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#05070D] border-t border-surface-200/50 pt-16 pb-12 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-surface-200/40">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5">
                <div className="w-full h-full bg-[#080B11] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                </div>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Gujju AI <span className="text-brand-400">Studio</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Crafting high-converting, scroll-stopping AI product video reels for Indian e-commerce, D2C brands, and restaurants.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-lg bg-surface-100 border border-surface-200 flex items-center justify-center text-gray-300 hover:text-white hover:border-brand-500 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-surface-100 border border-surface-200 flex items-center justify-center text-gray-300 hover:text-white hover:border-brand-500 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/reels" className="hover:text-white transition-colors">AI Reels Portfolio</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Services & Process</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing Packages</Link></li>
              <li><Link href="/book" className="text-brand-400 font-semibold hover:text-brand-300 flex items-center gap-1">Book Reel <ArrowUpRight className="w-3.5 h-3.5" /></Link></li>
            </ul>
          </div>

          {/* Portfolio Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Reel Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/portfolio?cat=Fashion" className="hover:text-white transition-colors">Fashion & Apparel</Link></li>
              <li><Link href="/portfolio?cat=Jewelry" className="hover:text-white transition-colors">Jewelry & Luxury</Link></li>
              <li><Link href="/portfolio?cat=Beauty" className="hover:text-white transition-colors">Beauty & Skincare</Link></li>
              <li><Link href="/portfolio?cat=Food" className="hover:text-white transition-colors">Food & Gourmet</Link></li>
              <li><Link href="/portfolio?cat=Electronics" className="hover:text-white transition-colors">Electronics & Gadgets</Link></li>
              <li><Link href="/portfolio?cat=Restaurant" className="hover:text-white transition-colors">Restaurant & Cafes</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Contact Studio</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+91 98765 43210 (WhatsApp Support)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>contact@gujjuaistudio.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Surat / Ahmedabad, Gujarat, India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Gujju AI Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/client" className="hover:text-gray-300 transition-colors">Client Portal</Link>
            <Link href="/admin/login" className="hover:text-gray-300 transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
