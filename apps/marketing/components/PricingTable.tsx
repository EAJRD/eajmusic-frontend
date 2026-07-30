import React from 'react';

type CellValue = string | boolean;

interface Row {
  label: string;
  free: CellValue;
  pro: CellValue;
  label_plus: CellValue;
}

const ROWS: Row[] = [
  { label: 'Precio', free: '$0/año', pro: '$19.99/año', label_plus: '$49.99/año' },
  { label: 'Perfiles de artista', free: '1', pro: '1', label_plus: 'Hasta 10' },
  { label: 'Regalías retenidas', free: '100%', pro: '100%', label_plus: '100%' },
  { label: 'Analíticas avanzadas', free: false, pro: true, label_plus: true },
  { label: 'Smart links', free: false, pro: true, label_plus: true },
  { label: 'Fechas de lanzamiento a medida', free: false, pro: true, label_plus: true },
  { label: 'Gestión de equipo', free: false, pro: false, label_plus: true },
  { label: 'Soporte prioritario', free: false, pro: false, label_plus: true },
];

function Cell({ value, featured }: { value: CellValue; featured?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <td className={`py-3.5 px-4 border-b border-slate-200 dark:border-white/10 text-base ${featured ? 'text-primary' : 'text-primary'}`}>✓</td>
    ) : (
      <td className="py-3.5 px-4 border-b border-slate-200 dark:border-white/10 text-base text-slate-400 dark:text-slate-500 opacity-50">✕</td>
    );
  }
  return (
    <td className={`py-3.5 px-4 border-b border-slate-200 dark:border-white/10 text-sm ${featured ? 'font-mono font-bold text-primary' : ''}`}>
      {value}
    </td>
  );
}

const PricingTable: React.FC<{ onSelectPlan: () => void }> = ({ onSelectPlan }) => (
  <div className="overflow-x-auto mt-8">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="py-3.5 px-4 border-b border-slate-200 dark:border-white/10" />
          <th className="text-left py-3.5 px-4 border-b border-slate-200 dark:border-white/10 text-base font-black">Free</th>
          <th className="text-left py-3.5 px-4 border-b border-slate-200 dark:border-white/10 text-base font-black text-primary">Pro Artist</th>
          <th className="text-left py-3.5 px-4 border-b border-slate-200 dark:border-white/10 text-base font-black">Label Plus</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => (
          <tr key={row.label} className="hover:bg-slate-50 dark:hover:bg-white/5 motion-reduce:transition-none transition-colors">
            <td className="py-3.5 px-4 border-b border-slate-200 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400">{row.label}</td>
            <Cell value={row.free} />
            <Cell value={row.pro} featured />
            <Cell value={row.label_plus} />
          </tr>
        ))}
        <tr>
          <td className="py-5 px-4" />
          <td className="py-5 px-4">
            <button
              type="button"
              onClick={onSelectPlan}
              className="w-full py-2.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold text-sm motion-reduce:transition-none transition-colors"
            >
              Empezar
            </button>
          </td>
          <td className="py-5 px-4">
            <button
              type="button"
              onClick={onSelectPlan}
              className="w-full py-2.5 rounded-lg bg-primary text-[#04211c] font-bold text-sm hover:opacity-90 motion-reduce:transition-none transition-opacity"
            >
              Elegir Pro
            </button>
          </td>
          <td className="py-5 px-4">
            <button
              type="button"
              onClick={onSelectPlan}
              className="w-full py-2.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold text-sm motion-reduce:transition-none transition-colors"
            >
              Elegir Label Plus
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default PricingTable;
