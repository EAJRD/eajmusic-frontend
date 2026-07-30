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
      },
    },
  },
};
