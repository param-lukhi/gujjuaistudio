'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Sparkles, Save, Upload, Link2, Play, Eye, 
  Loader2, CheckCircle2, AlertCircle, RefreshCw, 
  Layers, ExternalLink, Zap, ShieldCheck, Film, 
  Star, Check, Headphones, Video, Flame, Layout, BarChart3,
  Plus, Trash2, Copy, CheckCircle, Radio, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { uploadMediaFile } from '@/lib/uploadClient';

interface HeroItem {
  id: string;
  isActive: boolean;
  heroTopPill: string;
  heroHeadlineMain: string;
  heroHeadlineGradient: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroSecondaryText: string;
  heroSecondaryLink: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  trustText: string;
  badgeText: string;
  durationText: string;
  category: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  buttonText: string;
  buttonLink: string;
  floatingBadge1Title: string;
  floatingBadge1Sub: string;
  floatingBadge1Icon: string;
  floatingBadge1Color: string;
  floatingBadge2Title: string;
  floatingBadge2Sub: string;
  floatingBadge2Icon: string;
  floatingBadge2Color: string;
  createdAt?: string;
  updatedAt?: string;
}

const BLANK_HERO: Omit<HeroItem, 'id' | 'isActive'> = {
  heroTopPill: 'Next-Gen AI Product Video Ads • Fast 2-Day Delivery',
  heroHeadlineMain: 'AI Product Ads That',
  heroHeadlineGradient: 'Stop the Scroll.',
  heroSubheadline: 'Transform simple product photos into viral, high-converting vertical video reels. Powered by hyper-realistic AI models, cinematic voiceovers, and dynamic visual effects.',
  heroCtaText: 'Book Your AI Reel Now',
  heroCtaLink: '/book',
  heroSecondaryText: 'Watch Portfolio',
  heroSecondaryLink: '/portfolio',
  stat1Value: '2 Days',
  stat1Label: 'Guaranteed Delivery',
  stat2Value: '₹600',
  stat2Label: 'Starter Packages',
  stat3Value: '10x CTR',
  stat3Label: 'Instagram Boost',
  trustText: '4.9/5 by 150+ Brands',
  badgeText: 'AI Reel Demo',
  durationText: '00:30',
  category: 'Fashion & Luxury',
  title: 'Luxury Silk Saree AI Showcase',
  description: 'Generated purely from 2 flat product photos. Complete with AI lighting & model animation.',
  videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-golden-dress-40995-large.mp4',
  thumbnailUrl: '',
  buttonText: 'View All 7 Categories',
  buttonLink: '/portfolio',
  floatingBadge1Title: 'Commercial Rights',
  floatingBadge1Sub: '100% Monetization',
  floatingBadge1Icon: 'check',
  floatingBadge1Color: 'emerald',
  floatingBadge2Title: 'AI Voiceover',
  floatingBadge2Sub: 'Hindi & English',
  floatingBadge2Icon: 'zap',
  floatingBadge2Color: 'brand',
};

