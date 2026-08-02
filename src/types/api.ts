// Employee roles (SUPPORT/REVIEWER/FINANCE/ADMIN) only ever operate inside
// the internal admin panel (eaj.eajmusic.com) — see Prisma's UserRole enum.
export type UserRole = 'ARTIST' | 'LABEL' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT' | 'REVIEWER' | 'FINANCE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
  avatarUrl: string | null;
  emailVerified?: boolean;
  onboardingCompletedAt?: string | null;
  permissions?: string[] | null;
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
  // Client-generated, sent only on POST /artist/releases - lets a retried
  // submit (double-click, network blip) return the already-created release
  // instead of creating a duplicate DRAFT. See NewRelease.tsx.
  idempotencyKey?: string;
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

export type ContributorRole =
  | 'PRIMARY_ARTIST'
  | 'FEATURED'
  | 'PRODUCER'
  | 'CO_PRODUCER'
  | 'SONGWRITER'
  | 'COMPOSER'
  | 'LYRICIST'
  | 'MIXER'
  | 'MASTERING';

// Request-side shapes for POST/PATCH /artist/releases - distinct from the
// Release/Track response types above, which describe server-computed fields
// (id, status, audioUrl, durationMs) that don't exist yet at submit time.
// See eajmusic-api's src/validators/release.js (createReleaseSchema).
export interface CreateReleaseTrackInput {
  title: string;
  version?: string | null;
  trackNumber: number;
  discNumber?: number;
  isrc?: string | null;
  isExplicit?: boolean;
  lyrics?: string | null;
  lyricsLanguage?: string | null;
  audioKey?: string | null;
  contributors?: Array<{
    name: string;
    role: ContributorRole;
    royaltyPercentage?: number;
    ipiNumber?: string | null;
  }>;
}

export interface CreateReleaseInput {
  title: string;
  version?: string | null;
  releaseType: 'SINGLE' | 'EP' | 'ALBUM' | 'COMPILATION';
  genre: string;
  subgenre?: string | null;
  language?: string;
  releaseDate: string;
  originalReleaseDate?: string | null;
  upc?: string | null;
  catalogNumber?: string | null;
  cLineYear?: number | null;
  cLineText?: string | null;
  pLineYear?: number | null;
  pLineText?: string | null;
  isExplicit?: boolean;
  selectedStores?: string[];
  territories?: string[];
  coverArtKey?: string | null;
  tracks: CreateReleaseTrackInput[];
  artistProfileId?: string | null;
  labelId?: string | null;
  idempotencyKey?: string | null;
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
  availableBalance: number;
  pendingBalance: number;
  monthlyListeners: number;
  followers: number;
}

export interface AdminStats {
  totalUsers: number;
  totalArtists: number;
  totalReleases: number;
  pendingReleases: number;
  revenueTotal: number;
  activeSubscriptions: number;
}

export interface SupportTicketMessage {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  user?: { id: string; name: string; avatarUrl: string | null; role: string };
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string; avatarUrl: string | null };
  assignee?: { id: string; name: string } | null;
  messages?: SupportTicketMessage[];
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
  targetAudience?: string;
  isActive: boolean;
  startsAt?: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  artistId: string;
  quote: string;
  photoUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt: string | null;
  reviewedById: string | null;
  artistProfile?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  reviewedBy?: {
    id: string;
    name: string;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
