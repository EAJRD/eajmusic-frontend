import React, { useState } from 'react';

const UsersList: React.FC = () => {
    // Mock Users Data
    const [users, setUsers] = useState([
        { id: 'u1', name: 'Cyber Dreamer', email: 'artist@eajmusic.com', type: 'Artist', plan: 'Pro', status: 'Active', joined: 'Oct 1, 2023', releases: 12 },
        { id: 'u2', name: 'Jane Doe', email: 'jane@example.com', type: 'Artist', plan: 'Free', status: 'Active', joined: 'Aug 15, 2023', releases: 2 },
        { id: 'u3', name: 'SoundWave Labels', email: 'contact@soundwave.com', type: 'Label', plan: 'Label Plus', status: 'Pending', joined: 'Oct 24, 2023', releases: 0 },
    ]);

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Users & Artists</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage platform users and verification requests.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-blue-600 transition-colors">Add User</button>
                    <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Export CSV</button>
                </div>
            </header>

            <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                            <th className="px-8 py-4">User</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Releases</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">{user.name.substring(0, 2).toUpperCase()}</div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">{user.type}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${user.plan === 'Label Plus' ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                                        {user.plan}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${user.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        <span className={`size-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-mono">{user.releases}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersList;
