'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Sparkles, Save, Upload, Link2, Play, Eye, 
  Loader2, CheckCircle2, AlertCircle, RefreshCw, 
  Layers, ExternalLink, Zap, ShieldCheck, Film, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

export default function AdminHeroPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Video input mode: 'upload' | 'url'
  const [videoMode, setVideoMode] = useState<'upload' | 'url'>('url');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
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
    floatingBadge2Title: 'AI Voiceover',
    floatingBadge2Sub: 'Hindi & English',
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

  const fetchHeroData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hero');
      const data = await res.json();
      if (data) {
        setFormData({
          badgeText: data.badgeText || 'AI Reel Demo',
          durationText: data.durationText || '00:30',
          category: data.category || 'Fashion & Luxury',
          title: data.title || 'Luxury Silk Saree AI Showcase',
          description: data.description || 'Generated purely from 2 flat product photos. Complete with AI lighting & model animation.',
          videoUrl: data.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-golden-dress-40995-large.mp4',
          thumbnailUrl: data.thumbnailUrl || '',
          buttonText: data.buttonText || 'View All 7 Categories',
          buttonLink: data.buttonLink || '/portfolio',
          floatingBadge1Title: data.floatingBadge1Title || 'Commercial Rights',
          floatingBadge1Sub: data.floatingBadge1Sub || '100% Monetization',
          floatingBadge2Title: data.floatingBadge2Title || 'AI Voiceover',
          floatingBadge2Sub: data.floatingBadge2Sub || 'Hindi & English',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Video file upload handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setErrorMsg(null);

    try {
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload video');

      setFormData((prev) => ({ ...prev, videoUrl: data.url }));
      setSuccessMsg('Video file uploaded successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading video');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Save changes to database
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

      setSuccessMsg('🎉 Hero Reel Showcase updated and published to Homepage successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save hero changes');
    } finally {
      setSaving(false);
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
              Hero Reel Showcase Editor
            </h1>
            <p className="text-xs text-gray-400">
              Customize the interactive 9:16 AI Reel video, title, category, descriptions, and floating badges displayed on the homepage hero section.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <span>View Homepage</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={fetchHeroData}
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

        {/* 2-COLUMN SPLIT: CONTROLS & LIVE PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: FORM CONTROLS (7 Cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            
            {/* 1. Main Reel Details Card */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-5">
              <h3 className="text-base font-extrabold text-white border-b border-surface-200/50 pb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-brand-400" />
                Hero Reel Content & Titles
              </h3>

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

            {/* 2. Video Media Source Card */}
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
                  <label className="text-xs font-bold text-gray-300">Direct Video URL (MP4 / WebM / Cloudinary / CDN) *</label>
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
                    onClick={() => videoInputRef.current?.click()}
                    className="border-2 border-dashed border-surface-200/80 hover:border-brand-500/80 rounded-2xl p-6 text-center cursor-pointer bg-surface-100/40 hover:bg-surface-100/70 transition-all space-y-2"
                  >
                    {uploadingVideo ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                        <p className="text-xs font-bold text-white">Uploading video to Cloud Storage...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-brand-400 mx-auto" />
                        <p className="text-xs font-bold text-white">Click to Select & Upload Video File</p>
                        <p className="text-[11px] text-gray-400">Supports MP4, MOV, WEBM (Vertical 9:16 Recommended)</p>
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

            {/* 3. Floating Badges Configuration */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-5">
              <h3 className="text-base font-extrabold text-white border-b border-surface-200/50 pb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Floating Trust Badges
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Floating Badge 1 */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface-100/60 border border-surface-200/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    Floating Badge 1 (Top-Left)
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Title</label>
                    <input
                      type="text"
                      name="floatingBadge1Title"
                      value={formData.floatingBadge1Title}
                      onChange={handleChange}
                      placeholder="Commercial Rights"
                      className="w-full px-3 py-2 rounded-xl bg-[#080B11] border border-surface-200 text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Subtitle</label>
                    <input
                      type="text"
                      name="floatingBadge1Sub"
                      value={formData.floatingBadge1Sub}
                      onChange={handleChange}
                      placeholder="100% Monetization"
                      className="w-full px-3 py-2 rounded-xl bg-[#080B11] border border-surface-200 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface-100/60 border border-surface-200/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                    <Zap className="w-4 h-4" />
                    Floating Badge 2 (Bottom-Right)
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Title</label>
                    <input
                      type="text"
                      name="floatingBadge2Title"
                      value={formData.floatingBadge2Title}
                      onChange={handleChange}
                      placeholder="AI Voiceover"
                      className="w-full px-3 py-2 rounded-xl bg-[#080B11] border border-surface-200 text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Subtitle</label>
                    <input
                      type="text"
                      name="floatingBadge2Sub"
                      value={formData.floatingBadge2Sub}
                      onChange={handleChange}
                      placeholder="Hindi & English"
                      className="w-full px-3 py-2 rounded-xl bg-[#080B11] border border-surface-200 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={saving}
              className="btn-glow w-full py-4 rounded-2xl font-bold text-white text-sm sm:text-base flex items-center justify-center gap-2 shadow-2xl shadow-brand-500/30 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Publishing Changes to Homepage...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save & Publish to Live Homepage</span>
                </>
              )}
            </button>
          </form>

          {/* RIGHT: LIVE 9:16 INTERACTIVE WYSIWYG PREVIEW (5 Cols) */}
          <div className="lg:col-span-5 sticky top-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-brand-400" />
                Live 9:16 Phone Mockup Preview
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Real-time Preview
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
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  ✓
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
                <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
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

          </div>

        </div>

      </main>
    </div>
  );
}
