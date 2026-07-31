import { createClient } from '@insforge/sdk';

// Auth front door only (signup/login/OAuth/email verification/password
// reset) - see src/contexts/AuthContext.tsx. Business data, RBAC, and every
// other API call still go through the existing custom API (src/services/api.ts).
export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
});
