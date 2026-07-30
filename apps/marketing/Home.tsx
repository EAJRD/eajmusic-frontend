import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../src/services/api';
import { useTheme } from '../../src/contexts/ThemeContext';
import PhoneShowcase from './components/PhoneShowcase';
import DashboardShowcase from './components/DashboardShowcase';
import PricingTable from './components/PricingTable';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { logoUrl } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/public/newsletter', { email });
      setToast('¡Te uniste al newsletter!');
      setEmail('');
    } catch (err) {
      setToast('No se pudo completar el registro.');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <p className="font-bold">{toast}</p>
        </div>
      )}

      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-background-light/85 dark:bg-background-dark/85 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black tracking-tight cursor-pointer" onClick={() => navigate('/')}>
            {logoUrl ? (
              <img src={logoUrl} alt="EAJMUSIC" className="h-6 w-auto object-contain" />
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-primary" />
                EAJMUSIC
              </>
            )}
          </div>
          <nav className="hidden sm:flex items-center gap-7 text-sm text-slate-500 dark:text-slate-400">
            <a href="#showcase" className="hover:text-slate-900 dark:hover:text-white motion-reduce:transition-none transition-colors">Catálogo</a>
            <a href="#dashboard" className="hover:text-slate-900 dark:hover:text-white motion-reduce:transition-none transition-colors">Dashboard</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white motion-reduce:transition-none transition-colors">Precios</a>
            <button onClick={() => navigate('/support')} className="hover:text-slate-900 dark:hover:text-white motion-reduce:transition-none transition-colors">Soporte</button>
            <button onClick={() => navigate('/about')} className="hover:text-slate-900 dark:hover:text-white motion-reduce:transition-none transition-colors">Nosotros</button>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-bold hover:text-primary motion-reduce:transition-none transition-colors">
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-lg text-sm font-bold hover:opacity-85 motion-reduce:transition-none transition-opacity"
            >
              Empezar
            </button>
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="pt-16 pb-6 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wider mb-3.5">EAJMUSIC · distribución para Puerto Rico</div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-[14ch] mb-5 leading-[1.05]">
            Tu catálogo, en tu bolsillo.
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-[46ch] text-base md:text-lg mb-7">
            Sube, revisa y cobra tus lanzamientos desde una sola app. Sin panel de admin ajeno, sin esperar el correo —
            el estado de tu música y tu dinero, en tiempo real.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#showcase"
              className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-85 motion-reduce:transition-none transition-opacity"
            >
              Ver la app
            </a>
            <a
              href="#dashboard"
              className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/15 px-5 py-2.5 rounded-lg text-sm font-bold hover:border-slate-400 dark:hover:border-white/30 motion-reduce:transition-none transition-colors"
            >
              Ver el dashboard
            </a>
          </div>
        </div>
      </section>

      {/* Phone showcase */}
      <section className="py-14 md:py-20 px-6" id="showcase">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[0.9fr_1.3fr_0.9fr] gap-6 items-center">
          <div className="flex flex-row md:flex-col flex-wrap justify-center md:justify-start gap-7 text-center md:text-left order-2 md:order-1">
            <div className="max-w-[220px] mx-auto md:mx-0">
              <span className="block font-mono text-primary text-xs mb-1.5">Catálogo</span>
              <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
                Cada lanzamiento con su estado real: en vivo, en revisión o programado — no un ícono decorativo.
              </p>
            </div>
            <div className="max-w-[220px] mx-auto md:mx-0">
              <span className="block font-mono text-primary text-xs mb-1.5">Actividad</span>
              <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
                Notificaciones de lo que realmente pasó: pago procesado, hito de streams, revisión aprobada.
              </p>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <PhoneShowcase />
          </div>

          <div className="flex flex-row md:flex-col flex-wrap justify-center md:items-end md:justify-start gap-7 text-center md:text-right order-3">
            <div className="max-w-[220px] mx-auto md:mx-0">
              <span className="block font-mono text-primary text-xs mb-1.5">Wallet</span>
              <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
                Balance real y retiro directo por ATH Móvil — sin pasar por un banco de EE.UU. primero.
              </p>
            </div>
            <div className="max-w-[220px] mx-auto md:mx-0">
              <span className="block font-mono text-primary text-xs mb-1.5">Perfil</span>
              <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
                El enlace para pedir testimonios vive aquí, no en un formulario aparte que nadie recuerda mandar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard showcase */}
      <section className="py-14 md:py-20 px-6" id="dashboard">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-[44ch]">
            <div className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-2.5">Para managers y sellos</div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">El mismo catálogo, visto desde una laptop.</h2>
            <p className="text-slate-600 dark:text-slate-300 text-base">
              La versión de escritorio no repite la app — añade lo que solo tiene sentido con teclado y mouse: tablas,
              comparación de rango de fechas, gestión de equipo.
            </p>
          </div>
          <DashboardShowcase />
        </div>
      </section>

      {/* Pricing */}
      <section className="py-14 md:py-20 px-6" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-[44ch]">
            <div className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-2.5">Precios</div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Un plan para empezar, otro para crecer.</h2>
            <p className="text-slate-600 dark:text-slate-300 text-base">
              Sin comisión sobre tus regalías en ningún plan — la diferencia está en cuántos artistas manejas y qué tan
              rápido necesitas la data.
            </p>
          </div>
          <PricingTable onSelectPlan={() => navigate('/register')} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-primary">
        <div className="max-w-3xl mx-auto text-center text-[#04211c]">
          <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">¿Listo para llevar tu música en tu bolsillo?</h2>
          <p className="text-lg opacity-80 mb-8">Súmate a los artistas que ya distribuyen y cobran desde EAJMUSIC.</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-[#04211c] text-white px-8 py-4 rounded-xl text-base font-bold hover:opacity-90 motion-reduce:transition-none transition-opacity"
          >
            Empezar gratis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 font-black tracking-tight">
              {logoUrl ? (
                <img src={logoUrl} alt="EAJMUSIC" className="h-5 w-auto object-contain" />
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  EAJMUSIC
                </>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Distribución musical hecha para Puerto Rico. Tu catálogo, tus regalías, tu idioma.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-5 text-sm">Producto</h4>
            <ul className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#showcase" className="hover:text-primary motion-reduce:transition-none transition-colors">Catálogo</a></li>
              <li><a href="#dashboard" className="hover:text-primary motion-reduce:transition-none transition-colors">Dashboard</a></li>
              <li><a href="#pricing" className="hover:text-primary motion-reduce:transition-none transition-colors">Precios</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-5 text-sm">Compañía</h4>
            <ul className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
              <li><button onClick={() => navigate('/about')} className="hover:text-primary motion-reduce:transition-none transition-colors">Nosotros</button></li>
              <li><button onClick={() => navigate('/careers')} className="hover:text-primary motion-reduce:transition-none transition-colors">Empleo</button></li>
              <li><button onClick={() => navigate('/support')} className="hover:text-primary motion-reduce:transition-none transition-colors">Soporte</button></li>
              <li><button onClick={() => navigate('/privacy')} className="hover:text-primary motion-reduce:transition-none transition-colors">Privacidad</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-primary motion-reduce:transition-none transition-colors">Términos</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-5 text-sm">Newsletter</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Noticias y novedades de la industria musical.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo"
                className="flex-1 min-w-0 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary px-3 py-2 motion-reduce:transition-none transition-colors"
                required
              />
              <button disabled={loading} type="submit" className="bg-primary text-[#04211c] px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 flex-shrink-0">
                {loading ? '...' : 'Unirme'}
              </button>
            </form>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-14 pt-8 border-t border-slate-200 dark:border-white/10 text-center text-slate-500 dark:text-slate-400 text-xs">
          © 2026 EAJMUSIC Distribution. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Home;
