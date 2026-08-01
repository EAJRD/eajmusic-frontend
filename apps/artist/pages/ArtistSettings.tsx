import React, { useState } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ArtistService } from '../../../src/services/api';
import { AccountSecuritySettings, NotificationSettings, DeleteAccountSection } from '../components/SettingsSections';

const ArtistSettings: React.FC = () => {
    const { user } = useAuth();
    const [toast, setToast] = useState('');
    const currentPlan = user?.subscription?.plan || 'FREE';
    const [requestingPlan, setRequestingPlan] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(''), 3000);
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
                <AccountSecuritySettings onToast={showToast} />

                {/* Plan Section - artist-framed (Sellos = the LABEL capability an
                    ARTIST doesn't have yet), not shared with LabelSettings. */}
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

                <NotificationSettings onToast={showToast} />
                <DeleteAccountSection onToast={showToast} />
            </div>
        </div>
    );
};

export default ArtistSettings;
