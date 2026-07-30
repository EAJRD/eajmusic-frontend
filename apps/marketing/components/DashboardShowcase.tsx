import React, { useState } from 'react';

type DashView = 'overview' | 'releases' | 'royalties';

const NAV_ITEMS: { id: DashView; label: string; icon: React.ReactNode }[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path d="M3 12l2-2 4 4 8-8 4 4" />
      </svg>
    ),
  },
  {
    id: 'releases',
    label: 'Releases',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    id: 'royalties',
    label: 'Royalties',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M8.5 9.5h5a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h5.5" />
      </svg>
    ),
  },
];

const KPIS: { label: string; value: string; path: string; up: boolean; delta: string }[] = [
  { label: 'Streams', value: '2.14M', path: 'M0,20 L20,16 L40,18 L60,8 L80,11 L100,3', up: true, delta: '+12.4%' },
  { label: 'Ingresos', value: '$8,942', path: 'M0,18 L20,19 L40,10 L60,14 L80,6 L100,9', up: true, delta: '+6.1%' },
  { label: 'Guardados', value: '18.3K', path: 'M0,10 L20,14 L40,9 L60,17 L80,12 L100,19', up: false, delta: '-2.3%' },
  { label: 'Seguidores', value: '44,102', path: 'M0,22 L20,18 L40,15 L60,12 L80,9 L100,4', up: true, delta: '+3.8%' },
];

const RELEASE_ROWS = [
  { title: 'Midnight Echo', gradient: 'from-primary to-[#0c7d6a]', date: '04 mar 2026', status: 'live' as const, streams: '10,204', revenue: '$412.00' },
  { title: 'Costa Brava', gradient: 'from-flame to-[#8a2f1c]', date: '—', status: 'review' as const, streams: '—', revenue: '—' },
  { title: 'Bajo la Luna', gradient: 'from-violet-600 to-indigo-900', date: '19 nov 2025', status: 'live' as const, streams: '88,140', revenue: '$2,910.40' },
  { title: 'Isla Remix', gradient: 'from-amber-400 to-amber-800', date: '02 oct 2025', status: 'live' as const, streams: '41,402', revenue: '$1,204.80' },
  { title: "Verano '26", gradient: 'from-slate-500 to-slate-800', date: '18 ago 2026', status: 'sched' as const, streams: '—', revenue: '—' },
];

const ROYALTY_ROWS = [
  { name: 'José Ramírez', plan: 'Pro Artist', split: '100%', paid: '$412.00' },
  { name: 'Ana Serrano', plan: 'Pro Artist', split: '100%', paid: '$1,884.20' },
  { name: 'Los Del Bloque', plan: 'Label Plus', split: '85 / 15%', paid: '$3,102.60' },
  { name: 'Marisol V.', plan: 'Label Plus', split: '85 / 15%', paid: '$942.10' },
];

function StatusPill({ status }: { status: 'live' | 'review' | 'sched' }) {
  const map = {
    live: { cls: 'bg-primary/15 text-primary', label: 'Live' },
    review: { cls: 'bg-flame/15 text-flame', label: 'Revisión' },
    sched: { cls: 'bg-white/10 text-white/50', label: 'Programado' },
  } as const;
  const s = map[status];
  return <span className={`font-mono text-[10px] px-2 py-1 rounded-full uppercase tracking-wider whitespace-nowrap ${s.cls}`}>{s.label}</span>;
}

const OverviewView: React.FC = () => (
  <div>
    <div className="flex justify-between items-center mb-5">
      <h3 className="m-0 text-base font-semibold">Overview</h3>
      <span className="font-mono text-xs text-white/50 border border-white/10 rounded-lg px-2.5 py-1.5">Últimos 30 días</span>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {KPIS.map((kpi) => (
        <div key={kpi.label} className="bg-white/5 border border-white/10 rounded-xl p-3.5">
          <span className="text-[11px] text-white/50">{kpi.label}</span>
          <b className="block font-mono text-xl my-1 tabular-nums">{kpi.value}</b>
          <svg viewBox="0 0 100 24" className="w-full h-6">
            <path d={kpi.path} fill="none" stroke={kpi.up ? 'rgb(var(--color-bioglow))' : 'rgb(var(--color-flame))'} strokeWidth={2} />
          </svg>
          <span className={`text-[10px] font-mono ${kpi.up ? 'text-primary' : 'text-flame'}`}>{kpi.delta}</span>
        </div>
      ))}
    </div>
    <div className="bg-white/5 border border-white/10 rounded-xl p-[18px]">
      <h4 className="m-0 mb-3 text-xs text-white/50 font-semibold">Regalías por semana</h4>
      <svg viewBox="0 0 600 140" preserveAspectRatio="none" className="w-full h-[140px]">
        <line x1="0" y1="35" x2="600" y2="35" stroke="rgba(255,255,255,0.06)" />
        <line x1="0" y1="70" x2="600" y2="70" stroke="rgba(255,255,255,0.06)" />
        <line x1="0" y1="105" x2="600" y2="105" stroke="rgba(255,255,255,0.06)" />
        <path
          d="M0,110 L75,95 L150,100 L225,60 L300,72 L375,40 L450,52 L525,20 L600,30 L600,140 L0,140 Z"
          fill="rgba(47,224,194,0.12)"
        />
        <path
          d="M0,110 L75,95 L150,100 L225,60 L300,72 L375,40 L450,52 L525,20 L600,30"
          fill="none"
          stroke="rgb(var(--color-bioglow))"
          strokeWidth={2}
        />
        <circle cx="600" cy="30" r="4" fill="rgb(var(--color-bioglow))" />
      </svg>
    </div>
  </div>
);

