import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/mockBackend';
import { AdminStats, Release, User, UserRole, TakedownRequest } from '../../types';
import { 
  Logo, 
  ChartIcon, 
  CheckCircleIcon, 
  UserIcon, 
  WarningIcon, 
  DocumentIcon, 
  WalletIcon,
  UploadIcon
} from '../../components/Icons';

type AdminView = 'dashboard' | 'reports' | 'users' | 'takedowns';

const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingReleases, setPendingReleases] = useState<Release[]>([]);
  const [artists, setArtists] = useState<User[]>([]);
  const [takedowns, setTakedowns] = useState<TakedownRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [statsData, pendingData, usersData, takedownsData] = await Promise.all([
        AdminService.getStats(),
        AdminService.getPendingReleases(),
        AdminService.getAllUsers(),
        AdminService.getTakedowns()
      ]);
      setStats(statsData);
      setPendingReleases(pendingData);
      setArtists(usersData);
      setTakedowns(takedownsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-screen bg-gray-50 flex items-center justify-center text-gray-600">Loading Admin Portal...</div>;

  const NavItem = ({ view, icon: Icon, label, badgeCount }: { view: AdminView; icon: any; label: string; badgeCount?: number }) => (
    <button 
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${
        currentView === view ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <div className="relative">
        <Icon className={`w-5 h-5 ${currentView === view ? 'text-brand-600' : 'text-gray-400'}`} />
        {badgeCount ? (
          <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
            {badgeCount}
          </span>
        ) : null}
      </div>
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 h-16">
          <Logo className="w-6 h-6 text-brand-600" />
          <span className="font-extrabold tracking-tight text-gray-900">EAJ<span className="text-gray-500 font-normal">ADMIN</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Overview</p>
          <NavItem view="dashboard" icon={ChartIcon} label="Dashboard" />
          <NavItem view="reports" icon={DocumentIcon} label="Reports & Wallet" />
          <NavItem view="users" icon={UserIcon} label="Users" />
          
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Content</p>
          <NavItem view="dashboard" icon={CheckCircleIcon} label="Approvals" badgeCount={stats?.pendingApprovals} />
          <NavItem view="takedowns" icon={WarningIcon} label="Takedowns" badgeCount={takedowns.length} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800 capitalize">
            {currentView === 'dashboard' ? 'Platform Overview' : currentView.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Logged in as Super Admin</span>
            <div className="h-8 w-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">A</div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {currentView === 'dashboard' && (
            <>
              {/* Admin Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalUsers.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Active Releases</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.activeReleases.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-amber-400">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Pending Review</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats?.pendingApprovals}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Payouts Queued</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">${stats?.totalPayouts.toLocaleString()}</p>
                </div>
              </div>

              {/* Pending Reviews Section */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                  <h3 className="font-bold text-gray-800">Pending Release Approvals</h3>
                  <button className="text-sm text-brand-600 font-medium hover:text-brand-800">Process Queue</button>
                </div>
                
                <ul className="divide-y divide-gray-200">
                  {pendingReleases.length === 0 ? (
                    <li className="p-8 text-center text-gray-500">No pending releases found.</li>
                  ) : (
                    pendingReleases.map(release => (
                      <li key={release.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <img src={release.coverUrl} className="w-16 h-16 rounded shadow-sm object-cover" alt="Cover" />
                          <div>
                            <p className="font-bold text-gray-900">{release.title}</p>
                            <p className="text-sm text-gray-500">{release.artist}</p>
                            <p className="text-xs text-gray-400 mt-1">Submitted: {release.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">Inspect</button>
                          <button className="px-3 py-1.5 bg-brand-600 text-white rounded text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm">Approve</button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          )}

          {currentView === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Form */}
              <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-fit">
                <div className="flex items-center gap-2 mb-6 text-brand-600">
                  <UploadIcon className="w-5 h-5" />
                  <h3 className="font-bold text-lg text-gray-900">Upload Report</h3>
                </div>
                
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Artist</label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500">
                      <option value="">Select an artist...</option>
                      {artists.filter(u => u.role === UserRole.ARTIST).map(artist => (
                        <option key={artist.id} value={artist.id}>{artist.name} ({artist.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-brand-200 bg-brand-50 text-brand-700 rounded-md text-sm font-medium hover:bg-brand-100 focus:outline-none ring-2 ring-brand-500 ring-offset-1">
                        <ChartIcon className="w-4 h-4" /> Stats
                      </button>
                      <button type="button" className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none">
                        <WalletIcon className="w-4 h-4" /> Wallet
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                    <input type="month" className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document (PDF/CSV)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-brand-400 transition-colors cursor-pointer bg-gray-50">
                      <div className="space-y-1 text-center">
                        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <span className="relative cursor-pointer bg-white rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none">
                            <span>Upload a file</span>
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, CSV up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-brand-600 text-white py-2 px-4 rounded-md font-bold hover:bg-brand-700 transition-colors shadow-sm">
                    Upload & Notify Artist
                  </button>
                </form>
              </div>

              {/* History / List */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-bold text-gray-800">Recent Uploads</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                              {i % 2 === 0 ? <WalletIcon className="w-4 h-4" /> : <ChartIcon className="w-4 h-4" />}
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-900">{i % 2 === 0 ? 'Payout Statement' : 'Monthly Stats'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Cyber Dreamer</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 2023</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Sent</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-brand-600 hover:text-brand-900">Download</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentView === 'users' && (
             <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-800">User Management</h3>
                  <input type="text" placeholder="Search users..." className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {artists.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img className="h-8 w-8 rounded-full" src={user.avatar} alt="" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-brand-600 hover:text-brand-900 mr-3">Edit</button>
                          {user.status === 'Suspended' ? (
                             <button className="text-green-600 hover:text-green-900">Activate</button>
                          ) : (
                             <button className="text-red-600 hover:text-red-900">Suspend</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}

          {currentView === 'takedowns' && (
             <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                  <h3 className="font-bold text-red-800 flex items-center gap-2"><WarningIcon className="w-5 h-5"/> Takedown Requests</h3>
                </div>
                {takedowns.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No active takedown requests.</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {takedowns.map((request) => (
                      <li key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-bold text-gray-900">Release ID: {request.releaseId}</p>
                              <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Reason:</span> {request.reason}</p>
                              <p className="text-xs text-gray-500 mt-1">Requested by {request.requester} on {request.date}</p>
                           </div>
                           <div className="flex gap-2">
                             <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">Dismiss</button>
                             <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Takedown Content</button>
                           </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;