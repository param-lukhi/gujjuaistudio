'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Film, Plus, Edit, Trash2, Star, Sparkles, X, Check, 
  Upload, Link2, Play, Image as ImageIcon, Loader2, 
  CheckCircle2, AlertCircle, RefreshCw, Monitor, Smartphone, 
  Square, Video, Layers, Sliders
} from 'lucide-react';
import { uploadMediaFile } from '@/lib/uploadClient';


const VIDEO_FORMATS_LIST = [
  'MP4', 'MOV', 'MKV', 'WEBM', 'AVI', 'M4V', '3GP', 'WMV', 'FLV', 'TS', 'MPEG', 'ALL'
];

const IMAGE_FORMATS_LIST = [
  'PNG', 'JPG', 'WEBP', 'GIF', 'SVG', 'AVIF', 'HEIC', 'BMP', 'ALL'
];

const ASPECT_RATIO_OPTIONS = [
  { value: '9:16', label: '9:16 Vertical (Reels / Shorts / TikTok)', icon: Smartphone },
  { value: '1:1', label: '1:1 Square (Feed Post / Ad)', icon: Square },
  { value: '16:9', label: '16:9 Widescreen (YouTube / Banner / Landscape)', icon: Monitor },
  { value: '4:5', label: '4:5 Portrait (Instagram / FB Feed)', icon: Layers },
];

const RESOLUTION_OPTIONS = [
  '4K Ultra HD (2160p)',
  '2K Quad HD (1440p)',
  '1080p Full HD',
  '720p HD',
];

