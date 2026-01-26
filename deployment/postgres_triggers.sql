-- ===========================================
-- EAJMUSIC - POSTGRESQL TRIGGERS FOR N8N SYNC
-- ===========================================
-- These triggers notify n8n when data changes in the primary database.
-- Run this on your Proxmox PostgreSQL after the Prisma migrations.
-- ===========================================

-- ===========================================
-- NOTIFICATION FUNCTION
-- ===========================================

-- Generic notification function that sends JSON payload to pg_notify
CREATE OR REPLACE FUNCTION notify_data_change()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  channel_name TEXT;
BEGIN
  channel_name := TG_TABLE_NAME || '_changes';
  
  IF TG_OP = 'DELETE' THEN
    payload := json_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'old', row_to_json(OLD),
      'timestamp', NOW()
    );
  ELSE
    payload := json_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'new', row_to_json(NEW),
      'old', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
      'timestamp', NOW()
    );
  END IF;
  
  PERFORM pg_notify(channel_name, payload::text);
  
  -- Also notify a global channel for n8n webhook
  PERFORM pg_notify('eajmusic_sync', payload::text);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- USER TRIGGERS
-- ===========================================

DROP TRIGGER IF EXISTS notify_users_changes ON users;

CREATE TRIGGER notify_users_changes
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_data_change();

-- ===========================================
-- RELEASE TRIGGERS
-- ===========================================

DROP TRIGGER IF EXISTS notify_releases_changes ON releases;

CREATE TRIGGER notify_releases_changes
  AFTER INSERT OR UPDATE OR DELETE ON releases
  FOR EACH ROW
  EXECUTE FUNCTION notify_data_change();

-- ===========================================
-- WALLET TRIGGERS
-- ===========================================

DROP TRIGGER IF EXISTS notify_wallets_changes ON wallets;

CREATE TRIGGER notify_wallets_changes
  AFTER INSERT OR UPDATE OR DELETE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION notify_data_change();

-- ===========================================
-- ANNOUNCEMENT TRIGGERS
-- ===========================================

DROP TRIGGER IF EXISTS notify_announcements_changes ON announcements;

CREATE TRIGGER notify_announcements_changes
  AFTER INSERT OR UPDATE OR DELETE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION notify_data_change();

-- ===========================================
-- HTTP WEBHOOK FUNCTION (Alternative to pg_notify)
-- ===========================================
-- This function calls an HTTP webhook directly if pg_http extension is available.
-- Useful if your n8n can receive direct HTTP calls from PostgreSQL.
--
-- First install: CREATE EXTENSION IF NOT EXISTS http;
--
-- Then uncomment and configure:

/*
CREATE OR REPLACE FUNCTION send_webhook_notification()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  webhook_url TEXT := 'https://n8n.eajmusic.com/webhook/db-sync'; -- Your n8n webhook
BEGIN
  IF TG_OP = 'DELETE' THEN
    payload := json_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'old', row_to_json(OLD)
    );
  ELSE
    payload := json_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'new', row_to_json(NEW)
    );
  END IF;
  
  PERFORM http_post(
    webhook_url,
    payload::text,
    'application/json'
  );
  
  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Webhook notification failed: %', SQLERRM;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
*/

-- ===========================================
-- VERIFICATION
-- ===========================================

-- List all triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Test notification (run in one session, LISTEN in another)
-- LISTEN eajmusic_sync;
-- UPDATE users SET updated_at = NOW() WHERE id = 'test-id';
