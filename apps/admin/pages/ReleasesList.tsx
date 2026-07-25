import React, { useState, useEffect } from 'react';

// Fallback mock data - replace when API is connected
const MOCK_RELEASES = [
  {
    id: 'rel_1',
    title: 'Midnight Sun',
    artist: 'The Starlight Band',
    label: 'Starlight Records',
    type: 'Single',
    genre: 'Pop',
    language: 'English',
    upc: '198765432109',
    submittedAt: 'Jul 20, 2026',
    status: 'Pending',
    coverArtUrl: '',
    copyright: {
      cline: '© 2026 Starlight Records',
      pline: '℗ 2026 Starlight Records'
    },
    stores: ['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music'],
    tracks: [
      { id: 't_1', title: 'Midnight Sun', isrc: 'US1232645678', duration: '3:45', explicit: false }
    ]
  },
  {
    id: 'rel_2',
    title: 'Neon Dreams',
    artist: 'Synthwave Joe',
    label: 'Independent',
    type: 'Album',
    genre: 'Electronic',
    language: 'English',
    upc: '198765432110',
    submittedAt: 'Jul 21, 2026',
    status: 'Live',
    coverArtUrl: '',
    copyright: {
      cline: '© 2026 Synthwave Joe',
      pline: '℗ 2026 Synthwave Joe'
    },
    stores: ['Spotify', 'Apple Music'],
    tracks: [
      { id: 't_2', title: 'Neon Dreams Intro', isrc: 'US1232645679', duration: '1:20', explicit: false },
      { id: 't_3', title: 'City Lights', isrc: 'US1232645680', duration: '4:15', explicit: false }
    ]
  },
  {
    id: 'rel_3',
    title: 'Summer Vibes',
    artist: 'DJ Chill',
    label: 'Chill Records',
    type: 'EP',
    genre: 'Dance',
    language: 'English',
    upc: '198765432111',
    submittedAt: 'Jul 22, 2026',
    status: 'Draft',
    coverArtUrl: '',
    copyright: {
      cline: '© 2026 Chill Records',
      pline: '℗ 2026 Chill Records'
    },
    stores: ['All Stores'],
    tracks: [
      { id: 't_4', title: 'Summer Vibes (Original Mix)', isrc: 'US1232645681', duration: '5:30', explicit: false }
    ]
  },
  {
    id: 'rel_4',
    title: 'Rage Mode',
    artist: 'Lil Angry',
    label: 'Rage Records',
    type: 'Single',
    genre: 'Hip Hop',
    language: 'English',
    upc: '198765432112',
    submittedAt: 'Jul 23, 2026',
    status: 'Rejected',
    coverArtUrl: '',
    copyright: {
      cline: '© 2026 Rage Records',
      pline: '℗ 2026 Rage Records'
    },
    stores: ['Spotify', 'Apple Music'],
    tracks: [
      { id: 't_5', title: 'Rage Mode', isrc: 'US1232645682', duration: '2:45', explicit: true }
    ]
  }
];

