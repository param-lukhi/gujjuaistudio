'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/providers/ToastProvider';
import { uploadMediaFile } from '@/lib/uploadClient';
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
  FileText,
  Loader2,
  Square,
  Music
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
  
  // Real voice recording states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const generalFileInputRef = useRef<HTMLInputElement>(null);

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

  // Real Voice Note Recording with Browser MediaRecorder
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone permission error:', err);
      showToast('Please allow microphone permissions to record audio', 'error');
    }
  };

  const stopVoiceRecordingAndSend = async () => {
    clearInterval(timerRef.current);
    setIsRecordingVoice(false);

    if (!mediaRecorderRef.current) return;

    setUploadingMedia(true);

    mediaRecorderRef.current.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });

        const audioUrl = await uploadMediaFile(audioFile, {
          folder: 'voice_notes',
        });

        if (audioUrl) {
          await handleSendMessage(audioUrl);
          showToast('🎙️ Voice note sent successfully!', 'success');
        }
      } catch (uploadErr: any) {
        console.error('Audio upload error:', uploadErr);
        showToast('Failed to upload voice note', 'error');
      } finally {
        setUploadingMedia(false);
        // Stop all microphone tracks
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
      }
    };

    mediaRecorderRef.current.stop();
  };

  // Direct Audio File Upload
  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const audioUrl = await uploadMediaFile(file, { folder: 'audio_uploads' });
      if (audioUrl) {
        await handleSendMessage(audioUrl);
        showToast('🎵 Audio file attached and sent!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to upload audio file', 'error');
    } finally {
      setUploadingMedia(false);
      if (audioFileInputRef.current) audioFileInputRef.current.value = '';
    }
  };

  // General File / Document / Image Upload
  const handleGeneralFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const url = await uploadMediaFile(file, { folder: 'chat_attachments' });
      if (url) {
        if (file.type.startsWith('audio/')) {
          await handleSendMessage(url);
        } else {
          setFileUrl(url);
        }
        showToast('File attached successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to upload file', 'error');
    } finally {
      setUploadingMedia(false);
      if (generalFileInputRef.current) generalFileInputRef.current.value = '';
    }
  };

  const filteredMessages = messages.filter((m) =>
    (m.message || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="glass-panel rounded-3xl border border-surface-200/80 shadow-2xl flex flex-col h-[75vh] overflow-hidden">
        
        {/* Hidden inputs for file and audio selection */}
        <input
          type="file"
          ref={audioFileInputRef}
          accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.webm"
          onChange={handleAudioFileUpload}
          className="hidden"
        />
        <input
          type="file"
          ref={generalFileInputRef}
          accept="image/*,.pdf,.doc,.docx,.zip,audio/*"
          onChange={handleGeneralFileUpload}
          className="hidden"
        />

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

                    {/* Audio Voice Note */}
                    {msg.voiceNoteUrl && (
                      <div className="flex flex-col gap-2 p-3 rounded-xl bg-black/30 text-white border border-white/15">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-accent-cyan">
                          <Volume2 className="w-4 h-4 animate-pulse" />
                          <span>🎙️ Audio Voice Note</span>
                        </div>
                        <audio controls src={msg.voiceNoteUrl} className="w-full h-8 text-xs rounded-lg" />
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

            {/* General File Attachment */}
            <button
              type="button"
              onClick={() => generalFileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-gray-300 hover:text-accent-cyan transition-all"
              title="Attach File or Image"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Audio File Upload Button */}
            <button
              type="button"
              onClick={() => audioFileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-gray-300 hover:text-emerald-400 transition-all"
              title="Upload Audio / MP3 File"
            >
              <Music className="w-4 h-4" />
            </button>

            {/* Voice Note Record / Stop Button */}
            {uploadingMedia ? (
              <div className="px-3 py-2 rounded-xl bg-surface-200 text-xs text-brand-300 flex items-center gap-1.5 font-bold">
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading audio...
              </div>
            ) : isRecordingVoice ? (
              <button
                type="button"
                onClick={stopVoiceRecordingAndSend}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 animate-pulse text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-white" /> Stop & Send ({recordingTime}s)
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
              disabled={sending || uploadingMedia}
              className="btn-glow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
