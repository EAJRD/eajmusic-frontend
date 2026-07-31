/** @type {import('tailwindcss').Config} */

// Reads a CSS custom property (defined in index.css `:root` / `.dark`) as the
// color value for a Tailwind color key, using the documented RGB + alpha
// trick (https://tailwindcss.com/docs/customizing-colors#using-css-variables).
// This lets a Super Admin theming feature repaint the whole app at runtime by
// calling `document.documentElement.style.setProperty('--color-x', 'r g b')`
// without touching any component class name or triggering a rebuild.
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './apps/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: withOpacity('--color-bioglow'),
        flame: withOpacity('--color-flame'),
        brand: {
          50: withOpacity('--color-brand-50'),
          100: withOpacity('--color-brand-100'),
          200: withOpacity('--color-brand-200'),
          400: withOpacity('--color-brand-400'),
          500: withOpacity('--color-brand-500'),
          600: withOpacity('--color-brand-600'),
          700: withOpacity('--color-brand-700'),
          900: withOpacity('--color-brand-900'),
          950: withOpacity('--color-brand-950'),
        },
        dark: {
          700: withOpacity('--color-dark-700'),
          800: withOpacity('--color-dark-800'),
          900: withOpacity('--color-dark-900'),
          950: withOpacity('--color-dark-950'),
        },
        background: {
          light: withOpacity('--color-bg-light'),
          dark: withOpacity('--color-bg-dark'),
        },
        card: {
          dark: withOpacity('--color-dark-900'),
        },
        input: {
          dark: withOpacity('--color-dark-800'),
        },
        // "Sonic Dark" — fixed design system for the release module
        // (apps/artist/pages: Catalog, ReleaseDetail, NewRelease wizard,
        // Dashboard). Approved as-is from the Stitch reference; unlike the
        // tokens above this is NOT wired to the live-theming CSS vars, since
        // this module's identity (pure black + neon lime) is deliberately
        // fixed rather than Super-Admin-recolorable.
        sonic: {
          bg: '#0a0a0a',
          surface: '#131313',
          card: '#1a1a1a',
          elevated: '#2c2c2c',
          border: '#333333',
          primary: '#e1ff00',
          'primary-ink': '#191e00',
          text: '#e5e2e1',
          'text-dim': '#9c9c98',
          error: '#ffb4ab',
        },
      },
      fontFamily: {
        sonic: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
};
