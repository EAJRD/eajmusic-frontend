# 🚀 EAJMUSIC Production Deployment Guide

This guide details how to deploy the EAJMUSIC platform to a production environment (Hostinger VPS, DigitalOcean, or generic Linux server).

---

## 📋 Prerequisites

*   A Linux VPS (Ubuntu 22.04 LTS recommended)
*   Node.js v18+ and NPM v9+
*   Nginx (as Reverse Proxy)
*   PM2 (Process Manager for Backend)
*   Domain Name configured (e.g., `eajmusic.com`)

---

## 🛠 Step 1: Frontend Deployment (Static Files)

The frontend is a React/Vite SPA. It should be built locally or on a CI/CD pipeline and served as static files.

1.  **Build the Project**
    ```bash
    npm install
    npm run build
    ```
    This generates a `/dist` folder.

2.  **Upload to Server**
    Copy the `/dist` folder to your web server (e.g., `/var/www/eajmusic/html`).

3.  **Nginx Configuration**
    Your Nginx config should point to this folder and handle SPA routing (redirecting 404s to index.html).

    ```nginx
    server {
        listen 80;
        server_name app.eajmusic.com;
        root /var/www/eajmusic/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```

---

## ⚙️ Step 2: Backend Deployment (Node.js API)

1.  **Prepare Server**
    Navigate to the server directory (e.g., `/server` inside the repo).

    ```bash
    cd server
    npm install --production
    ```

2.  **Environment Variables**
    Create a `.env` file in the server directory with your **Production Secrets**.
    
    ```env
    PORT=5001
    DATABASE_URL=postgres://user:pass@localhost:5432/eajmusic
    JWT_SECRET=your_super_secret_key_here
    ```

3.  **Start with PM2**
    Use PM2 to keep the process alive.

    ```bash
    pm2 start src/index.js --name eajmusic-api
    pm2 save
    pm2 startup
    ```

---

## 🔄 Step 3: Hybrid Database Setup

1.  **Primary (Proxmox)**: Ensure your PostgreSQL 16 instance is running and reachable by the API.
2.  **Fallback (Supabase)**:
    *   Go to Supabase SQL Editor.
    *   Run the content of `deployment/supabase_schema.sql` to verify tables.
3.  **Sync (n8n)**:
    *   Import `deployment/n8n-sync-workflow.json` into your n8n instance.
    *   Configure the **PostgreSQL Trigger** using the script in `deployment/postgres_triggers.sql`.

---

## ✅ Verification Checklist

*   [ ] **Frontend**: `https://app.eajmusic.com` loads without errors.
*   [ ] **API**: `https://api.eajmusic.com/health` returns `200 OK`.
*   [ ] **Dark Mode**: Site loads in dark mode by default.
*   [ ] **Routing**: Refreshing on `/about` or `/login` does not give 404.

---

**Support**: Contact the DevOps team or check `SYSTEM_ARCHITECTURE.md` for more details.
