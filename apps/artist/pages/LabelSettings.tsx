import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ArtistService } from '../../../src/services/api';
import { AccountSecuritySettings, NotificationSettings, DeleteAccountSection } from '../components/SettingsSections';

// LABEL's own settings page - deliberately not the same component as
// ArtistSettings. A LABEL account already has Sello capability by
// definition, so the ARTIST page's "unlock Sellos with Pro/Label+" upsell
// makes no sense here; this shows the label's own profile instead.
const LabelSettings: React.FC = () => {
    const { user } = useAuth();
    const [toast, setToast] = useState('');
    const [labelName, setLabelName] = useState('');
    const [requestingPlan, setRequestingPlan] = useState(false);
    const currentPlan = user?.subscription?.plan || 'FREE';

    useEffect(() => {
        ArtistService.getLabel()
            .then((res) => setLabelName(res?.ownedLabel?.name || ''))
            .catch(() => {});
    }, []);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(''), 3000);
    };

    const handleRequestUpgrade = async () => {
        setRequestingPlan(true);
        try {
            await ArtistService.requestPlanUpgrade('ENTERPRISE');
            showToast('Solicitud enviada. Nuestro equipo te contactará para completar el upgrade a Enterprise.');
        } catch (err: any) {
            showToast(err.message || 'No pudimos enviar la solicitud. Intenta de nuevo.');
        } finally {
            setRequestingPlan(false);
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
                <h1 className="text-3xl font-black tracking-tight mb-2">Label Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Your label profile, account security, and notifications.</p>
            </header>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Label Profile */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">business</span> Label Profile
                    </h3>
                    <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="font-bold text-sm">Label Name</p>
                            <p className="text-xs text-slate-500">{labelName || '—'}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-sm">Branding</p>
                            <p className="text-xs text-slate-500">Logo and colors for your label's public pages.</p>
                        </div>
                        <button
                            onClick={() => showToast('Contáctanos por Support para actualizar el branding de tu Sello.')}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Request Update
                        </button>
                    </div>
                </div>

                <AccountSecuritySettings onToast={showToast} />

                {/* Plan Section - label-framed, no "unlock Sellos" upsell */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">workspace_premium</span> Plan
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Plan actual</p>
                            <p className="text-xl font-black">{currentPlan}</p>
                        </div>
                        <button onClick={handleRequestUpgrade} disabled={requestingPlan} className="text-primary font-bold text-sm hover:underline disabled:opacity-50">
                            {requestingPlan ? 'Enviando...' : '¿Necesitas más? Solicita Enterprise'}
                        </button>
                    </div>
                </div>

                <NotificationSettings onToast={showToast} />
                <DeleteAccountSection onToast={showToast} />
            </div>
        </div>
    );
};

export default LabelSettings;