const ReleasesList: React.FC = () => {
  const [releases, setReleases] = useState(MOCK_RELEASES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedRelease, setSelectedRelease] = useState<any | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/releases', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const json = await res.json();
          setReleases(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleReviewAction = async (status: 'Live' | 'Rejected') => {
    if (status === 'Rejected' && !rejectReason.trim()) return;

    try {
      // Mock API call
      // await fetch(`/api/admin/releases/${selectedRelease.id}/review`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      //   body: JSON.stringify({ status, reason: rejectReason })
      // });
      
      setReleases(releases.map(r => r.id === selectedRelease.id ? { ...r, status } : r));
      setSelectedRelease(null);
      setRejecting(false);
      setRejectReason('');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReleases = releases.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'Rejected': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
      case 'Draft': default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Album': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400';
      case 'EP': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'Single': default: return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Releases Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold">Review, approve, and manage music releases.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              type="text" 
              placeholder="Search releases..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm focus:outline-none focus:border-brand-500 dark:focus:border-brand-500"
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 appearance-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Live">Live</option>
            <option value="Rejected">Rejected</option>
            <option value="Draft">Draft</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-dark-900 transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
        </div>
      </header>

      {/* Releases Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <th className="px-6 py-4">Release</th>
                <th className="px-6 py-4">Type & Genre</th>
                <th className="px-6 py-4">UPC</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
              {filteredReleases.map(release => (
                <tr key={release.id} className="hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={release.coverArtUrl || 'https://placehold.co/80x80/1a1a2e/7c3aed?text=♪'} 
                        alt="Cover" 
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{release.title}</p>
                        <p className="text-xs text-slate-500">{release.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getTypeColor(release.type)}`}>{release.type}</span>
                      <span className="text-xs text-slate-500">{release.genre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{release.upc}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {release.submittedAt}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(release.status)}`}>
                      {release.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {release.status === 'Pending' ? (
                      <button 
                        onClick={() => setSelectedRelease(release)}
                        className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-brand-500/20"
                      >
                        Review
                      </button>
                    ) : (
                      <button 
                        onClick={() => setSelectedRelease(release)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReleases.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
              <p>No releases found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-card-dark w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-500">rate_review</span>
                {selectedRelease.status === 'Pending' ? 'Review Release' : 'Release Details'}
              </h2>
              <button 
                onClick={() => { setSelectedRelease(null); setRejecting(false); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-dark-950">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Artwork & Actions */}
                <div className="space-y-6">
                  <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-dark-800 shadow-sm bg-white dark:bg-dark-900">
                    <img 
                      src={selectedRelease.coverArtUrl || 'https://placehold.co/800x800/1a1a2e/7c3aed?text=Cover+Art'} 
                      alt="Cover" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {selectedRelease.status === 'Pending' && (
                    <div className="space-y-3 bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm">
                      {!rejecting ? (
                        <>
                          <button 
                            onClick={() => handleReviewAction('Live')}
                            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined">check_circle</span>
                            Approve Release
                          </button>
                          <button 
                            onClick={() => setRejecting(true)}
                            className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined">cancel</span>
                            Reject Release
                          </button>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">warning</span> Reason for Rejection
                          </label>
                          <textarea 
                            autoFocus
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="E.g., Cover art resolution too low..."
                            className="w-full p-3 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg text-sm focus:outline-none focus:border-rose-500 min-h-[100px] resize-none"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setRejecting(false)}
                              className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors text-sm"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleReviewAction('Rejected')}
                              disabled={!rejectReason.trim()}
                              className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-lg transition-colors text-sm"
                            >
                              Confirm Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Col: Metadata */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedRelease.title}</h3>
                      <p className="text-lg font-bold text-brand-500">{selectedRelease.artist}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Release Type</p>
                        <p className="text-sm font-medium">{selectedRelease.type}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Primary Genre</p>
                        <p className="text-sm font-medium">{selectedRelease.genre}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Language</p>
                        <p className="text-sm font-medium">{selectedRelease.language}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Record Label</p>
                        <p className="text-sm font-medium">{selectedRelease.label}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">UPC Code</p>
                        <p className="font-mono text-sm">{selectedRelease.upc}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Status</p>
                        <p className="text-sm font-medium">{selectedRelease.status}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-dark-800 space-y-2">
                      <p className="text-xs font-mono text-slate-500">{selectedRelease.copyright?.cline}</p>
                      <p className="text-xs font-mono text-slate-500">{selectedRelease.copyright?.pline}</p>
                    </div>
                  </div>

                  {/* Tracklist */}
                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Tracklist ({selectedRelease.tracks?.length})</h4>
                    <div className="space-y-2">
                      {selectedRelease.tracks?.map((track: any, idx: number) => (
                        <div key={track.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-dark-800">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-400 w-4">{idx + 1}</span>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {track.title}
                                {track.explicit && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">E</span>}
                              </p>
                              <p className="text-xs font-mono text-slate-500">ISRC: {track.isrc}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-slate-500">{track.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stores */}
                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Selected Stores</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRelease.stores?.map((store: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dark-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {store}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReleasesList;
