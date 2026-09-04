'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/components/providers/ToastProvider';
import {
  Bell,
  CheckCircle2,
  Package,
  CreditCard,
  MailCheck,
  Video,
  Lock,
  UserCheck,
  Clock,
  CheckCheck
} from 'lucide-react';

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        showToast('All notifications marked as read', 'success');
        fetchNotifications();
      }
    } catch (e) {
      showToast('Failed to update notifications', 'error');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_ACCEPTED':
      case 'STATUS_CHANGE':
        return <Package className="w-5 h-5 text-brand-400" />;
      case 'PAYMENT':
        return <CreditCard className="w-5 h-5 text-emerald-400" />;
      case 'ADMIN_REPLY':
        return <MailCheck className="w-5 h-5 text-accent-violet" />;
      case 'PROJECT_COMPLETED':
      case 'FILE_UPLOADED':
        return <Video className="w-5 h-5 text-accent-cyan" />;
      case 'PASSWORD_CHANGED':
        return <Lock className="w-5 h-5 text-amber-400" />;
      case 'PROFILE_UPDATED':
        return <UserCheck className="w-5 h-5 text-sky-400" />;
      default:
        return <Bell className="w-5 h-5 text-brand-400" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-surface-100/50 rounded-3xl" />
          <div className="h-24 bg-surface-100/50 rounded-2xl" />
          <div className="h-24 bg-surface-100/50 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-200/80 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-brand-400 flex items-center justify-center relative">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Notifications</h1>
              <p className="text-xs text-gray-400">Activity updates regarding your orders, payments, admin replies, and security.</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-surface-200/80 text-center space-y-3">
            <Bell className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Notifications Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              You will receive real-time alerts when your order status changes or admin responds.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`glass-panel p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  !n.read
                    ? 'border-brand-500/50 bg-gradient-to-r from-brand-950/40 to-surface-100/50 shadow-md shadow-brand-500/10'
                    : 'border-surface-200/70 opacity-95'
                }`}
              >
                <div className="p-3 rounded-xl bg-surface-100 border border-surface-200 shrink-0">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      {n.title}
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                      )}
                    </h4>
                    <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>

                  {n.link && (
                    <div className="pt-1">
                      <Link
                        href={n.link}
                        className="text-xs font-bold text-brand-400 hover:underline inline-flex items-center gap-1"
                      >
                        View Details →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
