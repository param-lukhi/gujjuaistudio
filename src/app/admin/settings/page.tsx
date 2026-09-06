'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Settings, Save, ShieldCheck, Cloud, Bell, Sparkles } from 'lucide-react';

export default function WebsiteSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    agencyName: 'Gujju AI Studio',
    contactEmail: 'gujjuaistudio@gmail.com',
    whatsappNumber: '+91 99252 63558',
    cloudinaryCloudName: 'gujju-ai-studio',
    cloudinaryApiKey: '1234567890',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#080B11]">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
        
        <div className="border-b border-surface-200/50 pb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Website & API Settings</h1>
          <p className="text-xs text-gray-400">Configure brand information, Cloudinary credentials, and notifications.</p>
        </div>

        {saved && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            ✓ Website Settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-surface-200/70 space-y-6 max-w-3xl">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-surface-200/40 pb-2">
              Agency Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Agency Brand Name</label>
                <input
                  type="text"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Support Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">WhatsApp Support Number</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-white border-b border-surface-200/40 pb-2 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-brand-400" />
              Cloudinary Media Upload Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Cloud Name</label>
                <input
                  type="text"
                  value={formData.cloudinaryCloudName}
                  onChange={(e) => setFormData({ ...formData, cloudinaryCloudName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">API Key</label>
                <input
                  type="text"
                  value={formData.cloudinaryApiKey}
                  onChange={(e) => setFormData({ ...formData, cloudinaryApiKey: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-glow px-8 py-3.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <Save className="w-4 h-4" />
            Save Configuration Settings
          </button>
        </form>

      </main>
    </div>
  );
}
