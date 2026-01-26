# 🏗️ EAJMUSIC Hybrid Architecture - Setup Guide

This guide explains how to deploy the hybrid database architecture with automatic failover between Proxmox (primary) and Supabase (fallback).

## Architecture Overview

```
Frontend (Hostinger) ──► Cloudflare Tunnel ──► Proxmox (PostgreSQL + n8n)
           │                                           │
           └──► Supabase (Fallback) ◄──── n8n Sync ────┘
```

## Quick Start

### 1. Frontend (.env)

The `.env` file should already exist. Verify these values:

```bash
VITE_API_URL=https://api.eajmusic.com/api
VITE_SUPABASE_URL=https://gniqkwyedexeeruznwgn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_DB_TIMEOUT_MS=3000
VITE_HEALTH_CHECK_INTERVAL_MS=30000
```

### 2. Supabase Setup

Run the schema in your Supabase SQL Editor:

1. Go to https://supabase.com/dashboard/project/gniqkwyedexeeruznwgn/sql
2. Open `deployment/supabase_schema.sql`
3. Copy and paste the entire file
4. Click "Run"

### 3. Proxmox PostgreSQL Triggers

After running Prisma migrations on Proxmox:

```bash
psql -U eajmusic_user -d eajmusic_db -f deployment/postgres_triggers.sql
```

### 4. n8n Workflow Import

1. Open n8n at https://n8n.eajmusic.com
2. Settings → Import Workflow
3. Select `deployment/n8n-sync-workflow.json`
4. Configure credentials:
   - Create HTTP Header Auth credential named "Supabase Service Key"
   - Use your Supabase **service_role** key (not anon key)
5. Activate the workflow

### 5. Cloudflare Tunnel (if not configured)

On your Proxmox server:

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Login and create tunnels
cloudflared tunnel login
cloudflared tunnel create eajmusic

# Configure ingress (create ~/.cloudflared/config.yml)
cat > ~/.cloudflared/config.yml << EOF
tunnel: YOUR_TUNNEL_ID
credentials-file: /root/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: api.eajmusic.com
    service: http://localhost:5001
  - hostname: n8n.eajmusic.com
    service: http://localhost:5678
  - service: http_status:404
EOF

# Run as service
cloudflared service install
cloudflared tunnel run
```

## Testing Failover

1. **Primary Mode**: Start with normal operation, you should see a green "Connected" badge
2. **Simulate Failure**: Stop the backend server or disconnect Proxmox
3. **Verify Failover**: Badge should turn yellow "Limited Mode" after ~6 seconds
4. **Recovery**: Restart backend, badge returns to green after ~30 seconds

## Files Created

| File | Purpose |
|------|---------|
| `services/DatabaseService.ts` | Auto-failover logic |
| `services/SupabaseClient.ts` | Lightweight Supabase REST client |
| `components/ConnectionStatusBadge.tsx` | Visual status indicator |
| `deployment/supabase_schema.sql` | Supabase lite tables |
| `deployment/postgres_triggers.sql` | PostgreSQL change notifications |
| `deployment/n8n-sync-workflow.json` | n8n import workflow |

## Troubleshooting

**Badge shows "Offline"**: Supabase not configured. Check `VITE_SUPABASE_ANON_KEY`.

**Badge stays yellow**: Primary server unreachable. Check Cloudflare Tunnel status.

**Sync not working**: Verify n8n workflow is active and credentials are correct.
