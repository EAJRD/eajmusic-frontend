-- ===========================================
-- EAJMUSIC - SUPABASE SCHEMA (LITE VERSION)
-- ===========================================
-- This schema contains only the essential data needed for the website
-- to remain functional when the primary Proxmox database is unavailable.
-- 
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ===========================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- TABLES (Lite Versions - Read Only)
-- ===========================================

-- Users Lite: Basic user info for display purposes only
-- NO passwords, NO sensitive data
CREATE TABLE IF NOT EXISTS users_lite (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ARTIST',
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Releases Lite: Basic release info for catalog display
CREATE TABLE IF NOT EXISTS releases_lite (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  artist_name TEXT,
  cover_art_url TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  release_type TEXT DEFAULT 'SINGLE',
  release_date DATE,
  genre TEXT,
  is_explicit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Lite: Balance info for display only
-- NO transaction history, NO payout details
CREATE TABLE IF NOT EXISTS wallet_lite (
  user_id UUID PRIMARY KEY,
  available_balance DECIMAL(12,2) DEFAULT 0,
  pending_balance DECIMAL(12,2) DEFAULT 0,
  lifetime_earnings DECIMAL(12,2) DEFAULT 0,
  currency CHAR(3) DEFAULT 'USD',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements Lite: Platform announcements for homepage
CREATE TABLE IF NOT EXISTS announcements_lite (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_releases_lite_user ON releases_lite(user_id);
CREATE INDEX IF NOT EXISTS idx_releases_lite_status ON releases_lite(status);
CREATE INDEX IF NOT EXISTS idx_releases_lite_date ON releases_lite(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements_lite(is_active) WHERE is_active = TRUE;

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE users_lite ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases_lite ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_lite ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements_lite ENABLE ROW LEVEL SECURITY;

-- Public read access policies (anon key can read)
-- These are read-only tables synced from Proxmox
--
-- IMPORTANT: this app does not authenticate individual users to Supabase -
-- every browser uses the same shared anon key (VITE_SUPABASE_ANON_KEY).
-- RLS policies here CANNOT be scoped "per user" (there is no auth.uid());
-- anything readable by the anon key is readable by anyone who has that key,
-- which is effectively public. Only put data here you're fine with being
-- fully public. users_lite/wallet_lite are intentionally NOT anon-readable
-- below because they contain email addresses and financial balances.

CREATE POLICY "Allow public read releases_lite" ON releases_lite
  FOR SELECT USING (status = 'LIVE' OR status = 'PENDING');

CREATE POLICY "Allow public read active announcements" ON announcements_lite
  FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- users_lite and wallet_lite intentionally have NO anon SELECT policy.
-- With RLS enabled and no matching policy, all anon/authenticated reads are
-- denied by default - only the service_role (used by the n8n sync job, see
-- below) can read or write them. If a real public artist-directory feature
-- is built later, expose it via a dedicated view with only non-sensitive
-- columns (no email, no balances) rather than opening these tables directly.

-- ===========================================
-- SERVICE ROLE POLICIES (for n8n sync)
-- ===========================================
-- The service_role key (not anon) can insert/update

CREATE POLICY "Allow service role write users_lite" ON users_lite
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role write releases_lite" ON releases_lite
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role write wallet_lite" ON wallet_lite
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role write announcements_lite" ON announcements_lite
  FOR ALL USING (auth.role() = 'service_role');

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_lite_timestamp
  BEFORE UPDATE ON users_lite
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_releases_lite_timestamp
  BEFORE UPDATE ON releases_lite
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_wallet_lite_timestamp
  BEFORE UPDATE ON wallet_lite
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- SAMPLE DATA (for testing - remove in production)
-- ===========================================

-- INSERT INTO announcements_lite (title, content, type, is_active)
-- VALUES (
--   'Welcome to EAJMUSIC!',
--   'Start distributing your music to all major platforms today.',
--   'info',
--   true
-- );

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Run these to verify setup:
-- SELECT * FROM users_lite LIMIT 5;
-- SELECT * FROM releases_lite WHERE status = 'LIVE' LIMIT 5;
-- SELECT * FROM announcements_lite WHERE is_active = TRUE;
