import { createClient } from '@insforge/sdk';

// Auth front door only (signup/login/OAuth/email verification/password
// reset) - see src/contexts/AuthContext.tsx. Business data, RBAC, and every
// other API call still go through the existing custom API (src/services/api.ts).
//
// detectOAuthCallback: false - the SDK's own automatic OAuth handling runs
// synchronously in this constructor, i.e. before AuthProvider's effect ever
// gets a chance to run, and it strips `insforge_code` off the URL as part of
// consuming it. That raced with (and always won against) the manual
// exchange in AuthContext.tsx, which needs the raw accessToken to call this
// app's own POST /auth/sync-insforge-user - the SDK's auto-exchange keeps
// the resulting session private to itself, so our own backend session never
// got created and the user bounced back to /login post-Google-auth. Only
// our manual handling should ever consume that code.
export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
  detectOAuthCallback: false,
});
