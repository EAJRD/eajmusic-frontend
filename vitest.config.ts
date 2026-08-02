import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'https://eajmusic.com/' },
    },
    include: ['src/**/*.test.ts', 'apps/**/*.test.ts', 'apps/**/*.test.tsx'],
  },
});
