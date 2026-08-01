import React from 'react';
import { useNavigate } from 'react-router';

const PrivacyPolicy: React.FC = () => {
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
                </div>
            </nav>

            {/* Content */}
            <main className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Política de Privacidad</h1>
                        <p className="text-slate-500 dark:text-slate-400">Última actualización: 26 de enero de 2026</p>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">1. Información que Recopilamos</h2>

                            <h3 className="text-xl font-bold mb-3 mt-6">1.1 Información Personal</h3>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                                <li>Nombre completo, email, teléfono</li>
                                <li>Información bancaria para procesamiento de regalías</li>
                                <li>Dirección postal (si aplica)</li>
                                <li>Identificación fiscal (W-9, W-8BEN, o equivalente)</li>
                            </ul>

                            <h3 className="text-xl font-bold mb-3 mt-6">1.2 Información de Contenido</h3>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                                <li>Audio files y metadatos de releases (títulos, ISRC, UPC)</li>
                                <li>Información de derechos de autor y colaboradores</li>
                                <li>Artwork y material promocional</li>
                            </ul>

                            <h3 className="text-xl font-bold mb-3 mt-6">1.3 Datos de Uso</h3>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                                <li>Dirección IP, tipo de navegador, y sistema operativo</li>
                                <li>Páginas visitadas, tiempo en la plataforma</li>
                                <li>Interacciones con funciones de la plataforma</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">2. Cómo Usamos Tu Información</h2>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                                <li><strong>Distribución:</strong> Enviar tu música a plataformas de streaming</li>
                                <li><strong>Pagos:</strong> Procesar regalías y transferencias bancarias</li>
                                <li><strong>Soporte:</strong> Responder a tus consultas por WhatsApp o email</li>
                                <li><strong>Cumplimiento:</strong> Verificar derechos de autor y prevenir fraude</li>
                                <li><strong>Analítica:</strong> Mejorar la plataforma y experiencia del usuario</li>
                                <li><strong>Marketing:</strong> Enviar actualizaciones sobre nuevas funciones (puedes darte de baja en cualquier momento)</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">3. Compartir Información con Terceros</h2>

                            <h3 className="text-xl font-bold mb-3 mt-6">3.1 Plataformas de Streaming</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                Compartimos tu contenido musical y metadata con plataformas autorizadas (Spotify, Apple Music, etc.) para distribución.
                            </p>

                            <h3 className="text-xl font-bold mb-3 mt-6">3.2 Procesadores de Pago</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                Usamos servicios bancarios de terceros para procesar pagos de regalías. Nunca almacenamos información completa de tarjetas de crédito.
                            </p>

                            <h3 className="text-xl font-bold mb-3 mt-6">3.3 Obligaciones Legales</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Podemos divulgar información si es requerido por ley, orden judicial, o para proteger nuestros derechos legales.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">4. Cookies y Tecnologías de Seguimiento</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                Usamos cookies para:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                                <li>Mantener tu sesión activa (cookies esenciales)</li>
                                <li>Recordar tus preferencias (tema oscuro/claro)</li>
                                <li>Analizar tráfico web con Google Analytics (puedes desactivar en tu navegador)</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">5. Seguridad de Datos</h2>
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500 p-4 mb-4">
                                <p className="text-slate-700 dark:text-slate-300 font-bold mb-2">Medidas de Seguridad:</p>
                                <ul className="list-disc pl-6 space-y-1 text-slate-700 dark:text-slate-300">
                                    <li>Encriptación SSL/TLS en todas las transmisiones</li>
                                    <li>Cifrado de datos sensibles en reposo</li>
                                    <li>Autenticación de dos factores (2FA) opcional</li>
                                    <li>Auditorías de seguridad regulares</li>
                                </ul>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Sin embargo, ningún sistema es 100% seguro. Te recomendamos usar contraseñas fuertes y únicas.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">6. Tus Derechos</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                Tienes derecho a:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                                <li><strong>Acceso:</strong> Solicitar una copia de todos tus datos personales</li>
                                <li><strong>Corrección:</strong> Actualizar información incorrecta o desactualizada</li>
                                <li><strong>Eliminación:</strong> Solicitar la eliminación de tu cuenta y datos (sujeto a obligaciones legales de retención)</li>
                                <li><strong>Portabilidad:</strong> Recibir tus datos en formato CSV o JSON</li>
                                <li><strong>Oposición:</strong> Darte de baja de comunicaciones de marketing</li>
                            </ul>
                            <p className="text-primary font-bold mt-4">
                                Para ejercer estos derechos, contacta: Web@eajmusic.com
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">7. Retención de Datos</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                Retenemos tus datos personales mientras mantengas una cuenta activa. Después de la eliminación:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                                <li>Datos de transacciones: 7 años (requisito fiscal)</li>
                                <li>Audio files: 90 días (período de disputa)</li>
                                <li>Logs de auditoría: 1 año (seguridad)</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">8. Menores de Edad</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                EAJMUSIC no está dirigido a menores de 18 años. Si descubrimos que un menor ha creado una cuenta, la eliminaremos inmediatamente.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">9. Transferencias Internacionales</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Tus datos pueden ser transferidos y procesados en servidores fuera de Puerto Rico (Estados Unidos, Unión Europea). Cumplimos con marcos de privacidad aplicables como el EU-US Data Privacy Framework.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">10. Cambios a Esta Política</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Podemos actualizar esta política periódicamente. Los cambios significativos serán notificados por email con 30 días de anticipación.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">11. Contacto</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                                Para preguntas sobre esta Política de Privacidad:
                            </p>
                            <p className="text-primary font-bold">Email: Web@eajmusic.com</p>
                            <p className="text-primary font-bold">WhatsApp: Disponible 24/7</p>
                        </section>
                    </div>

                    <div className="mt-12 p-6 bg-blue-50 dark:bg-primary/10 rounded-xl border border-blue-200 dark:border-primary/20">
                        <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
                            <span className="font-bold">Compromiso de Privacidad:</span> En EAJMUSIC, tu privacidad es nuestra prioridad. Nunca venderemos tus datos personales a terceros.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-100 dark:bg-background-dark py-12 border-t border-slate-200 dark:border-white/5">
                <div className="max-w-4xl mx-auto px-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                    <p>© 2024 EAJMUSIC. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
