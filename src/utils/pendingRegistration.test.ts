import { describe, it, expect, beforeEach } from 'vitest';
import { savePendingRegistration, getPendingRegistration, clearPendingRegistration } from './pendingRegistration';

describe('pendingRegistration', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('round-trips name, accountType, and invitationToken for the matching email', () => {
    savePendingRegistration({ email: 'artist@example.com', name: 'DJ Test', accountType: 'LABEL', invitationToken: 'tok123' });
    const result = getPendingRegistration('artist@example.com');
    expect(result).toEqual({ email: 'artist@example.com', name: 'DJ Test', accountType: 'LABEL', invitationToken: 'tok123' });
  });

  it('returns null when the stored email does not match the one being verified', () => {
    savePendingRegistration({ email: 'someone@example.com', name: 'X', accountType: 'ARTIST' });
    expect(getPendingRegistration('someone-else@example.com')).toBeNull();
  });

  it('returns null when nothing has been saved', () => {
    expect(getPendingRegistration('nobody@example.com')).toBeNull();
  });

  it('clearPendingRegistration removes it so a later lookup returns null', () => {
    savePendingRegistration({ email: 'artist@example.com', name: 'DJ Test', accountType: 'ARTIST' });
    clearPendingRegistration();
    expect(getPendingRegistration('artist@example.com')).toBeNull();
  });
});
