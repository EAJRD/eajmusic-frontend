import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Users, AlertCircle, CheckCircle2, Percent, Scale } from 'lucide-react';
import type { SplitContributor } from '../../../src/types/api';

export interface SplitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (splits: SplitContributor[]) => void;
  trackTitle?: string;
  initialSplits?: SplitContributor[];
}

const ROLE_OPTIONS: SplitContributor['role'][] = [
  'Artist',
  'Producer',
  'Composer',
  'Songwriter',
  'Label',
  'Other'
];

export const SplitsModal: React.FC<SplitsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trackTitle = 'Track General',
  initialSplits = []
}) => {
  const [contributors, setContributors] = useState<SplitContributor[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialSplits && initialSplits.length > 0) {
        setContributors(initialSplits);
      } else {
        // Default: 1 Primary Artist at 100%
        setContributors([
          {
            id: 'c_' + Math.random().toString(36).substring(2, 9),
            name: '',
            email: '',
            role: 'Artist',
            percentage: 100
          }
        ]);
      }
    }
  }, [isOpen]);

  const totalPercentage = useMemo(() => {
    return Number(
      contributors.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0).toFixed(2)
    );
  }, [contributors]);

  const isValid = Math.abs(totalPercentage - 100) < 0.001 && contributors.length > 0;
  const remainingPercentage = Number((100 - totalPercentage).toFixed(2));

  if (!isOpen) return null;

  const handleUpdateContributor = (
    id: string,
    field: keyof SplitContributor,
    value: string | number
  ) => {
    setContributors(prev =>
      prev.map(c => {
        if (c.id === id) {
          if (field === 'percentage') {
            const numeric = Number(value);
            return { ...c, percentage: isNaN(numeric) ? 0 : numeric };
          }
          return { ...c, [field]: value };
        }
        return c;
      })
    );
  };

  const handleAddContributor = () => {
    const defaultSplit = remainingPercentage > 0 ? remainingPercentage : 0;
    const newContrib: SplitContributor = {
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      name: '',
      email: '',
      role: 'Songwriter',
      percentage: defaultSplit
    };
    setContributors(prev => [...prev, newContrib]);
  };

  const handleRemoveContributor = (id: string) => {
    if (contributors.length <= 1) return;
    setContributors(prev => prev.filter(c => c.id !== id));
  };

  const distributeEqually = () => {
    if (contributors.length === 0) return;
    const count = contributors.length;
    const baseShare = Math.floor((100 / count) * 100) / 100;
    const remainder = Number((100 - baseShare * count).toFixed(2));

    setContributors(prev =>
      prev.map((c, index) => ({
        ...c,
        percentage: Number((baseShare + (index === 0 ? remainder : 0)).toFixed(2))
      }))
    );
  };

  const handleSave = () => {
    if (!isValid) return;
    onSave(contributors);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="splits-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-[#262626] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[#F5F5F5] transition-all"
        style={{ backgroundColor: '#0D0D0D' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E] bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 id="splits-modal-title" className="text-base font-bold text-[#F5F5F5]">
                Splits & Regalías
              </h3>
              <p className="text-xs text-neutral-400">
                División oficial para: <span className="text-sky-400 font-medium">{trackTitle}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-[#1E1E1E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-[#161616] border-b border-[#222222] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {isValid ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Suma exacta: 100%
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <AlertCircle className="w-4 h-4" />
                {totalPercentage < 100
                  ? `Faltan ${remainingPercentage}% para el 100%`
                  : `Excede por ${Math.abs(remainingPercentage)}%`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={distributeEqually}
              className="flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors focus:outline-none"
            >
              <Scale className="w-3.5 h-3.5" />
              Dividir en partes iguales
            </button>
            <div className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#202020] border border-[#2E2E2E]">
              Total: <span className={isValid ? 'text-emerald-400' : 'text-amber-400'}>{totalPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Contributors List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {contributors.map((contrib, index) => (
            <div
              key={contrib.id}
              className="p-4 rounded-xl border border-[#222222] bg-[#121212] space-y-3 relative group hover:border-[#333333] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Colaborador #{index + 1}
                </span>
                {contributors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveContributor(contrib.id)}
                    aria-label={`Eliminar colaborador ${index + 1}`}
                    className="text-neutral-500 hover:text-red-400 p-1 rounded-lg hover:bg-[#1A1A1A] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Name */}
                <div className="sm:col-span-4">
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={contrib.name}
                    onChange={e => handleUpdateContributor(contrib.id, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0D0D0D] border border-[#262626] rounded-lg text-xs text-[#F5F5F5] placeholder-neutral-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Email / ID */}
                <div className="sm:col-span-3">
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Email / Split ID
                  </label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={contrib.email}
                    onChange={e => handleUpdateContributor(contrib.id, 'email', e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0D0D0D] border border-[#262626] rounded-lg text-xs text-[#F5F5F5] placeholder-neutral-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Role */}
                <div className="sm:col-span-3">
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                    Rol
                  </label>
                  <select
                    value={contrib.role}
                    onChange={e =>
                      handleUpdateContributor(contrib.id, 'role', e.target.value as SplitContributor['role'])
                    }
                    className="w-full px-3 py-1.5 bg-[#0D0D0D] border border-[#262626] rounded-lg text-xs text-[#F5F5F5] focus:outline-none focus:border-sky-500"
                  >
                    {ROLE_OPTIONS.map(role => (
                      <option key={role} value={role} className="bg-[#121212] text-white">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Percentage */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1 flex items-center justify-between">
                    <span>Porcentaje</span>
                    <Percent className="w-3 h-3 text-sky-400" />
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={contrib.percentage}
                      onChange={e =>
                        handleUpdateContributor(contrib.id, 'percentage', e.target.value)
                      }
                      className="w-full pr-6 pl-3 py-1.5 bg-[#0D0D0D] border border-[#262626] rounded-lg text-xs font-mono font-bold text-sky-400 focus:outline-none focus:border-sky-500 text-right"
                    />
                    <span className="absolute right-2 top-1.5 text-xs text-neutral-500 pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Contributor Button */}
          <button
            type="button"
            onClick={handleAddContributor}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#262626] hover:border-sky-500/50 bg-[#121212]/40 hover:bg-[#121212] text-xs font-semibold text-neutral-300 hover:text-sky-400 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Añadir Colaborador
          </button>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#121212] border-t border-[#1E1E1E] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#1E1E1E] transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-black disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20 active:scale-95 transition-all focus:outline-none"
          >
            Confirmar Splits (100%)
          </button>
        </div>
      </div>
    </div>
  );
};
