'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, CheckCircle2, Sparkles, 
  User, Mail, Phone, CheckCheck, Loader2, RefreshCw, MessageCircle, Instagram
} from 'lucide-react';
import { useSession } from 'next-auth/react';

const WHATSAPP_NUMBER = '919925263558';
const WHATSAPP_PREFILLED_MESSAGE = encodeURIComponent(
  'Hello Gujju AI Studio, I want to inquire about AI video ads'
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_PREFILLED_MESSAGE}`;
const INSTAGRAM_URL = 'https://instagram.com/gujjuaistudio';

interface ChatBubble {
  id: string;
  sender: 'USER' | 'ADMIN' | 'BOT';
  senderName?: string;
  text: string;
  subject?: string;
  createdAt: string;
}

export default function FloatingSupportWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserInfoPrompt, setShowUserInfoPrompt] = useState(false);

  // User details state
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState(''); // Email or Phone
  const [inquiryTopic, setInquiryTopic] = useState('AI Video Ads Inquiry');
  
  // Message input
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Current active message thread ID
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  // Chat bubbles list
  const [chatBubbles, setChatBubbles] = useState<ChatBubble[]>([
    {
      id: 'welcome-bot-msg',
      sender: 'BOT',
      senderName: 'Gujju AI Studio Support',
      text: 'Hi there! 👋 Welcome to Gujju AI Studio. How can we help you create viral AI product reels or scale your brand today?',
      createdAt: new Date().toISOString(),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Load user data from session or localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('gujju_client_name') || session?.user?.name || '';
      const savedContact = localStorage.getItem('gujju_client_contact') || session?.user?.email || '';
      const savedMsgId = localStorage.getItem('gujju_client_active_msg_id');
      
      if (savedName) setUserName(savedName);
      if (savedContact) setUserContact(savedContact);
      if (savedMsgId) setActiveMessageId(savedMsgId);

      const savedChat = localStorage.getItem('gujju_client_chat_history');
      if (savedChat) {
        try {
          const parsed = JSON.parse(savedChat);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Sanitize history: remove any old corrupted bubbles that echoed user messages as ADMIN
            const sanitized = parsed.filter((bubble, idx, arr) => {
              if (bubble.sender === 'ADMIN') {
                const prevBubble = arr[idx - 1];
                if (prevBubble && prevBubble.sender === 'USER' && prevBubble.text === bubble.text) {
                  return false;
                }
              }
              return true;
            });
            setChatBubbles(sanitized);
          }
        } catch {}
      }
    }
  }, [session]);

  // Scroll to bottom whenever chat bubbles change or modal opens
  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, chatBubbles]);

  // Poll for actual admin replies if activeMessageId exists
  useEffect(() => {
    if (!isOpen || !activeMessageId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/contact?id=${activeMessageId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.replies) {
            const serverReplies: any[] = JSON.parse(data.replies);
            if (Array.isArray(serverReplies) && serverReplies.length > 0) {
              setChatBubbles((prev) => {
                const existingAdminReplyIds = new Set(
                  prev.filter((b) => b.sender === 'ADMIN').map((b) => b.id)
                );
                const newBubbles = [...prev];
                let hasNew = false;

                // Only take messages explicitly sent by ADMIN
                serverReplies
                  .filter((rep) => rep.sender === 'ADMIN')
                  .forEach((rep) => {
                    if (!existingAdminReplyIds.has(rep.id)) {
                      hasNew = true;
                      newBubbles.push({
                        id: rep.id,
                        sender: 'ADMIN',
                        senderName: rep.senderName || 'Gujju AI Studio Support',
                        text: rep.text,
                        createdAt: rep.createdAt || new Date().toISOString(),
                      });
                    }
                  });

                if (hasNew) {
                  localStorage.setItem('gujju_client_chat_history', JSON.stringify(newBubbles));
                  return newBubbles;
                }
                return prev;
              });
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [isOpen, activeMessageId]);

  // Generate instant intelligent bot reply for common questions
  const getInstantBotResponse = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost') || lower.includes('rate')) {
      return `💡 **AI Video Ads Pricing**:\n• **Starter Reel (15-30s)**: ₹1,999 (~$29) - 1 AI Model + Script + Voiceover\n• **Pro Growth (30-60s)**: ₹3,999 (~$49) - Cinematic multi-scene + Viral hooks\n• **Monthly Scale Bundle**: Custom Discounted Packages\n\n⚡ Delivery in 48 hours. Our team has received your message and will also follow up shortly!`;
    }
    if (lower.includes('delivery') || lower.includes('time') || lower.includes('turnaround') || lower.includes('2-day')) {
      return `⚡ **Fast 48-Hour Turnaround**:\n1. Send product photos/details.\n2. We script & generate high-converting AI footage & studio voiceover.\n3. Final ready-to-post 9:16 reels delivered in 48 hours with revisions included!\n\nOur team will review your inquiry shortly.`;
    }
    if (lower.includes('whatsapp') || lower.includes('phone') || lower.includes('call') || lower.includes('number')) {
      return `📲 **Direct WhatsApp Support**:\nYou can reach our creative team directly on WhatsApp at **+91 99252 63558** for instant script approval and custom orders.`;
    }
    return `✨ Thanks for reaching out! We've received your inquiry. Our team typically replies within 15-30 minutes. You can also tap the WhatsApp button above for instant real-time discussion!`;
  };

  // Handle Quick Chip click
  const handleQuickChip = (text: string) => {
    setInputMessage(text);
  };

  // Clear chat history
  const handleResetChat = () => {
    const defaultBubble: ChatBubble = {
      id: 'welcome-bot-msg',
      sender: 'BOT',
      senderName: 'Gujju AI Studio Support',
      text: 'Hi there! 👋 Welcome to Gujju AI Studio. How can we help you create viral AI product reels or scale your brand today?',
      createdAt: new Date().toISOString(),
    };
    setChatBubbles([defaultBubble]);
    localStorage.removeItem('gujju_client_chat_history');
    localStorage.removeItem('gujju_client_active_msg_id');
    setActiveMessageId(null);
  };

  // Submit user message in live chat
  const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (directText || inputMessage).trim();
    if (!textToSend) return;

    // If user info is not present, prompt for info first
    if (!userName.trim() || !userContact.trim()) {
      setShowUserInfoPrompt(true);
      return;
    }

    setInputMessage('');
    setSending(true);

    const newBubble: ChatBubble = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      senderName: userName || 'Customer',
      text: textToSend,
      subject: inquiryTopic,
      createdAt: new Date().toISOString(),
    };

    const updatedBubbles = [...chatBubbles, newBubble];
    setChatBubbles(updatedBubbles);
    localStorage.setItem('gujju_client_chat_history', JSON.stringify(updatedBubbles));
    localStorage.setItem('gujju_client_name', userName);
    localStorage.setItem('gujju_client_contact', userContact);

    // Provide instant automated bot assistance
    setTimeout(() => {
      const botResponseText = getInstantBotResponse(textToSend);
      const botBubble: ChatBubble = {
        id: `bot-reply-${Date.now()}`,
        sender: 'BOT',
        senderName: 'Gujju AI Assistant',
        text: botResponseText,
        createdAt: new Date().toISOString(),
      };
      setChatBubbles((prev) => {
        const next = [...prev, botBubble];
        localStorage.setItem('gujju_client_chat_history', JSON.stringify(next));
        return next;
      });
    }, 600);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          email: userContact,
          subject: inquiryTopic,
          message: textToSend,
        }),
      });

      const data = await res.json();
      if (res.ok && data.message?.id) {
        setActiveMessageId(data.message.id);
        localStorage.setItem('gujju_client_active_msg_id', data.message.id);
      }
    } catch (err) {
      console.error('Failed to submit message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSaveUserInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim() && userContact.trim()) {
      setShowUserInfoPrompt(false);
      localStorage.setItem('gujju_client_name', userName);
      localStorage.setItem('gujju_client_contact', userContact);
      if (inputMessage.trim()) {
        handleSendMessage();
      }
    }
  };

  return (
    <>
      {/* Floating Container (Bottom-Right) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
        
        {/* 💬 LIVE WHATSAPP & INSTAGRAM STYLE CHAT MESSENGER WINDOW */}
        {isOpen && (
          <div className="w-[calc(100vw-32px)] sm:w-[400px] h-[520px] max-h-[78vh] rounded-3xl bg-[#090D16]/95 backdrop-blur-2xl border border-surface-200/80 shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 mb-2">
            
            {/* 1. Chat Header */}
            <div className="p-4 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-cyan flex items-center justify-between text-white shrink-0 shadow-lg shadow-brand-600/20">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/20 shadow-md bg-[#080B11] shrink-0">
                    <img
                      src="/logo.png"
                      alt="Gujju AI Studio Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#090D16] animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight">Gujju AI Studio</h3>
                  <p className="text-[11px] text-white/80 flex items-center gap-1.5">
                    Online • Typically replies in 15 mins
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Reset / Clear Chat Button */}
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors flex items-center justify-center"
                  title="Start Fresh / Clear Chat"
                  aria-label="Clear Chat"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                {/* Direct WhatsApp Chat Action */}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Chat directly on WhatsApp (+91 99252 63558)"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.417 0-8.002 3.584-8.003 8.001 0 1.41.368 2.784 1.066 3.994l-1.134 4.14 4.239-1.112c1.172.64 2.497.978 3.829.979h.003c4.418 0 8.003-3.585 8.003-8.003 0-4.417-3.585-8-8.003-8z" />
                  </svg>
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>

                {/* Direct Instagram Action */}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Open Instagram Profile"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="hidden sm:inline">Instagram</span>
                </a>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
                  aria-label="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Interactive Chat Feed (WhatsApp & Instagram DM Style) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#070A11] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
              
              {/* Date Header */}
              <div className="flex justify-center">
                <span className="px-3 py-1 rounded-full bg-surface-100/90 border border-surface-200/60 text-[10px] text-gray-400 font-mono shadow-sm">
                  Live Studio Messenger
                </span>
              </div>

              {/* Chat Bubbles */}
              {chatBubbles.map((bubble) => {
                const isUser = bubble.sender === 'USER';
                const isBot = bubble.sender === 'BOT';

                return (
                  <div
                    key={bubble.id}
                    className={`flex flex-col ${isUser ? 'items-end ml-auto' : 'items-start mr-auto'} max-w-[88%] space-y-1 animate-in fade-in`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                        isUser
                          ? 'bg-gradient-to-tr from-brand-600 to-brand-500 text-white rounded-tr-sm shadow-brand-500/20'
                          : isBot
                          ? 'bg-[#121a29] border border-[#1e2e48] text-gray-100 rounded-tl-sm shadow-cyan-900/10'
                          : 'bg-[#182234] border border-[#27354f] text-gray-100 rounded-tl-sm'
                      }`}
                    >
                      {!isUser && (
                        <div className="text-[10px] font-extrabold text-accent-cyan uppercase tracking-wider flex items-center gap-1 mb-1.5">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          {bubble.senderName || (isBot ? 'Gujju AI Assistant' : 'Gujju AI Studio Support')}
                        </div>
                      )}
                      
                      {isUser && bubble.subject && (
                        <div className="text-[10px] font-bold text-white/80 mb-1">
                          {bubble.subject}
                        </div>
                      )}

                      <p className="leading-relaxed">{bubble.text}</p>
                    </div>

                    {/* Timestamp & Status */}
                    <div className={`flex items-center gap-1 text-[10px] text-gray-500 ${isUser ? 'pr-1' : 'pl-1'}`}>
                      <span>
                        {new Date(bubble.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isUser && (
                        <span className="text-emerald-400 font-bold flex items-center">
                          <CheckCheck className="w-3 h-3 ml-0.5" />
                          Sent
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              <div ref={chatEndRef} />
            </div>

            {/* User Info Capture Modal/Drawer (if user hasn't provided name/email) */}
            {showUserInfoPrompt && (
              <div className="p-4 bg-surface-100 border-t border-surface-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-400" />
                    Enter your name & email to send
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowUserInfoPrompt(false)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveUserInfo} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3 py-2 rounded-xl bg-[#080B11] border border-surface-200 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                  <input
                    type="text"
                    required
                    value={userContact}
                    onChange={(e) => setUserContact(e.target.value)}
                    placeholder="Email Address or WhatsApp Number"
                    className="w-full px-3 py-2 rounded-xl bg-[#080B11] border border-surface-200 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="btn-glow w-full py-2 rounded-xl text-xs font-bold text-white shadow-md"
                  >
                    Continue to Chat →
                  </button>
                </form>
              </div>
            )}

            {/* 3. Quick Action Chips */}
            {!showUserInfoPrompt && (
              <div className="px-3.5 py-2 bg-[#090D16] border-t border-surface-200/50 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, 'I want to create AI video ads for my brand. What is the pricing?')}
                  className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-300 hover:text-white shrink-0 transition-colors"
                >
                  🚀 AI Video Pricing
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, 'How does the 2-day delivery process work?')}
                  className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-200 border border-surface-200 text-gray-300 hover:text-white shrink-0 transition-colors"
                >
                  ⚡ 2-Day Delivery
                </button>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] shrink-0 transition-colors font-bold"
                >
                  💬 WhatsApp
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#f09433]/20 via-[#dc2743]/20 to-[#bc1888]/20 hover:opacity-90 border border-pink-500/40 text-pink-400 shrink-0 transition-colors font-bold flex items-center gap-1"
                >
                  <Instagram className="w-3 h-3 text-pink-400" /> Instagram
                </a>
              </div>
            )}

            {/* 4. Bottom Chat Input Bar */}
            {!showUserInfoPrompt && (
              <div className="p-3 bg-surface-100/90 border-t border-surface-200/70 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message or inquiry..."
                    className="w-full bg-[#080B11] border border-surface-200 focus:border-brand-500 rounded-2xl py-2.5 px-3.5 text-xs text-white placeholder-gray-500 outline-none"
                  />

                  <button
                    type="submit"
                    disabled={sending || !inputMessage.trim()}
                    className="btn-glow p-2.5 rounded-2xl font-bold text-white text-xs flex items-center justify-center shadow-lg shadow-brand-500/25 disabled:opacity-50 shrink-0"
                    aria-label="Send message"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* Floating Action Buttons Column (Bottom-Right) */}
        <div className="flex flex-col items-center gap-3">
          
          {/* Floating Message Action Button (Top of stack) */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-accent-cyan text-white shadow-2xl shadow-brand-500/40 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Toggle Quick Message Box"
            title="Send us a message"
          >
            {/* Subtle Pulse */}
            <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-20 pointer-events-none" />

            {/* Icon */}
            {isOpen ? (
              <X className="w-6 h-6 text-white relative z-10 transition-transform duration-200" />
            ) : (
              <MessageSquare className="w-6 h-6 text-white relative z-10 transition-transform duration-200" />
            )}

            {/* Tooltip on hover */}
            <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-[#0B0F19]/90 border border-surface-200/80 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              Live Chat & Message
            </span>
          </button>

          {/* Floating Instagram Action Button (Middle of stack) */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-2xl shadow-pink-600/40 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Open Instagram Profile"
            title="Follow us on Instagram (@gujjuaistudio)"
          >
            {/* Pulsing Ripple Effect */}
            <span className="absolute inset-0 rounded-full bg-pink-500 animate-ping opacity-25 pointer-events-none" />

            {/* Instagram Icon */}
            <Instagram className="w-6 h-6 text-white relative z-10" />

            {/* Online/Active Badge */}
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="w-2.5 h-2.5 bg-pink-500 rounded-full" />
            </span>

            {/* Tooltip on hover */}
            <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-[#0B0F19]/90 border border-surface-200/80 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              Follow on Instagram
            </span>
          </a>

          {/* Floating WhatsApp Action Button (Bottom of stack) */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp (+91 99252 63558)"
          >
            {/* Pulsing Ripple Effect */}
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />

            {/* WhatsApp SVG Icon */}
            <svg className="w-7 h-7 fill-current relative z-10" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.417 0-8.002 3.584-8.003 8.001 0 1.41.368 2.784 1.066 3.994l-1.134 4.14 4.239-1.112c1.172.64 2.497.978 3.829.979h.003c4.418 0 8.003-3.585 8.003-8.003 0-4.417-3.585-8-8.003-8z" />
            </svg>

            {/* Online Green Badge */}
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            </span>

            {/* Tooltip on hover */}
            <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-[#0B0F19]/90 border border-surface-200/80 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              Chat on WhatsApp
            </span>
          </a>

        </div>

      </div>
    </>
  );
}
