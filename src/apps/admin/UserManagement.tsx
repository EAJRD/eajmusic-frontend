import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminService } from '../../services/api';

// ===========================================
// TYPES
// ===========================================
interface User {
  id: string;
  email: string;
  name: string;
  role: 'ARTIST' | 'LABEL' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  subscription?: {
    plan: 'FREE' | 'PRO' | 'LABEL_PLUS' | 'ENTERPRISE';
    isActive: boolean;
  };
  _count?: {
    releases: number;
  };
}

interface UserDetailModalProps {
  user: User | null;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onRoleChange: (id: string, role: string) => void;
  isProcessing: boolean;
}

// ===========================================
// MOCK DATA
// ===========================================
const generateMockUsers = (): User[] => [
  {
    id: '1',
    email: 'alex.rivera@example.com',
    name: 'Alex Rivera',
    role: 'ARTIST',
    status: 'ACTIVE',
    avatarUrl: 'https://picsum.photos/100/100?random=30',
    createdAt: '2024-01-15T10:00:00Z',
    lastLoginAt: '2024-01-28T08:30:00Z',
    subscription: { plan: 'PRO', isActive: true },
    _count: { releases: 12 },
  },
  {
    id: '2',
    email: 'sarah.chen@example.com',
    name: 'Sarah Chen',
    role: 'ARTIST',
    status: 'ACTIVE',
    avatarUrl: 'https://picsum.photos/100/100?random=31',
    createdAt: '2024-01-10T14:00:00Z',
    lastLoginAt: '2024-01-27T16:45:00Z',
    subscription: { plan: 'FREE', isActive: true },
    _count: { releases: 3 },
  },
  {
    id: '3',
    email: 'marcus.j@example.com',
    name: 'Marcus Johnson',
    role: 'LABEL',
    status: 'ACTIVE',
    avatarUrl: 'https://picsum.photos/100/100?random=32',
    createdAt: '2023-12-05T09:00:00Z',
    lastLoginAt: '2024-01-28T11:00:00Z',
    subscription: { plan: 'LABEL_PLUS', isActive: true },
    _count: { releases: 45 },
  },
  {
    id: '4',
    email: 'emma.wilson@example.com',
    name: 'Emma Wilson',
    role: 'ARTIST',
    status: 'PENDING',
    avatarUrl: 'https://picsum.photos/100/100?random=33',
    createdAt: '2024-01-26T18:00:00Z',
    subscription: { plan: 'FREE', isActive: false },
    _count: { releases: 0 },
  },
  {
    id: '5',
    email: 'james.parker@example.com',
    name: 'James Parker',
    role: 'ARTIST',
    status: 'SUSPENDED',
    avatarUrl: 'https://picsum.photos/100/100?random=34',
    createdAt: '2023-11-20T12:00:00Z',
    lastLoginAt: '2024-01-15T09:00:00Z',
    subscription: { plan: 'PRO', isActive: false },
    _count: { releases: 8 },
  },
  {
    id: '6',
    email: 'olivia.martinez@example.com',
    name: 'Olivia Martinez',
    role: 'ARTIST',
    status: 'ACTIVE',
    avatarUrl: 'https://picsum.photos/100/100?random=35',
    createdAt: '2024-01-20T15:30:00Z',
    lastLoginAt: '2024-01-28T07:15:00Z',
    subscription: { plan: 'FREE', isActive: true },
    _count: { releases: 1 },
  },
  {
    id: '7',
    email: 'admin@eajmusic.com',
    name: 'Admin User',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2023-01-01T00:00:00Z',
    lastLoginAt: '2024-01-28T10:00:00Z',
    _count: { releases: 0 },
  },
];

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getTimeSince = (dateStr?: string): string => {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(dateStr);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'SUSPENDED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'DELETED': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

const getRoleColor = (role: string): string => {
  switch (role) {
    case 'ARTIST': return 'bg-blue-500/10 text-blue-400';
    case 'LABEL': return 'bg-purple-500/10 text-purple-400';
    case 'ADMIN': return 'bg-amber-500/10 text-amber-400';
    case 'SUPER_ADMIN': return 'bg-rose-500/10 text-rose-400';
    default: return 'bg-slate-500/10 text-slate-400';
  }
};

const getPlanColor = (plan?: string): string => {
  switch (plan) {
    case 'PRO': return 'bg-brand-500/10 text-brand-400';
    case 'LABEL_PLUS': return 'bg-purple-500/10 text-purple-400';
    case 'ENTERPRISE': return 'bg-amber-500/10 text-amber-400';
    default: return 'bg-slate-500/10 text-slate-400';
  }
};

// ===========================================
// USER DETAIL MODAL
// ===========================================
const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  onClose,
  onStatusChange,
  onRoleChange,
  isProcessing,
}) => {
  const [newStatus, setNewStatus] = useState(user?.status || 'ACTIVE');
  const [newRole, setNewRole] = useState(user?.role || 'ARTIST');
  const [confirmAction, setConfirmAction] = useState<'status' | 'role' | null>(null);

  if (!user) return null;

  const handleStatusConfirm = () => {
    onStatusChange(user.id, newStatus);
    setConfirmAction(null);
  };

  const handleRoleConfirm = () => {
    onRoleChange(user.id, newRole);
    setConfirmAction(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
            <h2 className="text-xl font-bold text-white">User Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center text-white text-xl font-bold">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                <p className="text-sm text-slate-400">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-dark-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-white">{user._count?.releases || 0}</p>
                <p className="text-xs text-slate-500">Releases</p>
              </div>
              <div className="bg-dark-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-white">{formatDate(user.createdAt).split(',')[0]}</p>
                <p className="text-xs text-slate-500">Joined</p>
              </div>
              <div className="bg-dark-800 rounded-xl p-4 text-center">
                <p className="text-lg font-black text-white">{getTimeSince(user.lastLoginAt)}</p>
                <p className="text-xs text-slate-500">Last Active</p>
              </div>
            </div>

            {/* Subscription */}
            {user.subscription && (
              <div className="bg-dark-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Subscription</p>
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getPlanColor(user.subscription.plan)}`}>
                      {user.subscription.plan}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    user.subscription.isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-slate-500/10 text-slate-400'
                  }`}>
                    {user.subscription.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t border-dark-700">
              {/* Status Change */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Change Status</label>
                <div className="flex gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                  <button
                    onClick={() => setConfirmAction('status')}
                    disabled={newStatus === user.status || isProcessing}
                    className="px-4 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-dark-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Role Change */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Change Role</label>
                <div className="flex gap-2">
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="ARTIST">Artist</option>
                    <option value="LABEL">Label</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button
                    onClick={() => setConfirmAction('role')}
                    disabled={newRole === user.role || isProcessing}
                    className="px-4 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-dark-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Dialog */}
          <AnimatePresence>
            {confirmAction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex items-center justify-center p-6"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-dark-800 rounded-2xl p-6 max-w-sm w-full"
                >
                  <h4 className="text-lg font-bold text-white mb-2">Confirm Action</h4>
                  <p className="text-slate-400 mb-6">
                    {confirmAction === 'status'
                      ? `Are you sure you want to change this user's status to ${newStatus}?`
                      : `Are you sure you want to change this user's role to ${newRole}?`}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmAction === 'status' ? handleStatusConfirm : handleRoleConfirm}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/50 text-white font-bold rounded-xl transition-colors"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const result = await AdminService.getUsers(params);
      setUsers(result.users || []);
    } catch (error) {
      console.log('Using mock users data');
      setUsers(generateMockUsers());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    setIsProcessing(true);
    try {
      await AdminService.updateUserStatus(id, status);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: status as User['status'] } : u))
      );
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      // Update mock data anyway for demo
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: status as User['status'] } : u))
      );
      setSelectedUser(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    setIsProcessing(true);
    try {
      await AdminService.updateUserRole(id, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: role as User['role'] } : u))
      );
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update role:', error);
      // Update mock data anyway for demo
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: role as User['role'] } : u))
      );
      setSelectedUser(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'ACTIVE').length,
    pending: users.filter((u) => u.status === 'PENDING').length,
    suspended: users.filter((u) => u.status === 'SUSPENDED').length,
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">User Management</h1>
        <p className="text-slate-400 text-sm">Manage artists, labels, and administrators</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase font-bold">Total Users</p>
          <p className="text-2xl font-black text-white">{stats.total}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-xs text-emerald-400/70 uppercase font-bold">Active</p>
          <p className="text-2xl font-black text-emerald-400">{stats.active}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-xs text-amber-400/70 uppercase font-bold">Pending</p>
          <p className="text-2xl font-black text-amber-400">{stats.pending}</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
          <p className="text-xs text-rose-400/70 uppercase font-bold">Suspended</p>
          <p className="text-2xl font-black text-rose-400">{stats.suspended}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
        >
          <option value="all">All Roles</option>
          <option value="ARTIST">Artists</option>
          <option value="LABEL">Labels</option>
          <option value="ADMIN">Admins</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-slate-400">Loading users...</p>
          </div>
        </div>
      ) : paginatedUsers.length === 0 ? (
        <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">person_off</span>
          <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
          <p className="text-slate-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="bg-dark-800/50 border border-dark-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-900 text-left">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Plan</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Releases</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Last Active</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {paginatedUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getPlanColor(user.subscription?.plan)}`}>
                        {user.subscription?.plan || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-mono">
                      {user._count?.releases || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {getTimeSince(user.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-dark-700 hover:bg-dark-600 disabled:bg-dark-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-brand-500 text-white'
                        : 'bg-dark-700 hover:bg-dark-600 text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-dark-700 hover:bg-dark-600 disabled:bg-dark-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onStatusChange={handleStatusChange}
          onRoleChange={handleRoleChange}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default UserManagement;
