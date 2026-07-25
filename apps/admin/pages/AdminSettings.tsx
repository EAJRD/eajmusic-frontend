import React, { useState, useEffect } from 'react';
import { AdminService } from '../../../src/services/api';

const AdminSettings: React.FC = () => {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowRegistrations, setAllowRegistrations] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingKey, setUpdatingKey] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await AdminService.getSettings();
                if (res?.settings?.maintenance_mode !== undefined) setMaintenanceMode(!!res.settings.maintenance_mode);
                if (res?.settings?.allow_registrations !== undefined) setAllowRegistrations(!!res.settings.allow_registrations);
            } catch (err: any) {
                setError(err.message || 'Failed to load system settings.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const toggleSetting = async (key: 'maintenance_mode' | 'allow_registrations', current: boolean, setter: (v: boolean) => void) => {
        const next = !current;
        setUpdatingKey(key);
        setError('');
        try {
            await AdminService.updateSetting(key, next);
            setter(next);
        } catch (err: any) {
            setError(err.message || 'Failed to update setting.');
        } finally {
            setUpdatingKey(null);
        }
    };

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            <header className="mb-10 text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-black tracking-tight mb-2">System Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Configure global platform parameters (non-visual).</p>
            </header>

            {error && (
                <div className="max-w-3xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="max-w-3xl mx-auto space-y-8">
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">dns</span> API & Integrations
                    </h3>
                    <p className="text-xs text-slate-500">Managed via server environment variables — not editable from this dashboard for security.</p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Payment Gateway (Stripe)</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-mono text-sm" value="Configured via STRIPE_SECRET_KEY" readOnly />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">File Storage</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-mono text-sm" value="Configured via UPLOAD_DIR / S3 env vars" readOnly />
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
                        <button
                            onClick={() => toggleSetting('maintenance_mode', maintenanceMode, setMaintenanceMode)}
                            disabled={loading || updatingKey === 'maintenance_mode'}
                            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors disabled:opacity-50 ${maintenanceMode ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <div className={`size-5 absolute top-0.5 bg-white rounded-full shadow-sm transition-all ${maintenanceMode ? 'right-0.5' : 'left-0.5'}`}></div>
                        </button>
                    </div>

                    <div className="flex justify-between items-center py-2">
                        <div>
                            <p className="font-bold text-sm">Allow New Registrations</p>
                            <p className="text-xs text-slate-500">Toggle public signup form</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('allow_registrations', allowRegistrations, setAllowRegistrations)}
                            disabled={loading || updatingKey === 'allow_registrations'}
                            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors disabled:opacity-50 ${allowRegistrations ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <div className={`size-5 absolute top-0.5 bg-white rounded-full shadow-sm transition-all ${allowRegistrations ? 'right-0.5' : 'left-0.5'}`}></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
