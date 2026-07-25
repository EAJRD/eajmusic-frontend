import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, isArtist } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { createReleaseSchema, updateReleaseSchema, submitReleaseSchema } from '../validators/release.js';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication and artist role
router.use(authenticate);
router.use(isArtist);

// ===========================================
// STATS & DASHBOARD
// ===========================================
router.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's releases
  const releases = await prisma.release.findMany({
    where: { userId },
    include: {
      tracks: {
        include: {
          streamingStats: true,
        },
      },
    },
  });

  // Calculate totals
  let totalStreams = 0;
  let totalRevenue = 0;

  for (const release of releases) {
    for (const track of release.tracks) {
      for (const stat of track.streamingStats) {
        totalStreams += Number(stat.streams);
        totalRevenue += Number(stat.revenueNet);
      }
    }
  }

  // Get wallet info
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  // Get monthly listeners (simplified - in production would be more complex)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentStats = await prisma.streamingStat.aggregate({
    where: {
      track: { release: { userId } },
      date: { gte: thirtyDaysAgo },
    },
    _sum: { streams: true },
  });

  res.json({
    totalStreams,
    totalRevenue: wallet?.lifetimeEarnings || 0,
    availableBalance: wallet?.availableBalance || 0,
    pendingBalance: wallet?.pendingBalance || 0,
    monthlyListeners: Math.floor(Number(recentStats._sum.streams || 0) / 10),
    followers: 0, // TODO: Implement real follower tracking
  });
}));

// ===========================================
// RELEASES
// ===========================================

// Get all releases for current user
router.get('/releases', asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const where = {
    userId: req.user.id,
    ...(status && { status }),
  };

  const [releases, total] = await Promise.all([
    prisma.release.findMany({
      where,
      include: {
        tracks: {
          select: {
            id: true,
            title: true,
            trackNumber: true,
            durationMs: true,
            isrc: true,
            status: true,
          },
          orderBy: { trackNumber: 'asc' },
        },
        artistProfile: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.release.count({ where }),
  ]);

  res.json({
    releases,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

// Get single release
router.get('/releases/:id', asyncHandler(async (req, res) => {
  const release = await prisma.release.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    include: {
      tracks: {
        include: {
          contributors: true,
        },
        orderBy: { trackNumber: 'asc' },
      },
      artistProfile: true,
      label: true,
    },
  });

  if (!release) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Release not found',
    });
  }

  res.json({ release });
}));

// Create new release
router.post('/releases', validate(createReleaseSchema), asyncHandler(async (req, res) => {
  const {
    title, version, releaseType, genre, subgenre, language,
    releaseDate, originalReleaseDate, upc, catalogNumber,
    cLineYear, cLineText, pLineYear, pLineText,
    isExplicit, selectedStores, territories, coverArtKey,
    tracks, artistProfileId, labelId,
  } = req.body;

  // Verify artist profile belongs to user
  if (artistProfileId) {
    const profile = await prisma.artistProfile.findFirst({
      where: { id: artistProfileId, userId: req.user.id },
    });
    if (!profile) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid artist profile',
      });
    }
  }

  // Check subscription limits
  const subscription = await prisma.subscription.findUnique({
    where: { userId: req.user.id },
  });

  // Create release with tracks
  const release = await prisma.release.create({
    data: {
      userId: req.user.id,
      artistProfileId,
      labelId,
      title,
      version,
      releaseType,
      genre,
      subgenre,
      language,
      releaseDate: new Date(releaseDate),
      originalReleaseDate: originalReleaseDate ? new Date(originalReleaseDate) : null,
      upc,
      catalogNumber,
      cLineYear,
      cLineText,
      pLineYear,
      pLineText,
      isExplicit,
      selectedStores,
      territories,
      coverArtKey,
      status: 'DRAFT',
      tracks: {
        create: tracks.map((track, index) => ({
          title: track.title,
          version: track.version,
          trackNumber: track.trackNumber || index + 1,
          discNumber: track.discNumber || 1,
          isrc: track.isrc,
          isExplicit: track.isExplicit || false,
          lyrics: track.lyrics,
          lyricsLanguage: track.lyricsLanguage,
          audioKey: track.audioKey,
          status: 'PROCESSING',
        })),
      },
    },
    include: {
      tracks: true,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'RELEASE_CREATED',
      entityType: 'Release',
      entityId: release.id,
      newValues: { title, releaseType, trackCount: tracks.length },
      ipAddress: req.ip,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Release created successfully',
    release,
  });
}));

