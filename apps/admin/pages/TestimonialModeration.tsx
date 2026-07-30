import React, { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../../../src/services/api';

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'All'];

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
    case 'REJECTED': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
    case 'PENDING': default: return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
  }
};

const getInitials = (name: string) => (name || '?').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

const TestimonialModeration: React.FC = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await AdminService.getTestimonials({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        limit: 50,
      } as any);
      setTestimonials(res?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load testimonials.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const handleModerate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setMutatingId(id);
    setError('');
    try {
      await AdminService.moderateTestimonial(id, status);
      // If we're viewing a filtered status list, the item no longer belongs — drop it.
      // Otherwise (viewing "All"), just update its badge in place.
      if (statusFilter !== 'All') {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
      } else {
        setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update testimonial.');
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Testimonials</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold">Review artist-submitted testimonials before they go live.</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 appearance-none"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchTestimonials} className="font-bold underline">Retry</button>
        </div>
      )}

      <div className="space-y-4">
        {loading && (
          <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-10 text-center text-slate-400">
            Loading testimonials...
          </div>
        )}

        {!loading && testimonials.length === 0 && (
          <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-10 text-center text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">rate_review</span>
            <p>No testimonials {statusFilter !== 'All' ? `with status "${statusFilter.toLowerCase()}"` : ''} found.</p>
          </div>
        )}

        {!loading && testimonials.map((t) => (
          <div key={t.id} className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {t.photoUrl ? (
                  <img src={t.photoUrl} alt={t.artistProfile?.name || 'Artist'} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {getInitials(t.artistProfile?.name || '?')}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{t.artistProfile?.name || 'Unknown artist'}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(t.status)}`}>{t.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Submitted {formatDate(t.submittedAt)}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-3 italic">&ldquo;{t.quote}&rdquo;</p>
                </div>
              </div>

              {t.status === 'PENDING' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleModerate(t.id, 'REJECTED')}
                    disabled={mutatingId === t.id}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleModerate(t.id, 'APPROVED')}
                    disabled={mutatingId === t.id}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialModeration;
