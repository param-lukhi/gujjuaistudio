'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { formatCurrencyINR } from '@/lib/utils';
import { 
  Package, Plus, Edit, Trash2, Check, Sparkles, X, 
  Loader2, AlertCircle, CheckCircle2, Star, ShieldCheck, 
  ArrowUpRight, ListPlus, MinusCircle
} from 'lucide-react';

export default function ManagePackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: 600,
    duration: 'Up to 15 Seconds',
    deliveryDays: 'Delivery in 2 Days',
    revisions: '1 Revision',
    popular: false,
    features: ['1 AI Product Reel', 'Delivery in 2 Days', '1 Revision'],
  });

  const [featureInput, setFeatureInput] = useState('');

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      setPackages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading packages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPkg(null);
    setErrorMsg(null);
    setFormData({
      name: '',
      slug: '',
      price: 1000,
      duration: 'Up to 30 Seconds Each',
      deliveryDays: 'Delivery in 2 Days',
      revisions: '1 Revision',
      popular: false,
      features: [
        '1 AI Product Reel',
        'Up to 30 Seconds Each',
        'AI Voiceover (Hindi / English / Gujarati)',
        'Commercial Use License',
        '1 Revision',
        'Delivery in 2 Days',
        '4K Crisp Vertical Reel Format (9:16)'
      ],
    });
    setFeatureInput('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (pkg: any) => {
    setEditingPkg(pkg);
    setErrorMsg(null);
    let parsedFeatures: string[] = [];
    try {
      parsedFeatures = JSON.parse(pkg.features || '[]');
    } catch (e) {
      parsedFeatures = [];
    }

    setFormData({
      name: pkg.name || '',
      slug: pkg.slug || '',
      price: pkg.price || 0,
      duration: pkg.duration || 'Up to 30 Seconds',
      deliveryDays: pkg.deliveryDays || 'Delivery in 2 Days',
      revisions: pkg.revisions || '1 Revision',
      popular: Boolean(pkg.popular),
      features: parsedFeatures.length > 0 ? parsedFeatures : ['1 AI Product Reel'],
    });
    setFeatureInput('');
    setModalOpen(true);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, featureInput.trim()],
    }));
    setFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please enter a package name');
      return;
    }
    if (formData.price <= 0) {
      setErrorMsg('Price must be greater than ₹0');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        ...formData,
        features: JSON.stringify(formData.features),
      };

      if (editingPkg) {
        const res = await fetch(`/api/packages/${editingPkg.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update package');
        setSuccessMsg('Package updated successfully!');
      } else {
        const res = await fetch('/api/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create package');
        setSuccessMsg('New package created successfully!');
      }

      setModalOpen(false);
      fetchPackages();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error saving package');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMsg(`Package "${name}" deleted successfully.`);
        fetchPackages();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePopular = async (pkg: any) => {
    try {
      await fetch(`/api/packages/${pkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popular: !pkg.popular }),
      });
      fetchPackages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080B11]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 lg:pt-8 space-y-6 sm:space-y-8 overflow-y-auto max-h-screen min-w-0 w-full">
        
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-200/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Manage Packages & Rates</h1>
            <p className="text-xs text-gray-400">
              Create, edit rates, update deliverables, add features, or remove packages across your store.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="btn-glow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New Package
          </button>
        </div>

        {/* Feedback Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Packages Cards Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              <p className="text-xs text-gray-400">Loading packages...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border border-surface-200/50 space-y-3">
              <Package className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-base font-bold text-white">No Packages Configured Yet</p>
              <p className="text-xs text-gray-400">Click &quot;Add New Package&quot; to create your first pricing tier.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => {
                let features: string[] = [];
                try {
                  features = JSON.parse(pkg.features || '[]');
                } catch (e) {
                  features = [];
                }

                return (
                  <div
                    key={pkg.id}
                    className={`glass-panel p-6 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between space-y-5 ${
                      pkg.popular
                        ? 'border-brand-500/60 shadow-lg shadow-brand-500/10 bg-brand-950/20'
                        : 'border-surface-200/70 hover:border-surface-200'
                    }`}
                  >
                    {/* Top Badges & Controls */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                          {pkg.slug || 'package'}
                        </span>
                      </div>

                      {pkg.popular ? (
                        <button
                          onClick={() => handleTogglePopular(pkg)}
                          className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand-600 text-white shadow-md shadow-brand-500/20 flex items-center gap-1 hover:scale-105 transition-transform"
                          title="Click to remove popular tag"
                        >
                          <Star className="w-3 h-3 fill-white" />
                          MOST POPULAR
                        </button>
                      ) : (
                        <button
                          onClick={() => handleTogglePopular(pkg)}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-gray-500 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                          title="Click to set as Most Popular"
                        >
                          + Set Popular
                        </button>
                      )}
                    </div>

                    {/* Package Info */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-black text-white">{pkg.name}</h3>

                      <div className="text-3xl sm:text-4xl font-black text-brand-400 tracking-tight">
                        {formatCurrencyINR(pkg.price)}
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 p-3 rounded-xl bg-surface-100/60 border border-surface-200/50 text-xs text-gray-300">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <strong className="text-white font-semibold">{pkg.duration}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Delivery:</span>
                          <strong className="text-white font-semibold">{pkg.deliveryDays}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Revisions:</span>
                          <strong className="text-white font-semibold">{pkg.revisions}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="border-t border-surface-200/50 pt-4 space-y-2.5 flex-1">
                      <span className="text-xs font-bold text-gray-300 block">
                        Features Included ({features.length}):
                      </span>
                      <ul className="space-y-2 text-xs text-gray-300">
                        {features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <Check className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action CRUD Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-surface-200/50">
                      <span className="text-[10px] text-gray-500 font-mono">
                        ID: {pkg.id.slice(0, 8)}...
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(pkg)}
                          className="px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-xs font-semibold text-gray-200 hover:text-white border border-surface-200 flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Edit className="w-3.5 h-3.5 text-brand-400" />
                          Edit Rate
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id, pkg.name)}
                          className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all"
                          title="Delete Package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal for Create / Edit Package */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-xl glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-surface-200/50 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-400" />
                  {editingPkg ? 'Edit Package & Pricing' : 'Create New Package'}
                </h3>
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)} 
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Package Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Starter Package or Diamond VIP"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm focus:outline-none focus:border-brand-500 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Price in INR (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="e.g. 600 or 1200"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-sm font-bold text-brand-300 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Duration, Delivery, Revisions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. Up to 15 Seconds"
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Delivery Time</label>
                    <input
                      type="text"
                      value={formData.deliveryDays}
                      onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                      placeholder="e.g. Delivery in 2 Days"
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Revisions</label>
                    <input
                      type="text"
                      value={formData.revisions}
                      onChange={(e) => setFormData({ ...formData, revisions: e.target.value })}
                      placeholder="e.g. 1 Revision or Unlimited"
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Features Builder */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-surface-100/60 border border-surface-200/80">
                  <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    Package Features & Deliverables ({formData.features.length})
                  </label>

                  {/* Add Feature input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      placeholder="Type a feature and press enter or click Add..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shrink-0 transition-colors"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Current Features List with remove buttons */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 pt-1">
                    {formData.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-200/60 border border-surface-200 text-xs text-gray-200"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Check className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                          <span className="truncate">{feature}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Toggle Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="pkg-popular"
                    checked={formData.popular}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                  />
                  <label htmlFor="pkg-popular" className="text-xs font-semibold text-white cursor-pointer select-none">
                    Highlight as &quot;MOST POPULAR&quot; Package
                  </label>
                </div>

                {/* Modal Footer Actions */}
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
                    disabled={submitting}
                    className="btn-glow px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {editingPkg ? 'Update Package' : 'Create Package'}
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
