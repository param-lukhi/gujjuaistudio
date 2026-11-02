'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  MessageSquare, X, Send, CheckCircle2, Sparkles, 
  User, Mail, Phone, CheckCheck, Loader2, RefreshCw, MessageCircle, Instagram, Check, ArrowRight
} from 'lucide-react';
import { useSession } from 'next-auth/react';

const WHATSAPP_NUMBER = '919925263558';
const WHATSAPP_PREFILLED_MESSAGE = encodeURIComponent(
  'Hello Gujju AI Studio, I want to inquire about AI video ads'
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_PREFILLED_MESSAGE}`;
const INSTAGRAM_URL = 'https://www.instagram.com/gujju__ai__studio/';

interface ChatBubble {
  id: string;
  sender: 'USER' | 'ADMIN' | 'BOT';
  senderName?: string;
  text: string;
  subject?: string;
  createdAt: string;
}

export default function FloatingSupportWidget() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hide the floating widget on auth pages (Login, Register, Password recovery, Admin Login)
  const hiddenRoutes = ['/login', '/register', '/signup', '/forgot-password', '/reset-password', '/admin/login'];
  const isAuthPage = hiddenRoutes.some((route) => {
    if (!pathname) return false;
    const cleanPath = pathname.toLowerCase().replace(/\/$/, '');
    return cleanPath === route || cleanPath.startsWith(route + '/');
  });

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
      text: 'Hi there! 👋 Welcome to Gujju AI Studio.\n\nTransform your product photos into viral, scroll-stopping 9:16 AI reels with cinematic models and voiceovers.\n\nHow can we help your brand scale today?',
      createdAt: new Date().toISOString(),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Listen for logout event to clear chat history immediately
  useEffect(() => {
    const handleReset = () => {
      handleResetChat();
    };
    window.addEventListener('gujju_chat_reset', handleReset);
    return () => window.removeEventListener('gujju_chat_reset', handleReset);
  }, []);

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
            // Sanitize history: remove any corrupted bubbles that echoed user messages as ADMIN
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
            let serverReplies: any[] = [];
            if (typeof data.replies === 'string') {
              try { serverReplies = JSON.parse(data.replies); } catch {}
            } else if (Array.isArray(data.replies)) {
              serverReplies = data.replies;
            }

            if (Array.isArray(serverReplies) && serverReplies.length > 0) {
              setChatBubbles((prev) => {
                const existingAdminReplyIds = new Set(
                  prev.filter((b) => b?.sender === 'ADMIN').map((b) => b.id)
                );
                const newBubbles = [...prev];
                let hasNew = false;

                // Only take messages explicitly sent by ADMIN
                serverReplies
                  .filter((rep) => rep && rep.sender === 'ADMIN')
                  .forEach((rep) => {
                    if (rep.id && !existingAdminReplyIds.has(rep.id)) {
                      hasNew = true;
                      newBubbles.push({
                        id: rep.id,
                        sender: 'ADMIN',
                        senderName: rep.senderName || 'Gujju AI Studio Support',
                        text: rep.text || '',
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
      return `💡 **AI Video Ads Packages & Pricing**:\n• **Starter Reel (15-30s)**: ₹1,999 (~$29) - 1 AI Model + Script + Voiceover\n• **Pro Growth (30-60s)**: ₹3,999 (~$49) - Cinematic multi-scene + Viral hooks\n• **Monthly Scale Bundle**: Custom Discounted Packages\n\n⚡ Guaranteed 48-Hour Delivery. Our team has received your message and will also follow up shortly!`;
    }
    if (lower.includes('delivery') || lower.includes('time') || lower.includes('turnaround') || lower.includes('2-day')) {
      return `⚡ **Fast 48-Hour Turnaround Process**:\n1. Send 2-3 product photos or concept details.\n2. We script & generate cinematic AI footage & professional studio voiceover.\n3. Ready-to-post 9:16 vertical reels delivered in 48 hours with revisions included!\n\nOur team will review your inquiry shortly.`;
    }
    if (lower.includes('whatsapp') || lower.includes('phone') || lower.includes('call') || lower.includes('number')) {
      return `📲 **Direct WhatsApp Support**:\nYou can reach our creative team directly on WhatsApp at **+91 99252 63558** for instant script approval and custom orders.`;
    }
    if (lower.includes('portfolio') || lower.includes('sample') || lower.includes('reel') || lower.includes('video')) {
      return `🎬 **Reels Showcase**:\nExplore our portfolio of scroll-stopping video ads across 7 industries (Fashion, Clothing, Jewelry, Food, Beauty, Electronics, Restaurant) on our Portfolio page!`;
    }
    return `✨ Thanks for reaching out! We've received your inquiry. Our team typically replies within 10-15 minutes.\n\nYou can also tap the WhatsApp button below for instant real-time discussion with our team!`;
  };

  // Clear chat history
  const handleResetChat = () => {
    const defaultBubble: ChatBubble = {
      id: 'welcome-bot-msg',
      sender: 'BOT',
      senderName: 'Gujju AI Studio Support',
      text: 'Hi there! 👋 Welcome to Gujju AI Studio.\n\nTransform your product photos into viral, scroll-stopping 9:16 AI reels with cinematic models and voiceovers.\n\nHow can we help your brand scale today?',
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

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      {/* 💬 LIVE CHAT MESSENGER WINDOW */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[400px] md:w-[410px] h-[580px] max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] rounded-3xl bg-[#090D16]/98 backdrop-blur-2xl border border-surface-200/90 shadow-2xl shadow-black flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* 1. Chat Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-[#0C1222] via-[#0F172A] to-[#0A0F1D] border-b border-surface-200/60 flex items-center justify-between text-white shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-2xl overflow-hidden border border-brand-500/30 shadow-md bg-[#080B11]">
                  <img
                    src="/logo.png"
                    alt="Gujju AI Studio"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#090D16] animate-pulse" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white leading-tight truncate">Gujju AI Studio</h3>
                  <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0" title="Verified AI Studio">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 leading-tight mt-0.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
                  <span>Active Now • Fast &lt;15m Reply</span>
                </p>
              </div>
            </div>

            {/* Header Action Icons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* WhatsApp Shortcut */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/30 border border-[#25D366]/30 text-[#25D366] transition-all flex items-center justify-center"
                title="Direct WhatsApp (+91 99252 63558)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.417 0-8.002 3.584-8.003 8.001 0 1.41.368 2.784 1.066 3.994l-1.134 4.14 4.239-1.112c1.172.64 2.497.978 3.829.979h.003c4.418 0 8.003-3.585 8.003-8.003 0-4.417-3.585-8-8.003-8z" />
                </svg>
              </a>

              {/* Instagram Shortcut */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-pink-500/15 hover:bg-pink-500/30 border border-pink-500/30 text-pink-400 transition-all flex items-center justify-center"
                title="Follow on Instagram (@gujju__ai__studio)"
              >
                <Instagram className="w-4 h-4" />
              </a>

              {/* Clear / Reset Chat Button */}
              <button
                type="button"
                onClick={handleResetChat}
                className="w-8 h-8 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200/80 text-gray-300 hover:text-white transition-all flex items-center justify-center"
                title="Reset / Clear Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-surface-100 hover:bg-rose-500/20 border border-surface-200/80 text-gray-300 hover:text-rose-400 transition-all flex items-center justify-center"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Interactive Chat Feed */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-[#070A12] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            
            {/* Header Badge */}
            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-full bg-surface-100/90 border border-surface-200/60 text-[10px] text-gray-400 font-mono shadow-sm">
                ✨ Live AI Creative Concierge
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
                  {/* Message Bubble Container */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-lg transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-xs shadow-brand-500/20'
                        : isBot
                        ? 'bg-[#0E1626] border border-[#1E2E4A]/80 text-gray-100 rounded-tl-xs shadow-black/40'
                        : 'bg-[#141E33] border border-brand-500/40 text-gray-100 rounded-tl-xs shadow-brand-500/10'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-surface-200/30">
                        {isBot ? (
                          <>
                            <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                              <Sparkles className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">
                              {bubble.senderName || 'Gujju AI Assistant'}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                              <User className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                              {bubble.senderName || 'Studio Director • Live Support'}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    
                    {isUser && bubble.subject && (
                      <div className="text-[10px] font-bold text-white/80 pb-1 mb-1 border-b border-white/10">
                        {bubble.subject}
                      </div>
                    )}

                    <p className="leading-relaxed">{bubble.text}</p>

                    {/* Interactive WhatsApp CTA inside bot welcome or bot reply */}
                    {isBot && (
                      <div className="pt-2.5 mt-2.5 border-t border-surface-200/30">
                        <a
                          href={WHATSAPP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-bold transition-all shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.417 0-8.002 3.584-8.003 8.001 0 1.41.368 2.784 1.066 3.994l-1.134 4.14 4.239-1.112c1.172.64 2.497.978 3.829.979h.003c4.418 0 8.003-3.585 8.003-8.003 0-4.417-3.585-8-8.003-8z" />
                          </svg>
                          <span>WhatsApp par Instant Connect Karein →</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Timestamp & Status */}
                  <div className={`flex items-center gap-1.5 text-[10px] text-gray-500 font-mono ${isUser ? 'pr-1' : 'pl-1'}`}>
                    <span>
                      {new Date(bubble.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isUser && (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Sent</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={chatEndRef} />
          </div>

          {/* User Info Capture Modal/Drawer */}
          {showUserInfoPrompt && (
            <div className="p-4 bg-[#0A0E18] border-t border-surface-200/80 space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Enter your details to connect</h4>
                    <p className="text-[10px] text-gray-400">Our studio team will reply to you directly</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUserInfoPrompt(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-100"
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
                  placeholder="Your Name (e.g. Rahul Sharma)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B11] border border-surface-200/80 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <input
                  type="text"
                  required
                  value={userContact}
                  onChange={(e) => setUserContact(e.target.value)}
                  placeholder="WhatsApp Number or Email Address"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B11] border border-surface-200/80 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="submit"
                  className="btn-glow w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-brand-500/25 flex items-center justify-center gap-1.5"
                >
                  <span>Start Chatting Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* 3. Quick Action Chips */}
          {!showUserInfoPrompt && (
            <div className="px-3 py-2 bg-[#080C16] border-t border-surface-200/40 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 scrollbar-none">
              <button
                type="button"
                onClick={() => handleSendMessage(undefined, 'I want to create AI video ads for my brand. What is the pricing?')}
                className="px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200/80 text-gray-300 hover:text-white shrink-0 transition-all font-semibold flex items-center gap-1 shadow-sm hover:scale-105"
              >
                🚀 AI Reel Pricing
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage(undefined, 'How does the 2-day delivery process work?')}
                className="px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200/80 text-gray-300 hover:text-white shrink-0 transition-all font-semibold flex items-center gap-1 shadow-sm hover:scale-105"
              >
                ⚡ 2-Day Delivery
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage(undefined, 'Can I see recent portfolio reel samples?')}
                className="px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200/80 text-gray-300 hover:text-white shrink-0 transition-all font-semibold flex items-center gap-1 shadow-sm hover:scale-105"
              >
                🎬 Portfolio Reels
              </button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] shrink-0 transition-all font-bold flex items-center gap-1 shadow-sm hover:scale-105"
              >
                💬 WhatsApp
              </a>
            </div>
          )}

          {/* 4. Bottom Chat Input Bar */}
          {!showUserInfoPrompt && (
            <div className="p-3 bg-[#080C16] border-t border-surface-200/60 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message or question..."
                    className="w-full bg-[#0E1524] border border-surface-200/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-2xl py-2.5 pl-3.5 pr-9 text-xs sm:text-sm text-white placeholder-gray-500 outline-none transition-all shadow-inner"
                  />
                  {inputMessage.trim() && (
                    <button
                      type="button"
                      onClick={() => setInputMessage('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="btn-glow p-2.5 sm:px-4 rounded-2xl font-bold text-white text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/25 disabled:opacity-40 disabled:scale-100 hover:scale-105 transition-all shrink-0"
                  aria-label="Send message"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* Floating Action Buttons Column (Shown when chat is CLOSED) */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-center gap-3 pointer-events-auto animate-in fade-in duration-200">
          
          {/* Floating Message Action Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-accent-cyan text-white shadow-2xl shadow-brand-500/40 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Open Live Chat"
            title="Chat with Gujju AI Studio"
          >
            <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-25 pointer-events-none" />
            <MessageSquare className="w-6 h-6 text-white relative z-10" />
            <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-[#0B0F19]/95 border border-surface-200 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
              💬 Live Chat &amp; Message
            </span>
          </button>

          {/* Floating Instagram Action Button */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-xl shadow-pink-600/30 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Open Instagram Profile"
            title="Follow us on Instagram (@gujju__ai__studio)"
          >
            <Instagram className="w-5 h-5 text-white relative z-10" />
            <span className="absolute right-14 px-3 py-1.5 rounded-xl bg-[#0B0F19]/95 border border-surface-200 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
              📸 Follow on Instagram
            </span>
          </a>

          {/* Floating WhatsApp Action Button */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp (+91 99252 63558)"
          >
            <svg className="w-6 h-6 fill-current relative z-10" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.417 0-8.002 3.584-8.003 8.001 0 1.41.368 2.784 1.066 3.994l-1.134 4.14 4.239-1.112c1.172.64 2.497.978 3.829.979h.003c4.418 0 8.003-3.585 8.003-8.003 0-4.417-3.585-8-8.003-8z" />
            </svg>
            <span className="absolute right-14 px-3 py-1.5 rounded-xl bg-[#0B0F19]/95 border border-surface-200 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
              💬 Chat on WhatsApp
            </span>
          </a>

        </div>
      )}
    </>
  );
}
