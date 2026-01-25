import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// --- DATABASE SIMULATED ---
let releases = [
    { id: 'rel_1', title: 'Neon Nights', artist: 'Cyber Dreamer', artistId: '1', coverUrl: 'https://picsum.photos/200/200?random=1', status: 'Live', date: '2023-10-15', streams: 125000, revenue: 450.25 },
    { id: 'rel_2', title: 'Acoustic Soul', artist: 'Jane Doe', artistId: '3', coverUrl: 'https://picsum.photos/200/200?random=2', status: 'Pending', date: '2023-10-22', streams: 0, revenue: 0 },
    { id: 'rel_3', title: 'Bass Drop Protocol', artist: 'DJ Hz', artistId: '4', coverUrl: 'https://picsum.photos/200/200?random=3', status: 'Draft', date: '2023-10-25', streams: 0, revenue: 0 },
    { id: 'rel_4', title: 'Summer Vibes', artist: 'Cyber Dreamer', artistId: '1', coverUrl: 'https://picsum.photos/200/200?random=4', status: 'Live', date: '2023-09-01', streams: 98000, revenue: 320.50 }
];

let users = [
    { id: '1', name: 'Cyber Dreamer', email: 'artist@eajmusic.com', password: 'artist123', role: 'ARTIST', avatar: 'https://picsum.photos/50/50?random=10', status: 'Active', plan: 'Pro' },
    { id: '2', name: 'Super Admin', email: 'admin@eajmusic.com', password: 'admin123', role: 'ADMIN', avatar: 'https://picsum.photos/50/50?random=11', status: 'Active', plan: 'Admin' },
    { id: '3', name: 'Jane Doe', email: 'jane@example.com', password: 'jane123', role: 'ARTIST', avatar: 'https://picsum.photos/50/50?random=12', status: 'Active', plan: 'Free' },
    { id: '4', name: 'DJ Hz', email: 'dj@example.com', password: 'dj123', role: 'ARTIST', avatar: 'https://picsum.photos/50/50?random=13', status: 'Active', plan: 'Pro' }
];

// Session storage (in production use JWT or proper session management)
let sessions = {};

let takedowns = [
    { id: 't1', releaseId: 'rel_1', reason: 'Copyright Claim', requester: 'Sony Music', date: '2023-10-20', status: 'Pending' }
];

// NEW: Plans & Commissions Data
let plans = {
    free: { priceMonthly: 0, priceYearly: 0, commission: 15, maxArtists: 1 },
    pro: { priceMonthly: 14.99, priceYearly: 149.00, commission: 0, maxArtists: 5 },
    label: { priceMonthly: 49.99, priceYearly: 499.00, commission: 5, maxArtists: 999 }
};

// NEW: Announcements Data
let announcements = [
    { id: 'a1', title: 'Maintenance Update', content: 'System maintenance scheduled for...', type: 'info', audience: 'all', date: '2023-10-24', status: 'Sent', openRate: 68 }
];

// NEW: Support Tickets Data
let tickets = [
    { id: 'TK-9021', user: 'Luna Echo', userId: 'LE', subject: 'Payment Issue - Premium Payout', priority: 'URGENT', status: 'Open', lastActive: '12m ago', messages: [] },
    { id: 'TK-8842', user: 'Vibe Master', userId: 'VM', subject: "Metadata Error on 'Neon Dreams'", priority: 'MEDIUM', status: 'Active', lastActive: '2h ago', messages: [] }
];

// NEW: Brand Settings Data
let brandSettings = {
    primaryColor: '#2563EB',
    secondaryColor: '#4F46E5',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    logoUrl: null
};

// --- ROUTES ---

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// AUTH ROUTES
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sessionId = `session_${Math.random().toString(36).substr(2, 9)}`;
    sessions[sessionId] = { userId: user.id, createdAt: new Date() };

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword, sessionId });
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser = {
        id: `${users.length + 1}`,
        name,
        email,
        password,
        role: 'ARTIST',
        avatar: `https://picsum.photos/50/50?random=${users.length + 10}`,
        status: 'Active',
        plan: 'Free'
    };

    users.push(newUser);

    const sessionId = `session_${Math.random().toString(36).substr(2, 9)}`;
    sessions[sessionId] = { userId: newUser.id, createdAt: new Date() };

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ success: true, user: userWithoutPassword, sessionId });
});

app.post('/api/auth/logout', (req, res) => {
    const { sessionId } = req.body;
    delete sessions[sessionId];
    res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
    const sessionId = req.headers['x-session-id'];
    const session = sessions[sessionId];

    if (!session) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = users.find(u => u.id === session.userId);
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
});

