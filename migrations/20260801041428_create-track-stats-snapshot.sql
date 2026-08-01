-- Read-availability cache for track stream/revenue stats: eajmusic-api (the
-- real source of truth, on its own Postgres) pushes a snapshot here via a
-- periodic sync job (every 30 days - matches how often the underlying
-- streaming platforms actually refresh reporting, so a longer cache window
-- doesn't lose meaningful freshness). If the primary API is down, the
-- artist dashboard can still read this snapshot directly from InsForge.
CREATE TABLE public.track_stats_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insforge_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  release_id text,
  title text NOT NULL,
  streams bigint NOT NULL DEFAULT 0,
  revenue numeric(12,2) NOT NULL DEFAULT 0,
  synced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (insforge_user_id, track_id)
);

ALTER TABLE public.track_stats_snapshot ENABLE ROW LEVEL SECURITY;

-- An artist can read only their own snapshot rows.
CREATE POLICY track_stats_snapshot_select_own
  ON public.track_stats_snapshot
  FOR SELECT
  USING (auth.uid() = insforge_user_id);

-- Writes only ever happen from eajmusic-api's sync job using the project's
-- admin API key (which bypasses RLS entirely) - no runtime role should be
-- able to insert/update/delete this table under any policy, at all.
REVOKE INSERT, UPDATE, DELETE ON public.track_stats_snapshot FROM authenticated, anon;

CREATE INDEX track_stats_snapshot_user_idx ON public.track_stats_snapshot (insforge_user_id);
