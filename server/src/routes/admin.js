import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { adminReviewSchema } from '../validators/release.js';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// ===========================================
// DASHBOARD STATS
// ===========================================
router.get('/stats', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeReleases,
    pendingApprovals,
    totalRevenue,
    newUsersToday,
    pendingPayouts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { in: ['ARTIST', 'LABEL'] } } }),
    prisma.release.count({ where: { status: 'LIVE' } }),
    prisma.release.count({ where: { status: 'PENDING' } }),
    prisma.royalty.aggregate({ _sum: { grossRevenue: true } }),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        role: { in: ['ARTIST', 'LABEL'] },
      },
    }),
    prisma.payout.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true },
    }),
  ]);

  res.json({
    totalUsers,
    activeReleases,
    pendingApprovals,
    totalRevenue: totalRevenue._sum.grossRevenue || 0,
    newUsersToday,
    pendingPayouts: pendingPayouts._sum.amount || 0,
  });
}));

// ===========================================
// USERS MANAGEMENT
// ===========================================
router.get('/users', asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;

  const where = {
    ...(role && { role }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        lastLoginAt: true,
        subscription: {
          select: { plan: true, isActive: true },
        },
        _count: {
          select: { releases: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      avatarUrl: true,
      phone: true,
      countryCode: true,
      createdAt: true,
      lastLoginAt: true,
      subscription: true,
      wallet: true,
      artistProfiles: true,
      releases: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: { releases: true, payouts: true },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'User not found',
    });
  }

  res.json({ user });
}));

router.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid status',
    });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { status },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'USER_STATUS_CHANGED',
      entityType: 'User',
      entityId: user.id,
      newValues: { status },
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    message: `User ${status === 'SUSPENDED' ? 'suspended' : 'activated'} successfully`,
    user,
  });
}));

router.patch('/users/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['ARTIST', 'LABEL', 'ADMIN'].includes(role)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid role',
    });
  }

  // Only super admin can create admins
  if (role === 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only super admins can assign admin role',
    });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'USER_ROLE_CHANGED',
      entityType: 'User',
      entityId: user.id,
      newValues: { role },
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    message: 'User role updated successfully',
    user,
  });
}));

