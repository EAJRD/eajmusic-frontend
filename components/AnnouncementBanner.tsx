import React, { useEffect, useState } from 'react';
import { PublicService } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import type { Announcement } from '../src/types/api';

const DISMISSED_KEY = 'eajmusic_dismissed_announcements';

const TYPE_STYLES: Record<string, string> = {
  info: 'bg-blue-600 text-white',
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-500 text-slate-900',
  urgent: 'bg-rose-600 text-white',
};

const getDismissed = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
};

const dismiss = (id: string) => {
  const current = getDismissed();
  if (!current.includes(id)) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, id]));
  }
};

// Renders active PlatformSetting-managed announcements (created in the admin
// panel's Announcements page) at the top of every domain. `targetAudience`
// is matched against the current viewer: 'all' always shows; 'free'/'pro'
// match the logged-in user's subscription plan; 'labels' matches role
// LABEL. Anonymous visitors (marketing site) only ever see 'all'.
const AnnouncementBanner: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(getDismissed());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await PublicService.getAnnouncements();
        if (!cancelled) setAnnouncements(res?.announcements || []);
      } catch {
        // Non-fatal - the site just renders without a banner.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const matchesAudience = (audience?: string): boolean => {
    if (!audience || audience === 'all') return true;
    if (!user) return false;
    if (audience === 'labels') return user.role === 'LABEL';
    return user.subscription?.plan?.toLowerCase() === audience.toLowerCase();
  };

  const visible = announcements.filter(
    (a) => !dismissedIds.includes(a.id) && matchesAudience(a.targetAudience)
  );

  if (visible.length === 0) return null;

  const handleDismiss = (id: string) => {
    dismiss(id);
    setDismissedIds((prev) => [...prev, id]);
  };

  return (
    <div className="relative z-40">
      {visible.map((a) => (
        <div
          key={a.id}
          className={`flex items-center justify-between gap-4 px-4 py-2.5 text-sm font-medium ${TYPE_STYLES[a.type] || TYPE_STYLES.info}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[18px] shrink-0">campaign</span>
            <span className="truncate">
              <strong className="font-bold">{a.title}</strong>
              {a.content ? <span className="opacity-90"> — {a.content}</span> : null}
            </span>
          </div>
          <button
            onClick={() => handleDismiss(a.id)}
            className="shrink-0 opacity-80 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementBanner;
