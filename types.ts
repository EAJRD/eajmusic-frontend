// ==========================
// ENUMS
// ==========================
export enum UserRole {
  ARTIST = 'ARTIST',
  LABEL = 'LABEL',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  VISITOR = 'VISITOR'
}

export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  LABEL_PLUS = 'LABEL_PLUS',
  ENTERPRISE = 'ENTERPRISE'
}

export enum PaymentProvider {
  ATH_MOVIL = 'ATH_MOVIL',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  STRIPE = 'STRIPE',
  WISE = 'WISE'
}

// ==========================
// CORE MODELS
// ==========================
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';
  avatar: string;
  avatarUrl?: string;
  phone?: string;
  countryCode?: string;
  createdAt?: string;
  lastLoginAt?: string;
  subscription?: Subscription;
  wallet?: WalletSummary;
}

export interface Subscription {
  plan: PlanType;
  commissionRate: number;
  maxArtistProfiles: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface Release {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  coverArtUrl?: string;
  status: 'Draft' | 'Pending' | 'Live' | 'Rejected' | 'DRAFT' | 'PENDING' | 'LIVE' | 'REJECTED' | 'TAKEDOWN';
  date: string;
  releaseDate?: string;
  releaseType?: 'SINGLE' | 'EP' | 'ALBUM' | 'COMPILATION';
  genre?: string;
  upc?: string;
  streams: number;
  revenue: number;
  tracks?: Track[];
  artistProfile?: { id: string; name: string; avatarUrl?: string };
  submittedAt?: string;
  rejectionReason?: string;
  cLineText?: string;
  cLineYear?: number;
  pLineText?: string;
  pLineYear?: number;
  selectedStores?: string[];
  territories?: string[];
  language?: string;
}

export interface Track {
  id: string;
  title: string;
  trackNumber: number;
  durationMs?: number;
  isrc?: string;
  isExplicit: boolean;
  status: 'PROCESSING' | 'READY' | 'ERROR';
  lyrics?: string;
}

// ==========================
// FINANCIAL
// ==========================
export interface WalletSummary {
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  currency?: string;
  minPayoutThreshold?: number;
}

export interface Transaction {
  id: string;
  type: 'royalty' | 'payout';
  description: string;
  source?: string;
  method?: string;
  amount: number;
  date: string;
  status: string;
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  methodDetails?: Record<string, unknown>;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processedAt?: string;
  transactionId?: string;
  failureReason?: string;
  requestedAt: string;
  user?: { id: string; name: string; email: string };
}

export interface PaymentMethod {
  id: string;
  provider: PaymentProvider;
  label: string;
  details: Record<string, string>;
  isDefault: boolean;
  isActive: boolean;
  addedAt: string;
}

// ==========================
// ANALYTICS
// ==========================
export interface ArtistStats {
  totalStreams: number;
  totalRevenue: number;
  monthlyListeners: number;
  followers: number;
  availableBalance?: number;
  pendingBalance?: number;
}

export interface DailyStat {
  date: string;
  _sum: {
    streams: number;
    saves: number;
    playlistAdds: number;
    revenueNet: number;
  };
}

export interface TopTrack {
  trackId: string;
  _sum: { streams: number; revenueNet: number };
  track: {
    title: string;
    release: { title: string; coverArtUrl?: string };
  };
}

// ==========================
// ADMIN
// ==========================
export interface AdminStats {
  totalUsers: number;
  activeReleases: number;
  pendingApprovals: number;
  totalRevenue: number;
  newUsersToday: number;
  pendingPayouts: number;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: { id: string; name: string; email: string; avatarUrl?: string };
}

export interface FinanceOverview {
  totalRevenue: number;
  totalCommissions: number;
  totalPayoutsAmount: number;
  pendingPayoutsAmount: number;
  pendingPayoutsCount: number;
  completedPayoutsCount: number;
  monthlyRevenue: { month: string; revenue: number; commission: number }[];
}

// ==========================
// SUPPORT
// ==========================
export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  category?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  userId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  user?: { name: string; avatarUrl?: string };
}

export interface Report {
  id: string;
  type: 'STATS' | 'WALLET';
  title: string;
  date: string;
  downloadUrl: string;
  createdAt: string;
}

export interface TakedownRequest {
  id: string;
  releaseId: string;
  reason: string;
  requester: string;
  date: string;
  status: 'Pending' | 'Resolved';
}

// ==========================
// ATH MÓVIL
// ==========================
export interface ATHMovilConfig {
  enabled: boolean;
  configured: boolean;
}

export interface PaymentTransaction {
  id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  type: string;
  createdAt: string;
  completedAt?: string;
}