export default function AdminHeroPage() {
  const [showcases, setShowcases] = useState<HeroItem[]>([]);
  const [selectedHeroId, setSelectedHeroId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Editor Tab
  const [activeTab, setActiveTab] = useState<'reel' | 'badges' | 'copy' | 'stats'>('reel');

  // Video input mode: 'upload' | 'url'
  const [videoMode, setVideoMode] = useState<'upload' | 'url'>('url');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<HeroItem>({
    id: '',
    isActive: true,
    ...BLANK_HERO,
  });

  const categoriesList = [
    'Fashion & Luxury',
    'Clothing & Apparel',
    'Jewelry & Diamonds',
    'Food & Gourmet',
    'Beauty & Cosmetics',
    'Electronics & Gadgets',
    'Restaurant & Cafes',
    'Automotive & Real Estate',
  ];

  const iconOptions = [
    { value: 'check', label: 'Checkmark', icon: Check },
    { value: 'shield', label: 'Shield / Guarantee', icon: ShieldCheck },
    { value: 'zap', label: 'Lightning / Fast', icon: Zap },
    { value: 'sparkles', label: 'Sparkles / AI', icon: Sparkles },
    { value: 'star', label: 'Star / Rating', icon: Star },
    { value: 'headphones', label: 'Voiceover / Audio', icon: Headphones },
    { value: 'video', label: 'Video / Reel', icon: Video },
    { value: 'flame', label: 'Trending / Hot', icon: Flame },
  ];

  const colorOptions = [
    { value: 'emerald', label: 'Emerald Green' },
    { value: 'cyan', label: 'Cyan Blue' },
    { value: 'violet', label: 'Violet Purple' },
    { value: 'amber', label: 'Amber Gold' },
    { value: 'rose', label: 'Rose Pink' },
    { value: 'brand', label: 'Brand Blue' },
  ];

  // Fetch all hero showcases for CRUD
  const fetchShowcases = async (keepSelectionId?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hero?all=true');
      const data = await res.json();
      if (data.showcases && data.showcases.length > 0) {
        setShowcases(data.showcases);

        // Select the requested hero, or the active hero, or the first hero
        let target = data.showcases.find((h: HeroItem) => h.id === keepSelectionId);
        if (!target) {
          target = data.showcases.find((h: HeroItem) => h.isActive) || data.showcases[0];
        }

        setSelectedHeroId(target.id);
        setFormData(target);
      }
    } catch (err) {
      console.error('Error fetching showcases:', err);
      setErrorMsg('Failed to load hero showcases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcases();
  }, []);

  // Handle switching selected showcase
  const handleSelectShowcase = (item: HeroItem) => {
    setSelectedHeroId(item.id);
    setFormData(item);
    setSuccessMsg(`Switched to editing: "${item.title}"`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  // CREATE NEW SHOWCASE (CRUD: Create)
  const handleAddNewShowcase = async () => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const newPayload = {
        ...BLANK_HERO,
        title: `New AI Showcase #${showcases.length + 1}`,
        isActive: false,
      };

      const res = await fetch('/api/admin/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create new showcase');

      setSuccessMsg('🎉 New Hero Showcase added successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchShowcases(data.hero.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating new showcase');
    } finally {
      setActionLoading(false);
    }
  };

  // DUPLICATE SHOWCASE (CRUD: Clone)
  const handleDuplicateShowcase = async (id: string) => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'duplicate' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to duplicate showcase');

      setSuccessMsg('🎉 Hero Showcase duplicated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchShowcases(data.hero.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error duplicating showcase');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTIVATE SHOWCASE (CRUD: Set Live)
  const handleActivateShowcase = async (id: string) => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'activate' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to activate showcase');

      setSuccessMsg('🔥 This Hero Showcase is now LIVE on the Homepage!');
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchShowcases(id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error activating showcase');
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE SHOWCASE (CRUD: Delete)
  const handleDeleteShowcase = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/hero?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete showcase');

      setSuccessMsg('🗑️ Hero Showcase deleted successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchShowcases();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting showcase');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Video file upload handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setUploadProgress(0);
    setUploadStatus(`Preparing ${(file.size / (1024 * 1024)).toFixed(1)}MB video...`);
    setErrorMsg(null);

    try {
      const url = await uploadMediaFile(file, {
        folder: 'hero_reels',
        onProgress: (p, status) => {
          setUploadProgress(p);
          if (status) setUploadStatus(status);
        },
      });

      setFormData((prev) => ({ ...prev, videoUrl: url }));
      setSuccessMsg('🎉 Reel video uploaded & attached successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading video');
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
      setUploadStatus('');
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // SAVE & UPDATE SHOWCASE (CRUD: Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save changes');

      setSuccessMsg('🎉 Changes saved and updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchShowcases(formData.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const renderBadgeIcon = (iconKey: string) => {
    const found = iconOptions.find((o) => o.value === iconKey);
    const IconComp = found ? found.icon : Check;
    return <IconComp className="w-4 h-4" />;
  };

  const getBadgeColorClass = (colorKey: string) => {
    switch (colorKey) {
      case 'cyan':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'violet':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'amber':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'rose':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'brand':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/40';
      case 'emerald':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080B11]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 lg:pt-8 space-y-6 sm:space-y-8 overflow-y-auto max-h-screen min-w-0 w-full">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-200/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-brand-400" />
              Hero Showcase & Badges Manager (CRUD)
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Add multiple Hero variations, customize Floating Badges 1 & 2, switch live showcase, edit copy, and delete variations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddNewShowcase}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Hero Showcase</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <span>View Homepage</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => fetchShowcases(selectedHeroId)}
              className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-300 hover:text-white transition-colors"
              title="Reload from Database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs sm:text-sm font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-xs sm:text-sm font-bold animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. SHOWCASES LIST / CRUD CARDS SELECTOR */}
        <div className="glass-panel p-5 rounded-3xl border border-surface-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-bold text-white">All Hero Showcases ({showcases.length})</span>
            </div>
            <span className="text-[11px] text-gray-400">Click any card to edit, or activate it for Homepage</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {showcases.map((item) => {
              const isSelected = item.id === selectedHeroId;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectShowcase(item)}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-brand-950/40 border-brand-500 shadow-lg shadow-brand-500/20 ring-1 ring-brand-500'
                      : 'bg-surface-100/50 border-surface-200/70 hover:border-surface-200 hover:bg-surface-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface-200 text-gray-300">
                      {item.category || 'Category'}
                    </span>

                    {item.isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        LIVE ON SITE
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivateShowcase(item.id);
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-200 hover:bg-brand-600 text-gray-400 hover:text-white transition-colors"
                      >
                        Make Live
                      </button>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-gray-400 line-clamp-1">{item.description}</p>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-surface-200/50">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title="Duplicate this variation"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateShowcase(item.id);
                        }}
                        className="p-1.5 rounded-lg bg-surface-200/60 hover:bg-surface-200 text-gray-300 hover:text-white transition-colors text-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {showcases.length > 1 && (
                        <button
                          type="button"
                          title="Delete this variation"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShowcase(item.id, item.title);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <span className="text-[10px] font-semibold text-brand-400">
                      {isSelected ? '✓ Editing Now' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. NAVIGATION TABS FOR ACTIVE SHOWCASE */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-surface-100/80 rounded-2xl border border-surface-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('reel')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reel'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'text-gray-400 hover:text-white hover:bg-surface-200/50'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>1. 9:16 Hero Reel & Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'badges'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'text-gray-400 hover:text-white hover:bg-surface-200/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. Floating Badges (Badge 1 & 2)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('copy')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'copy'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'text-gray-400 hover:text-white hover:bg-surface-200/50'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>3. Hero Headlines & Buttons</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'text-gray-400 hover:text-white hover:bg-surface-200/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>4. Key Stats Counters & Ratings</span>
          </button>
        </div>

        {/* 3. 2-COLUMN SPLIT: FORM & LIVE PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: FORM CONTROLS (7 Cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            
            {/* TAB 1: 9:16 HERO REEL & VIDEO */}
            {activeTab === 'reel' && (
              <div className="space-y-6">
                <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-5">
                  <div className="flex items-center justify-between border-b border-surface-200/50 pb-3">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-brand-400" />
                      Hero Reel Details & Overlay Text
                    </h3>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-300 font-bold flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                          className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                        />
                        <span>Live on Homepage</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Category & Top Badge */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-300">Category Tag *</label>
                        <input
                          type="text"
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleChange}
                          placeholder="e.g. Fashion & Luxury"
                          list="categories-options"
                          className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 font-semibold"
                        />
                        <datalist id="categories-options">
                          {categoriesList.map((cat) => (
                            <option key={cat} value={cat} />
                          ))}
                        </datalist>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-300">Top Left Pill Badge</label>
                        <input
                          type="text"
                          name="badgeText"
                          value={formData.badgeText}
                          onChange={handleChange}
                          placeholder="e.g. AI Reel Demo"
                          className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    {/* Showcase Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-300">Hero Reel Title *</label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Luxury Silk Saree AI Showcase"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-300">Description Subtitle *</label>
                      <textarea
                        rows={3}
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="e.g. Generated purely from 2 flat product photos..."
                        className="w-full p-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
                      />
                    </div>

                    {/* Duration Badge & Button Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-300">Duration Timer</label>
                        <input
                          type="text"
                          name="durationText"
                          value={formData.durationText}
                          onChange={handleChange}
                          placeholder="e.g. 00:30"
                          className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-300">Button CTA Text</label>
                        <input
                          type="text"
                          name="buttonText"
                          value={formData.buttonText}
                          onChange={handleChange}
                          placeholder="e.g. View All 7 Categories"
                          className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-300">Button Redirect Link</label>
                      <input
                        type="text"
                        name="buttonLink"
                        value={formData.buttonLink}
                        onChange={handleChange}
                        placeholder="e.g. /portfolio or /book"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Video Media Source Card */}
                <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-5">
                  <h3 className="text-base font-extrabold text-white border-b border-surface-200/50 pb-3 flex items-center gap-2">
                    <Play className="w-4 h-4 text-accent-cyan" />
                    Video Media Source
                  </h3>

                  {/* Toggle Video Input Mode */}
                  <div className="grid grid-cols-2 p-1 bg-surface-100 rounded-2xl border border-surface-200/80 max-w-xs">
                    <button
                      type="button"
                      onClick={() => setVideoMode('url')}
                      className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        videoMode === 'url'
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      Video URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoMode('upload')}
                      className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        videoMode === 'upload'
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Video File
                    </button>
                  </div>

                  {videoMode === 'url' ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-300">Direct Video URL (MP4 / WebM / Streaming) *</label>
                      <input
                        type="url"
                        name="videoUrl"
                        required
                        value={formData.videoUrl}
                        onChange={handleChange}
                        placeholder="https://assets.mixkit.co/.../video.mp4"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="file"
                        ref={videoInputRef}
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => !uploadingVideo && videoInputRef.current?.click()}
                        className="border-2 border-dashed border-surface-200/80 hover:border-brand-500/80 rounded-2xl p-6 text-center cursor-pointer bg-surface-100/40 hover:bg-surface-100/70 transition-all space-y-2"
                      >
                        {uploadingVideo ? (
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                            <p className="text-xs font-bold text-white">
                              {uploadStatus || `Uploading video in high-speed chunks... (${uploadProgress}%)`}
                            </p>
                            {uploadProgress > 0 && (
                              <div className="w-56 bg-surface-200 h-2 rounded-full overflow-hidden mx-auto mt-2">
                                <div
                                  className="bg-brand-500 h-full rounded-full transition-all duration-300 shadow-sm shadow-brand-400"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-brand-400 mx-auto" />
                            <p className="text-xs font-bold text-white">Click to Upload Any Video File (Chunked Uploading Engine)</p>
                            <p className="text-[11px] text-gray-400">MP4, MOV, WEBM (Vertical 9:16 Recommended)</p>
                          </>
                        )}
                      </div>

                      {formData.videoUrl && (
                        <p className="text-[11px] text-emerald-400 font-mono truncate">
                          ✓ Active Video: {formData.videoUrl}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: FLOATING BADGES (BADGE 1 & 2) */}
            {activeTab === 'badges' && (
              <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Customize Floating Badges (1 & 2)
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Edit title, subtitle, icon, and colors of the floating badges attached to this showcase.
                  </p>
                </div>

                {/* Floating Badge 1 Configuration */}
                <div className="space-y-4 p-5 rounded-2xl bg-surface-100/70 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Floating Badge 1 (Top-Left Position)
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                      Live Dynamic
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-300">Badge 1 Title *</label>
                      <input
                        type="text"
                        name="floatingBadge1Title"
                        required
                        value={formData.floatingBadge1Title}
                        onChange={handleChange}
                        placeholder="Commercial Rights"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B11] border border-surface-200 text-white text-xs font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-300">Badge 1 Subtitle *</label>
                      <input
                        type="text"
                        name="floatingBadge1Sub"
                        required
                        value={formData.floatingBadge1Sub}
                        onChange={handleChange}
                        placeholder="100% Monetization"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B11] border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-300">Badge 1 Icon</label>
                      <select
                        name="floatingBadge1Icon"
                        value={formData.floatingBadge1Icon}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B11] border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                      >
                        {iconOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-300">Badge 1 Color Theme</label>
                      <select
                        name="floatingBadge1Color"
                        value={formData.floatingBadge1Color}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B11] border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                      >
                        {colorOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2 Configuration */}
                <div className="space-y-4 p-5 rounded-2xl bg-surface-100/70 border border-brand-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-400 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Floating Badge 2 (Bottom-Right Position)
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-300">
                      Live Dynamic
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-300">Badge 2 Title *</label>
                      <input
                        type="text"
                        name="floatingBadge2Title"
                        required
                        value={formData.floatingBadge2Title}
                        onChange={handleChange}
                        placeholder="AI Voiceover"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B11] border border-surface-200 text-white text-xs font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-300">Badge 2 Subtitle *</label>
                      <input
                        type="text"
                        name="floatingBadge2Sub"
                        required
                        value={formData.floatingBadge2Sub}
                        onChange={handleChange}
                        placeholder="Hindi & English"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B11] border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-300">Badge 2 Icon</label>
                      <select
                        name="floatingBadge2Icon"
                        value={formData.floatingBadge2Icon}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B11] border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                      >
                        {iconOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-300">Badge 2 Color Theme</label>
                      <select
                        name="floatingBadge2Color"
                        value={formData.floatingBadge2Color}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B11] border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                      >
                        {colorOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: HERO LEFT HEADLINES & BUTTONS */}
            {activeTab === 'copy' && (
              <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-5">
                <h3 className="text-base font-extrabold text-white border-b border-surface-200/50 pb-3 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-purple-400" />
                  Hero Left Headlines, Tagline & Action Buttons
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Top Pill Tagline</label>
                    <input
                      type="text"
                      name="heroTopPill"
                      value={formData.heroTopPill}
                      onChange={handleChange}
                      placeholder="Next-Gen AI Product Video Ads • Fast 2-Day Delivery"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-300">Main Headline Prefix *</label>
                      <input
                        type="text"
                        name="heroHeadlineMain"
                        value={formData.heroHeadlineMain}
                        onChange={handleChange}
                        placeholder="AI Product Ads That"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-300">Gradient Highlight Headline *</label>
                      <input
                        type="text"
                        name="heroHeadlineGradient"
                        value={formData.heroHeadlineGradient}
                        onChange={handleChange}
                        placeholder="Stop the Scroll."
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm font-bold focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Hero Subheadline Paragraph *</label>
                    <textarea
                      rows={3}
                      name="heroSubheadline"
                      value={formData.heroSubheadline}
                      onChange={handleChange}
                      placeholder="Transform simple product photos into viral..."
                      className="w-full p-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-400">Primary Button Text</label>
                      <input
                        type="text"
                        name="heroCtaText"
                        value={formData.heroCtaText}
                        onChange={handleChange}
                        placeholder="Book Your AI Reel Now"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-400">Primary Button Link</label>
                      <input
                        type="text"
                        name="heroCtaLink"
                        value={formData.heroCtaLink}
                        onChange={handleChange}
                        placeholder="/book"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-300">Secondary Button Text</label>
                      <input
                        type="text"
                        name="heroSecondaryText"
                        value={formData.heroSecondaryText}
                        onChange={handleChange}
                        placeholder="Watch Portfolio"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-300">Secondary Button Link</label>
                      <input
                        type="text"
                        name="heroSecondaryLink"
                        value={formData.heroSecondaryLink}
                        onChange={handleChange}
                        placeholder="/portfolio"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: KEY STATS COUNTERS & RATING */}
            {activeTab === 'stats' && (
              <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-5">
                <h3 className="text-base font-extrabold text-white border-b border-surface-200/50 pb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Key Highlights, Stat Cards & Trust Rating
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Stat 1 */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-surface-100 border border-surface-200">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Stat Card 1</span>
                      <input
                        type="text"
                        name="stat1Value"
                        value={formData.stat1Value}
                        onChange={handleChange}
                        placeholder="2 Days"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#080B11] border border-surface-200 text-white text-xs font-bold"
                      />
                      <input
                        type="text"
                        name="stat1Label"
                        value={formData.stat1Label}
                        onChange={handleChange}
                        placeholder="Guaranteed Delivery"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#080B11] border border-surface-200 text-gray-300 text-[11px]"
                      />
                    </div>

                    {/* Stat 2 */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-surface-100 border border-surface-200">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Stat Card 2</span>
                      <input
                        type="text"
                        name="stat2Value"
                        value={formData.stat2Value}
                        onChange={handleChange}
                        placeholder="₹600"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#080B11] border border-surface-200 text-brand-400 text-xs font-bold"
                      />
                      <input
                        type="text"
                        name="stat2Label"
                        value={formData.stat2Label}
                        onChange={handleChange}
                        placeholder="Starter Packages"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#080B11] border border-surface-200 text-gray-300 text-[11px]"
                      />
                    </div>

                    {/* Stat 3 */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-surface-100 border border-surface-200">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Stat Card 3</span>
                      <input
                        type="text"
                        name="stat3Value"
                        value={formData.stat3Value}
                        onChange={handleChange}
                        placeholder="10x CTR"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#080B11] border border-surface-200 text-emerald-400 text-xs font-bold"
                      />
                      <input
                        type="text"
                        name="stat3Label"
                        value={formData.stat3Label}
                        onChange={handleChange}
                        placeholder="Instagram Boost"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#080B11] border border-surface-200 text-gray-300 text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-gray-300">Trust Badge Subtitle Text</label>
                    <input
                      type="text"
                      name="trustText"
                      value={formData.trustText}
                      onChange={handleChange}
                      placeholder="4.9/5 by 150+ Brands"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="btn-glow flex-1 py-4 rounded-2xl font-bold text-white text-sm sm:text-base flex items-center justify-center gap-2 shadow-2xl shadow-brand-500/30 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save "{formData.title || 'Showcase'}"</span>
                  </>
                )}
              </button>

              {!formData.isActive && formData.id && (
                <button
                  type="button"
                  onClick={() => handleActivateShowcase(formData.id)}
                  disabled={actionLoading}
                  className="px-6 py-4 rounded-2xl font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Set as Live Homepage</span>
                </button>
              )}
            </div>
          </form>

          {/* RIGHT: LIVE 9:16 INTERACTIVE WYSIWYG PREVIEW (5 Cols) */}
          <div className="lg:col-span-5 sticky top-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-brand-400" />
                Live 9:16 Phone Mockup Preview
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Real-time WYSIWYG
              </span>
            </div>

            {/* 9:16 Phone Frame Container */}
            <div className="relative w-full max-w-[340px] mx-auto aspect-[9/16] rounded-3xl overflow-hidden glass-panel border-2 border-brand-500/40 p-2.5 shadow-2xl shadow-brand-500/25 glow-box-blue group">
              
              {/* Inner Video Container */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black">
                {formData.videoUrl ? (
                  <video
                    key={formData.videoUrl}
                    src={formData.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-100 text-gray-500 text-xs">
                    No Video Loaded
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/40 flex flex-col justify-between p-5">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-600/90 backdrop-blur-md text-white border border-brand-400/40 flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      {formData.badgeText || 'AI Reel Demo'}
                    </span>
                    <span className="text-xs font-mono text-gray-300 bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                      {formData.durationText || '00:30'}
                    </span>
                  </div>

                  {/* Bottom Content */}
                  <div className="space-y-2">
                    <div className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-accent-violet/90 text-white shadow-sm">
                      {formData.category || 'Fashion & Luxury'}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white drop-shadow leading-tight">
                      {formData.title || 'Showcase Title'}
                    </h3>

                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                      {formData.description || 'Showcase description text here...'}
                    </p>

                    <div className="mt-2 w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all">
                      <Play className="w-3.5 h-3.5 fill-white" />
                      {formData.buttonText || 'View All Categories'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1 (Top-Left) */}
              <div className="absolute -top-3 -left-3 glass-panel p-2.5 rounded-xl border-brand-400/40 flex items-center gap-2 shadow-xl animate-float">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${getBadgeColorClass(formData.floatingBadge1Color)}`}>
                  {renderBadgeIcon(formData.floatingBadge1Icon)}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white leading-tight">
                    {formData.floatingBadge1Title || 'Commercial Rights'}
                  </div>
                  <div className="text-[9px] text-gray-400 leading-tight">
                    {formData.floatingBadge1Sub || '100% Monetization'}
                  </div>
                </div>
              </div>

              {/* Floating Badge 2 (Bottom-Right) */}
              <div className="absolute -bottom-3 -right-3 glass-panel p-2.5 rounded-xl border-brand-400/40 flex items-center gap-2 shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${getBadgeColorClass(formData.floatingBadge2Color)}`}>
                  {renderBadgeIcon(formData.floatingBadge2Icon || 'zap')}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white leading-tight">
                    {formData.floatingBadge2Title || 'AI Voiceover'}
                  </div>
                  <div className="text-[9px] text-gray-400 leading-tight">
                    {formData.floatingBadge2Sub || 'Hindi & English'}
                  </div>
                </div>
              </div>

            </div>

            {/* Left Hero Headlines preview snippet */}
            <div className="glass-panel p-4 rounded-2xl border border-surface-200/60 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Live Left Copy Preview</span>
              <div className="text-white font-bold text-sm">
                {formData.heroHeadlineMain} <span className="text-gradient-blue">{formData.heroHeadlineGradient}</span>
              </div>
              <p className="text-gray-400 text-[11px] line-clamp-2">
                {formData.heroSubheadline}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-1 rounded bg-brand-600 text-white font-bold text-[10px]">
                  {formData.heroCtaText}
                </span>
                <span className="px-2 py-1 rounded bg-surface-100 text-gray-300 font-medium text-[10px]">
                  {formData.heroSecondaryText}
                </span>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
