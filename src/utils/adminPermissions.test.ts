import { describe, it, expect } from 'vitest';
import { ADMIN_ROLE_PERMISSIONS, hasAdminPermission, canAccessAdminPanel } from './adminPermissions';
import type { User, UserRole } from '../types/api';

const user = (role: UserRole, permissions: string[] | null = null): User =>
    ({ id: 'u1', email: 'e@x.com', name: 'Test', role, status: 'ACTIVE', avatarUrl: null, permissions }) as User;

// Deliberately mirrors eajmusic-api/src/middleware/rbac.test.js. Nothing can
// automatically detect the backend matrix drifting from this one, so these
// assertions are written against the same spec on both sides: if someone
// changes one repo's matrix without the other, one of the two suites breaks.
describe('admin role matrix - owner-only powers', () => {
    const OWNER_ONLY = ['settings:read', 'settings:write', 'audit:read', 'employees:manage'];

    it.each(OWNER_ONLY)('SUPER_ADMIN has %s', (permission) => {
        expect(hasAdminPermission(user('SUPER_ADMIN'), permission)).toBe(true);
    });

    it.each(OWNER_ONLY)('ADMIN does NOT have %s', (permission) => {
        expect(hasAdminPermission(user('ADMIN'), permission)).toBe(false);
    });
});

describe('admin role matrix - separation of duties on money', () => {
    const MONEY_MOVING = ['finance:write', 'payouts:process', 'wallets:adjust'];

    it.each(MONEY_MOVING)('ADMIN cannot %s', (permission) => {
        expect(hasAdminPermission(user('ADMIN'), permission)).toBe(false);
    });

    it.each(MONEY_MOVING)('FINANCE can %s', (permission) => {
        expect(hasAdminPermission(user('FINANCE'), permission)).toBe(true);
    });

    it('ADMIN keeps read-only finance visibility', () => {
        expect(hasAdminPermission(user('ADMIN'), 'finance:read')).toBe(true);
        expect(hasAdminPermission(user('ADMIN'), 'payouts:read')).toBe(true);
    });
});

describe('admin role matrix - per-role scope', () => {
    it('SUPPORT works tickets and reads account context only', () => {
        expect(hasAdminPermission(user('SUPPORT'), 'tickets:reply')).toBe(true);
        expect(hasAdminPermission(user('SUPPORT'), 'users:read')).toBe(true);
        expect(hasAdminPermission(user('SUPPORT'), 'users:status')).toBe(false);
        expect(hasAdminPermission(user('SUPPORT'), 'finance:read')).toBe(false);
    });

    it('REVIEWER reviews releases and their media, but manages nobody', () => {
        expect(hasAdminPermission(user('REVIEWER'), 'releases:approve')).toBe(true);
        expect(hasAdminPermission(user('REVIEWER'), 'releases:media')).toBe(true);
        expect(hasAdminPermission(user('REVIEWER'), 'users:write')).toBe(false);
    });

    it('only ADMIN and FINANCE see the revenue dashboard', () => {
        expect(hasAdminPermission(user('ADMIN'), 'dashboard:read')).toBe(true);
        expect(hasAdminPermission(user('FINANCE'), 'dashboard:read')).toBe(true);
        expect(hasAdminPermission(user('SUPPORT'), 'dashboard:read')).toBe(false);
        expect(hasAdminPermission(user('REVIEWER'), 'dashboard:read')).toBe(false);
    });

    it('platform customers hold no admin permissions', () => {
        for (const role of ['ARTIST', 'LABEL'] as UserRole[]) {
            expect(ADMIN_ROLE_PERMISSIONS[role]).toEqual([]);
            expect(hasAdminPermission(user(role), 'releases:read')).toBe(false);
        }
    });
});

describe('panel access', () => {
    it.each(['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'REVIEWER', 'FINANCE'] as UserRole[])(
        '%s can open the admin panel',
        (role) => expect(canAccessAdminPanel(user(role))).toBe(true)
    );

    it.each(['ARTIST', 'LABEL'] as UserRole[])(
        '%s cannot open the admin panel',
        (role) => expect(canAccessAdminPanel(user(role))).toBe(false)
    );

    it('rejects a missing user', () => {
        expect(canAccessAdminPanel(null)).toBe(false);
        expect(hasAdminPermission(null, 'releases:read')).toBe(false);
    });
});

describe('per-user overrides', () => {
    it('grants a permission the role lacks', () => {
        expect(hasAdminPermission(user('SUPPORT', ['releases:read']), 'releases:read')).toBe(true);
    });

    it('supports namespace wildcards', () => {
        expect(hasAdminPermission(user('SUPPORT', ['releases:*']), 'releases:approve')).toBe(true);
    });
});
