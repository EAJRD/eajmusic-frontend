# 🚀 EAJMUSIC Production Deployment Guide

This guide covers deploying EAJMUSIC to either **Hostinger shared hosting**
(Phusion Passenger) or a **generic Linux VPS** (Nginx + PM2).

## Architecture recap (read this first)

- **One frontend build serves three public-facing domains.** `npm run build`
  produces a single `dist/` folder. The React app itself detects which
  domain it's running on (`src/utils/subdomain.ts`) and renders the right
  experience at `/`:
  - `eajmusic.com` — marketing site (+ `/login`, `/dashboard`, `/admin` as
    path-based fallbacks)
  - `artist.eajmusic.com` — artist dashboard
  - `eaj.eajmusic.com` — distributor admin dashboard
  - Deploy the *same* `dist/` folder to all three; don't build separately per domain.
- **Backend is a single Node/Express + Prisma API** (`server/`), meant to run
  on one host (`api.eajmusic.com`) reachable by the frontend and, optionally,
  by an n8n instance that mirrors a few tables into Supabase as a read-only
  fallback (see `deployment/SETUP_GUIDE.md`). The Supabase fallback is
  optional — the app runs fine on the primary database alone.

---

## 0. Prerequisites

- Node.js v18+ and npm v9+ (both on your build machine and the server)
- A PostgreSQL 14+ database reachable from the API host
- A domain with DNS you control (to point `eajmusic.com`, `artist.eajmusic.com`,
  `eaj.eajmusic.com`, `api.eajmusic.com` at your hosting)
- **Hostinger path**: a plan with Node.js support (Business/Cloud) via hPanel
- **VPS path**: Ubuntu 22.04+, Nginx, PM2 (`npm i -g pm2`)

---

## 1. Configure environment variables

Never commit real values — `.env` / `server/.env` are gitignored. Copy the
example files and fill them in on the machine that will actually run them:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

Frontend `.env` — at minimum:
```env
VITE_API_URL=https://api.eajmusic.com/api
```
(Supabase fallback vars are optional — leave them blank to disable failover to Supabase.)

Backend `server/.env` — at minimum:
```env
NODE_ENV=production
PORT=5001
DATABASE_URL="postgresql://user:password@host:5432/eajmusic_db?schema=public"
JWT_SECRET="generate a long random string, e.g. `openssl rand -base64 48`"
FRONTEND_URL="https://eajmusic.com"
API_URL="https://api.eajmusic.com"
CORS_ORIGINS="https://eajmusic.com,https://www.eajmusic.com,https://artist.eajmusic.com,https://eaj.eajmusic.com"
```
Fill in SMTP_* if you want real password-reset emails — without it, reset
links are only logged to the server console in non-production mode.

---

## 2. Install, migrate, build

Run this on your build machine (or directly on the server if it has enough
resources):

```bash
# Frontend
npm install
npm run build          # -> dist/

# Backend
cd server
npm install --omit=dev
npx prisma generate
npx prisma migrate deploy   # applies committed migrations, safe for prod
npm run db:seed             # optional: creates a demo admin/artist account
cd ..
```

`npx tsc --noEmit` and `npm run build` should both complete with zero errors
before you deploy — if either fails, fix that first.

---

## 3A. Deploy to Hostinger (shared hosting / Phusion Passenger)

Hostinger's Node.js support runs your app through Phusion Passenger, which
looks for `app.js` at the app root — that's why `server/app.js` exists (it
just does `import './src/index.js'`).

1. **Frontend**: upload the contents of `dist/` to `public_html` (or the
   docroot for each subdomain, if hPanel treats them as separate document
   roots — copy the same files to all three). `public/.htaccess` is already
   built into `dist/` and handles SPA fallback routing (Apache `mod_rewrite`)
   so refreshing `/login` or `/about` doesn't 404.