// ===========================================
// RELEASES MANAGEMENT
// ===========================================
router.get('/releases', asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { artistProfile: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [releases, total] = await Promise.all([
    prisma.release.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        artistProfile: {
          select: { id: true, name: true, avatarUrl: true },
        },
        tracks: {
          select: { id: true, title: true, status: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
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

router.get('/releases/pending', asyncHandler(async (req, res) => {
  const releases = await prisma.release.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      artistProfile: {
        select: { id: true, name: true, avatarUrl: true },
      },
      tracks: {
        include: { contributors: true },
      },
    },
    orderBy: { submittedAt: 'asc' },
  });

  res.json({ releases });
}));

router.get('/releases/:id', asyncHandler(async (req, res) => {
  const release = await prisma.release.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      artistProfile: true,
      label: true,
      tracks: {
        include: { contributors: true },
        orderBy: { trackNumber: 'asc' },
      },
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

router.post('/releases/:id/review', validate(adminReviewSchema), asyncHandler(async (req, res) => {
  const { action, reason } = req.body;

  const release = await prisma.release.findUnique({
    where: { id: req.params.id },
  });

  if (!release) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Release not found',
    });
  }

  if (release.status !== 'PENDING') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Release is not pending review',
    });
  }

  const newStatus = action === 'APPROVE' ? 'LIVE' : 'REJECTED';

  const updatedRelease = await prisma.release.update({
    where: { id: req.params.id },
    data: {
      status: newStatus,
      ...(action === 'APPROVE' && { approvedAt: new Date() }),
      ...(action === 'REJECT' && { rejectionReason: reason }),
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: action === 'APPROVE' ? 'RELEASE_APPROVED' : 'RELEASE_REJECTED',
      entityType: 'Release',
      entityId: release.id,
      newValues: { status: newStatus, reason },
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    message: `Release ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
    release: updatedRelease,
  });
}));

// ===========================================
// TAKEDOWNS
// ===========================================
router.get('/takedowns', asyncHandler(async (req, res) => {
  const takedowns = await prisma.takedownRequest.findMany({
    include: {
      release: {
        include: {
          artistProfile: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ takedowns });
}));

router.post('/takedowns/:id/resolve', asyncHandler(async (req, res) => {
  const { action, resolution } = req.body;

  const takedown = await prisma.takedownRequest.findUnique({
    where: { id: req.params.id },
  });

  if (!takedown) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Takedown request not found',
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.takedownRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'resolved',
        resolution,
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
      },
    });

    if (action === 'TAKEDOWN') {
      await tx.release.update({
        where: { id: takedown.releaseId },
        data: { status: 'TAKEDOWN' },
      });
    }
  });

  res.json({
    success: true,
    message: 'Takedown request resolved',
  });
}));

// ===========================================
// PAYOUTS
// ===========================================
router.get('/payouts', asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const where = status ? { status } : {};

  const [payouts, total] = await Promise.all([
    prisma.payout.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { requestedAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.payout.count({ where }),
  ]);

  res.json({
    payouts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

router.post('/payouts/:id/process', asyncHandler(async (req, res) => {
  const { action, transactionId, failureReason } = req.body;

  const payout = await prisma.payout.findUnique({
    where: { id: req.params.id },
  });

  if (!payout) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Payout not found',
    });
  }

  if (payout.status !== 'PENDING') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Payout is not pending',
    });
  }

  if (action === 'COMPLETE') {
    await prisma.payout.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        transactionId,
      },
    });
  } else if (action === 'FAIL') {
    await prisma.$transaction(async (tx) => {
      await tx.payout.update({
        where: { id: req.params.id },
        data: {
          status: 'FAILED',
          processedAt: new Date(),
          failureReason,
        },
      });

      // Refund to wallet
      await tx.wallet.update({
        where: { id: payout.walletId },
        data: {
          availableBalance: { increment: payout.amount },
        },
      });
    });
  }

  res.json({
    success: true,
    message: `Payout ${action === 'COMPLETE' ? 'completed' : 'failed'}`,
  });
}));

// ===========================================
// ANNOUNCEMENTS
// ===========================================
router.get('/announcements', asyncHandler(async (req, res) => {
  const announcements = await prisma.announcement.findMany({
    include: {
      author: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ announcements });
}));

router.post('/announcements', asyncHandler(async (req, res) => {
  const { title, content, type, targetAudience, startsAt, expiresAt } = req.body;

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      type: type || 'info',
      targetAudience: targetAudience || 'all',
      startsAt: startsAt ? new Date(startsAt) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user.id,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Announcement created',
    announcement,
  });
}));

router.patch('/announcements/:id', asyncHandler(async (req, res) => {
  const { title, content, type, targetAudience, isActive, startsAt, expiresAt } = req.body;

  const announcement = await prisma.announcement.update({
    where: { id: req.params.id },
    data: {
      ...(title && { title }),
      ...(content && { content }),
      ...(type && { type }),
      ...(targetAudience && { targetAudience }),
      ...(isActive !== undefined && { isActive }),
      ...(startsAt && { startsAt: new Date(startsAt) }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
    },
  });

  res.json({
    success: true,
    message: 'Announcement updated',
    announcement,
  });
}));

router.delete('/announcements/:id', asyncHandler(async (req, res) => {
  await prisma.announcement.delete({
    where: { id: req.params.id },
  });

  res.json({
    success: true,
    message: 'Announcement deleted',
  });
}));

// ===========================================
// SUPPORT TICKETS
// ===========================================
router.get('/tickets', asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const where = status ? { status } : {};

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        assignee: {
          select: { id: true, name: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.supportTicket.count({ where }),
  ]);

  res.json({
    tickets,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

router.get('/tickets/:id', asyncHandler(async (req, res) => {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      assignee: {
        select: { id: true, name: true },
      },
      messages: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true, role: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Ticket not found',
    });
  }

  res.json({ ticket });
}));

router.post('/tickets/:id/reply', asyncHandler(async (req, res) => {
  const { message, isInternal } = req.body;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: req.params.id },
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
      isInternal: isInternal || false,
    },
  });

  // Update ticket status if needed
  if (ticket.status === 'OPEN') {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: 'IN_PROGRESS', assignedTo: req.user.id },
    });
  }

  res.status(201).json({
    success: true,
    message: newMessage,
  });
}));

router.patch('/tickets/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid status',
    });
  }

  const ticket = await prisma.supportTicket.update({
    where: { id: req.params.id },
    data: {
      status,
      ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
    },
  });

  res.json({
    success: true,
    message: 'Ticket status updated',
    ticket,
  });
}));

// ===========================================
// PLATFORM SETTINGS
// ===========================================
router.get('/settings', asyncHandler(async (req, res) => {
  const settings = await prisma.platformSetting.findMany();

  const settingsMap = {};
  for (const setting of settings) {
    settingsMap[setting.key] = setting.value;
  }

  res.json({ settings: settingsMap });
}));

router.post('/settings/:key', asyncHandler(async (req, res) => {
  const { value } = req.body;

  const setting = await prisma.platformSetting.upsert({
    where: { key: req.params.key },
    update: { value },
    create: { key: req.params.key, value },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'SETTING_CHANGED',
      entityType: 'PlatformSetting',
      entityId: setting.key,
      newValues: value,
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    message: 'Setting updated',
    setting,
  });
}));

// ===========================================
// AUDIT LOGS
// ===========================================
router.get('/audit-logs', asyncHandler(async (req, res) => {
  const { userId, action, page = 1, limit = 50 } = req.query;

  const where = {
    ...(userId && { userId }),
    ...(action && { action }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

export default router;
