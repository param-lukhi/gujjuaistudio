'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  Star, Quote, Plus, Edit, Trash2, X, Loader2, 
  CheckCircle2, AlertCircle, Image as ImageIcon, User 
} from 'lucide-react';

export default function ManageReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRev, setEditingRev] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clientName: '',
    business: '',
    rating: 5,
    comment: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    featured: true,
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenAddModal = () => {
    setEditingRev(null);
    setErrorMsg(null);
    setFormData({
      clientName: '',
      business: '',
      rating: 5,
      comment: '',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      featured: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (rev: any) => {
    setEditingRev(rev);
    setErrorMsg(null);
    setFormData({
      clientName: rev.clientName || '',
      business: rev.business || '',
      rating: rev.rating || 5,
      comment: rev.comment || '',
      avatarUrl: rev.avatarUrl || '',
      featured: Boolean(rev.featured),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.comment.trim()) {
      setErrorMsg('Client name and comment are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (editingRev) {
        const res = await fetch(`/api/reviews/${editingRev.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to update review');
        setSuccessMsg('Review updated successfully!');
      } else {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to add review');
        setSuccessMsg('Testimonial added successfully!');
      }

      setModalOpen(false);
      fetchReviews();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete review from "${name}"?`)) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMsg('Review deleted.');
        fetchReviews();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080B11]">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-200/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Manage Client Reviews & Testimonials</h1>
            <p className="text-xs text-gray-400">Add, edit, or remove client reviews displayed on the website homepage.</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="btn-glow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>

        {/* Feedback Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Reviews Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              <p className="text-xs text-gray-400">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border border-surface-200/50 space-y-3">
              <Quote className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-base font-bold text-white">No Reviews Added Yet</p>
              <p className="text-xs text-gray-400">Click &quot;Add Testimonial&quot; to publish your first client review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="glass-panel p-6 rounded-3xl border border-surface-200/70 space-y-4 flex flex-col justify-between hover:border-brand-500/40 transition-all">
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400 gap-1">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      {rev.featured && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 italic leading-relaxed">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-surface-200/40">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={rev.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={rev.clientName}
                        className="w-9 h-9 rounded-full object-cover border border-brand-500/40 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">{rev.clientName}</h4>
                        <p className="text-[10px] text-brand-400 font-semibold truncate">{rev.business || 'Client'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(rev)}
                        className="p-1.5 rounded-lg bg-surface-100 text-gray-300 hover:text-white transition-colors"
                        title="Edit Review"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rev.id, rev.clientName)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for Add / Edit Review */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-lg glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-surface-200/50 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Quote className="w-5 h-5 text-brand-400" />
                  {editingRev ? 'Edit Review & Testimonial' : 'Add Client Testimonial'}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Brand / Business *</label>
                    <input
                      type="text"
                      value={formData.business}
                      onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                      placeholder="e.g. Royal Gems Ahmedabad"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Star Rating (1 to 5)</label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Avatar Image URL</label>
                    <input
                      type="url"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Client Testimonial / Feedback *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Write client testimonial or feedback here..."
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rev-featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                  />
                  <label htmlFor="rev-featured" className="text-xs font-semibold text-white cursor-pointer select-none">
                    Show as Featured on Homepage
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-200/50">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-100 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-glow px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {editingRev ? 'Save Changes' : 'Publish Review'}
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
