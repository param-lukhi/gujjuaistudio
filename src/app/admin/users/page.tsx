'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/components/providers/ToastProvider';
import { uploadMediaFile } from '@/lib/uploadClient';
import {
  Users,
  Search,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Trash2,
  Edit,
  Mail,
  Building,
  Phone,
  UserX,
  UserCheck,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Key,
  Shield,
  Filter
} from 'lucide-react';

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT',
    businessName: '',
    phoneNumber: '',
    image: '',
    isVerified: true,
    isBlocked: false,
  });

  const [uploadingUserImage, setUploadingUserImage] = useState(false);
  const adminFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAdminImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingUserImage(true);
    try {
      const url = await uploadMediaFile(file, { folder: 'avatars' });
      setFormData((prev) => ({ ...prev, image: url }));
      showToast('Photo uploaded successfully!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Upload error', 'error');
    } finally {
      setUploadingUserImage(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}&role=${roleFilter}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error('Failed to load admin users:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setModalError(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'CLIENT',
      businessName: '',
      phoneNumber: '',
      image: '',
      isVerified: true,
      isBlocked: false,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (user: any) => {
    setEditingUser(user);
    setModalError(null);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // leave empty unless changing
      role: user.role || 'CLIENT',
      businessName: user.businessName || '',
      phoneNumber: user.phoneNumber || '',
      image: user.image || '',
      isVerified: Boolean(user.isVerified),
      isBlocked: Boolean(user.isBlocked),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setModalError('Email is required');
      return;
    }
    if (!editingUser && !formData.password) {
      setModalError('Password is required for new user account');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      if (editingUser) {
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: editingUser.id,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            businessName: formData.businessName,
            phoneNumber: formData.phoneNumber,
            image: formData.image || undefined,
            isVerified: formData.isVerified,
            isBlocked: formData.isBlocked,
            password: formData.password || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update user');

        showToast('User updated successfully!', 'success');
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create user');

        showToast('New user created successfully!', 'success');
      }

      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBlock = async (userId: string, currentBlocked: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBlocked: !currentBlocked }),
      });
      if (res.ok) {
        showToast(`User ${!currentBlocked ? 'blocked' : 'unblocked'} successfully`, 'success');
        fetchUsers();
      }
    } catch (e) {
      showToast('Failed to update block status', 'error');
    }
  };

  const handleToggleVerify = async (userId: string, currentVerified: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isVerified: !currentVerified }),
      });
      if (res.ok) {
        showToast(`User verification ${!currentVerified ? 'enabled' : 'disabled'}`, 'success');
        fetchUsers();
      }
    } catch (e) {
      showToast('Failed to update verification', 'error');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName || 'Account'}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('User deleted successfully', 'success');
        fetchUsers();
      }
    } catch (e) {
      showToast('Failed to delete user', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080B11] text-white">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 lg:pt-8 space-y-6 overflow-y-auto min-w-0 w-full">
        {/* Header & Search */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-brand-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">User Management</h1>
              <p className="text-xs text-gray-400">Create, edit, verify, block, and manage registered client & admin accounts.</p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="btn-glow px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-brand-500/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New User
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-surface-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, brand, phone..."
              className="w-full bg-surface-100/80 border border-surface-200 focus:border-brand-500 rounded-xl py-2 px-3.5 pl-9 text-xs text-white placeholder-gray-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-gray-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-brand-400" />
              Role:
            </span>
            {['ALL', 'CLIENT', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${roleFilter === r
                    ? 'bg-brand-600 text-white border-brand-400 shadow-sm'
                    : 'bg-surface-100 text-gray-400 border-surface-200 hover:text-white'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table / List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-28 bg-surface-100/50 rounded-2xl" />
            <div className="h-28 bg-surface-100/50 rounded-2xl" />
            <div className="h-28 bg-surface-100/50 rounded-2xl" />
          </div>
        ) : users.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-surface-200/80 text-center space-y-3">
            <Users className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Users Found</h3>
            <p className="text-xs text-gray-400">Try adjusting your search query or click &quot;Add New User&quot;.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <div
                key={u.id}
                className={`glass-panel p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${u.isBlocked
                    ? 'border-rose-500/50 bg-rose-950/20'
                    : 'border-surface-200/80 hover:border-brand-500/40'
                  }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center font-bold text-sm text-brand-300 shrink-0">
                      {u.image ? (
                        <img src={u.image} alt={u.name || ''} className="w-full h-full rounded-2xl object-cover" />
                      ) : (
                        u.name ? u.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-white">{u.name || 'Unnamed Client'}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                          }`}>
                          {u.role}
                        </span>

                        {u.isVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}

                        {u.isBlocked && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <Ban className="w-3 h-3" /> Blocked
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gray-500" /> {u.email}</span>
                        {u.businessName && <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-gray-500" /> {u.businessName}</span>}
                        {u.phoneNumber && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-500" /> {u.phoneNumber}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Edit User Details */}
                    <button
                      onClick={() => handleOpenEditModal(u)}
                      className="px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-gray-200 hover:text-white border border-surface-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      title="Edit User Profile & Role"
                    >
                      <Edit className="w-3.5 h-3.5 text-brand-400" />
                      Edit
                    </button>

                    {/* Verify button */}
                    <button
                      onClick={() => handleToggleVerify(u.id, u.isVerified)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${u.isVerified
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-surface-100 text-gray-300 hover:text-white border border-surface-200'
                        }`}
                    >
                      {u.isVerified ? 'Unverify' : 'Verify'}
                    </button>

                    {/* Block/Unblock button */}
                    <button
                      onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${u.isBlocked
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50'
                          : 'bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:bg-rose-600/50'
                        }`}
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-2 rounded-xl hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-all"
                      title="Delete User Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Add / Edit User */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-lg glass-panel p-6 sm:p-7 rounded-3xl border border-surface-200/80 space-y-5 my-8 max-h-[92vh] overflow-y-auto">

              <div className="flex items-center justify-between border-b border-surface-200/50 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-400" />
                  {editingUser ? 'Edit User Details' : 'Add New User Account'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile Photo Upload Field */}
                <div className="p-4 rounded-2xl bg-surface-100/60 border border-surface-200/80 flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="file"
                    ref={adminFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAdminImageUpload(file);
                    }}
                  />

                  <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center font-bold text-lg text-brand-300 shrink-0 overflow-hidden shadow-md">
                    {formData.image ? (
                      <img src={formData.image} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      formData.name ? formData.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5 w-full">
                    <label className="text-xs font-bold text-gray-300">Profile Photo / Avatar</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adminFileInputRef.current?.click()}
                        disabled={uploadingUserImage}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-600/30 hover:bg-brand-600/50 border border-brand-500/40 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                      >
                        {uploadingUserImage ? 'Uploading...' : '📁 Upload Photo'}
                      </button>
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Or enter Image URL"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-surface-100 border border-surface-200 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                      />
                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400"
                          title="Remove photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Anand Patel"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">
                      {editingUser ? 'New Password (leave blank to keep)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? '••••••••' : 'Enter strong password'}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Account Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500 font-bold text-brand-300"
                    >
                      <option value="CLIENT">CLIENT (Regular User)</option>
                      <option value="ADMIN">ADMIN (Full Control)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Business / Brand Name</label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="e.g. Royal Jewelry Ltd"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="user-verified"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="user-verified" className="text-xs font-semibold text-gray-200 cursor-pointer select-none">
                      Verified Account
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="user-blocked"
                      checked={formData.isBlocked}
                      onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                      className="w-4 h-4 rounded accent-rose-500 cursor-pointer"
                    />
                    <label htmlFor="user-blocked" className="text-xs font-semibold text-rose-300 cursor-pointer select-none">
                      Blocked / Suspended
                    </label>
                  </div>
                </div>

                {/* Actions */}
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
                    {editingUser ? 'Save User Changes' : 'Create User'}
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