2. **Backend**: in hPanel → Node.js, create an application pointing at the
   `server/` directory with **Startup file: `app.js`**. Set the Node version
   to 18+, then add every variable from `server/.env` in the panel's
   environment variable UI (Hostinger's Node app manager reads env vars from
   its own UI, not automatically from `server/.env`).
3. Run the install/build command Hostinger exposes (or SSH in and run
   `cd server && npm install --omit=dev && npx prisma migrate deploy`).
4. Point `api.eajmusic.com` at this Node application (hPanel lets you assign
   a subdomain to a Node app directly).
5. Restart the Node app from hPanel after any deploy.

---

## 3B. Deploy to a generic VPS (Nginx + PM2)

1. **Upload code** (git clone or rsync) to e.g. `/var/www/eajmusic`.
2. **Frontend**: copy `dist/` to `/var/www/eajmusic/dist` (referenced by
   `deployment/nginx.conf`).
3. **Backend**: run it with PM2 so it survives reboots/crashes:
   ```bash
   cd /var/www/eajmusic/server
   pm2 start src/index.js --name eajmusic-api
   pm2 save
   pm2 startup   # follow the printed instructions to enable on boot
   ```
4. **Nginx**: copy `deployment/nginx.conf` into `/etc/nginx/sites-available/eajmusic`,
   symlink it into `sites-enabled`, update the SSL cert paths, then:
   ```bash
   sudo ln -s /etc/nginx/sites-available/eajmusic /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
   Note the three frontend `server_name` blocks (`eajmusic.com`,
   `artist.eajmusic.com`, `eaj.eajmusic.com`) all point at the **same**
   `root /var/www/eajmusic/dist` — that's intentional, see the architecture
   note above.
5. **TLS**: `sudo certbot --nginx -d eajmusic.com -d www.eajmusic.com -d artist.eajmusic.com -d eaj.eajmusic.com -d api.eajmusic.com`

To redeploy after changes:
```bash
git pull
npm install && npm run build          # frontend
cd server && npm install --omit=dev && npx prisma migrate deploy && cd ..
pm2 restart eajmusic-api
```

---

## 4. Hybrid database / Supabase failover (optional)

Only needed if you want the app to keep serving read-only data when the
primary Postgres is unreachable. Full steps (Supabase schema, RLS, Postgres
triggers, n8n workflow import) are in `deployment/SETUP_GUIDE.md`. Summary:

1. Run `deployment/supabase_schema.sql` in your Supabase project's SQL editor.
2. Run `deployment/postgres_triggers.sql` against the primary Postgres database.
3. Import `deployment/n8n-sync-workflow.json` into n8n and point it at your
   Supabase project using a **service_role** key (not anon) as a credential.
4. Set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in the frontend `.env`.

If you skip this, the app works normally against the primary database only;
the connection badge will just show "Offline" instead of "Limited Mode" if
the primary ever goes down, since there's no fallback configured.

---

## ✅ Post-deploy verification checklist

- [ ] `https://eajmusic.com` loads the marketing homepage
- [ ] `https://artist.eajmusic.com` redirects to `/login` when logged out, and to the artist dashboard when logged in
- [ ] `https://eaj.eajmusic.com` redirects to `/login` when logged out, and to the admin dashboard for an ADMIN/SUPER_ADMIN user
- [ ] `https://api.eajmusic.com/api/health` returns `200 OK` with `{"status":"ok","database":"connected"}`
- [ ] Refreshing on a deep link (e.g. `https://eajmusic.com/about`, `https://artist.eajmusic.com/login`) does **not** 404 (confirms SPA fallback routing is active)
- [ ] Logging in, submitting a release, and an admin approving it all work end-to-end
- [ ] Browser console has no CORS errors (if it does, double check `CORS_ORIGINS` in `server/.env` matches the exact origins above, including protocol)

---

**Support**: check `deployment/SETUP_GUIDE.md` for the hybrid-database setup, or `README.md` for local development.
