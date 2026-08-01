import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../src/services/api';

const Support: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'ticket'>('faq');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState('');

    const faqs = [
        {
            category: 'Pagos y Facturación',
            questions: [
                {
                    q: '¿Cómo puedo pagar con ATH Móvil?',
                    a: 'En el proceso de distribución, selecciona "ATH Móvil" como método de pago. Te enviaremos el código QR o número de teléfono para completar el pago de $5.00.'
                },
                {
                    q: '¿Cuándo recibiré mis regalías?',
                    a: 'Las regalías se procesan mensualmente. Recibirás tu pago directo a tu cuenta bancaria entre el día 15-20 de cada mes, siempre y cuando hayas alcanzado el mínimo de $50 USD.'
                },
                {
                    q: '¿Por qué cobran 15% de comisión?',
                    a: 'Nuestra comisión del 15% cubre los costos de mantener la plataforma, soporte 24/7, procesamiento de pagos internacionales, y actualizaciones constantes. Es mucho más transparente que otras plataformas que cobran suscripciones mensuales.'
                }
            ]
        },
        {
            category: 'Distribución',
            questions: [
                {
                    q: '¿Cuánto tarda en distribuirse mi música?',
                    a: 'Una vez aprobada tu música (10-15 días), tu track estará en Spotify, Apple Music y demás plataformas en 3-5 días hábiles.'
                },
                {
                    q: '¿Puedo eliminar una canción después de distribuirla?',
                    a: 'Sí, puedes solicitar un "takedown" desde tu dashboard. El proceso toma 7-14 días dependiendo de las plataformas.'
                },
                {
                    q: '¿Qué formatos de audio aceptan?',
                    a: 'Aceptamos WAV y FLAC en calidad 16-bit/44.1kHz o superior. No aceptamos MP3 para distribución.'
                }
            ]
        },
        {
            category: 'Cuenta y Soporte',
            questions: [
                {
                    q: '¿Cómo contacto al soporte?',
                    a: 'Puedes contactarnos por WhatsApp 24/7, email (Web@eajmusic.com), o crear un ticket desde tu dashboard de artista si ya estás registrado.'
                },
                {
                    q: '¿Puedo cambiar el nombre de mi perfil de artista?',
                    a: 'Sí, pero debes crear un ticket de soporte. Los cambios en plataformas como Spotify pueden tardar días en reflejarse.'
                }
            ]
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/public/contact', formData);
            setToast('Formulario enviado. Te contactaremos pronto.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setToast('Hubo un error al enviar tu mensaje.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setToast(''), 3000);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden font-sans min-h-screen">
            {toast && (
                <div className="fixed bottom-4 right-4 z-[60] bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                    <p className="font-bold">{toast}</p>
                </div>
            )}
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
            <section className="relative pt-32 pb-12 text-slate-900 dark:text-white transition-colors bg-slate-50 dark:bg-black">
                <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(37, 37, 244, 0.15) 0%, rgba(10, 10, 10, 1) 70%)' }}></div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
                        Centro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Soporte</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Estamos aquí para ayudarte 24/7. Escoge tu canal de soporte preferido.
                    </p>
                </div>
            </section>

            {/* Quick Contact Cards */}
            <section className="py-12 bg-white dark:bg-background-dark">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* WhatsApp */}
                        <div className="group p-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:scale-105 transition-all cursor-pointer">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-4xl">chat</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2">WhatsApp</h3>
                            <p className="text-emerald-100 text-sm mb-4">Respuesta inmediata 24/7</p>
                            <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-bold text-sm hover:bg-emerald-50 transition-all">
                                Abrir Chat
                            </button>
                        </div>

                        {/* Email */}
                        <div className="group p-8 rounded-2xl bg-slate-100 dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-primary transition-all">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                                <span className="material-symbols-outlined text-4xl">mail</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2">Email</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Respuesta en menos de 4 horas</p>
                            <a href="mailto:Web@eajmusic.com" className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all">
                                Web@eajmusic.com
                            </a>
                        </div>

                        {/* Sistema de Tickets */}
                        <div className="group p-8 rounded-2xl bg-slate-100 dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-primary transition-all">
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                                <span className="material-symbols-outlined text-4xl">confirmation_number</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2">Ticket</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Para usuarios registrados</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
                            >
                                Iniciar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="py-16 bg-slate-50 dark:bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-12 border-b border-slate-200 dark:border-white/10">
                        <button
                            onClick={() => setActiveTab('faq')}
                            className={`pb-4 px-6 font-bold text-lg transition-colors relative ${activeTab === 'faq'
                                ? 'text-primary'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            Preguntas Frecuentes
                            {activeTab === 'faq' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`pb-4 px-6 font-bold text-lg transition-colors relative ${activeTab === 'contact'
                                ? 'text-primary'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            Formulario de Contacto
                            {activeTab === 'contact' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                            )}
                        </button>
                    </div>

                    {/* FAQ Tab */}
                    {activeTab === 'faq' && (
                        <div className="space-y-12">
                            {faqs.map((category, idx) => (
                                <div key={idx}>
                                    <h3 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">{category.category}</h3>
                                    <div className="space-y-4">
                                        {category.questions.map((item, qIdx) => (
                                            <details key={qIdx} className="group bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-white/10 p-6 hover:border-primary transition-all">
                                                <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                                                    <span>{item.q}</span>
                                                    <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform">
                                                        expand_more
                                                    </span>
                                                </summary>
                                                <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">{item.a}</p>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Contact Form Tab */}
                    {activeTab === 'contact' && (
                        <div className="max-w-2xl mx-auto">
                            <form onSubmit={handleSubmit} className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-white/10 p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Asunto</label>
                                    <select
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    >
                                        <option value="">Selecciona un tema</option>
                                        <option value="billing">Pagos y Facturación</option>
                                        <option value="distribution">Problemas de Distribución</option>
                                        <option value="royalties">Consulta de Regalías</option>
                                        <option value="account">Problemas de Cuenta</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Mensaje</label>
                                    <textarea
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                        placeholder="Describe tu problema o pregunta con el mayor detalle posible..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                                </button>
                            </form>
                        </div>
                    )}
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
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Soporte 24/7 en español</p>
                    <p className="text-xs text-slate-400">© 2024 EAJMUSIC. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default Support;
