import React, { useState } from 'react';

type PhoneTab = 'home' | 'catalog' | 'wallet' | 'profile';

interface Release {
  title: string;
  meta: string;
  gradient: string;
  status: 'live' | 'review' | 'sched';
  statusLabel: string;
  stat: string;
}

const RELEASES: Release[] = [
  { title: 'Midnight Echo', meta: 'Single · 2026', gradient: 'from-primary to-[#0c7d6a]', status: 'live', statusLabel: 'Live', stat: '10.2K' },
  { title: 'Costa Brava', meta: 'EP · 4 tracks', gradient: 'from-flame to-[#8a2f1c]', status: 'review', statusLabel: 'Revisión', stat: '—' },
  { title: "Verano '26", meta: 'Single', gradient: 'from-slate-500 to-slate-800', status: 'sched', statusLabel: '18 ago', stat: '—' },
  { title: 'Bajo la Luna', meta: 'Single · 2025', gradient: 'from-violet-600 to-indigo-900', status: 'live', statusLabel: 'Live', stat: '88.1K' },
  { title: 'Isla Remix', meta: 'Single · 2025', gradient: 'from-amber-400 to-amber-800', status: 'live', statusLabel: 'Live', stat: '41.4K' },
];

function StatusPill({ status, label }: { status: Release['status']; label: string }) {
  const styles: Record<Release['status'], string> = {
    live: 'bg-primary/15 text-primary',
    review: 'bg-flame/15 text-flame',
    sched: 'bg-white/10 text-white/50',
  };
  return (
    <span className={`font-mono text-[9px] px-2 py-1 rounded-full uppercase tracking-wider whitespace-nowrap ${styles[status]}`}>
      {label}
    </span>
  );
}

const TABS: { id: PhoneTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Inicio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    id: 'catalog',
    label: 'Catálogo',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M17 15h.01" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Perfil',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
      </svg>
    ),
  },
];

