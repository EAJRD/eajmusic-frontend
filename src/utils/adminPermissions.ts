import type { User, UserRole } from '../types/api';

// Mirror of eajmusic-api's src/middleware/rbac.js ROLE_PERMISSIONS.
//
// This is a UI-layer convenience only: it decides which nav items and panels
// to render, never what is actually allowed. Every route behind these tabs
// re-checks the same permission server-side via requirePermission(), so a
// user who forces a tab open still gets a 403 from the API. Keep this table
// in sync with the backend - adminPermissions.test.ts pins the shape, but
// nothing can automatically detect a backend change, so update both together.
//
// The two boundaries that matter (and the reason this file exists):
//   - settings / employees / audit are SUPER_ADMIN only
//   - moving money (wallets:adjust, payouts:process, finance:write) is
//     FINANCE only, never ADMIN
export const ADMIN_ROLE_PERMISSIONS: Record<string, string[]> = {
    SUPER_ADMIN: ['*'],
    ADMIN: [
        'dashboard:read',
        'users:read',
        'users:write',
        'users:status',
        'releases:read',
        'releases:approve',
        'releases:reject',
        'releases:media',
        'takedowns:read',
        'takedowns:execute',
        'tickets:*',
        'announcements:manage',
        'testimonials:moderate',
        'contributors:approve',
        'finance:read',
        'payouts:read',
    ],
    REVIEWER: [
        'releases:read',
        'releases:approve',
        'releases:reject',
        'releases:media',
        'users:read',
    ],
    SUPPORT: [
        'tickets:*',
        'users:read',
    ],
    FINANCE: [
        'dashboard:read',
        'finance:read',
        'finance:write',
        'payouts:read',
        'payouts:process',
        'wallets:read',
        'wallets:adjust',
        'royalties:read',
        'royalties:hold',
        'royalties:release',
        'reversals:request',
        'reversals:approve',
        'users:read',
    ],
    ARTIST: [],
    LABEL: [],
};

/**
 * Whether `user` holds `permission`, checking their per-user overrides first
 * (User.permissions, which a SUPER_ADMIN can set to grant one employee extra
 * capabilities) and then the role defaults above - same order as the
 * backend's userHasPermission().
 */
export function hasAdminPermission(user: User | null | undefined, permission: string): boolean {
    if (!user) return false;

    const namespace = permission.split(':')[0];
    const matches = (perms: string[]) =>
        perms.includes('*') || perms.includes(permission) || perms.includes(`${namespace}:*`);

    const overrides = Array.isArray(user.permissions) ? user.permissions : [];
    if (matches(overrides)) return true;

    return matches(ADMIN_ROLE_PERMISSIONS[user.role] || []);
}

/** Roles that can open the admin panel at all (eaj.eajmusic.com). */
const ADMIN_PANEL_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'REVIEWER', 'FINANCE'];

export function canAccessAdminPanel(user: User | null | undefined): boolean {
    return !!user && ADMIN_PANEL_ROLES.includes(user.role);
}