const ReleasesView: React.FC = () => (
  <div>
    <div className="flex justify-between items-center mb-5">
      <h3 className="m-0 text-base font-semibold">Releases</h3>
      <span className="font-mono text-xs text-white/50 border border-white/10 rounded-lg px-2.5 py-1.5">12 total</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left text-[10px] uppercase tracking-wider text-white/50 font-semibold py-2 px-2.5 border-b border-white/10">Título</th>
            <th className="text-left text-[10px] uppercase tracking-wider text-white/50 font-semibold py-2 px-2.5 border-b border-white/10">Fecha</th>
            <th className="text-left text-[10px] uppercase tracking-wider text-white/50 font-semibold py-2 px-2.5 border-b border-white/10">Estado</th>
            <th className="text-right text-[10px] uppercase tracking-wider text-white/50 font-semibold py-2 px-2.5 border-b border-white/10">Streams</th>
            <th className="text-right text-[10px] uppercase tracking-wider text-white/50 font-semibold py-2 px-2.5 border-b border-white/10">Ingresos</th>
          </tr>
        </thead>
        <tbody>
          {RELEASE_ROWS.map((r) => (
            <tr key={r.title}>
              <td className="py-2.5 px-2.5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-md flex-shrink-0 bg-gradient-to-br ${r.gradient}`} />
                  {r.title}
                </div>
              </td>
              <td className="py-2.5 px-2.5 border-b border-white/10">{r.date}</td>
              <td className="py-2.5 px-2.5 border-b border-white/10">
                <StatusPill status={r.status} />
              </td>
              <td className="py-2.5 px-2.5 border-b border-white/10 font-mono text-right tabular-nums">{r.streams}</td>
              <td className="py-2.5 px-2.5 border-b border-white/10 font-mono text-right tabular-nums">{r.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RoyaltiesView: React.FC = () => (
  <div>
    <div className="flex justify-between items-center mb-5">
      <h3 className="m-0 text-base font-semibold">Royalties</h3>
      <span className="font-mono text-xs text-white/50 border border-white/10 rounded-lg px-2.5 py-1.5">Split por artista</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left text-[10px] uppercase tracking-wider text-white/50 font-semibold py-2 px-2.5 border-b border-white/10">Artista</th>
            <th className="text-left text-[10px] uppercase tracking-wider text-white/50 font-semibold py-2 px-2.5 border-b border-white/10">Plan</th>
            <th className="text-right text-[10px] uppercase tracking-wider text-white/50 font-semibold py-2 px-2.5 border-b border-white/10">% split</th>
            <th className="text-right text-[10px] uppercase tracking-wider text-white/50 font-semibold py-2 px-2.5 border-b border-white/10">Pagado (30d)</th>
          </tr>
        </thead>
        <tbody>
          {ROYALTY_ROWS.map((r) => (
            <tr key={r.name}>
              <td className="py-2.5 px-2.5 border-b border-white/10">{r.name}</td>
              <td className="py-2.5 px-2.5 border-b border-white/10">{r.plan}</td>
              <td className="py-2.5 px-2.5 border-b border-white/10 font-mono text-right tabular-nums">{r.split}</td>
              <td className="py-2.5 px-2.5 border-b border-white/10 font-mono text-right tabular-nums">{r.paid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DashboardShowcase: React.FC = () => {
  const [activeView, setActiveView] = useState<DashView>('overview');

  return (
    <div className="mt-9 rounded-2xl overflow-hidden shadow-[0_40px_90px_-35px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-white/10">
      {/* chrome bar */}
      <div className="bg-background-dark px-3.5 py-2.5 flex items-center gap-3.5 border-b border-white/10">
        <div className="flex gap-1.5">
          <i className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] block" />
          <i className="w-2.5 h-2.5 rounded-full bg-[#febc2e] block" />
          <i className="w-2.5 h-2.5 rounded-full bg-[#28c840] block" />
        </div>
        <div className="flex-1 bg-black/30 rounded-md py-1 px-3 font-mono text-xs text-white/50 text-center">
          app.eajmusic.com/dashboard
        </div>
      </div>

      <div className="flex bg-background-dark min-h-[480px]">
        {/* sidebar */}
        <div className="w-[190px] bg-black/20 border-r border-white/10 py-[18px] px-3 flex flex-col gap-0.5 flex-shrink-0">
          <div className="font-black text-sm text-white px-2.5 pb-4">EAJMUSIC</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-2.5 py-2.5 px-2.5 rounded-lg text-sm text-left w-full motion-reduce:transition-none transition-colors ${
                activeView === item.id ? 'bg-primary/10 text-primary' : 'text-white/50 hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="mt-auto flex items-center gap-2 py-2.5 px-2.5 text-xs text-white/50">
            <div className="w-[22px] h-[22px] rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-primary">RC</div>
            Red Cloud Records
          </div>
        </div>

        {/* main */}
        <div className="flex-1 p-5 md:p-6 overflow-x-auto text-white">
          {activeView === 'overview' && <OverviewView />}
          {activeView === 'releases' && <ReleasesView />}
          {activeView === 'royalties' && <RoyaltiesView />}
        </div>
      </div>
    </div>
  );
};

export default DashboardShowcase;
