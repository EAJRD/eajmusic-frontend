import React, { useState, useEffect } from 'react';
import { AdminService } from '../../../src/services/api';

const SETTINGS_KEY = 'brand_config';
const DEFAULTS = { primaryColor: '#2563EB', secondaryColor: '#4F46E5', fontFamily: 'Inter' };

const BrandSettings: React.FC = () => {
    // State for color pickers
    const [primaryColor, setPrimaryColor] = useState(DEFAULTS.primaryColor);
    const [secondaryColor, setSecondaryColor] = useState(DEFAULTS.secondaryColor);
    const [fontFamily, setFontFamily] = useState(DEFAULTS.fontFamily);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const fonts = ['Inter', 'Roboto', 'Outfit', 'Space Grotesk'];

    useEffect(() => {
        (async () => {
            try {
                const res = await AdminService.getSettings();
                const brand = res?.settings?.[SETTINGS_KEY];
                if (brand) {
                    setPrimaryColor(brand.primaryColor || DEFAULTS.primaryColor);
                    setSecondaryColor(brand.secondaryColor || DEFAULTS.secondaryColor);
                    setFontFamily(brand.fontFamily || DEFAULTS.fontFamily);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load saved branding — showing defaults.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleReset = () => {
        setPrimaryColor(DEFAULTS.primaryColor);
        setSecondaryColor(DEFAULTS.secondaryColor);
        setFontFamily(DEFAULTS.fontFamily);
    };

    const handlePublish = async () => {
        setSaving(true);
        setError('');
        setSaved(false);
        try {
            await AdminService.updateSetting(SETTINGS_KEY, { primaryColor, secondaryColor, fontFamily }, 'Whitelabel brand color and typography configuration');
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to publish changes.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Whitelabel & Branding</h1>
                    <p className="text-slate-500 dark:text-slate-400">Customize the look and feel of your distribution platform.</p>
                    {saved && <p className="text-emerald-500 text-sm font-bold mt-2">Changes published successfully.</p>}
                    {error && <p className="text-rose-500 text-sm font-bold mt-2">{error}</p>}
                </div>
                <div className="flex gap-3">
                    <button onClick={handleReset} disabled={saving} className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">Reset Defaults</button>
                    <button onClick={handlePublish} disabled={saving || loading} className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50">
                        {saving ? 'Publishing...' : 'Publish Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Visual Identity */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Logo Upload */}
                    <section className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">image</span>
                            Platform Logos
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 block">Light Mode Logo</label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-slate-400">cloud_upload</span>
                                    </div>
                                    <p className="text-sm font-bold">Click to upload</p>
                                    <p className="text-xs text-slate-400 mt-1">SVG, PNG or JPG (max 2MB)</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 block">Favicon</label>
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                        <span className="text-xl font-black text-slate-300">L</span>
                                    </div>
                                    <button className="text-sm font-bold text-primary hover:underline">Upload New</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Color Palette */}
                    <section className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">palette</span>
                            Color Palette
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="flex justify-between text-sm font-medium mb-2">
                                    <span>Primary Brand Color</span>
                                    <span className="font-mono text-slate-400 text-xs">{primaryColor}</span>
                                </label>
                                <div className="flex gap-3">
                                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="size-10 rounded-lg cursor-pointer border-0 p-0" />
                                    <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono" />
                                </div>
                            </div>
                            <div>
                                <label className="flex justify-between text-sm font-medium mb-2">
                                    <span>Secondary Brand Color</span>
                                    <span className="font-mono text-slate-400 text-xs">{secondaryColor}</span>
                                </label>
                                <div className="flex gap-3">
                                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="size-10 rounded-lg cursor-pointer border-0 p-0" />
                                    <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono" />
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* Typography */}
                    <section className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">text_fields</span>
                            Typography
                        </h3>
                        <div className="space-y-4">
                            <label className="text-sm font-medium">Primary Font Family</label>
                            <div className="grid grid-cols-2 gap-3">
                                {fonts.map(font => (
                                    <div
                                        key={font}
                                        onClick={() => setFontFamily(font)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${fontFamily === font ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                    >
                                        <p className="text-lg font-bold" style={{ fontFamily: font }}>Aa</p>
                                        <p className="text-xs text-slate-500" style={{ fontFamily: font }}>{font}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Column 2 & 3: Live Preview */}
                <div className="lg:col-span-2">
                    <div className="sticky top-8">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex justify-between items-center">
                                <div className="flex gap-2">
                                    <div className="size-3 rounded-full bg-rose-500"></div>
                                    <div className="size-3 rounded-full bg-amber-500"></div>
                                    <div className="size-3 rounded-full bg-emerald-500"></div>
                                </div>
                                <span className="text-xs font-mono text-slate-500">Live Preview: Dashboard Home</span>
                                <div className="size-4"></div>
                            </div>
                            {/* Preview Content */}
                            <div className="p-8 bg-[#0B0F19] min-h-[600px] font-sans" style={{ fontFamily: fontFamily }}>
                                {/* Mock Nav */}
                                <div className="flex items-center gap-8 mb-12">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-lg" style={{ backgroundColor: primaryColor }}></div>
                                        <span className="text-xl font-black text-white">BRAND</span>
                                    </div>
                                    <div className="flex gap-6 text-sm font-medium text-slate-400">
                                        <span className="text-white">Dashboard</span>
                                        <span>Music</span>
                                        <span>Analytics</span>
                                        <span>Wallet</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-4">
                                        <button className="px-5 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>
                                            New Upload
                                        </button>
                                        <div className="size-8 rounded-full bg-slate-700"></div>
                                    </div>
                                </div>

                                {/* Mock Hero Stats */}
                                <div className="grid grid-cols-3 gap-6 mb-12">
                                    <div className="p-6 rounded-2xl bg-[#131B2C] border border-white/5">
                                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Total Revenue</p>
                                        <p className="text-3xl font-black text-white">$12,450.00</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-[#131B2C] border border-white/5">
                                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Total Streams</p>
                                        <p className="text-3xl font-black text-white">1,204,500</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-[#131B2C] border border-white/5">
                                        <p className="text-slate-400 text-xs font-bold uppercase mb-2">Active Releases</p>
                                        <p className="text-3xl font-black text-white">24</p>
                                    </div>
                                </div>

                                {/* Mock Content Section */}
                                <div className="flex gap-8">
                                    <div className="flex-1 p-8 rounded-2xl bg-[#131B2C] border border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-6">Top Performing Tracks</h3>
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                                                    <div className="size-12 rounded-lg bg-slate-700" style={{ opacity: 1 - (i * 0.2) }}></div>
                                                    <div className="flex-1">
                                                        <div className="h-4 w-32 bg-slate-700 rounded mb-2"></div>
                                                        <div className="h-3 w-20 bg-slate-800 rounded"></div>
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-400">24k plays</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-80 p-8 rounded-2xl border border-white/5" style={{ background: `linear-gradient(135deg, ${primaryColor}15, transparent)` }}>
                                        <h3 className="text-lg font-bold text-white mb-4">Promote Your Music</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed mb-6">Boost your latest release with our premium marketing tools.</p>
                                        <button className="w-full py-3 rounded-xl font-bold bg-white text-black text-sm">Start Campaign</button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandSettings;
