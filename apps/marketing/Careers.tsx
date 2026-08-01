import React from 'react';
import { useNavigate } from 'react-router';

const Careers: React.FC = () => {
    const navigate = useNavigate();
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
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-bold hover:text-primary transition-colors"
                        >
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

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 text-slate-900 dark:text-white transition-colors bg-slate-50 dark:bg-black overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(37, 37, 244, 0.15) 0%, rgba(10, 10, 10, 1) 70%)' }}></div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        Únete al Equipo
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6">
                        Construye el <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Futuro</span> de la Música
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        EAJMUSIC está revolucionando la distribución musical en Puerto Rico. Si te apasiona la música y la tecnología, queremos conocerte.
                    </p>
                </div>
            </section>

            {/* No Openings Section */}
            <section className="py-24 bg-white dark:bg-background-dark">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="bg-slate-100 dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl p-12">
                        <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl text-slate-400">work</span>
                        </div>
                        <h2 className="text-3xl font-black mb-4">No Hay Vacantes Actualmente</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                            Por el momento no tenemos posiciones abiertas, pero siempre estamos buscando talento excepcional. Si crees que puedes aportar valor a EAJMUSIC, envíanos tu perfil de todas formas.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:Web@eajmusic.com?subject=Aplicación Espontánea"
                                className="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                            >
                                Enviar CV Espontáneo
                            </a>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white px-8 py-4 rounded-xl font-bold transition-all"
                            >
                                Volver al Inicio
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why EAJMUSIC */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-black text-center mb-16">¿Por Qué Trabajar en EAJMUSIC?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl">trending_up</span>
                            </div>
                            <h3 className="text-xl font-black mb-3">Startup en Crecimiento</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Sé parte del equipo fundador y ayuda a construir la próxima gran plataforma de distribución musical.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl">location_on</span>
                            </div>
                            <h3 className="text-xl font-black mb-3">100% Remoto</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Trabaja desde cualquier lugar de Puerto Rico. Flexibilidad total de horario y ubicación.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl">music_note</span>
                            </div>
                            <h3 className="text-xl font-black mb-3">Pasión por la Música</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Trabaja en algo que te apasiona: ayudar a artistas locales a alcanzar audiencias globales.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Future Roles */}
            <section className="py-24 bg-white dark:bg-background-dark">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-black text-center mb-8">Roles Que Buscaremos en el Futuro</h2>
                    <p className="text-center text-slate-600 dark:text-slate-400 mb-12">
                        Aunque no tenemos vacantes ahora, estos son los perfiles que eventualmente necesitaremos:
                    </p>
                    <div className="space-y-4">
                        {[
                            { role: 'Full Stack Developer', skills: 'React, Node.js, PostgreSQL' },
                            { role: 'Music Rights Specialist', skills: 'Copyright, ISRC, UPC' },
                            { role: 'Customer Support (24/7)', skills: 'Español/Inglés, WhatsApp' },
                            { role: 'Marketing Digital', skills: 'SEO, Redes Sociales, Ads' },
                            { role: 'Product Manager', skills: 'Agile, Music Industry' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-6 bg-slate-100 dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-xl">
                                <div>
                                    <h3 className="font-bold text-lg">{item.role}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.skills}</p>
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase">Próximamente</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-primary">
                <div className="max-w-4xl mx-auto px-6 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Mantente en Contacto</h2>
                    <p className="text-xl opacity-90 mb-10">
                        Envíanos tu CV y portafolio. Cuando tengamos vacantes, serás el primero en saberlo.
                    </p>
                    <a
                        href="mailto:Web@eajmusic.com?subject=Interés en Futuras Vacantes"
                        className="inline-block bg-white text-primary px-10 py-5 rounded-xl text-lg font-bold hover:bg-slate-100 transition-all shadow-2xl"
                    >
                        Enviar Mi Perfil
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-100 dark:bg-background-dark py-16 border-t border-slate-200 dark:border-white/5">
                <div className="max-w-4xl mx-auto px-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                    <p>© 2024 EAJMUSIC. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default Careers;
