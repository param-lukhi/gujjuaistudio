'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrencyINR } from '@/lib/utils';
import {
  CalendarCheck,
  Calendar,
  Clock,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  ExternalLink,
  Video,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Check,
  X
} from 'lucide-react';

const TIME_SLOTS = [
  '10:00 AM - 12:00 PM',
  '01:00 PM - 03:00 PM',
  '04:00 PM - 06:00 PM',
  '07:00 PM - 09:00 PM',
];

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<any | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<any | null>(null);

  // Reschedule Form State
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState(TIME_SLOTS[0]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle Cancel Booking
  const handleConfirmCancel = async () => {
    if (!cancelBookingTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${cancelBookingTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Booking successfully cancelled.' });
        setCancelBookingTarget(null);
        fetchBookings();
      } else {
        const d = await res.json();
        setActionMessage({ type: 'error', text: d.error || 'Failed to cancel booking.' });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reschedule Booking
  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleBooking || !newDate || !newSlot) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${rescheduleBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingDate: newDate,
          bookingTime: newSlot,
        }),
      });

      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Booking rescheduled successfully!' });
        setRescheduleBooking(null);
        fetchBookings();
      } else {
        const d = await res.json();
        setActionMessage({ type: 'error', text: d.error || 'Failed to reschedule booking.' });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setActionLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    const matchesTab = activeTab === 'ALL' || b.status.toUpperCase() === activeTab;
    const matchesSearch =
      b.bookingRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.packageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabCounts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS').length,
    COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-brand-400 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">My Bookings</h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Track your scheduled AI reel sessions, reschedule dates, or view delivery status.
              </p>
            </div>
          </div>

          <Link
            href="/book"
            className="btn-glow px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/25 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-brand-300" />
            Book New Service
          </Link>
        </div>

        {/* Action alert */}
        {actionMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in ${
              actionMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Controls: Filter Tabs & Search */}
        <div className="glass-panel p-4 rounded-2xl border border-surface-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Bookings' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'CONFIRMED', label: 'Confirmed' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((tab) => {
              const count = tabCounts[tab.id as keyof typeof tabCounts] || 0;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? 'bg-brand-600/40 text-white border border-brand-500/50 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-brand-500 text-white' : 'bg-surface-100 text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-100 border border-surface-200 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-36 bg-surface-100/40 rounded-3xl animate-pulse border border-surface-200/50" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-surface-200/80 text-center space-y-4">
            <CalendarCheck className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {searchQuery || activeTab !== 'ALL'
                ? 'No bookings match your selected filter or search criteria.'
                : "You haven't booked any AI reel sessions yet. Book your first one today!"}
            </p>
            <Link
              href="/book"
              className="btn-glow inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-brand-500/25"
            >
              <PlusCircle className="w-4 h-4" /> Book Service Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const isCancellable = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
              const isReschedulable = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

              return (
                <div
                  key={booking.id}
                  className="glass-panel p-5 sm:p-6 rounded-3xl border border-surface-200/80 hover:border-brand-500/30 transition-all duration-200 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-surface-200/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-xs shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-sm sm:text-base">
                            {booking.packageName || 'AI Product Reel'}
                          </h3>
                          <span className="text-[11px] font-mono text-gray-400 bg-surface-100 px-2 py-0.5 rounded-lg border border-surface-200">
                            {booking.bookingRef}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Created on {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <StatusBadge status={booking.status} />
                      <span className="font-black text-brand-400 text-sm sm:text-base">
                        {formatCurrencyINR(booking.price)}
                      </span>
                    </div>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-surface-100/40 p-3.5 rounded-2xl border border-surface-200/40">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Estimated Delivery</span>
                      <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {booking.deliveryRequirement || '2–3 Working Days'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Delivery Platform</span>
                      <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                        <Video className="w-3.5 h-3.5 text-accent-cyan" />
                        {booking.deliveryPlatform || 'WhatsApp'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Client Name</span>
                      <span className="font-bold text-white truncate block mt-0.5">
                        {booking.clientName}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Final Deliverable</span>
                      {booking.finalVideoUrl ? (
                        <a
                          href={booking.finalVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Video className="w-3.5 h-3.5" /> Watch Video
                        </a>
                      ) : (
                        <span className="text-gray-500 italic mt-0.5 block">In Production</span>
                      )}
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>

                    <div className="flex items-center gap-2">
                      {isReschedulable && (
                        <button
                          onClick={() => {
                            setRescheduleBooking(booking);
                            setNewDate(booking.bookingDate || minDate);
                            setNewSlot(booking.bookingTime || TIME_SLOTS[0]);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-xs font-bold text-brand-300 flex items-center gap-1.5 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reschedule
                        </button>
                      )}

                      {isCancellable && (
                        <button
                          onClick={() => setCancelBookingTarget(booking)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-400 flex items-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-[#0D121F] border border-surface-200/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-surface-200/50 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedBooking.packageName}</h3>
                <span className="font-mono text-xs text-brand-400">{selectedBooking.bookingRef}</span>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-xl bg-surface-100 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-surface-200/30">
                <span className="text-gray-400">Status:</span>
                <StatusBadge status={selectedBooking.status} />
              </div>
              <div className="flex justify-between py-1 border-b border-surface-200/30">
                <span className="text-gray-400">Payment Status:</span>
                <span className={`px-2 py-0.5 rounded-lg font-bold text-[11px] ${
                  selectedBooking.paymentStatus === 'PAID'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : selectedBooking.paymentStatus === 'PENDING_VERIFICATION'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {selectedBooking.paymentStatus === 'PAID' ? '✓ PAID' : selectedBooking.paymentStatus === 'PENDING_VERIFICATION' ? '⏳ UNDER VERIFICATION' : 'UNPAID'}
                </span>
              </div>
              {selectedBooking.paymentRef && (
                <div className="flex justify-between py-1 border-b border-surface-200/30">
                  <span className="text-gray-400">UPI Ref / UTR:</span>
                  <span className="font-mono font-bold text-brand-300">{selectedBooking.paymentRef}</span>
                </div>
              )}
              {selectedBooking.paymentProof && (
                <div className="py-2 border-b border-surface-200/30">
                  <span className="text-gray-400 block mb-1">Payment Receipt / Screenshot:</span>
                  <a
                    href={selectedBooking.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:underline font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Uploaded Screenshot
                  </a>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-surface-200/30">
                <span className="text-gray-400">Order Placed:</span>
                <span className="font-bold text-white">{new Date(selectedBooking.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-200/30">
                <span className="text-gray-400">Estimated Delivery:</span>
                <span className="font-bold text-amber-300">{selectedBooking.deliveryRequirement || '2–3 Working Days'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-200/30">
                <span className="text-gray-400">Delivery Platform:</span>
                <span className="font-bold text-white">{selectedBooking.deliveryPlatform || 'WhatsApp'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-200/30">
                <span className="text-gray-400">Price:</span>
                <span className="font-black text-brand-400">{formatCurrencyINR(selectedBooking.price)}</span>
              </div>

              {selectedBooking.websiteUrl && (
                <div className="flex justify-between py-1 border-b border-surface-200/30">
                  <span className="text-gray-400">Website / Profile:</span>
                  <a href={selectedBooking.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-brand-300 hover:underline truncate max-w-[200px]">
                    {selectedBooking.websiteUrl}
                  </a>
                </div>
              )}

              {selectedBooking.targetPlatforms && (
                <div className="py-1 border-b border-surface-200/30">
                  <span className="text-gray-400 block mb-1">Target Publishing Platforms:</span>
                  <span className="font-bold text-white">
                    {Array.isArray(selectedBooking.targetPlatforms)
                      ? selectedBooking.targetPlatforms.join(', ')
                      : selectedBooking.targetPlatforms}
                  </span>
                </div>
              )}

              {selectedBooking.deliveryPlatform && (
                <div className="flex justify-between py-1 border-b border-surface-200/30">
                  <span className="text-gray-400">Reel Delivery Platform:</span>
                  <span className="font-bold text-white">
                    {selectedBooking.deliveryPlatform === 'Other' && selectedBooking.deliveryPlatformOther
                      ? `Other (${selectedBooking.deliveryPlatformOther})`
                      : selectedBooking.deliveryPlatform}
                  </span>
                </div>
              )}

              {(selectedBooking.videoFormat || selectedBooking.videoStyle) && (
                <div className="flex justify-between py-1 border-b border-surface-200/30">
                  <span className="text-gray-400">Format & Style:</span>
                  <span className="font-bold text-white text-right">
                    {selectedBooking.videoFormat || '9:16 Vertical'} • {selectedBooking.videoStyle || 'Cinematic AI'}
                  </span>
                </div>
              )}

              <div className="py-2">
                <span className="text-gray-400 block mb-1">Product Description / Requirements:</span>
                <p className="bg-surface-100 p-3 rounded-xl text-gray-300 whitespace-pre-wrap">
                  {selectedBooking.description}
                </p>
              </div>

              {selectedBooking.additionalInstructions && (
                <div className="py-2">
                  <span className="text-gray-400 block mb-1">Additional Instructions:</span>
                  <p className="bg-surface-100/60 p-3 rounded-xl text-gray-300 italic">
                    {selectedBooking.additionalInstructions}
                  </p>
                </div>
              )}

              {selectedBooking.refLink && (
                <div className="py-1">
                  <span className="text-gray-400 block mb-1">Reference Link:</span>
                  <a
                    href={selectedBooking.refLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:underline break-all"
                  >
                    {selectedBooking.refLink}
                  </a>
                </div>
              )}

              {selectedBooking.imageUrls && Array.isArray(selectedBooking.imageUrls) && selectedBooking.imageUrls.length > 0 && (
                <div className="py-2 border-t border-surface-200/30">
                  <span className="text-gray-400 block mb-1.5">Attached Assets ({selectedBooking.imageUrls.length}):</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.imageUrls.map((url: string, idx: number) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="asset" className="w-12 h-12 object-cover rounded-lg border border-surface-200 hover:scale-105 transition-transform" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.finalVideoUrl && (
                <div className="py-2 border-t border-surface-200/50">
                  <span className="text-emerald-400 font-bold block mb-1">🎉 Completed Deliverable:</span>
                  <a
                    href={selectedBooking.finalVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glow px-4 py-2 rounded-xl text-xs font-bold text-white inline-flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" /> Watch Final Video Reel
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-xs font-bold text-white transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReschedule}
            className="glass-panel bg-[#0D121F] border border-brand-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-surface-200/50 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-brand-400" />
                <h3 className="text-base font-bold text-white">Reschedule Booking</h3>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleBooking(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">New Booking Date</label>
                <input
                  type="date"
                  min={minDate}
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Select New Time Slot</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setNewSlot(slot)}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                        newSlot === slot
                          ? 'bg-brand-600/30 border-brand-400 text-white font-bold'
                          : 'bg-surface-100 border-surface-200 text-gray-400'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-surface-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="btn-glow px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-brand-500/25"
              >
                {actionLoading ? 'Saving...' : 'Confirm Reschedule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelBookingTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-[#0D121F] border border-rose-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Cancel This Booking?</h3>
              <p className="text-xs text-gray-400 mt-1">
                Are you sure you want to cancel booking <strong className="text-white">{cancelBookingTarget.bookingRef}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setCancelBookingTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-surface-100"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30"
              >
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
