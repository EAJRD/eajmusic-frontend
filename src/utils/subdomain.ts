// ===========================================
// SUBDOMAIN / MULTI-APP ROUTING
// ===========================================
// Production topology:
//   eajmusic.com        -> marketing site (+ /dashboard, /admin fallback paths)
//   artist.eajmusic.com -> artist dashboard app (mounted at "/")
//   eaj.eajmusic.com    -> distributor admin app (mounted at "/")
//
// Local development: no DNS/hosts changes required. Use either:
//   - VITE_APP_MODE=artist|admin|main in .env.local, or
//   - ?app=artist / ?app=admin query param on http://localhost:3000

export type AppMode = 'main' | 'artist' | 'admin';

const ARTIST_PREFIXES = ['artist.'];
const ADMIN_PREFIXES = ['eaj.', 'admin.'];

function detectAppMode(): AppMode {
  if (typeof window === 'undefined') return 'main';

  const envMode = (import.meta as any).env?.VITE_APP_MODE as string | undefined;
  if (envMode === 'artist' || envMode === 'admin' || envMode === 'main') {
    return envMode;
  }

  const params = new URLSearchParams(window.location.search);
  const queryMode = params.get('app');
  if (queryMode === 'artist' || queryMode === 'admin' || queryMode === 'main') {
    return queryMode;
  }

  const hostname = window.location.hostname.toLowerCase();
  if (ARTIST_PREFIXES.some((prefix) => hostname.startsWith(prefix))) return 'artist';
  if (ADMIN_PREFIXES.some((prefix) => hostname.startsWith(prefix))) return 'admin';
  return 'main';
}

// Computed once per page load — the hostname/query string doesn't change without a reload.
export const APP_MODE: AppMode = detectAppMode();

/**
 * Builds a URL that lands the user in the correct app, even when that app
 * lives on a different subdomain than the current page.
 */
export function crossDomainUrl(mode: AppMode, path: string = '/'): string {
  if (typeof window === 'undefined') return path;

  const { protocol, hostname, port } = window.location;
  const portSuffix = port ? `:${port}` : '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Local dev / IP access: no real subdomains exist, so switch apps via ?app=
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const separator = normalizedPath.includes('?') ? '&' : '?';
    return `${protocol}//${hostname}${portSuffix}${normalizedPath}${separator}app=${mode}`;
  }

  const rootDomain = hostname.replace(/^(artist|eaj|admin|app|www)\./, '');
  const subdomain = mode === 'artist' ? 'artist.' : mode === 'admin' ? 'eaj.' : '';
  return `${protocol}//${subdomain}${rootDomain}${portSuffix}${normalizedPath}`;
}

export function goToApp(mode: AppMode, path: string = '/'): void {
  if (typeof window === 'undefined') return;
  window.location.href = crossDomainUrl(mode, path);
}
