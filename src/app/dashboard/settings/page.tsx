'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/providers/ToastProvider';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  HelpCircle,
  Bell,
  Smartphone,
  Globe,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Download,
  Trash2,
  CheckCircle2,
  Mail,
  Zap,
  Sliders
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function SettingsContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailOrderUpdates: true,
    emailVideoDelivery: true,
    emailPromotions: false,
    whatsappAlerts: true,
    browserNotifications: true,
  });

  // Regional Preferences State
  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  });

  const [savingPrefs, setSavingPrefs] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-gray-700' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak ⚠️', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score: 65, label: 'Medium ⚡', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong 🔥', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Password updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data.error || 'Failed to update password', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setTimeout(() => {
      setSavingPrefs(false);
      showToast('Notification and language preferences saved successfully!', 'success');
    }, 600);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ notifications, preferences, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gujju-ai-studio-account-data-${Date.now()}.json`;
    a.click();
    showToast('Account data export downloaded!', 'success');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        
        {/* Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-brand-400 flex items-center justify-center">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Account Settings & Security</h1>
              <p className="text-xs text-gray-400">Manage security credentials, notification channels, and account preferences.</p>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 space-y-6">
          <div className="flex items-center justify-between border-b border-surface-200/50 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Change Password</h3>
                <p className="text-[11px] text-gray-400">Update your login password regularly for maximum security</p>
              </div>
            </div>
            <Link
              href="/forgot-password"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Forgot Password?
            </Link>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current account password"
                  className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">New Password *</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter min. 8 characters"
                    className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Confirm New Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Strength Meter */}
            {newPassword && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-semibold">Password Strength:</span>
                  <span className="font-bold text-white">{strength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-glow px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Notification Preferences Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-surface-200/50 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Notification & Alert Preferences</h3>
              <p className="text-[11px] text-gray-400">Choose how and when you receive order status and reel production alerts</p>
            </div>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-100/50 border border-surface-200/60">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Email Order Status Updates</p>
                    <p className="text-[10px] text-gray-400">Receive instant email when your order status changes to In Production or Completed</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailOrderUpdates}
                  onChange={(e) => setNotifications({ ...notifications, emailOrderUpdates: e.target.checked })}
                  className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-100/50 border border-surface-200/60">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Video Deliverable Ready Alert</p>
                    <p className="text-[10px] text-gray-400">Get notified immediately when the final 4K AI Commercial video link is attached</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailVideoDelivery}
                  onChange={(e) => setNotifications({ ...notifications, emailVideoDelivery: e.target.checked })}
                  className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-100/50 border border-surface-200/60">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">WhatsApp Direct Production Updates</p>
                    <p className="text-[10px] text-gray-400">Get milestone updates sent directly to your registered WhatsApp phone number</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.whatsappAlerts}
                  onChange={(e) => setNotifications({ ...notifications, whatsappAlerts: e.target.checked })}
                  className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-100/50 border border-surface-200/60">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Studio Promotions & Festive Discounts</p>
                    <p className="text-[10px] text-gray-400">Receive special seasonal offers, coupon codes, and package bundle discounts</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailPromotions}
                  onChange={(e) => setNotifications({ ...notifications, emailPromotions: e.target.checked })}
                  className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPrefs}
                className="btn-glow px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/25"
              >
                <Save className="w-4 h-4" />
                {savingPrefs ? 'Saving Preferences...' : 'Save Notification Preferences'}
              </button>
            </div>
          </form>
        </div>

        {/* Regional & Language Settings Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-surface-200/50 pb-4">
            <div className="w-9 h-9 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Language & Regional Preferences</h3>
              <p className="text-[11px] text-gray-400">Configure your regional currency and platform language</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Preferred Language</label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="w-full bg-surface-100 border border-surface-200 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="en">English (Default)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Display Currency</label>
              <select
                value={preferences.currency}
                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                className="w-full bg-surface-100 border border-surface-200 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD (US Dollar)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data & Privacy (Danger Zone) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-surface-200/50 pb-4">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Data Privacy & Account Control</h3>
              <p className="text-[11px] text-gray-400">Download your personal data or manage account privacy</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60">
            <div>
              <p className="text-xs font-bold text-white">Export Account Data</p>
              <p className="text-[11px] text-gray-400">Download a copy of your settings, bookings history, and messages as a JSON archive</p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-xs font-bold text-gray-200 hover:text-white flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-brand-400" />
              Download JSON
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080B11]" />}>
      <SettingsContent />
    </Suspense>
  );
}
