import React, { useState } from 'react';

const ReleasesList: React.FC = () => {
    // Mock data - in real app would come from API
    const [releases, setReleases] = useState([
        { id: 'rel_2', title: 'Acoustic Soul', artist: 'Jane Doe', status: 'Pending', date: '2023-10-22', artwork: 'https://picsum.photos/200/200?random=2' },
        { id: 'rel_3', title: 'Bass Drop Protocol', artist: 'DJ Hz', status: 'Draft', date: '2023-10-25', artwork: 'https://picsum.photos/200/200?random=3' },
        { id: 'rel_1', title: 'Neon Nights', artist: 'Cyber Dreamer', status: 'Live', date: '2023-10-15', artwork: 'https://picsum.photos/200/200?random=1' }
    ]);

    const handleApprove = (id: string) => {
        setReleases(releases.map(r => r.id === id ? { ...r, status: 'Live' } : r));
    };

    const handleReject = (id: string) => {
        setReleases(releases.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    };

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Releases Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Review and manage all music submissions.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Filters</button>
                    <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Export CSV</button>
                </div>
            </header>

            <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                            <th className="px-8 py-4">Release</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Submitted</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {releases.map(release => (
                            <tr key={release.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-lg bg-slate-200 dark:bg-slate-700 bg-cover bg-center shadow-sm" style={{ backgroundImage: `url('${release.artwork}')` }}></div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{release.title}</p>
                                            <p className="text-xs text-slate-500">{release.artist}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${release.status === 'Live' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                            release.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                        }`}>
                                        {release.status === 'Pending' && <span className="size-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>}
                                        {release.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-500">{release.date}</td>
                                <td className="px-6 py-4 text-right">
                                    {release.status === 'Pending' ? (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleReject(release.id)}
                                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 dark:hover:bg-rose-500/10 transition-colors"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(release.id)}
                                                className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 shadow-md shadow-brand-500/20 transition-all"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs">Manage</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReleasesList;
