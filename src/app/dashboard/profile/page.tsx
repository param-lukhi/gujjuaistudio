'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/providers/ToastProvider';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Edit,
  Save,
  X,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Package,
  Clock,
  MessageSquare,
  Upload,
  Camera,
  Trash2,
  Sparkles,
  Loader2,
  ExternalLink,
  AtSign,
  Briefcase
} from 'lucide-react';
import { uploadMediaFile } from '@/lib/uploadClient';


const AI_PRESET_AVATARS = [
  {
    name: 'Gujarati Entrepeneur',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces',
  },
  {
    name: 'Creative Director',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces',
  },
  {
    name: 'Brand Strategist',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces',
  },
  {
    name: 'Fashion Creator',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces',
  },
  {
    name: 'Studio Innovator',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&crop=faces',
  },
];

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'business' | 'social'>('info');

  const [profile, setProfile] = useState<any>({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    bio: '',
    country: '',
    state: '',
    city: '',
    address: '',
    website: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    image: '',
    createdAt: '',
    status: 'ACTIVE',
    isVerified: false,
    role: 'CLIENT',
  });

  const [stats, setStats] = useState<any>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageFileUpload = async (file: File) => {
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadMediaFile(file, { folder: 'avatars' });
      setProfile((prev: any) => ({ ...prev, image: url }));
      showToast('Profile photo uploaded! Click "Save Changes" to apply.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error uploading image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };


  const handleRemovePhoto = () => {
    setProfile((prev: any) => ({ ...prev, image: '' }));
    showToast('Photo removed. Click "Save Changes" to apply.', 'success');
  };

  const handleSelectPresetAvatar = (url: string) => {
    setProfile((prev: any) => ({ ...prev, image: url }));
    showToast('AI Avatar selected! Click "Save Changes" to apply.', 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Profile updated successfully!', 'success');
        setIsEditing(false);
        await updateSession({
          ...session?.user,
          name: profile.name,
          image: profile.image,
        });
        fetchProfile();
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-48 bg-surface-100/50 rounded-3xl" />
          <div className="h-96 bg-surface-100/50 rounded-3xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Hidden File Input for Avatar Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png, image/jpeg, image/webp, image/jpg, image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageFileUpload(file);
          }}
        />

        {/* Profile Hero Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            
            {/* Avatar with Upload Hover Button */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-2xl shadow-brand-500/20">
                {profile?.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name || 'User'}
                    className="w-full h-full rounded-[22px] object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#080B11] rounded-[22px] flex items-center justify-center font-black text-3xl sm:text-4xl text-brand-400">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-2"
                title="Change profile image"
              >
                {uploadingImage ? (
                  <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-brand-400" />
                    <span className="text-[10px] font-bold">Change</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{profile?.name || 'Client Name'}</h1>
                {profile?.username && (
                  <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-lg border border-brand-500/20">
                    @{profile.username}
                  </span>
                )}
                <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {profile?.status || 'ACTIVE'}
                </span>
                {profile?.isVerified && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-brand-400" /> Verified Client
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-300 line-clamp-2 max-w-lg leading-relaxed">
                {profile?.bio || '🚀 Client at Gujju AI Studio — Creating high-converting AI Commercials.'}
              </p>

              <div className="flex items-center gap-4 pt-1 text-xs text-gray-400 flex-wrap font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" /> Joined: {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
                {profile?.businessName && (
                  <span className="flex items-center gap-1 text-white font-semibold">
                    <Building className="w-3.5 h-3.5 text-brand-400" /> {profile.businessName}
                  </span>
                )}
                {profile?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" /> {profile.city}, {profile.country || 'India'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit / Quick Upload Buttons */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-xs font-bold text-gray-200 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-brand-400" />
              {uploadingImage ? 'Uploading...' : 'Upload Photo'}
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                isEditing
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'btn-glow text-white shadow-brand-500/25'
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 text-rose-400" /> Cancel Edit
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" /> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-surface-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
              <Package className="w-4 h-4 text-brand-400" />
            </div>
            <p className="text-2xl font-black text-white">{stats.totalOrders}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-300">{stats.completedOrders}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">In Production</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-300">{stats.pendingOrders}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-brand-500/20 bg-brand-500/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">Direct Messages</span>
              <MessageSquare className="w-4 h-4 text-brand-400" />
            </div>
            <p className="text-2xl font-black text-brand-300">{stats.unreadMessages}</p>
          </div>
        </div>

        {/* Dedicated Profile Photo & Avatar Manager Box */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-200/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Profile Photo & Avatar</h3>
                <p className="text-xs text-gray-400">Upload your personal photo or select a high-resolution AI Studio Avatar</p>
              </div>
            </div>

            {profile.image && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Current Photo
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Live Avatar Preview */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-100/50 border border-surface-200/70 text-center space-y-3">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-xl">
                  {profile?.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name || 'User'}
                      className="w-full h-full rounded-[22px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#080B11] rounded-[22px] flex items-center justify-center font-black text-4xl text-brand-400">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs font-bold text-white">{profile?.name || 'User Avatar'}</p>
              <p className="text-[11px] text-gray-400 font-mono">{profile?.email}</p>
            </div>

            {/* Upload Action & URL Input */}
            <div className="md:col-span-8 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">1. Upload from Computer or Gallery</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-surface-200 hover:border-brand-500/50 rounded-2xl p-4 sm:p-5 text-center cursor-pointer hover:bg-brand-500/5 transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center shrink-0">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Click to Browse and Upload Photo</p>
                      <p className="text-[11px] text-gray-400">Supports PNG, JPG, JPEG, WEBP (Max 5MB)</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={uploadingImage}
                    className="btn-glow px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0"
                  >
                    {uploadingImage ? 'Uploading...' : '📁 Choose File'}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">2. Or Paste Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={profile.image || ''}
                    onChange={(e) => setProfile({ ...profile, image: e.target.value })}
                    placeholder="https://images.unsplash.com/... or cloud image link"
                    className="flex-1 bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white placeholder-gray-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!profile.image) return;
                      showToast('Photo URL updated! Click "Save Changes" below to apply.', 'success');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-xs font-bold text-white shrink-0"
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* AI Preset Avatars */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" /> 3. Or Pick Studio AI Avatar Preset
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {AI_PRESET_AVATARS.map((avatar) => (
                    <button
                      key={avatar.name}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(avatar.url)}
                      className={`p-1.5 rounded-2xl border transition-all text-center shrink-0 flex flex-col items-center gap-1 group ${
                        profile.image === avatar.url
                          ? 'border-brand-500 bg-brand-600/20 ring-2 ring-brand-500/40'
                          : 'border-surface-200 bg-surface-100 hover:border-brand-400/60'
                      }`}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-12 h-12 rounded-xl object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[10px] font-medium text-gray-400 group-hover:text-white max-w-[60px] truncate">
                        {avatar.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details & Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-surface-200/60 pb-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'info'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-surface-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Personal Info
            </button>

            <button
              onClick={() => setActiveTab('business')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'business'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-surface-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Business & Location
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'social'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-surface-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Website & Social Media
            </button>
          </div>

          {/* Form when in edit mode */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* TAB 1: Personal Info */}
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={profile.name || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1">
                      <AtSign className="w-3 h-3 text-brand-400" /> Username (Unique handle)
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profile.username || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your username"
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Email Address (Registered)</label>
                    <input
                      type="email"
                      disabled
                      value={profile.email || ''}
                      className="w-full bg-surface-200/50 border border-surface-200 rounded-xl py-2.5 px-4 text-xs text-gray-400 cursor-not-allowed outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">WhatsApp / Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={profile.phoneNumber || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your mobile number"
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">About / Brand Bio</label>
                    <textarea
                      name="bio"
                      rows={3}
                      value={profile.bio || ''}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself, your brand niche, or video creation requirements..."
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Business & Location */}
              {activeTab === 'business' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Company / Brand Name</label>
                    <input
                      type="text"
                      name="businessName"
                      value={profile.businessName || ''}
                      onChange={handleInputChange}
                      placeholder="Enter company or brand name"
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={profile.address || ''}
                      onChange={handleInputChange}
                      placeholder="Ring Road Textile Market, Shop #402"
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">City</label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city || ''}
                      onChange={handleInputChange}
                      placeholder="Surat"
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">State</label>
                    <input
                      type="text"
                      name="state"
                      value={profile.state || ''}
                      onChange={handleInputChange}
                      placeholder="Gujarat"
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={profile.country || ''}
                      onChange={handleInputChange}
                      placeholder="India"
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Social & Links */}
              {activeTab === 'social' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-brand-400" /> Official Website URL
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={profile.website || ''}
                      onChange={handleInputChange}
                      placeholder="https://suratsilktrends.com"
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-400" /> Instagram Profile Link
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={profile.instagram || ''}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/suratsilk"
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Facebook className="w-3.5 h-3.5 text-blue-400" /> Facebook Page Link
                    </label>
                    <input
                      type="text"
                      name="facebook"
                      value={profile.facebook || ''}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/suratsilk"
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-sky-400" /> LinkedIn Profile Link
                    </label>
                    <input
                      type="text"
                      name="linkedin"
                      value={profile.linkedin || ''}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/company/suratsilk"
                      className="w-full bg-surface-100 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-surface-200/50">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-glow px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-xs font-semibold text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* Read-Only Display Mode */
            <div className="space-y-6">
              
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60 space-y-1">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-400" /> Full Name
                    </span>
                    <p className="font-bold text-sm text-white">{profile?.name || 'Not provided'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60 space-y-1">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-brand-400" /> Username Handle
                    </span>
                    <p className="font-bold text-sm text-brand-300 font-mono">
                      {profile?.username ? `@${profile.username}` : 'No handle set'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60 space-y-1">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-brand-400" /> Email Address
                    </span>
                    <p className="font-bold text-sm text-white font-mono">{profile?.email || 'N/A'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60 space-y-1">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-400" /> Phone / WhatsApp
                    </span>
                    <p className="font-bold text-sm text-white">{profile?.phoneNumber || 'Not provided'}</p>
                  </div>

                  <div className="md:col-span-2 p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60 space-y-1">
                    <span className="text-gray-400 font-semibold">About / Bio</span>
                    <p className="text-gray-200 leading-relaxed">{profile?.bio || 'No bio provided yet.'}</p>
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60 space-y-1">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-brand-400" /> Company / Brand Name
                    </span>
                    <p className="font-bold text-sm text-white">{profile?.businessName || 'Not provided'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60 space-y-1">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" /> City & State
                    </span>
                    <p className="font-bold text-sm text-white">
                      {profile?.city ? `${profile.city}, ${profile.state || ''}` : 'Not provided'}
                    </p>
                  </div>

                  <div className="md:col-span-2 p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60 space-y-1">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" /> Full Address
                    </span>
                    <p className="font-bold text-sm text-white">
                      {profile?.address ? `${profile.address}, ${profile.city || ''}, ${profile.state || ''}, ${profile.country || 'India'}` : 'Not provided'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60 space-y-1">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-brand-400" /> Website
                    </span>
                    {profile?.website ? (
                      <a href={profile.website} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline flex items-center gap-1 font-bold truncate">
                        {profile.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-gray-500 font-medium">No website linked</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60 space-y-1">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-400" /> Instagram
                    </span>
                    {profile?.instagram ? (
                      <a href={profile.instagram} target="_blank" rel="noreferrer" className="text-pink-400 hover:underline flex items-center gap-1 font-bold truncate">
                        {profile.instagram} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-gray-500 font-medium">No Instagram linked</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60 space-y-1">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                      <Facebook className="w-3.5 h-3.5 text-blue-400" /> Facebook
                    </span>
                    {profile?.facebook ? (
                      <a href={profile.facebook} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 font-bold truncate">
                        {profile.facebook} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-gray-500 font-medium">No Facebook linked</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-100/40 border border-surface-200/60 space-y-1">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-sky-400" /> LinkedIn
                    </span>
                    {profile?.linkedin ? (
                      <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center gap-1 font-bold truncate">
                        {profile.linkedin} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-gray-500 font-medium">No LinkedIn linked</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}
