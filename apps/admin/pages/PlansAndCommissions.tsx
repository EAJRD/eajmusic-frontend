import React, { useState, useEffect } from 'react';
import { AdminService } from '../../../src/services/api';

const SETTINGS_KEY = 'plans_config';

const INITIAL_STATE = {
  freeCommission: 15,
  proCommission: 0,
  labelCommission: 5,
  freeMonthly: '0.00',
  freeAnnual: '0.00',
  freeArtists: '1',
  proMonthly: '14.99',
  proAnnual: '149.00',
  proArtists: '5',
  labelMonthly: '49.99',
  labelAnnual: '499.00',
  labelArtists: 'Unlimited',
  minPayout: '50',
  standardProcessing: '7',
  features: {
    youtube: { free: false, pro: true, label: true },
    instant: { free: false, pro: true, label: true },
    analytics: { free: false, pro: true, label: true },
    support: { free: false, pro: true, label: true },
    whitelabel: { free: false, pro: false, label: true },
    dolby: { free: false, pro: false, label: true }
  }
};

const PlansAndCommissions: React.FC = () => {
  const [state, setState] = useState(INITIAL_STATE);
  const [initialState, setInitialState] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await AdminService.getSettings();
        const saved = res?.settings?.[SETTINGS_KEY];
        if (saved) {
          setState(saved);
          setInitialState(saved);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load saved settings — showing defaults.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isDirty = JSON.stringify(state) !== JSON.stringify(initialState);
  
  // Calculate how many sections have unsaved changes
  const dirtySectionsCount = () => {
    let count = 0;
    if (
      state.freeMonthly !== initialState.freeMonthly || state.freeAnnual !== initialState.freeAnnual || state.freeArtists !== initialState.freeArtists ||
      state.proMonthly !== initialState.proMonthly || state.proAnnual !== initialState.proAnnual || state.proArtists !== initialState.proArtists ||
      state.labelMonthly !== initialState.labelMonthly || state.labelAnnual !== initialState.labelAnnual || state.labelArtists !== initialState.labelArtists
    ) count++;
    
    if (state.freeCommission !== initialState.freeCommission || state.proCommission !== initialState.proCommission || state.labelCommission !== initialState.labelCommission) count++;
    
    if (JSON.stringify(state.features) !== JSON.stringify(initialState.features)) count++;
    
    if (state.minPayout !== initialState.minPayout || state.standardProcessing !== initialState.standardProcessing) count++;
    
    return count;
  };

  const sectionsChanged = dirtySectionsCount();

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await AdminService.updateSetting(SETTINGS_KEY, state, 'Subscription plan pricing, commissions, and feature entitlements');
      setInitialState(state);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setState(initialState);
  };

  const updateState = (key: string, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const updateFeature = (feature: string, plan: string, value: boolean) => {
    setState(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: {
          ...(prev.features as any)[feature],
          [plan]: value
        }
      }
    }));
  };

  const getInputClass = (key: string) => {
    const isChanged = (state as any)[key] !== (initialState as any)[key];
    return `w-full bg-slate-50 dark:bg-dark-900 border ${isChanged ? 'border-brand-500 border-l-4' : 'border-transparent dark:border-dark-800'} rounded-lg focus:ring-2 focus:ring-brand-500 text-lg font-bold text-slate-900 dark:text-white px-3 py-2 transition-all`;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-24 font-sans">
      <header className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Plans & Commissions</h2>
        <p className="text-slate-500 font-bold mt-2">Configure subscription tiers and platform-wide business rules.</p>
        {loading && <p className="text-sm text-slate-400 mt-2">Loading saved configuration...</p>}
        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </header>

      {/* Section 1: Active Plans */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-brand-500 text-2xl">credit_card</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Active Plans</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-xl p-6 shadow-sm flex flex-col gap-4 relative">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Free</h4>
              <span className="bg-slate-100 dark:bg-dark-800 text-[10px] font-bold px-2 py-1 rounded-full text-slate-500">Basic</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Monthly Price ($)</label>
                <input className={getInputClass('freeMonthly')} type="text" value={state.freeMonthly} onChange={(e) => updateState('freeMonthly', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Annual Price ($)</label>
                <input className={getInputClass('freeAnnual')} type="text" value={state.freeAnnual} onChange={(e) => updateState('freeAnnual', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Max Artists</label>
                <input className={getInputClass('freeArtists')} type="number" value={state.freeArtists} onChange={(e) => updateState('freeArtists', e.target.value)} />
              </div>
            </div>
          </div>
          
          {/* Pro Artist */}
          <div className="bg-white dark:bg-card-dark border-2 border-brand-500 rounded-xl p-6 shadow-lg shadow-brand-500/10 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-wider">Popular</div>
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-black uppercase tracking-widest text-brand-500">Pro Artist</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Monthly Price ($)</label>
                <input className={getInputClass('proMonthly')} type="text" value={state.proMonthly} onChange={(e) => updateState('proMonthly', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Annual Price ($)</label>
                <input className={getInputClass('proAnnual')} type="text" value={state.proAnnual} onChange={(e) => updateState('proAnnual', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Max Artists</label>
                <input className={getInputClass('proArtists')} type="number" value={state.proArtists} onChange={(e) => updateState('proArtists', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Label Plus */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Label Plus</h4>
              <span className="bg-slate-100 dark:bg-dark-800 text-[10px] font-bold px-2 py-1 rounded-full text-slate-500">Enterprise</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Monthly Price ($)</label>
                <input className={getInputClass('labelMonthly')} type="text" value={state.labelMonthly} onChange={(e) => updateState('labelMonthly', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Annual Price ($)</label>
                <input className={getInputClass('labelAnnual')} type="text" value={state.labelAnnual} onChange={(e) => updateState('labelAnnual', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Max Artists</label>
                <input className={getInputClass('labelArtists')} type="text" value={state.labelArtists} onChange={(e) => updateState('labelArtists', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Commissions */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-brand-500 text-2xl">percent</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Streaming Commission Rules</h3>
        </div>
        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-xl p-8 space-y-10 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Free Plan Royalty Take
                {state.freeCommission !== initialState.freeCommission && <span className="w-2 h-2 rounded-full bg-brand-500"></span>}
              </label>
              <span className="text-brand-500 font-black text-xl">{state.freeCommission}%</span>
            </div>
            <input
              className="w-full h-2 bg-slate-200 dark:bg-dark-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              type="range" min="0" max="100"
              value={state.freeCommission}
              onChange={(e) => updateState('freeCommission', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Pro Artist Royalty Take
                {state.proCommission !== initialState.proCommission && <span className="w-2 h-2 rounded-full bg-brand-500"></span>}
              </label>
              <span className="text-brand-500 font-black text-xl">{state.proCommission}%</span>
            </div>
            <input
              className="w-full h-2 bg-slate-200 dark:bg-dark-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              type="range" min="0" max="100"
              value={state.proCommission}
              onChange={(e) => updateState('proCommission', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Label Plus Royalty Take
                {state.labelCommission !== initialState.labelCommission && <span className="w-2 h-2 rounded-full bg-brand-500"></span>}
              </label>
              <span className="text-brand-500 font-black text-xl">{state.labelCommission}%</span>
            </div>
            <input
              className="w-full h-2 bg-slate-200 dark:bg-dark-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              type="range" min="0" max="100"
              value={state.labelCommission}
              onChange={(e) => updateState('labelCommission', parseInt(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* Section 3: Feature Toggles */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-brand-500 text-2xl">checklist</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Feature Entitlements Matrix</h3>
        </div>
        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-dark-900/50">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Platform Feature</th>
                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-500">Free</th>
                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-brand-500">Pro Artist</th>
                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-500">Label Plus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-800 text-slate-900 dark:text-white">
              {[
                { id: 'youtube', name: 'YouTube Content ID' },
                { id: 'instant', name: 'Instant Distribution' },
                { id: 'analytics', name: 'Analytics Pro (Advanced)' },
                { id: 'support', name: 'Priority Support' },
                { id: 'whitelabel', name: 'White-label Delivery' },
                { id: 'dolby', name: 'Dolby Atmos Mastering Support' }
              ].map(feat => (
                <tr key={feat.id} className="hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm">{feat.name}</td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-brand-500 focus:ring-brand-500 bg-slate-100 dark:bg-dark-800 border-slate-300 dark:border-dark-700 cursor-pointer" 
                      checked={(state.features as any)[feat.id].free} 
                      onChange={(e) => updateFeature(feat.id, 'free', e.target.checked)} 
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-brand-500 focus:ring-brand-500 bg-slate-100 dark:bg-dark-800 border-slate-300 dark:border-dark-700 cursor-pointer" 
                      checked={(state.features as any)[feat.id].pro} 
                      onChange={(e) => updateFeature(feat.id, 'pro', e.target.checked)} 
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-brand-500 focus:ring-brand-500 bg-slate-100 dark:bg-dark-800 border-slate-300 dark:border-dark-700 cursor-pointer" 
                      checked={(state.features as any)[feat.id].label} 
                      onChange={(e) => updateFeature(feat.id, 'label', e.target.checked)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Global Settings */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-brand-500 text-2xl">public</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Global System Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`bg-white dark:bg-card-dark border ${state.minPayout !== initialState.minPayout ? 'border-brand-500 border-l-4' : 'border-slate-200 dark:border-dark-800'} rounded-xl p-6 flex items-center gap-4 shadow-sm transition-all`}>
            <div className="bg-brand-50 dark:bg-brand-500/10 text-brand-500 p-3 rounded-xl">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Min Payout Threshold ($)</label>
              <input className="w-full bg-transparent border-none p-0 text-2xl font-black focus:ring-0 text-slate-900 dark:text-white outline-none" type="number" value={state.minPayout} onChange={(e) => updateState('minPayout', e.target.value)} />
            </div>
          </div>
          <div className={`bg-white dark:bg-card-dark border ${state.standardProcessing !== initialState.standardProcessing ? 'border-brand-500 border-l-4' : 'border-slate-200 dark:border-dark-800'} rounded-xl p-6 flex items-center gap-4 shadow-sm transition-all`}>
            <div className="bg-brand-50 dark:bg-brand-500/10 text-brand-500 p-3 rounded-xl">
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Standard Processing (Days)</label>
              <input className="w-full bg-transparent border-none p-0 text-2xl font-black focus:ring-0 text-slate-900 dark:text-white outline-none" type="number" value={state.standardProcessing} onChange={(e) => updateState('standardProcessing', e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Save Bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-64 right-0 bg-white/90 dark:bg-dark-950/90 backdrop-blur-md border-t border-slate-200 dark:border-dark-800 px-8 py-4 flex justify-end items-center gap-4 z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <p className="text-sm text-slate-600 dark:text-slate-300 font-bold">Unsaved changes in {sectionsChanged} section{sectionsChanged > 1 ? 's' : ''}</p>
          <div className="h-6 w-px bg-slate-300 dark:bg-dark-700 mx-2"></div>
          <button
            onClick={handleDiscard}
            disabled={saving}
            className="px-6 py-2.5 bg-slate-100 dark:bg-dark-800 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-dark-700 transition-colors text-slate-700 dark:text-slate-300 disabled:opacity-50"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PlansAndCommissions;
