-- ===========================================
-- EAJMUSIC - POSTGRESQL SETUP SCRIPT
-- ===========================================
-- Ejecuta este script en tu servidor PostgreSQL (Proxmox)
-- para crear la base de datos y el usuario

-- 1. Crear el usuario de la aplicacion
CREATE USER eajmusic_user WITH PASSWORD 'TU_PASSWORD_SEGURO_AQUI';

-- 2. Crear la base de datos
CREATE DATABASE eajmusic_db
    WITH
    OWNER = eajmusic_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- 3. Conceder todos los privilegios
GRANT ALL PRIVILEGES ON DATABASE eajmusic_db TO eajmusic_user;

-- 4. Conectarse a la base de datos y crear extension UUID
\c eajmusic_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 5. Conceder permisos en el schema public
GRANT ALL ON SCHEMA public TO eajmusic_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO eajmusic_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO eajmusic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO eajmusic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO eajmusic_user;

-- ===========================================
-- CONFIGURACION DE ACCESO REMOTO
-- ===========================================
-- Necesitas modificar estos archivos en tu servidor PostgreSQL:

-- 1. postgresql.conf
-- Busca y modifica:
-- listen_addresses = '*'

-- 2. pg_hba.conf
-- Agrega al final (reemplaza IP_HOSTINGER con la IP de tu hosting):
-- host    eajmusic_db    eajmusic_user    IP_HOSTINGER/32    scram-sha-256

-- Si quieres permitir cualquier IP (menos seguro):
-- host    eajmusic_db    eajmusic_user    0.0.0.0/0    scram-sha-256

-- 3. Reinicia PostgreSQL:
-- sudo systemctl restart postgresql

-- ===========================================
-- FIREWALL (si usas ufw)
-- ===========================================
-- sudo ufw allow from IP_HOSTINGER to any port 5432

-- ===========================================
-- STRING DE CONEXION
-- ===========================================
-- Tu DATABASE_URL sera:
-- postgresql://eajmusic_user:TU_PASSWORD@TU_IP_PUBLICA:5432/eajmusic_db?schema=public
--
-- Si usas un dominio dinamico (como no-ip o duckdns):
-- postgresql://eajmusic_user:TU_PASSWORD@tudominio.duckdns.org:5432/eajmusic_db?schema=public
