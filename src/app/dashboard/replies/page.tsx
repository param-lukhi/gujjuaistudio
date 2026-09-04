'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/providers/ToastProvider';
import {
  MailCheck,
  Search,
  CheckCircle2,
  Trash2,
  CornerUpLeft,
  Clock,
  ShieldCheck,
  Send,
  Sparkles
} from 'lucide-react';

export default function RepliesPage() {
  const { showToast } = useToast();
  const [replies, setReplies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchReplies();
  }, []);

  const fetchReplies = async () => {
    try {
      const res = await fetch('/api/replies');
      if (res.ok) {
        const data = await res.json();
        setReplies(data.replies || []);
      }
    } catch (e) {
      console.error('Failed to load replies:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/replies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });
      if (res.ok) {
        showToast('Marked message as read', 'info');
        fetchReplies();
      }
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    try {
      const res = await fetch(`/api/replies?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Conversation deleted', 'success');
        fetchReplies();
      }
    } catch (e) {
      showToast('Failed to delete conversation', 'error');
    }
  };

  const handleSendReply = (replyId: string) => {
    if (!replyText.trim()) return;
    showToast('Reply dispatched to admin!', 'success');
    setReplyingToId(null);
    setReplyText('');
  };

  const filteredReplies = replies.filter((r) =>
    (r.subject + ' ' + r.message).toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = replies.filter((r) => !r.read).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-surface-100/50 rounded-3xl" />
          <div className="h-40 bg-surface-100/50 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center relative">
              <MailCheck className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Admin Replies Inbox
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/40">
                    {unreadCount} Unread
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-400">View official support replies and technical notifications from Gujju AI staff.</p>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full bg-surface-100/80 border border-surface-200 focus:border-brand-500 rounded-xl py-2 px-3.5 pl-9 text-xs text-white placeholder-gray-500 outline-none"
            />
          </div>
        </div>

        {/* Replies List */}
        {filteredReplies.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-surface-200/80 text-center space-y-3">
            <MailCheck className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Admin Replies Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              When the support team replies to your contact messages or order inquiries, responses will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReplies.map((reply) => (
              <div
                key={reply.id}
                className={`glass-panel p-6 rounded-3xl border transition-all space-y-4 ${
                  !reply.read
                    ? 'border-brand-500/60 bg-gradient-to-r from-brand-950/30 to-surface-100/40 shadow-lg shadow-brand-500/10'
                    : 'border-surface-200/80 opacity-90'
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-400" />
                      <span className="text-xs font-extrabold text-brand-300">Gujju AI Support Team</span>
                      {!reply.read && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500 text-white animate-pulse">
                          UNREAD
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-white">{reply.subject}</h3>
                  </div>

                  <span className="text-[11px] text-gray-400 font-mono">
                    {new Date(reply.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-gray-200 leading-relaxed bg-surface-100/60 p-4 rounded-2xl border border-surface-200/50 whitespace-pre-wrap">
                  {reply.message}
                </p>

                {/* Reply Form */}
                {replyingToId === reply.id && (
                  <div className="p-4 rounded-2xl bg-brand-950/60 border border-brand-500/40 space-y-3 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-white">Write response to admin:</label>
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your message reply..."
                      className="w-full bg-surface-100/90 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendReply(reply.id)}
                        className="btn-glow px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Send Reply
                      </button>
                      <button
                        onClick={() => setReplyingToId(null)}
                        className="px-4 py-2 rounded-xl bg-surface-100 text-xs font-semibold text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Row */}
                <div className="flex items-center justify-between pt-1 border-t border-surface-200/40 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {!reply.read && (
                      <button
                        onClick={() => handleMarkAsRead(reply.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Read
                      </button>
                    )}

                    <button
                      onClick={() => setReplyingToId(replyingToId === reply.id ? null : reply.id)}
                      className="px-3 py-1.5 rounded-xl bg-brand-600/30 hover:bg-brand-600/50 border border-brand-500/40 text-xs font-bold text-white flex items-center gap-1 transition-all"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5 text-brand-400" /> Reply
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(reply.id)}
                    className="p-2 rounded-xl hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-all"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
