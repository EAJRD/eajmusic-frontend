import React from 'react';

const AdminSettings: React.FC = () => {
    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            <header className="mb-10 text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-black tracking-tight mb-2">System Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Configure global platform parameters (non-visual).</p>
            </header>

            <div className="max-w-3xl mx-auto space-y-8">
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">dns</span> API & Integrations
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Payment Gateway (Stripe)</label>
                            <div className="flex gap-2">
                                <input type="text" className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-mono text-sm" value="pk_test_..." readOnly />
                                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Configure</button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">File Storage (AWS S3)</label>
                            <div className="flex gap-2">
                                <input type="text" className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-mono text-sm" value="s3://eaj-music-bucket-v1" readOnly />
                                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">Configure</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">admin_panel_settings</span> Administration
                    </h3>

                    <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="font-bold text-sm">Site Maintenance Mode</p>
                            <p className="text-xs text-slate-500">Disable frontend access for all users</p>
                        </div>
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                            <div className="size-5 absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-2">
                        <div>
                            <p className="font-bold text-sm">Allow New Registrations</p>
                            <p className="text-xs text-slate-500">Toggle public signup form</p>
                        </div>
                        <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                            <div className="size-5 absolute top-0.5 right-0.5 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
