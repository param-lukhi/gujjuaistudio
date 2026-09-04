'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrencyINR } from '@/lib/utils';
import {
  Package,
  Download,
  MessageSquare,
  FileText,
  RotateCcw,
  Calendar,
  CreditCard,
  PlusCircle,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.user?.orders || []);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-surface-100/50 rounded-3xl" />
          <div className="h-44 bg-surface-100/50 rounded-3xl" />
          <div className="h-44 bg-surface-100/50 rounded-3xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-200/80 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-brand-400 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">My Orders</h1>
              <p className="text-xs text-gray-400">View all your AI reel projects, status, delivery files, and invoices.</p>
            </div>
          </div>

          <Link
            href="/book"
            className="btn-glow px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/25"
          >
            <PlusCircle className="w-4 h-4 text-brand-300" />
            New Order
          </Link>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-surface-200/80 text-center space-y-4">
            <Package className="w-14 h-14 text-gray-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Orders Placed Yet</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              You haven't ordered any AI product reels yet. Get started now to boost your sales!
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-lg shadow-brand-500/30"
            >
              <PlusCircle className="w-4 h-4" /> Book First AI Reel
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="glass-panel p-6 rounded-3xl border border-surface-200/80 space-y-5 hover:border-brand-500/40 transition-all shadow-lg"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-surface-200/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-brand-400">Order #{order.orderNumber}</span>
                      <StatusBadge status={order.status} />
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        Payment: {order.paymentStatus || 'PAID'}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-white">{order.serviceName || order.packageName}</h3>
                    <p className="text-xs text-gray-400">Package: <strong className="text-white">{order.packageName}</strong></p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-xl font-black text-white">{formatCurrencyINR(order.price)}</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3 text-gray-500" /> Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                    {order.expectedDeliveryDate && (
                      <p className="text-[11px] text-brand-300 font-semibold flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-brand-400" /> Expected Delivery: {order.expectedDeliveryDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Chat with Admin */}
                    <Link
                      href={`/dashboard/chats/${order.id}`}
                      className="px-4 py-2.5 rounded-xl bg-brand-600/30 hover:bg-brand-600/50 border border-brand-500/40 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-brand-400" />
                      Chat with Admin
                    </Link>

                    {/* Download Final Video */}
                    {order.videoUrl ? (
                      <a
                        href={order.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition-all"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        Download Video
                      </a>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">Video rendering in progress...</span>
                    )}

                    {/* Invoice */}
                    <a
                      href={`/api/invoices/${order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      Invoice PDF
                    </a>
                  </div>

                  {/* Reorder Button */}
                  <Link
                    href={`/book?package=${order.package || 'professional'}`}
                    className="px-4 py-2.5 rounded-xl bg-surface-100/80 hover:bg-surface-100 border border-surface-200 text-xs font-bold text-brand-300 hover:text-white flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reorder
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
