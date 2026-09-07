'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Bell,
  Send,
  Trash2,
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Gift,
  Package,
  Info,
  ExternalLink,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    businessName: string | null;
    role: string;
  };
}

interface UserOption {
  id: string;
  name: string | null;
  email: string | null;
  businessName: string | null;
}

export default function AdminNotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    broadcasts: 0,
    totalUsers: 0,
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    target: 'ALL', // 'ALL' or 'SPECIFIC'
    userId: '',
    title: '',
    message: '',
    type: 'ANNOUNCEMENT',
    link: '',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/notifications?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications || []);
        setUsers(data.users || []);
        if (data.stats) setStats(data.stats);
      } else {
        showToast(data.error || 'Failed to fetch notifications', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/dashboard');
      } else {
        fetchNotifications();
      }
    }
  }, [status, session, typeFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotifications();
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      showToast('Please enter both title and message.', 'error');
      return;
    }
    if (formData.target === 'SPECIFIC' && !formData.userId) {
      showToast('Please select a recipient user.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Notification broadcasted successfully!');
        setShowModal(false);
        setFormData({
          target: 'ALL',
          userId: '',
          title: '',
          message: '',
          type: 'ANNOUNCEMENT',
          link: '',
        });
        fetchNotifications();
      } else {
        showToast(data.error || 'Failed to send notification', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Notification deleted.');
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      } else {
        showToast(data.error || 'Failed to delete notification', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Megaphone className="w-3 h-3" /> Announcement
          </span>
        );
      case 'OFFER':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <Gift className="w-3 h-3" /> Special Offer
          </span>
        );
      case 'ORDER_ACCEPTED':
      case 'ORDER_UPDATE':
      case 'PROJECT_COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Package className="w-3 h-3" /> Order Update
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/30 flex items-center gap-1">
            <Info className="w-3 h-3" /> System Info
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080B11]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 lg:pt-8 space-y-6 sm:space-y-8 overflow-y-auto min-w-0 w-full">
        {/* Toast */}
        {toastMessage && (
          <div
            className={`p-4 rounded-2xl border shadow-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-4 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Top Bar Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-200/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Manage Notifications</h1>
            <p className="text-xs text-gray-400">Broadcast platform updates, promotional deals, and alerts to all registered users or specific clients.</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-glow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            + Send Broadcast
          </button>
        </div>

        {/* Stats KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-surface-200/70 space-y-2">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Sent</span>
            <div className="text-2xl font-black text-white">{stats.total}</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-2">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Unread by Users</span>
            <div className="text-2xl font-black text-amber-300">{stats.unread}</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-brand-500/20 bg-brand-500/5 space-y-2">
            <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider">Broadcast Alerts</span>
            <div className="text-2xl font-black text-brand-300">{stats.broadcasts}</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-accent-cyan/20 bg-accent-cyan/5 space-y-2">
            <span className="text-xs text-accent-cyan font-semibold uppercase tracking-wider">Total Reach (Users)</span>
            <div className="text-2xl font-black text-white">{stats.totalUsers}</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="glass-panel p-4 rounded-2xl border border-surface-200/70 flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, message, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-100/80 border border-surface-200 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-100 border border-surface-200 text-xs text-gray-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Categories</option>
              <option value="ANNOUNCEMENT">Announcements</option>
              <option value="OFFER">Special Offers</option>
              <option value="ORDER_UPDATE">Order Updates</option>
              <option value="INFO">System Info</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-100 border border-surface-200 text-xs text-gray-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Status</option>
              <option value="UNREAD">Unread Only</option>
              <option value="READ">Read Only</option>
            </select>

            <button
              onClick={fetchNotifications}
              className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-300 hover:text-white transition-colors"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-panel py-16 px-4 rounded-3xl border border-surface-200/60 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-100 border border-surface-200 flex items-center justify-center mx-auto text-gray-500">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Notifications Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {search || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'No notifications match your filter criteria.'
                : 'Broadcast your first announcement or special offer to your clients now!'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-glow px-5 py-2.5 rounded-xl text-xs font-bold text-white inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Send Notification
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`glass-panel p-5 rounded-2xl border transition-all hover:border-brand-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  !item.read ? 'border-brand-500/30 bg-brand-500/[0.02]' : 'border-surface-200/60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-100 border border-surface-200/80 flex items-center justify-center shrink-0 mt-0.5 text-brand-400">
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {getTypeBadge(item.type)}
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      {!item.read ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Unread by User
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Read
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">{item.message}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 pt-1">
                      <span>
                        👤 Recipient: <strong className="text-white">{item.user?.name || item.user?.email || 'User'}</strong>
                        {item.user?.businessName && ` (${item.user.businessName})`}
                      </span>
                      <span>•</span>
                      <span>🕒 {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      
                      {item.link && (
                        <>
                          <span>•</span>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 font-semibold"
                          >
                            Target Link <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Broadcast Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-[#0D121F] border border-brand-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl glass-panel space-y-6">
              
              <div className="flex items-center justify-between border-b border-surface-200/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30 text-brand-400 flex items-center justify-center">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Broadcast Notification</h3>
                    <p className="text-xs text-gray-400">Push real-time alert to client notification bell</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-white bg-surface-100 hover:bg-surface-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendNotification} className="space-y-4">
                {/* Target Audience */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Target Audience *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, target: 'ALL', userId: '' })}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        formData.target === 'ALL'
                          ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/20'
                          : 'bg-surface-100/70 text-gray-300 border-surface-200 hover:bg-surface-200'
                      }`}
                    >
                      📢 All Users ({stats.totalUsers})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, target: 'SPECIFIC' })}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        formData.target === 'SPECIFIC'
                          ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/20'
                          : 'bg-surface-100/70 text-gray-300 border-surface-200 hover:bg-surface-200'
                      }`}
                    >
                      👤 Specific User
                    </button>
                  </div>
                </div>

                {/* Specific User Dropdown */}
                {formData.target === 'SPECIFIC' && (
                  <div className="space-y-1.5 animate-in fade-in">
                    <label className="text-xs font-bold text-gray-300">Select Client User *</label>
                    <select
                      required
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="">-- Choose User --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name || 'Unnamed'} ({u.email}) {u.businessName ? `- ${u.businessName}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Notification Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Notification Category *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="ANNOUNCEMENT">📢 Announcement / News</option>
                    <option value="OFFER">🎁 Special Offer / Festive Discount</option>
                    <option value="ORDER_UPDATE">📦 Order / Reel Delivery Update</option>
                    <option value="INFO">ℹ️ General Information</option>
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Notification Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🔥 Navratri Mega Discount on 4K Reels!"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Message Content *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter detailed notification message for clients..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Target Link (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Action Link (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. /book or /pricing or https://..."
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-surface-200/50">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300 bg-surface-100 hover:bg-surface-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-glow px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Broadcasting...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Broadcast Now
                      </>
                    )}
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

