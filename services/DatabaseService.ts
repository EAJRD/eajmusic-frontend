/**
 * DatabaseService.ts - Resilient Database Service with Automatic Failover
 * 
 * This service manages connections between the primary database (Proxmox PostgreSQL
 * via Cloudflare Tunnel) and the fallback database (Supabase). It automatically
 * switches to Supabase when the primary is unavailable and recovers when it's back.
 * 
 * Architecture:
 * - Primary: api.eajmusic.com (Proxmox via Cloudflare Tunnel)
 * - Fallback: Supabase (read-only, essential data only)
 * 
 * @module services/DatabaseService
 */

import { supabaseClient, UserLite, ReleaseLite, WalletLite } from './SupabaseClient';

export type ConnectionStatus = 'primary' | 'fallback' | 'offline';

export interface ConnectionStatusEvent {
    status: ConnectionStatus;
    previousStatus: ConnectionStatus;
    timestamp: Date;
    reason?: string;
}

type StatusListener = (event: ConnectionStatusEvent) => void;

class DatabaseService {
    private primaryUrl: string;
    private timeout: number;
    private healthCheckInterval: number;
    private currentStatus: ConnectionStatus = 'primary';
    private healthCheckTimer: ReturnType<typeof setInterval> | null = null;
    private listeners: Set<StatusListener> = new Set();
    private lastHealthCheck: Date = new Date();
    private consecutiveFailures: number = 0;
    private readonly MAX_FAILURES_BEFORE_FALLBACK = 2;

    constructor() {
        this.primaryUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        this.timeout = parseInt(import.meta.env.VITE_DB_TIMEOUT_MS || '3000', 10);
        this.healthCheckInterval = parseInt(import.meta.env.VITE_HEALTH_CHECK_INTERVAL_MS || '30000', 10);

        // Start health check loop
        this.startHealthCheck();
    }

    // ========================================
    // Status Management
    // ========================================

    /**
     * Get current connection status
     */
    getStatus(): ConnectionStatus {
        return this.currentStatus;
    }

    /**
     * Check if we're using the fallback database
     */
    isUsingFallback(): boolean {
        return this.currentStatus === 'fallback';
    }