const HomeScreen: React.FC = () => (
  <div className="flex flex-col gap-3.5 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden">
    <div className="flex gap-2.5">
      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3">
        <b className="block font-mono text-base tabular-nums">4,382</b>
        <span className="text-[10px] text-white/50">streams hoy</span>
      </div>
      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3">
        <b className="block font-mono text-base tabular-nums">$186.40</b>
        <span className="text-[10px] text-white/50">generado hoy</span>
      </div>
    </div>
    <div>
      <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Tu catálogo</div>
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-0.5 [&::-webkit-scrollbar]:hidden">
        {RELEASES.slice(0, 3).map((r) => (
          <div key={r.title} className="flex-shrink-0 w-[76px]">
            <div className={`w-[76px] h-[76px] rounded-[10px] mb-1.5 bg-gradient-to-br ${r.gradient}`} />
            <p className="m-0 text-[10px] font-semibold leading-tight">{r.title}</p>
            <span className="text-[9px] text-white/50">{r.statusLabel}</span>
          </div>
        ))}
      </div>
    </div>
    <div>
      <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Actividad reciente</div>
      {[
        { text: 'Pago de $412.00 procesado', time: 'hace 2 horas · ATH Móvil' },
        { text: 'Midnight Echo pasó 10K streams', time: 'hace 6 horas' },
        { text: 'Costa Brava aprobado para revisión final', time: 'ayer' },
      ].map((a) => (
        <div key={a.text} className="flex gap-2.5 items-start py-2 border-b border-white/10 last:border-none text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
          <div>
            <p className="m-0 font-semibold">{a.text}</p>
            <span className="text-[10px] text-white/50">{a.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CatalogScreen: React.FC = () => (
  <div className="flex flex-col gap-3.5 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden">
    <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-0.5">12 lanzamientos</div>
    {RELEASES.map((r) => (
      <div key={r.title} className="flex items-center gap-2.5 py-2 border-b border-white/10 last:border-none">
        <div className={`w-[38px] h-[38px] rounded-lg flex-shrink-0 bg-gradient-to-br ${r.gradient}`} />
        <div className="flex-1 min-w-0">
          <p className="m-0 text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{r.title}</p>
          <span className="text-[10px] text-white/50">{r.meta}</span>
        </div>
        <span className="font-mono text-[10px] text-white/50 tabular-nums">{r.stat}</span>
        <StatusPill status={r.status} label={r.statusLabel} />
      </div>
    ))}
  </div>
);

const WalletScreen: React.FC = () => (
  <div className="flex flex-col gap-3.5 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden">
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <span className="text-[10px] text-white/50">Disponible para retirar</span>
      <div className="font-mono text-3xl tabular-nums my-1 mb-3">$1,842.30</div>
      <svg className="w-full h-9 mb-3" viewBox="0 0 240 36" preserveAspectRatio="none">
        <path d="M0,28 L30,24 L60,26 L90,16 L120,19 L150,10 L180,13 L210,4 L240,7" fill="none" stroke="rgb(var(--color-bioglow))" strokeWidth={2} />
      </svg>
      <button type="button" className="w-full justify-center flex items-center gap-2 bg-primary text-[#04211c] border-none font-bold text-sm rounded-lg py-2.5 motion-reduce:transition-none transition-opacity hover:opacity-90">
        Retirar vía ATH Móvil
      </button>
    </div>
    <div>
      <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Movimientos</div>
      {[
        { label: 'Retiro ATH Móvil', amount: '-$300.00', positive: false },
        { label: 'Regalías · Midnight Echo', amount: '+$142.80', positive: true },
        { label: 'Regalías · Bajo la Luna', amount: '+$268.10', positive: true },
        { label: 'Retiro ATH Móvil', amount: '-$500.00', positive: false },
      ].map((tx, i) => (
        <div key={i} className="flex justify-between text-xs py-2 border-b border-white/10 last:border-none">
          <span>{tx.label}</span>
          <span className={`font-mono tabular-nums ${tx.positive ? 'text-primary' : 'text-white/50'}`}>{tx.amount}</span>
        </div>
      ))}
    </div>
  </div>
);

const ProfileScreen: React.FC = () => {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };

  return (
    <div className="flex flex-col gap-3.5 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center gap-2.5">
        <div className="w-[52px] h-[52px] rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-bold text-primary">JR</div>
        <div>
          <p className="m-0 font-bold text-sm">José Ramírez</p>
          <span className="text-[11px] text-white/50">@joseramirez · Pro Artist</span>
        </div>
      </div>
      <div>
        <button
          type="button"
          onClick={() => setShareOpen((v) => !v)}
          aria-expanded={shareOpen}
          className="w-full flex items-center justify-between py-3 border-b border-white/10 text-sm text-left"
        >
          <span>Compartir mi historia</span>
          <span className={`text-white/50 motion-reduce:transition-none transition-transform ${shareOpen ? 'rotate-90' : ''}`}>›</span>
        </button>
        <div
          className={`overflow-hidden motion-reduce:transition-none transition-[max-height] duration-300 ease-out bg-white/5 rounded-xl ${shareOpen ? 'max-h-[220px] mb-2 mt-2' : 'max-h-0'}`}
        >
          <div className="p-3 flex flex-col gap-2">
            <div className="flex gap-1.5 items-center bg-background-dark border border-white/10 rounded-lg px-2.5 py-2">
              <code className="font-mono text-[10px] text-white/50 flex-1 overflow-x-auto whitespace-nowrap">eajmusic.com/share/joseramirez</code>
              <button
                type="button"
                onClick={handleCopy}
                className="bg-primary text-[#04211c] border-none text-[10px] font-bold px-2.5 py-1.5 rounded-md motion-reduce:transition-none"
              >
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="m-0 text-[10px] text-white/50 leading-relaxed">
              Este enlace deja que cualquier fan o colega escriba una reseña tuya. Pasa por revisión tuya antes de publicarse — nunca automático sin aprobar.
            </p>
          </div>
        </div>
        {['Notificaciones', 'Seguridad', 'Cerrar sesión'].map((item) => (
          <button key={item} type="button" className="w-full flex items-center justify-between py-3 border-b border-white/10 last:border-none text-sm text-left">
            <span>{item}</span>
            <span className="text-white/50">›</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const PhoneShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PhoneTab>('home');

  return (
    <div className="flex justify-center">
      <div className="relative w-[300px] bg-black rounded-[46px] p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
        <div className="relative h-[600px] flex flex-col overflow-hidden rounded-[36px] bg-background-dark text-white">
          {/* notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[110px] h-[22px] bg-black rounded-full z-10" />

          {/* status bar */}
          <div className="flex justify-between items-center px-5 pt-4 pb-1 font-mono text-xs tabular-nums">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-end gap-0.5">
                <span className="w-[3px] h-1 bg-white rounded-sm" />
                <span className="w-[3px] h-1.5 bg-white rounded-sm" />
                <span className="w-[3px] h-2 bg-white rounded-sm" />
                <span className="w-[3px] h-2.5 bg-white rounded-sm" />
              </div>
              <div className="w-5 h-2.5 border border-white rounded-[2px] p-px">
                <div className="h-full w-3/4 bg-white rounded-sm" />
              </div>
            </div>
          </div>

          {/* app header */}
          <div className="px-5 pt-1.5 pb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-[34px] h-[34px] rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-primary">JR</div>
              <div>
                <p className="m-0 text-[13px] font-bold">Hola, José</p>
                <span className="text-[11px] text-white/50">Artista · Pro</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
            </div>
          </div>

          {/* body */}
          <div className="flex-1 overflow-hidden px-5 pb-3.5 relative">
            {activeTab === 'home' && <HomeScreen />}
            {activeTab === 'catalog' && <CatalogScreen />}
            {activeTab === 'wallet' && <WalletScreen />}
            {activeTab === 'profile' && <ProfileScreen />}
          </div>

          {/* tab bar */}
          <div className="flex border-t border-white/10 px-3.5 pt-2 pb-3.5 justify-between">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 text-[10px] px-2 py-1 motion-reduce:transition-none transition-colors ${
                  activeTab === tab.id ? 'text-primary' : 'text-white/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneShowcase;
