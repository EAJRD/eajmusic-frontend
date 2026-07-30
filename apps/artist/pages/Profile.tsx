import React, { useState, useEffect } from 'react';
import { ArtistService } from '../../../src/services/api';
import { crossDomainUrl } from '../../../src/utils/subdomain';

interface SocialLinks {
    instagram: string;
    twitter: string;
    spotify: string;
    soundcloud: string;
}

const Profile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [profileId, setProfileId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        avatarUrl: '',
        socialLinks: {
            instagram: '',
            twitter: '',
            spotify: '',
            soundcloud: '',
        } as SocialLinks,
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await ArtistService.getProfiles();
                const profile = res?.profiles?.[0];
                if (profile) {
                    setProfileId(profile.id);
                    setFormData({
                        displayName: profile.name || '',
                        bio: profile.bio || '',
                        avatarUrl: profile.avatarUrl || '',
                        socialLinks: { instagram: '', twitter: '', spotify: '', soundcloud: '', ...(profile.socialLinks || {}) },
                    });
                }
            } catch (err) {
                console.error('Error fetching profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(''), 3000);
    };

    const handleSave = async () => {
        if (!formData.displayName.trim()) {
            showToast('Display name is required');
            return;
        }

        setSaving(true);
        try {
            if (profileId) {
                await ArtistService.updateProfile(profileId, {
                    name: formData.displayName,
                    bio: formData.bio,
                    socialLinks: formData.socialLinks,
                });
            } else {
                const res = await ArtistService.createProfile({
                    name: formData.displayName,
                    bio: formData.bio,
                    socialLinks: formData.socialLinks,
                });
                if (res?.profile?.id) setProfileId(res.profile.id);
            }
            showToast('Profile updated successfully');
        } catch (err: any) {
            showToast(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const updateSocialLink = (network: keyof SocialLinks, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [network]: value },
        }));
    };

    const [linkCopied, setLinkCopied] = useState(false);
    const shareLink = profileId ? crossDomainUrl('main', `/share/${profileId}`) : '';

    const handleCopyShareLink = async () => {
        if (!shareLink) return;
        try {
            await navigator.clipboard.writeText(shareLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            showToast('Could not copy link — copy it manually');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            {toast && (
                <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-400">info</span>
                    <p className="font-bold">{toast}</p>
                </div>
            )}
            <header className="mb-10 text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-black tracking-tight mb-2">Artist Profile</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage how you appear on the platform and stores.</p>
            </header>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Avatar & Cover */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <div className="relative pt-16">
                        <div
                            className="size-32 rounded-full border-4 border-white dark:border-card-dark bg-slate-200 mx-auto shadow-xl bg-cover bg-center"
                            style={{ backgroundImage: `url('${formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || 'Artist')}&background=random&color=fff`}')` }}
                        />
                        <h2 className="text-2xl font-black mt-4">{formData.displayName || 'Unnamed Artist'}</h2>
                        {!profileId && <p className="text-xs text-amber-500 font-bold mt-1">No artist profile yet — save to create one</p>}
                    </div>
                </div>

                {/* Form Fields */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-lg font-bold">Details</h3>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-primary text-sm font-bold hover:underline disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Display Name</label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Bio</label>
                            <textarea
                                rows={4}
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold">Social Links</h3>
                    <div className="space-y-4">
                        {([
                            { key: 'instagram', label: 'Instagram' },
                            { key: 'twitter', label: 'Twitter / X' },
                            { key: 'spotify', label: 'Spotify' },
                            { key: 'soundcloud', label: 'SoundCloud' },
                        ] as { key: keyof SocialLinks; label: string }[]).map(social => (
                            <div key={social.key} className="flex gap-4">
                                <div className="w-32 flex items-center gap-2 font-bold text-sm text-slate-500">
                                    <span className="material-symbols-outlined text-lg">link</span> {social.label}
                                </div>
                                <input
                                    type="text"
                                    value={formData.socialLinks[social.key] || ''}
                                    onChange={e => updateSocialLink(social.key, e.target.value)}
                                    placeholder={`https://${social.key}.com/...`}
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-medium text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Compartir mi historia */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-4">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">ios_share</span>
                            Compartir mi historia
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Comparte este enlace con colegas, fans o colaboradores para que dejen un testimonio sobre trabajar contigo.
                            Cada envío pasa por una revisión antes de aparecer en el sitio público.
                        </p>
                    </div>

                    {profileId ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                readOnly
                                value={shareLink}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-mono text-sm text-slate-600 dark:text-slate-300"
                            />
                            <button
                                onClick={handleCopyShareLink}
                                className="px-5 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-[18px]">{linkCopied ? 'check' : 'content_copy'}</span>
                                {linkCopied ? 'Copiado' : 'Copiar enlace'}
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-amber-500 font-bold">Guarda tu perfil primero para generar tu enlace para compartir.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
