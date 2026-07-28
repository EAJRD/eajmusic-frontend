import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutUs: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden font-sans">
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
                <div className="absolute inset-0 pointer-events-none opacity-100 dark:opacity-0 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(37,37,244,0.05)_0%,rgba(255,255,255,1)_60%)]"></div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        Nuestra Misión
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6">
                        La <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Nueva Era</span> de la Distribución Musical
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        Creada por artistas, para artistas. EAJMUSIC nace para resolver un problema real: las distribuidoras tradicionales no entienden nuestra calle.
                    </p>
                </div>
            </section>

            {/* El Problema */}
            <section className="py-24 bg-white dark:bg-background-dark text-slate-900 dark:text-white transition-colors">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black mb-6">El Problema</h2>
                            <div className="space-y-6 text-lg text-slate-600 dark:text-slate-300">
                                <p>
                                    Las distribuidoras gringas no entienden nuestra realidad. Piden tarjeta de crédito cuando aquí pagamos con <span className="font-bold text-primary">ATH Móvil</span>.
                                </p>
                                <p>
                                    El soporte es en inglés, las respuestas toman días, y cuando tienes un problema real con tus regalías, te sientes completamente solo.
                                </p>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    Necesitábamos una plataforma que hablara nuestro idioma, literal y figurativamente.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-amber-500/20 blur-3xl rounded-full"></div>
                            <div className="relative bg-slate-100 dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-2xl p-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-red-600 dark:text-red-400">credit_card_off</span>
                                        </div>
                                        <p className="text-sm"><span className="font-bold">Tarjeta de crédito obligatoria</span> - No todos la tenemos</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-red-600 dark:text-red-400">language</span>
                                        </div>
                                        <p className="text-sm"><span className="font-bold">Soporte solo en inglés</span> - Barreras innecesarias</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-red-600 dark:text-red-400">schedule</span>
                                        </div>
                                        <p className="text-sm"><span className="font-bold">Respuestas en 3-5 días</span> - Cuando lo necesitas YA</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* La Solución */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900/30 text-slate-900 dark:text-white transition-colors">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full"></div>
                                <div className="relative bg-white dark:bg-card-dark border-2 border-primary rounded-2xl p-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">account_balance_wallet</span>
                                            </div>
                                            <p className="text-sm"><span className="font-bold">Pagas con ATH Móvil</span> - Como debe ser</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">support_agent</span>
                                            </div>
                                            <p className="text-sm"><span className="font-bold">Soporte 24/7 en español</span> - Por WhatsApp</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">payments</span>
                                            </div>
                                            <p className="text-sm"><span className="font-bold">Regalías directo a tu banco</span> - 100% transparente</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <h2 className="text-4xl md:text-5xl font-black mb-6">La Solución</h2>
                            <div className="space-y-6 text-lg text-slate-600 dark:text-slate-300">
                                <p>
                                    Una plataforma <span className="font-bold text-primary">100% local</span> que habla tu idioma y entiende cómo trabajamos aquí.
                                </p>
                                <p>
                                    Pagas con <span className="font-bold text-amber-500">ATH Móvil</span>, recibes soporte instantáneo por WhatsApp, y tus regalías llegan directo a tu banco puertorriqueño.
                                </p>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    Sin intermediarios extranjeros. Sin barreras de idioma. Sin complicaciones.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modelo de Negocio */}
            <section className="py-24 bg-white dark:bg-background-dark text-slate-900 dark:text-white transition-colors">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-12">Nuestro Modelo de Negocio</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-12 text-white">
                            <p className="text-sm font-bold uppercase tracking-wider mb-4">Pago Único</p>
                            <h3 className="text-6xl font-black mb-2">$5.00</h3>
                            <p className="text-amber-100">Por cada sencillo distribuido</p>
                        </div>
                        <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-12 text-white">
                            <p className="text-sm font-bold uppercase tracking-wider mb-4">Comisión de Regalías</p>
                            <h3 className="text-6xl font-black mb-2">15%</h3>
                            <p className="text-blue-100">De tus ganancias por streaming</p>
                        </div>
                    </div>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Transparente, justo, y diseñado para que crezcas sin límites. No hay suscripciones escondidas ni tarifas sorpresa.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-primary">
                <div className="max-w-4xl mx-auto px-6 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">¿Listo para Distribuir Tu Música?</h2>
                    <p className="text-xl opacity-90 mb-10">Únete a la nueva era de la distribución musical en Puerto Rico.</p>
                    <button
                        onClick={() => navigate('/register')}
                        className="bg-white text-primary px-10 py-5 rounded-xl text-lg font-bold hover:bg-slate-100 transition-all shadow-2xl"
                    >
                        Comenzar Ahora
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-100 dark:bg-background-dark py-16 border-t border-slate-200 dark:border-white/5 text-slate-600 dark:text-white transition-colors">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="size-6 text-primary">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-black tracking-tighter">EAJMUSIC</h2>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">La nueva era de la distribución en PR</p>
                    <p className="text-xs text-slate-400">© 2024 EAJMUSIC. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default AboutUs;
