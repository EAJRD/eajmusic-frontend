/**
 * SupabaseClient.ts - Lightweight Supabase Client for Failover Operations
 * 
 * This client provides read-only access to essential data when the primary
 * Proxmox database is unavailable. It uses the Supabase REST API directly
 * without the heavy SDK to minimize bundle size.
 * 
 * @module services/SupabaseClient
 */

export interface SupabaseConfig {
    url: string;
    anonKey: string;
}

export interface UserLite {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url: string | null;
    status: string;
}

export interface ReleaseLite {
    id: string;
    user_id: string;
    title: string;
    cover_art_url: string | null;
    status: string;
    release_date: string;
    artist_name?: string;
}

export interface WalletLite {
    user_id: string;
    available_balance: number;
    pending_balance: number;
    currency: string;
}

export interface AnnouncementLite {
    id: string;
    title: string;
    content: string;
    type: string;
    is_active: boolean;
}

type SupabaseTable = 'users_lite' | 'releases_lite' | 'wallet_lite' | 'announcements_lite';

class SupabaseClient {
    private url: string;
    private anonKey: string;
    private isConfigured: boolean = false;

    constructor() {
        this.url = import.meta.env.VITE_SUPABASE_URL || '';
        this.anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        this.isConfigured = !!(this.url && this.anonKey && this.anonKey !== 'your-anon-key-here');
    }

    /**
     * Check if Supabase is properly configured
     */
    isReady(): boolean {
        return this.isConfigured;
    }

    /**
     * Build headers for Supabase REST API requests
     */
    private getHeaders(): Record<string, string> {
        return {
            'apikey': this.anonKey,
            'Authorization': `Bearer ${this.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    /**
     * Generic query method for Supabase REST API
     */
    async query<T>(
        table: SupabaseTable,
        options?: {
            select?: string;
            filter?: Record<string, string>;
            limit?: number;
            order?: { column: string; ascending?: boolean };
        }
    ): Promise<T[]> {
        if (!this.isConfigured) {
            console.warn('[SupabaseClient] Not configured. Returning empty array.');
            return [];
        }

        try {
            let queryUrl = `${this.url}/rest/v1/${table}`;
            const params = new URLSearchParams();

            if (options?.select) {
                params.append('select', options.select);
            }

            if (options?.filter) {
                Object.entries(options.filter).forEach(([key, value]) => {
                    params.append(key, `eq.${value}`);
                });
            }

            if (options?.limit) {
                params.append('limit', options.limit.toString());
            }

            if (options?.order) {
                const direction = options.order.ascending ? 'asc' : 'desc';
                params.append('order', `${options.order.column}.${direction}`);
            }

            const queryString = params.toString();
            if (queryString) {
                queryUrl += `?${queryString}`;
            }

            const response = await fetch(queryUrl, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Supabase query failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[SupabaseClient] Query error:', error);
            return [];
        }
    }

    // ========================================
    // Typed Query Methods for Each Table
    // ========================================

    /**
     * Get user by ID (lite version - no sensitive data)
     */
    async getUser(userId: string): Promise<UserLite | null> {
        const users = await this.query<UserLite>('users_lite', {
            filter: { id: userId },
            limit: 1
        });
        return users[0] || null;
    }

    /**
     * Get releases for a user (lite version)
     */
    async getUserReleases(userId: string, limit = 10): Promise<ReleaseLite[]> {
        return this.query<ReleaseLite>('releases_lite', {
            filter: { user_id: userId },
            limit,
            order: { column: 'release_date', ascending: false }
        });
    }

    /**
     * Get all live releases (for public pages)
     */
    async getLiveReleases(limit = 20): Promise<ReleaseLite[]> {
        return this.query<ReleaseLite>('releases_lite', {
            filter: { status: 'LIVE' },
            limit,
            order: { column: 'release_date', ascending: false }
        });
    }

    /**
     * Get wallet balance for a user (lite version)
     */
    async getWallet(userId: string): Promise<WalletLite | null> {
        const wallets = await this.query<WalletLite>('wallet_lite', {
            filter: { user_id: userId },
            limit: 1
        });
        return wallets[0] || null;
    }

    /**
     * Get active announcements
     */
    async getActiveAnnouncements(): Promise<AnnouncementLite[]> {
        return this.query<AnnouncementLite>('announcements_lite', {
            filter: { is_active: 'true' },
            order: { column: 'id', ascending: false }
        });
    }
}

// Export singleton instance
export const supabaseClient = new SupabaseClient();
export default supabaseClient;
