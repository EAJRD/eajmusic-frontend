import React, { useState, useEffect } from 'react';
import { databaseService, ConnectionStatus, ConnectionStatusEvent } from '../services/DatabaseService';

interface ConnectionStatusBadgeProps {
    /** Position of the badge on screen */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /** Show detailed status text */
    showText?: boolean;
    /** Custom class names */
    className?: string;
}

const statusConfig: Record<ConnectionStatus, {
    color: string;
    bgColor: string;
    glowColor: string;
    icon: string;
    text: string;
    tooltip: string;
}> = {
    primary: {
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        glowColor: 'shadow-emerald-500/30',
        icon: 'cloud_done',
        text: 'Connected',
        tooltip: 'Connected to primary server'
    },
    fallback: {
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        glowColor: 'shadow-amber-500/30',
        icon: 'cloud_sync',
        text: 'Limited Mode',
        tooltip: 'Using backup server - Some features may be unavailable'
    },
    offline: {
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10',
        glowColor: 'shadow-rose-500/30',
        icon: 'cloud_off',
        text: 'Offline',
        tooltip: 'Unable to connect - Using cached data'
    }
};

const positionClasses: Record<NonNullable<ConnectionStatusBadgeProps['position']>, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
};

/**
 * ConnectionStatusBadge - Visual indicator of database connection status
 * 
 * Shows the current connection status:
 * - 🟢 Primary: Connected to Proxmox PostgreSQL via Cloudflare Tunnel
 * - 🟡 Fallback: Using Supabase backup (read-only, limited features)
 * - 🔴 Offline: No connection, using cached data only
 */
const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({
    position = 'bottom-right',
    showText = true,
    className = ''
}) => {
    const [status, setStatus] = useState<ConnectionStatus>(() => databaseService.getStatus());
    const [isAnimating, setIsAnimating] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        const unsubscribe = databaseService.onStatusChange((event: ConnectionStatusEvent) => {
            setIsAnimating(true);
            setStatus(event.status);

            // Remove animation class after animation completes
            setTimeout(() => setIsAnimating(false), 500);
        });

        return () => unsubscribe();
    }, []);

    const config = statusConfig[status];

    return (
        <div
            className={`fixed ${positionClasses[position]} z-50 ${className}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Tooltip */}
            {showTooltip && (
                <div className={`
          absolute bottom-full mb-2 right-0
          px-3 py-2 rounded-lg
          bg-slate-900 dark:bg-slate-800
          text-white text-xs font-medium
          whitespace-nowrap
          shadow-xl
          animate-fade-in
        `}>
                    {config.tooltip}
                    <div className="absolute top-full right-4 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
                </div>
            )}

            {/* Badge */}
            <div
                className={`
          flex items-center gap-2
          px-3 py-2 rounded-full
          ${config.bgColor}
          border border-current/20
          backdrop-blur-sm
          shadow-lg ${config.glowColor}
          transition-all duration-300
          cursor-default
          ${isAnimating ? 'scale-110' : 'scale-100'}
        `}
            >
                {/* Pulsing dot indicator */}
                <div className="relative">
                    <span className={`material-symbols-outlined text-lg ${config.color}`}>
                        {config.icon}
                    </span>
                    {status === 'primary' && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    )}
                </div>

                {/* Status text */}
                {showText && (
                    <span className={`text-xs font-bold ${config.color}`}>
                        {config.text}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ConnectionStatusBadge;