// Update release
router.patch('/releases/:id', validate(updateReleaseSchema), asyncHandler(async (req, res) => {
  const release = await prisma.release.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!release) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Release not found',
    });
  }

  // Only allow editing if in DRAFT or REJECTED status
  if (!['DRAFT', 'REJECTED'].includes(release.status)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Cannot edit release in current status',
    });
  }

  const {
    title, version, releaseType, genre, subgenre, language,
    releaseDate, originalReleaseDate, upc, catalogNumber,
    cLineYear, cLineText, pLineYear, pLineText,
    isExplicit, selectedStores, territories, coverArtKey,
    tracks, status,
  } = req.body;

  const updatedRelease = await prisma.release.update({
    where: { id: req.params.id },
    data: {
      ...(title && { title }),
      ...(version !== undefined && { version }),
      ...(releaseType && { releaseType }),
      ...(genre && { genre }),
      ...(subgenre !== undefined && { subgenre }),
      ...(language && { language }),
      ...(releaseDate && { releaseDate: new Date(releaseDate) }),
      ...(originalReleaseDate !== undefined && { originalReleaseDate: originalReleaseDate ? new Date(originalReleaseDate) : null }),
      ...(upc !== undefined && { upc }),
      ...(catalogNumber !== undefined && { catalogNumber }),
      ...(cLineYear !== undefined && { cLineYear }),
      ...(cLineText !== undefined && { cLineText }),
      ...(pLineYear !== undefined && { pLineYear }),
      ...(pLineText !== undefined && { pLineText }),
      ...(isExplicit !== undefined && { isExplicit }),
      ...(selectedStores && { selectedStores }),
      ...(territories && { territories }),
      ...(coverArtKey !== undefined && { coverArtKey }),
      ...(status && { status }),
    },
    include: { tracks: true },
  });

  res.json({
    success: true,
    message: 'Release updated successfully',
    release: updatedRelease,
  });
}));

// Submit release for review
router.post('/releases/:id/submit', validate(submitReleaseSchema), asyncHandler(async (req, res) => {
  const release = await prisma.release.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    include: { tracks: true },
  });

  if (!release) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Release not found',
    });
  }

  if (release.status !== 'DRAFT') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Release has already been submitted',
    });
  }

  // Validate release has required data
  if (release.tracks.length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Release must have at least one track',
    });
  }

  if (!release.coverArtUrl && !release.coverArtKey) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Release must have cover artwork',
    });
  }

  // Submit for review
  const updatedRelease = await prisma.release.update({
    where: { id: req.params.id },
    data: {
      status: 'PENDING',
      submittedAt: new Date(),
    },
    include: { tracks: true },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'RELEASE_SUBMITTED',
      entityType: 'Release',
      entityId: release.id,
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    message: 'Release submitted for review',
    release: updatedRelease,
  });
}));

// Delete release (only drafts)
router.delete('/releases/:id', asyncHandler(async (req, res) => {
  const release = await prisma.release.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!release) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Release not found',
    });
  }

  if (release.status !== 'DRAFT') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Only draft releases can be deleted',
    });
  }

  await prisma.release.delete({
    where: { id: req.params.id },
  });

  res.json({
    success: true,
    message: 'Release deleted successfully',
  });
}));

// ===========================================
// ARTIST PROFILES
// ===========================================
router.get('/profiles', asyncHandler(async (req, res) => {
  const profiles = await prisma.artistProfile.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ profiles });
}));

router.post('/profiles', asyncHandler(async (req, res) => {
  const { name, bio, socialLinks } = req.body;

  // Check subscription limit
  const subscription = await prisma.subscription.findUnique({
    where: { userId: req.user.id },
  });

  const profileCount = await prisma.artistProfile.count({
    where: { userId: req.user.id },
  });

  if (profileCount >= (subscription?.maxArtistProfiles || 1)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You have reached the maximum number of artist profiles for your plan',
    });
  }

  const profile = await prisma.artistProfile.create({
    data: {
      userId: req.user.id,
      name,
      bio,
      socialLinks: socialLinks || {},
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Artist profile created',
    profile,
  });
}));

// ===========================================
// ANALYTICS
// ===========================================
router.get('/analytics/overview', asyncHandler(async (req, res) => {
  const { period = '28d' } = req.query;

  // Calculate date range
  const endDate = new Date();
  let startDate = new Date();

  switch (period) {
    case '24h':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '28d':
      startDate.setDate(startDate.getDate() - 28);
      break;
    case 'ytd':
      startDate = new Date(endDate.getFullYear(), 0, 1);
      break;
    case 'all':
      startDate = new Date(2020, 0, 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 28);
  }

  // Get streaming stats
  const stats = await prisma.streamingStat.groupBy({
    by: ['date'],
    where: {
      track: { release: { userId: req.user.id } },
      date: { gte: startDate, lte: endDate },
    },
    _sum: {
      streams: true,
      saves: true,
      playlistAdds: true,
      revenueNet: true,
    },
    orderBy: { date: 'asc' },
  });

  // Get top tracks
  const topTracks = await prisma.streamingStat.groupBy({
    by: ['trackId'],
    where: {
      track: { release: { userId: req.user.id } },
      date: { gte: startDate },
    },
    _sum: { streams: true, revenueNet: true },
    orderBy: { _sum: { streams: 'desc' } },
    take: 10,
  });

  // Get track details
  const trackIds = topTracks.map(t => t.trackId);
  const tracks = await prisma.track.findMany({
    where: { id: { in: trackIds } },
    include: { release: { select: { title: true, coverArtUrl: true } } },
  });

  const topTracksWithDetails = topTracks.map(t => {
    const track = tracks.find(tr => tr.id === t.trackId);
    return {
      ...t,
      track,
    };
  });

  res.json({
    period,
    dailyStats: stats,
    topTracks: topTracksWithDetails,
    totals: {
      streams: stats.reduce((sum, s) => sum + Number(s._sum.streams || 0), 0),
      revenue: stats.reduce((sum, s) => sum + Number(s._sum.revenueNet || 0), 0),
      saves: stats.reduce((sum, s) => sum + Number(s._sum.saves || 0), 0),
      playlistAdds: stats.reduce((sum, s) => sum + Number(s._sum.playlistAdds || 0), 0),
    },
  });
}));

