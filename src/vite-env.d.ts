/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_DB_TIMEOUT_MS: string;
    readonly VITE_HEALTH_CHECK_INTERVAL_MS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
