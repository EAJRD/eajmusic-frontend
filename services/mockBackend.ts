import { Release, ArtistStats, AdminStats, User, UserRole, Report, TakedownRequest } from '../types';

const MOCK_RELEASES: Release[] = [
  {
    id: 'rel_1',
    title: 'Neon Nights',
    artist: 'Cyber Dreamer',
    coverUrl: 'https://picsum.photos/200/200?random=1',
    status: 'Live',
    date: '2023-10-15',
    streams: 125000,
    revenue: 450.25
  },
  {
    id: 'rel_2',
    title: 'Acoustic Soul',
    artist: 'Jane Doe',
    coverUrl: 'https://picsum.photos/200/200?random=2',
    status: 'Pending',
    date: '2023-10-22',
    streams: 0,
    revenue: 0
  },
  {
    id: 'rel_3',
    title: 'Bass Drop Protocol',
    artist: 'DJ Hz',
    coverUrl: 'https://picsum.photos/200/200?random=3',
    status: 'Draft',
    date: '2023-10-25',
    streams: 0,
    revenue: 0
  },
  {
    id: 'rel_4',
    title: 'Midnight Rain',
    artist: 'Cyber Dreamer',
    coverUrl: 'https://picsum.photos/200/200?random=4',
    status: 'Live',
    date: '2023-09-01',
    streams: 850000,
    revenue: 3200.50
  }
];

const MOCK_USERS: User[] = [
  { id: '1', name: 'Cyber Dreamer', email: 'artist@eajmusic.com', role: UserRole.ARTIST, avatar: 'https://picsum.photos/50/50?random=10', status: 'Active' },
  { id: '2', name: 'Admin One', email: 'admin@eajmusic.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/50/50?random=11', status: 'Active' },
  { id: '3', name: 'Jane Doe', email: 'jane@example.com', role: UserRole.ARTIST, avatar: 'https://picsum.photos/50/50?random=12', status: 'Active' },
  { id: '4', name: 'DJ Hz', email: 'djhz@example.com', role: UserRole.ARTIST, avatar: 'https://picsum.photos/50/50?random=13', status: 'Suspended' }
];

const MOCK_REPORTS: Report[] = [
  { id: 'r1', type: 'WALLET', title: 'October 2023 Payout', date: 'Oct 2023', downloadUrl: '#', createdAt: '2023-11-01' },
  { id: 'r2', type: 'STATS', title: 'Q3 Performance Report', date: 'Q3 2023', downloadUrl: '#', createdAt: '2023-10-15' },
  { id: 'r3', type: 'WALLET', title: 'September 2023 Payout', date: 'Sep 2023', downloadUrl: '#', createdAt: '2023-10-01' },
];

const MOCK_TAKEDOWNS: TakedownRequest[] = [
  { id: 't1', releaseId: 'rel_1', reason: 'Copyright Infringement Claim', requester: 'Universal Music Group', date: '2023-10-20', status: 'Pending' }
];

export const ArtistService = {
  getStats: async (): Promise<ArtistStats> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        totalStreams: 975000,
        totalRevenue: 3650.75,
        monthlyListeners: 45000,
        followers: 1200
      }), 500);
    });
  },
  getReleases: async (): Promise<Release[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_RELEASES.filter(r => r.artist === 'Cyber Dreamer')), 600));
  },
  getReports: async (): Promise<Report[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_REPORTS), 400));
  }
};

export const AdminService = {
  getStats: async (): Promise<AdminStats> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        totalUsers: 15420,
        activeReleases: 4500,
        pendingApprovals: 23,
        totalPayouts: 125000
      }), 500);
    });
  },
  getPendingReleases: async (): Promise<Release[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_RELEASES.filter(r => r.status === 'Pending')), 600);
    });
  },
  getAllUsers: async (): Promise<User[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_USERS), 400));
  },
  getTakedowns: async (): Promise<TakedownRequest[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_TAKEDOWNS), 400));
  }
};