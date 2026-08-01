import React, { useState } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { validatePassword } from '../../../src/utils/passwordPolicy';

const PREFS_KEY = 'eajmusic_notification_prefs';

// Shared between ArtistSettings and LabelSettings - these two sections don't
// differ by role at all, unlike plan/upgrade copy or the account-specific
// sections each page owns on its own.

export const AccountSecuritySettings: React.FC<{ onToast: (msg: string) => void }> = ({ onToast }) => {
    const { user, forgotPassword, resetPasswordWithCode } = useAuth();

    // Password is InsForge-managed now - there's no "current password" check
    // against this API to run (see AGENTS.md: InsForge owns the credential,
    // this backend only stores an unusable placeholder hash for migrated
    // accounts). Update = send a reset code to the account's own email, same
    // code-based flow as ForgotPassword.tsx, then consume it here.
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ code: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    const handleStartPasswordChange = async () => {
        if (showPasswordForm) {
            setShowPasswordForm(false);
            setCodeSent(false);
            setPasswordForm({ code: '', newPassword: '', confirmPassword: '' });
            setPasswordError('');
            return;
        }
        setShowPasswordForm(true);
        if (!user?.email) return;
        setSendingCode(true);
        setPasswordError('');
        try {
            const result = await forgotPassword(user.email);
            if (result.success) {
                setCodeSent(true);
            } else {
                setPasswordError(result.error || 'Failed to send verification code.');
            }
        } finally {
            setSendingCode(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');

        if (!user?.email) return;
        const pwError = validatePassword(passwordForm.newPassword);
        if (pwError) {
            setPasswordError(pwError);
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }

        setChangingPassword(true);
        try {
            const result = await resetPasswordWithCode(user.email, passwordForm.code, passwordForm.newPassword);
            if (!result.success) {
                setPasswordError(result.error || 'Failed to update password.');
                return;
            }
            setShowPasswordForm(false);
            setCodeSent(false);
            setPasswordForm({ code: '', newPassword: '', confirmPassword: '' });
            onToast('Password updated successfully');
        } catch (err: any) {
            setPasswordError(err.message || 'Failed to update password.');
        } finally {
            setChangingPassword(false);
        }
    };

    return (
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
                    onClick={() => onToast('Email changes require a support request to verify your identity.')}
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
                        onClick={handleStartPasswordChange}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        {showPasswordForm ? 'Cancel' : 'Update'}
                    </button>
                </div>

                {showPasswordForm && (
                    <div className="mt-4 space-y-3">
                        {passwordError && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-xs">
                                {passwordError}
                            </div>
                        )}
                        {sendingCode ? (
                            <p className="text-xs text-slate-500">Sending a verification code to {user?.email}...</p>
                        ) : codeSent ? (
                            <form onSubmit={handleChangePassword} className="space-y-3">
                                <p className="text-xs text-slate-500">
                                    Enter the code we sent to <span className="font-bold">{user?.email}</span> and your new password.
                                </p>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="6-digit code"
                                    value={passwordForm.code}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, code: e.target.value.replace(/\D/g, '') }))}
                                    required
                                    maxLength={6}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm tracking-[0.3em] text-center font-bold"
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
                                    disabled={changingPassword || passwordForm.code.length !== 6}
                                    className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg disabled:opacity-50"
                                >
                                    {changingPassword ? 'Updating...' : 'Confirm Password Change'}
                                </button>
                            </form>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};

export const NotificationSettings: React.FC<{ onToast: (msg: string) => void }> = ({ onToast }) => {
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState(() => {
        try {
            const stored = localStorage.getItem(PREFS_KEY);
            return stored
                ? { emailOnReleaseLive: true, emailOnStatement: true, dashboardAlerts: true, ...JSON.parse(stored) }
                : { emailOnReleaseLive: true, emailOnStatement: true, dashboardAlerts: true };
        } catch {
            return { emailOnReleaseLive: true, emailOnStatement: true, dashboardAlerts: true };
        }
    });

    const handleSave = () => {
        setSaving(true);
        localStorage.setItem(PREFS_KEY, JSON.stringify(settings));
        setSaving(false);
        onToast('Notification preferences saved');
    };

    return (
        <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">notifications</span> Notifications
                </h3>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            <label className="flex items-center gap-4 cursor-pointer">
                <input
                    type="checkbox"
                    checked={settings.emailOnReleaseLive}
                    onChange={e => setSettings((s: any) => ({ ...s, emailOnReleaseLive: e.target.checked }))}
                    className="size-5 rounded text-primary focus:ring-primary border-slate-300"
                />
                <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Email me when a release is live</span>
            </label>

            <label className="flex items-center gap-4 cursor-pointer">
                <input
                    type="checkbox"
                    checked={settings.emailOnStatement}
                    onChange={e => setSettings((s: any) => ({ ...s, emailOnStatement: e.target.checked }))}
                    className="size-5 rounded text-primary focus:ring-primary border-slate-300"
                />
                <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Email me receiving a monthly statement</span>
            </label>

            <label className="flex items-center gap-4 cursor-pointer">
                <input
                    type="checkbox"
                    checked={settings.dashboardAlerts}
                    onChange={e => setSettings((s: any) => ({ ...s, dashboardAlerts: e.target.checked }))}
                    className="size-5 rounded text-primary focus:ring-primary border-slate-300"
                />
                <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Show dashboard alerts for new features</span>
            </label>
        </div>
    );
};

export const DeleteAccountSection: React.FC<{ onToast: (msg: string) => void }> = ({ onToast }) => (
    <div className="pt-8 text-center">
        <button
            onClick={() => {
                if (window.confirm('Account deletion requires a support request so we can verify your identity and settle any pending payouts first. Open a support ticket now?')) {
                    onToast('Please use the Support tab to request account deletion.');
                }
            }}
            className="text-rose-500 font-bold text-sm hover:underline"
        >
            Delete Account
        </button>
    </div>
);
