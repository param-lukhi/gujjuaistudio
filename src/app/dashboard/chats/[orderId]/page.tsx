'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/providers/ToastProvider';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Mic,
  Smile,
  ArrowLeft,
  CheckCheck,
  Package,
  ShieldCheck,
  User,
  Search,
  Volume2,
  FileText
} from 'lucide-react';

export default function SingleChatPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  const user = session?.user;

  const quickEmojis = ['😊', '🔥', '🚀', '👍', '🎬', '💎', '📦', '🎉', '❤️'];

  useEffect(() => {
    if (orderId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000); // Polling for real-time messages
      return () => clearInterval(interval);
    }
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chats?orderId=${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Failed to load chat room:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (customVoiceUrl?: string, customFileUrl?: string) => {
    const textToSend = newMessage.trim();
    const targetFile = customFileUrl || fileUrl;

    if (!textToSend && !targetFile && !customVoiceUrl) return;

    setSending(true);
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          message: textToSend,
          fileUrl: targetFile || null,
          fileType: targetFile ? (targetFile.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'document') : null,
          voiceNoteUrl: customVoiceUrl || null,
        }),
      });

      if (res.ok) {
        setNewMessage('');
        setFileUrl('');
        setShowEmojiPicker(false);
        fetchMessages();
      } else {
        showToast('Failed to send message', 'error');
      }
    } catch (e) {
      showToast('Error sending message', 'error');
    } finally {
      setSending(false);
    }
  };

  // Simulated Voice Note Recording
  const startVoiceRecording = () => {
    setIsRecordingVoice(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopVoiceRecordingAndSend = () => {
    clearInterval(timerRef.current);
    setIsRecordingVoice(false);
    // Attach simulated voice note link
    const demoAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    handleSendMessage(demoAudioUrl);
    showToast('Voice note attached!', 'success');
  };

  const filteredMessages = messages.filter((m) =>
    (m.message || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="glass-panel rounded-3xl border border-surface-200/80 shadow-2xl flex flex-col h-[75vh] overflow-hidden">
        
        {/* Chat Room Top Bar */}
        <div className="p-4 sm:p-5 bg-surface-100/60 border-b border-surface-200/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/chats"
              className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-gray-300 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <h2 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-400" /> Private Order Discussion
              </h2>
              <p className="text-[11px] text-gray-400">Order ID: <span className="font-mono text-brand-300 font-bold">{orderId}</span></p>
            </div>
          </div>

          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chat..."
              className="w-full bg-surface-100/80 border border-surface-200 focus:border-brand-500 rounded-xl py-1.5 px-3 pl-8 text-xs text-white placeholder-gray-500 outline-none"
            />
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="text-center text-xs text-gray-400 py-10">Loading messages...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center text-xs text-gray-400 py-10 space-y-2">
              <Package className="w-10 h-10 text-gray-500 mx-auto" />
              <p>No messages in this chat room yet. Send your query below.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMe = msg.senderRole === user?.role;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="font-semibold text-gray-300">{msg.senderName}</span>
                    <span>•</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-md rounded-2xl p-4 text-xs font-medium space-y-2 shadow-lg ${
                      isMe
                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-tr-none'
                        : 'bg-surface-100/80 border border-surface-200 text-gray-200 rounded-tl-none'
                    }`}
                  >
                    {/* Text Message */}
                    {msg.message && <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>}

                    {/* Image Attachment */}
                    {msg.fileUrl && msg.fileType === 'image' && (
                      <div className="rounded-xl overflow-hidden border border-white/20">
                        <img src={msg.fileUrl} alt="Attachment" className="max-h-48 object-cover w-full" />
                      </div>
                    )}

                    {/* Document Attachment */}
                    {msg.fileUrl && msg.fileType !== 'image' && (
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2 rounded-xl bg-black/20 hover:bg-black/40 text-xs font-bold text-white underline"
                      >
                        <FileText className="w-4 h-4" /> Download Attached Document
                      </a>
                    )}

                    {/* Voice Note */}
                    {msg.voiceNoteUrl && (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-black/20 text-white">
                        <Volume2 className="w-4 h-4 text-accent-cyan animate-pulse" />
                        <span className="text-[11px] font-mono">🎙️ Audio Voice Note</span>
                        <audio controls src={msg.voiceNoteUrl} className="h-6 w-36 text-xs" />
                      </div>
                    )}

                    {/* Seen Status Indicator */}
                    <div className="flex justify-end pt-0.5">
                      <span className="text-[10px] text-white/70 flex items-center gap-1">
                        {msg.seen ? (
                          <span className="flex items-center text-emerald-300 font-bold"><CheckCheck className="w-3.5 h-3.5" /> Seen</span>
                        ) : (
                          <span>Sent</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* File attachment preview */}
        {fileUrl && (
          <div className="px-4 py-2 bg-surface-100 border-t border-surface-200 flex items-center justify-between text-xs text-brand-300">
            <span className="truncate">Attached URL: {fileUrl}</span>
            <button onClick={() => setFileUrl('')} className="text-rose-400 font-bold ml-2">Remove</button>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-surface-100/80 border-t border-surface-200/60 relative">
          
          {/* Quick Emoji Bar */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 p-2 bg-[#0D121F] border border-brand-500/40 rounded-2xl shadow-xl flex items-center gap-2 z-20">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewMessage((prev) => prev + emoji)}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-gray-300 hover:text-amber-400 transition-all"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* File Attachment trigger prompt */}
            <button
              type="button"
              onClick={() => {
                const url = prompt('Enter File or Image URL to attach:');
                if (url) setFileUrl(url);
              }}
              className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-gray-300 hover:text-accent-cyan transition-all"
              title="Attach File URL"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Note Button */}
            {isRecordingVoice ? (
              <button
                type="button"
                onClick={stopVoiceRecordingAndSend}
                className="px-3 py-2 rounded-xl bg-rose-600 animate-pulse text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Mic className="w-4 h-4" /> Stop & Send ({recordingTime}s)
              </button>
            ) : (
              <button
                type="button"
                onClick={startVoiceRecording}
                className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-gray-300 hover:text-rose-400 transition-all"
                title="Record Voice Note"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            {/* Input Box */}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type message..."
              className="flex-1 bg-surface-100/90 border border-surface-200 focus:border-brand-500 rounded-xl py-2.5 px-4 text-xs text-white placeholder-gray-500 outline-none"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={sending}
              className="btn-glow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-brand-500/20"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
