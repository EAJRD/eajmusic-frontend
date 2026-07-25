import React, { useState } from 'react';
import { ArtistService, UploadService } from '../../../src/services/api';

interface NewReleaseProps {
    onComplete?: () => void;
    onCancel?: () => void;
}

const NewRelease: React.FC<NewReleaseProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [isDragging, setIsDragging] = useState(false);

    // File Upload State
    const [audioFiles, setAudioFiles] = useState<File[]>([]);
    const [coverArt, setCoverArt] = useState<File | null>(null);
    const [coverArtPreview, setCoverArtPreview] = useState<string>('');

    // Track-specific metadata (one entry per uploaded file)
    const [trackMetadata, setTrackMetadata] = useState<{
        title: string;
        artists: string;
        isrc: string;
    }[]>([]);

    interface Contributor {
        id: string;
        name: string;
        role: string;
        share: string;
    }

    const [contributors, setContributors] = useState<Contributor[]>([
        { id: '1', name: '', role: 'Primary Artist', share: '100' }
    ]);

    // Mock Form State
    const [releaseTitle, setReleaseTitle] = useState('');
    const [artistName, setArtistName] = useState('');
    const [genre, setGenre] = useState('Pop');

    // Additional Metadata
    const [releaseType, setReleaseType] = useState('Single');
    const [releaseDate, setReleaseDate] = useState('');
    const [language, setLanguage] = useState('English');
    const [recordLabel, setRecordLabel] = useState('');
    const [upc, setUpc] = useState('');
    const [isExplicit, setIsExplicit] = useState(false);
    const [previouslyReleased, setPreviouslyReleased] = useState(false);

    // Step 2 State
    const [cLineYear, setCLineYear] = useState('2023');
    const [cLineName, setCLineName] = useState('');
    const [pLineYear, setPLineYear] = useState('2023');
    const [pLineName, setPLineName] = useState('');

    // Step 3 state
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Calculate minimum release date (3 weeks from today)
    const getMinReleaseDate = () => {
        const today = new Date();
        const minDate = new Date(today.setDate(today.getDate() + 21));
        return minDate.toISOString().split('T')[0];
    };

    // File Upload Handlers
    const audioInputRef = React.useRef<HTMLInputElement>(null);
    const coverInputRef = React.useRef<HTMLInputElement>(null);

    const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAudioFiles(prev => {
                const updated = [...prev, ...newFiles];
                // Auto-update release type based on track count
                updateReleaseType(updated.length);
                // Initialize metadata for new tracks
                setTrackMetadata(prevMeta => {
                    const newMeta = [...prevMeta];
                    for (let i = prevMeta.length; i < updated.length; i++) {
                        newMeta.push({ title: '', artists: artistName, isrc: '' });
                    }
                    return newMeta;
                });
                return updated;
            });
        }
    };

    const updateReleaseType = (trackCount: number) => {
        if (trackCount === 1) {
            setReleaseType('Single');
        } else if (trackCount >= 3 && trackCount <= 6) {
            setReleaseType('EP');
        } else if (trackCount > 6) {
            setReleaseType('Album');
        } else {
            // 2 tracks - could be single with instrumental, default to Single
            setReleaseType('Single');
        }
    };

    const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverArt(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverArtPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAudioFile = (index: number) => {
        setAudioFiles(prev => {
            const updated = prev.filter((_, i) => i !== index);
            updateReleaseType(updated.length);
            return updated;
        });
        setTrackMetadata(prev => prev.filter((_, i) => i !== index));
    };

    const updateTrackMetadata = (index: number, field: 'title' | 'artists' | 'isrc', value: string) => {
        setTrackMetadata(prev => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index][field] = value;
            }
            return updated;
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles: File[] = Array.from(e.dataTransfer.files);
        const audioFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/x-m4a'];
        const validFiles = droppedFiles.filter(file => audioFormats.includes(file.type));

        if (validFiles.length > 0) {
            setAudioFiles(prev => [...prev, ...validFiles]);
        }
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    // Contributor Handlers
    const addContributor = () => {
        setContributors(prev => [
            ...prev,
            { id: Date.now().toString(), name: '', role: 'Featured Artist', share: '0' }
        ]);
    };

    const removeContributor = (id: string) => {
        if (contributors.length === 1) return; // Prevent removing the last one
        setContributors(prev => prev.filter(c => c.id !== id));
    };

    const updateContributor = (id: string, field: keyof Contributor, value: string) => {
        setContributors(prev => prev.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const RELEASE_TYPE_MAP: Record<string, string> = { Single: 'SINGLE', EP: 'EP', Album: 'ALBUM' };
    const LANGUAGE_MAP: Record<string, string> = {
        English: 'EN', Spanish: 'ES', French: 'FR', German: 'DE', Portuguese: 'PT',
        Italian: 'IT', Japanese: 'JA', Korean: 'KO', Mandarin: 'ZH', Other: 'EN',
    };
    const CONTRIBUTOR_ROLE_MAP: Record<string, string> = {
        'Primary Artist': 'PRIMARY_ARTIST',
        'Featured Artist': 'FEATURED',
        'Producer': 'PRODUCER',
        'Songwriter': 'SONGWRITER',
        'Remixer': 'PRODUCER',
    };

    const handleSubmitRelease = async () => {
        setSubmitError('');

        if (audioFiles.length === 0) { setSubmitError('Please upload at least one audio file.'); setStep(1); return; }
        if (!coverArt) { setSubmitError('Please upload cover artwork.'); setStep(1); return; }
        if (!releaseTitle.trim()) { setSubmitError('Please enter a release title.'); setStep(1); return; }
        if (!releaseDate) { setSubmitError('Please choose a release date.'); setStep(1); return; }
        if (!agreedToTerms) { setSubmitError('Please confirm you have full rights to this content.'); return; }

        setSubmitting(true);
        try {
            const sharedContributors = contributors
                .filter(c => c.name.trim())
                .map(c => ({
                    name: c.name.trim(),
                    role: CONTRIBUTOR_ROLE_MAP[c.role] || 'PRIMARY_ARTIST',
                    royaltyPercentage: Math.max(0, Math.min(100, parseFloat(c.share) || 0)),
                }));

            const tracks = audioFiles.map((file, index) => {
                const meta = trackMetadata[index] || { title: '', artists: '', isrc: '' };
                const isrc = (meta.isrc || '').replace(/\s/g, '').toUpperCase();
                return {
                    title: meta.title.trim() || file.name.replace(/\.[^/.]+$/, ''),
                    trackNumber: index + 1,
                    discNumber: 1,
                    isrc: isrc.length === 12 ? isrc : undefined,
                    isExplicit,
                    contributors: sharedContributors,
                };
            });

            const cleanUpc = upc.replace(/\s/g, '');

            const created = await ArtistService.createRelease({
                title: releaseTitle.trim(),
                releaseType: RELEASE_TYPE_MAP[releaseType] || 'SINGLE',
                genre,
                language: LANGUAGE_MAP[language] || 'EN',
                releaseDate,
                upc: cleanUpc.length === 13 ? cleanUpc : undefined,
                cLineYear: cLineYear ? parseInt(cLineYear, 10) : undefined,
                cLineText: cLineName.trim() || undefined,
                pLineYear: pLineYear ? parseInt(pLineYear, 10) : undefined,
                pLineText: pLineName.trim() || undefined,
                isExplicit,
                tracks,
            });

            const releaseId = created?.release?.id;
            if (!releaseId) throw new Error('Release was created but no ID was returned.');

            // Cover art upload attaches directly to the release (releaseId is passed).
            await UploadService.uploadCover(coverArt, releaseId);

            // Attach each audio file to its track by track number.
            for (let i = 0; i < audioFiles.length; i++) {
                await UploadService.uploadAudio(audioFiles[i], releaseId, i + 1);
            }

            await ArtistService.submitRelease(releaseId);

            onComplete?.();
        } catch (err: any) {
            setSubmitError(err.message || 'Failed to submit release. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Derived Artist Name for Review
    const getDisplayArtistName = () => {
        const primaryArtists = contributors
            .filter(c => c.role === 'Primary Artist')
            .map(c => c.name)
            .filter(Boolean);

        if (primaryArtists.length > 0) {
            return primaryArtists.join(', ');
        }
        return artistName;
    };

    // Step 1: Upload & Metadata
    const renderStep1 = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto pb-4">
            {/* 1. Track Upload (Left) */}
            <div
                className={`group relative rounded-3xl border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-card-dark'} overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-8 cursor-pointer shadow-sm`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors">upload_file</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Upload Audio Files</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">Drag & drop your WAV, FLAC or MP3 files here, or click to browse your computer.</p>

                <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/x-m4a"
                    multiple
                    onChange={handleAudioFileChange}
                    className="hidden"
                />
                <button
                    onClick={() => audioInputRef.current?.click()}
                    className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-opacity shadow-xl"
                >
                    Select Audio Files
                </button>

                {/* File List with Track Metadata */}
                {audioFiles.length > 0 && (
                    <div className="absolute bottom-20 left-0 right-0 px-8 max-h-40 overflow-y-auto">
                        <div className="space-y-3">
                            {audioFiles.map((file, index) => (
                                <div key={index} className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                    {/* File Header */}
                                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50">
                                        <span className="material-symbols-outlined text-primary text-sm">music_note</span>
                                        <span className="flex-1 truncate font-medium text-slate-900 dark:text-white text-xs">{file.name}</span>
                                        <span className="text-slate-400 text-xs">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                                        <button onClick={() => removeAudioFile(index)} className="text-slate-400 hover:text-rose-500">
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                    {/* Track Metadata */}
                                    <div className="px-3 py-2 space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Track Title"
                                                value={trackMetadata[index]?.title || ''}
                                                onChange={(e) => updateTrackMetadata(index, 'title', e.target.value)}
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Artists"
                                                value={trackMetadata[index]?.artists || ''}
                                                onChange={(e) => updateTrackMetadata(index, 'artists', e.target.value)}
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="ISRC (Optional)"
                                            value={trackMetadata[index]?.isrc || ''}
                                            onChange={(e) => updateTrackMetadata(index, 'isrc', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check</span> 16/24 bit</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check</span> 44.1Khz+</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check</span> Sterile</span>
                </div>
            </div>

            {/* 2. Cover Art (Right) */}
            <div className="flex flex-col gap-6">
                <div className="flex-1 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm">
                    <div
                        onClick={() => coverInputRef.current?.click()}
                        className="size-48 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-6 flex items-center justify-center relative group cursor-pointer overflow-hidden"
                    >
                        {coverArtPreview ? (
                            <img src={coverArtPreview} alt="Cover Art" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary transition-colors z-10">image</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <span className="text-white font-bold text-sm">{coverArtPreview ? 'Change Cover' : 'Upload Cover'}</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Artwork</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">3000 x 3000px JPG or PNG. Minimum 72dpi. No blurred images.</p>
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleCoverArtChange}
                        className="hidden"
                    />
                    <button onClick={() => coverInputRef.current?.click()} className="text-primary font-bold text-sm hover:underline">Upload Artwork</button>
                </div>

                {/* Metadata Quick Inputs */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark p-6 shadow-sm">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Release Title</label>
                            <input
                                type="text"
                                value={releaseTitle}
                                onChange={(e) => setReleaseTitle(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-input-dark border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 font-bold focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                                placeholder="e.g. Midnight Memories"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Primary Artist</label>
                                <input
                                    type="text"
                                    value={artistName}
                                    onChange={(e) => {
                                        setArtistName(e.target.value);
                                        // Sync with first contributor
                                        if (contributors.length > 0) {
                                            updateContributor(contributors[0].id, 'name', e.target.value);
                                        }
                                    }}
                                    className="w-full bg-slate-50 dark:bg-input-dark border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 font-bold focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                                    placeholder="Artist Name"
                                />
                            </div>
                            <div className="w-1/3">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Genre</label>
                                <select
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-input-dark border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 font-medium focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                                >
                                    <option>Pop</option>
                                    <option>Rock</option>
                                    <option>Hip Hop/Rap</option>
                                    <option>R&B/Soul</option>
                                    <option>Electronic/Dance</option>
                                    <option>Country</option>
                                    <option>Jazz</option>
                                    <option>Classical</option>
                                    <option>Latin</option>
                                    <option>Reggae</option>
                                    <option>Metal</option>
                                    <option>Indie</option>
                                    <option>Alternative</option>
                                    <option>Folk</option>
                                    <option>Blues</option>
                                    <option>World Music</option>
                                    <option>Gospel/Christian</option>
                                    <option>Soundtrack</option>
                                    <option>Children's Music</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Metadata */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Additional Details</h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Release Type</label>
                                <div className="relative">
                                    <select
                                        value={releaseType}
                                        disabled
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 font-medium text-slate-900 dark:text-white opacity-60 cursor-not-allowed"
                                    >
                                        <option>Single</option>
                                        <option>EP</option>
                                        <option>Album</option>
                                    </select>
                                    <p className="text-[10px] text-slate-400 mt-1">Auto-detected from track count</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-input-dark border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 font-medium focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                                >
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                    <option>German</option>
                                    <option>Portuguese</option>
                                    <option>Italian</option>
                                    <option>Japanese</option>
                                    <option>Korean</option>
                                    <option>Mandarin</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Release Date</label>
                            <input
                                type="date"
                                value={releaseDate}
                                onChange={(e) => setReleaseDate(e.target.value)}
                                min={getMinReleaseDate()}
                                className="w-full bg-slate-50 dark:bg-input-dark border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 font-medium focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Minimum 3 weeks from today</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Record Label (Optional)</label>
                            <input
                                type="text"
                                value={recordLabel}
                                onChange={(e) => setRecordLabel(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-input-dark border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 font-medium focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                                placeholder="e.g. Independent"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">UPC/EAN (Optional)</label>
                            <input
                                type="text"
                                value={upc}
                                onChange={(e) => setUpc(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-input-dark border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 font-mono focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                                placeholder="Leave blank to auto-generate"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="explicit"
                                checked={isExplicit}
                                onChange={(e) => setIsExplicit(e.target.checked)}
                                className="size-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                            />
                            <label htmlFor="explicit" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                This release contains explicit content
                            </label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="previously-released"
                                checked={previouslyReleased}
                                onChange={(e) => setPreviouslyReleased(e.target.checked)}
                                className="size-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                            />
                            <label htmlFor="previously-released" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                Previously released elsewhere
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Step 2: Rights & Contributors
    const renderStep2 = () => (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Copyright & Licensing */}
            <div className="bg-white dark:bg-card-dark rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-start gap-4 mb-8">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                        <span className="material-symbols-outlined">copyright</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Copyright & Ownership</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Declare ownership details for correct royalty collection.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-900 dark:text-white block">Composition Copyright (C Line)</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={cLineYear}
                                onChange={(e) => setCLineYear(e.target.value)}
                                className="w-24 bg-slate-50 dark:bg-input-dark border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 font-mono text-center"
                            />
                            <input
                                type="text"
                                value={cLineName}
                                onChange={(e) => setCLineName(e.target.value)}
                                className="flex-1 bg-slate-50 dark:bg-input-dark border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 font-bold"
                                placeholder="Entity / Name"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-900 dark:text-white block">Sound Recording Copyright (P Line)</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={pLineYear}
                                onChange={(e) => setPLineYear(e.target.value)}
                                className="w-24 bg-slate-50 dark:bg-input-dark border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 font-mono text-center"
                            />
                            <input
                                type="text"
                                value={pLineName}
                                onChange={(e) => setPLineName(e.target.value)}
                                className="flex-1 bg-slate-50 dark:bg-input-dark border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 font-bold"
                                placeholder="Entity / Name"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contributors */}
            <div className="bg-white dark:bg-card-dark rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">group</span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contributors</h3>
                    </div>
                    <button
                        onClick={addContributor}
                        className="text-primary text-sm font-bold hover:underline"
                    >
                        + Add New
                    </button>
                </div>

                <div className="space-y-4">
                    {contributors.map((contributor, index) => (
                        <div key={contributor.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold shrink-0">
                                {contributor.name ? contributor.name.substring(0, 2).toUpperCase() : '??'}
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Name</label>
                                    <input
                                        type="text"
                                        value={contributor.name}
                                        onChange={(e) => updateContributor(contributor.id, 'name', e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0"
                                        placeholder="Artist Name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Role</label>
                                    <select
                                        value={contributor.role}
                                        onChange={(e) => updateContributor(contributor.id, 'role', e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-sm text-slate-500 dark:text-slate-400 focus:ring-0"
                                    >
                                        <option>Primary Artist</option>
                                        <option>Featured Artist</option>
                                        <option>Producer</option>
                                        <option>Songwriter</option>
                                        <option>Remixer</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 md:mt-0">
                                <div className="text-right">
                                    <div className="flex items-center bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded px-2 py-1">
                                        <input
                                            type="text"
                                            value={contributor.share}
                                            onChange={(e) => updateContributor(contributor.id, 'share', e.target.value)}
                                            className="w-8 bg-transparent border-none p-0 text-xs font-bold text-right focus:ring-0 text-emerald-700 dark:text-emerald-400"
                                        />
                                        <span className="text-xs font-bold ml-0.5">% Split</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeContributor(contributor.id)}
                                    className="text-slate-400 hover:text-rose-500 transition-colors"
                                    disabled={contributors.length === 1}
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4 flex gap-3 border border-amber-100 dark:border-amber-500/20 text-amber-800 dark:text-amber-200">
                <span className="material-symbols-outlined shrink-0">warning</span>
                <p className="text-xs leading-relaxed">Please ensure you have cleared all samples. Uploading unlicensed content may result in a permanent ban from the platform.</p>
            </div>
        </div>
    );

    // Step 3: Review
    const renderStep3 = () => (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review & Submit</h2>
                <p className="text-slate-500 dark:text-slate-400">Double check everything before distributing to stores.</p>
            </div>

            {/* Summary Card */}
            <div className="bg-white dark:bg-card-dark rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="aspect-square w-full max-h-64 bg-slate-100 dark:bg-slate-800 relative group flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300">music_note</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <div className="text-white">
                            <h1 className="text-3xl font-black">{releaseTitle || 'Untitled Release'}</h1>
                            <p className="text-lg font-medium opacity-90">{getDisplayArtistName() || artistName || 'Unknown Artist'}</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Genre</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{genre}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Release Date</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {releaseDate ? new Date(releaseDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tracks</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{audioFiles.length} track{audioFiles.length !== 1 ? 's' : ''} ({releaseType})</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                        <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="size-5 rounded border-slate-300 text-primary focus:ring-primary mt-0.5"
                            />
                            <div className="space-y-1">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">I confirm I have full rights to this content</span>
                                <p className="text-xs text-slate-500 leading-relaxed">I agree to the Terms of Service and confirm this release does not contain unauthorized samples.</p>
                            </div>
                        </label>
                    </div>

                    {submitError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                            {submitError}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            {/* Page Header (Simplified) */}
            <div className="mb-10 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    Step {step} of 3
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                    {step === 1 && "Let's Get Your Music Out There"}
                    {step === 2 && "Rights & Contributors"}
                    {step === 3 && "Final Review"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    {step === 1 && "Upload your audio files and artwork to start the distribution process."}
                    {step === 2 && "Ensure everyone gets paid correctly. Manage splits and licensing."}
                    {step === 3 && "You're almost there. Review your metadata and submit to stores."}
                </p>
            </div>

            {/* Dynamic Content */}
            <div className="mb-24">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white dark:bg-background-dark/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-4 lg:px-8 z-10 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                    <button
                        onClick={onCancel}
                        disabled={submitting}
                        className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-full md:w-auto py-2 disabled:opacity-50"
                    >
                        Cancel Upload
                    </button>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                disabled={submitting}
                                className="px-6 py-3 md:py-2.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full md:w-auto disabled:opacity-50"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={step === 3 ? handleSubmitRelease : handleNext}
                            disabled={submitting}
                            className="px-8 py-3 md:py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-blue-600 shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-2 w-full md:w-auto disabled:opacity-70"
                        >
                            {step === 3 ? (submitting ? 'Submitting...' : 'Submit Release') : 'Next Step'}
                            {step !== 3 && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                        </button>
                    </div>
                </div>
            </div>
            {/* Spacer for fixed footer */}
            <div className="h-24"></div>
        </div>
    );
};

export default NewRelease;
