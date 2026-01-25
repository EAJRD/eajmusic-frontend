import React, { useState } from 'react';

const PlansAndCommissions: React.FC = () => {
    // State for sliders (mocking backend data)
    const [freeCommission, setFreeCommission] = useState(15);
    const [proCommission, setProCommission] = useState(0);
    const [labelCommission, setLabelCommission] = useState(5);

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-12 pb-24">
            {/* Header */}
            <header className="mb-8">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Plans & Commissions</h2>
                <p className="text-slate-500 text-sm">Configure subscription tiers and platform-wide business rules.</p>
            </header>

            {/* Section 1: Active Plans */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">credit_card</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Plans</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Plan Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Free</h4>
                            <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-1 rounded-full text-slate-400">Basic</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Price ($)</label>
                                <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-lg font-bold text-slate-900 dark:text-white" type="text" defaultValue="0.00" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Annual Price ($)</label>
                                <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-lg font-bold text-slate-900 dark:text-white" type="text" defaultValue="0.00" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Max Artists</label>
                                <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-lg font-bold text-slate-900 dark:text-white" type="number" defaultValue="1" />
                            </div>
                        </div>
                    </div>
                    {/* Pro Artist Card */}
                    <div className="bg-white dark:bg-slate-900 border-2 border-primary rounded-xl p-6 shadow-xl shadow-primary/5 flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-tighter">Popular</div>
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Pro Artist</h4>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Price ($)</label>
                                <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-lg font-bold text-slate-900 dark:text-white" type="text" defaultValue="14.99" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Annual Price ($)</label>
                                <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-lg font-bold text-slate-900 dark:text-white" type="text" defaultValue="149.00" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Max Artists</label>
                                <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-lg font-bold text-slate-900 dark:text-white" type="number" defaultValue="5" />
                            </div>
                        </div>
                    </div>
                    {/* Label Plus Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Label Plus</h4>
                            <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-1 rounded-full text-slate-400">Enterprise</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Price ($)</label>
                                <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-lg font-bold text-slate-900 dark:text-white" type="text" defaultValue="49.99" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Annual Price ($)</label>
                                <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-lg font-bold text-slate-900 dark:text-white" type="text" defaultValue="499.00" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Max Artists</label>
                                <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-lg font-bold text-slate-900 dark:text-white" type="text" defaultValue="Unlimited" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Commission Settings */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">percent</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Streaming Commission Rules</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 space-y-10">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-900 dark:text-white">Free Plan Royalty Take</label>
                            <span className="text-primary font-black">{freeCommission}%</span>
                        </div>
                        <input
                            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                            type="range"
                            min="0"
                            max="100"
                            value={freeCommission}
                            onChange={(e) => setFreeCommission(parseInt(e.target.value))}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-900 dark:text-white">Pro Artist Royalty Take</label>
                            <span className="text-primary font-black">{proCommission}%</span>
                        </div>
                        <input
                            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                            type="range"
                            min="0"
                            max="100"
                            value={proCommission}
                            onChange={(e) => setProCommission(parseInt(e.target.value))}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-900 dark:text-white">Label Plus Royalty Take</label>
                            <span className="text-primary font-black">{labelCommission}%</span>
                        </div>
                        <input
                            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                            type="range"
                            min="0"
                            max="100"
                            value={labelCommission}
                            onChange={(e) => setLabelCommission(parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </section>

            {/* Section 3: Feature Toggles */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">checklist</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Feature Entitlements Matrix</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Platform Feature</th>
                                <th className="px-6 py-4 text-center text-xs font-black uppercase text-slate-400">Free</th>
                                <th className="px-6 py-4 text-center text-xs font-black uppercase text-primary">Pro Artist</th>
                                <th className="px-6 py-4 text-center text-xs font-black uppercase text-slate-400">Label Plus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white">
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium">YouTube Content ID</td>
                                <td className="px-6 py-4 text-center"><input className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                                <td className="px-6 py-4 text-center"><input defaultChecked className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                                <td className="px-6 py-4 text-center"><input defaultChecked className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                            </tr>
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium">Instant Distribution</td>
                                <td className="px-6 py-4 text-center"><input className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                                <td className="px-6 py-4 text-center"><input defaultChecked className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                                <td className="px-6 py-4 text-center"><input defaultChecked className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                            </tr>
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium">Analytics Pro (Advanced)</td>
                                <td className="px-6 py-4 text-center"><input className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                                <td className="px-6 py-4 text-center"><input defaultChecked className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                                <td className="px-6 py-4 text-center"><input defaultChecked className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                            </tr>
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium">Priority Support</td>
                                <td className="px-6 py-4 text-center"><input className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                                <td className="px-6 py-4 text-center"><input defaultChecked className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                                <td className="px-6 py-4 text-center"><input defaultChecked className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                            </tr>
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium">White-label Delivery</td>
                                <td className="px-6 py-4 text-center"><input className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                                <td className="px-6 py-4 text-center"><input className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                                <td className="px-6 py-4 text-center"><input defaultChecked className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                            </tr>
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium">Dolby Atmos Mastering Support</td>
                                <td className="px-6 py-4 text-center"><input className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                                <td className="px-6 py-4 text-center"><input className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                                <td className="px-6 py-4 text-center"><input defaultChecked className="rounded text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 border-none" type="checkbox" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Section 4: Global Settings */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">public</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Global System Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex items-center gap-4 shadow-sm">
                        <div className="bg-primary/10 text-primary p-3 rounded-lg">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Min Payout Threshold ($)</label>
                            <input className="w-full bg-transparent border-none p-0 text-xl font-black focus:ring-0 text-slate-900 dark:text-white" type="number" defaultValue="50" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex items-center gap-4 shadow-sm">
                        <div className="bg-primary/10 text-primary p-3 rounded-lg">
                            <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Standard Processing (Days)</label>
                            <input className="w-full bg-transparent border-none p-0 text-xl font-black focus:ring-0 text-slate-900 dark:text-white" type="number" defaultValue="7" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-64 right-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-end items-center gap-4 z-10">
                <p className="text-xs text-slate-500 font-medium">Unsaved changes detected in 3 sections</p>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                <button className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-sm font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-white">Discard Draft</button>
                <button className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">Save as Draft</button>
            </div>
        </div>
    );
};

export default PlansAndCommissions;
