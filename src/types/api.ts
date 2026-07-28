export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ARTIST' | 'LABEL' | 'ADMIN' | 'SUPER_ADMIN';
  status: string;
  avatarUrl: string | null;
  subscription?: {
    plan: string;
    commissionRate: number;
    isActive: boolean;
    expiresAt: string | null;
  };
  artistProfiles?: Array<{
    id: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  }>;
  wallet?: {
    availableBalance: number;
    pendingBalance: number;
    lifetimeEarnings: number;
  };
}

export interface AuthResponse {
  success?: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  error?: string;
  message?: string;
}

export interface Release {
  id: string;
  title: string;
  releaseType: 'SINGLE' | 'EP' | 'ALBUM' | 'COMPILATION';
  genre: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'LIVE' | 'REJECTED' | 'TAKEDOWN';
  coverArtUrl: string | null;
  releaseDate: string;
  artistName?: string;
  tracks?: Track[];
  createdAt: string;
}

export interface Track {
  id: string;
  title: string;
  trackNumber: number;
  durationMs: number | null;
  status: 'PROCESSING' | 'READY' | 'ERROR';
  isrc: string | null;
  audioUrl: string | null;
}

export interface Wallet {
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  currency: string;
  minPayoutThreshold: number;
}

export interface ArtistStats {
  totalReleases: number;
  totalStreams: number;
  totalEarnings: number;
  monthlyGrowth: number;
  activeTracks: number;
}

export interface AdminStats {
  totalUsers: number;
  totalArtists: number;
  totalReleases: number;
  pendingReleases: number;
  revenueTotal: number;
  activeSubscriptions: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  requestedAt: string;
  processedAt: string | null;
  transactionId: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
