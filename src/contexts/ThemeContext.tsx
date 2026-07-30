import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PublicService } from '../services/api';

// ===========================================
// EAJMUSIC THEME CONTEXT
// ===========================================
// Loads the Super Admin's whitelabel branding (colors / logo / favicon /
// font) from the public, unauthenticated `GET /public/theme` endpoint at
// boot time and repaints the app live by writing CSS custom properties onto
// <html> — no rebuild required. See index.css for the `--color-*` tokens
// this consumes (Tailwind reads them via the `withOpacity()` helper in
// tailwind.config.js) and BrandSettings.tsx for the Super Admin UI that
// publishes new values via `PUT /admin/settings/brand_config`.
//
// Backend contract (eajmusic-api src/routes/public.js, verified by reading
// the sibling repo's source — not a live server, so this is source-verified
// but not runtime-verified):
//   GET /api/public/theme -> 200, Cache-Control: public, max-age=60
//   { siteName, primaryColor, logoUrl, faviconUrl }   (DEFAULT_BRAND_CONFIG
//   is returned verbatim when no `brand_config` PlatformSetting exists yet)
// The `brand_config` PlatformSetting itself is just a free-form JSON blob
// (`PUT /admin/settings/:key` stores whatever `value` it's given and this
// route echoes it back), so once a Super Admin publishes through
// BrandSettings.tsx the response can also carry `secondaryColor` and
// `fontFamily` — both are modeled below as optional fields for that reason.
// `logoLightUrl` / `logoDarkUrl` are accepted too for forward-compatibility
// with a future light/dark logo pair, but nothing currently sends them.

export interface BrandConfig {
  siteName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  logoLightUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
}

/**
 * Converts a `#rgb`/`#rrggbb` hex color into the space-separated `"R G B"`
 * triplet the `--color-*` custom properties in index.css store (see the
 * `withOpacity()` / `rgb(var(--x) / <alpha>)` trick in tailwind.config.js).
 * Returns null for anything that isn't a parseable hex color so callers can
 * skip applying it instead of writing garbage into a CSS variable.
 */
export function hexToRgbTriplet(hex: string): string | null {
  if (!hex) return null;
  let normalized = hex.trim().replace(/^#/, '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Applies a BrandConfig to the live document: CSS custom properties for
 * colors/font, and the `<link rel="icon">` for the favicon. Pure DOM side
 * effect, no React state — safe to call as many times as needed (once from
 * ThemeProvider on boot, and again from BrandSettings.tsx immediately after
 * a Super Admin publishes new settings, so the change is visible in the
 * current tab without a reload). Never throws: unparseable/missing values
 * are simply skipped, leaving whatever CSS default or previous value was in
 * place.
 */
export function applyBrandConfig(config: BrandConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const setColorVar = (varName: string, hex?: string) => {
    if (!hex) return;
    const rgb = hexToRgbTriplet(hex);
    if (rgb) root.style.setProperty(varName, rgb);
  };

  // Primary brand color drives both the standalone `--color-bioglow` token
  // (text-primary / bg-primary / etc.) and the `brand` scale's 600 anchor,
  // since tailwind.config.js defines `brand.600` as an alias for bioglow.
  // The rest of the brand-* scale (tints/shades) intentionally stays as
  // designed — recomputing a full accessible scale from one admin-picked
  // hex is out of scope here.
  setColorVar('--color-bioglow', config.primaryColor);
  setColorVar('--color-brand-600', config.primaryColor);
  setColorVar('--color-flame', config.secondaryColor);

  if (config.fontFamily) {
    const stack = `'${config.fontFamily}', ui-sans-serif, system-ui, sans-serif`;
    // `--font-brand` is the forward-compatible hook (consumed by
    // tailwind.config.js's `font-sans` / `font-display` once wired up the
    // same way colors are). Also set directly as a best-effort fallback so
    // elements that don't carry an explicit `font-sans`/`font-display`
    // class still pick up the new font immediately via inheritance.
    root.style.setProperty('--font-brand', stack);
    root.style.fontFamily = stack;
  }

  const faviconUrl = config.faviconUrl;
  if (faviconUrl) {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) link.setAttribute('href', faviconUrl);
  }
}

interface ThemeContextType {
  brand: BrandConfig;
  logoUrl: string | null;
  faviconUrl: string | null;
  isLoading: boolean;
  /** Re-fetches `/public/theme` and re-applies it. Exposed mainly for completeness; BrandSettings.tsx applies fresh values directly via `applyBrandConfig` right after a successful publish instead of round-tripping through the network. */
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brand, setBrand] = useState<BrandConfig>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadTheme = useCallback(async () => {
    try {
      const response = await PublicService.getTheme();
      if (response && typeof response === 'object') {
        const config = response as BrandConfig;
        setBrand(config);
        applyBrandConfig(config);
      }
    } catch {
      // Offline, backend not reachable/deployed yet, or no brand_config set
      // — fail silently and keep the CSS defaults already baked into
      // index.css. Theming must never block the app from rendering.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const value: ThemeContextType = {
    brand,
    logoUrl: brand.logoUrl || brand.logoLightUrl || null,
    faviconUrl: brand.faviconUrl || null,
    isLoading,
    refreshTheme: loadTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