export default function ManagePortfolioPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Tab states for Video and Thumbnail input modes ('upload' | 'link')
  const [videoMode, setVideoMode] = useState<'upload' | 'link'>('upload');
  const [thumbMode, setThumbMode] = useState<'upload' | 'link'>('upload');

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadStatus, setVideoUploadStatus] = useState('');
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Fashion',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '30s',
    aspectRatio: '9:16',
    resolution: '4K Ultra HD (2160p)',
    featured: false,
  });

  const categoriesList = [
    'Fashion',
    'Clothing',
    'Jewelry',
    'Food',
    'Beauty',
    'Electronics',
    'Restaurant'
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setVideoMode('upload');
    setThumbMode('upload');
    setUploadError(null);
    setFormData({
      title: '',
      category: 'Fashion',
      videoUrl: '',
      thumbnailUrl: '',
      duration: '30s',
      aspectRatio: '9:16',
      resolution: '4K Ultra HD (2160p)',
      featured: false,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setVideoMode(item.videoUrl?.startsWith('/uploads') ? 'upload' : 'link');
    setThumbMode(item.thumbnailUrl?.startsWith('/uploads') ? 'upload' : 'link');
    setUploadError(null);
    setFormData({
      title: item.title || '',
      category: item.category || 'Fashion',
      videoUrl: item.videoUrl || '',
      thumbnailUrl: item.thumbnailUrl || '',
      duration: item.duration || '30s',
      aspectRatio: item.aspectRatio || '9:16',
      resolution: item.resolution || '4K Ultra HD (2160p)',
      featured: Boolean(item.featured),
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (file: File, type: 'video' | 'thumbnail') => {
    if (!file) return;

    if (type === 'video') {
      setUploadingVideo(true);
      setVideoUploadProgress(0);
      setVideoUploadStatus(`Preparing ${(file.size / (1024 * 1024)).toFixed(1)}MB video...`);
    } else {
      setUploadingThumb(true);
    }
    setUploadError(null);

    try {
      const url = await uploadMediaFile(file, {
        folder: type === 'video' ? 'portfolio_videos' : 'portfolio_thumbnails',
        onProgress: (p, status) => {
          if (type === 'video') {
            setVideoUploadProgress(p);
            if (status) setVideoUploadStatus(status);
          }
        },
      });

      if (type === 'video') {
        setFormData((prev) => ({ ...prev, videoUrl: url }));
      } else {
        setFormData((prev) => ({ ...prev, thumbnailUrl: url }));
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'File upload failed. Please try again.');
    } finally {
      if (type === 'video') {
        setUploadingVideo(false);
        setVideoUploadProgress(0);
        setVideoUploadStatus('');
      }
      if (type === 'thumbnail') setUploadingThumb(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoUrl) {
      setUploadError('Please provide a Video URL or upload a video file.');
      return;
    }
    if (!formData.thumbnailUrl) {
      setUploadError('Please provide a Thumbnail URL or upload a cover image.');
      return;
    }

    try {
      if (editingItem) {
        await fetch(`/api/portfolio/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setModalOpen(false);
      fetchItems();
    } catch (e) {
      console.error(e);
      setUploadError('Failed to save portfolio reel. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reel from portfolio?')) return;
    try {
      await fetch(`/api/portfolio/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  const getFormatBadge = (url: string) => {
    if (!url) return 'URL';
    const ext = url.split('.').pop()?.split('?')[0]?.toUpperCase();
    if (ext && ext.length <= 4) return ext;
    return 'MP4';
  };

  return (
    <div className="flex min-h-screen bg-[#080B11]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 lg:pt-8 space-y-6 sm:space-y-8 overflow-y-auto max-h-screen min-w-0 w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-200/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Manage AI Reel Portfolio</h1>
            <p className="text-xs text-gray-400">
              Add, edit, or upload showcase reels in all formats (MP4, MOV, WEBM, MKV, AVI, etc.) and aspect ratios.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="btn-glow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New AI Reel
          </button>
        </div>

        {/* Portfolio Table / Grid */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-200/70 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              <p className="text-xs text-gray-400">Loading portfolio items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Film className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="text-sm font-semibold text-gray-300">No portfolio reels added yet</p>
              <p className="text-xs text-gray-500">Click &quot;Add New AI Reel&quot; to upload your first showcase video in any format.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="glass-panel p-4 rounded-2xl border border-surface-200/60 space-y-3 relative group hover:border-brand-500/40 transition-all">
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black max-h-[260px]">
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-600/90 text-white backdrop-blur-sm">
                        {item.category}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-brand-300 border border-white/10 backdrop-blur-sm">
                        {getFormatBadge(item.videoUrl)}
                      </span>
                    </div>

                    {item.featured && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/90 text-white flex items-center gap-1 backdrop-blur-sm">
                        <Star className="w-3 h-3 fill-white" /> Featured
                      </div>
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm line-clamp-1">{item.title}</h4>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                      <span>Duration: {item.duration}</span>
                      <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                        {item.videoUrl?.startsWith('/uploads') ? 'Local File' : 'External Link'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-200/40">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg bg-surface-100 text-gray-300 hover:text-white transition-colors"
                      title="Edit Reel"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Reel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for Add / Edit */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-surface-200/50 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-brand-400" />
                  {editingItem ? 'Edit Reel Details' : 'Add New Portfolio Reel'}
                </h3>
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)} 
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Reel Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Reel Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Luxury Gold Diamond Ring AI Ad"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm focus:outline-none focus:border-brand-500 transition-all placeholder:text-gray-500"
                  />
                </div>

                {/* Category & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat} className="bg-surface-100 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 30s or 15s"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm focus:outline-none focus:border-brand-500 transition-all placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Video Format & Resolution Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-surface-100/50 border border-surface-200/70">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-brand-400" />
                      Aspect Ratio / Format
                    </label>
                    <select
                      value={formData.aspectRatio}
                      onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 transition-all"
                    >
                      {ASPECT_RATIO_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-surface-100 text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-brand-400" />
                      Video Quality / Resolution
                    </label>
                    <select
                      value={formData.resolution}
                      onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 transition-all"
                    >
                      {RESOLUTION_OPTIONS.map((res) => (
                        <option key={res} value={res} className="bg-surface-100 text-white">
                          {res}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 1. VIDEO SOURCE SECTION (Upload File OR Enter Link) */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface-100/70 border border-surface-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-brand-400" />
                        Video Source *
                      </label>
                      <p className="text-[10px] text-gray-400">Upload video in any format or provide direct stream link</p>
                    </div>
                    
                    {/* Toggle Buttons: Upload vs Link */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-200/80 border border-surface-200 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setVideoMode('upload')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          videoMode === 'upload'
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Video
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode('link')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          videoMode === 'link'
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Video Link
                      </button>
                    </div>
                  </div>

                  {/* Upload Video Mode */}
                  {videoMode === 'upload' ? (
                    <div className="space-y-2.5">
                      <input
                        type="file"
                        ref={videoInputRef}
                        accept="video/*,.mp4,.mov,.mkv,.avi,.webm,.m4v,.3gp,.wmv,.flv,.ts,.mpeg,.ogv,.m2ts"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'video');
                        }}
                      />

                      <div
                        onClick={() => !uploadingVideo && videoInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          formData.videoUrl
                            ? 'border-brand-500/50 bg-brand-500/5'
                            : 'border-surface-200 hover:border-brand-400/50 hover:bg-surface-200/40'
                        }`}
                      >
                        {uploadingVideo ? (
                          <div className="flex flex-col items-center justify-center py-3 space-y-2">
                            <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
                            <p className="text-xs font-bold text-white">
                              {videoUploadStatus || `Uploading video file... (${videoUploadProgress}%)`}
                            </p>
                            {videoUploadProgress > 0 && (
                              <div className="w-56 bg-surface-200 h-2 rounded-full overflow-hidden mx-auto mt-2">
                                <div
                                  className="bg-brand-500 h-full rounded-full transition-all duration-300 shadow-sm shadow-brand-400"
                                  style={{ width: `${videoUploadProgress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ) : formData.videoUrl ? (
                          <div className="flex items-center justify-between gap-2 text-left">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-xs font-semibold text-white truncate max-w-[280px]">
                                  {formData.videoUrl}
                                </p>
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    {getFormatBadge(formData.videoUrl)}
                                  </span>
                                  <span className="text-[10px] text-emerald-400 font-medium">Ready & uploaded</span>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                videoInputRef.current?.click();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-surface-200 text-xs text-gray-300 hover:text-white shrink-0 flex items-center gap-1.5 border border-surface-200/80"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Replace File
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-2 space-y-2">
                            <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">Click or drag & drop video file here (Up to 500MB)</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">Supports 4K Reels: MP4, MOV, MKV, WEBM, AVI, M4V, 3GP, WMV, etc.</p>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Video Supported Formats Badges */}
                      <div className="flex items-center flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] text-gray-400 font-medium">Supported Formats:</span>
                        {VIDEO_FORMATS_LIST.map((fmt) => (
                          <span
                            key={fmt}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-surface-200/90 text-gray-300 border border-surface-200"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>

                      {/* Video Player Preview if URL exists */}
                      {formData.videoUrl && (
                        <div className="relative rounded-xl overflow-hidden bg-black/90 max-h-[160px] border border-surface-200 flex items-center justify-center p-1">
                          <video 
                            src={formData.videoUrl} 
                            controls 
                            className="max-h-[150px] w-auto mx-auto object-contain rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Link Video Mode */
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://assets.mixkit.co/... or https://your-cdn.com/video.mp4"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 font-mono placeholder:text-gray-500"
                      />
                      {formData.videoUrl && (
                        <div className="p-2 rounded-lg bg-surface-200/60 border border-surface-200 flex items-center justify-between text-[11px] text-gray-300">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{formData.videoUrl}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-brand-500/20 text-brand-300 shrink-0">
                            {getFormatBadge(formData.videoUrl)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. THUMBNAIL COVER SOURCE SECTION (Upload File OR Enter Link) */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface-100/70 border border-surface-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-brand-400" />
                        Thumbnail Cover Image *
                      </label>
                      <p className="text-[10px] text-gray-400">Upload cover image in any image format or provide link</p>
                    </div>

                    {/* Toggle Buttons: Upload vs Link */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-200/80 border border-surface-200 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setThumbMode('upload')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          thumbMode === 'upload'
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setThumbMode('link')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          thumbMode === 'link'
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Image Link
                      </button>
                    </div>
                  </div>

                  {/* Upload Thumbnail Mode */}
                  {thumbMode === 'upload' ? (
                    <div className="space-y-2.5">
                      <input
                        type="file"
                        ref={thumbInputRef}
                        accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif,.heic,.bmp,.tiff,.ico"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'thumbnail');
                        }}
                      />

                      <div
                        onClick={() => !uploadingThumb && thumbInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          formData.thumbnailUrl
                            ? 'border-brand-500/50 bg-brand-500/5'
                            : 'border-surface-200 hover:border-brand-400/50 hover:bg-surface-200/40'
                        }`}
                      >
                        {uploadingThumb ? (
                          <div className="flex flex-col items-center justify-center py-3 space-y-2">
                            <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
                            <p className="text-xs font-semibold text-brand-300">Uploading cover image...</p>
                          </div>
                        ) : formData.thumbnailUrl ? (
                          <div className="flex items-center justify-between gap-3 text-left">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <img
                                src={formData.thumbnailUrl}
                                alt="Thumbnail Preview"
                                className="w-12 h-16 object-cover rounded-lg border border-surface-200 shrink-0"
                              />
                              <div className="overflow-hidden">
                                <p className="text-xs font-semibold text-white truncate max-w-[240px]">
                                  {formData.thumbnailUrl}
                                </p>
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    {getFormatBadge(formData.thumbnailUrl)}
                                  </span>
                                  <span className="text-[10px] text-emerald-400 font-medium">Cover image ready</span>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                thumbInputRef.current?.click();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-surface-200 text-xs text-gray-300 hover:text-white shrink-0 flex items-center gap-1.5 border border-surface-200/80"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Replace File
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-2 space-y-2">
                            <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">Click or drag & drop thumbnail image</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">Supports PNG, JPG, WEBP, GIF, SVG, AVIF, HEIC, BMP</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Supported Formats Badges */}
                      <div className="flex items-center flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] text-gray-400 font-medium">Supported Formats:</span>
                        {IMAGE_FORMATS_LIST.map((fmt) => (
                          <span
                            key={fmt}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-surface-200/90 text-gray-300 border border-surface-200"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Link Thumbnail Mode */
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/... or image link"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 font-mono placeholder:text-gray-500"
                      />
                      {formData.thumbnailUrl && (
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-200/60 border border-surface-200">
                          <img
                            src={formData.thumbnailUrl}
                            alt="Preview"
                            className="w-8 h-10 object-cover rounded border border-surface-200"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="text-[11px] text-gray-300 truncate">{formData.thumbnailUrl}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Featured Reel Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featured-check"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                  />
                  <label htmlFor="featured-check" className="text-xs font-semibold text-white cursor-pointer select-none">
                    Show as Featured Reel on Homepage
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-200/50">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-100 text-gray-300 hover:text-white hover:bg-surface-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingVideo || uploadingThumb}
                    className="btn-glow px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {(uploadingVideo || uploadingThumb) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {uploadingVideo ? 'Uploading Video...' : uploadingThumb ? 'Uploading Image...' : 'Save Reel'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
