import React, { useState, useEffect } from 'react';

// Fallback mock data - replace when API is connected
const MOCK_USERS = [
  {
    id: 'u_1',
    name: 'Sarah Beats',
    email: 'sarah@example.com',
    role: 'Artist',
    plan: 'PRO',
    status: 'Active',
    releasesCount: 12,
    joinedAt: 'Jan 15, 2026',
    lastLogin: '2h ago',
    wallet: { available: 450.50, pending: 120.00, lifetime: 2450.00 },
    recentReleases: [
      { id: 'r_1', title: 'Summer Anthem', status: 'Live' },
      { id: 'r_2', title: 'Late Night Drives', status: 'Pending' }
    ]
  },
  {
    id: 'u_2',
    name: 'Chill Records',
    email: 'contact@chillrecords.com',
    role: 'Label',
    plan: 'LABEL_PLUS',
    status: 'Active',
    releasesCount: 45,
    joinedAt: 'Nov 02, 2025',
    lastLogin: '1d ago',
    wallet: { available: 1250.00, pending: 400.00, lifetime: 8900.00 },
    recentReleases: [
      { id: 'r_3', title: 'Lo-Fi Study Beats', status: 'Live' },
      { id: 'r_4', title: 'Midnight Jazz', status: 'Live' }
    ]
  },
  {
    id: 'u_3',
    name: 'Newcomer Dan',
    email: 'dan.new@example.com',
    role: 'Artist',
    plan: 'FREE',
    status: 'Pending',
    releasesCount: 0,
    joinedAt: 'Jul 24, 2026',
    lastLogin: '5m ago',
    wallet: { available: 0, pending: 0, lifetime: 0 },
    recentReleases: []
  },
  {
    id: 'u_4',
    name: 'Bad Actor',
    email: 'spam@example.com',
    role: 'Artist',
    plan: 'FREE',
    status: 'Suspended',
    releasesCount: 2,
    joinedAt: 'Mar 10, 2026',
    lastLogin: '1mo ago',
    wallet: { available: 0, pending: 0, lifetime: 12.50 },
    recentReleases: [
      { id: 'r_5', title: 'Spam Track 1', status: 'Rejected' }
    ]
  }
];

const UsersList: React.FC = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const json = await res.json();
          setUsers(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === 'Suspended' ? 'Active' : 'Suspended';
    if (newStatus === 'Suspended' && !window.confirm(`Are you sure you want to suspend ${selectedUser.name}?`)) return;

    try {
      // Mock API call
      // await fetch(`/api/admin/users/${selectedUser.id}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      const updatedUser = { ...selectedUser, status: newStatus };
      setSelectedUser(updatedUser);
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (newRole: string) => {
    if (!selectedUser) return;
    try {
      const updatedUser = { ...selectedUser, role: newRole };
      setSelectedUser(updatedUser);
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePlan = async (newPlan: string) => {
    if (!selectedUser) return;
    try {
      const updatedUser = { ...selectedUser, plan: newPlan };
      setSelectedUser(updatedUser);
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
      case 'Label': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400';
      case 'Artist': default: return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
    }
  };

  const getAvatarBg = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-rose-500 text-white';
      case 'Label': return 'bg-indigo-500 text-white';
      case 'Artist': default: return 'bg-blue-500 text-white';
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'LABEL_PLUS': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30';
      case 'PRO': return 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 border-brand-200 dark:border-brand-500/30';
      case 'FREE': default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Users & Artists</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold">Manage accounts, roles, and platform access.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm focus:outline-none focus:border-brand-500 dark:focus:border-brand-500"
            />
          </div>
          
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 appearance-none"
          >
            <option value="All">All Roles</option>
            <option value="Artist">Artist</option>
            <option value="Label">Label</option>
            <option value="Admin">Admin</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 appearance-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </header>

      {/* Users Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role & Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Releases</th>
                <th className="px-6 py-4">Joined & Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarBg(user.role)}`}>
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRoleColor(user.role)}`}>{user.role}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPlanBadge(user.plan)}`}>{user.plan}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{user.releasesCount}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    <p className="text-sm">{user.joinedAt}</p>
                    <p className="text-xs text-slate-500">{user.lastLogin}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
              <p>No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Drawer Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm transition-opacity">
          {/* Drawer */}
          <div className="bg-white dark:bg-card-dark w-full max-w-[480px] h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden border-l border-slate-200 dark:border-dark-800">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                User Details
              </h2>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-dark-800 rounded-full text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${getAvatarBg(selectedUser.role)}`}>
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedUser.name}</h3>
                  <p className="text-sm font-medium text-slate-500">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRoleColor(selectedUser.role)}`}>{selectedUser.role}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getPlanBadge(selectedUser.plan)}`}>{selectedUser.plan}</span>
                  </div>
                </div>
              </div>

              {/* Wallet Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Wallet Balance</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-dark-900 p-3 rounded-lg border border-slate-100 dark:border-dark-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Available</p>
                    <p className="text-lg font-black text-emerald-500">${selectedUser.wallet?.available.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-dark-900 p-3 rounded-lg border border-slate-100 dark:border-dark-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Pending</p>
                    <p className="text-lg font-black text-amber-500">${selectedUser.wallet?.pending.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-dark-900 p-3 rounded-lg border border-slate-100 dark:border-dark-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Lifetime</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">${selectedUser.wallet?.lifetime.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-dark-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Management</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-dark-800">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Account Status</p>
                      <p className="text-xs text-slate-500">Current: {selectedUser.status}</p>
                    </div>
                    <button 
                      onClick={handleStatusToggle}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-colors ${selectedUser.status === 'Suspended' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                    >
                      {selectedUser.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-dark-800">
                    <label className="text-sm font-bold text-slate-900 dark:text-white">Change Role</label>
                    <select 
                      value={selectedUser.role}
                      onChange={(e) => handleChangeRole(e.target.value)}
                      className="p-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                    >
                      <option value="Artist">Artist</option>
                      <option value="Label">Label</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-dark-800">
                    <label className="text-sm font-bold text-slate-900 dark:text-white">Change Plan</label>
                    <select 
                      value={selectedUser.plan}
                      onChange={(e) => handleChangePlan(e.target.value)}
                      className="p-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                    >
                      <option value="FREE">FREE</option>
                      <option value="PRO">PRO</option>
                      <option value="LABEL_PLUS">LABEL PLUS</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Recent Releases */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-dark-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Recent Releases</h4>
                {selectedUser.recentReleases?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.recentReleases.map((release: any) => (
                      <div key={release.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-dark-800">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-400">album</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{release.title}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          release.status === 'Live' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200' :
                          release.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200'
                        }`}>
                          {release.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No releases yet.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
