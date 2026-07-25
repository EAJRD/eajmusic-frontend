import React, { useState, useEffect } from 'react';
import api from '../../../services/apiClient';

const Profile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    
    const [formData, setFormData] = useState({
        displayName: 'Cyber Dreamer',
        genre: 'Electronic',
        bio: 'Creating neon soundscapes for the digital age.',
        socialLinks: {
            instagram: '',
            twitter: '',
            spotify: '',
            soundcloud: ''
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.get('/api/auth/me');
                if (data && data.profile) {
                    setFormData(prev => ({
                        ...prev,
                        displayName: data.profile.displayName || prev.displayName,
                        genre: data.profile.genre || prev.genre,
                        bio: data.profile.bio || prev.bio,
                        socialLinks: {
                            ...prev.socialLinks,
                            ...(data.profile.socialLinks || {})
                        }
                    }));
                }
            } catch (err) {
                console.error("Error fetching profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/api/artist/profile', formData);
            setToast('Profile updated successfully');
        } catch (err) {
            setToast('Failed to update profile');
        } finally {
            setSaving(false);
            setTimeout(() => setToast(''), 3000);
        }
    };

    const updateSocialLink = (network: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [network]: value }
        }));
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
                        <div className="size-32 rounded-full border-4 border-white dark:border-card-dark bg-slate-200 mx-auto shadow-xl bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/200/200?random=10')" }}>
                            <div className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full cursor-pointer hover:bg-black transition-colors">
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-black mt-4">{formData.displayName}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{formData.genre} • Toronto, CA</p>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <label className="text-xs font-bold text-slate-500 uppercase">Genre</label>
                            <select 
                                value={formData.genre}
                                onChange={e => setFormData({ ...formData, genre: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold"
                            >
                                <option>Electronic</option>
                                <option>Pop</option>
                                <option>Rock</option>
                                <option>Hip Hop</option>
                                <option>R&B</option>
                            </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
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
                        {[
                            { key: 'instagram', label: 'Instagram' },
                            { key: 'twitter', label: 'Twitter / X' },
                            { key: 'spotify', label: 'Spotify' },
                            { key: 'soundcloud', label: 'SoundCloud' }
                        ].map(social => (
                            <div key={social.key} className="flex gap-4">
                                <div className="w-32 flex items-center gap-2 font-bold text-sm text-slate-500">
                                    <span className="material-symbols-outlined text-lg">link</span> {social.label}
                                </div>
                                <input 
                                    type="text" 
                                    value={(formData.socialLinks as any)[social.key] || ''}
                                    onChange={e => updateSocialLink(social.key, e.target.value)}
                                    placeholder={`https://${social.key}.com/...`} 
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-medium text-sm" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
