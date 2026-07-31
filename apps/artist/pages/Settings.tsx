import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { AuthService, ArtistService } from '../../../src/services/api';

const PREFS_KEY = 'eajmusic_notification_prefs';

const Settings: React.FC = () => {
    const { user, logout } = useAuth();
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    const [settings, setSettings] = useState({
        emailOnReleaseLive: true,
        emailOnStatement: true,
        dashboardAlerts: true,
    });

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    const currentPlan = user?.subscription?.plan || 'FREE';
    const [requestingPlan, setRequestingPlan] = useState<string | null>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(PREFS_KEY);
            if (stored) setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
        } catch {
            // Ignore malformed local prefs.
        }
    }, []);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(''), 3000);
    };

    const handleSave = () => {
        setSaving(true);
        localStorage.setItem(PREFS_KEY, JSON.stringify(settings));
        setSaving(false);
        showToast('Notification preferences saved');
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');

        if (passwordForm.newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters.');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }

        setChangingPassword(true);
        try {
            await AuthService.changePassword(passwordForm.currentPassword, passwordForm.newPassword, passwordForm.confirmPassword);
            setShowPasswordForm(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showToast('Password updated successfully');
        } catch (err: any) {
            setPasswordError(err.message || 'Failed to update password.');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleRequestUpgrade = async (targetPlan: 'PRO' | 'LABEL_PLUS' | 'ENTERPRISE') => {
        setRequestingPlan(targetPlan);
        try {
            await ArtistService.requestPlanUpgrade(targetPlan);
            showToast(`Solicitud enviada. Nuestro equipo te contactará para completar el upgrade a ${targetPlan}.`);
        } catch (err: any) {
            showToast(err.message || 'No pudimos enviar la solicitud. Intenta de nuevo.');
        } finally {
            setRequestingPlan(null);
        }
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Account deletion requires a support request so we can verify your identity and settle any pending payouts first. Open a support ticket now?')) {
            showToast('Please use the Support tab to request account deletion.');
        }
    };

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
                        {saving ? 'Saving...' : 'Save Notification Preferences'}
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
                            <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        <button
                            onClick={() => showToast('Email changes require a support request to verify your identity.')}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Change
                        </button>
                    </div>

                    <div className="py-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-sm">Password</p>
                                <p className="text-xs text-slate-500">Keep your account secure with a strong password.</p>
                            </div>
                            <button
                                onClick={() => setShowPasswordForm((v) => !v)}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                {showPasswordForm ? 'Cancel' : 'Update'}
                            </button>
                        </div>

                        {showPasswordForm && (
                            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
                                {passwordError && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-xs">
                                        {passwordError}
                                    </div>
                                )}
                                <input
                                    type="password"
                                    placeholder="Current password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                                />
                                <input
                                    type="password"
                                    placeholder="New password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={changingPassword}
                                    className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg disabled:opacity-50"
                                >
                                    {changingPassword ? 'Updating...' : 'Confirm Password Change'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Plan Section */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">workspace_premium</span> Plan
                    </h3>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Plan actual</p>
                            <p className="text-xl font-black">{currentPlan}</p>
                        </div>
                        {currentPlan === 'FREE' && (
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg">
                                Sellos bloqueados · lanzamientos con 45 días de anticipación
                            </span>
                        )}
                    </div>

                    {currentPlan === 'FREE' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(['PRO', 'LABEL_PLUS'] as const).map((plan) => (
                                <div key={plan} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-3">
                                    <p className="font-black text-lg">{plan === 'PRO' ? 'Pro' : 'Label+'}</p>
                                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 flex-1">
                                        <li>Lanzamientos con solo 21 días de anticipación</li>
                                        <li>Gestión completa de Sellos</li>
                                        {plan === 'LABEL_PLUS' && <li>Gestiona múltiples artistas bajo tu sello</li>}
                                    </ul>
                                    <button
                                        onClick={() => handleRequestUpgrade(plan)}
                                        disabled={requestingPlan !== null}
                                        className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg disabled:opacity-50"
                                    >
                                        {requestingPlan === plan ? 'Enviando...' : `Solicitar ${plan === 'PRO' ? 'Pro' : 'Label+'}`}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Ya tienes acceso a Sellos y lanzamientos con 21 días de anticipación.{' '}
                            <button onClick={() => handleRequestUpgrade('ENTERPRISE')} disabled={requestingPlan !== null} className="text-primary font-bold hover:underline disabled:opacity-50">
                                {requestingPlan === 'ENTERPRISE' ? 'Enviando...' : '¿Necesitas más? Solicita Enterprise'}
                            </button>
                        </p>
                    )}
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
                    <button onClick={handleDeleteAccount} className="text-rose-500 font-bold text-sm hover:underline">Delete Account</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
