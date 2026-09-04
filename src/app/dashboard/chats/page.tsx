'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import {
  MessageSquare,
  Search,
  ChevronRight,
  Clock,
  User,
  ShieldCheck,
  Package
} from 'lucide-react';

export default function ChatsPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (e) {
      console.error('Failed to load chats:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter((c) =>
    (c.orderNumber + ' ' + c.packageName + ' ' + c.serviceName)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-surface-100/50 rounded-3xl" />
          <div className="h-32 bg-surface-100/50 rounded-2xl" />
          <div className="h-32 bg-surface-100/50 rounded-2xl" />
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
            <div className="w-12 h-12 rounded-2xl bg-accent-violet/20 border border-accent-violet/30 text-accent-violet flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Private Order Chats</h1>
              <p className="text-xs text-gray-400">Direct 1-on-1 private messaging with Gujju AI production team.</p>
            </div>
          </div>

          {/* Search Chats */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chat order..."
              className="w-full bg-surface-100/80 border border-surface-200 focus:border-brand-500 rounded-xl py-2 px-3.5 pl-9 text-xs text-white placeholder-gray-500 outline-none"
            />
          </div>
        </div>

        {/* Chats List */}
        {filteredChats.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-surface-200/80 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Chats Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Each order has its own private chat. Place an order or check active orders to start chatting.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChats.map((chat) => {
              const lastMsg = chat.messages?.[0];
              return (
                <Link
                  key={chat.id}
                  href={`/dashboard/chats/${chat.id}`}
                  className="glass-panel p-5 rounded-2xl border border-surface-200/80 hover:border-brand-500/50 transition-all flex items-center justify-between gap-4 block group"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-brand-300 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                      <Package className="w-6 h-6" />
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-brand-400">#{chat.orderNumber}</span>
                        <h4 className="font-bold text-sm text-white truncate">{chat.serviceName || chat.packageName}</h4>
                        <StatusBadge status={chat.status} />
                      </div>

                      <p className="text-xs text-gray-300 truncate">
                        {lastMsg ? (
                          <>
                            <strong className="text-gray-400">{lastMsg.senderName}: </strong>
                            {lastMsg.message || (lastMsg.voiceNoteUrl ? '🎙️ Voice note' : '📎 Attachment')}
                          </>
                        ) : (
                          <span className="text-gray-500 italic">No messages yet. Click to start discussion.</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {lastMsg && (
                      <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
                        {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
