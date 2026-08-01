// Bridges Register.tsx -> VerifyEmail.tsx across a reload/tab-close. Once
// signUp() returns requireEmailVerification, the account already exists on
// InsForge but this API's business row doesn't yet - it's created by
// POST /auth/sync-insforge-user, using whatever `name`/`accountType` the
// *first* successful verify call passes. If the user closes the tab or
// reloads before finishing the OTP step and comes back to /verify-email
// later, those two fields were previously lost - the sync silently
// defaulted accountType to ARTIST regardless of what the person actually
// chose (LABEL), because nothing else told it otherwise. sessionStorage
// (not sent anywhere but our own sync endpoint, same trust level as the
// OAuth codeVerifier stash) survives exactly the gap that needs bridging.
const KEY = 'eajmusic_pending_registration';

interface PendingRegistration {
  email: string;
  name: string;
  accountType: string;
}

export function savePendingRegistration(data: PendingRegistration): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable (private mode, quota) - non-fatal, the OTP step
    // in the same page load still has `formData` in React state either way.
  }
}

export function getPendingRegistration(email: string): PendingRegistration | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingRegistration;
    return parsed.email === email ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingRegistration(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Ignore.
  }
}