// ===========================================
// WALLET
// ===========================================
router.get('/wallet', asyncHandler(async (req, res) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId: req.user.id },
  });

  const recentPayouts = await prisma.payout.findMany({
    where: { userId: req.user.id },
    orderBy: { requestedAt: 'desc' },
    take: 10,
  });

  const pendingRoyalties = await prisma.royalty.aggregate({
    where: {
      userId: req.user.id,
      status: 'pending',
    },
    _sum: { netRevenue: true },
  });

  res.json({
    wallet,
    recentPayouts,
    pendingRoyalties: pendingRoyalties._sum.netRevenue || 0,
  });
}));

router.post('/wallet/request-payout', asyncHandler(async (req, res) => {
  const { amount, method, methodDetails } = req.body;

  const wallet = await prisma.wallet.findUnique({
    where: { userId: req.user.id },
  });

  if (!wallet) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Wallet not found',
    });
  }

  if (amount > Number(wallet.availableBalance)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Insufficient balance',
    });
  }

  if (amount < Number(wallet.minPayoutThreshold)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: `Minimum payout amount is $${wallet.minPayoutThreshold}`,
    });
  }

  // Create payout request
  const payout = await prisma.$transaction(async (tx) => {
    // Deduct from available balance
    await tx.wallet.update({
      where: { userId: req.user.id },
      data: {
        availableBalance: { decrement: amount },
      },
    });

    // Create payout record
    return tx.payout.create({
      data: {
        userId: req.user.id,
        walletId: wallet.id,
        amount,
        method,
        methodDetails,
        status: 'PENDING',
      },
    });
  });

  res.status(201).json({
    success: true,
    message: 'Payout request submitted',
    payout,
  });
}));

router.get('/wallet/transactions', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  // Get royalties as incoming transactions
  const royalties = await prisma.royalty.findMany({
    where: { userId: req.user.id, status: 'cleared' },
    include: {
      dsp: { select: { name: true } },
      release: { select: { title: true } },
    },
    orderBy: { processedAt: 'desc' },
    take: parseInt(limit),
  });

  // Get payouts as outgoing transactions
  const payouts = await prisma.payout.findMany({
    where: { userId: req.user.id },
    orderBy: { requestedAt: 'desc' },
    take: parseInt(limit),
  });

  // Combine and sort
  const transactions = [
    ...royalties.map(r => ({
      id: r.id,
      type: 'royalty',
      description: `Royalty - ${r.release?.title || 'Unknown'}`,
      source: r.dsp?.name || 'Platform',
      amount: Number(r.netRevenue),
      date: r.processedAt || r.createdAt,
      status: 'cleared',
    })),
    ...payouts.map(p => ({
      id: p.id,
      type: 'payout',
      description: 'Payout',
      method: p.method,
      amount: -Number(p.amount),
      date: p.requestedAt,
      status: p.status.toLowerCase(),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ transactions });
}));

// ===========================================
// SUPPORT
// ===========================================
router.get('/tickets', asyncHandler(async (req, res) => {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: req.user.id },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({ tickets });
}));

router.post('/tickets', asyncHandler(async (req, res) => {
  const { subject, category, message } = req.body;

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: req.user.id,
      subject,
      category,
      messages: {
        create: {
          userId: req.user.id,
          message,
        },
      },
    },
    include: { messages: true },
  });

  res.status(201).json({
    success: true,
    message: 'Support ticket created',
    ticket,
  });
}));

router.post('/tickets/:id/reply', asyncHandler(async (req, res) => {
  const { message } = req.body;

  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!ticket) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Ticket not found',
    });
  }

  const newMessage = await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      userId: req.user.id,
      message,
    },
  });

  // Update ticket status if closed
  if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: 'OPEN' },
    });
  }

  res.status(201).json({
    success: true,
    message: newMessage,
  });
}));

router.patch('/profile', asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { name },
  });
  res.json({ success: true, user: updatedUser });
}));

export default router;
