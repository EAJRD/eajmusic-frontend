import { getInsforge } from '../lib/insforge';

export interface StatsSnapshotRow {
  track_id: string;
  release_id: string | null;
  title: string;
  streams: number;
  revenue: number;
  synced_at: string;
}

// Read-only fallback for when the primary API (eajmusic-api) is unreachable.
// Reads the artist's own rows from InsForge's track_stats_snapshot table -
// RLS scopes this to auth.uid() automatically, no explicit filter needed.
// See eajmusic-api/scripts/syncStatsToInsforge.js for what populates this
// (runs every 30 days) and migrations/20260801041428_create-track-stats-
// snapshot.sql for the table + RLS policy.
export async function getStatsSnapshotFallback(): Promise<StatsSnapshotRow[] | null> {
  try {
    const insforge = await getInsforge();
    const { data, error } = await insforge.database
      .from('track_stats_snapshot')
      .select('track_id,release_id,title,streams,revenue,synced_at');
    if (error || !data) return null;
    return data as unknown as StatsSnapshotRow[];
  } catch {
    return null;
  }
}
