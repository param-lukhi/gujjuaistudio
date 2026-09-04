'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrencyINR } from '@/lib/utils';
import {
  ShoppingBag,
  Search,
  Filter,
  Video,
  Edit,
  ExternalLink,
  Check,
  Trash2,
  X,
  Calendar,
  Clock,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';

const TIME_SLOTS = [
  '10:00 AM - 12:00 PM',
  '01:00 PM - 03:00 PM',
  '04:00 PM - 06:00 PM',
  '07:00 PM - 09:00 PM',
];

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeModalBooking, setActiveModalBooking] = useState<any | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [savingVideo, setSavingVideo] = useState(false);

  // Reschedule Modal for Admin
  const [adminRescheduleTarget, setAdminRescheduleTarget] = useState<any | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editSlot, setEditSlot] = useState(TIME_SLOTS[0]);
  const [savingReschedule, setSavingReschedule] = useState(false);

  // View Details Modal
  const [detailsModalBooking, setDetailsModalBooking] = useState<any | null>(null);

  // Create Booking State
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newBookingForm, setNewBookingForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    businessName: '',
    packageName: '🥈 Professional Package',
    price: 1200,
    bookingDate: new Date().toISOString().split('T')[0],
    bookingTime: TIME_SLOTS[0],
    description: '',
    refLink: '',
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingForm.clientName || !newBookingForm.clientEmail || !newBookingForm.description) {
      setCreateError('Client Name, Email, and Brief description are required.');
      return;
    }

    setCreatingBooking(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBookingForm,
          price: Number(newBookingForm.price),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');

      setCreateModalOpen(false);
      setNewBookingForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        businessName: '',
        packageName: '🥈 Professional Package',
        price: 1200,
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: TIME_SLOTS[0],
        description: '',
        refLink: '',
      });
      fetchBookings();
    } catch (err: any) {
      console.error(err);
      setCreateError(err.message || 'Error creating booking');
    } finally {
      setCreatingBooking(false);
    }
  };

  const handleSaveVideoUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalBooking) return;

    setSavingVideo(true);
    try {
      const res = await fetch(`/api/bookings/${activeModalBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          finalVideoUrl: videoUrlInput,
        }),
      });
      if (res.ok) {
        setActiveModalBooking(null);
        setVideoUrlInput('');
        fetchBookings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingVideo(false);
    }
  };

  const handleSaveAdminReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminRescheduleTarget || !editDate || !editSlot) return;

    setSavingReschedule(true);
    try {
      const res = await fetch(`/api/bookings/${adminRescheduleTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingDate: editDate,
          bookingTime: editSlot,
        }),
      });
      if (res.ok) {
        setAdminRescheduleTarget(null);
        fetchBookings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingReschedule(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this booking record?')) return;
    try {
      await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;
    const matchesQuery =
      (b.bookingRef || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.clientEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.packageName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="flex min-h-screen bg-[#080B11]">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-screen">
        
        {/* Header with Create Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-200/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Client Bookings & Orders</h1>
            <p className="text-xs text-gray-400">
              Create bookings, manage statuses, update schedules, and upload deliverable video URLs.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCreateError(null);
                setCreateModalOpen(true);
              }}
              className="btn-glow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </button>
            <button
              onClick={fetchBookings}
              className="px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-xs font-bold text-gray-300 hover:text-white transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="glass-panel p-5 rounded-2xl border border-surface-200/70 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Ref, Client, Email, Package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
            {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedStatus === st
                    ? 'bg-brand-600 text-white border-brand-400 shadow-md shadow-brand-500/20'
                    : 'bg-surface-100 text-gray-400 border-surface-200 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-200/70 space-y-4">
          {loading ? (
            <p className="text-xs text-gray-400 text-center py-8">Loading bookings from database...</p>
          ) : filteredBookings.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No booking records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-surface-100/60 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-surface-200/60">
                  <tr>
                    <th className="p-3.5">Ref ID</th>
                    <th className="p-3.5">Client & Business</th>
                    <th className="p-3.5">Service & Price</th>
                    <th className="p-3.5">Scheduled Slot</th>
                    <th className="p-3.5">Status & Action</th>
                    <th className="p-3.5 text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200/40 font-medium">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-100/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-brand-400 whitespace-nowrap">
                        {b.bookingRef}
                        <div className="text-[10px] text-gray-500 font-sans font-normal">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      
                      <td className="p-3.5 space-y-0.5 min-w-[160px]">
                        <div className="text-white font-bold">{b.clientName}</div>
                        {b.businessName && <div className="text-[10px] text-brand-300 font-medium">{b.businessName}</div>}
                        <div className="text-[10px] font-mono text-gray-400 truncate max-w-[180px]">
                          {b.clientEmail}
                        </div>
                        <div className="text-[10px] text-gray-400">{b.clientPhone}</div>
                      </td>

                      <td className="p-3.5 space-y-0.5 min-w-[140px]">
                        <div className="text-gray-200 font-bold">{b.packageName}</div>
                        <div className="text-brand-400 font-black">{formatCurrencyINR(b.price)}</div>
                      </td>

                      <td className="p-3.5 space-y-1 min-w-[140px]">
                        <div className="flex items-center gap-1 text-white font-bold">
                          <Calendar className="w-3.5 h-3.5 text-brand-400" />
                          {b.bookingDate || 'Scheduled Soon'}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-accent-cyan font-semibold">
                          <Clock className="w-3 h-3" />
                          {b.bookingTime || 'Flexible'}
                        </div>
                      </td>

                      <td className="p-3.5 space-y-2 min-w-[140px]">
                        <StatusBadge status={b.status} />
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="w-full text-[10px] bg-surface-100 border border-surface-200 text-white rounded-lg p-1.5 font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {/* View details */}
                        <button
                          onClick={() => setDetailsModalBooking(b)}
                          className="p-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-300 hover:text-white transition-all"
                          title="View Brief & Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Reschedule */}
                        <button
                          onClick={() => {
                            setAdminRescheduleTarget(b);
                            setEditDate(b.bookingDate || new Date().toISOString().split('T')[0]);
                            setEditSlot(b.bookingTime || TIME_SLOTS[0]);
                          }}
                          className="p-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 transition-all"
                          title="Reschedule / Edit Date"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {/* Attach deliverable */}
                        <button
                          onClick={() => {
                            setActiveModalBooking(b);
                            setVideoUrlInput(b.finalVideoUrl || '');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-all inline-flex items-center gap-1"
                          title="Attach Deliverable Video"
                        >
                          <Video className="w-3 h-3" />
                          Deliver
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Manual Booking Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-xl glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-surface-200/50 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-brand-400" />
                  Create Manual / Offline Booking
                </h3>
                <button 
                  type="button"
                  onClick={() => setCreateModalOpen(false)} 
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={newBookingForm.clientName}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, clientName: e.target.value })}
                      placeholder="e.g. Ramesh Bhai"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Client Email *</label>
                    <input
                      type="email"
                      required
                      value={newBookingForm.clientEmail}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, clientEmail: e.target.value })}
                      placeholder="e.g. ramesh@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Business / Brand Name</label>
                    <input
                      type="text"
                      value={newBookingForm.businessName}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, businessName: e.target.value })}
                      placeholder="e.g. Shree Jewellers"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Phone Number</label>
                    <input
                      type="text"
                      value={newBookingForm.clientPhone}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, clientPhone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Package Name</label>
                    <input
                      type="text"
                      value={newBookingForm.packageName}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, packageName: e.target.value })}
                      placeholder="e.g. Professional Package"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Price in INR (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newBookingForm.price}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs font-bold text-brand-400 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Booking Date *</label>
                    <input
                      type="date"
                      required
                      value={newBookingForm.bookingDate}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, bookingDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Time Slot *</label>
                    <select
                      value={newBookingForm.bookingTime}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, bookingTime: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    >
                      {TIME_SLOTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Brief / Requirements *</label>
                  <textarea
                    rows={3}
                    required
                    value={newBookingForm.description}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, description: e.target.value })}
                    placeholder="Describe product and reel requirements..."
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-200/50">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-100 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingBooking}
                    className="btn-glow px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {creatingBooking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Create Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Video Link Modal */}
        {activeModalBooking && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 space-y-5 bg-[#0D121F]">
              
              <div className="flex items-center justify-between border-b border-surface-200/50 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-brand-400" />
                  Attach Completed Video Deliverable
                </h3>
                <button onClick={() => setActiveModalBooking(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-gray-300">
                Attaching a video URL will automatically mark booking <strong className="text-brand-300">{activeModalBooking.bookingRef}</strong> as <span className="text-emerald-400 font-bold">COMPLETED</span> and make it available in the client's dashboard.
              </div>

              <form onSubmit={handleSaveVideoUrl} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Final Video URL (Cloudinary, YouTube, Vimeo, or Google Drive)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://res.cloudinary.com/... or Drive link"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalBooking(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-surface-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingVideo}
                    className="btn-glow px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-brand-500/25"
                  >
                    {savingVideo ? 'Saving...' : 'Save & Complete'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Admin Reschedule Modal */}
        {adminRescheduleTarget && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleSaveAdminReschedule}
              className="glass-panel bg-[#0D121F] border border-brand-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95"
            >
              <div className="flex items-center justify-between border-b border-surface-200/50 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-brand-400" />
                  Admin Reschedule: {adminRescheduleTarget.bookingRef}
                </h3>
                <button type="button" onClick={() => setAdminRescheduleTarget(null)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Set Booking Date</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Set Time Slot</label>
                  <select
                    value={editSlot}
                    onChange={(e) => setEditSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs font-semibold"
                  >
                    {TIME_SLOTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdminRescheduleTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-surface-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReschedule}
                  className="btn-glow px-5 py-2 rounded-xl text-xs font-bold text-white"
                >
                  {savingReschedule ? 'Saving...' : 'Update Schedule'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View Details Modal */}
        {detailsModalBooking && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel bg-[#0D121F] border border-surface-200/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4">
              <div className="flex items-center justify-between border-b border-surface-200/50 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{detailsModalBooking.packageName}</h3>
                  <span className="font-mono text-xs text-brand-400">{detailsModalBooking.bookingRef}</span>
                </div>
                <button onClick={() => setDetailsModalBooking(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-gray-300 font-semibold">
                  <strong>Client:</strong> {detailsModalBooking.clientName} ({detailsModalBooking.clientEmail} • {detailsModalBooking.clientPhone})
                </p>
                <p className="text-gray-300">
                  <strong>Business:</strong> {detailsModalBooking.businessName || '—'}
                </p>
                <p className="text-gray-300">
                  <strong>Date & Slot:</strong> {detailsModalBooking.bookingDate} ({detailsModalBooking.bookingTime})
                </p>
                <div className="p-3 bg-surface-100 rounded-xl space-y-1 mt-2">
                  <span className="text-gray-400 font-bold block">Brief & Requirements:</span>
                  <p className="text-gray-200 whitespace-pre-wrap">{detailsModalBooking.description}</p>
                </div>

                {detailsModalBooking.refLink && (
                  <div className="pt-1">
                    <span className="text-gray-400 font-bold block">Reference URL:</span>
                    <a href={detailsModalBooking.refLink} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline break-all">
                      {detailsModalBooking.refLink}
                    </a>
                  </div>
                )}
              </div>

              <button
                onClick={() => setDetailsModalBooking(null)}
                className="w-full py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
