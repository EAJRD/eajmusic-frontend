import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PublicService } from '../../src/services/api';

interface TalentCard {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
}

const Talent: React.FC = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<TalentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await PublicService.getTalent({ limit: 48 });
        setArtists(res?.data || []);
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar el talento de la plataforma.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden font-sans min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="size-8 text-primary">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-xl font-black tracking-tighter">EAJMUSIC</h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-bold hover:text-primary transition-colors">
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
            >
              Comenzar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-16 text-slate-900 dark:text-white transition-colors bg-slate-50 dark:bg-black overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(37, 37, 244, 0.15) 0%, rgba(10, 10, 10, 1) 70%)' }}></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Nuestro Talento
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
            Artistas de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">EAJMUSIC</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Conoce a los artistas que distribuyen su música con nosotros.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        {loading && (
          <p className="text-center text-slate-500 dark:text-slate-400">Cargando artistas...</p>
        )}
        {error && (
          <div className="max-w-lg mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        {!loading && !error && artists.length === 0 && (
          <p className="text-center text-slate-500 dark:text-slate-400">Todavía no hay artistas públicos en la plataforma.</p>
        )}
        {!loading && artists.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:border-primary transition-colors"
              >
                <div
                  className="size-24 rounded-full bg-slate-200 dark:bg-slate-800 bg-cover bg-center mb-4 relative"
                  style={artist.avatarUrl ? { backgroundImage: `url('${artist.avatarUrl}')` } : undefined}
                >
                  {!artist.avatarUrl && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-3xl">person</span>
                    </div>
                  )}
                  {artist.isVerified && (
                    <span className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                    </span>
                  )}
                </div>
                <h3 className="font-black text-lg">{artist.name}</h3>
                {artist.bio && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">{artist.bio}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Talent;
