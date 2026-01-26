import React from 'react';

interface TermsProps {
    onNavigate: (domain: 'main' | 'artist' | 'admin' | 'login' | 'register') => void;
}

const TermsOfService: React.FC<TermsProps> = ({ onNavigate }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden font-sans min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass-nav bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('main')}>
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
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Términos y Condiciones</h1>
                        <p className="text-slate-500 dark:text-slate-400">Última actualización: 26 de enero de 2026</p>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">1. Aceptación de los Términos</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                Al acceder y utilizar la plataforma EAJMUSIC ("la Plataforma"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                EAJMUSIC se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigencia inmediatamente después de su publicación en la Plataforma.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">2. Servicios de Distribución Musical</h2>

                            <h3 className="text-xl font-bold mb-3 mt-6">2.1 Descripción del Servicio</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                EAJMUSIC ofrece servicios de distribución digital de música a plataformas de streaming y tiendas digitales globales, incluyendo pero no limitado a: Spotify, Apple Music, YouTube Music, Amazon Music, TikTok, Deezer, Tidal, y otras plataformas autorizadas.
                            </p>

                            <h3 className="text-xl font-bold mb-3 mt-6">2.2 Tarifas y Comisiones</h3>
                            <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 p-4 mb-4">
                                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                                    <li><strong>Pago por Distribución:</strong> $5.00 USD por cada sencillo distribuido, pagadero mediante ATH Móvil o métodos alternativos aprobados.</li>
                                    <li><strong>Comisión de Regalías:</strong> 15% de todas las ganancias generadas por streaming y ventas digitales.</li>
                                    <li><strong>Umbral de Pago:</strong> Mínimo de $50.00 USD acumulados antes del primer pago de regalías.</li>
                                </ul>
                            </div>

                            <h3 className="text-xl font-bold mb-3 mt-6">2.3 Proceso de Distribución</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Una vez enviado y aprobado el contenido, EAJMUSIC procesará la distribución en un plazo de 3-7 días hábiles. Los tiempos exactos dependen de cada plataforma de streaming.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">3. Derechos de Autor y Propiedad Intelectual</h2>

                            <h3 className="text-xl font-bold mb-3 mt-6">3.1 Garantía de Derechos</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                El usuario garantiza que:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                                <li>Posee todos los derechos necesarios sobre el contenido enviado (composición, grabación, interpretación).</li>
                                <li>El contenido no infringe derechos de terceros (derechos de autor, marcas registradas, derechos de publicidad).</li>
                                <li>Tiene autorización escrita de todos los colaboradores (compositores, productores, artistas destacados).</li>
                                <li>El contenido cumple con todas las leyes aplicables de derechos de autor en Puerto Rico, Estados Unidos y territorios internacionales.</li>
                            </ul>

                            <h3 className="text-xl font-bold mb-3 mt-6">3.2 Responsabilidad por Infracciones</h3>
                            <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-4 mb-4">
                                <p className="text-slate-700 dark:text-slate-300 font-bold mb-2">IMPORTANTE:</p>
                                <p className="text-slate-700 dark:text-slate-300">
                                    El usuario asume toda responsabilidad legal y financiera por cualquier reclamo de infracción de derechos de autor. EAJMUSIC no se hace responsable por contenido no autorizado distribuido por el usuario.
                                </p>
                            </div>

                            <h3 className="text-xl font-bold mb-3 mt-6">3.3 Licencia Otorgada a EAJMUSIC</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Al usar la Plataforma, el usuario otorga a EAJMUSIC una licencia no exclusiva, mundial, libre de regalías para distribuir, reproducir, y exhibir públicamente el contenido en todas las plataformas de streaming autorizadas.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">4. Regalías y Pagos</h2>

                            <h3 className="text-xl font-bold mb-3 mt-6">4.1 Cálculo de Regalías</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                Las regalías se calculan como el 85% de los ingresos brutos recibidos de las plataformas de streaming, después de deducir la comisión del 15% de EAJMUSIC.
                            </p>

                            <h3 className="text-xl font-bold mb-3 mt-6">4.2 Calendario de Pagos</h3>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                                <li>Los pagos se procesan mensualmente entre el día 15-20 de cada mes.</li>
                                <li>Las regalías corresponden a las reproducciones del mes anterior (30-60 días de retraso según la plataforma).</li>
                                <li>Se requiere un saldo mínimo de $50.00 USD para procesar el pago.</li>
                                <li>Los pagos se realizan mediante transferencia bancaria ACH/Wire a cuentas en Puerto Rico o Estados Unidos.</li>
                            </ul>

                            <h3 className="text-xl font-bold mb-3 mt-6">4.3 Retención de Pagos</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                EAJMUSIC se reserva el derecho de retener pagos si:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                                <li>Hay una disputa pendiente de derechos de autor.</li>
                                <li>Se detecta actividad fraudulenta (streaming artificial, bots, farms de clics).</li>
                                <li>El usuario viola estos Términos y Condiciones.</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">5. Takedowns y Eliminación de Contenido</h2>

                            <h3 className="text-xl font-bold mb-3 mt-6">5.1 Solicitud de Takedown</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                El usuario puede solicitar la eliminación de su contenido en cualquier momento desde el dashboard de artista. El proceso toma 7-14 días hábiles y puede incurrir en tarifas de procesamiento según las plataformas involucradas.
                            </p>

                            <h3 className="text-xl font-bold mb-3 mt-6">5.2 Takedowns por Terceros</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                EAJMUSIC cumplirá con todas las solicitudes legítimas de takedown bajo la Digital Millennium Copyright Act (DMCA) y leyes aplicables. El usuario será notificado de cualquier reclamo y tendrá derecho a responder dentro de 7 días.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">6. Prohibiciones y Contenido No Permitido</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                Está estrictamente prohibido distribuir contenido que:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                                <li>Infrinja derechos de autor, marcas registradas o derechos de propiedad intelectual.</li>
                                <li>Contenga discurso de odio, discriminación, o violencia.</li>
                                <li>Promueva actividades ilegales.</li>
                                <li>Incluya muestras no autorizadas de obras de terceros.</li>
                                <li>Utilice streaming artificial para inflar reproducciones (bots, click farms).</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">7. Terminación de Cuenta</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                EAJMUSIC puede suspender o terminar una cuenta sin previo aviso si:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                                <li>El usuario viola estos Términos y Condiciones.</li>
                                <li>Se detecta actividad fraudulenta.</li>
                                <li>Hay múltiples reclamos válidos de infracción de derechos de autor.</li>
                            </ul>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                                En caso de terminación, el usuario perderá acceso a regalías pendientes por un período de 90 días para resolver disputas.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">8. Limitación de Responsabilidad</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                EAJMUSIC no será responsable por:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                                <li>Errores técnicos de plataformas de streaming de terceros.</li>
                                <li>Demoras en reportes de regalías por parte de las plataformas.</li>
                                <li>Pérdida de ingresos debido a cambios en algoritmos de plataformas.</li>
                                <li>Daños indirectos, incidentales o consecuentes derivados del uso de la Plataforma.</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">9. Ley Aplicable y Jurisdicción</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Estos Términos se rigen por las leyes del Estado Libre Asociado de Puerto Rico y las leyes federales de los Estados Unidos. Cualquier disputa será resuelta en los tribunales de San Juan, Puerto Rico.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">10. Contacto</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                                Para preguntas sobre estos Términos y Condiciones:
                            </p>
                            <p className="text-primary font-bold">Email: Web@eajmusic.com</p>
                            <p className="text-primary font-bold">WhatsApp: Disponible 24/7 desde tu dashboard</p>
                        </section>
                    </div>

                    <div className="mt-12 p-6 bg-slate-100 dark:bg-card-dark rounded-xl border border-slate-200 dark:border-white/10">
                        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                            Al hacer clic en "Aceptar" o al usar la Plataforma, usted reconoce que ha leído, entendido y acepta estos Términos y Condiciones.
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

export default TermsOfService;