// ARTIST ROUTES
app.get('/api/artist/stats', (req, res) => {
    res.json({
        totalStreams: 975000,
        totalRevenue: 3650.75,
        monthlyListeners: 45000,
        followers: 1200
    });
});

app.get('/api/artist/releases', (req, res) => {
    // In production, filter by authenticated user
    const sessionId = req.headers['x-session-id'];
    const session = sessions[sessionId];

    if (session) {
        const user = users.find(u => u.id === session.userId);
        if (user) {
            return res.json(releases.filter(r => r.artistId === user.id));
        }
    }
    // Default fallback for demo
    res.json(releases.filter(r => r.artist === 'Cyber Dreamer'));
});

// Get all releases (for admin)
app.get('/api/admin/releases', (req, res) => {
    res.json(releases);
});

app.post('/api/artist/releases', (req, res) => {
    const newRelease = {
        ...req.body,
        id: `rel_${Math.random().toString(36).substr(2, 9)}`,
        status: 'Pending',
        streams: 0,
        revenue: 0,
        date: new Date().toISOString().split('T')[0]
    };
    releases.push(newRelease);
    res.status(201).json(newRelease);
});

// NEW: Artist Analytics
app.get('/api/artist/analytics/tracks', (req, res) => {
    // Mock analytics data
    res.json({
        timeRange: '7d',
        totalStreams: 842500,
        revenue: 3240.50,
        topTracks: [
            { id: 1, title: 'Neon Nights', streams: 145000 },
            { id: 2, title: 'Summer Vibes', streams: 98000 }
        ]
    });
});

// ADMIN ROUTES
app.get('/api/admin/stats', (req, res) => {
    res.json({
        totalUsers: users.length,
        activeReleases: releases.filter(r => r.status === 'Live').length,
        pendingApprovals: releases.filter(r => r.status === 'Pending').length,
        totalPayouts: 125000
    });
});

app.get('/api/admin/pending', (req, res) => {
    res.json(releases.filter(r => r.status === 'Pending'));
});

app.get('/api/admin/users', (req, res) => res.json(users));

app.post('/api/admin/approve/:id', (req, res) => {
    releases = releases.map(r => r.id === req.params.id ? { ...r, status: 'Live' } : r);
    res.json({ success: true });
});

app.post('/api/admin/reject/:id', (req, res) => {
    releases = releases.map(r => r.id === req.params.id ? { ...r, status: 'Rejected' } : r);
    res.json({ success: true });
});

app.post('/api/admin/user/status/:id', (req, res) => {
    const { status } = req.body;
    users = users.map(u => u.id === req.params.id ? { ...u, status } : u);
    res.json({ success: true });
});

app.get('/api/admin/takedowns', (req, res) => res.json(takedowns));

app.post('/api/admin/takedowns/:id/resolve', (req, res) => {
    const { action } = req.body; // 'delete' or 'dismiss'
    const takedown = takedowns.find(t => t.id === req.params.id);

    if (takedown && action === 'delete') {
        releases = releases.filter(r => r.id !== takedown.releaseId);
    }

    takedowns = takedowns.filter(t => t.id !== req.params.id);
    res.json({ success: true });
});

// NEW: Plans Endpoints
app.get('/api/admin/plans', (req, res) => res.json(plans));
app.post('/api/admin/plans', (req, res) => {
    plans = { ...plans, ...req.body };
    res.json({ success: true, plans });
});

// NEW: Announcements Endpoints
app.get('/api/admin/announcements', (req, res) => res.json(announcements));
app.post('/api/admin/announcements', (req, res) => {
    const newAnnouncement = { ...req.body, id: `a${Date.now()}`, status: 'Sent', date: new Date().toISOString().split('T')[0] };
    announcements.push(newAnnouncement);
    res.json({ success: true, announcement: newAnnouncement });
});

// NEW: Tickets Endpoints
app.get('/api/admin/tickets', (req, res) => res.json(tickets));
app.get('/api/admin/tickets/:id', (req, res) => {
    const ticket = tickets.find(t => t.id === req.params.id);
    res.json(ticket || { error: 'Not found' });
});
app.post('/api/admin/tickets/:id/reply', (req, res) => {
    // Mock reply logic
    res.json({ success: true });
});

// NEW: Brand Settings Endpoints
app.get('/api/admin/brand', (req, res) => res.json(brandSettings));
app.post('/api/admin/brand', (req, res) => {
    brandSettings = { ...brandSettings, ...req.body };
    res.json({ success: true, brandSettings });
});

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});

