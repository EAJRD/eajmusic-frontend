import type { InsForgeClient } from '@insforge/sdk';

// Lazy-loaded on purpose. @insforge/sdk pulls in real weight (a Socket.IO
// client for realtime among it) that has no reason to be in the bundle for
// pages that never touch auth - the marketing homepage chief among them.
// Every call site awaits this instead of importing a top-level client, so
// Vite splits the SDK into its own chunk that's only fetched the first time
// an actual auth action runs (login, register, password reset, OAuth).
// `/auth/me` (session-restore-on-load, see AuthContext.tsx) never calls
// this - it's a plain fetch against this app's own API and stays fast on
// every page regardless of whether this chunk ever loads.
let clientPromise: Promise<InsForgeClient> | null = null;

export function getInsforge(): Promise<InsForgeClient> {
  if (!clientPromise) {
    clientPromise = import('@insforge/sdk').then(({ createClient }) =>
      createClient({
        baseUrl: import.meta.env.VITE_INSFORGE_URL,
        anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
        auth: { detectOAuthCallback: false },
      })
    );
  }
  return clientPromise;
}
