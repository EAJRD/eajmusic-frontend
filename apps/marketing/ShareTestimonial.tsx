import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PublicService } from '../../src/services/api';

// Public, unauthenticated page a fan/colleague lands on when an artist shares
// their "Compartir mi historia" link (see apps/artist/pages/Profile.tsx).
// Submissions land as PENDING and only appear on the public site once a
// Super Admin/Admin approves them from the admin panel's Testimonials tab.
const ShareTestimonial: React.FC = () => {
  const navigate = useNavigate();
  const { artistId } = useParams<{ artistId: string }>();

  const [quote, setQuote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId) {
      setError('Missing artist link.');
      return;
    }
    if (quote.trim().length < 10) {
      setError('Tu historia debe tener al menos 10 caracteres.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await PublicService.submitTestimonial(artistId, {
        quote: quote.trim(),
        photoUrl: photoUrl.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar tu historia. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden font-sans min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="size-8 text-primary">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-xl font-black tracking-tighter">EAJMUSIC</h2>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-20">
        <div className="max-w-xl mx-auto px-6">
          {submitted ? (
            <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-10 shadow-sm text-center space-y-4">
              <span className="material-symbols-outlined text-5xl text-emerald-500">check_circle</span>
              <h1 className="text-2xl font-black">Gracias por compartir tu historia</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Tu testimonio fue enviado para revisión. Aparecerá en el sitio público una vez que sea aprobado por nuestro equipo.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-black mb-3">Comparte tu historia</h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Cuéntanos tu experiencia trabajando con este artista. Tu testimonio pasará por una revisión antes de publicarse.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tu historia</label>
                  <textarea
                    rows={6}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Comparte cómo fue tu experiencia..."
                    maxLength={2000}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium resize-none"
                  />
                  <p className="text-xs text-slate-400 text-right">{quote.length}/2000</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Foto (opcional)</label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium"
                  />
                  <p className="text-xs text-slate-400">Enlace a una imagen tuya (opcional).</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Enviar mi historia'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ShareTestimonial;
