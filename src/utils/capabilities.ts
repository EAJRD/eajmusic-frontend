import type { User } from '../types/api';

// Central definition of what each role can see/do in the artist-app UI
// (artist.eajmusic.com + the /dashboard and /admin path-mounts on
// eajmusic.com). This is a UI-layer convenience only - it decides what to
// render, never what's allowed. The real authorization boundary is the
// backend: every LABEL-scoped route re-derives the caller's owned Label
// from req.user.id and re-checks ownership on every read/write (see
// requireOwnedLabel() in eajmusic-api/src/routes/artist.js) rather than
// trusting anything the client sends or hides.
export type Capability =
  | 'label:manageArtists'
  | 'label:viewAggregateCatalog'
  | 'label:branding'
  | 'artist:ownCatalog'
  | 'artist:onboarding';

const ROLE_CAPABILITIES: Record<string, Capability[]> = {
  LABEL: ['label:manageArtists', 'label:viewAggregateCatalog', 'label:branding'],
  ARTIST: ['artist:ownCatalog', 'artist:onboarding'],
};

export function hasCapability(user: User | null | undefined, capability: Capability): boolean {
  if (!user) return false;
  return (ROLE_CAPABILITIES[user.role] || []).includes(capability);
}

export function isLabel(user: User | null | undefined): boolean {
  return user?.role === 'LABEL';
}

export function isArtist(user: User | null | undefined): boolean {
  return user?.role === 'ARTIST';
}
