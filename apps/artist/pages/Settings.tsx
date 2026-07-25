import React, { useState, useEffect } from 'react';
import api from '../../../services/apiClient';

const Settings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    const [settings, setSettings] = useState({
        twoFactorAuth: false,
        emailOnReleaseLive: true,
        emailOnStatement: true,
        dashboardAlerts: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await api.get('/api/auth/settings').catch(() => null);
                if (data) {
                    setSettings(prev => ({ ...prev, ...data }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/api/auth/settings', settings);
            setToast('Settings saved successfully');
        } catch (err) {
            setToast('Failed to save settings');
        } finally {
            setSaving(false);
            setTimeout(() => setToast(''), 3000);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            {toast && (
                <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-400">info</span>
                    <p className="font-bold">{toast}</p>
                </div>
            )}
            <header className="mb-10 text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-black tracking-tight mb-2">Account Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Security preferences and notification settings.</p>
            </header>

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-end mb-4">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
                
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
                        <div 
                            onClick={() => setSettings(s => ({ ...s, twoFactorAuth: !s.twoFactorAuth }))}
                            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${settings.twoFactorAuth ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <div className={`size-5 absolute top-0.5 bg-white rounded-full shadow-sm transition-transform ${settings.twoFactorAuth ? 'translate-x-5' : 'left-0.5'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">notifications</span> Notifications
                    </h3>

                    <label className="flex items-center gap-4 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.emailOnReleaseLive}
                            onChange={e => setSettings(s => ({ ...s, emailOnReleaseLive: e.target.checked }))}
                            className="size-5 rounded text-primary focus:ring-primary border-slate-300" 
                        />
                        <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Email me when a release is live</span>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.emailOnStatement}
                            onChange={e => setSettings(s => ({ ...s, emailOnStatement: e.target.checked }))}
                            className="size-5 rounded text-primary focus:ring-primary border-slate-300" 
                        />
                        <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Email me receiving a monthly statement</span>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={settings.dashboardAlerts}
                            onChange={e => setSettings(s => ({ ...s, dashboardAlerts: e.target.checked }))}
                            className="size-5 rounded text-primary focus:ring-primary border-slate-300" 
                        />
                        <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Show dashboard alerts for new features</span>
                    </label>
                </div>

                <div className="pt-8 text-center">
                    <button className="text-rose-500 font-bold text-sm hover:underline">Delete Account</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
