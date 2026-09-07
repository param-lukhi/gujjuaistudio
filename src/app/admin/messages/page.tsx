'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  MessageSquare, Mail, Clock, CheckCircle2, Trash2, 
  Search, Filter, Plus, X, Loader2, AlertCircle, 
  Eye, RefreshCw, Send, Check, MessageCircle, ArrowLeft,
  Sparkles, PhoneCall, ExternalLink, CheckCheck, User,
  MoreVertical, Smile
} from 'lucide-react';

interface ChatMessageItem {
  id: string;
  sender: 'USER' | 'ADMIN' | 'BOT';
  senderName?: string;
  subject?: string;
  text: string;
  createdAt: string;
}

interface UserConversationThread {
  email: string;
  name: string;
  status: string; // 'UNREAD' | 'READ' | 'REPLIED'
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  messageIds: string[]; // database IDs for deletion/updates
  messages: ChatMessageItem[];
}

export default function ManageMessagesPage() {
  const [rawMessages, setRawMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREAD' | 'READ' | 'REPLIED'>('ALL');

  // Selected User Conversation (Active Chat)
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);

  // Chat Input State
  const [replyText, setReplyText] = useState('');
  const [sendEmailCopy, setSendEmailCopy] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Lead Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      setRawMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Group raw database messages by User (Email) into Unified Conversation Threads like Instagram DMs
  const userConversations: UserConversationThread[] = useMemo(() => {
    const threadMap: { [key: string]: UserConversationThread } = {};

    rawMessages.forEach((msg) => {
      const emailKey = (msg.email || 'guest@anonymous.com').trim().toLowerCase();
      
      // Parse any internal replies array stored in this record
      let internalItems: any[] = [];
      try {
        if (msg.replies) {
          const parsed = JSON.parse(msg.replies);
          if (Array.isArray(parsed)) internalItems = parsed;
        }
      } catch {}

      // Build unified messages list for this single record
      const recordMessages: ChatMessageItem[] = [];

      // If internalItems has items, use them; otherwise construct from root message
      if (internalItems.length > 0) {
        internalItems.forEach((item) => {
          recordMessages.push({
            id: item.id || `msg-${Math.random()}`,
            sender: item.sender || 'USER',
            senderName: item.senderName || msg.name,
            subject: item.subject || msg.subject,
            text: item.text || item.message || '',
            createdAt: item.createdAt || msg.createdAt,
          });
        });
      } else {
        recordMessages.push({
          id: msg.id,
          sender: 'USER',
          senderName: msg.name,
          subject: msg.subject,
          text: msg.message,
          createdAt: msg.createdAt,
        });

        if (msg.replyText) {
          recordMessages.push({
            id: `reply-${msg.id}`,
            sender: 'ADMIN',
            senderName: 'Gujju AI Studio Support',
            text: msg.replyText,
            createdAt: msg.updatedAt || msg.createdAt,
          });
        }
      }

      if (!threadMap[emailKey]) {
        threadMap[emailKey] = {
          email: emailKey,
          name: msg.name || 'User',
          status: msg.status || 'UNREAD',
          lastMessageText: '',
          lastMessageTime: msg.updatedAt || msg.createdAt,
          unreadCount: 0,
          messageIds: [msg.id],
          messages: [],
        };
      } else {
        if (!threadMap[emailKey].messageIds.includes(msg.id)) {
          threadMap[emailKey].messageIds.push(msg.id);
        }
      }

      // Merge messages
      threadMap[emailKey].messages.push(...recordMessages);
      
      // Inherit worst-case status (e.g. if any record is UNREAD, thread is UNREAD)
      if (msg.status === 'UNREAD') {
        threadMap[emailKey].status = 'UNREAD';
        threadMap[emailKey].unreadCount += 1;
      }
    });

    // Deduplicate and sort messages by createdAt chronologically for each user
    const result = Object.values(threadMap).map((thread) => {
      const seenIds = new Set();
      const uniqueMessages = thread.messages.filter((m) => {
        if (!m.text) return false;
        const key = `${m.sender}-${m.text.trim()}-${m.createdAt.slice(0, 16)}`;
        if (seenIds.has(key)) return false;
        seenIds.add(key);
        return true;
      });

      uniqueMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const lastMsg = uniqueMessages[uniqueMessages.length - 1];

      return {
        ...thread,
        messages: uniqueMessages,
        lastMessageText: lastMsg ? lastMsg.text : 'No messages',
        lastMessageTime: lastMsg ? lastMsg.createdAt : thread.lastMessageTime,
      };
    });

    // Sort user threads by most recent activity at top
    result.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    return result;
  }, [rawMessages]);

  // Set default selected user conversation
  useEffect(() => {
    if (!selectedUserEmail && userConversations.length > 0) {
      setSelectedUserEmail(userConversations[0].email);
    }
  }, [userConversations, selectedUserEmail]);

  // Active user thread
  const activeThread = useMemo(() => {
    return userConversations.find((t) => t.email === selectedUserEmail) || userConversations[0] || null;
  }, [userConversations, selectedUserEmail]);

  // Scroll active chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages]);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return userConversations.filter((conv) => {
      const matchesStatus = statusFilter === 'ALL' || conv.status === statusFilter;
      const matchesSearch =
        conv.name.toLowerCase().includes(search.toLowerCase()) ||
        conv.email.toLowerCase().includes(search.toLowerCase()) ||
        conv.messages.some((m) => m.text.toLowerCase().includes(search.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [userConversations, statusFilter, search]);

  // Send Reply in Unified Chat Thread
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    setSendingReply(true);
    setChatError(null);

    const primaryMessageId = activeThread.messageIds[0];

    try {
      const res = await fetch(`/api/contact/${primaryMessageId}/reply`, {
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
      setSuccessMsg(`Reply sent to ${activeThread.name}!`);
      setTimeout(() => setSuccessMsg(null), 3000);

      // Refresh conversations
      fetchMessages();
    } catch (err: any) {
      setChatError(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Update Status for entire User Thread
  const handleUpdateThreadStatus = async (status: string) => {
    if (!activeThread) return;
    try {
      await Promise.all(
        activeThread.messageIds.map((id) =>
          fetch(`/api/contact/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          })
        )
      );
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete entire User Conversation Thread
  const handleDeleteThread = async () => {
    if (!activeThread) return;
    if (!confirm(`Delete all messages and conversation history with "${activeThread.name}" (${activeThread.email})?`)) return;

    try {
      await Promise.all(
        activeThread.messageIds.map((id) => fetch(`/api/contact/${id}`, { method: 'DELETE' }))
      );
      setSuccessMsg(`Conversation with ${activeThread.name} deleted.`);
      setSelectedUserEmail(null);
      fetchMessages();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Extract phone number for WhatsApp link
  const rawPhone = activeThread
    ? (activeThread.email + ' ' + activeThread.messages.map((m) => m.text).join(' ')).replace(/[^0-9]/g, '')
    : '';
  const isPhoneAvailable = rawPhone.length >= 10;
  const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone.startsWith('91') ? rawPhone : `91${rawPhone.slice(-10)}`;

  return (
    <div className="flex min-h-screen bg-[#080B11]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 lg:pt-8 space-y-6 overflow-hidden flex flex-col h-screen min-w-0 w-full">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-surface-200/50 pb-4 shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <MessageCircle className="w-6 h-6 text-brand-400" />
              Client Messenger & Direct Messages
            </h1>
            <p className="text-xs text-gray-400">
              Instagram DM & WhatsApp style conversation inbox. All messages from each user are organized into a single live thread.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMessages}
              className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Inbox"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-xs shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* 📱 INSTAGRAM DM / WHATSAPP WEB STYLE 2-COLUMN SPLIT MESSENGER */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-surface-200/80 bg-[#090D16] shadow-2xl overflow-hidden">
          
          {/* LEFT COLUMN: CHAT THREADS INBOX (4 Cols) */}
          <div className="lg:col-span-4 border-r border-surface-200/70 flex flex-col bg-[#070A12]">
            
            {/* Search & Filter Header */}
            <div className="p-3.5 border-b border-surface-200/70 space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user or message..."
                  className="w-full bg-surface-100/90 border border-surface-200 focus:border-brand-500 rounded-xl py-2 pl-8.5 pr-3 text-xs text-white placeholder-gray-500 outline-none transition-colors"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {(['ALL', 'UNREAD', 'READ', 'REPLIED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 border ${
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

            {/* Conversation Threads List */}
            <div className="flex-1 overflow-y-auto divide-y divide-surface-200/40">
              {loading && userConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-2">
                  <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
                  <p className="text-xs text-gray-500">Loading chats...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-2 text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto text-gray-600" />
                  <p className="text-xs font-semibold">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeThread?.email === conv.email;
                  const isUnread = conv.status === 'UNREAD';

                  return (
                    <button
                      key={conv.email}
                      type="button"
                      onClick={() => {
                        setSelectedUserEmail(conv.email);
                        if (conv.status === 'UNREAD') {
                          handleUpdateThreadStatus('READ');
                        }
                      }}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer relative ${
                        isSelected
                          ? 'bg-brand-950/40 border-l-4 border-l-brand-500'
                          : 'hover:bg-surface-100/60'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className={`w-10 h-10 rounded-full font-black text-xs flex items-center justify-center shadow-md ${
                          isUnread
                            ? 'bg-gradient-to-tr from-brand-600 to-accent-cyan text-white shadow-brand-500/25'
                            : 'bg-surface-200 text-gray-300'
                        }`}>
                          {conv.name.charAt(0).toUpperCase()}
                        </div>
                        {isUnread && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-brand-500 rounded-full border-2 border-[#070A12]" />
                        )}
                      </div>

                      {/* Chat Snippet Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {conv.name}
                          </h4>
                          <span className="text-[10px] text-gray-500 shrink-0 font-mono">
                            {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className={`text-[11px] truncate ${isUnread ? 'text-gray-200 font-semibold' : 'text-gray-400'}`}>
                          {conv.lastMessageText}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase ${
                            conv.status === 'UNREAD'
                              ? 'bg-brand-500/20 text-brand-300'
                              : conv.status === 'REPLIED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-surface-200 text-gray-400'
                          }`}>
                            {conv.status}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            • {conv.messages.length} {conv.messages.length === 1 ? 'msg' : 'msgs'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: ACTIVE CONVERSATION THREAD CANVAS (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col bg-[#080B14] min-h-0">
            {activeThread ? (
              <>
                {/* 1. Chat Header */}
                <div className="p-3.5 sm:p-4 bg-surface-100/90 border-b border-surface-200/70 flex items-center justify-between shrink-0 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-accent-cyan text-white font-black text-sm flex items-center justify-center shadow-md">
                        {activeThread.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0A0E17]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-white">{activeThread.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          activeThread.status === 'UNREAD'
                            ? 'bg-brand-500/20 text-brand-300'
                            : activeThread.status === 'REPLIED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-surface-200 text-gray-400'
                        }`}>
                          {activeThread.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono flex items-center gap-2">
                        <span>{activeThread.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Header Toolbar */}
                  <div className="flex items-center gap-2">
                    {/* Status Dropdown/Toggle */}
                    <div className="hidden sm:flex items-center gap-1 bg-surface-100 p-1 rounded-xl border border-surface-200">
                      {(['UNREAD', 'READ', 'REPLIED'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateThreadStatus(st)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                            activeThread.status === st
                              ? st === 'UNREAD' ? 'bg-brand-600 text-white' : st === 'REPLIED' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {/* WhatsApp Action */}
                    {isPhoneAvailable && (
                      <a
                        href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(`Hi ${activeThread.name}, responding to your inquiry on Gujju AI Studio.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] transition-colors flex items-center gap-1 text-xs font-bold"
                        title="Chat with user on WhatsApp"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.417 0-8.002 3.584-8.003 8.001 0 1.41.368 2.784 1.066 3.994l-1.134 4.14 4.239-1.112c1.172.64 2.497.978 3.829.979h.003c4.418 0 8.003-3.585 8.003-8.003 0-4.417-3.585-8-8.003-8z" />
                        </svg>
                      </a>
                    )}

                    {/* Delete Thread */}
                    <button
                      onClick={handleDeleteThread}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Delete Conversation Thread"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Chat Feed (Chronological Thread of ALL user messages and admin replies) */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#070A11] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                  
                  {/* Date Separator */}
                  <div className="flex justify-center">
                    <span className="px-3 py-1 rounded-full bg-surface-100/90 border border-surface-200/60 text-[10px] text-gray-400 font-mono shadow-sm">
                      Full Thread with {activeThread.name}
                    </span>
                  </div>

                  {/* Message Bubbles */}
                  {activeThread.messages.map((msgItem, index) => {
                    const isUser = msgItem.sender === 'USER';

                    return (
                      <div
                        key={msgItem.id || index}
                        className={`flex flex-col ${isUser ? 'items-start mr-auto' : 'items-end ml-auto'} max-w-[85%] sm:max-w-[75%] space-y-1 animate-in fade-in`}
                      >
                        {/* Bubble */}
                        <div
                          className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                            isUser
                              ? 'bg-[#182234] border border-[#27354f] text-white rounded-tl-sm'
                              : 'bg-gradient-to-tr from-brand-600 to-brand-500 text-white rounded-tr-sm shadow-brand-500/20'
                          }`}
                        >
                          {!isUser ? (
                            <div className="text-[10px] font-extrabold text-white/90 uppercase tracking-wider flex items-center gap-1 mb-1">
                              <Sparkles className="w-3 h-3 text-accent-cyan" />
                              {msgItem.senderName || 'Gujju AI Studio Support'}
                            </div>
                          ) : (
                            msgItem.subject && (
                              <div className="text-[10px] font-bold text-accent-cyan mb-1">
                                {msgItem.subject}
                              </div>
                            )
                          )}

                          <p>{msgItem.text}</p>
                        </div>

                        {/* Timestamp & Delivery Info */}
                        <div className={`flex items-center gap-1.5 text-[10px] text-gray-500 ${isUser ? 'pl-1' : 'pr-1'}`}>
                          <span>{new Date(msgItem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {!isUser && (
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                              <CheckCheck className="w-3.5 h-3.5" />
                              Delivered
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div ref={chatEndRef} />
                </div>

                {/* 3. Quick Reply Chips */}
                <div className="px-4 py-2 bg-surface-100/50 border-t border-surface-200/50 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
                  <span className="text-gray-400 font-bold shrink-0">Templates:</span>
                  <button
                    type="button"
                    onClick={() => setReplyText("Hi! Thanks for reaching out. Our starter AI reel is ₹600 with 2-day delivery. Let's get started!")}
                    className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-300 hover:text-white shrink-0 transition-colors"
                  >
                    🚀 Pricing & Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyText("Could you please share your high-resolution product photos and Instagram link?")}
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

                {/* 4. Chat Input Bar */}
                <div className="p-3.5 sm:p-4 bg-surface-100/90 border-t border-surface-200/70 shrink-0 space-y-2">
                  {chatError && (
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{chatError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendReply} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Type reply to ${activeThread.name}...`}
                      className="w-full bg-[#080B11] border border-surface-200 focus:border-brand-500 rounded-2xl py-3 px-4 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
                    />

                    <button
                      type="submit"
                      disabled={sendingReply || !replyText.trim()}
                      className="btn-glow px-5 py-3 rounded-2xl font-bold text-white text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-500/30 disabled:opacity-50 shrink-0"
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
                      <span>Send copy to {activeThread.email}</span>
                    </label>

                    <span className="text-[10px] text-gray-500">
                      Thread status will update to <strong className="text-emerald-400">REPLIED</strong>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 space-y-3">
                <MessageSquare className="w-12 h-12 text-gray-600" />
                <h3 className="text-base font-bold text-white">Select a conversation</h3>
                <p className="text-xs text-gray-400 max-w-sm">
                  Choose a user from the inbox on the left to view their full message stream and send replies.
                </p>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
