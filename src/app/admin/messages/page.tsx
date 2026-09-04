'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  MessageSquare, Mail, Clock, CheckCircle2, Trash2, 
  Search, Filter, Plus, X, Loader2, AlertCircle, 
  Eye, RefreshCw, Send, Check
} from 'lucide-react';

export default function ManageMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeMsg, setActiveMsg] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Message Form
  const [newForm, setNewForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.email || !newForm.message) {
      setErrorMsg('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });

      if (!res.ok) throw new Error('Failed to create message');

      setSuccessMsg('Message created successfully!');
      setModalOpen(false);
      setNewForm({ name: '', email: '', subject: '', message: '' });
      fetchMessages();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, senderName: string) => {
    if (!confirm(`Permanently delete message inquiry from "${senderName}"?`)) return;

    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMsg('Message deleted successfully.');
        fetchMessages();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesStatus = statusFilter === 'ALL' || msg.status === statusFilter;
    const matchesSearch =
      (msg.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (msg.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (msg.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (msg.message || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#080B11]">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-200/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Contact Messages & Inquiries</h1>
            <p className="text-xs text-gray-400">
              Manage client inquiries, update response status, reply directly, or record new contact leads.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setErrorMsg(null);
                setNewForm({ name: '', email: '', subject: '', message: '' });
                setModalOpen(true);
              }}
              className="btn-glow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              New Inquiry
            </button>
            <button
              onClick={fetchMessages}
              className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-300 hover:text-white transition-colors"
              title="Refresh List"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-surface-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sender, email, subject, text..."
              className="w-full bg-surface-100/80 border border-surface-200 focus:border-brand-500 rounded-xl py-2 px-3.5 pl-9 text-xs text-white placeholder-gray-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-gray-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-brand-400" />
              Status:
            </span>
            {['ALL', 'UNREAD', 'READ', 'REPLIED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  statusFilter === st
                    ? 'bg-brand-600 text-white border-brand-400 shadow-sm'
                    : 'bg-surface-100 text-gray-400 border-surface-200 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              <p className="text-xs text-gray-400">Loading inquiries...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-surface-200/80 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Messages Found</h3>
              <p className="text-xs text-gray-400">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((msg) => {
                const isUnread = msg.status === 'UNREAD';
                const isReplied = msg.status === 'REPLIED';

                return (
                  <div
                    key={msg.id}
                    className={`glass-panel p-6 rounded-2xl border transition-all space-y-4 ${
                      isUnread
                        ? 'border-brand-500/50 bg-brand-950/20'
                        : isReplied
                        ? 'border-emerald-500/30 bg-surface-50/50'
                        : 'border-surface-200/70 hover:border-surface-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          isUnread
                            ? 'bg-brand-600 text-white'
                            : 'bg-surface-200 text-gray-300'
                        }`}>
                          {msg.name ? msg.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{msg.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isUnread
                                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                                : isReplied
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-surface-200 text-gray-400 border border-surface-200'
                            }`}>
                              {msg.status || 'UNREAD'}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-gray-400">{msg.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {new Date(msg.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>

                        <button
                          onClick={() => handleDelete(msg.id, msg.name)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                          title="Delete Message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-brand-400">
                      Subject: {msg.subject || 'General Inquiry'}
                    </div>

                    <p className="text-xs text-gray-200 bg-surface-100/60 p-4 rounded-xl border border-surface-200/50 leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-surface-200/40">
                      {/* Status changer buttons */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-semibold">Mark status:</span>
                        <button
                          onClick={() => handleUpdateStatus(msg.id, 'UNREAD')}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            msg.status === 'UNREAD'
                              ? 'bg-brand-600 text-white border-brand-400'
                              : 'bg-surface-100 text-gray-400 border-surface-200 hover:text-white'
                          }`}
                        >
                          Unread
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(msg.id, 'READ')}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            msg.status === 'READ'
                              ? 'bg-amber-600 text-white border-amber-400'
                              : 'bg-surface-100 text-gray-400 border-surface-200 hover:text-white'
                          }`}
                        >
                          Read
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(msg.id, 'REPLIED')}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            msg.status === 'REPLIED'
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-surface-100 text-gray-400 border-surface-200 hover:text-white'
                          }`}
                        >
                          Replied
                        </button>
                      </div>

                      {/* Reply button */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Gujju AI Studio Inquiry')}`}
                          onClick={() => handleUpdateStatus(msg.id, 'REPLIED')}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Reply via Email
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal for Create New Message / Lead */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-lg glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-surface-200/50 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-400" />
                  Record New Contact Inquiry
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

              <form onSubmit={handleCreateMessage} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Client / Sender Name *</label>
                    <input
                      type="text"
                      required
                      value={newForm.name}
                      onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                      placeholder="e.g. Priyesh Shah"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Sender Email *</label>
                    <input
                      type="email"
                      required
                      value={newForm.email}
                      onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                      placeholder="e.g. priyesh@brand.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Subject</label>
                  <input
                    type="text"
                    value={newForm.subject}
                    onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })}
                    placeholder="e.g. AI Fashion Reel Inquiry"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Inquiry Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={newForm.message}
                    onChange={(e) => setNewForm({ ...newForm, message: e.target.value })}
                    placeholder="Write details of the inquiry..."
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 resize-none"
                  />
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
                    Save Inquiry
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
