import React, { useState, useEffect, useRef } from 'react';
import { AdminService, UploadService } from '../../../src/services/api';
import { applyBrandConfig, type BrandConfig } from '../../../src/contexts/ThemeContext';

const SETTINGS_KEY = 'brand_config';
const DEFAULTS = {
    primaryColor: '#2563EB',
    secondaryColor: '#4F46E5',
    fontFamily: 'Inter',
    logoUrl: '',
    faviconUrl: '',
};

const BrandSettings: React.FC = () => {
    // State for color pickers
    const [primaryColor, setPrimaryColor] = useState(DEFAULTS.primaryColor);
    const [secondaryColor, setSecondaryColor] = useState(DEFAULTS.secondaryColor);
    const [fontFamily, setFontFamily] = useState(DEFAULTS.fontFamily);
    const [logoUrl, setLogoUrl] = useState(DEFAULTS.logoUrl);
    const [faviconUrl, setFaviconUrl] = useState(DEFAULTS.faviconUrl);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    const fonts = ['Inter', 'Roboto', 'Outfit', 'Space Grotesk'];

    useEffect(() => {
        (async () => {
            try {
                // AdminService.getSettings() returns Record<key, { value, description }>
                // (see src/services/api.ts) — the setting's actual payload lives at
                // `.value`, not nested under a `.settings` wrapper.
                const res = await AdminService.getSettings();
                const brand = res?.[SETTINGS_KEY]?.value as BrandConfig | undefined;
                if (brand) {
                    setPrimaryColor(brand.primaryColor || DEFAULTS.primaryColor);
                    setSecondaryColor(brand.secondaryColor || DEFAULTS.secondaryColor);
                    setFontFamily(brand.fontFamily || DEFAULTS.fontFamily);
                    setLogoUrl(brand.logoUrl || DEFAULTS.logoUrl);
                    setFaviconUrl(brand.faviconUrl || DEFAULTS.faviconUrl);
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
        setLogoUrl(DEFAULTS.logoUrl);
        setFaviconUrl(DEFAULTS.faviconUrl);
    };

    const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // allow re-selecting the same file later
        if (!file) return;
        setUploadError('');
        setUploadingLogo(true);
        try {
            // Reuses the existing generic image-upload endpoint (no releaseId ->
            // no side effect on any release; unlike /upload/avatar it doesn't
            // mutate the calling user's own profile either).
            const result = await UploadService.uploadCover(file);
            setLogoUrl(result.file.url);
        } catch (err: any) {
            setUploadError(err.message || 'Logo upload failed.');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleFaviconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setUploadError('');
        setUploadingFavicon(true);
        try {
            const result = await UploadService.uploadCover(file);
            setFaviconUrl(result.file.url);
        } catch (err: any) {
            setUploadError(err.message || 'Favicon upload failed.');
        } finally {
            setUploadingFavicon(false);
        }
    };

    const handlePublish = async () => {
        setSaving(true);
        setError('');
        setSaved(false);
        const brandConfig: BrandConfig = {
            primaryColor,
            secondaryColor,
            fontFamily,
            ...(logoUrl && { logoUrl }),
            ...(faviconUrl && { faviconUrl }),
        };
        try {
            await AdminService.updateSetting(SETTINGS_KEY, brandConfig, 'Whitelabel brand color, logo and typography configuration');
            // Apply immediately to the live document so the Super Admin sees the
            // real app re-theme in this tab right away, in addition to it being
            // persisted for future loads / other tabs via GET /public/theme.
            applyBrandConfig(brandConfig);
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
                    {saved && <p className="text-emerald-500 text-sm font-bold mt-2">Changes published — live on this device now, and for everyone on next load.</p>}
                    {error && <p className="text-rose-500 text-sm font-bold mt-2">{error}</p>}
                    {uploadError && <p className="text-rose-500 text-sm font-bold mt-2">{uploadError}</p>}
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
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 block">Platform Logo</label>
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/svg+xml,image/png,image/jpeg"
                                    className="hidden"
                                    onChange={handleLogoFileChange}
                                />
                                <div
                                    onClick={() => !uploadingLogo && logoInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                                >
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Platform logo preview" className="max-h-16 max-w-full object-contain mb-3" />
                                    ) : (
                                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-slate-400">cloud_upload</span>
                                        </div>
                                    )}
                                    <p className="text-sm font-bold">{uploadingLogo ? 'Uploading…' : logoUrl ? 'Click to replace' : 'Click to upload'}</p>
                                    <p className="text-xs text-slate-400 mt-1">SVG, PNG or JPG (max 2MB)</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 block">Favicon</label>
                                <input
                                    ref={faviconInputRef}
                                    type="file"
                                    accept="image/svg+xml,image/png,image/x-icon,image/jpeg"
                                    className="hidden"
                                    onChange={handleFaviconFileChange}
                                />
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                                        {faviconUrl ? (
                                            <img src={faviconUrl} alt="Favicon preview" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-xl font-black text-slate-300">L</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => !uploadingFavicon && faviconInputRef.current?.click()}
                                        disabled={uploadingFavicon}
                                        className="text-sm font-bold text-primary hover:underline disabled:opacity-50"
                                    >
                                        {uploadingFavicon ? 'Uploading…' : 'Upload New'}
                                    </button>
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
                                <span className="text-xs font-mono text-slate-500">Draft Preview — click "Publish Changes" to go live</span>
                                <div className="size-4"></div>
                            </div>
                            {/* Preview Content — a mock dashboard reflecting the unsaved form
                                state above via inline styles. It is intentionally separate
                                from the real app: the actual global re-theme only happens
                                after "Publish Changes" succeeds, via applyBrandConfig(). */}
                            <div className="p-8 bg-[#0B0F19] min-h-[600px] font-sans" style={{ fontFamily: fontFamily }}>
                                {/* Mock Nav */}
                                <div className="flex items-center gap-8 mb-12">
                                    <div className="flex items-center gap-2">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo preview" className="size-8 rounded-lg object-contain" />
                                        ) : (
                                            <div className="size-8 rounded-lg" style={{ backgroundColor: primaryColor }}></div>
                                        )}
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
