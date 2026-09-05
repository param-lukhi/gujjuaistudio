'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  MessageSquare, Mail, Clock, CheckCircle2, Trash2, 
  Search, Filter, Plus, X, Loader2, AlertCircle, 
  Eye, RefreshCw, Send, Check, MessageCircle, ArrowLeft,
  Sparkles, PhoneCall, ExternalLink, CheckCheck
} from 'lucide-react';

export default function ManageMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals & Chat Drawer
  const [modalOpen, setModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [activeMsg, setActiveMsg] = useState<any | null>(null);
  
  // Chat Reply State
  const [replyText, setReplyText] = useState('');
  const [sendEmailCopy, setSendEmailCopy] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

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
      
      // If a chat drawer is open, refresh activeMsg
      if (activeMsg) {
        const refreshed = (Array.isArray(data) ? data : []).find((m: any) => m.id === activeMsg.id);
        if (refreshed) setActiveMsg(refreshed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (chatModalOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatModalOpen, activeMsg]);

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
        if (activeMsg?.id === id) {
          setChatModalOpen(false);
          setActiveMsg(null);
        }
        fetchMessages();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send Reply in WhatsApp/Instagram Style Chat View
  const handleSendChatReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !activeMsg) return;

    setSendingReply(true);
    setChatError(null);

    try {
      const res = await fetch(`/api/contact/${activeMsg.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyText: replyText.trim(),
          sendEmailNotification: sendEmailCopy,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reply');

      setReplyText('');
      setSuccessMsg(`Reply sent to ${activeMsg.name}!`);
      setTimeout(() => setSuccessMsg(null), 3000);

      // Refresh active message with new replies
      fetchMessages();
    } catch (err: any) {
      setChatError(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
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

  const getParsedReplies = (msg: any): any[] => {
    if (!msg?.replies) return [];
    try {
      const parsed = JSON.parse(msg.replies);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080B11]">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-200/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Client Messages & Inquiries</h1>
            <p className="text-xs text-gray-400">
              Manage client inquiries, view WhatsApp-style chat conversations, send email replies, and track response statuses.
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
                const repliesList = getParsedReplies(msg);
                const hasReplies = repliesList.length > 0;

                // Extract phone number for WhatsApp action
                const rawPhone = (msg.email + ' ' + msg.message).replace(/[^0-9]/g, '');
                const isPhoneAvailable = rawPhone.length >= 10;
                const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone.startsWith('91') ? rawPhone : `91${rawPhone.slice(-10)}`;

                return (
                  <div
                    key={msg.id}
                    className={`glass-panel p-6 rounded-3xl border transition-all space-y-4 ${
                      isUnread
                        ? 'border-brand-500/60 bg-brand-950/25 shadow-lg shadow-brand-500/10'
                        : isReplied
                        ? 'border-emerald-500/30 bg-surface-50/40'
                        : 'border-surface-200/70 hover:border-surface-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                          isUnread
                            ? 'bg-gradient-to-tr from-brand-600 to-accent-cyan text-white shadow-brand-500/30'
                            : isReplied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-surface-200 text-gray-300'
                        }`}>
                          {msg.name ? msg.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{msg.name}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isUnread
                                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                                : isReplied
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-surface-200 text-gray-400 border border-surface-200'
                            }`}>
                              {msg.status || 'UNREAD'}
                            </span>
                            {hasReplies && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                                <CheckCheck className="w-3 h-3" />
                                {repliesList.length} {repliesList.length === 1 ? 'Reply' : 'Replies'}
                              </span>
                            )}
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

                    <div className="text-xs font-bold text-brand-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Subject: {msg.subject || 'General Inquiry'}
                    </div>

                    {/* Message Body */}
                    <p className="text-xs text-gray-200 bg-surface-100/70 p-4 rounded-2xl border border-surface-200/50 leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>

                    {/* Latest Reply Preview (If present) */}
                    {hasReplies && (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                          <span className="flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5" />
                            Latest Admin Reply:
                          </span>
                          <span className="text-gray-400 font-normal text-[10px]">
                            {new Date(repliesList[repliesList.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 italic">
                          "{repliesList[repliesList.length - 1].text}"
                        </p>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-200/40">
                      {/* Status changer buttons */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 font-semibold mr-1">Status:</span>
                        <button
                          onClick={() => handleUpdateStatus(msg.id, 'UNREAD')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                            msg.status === 'UNREAD'
                              ? 'bg-brand-600 text-white border-brand-400 shadow-sm'
                              : 'bg-surface-100 text-gray-400 border-surface-200 hover:text-white'
                          }`}
                        >
                          Unread
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(msg.id, 'READ')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                            msg.status === 'READ'
                              ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                              : 'bg-surface-100 text-gray-400 border-surface-200 hover:text-white'
                          }`}
                        >
                          Read
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(msg.id, 'REPLIED')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                            msg.status === 'REPLIED'
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                              : 'bg-surface-100 text-gray-400 border-surface-200 hover:text-white'
                          }`}
                        >
                          Replied
                        </button>
                      </div>

                      {/* Reply button actions */}
                      <div className="flex items-center gap-2">
                        {/* WhatsApp Direct Action */}
                        {isPhoneAvailable && (
                          <a
                            href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(`Hi ${msg.name}, thank you for reaching out to Gujju AI Studio regarding "${msg.subject || 'AI Video Ads'}". How can we assist you?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleUpdateStatus(msg.id, 'REPLIED')}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center gap-1.5 shadow-sm transition-all"
                            title="Open WhatsApp chat with user"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.417 0-8.002 3.584-8.003 8.001 0 1.41.368 2.784 1.066 3.994l-1.134 4.14 4.239-1.112c1.172.64 2.497.978 3.829.979h.003c4.418 0 8.003-3.585 8.003-8.003 0-4.417-3.585-8-8.003-8z" />
                            </svg>
                            WhatsApp
                          </a>
                        )}

                        {/* Open WhatsApp / Instagram Style Chat Modal */}
                        <button
                          onClick={() => {
                            setActiveMsg(msg);
                            setReplyText('');
                            setChatError(null);
                            setChatModalOpen(true);
                            if (msg.status === 'UNREAD') {
                              handleUpdateStatus(msg.id, 'READ');
                            }
                          }}
                          className="btn-glow px-4 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Chat / Reply View
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 💬 WHATSAPP / INSTAGRAM STYLE CHAT DRAWER & CONVERSATION MODAL */}
        {chatModalOpen && activeMsg && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden">
            <div className="w-full max-w-2xl h-[90vh] max-h-[750px] bg-[#0A0E17] rounded-3xl border border-surface-200/80 shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
              
              {/* Chat Header (WhatsApp / IG Style) */}
              <div className="p-4 bg-surface-100/90 border-b border-surface-200/70 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand-600 to-accent-cyan text-white font-black text-sm flex items-center justify-center shadow-md">
                      {activeMsg.name ? activeMsg.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A0E17]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-white">{activeMsg.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeMsg.status === 'UNREAD'
                          ? 'bg-brand-500/20 text-brand-300'
                          : activeMsg.status === 'REPLIED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-surface-200 text-gray-400'
                      }`}>
                        {activeMsg.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono flex items-center gap-2">
                      <span>{activeMsg.email}</span>
                      <span>•</span>
                      <span className="text-brand-400">{activeMsg.subject || 'Inquiry'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* WhatsApp Shortcut */}
                  <a
                    href={`https://wa.me/919925263558?text=${encodeURIComponent(`Hi ${activeMsg.name}, responding to your inquiry with Gujju AI Studio.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] transition-colors"
                    title="Open in WhatsApp"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.417 0-8.002 3.584-8.003 8.001 0 1.41.368 2.784 1.066 3.994l-1.134 4.14 4.239-1.112c1.172.64 2.497.978 3.829.979h.003c4.418 0 8.003-3.585 8.003-8.003 0-4.417-3.585-8-8.003-8z" />
                    </svg>
                  </a>

                  <button
                    onClick={() => {
                      setChatModalOpen(false);
                      setActiveMsg(null);
                    }}
                    className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Conversation Thread Body */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#070A11] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                
                {/* Date Header Badge */}
                <div className="flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-surface-100/90 border border-surface-200/60 text-[11px] text-gray-400 font-mono shadow-sm">
                    Inquiry received on {new Date(activeMsg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* 1. Client's Message Bubble (Left / Slate Gray) */}
                <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
                  <div className="w-7 h-7 rounded-full bg-surface-200 text-gray-300 font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                    {activeMsg.name ? activeMsg.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="space-y-1">
                    <div className="p-3.5 sm:p-4 rounded-2xl rounded-tl-sm bg-[#182234] border border-[#27354f] text-white shadow-md space-y-1.5">
                      <div className="text-[11px] font-bold text-accent-cyan">
                        {activeMsg.subject || 'Client Inquiry'}
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {activeMsg.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 pl-1">
                      <span>{new Date(activeMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{activeMsg.name}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Admin's Replies (Right / Blue & Emerald Bubbles) */}
                {getParsedReplies(activeMsg).map((rep: any, idx: number) => (
                  <div key={rep.id || idx} className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] ml-auto space-y-1 animate-in fade-in">
                    <div className="p-3.5 sm:p-4 rounded-2xl rounded-tr-sm bg-gradient-to-tr from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/20 space-y-1">
                      <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-accent-cyan" />
                        {rep.senderName || 'Gujju AI Studio Support'}
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {rep.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 pr-1">
                      <span>{new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCheck className="w-3.5 h-3.5" />
                        Delivered
                      </span>
                    </div>
                  </div>
                ))}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Reply Chips */}
              <div className="px-4 py-2 bg-surface-100/50 border-t border-surface-200/50 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
                <span className="text-gray-400 font-bold shrink-0">Quick Templates:</span>
                <button
                  type="button"
                  onClick={() => setReplyText("Hi! Thanks for reaching out to Gujju AI Studio. Our starter package is ₹600 with 2-day delivery. Let's create your AI reel!")}
                  className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-300 hover:text-white shrink-0 transition-colors"
                >
                  🚀 Pricing & Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setReplyText("Could you please share your high-resolution product photos and Instagram page link?")}
                  className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-300 hover:text-white shrink-0 transition-colors"
                >
                  📸 Request Product Photos
                </button>
                <button
                  type="button"
                  onClick={() => setReplyText("We have reviewed your request and our AI creative team is ready to begin your video ad.")}
                  className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-300 hover:text-white shrink-0 transition-colors"
                >
                  ✅ Project Accepted
                </button>
              </div>

              {/* Chat Input Bar (Bottom) */}
              <div className="p-3 sm:p-4 bg-surface-100/90 border-t border-surface-200/70 shrink-0 space-y-2">
                {chatError && (
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{chatError}</span>
                  </div>
                )}

                <form onSubmit={handleSendChatReply} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Type your reply to ${activeMsg.name}...`}
                      className="w-full bg-[#080B11] border border-surface-200 focus:border-brand-500 rounded-2xl py-3 px-4 text-xs sm:text-sm text-white placeholder-gray-500 outline-none pr-10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="btn-glow px-4 sm:px-5 py-3 rounded-2xl font-bold text-white text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {sendingReply ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-gray-300">
                    <input
                      type="checkbox"
                      checked={sendEmailCopy}
                      onChange={(e) => setSendEmailCopy(e.target.checked)}
                      className="rounded bg-surface-100 border-surface-200 text-brand-600 focus:ring-0"
                    />
                    <span>Send branded email notification to {activeMsg.email}</span>
                  </label>

                  <span className="text-[10px] text-gray-500">
                    Status automatically updates to <strong className="text-emerald-400">REPLIED</strong>
                  </span>
                </div>

              </div>

            </div>
          </div>
        )}

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
