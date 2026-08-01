import React, { useState } from 'react';
import { ArtistService, UploadService } from '../../../src/services/api';
import { useAuth } from '../../../src/contexts/AuthContext';

interface NewReleaseProps {
    onComplete?: () => void;
    onCancel?: () => void;
}

const WIZARD_STEPS = [
    { number: 1, label: 'Upload & Details' },
    { number: 2, label: 'Additional Details' },
    { number: 3, label: 'Rights & Splits' },
    { number: 4, label: 'Review & Submit' },
];

// Sonic Dark stepper: outline circle = inactive, solid lime circle + glowing dot = active, lime checkmark = completed.
const Stepper: React.FC<{ current: number }> = ({ current }) => (
    <div className="flex items-center justify-center">
        {WIZARD_STEPS.map((s, idx) => {
            const isCompleted = current > s.number;
            const isActive = current === s.number;
            return (
                <React.Fragment key={s.number}>
                    <div className="flex items-center gap-2.5">
                        <div
                            className={
                                isCompleted
                                    ? 'flex items-center justify-center size-8 rounded-full border border-sonic-primary bg-transparent shrink-0'
                                    : isActive
                                        ? 'flex items-center justify-center size-8 rounded-full bg-sonic-primary shadow-[0_0_0_4px_rgba(225,255,0,0.15)] shrink-0'
                                        : 'flex items-center justify-center size-8 rounded-full border border-sonic-border shrink-0'
                            }
                        >
                            {isCompleted && <span className="material-symbols-outlined text-[16px] text-sonic-primary">check</span>}
                            {isActive && <span className="size-2.5 rounded-full bg-sonic-primary-ink" />}
                            {!isCompleted && !isActive && <span className="text-xs font-bold text-sonic-text-dim">{s.number}</span>}
                        </div>
                        <span className={`hidden sm:inline text-xs font-bold uppercase tracking-wider ${isActive ? 'text-sonic-primary' : isCompleted ? 'text-sonic-text' : 'text-sonic-text-dim'}`}>
                            {s.label}
                        </span>
                    </div>
                    {idx < WIZARD_STEPS.length - 1 && (
                        <div className={`h-px w-8 sm:w-16 mx-3 sm:mx-4 shrink-0 ${current > s.number ? 'bg-sonic-primary' : 'bg-sonic-border'}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// App-style switch, replacing raw checkboxes for binary Yes/No settings.
const Toggle: React.FC<{ id: string; checked: boolean; onChange: (v: boolean) => void }> = ({ id, checked, onChange }) => (
    <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sonic-primary focus:ring-offset-2 focus:ring-offset-sonic-card ${checked ? 'bg-sonic-primary' : 'bg-sonic-border'}`}
    >
        <span className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const NewRelease: React.FC<NewReleaseProps> = ({ onComplete, onCancel }) => {
    const { user } = useAuth();
    const isFreePlan = (user?.subscription?.plan || 'FREE') === 'FREE';

    const [step, setStep] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [stepError, setStepError] = useState('');

    // Generated once per mount of this wizard, reused across every submit
    // retry within it (double-click, network blip after a 201 the client
    // never saw) so the backend can recognize a retry and return the
    // already-created release instead of making a second DRAFT. A fresh
    // wizard mount (cancel + reopen) gets a fresh key, as it should.
    const idempotencyKeyRef = React.useRef<string>(crypto.randomUUID());

    // File Upload State
    const [audioFiles, setAudioFiles] = useState<File[]>([]);
    const [coverArt, setCoverArt] = useState<File | null>(null);
    const [coverArtPreview, setCoverArtPreview] = useState<string>('');
    const [coverArtError, setCoverArtError] = useState('');

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
    const [genre, setGenre] = useState('Reggaetón');

    // Additional Metadata
    const [releaseType, setReleaseType] = useState('Single');
    const [releaseDate, setReleaseDate] = useState('');
    const [language, setLanguage] = useState('Spanish');
    const [recordLabel, setRecordLabel] = useState('');
    const [upc, setUpc] = useState('');
    const [isExplicit, setIsExplicit] = useState(false);
    const [previouslyReleased, setPreviouslyReleased] = useState(false);

    // Rights & Splits step state - C/P line years default to the current
    // year (an artist can still navigate back to an earlier year for an
    // older recording), not a hardcoded stale year.
    const currentYear = String(new Date().getFullYear());
    const [cLineYear, setCLineYear] = useState(currentYear);
    const [cLineName, setCLineName] = useState('');
    const [pLineYear, setPLineYear] = useState(currentYear);
    const [pLineName, setPLineName] = useState('');

    // Step 3 state
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Free accounts need 45 days lead time; Pro (and above) need 21 - matches
    // the backend's own plan-aware check in POST /artist/releases, this is
    // just so the calendar doesn't let a Free artist pick a date the server
    // will reject.
    const MIN_LEAD_DAYS = isFreePlan ? 45 : 21;
    const getMinReleaseDate = () => {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + MIN_LEAD_DAYS);
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
        if (trackCount <= 1) {
            setReleaseType('Single');
        } else if (trackCount <= 5) {
            setReleaseType('EP');
        } else {
            setReleaseType('Album');
        }
    };

    const MIN_COVER_PX = 3000;

    const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverArtError('');

            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                setCoverArtError('La portada debe ser JPG o PNG.');
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const { naturalWidth: w, naturalHeight: h } = img;
                URL.revokeObjectURL(objectUrl);
                if (w !== h) {
                    setCoverArtError(`La portada debe ser cuadrada (1:1). La imagen que subiste mide ${w}x${h}px.`);
                    return;
                }
                if (w < MIN_COVER_PX) {
                    setCoverArtError(`La portada es muy pequeña (${w}x${h}px). El mínimo es ${MIN_COVER_PX}x${MIN_COVER_PX}px.`);
                    return;
                }
                setCoverArt(file);
                const reader = new FileReader();
                reader.onloadend = () => setCoverArtPreview(reader.result as string);
                reader.readAsDataURL(file);
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                setCoverArtError('No pudimos leer esa imagen. Intenta con otro archivo.');
            };
            img.src = objectUrl;
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
        const audioFormats = ['audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac'];
        const validFiles = droppedFiles.filter(file => audioFormats.includes(file.type));

        if (validFiles.length > 0) {
            setAudioFiles(prev => [...prev, ...validFiles]);
        }
    };

    const handleNext = () => {
        setStepError('');
        if (step === 1) {
            if (audioFiles.length === 0) return setStepError('Sube al menos un archivo de audio.');
            if (!coverArt) return setStepError('Sube la portada del lanzamiento.');
            if (!releaseTitle.trim()) return setStepError('Ingresa el título del lanzamiento.');
        }
        if (step === 2) {
            if (!releaseDate) return setStepError('Elige una fecha de lanzamiento.');
        }
        if (step === 3) {
            const err = validateRightsStep();
            if (err) return setStepError(err);
        }
        setStep(prev => prev + 1);
    };
    const handleBack = () => { setStepError(''); setStep(prev => prev - 1); };

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
        'Co-Producer': 'CO_PRODUCER',
        'Songwriter': 'SONGWRITER',
        'Remixer': 'PRODUCER',
    };

    // Grupo 4.1: splits must sum to exactly 100%, and only one contributor
    // may hold "Primary Artist" / "Producer" - additional people in those
    // roles must be re-categorized as Featured Artist / Co-Producer.
    const splitsTotal = contributors.reduce((sum, c) => sum + (parseFloat(c.share) || 0), 0);
    const primaryArtistCount = contributors.filter(c => c.role === 'Primary Artist').length;
    const producerCount = contributors.filter(c => c.role === 'Producer').length;

    const validateRightsStep = (): string => {
        if (primaryArtistCount > 1) {
            return 'Solo puede haber 1 Artista Principal. Cambia a los demás a "Featured Artist".';
        }
        if (primaryArtistCount === 0) {
            return 'Debe haber exactamente 1 Artista Principal.';
        }
        if (producerCount > 1) {
            return 'Solo puede haber 1 Productor principal. Cambia a los demás a "Co-Producer".';
        }
        if (Math.round(splitsTotal * 100) / 100 !== 100) {
            return `Los splits deben sumar exactamente 100% (actualmente suman ${splitsTotal}%).`;
        }
        return '';
    };

    const handleSubmitRelease = async () => {
        setSubmitError('');

        if (audioFiles.length === 0) { setSubmitError('Please upload at least one audio file.'); setStep(1); return; }
        if (!coverArt) { setSubmitError('Please upload cover artwork.'); setStep(1); return; }
        if (!releaseTitle.trim()) { setSubmitError('Please enter a release title.'); setStep(1); return; }
        if (!releaseDate) { setSubmitError('Please choose a release date.'); setStep(2); return; }
        const rightsError = validateRightsStep();
        if (rightsError) { setSubmitError(rightsError); setStep(3); return; }
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
                idempotencyKey: idempotencyKeyRef.current,
            });

            // Backend's POST /artist/releases returns the release fields flat
            // ({ ...release, artistName }), never wrapped in { release: {...} }.
            const releaseId = created?.id;
            if (!releaseId) throw new Error('Release was created but no ID was returned.');

            // Cover art upload attaches directly to the release (releaseId is passed).
            await UploadService.uploadCover(coverArt, releaseId);

            // Attach each audio file to its track by track number.
            for (let i = 0; i < audioFiles.length; i++) {
                await UploadService.uploadAudio(audioFiles[i], releaseId, i + 1);
            }

            await ArtistService.submitRelease(releaseId);

            // Fresh key in case this wizard instance gets reused for another
            // release without remounting - the just-used key stays retired.
            idempotencyKeyRef.current = crypto.randomUUID();
            onComplete?.();
        } catch (err: any) {
            // The backend's generic "Invalid input data" message never says
            // which field actually failed Zod validation - surface the real
            // per-field detail (err.data.details, see ApiError in api.ts)
            // instead of leaving the artist guessing at what to fix.
            const details = err?.data?.details as { field: string; message: string }[] | undefined;
            const detailText = details?.length
                ? details.map((d) => `${d.field}: ${d.message}`).join(' | ')
                : undefined;
            setSubmitError(detailText || err.message || 'Failed to submit release. Please try again.');
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto pb-4">
            {/* 1. Track Upload + Track List (Left) — "Lista de Pistas" */}
            <div className="flex flex-col gap-4">
                <div
                    className={`group relative rounded-lg border transition-colors duration-200 ${isDragging ? 'border-sonic-primary bg-sonic-primary/5' : 'border-dashed border-sonic-border hover:border-sonic-primary bg-sonic-card'} min-h-[220px] flex flex-col items-center justify-center text-center p-8 cursor-pointer`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="size-14 rounded-full bg-sonic-elevated flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-sonic-text-dim group-hover:text-sonic-primary transition-colors">upload_file</span>
                    </div>
                    <h3 className="text-lg font-bold text-sonic-text mb-1">Upload Audio Files</h3>
                    <p className="text-sm text-sonic-text-dim max-w-xs mx-auto mb-6">Arrastra y suelta tus archivos WAV o FLAC aquí, o busca en tu computadora. No aceptamos MP3.</p>

                    <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/wav,audio/x-wav,audio/flac,audio/x-flac"
                        multiple
                        onChange={handleAudioFileChange}
                        className="hidden"
                    />
                    <button
                        onClick={() => audioInputRef.current?.click()}
                        className="px-5 py-2.5 rounded bg-sonic-primary text-sonic-primary-ink font-bold text-sm hover:brightness-95 transition-all"
                    >
                        Buscar Archivos
                    </button>

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-[10px] text-sonic-text-dim font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-sonic-primary">check</span> 16/24 bit</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-sonic-primary">check</span> 44.1kHz+</span>
                    </div>
                </div>

                {/* Track rows — numbered like the "Lista de Pistas" reference */}
                {audioFiles.length > 0 && (
                    <div className="rounded-lg border border-sonic-border bg-sonic-card overflow-hidden">
                        <div className="divide-y divide-sonic-border">
                            {audioFiles.map((file, index) => (
                                <div key={index} className="p-4">
                                    {/* Track row header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-7 rounded-full border border-sonic-border flex items-center justify-center text-xs font-bold text-sonic-text-dim shrink-0">
                                            {index + 1}
                                        </div>
                                        <span className="material-symbols-outlined text-sonic-primary text-base">music_note</span>
                                        <span className="flex-1 truncate font-medium text-sonic-text text-sm">{file.name}</span>
                                        <span className="text-sonic-text-dim text-xs font-mono">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                                        <button onClick={() => removeAudioFile(index)} className="text-sonic-text-dim hover:text-sonic-error transition-colors">
                                            <span className="material-symbols-outlined text-base">close</span>
                                        </button>
                                    </div>
                                    {/* Track Metadata */}
                                    <div className="pl-10 space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Track Title"
                                                value={trackMetadata[index]?.title || ''}
                                                onChange={(e) => updateTrackMetadata(index, 'title', e.target.value)}
                                                className="flex-1 bg-sonic-surface border border-sonic-border rounded px-2.5 py-1.5 text-xs font-medium text-sonic-text placeholder-sonic-text-dim focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Artists"
                                                value={trackMetadata[index]?.artists || ''}
                                                onChange={(e) => updateTrackMetadata(index, 'artists', e.target.value)}
                                                className="flex-1 bg-sonic-surface border border-sonic-border rounded px-2.5 py-1.5 text-xs font-medium text-sonic-text placeholder-sonic-text-dim focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="ISRC (Optional)"
                                            value={trackMetadata[index]?.isrc || ''}
                                            onChange={(e) => updateTrackMetadata(index, 'isrc', e.target.value)}
                                            className="w-full bg-sonic-surface border border-sonic-border rounded px-2.5 py-1.5 text-xs font-mono text-sonic-text placeholder-sonic-text-dim focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Cover Art + Metadata (Right) — "Subir Portada" + "Datos del Lanzamiento" */}
            <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-sonic-border bg-sonic-card p-6 flex flex-col sm:flex-row gap-6">
                    <div
                        onClick={() => coverInputRef.current?.click()}
                        className="size-36 shrink-0 rounded-lg bg-sonic-surface border border-dashed border-sonic-border mx-auto sm:mx-0 flex items-center justify-center relative group cursor-pointer overflow-hidden hover:border-sonic-primary transition-colors"
                    >
                        {coverArtPreview ? (
                            <img src={coverArtPreview} alt="Cover Art" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-3xl text-sonic-text-dim group-hover:text-sonic-primary transition-colors z-10">image</span>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <span className="text-sonic-text font-bold text-xs text-center px-2">{coverArtPreview ? 'Change Cover' : 'Upload Cover'}</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-sonic-text mb-2 uppercase tracking-wide">Requisitos de Portada</h3>
                        <ul className="text-xs text-sonic-text-dim space-y-1 mb-4 list-disc list-inside">
                            <li>Cuadrada, formato JPG o PNG, mínimo 3000x3000px.</li>
                            <li>Sin texto borroso ni pixelado.</li>
                        </ul>
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleCoverArtChange}
                            className="hidden"
                        />
                        <button onClick={() => coverInputRef.current?.click()} className="px-4 py-2 rounded border border-sonic-border text-sonic-text text-xs font-bold hover:border-sonic-primary hover:text-sonic-primary transition-colors">
                            Buscar Imágenes
                        </button>
                        {coverArtError && (
                            <p className="text-xs text-sonic-error font-medium mt-2">{coverArtError}</p>
                        )}
                    </div>
                </div>

                {/* Metadata Quick Inputs */}
                <div className="rounded-lg border border-sonic-border bg-sonic-card p-6">
                    <h4 className="text-xs font-bold text-sonic-text uppercase tracking-wider mb-4">Datos del Lanzamiento</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-sonic-text-dim uppercase mb-1.5 block">Release Title</label>
                            <input
                                type="text"
                                value={releaseTitle}
                                onChange={(e) => setReleaseTitle(e.target.value)}
                                className="w-full bg-sonic-surface border border-sonic-border rounded px-4 py-2.5 font-bold text-sonic-text placeholder-sonic-text-dim focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary transition-colors"
                                placeholder="e.g. Midnight Memories"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-sonic-text-dim uppercase mb-1.5 block">Primary Artist</label>
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
                                    className="w-full bg-sonic-surface border border-sonic-border rounded px-4 py-2.5 font-bold text-sonic-text placeholder-sonic-text-dim focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary transition-colors"
                                    placeholder="Artist Name"
                                />
                            </div>
                            <div className="w-1/3">
                                <label className="text-xs font-bold text-sonic-text-dim uppercase mb-1.5 block">Genre</label>
                                <select
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    className="w-full bg-sonic-surface border border-sonic-border rounded px-4 py-2.5 font-medium text-sonic-text focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary transition-colors"
                                >
                                    <option>Reggaetón</option>
                                    <option>Trap Latino</option>
                                    <option>Pop Latino</option>
                                    <option>Latin Urbano</option>
                                    <option>Salsa</option>
                                    <option>Bachata</option>
                                    <option>Merengue</option>
                                    <option>Latin</option>
                                    <option>Pop</option>
                                    <option>Rock</option>
                                    <option>Hip Hop/Rap</option>
                                    <option>R&B/Soul</option>
                                    <option>Electronic/Dance</option>
                                    <option>Country</option>
                                    <option>Jazz</option>
                                    <option>Classical</option>
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

            </div>
        </div>
    );

    // Step 2: Additional Details (its own step, not buried in Step 1)
    const renderStep2 = () => (
        <div className="max-w-2xl mx-auto">
            <div className="rounded-lg border border-sonic-border bg-sonic-card p-6">
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-sonic-text-dim uppercase mb-1.5 block">Release Type</label>
                            <select
                                value={releaseType}
                                disabled
                                className="w-full bg-sonic-surface border border-sonic-border rounded px-4 py-2.5 font-medium text-sonic-text-dim opacity-60 cursor-not-allowed"
                            >
                                <option>Single</option>
                                <option>EP</option>
                                <option>Album</option>
                            </select>
                            <p className="text-[10px] text-sonic-text-dim mt-1">Auto-detectado según cantidad de pistas</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-sonic-text-dim uppercase mb-1.5 block">Idioma</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-sonic-surface border border-sonic-border rounded px-4 py-2.5 font-medium text-sonic-text focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary transition-colors"
                            >
                                <option>Spanish</option>
                                <option>English</option>
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
                        <label className="text-xs font-bold text-sonic-text-dim uppercase mb-1.5 block">Release Date</label>
                        <input
                            type="date"
                            value={releaseDate}
                            onChange={(e) => setReleaseDate(e.target.value)}
                            min={getMinReleaseDate()}
                            className="w-full bg-sonic-surface border border-sonic-border rounded px-4 py-2.5 font-medium text-sonic-text focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary transition-colors"
                        />
                        <p className="text-[10px] text-sonic-text-dim mt-1">
                            {isFreePlan
                                ? 'Cuentas Free: mínimo 45 días desde hoy. Sube de plan para reducirlo a 21 días.'
                                : 'Mínimo 21 días desde hoy.'}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-sonic-text-dim uppercase mb-1.5 block">Record Label (Optional)</label>
                        <input
                            type="text"
                            value={recordLabel}
                            onChange={(e) => setRecordLabel(e.target.value)}
                            className="w-full bg-sonic-surface border border-sonic-border rounded px-4 py-2.5 font-medium text-sonic-text placeholder-sonic-text-dim focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary transition-colors"
                            placeholder="e.g. EAJMusic"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-sonic-text-dim uppercase mb-1.5 block">UPC/EAN (Optional)</label>
                        <input
                            type="text"
                            value={upc}
                            onChange={(e) => setUpc(e.target.value)}
                            className="w-full bg-sonic-surface border border-sonic-border rounded px-4 py-2.5 font-mono text-sonic-text placeholder-sonic-text-dim focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary transition-colors"
                            placeholder="Leave blank to auto-generate"
                        />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-sonic-border">
                        <label htmlFor="explicit" className="text-sm font-medium text-sonic-text cursor-pointer">
                            Contenido explícito
                        </label>
                        <Toggle id="explicit" checked={isExplicit} onChange={setIsExplicit} />
                    </div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="previously-released" className="text-sm font-medium text-sonic-text cursor-pointer">
                            Lanzado previamente en otro lugar
                        </label>
                        <Toggle id="previously-released" checked={previouslyReleased} onChange={setPreviouslyReleased} />
                    </div>
                </div>
            </div>
        </div>
    );

    // Step 3: Rights & Contributors
    const renderStep3 = () => (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Copyright & Licensing */}
            <div className="bg-sonic-card rounded-lg p-6 border border-sonic-border">
                <div className="flex items-start gap-4 mb-6">
                    <div className="bg-sonic-primary/10 p-3 rounded text-sonic-primary">
                        <span className="material-symbols-outlined">copyright</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-sonic-text">Copyright & Ownership</h3>
                        <p className="text-sonic-text-dim text-sm mt-1">Declare ownership details for correct royalty collection.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-sonic-text-dim uppercase block">Composition Copyright (C Line)</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={cLineYear}
                                onChange={(e) => setCLineYear(e.target.value)}
                                className="w-24 bg-sonic-surface border border-sonic-border rounded px-4 py-2.5 font-mono text-center text-sonic-text focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary transition-colors"
                            />
                            <input
                                type="text"
                                value={cLineName}
                                onChange={(e) => setCLineName(e.target.value)}
                                className="flex-1 bg-sonic-surface border border-sonic-border rounded px-4 py-2.5 font-bold text-sonic-text placeholder-sonic-text-dim focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary transition-colors"
                                placeholder="Entity / Name"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-sonic-text-dim uppercase block">Sound Recording Copyright (P Line)</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={pLineYear}
                                onChange={(e) => setPLineYear(e.target.value)}
                                className="w-24 bg-sonic-surface border border-sonic-border rounded px-4 py-2.5 font-mono text-center text-sonic-text focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary transition-colors"
                            />
                            <input
                                type="text"
                                value={pLineName}
                                onChange={(e) => setPLineName(e.target.value)}
                                className="flex-1 bg-sonic-surface border border-sonic-border rounded px-4 py-2.5 font-bold text-sonic-text placeholder-sonic-text-dim focus:outline-none focus:border-sonic-primary focus:ring-1 focus:ring-sonic-primary transition-colors"
                                placeholder="Entity / Name"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contributors */}
            <div className="bg-sonic-card rounded-lg p-6 border border-sonic-border">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-sonic-text-dim">group</span>
                        <h3 className="text-base font-bold text-sonic-text">Contributors</h3>
                    </div>
                    <button
                        onClick={addContributor}
                        className="text-sonic-primary text-sm font-bold hover:underline"
                    >
                        + Add New
                    </button>
                </div>

                <div className="space-y-3">
                    {contributors.map((contributor, index) => (
                        <div key={contributor.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded border border-sonic-border bg-sonic-surface">
                            <div className="size-10 rounded-full bg-sonic-elevated flex items-center justify-center text-sonic-text-dim font-bold shrink-0">
                                {contributor.name ? contributor.name.substring(0, 2).toUpperCase() : '??'}
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-sonic-text-dim">Name</label>
                                    <input
                                        type="text"
                                        value={contributor.name}
                                        onChange={(e) => updateContributor(contributor.id, 'name', e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-sonic-text placeholder-sonic-text-dim focus:ring-0"
                                        placeholder="Artist Name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-sonic-text-dim">Role</label>
                                    <select
                                        value={contributor.role}
                                        onChange={(e) => updateContributor(contributor.id, 'role', e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-sm text-sonic-text-dim focus:ring-0"
                                    >
                                        <option>Primary Artist</option>
                                        <option>Featured Artist</option>
                                        <option>Producer</option>
                                        <option>Co-Producer</option>
                                        <option>Songwriter</option>
                                        <option>Remixer</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 md:mt-0">
                                <div className="text-right">
                                    <div className="flex items-center bg-sonic-primary/10 text-sonic-primary rounded px-2 py-1">
                                        <input
                                            type="text"
                                            value={contributor.share}
                                            onChange={(e) => updateContributor(contributor.id, 'share', e.target.value)}
                                            className="w-8 bg-transparent border-none p-0 text-xs font-bold text-right focus:ring-0 text-sonic-primary"
                                        />
                                        <span className="text-xs font-bold ml-0.5">% Split</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeContributor(contributor.id)}
                                    className="text-sonic-text-dim hover:text-sonic-error transition-colors"
                                    disabled={contributors.length === 1}
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-sonic-text-dim uppercase">Total de Splits</span>
                <span className={`text-sm font-black ${splitsTotal === 100 ? 'text-sonic-primary' : 'text-sonic-error'}`}>{splitsTotal}%</span>
            </div>

            <div className="bg-sonic-error/10 rounded-lg p-4 flex gap-3 border border-sonic-error/20 text-sonic-error">
                <span className="material-symbols-outlined shrink-0">warning</span>
                <p className="text-xs leading-relaxed">Please ensure you have cleared all samples. Uploading unlicensed content may result in a permanent ban from the platform.</p>
            </div>
        </div>
    );

    // Step 4: Review
    const renderStep4 = () => (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-sonic-text">Revisar</h2>
                <p className="text-sonic-text-dim">Double check everything before distributing to stores.</p>
            </div>

            {/* Distribution reach - the payoff moment right before Submit */}
            <div className="rounded-lg border border-sonic-primary/30 bg-sonic-primary/10 p-5 flex items-center gap-4">
                <span className="material-symbols-outlined text-sonic-primary text-3xl">public</span>
                <div>
                    <p className="text-sonic-text font-black text-base leading-tight">Se distribuirá a más de 200 plataformas digitales globales</p>
                    <p className="text-sonic-text-dim text-xs mt-0.5">Spotify, Apple Music, Amazon Music, TikTok, YouTube Music y muchas más.</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-sonic-card rounded-lg overflow-hidden border border-sonic-border">
                <div className="aspect-square w-full max-h-64 bg-sonic-surface relative group flex items-center justify-center">
                    {coverArtPreview ? (
                        <img src={coverArtPreview} alt="Cover Art" className="w-full h-full object-cover" />
                    ) : (
                        <span className="material-symbols-outlined text-6xl text-sonic-text-dim">music_note</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                        <div className="text-sonic-text">
                            <h1 className="text-3xl font-black">{releaseTitle || 'Untitled Release'}</h1>
                            <p className="text-lg font-medium opacity-90">{getDisplayArtistName() || artistName || 'Unknown Artist'}</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-bold text-sonic-text-dim uppercase tracking-wider mb-1">Genre</p>
                            <p className="text-sm font-bold text-sonic-text">{genre}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-sonic-text-dim uppercase tracking-wider mb-1">Release Date</p>
                            <p className="text-sm font-bold text-sonic-text">
                                {releaseDate ? new Date(releaseDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-sonic-text-dim uppercase tracking-wider mb-1">Tracks</p>
                            <p className="text-sm font-bold text-sonic-text">{audioFiles.length} track{audioFiles.length !== 1 ? 's' : ''} ({releaseType})</p>
                        </div>
                    </div>

                    <div className="border-t border-sonic-border pt-6">
                        <label className="flex items-start gap-4 cursor-pointer p-4 rounded hover:bg-sonic-surface transition-colors">
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="size-5 rounded border-sonic-border bg-sonic-surface text-sonic-primary focus:ring-sonic-primary focus:ring-offset-0 mt-0.5"
                            />
                            <div className="space-y-1">
                                <span className="font-bold text-sm text-sonic-text">I confirm I have full rights to this content</span>
                                <p className="text-xs text-sonic-text-dim leading-relaxed">I agree to the Terms of Service and confirm this release does not contain unauthorized samples.</p>
                            </div>
                        </label>
                    </div>

                    {submitError && (
                        <div className="bg-sonic-error/10 border border-sonic-error/30 text-sonic-error px-4 py-3 rounded text-sm">
                            {submitError}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-sonic text-sonic-text bg-sonic-bg">
            {/* Page Header with Sonic Dark Stepper */}
            <div className="mb-10">
                <div className="mb-8">
                    <Stepper current={step} />
                </div>
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-sonic-text">
                        {step === 1 && "Let's Get Your Music Out There"}
                        {step === 2 && "Additional Details"}
                        {step === 3 && "Rights & Contributors"}
                        {step === 4 && "Final Review"}
                    </h1>
                    <p className="text-sonic-text-dim text-lg">
                        {step === 1 && "Upload your audio files and artwork to start the distribution process."}
                        {step === 2 && "Language, release date, and a few extra details."}
                        {step === 3 && "Ensure everyone gets paid correctly. Manage splits and licensing."}
                        {step === 4 && "You're almost there. Review your metadata and submit to stores."}
                    </p>
                </div>
            </div>

            {stepError && (
                <div className="max-w-4xl mx-auto mb-6 bg-sonic-error/10 border border-sonic-error/30 text-sonic-error px-4 py-3 rounded text-sm font-medium text-center">
                    {stepError}
                </div>
            )}

            {/* Dynamic Content */}
            <div className="mb-24">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-sonic-surface/95 backdrop-blur-lg border-t border-sonic-border p-4 lg:px-8 z-10 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                    <button
                        onClick={onCancel}
                        disabled={submitting}
                        className="text-sm font-bold text-sonic-text-dim hover:text-sonic-text transition-colors w-full md:w-auto py-2 disabled:opacity-50"
                    >
                        Cancel Upload
                    </button>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                disabled={submitting}
                                className="px-6 py-3 md:py-2.5 rounded font-bold text-sm border border-sonic-border text-sonic-text hover:border-sonic-primary hover:text-sonic-primary transition-colors w-full md:w-auto disabled:opacity-50"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={step === 4 ? handleSubmitRelease : handleNext}
                            disabled={submitting}
                            className="px-8 py-3 md:py-2.5 rounded font-bold text-sm bg-sonic-primary text-sonic-primary-ink hover:brightness-95 transition-all flex items-center justify-center gap-2 w-full md:w-auto disabled:opacity-70"
                        >
                            {step === 4 ? (submitting ? 'Submitting...' : 'Submit Release') : 'Next Step'}
                            {step !== 4 && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
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
