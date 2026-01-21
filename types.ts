export enum UserRole {
  ARTIST = 'ARTIST',
  ADMIN = 'ADMIN',
  VISITOR = 'VISITOR'
}

export interface Release {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  status: 'Draft' | 'Pending' | 'Live' | 'Rejected';
  date: string;
  streams: number;
  revenue: number;
}

export interface ArtistStats {
  totalStreams: number;
  totalRevenue: number;
  monthlyListeners: number;
  followers: number;
}

export interface AdminStats {
  totalUsers: number;
  activeReleases: number;
  pendingApprovals: number;
  totalPayouts: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status?: 'Active' | 'Suspended';
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