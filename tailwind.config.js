/** @type {import('tailwindcss').Config} */
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
        primary: '#2563eb',
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
          950: '#172554',
        },
        dark: {
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        background: {
          light: '#f8fafc',
          dark: '#030712',
        },
        card: {
          dark: '#111827',
        },
        input: {
          dark: '#1f2937',
        },
      },
    },
  },
};