    /**
     * Subscribe to status changes
     */
    onStatusChange(listener: StatusListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Update status and notify listeners
     */
    private setStatus(newStatus: ConnectionStatus, reason?: string): void {
        if (newStatus !== this.currentStatus) {
            const event: ConnectionStatusEvent = {
                status: newStatus,
                previousStatus: this.currentStatus,
                timestamp: new Date(),
                reason
            };

            console.log(`[DatabaseService] Status changed: ${this.currentStatus} → ${newStatus}`, reason || '');
            this.currentStatus = newStatus;

            // Notify all listeners
            this.listeners.forEach(listener => {
                try {
                    listener(event);
                } catch (error) {
                    console.error('[DatabaseService] Listener error:', error);
                }
            });
        }
    }

    // ========================================
    // Health Check
    // ========================================

    /**
     * Start periodic health checks
     */
    private startHealthCheck(): void {
        // Immediate first check
        this.performHealthCheck();

        // Periodic checks
        this.healthCheckTimer = setInterval(() => {
            this.performHealthCheck();
        }, this.healthCheckInterval);
    }

    /**
     * Stop health checks (for cleanup)
     */
    stopHealthCheck(): void {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
    }

    /**
     * Perform a health check on the primary database
     */
    private async performHealthCheck(): Promise<boolean> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(`${this.primaryUrl}/health`, {
                method: 'GET',
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });

            clearTimeout(timeoutId);
            this.lastHealthCheck = new Date();

            if (response.ok) {
                this.consecutiveFailures = 0;
                if (this.currentStatus !== 'primary') {
                    this.setStatus('primary', 'Primary database recovered');
                }
                return true;
            } else {
                throw new Error(`Health check failed: ${response.status}`);
            }
        } catch (error) {
            this.consecutiveFailures++;
            console.warn(`[DatabaseService] Health check failed (${this.consecutiveFailures}/${this.MAX_FAILURES_BEFORE_FALLBACK}):`, error);

            if (this.consecutiveFailures >= this.MAX_FAILURES_BEFORE_FALLBACK) {
                if (supabaseClient.isReady()) {
                    this.setStatus('fallback', 'Primary database unavailable, using Supabase');
                } else {
                    this.setStatus('offline', 'Primary database unavailable, Supabase not configured');
                }
            }
            return false;
        }
    }

    // ========================================
    // Request Methods with Failover
    // ========================================

    /**
     * Fetch with automatic timeout
     */
    private async fetchWithTimeout<T>(
        url: string,
        options?: RequestInit
    ): Promise<T> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Make a GET request to the primary API with fallback support
     */
    async get<T>(
        endpoint: string,
        options?: {
            headers?: Record<string, string>;
            fallbackFn?: () => Promise<T>;
        }
    ): Promise<T> {
        // Try primary first if online
        if (this.currentStatus === 'primary') {
            try {
                const headers = {
                    'Content-Type': 'application/json',
                    ...options?.headers
                };

                return await this.fetchWithTimeout<T>(
                    `${this.primaryUrl}${endpoint}`,
                    { method: 'GET', headers }
                );
            } catch (error) {
                console.warn(`[DatabaseService] Primary request failed for ${endpoint}:`, error);
                this.consecutiveFailures++;

                if (this.consecutiveFailures >= this.MAX_FAILURES_BEFORE_FALLBACK) {
                    this.setStatus('fallback', 'Request timeout, switching to Supabase');
                }
            }
        }

        // Try fallback if available
        if (options?.fallbackFn && supabaseClient.isReady()) {
            console.log(`[DatabaseService] Using fallback for ${endpoint}`);
            return await options.fallbackFn();
        }

        throw new Error(`Request failed and no fallback available for ${endpoint}`);
    }

    /**
     * Make a POST request (primary only - no writes to Supabase)
     */
    async post<T>(
        endpoint: string,
        body: unknown,
        options?: { headers?: Record<string, string> }
    ): Promise<T> {
        if (this.currentStatus !== 'primary') {
            throw new Error('Write operations are only available when connected to primary database');
        }

        const headers = {
            'Content-Type': 'application/json',
            ...options?.headers
        };

        return await this.fetchWithTimeout<T>(
            `${this.primaryUrl}${endpoint}`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            }
        );
    }

    // ========================================
    // Convenience Methods with Built-in Fallbacks
    // ========================================

    /**
     * Get session headers for authenticated requests.
     * Must match the token key AuthContext actually writes (JWT bearer auth),
     * not the old session-id scheme the deleted mock server used.
     */
    private getSessionHeaders(): Record<string, string> {
        const token = localStorage.getItem('eajmusic_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    /**
     * Get current user with fallback
     */
    async getCurrentUser(userId: string): Promise<UserLite | null> {
        return this.get<UserLite | null>('/auth/me', {
            headers: this.getSessionHeaders(),
            fallbackFn: async () => {
                return await supabaseClient.getUser(userId);
            }
        });
    }

    /**
     * Get user releases with fallback
     */
    async getUserReleases(userId: string): Promise<ReleaseLite[]> {
        return this.get<ReleaseLite[]>('/artist/releases', {
            headers: this.getSessionHeaders(),
            fallbackFn: async () => {
                return await supabaseClient.getUserReleases(userId);
            }
        });
    }

    /**
     * Get wallet with fallback
     */
    async getWallet(userId: string): Promise<WalletLite | null> {
        return this.get<WalletLite | null>('/artist/wallet', {
            headers: this.getSessionHeaders(),
            fallbackFn: async () => {
                return await supabaseClient.getWallet(userId);
            }
        });
    }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
