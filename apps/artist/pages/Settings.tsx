import React from 'react';

const Settings: React.FC = () => {
    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            <header className="mb-10 text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-black tracking-tight mb-2">Account Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Security preferences and notification settings.</p>
            </header>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Security Section */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">lock</span> Security
                    </h3>

                    <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="font-bold text-sm">Email Address</p>
                            <p className="text-xs text-slate-500">artist@eajmusic.com</p>
                        </div>
                        <button className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Change</button>
                    </div>

                    <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="font-bold text-sm">Password</p>
                            <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                        </div>
                        <button className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Update</button>
                    </div>

                    <div className="flex justify-between items-center py-2">
                        <div>
                            <p className="font-bold text-sm">Two-Factor Authentication</p>
                            <p className="text-xs text-slate-500">Add an extra layer of security</p>
                        </div>
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                            <div className="size-5 absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">notifications</span> Notifications
                    </h3>

                    {[
                        'Email me when a release is live',
                        'Email me receiving a monthly statement',
                        'Show dashboard alerts for new features'
                    ].map((label, i) => (
                        <label key={i} className="flex items-center gap-4 cursor-pointer">
                            <input type="checkbox" defaultChecked className="size-5 rounded text-primary focus:ring-primary border-slate-300" />
                            <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{label}</span>
                        </label>
                    ))}
                </div>

                <div className="pt-8 text-center">
                    <button className="text-rose-500 font-bold text-sm hover:underline">Delete Account</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
